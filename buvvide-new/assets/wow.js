/* BUVVide — apdares slāņa skripts (10.11.2026): baneru karuselis sākumlapā un bloku parādīšanās ritinot.
   Bez šī faila karuseli var šķirt ar pirkstu, viss saturs redzams. Ja lietotājs lūdz mazāk kustību, nekas nekustas pats. */
(function () {
  'use strict';
  var d = document, w = window;
  var reduce = !!(w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function $$(s, r) { return [].slice.call((r || d).querySelectorAll(s)); }

  function carousel(root) {
    var track = root.querySelector('.bn__track'), slides = $$('.bn__s', root), dots = $$('.bn__dots button', root);
    if (!track || slides.length < 2) { return; }
    var i = 0, timer = 0, stopped = reduce, hover = false;
    function sync() {
      dots.forEach(function (b, k) { b.setAttribute('aria-current', k === i ? 'true' : 'false'); });
      root.classList.toggle('is-light', slides[i].classList.contains('bn__s--yellow'));
    }
    function go(n) {
      i = (n + slides.length) % slides.length;
      track.scrollTo({ left: slides[i].offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
      sync();
    }
    function play() {
      clearInterval(timer);
      if (stopped) { return; }
      timer = setInterval(function () { if (!hover && !d.hidden) { go(i + 1); } }, 6500);
    }
    function stop() { stopped = true; clearInterval(timer); }
    var st = 0;
    track.addEventListener('scroll', function () {
      clearTimeout(st);
      st = setTimeout(function () { var k = Math.round(track.scrollLeft / track.clientWidth); if (k !== i) { i = k; sync(); } }, 90);
    }, { passive: true });
    dots.forEach(function (b, k) { b.addEventListener('click', function () { stop(); go(k); }); });
    var prev = root.querySelector('.bn__nav--prev'), next = root.querySelector('.bn__nav--next');
    if (prev) { prev.addEventListener('click', function () { stop(); go(i - 1); }); }
    if (next) { next.addEventListener('click', function () { stop(); go(i + 1); }); }
    root.addEventListener('mouseenter', function () { hover = true; });
    root.addEventListener('mouseleave', function () { hover = false; });
    root.addEventListener('focusin', function () { hover = true; });
    root.addEventListener('focusout', function () { hover = false; });
    track.addEventListener('touchstart', stop, { passive: true });
    track.addEventListener('wheel', function (e) { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { stop(); } }, { passive: true });
    w.addEventListener('resize', function () { track.scrollTo({ left: slides[i].offsetLeft, behavior: 'auto' }); });
    sync();
    play();
  }

  function reveals() {
    if (reduce || !('IntersectionObserver' in w)) { return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) { return; }
        var el = e.target;
        io.unobserve(el);
        el.classList.add('is-in');
        setTimeout(function () { el.classList.remove('rv', 'is-in'); el.style.removeProperty('--rv-d'); }, 1400);   // atdod elementam viņa paša pārejas
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0.05 });
    function arm(sel, step) {
      $$(sel).forEach(function (el, k) {
        if (el.getBoundingClientRect().top < w.innerHeight * 0.96) { return; }       // jau redzams: neaiztiekam
        if (step) { el.style.setProperty('--rv-d', ((k % 4) * step) + 's'); }
        el.classList.add('rv');
        io.observe(el);
      });
    }
    arm('#main .sec__head', 0);
    arm('.railw', 0);
    arm('.trust__item', 0.07);
    arm('.b2b', 0);
    arm('.brands', 0);
  }

  /* ── preces lapa ── */
  function product() {
    var X = w.BVX, main = d.getElementById('main') || d.body;
    if (!X) { return; }
    function qp(k) { var m = new RegExp('[?&]' + k + '=([^&]+)').exec(w.location.search); return m ? decodeURIComponent(m[1]) : ''; }
    var id = +qp('id'), c = qp('c');

    // energoklase: bultiņa uz foto, pie cenas paliek īsa rinda ar klasi un datu lapu
    function energy() {
      var gal = d.querySelector('.pp .gal'), en = d.querySelector('.buybox .price .en');
      if (!gal || !en) { return; }
      var arrow = en.querySelector('.en__a'), old = gal.querySelector('.gal__en');
      if (!arrow) { if (old) { old.parentNode.removeChild(old); } return; }
      var sig = arrow.outerHTML;
      if (en.getAttribute('data-l') == null) { en.setAttribute('data-l', X.t('Energoklase')); }
      if (old && old.getAttribute('data-sig') === sig) { return; }
      if (old) { old.parentNode.removeChild(old); }
      var wrap = d.createElement('span');
      wrap.className = 'gal__en';
      wrap.setAttribute('data-sig', sig);
      wrap.innerHTML = sig;
      gal.appendChild(wrap);
    }

    // datorā pa kreisi liels foto, zem tā parametri un apraksts; šaurāk viss paliek kā bija
    var mq = w.matchMedia('(min-width: 1024px)'), left = null;
    function layout() {
      var pp = d.querySelector('.pp');
      if (!pp) { return; }
      if (mq.matches) {
        if (!left || left.parentNode !== pp) { left = d.createElement('div'); left.className = 'pp__left'; pp.insertBefore(left, pp.firstChild); }
        var more = pp.parentNode.querySelector('.pp__more');
        [pp.querySelector(':scope > .gal'), pp.querySelector(':scope > .kspec--d'), more && more.parentNode !== left ? more : null].forEach(function (el) {
          if (!el) { return; }
          var mark = d.createComment('wow'); el.parentNode.insertBefore(mark, el); el._mark = mark;
          left.appendChild(el);
        });
        pp.classList.add('is-r');
      } else if (left && left.parentNode) {
        [].slice.call(left.children).forEach(function (el) {
          if (el._mark && el._mark.parentNode) { el._mark.parentNode.insertBefore(el, el._mark); el._mark.parentNode.removeChild(el._mark); }
          el._mark = null;
        });
        left.parentNode.removeChild(left);
        left = null;
        pp.classList.remove('is-r');
      }
    }

    // garš apraksts: sakļauts, atveras ar «Lasīt vairāk»
    function clamp() {
      var desc = d.querySelector('.pp__more .acc__b.desc, .pp__left .acc__b.desc');
      if (!desc || desc._wow) { return; }
      if (desc.scrollHeight < 640) { return; }
      desc._wow = 1;
      desc.classList.add('wow-clamp');
      var btn = d.createElement('button');
      btn.type = 'button';
      btn.className = 'clampbtn wow-more';
      btn.textContent = X.t('Lasīt vairāk');
      btn.addEventListener('click', function () {
        var open = desc.classList.toggle('wow-clamp') === false;
        btn.textContent = X.t(open ? 'Rādīt mazāk' : 'Lasīt vairāk');
        if (!open) { desc.scrollIntoView({ block: 'nearest' }); }
        balance();
      });
      desc.parentNode.insertBefore(btn, desc.nextSibling);
    }
    // informācijas bloks (piegāde, apmaksa...): labajā kolonnā, ja tur ir vieta, citādi josla zem abām kolonnām
    var pcol = 0;
    function balance() {
      var pp = d.querySelector('.pp'), info = pp && pp.querySelector('.pp__info'), perks = d.querySelector('.perks');
      if (!pp || !info || !perks) { return; }
      var inInfo = perks.parentNode === info || info.contains(perks);
      if (!mq.matches || !left) {
        if (!inInfo && perks._home && perks._home.parentNode) { perks._home.parentNode.insertBefore(perks, perks._home); perks.classList.remove('perks--row'); }
        return;
      }
      if (inInfo) { pcol = perks.offsetHeight + 16; }
      var r0 = info.offsetHeight - (inInfo ? pcol : 0), toRow = r0 + pcol > left.offsetHeight + 140;
      if (toRow && inInfo) {
        if (!perks._home) { perks._home = d.createComment('wow-perks'); perks.parentNode.insertBefore(perks._home, perks); }
        pp.parentNode.insertBefore(perks, pp.nextSibling);
        perks.classList.add('perks--row');
      } else if (!toRow && !inInfo && perks._home && perks._home.parentNode) {
        perks._home.parentNode.insertBefore(perks, perks._home);
        perks.classList.remove('perks--row');
      }
    }

    var busy = false, queued = 0;
    function sync() {
      if (busy) { return; }
      busy = true;
      try { layout(); energy(); clamp(); balance(); } finally { busy = false; }
    }
    w.addEventListener('load', function () { setTimeout(sync, 60); });
    w.addEventListener('resize', function () { clearTimeout(queued); queued = setTimeout(sync, 120); });
    if (w.MutationObserver) {
      new MutationObserver(function () { clearTimeout(queued); queued = setTimeout(sync, 30); }).observe(main, { childList: true, subtree: true });
    }
    if (mq.addEventListener) { mq.addEventListener('change', sync); } else if (mq.addListener) { mq.addListener(sync); }
    sync();

    // rindas zem preces: preces no blakus kategorijām un preces ar atlaidi
    function fill(boxId, railId, items) {
      var box = d.getElementById(boxId), rail = d.getElementById(railId);
      if (!box || !rail || items.length < 3) { return; }
      X.reg(items);
      rail.innerHTML = items.map(X.card).join('');
      box.hidden = false;
      if (X.enFill) { X.enFill(); }
    }
    function shown() {
      return $$('#related-rail [data-add], #related-rail a[href*="prece.html?id="]').map(function (a) {
        var m = /[?&]id=(\d+)/.exec(a.getAttribute('href') || '');
        return +(a.getAttribute('data-add') || (m && m[1]) || 0);
      });
    }
    if (id && c) {
      setTimeout(function () {
        X.getJSON('data/tree.json').then(function (T) {
          var cat = T && T.cats && T.cats[c], par = cat && cat.p && T.cats[cat.p];
          if (!par) { return; }
          var sis = (par.k || []).filter(function (k) { return String(k) !== String(c) && T.cats[k] && T.cats[k].cnt; }).slice(0, 4);
          return Promise.all(sis.map(function (k) { return X.getJSON('data/c/' + k + '.json').catch(function () { return null; }); })).then(function (ls) {
            var have = shown(), items = [];
            ls.forEach(function (l) {
              if (l && l.items) { items = items.concat(l.items.filter(function (x) { return x.id !== id && x.pr != null && have.indexOf(x.id) < 0; }).slice(0, 3)); }
            });
            fill('like', 'like-rail', items.slice(0, 10));
            var more = d.getElementById('like-more');
            if (more) { more.href = X.catURL(cat.p); }
          });
        }).catch(function () {});
        // preces ar atlaidi: vispirms no tās pašas lielās sadaļas, tad lielākās atlaides
        Promise.all([X.getJSON('data/c/akcijas.json'), X.getJSON('data/tree.json')]).then(function (r) {
          var j = r[0], T = r[1];
          function top(k) { var n = 0; while (T && T.cats && T.cats[k] && T.cats[k].p && n++ < 8) { k = T.cats[k].p; } return String(k); }
          var mine = top(c);
          var items = ((j && j.items) || []).filter(function (x) { return x.id !== id && x.pr != null && x.o > x.pr; })
            .sort(function (a, b) {
              var sa = top(a.c) === mine ? 1 : 0, sb = top(b.c) === mine ? 1 : 0;
              return (sb - sa) || ((1 - b.pr / b.o) - (1 - a.pr / a.o));
            }).slice(0, 10);
          fill('deals', 'deals-rail', items);
        }).catch(function () {});
      }, 900);
    }
  }

  function init() {
    var page = d.body ? d.body.getAttribute('data-page') : '';
    if (page === 'home') {
      var bn = d.getElementById('bn');
      if (bn) { carousel(bn); }
      reveals();
    } else if (page === 'product') {
      product();
    }
  }
  if (d.readyState === 'loading') { d.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
