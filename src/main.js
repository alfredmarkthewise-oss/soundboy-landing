/* ============================================================
   SOUNDBOY.AI — Production JS v3 (Magic Pass)
   Interactive mockup, typewriter AI, mouse tracking, timeline
   ============================================================ */
(function () {
  'use strict';

  // ─── Waveform Background ───
  const canvas = document.getElementById('waveform-bg');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w, h, t = 0, raf;

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = '#e8a44a';
      ctx.lineWidth = 1.2;
      for (let wave = 0; wave < 4; wave++) {
        ctx.globalAlpha = 0.12 - wave * 0.025;
        ctx.beginPath();
        for (let x = 0; x < w; x += 4) {
          const y = h / 2 + Math.sin(x * (0.003 + wave * 0.0008) + t + wave * 0.7) 
                    * ((h * 0.12) + wave * 15) * Math.sin(x * 0.001 + t * 0.25);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      t += 0.005;
      raf = requestAnimationFrame(draw);
    }

    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { resize(); draw(); } else { cancelAnimationFrame(raf); }
    });
    window.addEventListener('resize', resize);
    obs.observe(canvas);
  }

  // ─── Mouse-reactive Mockup (3D tilt) ───
  const mockup = document.getElementById('mockup');
  const heroProduct = document.getElementById('hero-mockup');
  if (mockup && heroProduct && window.matchMedia('(min-width: 901px)').matches) {
    heroProduct.addEventListener('mousemove', (e) => {
      const rect = heroProduct.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mockup.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 5}deg)`;
    });
    heroProduct.addEventListener('mouseleave', () => {
      mockup.style.transform = 'rotateY(-3deg) rotateX(1deg)';
    });
  }

  // ─── Playhead Animation ───
  const playheads = document.querySelectorAll('.m-playhead');
  let playing = false, playProgress = 0;
  const transportBar = document.querySelector('.transport-bar');
  const transportPlay = document.getElementById('transport-play');
  const transportTime = document.querySelector('.transport-time');

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  let playRaf;
  function animatePlayback() {
    if (!playing) return;
    playProgress += 0.0004;
    if (playProgress >= 1) playProgress = 0;

    playheads.forEach(ph => { ph.style.left = `${playProgress * 100}%`; });
    if (transportBar) transportBar.style.width = `${playProgress * 100}%`;
    if (transportTime) {
      const totalSec = 222; // 3:42
      transportTime.innerHTML = `${formatTime(playProgress * totalSec)} <span class="transport-dim">/ 3:42</span>`;
    }
    playRaf = requestAnimationFrame(animatePlayback);
  }

  if (transportPlay) {
    transportPlay.addEventListener('click', () => {
      playing = !playing;
      transportPlay.classList.toggle('playing', playing);
      transportPlay.textContent = playing ? '⏸' : '▶';
      if (playing) animatePlayback();
      else cancelAnimationFrame(playRaf);
    });
  }

  // Auto-play after 2 seconds for wow factor
  setTimeout(() => {
    if (transportPlay && !playing) {
      playing = true;
      transportPlay.classList.add('playing');
      transportPlay.textContent = '⏸';
      animatePlayback();
    }
  }, 2000);

  // ─── Solo Buttons ───
  document.querySelectorAll('.m-solo').forEach(btn => {
    btn.addEventListener('click', () => {
      const wasActive = btn.classList.contains('active');
      document.querySelectorAll('.m-solo').forEach(b => b.classList.remove('active'));
      if (!wasActive) {
        btn.classList.add('active');
        // Dim other tracks
        document.querySelectorAll('.m-track').forEach(t => {
          t.style.opacity = t.contains(btn) ? '1' : '0.3';
        });
      } else {
        document.querySelectorAll('.m-track').forEach(t => { t.style.opacity = '1'; });
      }
    });
  });

  // ─── AI Typewriter Effect ───
  const aiMsg = document.getElementById('ai-msg');
  const aiCursor = document.querySelector('.ai-cursor');
  if (aiMsg) {
    const messages = [
      'Vocal presence is muddy below 300Hz. Cutting 4dB at 250Hz, boosting 2dB shelf at 8kHz.',
      'Kick and bass are fighting at 80Hz. Side-chaining bass to kick transient.',
      '◈ Memory: You prefer warm vocals with +2dB at 3kHz. Applying your style profile.',
      'Reverb tail on vocals is masking the snare. Reducing decay to 1.2s.',
      '◈ Memory: Similar to "Late Night Vibes" (Jan 12). Applying learned compression curve.',
      'Synth pad is wide but hollow. Adding subtle saturation at 2kHz.',
      '◈ Memory: 47 sessions analyzed. Your low-end preference is tight — cutting sub-bass below 35Hz.',
      'Detected genre: Hip-Hop. Cross-referencing with your style profile + genre model.',
    ];
    let msgIdx = 0, charIdx = 0, isDeleting = false, pauseTimer = 0;

    function typewrite() {
      const current = messages[msgIdx];

      if (!isDeleting) {
        charIdx++;
        aiMsg.textContent = current.slice(0, charIdx);
        if (charIdx >= current.length) {
          pauseTimer++;
          if (pauseTimer > 60) { isDeleting = true; pauseTimer = 0; }
        }
      } else {
        charIdx -= 2;
        aiMsg.textContent = current.slice(0, Math.max(0, charIdx));
        if (charIdx <= 0) {
          isDeleting = false;
          charIdx = 0;
          msgIdx = (msgIdx + 1) % messages.length;
        }
      }
      requestAnimationFrame(() => setTimeout(typewrite, isDeleting ? 15 : 35));
    }
    setTimeout(typewrite, 1500);
  }

  // ─── Live Spectrum (mockup) ───
  const spectrumContainer = document.getElementById('mock-spectrum');
  if (spectrumContainer) {
    // Create bars
    for (let i = 0; i < 24; i++) {
      const bar = document.createElement('div');
      bar.className = 'ms-bar';
      bar.style.setProperty('--h', `${20 + Math.random() * 60}%`);
      spectrumContainer.appendChild(bar);
    }

    const bars = spectrumContainer.querySelectorAll('.ms-bar');
    let lastUpdate = 0;

    function animateSpectrum(now) {
      if (now - lastUpdate > 120) {
        bars.forEach((bar, i) => {
          // Create more realistic frequency distribution (higher at mids)
          const midBias = 1 - Math.abs(i / bars.length - 0.4) * 1.5;
          const h = Math.max(10, (30 + Math.random() * 60) * Math.max(0.3, midBias));
          bar.style.setProperty('--h', `${h}%`);
        });
        lastUpdate = now;
      }
      if (heroProduct) requestAnimationFrame(animateSpectrum);
    }

    const specObs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) requestAnimationFrame(animateSpectrum);
    });
    specObs.observe(spectrumContainer);
  }

  // ─── Meter Jitter (realistic levels) ───
  const meterFills = document.querySelectorAll('.m-meter-fill');
  if (meterFills.length) {
    setInterval(() => {
      meterFills.forEach(fill => {
        const base = parseInt(fill.style.getPropertyValue('--lvl'));
        const jitter = base + (Math.random() * 10 - 5);
        fill.style.setProperty('--lvl', `${Math.max(20, Math.min(98, jitter))}%`);
      });
    }, 300);
  }

  // ─── Feature Spectrum Bars ───
  const fSpectrum = document.querySelector('.f-icon-spectrum');
  if (fSpectrum) {
    for (let i = 0; i < 12; i++) {
      const bar = document.createElement('div');
      bar.style.cssText = `flex:1;height:${20+Math.random()*80}%;border-radius:2px;background:linear-gradient(to top,var(--accent),var(--warm));opacity:0.5;transition:height 0.3s`;
      fSpectrum.appendChild(bar);
    }
  }

  // ─── Demo Slider ───
  const demoSlider = document.getElementById('demo-slider');
  const demoPct = document.getElementById('demo-pct');
  if (demoSlider && demoPct) {
    demoSlider.addEventListener('input', () => {
      demoPct.textContent = `${demoSlider.value}%`;
      // Visual feedback: shift before/after card opacity
      const v = demoSlider.value / 100;
      const beforeCard = document.querySelector('.demo-before');
      const afterCard = document.querySelector('.demo-after');
      if (beforeCard) beforeCard.style.opacity = 0.4 + (1 - v) * 0.6;
      if (afterCard) afterCard.style.opacity = 0.4 + v * 0.6;
    });
  }

  // ─── Timeline Scroll Progress ───
  const timelineProgress = document.getElementById('timeline-progress');
  const tlSteps = document.querySelectorAll('.tl-step');
  if (timelineProgress && tlSteps.length) {
    const tlObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Calculate progress
          const activeCount = document.querySelectorAll('.tl-step.active').length;
          timelineProgress.style.width = `${(activeCount / tlSteps.length) * 100}%`;
        }
      });
    }, { threshold: 0.3 });
    tlSteps.forEach(s => tlObserver.observe(s));
  }

  // ─── Scroll Animations ───
  const animElements = document.querySelectorAll(
    '.f-card, .mem-tier, .memory-compound, .tl-step, .price-card, .section-header, .vision-inner, .cta-inner, .demo-player'
  );
  animElements.forEach(el => el.classList.add('animate-on-scroll'));
  document.querySelectorAll('.feature-grid, .memory-arch, .pricing-grid, .timeline').forEach(el => el.classList.add('stagger'));

  const scrollObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        scrollObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  animElements.forEach(el => scrollObs.observe(el));

  // ─── Counter Animation ───
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    if (!isFinite(target) || el.dataset.done) return;
    el.dataset.done = '1';
    const dur = 1600, start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('[data-target]').forEach(animateCounter);
        counterObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.hero-proof').forEach(el => counterObs.observe(el));

  // ─── Nav Scroll ───
  const nav = document.querySelector('.nav');
  let navTick = false;
  window.addEventListener('scroll', () => {
    if (!navTick) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', scrollY > 40);
        navTick = false;
      });
      navTick = true;
    }
  }, { passive: true });

  // ─── Mobile Nav ───
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const exp = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !exp);
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('open');
    }));
  }

  // ─── Smooth Scroll ───
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  // ─── Form ───
  const form = document.getElementById('signup-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const data = Object.fromEntries(new FormData(form));
      btn.innerHTML = '<span>Joining...</span>';
      btn.disabled = true;

      try {
        // TODO: Wire to Supabase Edge Function
        await new Promise(r => setTimeout(r, 800));
        btn.innerHTML = '<span>✓ You\'re on the list!</span>';
        btn.style.background = '#4ade80';
        form.reset();
        setTimeout(() => { btn.innerHTML = '<span>Join the Beta — It\'s Free →</span>'; btn.style.background = ''; btn.disabled = false; }, 3000);
      } catch {
        btn.innerHTML = '<span>Error — try again</span>';
        btn.style.background = '#ef4444';
        setTimeout(() => { btn.innerHTML = '<span>Join the Beta — It\'s Free →</span>'; btn.style.background = ''; btn.disabled = false; }, 2500);
      }
    });
  }

  // ─── Memory Profile Bars: animate on scroll ───
  const memProfile = document.querySelector('.mem-profile');
  if (memProfile) {
    const fills = memProfile.querySelectorAll('.mp-fill');
    fills.forEach(f => { f.dataset.targetW = f.style.getPropertyValue('--w'); f.style.setProperty('--w', '0%'); });
    const memObs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        fills.forEach(f => { f.style.setProperty('--w', f.dataset.targetW); });
        memObs.unobserve(e.target);
      }
    }, { threshold: 0.3 });
    memObs.observe(memProfile);
  }

  // ─── Scroll Cue: fade out on scroll ───
  const scrollCue = document.querySelector('.scroll-cue');
  if (scrollCue) {
    window.addEventListener('scroll', () => {
      scrollCue.style.opacity = Math.max(0, 1 - scrollY / 200);
    }, { passive: true });
  }

})();
