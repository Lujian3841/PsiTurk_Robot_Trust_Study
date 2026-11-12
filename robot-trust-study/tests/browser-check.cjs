// Run from robot-trust-study with Playwright installed. No study database is used.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({executablePath: process.env.STUDY_BROWSER || undefined, headless:true, args:['--no-sandbox','--disable-dev-shm-usage']});
  const errors = [], results = [];
  async function page(native = false) {
    const p = await browser.newPage({viewport:{width:1366,height:768}});
    p.on('pageerror', e => errors.push(e.message));
    await p.route('http://127.0.0.1:8000/**', async route => {
      const url = new URL(route.request().url());
      if (native && url.pathname === '/preview.html') {
        let html = fs.readFileSync('preview.html','utf8').replace('preview:true','preview:false');
        html = html.replace('<script src="static/js/content.js">', `<script>
          window.uniqueId='debug-worker:debug-assignment'; window.condition=1; window.counterbalance=1;
          window.mode='debug'; window.adServerLoc='';
          window.mock={trials:[],questions:{},fail:false,complete:false};
          window.PsiTurk=function(){this.recordTrialData=x=>mock.trials.push(x);this.recordUnstructuredData=(k,v)=>mock.questions[k]=v;this.finishInstructions=()=>{};this.completeHIT=()=>mock.complete=true;this.saveData=o=>setTimeout(()=>mock.fail?o.error():o.success(),5);};
          </script><script src="static/js/content.js">`);
        await route.fulfill({contentType:'text/html',body:html});
      } else await route.fulfill({path:path.resolve('.'+url.pathname)});
    });
    return p;
  }
  async function fit(p, name) {
    const size = await p.evaluate(()=>({w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight,vw:innerWidth,vh:innerHeight}));
    if (size.h > size.vh) await p.screenshot({path:'/tmp/robot-layout.png',fullPage:true});
    assert(size.w <= size.vw && size.h <= size.vh, `${name}: ${JSON.stringify(size)}`);
  }
  // Simulate real media state. An ended event alone must not unlock navigation.
  async function finishVideo(p) {
    await p.locator('video').evaluate(v=>{
      v.pause();
      Object.defineProperties(v,{duration:{configurable:true,value:1},currentTime:{configurable:true,value:1},ended:{configurable:true,value:true},seeking:{configurable:true,value:false}});
      v.dispatchEvent(new Event('timeupdate'));
      v.dispatchEvent(new Event('ended'));
    });
  }
  async function setup(p,c=0,b=0,layout=false) {
    await p.goto(`http://127.0.0.1:8000/preview.html?condition=${c}&counterbalance=${b}`);
    assert(!/risks|psiturk id/i.test(await p.locator('main').innerText()));
    assert((await p.locator('main').innerText()).includes('jjarceo@pnw.edu'));
    if(layout) await fit(p,'consent');
    assert(await p.locator('#consent').isDisabled());
    await p.locator('#agree').check(); await p.locator('#consent').click();
    await p.locator('#age').fill('17'); assert(await p.locator('#age-error').isVisible());
    assert(await p.locator('form button.primary').isDisabled());
    await p.locator('#age').fill('18'); assert(!(await p.locator('#age-error').isVisible()));
    for(const [k,v] of [['gender','Man'],['psiturk_before','No'],['robots_before','No'],['robot_familiarity','Slightly']]) await p.locator('#'+k).selectOption(v);
    if(layout) await fit(p,'demographics');
    await p.locator('form button.primary').click();
    await p.locator('#tones').selectOption('3'); await p.locator('#shape').selectOption('Circle');
    assert(await p.locator('form button.primary').isDisabled());
    await p.locator('video').evaluate(v=>v.dispatchEvent(new Event('ended')));
    assert(await p.locator('form button.primary').isDisabled());
    assert(await p.locator('video').evaluate(v=>v.autoplay));
    if(layout) await fit(p,'media');
    await finishVideo(p); await p.locator('form button.primary').click();
    if(layout) await fit(p,'explanation');
    await p.locator('#next-explanation').click();
    assert(await p.locator('.example-review').isVisible());
    if(layout) await fit(p,'instructions');
    await p.locator('#begin').click();
    await p.locator('#robots').selectOption('Both robots');
    await p.locator('#replies').selectOption('With recorded answers');
    await p.locator('#video').selectOption('Before the video finishes');
    await p.locator('form button.primary').click(); assert(await p.locator('#understanding-error').isVisible());
    await p.locator('#video').selectOption('After the whole video finishes');
    if(layout) await fit(p,'comprehension');
    await p.locator('form button.primary').click();
    await p.locator('#understanding_rescues').selectOption('One');
    await p.locator('#understanding_promise').selectOption('The person at Building A');
    if(layout) await fit(p,'scenario');
    await p.locator('form button.primary').click();
  }
  async function dialogue(p, layout=false, screenshot=false) {
    assert(await p.locator('#clock').isHidden());
    assert(await p.locator('#review').isDisabled());
    assert(await p.locator('[data-question]').first().isDisabled());
    await finishVideo(p);
    if(layout) await fit(p,'robot opening');
    if(screenshot) {
      await p.evaluate(()=>{document.getElementById('response-title').textContent='Example robot response';document.getElementById('response').textContent='The robot’s recorded reply and matching text appear here. Watch the whole video, then use the highlighted button to confirm you understood the response.';});
      await p.screenshot({path:'static/media/task-example.png'});
    }
    await p.locator('#review').click();
    for(const key of ['reason','left_behind','promise','suffering','change']) {
      await p.locator(`[data-question="${key}"]`).click();
      assert(await p.locator('#review').isDisabled());
      assert(await p.locator('#follow').isDisabled());
      assert(await p.locator('[data-question]').first().isDisabled());
      await finishVideo(p);
      if(layout) await fit(p,'reply '+key);
      if(key==='reason') { await p.locator('#follow').click(); assert(await p.locator('#review').isDisabled()); await finishVideo(p); }
      await p.locator('#review').click();
    }
  }
  async function ratings(p, layout=false) {
    assert(await p.locator('#clock').isHidden());
    assert.equal(await p.locator('input[name="trust_1"]').count(),0);
    for(const k of ['comfort_1','comfort_2','competence_1','competence_2','intelligence_1','intelligence_2']) await p.locator(`input[name="${k}"][value="5"]`).check();
    if(layout) await fit(p,'ratings');
    await p.locator('form button.primary').click();
  }
  async function mdmt(p, layout=false, missing=false) {
    for(let i=0;i<4;i++) {
      assert(await p.locator('#clock').isHidden());
      assert(await p.locator('form button.primary').isDisabled());
      const names = await p.locator('fieldset').evaluateAll(f=>f.map(x=>x.querySelector('input').name));
      for(const key of names) await p.locator(`input[name="${key}"][value="${missing ? (['truthful','genuine','sincere','frank'].includes(key) ? '0' : 'does_not_fit') : (key==='ethical'?'does_not_fit':'6')}"]`).check();
      if(layout) await fit(p,'MDMT '+i);
      await p.locator('form button.primary').click();
    }
  }
  async function authority(p,layout=false) {
    assert(await p.locator('#clock').isHidden());
    for(const k of ['business','family','government','rescue']) await p.locator(`input[name="authority_${k}"][value="Robot A"]`).check();
    if(layout) await fit(p,'authority');
    await p.locator('form button.primary').click();
  }
  for(const c of [0,1]) for(const b of [0,1]) {
    const p=await page(); const layout=c===0&&b===0;
    await setup(p,c,b,layout);
    await p.clock.install(); await p.clock.fastForward(1800000);
    assert.equal(await p.evaluate(()=>studyDemo.getState().step),'dialogue_0');
    await dialogue(p,layout,layout); await ratings(p,layout); await dialogue(p,layout); await ratings(p,layout);
    await p.clock.fastForward(1800000); assert.equal(await p.evaluate(()=>studyDemo.getState().step),'mdmt_0_0');
    await mdmt(p,layout,c===1&&b===1); await authority(p,layout);
    await p.locator('textarea').fill('The promise and number of people both mattered.');
    await p.locator('form button.primary').click();
    const state=await p.evaluate(()=>studyDemo.getState());
    assert(state.finished);
    assert.deepEqual(state.trials.filter(x=>x.event==='robot_start').map(x=>x.robot_style),c===0?['outcome','care']:['care','outcome']);
    for(const style of ['outcome','care']) {
      assert.equal(state.questions[`robot_${style}_mdmt_ethical_n`],c===1&&b===1?0:3);
      assert.equal(state.questions[`robot_${style}_mdmt_moral_trust_mean`],c===1&&b===1?null:6);
      if(c===1&&b===1) assert.equal(state.questions[`robot_${style}_mdmt_sincere_mean`],0);
      assert.equal(state.questions[`robot_${style}_comfort_1`],'5');
    }
    assert(state.trials.every(x=>x.participant_id===state.questions.participant_id));
    assert.equal(state.questions.authority_business_style,b===0?'outcome':'care');
    results.push(`PASS ${c}/${b}: video gates, untimed dialogue/questionnaires, MDMT scoring and IDs`);
    await p.close();
  }
  { const p=await page(true); await setup(p);
    await dialogue(p); await ratings(p); await dialogue(p); await ratings(p); await mdmt(p); await authority(p);
    await p.evaluate(()=>mock.fail=true); await p.locator('form button.primary').click();
    await p.locator('#retry').waitFor(); assert.equal(await p.evaluate(()=>mock.complete),false);
    await p.evaluate(()=>mock.fail=false); await p.locator('#retry').click(); await p.locator('#complete').click();
    const m=await p.evaluate(()=>mock); assert(m.complete); assert.equal(m.questions.condition,1);
    assert.equal(m.questions.robot_care_mdmt_moral_trust_mean,6);
    results.push('PASS native adapter mock: server assignment, final-save failure/retry, MDMT persistence'); await p.close(); }
  { const p=await page(); await setup(p);
    // Use a real included WebM, without simulated media events.
    await p.locator('#media-panel video').evaluate(v=>v.play());
    await p.waitForFunction(()=>!document.getElementById('review').disabled,{},{timeout:45000});
    assert(await p.locator('#media-panel video').evaluate(v=>v.ended));
    await p.setViewportSize({width:390,height:844});
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    results.push('PASS real WebM autoplay/end unlock and mobile width'); await p.close(); }
  assert.deepEqual(errors,[]);
  results.push('PASS desktop layout at 1366x768, underage warning, comprehension checks, no JS errors');
  fs.writeFileSync('docs/browser-test-results.txt',results.join('\n')+'\n');
  console.log(results.join('\n')); await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
