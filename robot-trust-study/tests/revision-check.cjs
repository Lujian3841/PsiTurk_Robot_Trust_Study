// Serve the project on port 8000, then run with Playwright installed.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.STUDY_BROWSER||undefined,headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1366,height:768}});
 await page.route('http://127.0.0.1:8000/**',r=>r.fulfill({path:require('node:path').resolve('.'+new URL(r.request().url()).pathname)}));
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 async function fit(label){const size=await page.evaluate(()=>({h:document.documentElement.scrollHeight,w:document.documentElement.scrollWidth,vh:innerHeight,vw:innerWidth}));if(size.h>size.vh||size.w>size.vw)await page.screenshot({path:'/tmp/layout-failure.png',fullPage:true});assert(size.h<=size.vh&&size.w<=size.vw,`${label}: ${JSON.stringify(size)}`);}
 const submit=()=>page.locator('form button.primary');
 await page.goto('http://127.0.0.1:8000/preview.html?condition=0&counterbalance=0');
 await fit('consent');assert(await page.locator('#consent').isDisabled());
 await page.locator('#agree').check();await page.locator('#consent').click();
 await fit('demographics');assert(await submit().isDisabled());
 await page.locator('#age').fill('81');
 for(const [k,v] of [['gender','Man'],['psiturk_before','No'],['robots_before','No'],['robot_familiarity','Slightly']])await page.locator('#'+k).selectOption(v);
 assert(await submit().isEnabled());await page.locator('#age').fill('17');assert(await submit().isDisabled());await page.locator('#age').fill('81');
 await page.locator('#previous').click();await page.locator('#consent').click();assert.equal(await page.locator('#age').inputValue(),'81');await submit().click();
 await fit('media');assert(await submit().isDisabled());
 await page.locator('#tones').selectOption('1');await page.locator('#shape').selectOption('Circle');assert(await submit().isDisabled());
 await page.evaluate(()=>document.querySelector('video').dispatchEvent(new Event('ended')));await submit().click();assert(await page.locator('#av-error').textContent());
 await page.locator('#tones').selectOption('3');await submit().click();await fit('explanation');
 await page.locator('#previous').click();assert.equal(await page.locator('#tones').inputValue(),'3');assert(await submit().isEnabled());await submit().click();
 await page.locator('#next-explanation').click();await fit('instructions');await page.locator('#begin').click();await fit('understanding');assert(await submit().isDisabled());
 await page.locator('#robots').selectOption('Only one robot');await page.locator('#replies').selectOption('With recorded answers');await page.locator('#timer').selectOption('The next page opens and saves my answers');await submit().click();assert(await page.locator('#understanding-error').textContent());
 await page.locator('#previous').click();await page.locator('#previous').click();await page.locator('#next-explanation').click();await page.locator('#begin').click();assert.equal(await page.locator('#robots').inputValue(),'Only one robot');
 await page.locator('#robots').selectOption('Both robots');await submit().click();await fit('scenario');assert(await submit().isDisabled());
 await page.locator('#understanding_rescues').selectOption('One');await page.locator('#understanding_promise').selectOption('The person at Building A');await submit().click();
 for(let robot=0;robot<2;robot++){
  assert.equal(await page.locator('#previous').count(),0);await fit('opening');
  const video=page.locator('#media-panel video');await video.evaluate(v=>new Promise((resolve,reject)=>{if(v.readyState>=1)return resolve();v.addEventListener('loadedmetadata',resolve,{once:true});v.addEventListener('error',()=>reject(Error('video load failed')),{once:true});}));
  await page.locator('#review').click();
  for(const k of ['reason','left_behind','promise','suffering','change']){
   await page.locator(`[data-question="${k}"]`).click();await fit('reply '+k);
   if(robot===0&&k==='reason'){
    // Neutral screenshot of the current interface, without revealing either decision.
    const old=await page.locator('#response').textContent();const title=await page.locator('#response-title').textContent();
    await page.evaluate(()=>{document.querySelector('#response').textContent='The robot’s reply appears here. Watch or read it, then mark it reviewed. Choose another question on the right.';document.querySelector('#response-title').textContent='Example reply';});
    await page.screenshot({path:'static/media/task-example.png'});
    await page.locator('#response').evaluate((e,t)=>e.textContent=t,old);await page.locator('#response-title').evaluate((e,t)=>e.textContent=t,title);
   }
   await page.locator('#follow').click();await fit('follow-up '+k);await page.locator('#review').click();
  }
  await fit('ratings');assert(await submit().isDisabled());
  for(const k of ['trust_1','trust_2','comfort_1','comfort_2','competence_1','competence_2','intelligence_1','intelligence_2'])await page.locator(`input[name="${k}"][value="skip"]`).check();
  assert(await submit().isEnabled());await submit().click();
 }
 await fit('authority');assert(await submit().isDisabled());for(const k of ['business','family','government','rescue'])await page.locator(`input[name="authority_${k}"][value="skip"]`).check();await submit().click();
 await fit('reflection');assert(await submit().isEnabled());await submit().click();await fit('finish');
 const s=await page.evaluate(()=>studyDemo.getState());assert.equal(s.questions.instructions_check_history.length,2);assert.equal(s.questions.instructions_check_history[0].correct,false);assert.equal(s.questions.instructions_check_passed,true);assert.equal(s.questions.age,'81');assert.deepEqual(errors,[]);
 console.log('PASS required-form gates, age 81, setup Previous/answer restoration, media gate, comprehension retry/history, no timed-page back buttons, skip/optional responses, all pages fit 1366x768, video metadata, no JS errors');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
