/* ==========================================================================
   MAYAN OKUL — interactions
   Hero rule: switching states only ever changes transform/opacity of the
   avatar slot and text panels (via [data-state] in CSS). Backgrounds,
   wrappers and the stage itself are NEVER toggled, faded or removed.
   ========================================================================== */
(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const rand  = (min, max) => min + Math.random() * (max - min);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ *
   *  Footer year
   * ------------------------------------------------------------------ */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------------------ *
   *  Header shadow on scroll
   * ------------------------------------------------------------------ */
  const header = $('#siteHeader');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------------ *
   *  Hero state machine
   * ------------------------------------------------------------------ */
  const hero        = $('#hero');
  const hudState    = $('#hudState');
  const countdownEl = $('#countdown');
  const stateBtns   = $$('[data-state-btn]');
  const gotoBtns    = $$('[data-goto-state]');
  const avatarTap   = $('#avatarTap');
  const avatarFx    = $('#avatarFx');

  const PANELS = {
    1: $('#state1'),
    2: $('#state2'),
  };
  const LABELS = { 1: '01 · pitch', 2: '02 · bio' };
  const FLIP_AFTER = 15; // seconds between automatic flips

  let state = 1;
  let remaining = FLIP_AFTER;
  let heroVisible = true;

  function renderCountdown() {
    if (countdownEl) countdownEl.textContent = String(remaining);
  }

  function renderState() {
    if (!hero) return;
    hero.dataset.state = String(state);

    if (hudState) hudState.textContent = LABELS[state];

    stateBtns.forEach((btn) => {
      const active = Number(btn.dataset.stateBtn) === state;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });

    for (const [n, panel] of Object.entries(PANELS)) {
      if (!panel) continue;
      const active = Number(n) === state;
      panel.classList.toggle('is-active', active);
      panel.setAttribute('aria-hidden', String(!active));
    }
  }

  function setState(next) {
    state = next === 2 ? 2 : 1;
    renderState();
    remaining = FLIP_AFTER;
    renderCountdown();
  }

  const toggleState = () => setState(state === 1 ? 2 : 1);

  /* 1-second heartbeat: countdown → automatic flip (only while hero on screen) */
  setInterval(() => {
    if (!heroVisible) return;               // hold the countdown off-screen
    remaining -= 1;
    if (remaining <= 0) {
      toggleState();                         // also resets the countdown
    } else {
      renderCountdown();
    }
  }, 1000);

  stateBtns.forEach((btn) => btn.addEventListener('click', () => setState(Number(btn.dataset.stateBtn))));
  gotoBtns.forEach((btn) => btn.addEventListener('click', () => setState(Number(btn.dataset.gotoState))));
  if (avatarTap) {
    avatarTap.addEventListener('click', () => {
      toggleState();
      blowKiss(6); // she celebrates every switch with a kiss 💋
    });
  }

  renderState();
  renderCountdown();

  /* ------------------------------------------------------------------ *
   *  Avatar life: blinking + blown kisses
   *  Eyelids/particles are absolutely-positioned overlays INSIDE the
   *  avatar frame — nothing structural is ever added or removed.
   * ------------------------------------------------------------------ */
  const avatar = $('#avatar');

  function blink() {
    if (!avatar || !heroVisible) return;
    avatar.classList.add('is-blinking');
    setTimeout(() => avatar.classList.remove('is-blinking'), 130);
  }

  if (!reducedMotion) {
    (function blinkLoop() {
      blink();
      const double = Math.random() < 0.14;
      if (double) setTimeout(blink, 260);
      setTimeout(blinkLoop, rand(2600, 4800));
    })();
  }

  function spawnHeart() {
    if (!avatarFx) return;
    const heart = document.createElement('span');
    heart.className = 'fx-heart';
    // mouth landmark ≈ (24.8%, 55%) of the 1024² source image
    heart.style.setProperty('--x', '24.8%');
    heart.style.setProperty('--y', '55%');
    heart.style.setProperty('--dx', `${rand(-70, 40)}px`);
    heart.style.setProperty('--dy', `${rand(-180, -100)}px`);
    heart.style.setProperty('--rot', `${rand(-28, 28)}deg`);
    heart.style.setProperty('--size', `${rand(0.8, 1.5)}rem`);
    heart.style.setProperty('--dur', `${rand(1.3, 1.9)}s`);
    heart.textContent = Math.random() < 0.82 ? '💗' : '💋';
    heart.addEventListener('animationend', () => heart.remove(), { once: true });
    avatarFx.appendChild(heart);
  }

  function blowKiss(count = 3) {
    if (reducedMotion) return;
    for (let i = 0; i < count; i += 1) setTimeout(spawnHeart, i * 130);
  }

  if (!reducedMotion) {
    (function kissLoop() {
      if (heroVisible) blowKiss(3);
      setTimeout(kissLoop, rand(5500, 8500));
    })();
  }

  /* ------------------------------------------------------------------ *
   *  Scroll reveal (staggered per parent group)
   * ------------------------------------------------------------------ */
  const revealEls = $$('.reveal');
  const seen = new Map();
  revealEls.forEach((el) => {
    const parent = el.parentElement;
    const index = seen.get(parent) || 0;
    seen.set(parent, index + 1);
    el.style.setProperty('--rd', `${Math.min(index * 90, 360)}ms`);
  });

  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => revealIO.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* Pause countdown / blink / kiss while the hero is off-screen */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      heroVisible = entries[0].isIntersecting;
      if (heroVisible) renderCountdown();
    }, { threshold: 0.2 }).observe(hero || document.body);
  }

  /* ==================================================================== *
   *  lem-in — ant colony canvas simulation
   *  Two disjoint paths (max-flow = 2): ants enter the colony, walk a
   *  tunnel graph rendered over the vivarium photo, and exit at the end.
   * ==================================================================== */
  const canvas = $('#lemInCanvas');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    const statsEl = $('#vizStats');
    const releaseBtn = $('#releaseAnts');

    /* --- graph (unit square coordinates, scaled to the canvas) -------- */
    const NODES = {
      S: [0.07, 0.60], A: [0.20, 0.38], B: [0.22, 0.76],
      C: [0.40, 0.26], D: [0.45, 0.70],
      F: [0.62, 0.46], G: [0.66, 0.82],
      E: [0.88, 0.58],
    };
    const PATHS = [
      ['S', 'A', 'C', 'F', 'E'],
      ['S', 'B', 'D', 'G', 'E'],
    ];
    const EDGES = [
      ['S', 'A'], ['A', 'C'], ['C', 'F'], ['F', 'E'],
      ['S', 'B'], ['B', 'D'], ['D', 'G'], ['G', 'E'],
      ['C', 'D'], ['A', 'B'], ['D', 'F'], // decoy tunnels
    ];

    /* precompute cumulative lengths of each path in unit space */
    const pathGeom = PATHS.map((names) => {
      const pts = names.map((n) => NODES[n]);
      const cum = [0];
      for (let i = 1; i < pts.length; i += 1) {
        const dx = pts[i][0] - pts[i - 1][0];
        const dy = pts[i][1] - pts[i - 1][1];
        cum.push(cum[i - 1] + Math.hypot(dx, dy));
      }
      return { pts, cum, total: cum[cum.length - 1] };
    });

    function pointOnPath(p, d) {
      const { pts, cum, total } = pathGeom[p];
      const target = d * total;
      let i = 1;
      while (i < cum.length - 1 && cum[i] < target) i += 1;
      const t = (target - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
      return [
        pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t,
        pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t,
      ];
    }

    /* --- sizing -------------------------------------------------------- */
    let W = 0;
    let H = 0;
    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('load', resize);
    resize();

    /* --- simulation state ---------------------------------------------- */
    const ants = [];
    let delivered = 0;
    let nextPath = 0;
    let spawnTimer = 0;
    let burstUntil = 0;      // releaseAnts → fast spawning window
    let canvasVisible = true;
    let lastFrame = performance.now();
    let statsAt = 0;

    const MAX_ANTS = 26;
    const SPAWN_EVERY = 0.95;  // seconds between natural spawns
    const BURST_EVERY = 0.14;

    function spawnAnt() {
      if (ants.length >= MAX_ANTS) return;
      const p = nextPath % PATHS.length;
      nextPath += 1;
      ants.push({
        p,
        d: 0,
        speed: 1 / rand(4.0, 5.6), // seconds to walk a whole path
        wob: rand(0, Math.PI * 2),
      });
    }

    function updateStats() {
      if (!statsEl) return;
      statsEl.textContent = `ants travelling: ${ants.length} · flow: ${PATHS.length} · delivered: ${delivered}`;
    }

    function update(dt) {
      spawnTimer -= dt;
      const gap = performance.now() < burstUntil ? BURST_EVERY : SPAWN_EVERY;
      if (spawnTimer <= 0) {
        spawnAnt();
        spawnTimer = gap;
      }
      for (let i = ants.length - 1; i >= 0; i -= 1) {
        const ant = ants[i];
        ant.d += ant.speed * dt;
        ant.wob += dt * 9;
        if (ant.d >= 1) {
          ants.splice(i, 1);
          delivered += 1;
        }
      }
    }

    /* --- rendering ------------------------------------------------------ */
    const X = (v) => v * W;
    const Y = (v) => v * H;

    function drawTunnels() {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // soft cyan glow pass
      ctx.shadowColor = 'rgba(34, 211, 238, 0.85)';
      ctx.shadowBlur = Math.max(8, H * 0.03);
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.20)';
      ctx.lineWidth = Math.max(5, H * 0.022);
      EDGES.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(X(NODES[a][0]), Y(NODES[a][1]));
        ctx.lineTo(X(NODES[b][0]), Y(NODES[b][1]));
        ctx.stroke();
      });

      // bright core pass
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(155, 231, 245, 0.55)';
      ctx.lineWidth = Math.max(1.4, H * 0.006);
      EDGES.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(X(NODES[a][0]), Y(NODES[a][1]));
        ctx.lineTo(X(NODES[b][0]), Y(NODES[b][1]));
        ctx.stroke();
      });
    }

    function drawNodes() {
      ctx.shadowColor = 'rgba(34, 211, 238, 0.9)';
      ctx.shadowBlur = Math.max(6, H * 0.02);
      Object.keys(NODES).forEach((name) => {
        const isEnd = name === 'E';
        const r = isEnd || name === 'S' ? H * 0.016 : H * 0.011;
        ctx.beginPath();
        ctx.fillStyle = isEnd ? '#FF1493' : 'rgba(190, 242, 250, 0.95)';
        ctx.arc(X(NODES[name][0]), Y(NODES[name][1]), r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;
    }

    function drawAnts(t) {
      const size = Math.max(3, H * 0.014);
      ants.forEach((ant) => {
        const [ux, uy] = pointOnPath(ant.p, ant.d);
        const sway = Math.sin(ant.wob) * size * 0.16;
        const x = X(ux) + sway;
        const y = Y(uy) - Math.abs(sway) * 0.4;

        ctx.shadowColor = 'rgba(255, 20, 147, 0.95)';
        ctx.shadowBlur = size * 1.6;
        ctx.fillStyle = '#FF1493';
        ctx.beginPath();
        ctx.ellipse(x, y, size * 0.62, size * 0.42, Math.sin(ant.wob * 0.5) * 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#2A0A14';
        ctx.beginPath();
        ctx.arc(x + size * 0.42, y - size * 0.1, size * 0.22, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;
      void t;
    }

    function frame(now) {
      const dt = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;

      ctx.clearRect(0, 0, W, H);
      drawTunnels();
      drawNodes();

      if (!reducedMotion && canvasVisible && !document.hidden) update(dt);
      drawAnts(now);

      if (now - statsAt > 250) {
        statsAt = now;
        updateStats();
      }

      requestAnimationFrame(frame);
    }

    /* --- controls -------------------------------------------------------- */
    if (releaseBtn) {
      const defaultLabel = releaseBtn.textContent;
      releaseBtn.addEventListener('click', () => {
        if (reducedMotion) {
          delivered += 10;
          updateStats();
          return;
        }
        burstUntil = performance.now() + 2600;
        spawnAnt();
        spawnAnt();
        spawnAnt();
        releaseBtn.textContent = 'ants released! 🐜';
        setTimeout(() => { releaseBtn.textContent = defaultLabel; }, 1400);
      });
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        canvasVisible = entries[0].isIntersecting;
      }, { threshold: 0.05 }).observe(canvas);
    }

    /* kick off: a few ants already mid-colony */
    for (let i = 0; i < 5; i += 1) {
      spawnAnt();
      ants[i].d = rand(0.05, 0.6);
    }
    updateStats();
    requestAnimationFrame(frame);
  }
})();
