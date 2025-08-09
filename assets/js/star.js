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
    // === Konami Easter Egg: Save Challenge ===
    (function(){
      // Config you change weekly
      const WEEKLY = {
        inspirationCode: 'GILDED MUFFIN',      // Tell DM this on success
      };
      const SAVES = ['Strength','Dexterity','Constitution','Intelligence','Wisdom','Charisma'];
      const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
      let idx = 0, armed = false;

      // Build modal once
      let backdrop, panel, titleEl, textEl, inputEl, submitBtn, cancelBtn, resultEl;
      function ensureModal(){
        if (backdrop) return;
        backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.setAttribute('role','dialog');
        backdrop.setAttribute('aria-modal','true');

        panel = document.createElement('div');
        panel.className = 'modal-panel';

        titleEl = document.createElement('h3');
        titleEl.className = 'modal-title';

        textEl = document.createElement('p');
        textEl.className = 'modal-text';

        inputEl = document.createElement('input');
        inputEl.type = 'number';
        inputEl.inputMode = 'numeric';
        inputEl.min = '0';
        inputEl.placeholder = 'Enter your roll';
        inputEl.className = 'modal-input';

        resultEl = document.createElement('div');
        resultEl.className = 'modal-result';
        resultEl.setAttribute('aria-live','polite');

        const actions = document.createElement('div');
        actions.className = 'modal-actions';

        submitBtn = document.createElement('button');
        submitBtn.type = 'button';
        submitBtn.className = 'btn primary';
        submitBtn.textContent = 'Submit';

        cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn';
        cancelBtn.textContent = 'Cancel';

        actions.appendChild(submitBtn);
        actions.appendChild(cancelBtn);

        panel.appendChild(titleEl);
        panel.appendChild(textEl);
        panel.appendChild(inputEl);
        panel.appendChild(resultEl);
        panel.appendChild(actions);
        backdrop.appendChild(panel);
        document.body.appendChild(backdrop);

        cancelBtn.addEventListener('click', closeModal);
        backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
        document.addEventListener('keydown', e => { if (backdrop && backdrop.classList.contains('open') && e.key === 'Escape') closeModal(); });
      }

      let current = null; // holds {save, dc}
      function openModal(){
        ensureModal();
        backdrop.classList.add('open');
        setTimeout(() => inputEl.focus(), 0);
      }
      function closeModal(){
        if (!backdrop) return;
        backdrop.classList.remove('open');
        resultEl.textContent = '';
        inputEl.value = '';
        armed = false; // require re-entry of the code
        idx = 0;
      }

      function startChallenge(){
        const save = SAVES[Math.floor(Math.random()*SAVES.length)];
        const dc = 10 + Math.floor(Math.random()*9); // 10..18
        current = { save, dc };
        titleEl.textContent = 'Magical Hazard Detected';
        textEl.innerHTML = `Roll a <strong>${save}</strong> saving throw. Enter your result below.`;
        resultEl.textContent = '';
        openModal();
      }

      function submit(){
        const val = parseInt(inputEl.value, 10);
        if (Number.isNaN(val)) { resultEl.textContent = 'Enter a number.'; return; }
        const { save, dc } = current || { save:'Unknown', dc: 15 };
        if (val >= dc) {
          resultEl.innerHTML = `Success on your <strong>${save}</strong> save. Tell your DM you have <strong>Inspiration</strong>. Code: <strong>${WEEKLY.inspirationCode}</strong>.`;
        } else {
          resultEl.innerHTML = `Failed the <strong>${save}</strong> save. Roll a <strong>D100</strong> and tell your DM your result.`;
        }
        // Lock buttons after result for this run
        submitBtn.disabled = true;
        setTimeout(() => { submitBtn.disabled = false; closeModal(); }, 7600);
      }

      // Wire submit
      document.addEventListener('keydown', e => {
        if (!backdrop || !backdrop.classList.contains('open')) return;
        if (e.key === 'Enter') { submit(); }
      });
      if (!submitBtn) ensureModal();
      submitBtn?.addEventListener('click', submit);

      // Konami detector
      document.addEventListener('keydown', e => {
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key; // normalize
        const expect = KONAMI[idx];
        if (key === expect || (expect.length === 1 && key === expect)) {
          idx += 1;
          if (idx === KONAMI.length) {
            armed = true;
            startChallenge();
          }
        } else {
          idx = (key === KONAMI[0]) ? 1 : 0; // allow immediate restart if pressing Up
        }
      });

      // Touch long-press on the hotspot triggers the challenge (mobile)
      (() => {
        const spotTouch = document.querySelector('[data-ink="trigger"]') || document.querySelector('.ink-hotspot');
        if (!spotTouch) return;
        let pressTimer, startX = 0, startY = 0;
        const start = (e) => {
          const t = e.touches?.[0]; if (!t) return;
          startX = t.clientX; startY = t.clientY;
          pressTimer = setTimeout(() => { startChallenge(); }, 900); // hold ~0.9s
        };
        const cancel = () => { if (pressTimer) clearTimeout(pressTimer); };
        const move = (e) => {
          const t = e.touches?.[0]; if (!t) return;
          const dx = Math.abs(t.clientX - startX), dy = Math.abs(t.clientY - startY);
          if (dx > 10 || dy > 10) cancel(); // moved too much, cancel
        };
        spotTouch.addEventListener('touchstart', start, { passive: true });
        spotTouch.addEventListener('touchend', cancel);
        spotTouch.addEventListener('touchcancel', cancel);
        spotTouch.addEventListener('touchmove', move, { passive: true });
      })();

      // Swipe Konami on touch: U U D D L R L R (no B/A)
      (() => {
        if (!('ontouchstart' in window) && !(navigator.maxTouchPoints > 0)) return;

        const wanted = ['U','U','D','D','L','R','L','R'];
        let seq = [];
        let startX = 0, startY = 0;

        const onStart = (e) => {
          const t = e.touches?.[0]; if (!t) return;
          startX = t.clientX; startY = t.clientY;
        };
        const onEnd = (e) => {
          const t = e.changedTouches?.[0]; if (!t) return;
          const dx = t.clientX - startX;
          const dy = t.clientY - startY;
          const ax = Math.abs(dx), ay = Math.abs(dy);
          if (ax < 24 && ay < 24) return; // too small, ignore
          const dir = ay > ax ? (dy < 0 ? 'U' : 'D') : (dx < 0 ? 'L' : 'R');
          seq.push(dir);
          if (seq.length > 8) seq = seq.slice(-8); // keep last 8
          clearTimeout(onEnd._t);
          onEnd._t = setTimeout(() => { seq = []; }, 1500); // reset if slow
          if (seq.join() === wanted.join()) {
            seq = [];
            startChallenge();
          }
        };

        document.addEventListener('touchstart', onStart, { passive: true });
        document.addEventListener('touchend', onEnd);
      })();
    })();
});