/* Max's Mobile Auto Detailing — site JS.
   Scope: mobile nav toggle + smooth scroll for same-page anchors. Nothing else. */
(function () {
  'use strict';

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

  // Before/after comparison slider (index page)
  var ba = document.querySelector('[data-ba]');
  if (ba) {
    var baRange = ba.querySelector('.ba-range');
    if (baRange) {
      baRange.addEventListener('input', function () {
        ba.style.setProperty('--ba', baRange.value + '%');
      });
    }
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
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
})();
