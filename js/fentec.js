/* Fentec Mobility case study: nav, scroll progress and the geofence demo */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     Navigation: mobile menu, scroll progress, scroll-spy
     ------------------------------------------------------------------ */
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
    ['role', 'challenges', 'impact', 'stack', 'contact'].forEach(function (id) {
      var el = $(id); if (el) so.observe(el);
    });
  }

  /* ------------------------------------------------------------------
     Screenshots: hide any that fail to load, and the section if all fail
     ------------------------------------------------------------------ */
  var shotsSection = $('screens');
  var figs = Array.prototype.slice.call(shotsSection.querySelectorAll('figure'));
  function checkShots() {
    var anyLeft = figs.some(function (f) { return !f.hidden; });
    shotsSection.hidden = !anyLeft;
  }
  figs.forEach(function (fig) {
    var img = fig.querySelector('img');
    function bad() { fig.hidden = true; checkShots(); }
    img.addEventListener('error', bad);
  });

  document.querySelectorAll('.ch-fig img').forEach(function (img) {
    img.addEventListener('error', function () { img.closest('figure').hidden = true; });
  });

  /* ------------------------------------------------------------------
     Geofence demo
     The zone polygons in the SVG are the single source of truth: the same
     point-in-polygon test the page describes decides which zone applies.
     ------------------------------------------------------------------ */
  var svg = $('map'), route = $('route'), scooter = $('scooter');
  var panel = $('zonePanel'), badge = $('zoneBadge'), zDesc = $('zoneDesc');

  var ZONES = {
    green:  { badge: 'GREEN ZONE',  desc: 'Approved area. Ride freely.',          speed: 1 },
    orange: { badge: 'ORANGE ZONE', desc: 'Speed reduced. Grace period started.', speed: 0.4 },
    red:    { badge: 'RED ZONE',    desc: 'Scooter stopped. User and admins notified.', speed: 0 }
  };

  function parse(poly) {
    return poly.getAttribute('points').trim().split(/\s+/).map(function (p) {
      var a = p.split(','); return [+a[0], +a[1]];
    });
  }
  function polys(name) {
    return Array.prototype.map.call(svg.querySelectorAll('polygon[data-zone="' + name + '"]'), parse);
  }
  var RED = polys('red'), GREEN = polys('green');

  function inside(x, y, poly) {
    var c = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  function zoneAt(x, y) {
    if (RED.some(function (p) { return inside(x, y, p); })) return 'red';
    if (GREEN.some(function (p) { return inside(x, y, p); })) return 'green';
    return 'orange';
  }

  var current = null, px = 0, py = 0;

  function setZone(z) {
    current = z;
    var info = ZONES[z];
    svg.dataset.zone = z;
    panel.dataset.zone = z;
    badge.textContent = info.badge;
    zDesc.textContent = info.desc;
  }

  function setPos(x, y) {
    px = x; py = y;
    scooter.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
    var z = zoneAt(x, y);
    if (z !== current) setZone(z);
  }

  /* --- autoplay along the route --- */
  var L = route.getTotalLength();
  var auto = !reduceMotion, dragging = false;
  var dist = 0, speed = 1, last = 0, holdUntil = 0, raf = 0, visible = true;

  function nearestDist() {
    var best = 0, bd = Infinity, n = 400;
    for (var i = 0; i < n; i++) {
      var d = (i / n) * L, p = route.getPointAtLength(d);
      var k = (p.x - px) * (p.x - px) + (p.y - py) * (p.y - py);
      if (k < bd) { bd = k; best = d; }
    }
    return best;
  }

  function frame(t) {
    if (!last) last = t;
    var dt = Math.min(t - last, 50);
    last = t;
    if (auto && !dragging) {
      var target = ZONES[current].speed;
      if (current === 'red') {
        if (!holdUntil) holdUntil = t + 2200;        // stay stopped for a moment...
        target = t < holdUntil ? 0 : 0.45;            // ...then roll out of the zone
      } else holdUntil = 0;
      speed += (target - speed) * Math.min(dt / 180, 1);
      dist = (dist + speed * dt * 0.09) % L;
      var p = route.getPointAtLength(dist);
      setPos(p.x, p.y);
    }
    raf = requestAnimationFrame(frame);
  }

  function start() { if (!raf && visible) { last = 0; raf = requestAnimationFrame(frame); } }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  function setAuto(on) {
    auto = on;
    if (on) { dist = nearestDist(); speed = ZONES[current].speed; holdUntil = 0; }
  }

  var resumeTimer = 0;
  function resumeLater() {
    clearTimeout(resumeTimer);
    if (reduceMotion) return;
    resumeTimer = setTimeout(function () { if (!dragging) setAuto(true); }, 3000);
  }

  /* --- drag + keyboard --- */
  function toSvg(e) {
    var pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }
  function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }

  scooter.addEventListener('pointerdown', function (e) {
    dragging = true;
    if (auto) setAuto(false);
    scooter.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  scooter.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var p = toSvg(e);
    setPos(clamp(p.x, 20, 620), clamp(p.y, 20, 400));
  });
  function endDrag() { dragging = false; resumeLater(); }
  scooter.addEventListener('pointerup', endDrag);
  scooter.addEventListener('pointercancel', endDrag);

  scooter.addEventListener('keydown', function (e) {
    var step = e.shiftKey ? 30 : 12, dx = 0, dy = 0;
    if (e.key === 'ArrowLeft') dx = -step;
    else if (e.key === 'ArrowRight') dx = step;
    else if (e.key === 'ArrowUp') dy = -step;
    else if (e.key === 'ArrowDown') dy = step;
    else return;
    e.preventDefault();
    if (auto) setAuto(false);
    setPos(clamp(px + dx, 20, 620), clamp(py + dy, 20, 400));
    resumeLater();
  });

  /* --- init --- */
  var p0 = route.getPointAtLength(0);
  setPos(p0.x, p0.y);

  // Only animate while the demo is on screen
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      visible ? start() : stop();
    }, { threshold: 0.1 }).observe(svg);
  } else start();

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
