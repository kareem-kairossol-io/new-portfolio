/* Cyrus RMS Offline POS case study: nav, scroll progress and the sync demo */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- navigation ---------- */
  var menuBtn = $('menuBtn'), links = $('links');
  menuBtn.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      links.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });

  var prog = $('prog'), ticking = false;
  function updateProgress() {
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    prog.style.transform = 'scaleX(' + (max > 0 ? Math.min(Math.max(h.scrollTop / max, 0), 1) : 0) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();

  if ('IntersectionObserver' in window) {
    var spy = {};
    links.querySelectorAll('a[href^="#"]').forEach(function (a) { spy[a.getAttribute('href')] = a; });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        Object.keys(spy).forEach(function (k) { spy[k].classList.remove('active'); });
        var a = spy['#' + e.target.id];
        if (a) a.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['role', 'challenges', 'decisions', 'impact', 'stack', 'contact'].forEach(function (id) {
      var el = $(id); if (el) so.observe(el);
    });
  }

  /* ---------- screenshots: hide any that fail to load ---------- */
  document.querySelectorAll('.ch-fig img').forEach(function (img) {
    img.addEventListener('error', function () { img.closest('figure').hidden = true; });
  });

  /* ---------- sync demo ----------
     Offline: everything is saved locally. Online: records sync strictly in
     dependency order (session → sales orders → returns & voids). */
  var card = $('syncCard'), pill = $('netPill'), btn = $('netBtn'), msg = $('syncMsg');
  var rows = Array.prototype.slice.call(card.querySelectorAll('li'));
  var LABEL = { local: 'LOCAL', waiting: 'WAITING', syncing: 'SYNCING', synced: 'SYNCED' };
  var timers = [], auto = !reduceMotion;

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function setRow(i, s) {
    rows[i].dataset.state = s;
    rows[i].querySelector('.state').textContent = LABEL[s];
  }

  function goOffline() {
    clearTimers();
    card.dataset.net = 'off';
    pill.textContent = 'OFFLINE';
    btn.textContent = 'GO ONLINE';
    rows.forEach(function (_, i) { setRow(i, 'local'); });
    msg.textContent = 'No connection. Sales continue locally.';
  }

  function goOnline() {
    clearTimers();
    card.dataset.net = 'on';
    pill.textContent = 'ONLINE';
    btn.textContent = 'GO OFFLINE';
    rows.forEach(function (_, i) { setRow(i, i === 0 ? 'syncing' : 'waiting'); });
    msg.textContent = 'Connected. Syncing in dependency order.';
    rows.forEach(function (_, i) {
      later(function () {
        setRow(i, 'synced');
        if (i < rows.length - 1) setRow(i + 1, 'syncing');
        else {
          msg.textContent = 'Everything is synced with the central platform.';
          if (auto) later(function () { goOffline(); loop(); }, 3200);
        }
      }, 900 * (i + 1));
    });
  }

  function loop() { if (auto) later(goOnline, 2600); }

  btn.addEventListener('click', function () {
    auto = false;
    msg.setAttribute('aria-live', 'polite');
    if (card.dataset.net === 'on') goOffline(); else goOnline();
  });

  goOffline();
  loop();

  /* --- Copy Email & Toast --- */
  var tt;
  function toast(m) {
    var t = $('toast');
    if (!t) return;
    t.textContent = m;
    t.classList.add('on');
    clearTimeout(tt);
    tt = setTimeout(function () {
      t.classList.remove('on');
    }, 2000);
  }

  window.copyEmail = function () {
    var emailEl = $('emailVal');
    if (!emailEl) return;
    navigator.clipboard
      .writeText(emailEl.textContent)
      .then(function () {
        var b = $('copyBtn');
        if (b) b.textContent = 'COPIED!';
        toast('EMAIL COPIED!');
        setTimeout(function () {
          if (b) b.textContent = 'COPY EMAIL';
        }, 2000);
      })
      .catch(function () {
        toast('COULD NOT COPY');
      });
  };
})();
