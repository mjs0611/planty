// Synthetic fixtures against the real static export. No product SDK aliases or external requests.
const { chromium, webkit } = require(process.env.PLANTY_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const url = process.env.PLANTY_QA_URL || 'http://127.0.0.1:57733';
assert.equal(new URL(url).hostname, '127.0.0.1');
const output = path.resolve(process.env.PLANTY_QA_OUTPUT || '../evidence/mobile');
fs.mkdirSync(output, { recursive: true });
const today = '2026-10-13';
const now = '2026-10-13T03:00:00.000Z';
const results = { host: { platform: os.platform(), arch: os.arch() }, url, realDevice: false, textScale: 'Computed font sizes ×2; a stress fixture, not native Dynamic Type', browsers: [], cases: [] };
const entry = (type) => ({type,completedAt:'2026-10-01T03:00:00Z',totalDaysAlive:5,maxStreak:4});
function fixture(extra = {}) {
  return { stage:'seed',plantType:'cactus',garden:[],stats:{water:70,sunlight:80,health:60},xp:0,xpRequired:30,streak:1,maxStreak:12,lastCareDate:today,adLastWatched:null,lastLoginBonusDate:today,lastWateringTime:null,lastMoodInteractTime:null,streakShields:1,lastShieldRefillWeek:'2026-W42',completedMissions:[],timeSlotMissions:{morning:['water','talk','sunlight'],afternoon:['water','wipe','fertilize'],evening:['sing','observe','prune'],night:['journal','mist','breeze']},todayMissionsDate:today,isWilting:false,isDead:false,totalDaysAlive:10,tapHealthToday:0,lastTapStatDate:null,...extra };
}
async function saved(page) { return page.evaluate(() => JSON.parse(localStorage.getItem('planty_state'))); }
async function persisted(page, check) {
  for (let i=0;i<40;i++) { const data=await saved(page); if (data && check(data)) return data; await page.waitForTimeout(100); }
  throw new Error('Expected care did not persist');
}
async function scale(page, factor) {
  if (factor===1) return;
  await page.evaluate(factor => {
    const elements=[...document.querySelectorAll('p,span,button,input,h1,h2,h3,h4,label,strong,small')];
    const fonts=elements.map(el=>({el,size:Number(el.dataset.qaFont||parseFloat(getComputedStyle(el).fontSize)),line:getComputedStyle(el).lineHeight}));
    for (const {el,size,line} of fonts) {
      el.dataset.qaFont=String(size);el.style.fontSize=`${size*factor}px`;
      if (line!=='normal') { if(!el.dataset.qaLine)el.dataset.qaLine=String(parseFloat(line));el.style.lineHeight=`${Number(el.dataset.qaLine)*factor}px`; }
    }
  },factor);
}
async function capture(page, label, factor) {
  await page.clock.runFor(3000);
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.waitForTimeout(100);
  await scale(page,factor);
  const layout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth}));
  assert.ok(layout.scrollWidth<=layout.width+1,`${label}: horizontal overflow ${JSON.stringify(layout)}`);
  await page.screenshot({path:path.join(output,`${label}.png`),fullPage:true});
  fs.writeFileSync(path.join(output,`${label}.txt`),await page.locator('body').innerText());
  return layout;
}
async function runCase(browser, engine, width, factor, name, initial, test) {
  if(process.env.PLANTY_QA_CASES && !process.env.PLANTY_QA_CASES.split(',').includes(name))return;
  const key=`${engine}-${width}-text${factor*100}-${name}`;
  const context=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,locale:'ko-KR',timezoneId:'Asia/Seoul',reducedMotion:'reduce',serviceWorkers:'block'});
  const errors=[],blocked=[],sdkLimitations=[];
  await context.route('**/*',r=>{ const u=new URL(r.request().url()); if(u.origin===new URL(url).origin)return r.continue();blocked.push(u.origin);return r.abort('blockedbyclient'); });
  const page=await context.newPage();page.setDefaultTimeout(7000);
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{
    if(m.type()!=='error')return;
    const message=m.text();
    // The real AIT provider reports a missing native inset API in ordinary Mac browsers.
    if(message.startsWith('SafeAreaInsets를 가져오는 중 에러가 발생했습니다:') && (message.includes("reading 'safeAreaInsets'") || message.includes("evaluating 'window.__appsInTossConstants[e]'")))sdkLimitations.push(message.slice(0,500));
    else errors.push(message.slice(0,500));
  });
  await page.clock.install({time:new Date(now)});
  await page.addInitScript(({initial})=>{
    Math.random=()=>0.5;
    // Only seed once per fresh context. Reloads must read the real persisted state.
    if(!sessionStorage.getItem('qa_seeded')){
      localStorage.setItem('theme','light');
      if(initial!==null){localStorage.setItem('planty_onboarded','true');localStorage.setItem('planty_state',JSON.stringify(initial));}
      sessionStorage.setItem('qa_seeded','true');
    }
  },{initial});
  try {
    await page.goto(url,{waitUntil:'domcontentloaded'});
    if(initial===null)await page.getByRole('button',{name:'다음',exact:true}).waitFor();
    else await page.getByRole('button',{name:'정원',exact:true}).waitFor();
    await scale(page,factor);
    await test(page,context,key);
    assert.deepEqual(errors,[],`${key}: runtime errors`);
    assert.deepEqual(blocked,[],`${key}: external requests`);
    results.cases.push({key,status:'passed',errors,blocked,sdkLimitations});
    console.log('PASS',key);
  } catch(e) {
    results.cases.push({key,status:'failed',message:e.message,errors,blocked,sdkLimitations});
    await page.screenshot({path:path.join(output,`${key}-FAILED.png`),fullPage:true}).catch(()=>{});
    console.log('FAIL',key,e.message.slice(0,600));
  } finally { await context.close();fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2)); }
}
async function verify(engineName, engine, width, factor) {
 const browser=await engine.launch({headless:true,...(engineName==='chrome'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--disable-background-networking','--disable-component-update','--no-first-run']}:{})});
 results.browsers.push({engine:engineName,version:browser.version(),width,factor});
 try {
  await runCase(browser,engineName,width,factor,'new-care',null,async(page,context,key)=>{
    await page.getByRole('button',{name:'다음',exact:true}).click();
    await page.evaluate(()=>history.back());
    await page.getByRole('heading',{name:/플랜티/}).waitFor();
    await page.getByRole('button',{name:'다음',exact:true}).click();
    await page.getByRole('button',{name:'다음',exact:true}).click();
    await page.locator('input').fill('abcdefghijkl');
    await scale(page,factor);
    await page.getByRole('button',{name:/함께 시작하기/}).click();
    await page.getByRole('button',{name:'정원',exact:true}).waitFor();
    const initial=await persisted(page,s=>s.xp===10);
    assert.equal(initial.plantType,'rose');
    await page.getByRole('button',{name:/물주기/}).click();
    const watered=await persisted(page,s=>s.xp===20);
    assert.equal(watered.stats.water,88);
    await page.getByText('새싹까지 10 XP',{exact:true}).waitFor();
    await capture(page,`${key}-water`,factor);
    const slots={morning:'아침',afternoon:'낮',evening:'저녁',night:'밤'};
    const waterSlot=Object.keys(watered.timeSlotMissions).find(slot=>watered.timeSlotMissions[slot].includes('water'));
    await page.getByRole('button',{name:new RegExp(slots[waterSlot])}).click();
    await page.getByRole('button',{name:/물 듬뿍 주기/}).click();
    // Back cancels a mission before any care is performed.
    await page.evaluate(()=>history.back());
    await page.waitForTimeout(200);
    assert.equal((await saved(page)).xp,20);
    await page.getByRole('button',{name:/물 듬뿍 주기/}).click();
    await page.getByRole('button',{name:'💧',exact:true}).last().click({clickCount:3,delay:80});
    const grown=await persisted(page,s=>s.stage==='sprout');
    assert.equal(grown.completedMissions.filter(id=>id===`${waterSlot}_water`).length,1);
    await page.getByAltText('돌보기 전 씨앗').waitFor();
    await page.getByAltText('돌본 뒤 새싹').waitFor();
    await capture(page,`${key}-growth`,factor);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.getByRole('button',{name:'정원',exact:true}).waitFor();
    assert.equal((await saved(page)).plantType,'rose');
    assert.equal((await saved(page)).stage,'sprout');
  });
  await runCase(browser,engineName,width,factor,'collect',fixture({stage:'bloom',xp:295,xpRequired:300,garden:[entry('green'),entry('green')]}),async(page,context,key)=>{
    await page.getByRole('button',{name:'정원',exact:true}).click();
    await page.getByText('1종 · 2그루',{exact:true}).waitFor();
    await page.getByText('🌻 해바라기 키우기를 시작해요.',{exact:true}).waitFor();
    await capture(page,`${key}-before`,factor);
    await page.getByRole('button',{name:'이 식물 이어서 돌보기',exact:true}).click();
    assert.equal(await page.evaluate(()=>scrollY),0);
    await page.getByRole('button',{name:/물주기/}).click();
    await persisted(page,s=>s.stage==='special');
    await capture(page,`${key}-gold`,factor);
    await page.evaluate(()=>{
      const button=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('정원에 모으고 새 식물 키우기'));
      for(let i=0;i<8;i++)button.click();
    });
    const collected=await persisted(page,s=>s.garden.length===3);
    assert.equal(collected.plantType,'sunflower');assert.equal(collected.xp,0);
    assert.deepEqual(collected.garden.map(p=>p.type),['green','green','cactus']);
    await page.getByText('2종 · 3그루',{exact:true}).waitFor();
    await capture(page,`${key}-garden`,factor);
    await page.evaluate(()=>history.back());
    await page.getByRole('button',{name:/내 정원 보기/}).waitFor();
    await page.reload({waitUntil:'domcontentloaded'});
    await page.getByRole('button',{name:'정원',exact:true}).waitFor();
    assert.equal((await saved(page)).plantType,'sunflower');assert.equal((await saved(page)).garden.length,3);
  });
  await runCase(browser,engineName,width,factor,'return',fixture({plantType:'bamboo',stage:'flower',xp:42,xpRequired:200,name:'가나다라마바사아자차카타',garden:[entry('rose'),entry('sunflower')],lastCareDate:'2026-10-09',todayMissionsDate:'2026-10-09'}),async(page,context,key)=>{
    await page.getByRole('button',{name:'무료로 다시 돌보기',exact:true}).waitFor();
    await capture(page,`${key}-before`,factor);
    await page.getByRole('button',{name:'모아둔 정원 보기',exact:true}).click();
    await capture(page,`${key}-preserved-garden`,factor);
    await page.getByRole('button',{name:'이 식물 다시 돌보기',exact:true}).click();
    await page.evaluate(()=>{
      const b=[...document.querySelectorAll('button')].find(b=>b.textContent==='무료로 다시 돌보기');for(let i=0;i<10;i++)b.click();
    });
    const recovered=await persisted(page,s=>!s.isDead);
    assert.equal(recovered.stage,'flower');assert.equal(recovered.xp,42);assert.equal(recovered.plantType,'bamboo');
    assert.equal(recovered.name,'가나다라마바사아자차카타');assert.deepEqual(recovered.garden.map(p=>p.type),['rose','sunflower']);
    assert.ok(Object.values(recovered.stats).every(v=>v>=60));
    await capture(page,`${key}-recovered`,factor);
    await page.getByRole('button',{name:/✏️/}).click();
    await page.locator('input').waitFor();await page.evaluate(()=>history.back());
    await page.waitForTimeout(100);assert.equal(await page.locator('input').count(),0);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.getByRole('button',{name:'정원',exact:true}).waitFor();
    assert.equal((await saved(page)).isDead,false);assert.equal((await saved(page)).xp,42);
    await page.getByRole('button',{name:/物|물주기/}).click();
    await persisted(page,s=>s.xp===52);
  });
  await runCase(browser,engineName,width,factor,'save-failure',fixture({xp:20}),async(page,context,key)=>{
    await persisted(page,s=>s.xp===20);
    await page.evaluate(()=>{window.qaOriginalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='planty_state')throw new DOMException('synthetic full storage','QuotaExceededError');return window.qaOriginalSetItem.call(this,k,v)};});
    await page.getByRole('button',{name:/물주기/}).click();
    await page.getByRole('button',{name:'저장 다시 시도',exact:true}).waitFor();
    assert.equal((await saved(page)).xp,20);
    await capture(page,`${key}-failed-save`,factor);
    await page.evaluate(()=>{Storage.prototype.setItem=window.qaOriginalSetItem;});
    await page.getByRole('button',{name:'저장 다시 시도',exact:true}).click();
    const retry=await persisted(page,s=>s.stage==='sprout');assert.equal(retry.xp,0);
    assert.equal(await page.getByRole('button',{name:'저장 다시 시도',exact:true}).count(),0);
    await page.reload({waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'정원',exact:true}).waitFor();
    assert.equal((await saved(page)).stage,'sprout');
  });
  await runCase(browser,engineName,width,factor,'rapid-offline',fixture({garden:[entry('rose')]}),async(page,context,key)=>{
    await persisted(page,s=>s.xp===0);
    await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('물주기'));for(let i=0;i<10;i++)b.click();});
    assert.equal((await persisted(page,s=>s.xp===10)).xp,10);
    // The fifth tap awards +3 XP and +1 health in the same action. Both must survive.
    await page.locator('div.relative.w-64.h-64').evaluate(el=>{for(let i=0;i<5;i++)el.click();});
    const combo=await persisted(page,s=>s.xp===13);assert.equal(combo.stats.health,65);
    await context.setOffline(true);
    await page.locator('div.relative.w-64.h-64').evaluate(el=>{for(let i=0;i<5;i++)el.click();});
    await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));
    const offline=await persisted(page,s=>s.xp===18);assert.equal(offline.stats.health,70);
    await context.setOffline(false);
    await page.reload({waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'정원',exact:true}).waitFor();
    assert.equal((await saved(page)).xp,18);assert.equal((await saved(page)).garden[0].type,'rose');
    await page.goto(`${url}/garden.html`,{waitUntil:'domcontentloaded'});await page.getByRole('heading',{name:'내 정원',exact:true}).waitFor();
    await page.getByRole('button',{name:'이 식물 이어서 돌보기',exact:true}).click();
    assert.equal(await page.evaluate(()=>scrollY),0);
    await page.getByRole('button',{name:'어두운 테마로 바꾸기',exact:true}).click();
    await page.getByRole('button',{name:'정원',exact:true}).click();
    await capture(page,`${key}-dark`,factor);
  });
 } finally {await browser.close();}
}
(async()=>{for(const [name,engine] of [['chrome',chromium],['webkit',webkit]])for(const width of [320,390])for(const factor of (process.env.PLANTY_QA_FACTORS?process.env.PLANTY_QA_FACTORS.split(',').map(Number):[1,2]))await verify(name,engine,width,factor);
fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));
console.log(`RESULT ${results.cases.filter(c=>c.status==='passed').length}/${results.cases.length}`);if(results.cases.some(c=>c.status!=='passed'))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
