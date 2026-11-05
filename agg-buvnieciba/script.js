(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  root.classList.add('js');
  var ru = root.lang === 'ru';

  /* mobile menu */
  var hdr = doc.getElementById('hdr'), burger = hdr.querySelector('.burger'), mnav = doc.getElementById('mnav');
  function setMenu(open) {
    hdr.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? (ru ? 'Закрыть' : 'Aizvērt') : (ru ? 'Меню' : 'Izvēlne'));
  }
  burger.addEventListener('click', function () { setMenu(!hdr.classList.contains('open')); });
  mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && hdr.classList.contains('open')) { setMenu(false); burger.focus(); } });
  doc.addEventListener('click', function (e) { if (hdr.classList.contains('open') && !hdr.contains(e.target)) setMenu(false); });

  /* reveal on scroll */
  var items = [].slice.call(doc.querySelectorAll('.rv'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    items.forEach(function (el) { io.observe(el); });
  } else { items.forEach(function (el) { el.classList.add('in'); }); }

  /* form -> mail program (window.__noNav lets the page test read the address without opening a mail program) */
  var form = doc.getElementById('cform');
  if (form) {
    var err = form.querySelector('.f-err');
    var M = ru ? { name: 'Напишите своё имя.', contact: 'Укажите телефон или e-mail.', msg: 'Коротко опишите объект и этап работ.', subj: 'Запрос с сайта', n: 'Имя: ', c: 'Телефон или e-mail: ', s: 'Объект и этап работ: ' }
               : { name: 'Lūdzu, ierakstiet savu vārdu.', contact: 'Lūdzu, norādiet tālruni vai e-pastu.', msg: 'Lūdzu, īsi aprakstiet objektu un darbu posmu.', subj: 'Pieprasījums no mājaslapas', n: 'Vārds: ', c: 'Tālrunis vai e-pasts: ', s: 'Objekts un darbu posms: ' };
    var subj = form.getAttribute('data-subj') || M.subj;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements, name = f.name.value.trim(), contact = f.contact.value.trim(), msg = f.msg.value.trim();
      [f.name, f.contact, f.msg].forEach(function (x) { x.removeAttribute('aria-invalid'); });
      var okContact = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact) || contact.replace(/\D/g, '').length >= 7;
      var bad = name.length < 2 ? [f.name, M.name] : (!okContact ? [f.contact, M.contact] : (msg.length < 5 ? [f.msg, M.msg] : null));
      if (bad) { bad[0].setAttribute('aria-invalid', 'true'); err.textContent = bad[1]; err.hidden = false; bad[0].focus(); return; }
      err.hidden = true;
      var body = M.n + name + '\n' + M.c + contact + '\n\n' + M.s + '\n' + msg;
      var url = 'mailto:' + form.getAttribute('data-mail') + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body);
      window.__mailto = url;
      if (!window.__noNav) window.location.href = url;
    });
  }
})();
