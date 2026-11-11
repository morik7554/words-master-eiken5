// Evaluate the original closure in memory; the shipped handwriting.js stays byte-identical.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const context={window:{}};vm.createContext(context);
let source=fs.readFileSync('handwriting.js','utf8');source=source.replace('    function comboMultiplier(combo) {','    window.recognitionTest = {isAcceptedAnswer, calculatePoints};\n    function comboMultiplier(combo) {');vm.runInContext(source,context);
for(let i=1;i<=3;i++)vm.runInContext(fs.readFileSync(`data/grade${i}.js`,'utf8'),context);
const api=context.window.recognitionTest;let total=0;
for(let i=1;i<=3;i++)for(const w of context.window[`grade${i}Words`]){assert(api.isAcceptedAnswer(w.en.replace(/[^A-Za-z']/g,'').toLowerCase(),w.en),w.en);total++}
assert(!api.isAcceptedAnswer('zz','be'));assert(!api.isAcceptedAnswer('xxxxxxxx','cat'));assert(api.isAcceptedAnswer('appl','apple'));assert.equal(api.calculatePoints(1,1),100);assert.equal(api.calculatePoints(1,10),130);assert.equal(api.calculatePoints(2,1),92);
fs.writeFileSync('verification/recognition-results.json',JSON.stringify({itemsAcceptedAfterExistingOCRNormalization:total,shortWordWrongAnswerRejected:true,wrongAnswerRejected:true,existingTolerancePreserved:true,scoreChecksPassed:true,shippedCodeModified:false},null,2));console.log('PASS: all 700 expected spellings compatible with unchanged OCR judgment; wrong answers, tolerance, scores verified');
