/* MS Concrete, Inc — site JS.
   Scope: mobile nav toggle, smooth scroll, scroll-triggered reveals,
   animated stat counters. No dependencies. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile nav toggle
  var btn = document.querySelector('[data-nav-toggle]');
  var panel = document.querySelector('[data-nav-panel]');
  if (btn && panel) {
    btn.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        panel.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Smooth scroll for same-page anchor links
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var el = document.querySelector(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  });

  // Stat counters — tick up when the row scrolls into view
  function formatNum(n) {
    return n.toLocaleString('en-US');
  }
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion) { el.textContent = formatNum(target) + suffix; return; }
    var dur = 1300;
    var start = null;
    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      el.textContent = formatNum(Math.round(target * eased)) + suffix;
      if (p < 1) window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  }

  // Scroll-triggered reveals + counters via one IntersectionObserver
  var revealEls = [].slice.call(document.querySelectorAll('[data-reveal], [data-reveal-group]'));
  var countEls = [].slice.call(document.querySelectorAll('[data-count]'));

  if ('IntersectionObserver' in window) {
    var counted = [];
    function markCounted(el) { counted.push(el); }
    function isCounted(el) { return counted.indexOf(el) !== -1; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        var counters = [].slice.call(entry.target.querySelectorAll('[data-count]'));
        if (entry.target.hasAttribute('data-count')) counters.push(entry.target);
        counters.forEach(function (c) {
          if (!isCounted(c)) { markCounted(c); runCounter(c); }
        });
        io.unobserve(entry.target);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { io.observe(el); });
    // counters not inside a reveal container still need observing
    countEls.forEach(function (el) {
      if (!el.closest('[data-reveal], [data-reveal-group]')) io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
    countEls.forEach(runCounter);
  }
})();
