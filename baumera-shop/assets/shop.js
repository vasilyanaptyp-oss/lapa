(function () {
  'use strict';
  var D = window.BM, BODY = document.body, B = BODY.getAttribute('data-base') || '', PAGE = BODY.getAttribute('data-page');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var EMAIL = 'sales@plastikati.lv', PHONE = '+371 29 555 176', PHONE_T = '+37129555176';
  var eurF = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
  var eur = function (n) { return n == null ? 'Preis auf Anfrage' : eurF.format(n); };
  var eurS = function (n) { return n == null ? '' : (Math.round(n * 100) % 100 === 0 ? Math.round(n).toLocaleString('de-DE') + ' €' : eurF.format(n)); };
  var dnum = function (n) { return String(n).replace('.', ','); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var icon = function (id) { return '<svg aria-hidden="true"><use href="#i-' + id + '"/></svg>'; };
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var PR = D.products, byId = {};
  PR.forEach(function (p) { byId[p.id] = p; });
  var FORMS = D.forms, ACC = D.acc;
  var ACC_SHORT = { oeffner: 'Fensteröffner', dachfenster: 'Dachfenster', tueren: 'Tür & Fenster', bewaesserung: 'Bewässerung', hochbeete: 'Hochbeet', boden: 'Boden & Wege', regale: 'Zubehör' };
  var FORM_SHORT = { bogen: 'Rundbogen', spitz: 'Spitzbogen', haus: 'Satteldach', schmal: 'Schmal', holz: 'Holz' };

  /* ---------- product helpers ---------- */
  function priced(p) { return p.v.filter(function (v) { return v.p != null; }); }
  function minP(p, vs) { var a = (vs || priced(p)).map(function (v) { return v.p; }).filter(function (x) { return x != null; }); return a.length ? Math.min.apply(null, a) : null; }
  function maxP(p) { var a = priced(p).map(function (v) { return v.p; }); return a.length ? Math.max.apply(null, a) : null; }
  function hasOpt(p, k) { return p.opts.some(function (o) { return o.key === k; }); }
  function optVals(p, k) { var o = p.opts.filter(function (x) { return x.key === k; })[0]; return o ? o.values : []; }
  function valLabel(p, k, id) { var v = optVals(p, k).filter(function (x) { return x.id === id; })[0]; return v ? v.label : ''; }
  function findV(p, a) {
    for (var i = 0; i < p.v.length; i++) { var v = p.v[i], ok = true; for (var k in a) if (a.hasOwnProperty(k) && v.a[k] !== a[k]) { ok = false; break; } if (ok) return v; }
    return null;
  }
  function bySku(p, s) { for (var i = 0; i < p.v.length; i++) if (p.v[i].s === s) return p.v[i]; return null; }
  function realSku(s) { return s && !/^BM-/.test(s); }
  function defaultV(p) {
    var vs = priced(p); if (!vs.length) return p.v[0];
    if (p.k === 'gewaechshaus') {
      var f = vs.filter(function (v) { return v.L && Math.abs(v.L - 4) < 0.2 && (v.t === 4 || v.t == null); })[0] || vs.filter(function (v) { return v.L && Math.abs(v.L - 4.12) < 0.2; })[0];
      if (f) return f;
    }
    return vs.slice().sort(function (a, b) { return a.p - b.p; })[0];
  }
  function sizeLabel(v) { return v.W ? dnum(v.W) + ' × ' + dnum(v.L) + ' m' : ''; }
  function varSub(p, v) {
    if (p.k === 'gewaechshaus' && v.W) return sizeLabel(v) + (v.t ? ', ' + v.t + ' mm Polycarbonat' : '');
    return v.l || '';
  }
  function purl(p, v) { return B + p.url + (v && p.v.length > 1 ? '?v=' + encodeURIComponent(v.s) : ''); }

  /* ---------- storage + cart ---------- */
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };
  var CART_KEY = 'bm_cart_v2';
  var cart = store.get(CART_KEY, []);
  if (!Array.isArray(cart)) cart = [];
  // drop lines whose product/variant no longer exists, refresh prices from the catalogue
  cart = cart.filter(function (c) { var p = byId[c.id], v = p && bySku(p, c.sku); if (v && v.p != null) { c.price = v.p; return true; } return false; });
  function cartSave() { store.set(CART_KEY, cart); renderCart(); }
  function cartAdd(p, v, qty, silent) {
    if (!v || v.p == null) return;
    var key = p.id + '|' + v.s, ex = cart.filter(function (c) { return c.key === key; })[0];
    if (ex) ex.qty += qty || 1;
    else cart.push({ key: key, id: p.id, sku: v.s, name: p.n, sub: varSub(p, v), price: v.p, img: p.img, url: p.url, qty: qty || 1 });
    cartSave();
    if (!silent) toast(p.n + (varSub(p, v) ? ', ' + varSub(p, v) : ''));
  }
  function cartTotal() { return cart.reduce(function (s, c) { return s + c.price * c.qty; }, 0); }
  function cartCount() { return cart.reduce(function (s, c) { return s + c.qty; }, 0); }
  function lineHTML(c, i, big) {
    return '<div class="ci' + (big ? ' big' : '') + '"><a href="' + B + esc(c.url) + '"><img src="' + B + esc(c.img) + '" alt="" loading="lazy"></a><div><a class="ci-n" href="' + B + esc(c.url) + '"><b>' + esc(c.name) + '</b></a>' + (c.sub ? '<small>' + esc(c.sub) + '</small>' : '') +
      (realSku(c.sku) ? '<small>Art.-Nr. ' + esc(c.sku) + '</small>' : '') +
      '<small>' + eur(c.price) + ' pro Stück</small><div class="ln"><span class="qty"><button type="button" data-q="-1" data-i="' + i + '" aria-label="Menge verringern">−</button><span>' + c.qty + '</span><button type="button" data-q="1" data-i="' + i + '" aria-label="Menge erhöhen">+</button></span>' +
      '<button class="rm" type="button" data-rm="' + i + '">Entfernen</button><span class="p num">' + eur(c.price * c.qty) + '</span></div></div></div>';
  }
  function renderCart() {
    $('#cartCount').textContent = cartCount();
    $('#cartSum').textContent = eur(cartTotal());
    $('#cartTotal').textContent = eur(cartTotal());
    var body = $('#cartBody');
    if (!cart.length) {
      body.innerHTML = '<div class="d-empty">' + icon('cart') + '<p>Ihr Warenkorb ist leer.</p><a class="btn btn-lime" href="' + B + 'sets.html">Sets ansehen</a></div>';
      $('#cartFoot').style.display = 'none';
    } else {
      $('#cartFoot').style.display = '';
      body.innerHTML = cart.map(function (c, i) { return lineHTML(c, i, false); }).join('');
    }
    if (PAGE === 'kasse') renderKasse();
  }
  function cartClick(e) {
    var q = e.target.closest('[data-q]'), rm = e.target.closest('[data-rm]');
    if (q) { var c = cart[+q.dataset.i]; c.qty += +q.dataset.q; if (c.qty < 1) cart.splice(+q.dataset.i, 1); cartSave(); }
    if (rm) { cart.splice(+rm.dataset.rm, 1); cartSave(); }
  }
  $('#cartBody').addEventListener('click', cartClick);

  /* ---------- overlays ---------- */
  var openPanel = null, lastFocus = null;
  function open(id) {
    closeAll();
    var el = document.getElementById(id); if (!el) return;
    lastFocus = document.activeElement;
    el.classList.add('on'); el.setAttribute('aria-hidden', 'false');
    $('#scrim').classList.add('on'); openPanel = el;
    document.body.style.overflow = 'hidden';
    var f = el.querySelector('.close'); if (f) setTimeout(function () { f.focus(); }, 50);
  }
  function closeAll() {
    if (openPanel) { openPanel.classList.remove('on'); openPanel.setAttribute('aria-hidden', 'true'); }
    $('#scrim').classList.remove('on'); document.body.style.overflow = '';
    var had = openPanel; openPanel = null;
    if (had && lastFocus && document.contains(lastFocus)) { try { lastFocus.focus({ preventScroll: true }); } catch (e) { } }
  }
  $('#scrim').addEventListener('click', closeAll);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeAll(); closeMega(); closeSuggest(); }
    if (openPanel && openPanel.id === 'lightbox') { if (e.key === 'ArrowRight') lbGo(1); if (e.key === 'ArrowLeft') lbGo(-1); }
  });
  var toastT;
  function toast(text) {
    $('#toastText').textContent = 'Im Warenkorb: ' + text;
    $('#toast').classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(function () { $('#toast').classList.remove('on'); }, 3600);
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-open],[data-close]');
    if (!t) return;
    if (t.hasAttribute('data-open')) { e.preventDefault(); $('#toast').classList.remove('on'); open(t.getAttribute('data-open')); return; }
    if (t.hasAttribute('data-close')) { closeAll(); closeMega(); if (t.tagName !== 'A') e.preventDefault(); }
  });

  /* ---------- lightbox ---------- */
  var lb = { list: [], i: 0 };
  function lbShow() { var im = $('#lbImg'); im.src = lb.list[lb.i]; $('#lbCount').textContent = (lb.i + 1) + ' / ' + lb.list.length; $$('.lb-nav').forEach(function (b) { b.hidden = lb.list.length < 2; }); }
  function lbOpen(list, i) { lb.list = list; lb.i = i || 0; open('lightbox'); lbShow(); }
  function lbGo(d) { if (!lb.list.length) return; lb.i = (lb.i + d + lb.list.length) % lb.list.length; lbShow(); }
  $$('[data-lb]').forEach(function (b) { b.addEventListener('click', function () { lbGo(+b.dataset.lb); }); });
  (function () {
    var x0 = null, el = $('#lightbox');
    el.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 45) lbGo(dx < 0 ? 1 : -1); x0 = null; });
    el.addEventListener('click', function (e) { if (e.target === el) closeAll(); });
  })();

  /* ---------- mega menu + mobile menu ---------- */
  function count(pred) { return PR.filter(pred).length; }
  function minOf(pred) { var a = PR.filter(function (p) { return p.src && pred(p); }).map(function (p) { return minP(p); }).filter(function (x) { return x != null; }); return a.length ? Math.min.apply(null, a) : null; }
  var GH = function (p) { return p.k === 'gewaechshaus'; };
  (function () {
    var sets = PR.filter(function (p) { return p.k === 'set'; });
    var col0 = sets.map(function (p) { return '<a href="' + B + p.url + '">' + esc(p.n) + '<span>' + eurS(minP(p)) + '</span></a>'; }).join('') + '<a href="' + B + 'sets.html"><b>Alle Sets</b><span>' + sets.length + '</span></a>';
    var col1 = Object.keys(FORMS).filter(function (f) { return count(function (p) { return GH(p) && p.f === f; }); }).map(function (f) {
      return '<a href="' + B + 'gewaechshaeuser.html?form=' + f + '">' + esc(FORMS[f]) + '<span>ab ' + eurS(minOf(function (p) { return GH(p) && p.f === f; })) + '</span></a>';
    }).join('');
    var widths = []; PR.forEach(function (p) { if (GH(p) && p.w && widths.indexOf(p.w) < 0) widths.push(p.w); }); widths.sort();
    col1 += widths.map(function (w) { return '<a href="' + B + 'gewaechshaeuser.html?w=' + w + '">' + dnum(w) + ' m breit<span>' + count(function (p) { return GH(p) && p.w === w; }) + ' Modelle</span></a>'; }).join('');
    var col2 = Object.keys(ACC).map(function (c) { var n = count(function (p) { return p.sub === c; }); return n ? '<a href="' + B + 'zubehoer.html?sub=' + c + '">' + esc(ACC[c]) + '<span>' + n + '</span></a>' : ''; }).join('');
    $('#megaInner').innerHTML = '<div><h4>Sets</h4>' + col0 + '</div><div><h4>Gewächshäuser</h4>' + col1 + '</div><div><h4>Zubehör</h4>' + col2 + '</div>';
    $('#menuLinks').innerHTML = '<a href="' + B + 'sets.html">Gewächshaus-Sets<span>ab ' + eurS(minOf(function (p) { return p.k === 'set'; })) + '</span></a>' +
      '<a href="' + B + 'gewaechshaeuser.html">Alle Gewächshäuser<span>ab ' + eurS(minOf(GH)) + '</span></a>' +
      Object.keys(FORMS).filter(function (f) { return count(function (p) { return GH(p) && p.f === f; }); }).map(function (f) { return '<a href="' + B + 'gewaechshaeuser.html?form=' + f + '">' + esc(FORMS[f]) + '<span>' + count(function (p) { return GH(p) && p.f === f; }) + '</span></a>'; }).join('') +
      '<a href="' + B + 'zubehoer.html">Zubehör<span>ab ' + eurS(minOf(function (p) { return p.k === 'zubehoer'; })) + '</span></a>' +
      '<a href="' + B + 'index.html#service">Versand &amp; Zahlung</a><a href="' + B + 'index.html#faq">Häufige Fragen</a><a href="' + B + 'kasse.html">Warenkorb &amp; Kasse</a>';
  })();
  var megaBtn = $('#megaBtn');
  function closeMega() { $('#mega').classList.remove('open'); megaBtn.setAttribute('aria-expanded', 'false'); }
  megaBtn.addEventListener('click', function (e) { e.stopPropagation(); var o = $('#mega').classList.toggle('open'); megaBtn.setAttribute('aria-expanded', o); });
  document.addEventListener('click', function (e) { if (!e.target.closest('#mega') && e.target !== megaBtn) closeMega(); });
  (function () { var here = location.pathname.split('/').pop() + location.search; $$('.catnav nav a').forEach(function (a) { if (a.getAttribute('href').replace(B, '') === here) a.classList.add('cur'); }); })();

  /* ---------- search ---------- */
  var norm = function (s) { return String(s).toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss').replace(/×/g, 'x').replace(/,/g, '.').replace(/\s*x\s*/g, 'x').replace(/(\d)\s*m\b/g, '$1'); };
  var SYN = { oeffner: 'offner fenster luftung automatik', dachfenster: 'dachfenster luke fenster luftung', tueren: 'tur fenster', bewaesserung: 'bewasserung wasser tropf giessen spruher', hochbeete: 'hochbeet beet fruhbeet', boden: 'weg boden vlies geotextil', regale: 'regal griff anbinden' };
  var IDX = PR.map(function (p) {
    var sizes = p.v.map(function (v) { return v.W ? norm(v.W + 'x' + v.L) : ''; }).join(' ');
    var kind = p.k === 'set' ? 'set paket komplett' : (p.k === 'gewaechshaus' ? 'gewachshaus ' + (FORMS[p.f] || '') : 'zubehor ' + (ACC[p.sub] || '') + ' ' + (SYN[p.sub] || ''));
    return { p: p, hay: norm(p.n + ' ' + kind + ' ' + (p.items || []).join(' ') + ' ' + sizes + ' ' + p.v.map(function (v) { return realSku(v.s) ? v.s : ''; }).join(' ')) };
  });
  var sugg = [], sIdx = -1, q = $('#q'), box = $('#suggest');
  function searchFor(text) {
    var n = norm(text).trim(); if (!n) return [];
    var size = n.match(/(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)/), out = [];
    if (size) {
      var w = parseFloat(size[1]), L = parseFloat(size[2]);
      PR.forEach(function (p) {
        if (p.k !== 'gewaechshaus') return;
        var vs = p.v.filter(function (v) { return v.W && Math.abs(v.W - w) < 0.06 && Math.abs(v.L - L) < 0.2 && v.p != null; });
        if (vs.length) { var v = vs.sort(function (a, b) { return a.p - b.p; })[0]; out.push({ p: p, v: v, title: p.n + ' ' + sizeLabel(v), sub: dnum(v.A) + ' m² · ' + (FORMS[p.f] || ''), price: (vs.length > 1 ? 'ab ' : '') + eurS(v.p) }); }
      });
      PR.forEach(function (p) { if (p.k === 'set' && norm(p.n + ' ' + (p.items || []).join(' ')).indexOf(norm(size[0])) >= 0) out.unshift({ p: p, title: p.n, sub: 'Set', price: eurS(minP(p)) }); });
      if (out.length) return out.slice(0, 8);
    }
    var toks = n.split(/\s+/);
    IDX.forEach(function (it) { if (toks.every(function (t) { return it.hay.indexOf(t) >= 0; })) out.push({ p: it.p, title: it.p.n, sub: it.p.k === 'set' ? 'Set' : (it.p.k === 'gewaechshaus' ? FORMS[it.p.f] : ACC[it.p.sub]), price: (it.p.v.length > 1 ? 'ab ' : '') + eurS(minP(it.p)) }); });
    out.sort(function (a, b) { var r = { set: 0, gewaechshaus: 1, zubehoer: 2 }; return r[a.p.k] - r[b.p.k]; });
    return out.slice(0, 8);
  }
  function renderSuggest() {
    if (!q.value.trim()) { closeSuggest(); return; }
    sugg = searchFor(q.value); sIdx = sugg.length ? 0 : -1;
    box.innerHTML = sugg.length ? sugg.map(function (s, k) { return '<a role="option" href="' + purl(s.p, s.v) + '" data-s="' + k + '" class="' + (k === sIdx ? 'on' : '') + '"><img src="' + B + s.p.img + '" alt=""><span><b>' + esc(s.title) + '</b><small>' + esc(s.sub || '') + '</small></span><span class="sp num">' + esc(s.price) + '</span></a>'; }).join('')
      : '<div class="empty">Keine Treffer für „' + esc(q.value) + '“. Versuchen Sie es z. B. mit „3 × 6“, „Set“ oder „Fensteröffner“ oder rufen Sie uns an: <a href="tel:' + PHONE_T + '">' + PHONE + '</a>.</div>';
    box.classList.add('open'); q.setAttribute('aria-expanded', 'true');
  }
  function closeSuggest() { box.classList.remove('open'); q.setAttribute('aria-expanded', 'false'); }
  q.addEventListener('input', renderSuggest);
  q.addEventListener('focus', function () { if (q.value.trim()) renderSuggest(); });
  q.addEventListener('keydown', function (e) {
    if (!box.classList.contains('open') || !sugg.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sIdx = (sIdx + (e.key === 'ArrowDown' ? 1 : -1) + sugg.length) % sugg.length; $$('[data-s]', box).forEach(function (b, k) { b.classList.toggle('on', k === sIdx); }); }
  });
  box.addEventListener('mousedown', function (e) { e.preventDefault(); });
  $('#search').addEventListener('submit', function (e) { e.preventDefault(); renderSuggest(); if (sugg.length) location.href = purl(sugg[Math.max(0, sIdx)].p, sugg[Math.max(0, sIdx)].v); });
  document.addEventListener('click', function (e) { if (!e.target.closest('#search')) closeSuggest(); });
  if (window.innerWidth < 760) q.placeholder = window.innerWidth < 380 ? 'Suchen, z. B. „3 × 6“' : 'Suchen, z. B. „3 × 6“ oder Set';

  /* ---------- cards ---------- */
  var cardState = {};
  function ghCard(p, vs) {
    // vs: allowed variants (filtered); state keeps chosen variant sku
    vs = (vs || priced(p));
    var st = cardState[p.id];
    var v = st && bySku(p, st) && vs.indexOf(bySku(p, st)) >= 0 ? bySku(p, st) : (vs.indexOf(defaultV(p)) >= 0 ? defaultV(p) : vs.slice().sort(function (a, b) { return a.p - b.p; })[0]);
    if (!v) return '';
    cardState[p.id] = v.s;
    var badges = '<span class="badge">' + esc(FORM_SHORT[p.f] || '') + '</span>' + (p.fund ? '<span class="badge l">mit Fundament</span>' : '') + (p.new ? '<span class="badge d">Neu</span>' : '');
    var sizes = [], seen = {};
    vs.forEach(function (x) { var g = x.a.groesse; if (g != null && !seen[g]) { seen[g] = 1; sizes.push(x); } });
    sizes.sort(function (a, b) { return (a.L || 0) - (b.L || 0); });
    var sel = sizes.length ? '<div class="select"><select data-size aria-label="Größe ' + esc(p.n) + '"' + (sizes.length < 2 ? ' disabled' : '') + '>' + sizes.map(function (x) { return '<option value="' + x.a.groesse + '"' + (x.a.groesse === v.a.groesse ? ' selected' : '') + '>' + esc(sizeLabel(x)) + '</option>'; }).join('') + '</select></div>' : '';
    var seg = '';
    if (hasOpt(p, 'dicke')) {
      seg = '<div class="seg" role="group" aria-label="Polycarbonat-Stärke">' + optVals(p, 'dicke').map(function (o) {
        var a = {}; for (var k in v.a) a[k] = v.a[k]; a.dicke = o.id; var w = findV(p, a), ok = w && vs.indexOf(w) >= 0;
        return '<button type="button" data-t="' + o.id + '"' + (ok ? '' : ' disabled') + ' class="' + (v.a.dicke === o.id ? 'on' : '') + '" aria-pressed="' + (v.a.dicke === o.id) + '">' + esc(o.label.replace(' ', ' ')) + '</button>';
      }).join('') + '</div>';
    }
    var spec = (p.w ? '<span>' + icon('ruler') + dnum(p.w) + ' m breit</span>' : '') + (p.h ? '<span>' + esc(p.h) + ' hoch</span>' : '') + (p.snow ? '<span>' + icon('snow') + esc(p.snow) + '</span>' : '');
    var av = v.av && /Anfrage/.test(v.av) ? 'Lieferzeit auf Anfrage' : (v.av && /Lager/.test(v.av) ? 'Auf Lager' : 'Verfügbar');
    return '<article class="card" data-id="' + p.id + '">' +
      '<a class="ph' + (p.iw ? ' white' : '') + '" href="' + purl(p, v) + '" aria-label="' + esc(p.n) + ' ansehen"><img src="' + B + p.img + '" alt="Gewächshaus ' + esc(p.n) + '" loading="lazy"><span class="badges">' + badges + '</span></a>' +
      '<div class="bd"><h3><a href="' + purl(p, v) + '">' + esc(p.n) + '</a></h3><div class="spec">' + spec + '</div>' +
      '<div class="opts' + (seg ? '' : ' one') + '">' + sel + seg + '</div>' +
      '<div class="price-row"><div><div class="price num">' + eur(v.p) + (v.op ? ' <s class="old">' + eur(v.op) + '</s>' : '') + '</div><div class="price-note">inkl. MwSt., zzgl. Versand</div></div>' + (v.A ? '<span class="area">' + dnum(v.A) + ' m²</span>' : '') + '</div>' +
      '<div class="avail' + (av === 'Lieferzeit auf Anfrage' ? ' req' : '') + '"><i></i>' + av + '</div>' +
      '<div class="acts"><button class="btn btn-lime" type="button" data-add>' + icon('cart-plus') + 'In den Warenkorb</button><a class="btn-icon" href="' + purl(p, v) + '" aria-label="Details zu ' + esc(p.n) + '">' + icon('eye') + '</a></div></div></article>';
  }
  function accCard(p, vs) {
    vs = vs || priced(p);
    var st = cardState[p.id], v = st && bySku(p, st) && vs.indexOf(bySku(p, st)) >= 0 ? bySku(p, st) : vs.slice().sort(function (a, b) { return a.p - b.p; })[0];
    if (!v) return '';
    cardState[p.id] = v.s;
    var sel = vs.length > 1 ? '<div class="select"><select data-var aria-label="Ausführung ' + esc(p.n) + '">' + vs.map(function (x) { return '<option value="' + esc(x.s) + '"' + (x === v ? ' selected' : '') + '>' + esc(x.l || x.s) + '</option>'; }).join('') + '</select></div>' : '';
    return '<article class="card acc" data-id="' + p.id + '"><a class="ph' + (p.iw ? ' white' : '') + '" href="' + purl(p, v) + '" aria-label="' + esc(p.n) + ' ansehen"><img src="' + B + p.img + '" alt="' + esc(p.n) + '" loading="lazy"><span class="badges"><span class="badge">' + esc(ACC_SHORT[p.sub] || 'Zubehör') + '</span></span></a>' +
      '<div class="bd"><h3><a href="' + purl(p, v) + '">' + esc(p.n) + '</a></h3>' + sel +
      '<div class="price-row"><div><div class="price num">' + (vs.length > 1 && !sel ? 'ab ' : '') + eur(v.p) + (v.op ? ' <s class="old">' + eur(v.op) + '</s>' : '') + '</div><div class="price-note">inkl. MwSt., zzgl. Versand</div></div></div>' +
      '<div class="acts"><button class="btn btn-lime" type="button" data-add>' + icon('cart-plus') + 'In den Warenkorb</button></div></div></article>';
  }
  function setCard(p, big) {
    var v = defaultV(p); if (!v) return '';
    cardState[p.id] = v.s;
    var items = (p.items || []), show = items.slice(0, big ? 6 : 4);
    return '<article class="scard' + (big ? ' big' : '') + '" data-id="' + p.id + '"><a class="ph' + (p.iw ? ' white' : '') + '" href="' + purl(p) + '"><img src="' + B + (big ? p.imgL : p.img) + '" alt="' + esc(p.n) + '" loading="lazy"><span class="tagl">' + esc(p.tag || 'Set') + '</span></a>' +
      '<div class="bd"><h3><a href="' + purl(p) + '">' + esc(p.n) + '</a></h3><ul>' + show.map(function (x) { return '<li>' + icon('check') + '<span>' + esc(x) + '</span></li>'; }).join('') + (items.length > show.length ? '<li class="more">+ ' + (items.length - show.length) + ' weitere Teile</li>' : (items.length > 3 ? '<li class="more m3">+ ' + (items.length - 3) + ' weitere Teile</li>' : '')) + '</ul>' +
      '<div class="price-row"><div><div class="price num">' + eur(v.p) + (v.op ? ' <s class="old">' + eur(v.op) + '</s>' : '') + '</div><div class="price-note">inkl. MwSt., zzgl. Versand</div></div></div>' +
      '<div class="acts"><button class="btn btn-lime" type="button" data-add>' + icon('cart-plus') + 'In den Warenkorb</button><a class="btn btn-ghost" href="' + purl(p) + '">Details</a></div></div></article>';
  }
  function wireCards(root, rerender) {
    root.addEventListener('change', function (e) {
      var card = e.target.closest('[data-id]'); if (!card) return; var p = byId[card.dataset.id];
      if (e.target.matches('[data-size]')) {
        var cur = bySku(p, cardState[p.id]), a = { groesse: +e.target.value }; if (cur && cur.a.dicke != null) a.dicke = cur.a.dicke;
        var v = findV(p, a) || findV(p, { groesse: +e.target.value }); if (v) cardState[p.id] = v.s;
      }
      if (e.target.matches('[data-var]')) cardState[p.id] = e.target.value;
      rerender(p, card, e.target.matches('[data-size]') ? '[data-size]' : '[data-var]');
    });
    root.addEventListener('click', function (e) {
      var card = e.target.closest('[data-id]'); if (!card) return; var p = byId[card.dataset.id];
      var tb = e.target.closest('[data-t]');
      if (tb && !tb.disabled) { var cur = bySku(p, cardState[p.id]), a = {}; for (var k in cur.a) a[k] = cur.a[k]; a.dicke = +tb.dataset.t; var v = findV(p, a); if (v) cardState[p.id] = v.s; rerender(p, card, '[data-t="' + tb.dataset.t + '"]'); return; }
      if (e.target.closest('[data-add]')) { cartAdd(p, bySku(p, cardState[p.id]) || defaultV(p)); }
    });
  }

  /* ---------- page: home ---------- */
  function initHome() {
    (function carousel() {
      var root = $('#carousel'), slides = $$('.slide', root), dots = $$('.c-dots button', root), i = 0, timer = null;
      function go(n) {
        i = (n + slides.length) % slides.length;
        slides.forEach(function (s, k) { s.classList.toggle('on', k === i); s.setAttribute('aria-hidden', k === i ? 'false' : 'true'); $$('.slide-text a,.slide-text button', s).forEach(function (b) { b.tabIndex = k === i ? 0 : -1; }); });
        dots.forEach(function (d, k) { d.classList.toggle('on', k === i); d.setAttribute('aria-selected', k === i); });
        var img = slides[i].querySelector('img[loading="lazy"]'); if (img) img.loading = 'eager';
      }
      function play() { if (RM) return; stop(); timer = setInterval(function () { go(i + 1); }, 7000); }
      function stop() { clearInterval(timer); }
      dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); play(); }); });
      $$('.c-arrows button', root).forEach(function (b) { b.addEventListener('click', function () { go(i + (+b.dataset.dir)); play(); }); });
      root.addEventListener('mouseenter', stop); root.addEventListener('mouseleave', play);
      root.addEventListener('focusin', stop); root.addEventListener('focusout', play);
      var x0 = null;
      root.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      root.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 45) { go(i + (dx < 0 ? 1 : -1)); play(); } x0 = null; });
      go(0); play();
    })();
    // sets row
    var sets = PR.filter(function (p) { return p.k === 'set' && p.src; }).concat(PR.filter(function (p) { return p.k === 'set' && !p.src; }));
    var sr = $('#setsRow');
    sr.innerHTML = sets.slice(0, 4).map(function (p, k) { return setCard(p, k === 0); }).join('');
    sr.addEventListener('click', function (e) { var c = e.target.closest('[data-id]'); if (c && e.target.closest('[data-add]')) { var p = byId[c.dataset.id]; cartAdd(p, defaultV(p)); } });
    // categories
    var forms = Object.keys(FORMS).filter(function (f) { return f !== 'holz' && count(function (p) { return GH(p) && p.f === f; }); });
    var formImg = {};
    PR.forEach(function (p) { if (GH(p) && p.src && !formImg[p.f]) formImg[p.f] = p.img; });
    $('#cats').innerHTML = '<a class="cat hot" href="sets.html"><span class="ph"><img src="' + (sets[0] ? sets[0].img : '') + '" alt="" loading="lazy"></span><span class="tx"><b>Sets &amp; Komplettpakete</b><small>Gewächshaus mit Zubehör</small><span class="ab">ab ' + eurS(minOf(function (p) { return p.k === 'set'; })) + '</span></span></a>' +
      forms.map(function (f) {
        var ms = PR.filter(function (p) { return GH(p) && p.f === f; });
        return '<a class="cat" href="gewaechshaeuser.html?form=' + f + '"><span class="ph"><img src="' + (formImg[f] || ms[0].img) + '" alt="" loading="lazy"></span><span class="tx"><b>' + esc(FORMS[f]) + '</b><small>' + ms.map(function (m) { return esc(m.n.replace(/^Gewächshaus /, '').replace(/ (Gewölbt|Tunnel)$/, '')); }).join(', ') + '</small><span class="ab">ab ' + eurS(minOf(function (p) { return GH(p) && p.f === f; })) + '</span></span></a>';
      }).join('');
    $('#catsAcc').innerHTML = Object.keys(ACC).map(function (c) {
      var ps = PR.filter(function (p) { return p.sub === c && p.img; }); if (!ps.length) return '';
      return '<a class="cat-s" href="zubehoer.html?sub=' + c + '"><img src="' + ps[0].img + '" alt="" loading="lazy"><span><b>' + esc(ACC[c]) + '</b><small>ab ' + eurS(minOf(function (p) { return p.sub === c; })) + '</small></span></a>';
    }).join('');
    // models
    var mg = $('#modelGrid'), models = PR.filter(GH);
    function renderModels() { mg.innerHTML = models.map(function (p) { return ghCard(p); }).join(''); }
    renderModels();
    wireCards(mg, function (p, card, focusSel) { card.outerHTML = ghCard(p); var n = $('.card[data-id="' + p.id + '"] ' + focusSel, mg); if (n) n.focus(); });
    // accessories (first by category order)
    var ag = $('#accGrid'), seenSub = {}, pick = [];
    PR.forEach(function (p) { if (p.k === 'zubehoer' && p.src && !seenSub[p.sub] && p.img) { seenSub[p.sub] = 1; pick.push(p); } });
    PR.forEach(function (p) { if (pick.length < 10 && p.k === 'zubehoer' && p.src && pick.indexOf(p) < 0 && p.img && /KLASIKA|BALTIC|VENT/.test(p.n)) pick.push(p); });
    ag.innerHTML = pick.slice(0, 10).map(function (p) { return accCard(p); }).join('');
    wireCards(ag, function (p, card, focusSel) { card.outerHTML = accCard(p); var n = $('.card[data-id="' + p.id + '"] ' + focusSel, ag); if (n) n.focus(); });
    // example prices
    $$('[data-vprice]').forEach(function (el) {
      var a = el.dataset.vprice.split(':'), p = byId[a[0]]; if (!p) return;
      var v = p.v.filter(function (x) { return x.L && Math.abs(x.L - +a[1]) < 0.2 && x.t === +a[2]; })[0]; if (v) el.textContent = eurS(v.p);
    });
    initBuilder();
  }

  /* ---------- set builder ---------- */
  function initBuilder() {
    var models = PR.filter(function (p) { return GH(p) && p.src && priced(p).length > 1; });
    if (!models.length) { $('#set-bauen').hidden = true; return; }
    var st = { id: 'klasika-gewoelbt', size: null, t: null, ex: {} };
    if (!byId[st.id] || models.indexOf(byId[st.id]) < 0) st.id = models[0].id;
    var COMPAT = D.compat || {};
    function model() { return byId[st.id]; }
    function curV() { var p = model(), a = { groesse: st.size }; if (hasOpt(p, 'dicke')) a.dicke = st.t; return findV(p, a); }
    function extras() {
      var p = model(), v = curV(), out = [];
      (COMPAT[p.id] || []).forEach(function (id) {
        var q = byId[id]; if (!q || !q.src) return;
        var vs = priced(q); if (!vs.length) return;
        var pick = vs[0];
        if (vs.length > 1 && v && v.L) { var m = vs.filter(function (x) { var L = parseFloat((x.l.match(/(\d+(?:[.,]\d+)?)\s*m\b/) || [])[1]); return L && Math.abs(L - v.L) < 0.2; })[0]; if (m) pick = m; else return; }
        out.push({ q: q, v: pick });
      });
      return out.slice(0, 5);
    }
    function render() {
      var p = model();
      var sizes = optVals(p, 'groesse');
      if (st.size == null || !sizes.some(function (x) { return x.id === st.size; })) { var dv = defaultV(p); st.size = dv.a.groesse; st.t = dv.a.dicke; }
      if (hasOpt(p, 'dicke') && !findV(p, { groesse: st.size, dicke: st.t })) { var any = p.v.filter(function (x) { return x.a.groesse === st.size && x.p != null; })[0]; if (any) st.t = any.a.dicke; }
      $('#bModel').innerHTML = models.map(function (m) { return '<button type="button" data-m="' + m.id + '" class="' + (m.id === st.id ? 'on' : '') + '" aria-pressed="' + (m.id === st.id) + '">' + esc(m.n.replace(/^Gewächshaus /, '').replace(/ (Gewölbt|Tunnel)$/, '')) + '</button>'; }).join('');
      $('#bSize').innerHTML = sizes.map(function (x) { return '<option value="' + x.id + '"' + (x.id === st.size ? ' selected' : '') + '>' + esc(x.label) + '</option>'; }).join('');
      $('#bThickStep').hidden = !hasOpt(p, 'dicke');
      $('#bThick').innerHTML = optVals(p, 'dicke').map(function (o) { var ok = !!findV(p, { groesse: st.size, dicke: o.id }); return '<button type="button" data-bt="' + o.id + '" class="' + (o.id === st.t ? 'on' : '') + '"' + (ok ? '' : ' disabled') + ' aria-pressed="' + (o.id === st.t) + '">' + esc(o.label) + '</button>'; }).join('');
      var v = curV(), total = v ? v.p : 0, ex = extras();
      $('#bExtras').innerHTML = ex.length ? ex.map(function (x) {
        var on = !!st.ex[x.q.id]; if (on) total += x.v.p;
        return '<label class="check"><input type="checkbox" data-ex="' + x.q.id + '"' + (on ? ' checked' : '') + '><span>' + esc(x.q.n) + (x.v.l ? ' <small>(' + esc(x.v.l) + ')</small>' : '') + '</span><b>+ ' + eur(x.v.p) + '</b></label>';
      }).join('') : '<p class="b-none">Zubehör zu diesem Modell finden Sie auf der Produktseite.</p>';
      $('#bName').textContent = p.n + (v ? ', ' + varSub(p, v) : '');
      $('#bTotal').textContent = eur(total);
      var im = $('#bImg'); im.src = B + p.imgL; im.alt = p.n;
      $('#bTag').textContent = v ? dnum(v.A) + ' m² · ' + (FORMS[p.f] || '') : '';
      $('#bOpen').href = purl(p, v);
    }
    $('#bModel').addEventListener('click', function (e) { var b = e.target.closest('[data-m]'); if (!b) return; st.id = b.dataset.m; st.size = null; st.ex = {}; render(); });
    $('#bSize').addEventListener('change', function () { st.size = +this.value; render(); });
    $('#bThick').addEventListener('click', function (e) { var b = e.target.closest('[data-bt]'); if (!b || b.disabled) return; st.t = +b.dataset.bt; render(); });
    $('#bExtras').addEventListener('change', function (e) { var c = e.target.closest('[data-ex]'); if (!c) return; st.ex[c.dataset.ex] = c.checked; render(); });
    $('#bAdd').addEventListener('click', function () {
      var p = model(), v = curV(); if (!v) return; cartAdd(p, v, 1, true); var n = 0;
      extras().forEach(function (x) { if (st.ex[x.q.id]) { cartAdd(x.q, x.v, 1, true); n++; } });
      toast(p.n + ' ' + varSub(p, v) + (n ? ' + ' + n + ' Zubehör' : ''));
    });
    render();
  }

  /* ---------- page: listing ---------- */
  function initList() {
    var main = $('.lp'), KIND = main.dataset.kind, all = PR.filter(function (p) { return p.k === KIND; });
    var qs = new URLSearchParams(location.search);
    var arr = function (k) { var v = qs.get(k); return v ? v.split(',') : []; };
    var F = { form: arr('form'), w: arr('w').map(Number), l: arr('l').map(Number), t: arr('t').map(Number), sub: arr('sub'), fit: qs.get('fit') || '', pmin: qs.get('pmin') ? +qs.get('pmin') : null, pmax: qs.get('pmax') ? +qs.get('pmax') : null, sort: qs.get('sort') || 'rec' };
    var FIT = ['KLASIKA', 'TUBE', 'EASY', 'BALTIC', 'DROP', 'STANDART', 'BERNARD', 'HOUSE', 'SLIM'];
    function fits(p, m) { var n = p.n.toUpperCase(); if (m === 'KLASIKA') return /KLASIKA/.test(n) && !/TUBE|EASY|DROP|STANDART|BERNARD|HOUSE|SLIM|BALTIC/.test(n.replace('KLASIKA GARDEN', '')); return n.indexOf(m) >= 0; }
    function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
    var WIDTHS = uniq([].concat.apply([], all.map(function (p) { return p.v.map(function (v) { return v.W; }); })).filter(Boolean)).sort(function (a, b) { return a - b; });
    var LENS = uniq([].concat.apply([], all.map(function (p) { return p.v.map(function (v) { return v.L ? Math.round(v.L) : null; }); })).filter(Boolean)).sort(function (a, b) { return a - b; });
    function vOk(p, v, skip) {
      if (v.p == null) return false;
      if (skip !== 'w' && F.w.length && !(v.W && F.w.some(function (w) { return Math.abs(w - v.W) < 0.01; }))) return false;
      if (skip !== 'l' && F.l.length && !(v.L && F.l.indexOf(Math.round(v.L)) >= 0)) return false;
      if (skip !== 't' && F.t.length && !(v.t && F.t.indexOf(v.t) >= 0)) return false;
      if (skip !== 'p' && F.pmin != null && v.p < F.pmin) return false;
      if (skip !== 'p' && F.pmax != null && v.p > F.pmax) return false;
      return true;
    }
    function pOk(p, skip) {
      if (skip !== 'form' && F.form.length && F.form.indexOf(p.f) < 0) return false;
      if (skip !== 'sub' && F.sub.length && F.sub.indexOf(p.sub) < 0) return false;
      if (skip !== 'fit' && F.fit && !fits(p, F.fit)) return false;
      return p.v.some(function (v) { return vOk(p, v, skip); });
    }
    function matchVs(p) { return p.v.filter(function (v) { return vOk(p, v); }); }
    function cnt(skip, test) { return all.filter(function (p) { return test(p) && pOk(p, skip); }).length; }
    function chips(name, key, vals, lab) {
      return '<fieldset class="fg"><legend>' + name + '</legend><div class="fchips">' + vals.map(function (v) {
        var on = F[key].indexOf(v) >= 0, n = cnt(key === 'w' || key === 'l' || key === 't' ? key : key, function (p) {
          if (key === 'form') return p.f === v; if (key === 'sub') return p.sub === v;
          return p.v.some(function (x) { var F0 = F[key]; F[key] = [v]; var r = vOk(p, x); F[key] = F0; return r; });
        });
        return '<button type="button" data-fk="' + key + '" data-fv="' + v + '" class="' + (on ? 'on' : '') + '" aria-pressed="' + on + '"' + (n || on ? '' : ' disabled') + '>' + esc(lab(v)) + ' <span>' + n + '</span></button>';
      }).join('') + '</div></fieldset>';
    }
    function renderFilters() {
      var h = '';
      if (KIND === 'gewaechshaus') {
        var forms = Object.keys(FORMS).filter(function (f) { return all.some(function (p) { return p.f === f; }); });
        h += chips('Form', 'form', forms, function (f) { return FORMS[f]; });
        h += chips('Breite', 'w', WIDTHS, function (w) { return dnum(w) + ' m'; });
        h += chips('Länge', 'l', LENS, function (l) { return l + ' m'; });
        h += chips('Polycarbonat', 't', [4, 6], function (t) { return t + ' mm'; });
      }
      if (KIND === 'zubehoer') {
        var subs = Object.keys(ACC).filter(function (s) { return all.some(function (p) { return p.sub === s; }); });
        h += chips('Kategorie', 'sub', subs, function (s) { return ACC[s]; });
        h += '<fieldset class="fg"><legend>Passend für</legend><div class="select"><select id="fFit"><option value="">Alle Gewächshäuser</option>' + FIT.map(function (m) { var n = cnt('fit', function (p) { return fits(p, m); }); return n ? '<option value="' + m + '"' + (F.fit === m ? ' selected' : '') + '>' + m + ' (' + n + ')</option>' : ''; }).join('') + '</select></div></fieldset>';
      }
      var ps = [].concat.apply([], all.map(function (p) { return priced(p).map(function (v) { return v.p; }); }));
      var lo = Math.floor(Math.min.apply(null, ps)), hi = Math.ceil(Math.max.apply(null, ps));
      h += '<fieldset class="fg"><legend>Preis</legend><div class="frange"><label><span>von</span><input type="number" inputmode="numeric" id="fMin" min="0" step="1" placeholder="' + lo + '" value="' + (F.pmin != null ? F.pmin : '') + '"></label><span class="dash">–</span><label><span>bis</span><input type="number" inputmode="numeric" id="fMax" min="0" step="1" placeholder="' + hi + '" value="' + (F.pmax != null ? F.pmax : '') + '"></label><span class="cur">€</span></div></fieldset>';
      h += '<button class="link fclear" type="button" id="fClear">Alle Filter zurücksetzen</button>';
      $('#filterForm').innerHTML = h;
      var fit = $('#fFit'); if (fit) fit.addEventListener('change', function () { F.fit = this.value; update(); });
      $('#fMin').addEventListener('change', function () { F.pmin = this.value === '' ? null : +this.value; update(); });
      $('#fMax').addEventListener('change', function () { F.pmax = this.value === '' ? null : +this.value; update(); });
      $('#fClear').addEventListener('click', function () { F.form = []; F.w = []; F.l = []; F.t = []; F.sub = []; F.fit = ''; F.pmin = F.pmax = null; update(); });
    }
    $('#filterForm').addEventListener('click', function (e) {
      var b = e.target.closest('[data-fk]'); if (!b || b.disabled) return;
      var k = b.dataset.fk, v = (k === 'form' || k === 'sub') ? b.dataset.fv : +b.dataset.fv, i = F[k].indexOf(v);
      if (i >= 0) F[k].splice(i, 1); else F[k].push(v);
      update();
    });
    // quick chips above the grid
    function renderQuick() {
      var h = '';
      if (KIND === 'gewaechshaus') h = '<a href="sets.html" class="qc hot">Lieber als Set?</a>' + Object.keys(FORMS).filter(function (f) { return all.some(function (p) { return p.f === f; }); }).map(function (f) { var on = F.form.length === 1 && F.form[0] === f; return '<button type="button" class="qc' + (on ? ' on' : '') + '" data-qf="' + f + '">' + esc(FORMS[f]) + '</button>'; }).join('');
      if (KIND === 'zubehoer') h = Object.keys(ACC).filter(function (s) { return all.some(function (p) { return p.sub === s; }); }).map(function (s) { var on = F.sub.length === 1 && F.sub[0] === s; return '<button type="button" class="qc' + (on ? ' on' : '') + '" data-qs="' + s + '">' + esc(ACC[s]) + '</button>'; }).join('');
      if (KIND === 'set') h = '<a href="gewaechshaeuser.html" class="qc">Gewächshäuser einzeln</a><a href="zubehoer.html" class="qc">Zubehör einzeln</a>';
      $('#lpChips').innerHTML = h;
    }
    $('#lpChips').addEventListener('click', function (e) {
      var f = e.target.closest('[data-qf]'), s = e.target.closest('[data-qs]');
      if (f) { F.form = (F.form.length === 1 && F.form[0] === f.dataset.qf) ? [] : [f.dataset.qf]; update(); }
      if (s) { F.sub = (F.sub.length === 1 && F.sub[0] === s.dataset.qs) ? [] : [s.dataset.qs]; update(); }
    });
    var sortSel = $('#sortSel');
    sortSel.value = F.sort;
    sortSel.addEventListener('change', function () { F.sort = this.value; update(); });
    function shownV(p) { var vs = matchVs(p); var st = cardState[p.id] && bySku(p, cardState[p.id]); return st && vs.indexOf(st) >= 0 ? st : (vs.indexOf(defaultV(p)) >= 0 ? defaultV(p) : vs.slice().sort(function (a, b) { return a.p - b.p; })[0]); }
    function card(p) { var vs = matchVs(p); return KIND === 'gewaechshaus' ? ghCard(p, vs) : (KIND === 'set' ? setCard(p, false) : accCard(p, vs)); }
    function active() {
      var t = [];
      F.form.forEach(function (v) { t.push(['form', v, FORMS[v]]); });
      F.w.forEach(function (v) { t.push(['w', v, dnum(v) + ' m breit']); });
      F.l.forEach(function (v) { t.push(['l', v, v + ' m lang']); });
      F.t.forEach(function (v) { t.push(['t', v, v + ' mm']); });
      F.sub.forEach(function (v) { t.push(['sub', v, ACC[v]]); });
      if (F.fit) t.push(['fit', F.fit, 'für ' + F.fit]);
      if (F.pmin != null || F.pmax != null) t.push(['p', '', (F.pmin != null ? 'ab ' + eurS(F.pmin) : '') + (F.pmin != null && F.pmax != null ? ' ' : '') + (F.pmax != null ? 'bis ' + eurS(F.pmax) : '')]);
      $('#fCount').textContent = t.length ? ' (' + t.length + ')' : '';
      $('#activeF').innerHTML = t.map(function (x) { return '<button type="button" class="af" data-ak="' + x[0] + '" data-av="' + esc(x[1]) + '">' + esc(x[2]) + icon('close') + '</button>'; }).join('') + (t.length > 1 ? '<button type="button" class="link" data-ak="all">Alle zurücksetzen</button>' : '');
    }
    $('#activeF').addEventListener('click', function (e) {
      var b = e.target.closest('[data-ak]'); if (!b) return; var k = b.dataset.ak, v = b.dataset.av;
      if (k === 'all') { F.form = []; F.w = []; F.l = []; F.t = []; F.sub = []; F.fit = ''; F.pmin = F.pmax = null; }
      else if (k === 'fit') F.fit = '';
      else if (k === 'p') F.pmin = F.pmax = null;
      else { var val = (k === 'form' || k === 'sub') ? v : +v; F[k] = F[k].filter(function (x) { return x !== val; }); }
      update();
    });
    function syncUrl() {
      var p = new URLSearchParams();
      ['form', 'w', 'l', 't', 'sub'].forEach(function (k) { if (F[k].length) p.set(k, F[k].join(',')); });
      if (F.fit) p.set('fit', F.fit); if (F.pmin != null) p.set('pmin', F.pmin); if (F.pmax != null) p.set('pmax', F.pmax); if (F.sort !== 'rec') p.set('sort', F.sort);
      var s = p.toString(); try { history.replaceState(null, '', location.pathname + (s ? '?' + s : '')); } catch (e) { }
    }
    var grid = $('#lpGrid');
    function update() {
      var list = all.filter(function (p) { return pOk(p); });
      list.sort(function (a, b) { return (b.src || 0) - (a.src || 0); });
      var price = function (p) { var v = shownV(p); return v ? v.p : 0; };
      if (F.sort === 'asc') list.sort(function (a, b) { return price(a) - price(b); });
      if (F.sort === 'desc') list.sort(function (a, b) { return price(b) - price(a); });
      if (F.sort === 'name') list.sort(function (a, b) { return a.n.localeCompare(b.n, 'de'); });
      if (F.sort === 'area') list.sort(function (a, b) { var A = function (p) { return Math.max.apply(null, matchVs(p).map(function (v) { return v.A || 0; })); }; return A(b) - A(a); });
      grid.classList.toggle('sets', KIND === 'set');
      grid.innerHTML = list.map(card).join('') || '<div class="lp-empty"><p>Zu dieser Auswahl gibt es leider nichts.</p><button class="btn btn-ghost" type="button" data-ak="all" id="emptyReset">Filter zurücksetzen</button></div>';
      var er = $('#emptyReset'); if (er) er.addEventListener('click', function () { F.form = []; F.w = []; F.l = []; F.t = []; F.sub = []; F.fit = ''; F.pmin = F.pmax = null; update(); });
      $('#resultNote').textContent = list.length + (list.length === 1 ? ' Artikel' : ' Artikel') + (F.l.length || F.w.length || F.t.length ? ', Preis für die gewählte Größe' : '');
      $('#filterApply').textContent = list.length + ' Ergebnisse anzeigen';
      renderFilters(); renderQuick(); active(); syncUrl();
    }
    function rer(p, cardEl, focusSel) { cardEl.outerHTML = card(p); var n = $('[data-id="' + p.id + '"] ' + focusSel, grid); if (n) n.focus(); }
    wireCards(grid, rer);
    grid.addEventListener('click', function (e) { var c = e.target.closest('.scard'); if (c && e.target.closest('[data-add]')) { /* handled by wireCards */ } });
    update();
  }

  /* ---------- page: product ---------- */
  function initProduct() {
    var main = $('.pv'), p = byId[main.dataset.id]; if (!p) return;
    var thumbs = $$('#pgThumbs [data-g]'), bigs = thumbs.length ? thumbs.map(function (b) { return b.dataset.big; }) : [$('#pgMain') ? $('#pgMain').getAttribute('src') : ''];
    var gi = 0;
    function showImg(i) { if (!thumbs.length) return; gi = i; $('#pgMain').src = bigs[i]; thumbs.forEach(function (b, k) { b.classList.toggle('on', k === i); }); }
    thumbs.forEach(function (b, k) { b.addEventListener('click', function () { showImg(k); }); });
    var z = $('.pg-zoom'); if (z) z.addEventListener('click', function () { lbOpen(bigs, gi); });
    var qs = new URLSearchParams(location.search);
    var v = (qs.get('v') && bySku(p, qs.get('v'))) || bySku(p, main.dataset.def) || defaultV(p);
    var qty = 1;
    function render(fromUser) {
      var a = v ? v.a : {};
      $$('[data-opt]').forEach(function (b) {
        var k = b.dataset.opt, val = +b.dataset.val, on = a[k] === val;
        b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
        var t = {}; for (var x in a) t[x] = a[x]; t[k] = val; var w = findV(p, t);
        b.classList.toggle('na', !w || w.p == null);
      });
      $$('[data-optlabel]').forEach(function (el) { el.textContent = valLabel(p, el.dataset.optlabel, a[el.dataset.optlabel]); });
      $('#pvPrice').textContent = eur(v && v.p);
      var old = $('#pvOld'); old.hidden = !(v && v.op); old.textContent = v && v.op ? eur(v.op) : '';
      var sk = $('#pvSku'); var real = v && realSku(v.s); sk.hidden = !real; if (real) $('span', sk).textContent = v.s;
      var av = $('#pvAvail'), at = v && v.av && /Anfrage/.test(v.av) ? 'Lieferzeit auf Anfrage' : (v && v.av && /Lager/.test(v.av) ? 'Auf Lager' : 'Verfügbar');
      av.lastChild.textContent = at; av.classList.toggle('req', at === 'Lieferzeit auf Anfrage');
      $('#pvAdd').disabled = !(v && v.p != null);
      $('#pvStickyPrice').textContent = eur(v && v.p); $('#pvStickyLabel').textContent = v ? varSub(p, v) : '';
      // spec rows that depend on the variant
      var rows = $$('#pvSpecs tr');
      rows.forEach(function (r) {
        var th = r.querySelector('th').textContent, td = r.querySelector('td');
        if (th === 'Breite × Länge' && v && v.W) td.textContent = dnum(v.W) + ' × ' + dnum(v.L) + ' m';
        if (th === 'Grundfläche' && v && v.A) td.textContent = dnum(v.A) + ' m²';
        if (th === 'Polycarbonat' && v && v.t) td.textContent = v.t + ' mm' + (/Garantie/.test(td.textContent) ? ', UV-geschützt (10 Jahre Garantie)' : '');
      });
      if (fromUser && v && v.g != null && thumbs[v.g]) showImg(v.g);
      if (fromUser && v) { try { history.replaceState(null, '', location.pathname + (p.v.length > 1 ? '?v=' + encodeURIComponent(v.s) : '')); } catch (e) { } }
    }
    $$('[data-opt]').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.dataset.opt, val = +b.dataset.val, a = {}; for (var x in v.a) a[x] = v.a[x]; a[k] = val;
        var w = findV(p, a);
        if (!w || w.p == null) { var c = {}; c[k] = val; w = p.v.filter(function (x) { return x.a[k] === val && x.p != null; })[0] || w; }
        if (w) { v = w; render(true); }
      });
    });
    $$('[data-pq]').forEach(function (b) { b.addEventListener('click', function () { qty = Math.max(1, Math.min(99, qty + (+b.dataset.pq))); $('#pvQty').textContent = qty; }); });
    function add() { cartAdd(p, v, qty); }
    $('#pvAdd').addEventListener('click', add);
    $('[data-stickyadd]').addEventListener('click', add);
    // sticky buy bar on phones once the buy box is out of view
    var sticky = $('#pvSticky'), buy = $('#pvBuy');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { var show = !en[0].isIntersecting; sticky.classList.toggle('on', show); sticky.setAttribute('aria-hidden', !show); }).observe(buy);
    }
    render(false);
  }

  /* ---------- page: checkout ---------- */
  function renderKasse() {
    var el = $('#ckLines'), sum = $('#ckSum');
    if (!cart.length) {
      el.innerHTML = '<div class="d-empty ck-empty">' + icon('cart') + '<p>Ihr Warenkorb ist leer. Sie können uns trotzdem eine Frage schicken.</p><div class="btns"><a class="btn btn-lime" href="sets.html">Sets ansehen</a><a class="btn btn-ghost" href="gewaechshaeuser.html">Gewächshäuser</a></div></div>';
      sum.innerHTML = ''; $('#ckTitle').textContent = 'Kontakt'; $('#orderSubmit').innerHTML = icon('mail') + 'Anfrage per E-Mail senden';
      return;
    }
    $('#ckTitle').textContent = 'Warenkorb'; $('#orderSubmit').innerHTML = icon('mail') + 'Bestellung per E-Mail senden';
    el.innerHTML = cart.map(function (c, i) { return lineHTML(c, i, true); }).join('');
    var t = cartTotal();
    sum.innerHTML = '<div class="row"><span>Zwischensumme (' + cartCount() + ' Artikel)</span><b class="num">' + eur(t) + '</b></div><div class="row"><span>Versand nach Deutschland</span><span>nach PLZ, vor der Zahlung</span></div>' +
      '<div class="row tot"><span>Gesamt inkl. MwSt.<small>zzgl. Versand</small></span><b class="num">' + eur(t) + '</b></div><div class="row vat"><span>darin enthalten 19&nbsp;% MwSt.</span><span class="num">' + eur(t - t / 1.19) + '</span></div>';
  }
  function initKasse() {
    $('#ckLines').addEventListener('click', cartClick);
    renderKasse();
    var form = $('#orderForm');
    form.addEventListener('input', function (e) { var f = e.target.closest('.fld'); if (f) f.classList.remove('err'); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      function chk(id, test) { var x = $('#' + id), good = test(x.value.trim()); x.closest('.fld').classList.toggle('err', !good); x.setAttribute('aria-invalid', !good); if (!good && ok) { x.focus(); ok = false; } }
      chk('f-name', function (v) { return v.length > 1; });
      chk('f-mail', function (v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v); });
      chk('f-plz', function (v) { return /\d{4,5}/.test(v); });
      if (!ok) return;
      var pay = (form.querySelector('input[name=pay]:checked') || {}).value, lines = [];
      if (cart.length) {
        lines.push('Bestellung:');
        cart.forEach(function (c) { lines.push('- ' + c.qty + ' x ' + c.name + (c.sub ? ', ' + c.sub : '') + (realSku(c.sku) ? ' (Art.-Nr. ' + c.sku + ')' : '') + ': ' + eur(c.price * c.qty)); });
        lines.push('Zwischensumme inkl. MwSt.: ' + eur(cartTotal()), '');
      }
      lines.push('Name: ' + $('#f-name').value.trim(), 'E-Mail: ' + $('#f-mail').value.trim());
      if ($('#f-tel').value.trim()) lines.push('Telefon: ' + $('#f-tel').value.trim());
      if ($('#f-str').value.trim()) lines.push('Straße: ' + $('#f-str').value.trim());
      lines.push('PLZ und Ort: ' + $('#f-plz').value.trim(), 'Zahlungsart: ' + pay);
      if ($('#f-msg').value.trim()) lines.push('', $('#f-msg').value.trim());
      var subj = (cart.length ? 'Bestellung' : 'Anfrage') + ' über den Baumera-Shop';
      var href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(lines.join('\n'));
      var okEl = $('#formOk');
      okEl.innerHTML = '<b>Fast geschafft.</b> Ihr E-Mail-Programm öffnet sich mit der vorbereiteten Nachricht. Bitte klicken Sie dort auf „Senden“. Falls sich nichts öffnet, schreiben Sie uns direkt an <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.';
      okEl.classList.add('on');
      window.__lastMailto = href;
      if (!window.__noMailto) window.location.href = href;
    });
  }

  /* ---------- init ---------- */
  renderCart();
  if (PAGE === 'home') initHome();
  if (PAGE === 'list') initList();
  if (PAGE === 'product') initProduct();
  if (PAGE === 'kasse') initKasse();
})();
