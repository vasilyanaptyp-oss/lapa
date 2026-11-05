/* BUVVide 2026 — veikala loģika (bez ietvariem). Grozs localStorage, dati no data/*.json. */
(function () {
  'use strict';
  var d = document, w = window;
  var IMG = 'https://www.buvvide.lv/userfiles/Image/';
  var SHOP = { tel: '+37129123476', telH: '29 123 476', tel2: '+37127422801', tel2H: '27 422 801', wa: '37120865048', waH: '+371 20 865 048',
    mail: 'birojs@buvvide.lv' };
  var PAGE = d.body.getAttribute('data-page') || '';
  var P = {};           // product registry id -> product
  var TREE = null;

  /* ── i18n (LV default, RU UI strings) ── */
  var LANG = 'lv';
  try { LANG = localStorage.getItem('bv_lang') === 'ru' ? 'ru' : 'lv'; } catch (e) {}
  var RU = w.BV_RU || {};
  function t(s) { return LANG === 'ru' && RU[s] ? RU[s] : s; }

  /* ── utils ── */
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(v) {
    if (v == null || isNaN(v)) return '';
    var s = (Math.round(v * 100) / 100).toFixed(2).split('.');
    s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return s[0] + ',' + s[1] + ' €';
  }
  var IMGMAP = w.BV_IMG || {};
  function img(p) {
    if (!p) return '';
    if (/^https?:/.test(p) || p.indexOf('img/') === 0) return p;
    return IMGMAP[p] || IMG + p;
  }
  function qp(k) { return new URLSearchParams(location.search).get(k); }
  function icon(n, cls) { return '<svg class="ico ' + (cls || '') + '" aria-hidden="true"><use href="#i-' + n + '"/></svg>'; }
  function fold(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9Ѐ-ӿ]+/g, ' ').trim(); }
  function natCmp(a, b) { return String(a).localeCompare(String(b), 'lv', { numeric: true, sensitivity: 'base' }); }
  var _cache = {};
  function getJSON(u) {
    if (!_cache[u]) _cache[u] = fetch(u, { cache: 'force-cache' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
    return _cache[u];
  }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function plural(n, one, many) {  // Latvian: 1 prece, 2 preces, 10 preču (genitive after 0 and 10-20, 30...)
    var m = n % 100, d = n % 10;
    if (d === 1 && m !== 11) return one;
    if (d === 0 || (m >= 11 && m <= 19)) return t('preču');
    return many;
  }
  function prodURL(p) { return 'prece.html?id=' + p.id + '&c=' + p.c; }
  function catURL(id) { return 'kategorija.html?c=' + id; }
  function waLink(text) { return 'https://wa.me/' + SHOP.wa + '?text=' + encodeURIComponent(text); }
  function reg(list) { (list || []).forEach(function (p) { if (p && p.id) P[p.id] = p; }); return list; }
  function loadTree() { return TREE ? Promise.resolve(TREE) : getJSON('data/tree.json').then(function (j) { TREE = j; return j; }); }

  /* ── cart ── */
  var Cart = {
    get: function () { return store('bv_cart') || []; },
    set: function (a) { store('bv_cart', a); Cart.badge(); },
    key: function (it) { return it.id + '|' + (it.v || ''); },
    add: function (p, q, v, vp) {
      var a = Cart.get(), k = p.id + '|' + (v || ''), f = null;
      a.forEach(function (it) { if (Cart.key(it) === k) f = it; });
      if (f) f.q = Math.min(999, f.q + q);
      else a.push({ id: p.id, c: p.c, n: p.n, pr: vp != null ? vp : p.pr, o: vp != null ? null : (p.o || null), img: p.img, v: v || '', q: q });
      Cart.set(a);
    },
    count: function () { return Cart.get().reduce(function (s, it) { return s + it.q; }, 0); },
    total: function () { return Cart.get().reduce(function (s, it) { return s + it.q * it.pr; }, 0); },
    badge: function () {
      var n = Cart.count(), sum = Cart.total();
      $$('.cart-count').forEach(function (e) { e.textContent = n ? n : ''; e.setAttribute('data-n', n); });
      $$('.hdr__cartsum').forEach(function (e) { e.textContent = n ? money(sum) : t('Grozs'); });
    }
  };

  var toastTimer;
  function toast(p, q, v) {
    var el = $('#toast');
    if (!el) return;
    el.innerHTML = (p.img ? '<img src="' + esc(img(p.img)) + '" alt="">' : '') +
      '<div class="toast__t"><b>' + t('Ielikts grozā') + (q > 1 ? ' · ' + q + ' ' + t('gab.') : '') + '</b><span>' + esc(p.n) + (v ? ' · ' + esc(v) : '') + '</span></div>' +
      '<a class="btn btn--yellow" href="grozs.html">' + t('Uz grozu') + '</a>';
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-on'); }, 4200);
  }
  function msg(text) {
    var el = $('#toast');
    if (!el) return;
    el.innerHTML = '<div class="toast__t"><span>' + esc(text) + '</span></div>';
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-on'); }, 3200);
  }

  /* ── product card ── */
  var FLAG = {
    akc: ['badge--akc', 'Akcija'], new: ['badge--new', 'Jaunums'], clear: ['badge--clear', 'Izpārdošana'], kit: ['badge--kit', 'Komplekts'], top: ['', 'Pieprasīts']
  };
  function pct(p) { return p.o && p.pr && p.o > p.pr ? Math.round((p.o - p.pr) / p.o * 100) : 0; }
  function badges(p) {
    var h = '', n = pct(p);
    if (n >= 1) h += '<span class="badge badge--sale">-' + n + '%</span>';
    (p.f || []).forEach(function (f) { if (FLAG[f]) h += '<span class="badge ' + FLAG[f][0] + '">' + t(FLAG[f][1]) + '</span>'; });
    return h ? '<div class="badges">' + h + '</div>' : '';
  }
  function priceHTML(p, vat) {
    var sale = pct(p) >= 1;
    return '<div class="price' + (sale ? ' price--sale' : '') + '"><b>' + money(p.pr) + '</b>' + (sale ? '<s>' + money(p.o) + '</s>' : '') +
      (vat ? '<span class="price__vat">' + t('ar PVN 21%') + '</span>' : '') + '</div>';
  }
  function metaLine(p) {
    var bits = [];
    if (p.s) bits.push(p.s);
    (p.prm || []).forEach(function (kv) { if (bits.length < 3 && kv[0] !== 'Preces tips' && kv[1].length < 28) bits.push(kv[1]); });
    return bits.join(' · ');
  }
  function card(p) {
    P[p.id] = p;
    var notes = '';
    if (p.nt && p.nt.length) notes = '<p class="card__note' + (p.nt[0][1] === 'g' ? ' note-g' : p.nt[0][1] === 'a' ? ' note-a' : ' card__note--ship') + '">' + esc(t(p.nt[0][0])) + '</p>';
    var meta = metaLine(p);
    return '<article class="card">' +
      '<a class="card__media" href="' + prodURL(p) + '" tabindex="-1" aria-hidden="true">' + badges(p) +
      (p.img ? '<img loading="lazy" decoding="async" width="300" height="300" src="' + esc(img(p.img)) + '" alt="">' : '') + '</a>' +
      '<div class="card__body"><div class="card__main"><a class="card__title" href="' + prodURL(p) + '">' + esc(p.n) + '</a>' +
      (meta ? '<p class="card__meta">' + esc(meta) + '</p>' : '') + '</div>' +
      '<div class="card__foot">' + priceHTML(p, false) + notes +
      '<div class="card__add"><button class="btn btn--sm" type="button" data-add="' + p.id + '">' + icon('cart') + '<span>' + t('Grozā') + '</span></button></div>' +
      '</div></div></article>';
  }

  /* ── delegated clicks ── */
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-add]');
    if (b) {
      e.preventDefault();
      var p = P[b.getAttribute('data-add')];
      if (!p) return;
      if (p.hv) { location.href = prodURL(p) + '#izvele'; return; }   // has variants: choose first
      Cart.add(p, 1);
      toast(p, 1);
      b.classList.add('is-added');
      var s = b.querySelector('span'); if (s) s.textContent = t('Ielikts');
      setTimeout(function () { b.classList.remove('is-added'); if (s) s.textContent = t('Grozā'); }, 1800);
      return;
    }
    var l = e.target.closest('[data-lang]');
    if (l) {
      e.preventDefault();
      store('bv_lang_tmp', 1);
      try { localStorage.setItem('bv_lang', l.getAttribute('data-lang')); } catch (er) {}
      location.reload();
    }
  });

  /* ── static pages: register embedded products ── */
  $$('script[type="application/json"][data-products]').forEach(function (s) { try { reg(JSON.parse(s.textContent)); } catch (e) {} });

  /* ── header: hide on scroll (phone) ── */
  (function () {
    var hdr = $('.hdr'), last = 0;
    if (!hdr) return;
    w.addEventListener('scroll', function () {
      var y = w.scrollY;
      if (w.innerWidth >= 1024) return;
      if (y > 160 && y > last + 4 && !d.body.classList.contains('menu-open')) hdr.classList.add('is-up');
      else if (y < last - 4 || y < 120) hdr.classList.remove('is-up');
      last = y;
    }, { passive: true });
  })();

  /* ── search suggest ── */
  var SIDX = null;
  function loadSearch() {
    if (SIDX) return Promise.resolve(SIDX);
    return getJSON('data/search.json').then(function (a) {
      SIDX = a.map(function (r) { return { id: r[0], c: r[1], n: r[2], pr: r[3], o: r[4], img: r[5], f: r[6] || [], hv: r[7] || 0, k: fold(r[2] + ' ' + r[0]) }; });
      return SIDX;
    });
  }
  function searchRank(q, list) {
    var fq = fold(q), toks = fq.split(' ').filter(Boolean);
    if (!toks.length) return [];
    var out = [];
    list.forEach(function (p) {
      var k = p.k, score = 0, all = true;
      for (var i = 0; i < toks.length; i++) {
        var tk = toks[i], pos = k.indexOf(tk);
        if (pos < 0) {
          if (tk.length > 4 && k.indexOf(tk.slice(0, -1)) >= 0) { score += 1; continue; }   // gal. -s / -i / -u
          all = false; break;
        }
        score += (pos === 0 || k.charAt(pos - 1) === ' ') ? 3 : 1;
      }
      if (!all) return;
      if (k.indexOf(fq) === 0) score += 6; else if (k.indexOf(' ' + fq) >= 0 || k.indexOf(fq) >= 0) score += 3;
      if (String(p.id) === fq) score += 20;
      out.push([score, p]);
    });
    out.sort(function (a, b) { return b[0] - a[0] || a[1].pr - b[1].pr; });
    return out.map(function (x) { return x[1]; });
  }
  function hl(name, q) {
    var toks = fold(q).split(' ').filter(function (x) { return x.length > 1; }), s = esc(name);
    if (!toks.length) return s;
    var f = fold(name);
    // highlight by folded positions (same length for Latin text)
    if (f.length !== name.length) return s;
    var marks = new Array(name.length).fill(false);
    toks.forEach(function (tk) { var i = f.indexOf(tk); while (i >= 0) { for (var j = i; j < i + tk.length; j++) marks[j] = true; i = f.indexOf(tk, i + 1); } });
    var out = '', on = false;
    for (var i = 0; i < name.length; i++) {
      if (marks[i] && !on) { out += '<mark>'; on = true; } else if (!marks[i] && on) { out += '</mark>'; on = false; }
      out += esc(name.charAt(i));
    }
    return out + (on ? '</mark>' : '');
  }
  $$('form.search').forEach(function (form) {
    var inp = $('input', form), box = $('.suggest', form), act = -1, tmr;
    if (!inp || !box) return;
    function close() { box.classList.remove('is-open'); act = -1; }
    function render() {
      var q = inp.value.trim();
      if (q.length < 2) { close(); return; }
      Promise.all([loadSearch(), loadTree()]).then(function (r) {
        if (inp.value.trim() !== q) return;
        var res = searchRank(q, r[0]).slice(0, 6), fq = fold(q), cats = [];
        Object.keys(r[1].cats).forEach(function (id) { var c = r[1].cats[id]; if (fold(c.n).indexOf(fq) >= 0 && cats.length < 4) cats.push([id, c]); });
        var h = '';
        if (cats.length) {
          h += '<div class="suggest__h">' + t('Kategorijas') + '</div>';
          cats.forEach(function (x) { h += '<a class="suggest__cat" href="' + catURL(x[0]) + '">' + icon('folder') + '<span>' + hl(x[1].n, q) + '</span><small>' + (x[1].cnt || '') + '</small></a>'; });
        }
        if (res.length) {
          h += '<div class="suggest__h">' + t('Preces') + '</div>';
          res.forEach(function (p) {
            h += '<a href="' + prodURL(p) + '"><span class="suggest__img">' + (p.img ? '<img src="' + esc(img(p.img)) + '" alt="" loading="lazy">' : '') + '</span>' +
              '<span class="suggest__name">' + hl(p.n, q) + '</span><span class="suggest__price">' + money(p.pr) + '</span></a>';
          });
          h += '<a class="suggest__all" href="meklet.html?q=' + encodeURIComponent(q) + '">' + t('Visi rezultāti') + ' →</a>';
        }
        if (!h) h = '<div class="suggest__empty">' + t('Nekas netika atrasts. Pamēģiniet citu vārdu vai preces ID.') + '</div>';
        box.innerHTML = h;
        box.classList.add('is-open');
        act = -1;
      }).catch(function () {});
    }
    inp.addEventListener('input', function () { clearTimeout(tmr); tmr = setTimeout(render, 120); });
    inp.addEventListener('focus', function () { loadSearch().catch(function () {}); if (inp.value.trim().length >= 2) render(); });
    inp.addEventListener('keydown', function (e) {
      var links = $$('a', box);
      if (e.key === 'Escape') { close(); return; }
      if (!box.classList.contains('is-open') || !links.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        act = (act + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
        links.forEach(function (a, i) { a.classList.toggle('is-act', i === act); });
      } else if (e.key === 'Enter' && act >= 0) { e.preventDefault(); location.href = links[act].href; }
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = inp.value.trim();
      if (q) location.href = 'meklet.html?q=' + encodeURIComponent(q);
      else inp.focus();
    });
    d.addEventListener('click', function (e) { if (!form.contains(e.target)) close(); });
  });

  /* ── catalog drawer (phone) + mega menu (desktop) ── */
  (function () {
    var back = $('.mm-back'), drawer = $('#drawer'), mega = $('#mega'), stack = [];
    function openDrawer() {
      loadTree().then(function () { stack = [0]; drawRender(); });
      drawer.classList.add('is-open'); back.classList.add('is-open'); d.body.classList.add('menu-open');
      drawer.setAttribute('aria-hidden', 'false');
    }
    function closeAll() {
      if (drawer) { drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); }
      if (mega) mega.classList.remove('is-open');
      if (back) back.classList.remove('is-open', 'is-mega');
      d.body.classList.remove('menu-open');
      $$('[data-mega]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    }
    function drawRender() {
      var cur = stack[stack.length - 1], C = TREE.cats, list = cur ? C[cur].k : TREE.top, h = '';
      $('.drawer__title', drawer).textContent = cur ? C[cur].n : t('Katalogs');
      $('[data-dback]', drawer).style.visibility = cur ? 'visible' : 'hidden';
      if (cur) h += '<a class="mlist__all" href="' + catURL(cur) + '">' + t('Skatīt visu') + ': ' + esc(C[cur].n) + '</a>';
      else h += '<a class="mlist__all" href="akcijas.html">' + icon('percent') + '<span class="mlist__name">' + t('Akcijas un atlaides') + '</span></a>';
      (list || []).forEach(function (id) {
        var c = C[id]; if (!c) return;
        var kids = c.k && c.k.length;
        var inner = '<span class="mlist__img">' + (c.img ? '<img src="' + esc(img(c.img)) + '" alt="" loading="lazy">' : '') + '</span>' +
          '<span class="mlist__name">' + esc(c.n) + (c.cnt ? ' <span class="mlist__n">' + c.cnt + '</span>' : '') + '</span>' + (kids ? icon('chev-r') : '');
        h += kids ? '<button type="button" data-dgo="' + id + '">' + inner + '</button>' : '<a href="' + catURL(id) + '">' + inner + '</a>';
      });
      var body = $('.drawer__body', drawer);
      body.innerHTML = '<nav class="mlist">' + h + '</nav>';
      body.scrollTop = 0;
    }
    if (drawer) {
      drawer.addEventListener('click', function (e) {
        var g = e.target.closest('[data-dgo]');
        if (g) { stack.push(+g.getAttribute('data-dgo')); drawRender(); return; }
        if (e.target.closest('[data-dback]')) { if (stack.length > 1) { stack.pop(); drawRender(); } return; }
        if (e.target.closest('[data-close]')) closeAll();
      });
    }
    $$('[data-menu]').forEach(function (b) { b.addEventListener('click', openDrawer); });
    if (back) back.addEventListener('click', closeAll);
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });

    function megaRender(id) {
      var C = TREE.cats, c = C[id], r = $('.mega__r', mega);
      $$('.mega__l a', mega).forEach(function (a) { a.classList.toggle('is-act', +a.getAttribute('data-mid') === id); });
      var h = '<div class="mega__title"><h3>' + esc(c.n) + '</h3><a href="' + catURL(id) + '">' + t('Skatīt visu') + (c.cnt ? ' (' + c.cnt + ')' : '') + ' →</a></div><div class="mega__cols">';
      (c.k || []).forEach(function (sid) {
        var s = C[sid]; if (!s) return;
        h += '<div class="mega__grp"><a href="' + catURL(sid) + '">' + esc(s.n) + (s.cnt ? '<small>' + s.cnt + '</small>' : '') + '</a>';
        if (s.k && s.k.length) {
          h += '<ul>';
          s.k.slice(0, 8).forEach(function (x) { var g = C[x]; if (g) h += '<li><a href="' + catURL(x) + '">' + esc(g.n) + '</a></li>'; });
          if (s.k.length > 8) h += '<li><a href="' + catURL(sid) + '">' + t('vēl') + ' ' + (s.k.length - 8) + ' →</a></li>';
          h += '</ul>';
        }
        h += '</div>';
      });
      r.innerHTML = h + '</div>';
    }
    function openMega(btn) {
      loadTree().then(function () {
        var l = $('.mega__l', mega);
        if (!l.children.length) {
          l.innerHTML = '<a href="akcijas.html" data-mid="0">' + icon('percent') + t('Akcijas un atlaides') + '</a>' + TREE.top.map(function (id) {
            var c = TREE.cats[id];
            return '<a href="' + catURL(id) + '" data-mid="' + id + '">' + (c.img ? '<img src="' + esc(img(c.img)) + '" alt="" loading="lazy">' : '') + esc(c.n) + '</a>';
          }).join('');
          l.addEventListener('mouseover', function (e) { var a = e.target.closest('a[data-mid]'); if (a && +a.getAttribute('data-mid')) megaRender(+a.getAttribute('data-mid')); });
          l.addEventListener('focusin', function (e) { var a = e.target.closest('a[data-mid]'); if (a && +a.getAttribute('data-mid')) megaRender(+a.getAttribute('data-mid')); });
        }
        megaRender(TREE.top[0]);
        mega.classList.add('is-open'); back.classList.add('is-open', 'is-mega');
        btn.setAttribute('aria-expanded', 'true');
      });
    }
    $$('[data-mega]').forEach(function (b) {
      b.addEventListener('click', function () { if (mega.classList.contains('is-open')) closeAll(); else openMega(b); });
    });
  })();

  /* ═════════ LISTING (category, akcijas, search) ═════════ */
  var SORTS = [['rec', 'Ieteicamās'], ['asc', 'Lētākās vispirms'], ['desc', 'Dārgākās vispirms'], ['disc', 'Lielākā atlaide'], ['az', 'Nosaukums A–Ž']];
  var OFFERS = [['sale', 'Ar atlaidi'], ['free', 'Bezmaksas piegāde'], ['akc', 'Akcijas prece'], ['ask', 'Atlaide pēc pieprasījuma'], ['clear', 'Izpārdošana']];

  function Listing(opts) {
    var S = { items: opts.items, sort: qp('sort') || 'rec', sel: {}, pmin: null, pmax: null, show: 24, view: store('bv_view') || 'grid', facets: [] };
    var root = opts.root;
    var pageKey = 'bv_ls_' + location.pathname + location.search.replace(/&?(sort|f|pmin|pmax)=[^&]*/g, '');
    // restore filters from URL
    var fq = qp('f');
    if (fq) fq.split(';').forEach(function (part) { var kv = part.split(':'); if (kv.length === 2) S.sel[decodeURIComponent(kv[0])] = kv[1].split(',').map(decodeURIComponent); });
    if (qp('pmin')) S.pmin = +qp('pmin');
    if (qp('pmax')) S.pmax = +qp('pmax');
    var saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(pageKey) || 'null'); } catch (e) {}
    if (saved && saved.show) S.show = saved.show;

    // facets
    function pval(p, k) {
      if (k === '__type') return p.g || (p.prm || []).reduce(function (a, kv) { return kv[0] === 'Preces tips' ? kv[1] : a; }, '') || '';
      if (k === '__cat') return String(p.c);
      if (k === '__offer') return null;
      for (var i = 0; i < (p.prm || []).length; i++) if (p.prm[i][0] === k) return p.prm[i][1];
      return '';
    }
    function offerVals(p) {
      var a = [];
      if (pct(p) >= 1) a.push('sale');
      (p.f || []).forEach(function (f) { if (f === 'akc' || f === 'ask' || f === 'clear' || f === 'free') a.push(f); });
      return a;
    }
    (function buildFacets() {
      var n = S.items.length, keys = {};
      if (opts.catFacet) S.facets.push({ k: '__cat', label: t('Kategorija'), map: opts.catFacet });
      var types = {};
      S.items.forEach(function (p) { var v = pval(p, '__type'); if (v) types[v] = 1; });
      if (Object.keys(types).length > 1) S.facets.push({ k: '__type', label: t('Preces tips') });
      S.items.forEach(function (p) { (p.prm || []).forEach(function (kv) { if (kv[0] !== 'Preces tips') keys[kv[0]] = (keys[kv[0]] || 0) + 1; }); });
      Object.keys(keys).filter(function (k) { return keys[k] >= Math.max(2, n * 0.25); })
        .map(function (k) {
          var vals = {};
          S.items.forEach(function (p) { var v = pval(p, k); if (v) vals[v] = 1; });
          return [k, keys[k], Object.keys(vals).length];
        })
        .filter(function (x) { return x[2] >= 2 && x[2] <= 60; })
        .sort(function (a, b) { return b[1] - a[1]; }).slice(0, 7)
        .forEach(function (x) { S.facets.push({ k: x[0], label: x[0] }); });
      var any = S.items.some(function (p) { return offerVals(p).length; });
      if (any) S.facets.unshift({ k: '__offer', label: t('Piedāvājumi') });
    })();

    function match(p, skip) {
      if (skip !== '__price') {
        if (S.pmin != null && p.pr < S.pmin) return false;
        if (S.pmax != null && p.pr > S.pmax) return false;
      }
      for (var k in S.sel) {
        if (k === skip || !S.sel[k].length) continue;
        if (k === '__offer') { var ov = offerVals(p); if (!S.sel[k].some(function (x) { return ov.indexOf(x) >= 0; })) return false; continue; }
        if (S.sel[k].indexOf(pval(p, k)) < 0) return false;
      }
      return true;
    }
    function sorted(list) {
      var a = list.slice();
      if (S.sort === 'asc') a.sort(function (x, y) { return x.pr - y.pr; });
      else if (S.sort === 'desc') a.sort(function (x, y) { return y.pr - x.pr; });
      else if (S.sort === 'disc') a.sort(function (x, y) { return pct(y) - pct(x) || x.pr - y.pr; });
      else if (S.sort === 'az') a.sort(function (x, y) { return natCmp(x.n, y.n); });
      return a;
    }
    function filtered() { return S.items.filter(function (p) { return match(p); }); }
    function selCount() { var n = 0; for (var k in S.sel) n += S.sel[k].length; return n + (S.pmin != null || S.pmax != null ? 1 : 0); }

    function syncURL() {
      var u = new URLSearchParams(location.search);
      ['sort', 'f', 'pmin', 'pmax'].forEach(function (k) { u.delete(k); });
      if (S.sort !== 'rec') u.set('sort', S.sort);
      var f = Object.keys(S.sel).filter(function (k) { return S.sel[k].length; }).map(function (k) { return encodeURIComponent(k) + ':' + S.sel[k].map(encodeURIComponent).join(','); }).join(';');
      if (f) u.set('f', f);
      if (S.pmin != null) u.set('pmin', S.pmin);
      if (S.pmax != null) u.set('pmax', S.pmax);
      var s = u.toString();
      history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash);
    }
    function valLabel(f, v) {
      if (f.k === '__offer') { for (var i = 0; i < OFFERS.length; i++) if (OFFERS[i][0] === v) return t(OFFERS[i][1]); }
      if (f.k === '__cat') return f.map[v] || v;
      return v;
    }

    var open = store('bv_fopen') || {};
    function facetHTML() {
      var h = '';
      var prices = S.items.map(function (p) { return p.pr; }).filter(function (x) { return x > 0; });
      var lo = Math.floor(Math.min.apply(null, prices)), hi = Math.ceil(Math.max.apply(null, prices));
      h += '<div class="fgroup" data-fk="__price"><button class="fgroup__h" type="button">' + t('Cena') + ', €' + icon('chev-d') + '</button><div class="fgroup__b">' +
        '<div class="frange"><input type="number" inputmode="decimal" min="0" placeholder="' + lo + '" value="' + (S.pmin != null ? S.pmin : '') + '" data-pmin aria-label="' + t('Cena no') + '"><span>–</span>' +
        '<input type="number" inputmode="decimal" min="0" placeholder="' + hi + '" value="' + (S.pmax != null ? S.pmax : '') + '" data-pmax aria-label="' + t('Cena līdz') + '"></div></div></div>';
      S.facets.forEach(function (f) {
        var counts = {};
        S.items.forEach(function (p) {
          if (!match(p, f.k)) return;
          if (f.k === '__offer') offerVals(p).forEach(function (v) { counts[v] = (counts[v] || 0) + 1; });
          else { var v = pval(p, f.k); if (v) counts[v] = (counts[v] || 0) + 1; }
        });
        var all = {};
        S.items.forEach(function (p) {
          if (f.k === '__offer') offerVals(p).forEach(function (v) { all[v] = 1; });
          else { var v = pval(p, f.k); if (v) all[v] = 1; }
        });
        var vals = Object.keys(all);
        if (f.k === '__offer') vals.sort(function (a, b) { return OFFERS.map(function (o) { return o[0]; }).indexOf(a) - OFFERS.map(function (o) { return o[0]; }).indexOf(b); });
        else if (f.k === '__cat' || f.k === '__type') vals.sort(function (a, b) { return (counts[b] || 0) - (counts[a] || 0) || natCmp(valLabel(f, a), valLabel(f, b)); });
        else vals.sort(natCmp);
        var sel = S.sel[f.k] || [], isOpen = open[f.k] != null ? open[f.k] : (f.k === '__offer' || f.k === '__type' || f.k === '__cat' || S.facets.indexOf(f) < 4 || sel.length);
        var limit = 6, many = vals.length > limit + 2;
        h += '<div class="fgroup' + (isOpen ? '' : ' is-closed') + '" data-fk="' + esc(f.k) + '"><button class="fgroup__h" type="button">' + esc(f.label) + (sel.length ? ' (' + sel.length + ')' : '') + icon('chev-d') + '</button><div class="fgroup__b">';
        if (vals.length > 14) h += '<input class="fsearch" type="search" placeholder="' + t('Meklēt') + '…" data-fsearch aria-label="' + t('Meklēt') + ' ' + esc(f.label) + '">';
        vals.forEach(function (v, i) {
          var c = counts[v] || 0, on = sel.indexOf(v) >= 0;
          h += '<label class="fopt' + (!c && !on ? ' is-zero' : '') + '"' + (many && i >= limit && !on ? ' hidden data-extra' : '') + '><input type="checkbox" value="' + esc(v) + '"' + (on ? ' checked' : '') + '>' +
            '<span>' + esc(valLabel(f, v)) + '</span><small>' + c + '</small></label>';
        });
        if (many) h += '<button class="fmore" type="button" data-fmore>' + t('Rādīt visus') + ' (' + vals.length + ')</button>';
        h += '</div></div>';
      });
      return h;
    }
    function chipsHTML() {
      var h = '';
      S.facets.forEach(function (f) {
        (S.sel[f.k] || []).forEach(function (v) { h += '<button class="chip" type="button" data-unsel="' + esc(f.k) + '" data-v="' + esc(v) + '">' + esc(valLabel(f, v)) + icon('x') + '</button>'; });
      });
      if (S.pmin != null || S.pmax != null) h += '<button class="chip" type="button" data-unprice>' + (S.pmin != null ? money(S.pmin) : '0') + ' – ' + (S.pmax != null ? money(S.pmax) : '…') + icon('x') + '</button>';
      if (h) h += '<button class="chip chip--clear" type="button" data-clearall>' + t('Notīrīt visu') + '</button>';
      return h;
    }
    function render(keepFacets) {
      var list = sorted(filtered()), n = list.length;
      var grid = $('[data-grid]', root);
      grid.classList.toggle('is-list', S.view === 'list');
      grid.innerHTML = n ? list.slice(0, S.show).map(card).join('') :
        (S.items.length ? '<div class="empty" style="grid-column:1/-1"><h3>' + t('Ar šiem filtriem preču nav') + '</h3><p>' + t('Noņemiet kādu filtru vai notīriet visus.') + '</p><button class="btn" type="button" data-clearall>' + t('Notīrīt filtrus') + '</button></div>'
          : '<div class="empty" style="grid-column:1/-1"><h3>' + t('Šajā kategorijā preces vēl tiek pievienotas') + '</h3><p>' + t('Apskatiet citas kategorijas vai pajautājiet mums pa tālruni.') + '</p><a class="btn" href="katalogs.html">' + t('Uz katalogu') + '</a></div>');
      var more = $('[data-more]', root);
      if (n > S.show) {
        more.innerHTML = '<span class="more__n">' + t('Rādītas') + ' ' + Math.min(S.show, n) + ' ' + t('no') + ' ' + n + '</span><span class="more__bar"><i style="width:' + Math.round(S.show / n * 100) + '%"></i></span>' +
          '<button class="btn btn--ghost" type="button" data-showmore>' + t('Rādīt vēl') + ' ' + Math.min(24, n - S.show) + '</button>';
      } else more.innerHTML = n > 24 ? '<span class="more__n">' + t('Rādītas visas') + ' ' + n + ' ' + plural(n, t('prece'), t('preces')) + '</span>' : '';
      $$('[data-count]', root).forEach(function (e) { e.textContent = n + ' ' + plural(n, t('prece'), t('preces')); });
      $$('[data-showbtn]').forEach(function (e) { e.textContent = t('Rādīt') + ' ' + n + ' ' + plural(n, t('preci'), t('preces')); });
      var sc = selCount();
      $$('[data-fcnt]').forEach(function (e) { e.textContent = sc ? sc : ''; });
      $('[data-chips]', root).innerHTML = chipsHTML();
      if (!keepFacets) $$('[data-facets]').forEach(function (e) { var st = e.scrollTop; e.innerHTML = facetHTML(); e.scrollTop = st; });
      else $$('[data-facets]').forEach(function (e) { refreshCounts(e); });
      try { sessionStorage.setItem(pageKey, JSON.stringify({ show: S.show })); } catch (e) {}
    }
    function refreshCounts(box) {
      // update counts without rebuilding inputs (keeps focus in price fields)
      S.facets.forEach(function (f) {
        var g = box.querySelector('.fgroup[data-fk="' + (w.CSS && CSS.escape ? CSS.escape(f.k) : f.k) + '"]');
        if (!g) return;
        var counts = {};
        S.items.forEach(function (p) {
          if (!match(p, f.k)) return;
          if (f.k === '__offer') offerVals(p).forEach(function (v) { counts[v] = (counts[v] || 0) + 1; });
          else { var v = pval(p, f.k); if (v) counts[v] = (counts[v] || 0) + 1; }
        });
        $$('.fopt', g).forEach(function (l) {
          var inp = $('input', l), c = counts[inp.value] || 0;
          $('small', l).textContent = c;
          l.classList.toggle('is-zero', !c && !inp.checked);
        });
      });
    }
    function changed(keepFacets) { S.show = 24; syncURL(); render(keepFacets); }

    // toolbar
    var sortSel = $('[data-sort]', root);
    sortSel.innerHTML = SORTS.map(function (s) { return '<option value="' + s[0] + '"' + (s[0] === S.sort ? ' selected' : '') + '>' + t(s[1]) + '</option>'; }).join('');
    sortSel.addEventListener('change', function () { S.sort = sortSel.value; changed(true); });
    $$('[data-view]', root).forEach(function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-view') === S.view);
      b.addEventListener('click', function () {
        S.view = b.getAttribute('data-view'); store('bv_view', S.view);
        $$('[data-view]', root).forEach(function (x) { x.classList.toggle('is-on', x === b); });
        render(true);
      });
    });
    var sheet = $('#fsheet');
    function sheetOpen(on) {
      sheet.classList.toggle('is-open', on);
      d.body.style.overflow = on && w.innerWidth < 1024 ? 'hidden' : '';
    }
    $$('[data-fopen]').forEach(function (b) { b.addEventListener('click', function () { sheetOpen(true); }); });
    $$('[data-fclose]').forEach(function (b) { b.addEventListener('click', function () { sheetOpen(false); }); });

    // facet events (delegated on document: sheet + sidebar are the same element)
    d.addEventListener('change', function (e) {
      var inp = e.target;
      if (!inp.closest || !inp.closest('[data-facets]')) return;
      var g = inp.closest('.fgroup');
      if (!g) return;
      var k = g.getAttribute('data-fk');
      if (inp.type === 'checkbox') {
        var a = S.sel[k] || (S.sel[k] = []), v = inp.value, i = a.indexOf(v);
        if (inp.checked && i < 0) a.push(v); else if (!inp.checked && i >= 0) a.splice(i, 1);
        var hdr = $('.fgroup__h', g);
        if (hdr) hdr.firstChild.textContent = (S.facets.filter(function (f) { return f.k === k; })[0] || { label: '' }).label + (a.length ? ' (' + a.length + ')' : '');
        changed(true);
      } else if (inp.hasAttribute('data-pmin') || inp.hasAttribute('data-pmax')) {
        var v2 = inp.value === '' ? null : Math.max(0, +inp.value);
        if (inp.hasAttribute('data-pmin')) S.pmin = v2; else S.pmax = v2;
        if (S.pmin != null && S.pmax != null && S.pmin > S.pmax) { var tmp = S.pmin; S.pmin = S.pmax; S.pmax = tmp; }
        changed(false);
      }
    });
    d.addEventListener('input', function (e) {
      var s = e.target;
      if (!s.hasAttribute || !s.hasAttribute('data-fsearch')) return;
      var q = fold(s.value), g = s.closest('.fgroup');
      $$('.fopt', g).forEach(function (l) { l.hidden = q ? fold($('span', l).textContent).indexOf(q) < 0 : l.hasAttribute('data-extra') && !g.classList.contains('is-all'); });
    });
    d.addEventListener('click', function (e) {
      var x;
      if ((x = e.target.closest('.fgroup__h'))) {
        var g = x.closest('.fgroup'); g.classList.toggle('is-closed');
        open[g.getAttribute('data-fk')] = !g.classList.contains('is-closed'); store('bv_fopen', open); return;
      }
      if ((x = e.target.closest('[data-fmore]'))) {
        var g2 = x.closest('.fgroup'); g2.classList.add('is-all');
        $$('[data-extra]', g2).forEach(function (l) { l.hidden = false; }); x.remove(); return;
      }
      if ((x = e.target.closest('[data-unsel]'))) {
        var k = x.getAttribute('data-unsel'), v = x.getAttribute('data-v'), a = S.sel[k] || [];
        a.splice(a.indexOf(v), 1); changed(false); return;
      }
      if (e.target.closest('[data-unprice]')) { S.pmin = S.pmax = null; changed(false); return; }
      if (e.target.closest('[data-clearall]')) { S.sel = {}; S.pmin = S.pmax = null; changed(false); return; }
      if (e.target.closest('[data-showmore]')) { S.show += 24; render(true); return; }
    });
    render(false);
    // restore scroll after back navigation
    if (saved && saved.y && performance.getEntriesByType && (performance.getEntriesByType('navigation')[0] || {}).type === 'back_forward') {
      requestAnimationFrame(function () { w.scrollTo(0, saved.y); });
    }
    w.addEventListener('pagehide', function () { try { sessionStorage.setItem(pageKey, JSON.stringify({ show: S.show, y: w.scrollY })); } catch (e) {} });
    return S;
  }

  function catPage() {
    var id = +qp('c') || 0, root = $('#listing');
    loadTree().then(function (T) {
      var c = T.cats[id];
      if (!c) { root.innerHTML = '<div class="empty"><h2>' + t('Kategorija nav atrasta') + '</h2><p>' + t('Iespējams, saite ir novecojusi.') + '</p><a class="btn" href="katalogs.html">' + t('Uz katalogu') + '</a></div>'; return; }
      d.title = c.n + ' — BUVVide.lv';
      // crumbs
      var chain = [], x = c;
      while (x) { chain.unshift(x); x = x.p ? T.cats[x.p] : null; }
      $('#crumbs').innerHTML = '<a href="index.html">' + t('Sākums') + '</a>' + icon('chev-r') + '<a href="katalogs.html">' + t('Katalogs') + '</a>' +
        chain.map(function (cc, i) { return icon('chev-r') + (i === chain.length - 1 ? '<span>' + esc(cc.n) + '</span>' : '<a href="' + catURL(cc.id) + '">' + esc(cc.n) + '</a>'); }).join('');
      $('#cat-h1').textContent = c.n;
      // subcategories (children, or siblings for a leaf)
      var subs = c.k && c.k.length ? c.k : (c.p && T.cats[c.p] ? T.cats[c.p].k : []);
      $('#subcats').innerHTML = (subs || []).map(function (sid) {
        var s = T.cats[sid]; if (!s) return '';
        return '<a class="subcat' + (sid === id ? ' is-on' : '') + '" href="' + catURL(sid) + '"><span class="subcat__img">' + (s.img ? '<img src="' + esc(img(s.img)) + '" alt="" loading="lazy">' : '') + '</span>' +
          '<span class="subcat__name">' + esc(s.n) + (s.cnt ? '<small>' + s.cnt + ' ' + plural(s.cnt, t('prece'), t('preces')) + '</small>' : '') + '</span></a>';
      }).join('');
      return getJSON('data/c/' + id + '.json').then(function (j) {
        reg(j.items);
        var tot = j.total || j.items.length;
        if (!j.items.length) { $('#cat-n').textContent = t('Preces šajā kategorijā vēl tiek pievienotas'); }
        else {
        $('#cat-n').textContent = tot + ' ' + plural(tot, t('prece'), t('preces'));
        if (j.items.length < tot) $('#cat-note').textContent = t('Šeit — pirmās') + ' ' + j.items.length + ' ' + t('preces no visām apakškategorijām. Lai redzētu visas, izvēlieties apakškategoriju augstāk.');
        }
        var catFacet = null;
        if (c.k && c.k.length) {
          catFacet = {};
          j.items.forEach(function (p) { if (T.cats[p.c]) catFacet[p.c] = T.cats[p.c].n; });
          if (Object.keys(catFacet).length < 2) catFacet = null;
        }
        if (j.desc) $('#cat-desc').innerHTML = '<h2>' + esc(c.n) + '</h2><p>' + esc(j.desc) + '</p>';
        Listing({ root: root, items: j.items, catFacet: catFacet });
      });
    }).catch(function () {
      root.innerHTML = '<div class="empty"><h2>' + t('Neizdevās ielādēt preces') + '</h2><p>' + t('Pārbaudiet savienojumu un mēģiniet vēlreiz.') + '</p><a class="btn" href="">' + t('Pārlādēt') + '</a></div>';
    });
  }

  function akcPage() {
    getJSON('data/c/akcijas.json').then(function (j) {
      reg(j.items);
      $('#cat-n').textContent = j.items.length + ' ' + plural(j.items.length, t('prece'), t('preces'));
      loadTree().then(function (T) {
        var cf = {};
        j.items.forEach(function (p) { if (T.cats[p.c]) cf[p.c] = T.cats[p.c].n; });
        Listing({ root: $('#listing'), items: j.items, catFacet: Object.keys(cf).length > 1 ? cf : null });
      });
    });
  }

  function searchPage() {
    var q = (qp('q') || '').trim(), root = $('#listing');
    $$('.search input').forEach(function (i) { i.value = q; });
    $('#cat-h1').textContent = q ? t('Meklēšana') + ': «' + q + '»' : t('Meklēšana');
    d.title = (q ? q + ' — ' : '') + t('Meklēšana') + ' — BUVVide.lv';
    var browse = !q && qp('f');
    if (browse) { $('#cat-h1').textContent = t('Visas preces'); d.title = t('Visas preces') + ' — BUVVide.lv'; }
    if (!q && !browse) { $('#cat-n').textContent = t('Ierakstiet preces nosaukumu, ražotāju vai ID.'); $('#search-empty').hidden = false; root.hidden = true; return; }
    Promise.all([loadSearch(), loadTree()]).then(function (r) {
      var res = (browse ? r[0] : searchRank(q, r[0]).slice(0, 600)).map(function (p) { return { id: p.id, c: p.c, n: p.n, pr: p.pr, o: p.o, img: p.img, f: p.f, hv: p.hv }; });
      var T = r[1];
      if (!res.length) {
        $('#cat-n').textContent = t('Nekas netika atrasts');
        $('#search-empty').hidden = false; root.hidden = true;
        // category suggestions by folded words
        return;
      }
      $('#cat-n').textContent = t('Atrastas') + ' ' + res.length + ' ' + plural(res.length, t('prece'), t('preces'));
      var cf = {}, cc = {};
      res.forEach(function (p) { if (T.cats[p.c]) { cf[p.c] = T.cats[p.c].n; cc[p.c] = (cc[p.c] || 0) + 1; } });
      var top = Object.keys(cc).sort(function (a, b) { return cc[b] - cc[a]; }).slice(0, 12);
      $('#subcats').innerHTML = top.map(function (id) {
        var s = T.cats[id];
        return '<a class="subcat" href="' + catURL(id) + '"><span class="subcat__img">' + (s.img ? '<img src="' + esc(img(s.img)) + '" alt="" loading="lazy">' : '') + '</span><span class="subcat__name">' + esc(s.n) + '<small>' + cc[id] + ' ' + t('atrastas') + '</small></span></a>';
      }).join('');
      Listing({ root: root, items: res, catFacet: Object.keys(cf).length > 1 ? cf : null });
    });
  }

  /* ═════════ PRODUCT ═════════ */
  function productPage() {
    var id = +qp('id'), cid = +qp('c'), root = $('#product');
    Promise.all([
      getJSON('data/pd/' + id + '.json').catch(function () { return null; }),
      cid ? getJSON('data/c/' + cid + '.json').catch(function () { return null; }) : Promise.resolve(null),
      loadTree()
    ]).then(function (r) {
      var det = r[0], list = r[1], T = r[2], base = null;
      if (list) { reg(list.items); list.items.forEach(function (p) { if (p.id === id) base = p; }); }
      if (!det && !base) {
        return loadSearch().then(function (S) {
          S.forEach(function (p) { if (p.id === id) base = p; });
          if (!base) { root.innerHTML = '<div class="empty" style="margin:30px 0"><h2>' + t('Prece nav atrasta') + '</h2><p>' + t('Iespējams, tā vairs netiek pārdota.') + '</p><a class="btn" href="katalogs.html">' + t('Uz katalogu') + '</a></div>'; return; }
          draw(null, base, list, T);
        });
      }
      draw(det, base, list, T);
    });

    function draw(det, base, list, T) {
      var p = {
        id: id, c: cid || (base && base.c), n: (det && det.name) || base.n, s: (det && det.short) || (base && base.s) || '',
        pr: (det && det.price) || base.pr, o: (det && det.old) || (base && base.o) || null,
        img: (det && det.images && det.images[0]) || (base && base.img) || '', f: (base && base.f) || (det && det.f) || [],
        prm: (det && det.params && det.params.length ? det.params : (base && base.prm) || []), brand: det && det.brand, code: det && det.code
      };
      P[id] = p;
      var c = T.cats[p.c];
      d.title = p.n + ' — BUVVide.lv';
      var chain = [], x = c;
      while (x) { chain.unshift(x); x = x.p ? T.cats[x.p] : null; }
      $('#crumbs').innerHTML = '<a href="index.html">' + t('Sākums') + '</a>' + chain.map(function (cc) { return icon('chev-r') + '<a href="' + catURL(cc.id) + '">' + esc(cc.n) + '</a>'; }).join('');
      var images = (det && det.images && det.images.length) ? det.images : (p.img ? [p.img] : []);
      var variants = (det && det.variants) || [];
      var desc = (det && det.desc) || [];
      var sale = pct(p) >= 1, flags = p.f || [];
      var side = variants.some(function (v) { return /kreis|labā|labās/i.test(v.code + ' ' + v.model); });
      var vprices = variants.map(function (v) { return v.price; }).filter(Boolean);
      var vdiff = vprices.length && Math.min.apply(null, vprices) !== Math.max.apply(null, vprices);

      var h = '<div class="pp"><div class="gal">';
      h += '<div class="gal__main" id="galmain">' + (images.length ? images.map(function (u, i) {
        return '<button type="button" class="gal__slide" data-lb="' + i + '" aria-label="' + t('Palielināt attēlu') + ' ' + (i + 1) + '"><img src="' + esc(img(u)) + '" alt="' + esc(p.n) + (i ? ' — ' + (i + 1) : '') + '"' + (i ? ' loading="lazy"' : '') + '></button>';
      }).join('') : '<div class="gal__slide"></div>') + '</div>';
      if (images.length > 1) {
        h += '<div class="gal__thumbs">' + images.map(function (u, i) { return '<button type="button" data-go="' + i + '"' + (i ? '' : ' class="is-on"') + ' aria-label="' + t('Attēls') + ' ' + (i + 1) + '"><img src="' + esc(img(u)) + '" alt="" loading="lazy"></button>'; }).join('') + '</div>';
        h += '<span class="gal__count" id="galn">1 / ' + images.length + '</span><div class="gal__dots">' + images.map(function (u, i) { return '<i' + (i ? '' : ' class="is-on"') + '></i>'; }).join('') + '</div>';
      }
      h += '</div><div class="pp__info">';
      if (p.brand) h += '<p class="pp__brand">' + t('Ražotājs') + ': ' + esc(p.brand) + '</p>';
      h += '<h1>' + esc(p.n) + '</h1><div class="pp__ids"><span>ID: ' + id + '</span>' + (p.code ? '<span>' + t('Kods') + ': ' + esc(p.code) + '</span>' : '') + '</div>';
      if (p.s) h += '<p class="pp__short">' + esc(p.s) + '</p>';
      var bh = '';
      if (sale) bh += '<span class="badge badge--sale">-' + pct(p) + '%</span>';
      flags.forEach(function (f) { if (FLAG[f]) bh += '<span class="badge ' + FLAG[f][0] + '">' + t(FLAG[f][1]) + '</span>'; });
      if (bh) h += '<div class="pp__badges">' + bh + '</div>';
      h += '<div class="buybox" id="buybox"><div id="pprice">' + priceHTML(p, true) + '</div>';
      if (sale) h += '<span class="save">' + icon('percent') + t('Ietaupiet') + ' ' + money(p.o - p.pr) + '</span>';
      if (variants.length) {
        h += '<div class="opt" id="izvele"><div class="opt__label">' + (side ? t('Izvēlieties izmēru un virzienu') : t('Izvēlieties modeli')) + ': <span id="optsel">—</span></div><div class="opt__vals">' +
          variants.map(function (v, i) { var lab = [v.code, v.model].filter(Boolean).join(' · '); return '<button type="button" class="opt__val" data-var="' + i + '">' + esc(lab) + (vdiff && v.price ? ' — ' + money(v.price) : '') + '</button>'; }).join('') + '</div>';
        if (side) h += '<p class="field__hint" style="margin-top:8px">' + t('Pasūtot jānorāda vēršanas virziens — kreisās vai labās durvis.') + '</p>';
        h += '<p class="field__err" id="opterr">' + t('Lūdzu, izvēlieties variantu.') + '</p></div>';
      }
      h += '<div class="buyrow"><div class="qty"><button type="button" data-q="-1" aria-label="' + t('Mazāk') + '">' + icon('minus') + '</button><input id="qty" type="number" min="1" max="999" value="1" aria-label="' + t('Daudzums') + '"><button type="button" data-q="1" aria-label="' + t('Vairāk') + '">' + icon('plus') + '</button></div>' +
        '<button class="btn" type="button" id="buy">' + icon('cart') + t('Ielikt grozā') + '</button></div>';
      h += '<a class="btn btn--wa btn--block buybox__wa" id="pwa" target="_blank" rel="noopener" href="' + waLink(t('Labdien! Vēlos pasūtīt') + ': ' + p.n + ' (ID ' + id + ')') + '"><svg class="wa-ico" aria-hidden="true"><use href="#i-wa"/></svg>' + t('Pasūtīt WhatsApp') + '</a>';
      var nts = (det && det.nt) || (base && base.nt) || [];
      nts.forEach(function (x) { if (!/Atlaide pēc/.test(x[0])) h += '<p class="buybox__ask' + (x[1] === 'g' ? ' is-g' : '') + '">' + icon(x[1] === 'g' ? 'truck' : 'info') + '<span>' + esc(t(x[0])) + '</span></p>'; });
      if (flags.indexOf('ask') >= 0) h += '<p class="buybox__ask">' + icon('percent') + '<span>' + t('Šai precei iespējama atlaide.') + ' <a target="_blank" rel="noopener" href="' + waLink(t('Labdien! Vai precei') + ' ' + p.n + ' (ID ' + id + ') ' + t('iespējama atlaide?')) + '">' + t('Jautāt cenu') + '</a></span></p>';
      h += '<div class="perks">' +
        '<div class="perk">' + icon('truck') + '<div><b>' + t('Piegāde visā Latvijā') + '</b><span>' + (flags.indexOf('free') >= 0 ? t('Šai precei piegāde bez maksas. ') : flags.indexOf('ship') >= 0 ? t('Tikai ar maksas piegādi uz objektu vai adresi. ') : '') + t('Kurjers piegādā 2–4 darba dienās pēc apmaksas.') + '</span></div></div>' +
        (flags.indexOf('ship') >= 0 ? '' : '<div class="perk">' + icon('store') + '<div><b>' + t('Saņemšana noliktavā') + '</b><span>' + t('Par piegādi nav jāmaksā. Pēc apmaksas nododam noliktavai 2 darba stundu laikā.') + '</span></div></div>') +
        '<div class="perk">' + icon('bank') + '<div><b>' + t('Maksājat pēc rēķina') + '</b><span>' + t('Apmaksa uzreiz nav jāveic: ja prece ir noliktavā, rezervējam to uz 3 darba dienām un nosūtām avansa rēķinu.') + '</span></div></div>' +
        (p.pr >= 150 ? '<div class="perk">' + icon('calendar') + '<div><b>' + t('ESTO līzings līdz 60 mēnešiem') + '</b><span>' + t('Privātpersonām. Izvēlieties to, noformējot pasūtījumu.') + '</span></div></div>' : '') +
        '<div class="perk">' + icon('phone') + '<div><b>' + t('Jautājumi par preci?') + '</b><span><a href="tel:' + SHOP.tel + '">' + SHOP.telH + '</a> · ' + t('darba dienās 9:30–17:30') + '</span></div></div>' +
        '</div></div>';
      // accessories / kit parts («Piederumi» tab of the shop)
      var acc = (det && det.acc) || [];
      if (acc.length) {
        reg(acc.map(function (x) { return { id: x.id, c: x.c, n: x.n, pr: x.pr, o: x.o, img: x.img }; }));
        var kh = '', ksum = 0;
        acc.forEach(function (k) {
          ksum += k.pr || 0;
          kh += '<li>' + (k.img ? '<img src="' + esc(img(k.img)) + '" alt="" loading="lazy">' : '') + '<a href="prece.html?id=' + k.id + '&c=' + k.c + '">' + esc(k.n) + '</a>' +
            (k.pr ? '<b>' + money(k.pr) + '</b>' : '') + '<button class="iconbtn" type="button" data-add="' + k.id + '" aria-label="' + t('Ielikt grozā') + ': ' + esc(k.n) + '">' + icon('plus') + '</button></li>';
        });
        var isKit = det.kit || flags.indexOf('kit') >= 0;
        h += '<div class="kit"><h3>' + icon('box') + (isKit ? t('Komplekta daļas un piederumi') : t(det.acc_label || 'Piederumi')) + '</h3><ul>' + kh + '</ul>' +
          (acc.length > 1 ? '<div class="kit__sum"><span>' + t('Visas') + ' ' + acc.length + ' ' + t('pozīcijas') + '</span><span>' + money(ksum) + '</span></div><button class="btn btn--ghost btn--block" type="button" id="accall" style="margin-top:10px">' + icon('cart') + t('Ielikt grozā visas pozīcijas') + '</button>' : '') + '</div>';
      }
      h += '</div></div>';
      // details
      var specRows = p.prm.filter(function (kv) { return kv[1]; }).map(function (kv) { return '<tr><th>' + esc(kv[0]) + '</th><td>' + esc(kv[1]) + '</td></tr>'; }).join('');
      h += '<div class="pp__more">';
      if (desc.length) h += '<section class="pp__sec acc is-open"><button class="acc__h" type="button">' + t('Apraksts') + icon('chev-d') + '</button><div class="acc__b desc">' + desc.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') + '</div></section>';
      if (specRows) h += '<section class="pp__sec acc' + (desc.length ? '' : ' is-open') + '"><button class="acc__h" type="button">' + t('Tehniskie parametri') + icon('chev-d') + '</button><div class="acc__b"><table class="spec"><tbody><tr><th>ID</th><td>' + id + '</td></tr>' + (p.code ? '<tr><th>' + t('Kods') + '</th><td>' + esc(p.code) + '</td></tr>' : '') + specRows + '</tbody></table></div></section>';
      h += '<section class="pp__sec acc"><button class="acc__h" type="button">' + t('Piegāde, apmaksa, atgriešana') + icon('chev-d') + '</button><div class="acc__b prose"><ul>' +
        '<li>' + t('Cenas norādītas eiro ar PVN 21%. Uzņēmumiem — PVN 0% precēm, uz kurām attiecas reversais PVN.') + '</li>' +
        '<li>' + t('Ja prece ir noliktavā, rezervējam to uz 3 darba dienām un nosūtām rēķinu. Neapmaksāti rēķini pēc 3 darba dienām tiek anulēti.') + '</li>' +
        '<li>' + t('Preces uz pasūtījumu pasūtām vai sākam ražot pēc apmaksas.') + '</li>' +
        '<li>' + t('Privātpersonām — tiesības 14 dienu laikā atteikties no pirkuma.') + ' <a class="link" href="info.html#atgriesana">' + t('Sīkāk') + '</a></li></ul></div></section>';
      h += '</div>';
      root.innerHTML = h;
      bind(p, images, variants);
      // related + recently viewed
      var rel = list ? list.items.filter(function (x) { return x.id !== id; }) : [];
      var sameType = rel.filter(function (x) { return base && x.g && x.g === base.g; });
      rel = sameType.concat(rel.filter(function (x) { return sameType.indexOf(x) < 0; })).slice(0, 10);
      if (rel.length) { $('#related').hidden = false; $('#related-rail').innerHTML = rel.map(card).join(''); if (c) $('#related-more').href = catURL(c.id); }
      var seen = (store('bv_seen') || []).filter(function (x) { return x.id !== id; });
      if (seen.length) { $('#seen').hidden = false; reg(seen); $('#seen-rail').innerHTML = seen.slice(0, 10).map(card).join(''); }
      seen.unshift({ id: id, c: p.c, n: p.n, pr: p.pr, o: p.o, img: p.img, f: p.f, hv: variants.length ? 1 : 0 });
      store('bv_seen', seen.slice(0, 12));
      // sticky buy (phone)
      var sb = $('#stickybuy');
      $('.stickybuy__name', sb).textContent = p.n;
      $('.stickybuy__p', sb).insertAdjacentHTML('beforeend', priceHTML(p, false));
      if ('IntersectionObserver' in w) {
        var io = new IntersectionObserver(function (en) {
          var vis = en[0].isIntersecting;
          sb.classList.toggle('is-on', !vis); d.body.classList.toggle('has-sticky', !vis);
        });
        io.observe($('#buy'));
      }
      $('[data-sbuy]', sb).addEventListener('click', function () { $('#buy').click(); });
      var all = $('#accall');
      if (all) all.addEventListener('click', function () {
        var acc2 = (det && det.acc) || [];
        acc2.forEach(function (x) { Cart.add(P[x.id], 1); });
        msg(t('Grozā ieliktas') + ' ' + acc2.length + ' ' + t('pozīcijas'));
      });
      if (location.hash === '#izvele' && $('#izvele')) setTimeout(function () { $('#izvele').scrollIntoView({ block: 'center' }); }, 60);
    }

    function bind(p, images, variants) {
      var vi = -1, qty = $('#qty');
      // gallery
      var main = $('#galmain'), n = images.length;
      function setIdx(i) {
        $$('.gal__thumbs button').forEach(function (b, k) { b.classList.toggle('is-on', k === i); });
        $$('.gal__dots i').forEach(function (b, k) { b.classList.toggle('is-on', k === i); });
        var c = $('#galn'); if (c) c.textContent = (i + 1) + ' / ' + n;
      }
      if (main && n > 1) {
        main.addEventListener('scroll', function () { setIdx(Math.round(main.scrollLeft / main.clientWidth)); }, { passive: true });
        $$('[data-go]').forEach(function (b) { b.addEventListener('click', function () { main.scrollTo({ left: main.clientWidth * +b.getAttribute('data-go'), behavior: 'smooth' }); }); });
      }
      // lightbox
      var lb = $('#lightbox'), li = 0;
      function lbShow(i) { li = (i + n) % n; $('img', lb).src = img(images[li]); $('.lightbox__n', lb).textContent = n > 1 ? (li + 1) + ' / ' + n : ''; }
      $$('[data-lb]').forEach(function (b) { b.addEventListener('click', function () { lbShow(+b.getAttribute('data-lb')); lb.classList.add('is-open'); d.body.style.overflow = 'hidden'; }); });
      function lbClose() { lb.classList.remove('is-open'); d.body.style.overflow = ''; }
      $('.lightbox__x', lb).onclick = lbClose;
      $('.lightbox__prev', lb).onclick = function () { lbShow(li - 1); };
      $('.lightbox__next', lb).onclick = function () { lbShow(li + 1); };
      $('.lightbox__prev', lb).hidden = $('.lightbox__next', lb).hidden = n < 2;
      lb.onclick = function (e) { if (e.target === lb) lbClose(); };
      d.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('is-open')) return;
        if (e.key === 'Escape') lbClose(); else if (e.key === 'ArrowLeft' && n > 1) lbShow(li - 1); else if (e.key === 'ArrowRight' && n > 1) lbShow(li + 1);
      });
      // accordions
      $$('.acc__h').forEach(function (b) { b.setAttribute('aria-expanded', b.parentNode.classList.contains('is-open')); b.addEventListener('click', function () { var s = b.parentNode; s.classList.toggle('is-open'); b.setAttribute('aria-expanded', s.classList.contains('is-open')); }); });
      // variants
      $$('[data-var]').forEach(function (b) {
        b.addEventListener('click', function () {
          vi = +b.getAttribute('data-var');
          $$('[data-var]').forEach(function (x) { x.classList.toggle('is-on', x === b); });
          var v = variants[vi];
          $('#optsel').textContent = [v.code, v.model].filter(Boolean).join(' · ');
          $('#opterr').style.display = 'none';
          if (v.price) {
            var vp = { pr: v.price, o: p.o && v.price === p.pr ? p.o : null };
            $('#pprice').innerHTML = priceHTML(vp, true);
          }
          $('#pwa').href = waLink(t('Labdien! Vēlos pasūtīt') + ': ' + p.n + ' (ID ' + p.id + '), ' + $('#optsel').textContent);
        });
      });
      // qty
      $$('[data-q]').forEach(function (b) { b.addEventListener('click', function () { qty.value = Math.max(1, Math.min(999, (+qty.value || 1) + +b.getAttribute('data-q'))); }); });
      qty.addEventListener('change', function () { qty.value = Math.max(1, Math.min(999, Math.round(+qty.value) || 1)); });
      $('#buy').addEventListener('click', function () {
        if (variants.length && vi < 0) {
          var e = $('#opterr'); e.style.display = 'block';
          $('#izvele').scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        var q = Math.max(1, Math.min(999, Math.round(+qty.value) || 1)), v = vi >= 0 ? variants[vi] : null;
        var lab = v ? [v.code, v.model].filter(Boolean).join(' · ') : '';
        Cart.add(p, q, lab, v && v.price ? v.price : null);
        toast(p, q, lab);
      });
    }
  }

  /* ═════════ CART ═════════ */
  function cartPage() {
    var root = $('#cart');
    function draw() {
      var a = Cart.get();
      if (!a.length) {
        root.innerHTML = $('#cart-empty-tpl').innerHTML;
        $('#cart-h-n').textContent = '';
        return;
      }
      var n = Cart.count(), sum = Cart.total(), save = a.reduce(function (s, it) { return s + (it.o && it.o > it.pr ? (it.o - it.pr) * it.q : 0); }, 0);
      $('#cart-h-n').textContent = n + ' ' + plural(n, t('prece'), t('preces'));
      var h = '<div class="cartgrid"><div class="cl">';
      a.forEach(function (it, i) {
        P[it.id] = P[it.id] || it;
        h += '<div class="cl__row"><a class="cl__img" href="' + prodURL(it) + '">' + (it.img ? '<img src="' + esc(img(it.img)) + '" alt="">' : '') + '</a><div>' +
          '<a class="cl__name" href="' + prodURL(it) + '">' + esc(it.n) + '</a>' + (it.v ? '<p class="cl__var">' + esc(it.v) + '</p>' : '') +
          '<p class="cl__unit">' + money(it.pr) + ' / ' + t('gab.') + (it.o && it.o > it.pr ? ' · <s>' + money(it.o) + '</s>' : '') + '</p></div>' +
          '<div class="cl__ctrl"><div class="qty qty--sm"><button type="button" data-cq="-1" data-i="' + i + '" aria-label="' + t('Mazāk') + '">' + icon('minus') + '</button><input type="number" min="1" max="999" value="' + it.q + '" data-cqi="' + i + '" aria-label="' + t('Daudzums') + '"><button type="button" data-cq="1" data-i="' + i + '" aria-label="' + t('Vairāk') + '">' + icon('plus') + '</button></div>' +
          '<span class="cl__sum">' + money(it.pr * it.q) + '</span><button class="cl__rm" type="button" data-rm="' + i + '">' + icon('trash') + t('Dzēst') + '</button></div></div>';
      });
      h += '</div><aside class="summary"><h2>' + t('Kopsavilkums') + '</h2>' +
        '<div class="sumrow"><span>' + t('Preces') + ' (' + n + ')</span><span>' + money(sum + save) + '</span></div>' +
        (save > 0 ? '<div class="sumrow sumrow--save"><span>' + t('Atlaide') + '</span><span>−' + money(save) + '</span></div>' : '') +
        '<div class="sumrow"><span>' + t('Piegāde') + '</span><span>' + t('aprēķināsim rēķinā') + '</span></div>' +
        '<div class="sumrow sumrow--total"><span>' + t('Kopā ar PVN') + '</span><span>' + money(sum) + '</span></div>';
      h += '<a class="btn btn--block" href="noformet.html">' + t('Noformēt pasūtījumu') + icon('arrow-r') + '</a>' +
        '<a class="btn btn--ghost btn--block" style="margin-top:8px" href="katalogs.html">' + t('Turpināt iepirkties') + '</a>' +
        '<div class="summary__note"><p>' + icon('bank') + '<span>' + t('Apmaksa uzreiz nav jāveic. Nosūtīsim avansa rēķinu; preces noliktavā rezervējam uz 3 darba dienām.') + '</span></p>' +
        '<p>' + icon('truck') + '<span>' + t('Piegāde visā Latvijā 2–4 darba dienās pēc apmaksas vai saņemšana noliktavā.') + '</span></p>' +
        '<p>' + icon('clock') + '<span>' + t('Pasūtījumus pieņemam 24/7, apstrādājam darba dienās 9:30–17:30.') + '</span></p></div></aside></div>';
      root.innerHTML = h;
    }
    root.addEventListener('click', function (e) {
      var b, a = Cart.get();
      if ((b = e.target.closest('[data-cq]'))) { var i = +b.getAttribute('data-i'); a[i].q = Math.max(1, Math.min(999, a[i].q + +b.getAttribute('data-cq'))); Cart.set(a); draw(); return; }
      if ((b = e.target.closest('[data-rm]'))) {
        var k = +b.getAttribute('data-rm'), gone = a.splice(k, 1)[0]; Cart.set(a); draw();
        var el = $('#toast');
        el.innerHTML = '<div class="toast__t"><span>' + t('Izņemts no groza') + ': ' + esc(gone.n) + '</span></div><button class="btn btn--yellow" type="button" id="undo">' + t('Atsaukt') + '</button>';
        el.classList.add('is-on'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.classList.remove('is-on'); }, 5000);
        $('#undo').onclick = function () { var c = Cart.get(); c.splice(k, 0, gone); Cart.set(c); draw(); el.classList.remove('is-on'); };
        return;
      }
      if ((b = e.target.closest('[data-blocked]'))) { e.preventDefault(); return; }
    });
    root.addEventListener('change', function (e) {
      var i = e.target.getAttribute('data-cqi'); if (i == null) return;
      var a = Cart.get(); a[+i].q = Math.max(1, Math.min(999, Math.round(+e.target.value) || 1)); Cart.set(a); draw();
    });
    draw();
  }

  /* ═════════ CHECKOUT ═════════ */
  function checkoutPage() {
    var a = Cart.get(), root = $('#checkout');
    if (!a.length) { root.innerHTML = $('#cart-empty-tpl').innerHTML; return; }
    var type = 'priv', ship = 'del', pay = 'bank';
    var sum = Cart.total();
    $('#co-items').innerHTML = a.map(function (it) { return '<li>' + (it.img ? '<img src="' + esc(img(it.img)) + '" alt="">' : '') + '<span>' + esc(it.n) + (it.v ? ' · ' + esc(it.v) : '') + ' × ' + it.q + '</span><b>' + money(it.pr * it.q) + '</b></li>'; }).join('');
    $('#co-sum').textContent = money(sum); $('#co-sum2').textContent = money(sum);
    $('#co-n').textContent = Cart.count();
    function apply() {
      $$('[data-type]').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-type') === type); b.setAttribute('aria-pressed', b.getAttribute('data-type') === type); });
      $$('[data-company]').forEach(function (e) { e.hidden = type !== 'comp'; });
      $$('[data-company] input').forEach(function (e) { if (e.hasAttribute('data-req')) e.required = type === 'comp'; });
      $$('[data-addr]').forEach(function (e) { e.hidden = ship !== 'del'; });
      $$('[data-addr] input[data-req]').forEach(function (e) { e.required = ship === 'del'; });
      $$('.radio').forEach(function (r) { r.classList.toggle('is-on', $('input', r).checked); });
      var esto = $('#pay-esto');
      esto.hidden = type === 'comp';
      if (type === 'comp' && pay === 'esto') { pay = 'bank'; $('#pay-bank input').checked = true; }
      $('#co-ship').textContent = ship === 'del' ? t('aprēķināsim rēķinā') : t('bez maksas');
    }
    $$('[data-type]').forEach(function (b) { b.addEventListener('click', function () { type = b.getAttribute('data-type'); apply(); }); });
    $$('input[name="ship"]').forEach(function (r) { r.addEventListener('change', function () { ship = r.value; apply(); }); });
    $$('input[name="pay"]').forEach(function (r) { r.addEventListener('change', function () { pay = r.value; apply(); }); });
    apply();
    var form = $('#coform');
    function check(inp) {
      var f = inp.closest('.field'), v = inp.value.trim(), ok = true;
      if (inp.required && !v) ok = false;
      else if (v && inp.type === 'email' && !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v)) ok = false;
      else if (v && inp.type === 'tel' && v.replace(/\D/g, '').length < 8) ok = false;
      if (f) f.classList.toggle('is-err', !ok);
      return ok;
    }
    $$('input, textarea', form).forEach(function (i) { i.addEventListener('blur', function () { if (i.value) check(i); }); i.addEventListener('input', function () { var f = i.closest('.field'); if (f && f.classList.contains('is-err')) check(i); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = $$('input, textarea', form).filter(function (i) { return !i.closest('[hidden]') && !check(i); });
      if (bad.length) { bad[0].focus(); bad[0].scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
      var F = function (n) { var i = form.elements[n]; return i ? i.value.trim() : ''; };
      var lines = [];
      lines.push(t('Pasūtījums') + ' — BUVVide.lv');
      lines.push('');
      Cart.get().forEach(function (it) { lines.push('• ' + it.n + ' (ID ' + it.id + ')' + (it.v ? ', ' + it.v : '') + ' — ' + it.q + ' ' + t('gab.') + ' × ' + money(it.pr) + ' = ' + money(it.pr * it.q)); });
      lines.push('');
      lines.push(t('Kopā ar PVN') + ': ' + money(Cart.total()));
      lines.push(t('Pircējs') + ': ' + F('fname') + ' ' + F('lname') + ', ' + F('phone') + ', ' + F('email'));
      if (type === 'comp') lines.push(t('Uzņēmums') + ': ' + F('cname') + ', ' + t('reģ. nr.') + ' ' + F('creg') + (F('cvat') ? ', ' + t('PVN nr.') + ' ' + F('cvat') : '') + ', ' + F('caddr'));
      lines.push(t('Saņemšana') + ': ' + (ship === 'del' ? t('piegāde uz adresi') + ' — ' + F('addr') + ', ' + F('city') + ', ' + F('zip') : t('saņemšana noliktavā')));
      lines.push(t('Apmaksa') + ': ' + (pay === 'esto' ? t('ESTO līzings') : t('bankas pārskaitījums pēc rēķina')));
      if (F('note')) lines.push(t('Komentārs') + ': ' + F('note'));
      var text = lines.join('\n');
      var subj = t('Pasūtījums') + ' — ' + F('fname') + ' ' + F('lname');
      $('#co-done-text').textContent = text;
      $('#co-mail').href = 'mailto:' + SHOP.mail + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(text);
      $('#co-wa').href = waLink(text);
      $('#co-form-wrap').hidden = true;
      $('#co-done').hidden = false;
      w.scrollTo({ top: 0, behavior: 'smooth' });
    });
    $('#co-clear').addEventListener('click', function () { Cart.set([]); location.href = 'index.html'; });
  }

  /* ── language switch state, i18n of static text ── */
  $$('[data-lang]').forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('data-lang') === LANG ? 'true' : 'false'); });
  if (LANG === 'ru') {
    d.documentElement.lang = 'ru';
    $$('[data-t]').forEach(function (e) { var k = e.getAttribute('data-t') || e.textContent.trim(); if (RU[k]) e.textContent = RU[k]; });
    $$('[data-tp]').forEach(function (e) { var k = e.getAttribute('placeholder'); if (RU[k]) e.setAttribute('placeholder', RU[k]); });
  }

  Cart.badge();
  w.addEventListener('storage', function (e) { if (e.key === 'bv_cart') Cart.badge(); });
  if (PAGE === 'category') catPage();
  else if (PAGE === 'akcijas') akcPage();
  else if (PAGE === 'search') searchPage();
  else if (PAGE === 'product') productPage();
  else if (PAGE === 'cart') cartPage();
  else if (PAGE === 'checkout') checkoutPage();
})();
