(function () {
  var d = document, top = d.querySelector('.top');
  d.documentElement.classList.remove('no-js');
  function onScroll() { top.classList.toggle('solid', window.scrollY > 40); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  var rv = d.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }
  var f = d.getElementById('msg');
  if (f) f.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var n = f.elements.name.value.trim(), c = f.elements.contact.value.trim(), t = f.elements.text.value.trim();
    var body = t + '\n\n' + n + (c ? '\n' + c : '');
    location.href = 'mailto:swml@inbox.lv?subject=' + encodeURIComponent(f.dataset.subject) + '&body=' + encodeURIComponent(body);
  });
})();
