/* Rosela homepage: cart (localStorage, order via WhatsApp), product sheet, filters, banner carousel,
   search suggestions, menu, lightbox, subtle reveal. Without JS the page still shows everything:
   cards link to the product pages of the shop, photos open as plain links, the banner scrolls by swipe. */
(function () {
  'use strict';
  var D = window.ROSELA || { products: [], i18n: {} };
  var I = D.i18n;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PROD = {};
  D.products.forEach(function (p) { PROD[p.id] = p; });
  var imgBase = (document.documentElement.lang === 'ru' ? '../' : '') + 'img/';
  function money(v) { return v.toFixed(2).replace('.', ',') + ' €'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- overlays: one open at a time, focus kept inside, Esc closes ---------- */
  var openEl = null, lastFocus = null;
  function openLayer(el, focusEl) {
    if (openEl && openEl !== el) { closeLayer(true); }
    lastFocus = document.activeElement;
    el.hidden = false; openEl = el;
    document.body.classList.add('lock');
    (focusEl || $('[data-close], button', el)).focus({ preventScroll: true });
  }
  function closeLayer(silent) {
    if (!openEl) { return; }
    openEl.hidden = true;
    if (openEl === menu) { burger.setAttribute('aria-expanded', 'false'); }
    openEl = null;
    document.body.classList.remove('lock');
    if (!silent && lastFocus && lastFocus.focus) { lastFocus.focus({ preventScroll: true }); }
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-close]')) { closeLayer(); }
  });
  document.addEventListener('keydown', function (e) {
    if (!openEl) { return; }
    if (e.key === 'Escape') { if (openEl === lb) { lbClose(); } else { closeLayer(); } return; }
    if (e.key === 'Tab') {
      var f = $$('a[href], button:not([disabled]), input', openEl).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) { return; }
      var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });

  /* ---------- menu ---------- */
  var menu = $('#menu'), burger = $('.burger');
  if (burger) {
    burger.addEventListener('click', function () { burger.setAttribute('aria-expanded', 'true'); openLayer(menu); });
  }
  $$('.menu-nav a').forEach(function (a) { a.addEventListener('click', function () { closeLayer(true); }); });

  /* ---------- toast ---------- */
  var toast = $('#toast'), toastT = 0;
  function say(msg) {
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toast.classList.remove('is-on'); }, 2200);
  }

  /* ---------- cart ---------- */
  var KEY = 'rosela-cart-v2', cart = {};
  try { cart = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (err) { cart = {}; }
  Object.keys(cart).forEach(function (k) { if (!PROD[k] || !(cart[k] > 0)) { delete cart[k]; } });
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (err) { /* private mode */ } }
  function count() { return Object.keys(cart).reduce(function (s, k) { return s + cart[k]; }, 0); }
  function total() { return Object.keys(cart).reduce(function (s, k) { return s + cart[k] * PROD[k].price; }, 0); }
  var cartEl = $('#cart'), list = $('#cart-list');
  function renderCart(bump) {
    var n = count(), sum = total();
    $$('[data-cart-n]').forEach(function (b) {
      b.textContent = n;
      b.classList.toggle('is-empty', n === 0);
      if (bump && !reduce) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
    });
    $$('[data-cart-sum]').forEach(function (b) { b.textContent = n ? money(sum) : I.cart; });
    $('#cart-empty').hidden = n > 0;
    $('#cart-foot').hidden = n === 0;
    list.hidden = n === 0;
    list.innerHTML = Object.keys(cart).map(function (k) {
      var p = PROD[k];
      return '<li data-id="' + k + '"><span class="th"><img src="' + imgBase + p.img + '.webp" alt=""></span>' +
        '<div><b>' + esc(p.name) + '</b><small>' + esc(p.size) + ' · ' + esc(p.fin) + '</small>' +
        '<div class="qty"><button type="button" data-q="-1" aria-label="' + esc(I.qty_minus) + '"><svg class="i" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h14"/></svg></button>' +
        '<output aria-live="polite">' + cart[k] + '</output>' +
        '<button type="button" data-q="1" aria-label="' + esc(I.qty_plus) + '"><svg class="i" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button></div></div>' +
        '<div class="ci-r"><b>' + money(p.price * cart[k]) + '</b><button class="ib ci-x" type="button" data-rm aria-label="' + esc(I.cart_remove) + ': ' + esc(p.name) + '"><svg class="i" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg></button></div></li>';
    }).join('');
    $('#cart-total').textContent = money(sum);
    var lines = Object.keys(cart).map(function (k) {
      var p = PROD[k];
      return '• ' + p.name + ', ' + p.size + ', ' + p.fin + ' × ' + cart[k] + ' = ' + money(p.price * cart[k]).replace(' ', ' ');
    });
    var text = I.wa_order + '\n' + lines.join('\n') + '\n' + I.wa_total + ' ' + money(sum).replace(' ', ' ');
    $('#cart-wa').href = D.wa + '?text=' + encodeURIComponent(text);
  }
  function add(id, from) {
    if (!PROD[id]) { return; }
    cart[id] = (cart[id] || 0) + 1;
    save(); renderCart(true);
    say(I.cart_added + ': ' + PROD[id].name + ', ' + PROD[id].size);
    if (from && from.classList.contains('btn-cart')) {
      from.classList.add('is-added');
      setTimeout(function () { from.classList.remove('is-added'); }, 1400);
    }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-add]');
    if (b) { e.preventDefault(); add(b.getAttribute('data-add'), b); }
  });
  list.addEventListener('click', function (e) {
    var li = e.target.closest('li'); if (!li) { return; }
    var id = li.getAttribute('data-id'), q = e.target.closest('[data-q]');
    if (q) { cart[id] += +q.getAttribute('data-q'); if (cart[id] <= 0) { delete cart[id]; } }
    else if (e.target.closest('[data-rm]')) { delete cart[id]; }
    else { return; }
    save(); renderCart(false);
    var again = q && $('li[data-id="' + id + '"] [data-q="' + q.getAttribute('data-q') + '"]', list);
    if (again) { again.focus(); } else { $('.cart-top .ib', cartEl).focus(); }
  });
  $$('.cartbtn').forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); openLayer(cartEl, $('.cart-top .ib', cartEl)); });
  });
  renderCart(false);

  /* ---------- product sheet ---------- */
  var sheet = $('#sheet'), current = null;
  function openSheet(id) {
    var p = PROD[id]; if (!p) { return; }
    current = id;
    var im = $('#sh-img');
    im.src = imgBase + p.img + '-l.webp'; im.alt = p.name + ', ' + p.size + ', ' + p.fin;
    $('#sh-pct').textContent = '−' + p.pct + ' %';
    $('#sh-name').textContent = p.name;
    $('#sh-m').textContent = p.size + ' · ' + p.kind + ' · ' + p.fin;
    $('#sh-pr').innerHTML = '<b>' + money(p.price) + '</b><s>' + money(p.old) + '</s>';
    $('#sh-specs').innerHTML = p.specs.map(function (s) { return '<div><dt>' + esc(s[0]) + '</dt><dd>' + esc(s[1]) + '</dd></div>'; }).join('');
    $('#sh-wa').href = D.wa + '?text=' + encodeURIComponent(I.wa_product.replace('{p}', p.name + ', ' + p.size + ', ' + p.fin + ', ' + money(p.price).replace(' ', ' ')));
    $('#sh-shop').href = p.url;
    openLayer(sheet, $('.sheet-x', sheet));
    $('.sheet-panel', sheet).scrollTop = 0;
  }
  $('#sh-add').addEventListener('click', function () { add(current, null); closeLayer(); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-open]');
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey) { return; }
    e.preventDefault(); openSheet(a.getAttribute('data-open'));
  });

  /* ---------- filters ---------- */
  var cards = $$('.pc'), chips = $$('.chip'), shown = $('#shown'), none = $('#none');
  function filter(f) {
    var n = 0;
    cards.forEach(function (c) {
      var ok = f === 'all' || (' ' + c.getAttribute('data-t') + ' ').indexOf(' ' + f + ' ') >= 0;
      c.classList.toggle('is-off', !ok); if (ok) { n++; }
    });
    chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-chip') === f)); });
    none.hidden = n > 0;
    shown.textContent = I.shown.replace('{n}', n);
    var g = $('#grid'); if (g) { g.scrollLeft = 0; }
  }
  chips.forEach(function (c) { c.addEventListener('click', function () { filter(c.getAttribute('data-chip')); }); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-filter]');
    if (a) { filter(a.getAttribute('data-filter')); }
  });

  /* ---------- banner carousel ---------- */
  var hero = $('.hero'), track = $('#track'), slides = $$('.slide'), dots = $$('.dot');
  var idx = 0, timer = 0, hover = false, inView = true, userStop = false;
  function mark(i) {
    idx = i;
    slides.forEach(function (s, k) { s.classList.toggle('is-on', k === i); s.setAttribute('aria-hidden', String(k !== i)); s.inert = k !== i; });
    dots.forEach(function (d, k) { d.setAttribute('aria-selected', String(k === i)); });
    restartProgress();
  }
  function go(i, user) {
    var n = slides.length; i = (i + n) % n;
    track.scrollTo({ left: i * track.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
    mark(i);
    if (user) { userStop = true; hero.classList.remove('autoplay'); stop(); }
  }
  var st = 0;
  track.addEventListener('scroll', function () {
    clearTimeout(st);
    st = setTimeout(function () {
      var i = Math.round(track.scrollLeft / track.clientWidth);
      if (i !== idx) { mark(i); }
    }, 90);
  }, { passive: true });
  dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k, true); }); });
  $$('.arr').forEach(function (b) { b.addEventListener('click', function () { go(idx + (+b.getAttribute('data-dir')), true); }); });
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { go(idx + 1, true); } else if (e.key === 'ArrowLeft') { go(idx - 1, true); }
  });
  ['pointerdown', 'touchstart'].forEach(function (ev) { track.addEventListener(ev, function () { userStop = true; hero.classList.remove('autoplay'); stop(); }, { passive: true }); });
  function stop() { clearTimeout(timer); timer = 0; }
  function canPlay() { return !reduce && !userStop && !hover && inView && !document.hidden && !openEl; }
  function restartProgress() {
    stop();
    if (!canPlay()) { hero.classList.toggle('paused', !userStop && !reduce); return; }
    hero.classList.remove('paused');
    timer = setTimeout(function () { if (canPlay()) { go(idx + 1, false); } else { restartProgress(); } }, 6500);
  }
  if (!reduce) { hero.classList.add('autoplay'); }
  hero.addEventListener('mouseenter', function () { hover = true; restartProgress(); });
  hero.addEventListener('mouseleave', function () { hover = false; restartProgress(); });
  hero.addEventListener('focusin', function () { hover = true; restartProgress(); });
  hero.addEventListener('focusout', function () { hover = false; restartProgress(); });
  document.addEventListener('visibilitychange', restartProgress);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { inView = en[0].isIntersecting; restartProgress(); }, { threshold: 0.3 }).observe(hero);
  }
  window.addEventListener('resize', function () { track.scrollLeft = idx * track.clientWidth; });
  mark(0);

  /* ---------- search suggestions ---------- */
  var q = $('#q'), sugg = $('#sugg'), sel = -1;
  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[×x*]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function suggest() {
    var v = norm(q.value);
    if (v.length < 2) { sugg.hidden = true; q.setAttribute('aria-expanded', 'false'); return; }
    var words = v.split(' ');
    var hits = D.products.filter(function (p) {
      var hay = norm([p.name, p.size, p.kind, p.fin, p.specs.map(function (s) { return s[1]; }).join(' ')].join(' '));
      return words.every(function (w) { return hay.indexOf(w) >= 0; });
    }).slice(0, 5);
    var html = '';
    if (hits.length) {
      html += '<p class="sugg-h">' + esc(I.search_hint) + '</p>';
      html += hits.map(function (p) {
        return '<a role="option" href="' + p.url + '" data-open="' + p.id + '"><img src="' + imgBase + p.img + '.webp" alt=""><span><b>' + esc(p.name) + '</b><small>' + esc(p.size) + ' · ' + esc(p.fin) + '</small></span><span class="sugg-pr">' + money(p.price) + '</span></a>';
      }).join('');
    }
    html += '<a role="option" class="sugg-all" href="' + D.shop + '/?s=' + encodeURIComponent(q.value.trim()) + '&post_type=product" target="_blank" rel="noopener">' + esc(I.search_all) + ': «' + esc(q.value.trim()) + '»</a>';
    sugg.innerHTML = html; sugg.hidden = false; sel = -1;
    q.setAttribute('aria-expanded', 'true');
  }
  q.addEventListener('input', suggest);
  q.addEventListener('focus', function () { if (q.value.trim().length >= 2) { suggest(); } });
  q.addEventListener('keydown', function (e) {
    var opts = $$('a', sugg);
    if (sugg.hidden || !opts.length) { return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length;
      opts.forEach(function (o, k) { o.setAttribute('aria-selected', String(k === sel)); });
    } else if (e.key === 'Enter' && sel >= 0) { e.preventDefault(); opts[sel].click(); }
    else if (e.key === 'Escape') { sugg.hidden = true; }
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.search')) { sugg.hidden = true; q.setAttribute('aria-expanded', 'false'); }
  });
  sugg.addEventListener('click', function (e) { if (e.target.closest('[data-open]')) { sugg.hidden = true; } });

  /* ---------- header: shadow after scroll; on phones the search row folds away while scrolling down ---------- */
  var hdr = $('#hdr'), lastY = window.scrollY;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    hdr.classList.toggle('is-scrolled', y > 8);
    if (document.activeElement !== q) {

    }
    lastY = y;
  }, { passive: true });

  /* ---------- lightbox: opens exactly the photo that was tapped ---------- */
  var shots = $$('.shot'), lb = $('#lb'), lbImg = $('#lb-img'), cur = -1;
  function lbShow(i) {
    cur = (i + shots.length) % shots.length;
    var a = shots[cur], im = $('img', a);
    lbImg.src = a.getAttribute('href'); lbImg.alt = im.alt;
    $('#lb-c').textContent = (cur + 1) + ' / ' + shots.length;
    $('#lb-cap').textContent = im.alt;
  }
  function lbClose() { cur = -1; lbImg.removeAttribute('src'); closeLayer(); }
  shots.forEach(function (a, i) { a.addEventListener('click', function (e) { e.preventDefault(); lbShow(i); openLayer(lb, $('#lb-x')); }); });
  $('#lb-x').addEventListener('click', lbClose);
  $('#lb-p').addEventListener('click', function () { lbShow(cur - 1); });
  $('#lb-n').addEventListener('click', function () { lbShow(cur + 1); });
  $('#lb-stage').addEventListener('click', function (e) { if (e.target !== lbImg) { lbClose(); } });
  document.addEventListener('keydown', function (e) {
    if (openEl !== lb) { return; }
    if (e.key === 'ArrowRight') { lbShow(cur + 1); } else if (e.key === 'ArrowLeft') { lbShow(cur - 1); }
  });
  var sx = 0;
  $('#lb-stage').addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  $('#lb-stage').addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) { lbShow(cur + (dx < 0 ? 1 : -1)); }
  }, { passive: true });

  /* ---------- reveal on scroll (only below the first screen) ---------- */
  if (!reduce && 'IntersectionObserver' in window) {
    var els = $$('.cats li, .trust li, .sec-head, .pc, .cu-in, .al-ph, .al-b, .c-in').filter(function (el) {
      return el.getBoundingClientRect().top > window.innerHeight;
    });
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el, k) {
      el.classList.add('rv');
      var sib = el.parentNode ? Array.prototype.indexOf.call(el.parentNode.children, el) : 0;
      el.style.transitionDelay = Math.min(sib, 4) * 60 + 'ms';
      io.observe(el);
    });
  }
  window.__rosela = { cart: function () { return cart; }, filter: filter, go: go, idx: function () { return idx; } };
})();
