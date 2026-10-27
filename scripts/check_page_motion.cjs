/* Test navigation boundaries without a browser or third-party dependencies. */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../docs/assets/page-transitions.js'),'utf8');
const tick=async()=>{for(let i=0;i<6;i++)await Promise.resolve();};

function environment({url='https://example.test/study/index.html',reduced=false,settings=new Map(),session=new Map(),blocked=false,main=null}={}){
 const dom={},events={},attrs={};
 const button={textContent:'',title:'',setAttribute:(k,v)=>attrs[k]=v};
 const store=map=>({getItem:k=>{if(blocked)throw Error('storage unavailable');return map.get(k)??null;},setItem:(k,v)=>{if(blocked)throw Error('storage unavailable');map.set(k,v);},removeItem:k=>map.delete(k)});
 const html={dataset:{}};
 const env={URL,Date,Promise,console,setTimeout:()=>0,clearTimeout:()=>{},
  matchMedia:()=>({matches:reduced,addEventListener:()=>{}}),
  localStorage:store(settings),sessionStorage:store(session),Element:function(){},
  location:{href:url,hash:new URL(url).hash,assign:to=>env.assignments.push(new URL(to,url).href)},
  assignments:[],requestAnimationFrame:fn=>fn(),
  addEventListener:(name,fn)=>events[name]=fn,
  document:{documentElement:html,currentScript:{src:'https://example.test/study/assets/page-transitions.js'},readyState:'loading',
   querySelectorAll:q=>q==='[data-page-motion]'?[button]:[],getElementById:id=>id==='main'?main:null,
   addEventListener:(name,fn)=>dom[name]=fn}
 };
 env.Element.prototype.animate=()=>({finished:Promise.resolve(),cancel:()=>{}});
 env.window=env;vm.createContext(env);vm.runInContext(source,env);
 env.initialize=()=>dom.DOMContentLoaded();
 env.toggle=()=>dom.click({target:{closest:q=>q==='[data-page-motion]'?button:null}});
 env.click=(to,options={})=>{
  const a={href:new URL(to,url).href,target:options.target||'',hasAttribute:n=>n==='download'&&options.download};
  const e={target:{closest:q=>q==='a[href]'?a:null},button:0,detail:1,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...options};
  dom.click(e);return e;
 };
 env.html=html;env.session=session;env.events=events;env.settings=settings;env.button=button;
 return env;
}

(async()=>{
 let passed=0;
 const check=label=>{passed++;console.log('OK: '+label);};
 let e=environment();e.initialize();let click=e.click('/study/specials/a2/index.html');await tick();
 assert.equal(click.defaultPrevented,true);assert.equal(e.assignments[0],'https://example.test/study/specials/a2/index.html');
 assert.equal(JSON.parse(e.session.get('infs7903-page-transition-v1')).kind,'pixel');check('course-to-A2 uses one bounded pixel navigation');

 e=environment();e.initialize();e.click('/study/specials/a2/index.html');click=e.click('/study/chapters/ch01.html');await tick();
 assert.equal(click.defaultPrevented,false);assert.equal(e.assignments.length,0);assert.equal(e.session.size,0);check('a newer navigation cancels the earlier pixel departure');

 e=environment({url:'https://example.test/study/specials/a2/q1.html'});e.initialize();click=e.click('q2.html');
 assert.equal(click.defaultPrevented,false);assert.equal(JSON.parse(e.session.get('infs7903-page-transition-v1')).kind,'lesson');check('lesson link keeps native document navigation');

 for(const [label,to,options]of[
  ['same-page anchor','#line-1-1-1-6',{}],['same canonical home','/study/',{}],
  ['download','/study/assignments/a2/sql/example.sql',{download:true}],
  ['external website','https://other.test/study/specials/a2/index.html',{}],
  ['mail link','mailto:example@example.test',{}],['outside project','/other/specials/a2/index.html',{}],
  ['Command click','/study/specials/a2/index.html',{metaKey:true}],['Control click','/study/specials/a2/index.html',{ctrlKey:true}],
  ['middle click','/study/specials/a2/index.html',{button:1}],['new tab','/study/specials/a2/index.html',{target:'_blank'}]
 ]){
  e=environment();e.initialize();click=e.click(to,options);await tick();
  assert.equal(click.defaultPrevented,false,label);assert.equal(e.session.size,0,label);assert.equal(e.assignments.length,0,label);check(label+' is not intercepted');
 }
 e=environment({reduced:true});e.initialize();click=e.click('/study/specials/a2/index.html');await tick();
 assert.equal(e.html.dataset.motionDisabled,'true');assert.equal(click.defaultPrevented,false);assert.equal(e.session.size,0);check('system reduced-motion preference bypasses effects');

 e=environment({blocked:true});e.initialize();click=e.click('/study/specials/a2/index.html');await tick();
 assert.equal(click.defaultPrevented,false);assert.equal(e.assignments.length,0);check('blocked storage cannot trap a link');

 const shared=new Map();let older=environment({settings:shared});older.initialize();
 e=environment({settings:shared});e.initialize();e.toggle();assert.equal(e.html.dataset.motionDisabled,'true');
 older.events.pageshow({persisted:true});assert.equal(older.html.dataset.motionDisabled,'true');check('transition preference survives navigation and back-forward cache');

 let focused=false,animated=0;
 const session=new Map([['infs7903-page-transition-v1',JSON.stringify({kind:'lesson',to:'https://example.test/study/specials/a2/q2.html',time:Date.now(),keyboard:true})]]);
 e=environment({url:'https://example.test/study/specials/a2/q2.html',session,main:{animate:()=>{animated++;return{finished:Promise.resolve(),cancel:()=>{}};},focus:()=>focused=true}});
 e.initialize();await tick();assert.equal(animated,1);assert.equal(focused,true);assert.equal(e.html.dataset.motionPhase,'idle');assert.equal(session.size,0);check('only destination content animates and keyboard focus is restored');
 console.log(`${passed} page-motion checks passed.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
