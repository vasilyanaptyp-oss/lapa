(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  root.classList.add('js');

  /* ---------- language: LV in the markup, RU from the embedded dictionary; ?lang=ru opens Russian ---------- */
  var D = { ru: {}, lv: {} };
  try { D = JSON.parse(doc.getElementById('i18n').textContent); } catch (e) { D = { ru: {}, lv: {} }; }
  var RU = D.ru || {}, LVX = D.lv || {};
  var texts = [].slice.call(doc.querySelectorAll('[data-i]')).map(function (el) { return [el, el.getAttribute('data-i'), el.innerHTML]; });
  var attrs = [];
  [].slice.call(doc.querySelectorAll('[data-ia]')).forEach(function (el) {
    el.getAttribute('data-ia').split(';').forEach(function (pair) {
      var p = pair.split('='); if (p.length === 2) attrs.push([el, p[0], p[1], el.getAttribute(p[0])]);
    });
  });
  var metaDesc = doc.querySelector('meta[name="description"]');
  var LV = { title: doc.title, desc: metaDesc ? metaDesc.getAttribute('content') : '' };
  var lang = 'lv';
  function tx(k) { return lang === 'ru' ? RU[k] : LVX[k]; }

  function setLang(l) {
    lang = l === 'ru' && RU.title ? 'ru' : 'lv';
    var ru = lang === 'ru';
    texts.forEach(function (x) { var v = ru ? RU[x[1]] : x[2]; if (v != null) x[0].innerHTML = v; });
    attrs.forEach(function (x) { var v = ru ? RU[x[2]] : x[3]; if (v != null) x[0].setAttribute(x[1], v); });
    root.lang = lang;
    doc.title = ru ? RU.title : LV.title;
    if (metaDesc) metaDesc.setAttribute('content', ru ? RU.desc : LV.desc);
    [].slice.call(doc.querySelectorAll('.lang a')).forEach(function (a) {
      if (a.getAttribute('data-lang') === lang) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    [].slice.call(doc.querySelectorAll('[data-lang-toggle]')).forEach(function (a) {
      var other = ru ? 'lv' : 'ru';
      a.setAttribute('href', ru ? './' : '?lang=ru'); a.setAttribute('lang', other); a.setAttribute('hreflang', other);
    });
    setMenu(false);
  }
  function go(l) {
    if (l === lang) return;
    setLang(l);
    try { history.replaceState(null, '', (l === 'ru' ? '?lang=ru' : location.pathname) + location.hash); } catch (err) { /* file:// */ }
  }

  /* ---------- mobile menu ---------- */
  var hdr = doc.getElementById('hdr'), burger = hdr.querySelector('.burger');
  function setMenu(open) {
    hdr.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? (tx('menu_close') || 'Aizvērt izvēlni') : (tx('menu') || 'Izvēlne'));
  }
  function onScroll() { hdr.classList.toggle('scrolled', (window.pageYOffset || root.scrollTop) > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  burger.addEventListener('click', function () { setMenu(!hdr.classList.contains('open')); });
  doc.getElementById('mnav').addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && hdr.classList.contains('open')) { setMenu(false); burger.focus(); } });
  doc.addEventListener('click', function (e) { if (hdr.classList.contains('open') && !hdr.contains(e.target)) setMenu(false); });

  var q = '';
  try { q = new URLSearchParams(location.search).get('lang') || ''; } catch (e) { q = ''; }
  if (q === 'ru') setLang('ru'); else setMenu(false);
  root.classList.remove('ru-wait');

  [].slice.call(doc.querySelectorAll('.lang a')).forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); go(a.getAttribute('data-lang')); });
  });
  [].slice.call(doc.querySelectorAll('[data-lang-toggle]')).forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); go(lang === 'ru' ? 'lv' : 'ru'); window.scrollTo(0, 0); });
  });

  /* ---------- reveal on scroll ---------- */
  var items = [].slice.call(doc.querySelectorAll('.rv'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  } else { items.forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- form -> mail program (window.__noNav lets a test read the address without opening a mail program) ---------- */
  var form = doc.getElementById('cform');
  if (form) {
    var err = form.querySelector('.f-err');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements, name = f.name.value.trim(), contact = f.contact.value.trim(), msg = f.msg.value.trim();
      [f.name, f.contact, f.msg].forEach(function (x) { x.removeAttribute('aria-invalid'); });
      var okContact = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact) || contact.replace(/\D/g, '').length >= 7;
      var bad = name.length < 2 ? [f.name, tx('e_name')] : (!okContact ? [f.contact, tx('e_contact')] : (msg.length < 5 ? [f.msg, tx('e_msg')] : null));
      if (bad) { bad[0].setAttribute('aria-invalid', 'true'); err.textContent = bad[1]; err.hidden = false; bad[0].focus(); return; }
      err.hidden = true;
      var body = tx('m_n') + name + '\n' + tx('m_c') + contact + '\n\n' + msg;
      var url = 'mailto:' + form.getAttribute('data-mail') + '?subject=' + encodeURIComponent(tx('m_subj')) + '&body=' + encodeURIComponent(body);
      window.__mailto = url;
      if (!window.__noNav) window.location.href = url;
    });
  }
})();
