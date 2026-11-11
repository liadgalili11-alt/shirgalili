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

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
