/* BUVVide 2026: veikala loģika (bez ietvariem). Grozs localStorage, dati no data/*.json. */
(function () {
  'use strict';
  var d = document, w = window;
  // R16/J2: colours set in «Veikala iestatījumi» (admin preview) override the CSS variables
  try { var _th = JSON.parse(localStorage.getItem('bv_theme') || 'null'); if (_th) for (var _k in _th) if (/^--c-[a-z0-9-]+$/.test(_k)) d.documentElement.style.setProperty(_k, _th[_k]); } catch (e) {}
  var IMG = 'https://www.buvvide.lv/userfiles/Image/';
  var SHOP = { tel: '+37129123476', telH: '29 123 476', tel2: '+37127422801', tel2H: '27 422 801', wa: '37120865048', waH: '+371 20 865 048',
    mail: 'birojs@buvvide.lv' };
  var PAGE = d.body.getAttribute('data-page') || '';
  var P = {};           // product registry id -> product
  var TREE = null;

  /* ── i18n (LV default, RU UI strings) ── */
  var LANG = 'lv';
  try { LANG = localStorage.getItem('bv_lang') === 'ru' ? 'ru' : 'lv'; } catch (e) {}
  try {   // rt9E:lang В-03 a ?lang=ru link opens the Russian version (once the dictionaries are loaded only for RU visitors, reload once to get them)
    var _ql = /[?&]lang=(ru|lv)(?:[&#]|$)/.exec(location.search);
    if (_ql) { LANG = _ql[1]; localStorage.setItem('bv_lang', LANG); if (LANG === 'ru' && !w.BV_RU && sessionStorage.getItem('bv_rl') !== location.href) { sessionStorage.setItem('bv_rl', location.href); location.reload(); return; } }
  } catch (e) {}
  var RU = w.BV_RU || {};
  function t(s) { return LANG === 'ru' && RU[s] ? RU[s] : s; }
  function lcap(s) { s = String(s || '').trim(); if (s.length > 2 && s === s.toUpperCase()) s = s.charAt(0) + s.slice(1).toLowerCase(); return s.charAt(0).toUpperCase() + s.slice(1); }   // Q17
  function pv(v) {   // rt9E:pv В-03 common parameter values and model words in RU (ir → есть, metāls → металл, Kreisā → Левая)
    var m = LANG === 'ru' && w.BV_RUVAL; if (!m || v == null) return v;
    var one = function (x) { var r = m[String(x).trim().toLowerCase()]; return r ? (/^[A-ZĀČĒĢĪĶĻŅŠŪŽ]/.test(String(x).trim()) ? r.charAt(0).toUpperCase() + r.slice(1) : r) : null; };
    var s = String(v).trim(), r0 = one(s); if (r0) return r0;
    var parts = s.split(/(\s*[\/,;]\s*)/), ok = parts.length > 1;
    var out = parts.map(function (x, i) { if (i % 2) return x; var y = one(x); if (!y && x.trim()) ok = false; return y || x; });
    return ok ? out.join('') : v;
  }
  function vt(s) { return LANG !== 'ru' ? s : String(s).split(/(,\s*)/).map(function (x, i) { return i % 2 ? x : pv(x); }).join(''); }   // a model label part by part («Kreisā, 864x2075 mm»)
  function ucf(s) { s = String(s || ''); return /^[a-zāčēģīķļņšūž]/.test(s) ? s.charAt(0).toUpperCase() + s.slice(1) : s; }   // М-03 «ārdurvis …» → «Ārdurvis …»
  function pn(k) { var m = LANG === 'ru' && w.BV_RUPARAM; return m && (m[k] || m[String(k).trim()]) || k; }   // Q8: parameter name in RU
  /* F8: category names in Russian (word by word, data/ru_categories.json -> assets/ru_cats.js) */
  var RUCATS = w.BV_RUCATS || {};          // full category name -> RU (data/ru_category_names.json)
  var RUNAME = w.BV_RUNAMES || {};         // category id -> RU (same file, by id)
  function cn(s) {
    if (LANG !== 'ru' || !s) return s;
    if (RUCATS[s]) return RUCATS[s];
    return String(s);
  }
  function cnid(id) {
    if (LANG !== 'ru') return null;
    return RUNAME[String(id)] || null;
  }
  /* static server-rendered category names ([data-cn]) must follow the language switch too */
  function cnStatic(r) {   // R36: also for the empty-cart template inserted later
    if (LANG !== 'ru') return;
    $$('[data-cn]', r).forEach(function (e) {
      var ru = RUNAME[e.getAttribute('data-cn')];
      if (!ru) return;
      for (var i = 0; i < e.childNodes.length; i++) {
        var n = e.childNodes[i];
        if (n.nodeType === 3 && n.nodeValue.trim()) { n.nodeValue = n.nodeValue.replace(n.nodeValue.trim(), ru); break; }
      }
    });
  }
  /* F2: RU query words -> LV (the shop searches Latvian product names) */
  var RUQ = {
    'двери': 'durvis', 'дверь': 'durvis', 'дверной': 'durvis', 'дверей': 'durvis', 'дверные': 'durvis',
    'котел': 'katls', 'котёл': 'katls', 'котлы': 'katli', 'котельные': 'katli',
    'душ': 'duša', 'душевая': 'duša', 'душевые': 'dušas', 'душевой': 'duša',
    'плитка': 'flīzes', 'плитку': 'flīzes', 'плитки': 'flīzes', 'кафель': 'flīzes',
    'окна': 'logi', 'окно': 'logi', 'окон': 'logi', 'окна': 'logi',
    'ворота': 'vārti', 'ворот': 'vārti', 'воротами': 'vārti',
    'забор': 'žogs', 'заборы': 'žogi', 'забора': 'žogs', 'заборный': 'žogs',
    'ванна': 'vanna', 'ванны': 'vannas', 'ванной': 'vanna',
    'унитаз': 'pods', 'унитазы': 'podi', 'унитаза': 'pods',
    'раковина': 'izlietne', 'раковины': 'izlietnes', 'раковину': 'izlietne',
    'кран': 'jaucējkrāns', 'смеситель': 'jaucējkrāns', 'смесители': 'jaucējkrāni',
    'радиатор': 'radiators', 'радиаторы': 'radiatori',
    'печь': 'krāsns', 'печи': 'krāsnis', 'камин': 'kamīns', 'камины': 'kamīni',
    'обои': 'tapetes', 'обоев': 'tapetes',
    'краска': 'krāsa', 'краски': 'krāsas', 'краску': 'krāsu',
    'брусчатка': 'bruģis', 'брусчатку': 'bruģis',
    'лестница': 'kāpnes', 'лестницы': 'kāpnes',
    'люк': 'lūka', 'люки': 'lūkas',
    'труба': 'caurule', 'трубы': 'caurules',
    'насос': 'sūknis', 'насосы': 'sūkņi',
    'инструмент': 'instrumenti', 'инструменты': 'instrumenti',
    'пила': 'zāģis', 'пилы': 'zāģi',
    'гвоздь': 'nagla', 'гвозди': 'naglas',
    'кирпич': 'ķieģelis', 'кирпичи': 'ķieģeļi',
    'доска': 'dēlis', 'доски': 'dēļi',
    'гипсокартон': 'ģipškartons',
    'утеплитель': 'siltinājums', 'изоляция': 'izolācija',
    'сетка': 'siets', 'сетки': 'sieti',
    'штукатурка': 'apmetums', 'шпаклевка': 'špakteles',
    'гвозди': 'naglas', 'саморез': 'skrūve', 'саморезы': 'skrūves',
    'теплица': 'siltumnīca', 'теплицы': 'siltumnīcas',
    'скамейка': 'sols', 'скамейки': 'soli',
    'урна': 'urna', 'урны': 'urnas',
    'фонарь': 'laternas', 'фонари': 'laternas',
    'освещение': 'apgaismojums', 'светильник': 'lukturis',
    'вентиляция': 'ventilācija', 'трубы': 'caurules'
  };
  var TR = { 'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'z', 'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'c', 'ш': 's', 'щ': 's', 'ъ': '', 'ы': 'i', 'ь': '', 'э': 'e', 'ю': 'u', 'я': 'a' };
  function tr(s) {
    var out = '';
    for (var i = 0; i < s.length; i++) { var c = s.charAt(i); out += (TR[c] !== undefined ? TR[c] : c); }
    return out;
  }
  var RULAT = {};   // Russian typed in Latin letters (dveri, kotel) -> the same LV word
  Object.keys(RUQ).forEach(function (k) { var l = fold(tr(k)); if (l && l !== k) RULAT[l] = fold(RUQ[k]); });
  function expandGroups(q) {
    return fold(q).split(' ').filter(Boolean).map(function (tk) {
      var g = [tk], r = RUQ[tk] ? fold(RUQ[tk]) : (RULAT[tk] || ''), l = /[а-яё]/i.test(tk) ? fold(tr(tk)) : '';
      if (r && g.indexOf(r) < 0) g.push(r);
      if (l && l !== tk && g.indexOf(l) < 0) g.push(l);
      return g;
    });
  }

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
  // 06.11 red team R8/R21/R23/R24/R26/R29/R30 (agent B)
  // R30: the shop keeps a small copy of each catalogue photo next to the original («.thumb_<file>», ~200 px; its own
  // listings use them). Small slots take it; if it is missing the image falls back to the original (imgGuard, data-full).
  function thumb(p) {
    var u = img(p), m = /^(https:\/\/www\.buvvide\.lv\/userfiles\/Image\/db_(?:katalogs\/c\d+|modeli)\/)([^\/?#]+\.(?:jpe?g|png|gif|webp))$/i.exec(u);
    return m && m[2].indexOf('.thumb_') !== 0 ? m[1] + '.thumb_' + m[2] : u;
  }
  function timg(p, extra) {
    var s = thumb(p), f = img(p);
    return '<img src="' + esc(s) + '"' + (s !== f ? ' data-full="' + esc(f) + '"' : '') + ' alt=""' + (extra && extra.indexOf('loading') >= 0 ? '' : ' loading="lazy"') + ' decoding="async"' + (extra || '') + '>';
  }
  function qp(k) { return new URLSearchParams(location.search).get(k); }
  function fenc(s) { return String(s).replace(/%/g, '%25').replace(/;/g, '%3B').replace(/:/g, '%3A').replace(/,/g, '%2C'); }   // rt9 D М-12: f= separators only, URLSearchParams encodes the rest once
  function setMeta(title, desc, canonical) {
    if (title) d.title = title;
    var m = d.querySelector('meta[name=description]');
    if (m && desc) m.setAttribute('content', desc);
    var c = d.querySelector('link[rel=canonical]');
    if (c && canonical) c.setAttribute('href', 'https://vasylian.com/lapa/buvvide-new/' + canonical);
  }
  function snippet(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/[\s,;.]+$/, '') + '…' : s; }
  function icon(n, cls) { return '<svg class="ico ' + (cls || '') + '" aria-hidden="true"><use href="#i-' + n + '"/></svg>'; }
  function fold(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9Ѐ-ӿ]+/g, ' ').trim(); }
  function natCmp(a, b) {   // R7: leading numbers as numbers (6 < 6.5 < 9), then text
    var x = String(a), y = String(b), mx = /^\s*(\d+(?:[.,]\d+)?)/.exec(x), my = /^\s*(\d+(?:[.,]\d+)?)/.exec(y);
    if (mx && my) { var dn = parseFloat(mx[1].replace(',', '.')) - parseFloat(my[1].replace(',', '.')); if (dn) return dn; }
    return x.localeCompare(y, 'lv', { numeric: true, sensitivity: 'base' });
  }
  function trDom(r) { if (LANG !== 'ru') return; $$('[data-t]', r).forEach(function (e) { var k = e.getAttribute('data-t') || e.textContent.trim(); if (RU[k]) e.textContent = RU[k]; }); }   // R10
  var _cache = {}, DATA_V = '20261107a';   // bump when site/data changes: force-cache would keep old product files
  function getJSON(u) {
    if (!_cache[u]) _cache[u] = fetch(u + (u.indexOf('?') < 0 ? '?' : '&') + 'dv=' + DATA_V, { cache: 'force-cache' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
    return _cache[u];
  }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  var RUPL = { 'товар': ['товар', 'товара', 'товаров'], 'модель': ['модель', 'модели', 'моделей'], 'упаковка': ['упаковка', 'упаковки', 'упаковок'], 'категория': ['категория', 'категории', 'категорий'] };
  function plural(n, one, many, gen) {  // Latvian: 1 prece, 2 preces, 10 preču (genitive after 0 and 10-20, 30...)
    if (LANG === 'ru' && RUPL[one]) { var ra = n % 10, rb = n % 100, rf = RUPL[one]; return ra === 1 && rb !== 11 ? rf[0] : ra >= 2 && ra <= 4 && (rb < 12 || rb > 14) ? rf[1] : rf[2]; }   // red team Q7
    var m = n % 100, d = n % 10;
    if (d === 1 && m !== 11) return one;
    if (d === 0 || (m >= 11 && m <= 19)) return t(gen || 'preču');
    return many;
  }
  function prodURL(p) { return 'prece.html?id=' + p.id + '&c=' + p.c; }
  function catURL(id) { return 'kategorija.html?c=' + id; }
  function waLink(text) { return 'https://wa.me/' + SHOP.wa + '?text=' + encodeURIComponent(text); }
  function reg(list) { (list || []).forEach(function (p) { if (p && p.id) P[p.id] = p; }); return list; }
  // С-11 (rt9 F): one look for the category pictures: the item on a light background, a product photo of that category
  var CATIMG = {"829": "img/16174ae0f1f04d_500.webp", "505": "img/da4089d2f1885a_500.webp", "31": "img/f078489591022e_500.webp", "188": "img/338828c48cd9d7_500.webp", "100": "img/b95e2265a1ae6f_500.webp", "1020": "img/21cb916e426e89_500.webp", "131": "img/ce61f3e2bd19ad_500.webp", "23": "img/3276d084c1c02f_500.webp", "43": "img/fbc0cbc55a4188_500.webp", "461": "img/cd4a3d80eed47d_500.webp", "208": "img/29f4ada19a12de_500.webp"};
  function loadTree() { return TREE ? Promise.resolve(TREE) : getJSON('data/tree.json').then(function (j) { Object.keys(CATIMG).forEach(function (k) { if (j.cats[k] && String(j.cats[k].img).indexOf('img/caticon_') !== 0) j.cats[k].img = CATIMG[k]; });   /* 08.11 Gita: her own cIcon pictures win for the top categories */ TREE = j; return j; }); }

  /* ── cart ── */
  var Cart = {
    get: function () { return store('bv_cart') || []; },
    set: function (a) { store('bv_cart', a); Cart.badge(); },
    key: function (it) { return it.id + '|' + (it.v || ''); },
    add: function (p, q, v, vp) {
      var a = Cart.get(), k = p.id + '|' + (v || ''), f = null;
      a.forEach(function (it) { if (Cart.key(it) === k) f = it; });
      if (f) f.q = Math.min(999, f.q + q);
      else a.push({ id: p.id, c: p.c, n: p.n, pr: vp != null ? vp : p.pr, o: vp != null ? null : (p.o || null), img: p.img, v: v || '', q: q, f: p.f || [], u: (!v && p.u) ? { ar: p.u.ar, ppm: p.u.ppm, un: p.u.un } : null });
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
    el.innerHTML = (p.img ? timg(p.img, ' loading="eager" width="48" height="48"') : '') +
      '<div class="toast__t"><b>' + t('Ielikts grozā') + (q > 1 ? ' · ' + q + ' ' + t('gab.') : '') + '</b><span>' + esc(p.n) + (v ? ' · ' + esc(v) : '') + '</span></div>' +
      '<a class="btn btn--yellow" href="grozs.html">' + t('Uz grozu') + '</a>';
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-on'); }, 2600);   // R32
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
  // G1: the shop's model names carry an internal code and an English duplicate («m bal · Balts matēts/ White matte»);
  // show only the Latvian part, and put the door direction in front of the size when the code is «kreisā»/«labā».
  function vlabel(v) {
    var code = String((v && v.code) || '').trim().replace(/!+$/, ''), model = String((v && v.model) || '').trim();
    var m = (model.split('/')[0] || '').trim() || model;
    if (/^(kreis|lab)/i.test(code)) {
      var dir = code.charAt(0).toUpperCase() + code.slice(1).toLowerCase();
      return (m && m.toLowerCase() !== code.toLowerCase()) ? dir + ', ' + m : dir;
    }
    if (!m) return code;
    return m.charAt(0).toUpperCase() + m.slice(1);
  }
  // R29: one badge per card: the real discount (from 3 %), otherwise the strongest flag; a 1-2 % price cut is not called a sale
  var SALE_MIN = 3, FLAGORD = ['clear', 'akc', 'new', 'kit', 'top'];
  function saleRank(p) { var n = pct(p); return n >= SALE_MIN ? 1000 + n : ((p.f || []).some(function (f) { return f === 'akc' || f === 'clear'; }) ? 500 : 0) + n; }
  function badges(p) {
    var n = pct(p), fl = p.f || [], h = '';
    if (n >= SALE_MIN) h = '<span class="badge badge--sale">-' + n + '%</span>';
    else for (var i = 0; i < FLAGORD.length; i++) if (fl.indexOf(FLAGORD[i]) >= 0 && (FLAGORD[i] !== 'akc' || n >= 1)) { h = '<span class="badge ' + FLAG[FLAGORD[i]][0] + '">' + t(FLAG[FLAGORD[i]][1]) + '</span>'; break; }
    return h ? '<div class="badges">' + h + '</div>' : '';
  }
  function priceHTML(p, vat) {
    var sale = pct(p) >= 1, en = p.id ? enSlot(p.id) : '';
    if (p.pr == null) return '<div class="price"><b>' + t('Cena: zvaniet') + '</b>' + en + '</div>';   // shop sells it without a price, same wording as buvvide.lv
    return '<div class="price' + (sale ? ' price--sale' : '') + '"><b>' + money(p.pr) + '</b>' + (sale ? '<s>' + money(p.o) + '</s>' : '') + en +
      (vat ? '<span class="price__vat">' + t('ar PVN 21%') + '</span>' : '') + '</div>';
  }
  /* ── EPREL energy label (09.11, Gita): the class arrow right next to the price + «Datu lapa», in every view ──
     Colour = position of the class inside its range, the same map as the shop's lib/Energo.php (7 colours of the EU label:
     dg dark green … r red). The arrow opens the label (energyLabelLink), «Datu lapa» the product information sheet. */
  var EN = null, ENDEF = 'APP_G', ENMAP = {
    APPP_D: { 'A+++': 'dg', 'A++': 'mg', 'A+': 'lg', 'A': 'y', 'B': 'lo', 'C': 'do', 'D': 'r' },
    APP_G: { 'A++': 'dg', 'A+': 'mg', 'A': 'lg', 'B': 'y', 'C': 'lo', 'D': 'do', 'E': 'r', 'F': 'r', 'G': 'r' },
    A_G: { 'A': 'dg', 'B': 'mg', 'C': 'lg', 'D': 'y', 'E': 'lo', 'F': 'do', 'G': 'r' },
    AP_G: { 'A+': 'dg', 'A': 'mg', 'B': 'lg', 'C': 'y', 'D': 'lo', 'E': 'do', 'F': 'r', 'G': 'r' }
  }, ENSCALE = { APPP_D: 'A+++, D', APP_G: 'A++, G', A_G: 'A, G', AP_G: 'A+, G' };
  function enSlot(id, mini) { return '<span class="en"' + (mini ? ' data-mini' : '') + ' data-en="' + (+id) + '"></span>'; }
  function enHTML(id, mini) {
    var e = EN && EN[String(id)];
    if (!e) return '';
    var cls = e[0], rng = ENMAP[e[1]] ? e[1] : ENDEF, lab = /^https?:\/\//.test(e[2]) ? e[2] : '', sheet = /^https?:\/\//.test(e[3]) ? e[3] : '', h = '';
    if (cls) {
      var col = ENMAP[rng][cls] || 'r', tip = t('Energoefektivitātes klase') + ' ' + cls + ' (' + t('skala') + ' ' + ENSCALE[rng] + ')';
      h += lab && !mini
        ? '<a class="en__a en__a--' + col + '" href="' + esc(lab) + '" target="_blank" rel="noopener" title="' + esc(tip + '. ' + t('Atvērt energomarķējumu')) + '" aria-label="' + esc(tip + '. ' + t('Atvērt energomarķējumu')) + '"><b>' + esc(cls) + '</b></a>'
        : '<span class="en__a en__a--' + col + '" title="' + esc(tip) + '" role="img" aria-label="' + esc(tip) + '"><b>' + esc(cls) + '</b></span>';
    } else if (lab && !mini) h += '<a class="en__s" href="' + esc(lab) + '" target="_blank" rel="noopener">' + t('Energomarķējums') + '</a>';
    if (sheet && !mini) h += '<a class="en__s" href="' + esc(sheet) + '" target="_blank" rel="noopener" title="' + esc(t('Produkta informācijas lapa')) + '">' + t('Datu lapa') + '</a>';
    return h;
  }
  function enFill() {
    if (!EN) return;
    // prices rendered without a slot: cards built into the static pages, the product page's model / «no» price
    $$('.price').forEach(function (pr) {
      if (pr.hasAttribute('data-en0') || pr.querySelector('.en')) return;
      pr.setAttribute('data-en0', '1');
      var id = 0, box;
      if (PAGE === 'product' && pr.closest('#pprice, .stickybuy__p')) id = +qp('id');
      else if ((box = pr.closest('.card'))) {
        var a = box.querySelector('[data-add]'), l = box.querySelector('a[href*="prece.html?id="]');
        id = a ? +a.getAttribute('data-add') : l ? +((/[?&]id=(\d+)/.exec(l.getAttribute('href')) || [])[1] || 0) : 0;
      }
      if (!id || !EN[String(id)]) return;
      var s = d.createElement('span'), vat = pr.querySelector('.price__vat');
      s.className = 'en'; s.setAttribute('data-en', id);
      if (vat) pr.insertBefore(s, vat); else pr.appendChild(s);
    });
    $$('.en[data-en]').forEach(function (s) {
      var h = enHTML(s.getAttribute('data-en'), s.hasAttribute('data-mini'));
      s.removeAttribute('data-en');
      if (h) { s.innerHTML = h; s.classList.add('is-on'); } else if (s.parentNode) s.parentNode.removeChild(s);
    });
  }
  (function () {
    var busy = false;
    function later() { if (busy) return; busy = true; (w.requestAnimationFrame || setTimeout)(function () { busy = false; enFill(); }); }
    getJSON('data/energy.json').then(function (j) {
      EN = j || {};
      enFill();
      if (w.MutationObserver) new MutationObserver(later).observe(d.body, { childList: true, subtree: true });
    }).catch(function () {});
  })();
  // С-05 (rt9 F): the card line shows «name value» only. A value without its name is left out, «ir/jā» becomes the feature
  // («ar stiklu», «kārba komplektā»), «nav/nē» is not a selling point, a unit used as the name goes after the number («30 kW»)
  var YESF = {"stikls": "ar stiklu", "atzveltne": "ar atzveltni", "blīvējums": "ar blīvējumu", "termoizolācija": "ar termoizolāciju", "apgaismojums": "ar apgaismojumu", "taimeris": "ar taimeri", "uv aizsardzība": "ar UV aizsardzību", "ūdens tverne": "ar ūdens tverni", "mitruma sensors": "ar mitruma sensoru", "riteņi": "ar riteņiem", "maisiņu turētājs": "ar maisiņu turētāju", "reverss": "ar reversu", "ūdens aizsardzība": "ar ūdens aizsardzību", "mikroperforācija": "ar mikroperforāciju", "kārba komplektā": "kārba komplektā", "dībeļi komplektā": "dībeļi komplektā", "marga komplektā": "marga komplektā", "iespējama wpc apdare": "iespējama WPC apdare", "pašattīrošs pārklājums": "pašattīrošs pārklājums", "siltinātas": "siltinātas", "caurumots": "caurumots", "apsildami rokturi": "apsildāmi rokturi"};
  function ynv(v) { v = String(v).trim().toLowerCase(); return /^(ir|jā|ja|yes|да|есть)$/.test(v) ? 1 : /^(nav|nē|ne|no|нет)$/.test(v) ? 0 : -1; }
  function llow(s) { return s.length > 3 && s === s.toUpperCase() ? s.toLowerCase() : s.charAt(1) && s.charAt(1) === s.charAt(1).toLowerCase() ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
  function metaLine(p) {
    var bits = [], seen = {};
    if (p.s) bits.push(p.s);
    (p.prm || []).forEach(function (kv) {
      var k = String(kv[0] || '').trim(), v = String(kv[1] || '').replace(/,\s*$/, '').trim(), kl = k.toLowerCase(), yn = ynv(v);
      if (bits.length >= 3 || !k || !v || seen[kl] || k === 'Preces tips' || k === 'Pārdošanas vienība' || /^cena/i.test(k) || v.length > 24 || isUnitVal(v)) return;
      seen[kl] = 1;
      if (yn === 0) return;
      if (yn === 1) { if (YESF[kl]) bits.push(t(YESF[kl])); return; }
      var lab = String(pn(k)).trim();
      if (lab.length > 20 || /^\d/.test(lab)) return;
      bits.push(/^(k?w|v|mm|cm|kg|l)$/i.test(lab) ? v + ' ' + lab : llow(lab) + ' ' + v);
    });
    return bits.join(' · ');
  }
  function card(p) {
    P[p.id] = p;
    var notes = '';
    if (p.nt && p.nt.length) notes = '<p class="card__note' + (p.nt[0][1] === 'g' ? ' note-g' : p.nt[0][1] === 'a' ? ' note-a' : ' card__note--ship') + '">' + esc(t(p.nt[0][0])) + '</p>';
    var meta = metaLine(p);
    return '<article class="card">' +
      '<a class="card__media" href="' + prodURL(p) + '" tabindex="-1" aria-hidden="true">' + badges(p) +
      (p.img ? '<img loading="lazy" decoding="async" width="300" height="300" src="' + esc(img(p.img)) + '" alt="">' : '<svg class="card__ph" aria-hidden="true"><use href="#i-box"/></svg>') + '</a>' +
      '<div class="card__body"><div class="card__main"><a class="card__title" href="' + prodURL(p) + '">' + esc(p.n) + '</a>' +
      (meta ? '<p class="card__meta">' + esc(meta) + '</p>' : '') + notes + '</div>' +   // М-08 (rt9 F): the note under the name, prices line up
      '<div class="card__foot">' + priceHTML(p, false) + unitLine(p) +
      (p.pr == null ? '' : '<div class="card__add"><button class="btn btn--sm" type="button" data-add="' + p.id + '">' + icon(p.hv ? 'chev-r' : 'cart') + '<span>' + t(p.hv ? 'Izvēlēties' : 'Grozā') + '</span></button></div>') +
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
      var rowEl = b.closest('tr, article, .card'), qIn = rowEl && rowEl.querySelector('.qty input'), q = qIn ? Math.max(1, Math.min(999, Math.round(+qIn.value) || 1)) : 1;
      Cart.add(p, q);
      toast(p, q);
      b.classList.add('is-added');
      var s = b.querySelector('span'); if (s) s.textContent = t('Ielikts');
      setTimeout(function () { b.classList.remove('is-added'); if (s) s.textContent = t('Grozā'); }, 1800);
      return;
    }
    var cm = e.target.closest('[data-cmore]');   // «+ N vēl» in the mega menu / catalog page: show the hidden siblings
    if (cm) { var ul = cm.closest('ul'); $$('li[hidden]', ul).forEach(function (li) { li.hidden = false; }); cm.parentNode.remove(); return; }
    var l = e.target.closest('[data-lang]');
    if (l) {
      e.preventDefault();
      store('bv_lang_tmp', 1);
      try { localStorage.setItem('bv_lang', l.getAttribute('data-lang')); } catch (er) {}
      var nl0 = l.getAttribute('data-lang'), s0 = location.search.replace(/([?&])lang=(?:ru|lv)(?=&|$)&?/, '$1').replace(/[?&]$/, ''), u1 = location.pathname + (nl0 === 'ru' ? (s0 ? s0 + '&' : '?') + 'lang=ru' : s0) + location.hash;   // rt9E:lsw
      if (u1 === location.pathname + location.search + location.hash) location.reload(); else location.href = u1;
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
      last = y; hdrVis();
    }, { passive: true });
    // R21: the sticky list toolbar (phone) sits right under the part of the header that is showing
    var hv0 = '';
    function hdrVis() {
      var v = w.innerWidth >= 1024 ? '0px' : Math.max(0, hdr.offsetHeight - (hdr.classList.contains('is-up') ? 56 : 0)) + 'px';
      if (v !== hv0) { hv0 = v; d.documentElement.style.setProperty('--hdr-vis', v); }
    }
    w.addEventListener('resize', hdrVis); hdrVis();
  })();

  /* ── search suggest ── */
  var SIDX = null;
  function loadSearch() {
    if (SIDX) return Promise.resolve(SIDX);
    return getJSON('data/search.json?ix=2').then(function (a) {   // R24: col 8 = the product's parameter values («860/960mm|2050mm|MDF»)
      SIDX = a.map(function (r) { return { id: r[0], c: r[1], n: r[2], pr: r[3], o: r[4], img: r[5], f: r[6] || [], hv: r[7] || 0, k: fold(r[2] + ' ' + r[0]), pv: r[8] || '', pk: r[8] ? fold(r[8]) : '' }; });
      return SIDX;
    });
  }
  // R24: builders search by size («durvis 860», «saplāksnis 18»). A number matches whole numbers only (18 = 18mm, 18x2500; not 2118, not ID 61825)
  function at(s, tk) {
    var d0 = /^\d/.test(tk), d1 = /\d$/.test(tk), i = s.indexOf(tk);
    while (i >= 0) {
      if (!(d0 && /\d/.test(s.charAt(i - 1))) && !(d1 && /\d/.test(s.charAt(i + tk.length)))) return i;
      i = s.indexOf(tk, i + 1);
    }
    return -1;
  }
  function pmatch(p, q) {   // the parameter values that answered the query («860/960mm»), shown with the name
    if (!p.pv) return '';
    var toks = fold(q).split(' ').filter(function (x) { return x.length > 1 && at(p.k, x) < 0; });
    if (!toks.length) return '';
    return p.pv.split('|').filter(function (v) {
      var fv = fold(v);
      return toks.some(function (tk) { var i = at(fv, tk); return i >= 0 && (/^\d/.test(tk) || i === 0 || fv.charAt(i - 1) === ' '); });
    }).slice(0, 2).join(' · ');
  }
  function searchRank0(q, list, gx) {
    var fq = fold(q), groups = gx || expandGroups(q);
    if (!groups.length) return [];
    var out = [];
    list.forEach(function (p) {
      var k = p.k, score = 0, all = true;
      for (var i = 0; i < groups.length; i++) {
        var grp = groups[i], best = -1;
        // 0 = the word as typed, 1 = its Latvian translation; 2 = a rough Latin transliteration (last resort)
        for (var j = 0; j < grp.length; j++) {
          var tk = grp[j], dg = /^\d/.test(tk), pos = at(k, tk), sc = -1;
          if (pos < 0 && tk.length > 4 && !dg) {         // gal. -s / -i / -u
            var stem = tk.slice(0, -1), p2 = k.indexOf(stem);
            if (p2 >= 0) { pos = p2; tk = stem; }
          }
          if (pos >= 0) sc = dg ? 4 : (pos === 0 || k.charAt(pos - 1) === ' ') ? 3 : 1;
          else if (p.pk) {                          // R24: size / thickness / colour in the parameters; a number there ranks like one in the name
            var pp = at(p.pk, tk);
            if (pp < 0 && !dg && tk.length > 4) pp = p.pk.indexOf(tk.slice(0, -1));
            if (pp >= 0 && (dg || pp === 0 || p.pk.charAt(pp - 1) === ' ')) sc = dg ? 4 : 2;
          }
          if (sc < 0 && !dg && TREE) {               // the product's category name («Sapl., 2500x1220x18» sits in «Saplāksnis»)
            if (p.ck == null) p.ck = TREE.cats[p.c] ? ' ' + fold(TREE.cats[p.c].n) : '';
            var pc = p.ck.indexOf(' ' + tk); if (pc < 0 && tk.length > 4) pc = p.ck.indexOf(' ' + tk.slice(0, -1));
            if (pc >= 0) sc = 1;
          }
          if (sc >= 0) {
            if (grp.fz) { if (sc >= best) best = sc; continue; }   // В-05 (rt9 F): every fix of a typo counts the same
            if (j === 1) sc += 2;                 // «двери» → durvis is the reliable hit
            else if (j === 2) sc -= 1;            // transliteration only breaks ties
            if (j <= 1 && sc >= best) best = sc;
            else if (j === 2 && best < 0 && sc > best) best = sc;
          }
        }
        if (best < 0) { all = false; break; }
        score += best;
      }
      if (!all) return;
      if (k.indexOf(fq) === 0) score += 6; else if (k.indexOf(' ' + fq) >= 0 || k.indexOf(fq) >= 0) score += 3;
      if (String(p.id) === fq) score += 20;
      out.push([score, p]);
    });
    out.sort(function (a, b) { return b[0] - a[0] || (a[1].pr == null ? 1e9 : a[1].pr) - (b[1].pr == null ? 1e9 : b[1].pr); });
    return out.map(function (x) { return x[1]; });
  }
  // В-05 (rt9 F): typos. When nothing matches, a word of 4+ letters that the catalogue does not have is replaced by the closest
  // catalogue words (1 letter off, 2 for 7+ letters: «durvys» → durvis). The word list (names, parameters, categories) is built once.
  var VOC = null, FZ = null, LASTG = null;
  function vocab(list) {
    if (VOC && VOC.n === list.length && (VOC.t || !TREE)) return VOC;
    var m = {};
    function add(s) { String(s || '').split(' ').forEach(function (x) { if (x.length >= 3 && !/\d/.test(x)) m[x] = (m[x] || 0) + 1; }); }
    list.forEach(function (p) { add(p.k); add(p.pk); });
    if (TREE) Object.keys(TREE.cats).forEach(function (id) { add(fold(TREE.cats[id].n)); });
    var ws = Object.keys(m);
    VOC = { w: ws.map(function (x) { return [x, m[x]]; }), s: ' ' + ws.join(' ') + ' ', n: list.length, t: !!TREE };
    return VOC;
  }
  function lev(a, b, max) {   // edit distance with a cut-off; two swapped letters count as one
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var p2 = null, p1 = [], i, j;
    for (j = 0; j <= b.length; j++) p1[j] = j;
    for (i = 1; i <= a.length; i++) {
      var cur = [i], lo = i;
      for (j = 1; j <= b.length; j++) {
        var v = Math.min(p1[j] + 1, cur[j - 1] + 1, p1[j - 1] + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1));
        if (p2 && j > 1 && a.charAt(i - 1) === b.charAt(j - 2) && a.charAt(i - 2) === b.charAt(j - 1)) v = Math.min(v, p2[j - 2] + 1);
        cur[j] = v; if (v < lo) lo = v;
      }
      if (lo > max) return max + 1;
      p2 = p1; p1 = cur;
    }
    return p1[b.length];
  }
  function fuzzy(tk, voc) {   // the closest catalogue words (best distance only, the commonest first, max 4)
    var max = tk.length >= 7 ? 2 : 1, best = max + 1, out = [];
    voc.w.forEach(function (x) { var dd = lev(tk, x[0], max); if (dd < best) { best = dd; out = [x]; } else if (dd === best && dd <= max) out.push(x); });
    return best > max ? [] : out.sort(function (a, b) { return b[1] - a[1]; }).slice(0, 4).map(function (x) { return x[0]; });
  }
  function searchRank(q, list) {
    FZ = null; LASTG = { q: q, g: expandGroups(q) };
    var r = searchRank0(q, list, LASTG.g);
    if (r.length || !LASTG.g.length) return r;
    var voc = vocab(list), fx = [], fixed = 0;
    var gs = LASTG.g.map(function (g) {
      var tk = g[0];
      if (tk.length < 4 || /\d/.test(tk) || /[\u0400-\u04ff]/.test(tk) || voc.s.indexOf(tk) >= 0 || (tk.length > 4 && voc.s.indexOf(tk.slice(0, -1)) >= 0)) return g;
      var f = fuzzy(tk, voc); if (!f.length) return g;
      fixed++; fx.push([tk, f[0]]);
      var ng = f.slice(); ng.fz = 1; return ng;
    });
    if (!fixed) return r;
    r = searchRank0(q, list, gs);
    if (r.length) {   // the note shows the fixed query in the catalogue's own spelling («ventilācija»)
      var fq = fold(q);
      fx.forEach(function (x) {
        var o = x[1];
        r.slice(0, 30).some(function (p) { return String(p.n).split(/[^0-9A-Za-z\u00c0-\u024f\u0400-\u04ff]+/).some(function (wd) { if (fold(wd) === x[1]) { o = wd.toLowerCase(); return true; } }); });
        fq = fq.replace(x[0], o);
      });
      LASTG = { q: q, g: gs }; FZ = { q: q, fq: fq };
    }
    return r;
  }
  function hlx(q) {   // extra words to mark: the Latvian word for a Russian one, the typo fixes
    var g = LASTG && LASTG.q === q ? LASTG.g : expandGroups(q), o = [];
    g.forEach(function (x) { x.forEach(function (y, i) { if ((i || x.fz) && y.length > 1) o.push(y); }); });
    return o;
  }
  function catHits(q, T) {   // В-05: categories first in the hints: every word of the query (its fix, stem or LV word) in the name
    var g = (LASTG && LASTG.q === q ? LASTG.g : expandGroups(q)).filter(function (x) { return !/^\d/.test(x[0]); }), out = [];
    if (!g.length) return out;
    Object.keys(T.cats).forEach(function (id) {
      var c = T.cats[id], n2 = ' ' + fold(c.n), sc = 0;
      var ok = g.every(function (grp) {
        return grp.some(function (tk) {
          if (tk.length < 3) return false;
          if (n2.indexOf(' ' + tk) >= 0) { sc += 2; return true; }
          if (tk.length >= 4 && n2.indexOf(tk) >= 0) { sc += 1; return true; }
          if (tk.length > 4 && n2.indexOf(' ' + tk.slice(0, -1)) >= 0) { sc += 1; return true; }
          return false;
        });
      });
      if (ok && c.cnt) out.push([id, c, sc]);
    });
    return out.sort(function (a, b) { return b[2] - a[2] || (b[1].cnt || 0) - (a[1].cnt || 0); });
  }
  function foldKeep(s) {   // С-16: fold() letter by letter, so a mark falls on the same letters of the original name
    var o = '';
    for (var i = 0; i < s.length; i++) { var c = s.charAt(i).toLowerCase().normalize('NFD').charAt(0); o += /[a-z0-9\u0400-\u04ff]/.test(c) ? c : ' '; }
    return o;
  }
  function hl(name, q, extra) {   // С-16 (rt9 F): marks on the original name («EKCO.L2M-6 kW, 230/400V» too), also stems and typo fixes
    name = String(name == null ? '' : name);
    var toks = fold(q).split(' ').concat(extra || []).filter(function (x) { return x && x.length > 1; }), s = esc(name);
    if (!toks.length) return s;
    var f = foldKeep(name), marks = [];
    function mark(tk) { var i = f.indexOf(tk), hit = false; while (i >= 0) { hit = true; for (var j = i; j < i + tk.length; j++) marks[j] = true; i = f.indexOf(tk, i + 1); } return hit; }
    toks.forEach(function (tk) { if (!mark(tk) && tk.length > 4 && !/^\d/.test(tk)) mark(tk.slice(0, -1)); });
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
        var res = searchRank(q, r[0]).slice(0, 6), fq = fold(q), cats = catHits(q, r[1]).slice(0, 4), hx = hlx(q);   // В-05 (rt9 F)
        var h = '';
        if (cats.length) {
          h += '<div class="suggest__h">' + t('Kategorijas') + '</div>';
          cats.forEach(function (x) { h += '<a class="suggest__cat" href="' + catURL(x[0]) + '">' + icon('folder') + '<span>' + hl(x[1].n, q, hx) + '</span><small>' + (x[1].cnt || '') + '</small></a>'; });
        }
        if (res.length) {
          h += '<div class="suggest__h">' + t('Preces') + '</div>';
          res.forEach(function (p) {
            var mv = pmatch(p, q);
            h += '<a href="' + prodURL(p) + '"><span class="suggest__img">' + (p.img ? timg(p.img, ' width="38" height="38"') : '') + '</span>' +
              '<span class="suggest__name">' + hl(p.n, q, hx) + (mv ? '<small class="suggest__pv">' + esc(mv) + '</small>' : '') + '</span><span class="suggest__price">' + (p.pr == null ? t('Cena: zvaniet') : money(p.pr)) + enSlot(p.id, true) + '</span></a>';
          });
          h += '<a class="suggest__all" href="meklet.html?q=' + encodeURIComponent(q) + '">' + t('Visi rezultāti') + ' →</a>';
        }
        if (!h) h = '<div class="suggest__empty"><b>' + t('Nekas netika atrasts') + '</b><span>' + t('Pamēģiniet citu vārdu vai preces ID.') + '</span>' +
          '<a href="meklet.html?q=' + encodeURIComponent(q) + '">' + t('Meklēt visā katalogā') + ' →</a></div>';
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
      $('.drawer__title', drawer).textContent = cur ? cn(C[cur].n) : t('Katalogs');
      $('[data-dback]', drawer).style.visibility = cur ? 'visible' : 'hidden';
      if (cur) h += '<a class="mlist__all" href="' + catURL(cur) + '">' + t('Skatīt visu') + ': ' + esc(cn(C[cur].n)) + '</a>';
      else h += '<a class="mlist__all" href="akcijas.html">' + icon('percent') + '<span class="mlist__name">' + t('Akcijas un atlaides') + '</span></a>';
      (list || []).forEach(function (id) {
        var c = C[id]; if (!c) return;
        var kids = c.k && c.k.length;
        var inner = '<span class="mlist__img">' + (c.img ? timg(c.img, ' width="40" height="40"') : '') + '</span>' +
          '<span class="mlist__name">' + esc(cn(c.n)) + (c.cnt ? ' <span class="mlist__n">' + c.cnt + '</span>' : '') + '</span>' + (kids ? icon('chev-r') : '');
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
      var h = '<div class="mega__title"><h3>' + esc(cn(c.n)) + '</h3><a href="' + catURL(id) + '">' + t('Skatīt visu') + (c.cnt ? ' (' + c.cnt + ')' : '') + ' →</a></div><div class="mega__cols">';
      (c.k || []).forEach(function (sid) {
        var s = C[sid]; if (!s) return;
        h += '<div class="mega__grp"><a href="' + catURL(sid) + '">' + esc(cn(s.n)) + (s.cnt ? '<small>' + s.cnt + '</small>' : '') + '</a>';
        if (s.k && s.k.length) {
          h += '<ul>';
          // J3: long sub-lists collapse behind «+ N vēl» and open in place
          s.k.forEach(function (x, k) { var g = C[x]; if (g) h += '<li' + (k >= 6 ? ' hidden' : '') + '><a href="' + catURL(x) + '">' + esc(cn(g.n)) + '</a></li>'; });
          if (s.k.length > 6) h += '<li><button class="mega__more" type="button" data-cmore>+ ' + (s.k.length - 6) + ' ' + t('vēl') + '</button></li>';
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
            return '<a href="' + catURL(id) + '" data-mid="' + id + '">' + (c.img ? timg(c.img, ' width="40" height="40"') : '') + esc(cn(c.n)) + '</a>';
          }).join('');
          l.style.gridTemplateRows = 'repeat(' + Math.ceil(l.children.length / 2) + ', auto)';   // С-12 (rt9 F): Gita's order, both columns read top-down
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

  /* ═════════ LISTING (category, akcijas, search) ═════════
     J4 table / cards per category (remembered), J5 unit pricing (per piece/pack AND per m²),
     J7 filters always visible on desktop, J8 quick chips for the 1-2 key parameters. */
  var SORTS = [['rec', 'Ieteicamās'], ['asc', 'Lētākās vispirms'], ['desc', 'Dārgākās vispirms'], ['ppm', 'Cena par m²: lētākās'], ['disc', 'Lielākā atlaide'], ['az', 'Nosaukums A-Ž']];
  var OFFERS = [['sale', 'Ar atlaidi'], ['free', 'Bezmaksas piegāde'], ['akc', 'Akcijas prece'], ['ask', 'Atlaide pēc pieprasījuma'], ['clear', 'Izpārdošana']];
  var NOCOL = { 'Preces tips': 1, 'Pārdošanas vienība': 1, 'Ražotājs': 1, 'Garantija': 1, 'Garantijas termiņš': 1 };
  // the order in which a parameter wins a table column / quick-filter slot (the most «shoppable» first)
  var COLPRI = ['Biezums', 'Izmēri', 'Izmērs', 'Garums', 'Platums', 'Augstums', 'Diametrs', 'Svars', 'Jauda', 'Tilpums', 'Apjoms', 'Krāsa', 'Materiāls', 'Koksne', 'Klase', 'Modelis', 'Veids', 'VEIDS'];
  // R8: the parameter a buyer picks first wins a quick-chip row (opening side, width / size, thickness, use, colour, power…);
  // weights, pack counts and prices never do. A category can name its own (demo admin: «Veikala iestatījumi» → «Ātrie filtri»).
  var QPRI = [/virzien|vēršan|atvēr/, /kārbas plat|vērtnes pl|lūkas plat|^platums$/, /^biezums$/, /^izmēr/, /^diametrs$|ripas diam/, /pielietojum/, /^krāsa$/,
    /^jauda|^spriegums/, /^tilpums$|^litri$/, /^garums$|ruļa garums/, /^klase$|energomarķ/, /acs izmērs|stieples diam/,
    /^koksne$|^materiāls$|^apdare|^virsma$|^pārklājums$|^faktūra$/, /^veids$|^tips$/, /augst/];
  var QNO = /^cena|svars|pakā|paletē|rullī|iepak|kastē|garantij|ražotāj|kods|saņemš|patēriņ|žūšan|žāvēšan|kalpošan|temperat|^[a-z]$/;
  var QCAT = { c7: ['Kārbas platums', 'Ieteicamais pielietojums'], c310: ['Biezums'] };
  function qrank(k) {
    var s = String(k).toLowerCase().trim();
    if (QNO.test(s)) return 99;
    for (var i = 0; i < QPRI.length; i++) if (QPRI[i].test(s)) return i;
    return 50;
  }
  var UNITRE = /([\d.,]+)\s*m[2²](?:\b|\s|\().*?([\d.,]+)\s*€\s*\/\s*m[2²]/i;    // «3.125m2 (12.78 €/m2)»
  var AREARE = /^\s*([\d.,]+)\s*m[2²]\s*$/i;                                      // «2.5 m2»
  function fnum(s) { return parseFloat(String(s).replace(',', '.')); }
  function m2(v) { return (Math.round(v * 1000) / 1000).toFixed(v * 1000 % 10 ? 3 : 2).replace('.', ',') + ' m²'; }
  function isUnitVal(v) { return UNITRE.test(v) || AREARE.test(v); }
  /* J5: unit pricing from the shop's own parameters: area per sold unit and the price per m² */
  function unitInfo(p) {
    if (p.u !== undefined) return p.u;
    var u = null, un = '';
    (p.prm || []).forEach(function (kv) {
      if (kv[0] === 'Pārdošanas vienība') { un = kv[1]; return; }
      if (u) return;
      var m = UNITRE.exec(kv[1]);
      if (m) { u = { ar: fnum(m[1]), ppm: fnum(m[2]), k: kv[0] }; return; }
      m = AREARE.exec(kv[1]);
      if (m && /laukum|platīb|pak/i.test(kv[0]) && p.pr) { u = { ar: fnum(m[1]), ppm: p.pr / fnum(m[1]), k: kv[0] }; }
    });
    if (u && (!(u.ar > 0) || !(u.ppm > 0))) u = null;
    if (u) u.un = un || (/pak/i.test(u.k) ? 'paka' : 'gab.');
    p.u = u;
    return u;
  }
  function unitLine(p) {   // «12,70 €/m² · 2 m² pakā»
    var u = unitInfo(p);
    if (!u) return '';
    return '<p class="unitline"><b>' + money(u.ppm) + '/m²</b> · ' + m2(u.ar) + ' ' + esc(unitIn(u.un)) + '</p>';
  }
  function unitAcc(un) {   // accusative: cena par loksni / paku / gabalu
    var s = String(un || '').trim().toLowerCase();
    if (/^pak/.test(s)) return t('paku'); if (/^loksn/.test(s)) return t('loksni'); if (/^rull/.test(s)) return t('rulli');
    if (/^iepak/.test(s)) return t('iepakojumu'); if (/^palet/.test(s)) return t('paleti'); if (!s || /^gab/.test(s)) return t('gabalu');
    return s;
  }
  function unitLab(un) {   // nominative singular of the sold unit
    var s = String(un || '').trim().toLowerCase();
    if (/^pak/.test(s)) return t('paka'); if (/^loksn/.test(s)) return t('loksne'); if (/^rull/.test(s)) return t('rullis');
    if (/^iepak/.test(s)) return t('iepakojums'); if (/^palet/.test(s)) return t('palete'); if (!s || /^gab/.test(s)) return t('gab.');
    return s;
  }
  function unitLabPl(un) {   // plural
    var s = String(un || '').trim().toLowerCase();
    if (/^pak/.test(s)) return t('pakas'); if (/^loksn/.test(s)) return t('loksnes'); if (/^rull/.test(s)) return t('ruļļi');
    if (/^iepak/.test(s)) return t('iepakojumi'); if (/^palet/.test(s)) return t('paletes'); if (!s || /^gab/.test(s)) return t('gab.');
    return s;
  }
  function unitIn(un) {   // locative of the sold unit: loksne → loksnē, paka → pakā, gab. → gab.
    var s = String(un || '').trim().toLowerCase();
    if (/^pak/.test(s)) return t('pakā');
    if (/^loksn/.test(s)) return t('loksnē');
    if (/^rull/.test(s)) return t('rullī');
    if (/^iepak/.test(s)) return t('iepakojumā');
    if (/^palet/.test(s)) return t('paletē');
    if (!s || /^gab/.test(s)) return t('vienībā');
    return s;
  }
  function qtyHTML(p, cls) {
    var u = unitInfo(p);
    return '<div class="qty' + (cls || '') + '"><button type="button" data-tq="-1" aria-label="' + t('Mazāk') + '">' + icon('minus') + '</button><input type="number" min="1" max="999" value="1" data-qid="' + p.id + '" aria-label="' + t('Daudzums') + '"><button type="button" data-tq="1" aria-label="' + t('Vairāk') + '">' + icon('plus') + '</button></div>' +
      (u ? '<span class="m2" data-m2="' + p.id + '">= ' + m2(u.ar) + '</span>' : '');
  }
  function analyze(items, mixed, key) {
    var n = items.length, stat = {};
    items.forEach(function (p) {
      unitInfo(p);
      (p.prm || []).forEach(function (kv) {
        if (!kv[1] || NOCOL[kv[0]] || isUnitVal(kv[1])) return;
        var st = stat[kv[0]] || (stat[kv[0]] = { n: 0, v: {}, num: 0 });
        st.n++; st.v[kv[1]] = (st.v[kv[1]] || 0) + 1;
        if (/^\s*[\d.,]+/.test(kv[1])) st.num++;
      });
    });
    function pri(k) { var i = COLPRI.indexOf(k); return i < 0 ? 99 : i; }
    var keys = Object.keys(stat).map(function (k) { var st = stat[k]; return { k: k, cov: st.n / n, d: Object.keys(st.v).length, num: st.num / st.n, vals: st.v }; });
    var unit = items.some(function (p) { return p.u; });
    // the table must fit next to the filter column at 1366 px: 3 parameter columns, 2 when the m² columns are shown
    var cols = keys.filter(function (x) { return x.cov >= 0.5 && x.d >= 2 && n >= 2; })
      .sort(function (a, b) { return pri(a.k) - pri(b.k) || b.cov - a.cov; }).slice(0, unit ? 2 : 3);
    // R8: buyer's order (qrank), not «numbers first»; a parameter where one value covers > 85 % of the items helps nobody
    var top1 = function (x) { var m = 0; for (var v in x.vals) m = Math.max(m, x.vals[v]); return m / (x.cov * n); };
    var quick = keys.filter(function (x) { return x.cov >= 0.6 && x.d >= 3 && x.d <= 40 && n >= 4 && qrank(x.k) < 90 && top1(x) <= 0.85; })
      .sort(function (a, b) { return qrank(a.k) - qrank(b.k) || (b.num >= 0.7 ? 1 : 0) - (a.num >= 0.7 ? 1 : 0) || b.cov - a.cov; }).slice(0, 2);
    var qset = (store('bv_quick') || {})[key] || QCAT[key];
    if (qset) quick = qset.map(function (k) { return keys.filter(function (x) { return nkey(x.k) === nkey(k) && x.d >= 2; })[0]; }).filter(Boolean);
    var table = !mixed && n >= 3 && (cols.length >= 1 || unit);
    return { cols: cols, quick: quick.map(function (x) { return x.k; }), unit: unit, table: table };
  }

  /* 06.11 Gita: shop descriptions (category / product type): inert parse, no scripts or handlers, images from the shop */
  function cleanDesc(h) {
    if (!h) return '';
    var tpl = d.createElement('template'); tpl.innerHTML = String(h);
    $$('script,style,iframe,object,embed,form,input,button,link,meta', tpl.content).forEach(function (x) { x.parentNode.removeChild(x); });
    $$('*', tpl.content).forEach(function (x) {
      Array.prototype.slice.call(x.attributes).forEach(function (at) {
        var n = at.name.toLowerCase();
        if (n.indexOf('on') === 0 || n === 'style' || n === 'class' || n === 'id' || n === 'width' || n === 'height' || n === 'align' || n === 'border') x.removeAttribute(at.name);
      });
      var u = x.getAttribute('src') || x.getAttribute('href'), an = x.hasAttribute('src') ? 'src' : 'href';
      if (u != null) {
        u = u.trim();
        if (/^(javascript|data|vbscript):/i.test(u)) x.removeAttribute(an);
        else if (!/^(https?:|mailto:|tel:|#)/i.test(u)) x.setAttribute(an, 'https://www.buvvide.lv/' + u.replace(/^\.?\//, ''));
        if (an === 'href' && /^https?:/i.test(x.getAttribute('href') || '')) { x.setAttribute('target', '_blank'); x.setAttribute('rel', 'noopener'); }
      }
      if (x.tagName === 'IMG') { x.setAttribute('loading', 'lazy'); x.setAttribute('alt', x.getAttribute('alt') || ''); }
    });
    var box = d.createElement('div'); box.appendChild(tpl.content);
    $$('p, div, span', box).forEach(function (x) { if (!x.textContent.replace(/\u00a0/g, ' ').trim() && !x.querySelector('img, iframe, video') && x.parentNode) x.parentNode.removeChild(x); });   // empty paragraphs from the shop editor
    var out = box.innerHTML.replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>').replace(/(<br\s*\/?>\s*)+$/i, '').trim();
    return box.textContent.trim() || /<img/i.test(out) ? out : '';
  }
  /* «Lasīt vairāk»: a long text shows its first lines; the button appears only when something is hidden */
  function clampInit(box) {
    $$('[data-clamp]', box).forEach(function (b) {
      var btn = b.nextElementSibling;
      function chk() { if (b.classList.contains('is-open')) return; var over = b.scrollHeight > b.clientHeight + 6; if (btn) btn.hidden = !over; b.classList.toggle('is-fade', over); }
      chk(); $$('img', b).forEach(function (im) { if (!im.complete) im.addEventListener('load', chk); });
    });
  }
  d.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-clampbtn]'); if (!b) return;
    var c = b.previousElementSibling, on = c.classList.toggle('is-open');
    c.classList.toggle('is-fade', !on); b.textContent = t(on ? 'Paslēpt' : 'Lasīt vairāk'); b.setAttribute('aria-expanded', on ? 'true' : 'false');
  });

  /* В-04/М-02 (rt9 F): one spelling per parameter name and value inside a list, so the chips, the filters, the table and the counts
     agree: «960/860mm» = «860/960mm» (the commoner spelling wins), «IZMĒRI» = «Izmēri» = «izmēri» = one filter group */
  function nkey(k) { return String(k || '').replace(/\s+/g, ' ').trim().toLowerCase(); }
  function vkey(v) {
    var s = String(v == null ? '' : v).replace(/,\s*$/, '').replace(/\s+/g, ' ').trim(), m = /^(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+(?:[.,]\d+)?)*)\s*([^\d\/][^\/]*)?$/.exec(s);
    if (m) return m[1].split('/').map(function (x) { return x.trim().replace(',', '.'); }).sort(function (a, b) { return fnum(a) - fnum(b); }).join('/') + (m[2] || '').trim().toLowerCase();
    return s.replace(/\s*\/\s*/g, '/').toLowerCase();
  }
  function normItems(items) {
    var kc = {}, KM = {}, vc = {}, VM = {};
    items.forEach(function (p) { (p.prm || []).forEach(function (kv) { var a = nkey(kv[0]), o = kc[a] || (kc[a] = {}); o[kv[0]] = (o[kv[0]] || 0) + 1; }); });
    Object.keys(kc).forEach(function (a) {
      var o = kc[a], best = Object.keys(o).sort(function (x, y) { return o[y] - o[x] || (x.trim() === x ? -1 : 1); })[0].replace(/\s+/g, ' ').trim();
      KM[a] = a === 'preces tips' ? 'Preces tips' : a === 'pārdošanas vienība' ? 'Pārdošanas vienība' : best;
    });
    items.forEach(function (p) { (p.prm || []).forEach(function (kv) {
      kv[0] = KM[nkey(kv[0])] || kv[0];
      if (!kv[1]) return;
      var o = vc[kv[0]] || (vc[kv[0]] = {}), g = o[vkey(kv[1])] || (o[vkey(kv[1])] = {}), raw = String(kv[1]).replace(/,\s*$/, '').trim();
      g[raw] = (g[raw] || 0) + 1;
    }); });
    Object.keys(vc).forEach(function (k) {
      VM[k] = {};
      Object.keys(vc[k]).forEach(function (vk) {
        var g = vc[k][vk], best = Object.keys(g).sort(function (x, y) { return g[y] - g[x] || (vkey(x) === x.toLowerCase() ? -1 : 1); })[0];
        if (!/^\d/.test(best) && /\s\/|\/\s/.test(best)) best = best.replace(/\s*\/\s*/g, ' / ');   // «caurspīdīgs/ Matēts» → «caurspīdīgs / Matēts»
        VM[k][vk] = best;
      });
    });
    items.forEach(function (p) { (p.prm || []).forEach(function (kv) { if (kv[1] && VM[kv[0]]) kv[1] = VM[kv[0]][vkey(kv[1])] || kv[1]; }); });
    return { key: function (k) { return KM[nkey(k)] || k; }, val: function (k, v) { return (VM[k] && VM[k][vkey(v)]) || v; } };
  }
  function Listing(opts) {
    var NZ = normItems(opts.items);
    var A = analyze(opts.items, !!opts.mixed, opts.key);
    var key = opts.key || 'x';
    var S = { items: opts.items, sort: qp('sort') || 'rec', sel: {}, pmin: null, pmax: null, show: 24, facets: [],
      view: store('bv_view_' + key) || (store('bv_defview') || {})[key] || (A.table ? 'table' : 'grid') };   // R16/J4: admin default per category
    if (S.view === 'list') S.view = 'grid';
    S.show = S.view === 'table' ? 50 : 24;
    var root = opts.root;
    var QG = {}; S.qall = {}; S.fall = {};   // R8 chip groups and opened «vēl» rows, R26 opened filter groups
    var pageKey = 'bv_ls_' + location.pathname + location.search.replace(/&?(sort|f|pmin|pmax)=[^&]*/g, '');
    // restore filters from URL
    var fq = qp('f');
    if (fq) fq.split(';').forEach(function (part) { var kv = part.split(':'); if (kv.length === 2) S.sel[decodeURIComponent(kv[0])] = kv[1].split(',').map(decodeURIComponent); });
    Object.keys(S.sel).forEach(function (k) {   // В-04: an old link with «960/860mm» or «IZMĒRI» still selects the same products
      var ck = NZ.key(k), v = S.sel[k].map(function (x) { return NZ.val(ck, x); }); delete S.sel[k];
      S.sel[ck] = (S.sel[ck] || []).concat(v).filter(function (x, i, a) { return a.indexOf(x) === i; });
    });
    if (qp('pmin')) S.pmin = +qp('pmin');
    if (qp('pmax')) S.pmax = +qp('pmax');
    if (/%25/.test(location.search)) syncURL();   // rt9 D М-12: old double-encoded links are rewritten once
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
    function pcats(p) { return (p.cs || [p.c]).map(String); }   // 08.11: a product in Metrotile AND Piederumi counts in both
    function offerVals(p) {
      var a = [];
      if (pct(p) >= 1) a.push('sale');
      (p.f || []).forEach(function (f) { if ((f === 'akc' && pct(p) >= 1) || f === 'ask' || f === 'clear' || f === 'free') a.push(f); });
      return a;
    }
    (function buildFacets() {
      var n = S.items.length, keys = {};
      if (opts.catFacet) { var cfm = {}; Object.keys(opts.catFacet).forEach(function (k2) { cfm[k2] = cn(opts.catFacet[k2]); }); S.facets.push({ k: '__cat', label: t('Kategorija'), map: cfm }); }
      var types = {};
      S.items.forEach(function (p) { var v = pval(p, '__type'); if (v) types[v] = 1; });
      if (Object.keys(types).length > 1) { if (opts.typeNav && opts.typeList !== false) S.hasTypes = true; else S.facets.push({ k: '__type', label: t('Preces tips') }); }   // category: types are the navigation (Gita 06.11)
      S.items.forEach(function (p) { (p.prm || []).forEach(function (kv) { if (kv[0] !== 'Preces tips' && kv[0] !== 'Pārdošanas vienība' && !isUnitVal(kv[1])) keys[kv[0]] = (keys[kv[0]] || 0) + 1; }); });
      Object.keys(keys).filter(function (k) { return keys[k] >= Math.max(2, n * 0.25); })
        .map(function (k) {
          var vals = {};
          S.items.forEach(function (p) { var v = pval(p, k); if (v) vals[v] = 1; });
          return [k, keys[k], Object.keys(vals).length];
        })
        .filter(function (x) { return x[2] >= 2 && x[2] <= 60; })
        .sort(function (a, b) { return (A.quick.indexOf(b[0]) >= 0 ? 1 : 0) - (A.quick.indexOf(a[0]) >= 0 ? 1 : 0) || b[1] - a[1]; }).slice(0, 8)
        .forEach(function (x) { S.facets.push({ k: x[0], label: lcap(pn(x[0])) }); });
      var any = S.items.some(function (p) { return offerVals(p).length; });
      if (any) S.facets.unshift({ k: '__offer', label: t('Piedāvājumi') });
      // a quick-filter parameter must also be in the sidebar (same selection, two views)
      A.quick.forEach(function (k) { if (!S.facets.some(function (f) { return f.k === k; })) S.facets.push({ k: k, label: lcap(pn(k)) }); });
      var frank = function (f) { return A.quick.indexOf(f.k) >= 0 ? A.quick.indexOf(f.k) : f.k === '__cat' ? 10 : f.k === '__offer' ? 11 : 12; };   // Q18: the buyer's key parameters first
      S.facets = S.facets.map(function (f, i) { return [f, i]; }).sort(function (a, b) { return frank(a[0]) - frank(b[0]) || a[1] - b[1]; }).map(function (x) { return x[0]; });
    })();

    function match(p, skip) {
      if (skip !== '__price' && p.pr != null) {   // «Cena: zvaniet» items have no price to compare
        if (S.pmin != null && p.pr < S.pmin) return false;
        if (S.pmax != null && p.pr > S.pmax) return false;
      }
      for (var k in S.sel) {
        if (k === skip || !S.sel[k].length) continue;
        if (k === '__offer') { var ov = offerVals(p); if (!S.sel[k].some(function (x) { return ov.indexOf(x) >= 0; })) return false; continue; }
        if (k === '__cat') { var pc = pcats(p); if (!S.sel[k].some(function (x) { return pc.indexOf(x) >= 0; })) return false; continue; }
        if (S.sel[k].indexOf(pval(p, k)) < 0) return false;
      }
      return true;
    }
    function ppmOf(p) { var u = unitInfo(p); return u ? u.ppm : Infinity; }
    function sorted(list) {
      var a = list.slice(), np = function (v) { return v == null ? Infinity : v; };   // «Cena: zvaniet» sorts last on the cheap-first side
      if (S.sort === 'asc') a.sort(function (x, y) { return np(x.pr) - np(y.pr); });
      else if (S.sort === 'desc') a.sort(function (x, y) { return (y.pr == null ? -1 : y.pr) - (x.pr == null ? -1 : x.pr); });
      else if (S.sort === 'ppm') a.sort(function (x, y) { return ppmOf(x) - ppmOf(y) || np(x.pr) - np(y.pr); });
      else if (S.sort === 'disc') a.sort(function (x, y) { return pct(y) - pct(x) || np(x.pr) - np(y.pr); });
      else if (S.sort === 'az') a.sort(function (x, y) { return natCmp(x.n, y.n); });
      else if (S.sort.indexOf('col:') === 0) {
        var parts = S.sort.split(':'), k = decodeURIComponent(parts[1]), dir = parts[2] === 'desc' ? -1 : 1;
        a.sort(function (x, y) { var vx = pval(x, k), vy = pval(y, k); if (!vx && vy) return 1; if (vx && !vy) return -1; return dir * natCmp(vx, vy); });
      }
      return a;
    }
    function filtered() { return S.items.filter(function (p) { return match(p); }); }
    function selCount() { var n = 0; for (var k in S.sel) n += A.quick.indexOf(k) >= 0 ? S.sel[k].map(qkey).filter(function (g, i, a) { return a.indexOf(g) === i; }).length : S.sel[k].length; return n + (S.pmin != null || S.pmax != null ? 1 : 0); }

    function syncURL() {
      var u = new URLSearchParams(location.search);
      ['sort', 'f', 'pmin', 'pmax'].forEach(function (k) { u.delete(k); });
      if (S.sort !== 'rec') u.set('sort', S.sort);
      var f = Object.keys(S.sel).filter(function (k) { return S.sel[k].length; }).map(function (k) { return fenc(k) + ':' + S.sel[k].map(fenc).join(','); }).join(';');
      if (f) u.set('f', f);
      if (S.pmin != null) u.set('pmin', S.pmin);
      if (S.pmax != null) u.set('pmax', S.pmax);
      var s = u.toString();
      history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash);
    }
    function valLabel(f, v) {
      if (f.k === '__offer') { for (var i = 0; i < OFFERS.length; i++) if (OFFERS[i][0] === v) return t(OFFERS[i][1]); }
      if (f.k === '__cat') return f.map[v] || v;
      return String(v).replace(/,\s*$/, '');
    }
    function countsFor(k) {
      var counts = {};
      S.items.forEach(function (p) {
        if (!match(p, k)) return;
        if (k === '__offer' || k === '__cat') (k === '__cat' ? pcats(p) : offerVals(p)).forEach(function (v) { counts[v] = (counts[v] || 0) + 1; });
        else { var v = pval(p, k); if (v) counts[v] = (counts[v] || 0) + 1; }
      });
      return counts;
    }

    function typeScope() {   // types of the ticked categories (null = no category ticked)
      var cs = S.sel.__cat || [], m = {};
      if (!cs.length) return null;
      S.items.forEach(function (p) { if (pcats(p).some(function (c) { return cs.indexOf(c) >= 0; })) { var v = pval(p, '__type'); if (v) m[v] = 1; } });
      return m;
    }
    var open = store('bv_fopen') || {};
    function facetHTML() {
      var h = '';
      var prices = S.items.map(function (p) { return p.pr; }).filter(function (x) { return x > 0; });
      var lo = Math.floor(Math.min.apply(null, prices)), hi = Math.ceil(Math.max.apply(null, prices));
      S.facets.forEach(function (f) {
        var counts = countsFor(f.k);
        var all = {};
        S.items.forEach(function (p) {
          if (f.k === '__offer' || f.k === '__cat') (f.k === '__cat' ? pcats(p) : offerVals(p)).forEach(function (v) { all[v] = 1; });
          else { var v = pval(p, f.k); if (v) all[v] = 1; }
        });
        var vals = Object.keys(all), tsc = f.k === '__type' && typeScope();
        if (tsc) vals = vals.filter(function (v) { return tsc[v] || (S.sel.__type || []).indexOf(v) >= 0; });   // 08.11 Gita: Kategorija ticked -> only its types, like inside the category
        if (f.k === '__offer') vals.sort(function (a, b) { return OFFERS.map(function (o) { return o[0]; }).indexOf(a) - OFFERS.map(function (o) { return o[0]; }).indexOf(b); });
        else if (f.k === '__cat' || f.k === '__type') vals.sort(function (a, b) { return (counts[b] || 0) - (counts[a] || 0) || natCmp(valLabel(f, a), valLabel(f, b)); });
        else vals.sort(natCmp);
        var sel = S.sel[f.k] || [], isOpen = open[f.k] != null ? open[f.k] : sel.length > 0;   // Gita 31.10 + 08.11 «Parametrus labāk sakļaut»: groups load collapsed (headings visible), a group with a choice opens
        // R26: a long list shows 6 values (the chosen ones first) + «Rādīt visus», so every group heading stays in sight
        var many = vals.length > 8 && !S.fall[f.k], limit = 6;
        if (many && sel.length) vals = vals.filter(function (v) { return sel.indexOf(v) >= 0; }).concat(vals.filter(function (v) { return sel.indexOf(v) < 0; }));
        h += '<div class="fgroup' + (isOpen ? '' : ' is-closed') + (A.quick.indexOf(f.k) >= 0 ? ' fgroup--q' : '') + '" data-fk="' + esc(f.k) + '"><button class="fgroup__h" type="button" aria-expanded="' + (isOpen ? 'true' : 'false') + '">' + esc(f.label) + (sel.length ? ' (' + sel.length + ')' : '') + icon('chev-d') + '</button><div class="fgroup__b">';
        if (vals.length > 14) h += '<input class="fsearch" type="search" placeholder="' + t('Meklēt') + '…" data-fsearch aria-label="' + t('Meklēt') + ' ' + esc(f.label) + '">';
        vals.forEach(function (v, i) {
          var c = counts[v] || 0, on = sel.indexOf(v) >= 0;
          h += '<label class="fopt' + (!c && !on ? ' is-zero' : '') + '"' + (many && i >= limit && !on ? ' hidden data-extra' : '') + '><input type="checkbox" value="' + esc(v) + '"' + (on ? ' checked' : '') + '>' +
            '<span>' + esc(valLabel(f, v)) + '</span><small>' + c + '</small></label>';
        });
        if (many) h += '<button class="fmore" type="button" data-fmore>' + t('Rādīt visus') + ' (' + vals.length + ')</button>';
        h += '</div></div>';
      });
      var pOpen = open.__price != null ? open.__price : (S.pmin != null || S.pmax != null);
      if (prices.length && Math.max.apply(null, prices) - Math.min.apply(null, prices) >= 0.01) h += '<div class="fgroup' + (pOpen ? '' : ' is-closed') + '" data-fk="__price"><button class="fgroup__h" type="button" aria-expanded="' + (pOpen ? 'true' : 'false') + '">' + t('Cena') + ', €' + icon('chev-d') + '</button><div class="fgroup__b">' +
        '<div class="frange"><input type="number" inputmode="decimal" min="0" placeholder="' + lo + '" value="' + (S.pmin != null ? S.pmin : '') + '" data-pmin aria-label="' + t('Cena no') + '"><span>-</span>' +
        '<input type="number" inputmode="decimal" min="0" placeholder="' + hi + '" value="' + (S.pmax != null ? S.pmax : '') + '" data-pmax aria-label="' + t('Cena līdz') + '"></div></div></div>';
      return h;
    }
    function chipsHTML() {
      var h = '';
      S.facets.forEach(function (f) {
        var qk0 = A.quick.indexOf(f.k) >= 0, seen = {};   // R8: «860/960mm» and «960/860mm» make one pill, like the chip
        (S.sel[f.k] || []).forEach(function (v) { var g = qk0 ? qkey(v) : v; if (seen[g]) return; seen[g] = 1; h += '<button class="chip" type="button" data-unsel="' + esc(f.k) + '" data-v="' + esc(g) + '">' + (f.k === '__offer' || f.k === '__cat' || f.k === '__type' ? '' : esc(f.label) + ': ') + esc(qk0 && /^\d[\d.,\s]*\//.test(v) ? g : valLabel(f, v)) + icon('x') + '</button>'; });
      });
      if (S.pmin != null || S.pmax != null) h += '<button class="chip" type="button" data-unprice>' + (S.pmin != null ? money(S.pmin) : '0') + ', ' + (S.pmax != null ? money(S.pmax) : '…') + icon('x') + '</button>';
      if (h) h += '<button class="chip chip--clear" type="button" data-clearall>' + t('Notīrīt visu') + '</button>';
      return h;
    }
    /* J8: quick chips above the list for the category's 1-2 key parameters; same selection as the sidebar */
    function qkey(v) {   // R8: «960/860mm» is the same frame as «860/960mm»: one chip
      var s = String(v).replace(/,\s*$/, '').trim(), m = /^(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+(?:[.,]\d+)?)+)\s*([^\d\/][^\/]*)?$/.exec(s);
      return m ? m[1].split('/').map(function (x) { return x.trim(); }).sort(function (a, b) { return fnum(a) - fnum(b); }).join('/') + (m[2] || '') : s.toLowerCase();   // and «Sarkana» = «sarkana»
    }
    function quickHTML() {
      if (!A.quick.length) return '';
      return A.quick.map(function (k) {
        var counts = countsFor(k), grp = {}, tot = {}, lb = {}, sel = S.sel[k] || [];
        S.items.forEach(function (p) { var v = pval(p, k); if (!v) return; var g = qkey(v); grp[g] = grp[g] || []; if (!lb[g]) lb[g] = /^\d[\d.,\s]*\//.test(v) ? g : String(v).replace(/,\s*$/, '').trim(); if (grp[g].indexOf(v) < 0) grp[g].push(v); tot[g] = (tot[g] || 0) + 1; });
        QG[k] = grp;
        var gs = Object.keys(grp).sort(natCmp), many = gs.length > 12 && !S.qall[k], hid = 0;
        var top = gs.slice().sort(function (a, b) { return tot[b] - tot[a] || natCmp(a, b); }).slice(0, 8);   // max 8 chips (the commonest) + «vēl»
        var h = gs.map(function (g) {
          var vs = grp[g], c = 0, on = vs.some(function (v) { return sel.indexOf(v) >= 0; });   // pressed when any spelling of the size is chosen
          vs.forEach(function (v) { c += counts[v] || 0; });
          if (many && !on && top.indexOf(g) < 0) { hid++; return ''; }
          if (!c && !on && selCount()) return '';   // Q16
          return '<button class="qchip' + (!c && !on ? ' is-zero' : '') + '" type="button" aria-pressed="' + (on ? 'true' : 'false') + '" data-qk="' + esc(k) + '" data-qv="' + esc(g) + '">' + esc(lb[g]) + '<small>' + c + '</small></button>';
        }).join('');
        if (hid) h += '<button class="qchip qchip--more" type="button" data-qmore="' + esc(k) + '">+ ' + hid + ' ' + t('vēl') + '</button>';
        var lab = String(pn(k)).trim(); lab = lab === lab.toUpperCase() ? lab.charAt(0) + lab.slice(1).toLowerCase() : lab.charAt(0).toUpperCase() + lab.slice(1);   // «IZMĒRI», «izmēri» → «Izmēri»
        return '<div class="quick__row" role="group" aria-label="' + esc(lab) + '"><b>' + esc(lab) + ':</b>' + h + '</div>';
      }).join('');
    }
    /* J4: table: columns = the category's main parameters (+ unit pricing) */
    function colLabel(k) { return LANG === 'ru' ? pn(k) : k === 'VEIDS' ? 'Veids' : k; }
    function theadHTML() {
      function th(label, key, cls) {
        var dir = '';
        if (key && S.sort === key) dir = 'asc'; else if (key && S.sort === key + ':desc') dir = 'desc';
        return '<th' + (cls ? ' class="' + cls + '"' : '') + (key ? ' data-s="' + esc(key) + '" tabindex="0" role="button"' : '') + (dir ? ' data-dir="' + dir + '"' : '') + '>' + label + '</th>';
      }
      var h = '<tr><th></th>' + th(t('Nosaukums'), 'az');
      (S.tc || A.cols).forEach(function (c) { h += th(esc(colLabel(c.k)), 'col:' + encodeURIComponent(c.k), 'pc' + (c.num >= 0.7 ? ' num' : '')); });
      if (A.unit) h += th('<abbr title="' + t('m² vienā pārdošanas vienībā') + '">m²</abbr>', null, 'num ar') + th(t('Cena par m²'), 'ppm', 'num');
      h += th(t('Cena'), 'asc', 'num') + (S.tq === false ? '' : '<th>' + t('Daudzums') + '</th>') + '<th></th></tr>';
      return h;
    }
    function rowHTML(p) {
      P[p.id] = p;
      var u = unitInfo(p), sale = pct(p) >= 1;
      var pr = p.pr == null ? '<span class="pr pr--ask">' + t('Cena: zvaniet') + '</span>' : '<span class="pr' + (sale ? ' pr--sale' : '') + '">' + money(p.pr) + '</span>' + (sale ? '<s>' + money(p.o) + '</s>' : '');
      var ppm = u ? '<b>' + money(u.ppm) + '/m²</b>' : '';
      var pcs = (S.tc || A.cols).map(function (c) { return pval(p, c.k); });
      var meta = pcs.filter(Boolean).map(function (v) { return esc(String(v).replace(/,\s*$/, '')); }).join(' · ');
      var h = '<tr data-id="' + p.id + '"><td class="im"><a href="' + prodURL(p) + '" tabindex="-1" aria-hidden="true">' + (p.img ? timg(p.img, ' width="54" height="54"') : '<svg class="card__ph" aria-hidden="true"><use href="#i-box"/></svg>') + '</a></td>' +
        '<td class="nm"><a href="' + prodURL(p) + '">' + esc(p.n) + '</a><small>ID ' + p.id + (u ? ' · ' + t('cena par') + ' ' + esc(unitAcc(u.un)) : '') + (p.hv ? ' · ' + t('vairāki modeļi') : '') + '</small>' +
        (p.nt && p.nt.length ? '<small class="' + (p.nt[0][1] === 'g' ? 'note-g' : p.nt[0][1] === 'a' ? 'note-a' : '') + '">' + esc(t(p.nt[0][0])) + '</small>' : '') + '</td>';
      (S.tc || A.cols).forEach(function (c, i) { h += '<td class="pc' + (c.num >= 0.7 ? ' num' : '') + '">' + esc(String(pcs[i] || '').replace(/,\s*$/, '')) + '</td>'; });
      if (A.unit) h += '<td class="num ar">' + (u ? m2(u.ar) : '') + '</td><td class="num pm">' + ppm + '</td>';
      h += '<td class="num pcell">' + pr + enSlot(p.id) + '</td>' +
        '<td class="cell-prices">' + pr + enSlot(p.id) + '<span class="pm">' + (ppm ? ppm + (u ? ' · ' + m2(u.ar) + ' ' + esc(unitIn(u.un)) : '') : '') + (meta ? (ppm ? ' · ' : '') + meta : '') + '</span></td>';
      if (p.pr == null) h += (S.tq === false ? '' : '<td class="qtd"></td>') + '<td class="ad"><a class="btn btn--ghost btn--sm" href="' + prodURL(p) + '">' + t('Skatīt') + '</a></td>';
      else h += (S.tq === false ? '' : '<td class="qtd">' + (p.hv ? '' : qtyHTML(p, ' qty--sm')) + '</td>') + '<td class="ad"><button class="btn btn--sm add" type="button" data-add="' + p.id + '">' + icon(p.hv ? 'chev-r' : 'cart') + '<span>' + t(p.hv ? 'Izvēlēties' : 'Grozā') + '</span></button></td>';
      return h + '</tr>';
    }
    function render(keepFacets) {
      var list = sorted(filtered()), n = list.length;
      var grid = $('[data-grid]', root), tbl = $('[data-table]', root);
      var isT = S.view === 'table';
      root.classList.toggle('view-table', isT);
      grid.hidden = isT; if (tbl) tbl.hidden = !isT;
      var emptyH = S.items.length ? '<div class="empty"><h3>' + t('Ar šiem filtriem preču nav') + '</h3><p>' + t('Noņemiet kādu filtru vai notīriet visus.') + '</p><button class="btn" type="button" data-clearall>' + t('Notīrīt filtrus') + '</button></div>'
        : '<div class="empty"><h3>' + t('Šajā kategorijā preces vēl tiek pievienotas') + '</h3><p>' + t('Apskatiet citas kategorijas vai pajautājiet mums pa tālruni.') + '</p><a class="btn" href="katalogs.html">' + t('Uz katalogu') + '</a></div>';
      if (isT && tbl) {
        var vis0 = list.slice(0, S.show);   // С-08 (rt9 F): a column empty for every shown row is left out, the name gets the room
        S.tc = A.cols.filter(function (c) { return vis0.some(function (p) { return pval(p, c.k); }); });
        S.tq = !vis0.length || vis0.some(function (p) { return p.pr != null && !p.hv; });
        $('[data-thead]', tbl).innerHTML = theadHTML();
        var cs = 4 + S.tc.length + (S.tq ? 1 : 0) + (A.unit ? 2 : 0);
        $('[data-rows]', tbl).innerHTML = n ? list.slice(0, S.show).map(rowHTML).join('') : '<tr class="empty-row"><td colspan="' + cs + '">' + emptyH + '</td></tr>';
      } else {
        grid.innerHTML = n ? list.slice(0, S.show).map(card).join('') : '<div style="grid-column:1/-1">' + emptyH + '</div>';
      }
      var more = $('[data-more]', root), step = isT ? 50 : 24;
      if (n > S.show) {
        more.innerHTML = '<span class="more__n">' + t('Rādītas') + ' ' + Math.min(S.show, n) + ' ' + t('no') + ' ' + n + '</span><span class="more__bar"><i style="width:' + Math.round(S.show / n * 100) + '%"></i></span>' +
          '<button class="btn btn--ghost" type="button" data-showmore>' + t('Rādīt vēl') + ' ' + Math.min(step, n - S.show) + '</button>';
      } else more.innerHTML = n > 24 ? '<span class="more__n">' + t('Rādītas visas') + ' ' + n + ' ' + plural(n, t('prece'), t('preces')) + '</span>' : '';
      $$('[data-count]', root).forEach(function (e) { e.textContent = n + ' ' + plural(n, t('prece'), t('preces')); });
      var cn0 = $('#cat-n');   // R35: the line under H1 follows the filters
      if (cn0 && opts.typeNav) { if (cn0._t == null) cn0._t = cn0.textContent; cn0.textContent = selCount() && n !== S.items.length ? n + ' ' + t('no') + ' ' + S.items.length + ' ' + t('precēm') : cn0._t; }
      $$('[data-showbtn]').forEach(function (e) { e.textContent = t('Rādīt') + ' ' + n + ' ' + plural(n, t('preci'), t('preces')); });
      var sc = selCount();
      $$('[data-fcnt]').forEach(function (e) { e.textContent = sc ? sc : ''; });
      $('[data-chips]', root).innerHTML = chipsHTML();
      $$('[data-quick]').forEach(function (e) { var sl = $$('.quick__row', e).map(function (r) { return r.scrollLeft; }); e.innerHTML = quickHTML(); e.hidden = !A.quick.length; $$('.quick__row', e).forEach(function (r, i) { r.scrollLeft = sl[i] || 0; }); });   // R9: the pressed chip stays in view
      if (!keepFacets) $$('[data-facets]').forEach(function (e) { var st = e.scrollTop; e.innerHTML = facetHTML(); e.scrollTop = st; });
      else $$('[data-facets]').forEach(function (e) { refreshCounts(e); });
      var noF = !$('[data-facets] .fgroup', root); root.classList.toggle('no-filters', noF); root.classList.toggle('no-side', noF && !S.hasTypes);   // Q11
      typesRender(); sideFit(); root.classList.add('is-ready');   // R23: toolbar + filters appear with the products, not before
      $$('[data-view]', root).forEach(function (b) { var on = b.getAttribute('data-view') === S.view; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      try { sessionStorage.setItem(pageKey, JSON.stringify({ show: S.show })); } catch (e) {}
    }
    function refreshCounts(box) {
      // update counts without rebuilding inputs (keeps focus in price fields)
      S.facets.forEach(function (f) {
        var g = box.querySelector('.fgroup[data-fk="' + (w.CSS && CSS.escape ? CSS.escape(f.k) : f.k) + '"]');
        if (!g) return;
        var counts = countsFor(f.k);
        $$('.fopt', g).forEach(function (l) {
          var inp = $('input', l), c = counts[inp.value] || 0;
          $('small', l).textContent = c;
          l.classList.toggle('is-zero', !c && !inp.checked);
        });
      });
    }
    /* 06.11 Gita: «Preču tipi» like prof.lv: list of the category's types; the chosen one shows its title + description */
    function ptypesHTML() {
      var counts = countsFor('__type'), all = {}, sel = (S.sel.__type || [])[0] || '';
      S.items.forEach(function (p) { var v = pval(p, '__type'); if (v) all[v] = 1; });
      var tot = S.items.filter(function (p) { return match(p, '__type'); }).length, base = 'kategorija.html?c=' + (qp('c') || '');
      var h = '<p class="ptypes__h">' + t('Preču tipi') + '</p><ul class="ptypes__l"><li><a class="ptype' + (!sel ? ' is-on' : '') + '" href="' + base + '" data-ptype=""' + (!sel ? ' aria-current="true"' : '') + '><span>' + t('Visi') + '</span><small>' + tot + '</small></a></li>';
      var tsc = typeScope(), tkeys = Object.keys(all).filter(function (v) { return !tsc || tsc[v] || v === sel; }).sort(natCmp), tmany = tkeys.length > 6;   // Q3: long lists fold to 6 so the filters stay on the first screen
      tkeys.forEach(function (v, ti) {
        var on = sel === v, c = counts[v] || 0;
        h += '<li' + (tmany && !S.ptAll && ti >= 4 && !on ? ' class="ptypes__x"' : '') + '><a class="ptype' + (on ? ' is-on' : '') + (!c && !on ? ' is-zero' : '') + '" href="' + base + '&f=' + encodeURIComponent('__type:' + encodeURIComponent(v)) + '" data-ptype="' + esc(v) + '"' + (on ? ' aria-current="true"' : '') + '><span>' + esc((opts.tnames || {})[v] || v) + '</span><small>' + c + '</small></a></li>';
      });
      if (tmany) h += '<li class="ptypes__mo"><button class="ptypes__more" type="button" data-ptmore>' + (S.ptAll ? t('Rādīt mazāk') : t('Rādīt visus') + ' (' + tkeys.length + ')') + '</button></li>';
      return h + '</ul>';
    }
    function tdescHTML() {
      var a = S.sel.__type || []; if (a.length !== 1 || !S.hasTypes) return '';
      var html = cleanDesc((opts.tdesc || {})[a[0]] || '');
      return '<h2 class="tdesc__h">' + esc((opts.tnames || {})[a[0]] || a[0]) + '</h2>' + (html ? '<div class="tdesc__b rich is-clamp" data-clamp>' + html + '</div><button class="clampbtn" type="button" data-clampbtn aria-expanded="false" hidden>' + t('Lasīt vairāk') + '</button>' : '');
    }
    function typesRender() {
      if (!opts.typeNav) return;
      var pt = $('[data-ptypes]', root), td = $('[data-tdesc]', root), ci = $('#cat-intro');
      if (pt) {
        pt.hidden = !S.hasTypes;
        if (S.hasTypes) {
          var l0 = $('.ptypes__l', pt), sx = l0 ? l0.scrollLeft : 0;
          pt.innerHTML = ptypesHTML();
          var l1 = $('.ptypes__l', pt), on = $('.ptype.is-on', pt);
          if (l1) { l1.scrollLeft = sx; if (on && w.innerWidth < 1024 && (on.offsetLeft < l1.scrollLeft || on.offsetLeft + on.offsetWidth > l1.scrollLeft + l1.clientWidth)) l1.scrollLeft = on.offsetLeft - 16; }
        }
      }
      if (td) { var th = tdescHTML(); td.hidden = !th; if (th !== td._h) { td._h = th; td.innerHTML = th; clampInit(td); } }
      if (ci && ci.innerHTML) ci.hidden = !!S.hasTypes && !!(S.sel.__type || []).length;   // a chosen type replaces the category text
    }
    function sideFit() {   // R26: the filter column scrolls with the page; it is pinned only while all of it fits on the screen
      var sd = $('.side', root); if (!sd) return;
      sd.classList.toggle('is-pin', w.innerWidth >= 1024 && sd.offsetHeight + 134 <= w.innerHeight);
    }
    function changed(keepFacets) { S.show = S.view === 'table' ? 50 : 24; syncURL(); render(keepFacets); }

    // toolbar
    var sortSel = $('[data-sort]', root);
    sortSel.innerHTML = SORTS.filter(function (s) { return s[0] !== 'ppm' || A.unit; }).map(function (s) { return '<option value="' + s[0] + '"' + (s[0] === S.sort ? ' selected' : '') + '>' + t(s[1]) + '</option>'; }).join('');
    sortSel.addEventListener('change', function () { S.sort = sortSel.value; changed(true); });
    $$('[data-view]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        S.view = b.getAttribute('data-view'); store('bv_view_' + key, S.view);   // remembered per category (J4)
        S.show = S.view === 'table' ? 50 : 24;
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
        changed(k !== '__cat');   // a category tick rebuilds the groups (its types only)
      } else if (inp.hasAttribute('data-pmin') || inp.hasAttribute('data-pmax')) {
        var v2 = inp.value === '' ? null : Math.max(0, +inp.value);
        if (inp.hasAttribute('data-pmin')) S.pmin = v2; else S.pmax = v2;
        if (S.pmin != null && S.pmax != null && S.pmin > S.pmax) { var tmp = S.pmin; S.pmin = S.pmax; S.pmax = tmp; }
        changed(false);
      }
    });
    d.addEventListener('input', function (e) {
      var s = e.target;
      if (!s.hasAttribute) return;
      if (s.hasAttribute('data-fsearch')) {
        var q = fold(s.value), g = s.closest('.fgroup');
        $$('.fopt', g).forEach(function (l) { l.hidden = q ? fold($('span', l).textContent).indexOf(q) < 0 : l.hasAttribute('data-extra') && !g.classList.contains('is-all'); });
      } else if (s.hasAttribute('data-qid')) updM2(s);
    });
    d.addEventListener('change', function (e) {   // R28: 1…999 whole pieces
      var s = e.target; if (!s.hasAttribute || !s.hasAttribute('data-qid')) return;
      s.value = Math.max(1, Math.min(999, Math.round(+s.value) || 1)); updM2(s);
    });
    function updM2(inp) {
      var p = P[inp.getAttribute('data-qid')], u = p && unitInfo(p), q = Math.max(1, Math.min(999, Math.round(+inp.value) || 1));
      $$('[data-m2="' + inp.getAttribute('data-qid') + '"]').forEach(function (el) { el.textContent = u ? '= ' + m2(u.ar * q) : ''; });
    }
    d.addEventListener('click', function (e) {
      var x;
      if ((x = e.target.closest('.fgroup__h'))) {
        var g = x.closest('.fgroup'); g.classList.toggle('is-closed');
        var isO = !g.classList.contains('is-closed'); x.setAttribute('aria-expanded', isO ? 'true' : 'false');
        open[g.getAttribute('data-fk')] = isO; store('bv_fopen', open); sideFit(); return;
      }
      if ((x = e.target.closest('[data-fmore]'))) {
        var g2 = x.closest('.fgroup'); g2.classList.add('is-all'); S.fall[g2.getAttribute('data-fk')] = 1;
        $$('[data-extra]', g2).forEach(function (l) { l.hidden = false; }); x.remove(); sideFit(); return;
      }
      if (e.target.closest('[data-ptmore]')) { S.ptAll = !S.ptAll; typesRender(); return; }
      if ((x = e.target.closest('[data-ptype]'))) {   // product type = single choice; ctrl/middle click still opens a new tab
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
        e.preventDefault();
        var tv = x.getAttribute('data-ptype');
        if (tv) S.sel.__type = [tv]; else delete S.sel.__type;
        changed(false);
        var lt = root.getBoundingClientRect().top + w.scrollY - (w.innerWidth < 1024 ? 70 : 120);
        if (w.scrollY > lt) w.scrollTo({ top: lt, behavior: 'smooth' });
        return;
      }
      if ((x = e.target.closest('[data-qk]'))) {   // quick chip = toggle the same value in the sidebar selection
        var qk = x.getAttribute('data-qk'), qv = x.getAttribute('data-qv'), qa = S.sel[qk] || (S.sel[qk] = []), qr = (QG[qk] && QG[qk][qv]) || [qv];
        var qon = qr.some(function (v) { return qa.indexOf(v) >= 0; });   // R8: one chip can stand for several spellings of one size
        qr.forEach(function (v) { var qi = qa.indexOf(v); if (qon && qi >= 0) qa.splice(qi, 1); else if (!qon && qi < 0) qa.push(v); });
        changed(false); return;
      }
      if ((x = e.target.closest('[data-qmore]'))) { S.qall[x.getAttribute('data-qmore')] = 1; render(true); return; }
      if ((x = e.target.closest('[data-unsel]'))) {
        var k = x.getAttribute('data-unsel'), v = x.getAttribute('data-v'), qk1 = A.quick.indexOf(k) >= 0;
        S.sel[k] = (S.sel[k] || []).filter(function (x2) { return x2 !== v && !(qk1 && qkey(x2) === v); }); changed(false); return;
      }
      if (e.target.closest('[data-unprice]')) { S.pmin = S.pmax = null; changed(false); return; }
      if (e.target.closest('[data-clearall]')) { S.sel = {}; S.pmin = S.pmax = null; changed(false); return; }
      if (e.target.closest('[data-showmore]')) { S.show += S.view === 'table' ? 50 : 24; render(true); return; }
      if ((x = e.target.closest('[data-tq]'))) {   // ± in a table row / card
        var qi2 = x.parentNode.querySelector('input'); qi2.value = Math.max(1, Math.min(999, (+qi2.value || 1) + +x.getAttribute('data-tq'))); updM2(qi2); return;
      }
      if ((x = e.target.closest('th[data-s]'))) {   // sortable column header
        var sk = x.getAttribute('data-s');
        if (sk.indexOf('col:') === 0) S.sort = S.sort === sk ? sk + ':desc' : sk;
        else if (sk === 'asc') S.sort = S.sort === 'asc' ? 'desc' : 'asc';
        else S.sort = sk;
        var opt = SORTS.some(function (s) { return s[0] === S.sort; }) ? S.sort : 'rec';
        sortSel.value = opt;
        changed(true); return;
      }
    });
    d.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.matches && e.target.matches('th[data-s]')) e.target.click(); });
    render(false);
    w.addEventListener('resize', sideFit);
    // restore scroll after back navigation
    if (saved && saved.y && performance.getEntriesByType && (performance.getEntriesByType('navigation')[0] || {}).type === 'back_forward') {
      requestAnimationFrame(function () { w.scrollTo(0, saved.y); });
    }
    w.addEventListener('pagehide', function () { try { sessionStorage.setItem(pageKey, JSON.stringify({ show: S.show, y: w.scrollY })); } catch (e) {} });
    return S;
  }

  function catPage() {
    var id = +qp('c') || 0, root = $('#listing');
    // R23: the head, the sub-category row and the list are written in one go, when the products are here, so nothing jumps
    var pre = Promise.all([getJSON('data/c/' + id + '.json'), getJSON('data/cd/' + id + '.json')].map(function (x) { return x.catch(function () {}); }));
    loadTree().then(function (T) { return pre.then(function () { return T; }); }).then(function (T) {
      var c = T.cats[id];
      if (!c) { root.innerHTML = '<div class="empty"><h2>' + t('Kategorija nav atrasta') + '</h2><p>' + t('Iespējams, saite ir novecojusi.') + '</p><a class="btn" href="katalogs.html">' + t('Uz katalogu') + '</a></div>'; return; }
      setMeta(cn(c.n) + ' | BUVVide.lv', t('Piedāvājam') + ' ' + (c.cnt || '') + ' ' + plural(c.cnt || 0, t('preci'), t('preces')) + ': ' + cn(c.n) + '. ' + t('Piegāde visā Latvijā, apmaksa pēc rēķina.'), 'kategorija.html?c=' + id);
      // crumbs
      var chain = [], x = c;
      while (x) { chain.unshift(x); x = x.p ? T.cats[x.p] : null; }
      $('#crumbs').innerHTML = '<a href="index.html">' + t('Sākums') + '</a>' + icon('chev-r') + '<a href="katalogs.html">' + t('Katalogs') + '</a>' +
        chain.map(function (cc, i) { return icon('chev-r') + (i === chain.length - 1 ? '<span>' + esc(cn(cc.n)) + '</span>' : '<a href="' + catURL(cc.id) + '">' + esc(cn(cc.n)) + '</a>'); }).join('');
      $('#cat-h1').textContent = cn(c.n);
      // subcategories (children, or siblings for a leaf)
      var subs = c.k && c.k.length ? c.k : (c.p && T.cats[c.p] ? T.cats[c.p].k : []);
      var sib = !(c.k && c.k.length);   // R6: a leaf shows its siblings as one compact row of names, so products start on the first screen
      $('#subcats').classList.toggle('subcats--sib', sib);
      $('#subcats').innerHTML = (subs || []).map(function (sid) {
        var s = T.cats[sid]; if (!s) return '';
        return '<a class="subcat' + (sid === id ? ' is-on' : '') + '" href="' + catURL(sid) + '"><span class="subcat__img">' + (s.img ? timg(s.img) : '') + '</span>' +
          '<span class="subcat__name">' + esc(cn(s.n)) + (s.cnt ? '<small>' + s.cnt + ' ' + plural(s.cnt, t('prece'), t('preces')) + '</small>' : '') + '</span></a>';
      }).join('');
      (function () { var sc = $('#subcats'), on = sc && $('.subcat.is-on', sc); if (sib && on && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = Math.max(0, on.offsetLeft - sc.offsetLeft - 16); })();   // 08.11 Gita: phones keep the scroll row, the current chip is brought into view
      return Promise.all([getJSON('data/c/' + id + '.json'), getJSON('data/cd/' + id + '.json').catch(function () { return {}; })]).then(function (r3) {
        var j = r3[0], CD = r3[1] || {}, TD = CD.t || {}, TN = {};
        if (LANG === 'ru') { TD = Object.assign({}, TD, CD.tr || {}); TN = CD.tn || {}; }   // RU texts / type names from the shop's RU side   // data/cd/<id>.json = {d: category text, t: {type: text}} from the shop
        var ci = $('#cat-intro'), cdh = CD && cleanDesc(LANG === 'ru' && CD.dr ? CD.dr : CD.d);   // Gita: the category text on top, where people see it
        if (ci && cdh) { ci.innerHTML = '<div class="cintro__b rich is-clamp" data-clamp>' + cdh + '</div><button class="clampbtn" type="button" data-clampbtn aria-expanded="false" hidden>' + t('Lasīt vairāk') + '</button>'; ci.hidden = false; clampInit(ci); }
        reg(j.items);
        var tot = j.total || j.items.length;
        if (!j.items.length) { $('#cat-n').textContent = t('Preces šajā kategorijā vēl tiek pievienotas'); }
        else {
        $('#cat-n').textContent = tot + ' ' + plural(tot, t('prece'), t('preces'));
        if (j.items.length < tot) $('#cat-note').textContent = t('Šeit: pirmās') + ' ' + j.items.length + ' ' + t('preces no visām apakškategorijām. Lai redzētu visas, izvēlieties apakškategoriju augstāk.');
        }
        var catFacet = null;
        if (c.k && c.k.length) {
          catFacet = {};
          j.items.forEach(function (p) { (p.cs || [p.c]).forEach(function (c) { if (T.cats[c]) catFacet[c] = T.cats[c].n; }); });
          if (Object.keys(catFacet).length < 2) catFacet = null;
        }
        if (j.desc) $('#cat-desc').innerHTML = '<h2>' + esc(c.n) + '</h2><p>' + esc(j.desc) + '</p>';
        // J4: the default view (table or cards) is decided from the data here; in the shop the admin sets it per category
        Listing({ root: root, items: j.items, catFacet: catFacet, key: 'c' + id, mixed: !!(c.k && c.k.length), typeNav: true, tdesc: TD, tnames: TN, typeList: !(c.k && c.k.length) || Object.keys(TD).length > 0 });   // С-22 (rt9 F): the types list in final categories
      });
    }).catch(function () {
      root.innerHTML = '<div class="empty"><h2>' + t('Neizdevās ielādēt preces') + '</h2><p>' + t('Pārbaudiet savienojumu un mēģiniet vēlreiz.') + '</p><a class="btn" href="">' + t('Pārlādēt') + '</a></div>';
    });
  }

  function akcPage() {
    getJSON('data/c/akcijas.json').then(function (j) {
      // R29: the biggest real discounts first, then the shop's «Akcija» / «Izpārdošana» items; a 1-2 % cut does not lead the page
      j.items.sort(function (a, b) { return saleRank(b) - saleRank(a); });
      reg(j.items);
      $('#cat-n').textContent = j.items.length + ' ' + plural(j.items.length, t('prece'), t('preces'));
      loadTree().then(function (T) {
        var cf = {};
        j.items.forEach(function (p) { if (T.cats[p.c]) cf[p.c] = T.cats[p.c].n; });
        Listing({ root: $('#listing'), items: j.items, catFacet: Object.keys(cf).length > 1 ? cf : null, key: 'akcijas', mixed: true });
      });
    });
  }

  function searchPage() {
    var q = (qp('q') || '').trim(), root = $('#listing');
    $$('.search input').forEach(function (i) { i.value = q; });
    $('#cat-h1').textContent = q ? t('Meklēšana') + ': «' + q + '»' : t('Meklēšana');
    d.title = (q ? q + ' | ' : '') + t('Meklēšana') + ' | BUVVide.lv';
    var browse = !q && qp('f');
    if (browse) { $('#cat-h1').textContent = t('Visas preces'); d.title = t('Visas preces') + ' | BUVVide.lv'; }
    if (!q && !browse) { $('#cat-n').textContent = t('Ierakstiet preces nosaukumu, ražotāju vai ID.'); $('#search-empty').hidden = false; root.hidden = true; return; }
    Promise.all([loadSearch(), loadTree()]).then(function (r) {
      var res = (browse ? r[0] : searchRank(q, r[0]).slice(0, 600)).map(function (p) { return { id: p.id, c: p.c, n: p.n, pr: p.pr, o: p.o, img: p.img, f: p.f, hv: p.hv, s: browse ? '' : pmatch(p, q) }; });
      var T = r[1];
      if (!res.length) {
        $('#cat-n').textContent = t('Atrastas kategorijas');
        root.hidden = true;
        // categories whose name matches the query (a visitor typing «santehnika» wants the category)
        var cm = catHits(q, T).slice(0, 8).map(function (x) { return x[0]; });   // В-05 (rt9 F): stems and typo fixes too
        if (cm.length) {
          $('#cat-n').textContent = t('Atrastas kategorijas');
          $('#search-empty').hidden = true;   // matched categories are the answer, no «what are you looking for» block
          $('#subcats').innerHTML = cm.map(function (id) {
            var s = T.cats[id];
            return '<a class="subcat" href="' + catURL(id) + '"><span class="subcat__img">' + (s.img ? timg(s.img) : '') + '</span>' +
              '<span class="subcat__name">' + hl(s.n, q) + (s.cnt ? '<small>' + s.cnt + ' ' + plural(s.cnt, t('prece'), t('preces')) + '</small>' : '') + '</span></a>';
          }).join('');
        } else {
          // nothing matched at all: say so and offer the popular categories
          $('#cat-n').textContent = '';   // С-17 (rt9 F): «Nekas netika atrasts» is said once, in the box below
          var eh = $('#search-empty');
          if (eh) { eh.hidden = false; var h2 = $('h2', eh); if (h2) h2.textContent = t('Nekas netika atrasts'); }
        }
        return;
      }
      $('#cat-n').textContent = t(res.length % 10 === 1 && res.length % 100 !== 11 ? 'Atrasta' : 'Atrastas') + ' ' + res.length + ' ' + plural(res.length, t('prece'), t('preces'));
      if (!browse && FZ && FZ.q === q && $('#cat-note')) $('#cat-note').textContent = t('Rādām līdzīgus rezultātus:') + ' «' + FZ.fq + '»';   // В-05 (rt9 F)
      var cf = {}, cc = {};
      res.forEach(function (p) { if (T.cats[p.c]) { cf[p.c] = T.cats[p.c].n; cc[p.c] = (cc[p.c] || 0) + 1; } });
      var top = Object.keys(cc).sort(function (a, b) { return cc[b] - cc[a]; }).slice(0, 12);
      $('#subcats').innerHTML = top.map(function (id) {
        var s = T.cats[id];
        return '<a class="subcat" href="' + catURL(id) + '"><span class="subcat__img">' + (s.img ? timg(s.img) : '') + '</span><span class="subcat__name">' + esc(s.n) + '<small>' + cc[id] + ' ' + t(cc[id] % 10 === 1 && cc[id] % 100 !== 11 ? 'atrasta' : 'atrastas') + '</small></span></a>';
      }).join('');
      Listing({ root: root, items: res, catFacet: Object.keys(cf).length > 1 ? cf : null, key: 'search', mixed: true });
    });
  }

  /* ═════════ PRODUCT ═════════ */
  function productPage() {
    var id = +qp('id'), cid = +qp('c'), root = $('#product');
    Promise.all([
      getJSON('data/pd/' + id + '.json').catch(function () { return null; }),
      cid ? getJSON('data/c/' + cid + '.json').catch(function () { return null; }) : Promise.resolve(null),
      loadTree()
    ]).then(function (r) {   // R13: a link without &c= still gets its category list (same series, related rail)
      var c0 = !r[1] && r[0] && r[0].c;
      return c0 ? getJSON('data/c/' + c0 + '.json').catch(function () { return null; }).then(function (l) { r[1] = l; return r; }) : r;
    }).then(function (r) {
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

    /* R13: the same series in this category = items whose names start with the same words («IKO ARMOURSHIELD Plus …» in 7 colours).
       Two shared words count only when the second one is a model name (Demerx Sunny, VAIVA), not «Dušas paliktnis» or «CERSANIT Dušas». */
    function series(p, items) {
      var wd = function (n) { return String(n || '').trim().split(/\s+/); }, w0 = wd(p.n), f0 = w0.map(fold), cw = [], max = 0;
      var UPC = /[A-ZĀČĒĢĪĶĻŅŠŪŽ]/g, UP1 = /^[A-ZĀČĒĢĪĶĻŅŠŪŽ]/;
      (items || []).forEach(function (x) {
        if (!x || !x.n || String(x.id) === String(p.id)) return;
        var xw = wd(x.n), k = 0;
        while (k < f0.length && k < xw.length && f0[k] && f0[k] === fold(xw[k])) k++;
        if (k >= 2) { cw.push([k, x, xw]); if (k > max) max = k; }
      });
      function ok(L, g) {
        if (w0.slice(0, L).join(' ').length < 6) return false;
        if (items.length > 10 && g.length + 1 > items.length * 0.7) return false;   // a generic start shared by most of the category
        if (L >= 3) return true;
        var s = w0[1] || '';
        return /\d/.test(s) || (s.match(UPC) || []).length >= 2 || (UP1.test(s) && w0[0] !== w0[0].toUpperCase());
      }
      var pick = null, alt = null;
      for (var L = max; L >= 2 && !pick; L--) {
        var g = cw.filter(function (a) { return a[0] >= L; });
        if (!g.length || !ok(L, g)) continue;
        if (g.length >= 2) pick = [L, g]; else if (!alt) alt = [L, g];
      }
      pick = pick || alt;
      if (!pick) return null;
      var Lp = pick[0];
      function tail(ws, n) { var s = ws.slice(Lp).join(' ').replace(/^[,;:\-–—\s]+/, ''); return s ? s.charAt(0).toUpperCase() + s.slice(1) : n; }
      var out = pick[1].map(function (a) { return { x: a[1], t: tail(a[2], a[1].n) }; });
      out.push({ x: p, t: tail(w0, p.n), cur: true });
      serTrim(out, p);   // rt9E:ser С-04
      out.sort(function (a, b) { return natCmp(a.t, b.t); });
      return out;
    }
    /* rt9E:serfn С-04: «EKCO.L2M-6 kW, 230/400V, Kospel» / «EKCO.L2M 18 kW, 400V» → «6 kW, 230/400V» / «18 kW, 400V»:
       a common model code in front and the brand at the end are cut, so the label is whole and «-4 kW» never reads as minus four */
    function serTrim(out, p) {
      var ts = out.map(function (s) { return s.t; }), pre = ts[0] || '', SEP = /[\s,;:\/\-–—(]/;
      ts.forEach(function (s) { var i = 0; while (i < pre.length && i < s.length && pre.charAt(i).toLowerCase() === s.charAt(i).toLowerCase()) i++; pre = pre.slice(0, i); });
      if (pre && !ts.every(function (s) { return s.length === pre.length || SEP.test(s.charAt(pre.length)) || SEP.test(pre.charAt(pre.length - 1)); })) pre = pre.replace(/[^\s,;:\/\-–—(]*$/, '');
      if (!/\d|[A-ZĀČĒĢĪĶĻŅŠŪŽ]{2}/.test(pre) || pre.trim().length < 3) pre = '';   // only a model code is cut, never a shared colour word
      var br = String(p.brand || '').trim().toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var nt = ts.map(function (s) {
        var r = s.slice(pre.length).replace(/^[\s,;:\/\-–—.]+/, '');
        if (br.length > 2) r = r.replace(new RegExp('[,;\\s]+' + br + '$', 'i'), '');
        return r.trim();
      });
      if (nt.every(function (s) { return s; }) && nt.filter(function (s, i) { return nt.indexOf(s) === i; }).length === nt.length)
        out.forEach(function (s, i) { s.t = nt[i].charAt(0).toUpperCase() + nt[i].slice(1); });
    }
    function serHead(out) {
      var ts = out.map(function (s) { return s.t; }), cnt = function (re) { return ts.filter(function (s) { return re.test(s); }).length; };
      var COL = /bal[tt]|meln|pelēk|brūn|zaļ|sarkan|zil[aās]|dzelten|antrac|ozol|riekst|koks|koka|bērz|pried|veng|grafīt|sudrab|zelt|hrom|inox|matēt|spīdīg|bēš|krēm|ķirš|dižskābar|oš[ai]|osis|tīkkok|ral\s?\d|toni|krās|bronz|niķel|caurspīd|tonēt|wenge|white|black|grey|gray/i;
      var SIZE = /\d\s*(mm|cm|m|m²|m2|l)\b|\d\s*[x×]\s*\d/i, n = ts.length, nc = cnt(COL), ns = cnt(SIZE);
      if (cnt(/\d\s*kW\b/i) === n) return 'Šī prece ar citu jaudu';
      if (ns === n && !nc) return 'Šī prece citos izmēros';
      if (nc === n && !ns) return 'Šī prece citās krāsās';
      if (nc && ns && cnt(new RegExp(COL.source + '|' + SIZE.source, 'i')) === n) return 'Šī prece citās krāsās un izmēros';
      return 'Citi šīs sērijas modeļi';
    }
    /* rt9E С-03: facts written in the product name (kW, V, a size) are shown when the shop has no such parameter; (nepub) rows are the shop's hidden ones */
    function nameSpecs(p) {
      var prm = (p.prm || []).filter(function (kv) { return !/\(nepub\)/i.test(kv[0]); }), n = String(p.n || ''), m;
      var has = function (re) { return prm.some(function (kv) { return re.test(kv[0]); }); };
      if (!has(/jaud/i) && (m = /(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+(?:[.,]\d+)?)*)\s*kW\b/i.exec(n))) prm.push(['Jauda', m[1].replace(/\s+/g, '') + ' kW']);
      if (!has(/sprieg/i) && (m = /(?:^|[\s,(])(\d{2,3}(?:\s*\/\s*\d{2,3})?)\s*V\b/.exec(n))) prm.push(['Spriegums', m[1].replace(/\s+/g, '') + ' V']);
      if (!has(/izmēr|platums|garums|augstums|diametrs|dziļums/i) && (m = /(\d+(?:[.,]\d+)?\s*[x×]\s*\d+(?:[.,]\d+)?(?:\s*[x×]\s*\d+(?:[.,]\d+)?)?)\s*(mm|cm|m)\b/i.exec(n))) prm.push(['Izmēri', m[1].replace(/\s*[x×]\s*/g, ' × ') + ' ' + m[2]]);
      return prm;
    }
    var COUNTRY = /^(Latvija|Lietuva|Igaunija|Polija|Vācija|Ķīna|Itālija|Čehija|Somija|Zviedrija|Dānija|Norvēģija|Ukraina|Baltkrievija|Krievija|Turcija|Spānija|Francija|Austrija|Šveice|Nīderlande|Beļģija|Slovākija|Slovēnija|Ungārija|Rumānija|Bulgārija|Horvātija|Serbija|Portugāle|Grieķija|Lielbritānija|Īrija|Luksemburga|Japāna|Koreja|Taivāna|Indija|ASV|Kanāda|Izraēla|Vjetnama|Malaizija|Taizeme|Turcija)$/i;   // С-06
    /* R25: the 4-6 parameters that decide a building-material purchase (thickness, size, class …) */
    function keySpecs(prm) {
      var all = (prm || []).filter(function (kv) { return kv[1]; }), pri = function (k) { var i = COLPRI.indexOf(k); return i < 0 ? 99 : i; };
      var rows = all.map(function (kv, i) { return [kv, i]; }).filter(function (a) {
        var kv = a[0]; return kv[0] !== 'Pārdošanas vienība' && kv[0] !== 'Preces tips' && !isUnitVal(kv[1]) && String(kv[1]).length <= 60;
      }).sort(function (a, b) { return pri(a[0][0]) - pri(b[0][0]) || a[1] - b[1]; }).slice(0, 6).map(function (a) { return a[0]; });
      return { rows: rows, more: all.length > rows.length };
    }
    function plab(s) { s = String(pn(s) || '').trim(); if (s.length > 2 && s === s.toUpperCase()) s = s.charAt(0) + s.slice(1).toLowerCase(); return s.charAt(0).toUpperCase() + s.slice(1); }
    function draw(det, base, list, T) {
      base = base || {};   // a product can be missing from its category list (live site sells it without a price)
      var p = {
        id: id, c: cid || (base && base.c) || (det && det.c), n: (det && det.name) || base.n || '', s: (det && det.short) || (base && base.s) || '',
        pr: det ? det.price : base.pr, o: (det && det.old) || (base && base.o) || null,
        img: (det && det.images && det.images[0]) || (base && base.img) || '', f: (base && base.f) || (det && det.f) || [],
        prm: (det && det.params && det.params.length ? det.params : (base && base.prm) || []), brand: det && det.brand, code: det && det.code
      };
      P[id] = p;
      var c = T.cats[p.c];
      setMeta(p.n + ' | BUVVide.lv', snippet((p.brand ? p.brand + '. ' : '') + (p.s || '') + ' ' + (p.n || '') + '. ' + t('Cena') + ': ' + (p.pr != null ? money(p.pr) + ' ' + t('ar PVN 21%') : t('Cena: zvaniet')) + '. ' + t('Piegāde visā Latvijā.'), 300), 'prece.html?id=' + id);
      var chain = [], x = c;
      while (x) { chain.unshift(x); x = x.p ? T.cats[x.p] : null; }
      $('#crumbs').innerHTML = '<a href="index.html">' + t('Sākums') + '</a>' + chain.map(function (cc) { return icon('chev-r') + '<a href="' + catURL(cc.id) + '">' + esc(cn(cc.n)) + '</a>'; }).join('');
      var images = (det && det.images && det.images.length) ? det.images : (p.img ? [p.img] : []);
      var variants = ((det && det.variants) || []).slice();
      // models whose names start with a number (sizes «01 (55x78)») are listed in natural order so the cheapest, preselected one is at the top
      var isAdd = function (v) { return /^\s*\+/.test(vlabel(v)); };
      if (variants.length > 1 && (function (nv) { return nv.filter(function (v) { return /\d/.test(vlabel(v)); }).length * 2 > nv.length; })(variants.filter(function (v) { return !isAdd(v); })))   // Q10
        variants.sort(function (a, b) { return (isAdd(a) ? 1 : 0) - (isAdd(b) ? 1 : 0) || natCmp(vlabel(a), vlabel(b)); });
      var desc = (det && det.desc) || [];
      var sale = pct(p) >= 1, flags = p.f || [];
      var side = variants.some(function (v) { return /kreis|labā|labās/i.test(v.code + ' ' + v.model); });
      var vprices = variants.map(function (v) { return v.price; }).filter(Boolean);
      var vdiff = vprices.length && Math.min.apply(null, vprices) !== Math.max.apply(null, vprices);

      var prmX = nameSpecs(p), kp = keySpecs(prmX), ksH = '';   // rt9E:ks С-02/С-03 one parameter block next to the photos
      var allRows = prmX.filter(function (kv) { return kv[1]; }), keyRows = kp.rows, restRows = allRows.filter(function (kv) { return keyRows.indexOf(kv) < 0; });
      if (allRows.length) {
        var prow = function (kv, hid) { return '<tr' + (hid ? ' class="kspec__x" hidden' : '') + '><th>' + esc(plab(kv[0])) + '</th><td>' + esc(pv(kv[1])) + '</td></tr>'; };
        var kfold = keyRows.length >= 2 && restRows.length > 1;   // a single extra row is simply shown
        ksH = '<section class="kspec" id="specs"><h2 class="kspec__h">' + t('Tehniskie parametri') + '</h2><table class="spec kspec__t"><tbody>' +
          (kfold ? keyRows : allRows).map(function (kv) { return prow(kv); }).join('') + (kfold ? restRows.map(function (kv) { return prow(kv, true); }).join('') : '') + '</tbody></table>' +
          (kfold ? '<button type="button" class="kspec__all" data-allspec aria-expanded="false"><span>' + t('Visi parametri') + ' (' + allRows.length + ')</span>' + icon('chev-d') + '</button>' : '') + '</section>';
      }
      var h = '<div class="pp' + (ksH ? ' has-ks' : '') + '"><div class="gal">';
      h += '<div class="gal__main" id="galmain">' + (images.length ? images.map(function (u, i) {
        return '<button type="button" class="gal__slide" data-lb="' + i + '" aria-label="' + t('Palielināt attēlu') + ' ' + (i + 1) + '"><img src="' + esc(img(u)) + '" alt="' + esc(p.n) + (i ? ': ' + (i + 1) : '') + '"' + (i ? ' loading="lazy"' : '') + '></button>';
      }).join('') : '<div class="gal__slide"></div>') + '</div>';
      if (images.length > 1) {
        h += '<div class="gal__thumbs">' + images.map(function (u, i) { return '<button type="button" data-go="' + i + '"' + (i ? '' : ' class="is-on"') + ' aria-label="' + t('Attēls') + ' ' + (i + 1) + '">' + timg(u) + '</button>'; }).join('') + '</div>';
        h += '<span class="gal__count" id="galn">1 / ' + images.length + '</span><div class="gal__dots">' + images.map(function (u, i) { return '<i' + (i ? '' : ' class="is-on"') + '></i>'; }).join('') + '</div>';
      }
      h += '</div><div class="pp__info">';
      var bctry = COUNTRY.test(String(p.brand || '').trim());   // rt9E:brand С-06
      if (p.brand && !/saņemšan|pašizveš|noliktav/i.test(p.brand)) h += '<p class="pp__brand">' + t(bctry ? 'Ražošanas valsts' : 'Ražotājs') + ': ' + esc(bctry ? pv(p.brand) : String(p.brand).replace(/\(([^)]+)\)$/, function (m0, c0) { return '(' + pv(c0) + ')'; })) + '</p>';
      h += '<h1>' + esc(ucf(p.n)) + '</h1><div class="pp__ids"><span>ID: ' + id + '</span>' + (p.code ? '<span>' + t('Kods') + ': ' + esc(p.code) + '</span>' : '') + '</div>';
      // G5: when the product has models, a subtitle that only announces the choice («izvēle pēc stikla krāsas»,
      // «stiklu toņu izvēle preces saturā») says nothing new: the models block below shows it.
      var shortTxt = String(p.s || '').trim();
      if (variants.length > 1 && /izvēl|ton[iī]|krās/i.test(shortTxt)) shortTxt = '';
      if (shortTxt) h += '<p class="pp__short">' + esc(shortTxt) + '</p>';
      var bh = '';
      var big = pct(p) >= SALE_MIN;   // R29: no «-1%» badge; «Akcija» next to «-7%» would say the same twice
      if (big) bh += '<span class="badge badge--sale">-' + pct(p) + '%</span>';
      flags.forEach(function (f) { if (FLAG[f] && !((big || !pct(p)) && f === 'akc')) bh += '<span class="badge ' + FLAG[f][0] + '">' + t(FLAG[f][1]) + '</span>'; });
      if (bh) h += '<div class="pp__badges">' + bh + '</div>';
      // R13: other colours / sizes of the same series right under the title
      var ser = list ? series(p, list.items) : null, serH = '';   // Q4: shown under the buy box, not between the title and the price
      if (ser) {
        var spr = ser.map(function (s) { return s.x.pr; }), sdiff = spr.some(function (v) { return v !== spr[0]; }), smore = Math.max(0, ser.length - 12);
        var svis = ser.slice(0, 12); if (smore && !svis.some(function (s) { return s.cur; })) svis[11] = ser.filter(function (s) { return s.cur; })[0];
        serH = '<div class="series"><p class="series__h">' + t(serHead(ser)) + '</p><div class="series__l">' + svis.map(function (s) {
          var x = s.x, im = s.cur ? p.img : x.img;
          return (s.cur ? '<span class="series__i is-on" aria-current="true">' : '<a class="series__i" href="' + prodURL({ id: x.id, c: x.c || p.c }) + '" title="' + esc(x.n) + '">') +
            '<span class="series__img">' + (im ? '<img src="' + esc(img(im)) + '" alt="" loading="lazy" width="80" height="80">' : '') + '</span><span class="series__t">' + esc(vt(s.t)) + '</span>' +
            (sdiff && x.pr != null ? '<span class="series__p">' + money(x.pr) + enSlot(x.id, true) + '</span>' : '') + (s.cur ? '</span>' : '</a>');
        }).join('') + (smore ? '<a class="series__more" href="' + catURL(p.c) + '">+' + smore + '</a>' : '') + '</div></div>';
      }
      var pu = unitInfo(p);
      h += '<div class="buybox" id="buybox"><div id="pprice">' + priceHTML(p, true) + '</div>' + (pu ? '<p class="unitline unitline--pp">' + t('Cena par') + ' ' + esc(unitAcc(pu.un)) + ' · <b>' + money(pu.ppm) + '/m²</b> · ' + m2(pu.ar) + ' ' + esc(unitIn(pu.un)) + '</p>' : '');
      if (sale) h += '<span class="save">' + icon('percent') + t('Ietaupiet') + ' ' + money(p.o - p.pr) + '</span>';
      if (variants.length) {
        // F9: the shop lists the models at the bottom of its product page; here they sit right under the price as a
        // compact table (model, size, price, add) with the cheapest one preselected.
        var ci = 0, cbest = Infinity;
        variants.forEach(function (v, i) { if (v.price && v.price < cbest) { cbest = v.price; ci = i; } });
        var multi = variants.length > 1, vimgs = variants.some(function (v) { return v.img; });   // Gita 06.11: model pictures
        h += '<div class="models" id="izvele"><div class="models__h">' + icon('list') + (side ? t('Izvēlieties izmēru un virzienu') : t('Izvēlieties modeli')) +
          (multi ? ' <span class="models__n">' + variants.length + ' ' + plural(variants.length, t('modelis'), t('modeļi'), 'modeļu') + '</span>' : '') + '</div>' +
          '<div class="models__scroll' + (variants.length > 8 ? ' is-long' : '') + '"><table class="models__t' + (vimgs ? ' has-img' : '') + '"><thead><tr>' + (vimgs ? '<th class="models__imh"><span class="vh">' + t('Attēls') + '</span></th>' : '') + '<th>' + t('Modelis') + '</th>' + (vdiff ? '<th>' + t('Cena') + '</th>' : '') + '</tr></thead><tbody>' +
          variants.map(function (v, i) {
            var lab = vlabel(v);
            return '<tr class="models__r' + (i === ci ? ' is-on' : '') + (v.price ? '' : ' is-off') + '" data-var="' + i + '">' +
              (vimgs ? '<td class="models__im">' + (v.img ? '<button type="button" class="models__thumb" data-vimg="' + i + '" aria-label="' + t('Palielināt attēlu') + ': ' + esc(lab) + '"><img src="' + esc(img(v.th || v.img)) + '" alt="" loading="lazy" width="44" height="44"></button>' : '') + '</td>' : '') +
              '<td><label class="models__pick"><input type="radio" name="varmodel" value="' + i + '"' + (i === ci ? ' checked' : '') + (v.price ? '' : ' disabled') + '><span>' + esc(vt(lab)) + '</span></label></td>' +
              (vdiff ? '<td class="models__p">' + (v.price ? money(v.price) : '') + '</td>' : '') +
              '</tr>';
          }).join('') + '</tbody></table></div>' +
          (side ? '<p class="field__hint">' + t('Pasūtot jānorāda vēršanas virziens: kreisās vai labās durvis.') + '</p>' : '') + '</div>';
      }
      if (p.pr == null) {
        // the shop shows «Cena: zvaniet» for these: no cart button, a phone line instead
        h += '<p class="buybox__ask">' + icon('phone') + '<span>' + t('Šai precei cena nav norādīta. Zvaniet, un mēs nosauksim cenu un pieejamību.') + ' <a href="tel:' + SHOP.tel + '">' + SHOP.telH + '</a></span></p>';
      } else {
        var calcOn = !!(pu && !variants.length);   // R12: «Man vajag … m²» → whole packs + the sum
        if (calcOn) h += '<div class="calc"><label class="calc__row" for="needm2"><span class="calc__l">' + t('Man vajag') + '</span><span class="calc__in"><input id="needm2" type="text" inputmode="decimal" autocomplete="off" placeholder="' + t('piem. 37') + '"><span>m²</span></span></label><p class="calc__out" id="pm2" aria-live="polite"></p></div>';
        h += '<div class="buyrow"><div class="qty"><button type="button" data-q="-1" aria-label="' + t('Mazāk') + '">' + icon('minus') + '</button><input id="qty" type="number" min="1" max="999" value="1" aria-label="' + t('Daudzums') + '"><button type="button" data-q="1" aria-label="' + t('Vairāk') + '">' + icon('plus') + '</button></div>' +
          '<button class="btn" type="button" id="buy">' + icon('cart') + t('Ielikt grozā') + '</button></div>' + (pu && !calcOn ? '<p class="m2 m2--pp" id="pm2">1 ' + esc(unitLab(pu.un)) + ' = ' + m2(pu.ar) + '</p>' : '');
      }
      h += '<a class="btn btn--wa btn--block buybox__wa" id="pwa" target="_blank" rel="noopener" href="' + waLink(t('Labdien! Vēlos pasūtīt') + ': ' + p.n + ' (ID ' + id + ')') + '"><svg class="wa-ico" aria-hidden="true"><use href="#i-wa"/></svg>' + t('Pasūtīt WhatsApp') + '</a>';
      if (p.pr != null) h += '<p class="buybox__avail">' + icon('clock') + '<span>' + t('Pieejamību un piegādes termiņu apstiprināsim pēc pasūtījuma.') + '</span></p>';   // rt9E:avail В-08
      var nts = (det && det.nt) || (base && base.nt) || [];
      nts.forEach(function (x) { if (!/Atlaide pēc/.test(x[0])) h += '<p class="buybox__ask' + (x[1] === 'g' ? ' is-g' : '') + '">' + icon(x[1] === 'g' ? 'truck' : 'info') + '<span>' + esc(t(x[0])) + '</span></p>'; });
      if (flags.indexOf('ask') >= 0) h += '<p class="buybox__ask">' + icon('percent') + '<span>' + t('Šai precei iespējama atlaide.') + ' <a target="_blank" rel="noopener" href="' + waLink(t('Labdien! Vai precei') + ' ' + p.n + ' (ID ' + id + ') ' + t('iespējama atlaide?')) + '">' + t('Jautāt cenu') + '</a></span></p>';
      h += '</div>';   // buybox ends here: the info block goes BELOW the models and the buy button (Gita 06.11)
      h += serH;
      if (ksH) h += ksH.replace('class="kspec" id="specs"', 'class="kspec kspec--m" id="specs-m"');   // rt9E:ksm
      var perks = '<div class="perks" id="perks">' +
        '<div class="perk">' + icon('truck') + '<div><b>' + t('Piegāde') + '</b><span>' + (flags.indexOf('free') >= 0 ? t('Šai precei piegāde ir bez maksas. ') : flags.indexOf('ship') >= 0 ? t('Tikai ar maksas piegādi uz objektu vai adresi. ') : '') + t('Piegādājam visā Latvijā. Piegādes maksu aprēķinām pēc adreses un norādām rēķinā.') + '</span></div></div>' +
        (flags.indexOf('ship') >= 0 ? '' : '<div class="perk">' + icon('store') + '<div><b>' + t('Saņemšana') + '</b><span>' + t('Var saņemt arī noliktavā, tad par piegādi nav jāmaksā. Katrai precei var būt sava noliktava; par gatavību paziņosim pa tālruni vai e-pastu.') + '</span></div></div>') +
        '<div class="perk">' + icon('bank') + '<div><b>' + t('Apmaksa') + '</b><span>' + t('Apmaksa uzreiz nav jāveic: vispirms precizējam pieejamību pie piegādātāja, tad nosūtām avansa rēķinu e-pastā.') + ' ' + t('Neapmaksāti rēķini pēc 3 darba dienām tiek anulēti.') + ' ' + t('Cenas norādītas eiro ar PVN 21%. Uzņēmumiem: PVN 0% precēm, uz kurām attiecas reversais PVN.') + '</span></div></div>' +
        /* rt9E:noret no return perk on the product page (Gita 06.11) */ '<div class="perk">' + icon('shield') + '<div><b>' + t('Garantija') + '</b><span>' + t('Likumā noteiktā vai ražotāja garantija; termiņš dažādām precēm atšķiras.') + '</span></div></div>' +
        '<div class="perk">' + icon('calendar') + '<div><b>' + t('ESTO nomaksa') + '</b><span>' + t('Privātpersonām: līdz 60 mēnešiem; izvēlieties, noformējot pasūtījumu.') + '</span>' +
          '<a class="btn btn--ghost btn--sm perk__btn" href="https://esto.lv/lv/maksa-velak/" target="_blank" rel="noopener">' + t('Uzzināt par ESTO nomaksu') + '</a></div></div>' +
        '<div class="perk">' + icon('phone') + '<div><b>' + t('Jautājumi par preci?') + '</b><span><a href="tel:' + SHOP.tel + '">' + SHOP.telH + '</a> · ' + t('P-C 9:30-17:30, Pk 9:30-17:00') + '</span></div></div>' +
        '</div>';
      // accessories / kit parts («Piederumi» tab of the shop)
      // F4: only the product's own add-ons. The shop also lists «related» products there, which are alternatives,
      // not accessories (a 42,50 € ground anchor «with» five 129-217 € showers): an add-on never costs more than
      // the product itself. Products without real add-ons get no block at all.
      var acc = ((det && det.acc) || []).filter(function (x) {
        return x.pr && String(x.id) !== String(p.id) && String(x.c) !== String(p.c) &&
          (p.pr == null || x.pr <= Math.max(p.pr * 0.6, 5));
      }).slice(0, 8);
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
          (acc.length > 1 && p.pr != null ? '<div class="kit__sum"><span>' + t('Piederumi') + ': ' + acc.length + ' ' + t('pozīcijas') + '</span><span>' + money(ksum) + '</span></div>' +
            '<button class="btn btn--ghost btn--block" type="button" id="accall" style="margin-top:10px">' + icon('cart') + t('Ielikt grozā preci un piederumus') + ' (' + money(ksum + p.pr) + ')</button>' : '') + '</div>';
      }
      h += perks + '</div>' + (ksH ? ksH.replace('class="kspec" id="specs"', 'class="kspec kspec--d" id="specs"') : '') + '</div>';
      // details
      // rt9E:nospecacc С-02: no second «Tehniskie parametri» table (ID and code are under the title)
      var specRows = p.prm.filter(function (kv) { return kv[1]; }).map(function (kv) { return '<tr><th>' + esc(plab(kv[0])) + '</th><td>' + esc(kv[1]) + '</td></tr>'; }).join('');
      h += '<div class="pp__more">';
      var dHTML = det && det.dh ? cleanDesc(det.dh) : '';   // rt9E:desc Б-03 the shop's tables and document links, cleaned
      if (!dHTML && desc.length) { var dl0 = desc.slice(); while (dl0.length && /:\s*$/.test(dl0[dl0.length - 1])) dl0.pop(); dHTML = dl0.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join(''); }
      if (dHTML) dHTML = dHTML.replace(/<table\b/gi, '<div class="desc__tw"><table').replace(/<\/table>/gi, '</table></div>');   // wide tables scroll on phones
      if (dHTML) h += '<section class="pp__sec acc is-open"><button class="acc__h" type="button">' + t('Apraksts') + icon('chev-d') + '</button><div class="acc__b desc">' + (LANG === 'ru' ? '<p class="desc__lang">' + t('Apraksts pieejams latviešu valodā.') + '</p>' : '') + dHTML + '</div></section>';
      h += '</div>';   // rt9E:noacc delivery / payment are told once, next to the buy box
      root.innerHTML = h;
      bind(p, images, variants);
      // related + recently viewed
      // R13: the same series first, then the same product type, then the rest; a small category borrows from its sister categories
      var rel = list ? list.items.filter(function (x) { return x.id !== id; }) : [];
      var serI = ser ? ser.filter(function (s) { return !s.cur; }).map(function (s) { return s.x; }) : [];
      var sameType = rel.filter(function (x) { return serI.indexOf(x) < 0 && base && x.g && x.g === base.g; });
      rel = serI.concat(sameType, rel.filter(function (x) { return serI.indexOf(x) < 0 && sameType.indexOf(x) < 0; })).slice(0, 10);
      function showRel(a) { if (!a.length) return; $('#related').hidden = false; $('#related-rail').innerHTML = a.map(card).join(''); if (c) $('#related-more').href = catURL(c.id); }
      if (rel.length >= 4 || !c || !c.p || !T.cats[c.p]) showRel(rel);
      else {
        var sis = (T.cats[c.p].k || []).filter(function (k) { return String(k) !== String(c.id) && T.cats[k] && T.cats[k].cnt; }).slice(0, 3);
        Promise.all(sis.map(function (k) { return getJSON('data/c/' + k + '.json').catch(function () { return null; }); })).then(function (ls) {
          ls.forEach(function (l) { if (l && l.items) rel = rel.concat(l.items.filter(function (x) { return x.id !== id && x.pr != null; }).slice(0, 4)); });
          showRel(rel.slice(0, 10));
        });
      }
      var seen = (store('bv_seen') || []).filter(function (x) { return x.id !== id; });
      if (seen.length) { $('#seen').hidden = false; reg(seen); $('#seen-rail').innerHTML = seen.slice(0, 10).map(card).join(''); }
      seen.unshift({ id: id, c: p.c, n: p.n, pr: p.pr, o: p.o, img: p.img, f: p.f, hv: variants.length ? 1 : 0 });
      store('bv_seen', seen.slice(0, 12));
      // sticky buy (phone)
      var sb = $('#stickybuy');
      $('.stickybuy__name', sb).textContent = ucf(p.n);
      $('.stickybuy__p', sb).insertAdjacentHTML('beforeend', priceHTML(p, false));
      if (p.pr == null) { sb.hidden = true; }   // no cart button on this page, so no sticky bar
      else if ('IntersectionObserver' in w) {
        var io = new IntersectionObserver(function (en) {
          var e0 = en[0], past = !e0.isIntersecting && e0.boundingClientRect.top < 0;   // R1: only once the buy box is above the screen
          sb.classList.toggle('is-on', past); d.body.classList.toggle('has-sticky', past);
        });
        io.observe($('#buy'));
      }
      $('[data-sbuy]', sb).addEventListener('click', function () { $('#buy').click(); });
      var all = $('#accall');
      if (all) all.addEventListener('click', function () {
        // F4: the whole set = the main product (cheapest model if it has models) + its accessories
        var vs3 = variants || [], v3 = null;
        if (vs3.length) { var cb3 = Infinity; vs3.forEach(function (v) { if (v.price && v.price < cb3) { cb3 = v.price; v3 = v; } }); }
        var lab3 = v3 ? vlabel(v3) : '';
        Cart.add(p, 1, lab3, v3 && v3.price ? v3.price : null);
        acc.forEach(function (x) { if (P[x.id]) Cart.add(P[x.id], 1); });
        msg(t('Grozā ielikta prece un') + ' ' + acc.length + ' ' + t('piederumi'));
      });
      if (location.hash === '#izvele' && $('#izvele')) setTimeout(function () { $('#izvele').scrollIntoView({ block: 'center' }); }, 60);
    }

    function bind(p, images, variants) {
      var vi = -1, qty = $('#qty');
      if (variants.length) {   // R3 (Gita): the customer must choose the model, nothing is preselected
        var cbest = Infinity, cmax = 0; variants.forEach(function (v) { if (v.price && !/^\s*\+/.test(vlabel(v))) { cbest = Math.min(cbest, v.price); cmax = Math.max(cmax, v.price); } });   // Q1/Q20
        if (cbest < Infinity) $('#pprice').innerHTML = (cmax > cbest ? '<span class="pfrom">' + t('no') + '</span> ' : '') + priceHTML({ pr: cbest, o: null }, true);
        var os0 = $('#optsel'); if (os0) os0.textContent = t('izvēlieties modeli');
        $$('input[name="varmodel"]').forEach(function (rd) { rd.checked = false; });
        $$('.models__r').forEach(function (tr) { tr.classList.remove('is-on'); });
      }
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
      $$('[data-lb]').forEach(function (b) { b.addEventListener('click', function () { $('.lightbox__prev', lb).hidden = $('.lightbox__next', lb).hidden = n < 2; lbShow(+b.getAttribute('data-lb')); lb.classList.add('is-open'); d.body.style.overflow = 'hidden'; }); });
      $$('[data-vimg]').forEach(function (b) {   // Gita 06.11: a model's picture opens big, without choosing the model
        b.addEventListener('click', function (ev) {
          ev.stopPropagation(); var v = variants[+b.getAttribute('data-vimg')]; if (!v || !v.img) return;
          $('img', lb).src = img(v.img); $('.lightbox__n', lb).textContent = vt(vlabel(v));
          $('.lightbox__prev', lb).hidden = $('.lightbox__next', lb).hidden = true; lb.classList.add('is-open'); d.body.style.overflow = 'hidden';
        });
      });
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
      $$('[data-allspec]').forEach(function (a) { a.addEventListener('click', function (e) {   // rt9E:allspec the rest of the parameters opens in place
        e.preventDefault(); e.stopImmediatePropagation(); var s = a.closest('.kspec'), on = a.getAttribute('aria-expanded') !== 'true';
        $$('.kspec__x', s).forEach(function (r) { r.hidden = !on; }); a.setAttribute('aria-expanded', on ? 'true' : 'false');
        $('span', a).textContent = on ? t('Mazāk parametru') : t('Visi parametri') + ' (' + $$('tbody tr', s).length + ')'; }); });
      $$('[data-allspec-old]').forEach(function (a) { a.addEventListener('click', function (e) { var s = $('#specs'); if (!s) return; e.preventDefault(); s.classList.add('is-open'); var hb = $('.acc__h', s); if (hb) hb.setAttribute('aria-expanded', 'true'); s.scrollIntoView({ block: 'start', behavior: 'smooth' }); }); });   // R25
      // variants: one buying pattern: a radio row selects the model, the single «Ielikt grozā» adds it
      var img0 = images[0];
      function pickVar(i) {
        var v = variants[i];
        if (!v) return;
        vi = i;
        if (images.length) {   // Gita 06.11: the chosen model's picture becomes the main photo (back to the product photo for a model without one)
          var u0 = v.img || img0, s0 = $('#galmain .gal__slide img');
          if (s0 && u0 && images[0] !== u0) { images[0] = u0; s0.src = img(u0); var gm0 = $('#galmain'); if (gm0 && gm0.scrollLeft) gm0.scrollTo({ left: 0, behavior: 'smooth' }); var th0 = $('.gal__thumbs [data-go="0"] img'); if (th0) th0.src = img(u0); }
        }
        $$('.models__r').forEach(function (tr) { tr.classList.toggle('is-on', +tr.getAttribute('data-var') === i); });
        var rd = $('input[name="varmodel"][value="' + i + '"]'); if (rd) rd.checked = true;
        if (v.price) {
          var vp = { pr: v.price, o: p.o && v.price === p.pr ? p.o : null };
          $('#pprice').innerHTML = priceHTML(vp, true);
          var sbp = $('#stickybuy .stickybuy__p');   // R2: the sticky bar shows the chosen model's price
          if (sbp) { $$('.price, .pfrom', sbp).forEach(function (x) { x.parentNode.removeChild(x); }); sbp.insertAdjacentHTML('beforeend', priceHTML(vp, false)); }
        }
        var mz0 = $('#izvele'); if (mz0) { mz0.classList.remove('is-need'); var nm = $('.models__need', mz0); if (nm) { nm.style.minHeight = nm.offsetHeight + 'px'; nm.classList.add('is-ok'); nm.removeAttribute('role'); nm.textContent = t('Izvēlēts') + ': ' + vt(vlabel(v)); } /* rt9E:need С-19 */ }
        var os1 = $('#optsel'); if (os1) os1.textContent = vt(vlabel(v));
        $('#pwa').href = waLink(t('Labdien! Vēlos pasūtīt') + ': ' + p.n + ' (ID ' + p.id + '), ' + vlabel(v));
      }
      $$('.models__r').forEach(function (tr) {
        tr.addEventListener('click', function (ev) {
          if (ev.target && ev.target.tagName === 'INPUT') return;   // the radio handles its own change
          if (tr.classList.contains('is-off')) return;
          pickVar(+tr.getAttribute('data-var'));
        });
      });
      $$('input[name="varmodel"]').forEach(function (rd) {
        rd.addEventListener('change', function () { if (rd.checked) pickVar(+rd.getAttribute('value')); });
      });
      // qty
      $$('[data-q]').forEach(function (b) { b.addEventListener('click', function () { qty.value = Math.max(1, Math.min(999, (+qty.value || 1) + +b.getAttribute('data-q'))); }); });
      function ppM2() {   // R12: the line follows the quantity; with the m² calculator it also shows the sum
        var u = unitInfo(p), el = $('#pm2'); if (!u || !el) return; var q = Math.max(1, Math.min(999, Math.round(+qty.value) || 1));
        var ul = q + ' ' + (q === 1 ? unitLab(u.un) : unitLabPl(u.un)), nd = $('#needm2');
        if (!nd) { el.textContent = ul + ' = ' + m2(u.ar * q); return; }
        var nv = parseFloat(String(nd.value).replace(',', '.')), big = nv > 0 && Math.ceil(nv / u.ar - 1e-9) > 999;
        el.innerHTML = '<b>' + esc(ul) + '</b> = ' + m2(u.ar * q) + ' · ' + t('kopā') + ' <b>' + money(q * p.pr) + '</b>' +
          (big ? '<span class="calc__max">' + t('Maks. 999: lielākam daudzumam zvaniet') + ' <a href="tel:' + SHOP.tel + '">' + SHOP.telH + '</a></span>' : '');
      }
      if (qty) { qty.addEventListener('change', function () { qty.value = Math.max(1, Math.min(999, Math.round(+qty.value) || 1)); ppM2(); }); qty.addEventListener('input', ppM2); $$('[data-q]').forEach(function (b) { b.addEventListener('click', ppM2); }); }
      var nd0 = $('#needm2');   // R12: «Man vajag 37 m²» → 19 packs (rounded up to whole packs)
      if (nd0 && qty) {
        nd0.addEventListener('input', function () {
          var u = unitInfo(p), v = parseFloat(String(nd0.value).replace(',', '.'));
          if (u && v > 0) qty.value = Math.max(1, Math.min(999, Math.ceil(v / u.ar - 1e-9)));
          ppM2();
        });
        ppM2();
      }
      if (!$('#buy')) return;   // price on request: no cart row on this page
      function buyState() {   // rt9E:buystate С-20
        var n = Cart.get().reduce(function (s, it) { return s + (String(it.id) === String(p.id) ? it.q : 0); }, 0);
        [$('#buy'), $('#stickybuy [data-sbuy]')].forEach(function (b) {
          if (!b) return;
          b.innerHTML = n ? icon('check') + '<span>' + t('Jau grozā') + ' · ' + n + '</span>' : icon('cart') + '<span>' + t('Ielikt grozā') + '</span>';
          b.classList.toggle('is-in', !!n); if (n) b.setAttribute('aria-label', t('Jau grozā') + ' · ' + n + '. ' + t('Ielikt grozā vēl')); else b.removeAttribute('aria-label');
        });
      }
      buyState();
      $('#buy').addEventListener('click', function () {
        if (variants.length && vi < 0) {   // R3: ask for the model instead of adding a default one
          var mz = $('#izvele');
          if (mz) {
            mz.classList.add('is-need');
            if (!$('.models__need', mz)) mz.insertAdjacentHTML('afterbegin', '<p class="models__need" role="alert">' + t('Lūdzu, izvēlieties modeli, tad ielieciet grozā.') + '</p>');
            mz.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
          return;
        }
        var q = Math.max(1, Math.min(999, Math.round(+qty.value) || 1)), v = vi >= 0 ? variants[vi] : null;
        var lab = v ? vlabel(v) : '';
        Cart.add(p, q, lab, v && v.price ? v.price : null);
        toast(p, q, lab); buyState();   // rt9E:buy2
      });
    }
  }

  /* R40: the live shop's «Slinkums likt preces grozā? … atsūtiet preču sarakstu»: e-mail, WhatsApp and the shop's own Telegram link */
  var TG_URL = 'https://t.me/+fW1178GgnVc0MThk';
  var TGI = '<svg class="tg-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>';
  function slistHTML(title) {
    return '<div class="slist"><span class="slist__ico">' + icon('list') + '</span><div class="slist__b"><b class="slist__t">' + esc(t(title)) + '</b><p>' + esc(t('Pietiek ar nosaukumu vai preces ID un daudzumu, mēs ar jums sazināsimies. Rēķinam pievienojiet rekvizītus, piegādei: adresi.')) + '</p>' +
      '<div class="slist__btns"><a class="btn btn--ghost btn--sm" href="mailto:' + SHOP.mail + '?subject=' + encodeURIComponent('Preču saraksts') + '">' + icon('mail') + '<span>' + t('E-pasts') + '</span></a>' +
      '<a class="btn btn--ghost btn--sm" href="' + waLink('Labdien! Preču saraksts:') + '" target="_blank" rel="noopener"><svg class="wa-ico" aria-hidden="true"><use href="#i-wa"/></svg><span>WhatsApp</span></a>' +
      '<a class="btn btn--ghost btn--sm" href="' + TG_URL + '" target="_blank" rel="noopener">' + TGI + '<span>Telegram</span></a></div></div></div>';
  }

  /* ═════════ CART ═════════ */
  function cartPage() {
    var root = $('#cart');
    function draw() {
      var a = Cart.get();
      if (!a.length) {
        root.innerHTML = $('#cart-empty-tpl').innerHTML; trDom(root); cnStatic(root);
        $('#cart-h-n').textContent = '';
        return;
      }
      var n = Cart.count(), sum = Cart.total(), save = a.reduce(function (s, it) { return s + (it.o && it.o > it.pr ? (it.o - it.pr) * it.q : 0); }, 0);
      $('#cart-h-n').textContent = n + ' ' + plural(n, t('prece'), t('preces'));
      var h = '<div class="cartgrid"><div class="cl">';
      a.forEach(function (it, i) {
        P[it.id] = P[it.id] || it;
        h += '<div class="cl__row"><a class="cl__img" href="' + prodURL(it) + '">' + (it.img ? timg(it.img, ' width="76" height="76"') : '') + '</a><div>' +
          '<a class="cl__name" href="' + prodURL(it) + '">' + esc(it.n) + '</a>' + (it.v ? '<p class="cl__var">' + esc(it.v) + '</p>' : '') +
          '<p class="cl__unit">' + money(it.pr) + ' / ' + (it.u ? esc(unitLab(it.u.un)) : t('gab.')) + (it.o && it.o > it.pr ? ' · <s>' + money(it.o) + '</s>' : '') + (it.u ? ' · <b>' + money(it.u.ppm) + '/m²</b> · ' + it.q + ' ' + esc(it.q === 1 ? unitLab(it.u.un) : unitLabPl(it.u.un)) + ' = ' + m2(it.u.ar * it.q) : '') + '</p></div>' +
          '<div class="cl__ctrl"><div class="qty qty--sm"><button type="button" data-cq="-1" data-i="' + i + '" aria-label="' + t('Mazāk') + '">' + icon('minus') + '</button><input type="number" min="1" max="999" value="' + it.q + '" data-cqi="' + i + '" aria-label="' + t('Daudzums') + '"><button type="button" data-cq="1" data-i="' + i + '" aria-label="' + t('Vairāk') + '">' + icon('plus') + '</button></div>' +
          '<span class="cl__sum">' + money(it.pr * it.q) + '</span><button class="cl__rm" type="button" data-rm="' + i + '">' + icon('trash') + t('Dzēst') + '</button></div></div>';
      });
      h += slistHTML('Slinkums pildīt pasūtījuma formu? Atsūtiet preču sarakstu') + '</div><aside class="summary"><h2>' + t('Kopsavilkums') + '</h2>' +
        '<div class="sumrow"><span>' + t('Preces') + ' (' + n + ')</span><span>' + money(sum + save) + '</span></div>' +
        (save > 0 ? '<div class="sumrow sumrow--save"><span>' + t('Atlaide') + '</span><span>−' + money(save) + '</span></div>' : '') +
        '<div class="sumrow"><span>' + t('Piegāde') + '</span><span>' + t('cenu aprēķināsim rēķinā') + '</span></div>' +
        '<div class="sumrow sumrow--total"><span>' + t('Preču summa (ar PVN)') + '</span><span>' + money(sum) + '</span></div>' +
        '<p class="sumrow__note">' + t('Piegādes cenu aprēķināsim pēc adreses un norādīsim rēķinā.') + '</p>' +
        (function () {   // R4: same rule as the live shop: standard minimum order (goods) 47 €
          var MIN = 47, pct = Math.max(0, Math.min(100, Math.round(sum * 100 / MIN)));
          return '<div class="minord' + (sum < MIN ? ' is-low' : '') + '"><div class="minord__t">' + t('Minimālā pasūtījuma (preču) summa') + ' <b>47 €</b></div>' +
            '<div class="minord__bar" role="img" aria-label="' + pct + '%"><i style="width:' + pct + '%"></i></div>' +
            '<div class="minord__s">' + (sum < MIN ? t('Pievienojiet vēl preces par') + ' <b>' + money(MIN - sum) + '</b>' : t('Minimālā summa sasniegta')) + '</div></div>';
        })();
      h += (sum < 47 ? '<span class="btn btn--block is-disabled" aria-disabled="true">' + t('Noformēt pasūtījumu') + icon('arrow-r') + '</span><p class="minord__gate">' + t('Pasūtījumu var noformēt no 47 € (preču summa). Mazāku pasūtījumu saskaņojiet pa tālruni 29 123 476.') + '</p>'
        : '<a class="btn btn--block" href="noformet.html">' + t('Noformēt pasūtījumu') + icon('arrow-r') + '</a>') +
        '<a class="btn btn--ghost btn--block" style="margin-top:8px" href="katalogs.html">' + t('Turpināt iepirkties') + '</a>' +
        '<div class="summary__note"><p>' + icon('bank') + '<span>' + t('Apmaksa uzreiz nav jāveic: vispirms precizējam pieejamību pie piegādātāja, tad nosūtām avansa rēķinu e-pastā.') + '</span></p>' +
        '<p>' + icon('truck') + '<span>' + t('Piegāde visā Latvijā (ja prece ir pieejama, apmēram 2-4 darba dienu laikā pēc apmaksas) vai saņemšana no piegādātāja noliktavas.') + '</span></p>' +
        '<p>' + icon('clock') + '<span>' + t('Pasūtījumus pieņemam 24/7, apstrādājam P-C 9:30-17:30, Pk 9:30-17:00.') + '</span></p></div></aside></div>';
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
    if (!a.length) { root.innerHTML = $('#cart-empty-tpl').innerHTML; trDom(root); cnStatic(root); return; }
    var type = 'priv', ship = 'del', pay = 'bank';
    var hasShip = a.some(function (it) { return (it.f || []).indexOf('ship') >= 0; });   // F5: delivery-only items
    var nWh = 1;
    loadTree().then(function (T) {   // warehouses: the shop keeps one per supplier; here the product's top-level category stands in for it
      var ws = {};
      a.forEach(function (it) { var x = T.cats[it.c], top = it.c; while (x && x.p) { top = x.p; x = T.cats[x.p]; } ws[top] = 1; });
      nWh = Object.keys(ws).length; apply();
    }).catch(function () {});
    var sum = Cart.total();
    $('#co-items').innerHTML = a.map(function (it) { return '<li>' + (it.img ? timg(it.img, ' width="76" height="76"') : '') + '<span>' + esc(it.n) + (it.v ? ' · ' + esc(it.v) : '') + ' × ' + it.q + '</span><b>' + money(it.pr * it.q) + '</b></li>'; }).join('');
    $('#co-sum').textContent = money(sum); $('#co-sum2').textContent = money(sum);
    $('#co-n').textContent = Cart.count();
    if (sum < 47) { var cmin = $('#co-min'), cbt = $('#coform button[type=submit]'); if (cmin) cmin.hidden = false; if (cbt) { cbt.disabled = true; cbt.classList.add('is-disabled'); } }   // rt9 D С-21
    try { if (sessionStorage.getItem('bv_prchg')) { sessionStorage.removeItem('bv_prchg'); $('#co-items').insertAdjacentHTML('beforebegin', '<p class="co-prchg" role="status">' + esc(t('Dažu preču cena ir mainījusies: summa ir atjaunota pēc aktuālā cenrāža.')) + '</p>'); } } catch (e) {}
    (function () {   // rt9 D М-13: the cart keeps the price from the moment of adding; re-read it from the current price list
      var c = Cart.get();
      Promise.all(c.map(function (it) { return getJSON('data/pd/' + it.id + '.json').catch(function () { return null; }); })).then(function (ds) {
        var ch = 0;
        c.forEach(function (it, i) {
          var dd = ds[i], np = null; if (!dd) return;
          if (it.v) (dd.variants || []).forEach(function (v) { if (vlabel(v) === it.v && +v.price > 0) np = +v.price; });
          else if (+dd.price > 0) np = +dd.price;
          if (np != null && Math.abs(np - it.pr) >= 0.005) { it.pr = np; it.o = null; ch++; }
        });
        if (ch && $('#co-done').hidden) { Cart.set(c); try { sessionStorage.setItem('bv_prchg', '1'); } catch (e) {} location.reload(); }
      });
    })();
    function apply() {
      $$('[data-type]').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-type') === type); b.setAttribute('aria-pressed', b.getAttribute('data-type') === type); });
      $$('[data-company]').forEach(function (e) { e.hidden = type !== 'comp'; });
      $$('[data-company] input').forEach(function (e) { if (e.hasAttribute('data-req')) e.required = type === 'comp'; });
      $$('[data-addr]').forEach(function (e) { e.hidden = ship !== 'del'; });
      $$('[data-addr] input[data-req]').forEach(function (e) { e.required = ship === 'del'; });
      $$('.radio').forEach(function (r) { r.classList.toggle('is-on', $('input', r).checked); });
      var pickIn = $('input[name="ship"][value="pick"]'), pn = $('#ship-note');   // F5
      if (pickIn) {
        pickIn.disabled = hasShip;
        pickIn.closest('.radio').classList.toggle('is-off', hasShip);
        if (hasShip && ship === 'pick') { ship = 'del'; $('input[name="ship"][value="del"]').checked = true; }
      }
      if (pn) pn.hidden = !hasShip;
      var esto = $('#pay-esto');
      esto.hidden = type === 'comp';
      if (type === 'comp' && pay === 'esto') { pay = 'bank'; $('#pay-bank input').checked = true; }
      $('#co-ship').textContent = ship === 'del' ? t('cenu aprēķināsim pēc adreses, norādīsim rēķinā') : t('bez maksas');
      var w1 = $('#wh-note'), w2 = $('#wh-note2');
      if (w1) w1.hidden = nWh < 2;
      if (w2) w2.hidden = !(nWh >= 2 && ship === 'del');
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
      else if (v && inp.name === 'zip') { var zd = v.replace(/^\s*LV[\s-]*/i, ''); if (/^\d{4}$/.test(zd)) inp.value = 'LV-' + zd; else ok = false; }   // rt9 D С-15: LV-0000
      if (f) f.classList.toggle('is-err', !ok);
      var eid = inp.id + '-err', ds = (inp.getAttribute('aria-describedby') || '').split(' ').filter(function (x) { return x && x !== eid; });   // rt9 D В-10
      if (!ok && d.getElementById(eid)) ds.push(eid);
      if (ds.length) inp.setAttribute('aria-describedby', ds.join(' ')); else inp.removeAttribute('aria-describedby');
      if (ok) inp.removeAttribute('aria-invalid'); else inp.setAttribute('aria-invalid', 'true');
      return ok;
    }
    $$('input, textarea', form).forEach(function (i) { i.addEventListener('blur', function () { if (i.value) check(i); }); i.addEventListener('input', function () { var f = i.closest('.field'); if (f && f.classList.contains('is-err')) check(i); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = $$('input, textarea', form).filter(function (i) { return !i.closest('[hidden]') && !check(i); });
      if (bad.length) { bad[0].focus(); bad[0].scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
      var F = function (n) { var i = form.elements[n]; return i ? i.value.trim() : ''; };
      var dt = new Date(), pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
      var day = pad2(dt.getDate()) + '.' + pad2(dt.getMonth() + 1) + '.' + dt.getFullYear();   // rt9 D В-01: no browser-made «order number», the shop numbers the order on its invoice
      var lines = [];
      lines.push(t('Pasūtījums') + ' | BUVVide.lv, ' + day);
      lines.push('');
      Cart.get().forEach(function (it) { lines.push('• ' + it.n + ' (ID ' + it.id + ')' + (it.v ? ', ' + it.v : '') + ': ' + it.q + ' ' + (it.u ? unitLabPl(it.u.un) : t('gab.')) + ' × ' + money(it.pr) + (it.u ? ' (' + m2(it.u.ar * it.q) + ')' : '') + ' = ' + money(it.pr * it.q)); });
      lines.push('');
      lines.push(t('Preču summa (ar PVN)') + ': ' + money(Cart.total()));
      lines.push(t('Pircējs') + ': ' + F('fname') + ' ' + F('lname') + ', ' + F('phone') + ', ' + F('email'));
      if (type === 'comp') lines.push(t('Uzņēmums') + ': ' + F('cname') + ', ' + t('reģ. nr.') + ' ' + F('creg') + (F('cvat') ? ', ' + t('PVN nr.') + ' ' + F('cvat') : '') + ', ' + F('caddr'));
      lines.push(t('Saņemšana') + ': ' + (ship === 'del' ? t('piegāde uz adresi') + ': ' + F('addr') + ', ' + F('city') + ', ' + F('zip') : t('saņemšana no piegādātāja noliktavas')));
      lines.push(t('Apmaksa') + ': ' + (pay === 'esto' ? t('ESTO nomaksa') : t('bankas pārskaitījums pēc rēķina')));
      if (F('note')) lines.push(t('Komentārs') + ': ' + F('note'));
      lines.push(''); lines.push(t('Cenas ir pēc vietnes cenrāža šajā datumā; pieejamību un galīgo summu apstiprināsim rēķinā.'));   // rt9 D М-13
      var text = lines.join('\n');
      var subj = t('Pasūtījums') + ': ' + F('fname') + ' ' + F('lname') + ', ' + day;
      // R11: a real confirmation (number, summary, what happens next); the order itself travels by e-mail (one primary button) or WhatsApp / Telegram
      coWho = { n: F('fname'), e: F('email') }; coText = text;
      coState('send');   // rt9 D Б-01: nothing has reached the shop yet
      $('#co-d-items').innerHTML = $('#co-items').innerHTML;
      $('#co-d-sum').textContent = money(Cart.total());
      $('#co-d-ship').textContent = t('Piegāde') + ': ' + $('#co-ship').textContent;
      $('#co-d-buyer').innerHTML = esc(F('fname') + ' ' + F('lname')) + '<br>' + esc(F('phone')) + '<br>' + esc(F('email')) + (type === 'comp' ? '<br>' + esc(F('cname')) + ', ' + esc(t('reģ. nr.')) + ' ' + esc(F('creg')) : '');
      $('#co-d-recv').textContent = ship === 'del' ? t('piegāde uz adresi') + ': ' + [F('addr'), F('city'), F('zip')].filter(Boolean).join(', ') : t('saņemšana no piegādātāja noliktavas');
      $('#co-d-pay').textContent = pay === 'esto' ? t('ESTO nomaksa') : t('bankas pārskaitījums pēc rēķina');
      $('#co-mail').href = 'mailto:' + SHOP.mail + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(text);
      $('#co-wa').href = waLink(text);
      $('#co-mail').onclick = $('#co-wa').onclick = coAsk;
      $('#co-tg').onclick = function () {   // Telegram takes no prefilled text: the order text goes to the clipboard, the chat opens in a new tab
        try { navigator.clipboard.writeText(text).then(function () { msg(t('Pasūtījuma teksts nokopēts: ielīmējiet to Telegram čatā.')); }, function () {}); } catch (er) {}
        coAsk();
      };
      $('#co-form-wrap').hidden = true;
      var ph = $('.page-h'); if (ph) ph.hidden = true;
      $('#co-done').hidden = false;
      w.scrollTo({ top: 0, behavior: 'smooth' });
    });
    // rt9 D Б-01: send -> ask «Vai pasūtījums ir nosūtīts?» -> «Paldies» (cart emptied only then)
    var coWho = { n: '', e: '' }, coText = '', coT;
    function coState(st) {
      var cd = $('#co-done .cdone'); if (!cd) return;
      cd.setAttribute('data-st', st);
      var done = st === 'done';
      $('#co-h').textContent = done ? t('Paldies') + (coWho.n ? ', ' + coWho.n : '') + '! ' + t('Pasūtījums nosūtīts') : t('Nosūtiet pasūtījumu veikalam');
      $('#co-lead').innerHTML = done
        ? esc(t('Pieejamību darba laikā precizēsim pie piegādātāja un rēķinu nosūtīsim uz')) + ' <b>' + esc(coWho.e) + '</b>. ' + esc(t('Ja atbilde nepienāk, zvaniet')) + ' <a href="tel:' + SHOP.tel + '">' + SHOP.telH + '</a>.'
        : esc(t('Pasūtījums vēl nav nosūtīts. Teksts ir sagatavots: izvēlieties, kā to nosūtīt.')) + ' ' + esc(t('Rēķinu nosūtīsim uz')) + ' <b>' + esc(coWho.e) + '</b> ' + esc(t('pēc pieejamības pārbaudes.'));
      $('#co-ask').hidden = st !== 'ask';
      if (done) { Cart.set([]); var h = $('#co-h'); if (h) h.focus({ preventScroll: true }); w.scrollTo({ top: 0, behavior: 'smooth' }); }
    }
    function coAsk() { clearTimeout(coT); coT = setTimeout(function () { coState('ask'); }, 700); }
    $('#co-copy').onclick = function () {
      var ok = function () { msg(t('Pasūtījuma teksts nokopēts: ielīmējiet to e-pastā vai čatā.')); coAsk(); };
      try { navigator.clipboard.writeText(coText).then(ok, function () { coAsk(); }); } catch (er) { coAsk(); }
    };
    $('#co-yes').onclick = function () { coState('done'); };
    $('#co-retry').onclick = function () { coState('send'); var b = $('#co-mail'); if (b) b.focus(); };
    $('#co-edit').onclick = function () { $('#co-done').hidden = true; $('#co-form-wrap').hidden = false; var ph = $('.page-h'); if (ph) ph.hidden = false; w.scrollTo({ top: 0 }); };
  }

  /* ── language switch state, i18n of static text ── */
  $$('[data-lang]').forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('data-lang') === LANG ? 'true' : 'false'); });
  if (LANG === 'ru') {
    d.documentElement.lang = 'ru';
    try { if (!/[?&]lang=ru(?:[&#]|$)/.test(location.search)) history.replaceState(history.state, '', location.pathname + (location.search ? location.search + '&' : '?') + 'lang=ru' + location.hash); } catch (e) {}   // rt9E:lurl В-03 shareable RU address
    var md0 = d.querySelector('meta[name=description]'); if (md0 && RU[md0.getAttribute('content')]) md0.setAttribute('content', RU[md0.getAttribute('content')]);   // В-03: page description in RU
    if (RU[d.title]) d.title = RU[d.title];
    $$('[data-t]').forEach(function (e) { var k = e.getAttribute('data-t') || e.textContent.trim(); if (RU[k]) e.textContent = RU[k]; });
    $$('[data-tp]').forEach(function (e) { var k = e.getAttribute('placeholder'); if (RU[k]) e.setAttribute('placeholder', RU[k]); });
    $$('[aria-label], [placeholder]').forEach(function (e) { ['aria-label', 'placeholder'].forEach(function (a) { var k = e.getAttribute(a); if (k && RU[k]) e.setAttribute(a, RU[k]); }); });   // rt9E:aria В-03 static labels for screen readers
    var RUPH = 'Поиск: двери, котёл, душ, плитка, окна, ворота, забор…';
    $$('form.search input[type=search]').forEach(function (e) { e.setAttribute('placeholder', RUPH); });
  }

  /* photos come from buvvide.lv: if that host is slow or unreachable the card must degrade
     to the neutral placeholder instead of showing a broken-image icon */
  function imgGuard() {
    var REPL = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#cfd6d2" stroke-width="1.4">' +
      '<path d="M3.6 7.5 12 3.6l8.4 3.9v9L12 20.4l-8.4-3.9z"/><path d="M3.6 7.5 12 11.4l8.4-3.9M12 11.4v9"/></svg>');
    $$('img').forEach(function (i) {
      if (i.dataset.guarded) return;
      i.dataset.guarded = '1';
      i.addEventListener('error', function () {
        if (i.dataset.full && i.getAttribute('src') !== i.dataset.full) { i.src = i.dataset.full; return; }   // R30: no small copy, take the original
        if (i.dataset.failed) return;
        i.dataset.failed = '1';
        i.src = REPL;
        i.classList.add('img-fail');
      });
    });
  }
  imgGuard();
  var _mo = new MutationObserver(function (muts) {
    for (var k = 0; k < muts.length; k++) {
      var add = muts[k].addedNodes;
      for (var j = 0; j < add.length; j++) {
        var n = add[j];
        if (n.nodeType !== 1) continue;
        if (n.tagName === 'IMG') imgGuard();
        else if (n.querySelectorAll) { if (n.querySelectorAll('img').length) imgGuard(); }
      }
    }
  });
  try { _mo.observe(d.body, { childList: true, subtree: true }); } catch (e) {}

  cnStatic();
  /* ---- 06.11 red team R22 follow-up, R39, RU leftovers (rt6 agent C) ---- */
  (function () {
    // long category names wrap at syllable borders with a hyphen («Elektro-instrumenti»), never mid-word («Elektroinstru menti»)
    var SHY = {};
    // only words that do not fit a phone tile line on their own, split at the morpheme border
    ('Labiekārto|šanai Apgaismo|jums Energo|apgāde Elektro|instrumenti Pneimo|instrumenti Mēr|instrumenti Ūdens|apgāde Santeh|nika Сантех|ника Отоп|ление ' +
     'благо|устройства Энерго|снабжение Электро|инструменты Пневмо|инструменты Пило|материалы Измери|тельные Водо|снабжение ' +
     'подо|конники Строи|тельная').split(' ').forEach(function (x) { SHY[x.replace(/\|/g, '')] = x.replace(/\|/g, '\u00AD'); });
    var WORD = /[A-Za-z\u0100-\u017F\u0400-\u04FF]+/g;
    function ruN(n) { var a = n % 10, b = n % 100; return n + ' ' + (a === 1 && b !== 11 ? 'товар' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'товара' : 'товаров'); }
    function tidy() {
      $$('.cat__name, .subcat__name, .hero__tile-name').forEach(function (e) {   // С-18 (rt9 F): hero tiles too
        var n = e.firstChild;
        if (n && n.nodeType === 3 && n.nodeValue.length > 8 && n.nodeValue.indexOf('\u00AD') < 0) {
          var v = n.nodeValue.replace(WORD, function (x) { return SHY[x] || x; });
          if (v !== n.nodeValue) n.nodeValue = v;
        }
      });
      if (LANG === 'ru') $$('.cat__n, .cblock__n').forEach(function (e) { var m = /^(\d+)\s+pre[cč]/.exec(e.textContent.trim()); if (m) e.textContent = ruN(+m[1]); });
    }
    tidy();
    try { new MutationObserver(function () { tidy(); }).observe(d.body, { childList: true, subtree: true }); } catch (e) {}
    // R39: the long search hint was cut («…bruģis, p» on 390 px, RU on 1024 px): use the short one whenever the long one does not fit
    var cx = null, phT = 0;
    function ph() {
      $$('form.search input[data-tp]').forEach(function (e) {
        if (e._ph == null) e._ph = e.getAttribute('placeholder');
        if (!e.offsetWidth) return;   // the header has a phone and a desktop copy; measure the visible one
        var cs = getComputedStyle(e), room = e.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        try { cx = cx || d.createElement('canvas').getContext('2d'); cx.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily; } catch (er) { return; }
        var opts = [e._ph, t('Meklēt: durvis, katls, bruģis…'), t('Meklēt preces')], k = 0;
        while (k < opts.length - 1 && cx.measureText(opts[k]).width > room - 4) k++;
        e.setAttribute('placeholder', opts[k]);
      });
    }
    ph();
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(ph);
    w.addEventListener('resize', function () { clearTimeout(phT); phT = setTimeout(ph, 150); });
    // RU: the sale page kept its Latvian H1 and title
    if (LANG === 'ru') { var tt0 = d.title.split(' | '); if (RU[d.title]) d.title = RU[d.title]; else if (tt0.length === 2 && RU[tt0[0]]) d.title = RU[tt0[0]] + ' | ' + tt0[1]; }   // RU page titles
    if (PAGE === 'akcijas' && LANG === 'ru') { var h1 = $('#cat-h1'); if (h1) h1.textContent = t('Akcijas un atlaides'); d.title = t('Akcijas un atlaides') + ' | BUVVide.lv'; }
  })();
  /* ---- rt9 F: С-10 arrows on the product rails (desktop), С-13 the last row of the category grid completed by «Viss katalogs» ---- */
  (function () {
    function rup(r) {
      var b = r._rb; if (!b) return;
      var max = r.scrollWidth - r.clientWidth - 2, m = r.querySelector('.card__media');
      b[0].hidden = max <= 0 || r.scrollLeft <= 2; b[1].hidden = max <= 0 || r.scrollLeft >= max;
      if (m && m.offsetHeight) b.forEach(function (x) { x.style.top = Math.round(m.offsetHeight / 2 - 22) + 'px'; });
    }
    $$('.rail').forEach(function (r) {
      if (r._rb || !r.parentNode) return;
      var wr = d.createElement('div'); wr.className = 'railw';
      r.parentNode.insertBefore(wr, r); wr.appendChild(r);
      r._rb = [-1, 1].map(function (dir) {
        var b = d.createElement('button'); b.type = 'button'; b.hidden = true;
        b.className = 'railw__btn railw__btn--' + (dir < 0 ? 'prev' : 'next');
        b.setAttribute('aria-label', t(dir < 0 ? 'Iepriekšējās preces' : 'Nākamās preces'));
        b.innerHTML = icon(dir < 0 ? 'chev-l' : 'chev-r');
        b.addEventListener('click', function () {   // one screen of whole cards
          var c = r.firstElementChild, gp = parseFloat(getComputedStyle(r).columnGap) || 0, cw = c ? c.getBoundingClientRect().width + gp : 0;
          r.scrollBy({ left: dir * (cw ? cw * Math.max(1, Math.floor((r.clientWidth + gp) / cw)) : r.clientWidth - 80), behavior: 'smooth' });
        });
        wr.appendChild(b); return b;
      });
      r.addEventListener('scroll', function () { rup(r); }, { passive: true });
      try { new MutationObserver(function () { rup(r); }).observe(r, { childList: true }); } catch (e) {}
      rup(r);
    });
    function fill() {
      $$('[data-fill]').forEach(function (g) {
        var all = $('.cat--all', g); if (!all) return;
        var cols = getComputedStyle(g).gridTemplateColumns.split(' ').filter(Boolean).length || 1, rest = cols - (g.children.length - 1) % cols;
        all.style.gridColumn = 'span ' + rest; all.classList.toggle('is-wide', rest > 1);
      });
    }
    fill();
    var ft = 0;
    w.addEventListener('resize', function () { clearTimeout(ft); ft = setTimeout(function () { fill(); $$('.rail').forEach(rup); }, 120); });
    w.addEventListener('load', function () { $$('.rail').forEach(rup); });
  })();
  w.BVX = { card: card, reg: reg, getJSON: getJSON, t: t, enFill: enFill, catURL: catURL };
  Cart.badge();
  w.addEventListener('storage', function (e) { if (e.key === 'bv_cart') Cart.badge(); });
  if (PAGE === 'home') (function () {   // R16/J6: home blocks in the order / visibility set in «Veikala iestatījumi»
    var cfg = store('bv_blocks'), main = $('#main'); if (!cfg || !main) return;
    cfg.forEach(function (b) { var el = main.querySelector('[data-block-i="' + b.i + '"]'); if (el) { el.hidden = !!b.h; main.appendChild(el); } });
  })();
  /* ── rt9 D: accessibility + search engines (audit В-02, В-10) and the 47 € minimum on cheap products (С-21) ── */
  (function () {
    // В-10: the header search is a combobox with a list of suggestions
    $$('form.search').forEach(function (form, k) {
      var inp = $('input[type=search]', form), box = $('.suggest', form);
      if (!inp || !box) return;
      if (!box.id) box.id = 'sug-' + (inp.id || k);
      inp.setAttribute('role', 'combobox'); inp.setAttribute('aria-autocomplete', 'list'); inp.setAttribute('aria-controls', box.id); inp.setAttribute('aria-expanded', 'false');
      box.setAttribute('aria-label', t('Ieteikumi'));
      var sync = function () {
        var open = box.classList.contains('is-open'), act = null;
        inp.setAttribute('aria-expanded', open ? 'true' : 'false');
        $$('a', box).forEach(function (a, i) { a.setAttribute('role', 'option'); if (!a.id) a.id = box.id + '-' + i; var on = a.classList.contains('is-act'); a.setAttribute('aria-selected', on ? 'true' : 'false'); if (on) act = a; });
        $$('.suggest__h', box).forEach(function (x) { x.setAttribute('role', 'presentation'); });
        if (open && act) inp.setAttribute('aria-activedescendant', act.id); else inp.removeAttribute('aria-activedescendant');
      };
      if (w.MutationObserver) new MutationObserver(sync).observe(box, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    });
    // В-10: the phone catalogue menu is a modal dialog: focus goes in, Tab stays inside, focus returns to the menu button
    var dr = $('#drawer'), opener = null;
    if (dr && w.MutationObserver) {
      dr.setAttribute('role', 'dialog'); dr.setAttribute('aria-modal', 'true');
      var focusables = function () {
        return $$('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])', dr).filter(function (e) { return e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden'; });
      };
      $$('[data-menu]').forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
        b.addEventListener('click', function () { opener = b; b.setAttribute('aria-expanded', 'true'); setTimeout(function () { var x = $('[data-close]', dr); if (x && dr.classList.contains('is-open')) x.focus(); }, 80); });
      });
      new MutationObserver(function () {
        if (dr.classList.contains('is-open') || !opener) return;
        var o = opener; opener = null; o.setAttribute('aria-expanded', 'false');
        if (dr.contains(d.activeElement) || d.activeElement === d.body) o.focus();
      }).observe(dr, { attributes: true, attributeFilter: ['class'] });
      d.addEventListener('keydown', function (e) {
        if (e.key !== 'Tab' || !dr.classList.contains('is-open')) return;
        var f = focusables(); if (!f.length) return;
        var a = d.activeElement;
        if (e.shiftKey && (a === f[0] || !dr.contains(a))) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && (a === f[f.length - 1] || !dr.contains(a))) { e.preventDefault(); f[0].focus(); }
      });
    }
    // В-02: product and category pages are drawn from JSON (a static host cannot pre-render 11 000 pages): canonical with the id + Product data
    var can = $('link[rel=canonical]'), base = can ? can.href.replace(/[^/]*$/, '') : '';
    function canon(u) { if (can) can.href = base + u; var og = $('meta[property="og:url"]'); if (og) og.setAttribute('content', base + u); }
    if (PAGE === 'category' && +qp('c')) canon('kategorija.html?c=' + (+qp('c')));
    if (PAGE === 'product' && +qp('id')) {
      var pid = +qp('id');
      canon('prece.html?id=' + pid);
      getJSON('data/pd/' + pid + '.json').then(function (p) {
        if (!p || !p.name) return;
        var abs = function (x) { var u = img(x); return /^https?:/.test(u) ? u : base + u; };
        var vs = (p.variants || []).filter(function (v) { return +v.price > 0 && !/^\s*\+/.test(vlabel(v)); }).map(function (v) { return +v.price; });
        var o = { '@context': 'https://schema.org', '@type': 'Product', name: p.name, sku: String(p.id), url: base + 'prece.html?id=' + pid };
        if (p.images && p.images.length) o.image = p.images.slice(0, 3).map(abs);
        if (p.code) o.mpn = String(p.code);
        if (vs.length > 1) o.offers = { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: Math.min.apply(null, vs).toFixed(2), highPrice: Math.max.apply(null, vs).toFixed(2), offerCount: vs.length };
        else if (+p.price > 0) o.offers = { '@type': 'Offer', priceCurrency: 'EUR', price: (+p.price).toFixed(2), url: o.url };
        var s = d.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(o); d.head.appendChild(s);
        var ogi = $('meta[property="og:image"]'); if (ogi && o.image) ogi.setAttribute('content', o.image[0]);
        // С-21: products under 47 € say the minimum next to the buy button
        var low = vs.length ? Math.min.apply(null, vs) : +p.price;
        if (!(low > 0 && low < 47)) return;
        var n = 0;
        (function wait() {
          var bb = $('.buybox');
          if (!bb) { if (n++ < 40) setTimeout(wait, 150); return; }
          if ($('.buybox__min', bb)) return;
          bb.insertAdjacentHTML('beforeend', '<p class="buybox__min">' + icon('info') + '<span>' + esc(t('Minimālā pasūtījuma (preču) summa: 47 €. Mazāku pasūtījumu saskaņojiet pa tālruni')) +
            ' <a href="tel:' + SHOP.tel + '">' + SHOP.telH + '</a>.</span></p>');
        })();
      }).catch(function () {});
    }
  })();
  if (PAGE === 'category') catPage();
  else if (PAGE === 'akcijas') akcPage();
  else if (PAGE === 'search') searchPage();
  else if (PAGE === 'product') productPage();
  else if (PAGE === 'cart') cartPage();
  else if (PAGE === 'checkout') checkoutPage();
})();
