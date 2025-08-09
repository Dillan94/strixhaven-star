document.addEventListener('DOMContentLoaded', () => {
    // Headline ink reveal
    const head = document.querySelector('.headline');
    if (head) head.classList.add('reveal');

    // Floating motes, respect reduced motion
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const n = 18;
        for (let i = 0; i < n; i++) {
            const d = document.createElement('div');
            d.className = 'mote';
            d.style.left = Math.random() * 100 + 'vw';
            d.style.top = 20 + Math.random() * 80 + 'vh';
            d.style.animationDelay = (-Math.random() * 14) + 's';
            d.style.transform = `scale(${0.6 + Math.random() * 0.9})`;
            document.body.appendChild(d);
        }
    }

    // Enable subtle living photo loop on all framed photos
    document.querySelectorAll('.photo-placeholder').forEach(p => p.classList.add('living'));

    // Auto-insert rune corners on each photo frame (idempotent)
    document.querySelectorAll('.photo-placeholder').forEach(p => {
      if (p.querySelector('.runes')) return;
      const box = document.createElement('div');
      box.className = 'runes';
      box.innerHTML = '<span class="tl">✧</span><span class="tr">✧</span><span class="bl">✧</span><span class="br">✧</span>';
      p.appendChild(box);
    });

    // Hidden Ink trigger
    const header = document.querySelector('.header');
    const ink = document.getElementById('hidden-ink');
    if (header && ink) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'hidden-ink-trigger';
        btn.setAttribute('aria-controls', 'hidden-ink');
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = 'Reveal Hidden Ink';

        // Slight random nudge so it feels "hard to find" but still discoverable
        const dx = Math.floor(Math.random() * 24) - 12;
        const dy = Math.floor(Math.random() * 10);
        btn.style.right = 12 + dx + 'px';
        btn.style.top = 8 + dy + 'px';

        btn.addEventListener('click', () => {
            const isHidden = ink.hasAttribute('hidden');
            if (isHidden) {
                ink.removeAttribute('hidden');
                btn.setAttribute('aria-expanded', 'true');
                btn.textContent = 'Hide Hidden Ink';
                ink.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                ink.setAttribute('hidden', '');
                btn.setAttribute('aria-expanded', 'false');
                btn.textContent = 'Reveal Hidden Ink';
            }
        });

        header.appendChild(btn);
    }
    // === Glossary tooltips ===
    const onTooltipOver = e => {
      const t = e.target.closest('[data-glossary]');
      if (!t) return;
      const tip = document.createElement('div');
      tip.className = 'gloss';
      // Minimal inline styles so it works even without CSS
      tip.style.position = 'absolute';
      tip.style.zIndex = '1000';
      tip.style.display = 'none';
      tip.style.background = '#F8F5DE';
      tip.style.border = '1px solid #8B4513';
      tip.style.padding = '8px 10px';
      tip.style.fontSize = '12px';
      tip.style.maxWidth = '260px';
      tip.style.lineHeight = '1.4';
      tip.style.boxShadow = '2px 2px 8px rgba(0,0,0,.2)';
      tip.textContent = t.getAttribute('data-glossary');
      document.body.appendChild(tip);
      const r = t.getBoundingClientRect();
      const left = Math.min(window.scrollX + r.left, window.scrollX + window.innerWidth - tip.offsetWidth - 10);
      const top = window.scrollY + r.bottom + 6;
      tip.style.left = left + 'px';
      tip.style.top = top + 'px';
      tip.style.display = 'block';
      const hide = () => tip.remove();
      t.addEventListener('mouseleave', hide, { once: true });
      t.addEventListener('blur', hide, { once: true });
    };
    document.addEventListener('mouseover', onTooltipOver);
    document.addEventListener('focusin', onTooltipOver);

    // === Hidden Ink single-trigger with hint and sparkle ===
    const notes = Array.from(document.querySelectorAll('[data-ink-note]'));
    // Prefer an explicit trigger, else take the first hotspot
    const spot = document.querySelector('[data-ink="trigger"]') || document.querySelector('.ink-hotspot');
    if (notes.length && spot) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      spot.setAttribute('tabindex','0');
      spot.setAttribute('role','button');
      spot.setAttribute('aria-label','Reveal hidden ink');

      // Subtle discovery hint (skip if reduced motion)
      if (!reduced) {
        spot.classList.add('ink-hint');
        // Tiny periodic nudge
        const nudge = () => {
          spot.classList.add('ink-nudge');
          setTimeout(() => spot.classList.remove('ink-nudge'), 350);
        };
        var nudgeTimer = setInterval(nudge, 7000 + Math.floor(Math.random()*5000));
      }

      // Sparkle and page flash effects
      function sparkleAt(target){
        if (reduced) return;
        const rect = target.getBoundingClientRect();
        const cx = rect.left + rect.width/2;
        const cy = rect.top + rect.height/2;
        // brief ring ping
        target.classList.add('ink-ping');
        setTimeout(()=>target.classList.remove('ink-ping'), 750);
        // sparkle burst
        for (let i=0; i<12; i++){
          const s = document.createElement('div');
          s.className = 'sparkle';
          const angle = Math.random()*Math.PI*2;
          const dist = 16 + Math.random()*22;
          s.style.setProperty('--dx', Math.cos(angle)*dist + 'px');
          s.style.setProperty('--dy', Math.sin(angle)*dist + 'px');
          s.style.left = cx + 'px';
          s.style.top = cy + 'px';
          s.style.animationDelay = (Math.random()*60) + 'ms';
          document.body.appendChild(s);
          setTimeout(() => s.remove(), 900);
        }
      }
      function pageFlash(){
        if (reduced) return;
        const o = document.createElement('div');
        o.style.position = 'fixed';
        o.style.inset = '0';
        o.style.pointerEvents = 'none';
        o.style.background = 'radial-gradient(circle at 50% 50%, rgba(218,165,32,0.18), rgba(218,165,32,0) 60%)';
        o.style.opacity = '0.45';
        o.style.transition = 'opacity 520ms ease-out';
        document.body.appendChild(o);
        // allow paint, then fade
        requestAnimationFrame(() => {
          o.style.opacity = '0';
        });
        setTimeout(() => o.remove(), 560);
      }

      let revealed = false;
      function revealAll(){
        if (revealed) return;
        revealed = true;

        notes.forEach(n => n.removeAttribute('hidden'));
        spot.classList.remove('ink-hint');
        spot.classList.add('ink-found');

        if (typeof nudgeTimer !== 'undefined') clearInterval(nudgeTimer);

        sparkleAt(spot);
        pageFlash();
      }

      spot.addEventListener('click', e => { e.preventDefault(); revealAll(); }, { once:true });
      spot.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); revealAll(); }
      }, { once:true });
    }
});