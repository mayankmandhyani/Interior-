/* ==========================================================================
   STRATA — interaction layer
   Sections: nav, entrance reveals, craft scroll-scrub, reveal-on-scroll,
   before/after compare, footer.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------------------------- NAV ---------------------------- */
  var nav = document.getElementById('siteNav');
  var toggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');

  function onScrollNav() {
    if (window.scrollY > 40) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  }
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  toggle.addEventListener('click', function () {
    var open = mobileMenu.classList.toggle('is-open');
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    mobileMenu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      mobileMenu.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      mobileMenu.hidden = true;
      document.body.style.overflow = '';
    });
  });

  /* ---------------------------- ENTRANCE + REVEAL ---------------------------- */
  if (hasGSAP && !reduceMotion) {
    gsap.set('[data-anim="fade-up"]', { y: 22 });
    gsap.timeline({ delay: 0.15 })
      .to('.hero [data-anim="fade-up"]', {
        opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.12
      });

    // fade-up for every other section header as it enters view
    document.querySelectorAll('section:not(.hero) [data-anim="fade-up"]').forEach(function (el) {
      gsap.set(el, { y: 22 });
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    // material rows + project rows + principles: reveal + image de-zoom
    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 34 }, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        onStart: function () { el.classList.add('reveal'); }
      });
    });
  } else {
    // no GSAP or reduced motion: just reveal everything immediately
    document.querySelectorAll('[data-anim], [data-reveal]').forEach(function (el) {
      el.style.opacity = 1;
      el.classList.add('reveal');
    });
  }

  /* ---------------------------- CRAFTSMANSHIP SCROLL-SCRUB ---------------------------- */
  (function craftReveal() {
    var scroller = document.getElementById('craftScroller');
    var video = document.getElementById('craftVideo');
    var fallbackImg = document.querySelector('.craft-fallback');
    var fill = document.getElementById('craftFill');
    var counter = document.getElementById('craftCounter');
    var stageEls = document.querySelectorAll('#craftStages span');
    if (!scroller || !video) return;

    var stageLabels = ['Assembled', 'Lifting', 'Exposed', 'Reassembling'];

    function setProgressUI(p) {
      var pct = Math.round(p * 100);
      if (fill) fill.style.width = pct + '%';
      var idx = Math.min(3, Math.floor(p * 4));
      if (counter) counter.textContent = ('0' + (idx + 1)) + ' / 04 — ' + stageLabels[idx];
      stageEls.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); });
    }

    // Reduced motion / no-GSAP: static, accessible layout — no pin, no scrub.
    if (reduceMotion || !hasGSAP) {
      video.setAttribute('controls', '');
      video.removeAttribute('muted');
      video.muted = true; // keep muted by default; controls let the visitor opt in
      setProgressUI(0);
      return;
    }

    var ready = false;
    var duration = 8; // fallback until metadata loads

    function unlockAndPrime() {
      // iOS Safari requires a play() gesture before currentTime scrubbing works
      var playPromise = video.play();
      if (playPromise && playPromise.then) {
        playPromise.then(function () {
          video.pause();
          video.currentTime = 0;
          ready = true;
        }).catch(function () {
          // autoplay blocked — scrubbing will still work once metadata is loaded
          ready = true;
        });
      } else {
        ready = true;
      }
    }

    if (video.readyState >= 1) {
      duration = video.duration || duration;
    }
    video.addEventListener('loadedmetadata', function () {
      duration = video.duration || duration;
    });
    video.addEventListener('error', function () {
      // graceful fallback if the video fails to load on a given device
      video.hidden = true;
      if (fallbackImg) fallbackImg.hidden = false;
    });

    unlockAndPrime();

    var targetTime = 0;
    var raf = null;
    function tick() {
      raf = null;
      if (ready && !video.seeking) {
        video.currentTime = targetTime;
      }
    }

    ScrollTrigger.create({
      trigger: scroller,
      start: 'top top',
      end: 'bottom bottom',
      pin: '#craftStage',
      pinSpacing: true,
      scrub: 0.6,
      onUpdate: function (self) {
        var p = self.progress;
        targetTime = p * duration;
        setProgressUI(p);
        if (!raf) raf = requestAnimationFrame(tick);
      }
    });
  })();

  /* ---------------------------- BEFORE / AFTER COMPARE ---------------------------- */
  (function compareSlider() {
    var el = document.getElementById('compareSlider');
    var after = document.getElementById('compareAfter');
    var handle = document.getElementById('compareHandle');
    if (!el || !after || !handle) return;

    var pct = 50;

    function apply(p) {
      pct = Math.max(0, Math.min(100, p));
      after.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
      handle.style.left = pct + '%';
      el.setAttribute('aria-valuenow', String(Math.round(pct)));
    }
    apply(50);

    function pctFromClientX(clientX) {
      var rect = el.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }

    var dragging = false;

    function start(clientX) {
      dragging = true;
      apply(pctFromClientX(clientX));
    }
    function move(clientX) {
      if (!dragging) return;
      apply(pctFromClientX(clientX));
    }
    function end() { dragging = false; }

    el.addEventListener('pointerdown', function (e) {
      el.setPointerCapture(e.pointerId);
      start(e.clientX);
    });
    el.addEventListener('pointermove', function (e) { move(e.clientX); });
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);

    el.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { apply(pct - 4); e.preventDefault(); }
      if (e.key === 'ArrowRight') { apply(pct + 4); e.preventDefault(); }
      if (e.key === 'Home') { apply(0); e.preventDefault(); }
      if (e.key === 'End') { apply(100); e.preventDefault(); }
    });
  })();

})();
