const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
const html = fs.readFileSync(require('path').join(__dirname, '../index.html'), 'utf8');
const source = html.slice(html.indexOf('        function selectMatchCard('), html.indexOf('        function endMatchMode('));
function setup(words) {
    const pending = [];
    const cards = words.map((word, i) => ({id: i + 1, word}));
    const context = {
        state: {matchEnglishCards: [...cards], matchJapaneseCards: [...cards], matchSelectedEnglish: null,
            matchSelectedJapanese: null, matchLocked: false, timeLeft: 60, matchCombo: 0, matchMaxCombo: 0,
            score: 0, correctCount: 0, matchMistakes: 0, matchBonusToken: 0, screen: 'matchGame'},
        render() {}, triggerFeedback() {}, fillMatchRound() { context.refills++; }, refills: 0,
        setTimeout(fn, delay) { if (delay <= 350) pending.push(fn); }
    };
    vm.createContext(context); vm.runInContext(source, context);
    context.flush = () => { while (pending.length) pending.shift()(); };
    return context;
}
const words = [{en:'am', jp:'〜です'}, {en:'is', jp:'〜です'}, {en:'are', jp:'〜です'}];
// Every permutation must remain solvable, even when the selected IDs differ.
for (const order of [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]) {
    const c = setup(words);
    for (let i = 0; i < 3; i++) {
        c.selectMatchCard('english', i + 1);
        c.selectMatchCard('japanese', order[i]);
        assert.equal(c.state.correctCount, i + 1);
        c.flush();
        assert.equal(c.state.matchEnglishCards.filter(Boolean).length, 2 - i);
        assert.equal(c.state.matchJapaneseCards.filter(Boolean).length, 2 - i);
        assert.equal(c.state.matchLocked, false);
    }
    assert.equal(c.state.score, 35); // Existing third-combo bonus is retained.
    assert.equal(c.state.matchMistakes, 0);
    assert.equal(c.refills, 1);
}
const c = setup([{en:'cat', jp:'猫'}, {en:'dog', jp:'犬'}]);
c.selectMatchCard('japanese', 2); c.selectMatchCard('english', 1);
assert.equal(c.state.matchMistakes, 1); assert.equal(c.state.score, -3);
c.flush(); assert.equal(c.state.matchEnglishCards.filter(Boolean).length, 2);
assert.equal(c.state.matchJapaneseCards.filter(Boolean).length, 2);
c.selectMatchCard('japanese', 1); c.selectMatchCard('english', 1);
assert.equal(c.state.correctCount, 1); c.flush(); assert.equal(c.refills, 0);
console.log('PASS: all 6 am/is/are pairings, independently removed cards, round refill, reverse selection, wrong translations, original scoring');
