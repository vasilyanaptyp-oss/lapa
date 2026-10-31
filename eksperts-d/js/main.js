(function () {
  // Opened from disk: folder links need an explicit index.html
  if (location.protocol === 'file:') {
    document.querySelectorAll('a[data-dir]').forEach(function (a) {
      var h = a.getAttribute('href');
      if (/\/$/.test(h)) a.setAttribute('href', h + 'index.html');
    });
  }

  // Lightbox for "Mūsu darbi": links open the big WebP; with JS they open a dialog with prev/next
  (function () {
    var dlg = document.getElementById('lb');
    var items = Array.prototype.slice.call(document.querySelectorAll('.g-link'));
    if (!dlg || !items.length || typeof dlg.showModal !== 'function') return;
    var fig = document.getElementById('lb-fig');
    var cap = document.getElementById('lb-cap');
    var count = document.getElementById('lb-count');
    var img = null, cur = 0, opener = null;
    function show(i) {
      if (!img) {   // created on first open, so the page has no empty <img> before that
        img = document.createElement('img');
        img.id = 'lb-img'; img.decoding = 'async';
        fig.insertBefore(img, cap);
      }
      cur = (i + items.length) % items.length;
      var a = items[cur];
      img.src = a.getAttribute('href');
      img.width = +a.dataset.w; img.height = +a.dataset.h;
      img.alt = a.dataset.cap;
      cap.textContent = a.dataset.cap;
      count.textContent = (cur + 1) + ' / ' + items.length;
      dlg.dataset.index = cur;
    }
    function open(i, from) {
      opener = from || null;
      show(i);
      document.documentElement.classList.add('lb-open');
      dlg.showModal();
    }
    dlg.addEventListener('close', function () {
      document.documentElement.classList.remove('lb-open');
      if (opener) opener.focus();
    });
    document.querySelectorAll('a.zoom[data-gi]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
        e.preventDefault();
        open(+a.dataset.gi, a);
      });
    });
    dlg.querySelector('.lb-close').addEventListener('click', function () { dlg.close(); });
    dlg.querySelector('.lb-prev').addEventListener('click', function () { show(cur - 1); });
    dlg.querySelector('.lb-next').addEventListener('click', function () { show(cur + 1); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1); }
    });
    // click on the dark area (not on the photo or a button) closes
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || e.target.classList.contains('lb-in')) dlg.close();
    });
    // swipe on phones
    var x0 = null;
    dlg.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    });
  })();

  // Mobile call bar: appears once the hero buttons are off screen
  var bar = document.getElementById('callbar');
  var cta = document.querySelector('.hero .cta');
  var contact = document.getElementById('kontakti');
  if (!bar || !cta || !('IntersectionObserver' in window)) return;
  var mq = window.matchMedia('(max-width: 999px)');
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
