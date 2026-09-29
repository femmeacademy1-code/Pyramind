/* Mystic Pyramid — small progressive enhancements. The page is fully readable without this file. */
(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Entrance animations ─────────────────────────────────────────── */
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ── Video: play with sound as soon as the browser allows it ─────── */
  var video = document.getElementById('usage-video');
  var toggle = document.querySelector('.sound-toggle');
  if (video && toggle) {
    toggle.hidden = false;
    var label = toggle.querySelector('span');
    var userMuted = false;
    var sync = function () {
      toggle.setAttribute('aria-pressed', String(!video.muted));
      label.textContent = video.muted ? 'הפעלת סאונד' : 'השתקה';
    };
    var quietPlay = function (p) { if (p && p.catch) p.catch(function () {}); return p; };

    var withSound = function () {
      video.muted = false;
      video.volume = 1;
      var p = video.play();
      sync();
      return p;
    };

    // Browsers only allow sound after the visitor interacts with the page,
    // so try right away and, if blocked, switch the sound on at the first tap/click/key.
    var unlockEvents = ['pointerdown', 'touchend', 'click', 'keydown'];
    var unlock = function (e) {
      if (e && e.target && e.target.closest && e.target.closest('.sound-toggle')) return;
      unlockEvents.forEach(function (t) { document.removeEventListener(t, unlock, true); });
      if (!userMuted && video.muted) quietPlay(withSound());
    };
    var p = withSound();
    if (p && p.catch) {
      p.catch(function () {
        video.muted = true;
        sync();
        quietPlay(video.play());
        unlockEvents.forEach(function (t) { document.addEventListener(t, unlock, true); });
      });
    }

    toggle.addEventListener('click', function () {
      if (video.muted) { userMuted = false; quietPlay(withSound()); }
      else { userMuted = true; video.muted = true; sync(); }
    });
  }

  /* ── Cookie consent ──────────────────────────────────────────────── */
  var KEY = 'mp-cookie-consent';
  var read = function () { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  var write = function (v) { try { localStorage.setItem(KEY, v); } catch (e) {} };
  var listeners = [];
  // For future analytics/marketing tags: MP.onConsent(function () { ...load pixel... });
  window.MP = {
    onConsent: function (fn) { if (read() === 'all') fn(); else listeners.push(fn); }
  };

  var banner;
  var close = function () { if (banner) { banner.classList.remove('is-open'); banner.setAttribute('hidden', ''); } };
  var choose = function (v) {
    write(v);
    close();
    if (v === 'all') { listeners.splice(0).forEach(function (fn) { fn(); }); }
  };
  var open = function () {
    if (!banner) {
      banner = document.createElement('div');
      banner.className = 'cookie-banner';
      banner.setAttribute('role', 'dialog');
      banner.setAttribute('aria-live', 'polite');
      banner.setAttribute('aria-label', 'הסכמה לשימוש בעוגיות');
      banner.innerHTML =
        '<p><strong>עוגיות באתר</strong> · אנחנו משתמשים בעוגיות ובאחסון מקומי הכרחיים לתפעול האתר, ובאישורך גם בעוגיות למדידה ושיפור. ' +
        '<a href="privacy.html#cookies">למידע נוסף</a></p>' +
        '<div class="cookie-actions">' +
        '<button type="button" class="btn btn-primary btn-solid" data-choice="all">אישור הכול</button>' +
        '<button type="button" class="btn btn-primary" data-choice="essential">הכרחיות בלבד</button>' +
        '</div>';
      banner.addEventListener('click', function (e) {
        var b = e.target.closest('[data-choice]');
        if (b) choose(b.getAttribute('data-choice'));
      });
      document.body.appendChild(banner);
    }
    banner.removeAttribute('hidden');
    requestAnimationFrame(function () { banner.classList.add('is-open'); });
  };

  document.querySelectorAll('[data-cookie-settings]').forEach(function (b) {
    b.addEventListener('click', open);
  });
  if (!read()) setTimeout(open, reduceMotion ? 0 : 900);
})();
