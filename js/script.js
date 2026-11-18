/**
 * Kareem Mohamed — Portfolio Scripts
 * Interactive hero fight, project filtering, modal gallery, sound & animations.
 */
(function () {
  'use strict';

  var $ = function (i) {
    return document.getElementById(i);
  };

  /* ==========================================================================
     HERO: Interactive Pixel-Art Fight Canvas & Audio
     ========================================================================== */
  var cv = $('cv'),
    x = cv.getContext('2d'),
    fx = $('fx').getContext('2d'),
    sc = $('screen');

  x.imageSmoothingEnabled = false;

  var audio = new Audio('assets/mp3/gemini_generated_video_e686fff8.mp3');
  audio.preload = 'auto';

  var soundEnabled = true;
  var TOTAL = 70,
    I = [],
    loaded = 0,
    ready = false,
    goBtn = $('go');

  function onFrame() {
    loaded++;
    var pct = Math.round((loaded / TOTAL) * 100);
    $('loaderFill').style.width = pct + '%';
    $('loaderCount').textContent = loaded + ' / ' + TOTAL + ' FRAMES (' + pct + '%)';
    if (loaded >= TOTAL && !ready) {
      ready = true;
      setTimeout(function () {
        $('loader').classList.add('hidden');
        goBtn.disabled = false;
        updateBtn();
        draw(0);
        toast('FIGHTERS READY!');
      }, 150);
    }
  }

  for (var k = 1; k <= TOTAL; k++) {
    var im = new Image();
    im.onload = onFrame;
    im.onerror = onFrame;
    im.src = 'assets/images-light/frame_' + (k < 10 ? '00' : k < 100 ? '0' : '') + k + '.jpg';
    I.push(im);
  }

  var C = [
    [0, 18, 'ROUND 0', 'Face-off', 'Software engineer by day, Muay Thai by habit.'],
    [19, 32, 'ROUND 1', 'Charging up', 'Backend, APIs and offline sync, built before strike lands.'],
    [33, 42, 'ROUND 1', 'Firewall up', 'Fraud prevention, secure voting: 400k+ registrations in a week.'],
    [43, 48, 'ROUND 2', 'Ship under pressure', 'Fawry POS SDK certified on the first submission.'],
    [49, 50, 'ROUND 3', 'Reset & adapt', 'Pressure tests design. Both disciplines adjust.'],
    [51, 54, 'K.O.', 'Impact!', 'Where discipline meets engineering.'],
    [55, 69, 'BALANCE', 'Calm suit. Ready fists.', 'This is how I build, and how I train.']
  ];

  var st = 'idle',
    ci = 0,
    P = [],
    xp = 0,
    playStart = 0,
    DUR = 142.86;

  function cap(i) {
    for (var k = 0; k < C.length; k++) {
      if (i >= C[k][0] && i <= C[k][1]) {
        var t = $('tag');
        if (t.textContent !== C[k][2]) {
          t.textContent = C[k][2];
          t.style.animation = 'none';
          void t.offsetWidth;
          t.style.animation = 'tg .35s cubic-bezier(.2,1.4,.4,1)';
        }
        $('ct').textContent = C[k][3];
        $('cp').textContent = C[k][4];
        break;
      }
    }
  }

  var lastE = -1, lastF = -1;
  function bars(i) {
    var e = i < 44 ? 100 : i < 49 ? 90 : i < 51 ? 80 : 100,
      f = i < 36 ? 100 : i < 44 ? 75 : i < 49 ? 50 : i < 55 ? 20 : 100;
    if (e !== lastE) {
      var elE = $('he');
      elE.style.width = e + '%';
      elE.style.background = e < 40 ? '#e23b3b' : e < 75 ? '#f5b700' : '#18b957';
      lastE = e;
    }
    if (f !== lastF) {
      var elF = $('hf');
      elF.style.width = f + '%';
      elF.style.background = f < 40 ? '#e23b3b' : f < 75 ? '#f5b700' : '#18b957';
      lastF = f;
    }
  }

  function spawn(n, o) {
    for (var k = 0; k < n; k++) {
      var a = Math.random() * 6.283,
        s = o.s * (0.4 + Math.random());
      P.push({
        x: o.x,
        y: o.y,
        vx: o.dir ? o.dir * (2 + Math.random() * s) : Math.cos(a) * s,
        vy: o.dir ? (Math.random() - 0.5) * s : Math.sin(a) * s,
        c: o.c ? o.c[Math.floor(Math.random() * o.c.length)] : '#18b957',
        t: o.t ? o.t[Math.floor(Math.random() * o.t.length)] : null,
        l: 1
      });
    }
  }

  function fxFor(i) {
    if (i === 44 || i === 48) {
      spawn(24, { x: 440, y: 380, dir: 1, s: 5, t: ['0', '1', '{}', '</>', 'GET', 'POST'] });
    }
    if (i === 51 || i === 52) {
      spawn(80, { x: 640, y: 360, s: 15, c: ['#18b957', '#f5b700', '#e23b3b', '#ffffff'] });
      sc.classList.add('shake');
      setTimeout(function () {
        sc.classList.remove('shake');
      }, 380);
    }
  }

  var lastFrame = -1;
  function draw(i) {
    if (!I[i] || !I[i].complete) return;
    if (i !== lastFrame || st === 'play') {
      x.clearRect(0, 0, 1280, 720);
      x.drawImage(I[i], 0, 0, 1280, 720);
      cap(i);
      bars(i);
      lastFrame = i;
    }
    if (st === 'play') fxFor(i);
  }

  var ICON_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l13-8z" fill="currentColor"/></svg>',
    ICON_REPLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5V2L7 6l5 4V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z" fill="currentColor"/></svg>';

  function updateBtn() {
    goBtn.classList.toggle('hide', st === 'play');
    goBtn.innerHTML = st === 'end' ? ICON_REPLAY : ICON_PLAY;
    goBtn.setAttribute('aria-label', st === 'end' ? 'Fight again' : 'Start fight');
  }

  goBtn.onclick = function (e) {
    e.stopPropagation();
    if (!ready) return;
    if (st === 'play') {
      ci = 69;
      st = 'end';
      audio.pause();
      gain(50);
      toast('FIGHT COMPLETED! +50 XP');
    } else {
      st = 'play';
      ci = 0;
      playStart = performance.now();
      if (soundEnabled) {
        audio.currentTime = 0;
        audio.play().catch(function () {});
      }
    }
    updateBtn();
  };

  var heroVisible = true;
  var fxNeedsClear = false;

  function tick(t) {
    if (ready && heroVisible) {
      var f = 0;
      if (st === 'idle') {
        f = Math.floor(t / 260) % 8;
      } else if (st === 'play') {
        f = soundEnabled && !audio.paused && audio.duration
          ? Math.floor((audio.currentTime / audio.duration) * TOTAL)
          : Math.floor((t - playStart) / DUR);
        if (f >= TOTAL) {
          f = 57;
          st = 'end';
          audio.pause();
          gain(100);
          toast('VICTORY! +100 XP');
          updateBtn();
        }
        ci = f;
      } else {
        f = 57 + (Math.floor(t / 140) % 12);
        ci = f;
      }
      draw(f);

      if (P.length > 0) {
        fx.clearRect(0, 0, 1280, 720);
        fx.font = 'bold 24px monospace';
        P = P.filter(function (p) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.08;
          p.l -= 0.02;
          if (p.l <= 0) return false;
          fx.globalAlpha = p.l;
          fx.fillStyle = p.c;
          if (p.t) fx.fillText(p.t, p.x, p.y);
          else fx.fillRect(p.x, p.y, 7, 7);
          return true;
        });
        fxNeedsClear = true;
      } else if (fxNeedsClear) {
        fx.clearRect(0, 0, 1280, 720);
        fxNeedsClear = false;
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  sc.addEventListener('click', function (e) {
    if (e.target.closest('.deck') || e.target.closest('.ov-top') || !ready) return;
    var r = sc.getBoundingClientRect(),
      px = e.clientX - r.left,
      py = e.clientY - r.top,
      left = px < r.width / 2;
    var L = left
      ? ['// ship it', 'git push', 'deploy ok', '0 bugs*', '200 OK']
      : ['OSS!', 'kick!', 'tak!', 'focus.', 'knee!'];
    var b = document.createElement('div');
    b.className = 'bub px';
    b.textContent = L[Math.floor(Math.random() * L.length)];
    b.style.left = px + 'px';
    b.style.top = py + 'px';
    sc.appendChild(b);
    setTimeout(function () {
      b.remove();
    }, 1200);
    spawn(12, {
      x: (px / r.width) * 1280,
      y: (py / r.height) * 720,
      s: 6,
      t: left ? ['0', '1'] : null,
      c: left ? ['#18b957', '#fff'] : ['#f5b700', '#e23b3b']
    });
    gain(2);
  });

  var tt;
  function toast(m) {
    var t = $('toast');
    t.textContent = m;
    t.classList.add('on');
    clearTimeout(tt);
    tt = setTimeout(function () {
      t.classList.remove('on');
    }, 2000);
  }

  function gain(n) {
    var o = Math.floor(xp / 50);
    xp += n;
    $('xp').textContent = 'XP ' + xp;
    var l = Math.floor(xp / 50);
    if (l > o) toast('LEVEL UP! LV ' + (l + 1));
  }

  /* ==========================================================================
     NAV + FLOATING RESUME
     ========================================================================== */
  var menuBtn = $('menuBtn'),
    links = $('links');

  menuBtn.onclick = function () {
    var o = links.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', o);
  };

  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      links.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      function (en) {
        heroVisible = en[0].isIntersecting;
        if (heroVisible) {
          lastFrame = -1;
        }
      },
      { threshold: 0.1 }
    ).observe($('hero'));
  }

  /* ==========================================================================
     EXPERIENCE
     ========================================================================== */
  var JOBS = [
    {
      r: 'Software Engineer',
      co: 'Cyrus Technology · Cairo',
      type: 'Full-time',
      when: 'Mar 2024 – Present',
      now: 1,
      desc: 'Contributed to building enterprise B2B solutions across FinTech, Retail Management, E-Invoicing, and Multi-Tenant SaaS platforms.',
      pts: [
        '<b>Offline-First RMS:</b> Led the development of an offline-first Retail Management System, implementing data synchronization, state management, logging, and backup mechanisms.',
        '<b>Fawry Payment Integration:</b> Integrated the Fawry POS Payment SDK, delivering secure payment workflows, handling transaction edge cases, and passing production certification on the first submission.',
        '<b>Legacy WinForms Modernization:</b> Led the refactoring and migration of a legacy WinForms E-Invoicing application to a modern WPF MVVM architecture, improving maintainability, scalability, performance, and user experience.',
        '<b>ETA Multi-Tenant Migration:</b> Contributed to transitioning the Egyptian Tax Authority (ETA) e-invoicing platform to multi-tenant SaaS through architectural ideation, UX improvements, and frontend development.'
      ]
    },
    {
      r: 'Full-Stack Developer',
      co: 'United Media Services (via Clicks Egypt Outsource) · Cairo',
      type: 'Full-time',
      when: 'Feb 2022 – Jan 2024',
      desc: 'Built mission-critical full-stack platforms and systems for United Media Services (UMS), delivering government initiatives, national competitions, event management platforms, charity organizations, and e-learning systems serving hundreds of thousands of users.',
      pts: [
        '<b>Dawlet El Telawa:</b> Engineered the platform for a high-traffic national competition, handling 400,000+ registrations within one week while implementing fraud prevention, secure voting, and rate limiting.',
        '<b>Alamein Festival:</b> Developed full-stack services and operational portals for a large-scale national event management platform, supporting operations across two consecutive festival seasons.',
        '<b>Resala Platform:</b> Contributed to large-scale charity systems with FinTech integrations, supporting donation and operational workflows.',
        '<b>Media & Learning Platforms:</b> Delivered full-stack web applications and services for UMA E-Learning, UMS Podcast, and additional media platforms with a focus on performance, availability, and maintainability.'
      ]
    },
    {
      r: 'Sole Engineer',
      co: 'Fentec Mobility · Algeria',
      type: 'Freelance',
      when: '2022 – 2023',
      desc: 'Architected and built the entire e-scooter mobility platform single-handedly from inception to launch, delivering customer mobile apps, IoT backend services, merchant point-of-sale apps, and internal fleet management & accounting panels.',
      pts: [
        '<b>Full-Stack & Mobile Ownership:</b> Solely developed the entire software ecosystem: cross-platform rider apps (trip booking & unlock), high-throughput backend services, merchant POS applications, and administrative control panels.',
        '<b>IoT & Geospatial Architecture:</b> Engineered real-time scooter telemetry and hardware control (lock/unlock), integrating Google Maps for dynamic multi-zone geofencing (green, orange, red zones) with ride verification.',
        '<b>Market-Adapted FinTech:</b> Solved cash-heavy market constraints by engineering a closed-loop cash-to-digital wallet network, enabling local retail merchants to verify identities and sell ride credits via dedicated POS apps.'
      ]
    }
  ];

  $('timeline').innerHTML = JOBS.map(function (j) {
    return (
      '<article class="job' +
      (j.now ? ' now' : '') +
      '"><div class="job-top"><div><h3 class="px">' +
      j.r +
      '</h3><div class="co">' +
      j.co +
      '</div></div><div class="when">' +
      j.when +
      '<br><span class="chip' +
      (j.now ? ' g' : '') +
      '">' +
      j.type +
      '</span></div></div>' +
      (j.desc ? '<p class="job-desc">' + j.desc + '</p>' : '') +
      '<ul>' +
      j.pts
        .map(function (p) {
          return '<li>' + p + '</li>';
        })
        .join('') +
      '</ul></article>'
    );
  }).join('');

  /* ==========================================================================
     PROJECTS
     ========================================================================== */
  var PROJ = {
    fentec: {
      n: 'Fentec Mobility',
      cat: 'Mobile',
      role: 'Fentec (Algeria) · Sole engineer',
      featured: true,
      caseStudy: true,
      caseStudyUrl: 'fentec.html',
      img: 'assets/thumbnails/fentec.png',
      link: ['https://apps.apple.com/us/app/fentec-mobility/id6502032921', 'App Store'],
      sum: 'E-scooter sharing app with IoT lock control, wallet payments and a kiosk seller network.',
      tags: ['React Native', 'Laravel Octane', 'IoT', 'Redis'],
      scr: [
        ['assets/thumbnails/fentec.png', 'App Store listing'],
        ['assets/projects/fentec/1.png', 'Map and scooters'],
        ['assets/projects/fentec/2.png', 'Active trip'],
        ['assets/projects/fentec/3.png', 'Fleet operator CMS'],
        ['assets/projects/fentec/4.png', 'Kiosk seller app']
      ],
      d: 'Per-second scooter telemetry goes through Redis so the main database stays safe under fleet load. A vector-based geofencing engine blocks restricted zones. Because digital payments were limited in Algeria, I built a cash-to-digital wallet network with kiosk apps and a settlement portal.'
    },
    cyrus: {
      n: 'Cyrus RMS Offline POS',
      cat: 'Enterprise',
      role: 'Cyrus Technology · Lead on architecture',
      featured: true,
      caseStudy: true,
      caseStudyUrl: 'cyrus.html',
      img: 'assets/thumbnails/rms.png',
      sum: 'Offline-first desktop POS with dependency-aware data sync, financial integrity, and multi-currency cash reconciliation.',
      tags: ['Electron', 'React', 'TypeScript', 'SQL Server'],
      scr: [
        ['assets/projects/cyrus/pos.webp', 'Main sales POS interface with live stock availability'],
        ['assets/projects/cyrus/sync.webp', 'Dependency-aware data synchronization engine'],
        ['assets/projects/cyrus/orders.webp', 'Session orders and post-sync payment update workflows'],
        ['assets/projects/cyrus/session.webp', 'Session details & cash reconciliation by currency'],
        ['assets/projects/cyrus/report.webp', 'Printable end-of-session financial summary report']
      ],
      d: 'Offline-first desktop POS built with Electron, React, TypeScript, and SQL Server. Designed to maintain business continuity during internet outages with transactional local data persistence, dependency-aware sync to the central cloud platform, multi-currency session reconciliation, and automated deployment tooling.'
    },
    eysalak: {
      n: 'Eysalak',
      cat: 'FinTech',
      role: 'Cyrus Technology · Android POS & Mobile',
      featured: true,
      caseStudy: true,
      caseStudyUrl: 'esalek.html',
      img: 'assets/thumbnails/eysalak.png',
      sum: 'Smart Android POS with Fawry payments, PAX thermal printing, and Egyptian Tax Authority electronic receipts.',
      tags: ['React Native', 'Fawry SDK', 'ETA E-Receipt', 'PAX'],
      scr: [
        ['assets/projects/esalek/app.webp', 'Eysalak mobile home screen: shift summary & quick actions'],
        ['assets/projects/esalek/admin.webp', 'Eysalak company management & ETA environment integration'],
        ['assets/projects/gs/1.png', 'PAX terminal POS checkout interface'],
        ['assets/projects/gs/2.png', 'Fawry card payment flow'],
        ['assets/projects/gs/4.png', 'ETA-compliant electronic receipt'],
        ['assets/projects/gs/5.png', 'Void and transaction audit history']
      ],
      d: 'Smart Android POS built with React Native and native Android modules (Java/Kotlin) in strategic partnership with Fawry. Unifies sales, shift management, card payments, PAX thermal printing with Arabic text shaping, and ETA fiscal electronic receipts on PAX terminals and standard Android devices.'
    },
    dawlet: {
      n: 'Dawlet El Telawa',
      cat: 'Government',
      role: 'United Media Services · Backend',
      featured: true,
      img: 'assets/thumbnails/dawlet-eltelawa.png',
      link: ['https://dawlataltilawa.clicksegypt.net/', 'Live site'],
      sum: 'National Quran competition platform: 400K+ registrations in its first week.',
      tags: ['Laravel', 'hCaptcha', 'Fingerprinting', 'Cloudflare'],
      scr: [1, 2, 3, 4].map(function (n) {
        return [
          'assets/projects/dawlet-eltelawa/' + n + '.png',
          ['Public voting page', 'Contestant showcase', 'Anti-abuse stack', 'Cluster monitoring'][n - 1]
        ];
      }),
      d: 'Layered fraud defense: request signatures, hCaptcha, IP rate limiting, browser fingerprinting, and scheduled jobs that detect and purge suspicious clusters.'
    },
    resala: {
      n: 'Resala Platform',
      cat: 'FinTech',
      role: 'United Media Services · Backend',
      img: 'assets/thumbnails/resala.png',
      link: ['https://resala.org/', 'Live site'],
      sum: 'Donation platform with payment gateways and automated tracking for a large Egyptian charity.',
      tags: ['Laravel', 'Payments', 'Auditing'],
      scr: [
        ['assets/projects/resala/1-campaign.webp', 'Campaign portal: Winter donation drive & digital payment channels'],
        ['assets/projects/resala/2-news.webp', 'Initiatives & impact: National alliance aid convoys & Eid distributions'],
        ['assets/projects/resala/3-fieldwork.webp', 'Fieldwork & engagement: Volunteer signups, donation actions & photo gallery'],
        ['assets/projects/resala/4-media.webp', 'Media & programs: Relief campaign videos & official contacts']
      ],
      d: 'Payment gateway integration, recurring donations and automatic receipts, built to handle traffic spikes during national campaigns.'
    },
    watchit: {
      n: 'WatchIT Script Portal',
      cat: 'Media & Edu',
      role: 'United Media Services · Backend',
      img: 'assets/thumbnails/watchit.png',
      link: ['https://content.watchit.com/', 'Live site'],
      sum: 'Role-based script evaluation and workflow platform for WatchIT original productions.',
      tags: ['Laravel', 'RBAC', 'Document Management', 'REST API'],
      scr: [
        ['assets/projects/watchit/1-hero.webp', 'Hero: Bring Your Craft to Screen with WATCH IT'],
        ['assets/projects/watchit/2-how-it-works.webp', 'Application workflow: Profile creation, script submission & tracking'],
        ['assets/projects/watchit/3-features.webp', 'Creator platform: Original productions, regional reach & IP protection'],
        ['assets/projects/watchit/4-faqs.webp', 'Evaluation FAQs: Review timelines & submission guidelines']
      ],
      d: 'Engineered a role-based script evaluation and management platform for WatchIT original productions, allowing creative teams, directors, and executives to submit, annotate, review, and approve scripts securely.'
    },
    alamein: {
      n: 'Al-Alamein Festival',
      cat: 'Government',
      role: 'United Media Services · Backend',
      img: 'assets/thumbnails/elalamien.png',
      link: ['https://elalameinfestival.com', 'Live site'],
      sum: 'Event management platform for Egypt’s national festival, used for two seasons.',
      tags: ['Laravel', 'Flutter', 'React', 'REST API'],
      scr: [
        ['assets/thumbnails/elalamien.png', 'Festival portal'],
        ['assets/projects/elalamin/1.png', 'Operations dashboard'],
        ['assets/projects/elalamin/2.png', 'Schedule manager'],
        ['assets/projects/elalamin/3.png', 'Mobile companion']
      ],
      d: 'REST APIs serving both a React web app and a Flutter mobile app, built for live event traffic.'
    },
    matchpass: {
      n: 'Match Pass',
      cat: 'Enterprise',
      role: 'UMS-backed · Backend',
      img: 'assets/thumbnails/matchpass.png',
      sum: 'Sports ticketing with stadium seat maps, tiered pricing and full audit logs.',
      tags: ['Laravel', 'React', 'RBAC', 'Audit logs'],
      scr: [
        ['1', 'Analytics dashboard'],
        ['2', 'Stadium seating map'],
        ['3', 'Match manager']
      ].map(function (s) {
        return ['assets/projects/instasports/' + s[0] + '.png', s[1]];
      }),
      d: 'Role-based access scoped for admins, supervisors and suppliers. Every transaction keeps before/after snapshots.'
    },
    uma: {
      n: 'UMA Academy',
      cat: 'Media & Edu',
      role: 'United Media Services · Backend',
      img: 'assets/thumbnails/uma.png',
      link: ['https://uma-eg.com/', 'Live site'],
      sum: 'Scholarship platform with bilingual CMS, multi-step applications and a virtual coin marketplace.',
      tags: ['Laravel', 'React', 'Bilingual'],
      scr: [
        ['assets/thumbnails/uma.png', 'Homepage'],
        ['assets/projects/uma/1.png', 'Course catalog'],
        ['assets/projects/uma/2.png', 'Application flow'],
        ['assets/projects/uma/3.png', 'Coin bidding']
      ],
      d: 'Full Arabic and English support, student dashboards, portfolio uploads and an auction system for scholarship courses.'
    },
    sphinx: {
      n: 'Sphinx Travel',
      cat: 'Mobile',
      role: 'Client project · Backend + mobile',
      img: 'assets/thumbnails/sphinx.png',
      link: ['https://apps.apple.com/eg/app/sphinx-travel/id6482297668', 'App Store'],
      sum: 'Travel app for hotels, tours, restaurants and car rentals, with in-app chat.',
      tags: ['React Native', 'Laravel', 'Google OAuth'],
      scr: [
        ['assets/thumbnails/sphinx.png', 'App Store listing'],
        ['assets/projects/sphinx/1.png', 'Explore feed'],
        ['assets/projects/sphinx/2.png', 'Room booking']
      ],
      d: 'Google sign-in, in-app messaging, live currency conversion and push notifications.'
    },
    dropship: {
      n: 'Drop Shipping Tracker',
      cat: 'SaaS',
      role: 'UK client · Backend',
      img: 'assets/thumbnails/dropshiping.png',
      sum: 'Tracks Amazon UK and Costco stock and prices for eBay sellers and alerts agents instantly.',
      tags: ['Laravel Octane', 'Reverb', 'Scraping'],
      scr: [
        ['1', 'Alert center'],
        ['2', 'Catalog mapping']
      ].map(function (s) {
        return ['assets/projects/dropshiping/' + s[0] + '.png', s[1]];
      }),
      d: 'Scraping workers replaced a manual checking team. Alerts reach agents over WebSockets so listings stay within eBay policy.'
    },
    podcast: {
      n: 'UMS Podcast',
      cat: 'Media & Edu',
      role: 'United Media Services · Backend',
      img: 'assets/thumbnails/ums-podcast.png',
      link: ['https://umspodcast.com/', 'Live site'],
      sum: 'Digital media and audio content platform powering the United Media Services podcast network.',
      tags: ['Laravel', 'REST API', 'Audio Streaming', 'CMS'],
      scr: [
        ['assets/projects/ums-podcast/1-homepage-hero.webp', 'Homepage: Featured shows, recent stories & trending episodes'],
        ['assets/projects/ums-podcast/2-shows-catalog.webp', 'Programs catalog: Full podcast directory & presenters'],
        ['assets/projects/ums-podcast/3-articles-hub.webp', 'Editorial hub: Featured stories & newsletter subscription'],
        ['assets/projects/ums-podcast/4-articles-archive.webp', 'Articles archive: Categorized media publications']
      ],
      d: 'Developed backend services, content management workflows, and high-availability media distribution for the UMS Podcast network.'
    }
  };

  var ids = Object.keys(PROJ),
    cats = ['All'],
    cur = 'All';

  ids.forEach(function (id) {
    if (cats.indexOf(PROJ[id].cat) < 0) cats.push(PROJ[id].cat);
  });

  $('filters').innerHTML = cats
    .map(function (c) {
      return (
        '<button class="fbtn' +
        (c === 'All' ? ' active' : '') +
        '" data-c="' +
        c +
        '">' +
        c.toUpperCase() +
        (c === 'All' ? ' (' + ids.length + ')' : '') +
        '</button>'
      );
    })
    .join('');

  var isExpanded = false;
  var loadMoreWrap = $('loadMoreWrap');
  var loadMoreBtn = $('loadMoreBtn');

  function renderGrid() {
    var filteredIds = ids.filter(function (id) {
      return cur === 'All' || PROJ[id].cat === cur;
    });

    var visibleIds;
    if (cur === 'All') {
      if (!isExpanded) {
        visibleIds = filteredIds.slice(0, 3);
        if (loadMoreWrap && loadMoreBtn) {
          loadMoreWrap.style.display = 'flex';
          loadMoreBtn.textContent = '↓ LOAD MORE PROJECTS (' + (filteredIds.length - 3) + ' MORE)';
        }
      } else {
        visibleIds = filteredIds;
        if (loadMoreWrap && loadMoreBtn) {
          loadMoreWrap.style.display = 'flex';
          loadMoreBtn.textContent = '↑ SHOW LESS';
        }
      }
    } else {
      visibleIds = filteredIds;
      if (loadMoreWrap) {
        loadMoreWrap.style.display = 'none';
      }
    }

    $('grid').innerHTML = visibleIds
      .map(function (id) {
        var p = PROJ[id];
        var badgeHtml = p.caseStudy
          ? '<span class="badge-cs px">CASE STUDY</span>'
          : '';

        if (p.caseStudyUrl) {
          return (
            '<a class="pc is-case-study" href="' +
            p.caseStudyUrl +
            '" aria-label="Read ' +
            p.n +
            ' case study">' +
            '<div class="thumb">' +
            badgeHtml +
            '<img src="' +
            p.img +
            '" alt="' +
            p.n +
            ' screenshot" loading="lazy"></div><div class="pb"><h3 class="px">' +
            p.n +
            '</h3><div class="role">' +
            p.role +
            '</div><p>' +
            p.sum +
            '</p>' +
            '</div></a>'
          );
        }

        return (
          '<div class="pc' +
          (p.caseStudy ? ' is-case-study' : '') +
          '" tabindex="0" role="button" aria-label="Open ' +
          p.n +
          ' details" onclick="openModal(\'' +
          id +
          '\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();openModal(\'' +
          id +
          '\');}">' +
          '<div class="thumb">' +
          badgeHtml +
          '<img src="' +
          p.img +
          '" alt="' +
          p.n +
          ' screenshot" loading="lazy"></div><div class="pb"><h3 class="px">' +
          p.n +
          '</h3><div class="role">' +
          p.role +
          '</div><p>' +
          p.sum +
          '</p>' +
          '</div></div>'
        );
      })
      .join('');
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function () {
      isExpanded = !isExpanded;
      renderGrid();
      if (!isExpanded) {
        var pSection = $('projects');
        if (pSection) pSection.scrollIntoView({ behavior: 'smooth' });
      }
      if (window.revealNow) window.revealNow($('grid'));
    });
  }

  $('filters').addEventListener('click', function (e) {
    var b = e.target.closest('.fbtn');
    if (!b) return;
    cur = b.dataset.c;
    document.querySelectorAll('.fbtn').forEach(function (f) {
      f.classList.toggle('active', f === b);
    });
    if (cur === 'All') isExpanded = false;
    renderGrid();
    if (window.revealNow) window.revealNow($('grid'));
  });

  renderGrid();

  /* ==========================================================================
     MODAL
     ========================================================================== */
  var pid = null,
    idx = 0,
    lastFocus = null;

  function openModal(id) {
    pid = id;
    idx = 0;
    lastFocus = document.activeElement;
    var p = PROJ[id];
    $('mTitle').textContent = p.n.toUpperCase();
    var csAction = '';
    if (p.caseStudyUrl) {
      csAction =
        '<p style="margin-top:14px"><a class="btn" href="' +
        p.caseStudyUrl +
        '" style="background:var(--green);color:#fff">▶ READ FULL CASE STUDY</a></p>';
    } else if (p.caseStudy) {
      csAction =
        '<p style="margin-top:14px"><span class="badge-cs-modal px">★ FEATURED CASE STUDY</span></p>';
    }
    $('mDetails').innerHTML =
      '<h4>' +
      p.role +
      '</h4><p>' +
      p.d +
      '</p>' +
      csAction +
      (p.link
        ? '<p style="margin-top:12px"><a class="btn alt" href="' +
          p.link[0] +
          '" target="_blank" rel="noopener noreferrer">' +
          p.link[1].toUpperCase() +
          ' ↗</a></p>'
        : '');
    showImg();
    $('modal').classList.add('on');
    document.body.style.overflow = 'hidden';
    gain(5);
    document.querySelector('.mx').focus();
  }

  function showImg() {
    var p = PROJ[pid],
      s = p.scr[idx];
    $('mImg').src = s[0];
    $('mImg').alt = p.n + ': ' + s[1];
    $('mCap').textContent = s[1];
    $('mCount').textContent = idx + 1 + ' / ' + p.scr.length;
    document.querySelectorAll('.nv').forEach(function (b) {
      b.style.display = p.scr.length > 1 ? '' : 'none';
    });
  }

  function step(d) {
    var n = PROJ[pid].scr.length;
    idx = (idx + d + n) % n;
    showImg();
  }

  function closeModal() {
    $('modal').classList.remove('on');
    document.body.style.overflow = '';
    pid = null;
    if (lastFocus) lastFocus.focus();
  }

  $('modal').addEventListener('click', function (e) {
    if (e.target.id === 'modal') closeModal();
  });

  window.addEventListener('keydown', function (e) {
    if (!pid) return;
    if (e.key === 'Escape') closeModal();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  });

  window.openModal = openModal;
  window.closeModal = closeModal;
  window.step = step;

  /* ==========================================================================
     SKILLS
     ========================================================================== */
  var SK = [
    {
      title: 'Primary Backend Stack',
      featured: true,
      desc: 'Extensive production experience building high-concurrency systems, distributed architectures, and robust APIs. Strong Laravel/PHP foundation actively transitioned to Java & Spring Boot over the past year.',
      chips: [
        { name: 'Java', primary: true },
        { name: 'Spring Boot', primary: true },
        { name: 'Laravel', primary: true },
        { name: 'PHP 8+', primary: true },
        { name: 'RESTful APIs', primary: true },
        { name: 'System Design & High Concurrency', primary: true },
        { name: 'Multi-tenant SaaS Architecture' },
        { name: 'Distributed Systems' },
        { name: 'Queues, Workers & Asynchronous Jobs' },
        { name: 'WebSockets & Realtime Events' }
      ]
    },
    {
      title: 'Secondary: Client & Frontend',
      featured: true,
      desc: 'Frontend and mobile client applications built to interface seamlessly with backend services.',
      chips: [
        { name: 'TypeScript' },
        { name: 'React' },
        { name: 'Vue.js' },
        { name: 'Tailwind CSS' },
        { name: 'React Native' },
        { name: 'Electron' },
        { name: 'Native Android Modules (Java/Kotlin)' }
      ]
    },
    {
      title: 'Cloud, DevOps & CI/CD',
      desc: 'Containerized services, automated deployment pipelines, and high-availability server configuration.',
      chips: [
        { name: 'Docker', primary: true },
        { name: 'GitHub Actions (CI/CD)', primary: true },
        { name: 'Linux (Ubuntu/Debian)', primary: true },
        { name: 'Google Cloud Services' },
        { name: 'Firebase' },
        { name: 'Nginx Reverse Proxy' },
        { name: 'Cloudflare CDN & WAF' }
      ]
    },
    {
      title: 'Testing & Code Quality',
      desc: 'Enterprise-grade testing suites, automated regression testing, and strict code reliability standards.',
      chips: [
        { name: 'JUnit 5 & Mockito', primary: true },
        { name: 'PHPUnit & Pest', primary: true },
        { name: 'Integration Testing', primary: true },
        { name: 'API Automation & Postman' },
        { name: 'Static Analysis & Code Quality' }
      ]
    },
    {
      title: 'Databases & Messaging',
      desc: 'High-availability data stores, caching layers, and decoupled event processing.',
      chips: [
        { name: 'PostgreSQL', primary: true },
        { name: 'MySQL', primary: true },
        { name: 'SQL Server' },
        { name: 'Redis (Caching & Pub/Sub)', primary: true },
        { name: 'Query Optimization & Indexing' }
      ]
    }
  ];

  $('skillsBox').innerHTML = SK.map(function (c) {
    return (
      '<div class="cart' +
      (c.featured ? ' featured' : '') +
      '">' +
      '<div class="cart-head">' +
      '<h3 class="px">' +
      c.title.toUpperCase() +
      '</h3>' +
      '</div>' +
      '<p class="cart-desc">' +
      c.desc +
      '</p>' +
      '<div class="cart-chips">' +
      c.chips
        .map(function (s) {
          return (
            '<span class="chip' +
            (s.primary ? ' primary' : '') +
            '">' +
            s.name +
            '</span>'
          );
        })
        .join('') +
      '</div>' +
      '</div>'
    );
  }).join('');

  /* ==========================================================================
     INTERACTIONS: cursor, reveals, scroll progress
     ========================================================================== */
  sc.addEventListener('mousemove', function (e) {
    var r = sc.getBoundingClientRect();
    var right = e.clientX - r.left > r.width / 2;
    sc.classList.toggle('fighter', right);
    sc.classList.toggle('engineer', !right);
  });

  sc.addEventListener('mouseleave', function () {
    sc.classList.remove('fighter', 'engineer', 'punch');
  });

  sc.addEventListener('mousedown', function () {
    sc.classList.add('punch');
  });

  window.addEventListener('mouseup', function () {
    sc.classList.remove('punch');
  });

  var rm = window.matchMedia('(prefers-reduced-motion:reduce)').matches,
    hasIO = 'IntersectionObserver' in window;

  function countUp(b) {
    var m = /^(\d+)(.*)$/.exec(b.textContent);
    if (!m) return;
    var n = +m[1],
      suf = m[2],
      t0 = performance.now();
    (function f(t) {
      var k = Math.min((t - t0) / 900, 1);
      b.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))) + suf;
      if (k < 1) requestAnimationFrame(f);
    })(t0);
  }

  if (hasIO && !rm) {
    var io = new IntersectionObserver(
      function (en) {
        en.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add('in');
          if (e.target.classList.contains('stat')) countUp(e.target.querySelector('b'));
          io.unobserve(e.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document
      .querySelectorAll('.tag-h,h2.t,.panel,.stat,.job,.filters,.pc,.cart,.contact')
      .forEach(function (el) {
        var i = Array.prototype.indexOf.call(el.parentNode.children, el);
        el.style.setProperty('--d', Math.min(i, 5) * 70 + 'ms');
        el.classList.add('rv');
        io.observe(el);
      });
  }

  window.revealNow = function (root) {
    if (rm) return;
    root.querySelectorAll('.pc').forEach(function (c, i) {
      c.classList.add('rv', 'in');
      c.style.setProperty('--d', (i % 3) * 70 + 'ms');
    });
  };

  var prog = $('prog');
  var scrollScheduled = false;
  function updateScrollProgress() {
    var h = document.documentElement,
      m = h.scrollHeight - h.clientHeight;
    var ratio = m > 0 ? h.scrollTop / m : 0;
    prog.style.transform = 'scaleX(' + Math.min(Math.max(ratio, 0), 1) + ')';
    scrollScheduled = false;
  }
  function onScroll() {
    if (!scrollScheduled) {
      scrollScheduled = true;
      requestAnimationFrame(updateScrollProgress);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  updateScrollProgress();

  if (hasIO) {
    var spy = {};
    document.querySelectorAll('.links a').forEach(function (a) {
      spy[a.getAttribute('href')] = a;
    });
    var so = new IntersectionObserver(
      function (en) {
        en.forEach(function (e) {
          if (!e.isIntersecting) return;
          for (var k in spy) spy[k].classList.remove('active');
          if (spy['#' + e.target.id]) spy['#' + e.target.id].classList.add('active');
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    ['about', 'experience', 'projects', 'skills', 'contact'].forEach(function (id) {
      so.observe($(id));
    });
  }

  /* ==========================================================================
     COPY EMAIL
     ========================================================================== */
  window.copyEmail = function () {
    navigator.clipboard
      .writeText($('emailVal').textContent)
      .then(function () {
        var b = $('copyBtn');
        b.textContent = 'COPIED!';
        toast('EMAIL COPIED! +10 XP');
        gain(10);
        setTimeout(function () {
          b.textContent = 'COPY EMAIL';
        }, 2000);
      })
      .catch(function () {
        toast('EMAIL: kareem.mohamed.swd@gmail.com');
      });
  };
})();
