/* ═══════════════════════════════════════════════════════════════════════
   CompyMirror — Micro-interactions (v8)
   loads AFTER the main inline script, so it can wrap existing globals.
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1 · specular sheen follows the pointer across metal buttons ──────── */
  const SHEEN = '.btn, .help-btn';
  document.addEventListener('pointermove', (e)=>{
    const el = e.target.closest && e.target.closest(SHEEN);
    if(!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', ((e.clientX - r.left)/r.width*100).toFixed(1)+'%');
    el.style.setProperty('--my', ((e.clientY - r.top)/r.height*100).toFixed(1)+'%');
  }, {passive:true});

  /* ── 2 · magnetic pull on the hero buttons ────────────────────────────── */
  if(!reduce){
    const MAG = 7; // px max travel
    document.querySelectorAll('#bs, #bsnap, #bbooth').forEach(btn=>{
      btn.addEventListener('pointermove',(e)=>{
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width/2)) / (r.width/2);
        const dy = (e.clientY - (r.top + r.height/2)) / (r.height/2);
        btn.style.setProperty('--tx', (dx*MAG).toFixed(1)+'px');
        btn.style.setProperty('--ty', (dy*MAG).toFixed(1)+'px');
      });
      btn.addEventListener('pointerleave',()=>{
        btn.style.setProperty('--tx','0px'); btn.style.setProperty('--ty','0px');
      });
    });
  }

  /* ── 3 · liquid ripple on press ───────────────────────────────────────── */
  const RIPPLE = '.btn, .pb, .tb, .help-btn, .fsw, .tw-opt, .tip-skip, .linkbtn';
  document.addEventListener('pointerdown',(e)=>{
    if(reduce) return;
    const el = e.target.closest && e.target.closest(RIPPLE);
    if(!el || el.disabled) return;
    const r = el.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2.1;
    el.classList.add('rippling');
    const rip = document.createElement('span');
    rip.className = 'ripple';
    rip.style.width = rip.style.height = size+'px';
    rip.style.left = (e.clientX - r.left)+'px';
    rip.style.top  = (e.clientY - r.top)+'px';
    el.appendChild(rip);
    rip.addEventListener('animationend',()=>rip.remove());
  }, {passive:true});

  /* ── 4 · slider value bubble + drag glow ──────────────────────────────── */
  document.querySelectorAll('.row input[type=range]').forEach(rng=>{
    const row = rng.closest('.row');
    const bubble = document.createElement('div');
    bubble.className = 'val-bubble';
    row.appendChild(bubble);

    const place = ()=>{
      const min=+rng.min, max=+rng.max, v=+rng.value;
      const frac = max>min ? (v-min)/(max-min) : 0;
      const tw = 15; // thumb width
      const x = rng.offsetLeft + tw/2 + frac*(rng.offsetWidth - tw);
      bubble.style.left = x+'px';
      bubble.textContent = v>0 ? '+'+v : v;
    };
    const show = ()=>{ place(); bubble.classList.add('on'); rng.classList.add('dragging'); };
    const hide = ()=>{ bubble.classList.remove('on'); rng.classList.remove('dragging'); };

    rng.addEventListener('pointerdown', show);
    rng.addEventListener('input', ()=>{ if(bubble.classList.contains('on')) place(); });
    rng.addEventListener('focus', show);
    window.addEventListener('pointerup', hide, {passive:true});
    rng.addEventListener('blur', hide);
  });

  /* ── 5 · countdown spring-pop — re-armed on every number change ───────── */
  const cd = document.getElementById('countdown');
  if(cd){
    new MutationObserver(()=>{
      if(reduce || cd.style.display==='none') return;
      cd.classList.remove('pop'); void cd.offsetWidth; cd.classList.add('pop');
    }).observe(cd, {childList:true, characterData:true, subtree:true});
  }

  /* ── 6 · shutter recoil on the viewfinder when a frame is captured ────── */
  const vf = document.getElementById('viewfinder');
  function kick(){
    if(reduce || !vf) return;
    vf.classList.remove('shutter'); void vf.offsetWidth; vf.classList.add('shutter');
  }
  ['snap','fireFlash'].forEach(fn=>{
    if(typeof window[fn]==='function'){
      const orig = window[fn];
      window[fn] = function(){ kick(); return orig.apply(this, arguments); };
    }
  });

  /* ── 7 · preset chip spring on select ─────────────────────────────────── */
  if(typeof window.preset==='function'){
    const orig = window.preset;
    window.preset = function(name, btn){
      const r = orig.apply(this, arguments);
      if(btn && !reduce){ btn.classList.remove('justpicked'); void btn.offsetWidth; btn.classList.add('justpicked'); }
      return r;
    };
  }
})();
