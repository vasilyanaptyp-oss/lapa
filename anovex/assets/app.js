// ANOVEX v2: header state, phone menu, focus image follows the active area.
(function () {
  var hd = document.getElementById('hd');
  function onScroll() { hd.classList.toggle('on', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var m = document.getElementById('mnav'), b = document.getElementById('burger'), x = document.getElementById('mclose');
  function setMenu(open) {
    m.classList.toggle('open', open); m.setAttribute('aria-hidden', open ? 'false' : 'true');
    b.setAttribute('aria-expanded', open ? 'true' : 'false'); document.body.style.overflow = open ? 'hidden' : '';
    if (open) x.focus(); else b.focus({ preventScroll: true });
  }
  b.addEventListener('click', function () { setMenu(true); });
  x.addEventListener('click', function () { setMenu(false); });
  m.querySelectorAll('nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && m.classList.contains('open')) setMenu(false); });

  var fo = document.querySelector('.fo'); if (!fo) return;
  var items = fo.querySelectorAll('li'), imgs = fo.querySelectorAll('.frame img');
  var wide = window.matchMedia('(min-width:1081px)');
  function act(i) {
    items.forEach(function (li) { li.classList.toggle('act', li.dataset.i === String(i)); });
    imgs.forEach(function (im) { im.classList.toggle('act', im.dataset.i === String(i)); });
  }
  fo.classList.add('js'); act(0);
  var ol = fo.querySelector('ol'), dots = fo.querySelectorAll('.hint i');
  ol.addEventListener('scroll', function () {
    if (wide.matches) return;
    var k = Math.round(ol.scrollLeft / (items[0].offsetWidth + 14));
    dots.forEach(function (d, i) { d.classList.toggle('act', i === Math.min(k, dots.length - 1)); });
  }, { passive: true });
  items.forEach(function (li) { li.addEventListener('mouseenter', function () { if (wide.matches) act(li.dataset.i); }); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting && wide.matches) act(en.target.dataset.i); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach(function (li) { io.observe(li); });
  }
})();
