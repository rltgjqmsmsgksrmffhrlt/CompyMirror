/* ═══════════════════ Tweaks ═══════════════════ */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "finish": "chrome",
  "irid": "vivid",
  "glare": "on"
}/*EDITMODE-END*/;
let tweaks = {...TWEAK_DEFAULTS};
function applyTweaks(){
  document.documentElement.dataset.finish = tweaks.finish;
  document.documentElement.dataset.irid   = tweaks.irid;
  document.documentElement.dataset.glare  = tweaks.glare;
  [['tw-finish','finish'],['tw-irid','irid'],['tw-glare','glare']].forEach(([id,key])=>{
    document.querySelectorAll('#'+id+' .tw-opt').forEach(b=>b.classList.toggle('on', b.dataset.v===tweaks[key]));
  });
}
function setTweak(key,val){
  tweaks[key]=val; applyTweaks();
  try{ window.parent.postMessage({type:'__edit_mode_set_keys', edits:{[key]:val}}, '*'); }catch(e){}
}
[['tw-finish','finish'],['tw-irid','irid'],['tw-glare','glare']].forEach(([id,key])=>{
  document.querySelectorAll('#'+id+' .tw-opt').forEach(b=>b.addEventListener('click',()=>setTweak(key,b.dataset.v)));
});
window.addEventListener('message',(e)=>{
  const d=e.data||{};
  if(d.type==='__activate_edit_mode')   document.getElementById('tweaks').classList.add('on');
  if(d.type==='__deactivate_edit_mode') document.getElementById('tweaks').classList.remove('on');
});
function closeTweaks(){
  document.getElementById('tweaks').classList.remove('on');
  try{ window.parent.postMessage({type:'__edit_mode_dismissed'},'*'); }catch(e){}
}
setTimeout(()=>{ try{ window.parent.postMessage({type:'__edit_mode_available'},'*'); }catch(e){} },50);
applyTweaks();

/* ═══════════════════ Interactive light (smooth follow) ═══════════════════ */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let tgX=innerWidth/2, tgY=innerHeight*0.28;      // pointer target
let curX=tgX, curY=tgY;                            // eased current
let pointerSeen=false, lightRaf=0;
window.addEventListener('pointermove',(e)=>{
  tgX=e.clientX; tgY=e.clientY; pointerSeen=true;
  if(!lightRaf && !reduceMotion) lightRaf=requestAnimationFrame(lightLoop);
}, {passive:true});
function lightLoop(){
  // critically-damped easing -> no jitter, gentle trail
  curX += (tgX-curX)*0.08;
  curY += (tgY-curY)*0.08;
  const w=innerWidth, h=innerHeight, s=document.documentElement.style;
  s.setProperty('--gx', curX.toFixed(1)+'px');
  s.setProperty('--gy', curY.toFixed(1)+'px');
  s.setProperty('--mxr', ((curX/w)*2-1).toFixed(3));
  s.setProperty('--myr', ((curY/h)*2-1).toFixed(3));
  if(Math.abs(tgX-curX)>0.4 || Math.abs(tgY-curY)>0.4){ lightRaf=requestAnimationFrame(lightLoop); }
  else lightRaf=0;
}
// rest the glare gently centered before any interaction
document.documentElement.style.setProperty('--gx', tgX+'px');
document.documentElement.style.setProperty('--gy', tgY+'px');

/* ═══════════════════ Preset preview chips ═══════════════════ */
function presetFilter(name){
  const [b,c,s,w,k]=presets[name];
  const parts=[
    `brightness(${(1+b/180).toFixed(3)})`,
    `contrast(${(1+c/170).toFixed(3)})`,
    `saturate(${((s+100)/100).toFixed(3)})`
  ];
  if(w>0) parts.push(`sepia(${Math.min(0.6,w/110).toFixed(3)})`);
  else if(w<0) parts.push(`hue-rotate(${Math.round(w*0.32)}deg)`);
  if(k>0) parts.push(`blur(${(k*0.18).toFixed(2)}px)`);
  return parts.join(' ');
}
function paintChips(){
  document.querySelectorAll('.pb').forEach(btn=>{
    const chip=btn.querySelector('.chip');
    if(chip) chip.style.filter=presetFilter(btn.dataset.name);
  });
}

/* ═══════════════════ Toast ═══════════════════ */
let toastT=null;
function toast(msg, ms=2600){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('on');
  clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('on'), ms);
}

/* ═══════════════════ Camera + filters (core) ═══════════════════ */
const LS_KEY='compymirror_v5';
let stream=null, flipped=true, raf=null, timerRaf=null;
let mode='auto', camRatio=4/3;
const vid=document.getElementById('vid');
const cv=document.getElementById('cv');
const ctx=cv.getContext('2d',{willReadFrequently:true});

function saveFilters(){
  const vals=['fb','fc','fs','fw','fk','fsh'].reduce((o,id)=>{o[id]=+document.getElementById(id).value;return o;},{});
  try{ localStorage.setItem(LS_KEY, JSON.stringify(vals)); }catch(e){}
}
function loadFilters(){
  try{
    const s=JSON.parse(localStorage.getItem(LS_KEY)||'{}');
    ['fb','fc','fs','fw','fk','fsh'].forEach(id=>{
      if(s[id]!==undefined){ document.getElementById(id).value=s[id]; document.getElementById('v'+id.slice(1)).textContent=s[id]; }
    });
    updateZeroStates(); updateCSSFilter();
  }catch(e){}
}
function updateZeroStates(){
  ['fb','fc','fs','fw','fk','fsh'].forEach(id=>{
    const r=document.getElementById(id); r.closest('.row').classList.toggle('zero', +r.value===0);
  });
}
function gv(id){ return parseInt(document.getElementById(id).value); }
function sv(sid,vid2){
  document.getElementById(vid2).textContent=document.getElementById(sid).value;
  document.querySelectorAll('.pb').forEach(b=>b.classList.remove('on'));
  updateZeroStates(); saveFilters(); updateCSSFilter();
}
function setSliders(b,c,s,w,k,sh){
  const vals={fb:b,fc:c,fs:s,fw:w,fk:k,fsh:sh}, disp={vb:b,vc:c,vs:s,vw:w,vk:k,vsh:sh};
  Object.entries(vals).forEach(([id,v])=>document.getElementById(id).value=v);
  Object.entries(disp).forEach(([id,v])=>document.getElementById(id).textContent=v);
  updateZeroStates(); saveFilters(); updateCSSFilter();
}
function updateCSSFilter(){
  const bright=gv('fb'), contrast=gv('fc'), sat=gv('fs'), warm=gv('fw'),
        smooth=gv('fk'), sharp=gv('fsh');
  const parts=[];
  if(bright!==0) parts.push('brightness('+(1+bright/150).toFixed(3)+')');
  if(contrast!==0) parts.push('contrast('+(1+contrast/150).toFixed(3)+')');
  if(sat!==0) parts.push('saturate('+((sat+100)/100).toFixed(3)+')');
  if(warm>0) parts.push('sepia('+Math.min(0.4,warm/120).toFixed(3)+')');
  else if(warm<0) parts.push('hue-rotate('+Math.round(warm*0.35)+'deg)');
  if(smooth>0) parts.push('blur('+(smooth*0.18).toFixed(2)+'px)');
  if(sharp>0) parts.push('contrast('+(1+sharp/300).toFixed(3)+')');
  cv.style.filter=parts.length?parts.join(' '):'';
}
function resetAll(){
  document.querySelectorAll('.pb').forEach(b=>b.classList.remove('on'));
  document.querySelector('.pb[data-name="off"]').classList.add('on');
  setSliders(0,0,0,0,0,0);
}
const presets={
  off:[0,0,0,0,0,0], natural:[15,5,10,15,2,10], glow:[35,-15,5,20,4,0],
  vivid:[5,40,70,0,1,20], mono:[0,20,-100,0,1,5], warm:[10,10,20,60,2,5], cool:[5,10,10,-60,2,5]
};
function preset(name,btn){
  document.querySelectorAll('.pb').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  const [b,c,s,w,k,sh]=presets[name]; setSliders(b,c,s,w,k,sh);
}

async function listCameras(){
  try{
    const devices=await navigator.mediaDevices.enumerateDevices();
    const cams=devices.filter(d=>d.kind==='videoinput');
    const sel=document.getElementById('cam-sel'); sel.innerHTML='';
    cams.forEach((cam,i)=>{ const o=document.createElement('option'); o.value=cam.deviceId; o.textContent=cam.label||(t('camLabel')+(i+1)); sel.appendChild(o); });
    document.getElementById('cam-row').classList.toggle('on', cams.length>1);
  }catch(e){}
}

async function startCam(){
  try{
    const deviceId=document.getElementById('cam-sel').value;
    const constraints={ video:{ width:{ideal:1920}, height:{ideal:1080}, facingMode:'user', ...(deviceId?{deviceId:{exact:deviceId}}:{}) }, audio:false };
    stream=await navigator.mediaDevices.getUserMedia(constraints);
    vid.srcObject=stream; await vid.play();
    await listCameras();
    document.getElementById('ph').style.display='none';
    cv.style.display='block';
    document.getElementById('bs').style.display='none';
    document.getElementById('bx').style.display='';
    ['bf','bmode','bbooth','bsnap'].forEach(id=>document.getElementById(id).disabled=false);
    document.getElementById('timer-btns').classList.add('on');
    document.getElementById('rec').classList.add('on');
    camRatio=(vid.videoWidth||4)/(vid.videoHeight||3); applyMode();
    updateFlipBtn(); updateCSSFilter(); loop();
  }catch(e){ toast(t('camError')+e.message, 3600); }
}
async function switchCam(){ if(!stream) return; stopStream(); await startCam(); }
function stopStream(){
  if(stream) stream.getTracks().forEach(t=>t.stop());
  stream=null; cancelAnimationFrame(raf);
  if(timerRaf){ clearTimeout(timerRaf); timerRaf=null; }
}
function stopCam(){
  stopStream();
  cv.style.display='none';
  document.getElementById('ph').style.display='flex';
  document.getElementById('bs').style.display='';
  document.getElementById('bx').style.display='none';
  document.getElementById('cam-row').classList.remove('on');
  document.getElementById('timer-btns').classList.remove('on');
  document.getElementById('rec').classList.remove('on');
  ['bf','bmode','bbooth','bsnap'].forEach(id=>document.getElementById(id).disabled=true);
  document.getElementById('countdown').style.display='none';
}
window.addEventListener('beforeunload', stopStream);

function toggleFlip(){ flipped=!flipped; updateFlipBtn(); }
function updateFlipBtn(){ document.getElementById('bf').classList.toggle('on', flipped); }

const MODE_ORDER=['auto','portrait','square'];
function getModeLabel(m){ return m==='auto'?t('modeAuto'):m==='portrait'?t('modePortrait'):t('modeSquare'); }
function cycleMode(){ mode=MODE_ORDER[(MODE_ORDER.indexOf(mode)+1)%MODE_ORDER.length]; applyMode(); }
function applyMode(){
  const vf=document.getElementById('viewfinder');
  vf.dataset.mode=mode; document.getElementById('bmode-lbl').textContent=getModeLabel(mode);
  if(mode==='auto') vf.style.setProperty('--vf-ratio', camRatio);
  else if(mode==='portrait') vf.style.setProperty('--vf-ratio','9/16');
  else vf.style.setProperty('--vf-ratio','1/1');
}

function loop(){
  if(!stream) return;
  const vw=vid.videoWidth||640, vh=vid.videoHeight||480;
  const nr=vw/vh;
  if(Math.abs(nr-camRatio)>0.001){ camRatio=nr; if(mode==='auto') document.getElementById('viewfinder').style.setProperty('--vf-ratio', camRatio); }
  let target=camRatio; if(mode==='portrait') target=9/16; else if(mode==='square') target=1;
  let sx=0,sy=0,sw=vw,sh=vh; const sr=vw/vh;
  if(sr>target){ sw=Math.round(vh*target); sx=Math.round((vw-sw)/2); }
  else if(sr<target){ sh=Math.round(vw/target); sy=Math.round((vh-sh)/2); }
  if(cv.width!==sw||cv.height!==sh){ cv.width=sw; cv.height=sh; }
  ctx.save();
  if(flipped){ ctx.translate(sw,0); ctx.scale(-1,1); }
  ctx.drawImage(vid, sx,sy,sw,sh, 0,0,sw,sh);
  ctx.restore();
  raf=requestAnimationFrame(loop);
}
function clamp(v){ return v<0?0:v>255?255:v; }
function processPixels(w,h){
  const bright=gv('fb'),contrast=gv('fc'),sat=gv('fs'),warm=gv('fw'),smooth=gv('fk'),sharp=gv('fsh');
  if(bright===0&&contrast===0&&sat===0&&warm===0&&smooth===0&&sharp===0) return;
  const imgd=ctx.getImageData(0,0,w,h), d=imgd.data;
  const cF=(259*(contrast+255))/(255*(259-contrast)), sF=(sat+100)/100;
  for(let i=0;i<d.length;i+=4){
    let r=d[i],g=d[i+1],b=d[i+2];
    r=clamp(r+bright);g=clamp(g+bright);b=clamp(b+bright);
    r=clamp(cF*(r-128)+128);g=clamp(cF*(g-128)+128);b=clamp(cF*(b-128)+128);
    const gray=0.299*r+0.587*g+0.114*b;
    r=clamp(gray+(r-gray)*sF);g=clamp(gray+(g-gray)*sF);b=clamp(gray+(b-gray)*sF);
    r=clamp(r+warm*1.2);b=clamp(b-warm*1.0);
    d[i]=r;d[i+1]=g;d[i+2]=b;
  }
  if(smooth>0) boxBlur(d,w,h,smooth);
  if(sharp>0){
    const bl=new Uint8ClampedArray(d.length); for(let i=0;i<d.length;i++) bl[i]=d[i];
    boxBlur(bl,w,h,1); const amt=sharp/50;
    for(let i=0;i<d.length;i+=4){
      d[i]=clamp(d[i]+amt*(d[i]-bl[i]));
      d[i+1]=clamp(d[i+1]+amt*(d[i+1]-bl[i+1]));
      d[i+2]=clamp(d[i+2]+amt*(d[i+2]-bl[i+2]));
    }
  }
  ctx.putImageData(imgd,0,0);
}
function boxBlur(d,w,h,r){
  const tmp=new Uint8ClampedArray(d.length);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    let sr=0,sg=0,sb=0,cnt=0;
    for(let dx=-r;dx<=r;dx++){ const nx=x+dx; if(nx>=0&&nx<w){ const idx=(y*w+nx)*4; sr+=d[idx];sg+=d[idx+1];sb+=d[idx+2];cnt++; } }
    const i=(y*w+x)*4; tmp[i]=sr/cnt;tmp[i+1]=sg/cnt;tmp[i+2]=sb/cnt;tmp[i+3]=d[i+3];
  }
  for(let i=0;i<d.length;i++) d[i]=tmp[i];
}
function applyFiltersToCanvas(canvas){
  const w=canvas.width, h=canvas.height, c=canvas.getContext('2d');
  const bright=gv('fb'),contrast=gv('fc'),sat=gv('fs'),warm=gv('fw'),smooth=gv('fk'),sharp=gv('fsh');
  if(bright===0&&contrast===0&&sat===0&&warm===0&&smooth===0&&sharp===0) return;
  const imgd=c.getImageData(0,0,w,h), d=imgd.data;
  const cF=(259*(contrast+255))/(255*(259-contrast)), sF=(sat+100)/100;
  for(let i=0;i<d.length;i+=4){
    let r=d[i],g=d[i+1],b=d[i+2];
    r=clamp(r+bright);g=clamp(g+bright);b=clamp(b+bright);
    r=clamp(cF*(r-128)+128);g=clamp(cF*(g-128)+128);b=clamp(cF*(b-128)+128);
    const gray=0.299*r+0.587*g+0.114*b;
    r=clamp(gray+(r-gray)*sF);g=clamp(gray+(g-gray)*sF);b=clamp(gray+(b-gray)*sF);
    r=clamp(r+warm*1.2);b=clamp(b-warm*1.0);
    d[i]=r;d[i+1]=g;d[i+2]=b;
  }
  if(smooth>0) boxBlur(d,w,h,smooth);
  if(sharp>0){
    const bl=new Uint8ClampedArray(d.length); for(let i=0;i<d.length;i++) bl[i]=d[i];
    boxBlur(bl,w,h,1); const amt=sharp/50;
    for(let i=0;i<d.length;i+=4){
      d[i]=clamp(d[i]+amt*(d[i]-bl[i]));
      d[i+1]=clamp(d[i+1]+amt*(d[i+1]-bl[i+1]));
      d[i+2]=clamp(d[i+2]+amt*(d[i+2]-bl[i+2]));
    }
  }
  c.putImageData(imgd,0,0);
}

/* ═══════════════════ Snapshot ═══════════════════ */
function snap(){
  const sc=document.getElementById('sc');
  sc.width=cv.width; sc.height=cv.height;
  sc.getContext('2d').drawImage(cv,0,0);
  applyFiltersToCanvas(sc);
  document.getElementById('snapbox').classList.add('on');
  const n=new Date(), p=x=>String(x).padStart(2,'0');
  document.getElementById('snap-when').textContent=`${n.getFullYear()}.${p(n.getMonth()+1)}.${p(n.getDate())} ${p(n.getHours())}:${p(n.getMinutes())}`;
  resetEnhanceBtn(document.getElementById('snap-enh'));
}
function timedSnap(sec){
  if(!stream) return;
  const cd=document.getElementById('countdown'); let rem=sec;
  cd.style.display='block'; cd.textContent=rem;
  function tick(){
    rem--;
    if(rem<=0){ cd.style.display='none'; fireFlash(); snap(); }
    else { cd.textContent=rem; timerRaf=setTimeout(tick,1000); }
  }
  timerRaf=setTimeout(tick,1000);
}
function fireFlash(){ const f=document.getElementById('flash'); f.classList.remove('fire'); void f.offsetWidth; f.classList.add('fire'); }

/* ═══════════════════ photobooth ═══════════════════ */
let boothShots=[], boothFrame='silver', boothBusy=false;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function countdown(n){
  return new Promise(res=>{
    const cd=document.getElementById('countdown'); cd.style.display='block'; cd.textContent=n;
    const t=setInterval(()=>{ n--; if(n<=0){ clearInterval(t); cd.style.display='none'; res(); } else cd.textContent=n; },1000);
  });
}
function cellSnapshot(){ const c=document.createElement('canvas'); c.width=cv.width; c.height=cv.height; c.getContext('2d').drawImage(cv,0,0); applyFiltersToCanvas(c); return c; }
async function startBooth(){
  if(!stream||boothBusy) return; boothBusy=true;
  boothShots=[];
  const prog=document.getElementById('booth-progress'); prog.style.display='block';
  for(let i=1;i<=4;i++){
    prog.textContent=`CUT ${i} / 4`;
    await countdown(3);
    fireFlash(); boothShots.push(cellSnapshot());
    if(i<4) await wait(900);
  }
  prog.style.display='none'; boothBusy=false;
  await renderStrip(); openBooth();
}
function startBoothAgain(){ closeBooth(); setTimeout(startBooth, 350); }
function openBooth(){ document.getElementById('booth-modal').classList.add('on'); }
function closeBooth(){ document.getElementById('booth-modal').classList.remove('on'); }
function pickFrame(f,btn){
  boothFrame=f;
  document.querySelectorAll('.fsw').forEach(b=>b.classList.remove('on')); btn.classList.add('on');
  renderStrip(); resetEnhanceBtn(document.getElementById('strip-enh'));
}
const FRAMES={
  silver:{bg:['#f3f5fa','#cdd3de','#a7aebd'], ink:'#2a2f3a', sub:'#6b7180'},
  holo:{bg:['#ffd1e8','#cdbcff','#bfeaff','#c6ffe0','#fff3bf'], ink:'#3a2f4a', sub:'#6a5a7a'},
  onyx:{bg:['#2a2e3a','#15171f','#0b0c10'], ink:'#f1f3fa', sub:'#9aa0ad'}
};
function roundRectPath(c,x,y,w,h,r){ c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
function drawCover(c,img,x,y,w,h){
  const ir=img.width/img.height, r=w/h; let sw,sh,sx,sy;
  if(ir>r){ sh=img.height; sw=sh*r; sx=(img.width-sw)/2; sy=0; } else { sw=img.width; sh=sw/r; sx=0; sy=(img.height-sh)/2; }
  c.drawImage(img,sx,sy,sw,sh,x,y,w,h);
}
async function renderStrip(){
  if(!boothShots.length) return;
  await (document.fonts?document.fonts.ready:Promise.resolve());
  const F=FRAMES[boothFrame], S=2;
  const W=520, pad=30, gap=16, header=70, footer=84;
  const cellW=W-pad*2;
  const ref=boothShots[0]; const cellH=Math.round(cellW*(ref.height/ref.width));
  const H=pad+header+4*cellH+3*gap+footer;
  const strip=document.getElementById('strip');
  strip.width=W*S; strip.height=H*S;
  const c=strip.getContext('2d'); c.scale(S,S);
  // background
  const g=c.createLinearGradient(0,0,W,H); const stops=F.bg;
  stops.forEach((col,i)=>g.addColorStop(i/(stops.length-1), col));
  c.fillStyle=g; c.fillRect(0,0,W,H);
  // subtle sheen
  const sh=c.createLinearGradient(0,0,W,0); sh.addColorStop(0,'rgba(255,255,255,.25)'); sh.addColorStop(.5,'rgba(255,255,255,0)'); sh.addColorStop(1,'rgba(255,255,255,.18)');
  c.fillStyle=sh; c.fillRect(0,0,W,H);
  // header
  c.textAlign='center'; c.fillStyle=F.ink;
  c.font='700 26px "Chakra Petch", system-ui'; c.fillText('CompyMirror', W/2, pad+30);
  c.fillStyle=F.sub; c.font='500 11px "Chakra Petch", system-ui';
  c.fillText('L I F E   F O U R   C U T S', W/2, pad+50);
  // cells
  let y=pad+header;
  for(let i=0;i<4;i++){
    const x=pad;
    c.save(); roundRectPath(c,x,y,cellW,cellH,10); c.clip();
    if(boothShots[i]) drawCover(c, boothShots[i], x,y,cellW,cellH);
    c.restore();
    c.strokeStyle='rgba(0,0,0,.12)'; c.lineWidth=1; roundRectPath(c,x+.5,y+.5,cellW-1,cellH-1,10); c.stroke();
    y+=cellH+gap;
  }
  // footer
  const n=new Date(), p=x=>String(x).padStart(2,'0');
  c.textAlign='center'; c.fillStyle=F.ink; c.font='600 15px "Chakra Petch", system-ui';
  c.fillText(`${n.getFullYear()}. ${p(n.getMonth()+1)}. ${p(n.getDate())}`, W/2, H-footer+44);
  c.fillStyle=F.sub; c.font='500 11px "Chakra Petch", system-ui';
  c.fillText('\u27E1  shot locally  \u27E1', W/2, H-footer+64);
}

/* ═══════════════════ Share / download ═══════════════════ */
function canvasToBlob(canvas){ return new Promise(res=>canvas.toBlob(res,'image/png')); }
async function shareCanvas(canvas, filename, text){
  const blob=await canvasToBlob(canvas);
  if(!blob){ toast(t('imgFail')); return; }
  const file=new File([blob], filename+'.png', {type:'image/png'});
  if(navigator.canShare && navigator.canShare({files:[file]})){
    try{ await navigator.share({files:[file], text:text||'CompyMirror'}); return; }
    catch(e){ if(e.name==='AbortError') return; }
  }
  try{
    await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);
    toast(t('imgCopied'), 3200);
  }catch(e){
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename+'.png'; a.click();
    toast(t('noShareFallback'), 3200);
  }
}
function shareSnap(kind){
  const txt = kind==='story' ? t('shareStory') : kind==='kakao' ? t('shareKakao') : 'CompyMirror';
  shareCanvas(document.getElementById('sc'), 'compymirror_'+Date.now(), txt);
}
function downloadCanvas(canvas, name){
  const a=document.createElement('a'); a.download=name+'_'+Date.now()+'.png'; a.href=canvas.toDataURL('image/png'); a.click();
  toast(t('saved'));
}

/* ═══════════════════ Enhance (AI with local fallback) ═══════════════════ */
function resetEnhanceBtn(btn){
  if(!btn) return;
  delete btn.dataset.done; btn.disabled=false;
  btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/></svg> '+t('enhance');
}
function withTimeout(p,ms){ return Promise.race([p, new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),ms))]); }
function dataUrlToCanvas(url){
  return new Promise((res,rej)=>{ const img=new Image(); img.onload=()=>{ const c=document.createElement('canvas'); c.width=img.naturalWidth; c.height=img.naturalHeight; c.getContext('2d').drawImage(img,0,0); res(c); }; img.onerror=rej; img.src=url; });
}
/* A -- in-browser AI super-resolution (UpscalerJS / ESRGAN, WebGPU when available) */
async function aiUpscale(canvas){
  const mod=await import('https://esm.sh/upscaler@1.0.0-beta.19?bundle');
  const Upscaler=mod.default||mod.Upscaler||mod;
  const up=new Upscaler();
  const out=await up.upscale(canvas.toDataURL('image/png'), {output:'base64'});
  return await dataUrlToCanvas(out);
}
/* B -- local detail enhancement: 2x resample + unsharp mask + mild contrast */
function localEnhance(src){
  const S=2, w=src.width, h=src.height;
  const out=document.createElement('canvas'); out.width=w*S; out.height=h*S;
  const o=out.getContext('2d'); o.imageSmoothingEnabled=true; o.imageSmoothingQuality='high';
  o.drawImage(src,0,0,out.width,out.height);
  const id=o.getImageData(0,0,out.width,out.height), d=id.data;
  const bl=new Uint8ClampedArray(d); boxBlur(bl,out.width,out.height,2);
  const amt=0.9;
  for(let i=0;i<d.length;i+=4){
    for(let k=0;k<3;k++){
      let v=d[i+k]+amt*(d[i+k]-bl[i+k]);
      v=(v-128)*1.07+128;
      d[i+k]=v<0?0:v>255?255:v;
    }
  }
  o.putImageData(id,0,0);
  return out;
}
async function enhance(canvas, btn){
  if(btn.dataset.done||btn.disabled) return;
  btn.disabled=true; btn.innerHTML=t('enhancingSpinner');
  toast(t('enhancing'), 4000);
  let result=null, method='';
  try{
    result=await withTimeout(aiUpscale(canvas), 28000); method='AI';
  }catch(e){
    try{ result=localEnhance(canvas); method='B'; }catch(e2){ result=null; }
  }
  if(!result){ resetEnhanceBtn(btn); toast(t('enhanceFail')); return; }
  canvas.width=result.width; canvas.height=result.height;
  canvas.getContext('2d').drawImage(result,0,0);
  btn.dataset.done='1'; btn.disabled=false; btn.innerHTML=t('enhanceDone');
  toast(method==='AI' ? t('enhanceAIDone') : t('enhanceLocalDone'), 3400);
}

/* ═══════════════════ first-run coachmark tour ═══════════════════ */
const GUIDE_KEY='compymirror_guide_seen';
function getTourSteps(){ return [
  { sel:'#bs', place:'bottom', title:t('tourStep1Title'), body:t('tourStep1Body') },
  { sel:'#bmode', place:'bottom', title:t('tourStep2Title'), body:t('tourStep2Body') },
  { sel:'#bbooth', place:'bottom', title:t('tourStep3Title'), body:t('tourStep3Body') },
  { sel:'#bsnap', place:'bottom', title:t('tourStep4Title'), body:t('tourStep4Body') },
  { sel:'.presets', place:'left', title:t('tourStep5Title'), body:t('tourStep5Body') }
]; }
let tourIdx=0;
const tourEl=document.getElementById('tour');
const spotEl=document.getElementById('spot');
const tipEl=document.getElementById('tour-tip');

function buildDots(){
  const d=document.getElementById('tip-dots'); d.innerHTML='';
  getTourSteps().forEach((_,i)=>{ const s=document.createElement('span'); if(i===tourIdx) s.className='on'; d.appendChild(s); });
}
function startTour(){
  tourIdx=0;
  document.body.classList.add('tour-live');
  document.getElementById('tip-total').textContent=String(getTourSteps().length).padStart(2,'0');
  tourEl.classList.add('on'); tourEl.setAttribute('aria-hidden','false');
  buildDots();
  setTimeout(()=>showStep(0), 30);
}
function endTour(){
  tourEl.classList.remove('on'); tourEl.setAttribute('aria-hidden','true');
  document.body.classList.remove('tour-live');
  try{ localStorage.setItem(GUIDE_KEY,'1'); }catch(e){}
}
function tourNext(){ if(tourIdx>=getTourSteps().length-1){ endTour(); return; } showStep(tourIdx+1); }
function tourPrev(){ if(tourIdx>0) showStep(tourIdx-1); }
// `?` button entry point
function openGuide(){ startTour(); }

function scrollToTarget(el){
  const r=el.getBoundingClientRect();
  const absCenter=r.top+window.scrollY+r.height/2;
  const want=innerHeight*0.36;            // park target in the upper band, clear of the fixed card
  window.scrollTo({top:Math.max(0, absCenter-want), behavior:'auto'});
}
function placeStep(){
  // only the spotlight moves -- the tooltip card stays pinned bottom-center
  const step=getTourSteps()[tourIdx];
  const el=document.querySelector(step.sel);
  if(!el){ return; }
  const r=el.getBoundingClientRect();
  const pad=8;
  spotEl.style.left=(r.left-pad)+'px';
  spotEl.style.top=(r.top-pad)+'px';
  spotEl.style.width=(r.width+pad*2)+'px';
  spotEl.style.height=(r.height+pad*2)+'px';
}
function showStep(i){
  tourIdx=i;
  const step=getTourSteps()[i];
  document.getElementById('tip-n').textContent=String(i+1).padStart(2,'0');
  document.getElementById('tip-title').textContent=step.title;
  document.getElementById('tip-body').innerHTML=step.body;
  document.getElementById('tip-prev').hidden = (i===0);
  document.getElementById('tip-next').textContent = (i===getTourSteps().length-1) ? t('tourStart') : t('tourNext');
  buildDots();
  const el=document.querySelector(step.sel);
  if(el) scrollToTarget(el);
  setTimeout(placeStep, 40);
}
// keep aligned on resize/scroll while active
let realignT=null;
['resize','scroll'].forEach(ev=>window.addEventListener(ev,()=>{
  if(!tourEl.classList.contains('on')) return;
  clearTimeout(realignT); realignT=setTimeout(placeStep,60);
},{passive:true}));
document.addEventListener('keydown',(e)=>{
  if(!tourEl.classList.contains('on')) return;
  if(e.key==='Escape') endTour();
  else if(e.key==='ArrowRight') tourNext();
  else if(e.key==='ArrowLeft') tourPrev();
});
// guide only opens when user clicks ?  (auto-show removed)

/* ═══════════════════ init ═══════════════════ */
initI18n();
['bf','bmode','bbooth','bsnap'].forEach(id=>document.getElementById(id).disabled=true);
loadFilters();
paintChips();
navigator.mediaDevices?.enumerateDevices?.().then(listCameras).catch(()=>{});

/* -- Feedback + Donate modals ---------------------------------------- */
function openFeedback(){  document.getElementById('feedback-modal').classList.add('on'); }
function closeFeedback(){ document.getElementById('feedback-modal').classList.remove('on'); }
function openDonate(){    document.getElementById('donate-modal').classList.add('on'); }
function closeDonate(){   document.getElementById('donate-modal').classList.remove('on'); }
document.addEventListener('keydown',(e)=>{
  if(e.key==='Escape'){
    closeFeedback(); closeDonate();
  }
});

/* ═══════════════════ Event bindings (MV3 CSP compliant) ═══════════════════ */
function bindEvents(){

  /* -- Language buttons ------------------------------------------------- */
  document.querySelectorAll('.lang-btn').forEach(btn=>{
    btn.addEventListener('click', ()=> setLang(btn.dataset.lang));
  });

  /* -- Help / guide button ---------------------------------------------- */
  document.querySelector('.help-btn').addEventListener('click', openGuide);

  /* -- Camera control buttons (by ID) ----------------------------------- */
  document.getElementById('bs').addEventListener('click', startCam);
  document.getElementById('bx').addEventListener('click', stopCam);
  document.getElementById('bf').addEventListener('click', toggleFlip);
  document.getElementById('bmode').addEventListener('click', cycleMode);
  document.getElementById('bbooth').addEventListener('click', startBooth);
  document.getElementById('bsnap').addEventListener('click', snap);

  /* -- Camera select ---------------------------------------------------- */
  document.getElementById('cam-sel').addEventListener('change', switchCam);

  /* -- Timer buttons ---------------------------------------------------- */
  document.querySelectorAll('#timer-btns .tb').forEach(btn=>{
    const sec = parseInt(btn.textContent, 10);
    btn.addEventListener('click', ()=> timedSnap(sec));
  });

  /* -- Snap share / action buttons (#snapbox .snap-actions) ------------- */
  const snapActions = document.querySelector('#snapbox .snap-actions');
  if(snapActions){
    const snapBtns = snapActions.querySelectorAll('button');
    // snapBtns[0] = Instagram share (.ig)
    // snapBtns[1] = KakaoTalk share (.kakao)
    // snapBtns[2] = generic share
    // snapBtns[3] = snap-enh (has ID, bound separately)
    // snapBtns[4] = download
    if(snapBtns[0]) snapBtns[0].addEventListener('click', ()=> shareSnap('story'));
    if(snapBtns[1]) snapBtns[1].addEventListener('click', ()=> shareSnap('kakao'));
    if(snapBtns[2]) snapBtns[2].addEventListener('click', ()=> shareSnap());
    // snapBtns[3] is #snap-enh, bound below by ID
    if(snapBtns[4]) snapBtns[4].addEventListener('click', ()=> downloadCanvas(document.getElementById('sc'),'compymirror'));
  }

  /* -- Snap enhance button ---------------------------------------------- */
  document.getElementById('snap-enh').addEventListener('click', function(){
    enhance(document.getElementById('sc'), this);
  });

  /* -- Preset buttons --------------------------------------------------- */
  document.querySelectorAll('.pb').forEach(btn=>{
    btn.addEventListener('click', ()=> preset(btn.dataset.name, btn));
  });

  /* -- Adjustment sliders (input event) --------------------------------- */
  const sliderMap = {fb:'vb', fc:'vc', fs:'vs', fw:'vw', fk:'vk', fsh:'vsh'};
  Object.entries(sliderMap).forEach(([sid, vid2])=>{
    document.getElementById(sid).addEventListener('input', ()=> sv(sid, vid2));
  });

  /* -- Reset All button ------------------------------------------------- */
  document.querySelector('.panel-foot .linkbtn').addEventListener('click', resetAll);

  /* -- Footer: Feedback & Donate buttons -------------------------------- */
  const footRight = document.querySelector('.foot-right');
  if(footRight){
    const footBtns = footRight.querySelectorAll('button');
    // footBtns[0] = Feedback, footBtns[1] = Donate
    if(footBtns[0]) footBtns[0].addEventListener('click', openFeedback);
    if(footBtns[1]) footBtns[1].addEventListener('click', openDonate);
  }

  /* -- Tour: Skip, Prev, Next ------------------------------------------ */
  document.querySelector('.tip-skip').addEventListener('click', endTour);
  document.getElementById('tip-prev').addEventListener('click', tourPrev);
  document.getElementById('tip-next').addEventListener('click', tourNext);

  /* -- Booth modal: close button ---------------------------------------- */
  document.querySelector('#booth-modal .x').addEventListener('click', closeBooth);

  /* -- Frame picker buttons --------------------------------------------- */
  document.querySelectorAll('.fsw').forEach(btn=>{
    btn.addEventListener('click', ()=> pickFrame(btn.dataset.f, btn));
  });

  /* -- Booth modal footer buttons --------------------------------------- */
  const boothFt = document.querySelector('#booth-modal .modal-ft');
  if(boothFt){
    const boothBtns = boothFt.querySelectorAll('button');
    // boothBtns[0] = retake
    // boothBtns[1] = strip-enh (has ID, bound separately)
    // boothBtns[2] = share strip
    // boothBtns[3] = save strip
    if(boothBtns[0]) boothBtns[0].addEventListener('click', startBoothAgain);
    // boothBtns[1] is #strip-enh, bound below by ID
    if(boothBtns[2]) boothBtns[2].addEventListener('click', ()=> shareCanvas(document.getElementById('strip'),'compymirror_4cut','CompyMirror Photo Booth'));
    if(boothBtns[3]) boothBtns[3].addEventListener('click', ()=> downloadCanvas(document.getElementById('strip'),'compymirror_4cut'));
  }

  /* -- Strip enhance button --------------------------------------------- */
  document.getElementById('strip-enh').addEventListener('click', function(){
    enhance(document.getElementById('strip'), this);
  });

  /* -- Feedback modal: backdrop + close button -------------------------- */
  document.getElementById('feedback-modal').addEventListener('click', function(event){
    if(event.target===this) closeFeedback();
  });
  document.querySelector('#feedback-modal .x').addEventListener('click', closeFeedback);

  /* -- Donate modal: backdrop + close button ---------------------------- */
  document.getElementById('donate-modal').addEventListener('click', function(event){
    if(event.target===this) closeDonate();
  });
  document.querySelector('#donate-modal .x').addEventListener('click', closeDonate);

  /* -- Tweaks close button ---------------------------------------------- */
  document.querySelector('.tw-close').addEventListener('click', closeTweaks);
}

/* ═══════════════════ Attach all event listeners ═══════════════════ */
bindEvents();
