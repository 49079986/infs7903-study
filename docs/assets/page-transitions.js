'use strict';
/* Original, dependency-free transitions for this multi-page study website.
   Page documents and their event handlers keep their normal browser lifecycle. */
(() => {
 const html=document.documentElement;
 const base=new URL('../',document.currentScript.src);
 const key='infs7903-page-transition-v1',settingKey='infs7903-page-motion';
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 let disabledByUser=false,pending=null,departing=false,layer=null,entryStarted=false,entryAnimation=null,navigationTicket=0;
 try{disabledByUser=localStorage.getItem(settingKey)==='off';}catch{}
 const disabled=()=>disabledByUser||preference.matches;
 const canonical=u=>{const x=new URL(u,location.href);if(x.pathname.endsWith('/'))x.pathname+='index.html';return x;};
 const isA2=u=>u.pathname.includes('/specials/a2/')||u.pathname.endsWith('/review/a2.html');
 function classify(from,to){
  try{
   const a=canonical(from),b=canonical(to);
   if(a.origin!==b.origin||!b.pathname.startsWith(base.pathname)||!['http:','https:','file:'].includes(b.protocol))return 'none';
   if(!b.pathname.endsWith('.html')||a.pathname===b.pathname&&a.search===b.search)return 'none';
   return isA2(b)&&!isA2(a)?'pixel':isA2(a)||isA2(b)?'lesson':'none';
  }catch{return 'none';}
 }
 function store(item){try{sessionStorage.setItem(key,JSON.stringify(item));return true;}catch{return false;}}
 function clearPending(){try{sessionStorage.removeItem(key);}catch{}}
 function readPending(){
  try{
   const item=JSON.parse(sessionStorage.getItem(key)||'null');
   if(!item||!['pixel','lesson'].includes(item.kind)||Date.now()-item.time>8000)return null;
   if(canonical(item.to).href!==canonical(location.href).href)return null;
   return item;
  }catch{return null;}
 }
 pending=readPending();
 function removeLayer(){if(layer){(layer.getAnimations?.({subtree:true})||[]).forEach(a=>a.cancel());layer.remove();layer=null;}}
 function focusDestination(item){if(item?.keyboard&&!location.hash)document.getElementById('main')?.focus({preventScroll:true});}
 function idle(item){removeLayer();html.dataset.motionPhase='idle';focusDestination(item);}
 function setDisabled(){
  html.dataset.motionDisabled=String(disabled());
  document.querySelectorAll('[data-page-motion]').forEach(button=>{
   button.textContent=disabled()?'转场：关':'转场：开';button.setAttribute('aria-pressed',String(!disabled()));
   button.title=preference.matches?'已跟随系统“减少动态效果”设置':disabledByUser?'开启页面转场动画':'关闭页面转场动画';
  });
  if(disabled()){entryAnimation?.cancel();removeLayer();}
 }
 setDisabled();
 preference.addEventListener?.('change',setDisabled);

 function pixelLayer(){
  const main=document.getElementById('main');if(!main)return null;
  const rect=main.getBoundingClientRect(),header=parseFloat(getComputedStyle(html).getPropertyValue('--site-header-offset'))||112;
  const top=Math.max(header,rect.top),height=Math.min(innerHeight,rect.bottom)-top;
  if(height<40||rect.width<80)return null;
  const cols=Math.min(14,Math.max(5,Math.round(rect.width/78))),rows=Math.min(11,Math.max(2,Math.ceil(height/(rect.width/cols))));
  const node=document.createElement('div');node.className='page-pixel-layer';node.setAttribute('aria-hidden','true');
  Object.assign(node.style,{left:`${rect.left}px`,top:`${top}px`,width:`${rect.width}px`,height:`${height}px`,gridTemplateColumns:`repeat(${cols},1fr)`,gridTemplateRows:`repeat(${rows},1fr)`});
  const tiles=[];
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
   const cell=document.createElement('i');cell.className='page-pixel';
   cell.style.background=['#1c1712','#34251b','#7c5338','#bf8b58'][(x*7+y*3)%4];
   node.append(cell);tiles.push({cell,delay:Math.round((x+y*.65)/(cols+rows*.65)*100)});
  }
  document.body.append(node);layer=node;return {node,tiles};
 }
 function animatePixels(open){
  if(typeof Element.prototype.animate!=='function')return Promise.resolve();
  const grid=pixelLayer();if(!grid)return Promise.resolve();
  const animations=grid.tiles.map(({cell,delay})=>cell.animate(open?
   [{opacity:1,transform:'scale(1.035)'},{opacity:0,transform:'scale(.08)'}]:
   [{opacity:0,transform:'scale(.08)'},{opacity:1,transform:'scale(1.035)'}],
   {duration:open?220:135,delay,easing:open?'cubic-bezier(.2,.7,.2,1)':'cubic-bezier(.55,0,.35,1)',fill:'both'}));
  // A failed animation must never trap navigation or leave an interaction layer.
  return Promise.race([Promise.all(animations.map(a=>a.finished.catch(()=>{}))),new Promise(resolve=>setTimeout(resolve,open?380:290))]);
 }
 function fallbackEntry(){
  if(entryStarted||disabled())return;entryStarted=true;
  const item=pending,kind=item?.kind;
  if(!kind)return;
  clearPending();html.dataset.motionKind=kind;html.dataset.motionEngine='css';html.dataset.motionPhase='enter';
  if(kind==='pixel'){animatePixels(true).finally(()=>idle(item));return;}
  const main=document.getElementById('main');
  if(!main?.animate){idle(item);return;}
  entryAnimation=main.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:260,easing:'cubic-bezier(.2,.7,.2,1)'});
  entryAnimation.finished.catch(()=>{}).finally(()=>{entryAnimation=null;idle(item);});
 }
 function navigationItem(to,keyboard=false){return {kind:classify(location.href,to),to:new URL(to,location.href).href,time:Date.now(),keyboard};}
 function leave(to,keyboard=false,event=null){
  if(departing){departing=false;navigationTicket++;removeLayer();clearPending();html.dataset.motionPhase='idle';}
  const item=navigationItem(to,keyboard);
  if(disabled()||item.kind==='none')return false;
  const stored=store(item);
  if(item.kind!=='pixel'||!stored)return false;
  event?.preventDefault();departing=true;html.dataset.motionKind='pixel';html.dataset.motionPhase='leave';html.dataset.motionEngine='css';
  const ticket=++navigationTicket;
  animatePixels(false).finally(()=>{if(departing&&ticket===navigationTicket)location.assign(item.to);});return true;
 }
 function navigate(to){if(!leave(to,true))location.assign(to);}
 window.StudyTransitions={navigate};

 addEventListener('pageshow',event=>{
  if(event.persisted){departing=false;entryStarted=false;pending=null;entryAnimation?.cancel();try{disabledByUser=localStorage.getItem(settingKey)==='off';}catch{}setDisabled();clearPending();idle(null);}
 });
 document.addEventListener('click',event=>{
   const toggle=event.target.closest?.('[data-page-motion]');
   if(toggle){disabledByUser=!disabledByUser;try{localStorage.setItem(settingKey,disabledByUser?'off':'on');}catch{}setDisabled();return;}
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const anchor=event.target.closest?.('a[href]');
   if(!anchor||anchor.hasAttribute('download')||anchor.target&&anchor.target!=='_self'||anchor.hasAttribute('data-no-transition'))return;
   leave(anchor.href,event.detail===0,event);
  });
 function initialize(){
  setDisabled();
  // Animate only the real destination main region. Header and navigation never
  // participate, and page scripts keep their normal lifecycle on every browser.
  if(pending)requestAnimationFrame(fallbackEntry);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
