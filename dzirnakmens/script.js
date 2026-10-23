(function () {
  var ru = /[?&]lang=ru(&|$)/.test(location.search);
  var hdr = document.getElementById('hdr');
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');

  function onScroll() {
    if (document.body.classList.contains('menu-open')) return;
    hdr.classList.toggle('solid', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('menu-open', open);
    if (!open) onScroll();
  }
  burger.addEventListener('click', function () { setMenu(menu.hidden); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 1100 && !menu.hidden) setMenu(false); });

  var form = document.getElementById('form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var name = f.name.value.trim(), contact = f.contact.value.trim(), msg = f.msg.value.trim();
    var L = ru ? { s: 'Объект', n: 'Имя', c: 'Контакты' } : { s: 'Objekts', n: 'Vārds', c: 'Kontakti' };
    var subject = L.s + (name ? ': ' + name : '');
    var body = (msg ? msg + '\n\n' : '') + (name ? L.n + ': ' + name + '\n' : '') + (contact ? L.c + ': ' + contact + '\n' : '');
    var url = 'mailto:dzirnakmens@apollo.lv?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    form.setAttribute('data-mailto', url);
    window.location.href = url;
  });
})();
