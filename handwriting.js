(function () {
    "use strict";

    const TESSERACT_URL = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
    let workerPromise = null;
    let scriptPromise = null;

    const session = {
        root: null,
        words: [],
        index: 0,
        questionCount: 0,
        correct: 0,
        score: 0,
        combo: 0,
        timeLeft: 90,
        timerId: null,
        advanceTimerId: null,
        questionStartTime: 0,
        wrongWords: [],
        ended: false,
        strokes: [],
        activeStroke: null,
        graded: false,
        onExit: null,
        canvas: null,
        context: null,
        runId: 0
    };

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function shuffle(values) {
        const copy = [...values];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    function normalize(value) {
        return String(value).toLowerCase().replace(/[^a-z0-9']/g, "");
    }

    function editDistance(left, right) {
        const rows = left.length + 1;
        const columns = right.length + 1;
        const matrix = Array.from({ length: rows }, () => Array(columns).fill(0));

        for (let row = 0; row < rows; row++) matrix[row][0] = row;
        for (let column = 0; column < columns; column++) matrix[0][column] = column;

        for (let row = 1; row < rows; row++) {
            for (let column = 1; column < columns; column++) {
                const substitutionCost = left[row - 1] === right[column - 1] ? 0 : 1;
                matrix[row][column] = Math.min(
                    matrix[row - 1][column] + 1,
                    matrix[row][column - 1] + 1,
                    matrix[row - 1][column - 1] + substitutionCost
                );

                if (
                    row > 1 &&
                    column > 1 &&
                    left[row - 1] === right[column - 2] &&
                    left[row - 2] === right[column - 1]
                ) {
                    matrix[row][column] = Math.min(
                        matrix[row][column],
                        matrix[row - 2][column - 2] + 1
                    );
                }
            }
        }

        return matrix[left.length][right.length];
    }

    function isAcceptedAnswer(answer, expected) {
        const normalizedAnswer = normalize(answer);
        const normalizedExpected = normalize(expected);
        if (normalizedAnswer === normalizedExpected) return true;

        const wordLength = normalizedExpected.length;
        if (wordLength <= 3) return false;

        const allowedErrors = Math.max(1, Math.floor(wordLength * 0.25));
        return editDistance(normalizedAnswer, normalizedExpected) <= allowedErrors;
    }

    function comboMultiplier(combo) {
        if (combo >= 10) return 1.3;
        if (combo >= 7) return 1.2;
        if (combo >= 4) return 1.1;
        return 1.0;
    }

    function calculatePoints(elapsedSeconds, combo) {
        let basePoints = 100;
        if (elapsedSeconds > 1) {
            basePoints -= Math.floor((elapsedSeconds - 1) / 0.5) * 4;
        }
        return Math.floor(Math.max(0, basePoints) * comboMultiplier(combo));
    }

    function loadTesseract() {
        if (window.Tesseract) return Promise.resolve();
        if (scriptPromise) return scriptPromise;

        scriptPromise = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = TESSERACT_URL;
            script.crossOrigin = "anonymous";
            script.onload = resolve;
            script.onerror = () => reject(new Error("OCRライブラリを読み込めませんでした"));
            document.head.appendChild(script);
        });
        return scriptPromise;
    }

    async function getWorker() {
        if (!workerPromise) {
            workerPromise = (async () => {
                await loadTesseract();
                const worker = await window.Tesseract.createWorker("eng", 1);
                await worker.setParameters({
                    tessedit_char_whitelist: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'",
                    tessedit_pageseg_mode: "7",
                    preserve_interword_spaces: "0"
                });
                return worker;
            })().catch(error => {
                workerPromise = null;
                throw error;
            });
        }
        return workerPromise;
    }

    function currentWord() {
        return session.words[session.index];
    }

    function renderQuestion() {
        const word = currentWord();
        if (!word) return;

        session.strokes = [];
        session.activeStroke = null;
        session.graded = false;
        session.questionStartTime = Date.now();
        session.root.innerHTML = `
            <div class="handwriting-screen">
                <div class="handwriting-header">
                    <button type="button" class="secondary handwriting-exit">中断する</button>
                    <div class="handwriting-score">Score: ${session.score} | Combo: ${session.combo} (x${comboMultiplier(session.combo).toFixed(1)})</div>
                    <div class="handwriting-timer ${session.timeLeft <= 10 ? "low" : ""}">${session.timeLeft}</div>
                </div>
                <div class="question-card handwriting-question">
                    <div class="question-jp">${escapeHtml(word.jp)}</div>
                    <div class="question-hint">英単語（${word.en.length}文字）を1行で書いてください</div>
                </div>
                <div class="handwriting-paper" aria-label="英単語の手書き入力欄">
                    <div class="handwriting-guide top"></div>
                    <div class="handwriting-guide middle"></div>
                    <div class="handwriting-guide baseline"></div>
                    <div class="handwriting-guide bottom"></div>
                    <canvas class="handwriting-canvas"></canvas>
                </div>
                <div class="handwriting-actions">
                    <button type="button" class="secondary handwriting-undo">↶ 1画戻す</button>
                    <button type="button" class="secondary handwriting-clear">全部消す</button>
                </div>
                <div class="handwriting-status" aria-live="polite">書き終わったら「答え合わせ」を押してください</div>
                <div class="handwriting-submit-actions">
                    <button type="button" class="handwriting-check">答え合わせ</button>
                    <button type="button" class="secondary handwriting-skip">スキップ</button>
                </div>
            </div>
        `;

        setupCanvas();
        session.root.querySelector(".handwriting-exit").onclick = exit;
        session.root.querySelector(".handwriting-undo").onclick = undo;
        session.root.querySelector(".handwriting-clear").onclick = clear;
        session.root.querySelector(".handwriting-check").onclick = checkAnswer;
        session.root.querySelector(".handwriting-skip").onclick = skip;
    }

    function setupCanvas() {
        session.canvas = session.root.querySelector(".handwriting-canvas");
        session.context = session.canvas.getContext("2d");
        resizeCanvas();

        session.canvas.addEventListener("pointerdown", beginStroke);
        session.canvas.addEventListener("pointermove", continueStroke);
        session.canvas.addEventListener("pointerup", endStroke);
        session.canvas.addEventListener("pointercancel", endStroke);
        window.addEventListener("resize", resizeCanvas, { once: true });
    }

    function resizeCanvas() {
        if (!session.canvas || !session.canvas.isConnected) return;
        const rect = session.canvas.getBoundingClientRect();
        const ratio = Math.max(1, window.devicePixelRatio || 1);
        session.canvas.width = Math.round(rect.width * ratio);
        session.canvas.height = Math.round(rect.height * ratio);
        session.context.setTransform(ratio, 0, 0, ratio, 0, 0);
        session.context.lineCap = "round";
        session.context.lineJoin = "round";
        session.context.strokeStyle = "#111827";
        session.context.lineWidth = 5;
        redraw();
    }

    function pointFromEvent(event) {
        const rect = session.canvas.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    function beginStroke(event) {
        if (session.graded) return;
        event.preventDefault();
        session.canvas.setPointerCapture(event.pointerId);
        session.activeStroke = [pointFromEvent(event)];
        session.strokes.push(session.activeStroke);
        redraw();
    }

    function continueStroke(event) {
        if (!session.activeStroke) return;
        event.preventDefault();
        session.activeStroke.push(pointFromEvent(event));
        redraw();
    }

    function endStroke(event) {
        if (!session.activeStroke) return;
        event.preventDefault();
        session.activeStroke.push(pointFromEvent(event));
        session.activeStroke = null;
        redraw();
    }

    function drawStrokes(context, strokes, scaleX, scaleY, offsetX, offsetY, lineWidth) {
        context.save();
        context.lineCap = "round";
        context.lineJoin = "round";
        context.strokeStyle = "#111827";
        context.lineWidth = lineWidth;
        strokes.forEach(stroke => {
            if (stroke.length === 0) return;
            context.beginPath();
            context.moveTo(stroke[0].x * scaleX + offsetX, stroke[0].y * scaleY + offsetY);
            if (stroke.length === 1) {
                context.lineTo(stroke[0].x * scaleX + offsetX + 0.1, stroke[0].y * scaleY + offsetY + 0.1);
            } else {
                stroke.slice(1).forEach(point => {
                    context.lineTo(point.x * scaleX + offsetX, point.y * scaleY + offsetY);
                });
            }
            context.stroke();
        });
        context.restore();
    }

    function redraw() {
        if (!session.canvas) return;
        const rect = session.canvas.getBoundingClientRect();
        session.context.clearRect(0, 0, rect.width, rect.height);
        drawStrokes(session.context, session.strokes, 1, 1, 0, 0, 5);
    }

    function undo() {
        if (session.graded || session.strokes.length === 0) return;
        session.strokes.pop();
        session.activeStroke = null;
        redraw();
    }

    function clear() {
        if (session.graded) return;
        session.strokes = [];
        session.activeStroke = null;
        setStatus("書き終わったら「答え合わせ」を押してください");
        redraw();
    }

    function createRecognitionCanvas() {
        const points = session.strokes.flat();
        const minX = Math.min(...points.map(point => point.x));
        const maxX = Math.max(...points.map(point => point.x));
        const minY = Math.min(...points.map(point => point.y));
        const maxY = Math.max(...points.map(point => point.y));
        const padding = 36;
        const sourceWidth = Math.max(1, maxX - minX);
        const sourceHeight = Math.max(1, maxY - minY);
        const scale = Math.min(3, 900 / sourceWidth, 260 / sourceHeight);
        const output = document.createElement("canvas");
        output.width = Math.ceil(sourceWidth * scale + padding * 2);
        output.height = Math.ceil(sourceHeight * scale + padding * 2);
        const context = output.getContext("2d");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, output.width, output.height);
        drawStrokes(context, session.strokes, scale, scale, padding - minX * scale, padding - minY * scale, Math.max(8, 5 * scale));
        return output;
    }

    async function checkAnswer() {
        if (session.graded || session.ended) return;
        if (session.strokes.length === 0) {
            setStatus("先に英単語を書いてください", "wrong");
            return;
        }

        const root = session.root;
        const runId = session.runId;
        const answerElapsedSeconds = (Date.now() - session.questionStartTime) / 1000;
        const button = root.querySelector(".handwriting-check");
        button.disabled = true;
        button.textContent = "認識中…";
        setStatus("文字認識を準備しています… 初回は少し時間がかかります");
        try {
            const worker = await getWorker();
            if (session.root !== root || session.runId !== runId) return;
            setStatus("文字を認識しています…");
            const result = await worker.recognize(createRecognitionCanvas());
            if (session.root !== root || session.runId !== runId) return;
            const recognized = result.data.text.replace(/[^A-Za-z']/g, "").toLowerCase();
            if (!recognized) {
                setStatus("認識できませんでした。書き直してください", "wrong");
                return;
            }
            grade(recognized, answerElapsedSeconds);
        } catch (error) {
            console.error("Handwriting OCR failed", error);
            if (session.root === root && session.runId === runId) {
                setStatus("文字認識を利用できません。もう一度試してください", "wrong");
            }
        } finally {
            if (button.isConnected) {
                button.disabled = session.graded;
                button.textContent = "答え合わせ";
            }
        }
    }

    function grade(answer, elapsedSeconds) {
        if (session.graded || session.ended) return;

        session.graded = true;
        const word = currentWord();
        const correct = isAcceptedAnswer(answer, word.en);
        if (typeof window.speakWord === "function") window.speakWord(word.en);
        if (correct) {
            session.combo++;
            const points = calculatePoints(elapsedSeconds, session.combo);
            session.score += points;
            session.correct++;
            setStatus(`あなたの解答: ${answer}　正解！ +${points}点`, "correct");
        } else {
            session.combo = 0;
            session.wrongWords.push({ jp: word.jp, en: word.en, userAnswer: answer });
            setStatus(`あなたの解答: ${answer}　不正解（正解: ${word.en}）`, "wrong");
        }
        if (typeof window.triggerFeedback === "function") window.triggerFeedback(correct);
        session.root.querySelector(".handwriting-check").disabled = true;
        session.root.querySelector(".handwriting-skip").disabled = true;
        updateScoreDisplay();
        clearTimeout(session.advanceTimerId);
        const runId = session.runId;
        session.advanceTimerId = setTimeout(() => {
            if (session.ended || session.runId !== runId) return;
            moveToNextQuestion();
        }, 1500);
    }

    function skip() {
        if (session.graded || session.ended) return;
        const word = currentWord();
        session.combo = 0;
        session.wrongWords.push({ jp: word.jp, en: word.en, userAnswer: "スキップ" });
        if (typeof window.triggerFeedback === "function") window.triggerFeedback(false);
        moveToNextQuestion();
    }

    function moveToNextQuestion() {
        session.questionCount++;
        session.index++;
        if (session.index >= session.words.length) {
            session.words = shuffle(session.words);
            session.index = 0;
        }
        renderQuestion();
    }

    function updateScoreDisplay() {
        const display = session.root?.querySelector(".handwriting-score");
        if (display) {
            display.textContent = `Score: ${session.score} | Combo: ${session.combo} (x${comboMultiplier(session.combo).toFixed(1)})`;
        }
    }

    function startTimer() {
        clearInterval(session.timerId);
        session.timerId = setInterval(() => {
            if (session.ended) return;
            session.timeLeft--;
            const timer = session.root?.querySelector(".handwriting-timer");
            if (timer) {
                timer.textContent = session.timeLeft;
                timer.classList.toggle("low", session.timeLeft <= 10);
            }
            if (session.timeLeft <= 0) endSession();
        }, 1000);
    }

    function endSession() {
        if (session.ended) return;
        session.ended = true;
        session.timeLeft = 0;
        session.runId++;
        clearInterval(session.timerId);
        session.timerId = null;
        clearTimeout(session.advanceTimerId);
        session.advanceTimerId = null;
        renderResult();
    }

    function setStatus(message, className) {
        const status = session.root.querySelector(".handwriting-status");
        if (!status) return;
        status.textContent = message;
        status.className = `handwriting-status${className ? ` ${className}` : ""}`;
    }

    function renderResult() {
        session.root.innerHTML = `
            <div class="handwriting-complete">
                <h1>手書きモード結果</h1>
                <div class="question-card handwriting-result-card">
                    <div class="question-hint">Total Score</div>
                    <div class="handwriting-total-score">${session.score}</div>
                    <div class="handwriting-correct-count">正解数: ${session.correct} 問</div>
                </div>
                <p class="select-label">間違えた単語 (${session.wrongWords.length})</p>
                <div class="result-list handwriting-wrong-list">
                    ${session.wrongWords.length > 0 ? session.wrongWords.map(word => `
                        <div class="result-item">
                            <div class="handwriting-wrong-jp">${escapeHtml(word.jp)}</div>
                            <div class="handwriting-wrong-answer">
                                <div>${escapeHtml(word.en)}</div>
                                <small>入力: ${escapeHtml(word.userAnswer)}</small>
                            </div>
                        </div>
                    `).join("") : '<p class="handwriting-perfect">全問正解！素晴らしい！</p>'}
                </div>
                <button type="button" class="handwriting-retry">もう一度</button>
                <button type="button" class="secondary handwriting-exit">モード選択に戻る</button>
            </div>
        `;
        session.root.querySelector(".handwriting-retry").onclick = () => {
            session.words = shuffle(session.words);
            session.index = 0;
            session.questionCount = 0;
            session.correct = 0;
            session.score = 0;
            session.combo = 0;
            session.timeLeft = 90;
            session.wrongWords = [];
            session.ended = false;
            session.runId++;
            clearTimeout(session.advanceTimerId);
            session.advanceTimerId = null;
            renderQuestion();
            startTimer();
        };
        session.root.querySelector(".handwriting-exit").onclick = exit;
    }

    function exit() {
        const callback = session.onExit;
        session.runId++;
        session.ended = true;
        clearInterval(session.timerId);
        session.timerId = null;
        clearTimeout(session.advanceTimerId);
        session.advanceTimerId = null;
        session.root.innerHTML = "";
        session.root = null;
        session.canvas = null;
        session.context = null;
        if (callback) callback();
    }

    function mount(options) {
        if (!options || !options.root || !Array.isArray(options.words) || options.words.length === 0) {
            throw new Error("手書きモードに利用できる単語がありません");
        }
        session.root = options.root;
        session.runId++;
        session.words = shuffle(options.words);
        session.index = 0;
        session.questionCount = 0;
        session.correct = 0;
        session.score = 0;
        session.combo = 0;
        session.timeLeft = 90;
        session.wrongWords = [];
        session.ended = false;
        clearTimeout(session.advanceTimerId);
        session.advanceTimerId = null;
        session.onExit = options.onExit;
        renderQuestion();
        startTimer();
    }

    window.HandwritingMode = { mount };
})();
