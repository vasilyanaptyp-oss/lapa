(function () {
  'use strict';
  var root = document.documentElement;
  var D = {};
  try { D = JSON.parse(document.getElementById('i18n').textContent); } catch (e) { D = {}; }
  var cur = 'lv';

  /* ---------- language: LV in the HTML, ?lang=ru switches to RU in place ---------- */
  function apply(lang) {
    var t = D[lang];
    if (!t) { root.classList.remove('ru-pending'); return; }
    cur = lang;
    [].forEach.call(document.querySelectorAll('[data-i]'), function (el) {
      var k = el.getAttribute('data-i');
      if (t[k] != null) el.innerHTML = t[k];
    });
    [].forEach.call(document.querySelectorAll('[data-a]'), function (el) {
      el.getAttribute('data-a').split('|').forEach(function (pair) {
        var p = pair.split(':');
        if (t[p[1]] != null) el.setAttribute(p[0], t[p[1]]);
      });
    });
    var other = lang === 'ru' ? 'lv' : 'ru';
    var lb = document.getElementById('lang'), l2 = document.getElementById('lang2');
    if (lb) lb.setAttribute('lang', other);
    if (l2) { l2.setAttribute('lang', other); l2.setAttribute('href', lang === 'ru' ? './' : '?lang=ru'); }
    root.lang = t._lang;
    document.title = t._title;
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', t._desc);
    root.classList.remove('ru-pending');
  }
  function setUrl(lang) {
    try {
      var u = new URL(location.href);
      if (lang === 'ru') u.searchParams.set('lang', 'ru'); else u.searchParams.delete('lang');
      history.replaceState(null, '', u.pathname + u.search + u.hash);
    } catch (e) {}
  }
  function toggle(e) {
    if (e) e.preventDefault();
    var next = cur === 'ru' ? 'lv' : 'ru';
    apply(next); setUrl(next);
  }
  if (/[?&]lang=ru(&|$)/.test(location.search)) apply('ru'); else root.classList.remove('ru-pending');
  var lb = document.getElementById('lang'), l2 = document.getElementById('lang2');
  if (lb) lb.addEventListener('click', function () { toggle(); });
  if (l2) l2.addEventListener('click', function (e) { toggle(e); window.scrollTo(0, 0); });

  /* ---------- mobile menu ---------- */
  var burger = document.querySelector('.burger'), mnav = document.getElementById('mnav'), hdr = document.getElementById('hdr');
  function setMenu(open) {
    hdr.classList.toggle('open', open);
    root.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (burger) burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  if (mnav) mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1080) setMenu(false); });

  /* ---------- header: the small logo appears once the nameplate has scrolled away ---------- */
  var np = document.querySelector('.cover .np');
  function onScroll() {
    var past = np ? np.getBoundingClientRect().bottom < 40 : window.scrollY > 120;
    hdr.classList.toggle('past', past);
    hdr.classList.toggle('scrolled', window.scrollY > 4);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- reveal on scroll ---------- */
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('js-rv');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    [].forEach.call(rv, function (el) { io.observe(el); });
  }

  /* ---------- form: opens the visitor's mail program ---------- */
  var f = document.getElementById('cform');
  if (f) f.addEventListener('submit', function (e) {
    e.preventDefault();
    var t = D[cur] || {};
    var name = f.elements.name.value.trim(), contact = f.elements.contact.value.trim(), msg = f.elements.msg.value.trim();
    var err = f.querySelector('.f-err');
    [f.elements.name, f.elements.contact, f.elements.msg].forEach(function (el) {
      el.setAttribute('aria-invalid', el.value.trim() ? 'false' : 'true');
    });
    if (!name || !contact || !msg) { err.hidden = false; return; }
    err.hidden = true;
    var body = msg + '\n\n' + (t.f_l1 || 'Vārds') + ': ' + name + '\n' + (t.f_l2 || 'Kontakts') + ': ' + contact;
    location.href = 'mailto:arnisakmens7@gmail.com?subject=' + encodeURIComponent(t.f_subj || '') + '&body=' + encodeURIComponent(body);
  });
})();
