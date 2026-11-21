(function () {
  var d = document, top = d.querySelector('.top'), bar = d.querySelector('.bar'), nearForm = false;
  d.documentElement.classList.remove('no-js');
  function onScroll() {
    var y = window.scrollY;
    top.classList.toggle('solid', y > 40);
    if (bar) bar.classList.toggle('on', y > window.innerHeight * 0.6 && !nearForm);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  var rv = d.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { io.observe(el); });
    var c = d.getElementById('kontakti');
    if (c && bar) new IntersectionObserver(function (es) { nearForm = es[0].isIntersecting; onScroll(); }, { rootMargin: '0px 0px -30% 0px' }).observe(c);
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }
  onScroll();
  var f = d.getElementById('msg');
  if (f) f.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var n = f.elements.name.value.trim(), c = f.elements.contact.value.trim(), t = f.elements.text.value.trim();
    var body = t + '\n\n' + n + (c ? '\n' + c : '');
    location.href = 'mailto:swml@inbox.lv?subject=' + encodeURIComponent(f.dataset.subject) + '&body=' + encodeURIComponent(body);
  });
})();
