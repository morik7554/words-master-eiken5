// Run: NODE_PATH=/tmp/eiken5-browser-test/node_modules node tests/browser.cjs
const {chromium}=require('playwright');
const fs=require('fs');const assert=require('assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-sandbox']});
 const results=[];
 for(const viewport of [{width:1280,height:900},{width:390,height:844}]){
 const context=await browser.newContext({viewport});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{if(!localStorage.getItem('nickname')){localStorage.setItem('nickname','ORIGINAL');localStorage.setItem('userStats','{"original":true}');localStorage.setItem('soundOn','false');}});
 await page.goto(process.env.BASE_URL || 'http://127.0.0.1:8765');
 await page.locator('#init-nick').fill('テスト');await page.locator('#btn-init-start').click();
 assert.equal(await page.title(),'英検5級 Words Master');
 await page.locator('#btn-start').click();assert.equal(await page.locator('[data-grade]').count(),3);
 await page.locator('[data-grade="grade3"]').click();await page.locator('[data-unit="熟語・会話表現"]').click();
 assert.equal(await page.locator('[id^="mode-"]').count(),4);
 // Cover every supplied item, every level and category, and card characters.
 const coverage=await page.evaluate(()=>{
  let count=0,phrases=0;const ids=new Set();const groups=[];
  for(const grade of ['grade1','grade2','grade3']){state.grade=grade;const words=getWordsByGrade();groups.push(words.length);
   for(const unit of getUnits()){state.unit=unit;const pool=words.filter(w=>w.unit===unit);if(!pool.length||getMatchWords().length!==pool.length)throw Error('category mismatch');
    for(const word of pool){ids.add(word.id);count++;if(word.en.includes(' '))phrases++;state.currentWord=word;state.screen='game';state.mode='typing';render();if(document.querySelector('.question-jp').textContent!==word.jp)throw Error('translation');state.mode='card';state.cardAnswer=[];state.currentChoices=word.en.split('').map((char,id)=>({char,id,used:false}));render();if(document.querySelectorAll('.choice-card').length!==word.en.length)throw Error('card');}
   }
  }
  state.grade='grade3';state.unit='熟語・会話表現';state.mode='typing';state.screen='modeSelect';state.soundOn=false;render();return{count,ids:ids.size,phrases,groups};
 });assert.deepEqual(coverage.groups,[300,300,100]);assert.equal(coverage.ids,700);
 const reviewChecks=await page.evaluate(()=>{
  const all=[...grade1Words,...grade2Words,...grade3Words];
  const word=en=>all.find(w=>w.en===en);
  if(new Set(['am','is','are'].map(en=>word(en).jp)).size!==3)throw Error('be verb hints');
  if(word('gift').jp!==word('present').jp||word('TV').jp!==word('television').jp)throw Error('synonym labels');
  if(!word('hour').jp.includes('60分')||!word('do my best')||word("do one's best"))throw Error('review corrections');
  let hints=0;
  for(const grade of ['grade1','grade2','grade3']){state.grade=grade;for(const unit of getUnits()){
   state.unit=unit;const original=getWordsByGrade().filter(w=>w.unit===unit);const prepared=getHandwritingWords();
   if(prepared.length!==original.length)throw Error('handwriting coverage');
   for(let i=0;i<original.length;i++){
    const peers=original.filter(w=>w.id!==original[i].id&&w.jp===original[i].jp);
    if(prepared[i].en!==original[i].en)throw Error('changed target');
    if(peers.length){hints++;const match=prepared[i].jp.match(/（([a-z0-9']+)…で始まる英語）$/);if(!match)throw Error('missing hint');
     if(peers.some(w=>w.en.toLowerCase().replace(/[^a-z0-9']/g,'').startsWith(match[1])))throw Error('ambiguous hint');
    }else if(prepared[i].jp!==original[i].jp)throw Error('unneeded hint');
   }
  }}
  state.grade='grade3';state.unit='熟語・会話表現';state.mode='typing';state.screen='modeSelect';render();return{hintedEntries:hints};
 });assert(reviewChecks.hintedEntries>0);

 await page.locator('#btn-go').click();await page.locator('.typing-input').waitFor();
 const en=await page.evaluate(()=>state.currentWord.en);await page.locator('.typing-input').fill(en);await page.locator('.typing-input').press('Enter');
 assert.equal(await page.evaluate(()=>state.correctCount),1);assert((await page.evaluate(()=>state.score))>0);
 await page.locator('#btn-skip').click();await page.evaluate(()=>endGame());assert((await page.locator('.result-list').innerText()).includes('スキップ'));
 await page.locator('#btn-retry').click();await page.locator('[data-unit="熟語・会話表現"]').click();await page.locator('#mode-card').click();await page.locator('#btn-go').click();await page.locator('.choice-card').first().waitFor();
 const chars=await page.evaluate(()=>state.currentWord.en.split(''));
 for(const char of chars){const id=await page.evaluate(c=>state.currentChoices.find(i=>!i.used&&i.char===c).id,char);await page.locator(`.choice-card[data-id="${id}"]`).click();}
 await page.waitForFunction(()=>state.correctCount===1);await page.evaluate(()=>endGame());
 await page.locator('#btn-retry').click();await page.locator('[data-unit="熟語・会話表現"]').click();await page.locator('#mode-match').click();await page.locator('#btn-go').click();await page.locator('[data-match-type="english"]').first().waitFor();
 const id=await page.locator('[data-match-type="english"]').first().getAttribute('data-card-id');await page.locator(`[data-match-type="english"][data-card-id="${id}"]`).click();await page.locator(`[data-match-type="japanese"][data-card-id="${id}"]`).click();assert.equal(await page.evaluate(()=>state.score),10);await page.evaluate(()=>endMatchMode());
 await page.locator('#btn-match-select').click();await page.locator('[data-unit="熟語・会話表現"]').click();await page.locator('#mode-handwriting').click();await page.locator('#btn-go').click();assert.equal(await page.locator('.handwriting-guide').count(),4);
 await page.locator('.handwriting-check').click();assert((await page.locator('.handwriting-status').innerText()).includes('先に'));
 const box=await page.locator('canvas.handwriting-canvas').boundingBox();await page.mouse.move(box.x+40,box.y+40);await page.mouse.down();await page.mouse.move(box.x+80,box.y+120,{steps:10});await page.mouse.up();await page.locator('.handwriting-undo').click();await page.locator('.handwriting-clear').click();await page.locator('.handwriting-skip').click();
 await page.screenshot({path:`verification/screen-${viewport.width}.png`});await page.locator('.handwriting-exit').click();
 // Persistence and isolation, including the app's own reset action.
 await page.reload();assert.equal(await page.locator('h1').innerText(),'英検5級 Words Master');
 assert(await page.evaluate(()=>JSON.parse(localStorage.getItem('words-master-eiken5:v1:userStats')).modeStats.typing.cumulativeTotal>0));
 await page.locator('#btn-ranking').click();await page.locator('[data-rank-grade="grade3"]').click();assert((await page.locator('h1').innerText()).includes('レベル3'));
 await page.evaluate(()=>{state.screen='settings';render()});await page.locator('#btn-reset-rank').click();await page.getByRole('button',{name:'削除する',exact:true}).click();
 const original=await page.evaluate(()=>[localStorage.getItem('nickname'),localStorage.getItem('soundOn'),localStorage.getItem('userStats')]);assert.deepEqual(original,['ORIGINAL','false','{"original":true}']);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
 results.push({viewport,coverage,reviewChecks,passed:['navigation','700 item display and card compatibility','typing correct/skip/score/results','card correct','match correct/score/results','handwriting four lines/drawing/undo/clear/skip/exit','score persistence/reload/ranking','reset storage isolation','no page errors','no horizontal page overflow']});await context.close();
 }
 fs.writeFileSync('verification/browser-results.json',JSON.stringify(results,null,2));await browser.close();console.log('PASS',JSON.stringify(results));
})().catch(e=>{console.error(e);process.exit(1)});
