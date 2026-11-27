(function () {
  'use strict';
  var SR = window.SR || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var SHOP = 'https://salienasriepas.lv/';
  var SEARCH = SHOP + 'index.php?route=product/search&search=';
  var SEAS = { w: 'Ziemas', s: 'Vasaras', a: 'Vissezonas' };
  var SEAS_ICON = { w: 'i-snow', s: 'i-sun', a: 'i-all' };

  function fmt(p) {
    if (p == null) return '';
    return (p % 1 ? p.toFixed(2).replace('.', ',') : String(p)) + ' €';
  }
  function plural(n, one, many) {
    return (n % 10 === 1 && n % 100 !== 11) ? one : many;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function icon(id, cls) { return '<svg class="' + (cls || 'ic') + '" aria-hidden="true"><use href="#' + id + '"/></svg>'; }

  /* ---------- fitting price groups (salienasriepas.lv/auto-riepu-montaza, ar PVN) ---------- */
  var G = [
    { d: 'Metāla diski, riepu profils virs 45%; lietie diski līdz 16″, riepu profils virs 45%.', p: [42.35, 18.15, 12.10] },
    { d: 'Metāla diski, riepu profils zem 45~50%; kameru riepas, traktoriņi; lietie diski 17″~18″, riepu profils zem 50%; run flat riepas; busi; džipi; SUV.', p: [54.45, 24.20, 15.13] },
    { d: 'Lietie diski 19″ un lielāki; riepu profils zem 45%; run flat riepas; busi 6 caur.', p: [66.55, 24.20, 18.15] }
  ];
  function grp(h, r) { if (r >= 19 || h < 45) return 2; if (r >= 17 || h <= 50) return 1; return 0; }
  function money(p) { return p.toFixed(2).replace('.', ',') + ' €'; }

  /* ---------- state ---------- */
  var st = { w: 205, h: 55, r: 16, s: 'w', size: '205/55 R16', cond: '' };
  function key(w, h, r) { return w + '/' + h + ' R' + r; }

  /* ---------- finder ---------- */
  var finder = $('[data-finder]');
  var W = [145, 155, 165, 175, 185, 195, 205, 215, 225, 235, 245, 255, 265, 275, 285, 295, 305, 315, 325];
  var H = [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];
  var R = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  function fill(sel, arr, v, pre) {
    sel.innerHTML = arr.map(function (x) { return '<option value="' + x + '"' + (x === v ? ' selected' : '') + '>' + (pre || '') + x + '</option>'; }).join('');
  }
  fill(finder.w, W, st.w); fill(finder.h, H, st.h); fill(finder.r, R, st.r, 'R');
  var go = $('[data-go]');
  function readFinder() {
    st.w = +finder.w.value; st.h = +finder.h.value; st.r = +finder.r.value;
    st.s = (finder.querySelector('input[name=s]:checked') || {}).value || 'w';
  }
  function updGo() {
    readFinder();
    var k = key(st.w, st.h, st.r), d = SR[k];
    if (d) {
      var n = d.st[st.s][0], min = d.st[st.s][1];
      go.innerHTML = n ? 'Rādīt ' + n + ' ' + plural(n, 'riepu', 'riepas') + ' <span class="cnt">· no ' + fmt(min) + '</span>'
                       : SEAS[st.s] + ' riepu šim izmēram nav — rādīt citas';
    } else {
      go.innerHTML = 'Meklēt ' + st.w + '/' + st.h + ' R' + st.r + ' katalogā ' + icon('i-arrow');
    }
    updYours();
  }
  finder.addEventListener('change', updGo);
  finder.addEventListener('submit', function (e) {
    e.preventDefault(); readFinder();
    var k = key(st.w, st.h, st.r);
    if (SR[k]) {
      st.size = k; st.cond = '';
      if (!SR[k].st[st.s][0]) { st.s = ['w', 's', 'a'].filter(function (x) { return SR[k].st[x][0]; })[0] || st.s; }
      render(); scrollTo('#riepas');
    } else {
      window.open(SEARCH + encodeURIComponent(st.w + '/' + st.h + 'R' + st.r), '_blank', 'noopener');
    }
  });
  function scrollTo(sel) { var el = $(sel); if (el) el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }

  /* tabs */
  $$('[data-ftab]').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('[data-ftab]').forEach(function (x) {
        var on = x === b; x.setAttribute('aria-selected', on);
        $('#' + x.getAttribute('aria-controls')).hidden = !on;
      });
    });
  });
  $$('[data-qsearch]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = f.getAttribute('data-qsearch') === 'moto'
        ? f.w.value + '/' + f.h.value + ' ' + f.r.value
        : (f.r.value ? 'x' + f.r.value + ' ' : '') + f.pcd.value;
      window.open(SEARCH + encodeURIComponent(q), '_blank', 'noopener');
    });
  });

  /* header search: local sizes stay on page */
  var hs = $('[data-hsearch]');
  if (hs) hs.addEventListener('submit', function (e) {
    var q = (hs.search.value || '').toUpperCase().replace(/\s+/g, '');
    var m = q.match(/^(\d{3})\/(\d{2})R?(\d{2})$/);
    if (m && SR[key(+m[1], +m[2], +m[3])]) {
      e.preventDefault();
      st.size = key(+m[1], +m[2], +m[3]); st.cond = ''; render(); scrollTo('#riepas');
    } else { hs.target = '_blank'; }
  });

  /* ---------- results ---------- */
  var grid = $('[data-grid]'), chips = $('[data-chips]');
  var sizesOrder = Object.keys(SR).sort(function (a, b) {
    var pa = a.match(/\d+/g).map(Number), pb = b.match(/\d+/g).map(Number);
    return pa[2] - pb[2] || pa[0] - pb[0] || pa[1] - pb[1];
  });
  chips.innerHTML = sizesOrder.map(function (k) { return '<button type="button" class="chip" data-size="' + k + '" aria-pressed="false">' + k + '</button>'; }).join('');
  chips.addEventListener('click', function (e) {
    var b = e.target.closest('[data-size]'); if (!b) return;
    st.size = b.getAttribute('data-size'); render();
  });
  function segInit(sel, prop) {
    var box = $(sel);
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      st[prop] = b.getAttribute('data-v'); render();
    });
    return box;
  }
  var segS = segInit('[data-rseason]', 's'), segC = $('[data-rcond]');
  segC.addEventListener('change', function () { st.cond = segC.value; render(); });
  function press(box, v) { $$('button', box).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-v') === v); }); }

  function card(x, k) {
    var flags = x.l ? '<span class="flag u">Lietota' + (x.mm ? ' · ' + String(x.mm).replace('.', ',') + ' mm' : '') + '</span>' : '<span class="flag">Jauna</span>';
    if (x.o && x.o > x.p) flags += '<span class="flag d">−' + Math.round((1 - x.p / x.o) * 100) + '%</span>';
    var url = SHOP + x.u, name = esc(x.m);
    var sub = SEAS[x.s] + (x.st ? ', radžota' : '');
    return '<article class="card">' +
      '<div class="flags">' + flags + '</div>' +
      '<a class="im" href="' + url + '" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true"><img src="assets/p/' + x.i + '.webp" width="320" height="320" alt="" loading="lazy" decoding="async"></a>' +
      '<div class="bd"><div class="sz">' + icon(x.st ? 'i-stud' : SEAS_ICON[x.s]) + k + ' · ' + sub + '</div>' +
      '<h3><a href="' + url + '" target="_blank" rel="noopener">' + name + '</a></h3>' +
      '<div class="pr"><b class="num">' + fmt(x.p) + '</b>' + (x.o && x.o > x.p ? '<s class="num">' + fmt(x.o) + '</s>' : '') + '<small>/ gab.</small></div>' +
      '<div class="stock">' + (x.q ? 'Pieejamas ' + x.q + ' gab.' : 'Pieejama') + '</div>' +
      '<button class="add" type="button" data-add="' + name + ' ' + k + '">' + icon('i-cart') + 'Grozā</button></div></article>';
  }
  function render() {
    var d = SR[st.size]; if (!d) return;
    $$('.chip', chips).forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-size') === st.size); });
    press(segS, st.s); segC.value = st.cond;
    var list = d.it.filter(function (x) { return x.s === st.s && (st.cond === '' || (st.cond === 'u' ? x.l : !x.l)); })
      .sort(function (a, b) { return a.p - b.p; });
    var desk = matchMedia('(min-width: 900px)').matches;
    var shown = list.slice(0, desk ? 10 : 12);
    var all = SEARCH + encodeURIComponent(st.size.replace(' ', ''));
    var n = d.st[st.s][0];
    $('[data-rtitle]').textContent = SEAS[st.s] + ' riepas ' + st.size;
    $('[data-rlead]').textContent = n ? n + ' ' + plural(n, 'riepa', 'riepas') + ' šajā izmērā · no ' + fmt(d.st[st.s][1]) + ' · cena par 1 gab.' : 'Šajā sezonā šī izmēra riepu šobrīd nav.';
    var more = $('[data-rall]'); more.href = all; more.textContent = 'Visas ' + d.t + ' ' + st.size + ' katalogā';
    grid.innerHTML = shown.length
      ? shown.map(function (x) { return card(x, st.size); }).join('') +
        '<a class="allcard" href="' + all + '" target="_blank" rel="noopener">Visas ' + d.t + ' riepas ' + st.size + '<span>Atvērt katalogā →</span></a>'
      : '<p class="empty">Šim filtram riepu nav. Izvēlieties citu sezonu vai stāvokli, vai <a href="' + all + '" target="_blank" rel="noopener">skatiet visas ' + d.t + ' katalogā</a>.</p>';
    grid.scrollLeft = 0;
  }

  /* quick sizes in finder (desktop) */
  var qs = $('[data-qs]');
  if (qs) {
    qs.innerHTML = ['195/65 R15', '205/55 R16', '215/65 R16', '225/45 R17', '225/55 R17', '235/55 R18'].filter(function (k) { return SR[k]; })
      .map(function (k) { return '<button type="button" data-q="' + k + '">' + k + '</button>'; }).join('');
    qs.addEventListener('click', function (e) {
      var b = e.target.closest('[data-q]'); if (!b) return;
      var m = b.getAttribute('data-q').match(/\d+/g);
      finder.w.value = m[0]; finder.h.value = m[1]; finder.r.value = m[2];
      updGo(); st.size = b.getAttribute('data-q'); st.cond = ''; render(); scrollTo('#riepas');
    });
  }

  /* ---------- cart ---------- */
  var cartN = 0, toastT;
  function toast(t) {
    var el = $('[data-toast]'); $('span', el).textContent = t; el.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('on'); }, 2600);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-add]'); if (!a) return;
    cartN++; $('[data-cartn]').textContent = cartN;
    $('[data-cart]').setAttribute('aria-label', 'Grozs, ' + cartN + ' preces');
    a.classList.add('ok'); a.innerHTML = icon('i-check') + 'Grozā';
    toast('Pievienots grozā: ' + a.getAttribute('data-add'));
  });
  $('[data-cart]').addEventListener('click', function () {
    toast(cartN ? 'Grozā ' + cartN + ' ' + plural(cartN, 'prece', 'preces') : 'Jūsu pirkumu grozs ir tukšs');
  });

  /* ---------- promos ---------- */
  $$('[data-set-season]').forEach(function (a) { a.addEventListener('click', function () { st.s = a.getAttribute('data-set-season'); st.cond = ''; render(); }); });
  $$('[data-set-cond]').forEach(function (a) { a.addEventListener('click', function () { st.cond = a.getAttribute('data-set-cond'); render(); }); });
  var promos = $('[data-promos]'), dots = $$('[data-dots] i');
  promos.addEventListener('scroll', function () {
    var w = promos.firstElementChild.getBoundingClientRect().width + 10;
    var i = Math.min(dots.length - 1, Math.round(promos.scrollLeft / w));
    dots.forEach(function (d, j) { d.classList.toggle('on', j === i); });
  }, { passive: true });

  /* ---------- fitting table ---------- */
  var gi = 0;
  function setG(i) {
    gi = i;
    $$('.gtabs button').forEach(function (b) { b.setAttribute('aria-selected', +b.getAttribute('data-g') === i); });
    $('[data-gdesc]').textContent = G[i].d;
    $$('[data-ptab] tr').forEach(function (tr, r) {
      $('.one span', tr).textContent = money(G[i].p[r]);
      $$('td.g', tr).forEach(function (td, c) { td.classList.toggle('hl', r === 0 && c === i); });
    });
  }
  $$('.gtabs button').forEach(function (b) { b.addEventListener('click', function () { setG(+b.getAttribute('data-g')); }); });
  function updYours() {
    var g = grp(st.h, st.r);
    $('[data-ysize]').textContent = key(st.w, st.h, st.r);
    $('[data-yprice]').textContent = money(G[g].p[0]);
    setG(g);
  }

  /* ---------- booking ---------- */
  var dlg = $('#book'), bf = $('[data-bform]'), bdone = $('[data-bdone]');
  var SVC = { full: 'Pilna montāža, 4 riepas', swap: 'Pārskrūvēt un nobalansēt, 4 riepas', hotel: 'Riepu hotelis, viena sezona', repair: 'Riepu remonts' };
  function rigaNow() {
    var p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Riga', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
    var wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday);
    return { y: +o.year, m: +o.month, d: +o.day, wd: wd, min: (+o.hour % 24) * 60 + (+o.minute) };
  }
  function iso(y, m, d) { return y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0'); }
  function sumUpd() {
    var s = bf.svc.value, g = +bf.g.value, t = SVC[s], v;
    if (s === 'full') v = money(G[g].p[0]);
    else if (s === 'swap') v = money(G[g].p[1]);
    else if (s === 'hotel') v = '18,15 €';
    else v = 'no 6,05 €';
    if (s === 'hotel') t = 'Riepu hotelis, riepu komplekts';
    $('[data-sumtxt]').textContent = t; $('[data-sum]').textContent = v;
    return { t: t, v: v };
  }
  bf.addEventListener('change', sumUpd);
  function openBook(kind) {
    bf.hidden = false; bdone.hidden = true;
    bf.size.value = key(st.w, st.h, st.r);
    bf.g.value = String(grp(st.h, st.r));
    if (kind === 'hotel') bf.querySelector('input[value=hotel]').checked = true;
    var n = rigaNow(), dt = new Date(Date.UTC(n.y, n.m - 1, n.d));
    bf.day.min = iso(n.y, n.m, n.d);
    if (!bf.day.value) {
      do { dt.setUTCDate(dt.getUTCDate() + 1); } while (dt.getUTCDay() === 0);
      bf.day.value = iso(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
    }
    sumUpd();
    closeDrawer();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-book]'); if (!b) return;
    e.preventDefault(); openBook(b.getAttribute('data-book'));
  });
  $('[data-dclose]').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  bf.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = ['name', 'tel', 'day'].filter(function (n) { return !bf[n].value.trim(); });
    if (bad.length) { bf[bad[0]].focus(); bf[bad[0]].reportValidity && bf[bad[0]].setCustomValidity(''); bf.reportValidity(); return; }
    var s = sumUpd(), d = bf.day.value.split('-');
    var txt = 'Pieteikums: ' + s.t + ' (' + s.v + ')\n' +
      'Izmērs: ' + bf.size.value + ', diski ' + bf.g.options[bf.g.selectedIndex].text + '\n' +
      'Diena: ' + d[2] + '.' + d[1] + '.' + d[0] + ', ' + bf.time.value + '\n' +
      'Vārds: ' + bf.name.value.trim() + ', tālr. ' + bf.tel.value.trim() +
      (bf.note.value.trim() ? '\nPiezīmes: ' + bf.note.value.trim() : '');
    $('[data-btxt]').textContent = txt;
    $('[data-bwa]').href = 'https://wa.me/37128607955?text=' + encodeURIComponent(txt);
    $('[data-bmail]').href = 'mailto:info@salienasriepas.lv?subject=' + encodeURIComponent('Pieteikums riepu maiņai') + '&body=' + encodeURIComponent(txt);
    bf.hidden = true; bdone.hidden = false;
  });

  /* ---------- open status + hours ---------- */
  (function () {
    var n = rigaNow(), el = $('[data-open]'), t, open = false;
    var close = n.wd >= 1 && n.wd <= 5 ? 1140 : n.wd === 6 ? 960 : 0;
    var hh = function (m) { return Math.floor(m / 60) + '.' + String(m % 60).padStart(2, '0'); };
    if (close && n.min >= 540 && n.min < close) {
      if (n.min >= 780 && n.min < 810) t = 'Pusdienu pārtraukums līdz 13.30';
      else { t = 'Atvērts līdz ' + hh(close) + ' · Meistaru iela 9'; open = true; }
    } else if (close && n.min < 540) t = 'Atveram šodien 9.00 · Meistaru iela 9';
    else t = (n.wd === 6 || n.wd === 0 ? 'Atveram pirmdien 9.00' : 'Atveram rīt 9.00') + ' · Meistaru iela 9';
    if (n.wd === 6 && n.min >= 960) t = 'Atveram pirmdien 9.00 · Meistaru iela 9';
    $('span', el).textContent = t; el.classList.toggle('closed', !open);
    var row = n.wd === 0 ? '0' : n.wd === 6 ? '6' : '1';
    var tr = $('[data-hours] tr[data-d="' + row + '"]'); if (tr) tr.classList.add('today');
  })();

  /* ---------- drawer ---------- */
  var drawer = $('[data-drawer]'), mbtn = $('[data-menu]');
  function closeDrawer() { drawer.classList.remove('on'); mbtn.setAttribute('aria-expanded', 'false'); }
  mbtn.addEventListener('click', function () { drawer.classList.add('on'); mbtn.setAttribute('aria-expanded', 'true'); $('.x', drawer).focus(); });
  $$('[data-close]', drawer).forEach(function (b) { b.addEventListener('click', closeDrawer); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });

  /* ---------- sticky bar (phone) ---------- */
  var bar = $('[data-mbar]');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { bar.classList.toggle('on', !en[0].isIntersecting); }).observe($('.hero'));
  }

  /* ---------- map ---------- */
  $('[data-mapload]').addEventListener('click', function () {
    $('[data-map]').classList.add('on');
    $('[data-map]').innerHTML = '<iframe title="Salienas riepas kartē: Meistaru iela 9, Piņķi" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=23.8873%2C56.9405%2C23.9173%2C56.9525&amp;layer=mapnik&amp;marker=56.946563%2C23.9023439"></iframe>';
  });

  updGo(); render();
})();
