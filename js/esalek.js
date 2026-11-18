/* Esalek case study: nav, scroll progress and the payment workflow demo */
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
    ['problem', 'role', 'challenges', 'decisions', 'impact', 'stack', 'contact'].forEach(function (id) {
      var el = $(id); if (el) so.observe(el);
    });
  }

  /* ---------- screenshots: hide any that fail to load ---------- */
  document.querySelectorAll('.ch-fig img').forEach(function (img) {
    img.addEventListener('error', function () { img.closest('figure').hidden = true; });
  });

  /* ---------- payment workflow demo ----------
     Approved: order → payment → result → fiscal receipt.
     Interrupted: the confirmation never arrives, so the fiscal receipt is
     never generated and the order stays pending. */
  var card = $('payCard'), pill = $('modePill'), btn = $('modeBtn'), msg = $('payMsg');
  var rows = Array.prototype.slice.call(card.querySelectorAll('li'));
  var LABEL = { idle: 'WAIT', active: 'RUN', done: 'DONE', failed: 'NO REPLY', blocked: 'BLOCKED' };
  var STEP = 700, timers = [], auto = !reduceMotion, mode = 'approved';

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function setRow(i, s) {
    rows[i].dataset.state = s;
    rows[i].querySelector('.state').textContent = LABEL[s];
  }

  function run(m) {
    clearTimers();
    mode = m;
    card.dataset.mode = m;
    pill.textContent = m === 'approved' ? 'APPROVED' : 'INTERRUPTED';
    btn.textContent = m === 'approved' ? 'SIMULATE INTERRUPTION' : 'SIMULATE APPROVAL';
    rows.forEach(function (_, i) { setRow(i, 'idle'); });
    msg.textContent = 'Order first, receipt after payment.';

    setRow(0, 'active');
    later(function () { setRow(0, 'done'); setRow(1, 'active'); }, STEP);
    later(function () { setRow(1, 'done'); setRow(2, 'active'); }, STEP * 2);
    later(function () {
      if (m === 'approved') {
        setRow(2, 'done'); setRow(3, 'active');
      } else {
        setRow(2, 'failed'); setRow(3, 'blocked');
        msg.textContent = 'Confirmation never arrived. The order stays pending; the cashier can run Inquiry or Void.';
        if (auto) later(function () { run('approved'); }, 4200);
      }
    }, STEP * 3);
    if (m === 'approved') {
      later(function () {
        setRow(3, 'done');
        msg.textContent = 'Payment confirmed. Fiscal receipt generated.';
        if (auto) later(function () { run('interrupted'); }, 3000);
      }, STEP * 4);
    }
  }

  btn.addEventListener('click', function () {
    auto = false;
    msg.setAttribute('aria-live', 'polite');
    run(mode === 'approved' ? 'interrupted' : 'approved');
  });

  run('approved');

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
