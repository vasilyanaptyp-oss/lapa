(function () {
  // Opened from disk: folder links need an explicit index.html
  if (location.protocol === 'file:') {
    document.querySelectorAll('a[data-dir]').forEach(function (a) {
      var h = a.getAttribute('href');
      if (/\/$/.test(h)) a.setAttribute('href', h + 'index.html');
    });
  }
  // Mobile call bar: appears once the hero buttons are off screen
  var bar = document.getElementById('callbar');
  var cta = document.querySelector('.hero .cta');
  var contact = document.getElementById('kontakti');
  if (!bar || !cta || !('IntersectionObserver' in window)) return;
  var mq = window.matchMedia('(max-width: 899px)');
  var ctaVisible = true, contactVisible = false;
  bar.hidden = false;
  function update() {
    var on = mq.matches && !ctaVisible && !contactVisible;
    bar.classList.toggle('on', on);
    bar.setAttribute('aria-hidden', on ? 'false' : 'true');
    bar.querySelectorAll('a').forEach(function (a) { a.tabIndex = on ? 0 : -1; });
    document.body.classList.toggle('has-bar', mq.matches);
  }
  new IntersectionObserver(function (e) { ctaVisible = e[0].isIntersecting; update(); }).observe(cta);
  new IntersectionObserver(function (e) { contactVisible = e[0].isIntersecting; update(); }, { rootMargin: '0px 0px -30% 0px' }).observe(contact);
  if (mq.addEventListener) mq.addEventListener('change', update);
  update();
})();
