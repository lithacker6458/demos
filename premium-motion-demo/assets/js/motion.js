/* ============================================================
   DNA Agency — PREMIUM MOTION ENGINE (motion.js)  ~2KB, zero deps.
   ------------------------------------------------------------
   What it does:
     1) marks <html class="mo-js"> — the progressive-enhancement gate
        that arms motion.css's "start hidden" rules. If this script
        never runs, nothing is hidden and all content shows.
     2) IntersectionObserver scroll-reveal (adds .in-view), including
        automatic per-child stagger for [data-reveal-group].
     3) count-up stat counters ([data-count]) that animate on reveal.
        The final number lives in the HTML as the fallback text.
     4) rAF-throttled parallax for [data-parallax] — desktop + motion
        allowed only (skipped on mobile and prefers-reduced-motion).

   Load it LOCALLY (copy into the site's assets/js/, never a CDN),
   deferred, after the template's main.js:
     <script src="assets/js/motion.js" defer></script>
   ============================================================ */
(function(){
  'use strict';

  var docEl = document.documentElement;
  docEl.classList.add('mo-js');   // arm the CSS "start hidden" rules

  var reduce = !!(window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var noIO = !('IntersectionObserver' in window);

  /* ---- helpers ---------------------------------------------------- */

  // Reveal an element immediately (jump to final state).
  function show(el){ el.classList.add('in-view'); }

  // Format a number using the element's data-count-dec precision.
  function fmt(el, val){
    var dec = el.getAttribute('data-count-dec') | 0;
    return (el.getAttribute('data-count-pre') || '') +
      val.toLocaleString(undefined, {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec
      }) +
      (el.getAttribute('data-count-suf') || '');
  }

  // Snap a counter straight to its final value (no animation path).
  function finalize(el){
    var target = parseFloat(el.getAttribute('data-count'));
    if (!isNaN(target)) el.textContent = fmt(el, target);
  }

  // Animate a counter from 0 -> target with easeOutCubic.
  function countUp(el){
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    if (reduce){ finalize(el); return; }
    var dur = parseInt(el.getAttribute('data-count-dur'), 10) || 1600;
    var t0 = null;
    function frame(ts){
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);           // easeOutCubic
      el.textContent = fmt(el, target * eased);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = fmt(el, target);        // exact landing
    }
    requestAnimationFrame(frame);
  }

  /* ---- collect targets ------------------------------------------- */

  var reveals  = [].slice.call(
    document.querySelectorAll('[data-reveal],[data-reveal-group]'));
  var counters = [].slice.call(
    document.querySelectorAll('[data-count]'));

  // Set the stagger index on each group child so CSS can delay it.
  [].forEach.call(document.querySelectorAll('[data-reveal-group]'), function(g){
    [].forEach.call(g.children, function(c, i){
      c.style.setProperty('--mo-i', i);
    });
  });

  /* ---- reveal + count ------------------------------------------- */

  if (reduce || noIO){
    // No animation path: show everything and finalize every counter now.
    reveals.forEach(show);
    counters.forEach(finalize);
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (!e.isIntersecting) return;
        show(e.target);
        // fire any counters inside this newly-revealed block
        if (e.target.querySelectorAll){
          [].forEach.call(e.target.querySelectorAll('[data-count]'), countUp);
        }
        if (e.target.hasAttribute('data-count')) countUp(e.target);
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });

    reveals.forEach(function(el){ io.observe(el); });

    // Standalone counters not wrapped in a reveal get their own observer.
    counters.forEach(function(c){
      if (!c.closest('[data-reveal],[data-reveal-group]')) io.observe(c);
    });

    // SAFETY NET: if the observer never fires for an element (e.g. a
    // zero-height layout viewport, an element that never scrolls into
    // view, or an exotic engine), that content would stay stuck at
    // opacity 0 forever. Once the page has loaded, give the observer a
    // brief grace period, then reveal anything still hidden so content
    // is NEVER permanently invisible when JS is present.
    var sweep = function(){
      setTimeout(function(){
        reveals.forEach(function(el){
          if (!el.classList.contains('in-view')){
            show(el);
            if (el.querySelectorAll){
              [].forEach.call(el.querySelectorAll('[data-count]'), countUp);
            }
            if (el.hasAttribute('data-count')) countUp(el);
          }
        });
      }, 1200);
    };
    if (document.readyState === 'complete') sweep();
    else window.addEventListener('load', sweep, { once: true });
  }

  /* ---- parallax (desktop + motion-allowed only) ------------------ */

  var pxEls  = [].slice.call(document.querySelectorAll('[data-parallax]'));
  var mobile = !!(window.matchMedia &&
    window.matchMedia('(max-width: 768px)').matches);

  if (pxEls.length && !reduce && !mobile){
    var ticking = false;
    function apply(){
      var vh = window.innerHeight;
      pxEls.forEach(function(el){
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
        var r = el.getBoundingClientRect();
        var centerDelta = (r.top + r.height / 2) - vh / 2;
        el.style.setProperty('--mo-y', (centerDelta * -speed).toFixed(1) + 'px');
      });
      ticking = false;
    }
    function onScroll(){
      if (!ticking){ requestAnimationFrame(apply); ticking = true; }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    apply();   // set initial positions
  }
})();
