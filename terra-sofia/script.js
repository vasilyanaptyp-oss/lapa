(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  root.classList.add('js');
  var T = window.__T || { lv: doc.title, ru: doc.title };
  var each = function (sel, fn) { Array.prototype.forEach.call(doc.querySelectorAll(sel), fn); };
  var isRu = function () { return root.classList.contains('ru'); };
  var hdr = doc.getElementById('hdr'), burger = hdr.querySelector('.burger'), mnav = doc.getElementById('mnav');

  /* language: ?lang=ru opens Russian; both texts are in the page, attributes are swapped here */
  var ATTRS = ['alt', 'aria-label', 'placeholder', 'content'];
  function setLang(l, write) {
    var ru = l === 'ru';
    root.classList.toggle('ru', ru);
    root.lang = ru ? 'ru' : 'lv';
    doc.title = ru ? T.ru : T.lv;
    ATTRS.forEach(function (a) {
      each('[data-ru-' + a + ']', function (el) {
        if (!el.hasAttribute('data-lv-' + a)) el.setAttribute('data-lv-' + a, el.getAttribute(a) || '');
        el.setAttribute(a, el.getAttribute(ru ? 'data-ru-' + a : 'data-lv-' + a));
      });
    });
    each('option[data-ru]', function (o) {
      if (!o.hasAttribute('data-lv')) o.setAttribute('data-lv', o.textContent);
      o.textContent = o.getAttribute(ru ? 'data-ru' : 'data-lv');
    });
    each('[data-set-lang]', function (a) {
      if (a.getAttribute('data-set-lang') === l) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    each('[data-toggle-lang]', function (a) {
      a.setAttribute('href', ru ? '?lang=lv' : '?lang=ru');
      a.setAttribute('hreflang', ru ? 'lv' : 'ru');
    });
    if (write) {
      try {
        var u = new URL(location.href);
        if (ru) u.searchParams.set('lang', 'ru'); else u.searchParams.delete('lang');
        history.replaceState(null, '', u.pathname + u.search + u.hash);
      } catch (e) { /* the class switch is enough */ }
    }
    setMenu(hdr.classList.contains('open'));
  }

  /* mobile menu */
  function setMenu(open) {
    hdr.classList.toggle('open', open);
    root.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? (isRu() ? 'Закрыть меню' : 'Aizvērt izvēlni') : (isRu() ? 'Меню' : 'Izvēlne'));
    onScroll();
  }
  burger.addEventListener('click', function () { setMenu(!hdr.classList.contains('open')); });
  mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && hdr.classList.contains('open')) { setMenu(false); burger.focus(); }
  });
  doc.addEventListener('click', function (e) {
    if (hdr.classList.contains('open') && !hdr.contains(e.target)) setMenu(false);
    var a = e.target.closest('[data-set-lang],[data-toggle-lang]');
    if (!a) return;
    e.preventDefault();
    setLang(a.hasAttribute('data-set-lang') ? a.getAttribute('data-set-lang') : (isRu() ? 'lv' : 'ru'), true);
  });

  /* header turns solid after the hero */
  var hero = doc.querySelector('.hero');
  function onScroll() {
    var lim = hero ? hero.offsetHeight - 90 : 200;
    hdr.classList.toggle('solid', window.scrollY > lim && !hdr.classList.contains('open'));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* reveal on scroll */
  var rv = doc.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    Array.prototype.forEach.call(rv, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(rv, function (el) { el.classList.add('in'); });
  }

  /* contact form -> prepared e-mail */
  var form = doc.getElementById('cform');
  if (form) {
    var err = form.querySelector('.f-err');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      ['name', 'contact', 'msg'].forEach(function (n) {
        var f = form.elements[n], empty = !f.value.trim();
        f.classList.toggle('invalid', empty);
        if (empty && !bad) bad = f;
      });
      err.hidden = !bad;
      if (bad) { bad.focus(); return; }
      var svc = form.elements.svc.value;
      var subj = 'Objekts: ' + svc + ' (' + form.elements.name.value.trim() + ')';
      var body = form.elements.msg.value.trim() + '\n\n' + form.elements.name.value.trim() + '\n' + form.elements.contact.value.trim();
      var url = 'mailto:raitis.teivans@gmail.com?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body);
      window.__mailto = url;
      if (!window.__noNav) location.href = url;
    });
  }

  setLang(isRu() ? 'ru' : 'lv', false);
  onScroll();
})();
