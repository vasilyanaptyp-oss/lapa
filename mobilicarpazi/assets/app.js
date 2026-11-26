(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const eur = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €';
const IMG = 'assets/img/';
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
};

/* ---------- catalogue (prices "da" = list prices on mobilicarpazi.it, 26.11.2026) ---------- */
const WOOD = [
  ['naturale', 'Naturale', 'La tonalità più chiara del rovere, venature in evidenza.'],
  ['miele', 'Miele', 'Calda e dorata, si abbina al cotto e ai toni crema.'],
  ['intra', 'Intra', 'Tonalità speciale, supplemento del 10% sul prezzo base.'],
  ['selvatico', 'Selvatico', 'Rovere con nodi e venature marcate, carattere rustico.'],
  ['fumoso', 'Fumoso', 'Rovere scuro e caldo, nasconde bene i segni dell’uso.'],
  ['noce', 'Noce', 'Il tono più profondo, elegante con tessuti chiari.'],
  ['bianco', 'Smalto bianco', 'Smalto colorato, supplemento del 10% sul prezzo base.'],
  ['nero', 'Smalto nero', 'Smalto colorato, supplemento del 10% sul prezzo base.']
];
const P = [
  // tavoli
  { id: 'johnson', cat: 'tavoli', tags: ['allungabile'], name: 'Johnson', sub: 'Tavolo allungabile in rovere massello', size: '130–180, 150–200 o 180–230 cm', price: 775, g: 3, wood: true, alt: { fumoso: ['g-johnson-fumoso-0', 'g-johnson-fumoso-1'] } },
  { id: 'garda', cat: 'tavoli', tags: ['allungabile', 'rotondo'], name: 'Garda', sub: 'Tavolo ovale allungabile', size: '140–190–240 × 90 cm', price: 1150, mark: 'Novità', g: 3, wood: true },
  { id: 'fabio', cat: 'tavoli', tags: ['allungabile', 'rotondo'], name: 'Fabio', sub: 'Tavolo rotondo allungabile', size: 'Ø 100, allungabile fino a 200 cm', price: 1080, mark: 'Novità', g: 3, wood: true },
  { id: 'finn', cat: 'tavoli', tags: ['fisso'], name: 'Finn', sub: 'Tavolo fisso con base in ferro', size: 'da 120 × 80 cm, piano 4 cm', price: 770, g: 3, wood: true },
  { id: 'frankfurt', cat: 'tavoli', tags: ['allungabile'], name: 'Frankfurt', sub: 'Grande tavolo da pranzo allungabile', size: 'rovere massello naturale', price: 932, g: 3, wood: true },
  { id: 'oreo', cat: 'tavoli', tags: ['fisso', 'rotondo'], name: 'Oreo', sub: 'Tavolo rotondo con base centrale', size: 'Ø 120 cm, piano 2,5 cm', price: 999, g: 1, wood: true },
  { id: 'ginevra', cat: 'tavoli', tags: ['allungabile', 'rotondo'], name: 'Ginevra', sub: 'Tavolo rotondo allungabile', size: 'rovere naturale', price: 659, g: 2, wood: true },
  { id: 'verke', cat: 'tavoli', tags: ['allungabile'], name: 'Verke', sub: 'Tavolo piccolo allungabile', size: '110 × 70 o 120 × 80 cm', price: 423, g: 2, wood: true },
  { id: 'grand', cat: 'tavoli', tags: ['allungabile'], name: 'Grand', sub: 'Tavolo da pranzo allungabile', size: 'rovere massello', price: 999, g: 3, wood: true },
  { id: 'keln', cat: 'tavoli', tags: ['allungabile'], name: 'Keln', sub: 'Tavolo con tre prolunghe', size: 'per le grandi tavolate', price: 1875, g: 1, wood: true },
  { id: 'horeca-tondo', cat: 'tavoli', tags: ['horeca', 'rotondo', 'fisso'], name: 'Tavolo rotondo HoReCa', sub: 'Piano in rovere, base in metallo', size: 'per bar e ristoranti', price: 310, g: 3, wood: true },
  { id: 'horeca-quadrato', cat: 'tavoli', tags: ['horeca', 'fisso'], name: 'Cafè quadrato', sub: 'Tavolo HoReCa in legno massello', size: 'per bar e ristoranti', price: 388, g: 1, wood: true },
  // sedie
  { id: 'chicago', cat: 'sedie', tags: ['imbottita', 'braccioli'], name: 'Chicago fumoso', sub: 'Poltroncina, tessuto antimacchia', size: 'L 60 × P 58 × H 78 cm', price: 235, mark: 'Bestseller', g: 2, wood: true, fabric: true },
  { id: 'mario', cat: 'sedie', tags: ['imbottita'], name: 'Mario morbida', sub: 'Sedia in rovere, seduta imbottita', size: 'L 47 × P 43 × H 75 cm', price: 185, g: 2, wood: true, fabric: true },
  { id: 'polo', cat: 'sedie', tags: ['legno'], name: 'Polo rigida', sub: 'Sedia tutta in rovere massello', size: 'L 44 × P 49 × H 80 cm', price: 155, g: 3, wood: true },
  { id: 'borys', cat: 'sedie', tags: ['imbottita'], name: 'Borys fumoso', sub: 'Sedia in rovere, seduta in tessuto', size: 'rovere fumoso', price: 185, g: 3, wood: true, fabric: true },
  { id: 'sydney', cat: 'sedie', tags: ['imbottita'], name: 'Sydney', sub: 'Sedia in legno massello, imbottita', size: 'tessuto lavabile', price: 210, mark: 'Novità', g: 2, wood: true, fabric: true },
  { id: 'garda-sedia', cat: 'sedie', tags: ['imbottita'], name: 'Garda', sub: 'Sedia in rovere e tessuto bouclé', size: 'design moderno', price: 285, mark: 'Novità', g: 2, wood: true, fabric: true },
  { id: 'dallas-soft', cat: 'sedie', tags: ['imbottita'], name: 'Dallas Soft', sub: 'Seduta e schienale imbottiti', size: 'rovere naturale', price: 230, mark: 'Novità', g: 3, wood: true, fabric: true },
  { id: 'tor', cat: 'sedie', tags: ['imbottita', 'braccioli'], name: 'Tor naturale', sub: 'Sedia con braccioli in legno chiaro', size: 'seduta imbottita', price: 199, g: 2, wood: true, fabric: true },
  { id: 'chester', cat: 'sedie', tags: ['legno', 'braccioli'], name: 'Chester', sub: 'Sedia arrotondata con braccioli', size: 'tutta in rovere', price: 198, g: 2, wood: true },
  { id: 'madrid', cat: 'sedie', tags: ['imbottita', 'braccioli'], name: 'Madrid', sub: 'Sedia arrotondata, tessuto antimacchia', size: 'rovere massello', price: 265, mark: 'Novità', g: 2, wood: true, fabric: true },
  { id: 'hyuge', cat: 'sedie', tags: ['imbottita'], name: 'Hyuge', sub: 'Poltroncina per ristoranti e hotel', size: 'velluto o tessuto lavabile', price: 177, g: 3, wood: true, fabric: true },
  // sgabelli
  { id: 'polo-sgabello', cat: 'sgabelli', tags: [], name: 'Polo M', sub: 'Sgabello da bar in rovere massello', size: 'seduta a 74 cm', price: 245, g: 1, wood: true, fabric: true },
  { id: 'mario-sgabello', cat: 'sgabelli', tags: [], name: 'Mario M', sub: 'Sgabello con schienale, seduta morbida', size: 'salvaspazio', price: 240, g: 2, wood: true, fabric: true },
  { id: 'forte-sgabello', cat: 'sgabelli', tags: [], name: 'Forte fumoso', sub: 'Sgabello imbottito in rovere fumoso', size: 'seduta imbottita', price: 249, g: 2, wood: true, fabric: true },
  // divani
  { id: 'albert', cat: 'divani', tags: [], name: 'Albert', sub: 'Panca contract su misura', size: 'capitonné', price: 430, g: 1, fabric: true },
  { id: 'grei', cat: 'divani', tags: [], name: 'Grei', sub: 'Divanetto imbottito su misura', size: 'per ristoranti e bar', price: 450, g: 1, fabric: true },
  { id: 'lauren', cat: 'divani', tags: [], name: 'Lauren', sub: 'Divano contract da ristorante', size: 'su misura', price: 538, g: 1, fabric: true },
  // credenze e orologi
  { id: 'asti-tv', cat: 'credenze', tags: [], name: 'TV Asti', sub: 'Mobile TV in rovere massello', size: 'rovere naturale', price: 1270, g: 3, wood: true },
  { id: 'asti-credenza', cat: 'credenze', tags: [], name: 'Asti 2 m', sub: 'Credenza in legno massello', size: 'larghezza 2 m', price: 2200, g: 1, wood: true },
  { id: 'orologio-5', cat: 'credenze', tags: ['orologi'], name: 'Orologio 5', sub: 'Orologio da parete in legno', size: 'diametro a scelta', price: 200, g: 2 }
];
const byId = Object.fromEntries(P.map(p => [p.id, p]));
const CHIPS = {
  tavoli: [['all', 'Tutti'], ['allungabile', 'Allungabili'], ['rotondo', 'Rotondi e ovali'], ['fisso', 'Fissi'], ['horeca', 'Per locali']],
  sedie: [['all', 'Tutte'], ['legno', 'In legno'], ['imbottita', 'Imbottite'], ['braccioli', 'Con braccioli']],
  credenze: [['all', 'Tutti'], ['orologi', 'Orologi']]
};
const MORE = { tavoli: 'Tutti i 32 tavoli', sedie: 'Tutte le sedie e le poltroncine', sgabelli: 'Tutti gli sgabelli', divani: 'Tutti i divani e le panche', credenze: 'Credenze e orologi' };

/* ---------- state ---------- */
let mode = store.get('mc_mode', 'casa');
let cart = store.get('mc_cart', []);
let quote = store.get('mc_quote', []);
let tab = 'tavoli', chip = 'all';

/* ---------- toast ---------- */
let tt;
function toast(t) { $('#toastTxt').textContent = t; $('#toast').classList.add('on'); clearTimeout(tt); tt = setTimeout(() => $('#toast').classList.remove('on'), 2200); }

/* ---------- overlays ---------- */
const scrim = $('#scrim');
let lastFocus = null;
function openLayer(el) {
  closeLayers(true);
  lastFocus = document.activeElement;
  el.classList.add('on'); scrim.classList.add('on'); document.body.style.overflow = 'hidden';
  const f = el.querySelector('[data-close]'); if (f) setTimeout(() => f.focus(), 30);
}
function closeLayers(silent) {
  $$('.drawer.on,.modal.on').forEach(e => e.classList.remove('on'));
  scrim.classList.remove('on'); document.body.style.overflow = '';
  if (!silent && lastFocus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) { } }
}
scrim.addEventListener('click', () => closeLayers());
$$('[data-close]').forEach(b => b.addEventListener('click', () => closeLayers()));
$$('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) closeLayers(); }));
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeLayers(); closeMega(); hideSuggest(); } });
$('#burger').addEventListener('click', () => openLayer($('#menu')));
$('#cartBtn').addEventListener('click', () => { renderCart(); openLayer($('#cart')); });
$('#quoteBtn').addEventListener('click', () => { renderQuote(); openLayer($('#quote')); });
$$('[data-open="quote"]').forEach(b => b.addEventListener('click', () => openQuoteForm()));

/* ---------- mega menu ---------- */
function closeMega() { $$('.dd.open').forEach(d => { d.classList.remove('open'); d.querySelector('button').setAttribute('aria-expanded', 'false'); }); }
$$('.dd').forEach(dd => {
  const b = dd.querySelector('button');
  b.addEventListener('click', e => { e.stopPropagation(); const o = !dd.classList.contains('open'); closeMega(); if (o) { dd.classList.add('open'); b.setAttribute('aria-expanded', 'true'); } });
});
document.addEventListener('click', e => { if (!e.target.closest('.dd')) closeMega(); });

/* ---------- header shadow ---------- */
const hdr = $('#hdr');
const fab = $('.fab');
addEventListener('scroll', () => { hdr.classList.toggle('scrolled', scrollY > 40); fab.classList.toggle('on', scrollY > 700); }, { passive: true });

/* ---------- price mode (Privati / HoReCa) ---------- */
function setMode(m, announce) {
  mode = m; store.set('mc_mode', m);
  $$('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
  $('#quoteBtn').hidden = m !== 'horeca';
  renderGrid(); renderModalPrice();
  if (announce) toast(m === 'horeca' ? 'Prezzi HoReCa: aggiungi al preventivo' : 'Prezzi per privati');
}
$$('[data-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode, true)));

/* ---------- product grid ---------- */
function swatchRow(p) {
  if (!p.wood) return p.fabric ? '<div class="swatches"><i style="background-image:url(' + IMG + 'sw-tessuto.webp)"></i><small>tessuti a scelta</small></div>' : '';
  return '<div class="swatches">' + WOOD.slice(0, 6).map(w => '<i title="' + w[1] + '" style="background-image:url(' + IMG + 'sw-' + w[0] + '.webp)"></i>').join('') + '<small>+ smalti</small></div>';
}
function priceHtml(p) {
  return mode === 'horeca'
    ? '<span class="price lock"><svg><use href="#i-lock"/></svg>Listino HoReCa</span>'
    : '<span class="price">da <b>' + eur(p.price) + '</b></span>';
}
function addBtn(p) {
  return mode === 'horeca'
    ? '<button class="add q" data-q="' + p.id + '" aria-label="Aggiungi ' + p.name + ' al preventivo"><svg><use href="#i-plus"/></svg>Preventivo</button>'
    : '<button class="add" data-add="' + p.id + '" aria-label="Aggiungi ' + p.name + ' al carrello"><svg><use href="#i-cart"/></svg></button>';
}
function card(p) {
  const mark = p.mark ? '<span class="mark' + (p.mark === 'Bestseller' ? ' best' : '') + '">' + p.mark + '</span>' : '';
  return '<article class="card"><div class="im" data-open-p="' + p.id + '">' + mark + '<img src="' + IMG + 'p-' + p.id + '.webp" alt="' + p.name + ', ' + p.sub.toLowerCase() + '" loading="lazy" width="640" height="480"></div>' +
    '<div class="bd"><h3><button data-open-p="' + p.id + '">' + p.name + '</button></h3><p class="sub">' + p.sub + '</p><p class="size">' + p.size + '</p>' + swatchRow(p) +
    '<div class="ft">' + priceHtml(p) + addBtn(p) + '</div></div></article>';
}
function renderChips() {
  const c = CHIPS[tab]; const el = $('#chips');
  if (!c) { el.hidden = true; el.innerHTML = ''; return; }
  el.hidden = false;
  el.innerHTML = c.map(([k, l]) => '<button data-chip="' + k + '" aria-pressed="' + (k === chip) + '">' + l + '</button>').join('');
}
function renderGrid() {
  const list = P.filter(p => p.cat === tab && (chip === 'all' || p.tags.includes(chip)));
  $('#grid').innerHTML = list.slice(0, 8).map(card).join('');
  const ml = $('#moreLink'); ml.textContent = MORE[tab]; ml.dataset.go = tab + ':all';
}
function setTab(t, c) {
  tab = t; chip = c || 'all';
  $$('#tabs [data-tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === t)));
  renderChips(); renderGrid();
}
$('#tabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) setTab(b.dataset.tab); });
$('#chips').addEventListener('click', e => { const b = e.target.closest('[data-chip]'); if (!b) return; chip = b.dataset.chip; renderChips(); renderGrid(); });
$('#grid').addEventListener('click', e => {
  const a = e.target.closest('[data-add]'); if (a) { addToCart(a.dataset.add); a.classList.add('done'); a.innerHTML = '<svg><use href="#i-check"/></svg>'; return; }
  const q = e.target.closest('[data-q]'); if (q) { addToQuote(q.dataset.q); q.innerHTML = '<svg><use href="#i-check"/></svg>Aggiunto'; return; }
  const o = e.target.closest('[data-open-p]'); if (o) openProduct(o.dataset.openP);
});
// any link with data-go="tab:chip" switches the grid
document.addEventListener('click', e => {
  const g = e.target.closest('[data-go]'); if (!g) return;
  const [t, c] = g.dataset.go.split(':');
  const realTab = t, realChip = (t === 'credenze' && c === 'orologi') ? 'orologi' : (c || 'all');
  setTab(realTab, CHIPS[realTab] && CHIPS[realTab].some(x => x[0] === realChip) ? realChip : 'all');
  closeMega(); if (g.closest('.drawer')) closeLayers(true);
});

/* ---------- product modal ---------- */
let cur = null, curWood = 'naturale', curImgs = [];
function gallery(p, wood) {
  if (p.alt && p.alt[wood]) return p.alt[wood];
  return Array.from({ length: p.g }, (_, i) => 'g-' + p.id + '-' + i);
}
function showImgs(list, i = 0) {
  curImgs = list;
  $('#pmImg').src = IMG + list[i] + '.webp'; $('#pmImg').alt = cur.name + ', foto ' + (i + 1);
  $('#pmThumbs').innerHTML = list.length > 1 ? list.map((s, k) => '<button data-i="' + k + '" aria-label="Foto ' + (k + 1) + '" aria-current="' + (k === i) + '"><img src="' + IMG + s + '.webp" alt="" loading="lazy"></button>').join('') : '';
}
$('#pmThumbs').addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (b) showImgs(curImgs, +b.dataset.i); });
function renderModalPrice() {
  if (!cur) return;
  $('#pmPrice').innerHTML = mode === 'horeca' ? '<span class="price lock"><svg><use href="#i-lock"/></svg>Prezzo HoReCa nel listino riservato</span>' : 'da <b>' + eur(cur.price) + '</b>';
  $('#pmPrice').className = 'price';
  $('#pmAdd').textContent = mode === 'horeca' ? 'Aggiungi al preventivo' : 'Aggiungi al carrello';
}
function openProduct(id) {
  cur = byId[id]; if (!cur) return; curWood = 'naturale';
  $('#pmTitle').textContent = cur.name; $('#pmSub').textContent = cur.sub; $('#pmSize').textContent = cur.size;
  showImgs(gallery(cur, curWood));
  if (cur.wood) {
    $('#pmSwWrap').hidden = false;
    $('#pmSw').innerHTML = WOOD.map(w => '<button data-w="' + w[0] + '" aria-pressed="' + (w[0] === curWood) + '" aria-label="' + w[1] + '" style="background-image:url(' + IMG + 'sw-' + w[0] + '.webp)"></button>').join('');
    $('#pmSwl').textContent = 'Finitura: ' + WOOD[0][1] + (cur.alt ? ' · scegli «Fumoso» per vederne le foto' : '');
  } else { $('#pmSwWrap').hidden = true; }
  renderModalPrice();
  openLayer($('#pm'));
}
$('#pmSw').addEventListener('click', e => {
  const b = e.target.closest('[data-w]'); if (!b) return; curWood = b.dataset.w;
  $$('#pmSw [data-w]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  const w = WOOD.find(x => x[0] === curWood);
  $('#pmSwl').textContent = 'Finitura: ' + w[1] + (['intra', 'bianco', 'nero'].includes(curWood) ? ' (+10%)' : '');
  showImgs(gallery(cur, curWood));
});
$('#pmAdd').addEventListener('click', () => {
  if (!cur) return;
  const w = cur.wood ? WOOD.find(x => x[0] === curWood)[1] : '';
  if (mode === 'horeca') addToQuote(cur.id, w); else addToCart(cur.id, w);
  closeLayers();
});

/* ---------- cart ---------- */
const SAMPLES = { legno: { name: 'Campione di legno', price: 3, img: 'sw-naturale' }, tessuto: { name: 'Campione di tessuto', price: 2, img: 'sw-tessuto' } };
function saveCart() { store.set('mc_cart', cart); const n = cart.reduce((s, l) => s + l.q, 0); const b = $('#cartCount'); b.textContent = n; b.dataset.n = n; }
function addLine(line) {
  const ex = cart.find(l => l.key === line.key);
  if (ex) ex.q += line.q; else cart.push(line);
  saveCart();
}
function addToCart(id, wood, q = 1) {
  const p = byId[id]; const w = wood || (p.wood ? 'Naturale' : '');
  addLine({ key: id + '|' + w, id, name: p.name, opt: w ? 'Rovere ' + w.toLowerCase().replace('smalto ', 'smalto ') : p.sub, price: p.price, img: 'p-' + id, q });
  toast(p.name + ' nel carrello');
}
$$('[data-sample]').forEach(b => b.addEventListener('click', () => {
  const s = SAMPLES[b.dataset.sample];
  addLine({ key: 'sample-' + b.dataset.sample, id: 'sample', name: s.name, opt: 'Spedito a casa', price: s.price, img: s.img, q: 1 });
  toast(s.name + ' nel carrello');
}));
function cartTotal() { return cart.reduce((s, l) => s + l.price * l.q, 0); }
function renderCart() {
  const body = $('#cartBody'), foot = $('#cartFoot');
  if (!cart.length) { body.innerHTML = '<p class="empty-state">Il carrello è vuoto.<br>Inizia da un tavolo o dai campioni.</p>'; foot.innerHTML = '<a class="btn btn-green" href="#prodotti" data-close-go>Vai al catalogo</a>'; foot.querySelector('[data-close-go]').addEventListener('click', () => closeLayers(true)); return; }
  body.innerHTML = cart.map((l, i) => '<div class="line"><img src="' + IMG + l.img + '.webp" alt=""><div><b>' + l.name + '</b><small>' + l.opt + '</small><div class="qty"><button data-dq="' + i + '" data-d="-1" aria-label="Diminuisci">−</button><span>' + l.q + '</span><button data-dq="' + i + '" data-d="1" aria-label="Aumenta">+</button></div></div><div class="r">' + eur(l.price * l.q) + '<button class="rm" data-rm="' + i + '">Rimuovi</button></div></div>').join('');
  const t = cartTotal();
  const ship = t >= 3000 ? 'Consegna gratuita in Italia' : 'Mancano ' + eur(3000 - t) + ' alla consegna gratuita';
  foot.innerHTML = '<div class="totrow big"><span>Totale (prezzi da listino)</span><span>' + eur(t) + '</span></div><div class="note">' + ship + '</div><button class="btn btn-green" id="checkout">Ordina <svg><use href="#i-arrow"/></svg></button><button class="btn btn-line" id="toQuote" style="height:44px">Preferisco un preventivo</button>';
  $('#checkout').addEventListener('click', () => mailOrder());
  $('#toQuote').addEventListener('click', () => { cart.forEach(l => { if (l.id !== 'sample') addToQuote(l.id, '', l.q, true); }); closeLayers(true); openQuoteForm(); });
}
$('#cartBody').addEventListener('click', e => {
  const d = e.target.closest('[data-dq]'); if (d) { const l = cart[+d.dataset.dq]; l.q = Math.max(1, l.q + +d.dataset.d); saveCart(); renderCart(); return; }
  const r = e.target.closest('[data-rm]'); if (r) { cart.splice(+r.dataset.rm, 1); saveCart(); renderCart(); }
});
function mailOrder() {
  const lines = cart.map(l => '- ' + l.q + ' × ' + l.name + ' (' + l.opt + '): ' + eur(l.price * l.q)).join('\n');
  const body = 'Buongiorno,\nvorrei ordinare:\n' + lines + '\nTotale da listino: ' + eur(cartTotal()) + '\n\nNome:\nIndirizzo di consegna:\nTelefono:\n';
  location.href = 'mailto:info@mobilicarpazi.it?subject=' + encodeURIComponent('Ordine dal sito') + '&body=' + encodeURIComponent(body);
}

/* ---------- quote (HoReCa) ---------- */
function saveQuote() { store.set('mc_quote', quote); const n = quote.reduce((s, l) => s + l.q, 0); const b = $('#quoteCount'); b.textContent = n; b.dataset.n = n; updateQNote(); }
function addToQuote(id, wood, q, silent) {
  const p = byId[id]; if (!p) return;
  const key = id + '|' + (wood || '');
  const ex = quote.find(l => l.key === key);
  if (ex) ex.q += (q || 10); else quote.push({ key, id, name: p.name, opt: wood ? 'Rovere ' + wood.toLowerCase() : p.sub, img: 'p-' + id, q: q || 10 });
  saveQuote(); if (!silent) toast(p.name + ' nel preventivo');
}
function renderQuote() {
  const body = $('#quoteBody');
  if (!quote.length) { body.innerHTML = '<p class="empty-state">Nessun modello nel preventivo.<br>Passa a «HoReCa» e premi «Preventivo» sui modelli.</p>'; return; }
  body.innerHTML = quote.map((l, i) => '<div class="line"><img src="' + IMG + l.img + '.webp" alt=""><div><b>' + l.name + '</b><small>' + l.opt + '</small><div class="qty"><button data-qq="' + i + '" data-d="-1" aria-label="Diminuisci">−</button><span>' + l.q + '</span><button data-qq="' + i + '" data-d="1" aria-label="Aumenta">+</button></div></div><div class="r">pz<button class="rm" data-qr="' + i + '">Rimuovi</button></div></div>').join('');
}
$('#quoteBody').addEventListener('click', e => {
  const d = e.target.closest('[data-qq]'); if (d) { const l = quote[+d.dataset.qq]; l.q = Math.max(1, l.q + +d.dataset.d); saveQuote(); renderQuote(); return; }
  const r = e.target.closest('[data-qr]'); if (r) { quote.splice(+r.dataset.qr, 1); saveQuote(); renderQuote(); }
});
$('#quoteGo').addEventListener('click', () => { closeLayers(true); openQuoteForm(); });
function quoteText() { return quote.length ? quote.map(l => l.q + ' × ' + l.name + ' (' + l.opt + ')').join('; ') : ''; }
function updateQNote() {
  const t = quoteText();
  $('#qlistNote').textContent = t ? 'Nel preventivo: ' + t : 'Puoi anche passare a «HoReCa» in alto e aggiungere i modelli al preventivo.';
  $('#qmNote').textContent = t ? 'Nel preventivo: ' + t : 'Dicci che locale stai arredando: ti mandiamo prezzi all’ingrosso e proposte.';
}
function openQuoteForm() {
  if (matchMedia('(min-width:761px)').matches) { closeLayers(true); $('#quoteBox').scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => $('#quoteForm [name=nome]').focus({ preventScroll: true }), 500); }
  else openLayer($('#qm'));
}
function bindForm(f) {
  f.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('[required]', f).forEach(i => { const bad = !i.value.trim() || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value)); i.classList.toggle('err', bad); if (bad) ok = false; });
    if (!ok) { toast('Compila nome e email'); return; }
    const d = Object.fromEntries(new FormData(f));
    const body = 'Richiesta listino HoReCa\n\nNome e locale: ' + d.nome + '\nTipo: ' + d.tipo + '\nCittà: ' + (d.citta || '') + '\nEmail: ' + d.email + '\nTelefono: ' + (d.tel || '') + '\nPezzi o coperti: ' + (d.pezzi || '') + (quote.length ? '\nModelli: ' + quoteText() : '') + '\nNote: ' + (d.note || '');
    location.href = 'mailto:info@mobilicarpazi.it?subject=' + encodeURIComponent('Listino HoReCa: ' + d.nome) + '&body=' + encodeURIComponent(body);
  });
}
bindForm($('#quoteForm')); bindForm($('#quoteForm2'));

/* ---------- hero slider ---------- */
const slides = $$('.door-casa .slide'), dots = $$('#dots button');
let si = 0, timer = null;
function caption(i) {
  const p = byId[slides[i].dataset.p];
  $('#capName').textContent = p.name; $('#capSub').textContent = p.sub.toLowerCase();
  $('#capPrice').textContent = 'da ' + eur(p.price); $('#capBtn').dataset.p = p.id;
}
function go(i) {
  si = (i + slides.length) % slides.length;
  slides.forEach((s, k) => s.classList.toggle('on', k === si));
  dots.forEach((d, k) => { d.classList.toggle('on', k === si); const n = d.querySelector('i'); n.replaceWith(n.cloneNode()); });
  const img = slides[si].querySelector('img'); if (img.loading === 'lazy') img.loading = 'eager';
  caption(si);
}
function auto() { clearInterval(timer); if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(() => go(si + 1), 6000); }
dots.forEach((d, k) => d.addEventListener('click', () => { go(k); auto(); }));
$('#capBtn').addEventListener('click', e => openProduct(e.currentTarget.dataset.p || 'johnson'));
const casa = $('#casa');
casa.addEventListener('mouseenter', () => { clearInterval(timer); casa.classList.add('paused'); });
casa.addEventListener('mouseleave', () => { casa.classList.remove('paused'); auto(); });
let tx = null;
casa.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
casa.addEventListener('touchend', e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 40) { go(si + (dx < 0 ? 1 : -1)); auto(); } tx = null; });
caption(0); auto();

/* ---------- set builder ---------- */
const SET_T = ['johnson', 'frankfurt', 'garda', 'fabio'], SET_C = ['mario', 'polo', 'chicago', 'borys'];
let sT = 'johnson', sC = 'mario', sN = 6;
function opt(id, sel) { const p = byId[id]; return '<button class="opt" role="radio" aria-checked="' + sel + '" data-id="' + id + '"><img src="' + IMG + 'p-' + id + '.webp" alt="" loading="lazy" width="640" height="480"><span>' + p.name + '</span><small>' + eur(p.price) + '</small></button>'; }
function renderSet() {
  $('#setTables').innerHTML = SET_T.map(id => opt(id, id === sT)).join('');
  $('#setChairsOpt').innerHTML = SET_C.map(id => opt(id, id === sC)).join('');
  $$('#setN [data-n]').forEach(b => b.setAttribute('aria-checked', String(+b.dataset.n === sN)));
  $('#setImg').src = IMG + 'g-' + sT + '-0.webp'; $('#setImg').alt = 'Tavolo ' + byId[sT].name;
  $('#setChairs').innerHTML = Array.from({ length: sN }, () => '<span><img src="' + IMG + 'p-' + sC + '.webp" alt=""></span>').join('');
  const t = byId[sT], c = byId[sC], tot = t.price + c.price * sN;
  $('#setSum').innerHTML = '<div><span>Tavolo ' + t.name + '</span><span>' + eur(t.price) + '</span></div><div><span>' + sN + ' × sedia ' + c.name + '</span><span>' + eur(c.price * sN) + '</span></div><div class="tot"><span>Totale da listino</span><b>' + eur(tot) + '</b></div><div class="ship">' + (tot >= 3000 ? 'Consegna gratuita in Italia' : 'Consegna da 30 €, gratuita da 3.000 € · mancano ' + eur(3000 - tot)) + '</div>';
}
$('#setTables').addEventListener('click', e => { const b = e.target.closest('[data-id]'); if (b) { sT = b.dataset.id; renderSet(); } });
$('#setChairsOpt').addEventListener('click', e => { const b = e.target.closest('[data-id]'); if (b) { sC = b.dataset.id; renderSet(); } });
$('#setN').addEventListener('click', e => { const b = e.target.closest('[data-n]'); if (b) { sN = +b.dataset.n; renderSet(); } });
$('#setAdd').addEventListener('click', () => {
  if (mode === 'horeca') { addToQuote(sT, '', 1, true); addToQuote(sC, '', sN, true); toast('Set nel preventivo'); return; }
  addToCart(sT); addToCart(sC, '', sN); toast('Set nel carrello: ' + byId[sT].name + ' + ' + sN + ' sedie ' + byId[sC].name);
});

/* ---------- finishes ---------- */
$('#swGrid').innerHTML = WOOD.map((w, i) => '<button class="sw" data-sw="' + w[0] + '" aria-pressed="' + (i === 0) + '"><img src="' + IMG + 'sw-' + w[0] + '.webp" alt="" loading="lazy" width="200" height="200">' + w[1] + (['intra', 'bianco', 'nero'].includes(w[0]) ? '<small>+10%</small>' : '') + '</button>').join('');
$('#swGrid').addEventListener('click', e => {
  const b = e.target.closest('[data-sw]'); if (!b) return;
  $$('#swGrid [data-sw]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  const w = WOOD.find(x => x[0] === b.dataset.sw);
  const big = $('#swBig'); big.querySelector('img').src = IMG + 'sw-' + w[0] + '.webp'; big.querySelector('img').alt = 'Campione della finitura ' + w[1];
  big.querySelector('b').textContent = w[1]; big.querySelector('p').textContent = w[2];
});

/* ---------- search ---------- */
const q = $('#q'), sug = $('#suggest');
const CATS = [['Tavoli allungabili', 'tavoli:allungabile'], ['Tavoli rotondi e ovali', 'tavoli:rotondo'], ['Tavoli per ristoranti e bar', 'tavoli:horeca'], ['Sedie in legno', 'sedie:legno'], ['Sedie imbottite', 'sedie:imbottita'], ['Sedie con braccioli', 'sedie:braccioli'], ['Sgabelli', 'sgabelli:all'], ['Divani e panche', 'divani:all'], ['Credenze', 'credenze:all'], ['Orologi in legno', 'credenze:orologi']];
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
let act = -1, results = [];
function hideSuggest() { sug.classList.remove('on'); act = -1; }
function search(v) {
  const t = norm(v.trim()); if (!t) { hideSuggest(); return; }
  const words = t.split(/\s+/);
  const hit = s => words.every(w => norm(s).includes(w) || (w.length > 3 && norm(s).includes(w.slice(0, -1))));
  const cats = CATS.filter(c => hit(c[0])).slice(0, 3).map(c => ({ type: 'c', c }));
  const prods = P.filter(p => hit(p.name + ' ' + p.sub + ' ' + p.size + ' ' + p.cat + ' ' + p.tags.join(' '))).slice(0, 6).map(p => ({ type: 'p', p }));
  results = cats.concat(prods);
  sug.innerHTML = results.length ? results.map((r, i) => r.type === 'c'
    ? '<button role="option" data-i="' + i + '"><span class="s-n">' + r.c[0] + '</span><span class="s-p">categoria</span></button>'
    : '<button role="option" data-i="' + i + '"><img src="' + IMG + 'p-' + r.p.id + '.webp" alt=""><span><span class="s-n">' + r.p.name + '</span><span class="s-d">' + r.p.sub + '</span></span><span class="s-p">' + (mode === 'horeca' ? 'HoReCa' : 'da ' + eur(r.p.price)) + '</span></button>').join('')
    : '<div class="empty">Nessun risultato per «' + v.replace(/[<>&"]/g, '') + '». Prova «tavolo», «sedia» o scrivici su WhatsApp.</div>';
  sug.classList.add('on'); act = -1;
}
function pick(i) {
  const r = results[i]; if (!r) return; hideSuggest(); q.blur();
  if (r.type === 'p') openProduct(r.p.id);
  else { const [t, c] = r.c[1].split(':'); setTab(t, c); $('#prodotti').scrollIntoView({ behavior: 'smooth' }); }
}
q.addEventListener('input', () => search(q.value));
q.addEventListener('focus', () => { if (q.value) search(q.value); });
q.addEventListener('keydown', e => {
  const n = results.length; if (!sug.classList.contains('on') || !n) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); act = (act + (e.key === 'ArrowDown' ? 1 : -1) + n) % n; $$('#suggest button').forEach((b, k) => b.classList.toggle('act', k === act)); }
});
sug.addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (b) pick(+b.dataset.i); });
$('#search').addEventListener('submit', e => { e.preventDefault(); if (!q.value.trim()) { q.focus(); return; } search(q.value); pick(act >= 0 ? act : 0); });
document.addEventListener('click', e => { if (!e.target.closest('#search')) hideSuggest(); });

/* ---------- reviews ---------- */
const revs = $$('#revTrack .rev'); let ri = 0;
function rev(i) { ri = (i + revs.length) % revs.length; revs.forEach((r, k) => r.classList.toggle('on', k === ri)); }
$('#revPrev').addEventListener('click', () => rev(ri - 1));
$('#revNext').addEventListener('click', () => rev(ri + 1));

/* ---------- reveal ---------- */
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach(el => io.observe(el));
} else $$('.rv').forEach(el => el.classList.add('in'));

/* ---------- init ---------- */
if (matchMedia('(max-width:760px)').matches) $('#shipDet').open = false;
$('#shipDet summary').addEventListener('click', e => { if (!matchMedia('(max-width:760px)').matches) e.preventDefault(); });
saveCart(); saveQuote(); setTab('tavoli'); renderSet(); setMode(mode, false);
})();
