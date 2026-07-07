/* Atico Furniture — "The Commission" site JS.
   Scope: mobile nav toggle, same-page smooth scroll, and a single tiny
   IntersectionObserver that (a) ignites the Forge Seam, (b) staggers the
   material swatches, and (c) rises editorial sections into view.
   No libraries. Respects prefers-reduced-motion. */
(function () {
  'use strict';

  // ---- Mobile nav toggle ----
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

  // ---- Smooth scroll for same-page anchors ----
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var el = document.querySelector(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // ---- Scroll reveal: forge-seam ignition, swatch stagger, section rise ----
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = document.querySelectorAll('.forge-seam, .swatch-row, .rise-in');

  function revealAll() {
    targets.forEach(function (t) {
      t.classList.add('in', 'lit');
      t.querySelectorAll('.swatch-tile.enter').forEach(function (s) { s.classList.add('in'); });
    });
  }

  if (reduce || !('IntersectionObserver' in window)) {
    // Show everything immediately, ignite seams, no motion.
    revealAll();
    return;
  }

  // Opt into the hidden-then-revealed state only now that we can reveal it.
  document.documentElement.classList.add('js-reveal');
  // Absolute fail-safe: if the observer somehow never fires (odd viewports,
  // print, etc.), reveal everything after a beat so nothing stays hidden.
  var safety = setTimeout(revealAll, 2600);

  var io = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      clearTimeout(safety); // observer is working; let it drive the reveals
      var el = entry.target;

      if (el.classList.contains('forge-seam')) {
        el.classList.add('lit');           // step-reveal: weld line + piece resolve
      } else if (el.classList.contains('swatch-row')) {
        var tiles = el.querySelectorAll('.swatch-tile.enter');
        tiles.forEach(function (tile, i) {
          setTimeout(function () { tile.classList.add('in'); }, i * 90);
        });
      } else {
        el.classList.add('in');            // generic editorial rise
      }
      obs.unobserve(el);
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });

  targets.forEach(function (t) { io.observe(t); });
})();
