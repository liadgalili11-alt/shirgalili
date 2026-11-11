/* שיר גלילי - סקריפט קל לאתר (בלי ספריות) */
(function () {
  'use strict';

  var WHATSAPP = '972544572696';

  /* הקישור מהביו באינסטגרם מגיע כ-#about?utm_source=... - מנקים את הכתובת ונשארים בראש העמוד,
     כדי שהעמוד לא "יקפוץ" למטה מיד אחרי הטעינה */
  if (window.location.hash.indexOf('?') > -1) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }

  /* כותרת עליונה - קו תחתון אחרי גלילה */
  var header = document.querySelector('.header');
  var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 10); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* תפריט מובייל */
  var menuBtn = document.querySelector('.menu-btn');
  var mobileNav = document.getElementById('mobile-nav');
  var setMenu = function (open) {
    mobileNav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'סגירת התפריט' : 'פתיחת התפריט');
  };
  menuBtn.addEventListener('click', function () {
    setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
  });
  mobileNav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* סימון הפריט הפעיל בתפריט */
  var navLinks = document.querySelectorAll('.nav a');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          if (a.getAttribute('href') === '#' + entry.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    navLinks.forEach(function (a) {
      var el = document.getElementById(a.getAttribute('href').slice(1));
      if (el) spy.observe(el);
    });
    spy.observe(document.getElementById('top')); /* בראש העמוד אף פריט לא מסומן */
  }

  /* רילסים - נטענים רק כשמתקרבים אליהם, כדי שהעמוד ייפתח מהר */
  var reels = document.querySelectorAll('.reel[data-reel]');
  var loadReel = function (card) {
    if (card.querySelector('iframe')) return;
    var frame = document.createElement('iframe');
    frame.src = 'https://www.instagram.com/reel/' + card.dataset.reel + '/embed/';
    frame.title = 'רילס ' + (Array.prototype.indexOf.call(reels, card) + 1) + ' של שיר גלילי באינסטגרם';
    frame.loading = 'lazy';
    frame.allowFullscreen = true;
    frame.setAttribute('scrolling', 'no');
    card.appendChild(frame);
  };
  if ('IntersectionObserver' in window) {
    var reelObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { loadReel(entry.target); reelObserver.unobserve(entry.target); }
      });
    }, { rootMargin: '300px 300px' });
    reels.forEach(function (card) { reelObserver.observe(card); });
  } else {
    reels.forEach(loadReel);
  }

  var track = document.querySelector('.reels__track');
  document.querySelectorAll('.reels__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      /* ב-RTL גלילה "קדימה" היא לכיוון שמאל, כלומר ערך שלילי */
      var step = btn.dataset.dir === 'next' ? -296 : 296;
      track.scrollBy({ left: step, behavior: 'smooth' });
    });
  });

  /* טופס - שולח את הפרטים לשיר כהודעת וואטסאפ מוכנה */
  var form = document.getElementById('lead-form');
  var note = document.getElementById('form-note');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = new FormData(form);
    var text = [
      'היי שיר, אשמח לתאם שיחת היכרות.',
      'שם: ' + String(data.get('name')).trim(),
      'טלפון: ' + String(data.get('phone')).trim(),
      'גיל הילד/ה: ' + String(data.get('age')).trim()
    ].join('\n');
    var url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text);
    var win = window.open(url, '_blank');
    if (!win) window.location.href = url;
    note.dataset.state = 'done';
    note.textContent = 'וואטסאפ נפתח עם ההודעה מוכנה - נשאר רק ללחוץ "שלח".';
  });

  /* ── תנועה בגלילה (כבויה כשבמכשיר מוגדרת "הפחתת תנועה") ── */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('[data-reveal]');

  /* דירוג קל בין פריטים סמוכים (רשימות, בועות) */
  document.querySelectorAll('.focus-list, .chat').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (el, i) { el.style.setProperty('--d', (i * 110) + 'ms'); });
  });

  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); revealObserver.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ציטוט שנדלק מילה אחרי מילה תוך כדי גלילה */
  var quote = document.querySelector('[data-words]');
  var words = [];
  if (quote && !reduce) {
    var full = quote.textContent.trim();
    quote.setAttribute('aria-label', full);
    quote.innerHTML = full.split(/\s+/).map(function (w) {
      return '<span class="w" aria-hidden="true">' + w + '</span>';
    }).join(' ');
    words = quote.querySelectorAll('.w');
  }

  var clamp = function (n) { return Math.max(0, Math.min(1, n)); };
  /* 0 כשהאלמנט נכנס מלמטה, 1 כשהוא מגיע לגובה `end` של המסך */
  var progressOf = function (el, start, end) {
    var r = el.getBoundingClientRect(), vh = window.innerHeight;
    return clamp((vh * start - r.top) / (vh * (start - end)));
  };
  var bar = document.querySelector('.progress');
  var zooms = document.querySelectorAll('[data-zoom]');
  var art = document.querySelector('[data-progress]');
  var floaters = document.querySelectorAll('.float__item');
  var paused = false;
  var ticking = false;

  var update = function () {
    ticking = false;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    bar.style.setProperty('--scroll', max > 0 ? clamp(window.scrollY / max) : 0);
    if (reduce) return;
    if (words.length) {
      var lit = Math.round(progressOf(quote, 0.85, 0.35) * words.length);
      for (var i = 0; i < words.length; i++) words[i].classList.toggle('on', i < lit);
    }
    zooms.forEach(function (frame) {
      var p = progressOf(frame, 1, 0.1);
      var zoom = frame.dataset.zoom === 'in' ? 1.18 - 0.18 * p : 1 + 0.1 * clamp(window.scrollY / window.innerHeight);
      frame.style.setProperty('--zoom', zoom.toFixed(3));
    });
    if (art) art.style.setProperty('--p', progressOf(art, 1, 0.45).toFixed(3));
    if (!paused) {
      floaters.forEach(function (item) {
        var r = item.parentNode.getBoundingClientRect();
        if (r.bottom < -100 || r.top > window.innerHeight + 100) return;
        item.style.setProperty('--py', (r.top * -Number(item.dataset.speed)).toFixed(1) + 'px');
      });
    }
  };
  var requestUpdate = function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  update();

  /* כפתור עצירת אנימציות (נשמר לביקור הבא) */
  var toggle = document.querySelector('.motion-toggle');
  var setPaused = function (value) {
    paused = value;
    document.documentElement.classList.toggle('no-motion', value);
    toggle.setAttribute('aria-pressed', String(value));
    toggle.textContent = value ? 'הפעלת אנימציות' : 'עצירת אנימציות';
    try { localStorage.setItem('motion', value ? 'off' : 'on'); } catch (e) { /* אחסון חסום - לא נורא */ }
  };
  toggle.addEventListener('click', function () { setPaused(!paused); });
  try { if (localStorage.getItem('motion') === 'off') setPaused(true); } catch (e) { /* ממשיכים כרגיל */ }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
