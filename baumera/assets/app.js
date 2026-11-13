(function () {
  'use strict';
  var D = window.BM_DATA;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var EMAIL = 'sales@plastikati.lv';
  var eurF = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
  var eur = function (n) { return eurF.format(n); };
  var eurS = function (n) { return Math.round(n * 100) % 100 === 0 ? Math.round(n).toLocaleString('de-DE') + '\u00a0€' : eurF.format(n); };
  var m2 = function (n) { return n.toLocaleString('de-DE', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); };
  var mm = function (n) { return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var icon = function (id) { return '<svg aria-hidden="true"><use href="#i-' + id + '"/></svg>'; };

  var TYPES = { bogen: 'Rundbogen', spitz: 'Spitzbogen & Tropfenform', haus: 'Satteldach', schmal: 'Schmal (2\u00a0m)', holz: 'Holz-Gewächshaus' };
  var TYPE_SHORT = { bogen: 'Rundbogen', spitz: 'Spitzbogen', haus: 'Satteldach', schmal: 'Schmal', holz: 'Holz' };
  var ACC_CATS = { lueftung: 'Fensteröffner & Lüftung', wasser: 'Bewässerung', beete: 'Hochbeete & Wege', regale: 'Regale & Rankhilfen', frueh: 'Frühbeete & Mini-Gewächshäuser' };
  var MODELS = D.models;
  var byId = {}; MODELS.forEach(function (m) { byId[m.id] = m; });
  var accById = {}; D.acc.forEach(function (a) { accById[a.id] = a; });

  function variantPrice(v, t) { return v['t' + t]; }
  function minPrice(m) { var p = Infinity; m.variants.forEach(function (v) { [4, 6].forEach(function (t) { if (v['t' + t] && v['t' + t] < p) p = v['t' + t]; }); }); return p; }
  function findVar(m, len) { for (var i = 0; i < m.variants.length; i++) if (Math.abs(m.variants[i].len - len) < 0.01) return m.variants[i]; return null; }
  function defaultLen(m) { return (findVar(m, 4) || m.variants[0]).len; }
  function defaultT(m, v) { return v.t4 ? 4 : 6; }
  function sizeLabel(m, len) { return mm(m.width).replace(',00', '') + '\u00a0×\u00a0' + m2(len) + '\u00a0m'; }

  /* ---------- storage ---------- */
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };

  /* ---------- cart ---------- */
  var cart = store.get('bm_cart_v1', []);
  if (!Array.isArray(cart)) cart = [];
  function cartSave() { store.set('bm_cart_v1', cart); renderCart(); }
  function cartAdd(item, silent) {
    var ex = cart.filter(function (c) { return c.key === item.key; })[0];
    if (ex) ex.qty += item.qty || 1; else { item.qty = item.qty || 1; cart.push(item); }
    cartSave();
    if (!silent) toast(item.name + (item.sub ? ', ' + item.sub : ''));
  }
  function modelItem(m, len, t) {
    var v = findVar(m, len);
    return { key: 'm:' + m.id + ':' + len + ':' + t, name: m.name + ' ' + sizeLabel(m, len), sub: 'Polycarbonat ' + t + '\u00a0mm', price: v['t' + t], img: m.card.src, qty: 1 };
  }
  function accItem(a, vi) {
    var v = a.variants[vi || 0];
    return { key: 'a:' + a.id + ':' + (vi || 0), name: a.name, sub: v.label, price: v.price, img: a.img.src, qty: 1 };
  }
  function setItem() { return { key: 'set', name: D.set.name, sub: 'Gewächshaus mit Zubehör', price: D.set.price, img: D.set.img.src, qty: 1 }; }
  function cartTotal() { return cart.reduce(function (s, c) { return s + c.price * c.qty; }, 0); }
  function cartCount() { return cart.reduce(function (s, c) { return s + c.qty; }, 0); }

  function renderCart() {
    $('#cartCount').textContent = cartCount();
    $('#cartSum').textContent = eur(cartTotal());
    $('#cartTotal').textContent = eur(cartTotal());
    var body = $('#cartBody');
    if (!cart.length) {
      body.innerHTML = '<div class="d-empty">' + icon('cart') + '<p>Ihr Warenkorb ist leer.</p><a class="btn btn-lime" href="#modelle" data-close>Gewächshäuser ansehen</a></div>';
      $('#cartFoot').style.display = 'none';
    } else {
      $('#cartFoot').style.display = '';
      body.innerHTML = cart.map(function (c, i) {
        return '<div class="ci"><img src="' + esc(c.img) + '" alt="" loading="lazy"><div><b>' + esc(c.name) + '</b>' + (c.sub ? '<small>' + esc(c.sub) + '</small>' : '') +
          '<small>' + eur(c.price) + ' pro Stück</small><div class="ln"><span class="qty"><button type="button" data-q="-1" data-i="' + i + '" aria-label="Menge verringern">−</button><span>' + c.qty + '</span><button type="button" data-q="1" data-i="' + i + '" aria-label="Menge erhöhen">+</button></span>' +
          '<button class="rm" type="button" data-rm="' + i + '">Entfernen</button><span class="p num">' + eur(c.price * c.qty) + '</span></div></div></div>';
      }).join('');
    }
    renderOrderCart();
  }
  $('#cartBody').addEventListener('click', function (e) {
    var q = e.target.closest('[data-q]'), rm = e.target.closest('[data-rm]');
    if (q) { var c = cart[+q.dataset.i]; c.qty += +q.dataset.q; if (c.qty < 1) cart.splice(+q.dataset.i, 1); cartSave(); }
    if (rm) { cart.splice(+rm.dataset.rm, 1); cartSave(); }
  });

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
    $('#modal').classList.remove('on');
    $('#scrim').classList.remove('on'); document.body.style.overflow = '';
    var had = openPanel; openPanel = null;
    if (had && lastFocus && document.contains(lastFocus)) { try { lastFocus.focus({ preventScroll: true }); } catch (e) { } }
  }
  $('#scrim').addEventListener('click', closeAll);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeAll(); closeMega(); closeSuggest(); } });

  var toastT;
  function toast(text) {
    $('#toastText').textContent = 'Im Warenkorb: ' + text;
    $('#toast').classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(function () { $('#toast').classList.remove('on'); }, 3600);
  }

  /* ---------- global click delegation ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-open],[data-close],[data-model],[data-type],[data-acccat],[data-set],[data-width]');
    if (!t) return;
    if (t.hasAttribute('data-open')) { e.preventDefault(); $('#toast').classList.remove('on'); open(t.getAttribute('data-open')); return; }
    if (t.hasAttribute('data-close')) { closeAll(); closeMega(); if (t.tagName !== 'A') e.preventDefault(); return; }
    if (t.hasAttribute('data-model')) { e.preventDefault(); openModel(t.getAttribute('data-model'), parseFloat(t.getAttribute('data-len')) || null); return; }
    if (t.hasAttribute('data-set')) { e.preventDefault(); openSet(); return; }
    if (t.hasAttribute('data-type')) { filt.type = t.getAttribute('data-type'); filt.width = ''; renderModels(); closeMega(); if (openPanel) closeAll(); goTo('#modelle', e); return; }
    if (t.hasAttribute('data-width')) { filt.width = t.getAttribute('data-width'); filt.type = 'all'; renderModels(); closeMega(); if (openPanel) closeAll(); goTo('#modelle', e); return; }
    if (t.hasAttribute('data-acccat')) { accCat = t.getAttribute('data-acccat'); renderAcc(); closeMega(); if (openPanel) closeAll(); goTo('#zubehoer', e); return; }
  });
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function goTo(sel, e) { if (e) e.preventDefault(); var el = $(sel); if (el) el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }); if (history.replaceState) history.replaceState(null, '', sel); }

  /* ---------- prices in static markup ---------- */
  var allMin = Math.min.apply(null, MODELS.map(minPrice));
  $$('[data-min]').forEach(function (el) { var k = el.dataset.min; el.textContent = eurS(k === 'all' ? allMin : minPrice(byId[k])); });
  $$('[data-price]').forEach(function (el) { var p = el.dataset.price.split(':'); var v = findVar(byId[p[0]], +p[1]); if (v) el.textContent = eurS(v['t' + p[2]]); });
  $$('[data-setprice]').forEach(function (el) { el.textContent = eurS(D.set.price); });
  function accMin(cat) { return Math.min.apply(null, D.acc.filter(function (a) { return a.cat === cat; }).map(function (a) { return a.price; })); }
  $$('[data-accmin]').forEach(function (el) { el.textContent = 'ab ' + eurS(accMin(el.dataset.accmin)); });

  /* ---------- carousel ---------- */
  (function () {
    var root = $('#carousel'), slides = $$('.slide', root), dots = $$('.c-dots button', root), i = 0, timer = null;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function go(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('on', k === i); s.setAttribute('aria-hidden', k === i ? 'false' : 'true'); $$('a,button', s).forEach(function (b) { b.tabIndex = k === i ? 0 : -1; }); });
      dots.forEach(function (d, k) { d.classList.toggle('on', k === i); d.setAttribute('aria-selected', k === i); });
      var img = slides[i].querySelector('img[loading="lazy"]'); if (img) img.loading = 'eager';
    }
    function play() { if (reduce) return; stop(); timer = setInterval(function () { go(i + 1); }, 7000); }
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

  /* ---------- categories ---------- */
  function typeModels(type) { return MODELS.filter(function (m) { return m.type === type; }); }
  var CAT_TYPES = ['bogen', 'spitz', 'haus', 'schmal'];
  $('#cats').innerHTML = CAT_TYPES.map(function (ty) {
    var ms = typeModels(ty), p = Math.min.apply(null, ms.map(minPrice));
    return '<a class="cat" href="#modelle" data-type="' + ty + '"><span class="ph"><img src="' + D.cats[ty].src + '" alt="' + esc(TYPES[ty]) + '" loading="lazy"></span><span class="tx"><b>' + esc(TYPES[ty]) + '</b><small>' +
      ms.map(function (m) { return esc(m.name.replace('KLASIKA ', '')); }).join(', ') + '</small><span class="ab">ab ' + eurS(p) + '</span></span></a>';
  }).join('');
  $('#catsAcc').innerHTML = Object.keys(ACC_CATS).map(function (c) {
    return '<a class="cat-s" href="#zubehoer" data-acccat="' + c + '"><img src="' + D.cats[c].src + '" alt="" loading="lazy"><span><b>' + esc(ACC_CATS[c]) + '</b><small>ab ' + eurS(accMin(c)) + '</small></span></a>';
  }).join('');

  /* ---------- mega menu + mobile menu ---------- */
  var widths = []; MODELS.forEach(function (m) { if (widths.indexOf(m.width) < 0) widths.push(m.width); }); widths.sort();
  (function () {
    var col1 = Object.keys(TYPES).map(function (ty) { var n = typeModels(ty).length; return '<a href="#modelle" data-type="' + ty + '">' + esc(TYPES[ty]) + '<span>' + n + (n === 1 ? ' Modell' : ' Modelle') + '</span></a>'; }).join('');
    var col2 = widths.map(function (w) { var n = MODELS.filter(function (m) { return m.width === w; }).length; return '<a href="#modelle" data-width="' + w + '">' + mm(w) + '\u00a0m breit<span>' + n + (n === 1 ? ' Modell' : ' Modelle') + '</span></a>'; }).join('');
    var col3 = Object.keys(ACC_CATS).map(function (c) { return '<a href="#zubehoer" data-acccat="' + c + '">' + esc(ACC_CATS[c]) + '<span>ab ' + eurS(accMin(c)) + '</span></a>'; }).join('') + '<a href="#set" data-close>Komplett-Set KLASIKA 3\u00a0×\u00a06\u00a0m<span>' + eurS(D.set.price) + '</span></a>';
    $('#megaInner').innerHTML = '<div><h4>Nach Form</h4>' + col1 + '</div><div><h4>Nach Breite</h4>' + col2 + '</div><div><h4>Zubehör</h4>' + col3 + '</div>';
    $('#menuLinks').innerHTML = Object.keys(TYPES).map(function (ty) { return '<a href="#modelle" data-type="' + ty + '">' + esc(TYPES[ty]) + '<span>ab ' + eurS(Math.min.apply(null, typeModels(ty).map(minPrice))) + '</span></a>'; }).join('') +
      '<a href="#zubehoer" data-acccat="all">Zubehör<span>ab ' + eurS(Math.min.apply(null, D.acc.map(function (a) { return a.price; }))) + '</span></a>' +
      '<a href="#konfigurator" data-close>Konfigurator</a><a href="#set" data-close>Komplett-Set</a><a href="#service" data-close>Versand &amp; Zahlung</a><a href="#faq" data-close>Häufige Fragen</a><a href="#kontakt" data-close>Kontakt</a>';
  })();
  var megaBtn = $('#megaBtn');
  function closeMega() { $('#mega').classList.remove('open'); megaBtn.setAttribute('aria-expanded', 'false'); }
  megaBtn.addEventListener('click', function (e) { e.stopPropagation(); var o = $('#mega').classList.toggle('open'); megaBtn.setAttribute('aria-expanded', o); });
  document.addEventListener('click', function (e) { if (!e.target.closest('#mega') && e.target !== megaBtn) closeMega(); });
  $$('.catnav nav a:not([data-type])').forEach(function (a) { a.addEventListener('click', closeMega); });

  /* ---------- model grid ---------- */
  var filt = { type: 'all', width: '', sort: 'rec' };
  var cardState = {};
  MODELS.forEach(function (m) { var l = defaultLen(m); cardState[m.id] = { len: l, t: defaultT(m, findVar(m, l)) }; });
  var widthSel = $('#widthSel');
  widthSel.innerHTML = '<option value="">Alle Breiten</option>' + widths.map(function (w) { return '<option value="' + w + '">' + mm(w) + '\u00a0m</option>'; }).join('');
  widthSel.addEventListener('change', function () { filt.width = widthSel.value; renderModels(); });
  $('#sortSel').addEventListener('change', function () { filt.sort = this.value; renderModels(); });

  function renderTabs() {
    var tabs = [['all', 'Alle', MODELS.length]].concat(Object.keys(TYPES).map(function (ty) { return [ty, TYPE_SHORT[ty], typeModels(ty).length]; }));
    $('#typeTabs').innerHTML = tabs.map(function (t) { return '<button type="button" data-tab="' + t[0] + '" class="' + (filt.type === t[0] ? 'on' : '') + '" aria-pressed="' + (filt.type === t[0]) + '">' + t[1] + ' <span>' + t[2] + '</span></button>'; }).join('');
  }
  $('#typeTabs').addEventListener('click', function (e) { var b = e.target.closest('[data-tab]'); if (!b) return; filt.type = b.dataset.tab; renderModels(); });

  function cardHTML(m) {
    var st = cardState[m.id], v = findVar(m, st.len), p = v['t' + st.t], ok = v['ok' + st.t];
    var badges = '<span class="badge">' + esc(TYPE_SHORT[m.type]) + '</span>' + (m.foundation ? '<span class="badge l">mit Fundament</span>' : '') + (m.isNew ? '<span class="badge d">Neu</span>' : '');
    var opts = m.variants.map(function (x) { return '<option value="' + x.len + '"' + (x.len === st.len ? ' selected' : '') + '>' + m2(x.len) + '\u00a0m lang</option>'; }).join('');
    var spec = '<span>' + icon('ruler') + mm(m.width) + '\u00a0m breit</span>' + (m.height ? '<span>' + mm(m.height) + '\u00a0m hoch</span>' : '') + (m.snow ? '<span>' + icon('snow') + m.snow + '\u00a0kg/m²</span>' : '');
    return '<article class="card" data-id="' + m.id + '">' +
      '<button class="ph" type="button" data-detail aria-label="Details zu ' + esc(m.name) + '"><img src="' + m.card.src + '" alt="Gewächshaus ' + esc(m.name) + '" loading="lazy" width="' + m.card.w + '" height="' + m.card.h + '"><span class="badges">' + badges + '</span></button>' +
      '<div class="bd"><h3><button type="button" data-detail>' + esc(m.name) + '</button></h3><div class="spec">' + spec + '</div>' +
      '<div class="opts"><div class="select"><select data-len aria-label="Länge ' + esc(m.name) + '"' + (m.variants.length < 2 ? ' disabled' : '') + '>' + opts + '</select></div>' +
      '<div class="seg" role="group" aria-label="Polycarbonat-Stärke"><button type="button" data-t="4"' + (v.t4 ? '' : ' disabled') + ' class="' + (st.t === 4 ? 'on' : '') + '">4\u00a0mm</button><button type="button" data-t="6"' + (v.t6 ? '' : ' disabled') + ' class="' + (st.t === 6 ? 'on' : '') + '">6\u00a0mm</button></div></div>' +
      '<div class="price-row"><div><div class="price num">' + eur(p) + '</div><div class="price-note">inkl. MwSt., zzgl. Versand</div></div><span class="area">' + m2(v.area) + '\u00a0m²</span></div>' +
      '<div class="avail' + (ok ? '' : ' req') + '"><i></i>' + (ok ? 'Verfügbar' : 'Lieferzeit auf Anfrage') + '</div>' +
      '<div class="acts"><button class="btn btn-lime" type="button" data-add>' + icon('cart-plus') + 'In den Warenkorb</button><button class="btn-icon" type="button" data-detail aria-label="Details zu ' + esc(m.name) + ' ansehen">' + icon('eye') + '</button></div></div></article>';
  }
  function renderModels() {
    renderTabs();
    widthSel.value = filt.width;
    var list = MODELS.filter(function (m) { return (filt.type === 'all' || m.type === filt.type) && (!filt.width || m.width === +filt.width); });
    if (filt.sort === 'asc') list.sort(function (a, b) { return minPrice(a) - minPrice(b); });
    if (filt.sort === 'desc') list.sort(function (a, b) { return minPrice(b) - minPrice(a); });
    if (filt.sort === 'snow') list.sort(function (a, b) { return (b.snow || 0) - (a.snow || 0); });
    $('#modelGrid').innerHTML = list.map(cardHTML).join('') || '<p>Zu dieser Auswahl gibt es kein Modell. <button class="link" type="button" data-type="all">Alle Modelle anzeigen</button></p>';
    var label = filt.type === 'all' ? 'alle Formen' : TYPES[filt.type];
    $('#resultNote').textContent = list.length + (list.length === 1 ? ' Modell' : ' Modelle') + ': ' + label + (filt.width ? ', ' + mm(+filt.width) + '\u00a0m breit' : '');
  }
  function updateCard(card) {
    var m = byId[card.dataset.id];
    card.outerHTML = cardHTML(m);
  }
  $('#modelGrid').addEventListener('change', function (e) {
    if (!e.target.matches('[data-len]')) return;
    var card = e.target.closest('.card'), m = byId[card.dataset.id], st = cardState[m.id];
    st.len = parseFloat(e.target.value); var v = findVar(m, st.len); if (!v['t' + st.t]) st.t = defaultT(m, v);
    updateCard(card); var n = $('.card[data-id="' + m.id + '"] [data-len]'); if (n) n.focus();
  });
  $('#modelGrid').addEventListener('click', function (e) {
    var card = e.target.closest('.card'); if (!card) return;
    var m = byId[card.dataset.id], st = cardState[m.id];
    var tb = e.target.closest('[data-t]');
    if (tb && !tb.disabled) { st.t = +tb.dataset.t; updateCard(card); var nb = $('.card[data-id="' + m.id + '"] [data-t="' + st.t + '"]'); if (nb) nb.focus(); return; }
    if (e.target.closest('[data-add]')) { cartAdd(modelItem(m, st.len, st.t)); return; }
    if (e.target.closest('[data-detail]')) { openModel(m.id, st.len, st.t); }
  });

  /* ---------- modal: model detail ---------- */
  function galHTML(gal, alt) {
    return '<div class="m-gal"><div class="m-main"><img id="mMainImg" src="' + gal[0].src + '" alt="' + esc(alt) + '"></div><div class="m-thumbs">' +
      gal.map(function (g, k) { return '<button type="button" data-g="' + k + '" class="' + (k ? '' : 'on') + '" aria-label="Bild ' + (k + 1) + ' anzeigen"><img src="' + g.src + '" alt="" loading="lazy"></button>'; }).join('') + '</div></div>';
  }
  function wireGallery(box, gal) {
    box.querySelector('.m-thumbs').addEventListener('click', function (e) {
      var b = e.target.closest('[data-g]'); if (!b) return;
      $('#mMainImg').src = gal[+b.dataset.g].src;
      $$('.m-thumbs button', box).forEach(function (x) { x.classList.toggle('on', x === b); });
    });
  }
  var closeBtn = '<button class="close" type="button" data-close aria-label="Schließen">' + icon('close') + '</button>';
  function openModel(id, len, t) {
    var m = byId[id]; if (!m) return;
    var st = { len: len && findVar(m, len) ? len : cardState[id].len, t: t || cardState[id].t };
    if (!findVar(m, st.len)['t' + st.t]) st.t = defaultT(m, findVar(m, st.len));
    var box = $('#mBox');
    function specRows() {
      var v = findVar(m, st.len);
      var rows = [['Breite × Länge', sizeLabel(m, st.len)], ['Grundfläche', m2(v.area) + '\u00a0m²']];
      if (m.height) rows.push(['Höhe', mm(m.height) + '\u00a0m']);
      rows.push(['Rahmen', m.type === 'holz' ? m.profile : 'Verzinkter Stahl, 1 mm, ' + m.profile]);
      if (m.snow) rows.push(['Schneelast', m.snow + '\u00a0kg/m²']);
      if (m.arch) rows.push(['Bogenabstand', mm(m.arch) + '\u00a0m']);
      rows.push(['Fundament', m.foundation ? 'Metallfundament 10\u00a0cm, inklusive' : (m.type === 'holz' ? 'Fundamentsteine nicht enthalten' : 'nicht enthalten, Bögen ca.\u00a035\u00a0cm im Boden verankert')]);
      rows.push(['Tür', m.door], ['Fenster', m.windows]);
      if (m.type !== 'holz') rows.push(['Gummidichtungen', m.seals ? 'ja' : 'nein']);
      rows.push(['Polycarbonat', st.t + '\u00a0mm, UV-geschützt, 10 Jahre Herstellergarantie'], ['Montageanleitung', 'liegt bei']);
      return rows.map(function (r) { return '<tr><th scope="row">' + r[0] + '</th><td>' + esc(r[1]) + '</td></tr>'; }).join('');
    }
    function infoHTML() {
      var v = findVar(m, st.len), ok = v['ok' + st.t];
      var ext = m.ext && (m.ext['t' + st.t]) ? '<div class="m-ext">Später erweiterbar: Verlängerung um ' + m.extStep + '\u00a0m mit ' + st.t + '\u00a0mm Polycarbonat für ' + eur(m.ext['t' + st.t]) + '.</div>' : '';
      return '<span class="eyebrow">' + esc(TYPES[m.type]) + (m.isNew ? ' · Neu' : '') + '</span><h3 id="mTitle">' + esc(m.name) + '</h3><p class="lead">' + esc(m.lead) + '</p>' +
        '<div class="m-opts"><div><span class="lbl">Länge</span><div class="select"><select id="mLen"' + (m.variants.length < 2 ? ' disabled' : '') + '>' + m.variants.map(function (x) { return '<option value="' + x.len + '"' + (x.len === st.len ? ' selected' : '') + '>' + sizeLabel(m, x.len) + ' · ' + m2(x.area) + '\u00a0m²</option>'; }).join('') + '</select></div></div>' +
        '<div><span class="lbl">Polycarbonat</span><div class="seg" id="mT"><button type="button" data-t="4"' + (v.t4 ? '' : ' disabled') + ' class="' + (st.t === 4 ? 'on' : '') + '">4\u00a0mm</button><button type="button" data-t="6"' + (v.t6 ? '' : ' disabled') + ' class="' + (st.t === 6 ? 'on' : '') + '">6\u00a0mm</button></div></div></div>' +
        '<div class="m-buy"><div><div class="price num">' + eur(v['t' + st.t]) + '</div><div class="price-note">inkl. MwSt., zzgl. Versand</div></div><div class="avail' + (ok ? '' : ' req') + '"><i></i>' + (ok ? 'Verfügbar' : 'Lieferzeit auf Anfrage') + '</div>' +
        '<div class="btns"><button class="btn btn-lime" type="button" id="mAdd">' + icon('cart-plus') + 'In den Warenkorb</button>' + (m.type === 'holz' ? '<a class="btn btn-ghost" href="#kontakt" id="mAsk">Anfragen</a>' : '<button class="btn btn-ghost" type="button" id="mCfg">Im Konfigurator</button>') + '</div></div>' + ext +
        '<table class="specs"><caption class="sr">Technische Daten</caption>' + specRows() + '</table>';
    }
    box.innerHTML = closeBtn + galHTML(m.gallery, 'Gewächshaus ' + m.name) + '<div class="m-info" id="mInfo">' + infoHTML() + '</div>';
    wireGallery(box, m.gallery);
    function rewire() {
      $('#mLen').addEventListener('change', function () { st.len = parseFloat(this.value); var v = findVar(m, st.len); if (!v['t' + st.t]) st.t = defaultT(m, v); $('#mInfo').innerHTML = infoHTML(); rewire(); $('#mLen').focus(); });
      $('#mT').addEventListener('click', function (e) { var b = e.target.closest('[data-t]'); if (!b || b.disabled) return; st.t = +b.dataset.t; $('#mInfo').innerHTML = infoHTML(); rewire(); });
      $('#mAdd').addEventListener('click', function () { cartAdd(modelItem(m, st.len, st.t)); cardState[m.id] = { len: st.len, t: st.t }; refreshCard(m.id); });
      var c = $('#mCfg'); if (c) c.addEventListener('click', function () { cfg.w = m.width; cfg.model = m.id; cfg.len = st.len; cfg.t = st.t; renderCfg(); closeAll(); goTo('#konfigurator'); });
      var a = $('#mAsk'); if (a) a.addEventListener('click', function (e) { prefillMessage('Anfrage zu ' + m.name + ' ' + sizeLabel(m, st.len) + ', ' + st.t + '\u00a0mm: Bitte nennen Sie mir Lieferzeit und Versandkosten für meine PLZ.'); closeAll(); goTo('#kontakt', e); });
    }
    rewire();
    showModal();
  }
  function refreshCard(id) { var c = $('.card[data-id="' + id + '"]'); if (c) updateCard(c); }
  function showModal() {
    lastFocus = document.activeElement;
    $('#modal').classList.add('on'); $('#scrim').classList.add('on'); document.body.style.overflow = 'hidden';
    openPanel = $('#modal'); $('#mBox').scrollTop = 0;
    setTimeout(function () { var c = $('#mBox .close'); if (c) c.focus(); }, 30);
  }
  $('#modal').addEventListener('click', function (e) { if (e.target.id === 'modal') closeAll(); });

  /* ---------- set ---------- */
  $('#setList').innerHTML = D.set.items.map(function (s) { return '<li>' + icon('check') + '<span>' + esc(s) + '</span></li>'; }).join('');
  $('#setPrice').textContent = eurS(D.set.price);
  $('#setAdd').addEventListener('click', function () { cartAdd(setItem()); });
  function openSet() {
    var box = $('#mBox');
    box.innerHTML = closeBtn + galHTML(D.set.gallery, D.set.name) + '<div class="m-info"><span class="eyebrow">Komplett-Set</span><h3 id="mTitle">' + esc(D.set.name) + '</h3><p class="lead">Ein Paket für den Start: Gewächshaus mit Fundament und passendem Zubehör für Lüftung, Bewässerung und Beete.</p>' +
      '<ul class="m-incl">' + D.set.items.map(function (s) { return '<li>' + icon('check') + '<span>' + esc(s) + '</span></li>'; }).join('') + '</ul>' +
      '<div class="m-buy"><div><div class="price num">' + eur(D.set.price) + '</div><div class="price-note">inkl. MwSt., zzgl. Versand</div></div><div class="avail"><i></i>Verfügbar</div><div class="btns"><button class="btn btn-lime" type="button" id="mAdd">' + icon('cart-plus') + 'In den Warenkorb</button><button class="btn btn-ghost" type="button" data-model="klasika" data-len="6">Nur Gewächshaus</button></div></div></div>';
    wireGallery(box, D.set.gallery);
    $('#mAdd').addEventListener('click', function () { cartAdd(setItem()); });
    showModal();
  }

  /* ---------- configurator ---------- */
  var CFG_MODELS = MODELS.filter(function (m) { return m.type !== 'holz'; });
  var cfgWidths = []; CFG_MODELS.forEach(function (m) { if (cfgWidths.indexOf(m.width) < 0) cfgWidths.push(m.width); }); cfgWidths.sort();
  var cfg = { w: 3, model: 'tube', len: 6, t: 4, ex: { opener: true, water: false, beds: false } };
  function cfgModel() { return byId[cfg.model]; }
  function pickAccVariant(a, len, exact) {
    var best = -1, bl = Infinity;
    a.variants.forEach(function (v, k) { var L = parseFloat(v.label); if (/10 cm/.test(v.label)) return; if (exact ? Math.abs(L - len) < 0.01 : (L >= len - 0.01 && L < bl)) { if (exact || L < bl) { best = k; bl = L; } } });
    return best;
  }
  function cfgExtras() {
    var m = cfgModel(), out = [];
    var op = accById.universal;
    out.push({ key: 'opener', label: 'Automatischer Fensteröffner KLASIKA UNIVERSAL', price: op.variants[0].price, acc: op, vi: 0, dis: m.id === 'standart' ? 'bei STANDART bereits inklusive' : '' });
    var wa = accById['drop-water'], wi = pickAccVariant(wa, cfg.len, false);
    out.push({ key: 'water', label: 'Tropfbewässerung KLASIKA DROP ' + (wi >= 0 ? wa.variants[wi].label : ''), price: wi >= 0 ? wa.variants[wi].price : 0, acc: wa, vi: wi, dis: wi < 0 ? 'nicht in dieser Länge' : '' });
    var bed = m.width === 3 ? accById.beete3 : (m.width >= 2.35 && m.width <= 2.5 ? accById.beete25 : null);
    var bi = bed ? pickAccVariant(bed, cfg.len, true) : -1;
    out.push({ key: 'beds', label: 'Hochbeet-Set KLASIKA GARDEN' + (bi >= 0 ? ', ' + m2(cfg.len) + '\u00a0m' : ''), price: bi >= 0 ? bed.variants[bi].price : 0, acc: bed, vi: bi, dis: bi < 0 ? (bed ? 'nicht in dieser Länge' : 'nicht für 2\u00a0m Breite') : '' });
    return out;
  }
  function renderCfg() {
    var ms = CFG_MODELS.filter(function (m) { return m.width === cfg.w; });
    if (!ms.some(function (m) { return m.id === cfg.model; })) cfg.model = ms[0].id;
    var m = cfgModel();
    if (!findVar(m, cfg.len)) { var best = m.variants[0]; m.variants.forEach(function (v) { if (Math.abs(v.len - cfg.len) < Math.abs(best.len - cfg.len)) best = v; }); cfg.len = best.len; }
    var v = findVar(m, cfg.len);
    if (!v['t' + cfg.t]) cfg.t = defaultT(m, v);
    $('#cfWidth').innerHTML = cfgWidths.map(function (w) { return '<button type="button" data-w="' + w + '" class="' + (w === cfg.w ? 'on' : '') + '" aria-pressed="' + (w === cfg.w) + '">' + mm(w) + '\u00a0m</button>'; }).join('');
    $('#cfModel').innerHTML = ms.map(function (x) { return '<button type="button" data-m="' + x.id + '" class="' + (x.id === cfg.model ? 'on' : '') + '" aria-pressed="' + (x.id === cfg.model) + '">' + esc(x.name.replace('KLASIKA ', '')) + '</button>'; }).join('');
    var r = $('#cfLen'); r.max = m.variants.length - 1; r.value = m.variants.indexOf(v); r.disabled = m.variants.length < 2;
    r.setAttribute('aria-valuetext', m2(cfg.len) + ' Meter');
    $('#cfLenOut').textContent = m2(cfg.len) + '\u00a0m · ' + m2(v.area) + '\u00a0m²';
    $('#cfTicks').innerHTML = m.variants.map(function (x) { return '<span>' + m2(x.len) + '</span>'; }).join('');
    $$('#cfThick button').forEach(function (b) { var t = +b.dataset.t; b.disabled = !v['t' + t]; b.classList.toggle('on', t === cfg.t); b.setAttribute('aria-pressed', t === cfg.t); });
    var ex = cfgExtras(), total = v['t' + cfg.t];
    $('#cfExtras').innerHTML = ex.map(function (x) {
      var on = cfg.ex[x.key] && !x.dis; if (on) total += x.price;
      return '<label class="check' + (x.dis ? ' dis' : '') + '"><input type="checkbox" data-ex="' + x.key + '"' + (on ? ' checked' : '') + (x.dis ? ' disabled' : '') + '><span>' + esc(x.label) + (x.dis ? ' <small style="opacity:.7">(' + x.dis + ')</small>' : '') + '</span><b>' + (x.dis ? '' : '+ ' + eur(x.price)) + '</b></label>';
    }).join('');
    $('#cfName').textContent = m.name + ' ' + sizeLabel(m, cfg.len) + ', ' + cfg.t + '\u00a0mm';
    $('#cfTotal').textContent = eur(total);
    $('#cfLegend').innerHTML = '<span>Breite <b>' + mm(m.width) + '\u00a0m</b></span><span>Grundfläche <b>' + m2(v.area) + '\u00a0m²</b></span><span>Höhe <b>' + mm(m.height) + '\u00a0m</b></span>' + (m.snow ? '<span>Schneelast <b>' + m.snow + '\u00a0kg/m²</b></span>' : '') + '<span>Bogenabstand <b>' + mm(m.arch) + '\u00a0m</b></span><span>Fundament <b>' + (m.foundation ? 'inklusive' : 'Bodenanker') + '</b></span>';
    drawCfg(m, cfg.len);
  }
  function drawCfg(m, L) {
    var svgEl = $('#cfSvg'), compact = (svgEl.clientWidth || 600) < 480, VW = compact ? 420 : 720, fs = compact ? 1.25 : 1;
    var Lmax = m.variants[m.variants.length - 1].len, s = compact ? Math.min(60, 360 / Lmax) : Math.min(60, 592 / (m.width + Lmax)), yb = 196, x0 = 44, W = m.width * s, H = m.height * s, x1 = compact ? 50 : x0 + W + 64, Ls = L * s;
    var LIME = '#a6d700', FILL = 'rgba(166,215,0,.13)', DIM = 'rgba(238,240,230,.6)', TXT = '#eef0e6';
    var h1;
    var front = '';
    if (m.type === 'haus') { h1 = H * 0.68; front = 'M' + x0 + ' ' + yb + 'V' + (yb - h1) + 'L' + (x0 + W / 2) + ' ' + (yb - H) + 'L' + (x0 + W) + ' ' + (yb - h1) + 'V' + yb + 'Z'; }
    else if (m.type === 'spitz') { h1 = H * 0.32; front = 'M' + x0 + ' ' + yb + 'V' + (yb - h1) + 'Q' + x0 + ' ' + (yb - H * 0.93) + ' ' + (x0 + W / 2) + ' ' + (yb - H) + 'Q' + (x0 + W) + ' ' + (yb - H * 0.93) + ' ' + (x0 + W) + ' ' + (yb - h1) + 'V' + yb + 'Z'; }
    else { h1 = Math.max(0.25 * s, H - W / 2); front = 'M' + x0 + ' ' + yb + 'V' + (yb - h1) + 'A' + (W / 2) + ' ' + (H - h1) + ' 0 0 1 ' + (x0 + W) + ' ' + (yb - h1) + 'V' + yb + 'Z'; }
    var dw = Math.min(0.95 * s, W * 0.36), dh = Math.min(1.85 * s, H * 0.78), dx = x0 + W / 2 - dw / 2;
    var vy = yb - H - 44, vh = H + 44 + 58;
    var g = '<defs><pattern id="bp" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="rgba(238,240,230,.06)"/></pattern></defs><rect x="0" y="' + vy + '" width="' + VW + '" height="' + vh + '" fill="url(#bp)"/>';
    g += '<line x1="10" y1="' + yb + '" x2="' + (VW - 10) + '" y2="' + yb + '" stroke="rgba(238,240,230,.25)" stroke-width="1.5" stroke-dasharray="2 5"/>';
    if (!compact) {
    g += '<path d="' + front + '" fill="' + FILL + '" stroke="' + LIME + '" stroke-width="2.4" stroke-linejoin="round"/>';
    g += '<rect x="' + dx + '" y="' + (yb - dh) + '" width="' + dw + '" height="' + dh + '" fill="none" stroke="' + LIME + '" stroke-width="1.6"/><line x1="' + (dx + dw / 2) + '" y1="' + (yb - dh) + '" x2="' + (dx + dw / 2) + '" y2="' + yb + '" stroke="' + LIME + '" stroke-width="1.2"/>';
    if (m.foundation) g += '<rect x="' + (x0 - 2) + '" y="' + (yb - 4.4) + '" width="' + (W + 4) + '" height="4.4" fill="' + LIME + '"/>';
    }
    // side view
    g += '<rect x="' + x1 + '" y="' + (yb - H) + '" width="' + Ls + '" height="' + H + '" rx="3" fill="' + FILL + '" stroke="' + LIME + '" stroke-width="2.4"/>';
    g += '<line x1="' + x1 + '" y1="' + (yb - h1) + '" x2="' + (x1 + Ls) + '" y2="' + (yb - h1) + '" stroke="' + LIME + '" stroke-width="1" stroke-dasharray="4 4" opacity=".7"/>';
    var n = Math.max(1, Math.round(L / m.arch));
    for (var k = 1; k < n; k++) { var ax = x1 + Ls * k / n; g += '<line x1="' + ax + '" y1="' + (yb - H) + '" x2="' + ax + '" y2="' + yb + '" stroke="' + LIME + '" stroke-width="1.2" opacity=".55"/>'; }
    if (m.foundation) g += '<rect x="' + (x1 - 2) + '" y="' + (yb - 4.4) + '" width="' + (Ls + 4) + '" height="4.4" fill="' + LIME + '"/>';
    function dimH(xa, xb, y, label) {
      return '<line x1="' + xa + '" y1="' + y + '" x2="' + xb + '" y2="' + y + '" stroke="' + DIM + '" stroke-width="1.2"/><line x1="' + xa + '" y1="' + (y - 7) + '" x2="' + xa + '" y2="' + (y + 7) + '" stroke="' + DIM + '" stroke-width="1.2"/><line x1="' + xb + '" y1="' + (y - 7) + '" x2="' + xb + '" y2="' + (y + 7) + '" stroke="' + DIM + '" stroke-width="1.2"/>' +
        '<text x="' + ((xa + xb) / 2) + '" y="' + (y + 24) + '" text-anchor="middle" fill="' + TXT + '" font-family="Poppins,sans-serif" font-weight="600" font-size="' + (17 * fs) + '">' + label + '</text>';
    }
    if (!compact) g += dimH(x0, x0 + W, yb + 22, mm(m.width) + '\u00a0m');
    g += dimH(x1, x1 + Ls, yb + 22, m2(L) + '\u00a0m');
    var hx = compact ? x1 - 16 : x0 - 16;
    g += '<line x1="' + hx + '" y1="' + yb + '" x2="' + hx + '" y2="' + (yb - H) + '" stroke="' + DIM + '" stroke-width="1.2"/><line x1="' + (hx - 6) + '" y1="' + (yb - H) + '" x2="' + (hx + 6) + '" y2="' + (yb - H) + '" stroke="' + DIM + '" stroke-width="1.2"/>';
    g += '<text x="' + (hx - 8) + '" y="' + (yb - H / 2) + '" text-anchor="middle" fill="' + TXT + '" font-family="Poppins,sans-serif" font-weight="600" font-size="' + (15 * fs) + '" transform="rotate(-90 ' + (hx - 8) + ' ' + (yb - H / 2) + ')">' + mm(m.height) + '\u00a0m</text>';
    if (!compact) g += '<text x="' + x0 + '" y="' + (yb - H - 16) + '" fill="rgba(238,240,230,.55)" font-family="Figtree,sans-serif" font-size="13" letter-spacing="1.5">STIRNSEITE</text>';
    g += '<text x="' + x1 + '" y="' + (yb - H - 16) + '" fill="rgba(238,240,230,.55)" font-family="Figtree,sans-serif" font-size="' + (13 * fs) + '" letter-spacing="1.5">SEITENANSICHT · ' + n + ' FELDER</text>';
    svgEl.setAttribute('viewBox', '0 ' + vy + ' ' + VW + ' ' + vh);
    $('#cfSvg').innerHTML = g;
  }
  var rsT; window.addEventListener('resize', function () { clearTimeout(rsT); rsT = setTimeout(function () { drawCfg(cfgModel(), cfg.len); }, 150); });
  $('#cfWidth').addEventListener('click', function (e) { var b = e.target.closest('[data-w]'); if (!b) return; cfg.w = +b.dataset.w; renderCfg(); });
  $('#cfModel').addEventListener('click', function (e) { var b = e.target.closest('[data-m]'); if (!b) return; cfg.model = b.dataset.m; renderCfg(); });
  $('#cfLen').addEventListener('input', function () { cfg.len = cfgModel().variants[+this.value].len; renderCfg(); });
  $('#cfThick').addEventListener('click', function (e) { var b = e.target.closest('[data-t]'); if (!b || b.disabled) return; cfg.t = +b.dataset.t; renderCfg(); });
  $('#cfExtras').addEventListener('change', function (e) { var c = e.target.closest('[data-ex]'); if (!c) return; cfg.ex[c.dataset.ex] = c.checked; renderCfg(); });
  $('#cfAdd').addEventListener('click', function () {
    var m = cfgModel(); cartAdd(modelItem(m, cfg.len, cfg.t), true);
    var n = 1;
    cfgExtras().forEach(function (x) { if (cfg.ex[x.key] && !x.dis) { cartAdd(accItem(x.acc, x.vi), true); n++; } });
    toast(m.name + ' ' + sizeLabel(m, cfg.len) + (n > 1 ? ' + ' + (n - 1) + ' Extra' + (n > 2 ? 's' : '') : ''));
  });
  $('#cfAsk').addEventListener('click', function (e) {
    var m = cfgModel(), lines = ['Konfiguration: ' + m.name + ' ' + sizeLabel(m, cfg.len) + ', Polycarbonat ' + cfg.t + '\u00a0mm'];
    cfgExtras().forEach(function (x) { if (cfg.ex[x.key] && !x.dis) lines.push('+ ' + x.label); });
    lines.push('Gesamtpreis laut Konfigurator: ' + $('#cfTotal').textContent + '. Bitte nennen Sie mir die Versandkosten für meine PLZ.');
    prefillMessage(lines.join('\n')); goTo('#kontakt', e); setTimeout(function () { $('#f-name').focus({ preventScroll: true }); }, 500);
  });

  /* ---------- accessories ---------- */
  var accCat = 'all';
  var accState = {};
  function accCard(a) {
    var vi = accState[a.id] || 0, v = a.variants[vi];
    var sel = a.variants.length > 1 ? '<div class="select"><select data-v aria-label="Ausführung ' + esc(a.name) + '">' + a.variants.map(function (x, k) { return '<option value="' + k + '"' + (k === vi ? ' selected' : '') + '>' + esc(x.label) + '</option>'; }).join('') + '</select></div>' : '';
    return '<article class="card acc" id="acc-' + a.id + '" data-acc="' + a.id + '"><div class="ph"><img src="' + a.img.src + '" alt="' + esc(a.name) + '" loading="lazy"><span class="badges"><span class="badge">' + esc(ACC_CATS[a.cat].split(' ')[0]) + '</span></span></div>' +
      '<div class="bd"><h3>' + esc(a.name) + '</h3><p>' + esc(a.desc) + '</p>' + sel +
      '<div class="price-row"><div><div class="price num">' + eur(v.price) + '</div><div class="price-note">inkl. MwSt., zzgl. Versand</div></div></div>' +
      '<div class="acts"><button class="btn btn-lime" type="button" data-add>' + icon('cart-plus') + 'In den Warenkorb</button></div></div></article>';
  }
  function renderAcc() {
    var tabs = [['all', 'Alle', D.acc.length]].concat(Object.keys(ACC_CATS).map(function (c) { return [c, ACC_CATS[c], D.acc.filter(function (a) { return a.cat === c; }).length]; }));
    $('#accTabs').innerHTML = tabs.map(function (t) { return '<button type="button" data-ac="' + t[0] + '" class="' + (accCat === t[0] ? 'on' : '') + '" aria-pressed="' + (accCat === t[0]) + '">' + esc(t[1]) + ' <span>' + t[2] + '</span></button>'; }).join('');
    $('#accGrid').innerHTML = D.acc.filter(function (a) { return accCat === 'all' || a.cat === accCat; }).map(accCard).join('');
  }
  $('#accTabs').addEventListener('click', function (e) { var b = e.target.closest('[data-ac]'); if (!b) return; accCat = b.dataset.ac; renderAcc(); });
  $('#accGrid').addEventListener('change', function (e) {
    if (!e.target.matches('[data-v]')) return; var card = e.target.closest('[data-acc]'), a = accById[card.dataset.acc];
    accState[a.id] = +e.target.value; card.outerHTML = accCard(a); var s = $('#acc-' + a.id + ' [data-v]'); if (s) s.focus();
  });
  $('#accGrid').addEventListener('click', function (e) {
    if (!e.target.closest('[data-add]')) return; var a = accById[e.target.closest('[data-acc]').dataset.acc]; cartAdd(accItem(a, accState[a.id] || 0));
  });

  /* ---------- search ---------- */
  var norm = function (s) { return String(s).toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss').replace(/×/g, 'x').replace(/,/g, '.').replace(/\s*x\s*/g, 'x').replace(/(\d)\s*m\b/g, '$1'); };
  var SYN = { lueftung: 'offner fenster luftung lufter automatik dachfenster', wasser: 'bewasserung wasser tropf giessen tomaten gurken', beete: 'hochbeet beet weg', regale: 'regal ablage anbinden tomaten', frueh: 'fruhbeet mini anzucht tunnel balkon' };
  var IDX = [];
  MODELS.forEach(function (m) {
    var sizes = m.variants.map(function (v) { return norm(m.width + 'x' + v.len); }).join(' ');
    IDX.push({ kind: 'model', id: m.id, title: m.name, sub: TYPES[m.type] + ' · ' + mm(m.width) + '\u00a0m breit', img: m.card.src, price: 'ab ' + eurS(minPrice(m)), hay: norm(m.name + ' gewachshaus ' + TYPES[m.type] + ' ' + m.width + ' breit ' + (m.foundation ? 'fundament ' : '') + (m.type === 'holz' ? 'holz ' : 'stahl polycarbonat ') + sizes) });
  });
  D.acc.forEach(function (a) { IDX.push({ kind: 'acc', id: a.id, title: a.name, sub: ACC_CATS[a.cat], img: a.img.src, price: 'ab ' + eurS(a.price), hay: norm(a.name + ' ' + a.desc + ' ' + ACC_CATS[a.cat] + ' zubehor ' + SYN[a.cat]) }); });
  IDX.push({ kind: 'set', id: 'set', title: D.set.name, sub: 'Gewächshaus mit Zubehör', img: D.set.img.src, price: eurS(D.set.price), hay: norm(D.set.name + ' set paket komplett ' + D.set.items.join(' ')) });
  var sugg = [], sIdx = -1, q = $('#q'), box = $('#suggest');
  function searchFor(text) {
    var n = norm(text).trim(); if (!n) return [];
    var size = n.match(/(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)/);
    var out = [];
    if (size) {
      var w = parseFloat(size[1]), L = parseFloat(size[2]);
      MODELS.forEach(function (m) { var v = findVar(m, L); if (v && Math.abs(m.width - w) < 0.06) out.push({ kind: 'model', id: m.id, len: L, title: m.name + ' ' + sizeLabel(m, L), sub: m2(v.area) + '\u00a0m² · ' + TYPES[m.type], img: m.card.src, price: eurS(v.t4 || v.t6) }); });
      if (out.length) return out.slice(0, 8);
    }
    var toks = n.split(/\s+/);
    IDX.forEach(function (it) { if (toks.every(function (t) { return it.hay.indexOf(t) >= 0; })) out.push(it); });
    return out.slice(0, 8);
  }
  function renderSuggest() {
    if (!q.value.trim()) { closeSuggest(); return; }
    sugg = searchFor(q.value); sIdx = sugg.length ? 0 : -1;
    box.innerHTML = sugg.length ? sugg.map(function (s, k) { return '<button type="button" role="option" data-s="' + k + '" class="' + (k === sIdx ? 'on' : '') + '"><img src="' + s.img + '" alt=""><span><b>' + esc(s.title) + '</b><small>' + esc(s.sub) + '</small></span><span class="sp num">' + esc(s.price) + '</span></button>'; }).join('')
      : '<div class="empty">Keine Treffer für „' + esc(q.value) + '“. Versuchen Sie es z.\u00a0B. mit „3\u00a0×\u00a06“, „TUBE“ oder „Fensteröffner“ oder rufen Sie uns an: <a href="tel:+37129555176">+371 29 555 176</a>.</div>';
    box.classList.add('open'); q.setAttribute('aria-expanded', 'true');
  }
  function closeSuggest() { box.classList.remove('open'); q.setAttribute('aria-expanded', 'false'); }
  function pick(s) {
    closeSuggest(); q.blur();
    if (s.kind === 'model') openModel(s.id, s.len || null);
    else if (s.kind === 'set') openSet();
    else { accCat = 'all'; renderAcc(); var el = $('#acc-' + s.id); goTo('#zubehoer'); if (el) { setTimeout(function () { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('flash'); setTimeout(function () { el.classList.remove('flash'); }, 1700); }, 350); } }
  }
  q.addEventListener('input', renderSuggest);
  q.addEventListener('focus', function () { if (q.value.trim()) renderSuggest(); });
  q.addEventListener('keydown', function (e) {
    if (!box.classList.contains('open') || !sugg.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sIdx = (sIdx + (e.key === 'ArrowDown' ? 1 : -1) + sugg.length) % sugg.length; $$('[data-s]', box).forEach(function (b, k) { b.classList.toggle('on', k === sIdx); }); }
  });
  box.addEventListener('mousedown', function (e) { e.preventDefault(); });
  box.addEventListener('click', function (e) { var b = e.target.closest('[data-s]'); if (b) pick(sugg[+b.dataset.s]); });
  $('#search').addEventListener('submit', function (e) { e.preventDefault(); renderSuggest(); if (sugg.length) pick(sugg[Math.max(0, sIdx)]); });
  document.addEventListener('click', function (e) { if (!e.target.closest('#search')) closeSuggest(); });

  /* ---------- order / contact ---------- */
  var orderMode = false;
  function renderOrderCart() {
    var el = $('#orderCart');
    if (!cart.length) { el.innerHTML = '<p class="empty">Ihr Warenkorb ist leer. Sie können uns trotzdem jederzeit eine Frage schicken.</p>'; return; }
    el.innerHTML = '<b style="font:600 15px var(--head)">Ihr Warenkorb</b>' + cart.map(function (c) { return '<div class="row"><span>' + c.qty + ' × ' + esc(c.name) + (c.sub ? ', ' + esc(c.sub) : '') + '</span><b class="num">' + eur(c.price * c.qty) + '</b></div>'; }).join('') +
      '<div class="row tot"><span>Zwischensumme inkl. MwSt.</span><b class="num">' + eur(cartTotal()) + '</b></div><div class="row"><span>Versand nach Deutschland</span><span>nach PLZ, vor der Zahlung</span></div>' +
      '<button class="link" type="button" data-open="cart">Warenkorb bearbeiten' + icon('arrow') + '</button>';
  }
  function setOrderMode(on) {
    orderMode = on;
    $('#orderEyebrow').textContent = on ? 'Kasse' : 'Kontakt';
    $('#orderTitle').textContent = on ? 'Bestellung abschließen' : 'Bestellen oder Frage stellen';
    $('#orderSubmit').innerHTML = icon('mail') + (on ? 'Bestellung per E-Mail senden' : 'Anfrage per E-Mail senden');
  }
  function prefillMessage(text) { var t = $('#f-msg'); t.value = text + (t.value && t.value.indexOf(text) < 0 ? '\n\n' + t.value : ''); }
  $('#checkout').addEventListener('click', function (e) {
    closeAll(); setOrderMode(true); renderOrderCart(); goTo('#kontakt', e);
    setTimeout(function () { $('#f-name').focus({ preventScroll: true }); }, 600);
  });
  $('#orderForm').addEventListener('input', function (e) { var f = e.target.closest('.fld'); if (f) f.classList.remove('err'); });
  $('#orderForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true, f = this;
    function chk(id, test) { var el = $('#' + id), good = test(el.value.trim()); el.closest('.fld').classList.toggle('err', !good); el.setAttribute('aria-invalid', !good); if (!good && ok) { el.focus(); ok = false; } }
    chk('f-name', function (v) { return v.length > 1; });
    chk('f-mail', function (v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v); });
    chk('f-plz', function (v) { return /\d{4,5}/.test(v); });
    if (!ok) return;
    var pay = (f.querySelector('input[name=pay]:checked') || {}).value;
    var lines = [];
    if (cart.length) {
      lines.push('Bestellung:');
      cart.forEach(function (c) { lines.push('- ' + c.qty + ' x ' + c.name + (c.sub ? ', ' + c.sub : '') + ': ' + eur(c.price * c.qty)); });
      lines.push('Zwischensumme inkl. MwSt.: ' + eur(cartTotal()), '');
    }
    lines.push('Name: ' + $('#f-name').value.trim(), 'E-Mail: ' + $('#f-mail').value.trim());
    if ($('#f-tel').value.trim()) lines.push('Telefon: ' + $('#f-tel').value.trim());
    lines.push('PLZ und Ort: ' + $('#f-plz').value.trim(), 'Zahlungsart: ' + pay);
    if ($('#f-msg').value.trim()) lines.push('', $('#f-msg').value.trim());
    var subj = (cart.length ? 'Bestellung' : 'Anfrage') + ' über den Baumera-Shop';
    var href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(lines.join('\n'));
    var okEl = $('#formOk');
    okEl.innerHTML = '<b>Fast geschafft.</b> Ihr E-Mail-Programm öffnet sich mit der vorbereiteten Nachricht. Bitte klicken Sie dort auf „Senden“. Falls sich nichts öffnet, schreiben Sie uns direkt an <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.';
    okEl.classList.add('on');
    window.location.href = href;
  });

  /* ---------- init ---------- */
  if (window.innerWidth < 760) q.placeholder = window.innerWidth < 380 ? 'Suchen, z. B. „3 × 6“' : 'Suchen, z. B. „3 × 6“ oder TUBE';
  renderModels(); renderAcc(); renderCfg(); renderCart(); setOrderMode(false);
  if (location.hash === '#kasse') { setOrderMode(true); }
})();
