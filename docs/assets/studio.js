'use strict';
(() => {
 const root=document.body.dataset.studioRoot||'', storageKey='infs7903-study-studio-v1';
 let state={version:1,language:'both',mastery:{}};
 try{const s=JSON.parse(localStorage.getItem(storageKey)||'null');if(s?.version===1)state={...state,...s,mastery:s.mastery||{}};}catch{}
 const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{}};
 let toastTimer;
 const toast=text=>{const el=document.getElementById('studio-toast');if(!el)return;el.textContent=text;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3000);};
 function reading(mode){state.language=['both','en','zh'].includes(mode)?mode:'both';document.body.classList.remove('lang-en','lang-zh');if(state.language!=='both')document.body.classList.add('lang-'+state.language);const sel=document.querySelector('[data-reading-select]');if(sel)sel.value=state.language;document.documentElement.lang=state.language==='en'?'en':'zh-CN';save();}
 document.querySelector('[data-reading-select]')?.addEventListener('change',e=>reading(e.target.value));reading(state.language);
 document.querySelector('[data-print]')?.addEventListener('click',()=>window.print());
 function progress(){const n=Array.from({length:13},(_,i)=>`ch${String(i+1).padStart(2,'0')}`).filter(k=>state.mastery[k]).length;document.querySelectorAll('[data-progress-text]').forEach(e=>e.textContent=`${n} / 13`);document.querySelectorAll('[data-progress-bar]').forEach(e=>e.style.width=(n/13*100)+'%');document.querySelectorAll('.chapter-link').forEach(a=>a.classList.toggle('done',!!state.mastery[a.getAttribute('href').match(/(ch\d+)\.html/)?.[1]]));document.querySelectorAll('[data-mastered]').forEach(el=>el.checked=!!state.mastery[el.dataset.mastered]);document.querySelectorAll('[data-a2-progress]').forEach(e=>{const ids=e.dataset.a2PartIds?e.dataset.a2PartIds.split('|'):[...document.querySelectorAll('.a2-part [data-mastered]')].map(x=>x.dataset.mastered);e.textContent=`${ids.filter(k=>state.mastery[k]).length} / ${ids.length}`;});}
 document.querySelectorAll('[data-mastered]').forEach(el=>el.addEventListener('change',()=>{state.mastery[el.dataset.mastered]=el.checked;save();progress();}));progress();
 document.querySelector('[data-nav-search]')?.addEventListener('input',e=>{const q=e.target.value.trim().toLocaleLowerCase();let count=0;document.querySelectorAll('[data-nav-item]').forEach(a=>{const found=a.textContent.toLocaleLowerCase().includes(q);a.hidden=!found;if(found)count++;});const empty=document.querySelector('.search-empty');if(empty)empty.hidden=count>0;});
 const here=location.pathname.endsWith('/')?location.pathname+'index.html':location.pathname;
 const inA2Special=here.includes('/specials/a2/');document.body.classList.toggle('a2-special-page',inA2Special);
 if(inA2Special){const sidebar=document.querySelector('.sidebar'),chapters=document.getElementById('chapter-nav'),title=document.querySelector('.special-sidebar-title'),nav=document.querySelector('.special-sidebar-links');if(sidebar&&chapters&&title&&nav){sidebar.insertBefore(title,chapters);sidebar.insertBefore(nav,chapters);}}
 document.querySelectorAll('.main-nav a,.assignment-sidebar-links a,.special-sidebar-links a,.chapter-link').forEach(a=>{const u=new URL(a.href);let active=u.pathname===here;if(a.closest('.main-nav')&&a.textContent==='专题讲义')active=/\/chapters\//.test(here);if(a.matches('.a2-nav'))active=here.includes('/specials/a2/')||here.endsWith('/review/a2.html');if(active)a.setAttribute('aria-current','page');});
 const a2Nav=document.querySelector('[data-a2-section-nav]'),a2Select=document.querySelector('[data-a2-section-select]');
 if(a2Nav){
  a2Nav.querySelectorAll('[data-a2-route]').forEach(a=>{if(new URL(a.href).pathname===here)a.setAttribute('aria-current','page');});
  if(a2Select){for(const o of a2Select.options)if(new URL(o.value,location.href).pathname===here)a2Select.value=o.value;a2Select.addEventListener('change',()=>window.StudyTransitions?window.StudyTransitions.navigate(a2Select.value):location.assign(a2Select.value));a2Select.closest('label').hidden=false;document.body.classList.add('a2-nav-ready');}
 }
 // Measure the actual header stack: resized Mac windows and translated labels
 // must not hide anchored questions or individual code lines behind sticky bars.
 const topbar=document.querySelector('.topbar');
 function measureNavigation(){
  if(!topbar)return;const gap=innerWidth<=800?8:12,top=parseFloat(getComputedStyle(topbar).top)||0;
  const bottom=top+topbar.getBoundingClientRect().height;
  document.documentElement.style.setProperty('--a2-nav-top',`${Math.ceil(bottom+gap)}px`);
  const secondary=a2Nav&&getComputedStyle(a2Nav).display!=='none'?a2Nav.getBoundingClientRect().height+gap:0;
  document.documentElement.style.setProperty('--site-header-offset',`${Math.ceil(bottom+secondary+16)}px`);
 }
 if('ResizeObserver' in window){const observer=new ResizeObserver(measureNavigation);if(topbar)observer.observe(topbar);if(a2Nav)observer.observe(a2Nav);}
 addEventListener('resize',measureNavigation);document.fonts?.ready.then(measureNavigation);measureNavigation();
 document.querySelectorAll('[data-expand-answers]').forEach(button=>button.addEventListener('click',()=>{const open=button.dataset.expandAnswers==='open';document.querySelectorAll('.a2-part>details').forEach(d=>d.open=open);}));
 const apple=/Mac|iPhone|iPad|iPod/i.test(navigator.userAgentData?.platform||navigator.platform||'');
 function manualCopy(code,trigger){
  const dialog=document.createElement('dialog');dialog.className='sql-copy-dialog';dialog.setAttribute('aria-labelledby','sql-copy-heading');
  const heading=document.createElement('h2');heading.id='sql-copy-heading';heading.textContent='复制 SQL / Copy SQL';
  const help=document.createElement('p');help.textContent='代码已选中。Mac 按 ⌘ Command + C；Windows / Linux 按 Ctrl + C。';
  const area=document.createElement('textarea');area.readOnly=true;area.value=code;area.setAttribute('aria-label','完整 SQL 代码');area.spellcheck=false;
  const close=document.createElement('button');close.textContent='完成 / Close';close.addEventListener('click',()=>dialog.close());
  dialog.append(heading,help,area,close);document.body.append(dialog);
  dialog.addEventListener('close',()=>{dialog.remove();trigger.focus({preventScroll:true});},{once:true});
  dialog.showModal();area.focus();area.select();area.setSelectionRange(0,code.length);
 }
 document.querySelectorAll('[data-copy-code]').forEach(button=>{button.title=`复制完整 SQL；手动复制可用 ${apple?'⌘ C':'Ctrl+C'}`;
  const actions=document.createElement('div');actions.className='code-actions';button.before(actions);actions.append(button);
  const select=document.createElement('button');select.type='button';select.className='copy-code';select.dataset.selectCode='';select.textContent='选择代码';select.setAttribute('aria-label','选择完整 SQL 以便手动复制');select.addEventListener('click',()=>manualCopy(button.closest('.code-block').querySelector('code').textContent,select));actions.append(select);
  button.addEventListener('click',async()=>{
  const code=button.closest('.code-block').querySelector('code').textContent;
  try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(code);toast('SQL 已复制 / SQL copied');return;}}catch{}
  const ta=document.createElement('textarea');ta.value=code;ta.style.cssText='position:fixed;left:-9999px;top:0';ta.setAttribute('aria-hidden','true');document.body.append(ta);ta.focus({preventScroll:true});ta.select();ta.setSelectionRange(0,code.length);
  let copied=false;try{copied=document.execCommand('copy');}catch{}ta.remove();button.focus({preventScroll:true});
  if(copied)toast('SQL 已复制 / SQL copied');else manualCopy(code,button);
 });});
 document.querySelector('[data-export-progress]')?.addEventListener('click',()=>{const blob=new Blob([JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='INFS7903-学习记录.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);toast('学习记录已导出 / Progress exported');});
 document.querySelector('[data-import-progress]')?.addEventListener('change',async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>1000000)throw Error();const x=JSON.parse(await f.text());if(x.version!==1||typeof x.mastery!=='object'||!x.mastery)throw Error();const mastery={};for(const [k,v]of Object.entries(x.mastery))if(/^(ch\d{2}|A2-[\d.]+)$/.test(k)&&typeof v==='boolean')mastery[k]=v;state.mastery=mastery;reading(x.language);progress();save();toast('学习记录已导入 / Progress imported');}catch{toast('请选择本学习站导出的 JSON / Use an exported study record');}e.target.value='';});
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&matchMedia('(hover:hover)').matches)document.querySelectorAll('.topic-card').forEach(card=>card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();card.style.setProperty('--spot-x',`${e.clientX-r.left}px`);card.style.setProperty('--spot-y',`${e.clientY-r.top}px`);}));
 const steps=[
  ['尚未开始事务','No transaction yet.','尚未开始事务','No transaction yet.','最新事件是 Return 194486，VEH-0001 可用。','Latest event: Return 194486. VEH-0001 is available.'],
  ['BEGIN → 读到 Return','BEGIN → reads Return.','尚未开始事务','No transaction yet.','T1 的查询返回可用，但这个读取没有预留车辆。','T1 sees availability, but the read does not reserve the vehicle.'],
  ['保持事务打开','Transaction remains open.','BEGIN → 也读到 Return','BEGIN → also reads Return.','两个连接均使用 READ COMMITTED，可以看到同一条已提交的 Return。','Both READ COMMITTED connections see the same committed Return.'],
  ['仍保留最初的查询结果','Still has its earlier query result.','Reserve 196442 → COMMIT','Reserve 196442 → COMMIT.','T2 为 member 2 写入三天后的 Reserve 并提交；T1 的旧答案已经过时。','T2 commits a reservation for member 2 three days ahead. T1’s earlier answer is stale.'],
  ['Collect → 触发器拒绝','Collect → rejected by trigger.','Reserve 已提交','Reserve is committed.','新的语句快照能看到 Reserve：Vehicle VEH-0001 is reserved by member 2。','The later statement sees the Reserve: Vehicle VEH-0001 is reserved by member 2.'],
  ['COMMIT → ROLLBACK','COMMIT → ROLLBACK.','事务完成','Transaction finished.','只留下新增 Reserve，没有新增 Collect。未来预约被简化模型当作当前状态。','Only the new Reserve survives. The simplified model treats a future reservation as the current state.']
 ];
 document.querySelectorAll('[data-a2-race]').forEach(panel=>{let step=0;const paint=()=>{const s=steps[step];panel.dataset.step=String(step);['one','two'].forEach((name,i)=>{const el=panel.querySelector(`[data-session=${name}]`);el.querySelector('strong').textContent=s[i*2];el.querySelector('p').textContent=s[i*2+1];el.classList.toggle('error',i===0&&step>=4);el.classList.toggle('committed',i===1&&step>=3);});panel.querySelector('[data-race-status]').replaceChildren();const zh=document.createElement('span'),en=document.createElement('span');zh.lang='zh-CN';en.lang='en';zh.textContent=s[4];en.textContent=s[5];en.style.display='block';en.style.color='#a99c87';panel.querySelector('[data-race-status]').append(zh,en);panel.querySelector('output').textContent=`${step+1} / ${steps.length}`;panel.querySelector('[data-race-prev]').disabled=step===0;panel.querySelector('[data-race-next]').disabled=step===steps.length-1;};panel.querySelector('[data-race-next]').addEventListener('click',()=>{step=Math.min(steps.length-1,step+1);paint();});panel.querySelector('[data-race-prev]').addEventListener('click',()=>{step=Math.max(0,step-1);paint();});panel.querySelector('[data-race-reset]').addEventListener('click',()=>{step=0;paint();});paint();});
})();
