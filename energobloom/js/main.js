/* SIA EnergoBloom: language switch (LV in the HTML, RU here), menu, call bar, mailto form. No libraries. */
(function () {
  'use strict';
  var MAIL = 'marekorol@inbox.lv';
  var KEY = 'energobloom-lang';

  var RU = {
    skip: 'Перейти к содержанию',
    logoAria: 'SIA EnergoBloom', navAria: 'Разделы', langAria: 'Язык', menuOpen: 'Открыть меню', menuClose: 'Закрыть меню', menuAria: 'Меню',
    nav1: 'Услуги', nav2: 'Как работаем', nav3: 'Обо мне', nav4: 'Контакты',
    riga: 'Рига', call: 'Позвонить',
    h1: 'Проектирование электроустановок в Риге',
    lead: 'Проекты для частных домов и коммерческих помещений. Свой объект вы обсуждаете напрямую с инженером.',
    regShort: 'Рег. №', bisShort: 'в Регистре строительных коммерсантов',
    altHero: 'Инженер за ноутбуком, на столе распечатанные чертежи электроустановок',
    pakH: 'Что мы проектируем',
    pakIntro: 'В Регистре строительных коммерсантов мы зарегистрированы по специальности «проектирование электроустановок». Проектируем электроустановки для жилых домов и коммерческих помещений, а также консультируем, если пока непонятно, с чего начать.',
    s1h: 'Частные дома', s1p: 'Проект электроустановки частного дома: ввод и распределительный щит, освещение, расположение розеток и силовые подключения.',
    s2h: 'Коммерческие помещения и офисы', s2p: 'Офисы, магазины, мастерские и другие коммерческие помещения: электроснабжение, освещение и подключение оборудования.',
    s3h: 'Сети освещения и силовые сети', s3p: 'Группы освещения, силовые сети для оборудования и распределение нагрузок по группам в щите.',
    s4h: 'Консультации', s4p: 'Обсуждаем ваш замысел, существующую электропроводку и то, какой проект понадобится для вашего объекта.',
    alt1: 'Кухня в доме с трековыми светильниками под потолком и большими окнами в сад',
    alt2: 'Три подвесных светильника в коммерческом помещении, за ними световые панели на потолке',
    alt3: 'Ряд автоматических выключателей в распределительном щите с цветными проводами',
    alt4: 'Руки на клавиатуре ноутбука, рядом распечатанный план помещений',
    kaLabel: 'Как мы работаем', kaH: 'От первого звонка до проектной документации',
    k1h: 'Вы звоните или пишете', k1p: 'Расскажите, что за объект и что нужно спроектировать. Можно позвонить, написать в WhatsApp или на e-mail.',
    k2h: 'Обсуждаем объект', k2p: 'Уточняем помещения, оборудование и ваши пожелания. Если есть планы или существующие чертежи, они пригодятся.',
    k3h: 'Проектируем', k3p: 'Готовим проект электроустановки: схемы, планы и расчёты для вашего объекта.',
    k4h: 'Передаём документы', k4p: 'Вы получаете проектную документацию и можете задать вопросы о том, что в ней.',
    alt5: 'Фрагмент электрической схемы на бумаге с выделенными линиями',
    parH: 'Инженер, которому можно позвонить',
    par1: 'Меня зовут Марекс Королс, я инженер-электрик. В своей компании SIA EnergoBloom я занимаюсь проектированием электроустановок.',
    par2: 'Звоня или написав, вы говорите напрямую со мной: о своём объекте, планах и о том, что понадобится в проекте.',
    stampAria: 'Данные компании',
    d1: 'Компания', d2: 'Рег. №', d3: 'Регистр строительных коммерсантов', d3v: 'Зарегистрирована в 2025 году',
    d4: 'Специальность', d4v: 'Проектирование электроустановок', d5: 'Город', d6: 'Инженер', d6v: 'Марекс Королс, инженер-электрик',
    konH: 'Расскажите о своём объекте', konIntro: 'Позвоните или напишите в WhatsApp. Если удобнее, заполните форму или напишите на e-mail.',
    pName: 'Марекс Королс', pRole: 'Инженер-электрик, SIA EnergoBloom', lEmail: 'E-mail', lCity: 'Город',
    fH: 'Напишите сообщение', fName: 'Имя', fContact: 'Телефон или e-mail', fObj: 'Объект', opt: '(необязательно)',
    o0: 'Выберите', o1: 'Частный дом', o2: 'Коммерческое помещение или офис', o3: 'Другое',
    fMsg: 'Сообщение', fMsgPh: 'Коротко опишите объект и что нужно спроектировать.',
    fSend: 'Отправить сообщение', fNote: 'Кнопка откроет вашу почтовую программу с готовым письмом.',
    fStatus: 'Ваша почтовая программа должна открыться с готовым письмом. Если она не открылась, напишите на этот адрес:',
    copyAddr: 'Копировать адрес', copyText: 'Копировать текст сообщения',
    ftrLine: 'Проектирование электроустановок · Рига', toTop: 'Наверх'
  };
  var EXTRA = {
    lv: { menuClose: 'Aizvērt izvēlni', title: 'Elektroietaišu projektēšana Rīgā | SIA EnergoBloom',
      desc: 'SIA EnergoBloom: elektroietaišu projekti privātmājām un komerctelpām Rīgā. Apgaismojuma un spēka tīklu projekti, konsultācijas. Tālr. +371 25 986 657.',
      ogDesc: 'Elektroietaišu projekti privātmājām un komerctelpām. Zvaniet: +371 25 986 657.',
      ogAlt: 'SIA EnergoBloom: elektroietaišu projektēšana Rīgā',
      eName: 'Ierakstiet savu vārdu.', eContact: 'Ierakstiet tālruni vai e-pastu.', eContactBad: 'Pārbaudiet tālruni vai e-pastu.', eMsg: 'Uzrakstiet dažus vārdus par objektu.',
      subj: 'Ziņa no mājaslapas: ', bName: 'Vārds', bContact: 'Tālrunis vai e-pasts', bObj: 'Objekts',
      copiedAddr: 'Adrese nokopēta.', copiedText: 'Ziņas teksts nokopēts. Ielīmējiet to jaunā vēstulē.', copyFail: 'Neizdevās nokopēt. Iezīmējiet adresi un nokopējiet to.' },
    ru: { title: 'Проектирование электроустановок в Риге | SIA EnergoBloom',
      desc: 'SIA EnergoBloom: проекты электроустановок для частных домов и коммерческих помещений в Риге. Сети освещения и силовые сети, консультации. Тел. +371 25 986 657.',
      ogDesc: 'Проекты электроустановок для частных домов и коммерческих помещений. Звоните: +371 25 986 657.',
      ogAlt: 'SIA EnergoBloom: проектирование электроустановок в Риге',
      eName: 'Укажите имя.', eContact: 'Укажите телефон или e-mail.', eContactBad: 'Проверьте телефон или e-mail.', eMsg: 'Напишите пару слов об объекте.',
      subj: 'Сообщение с сайта: ', bName: 'Имя', bContact: 'Телефон или e-mail', bObj: 'Объект',
      copiedAddr: 'Адрес скопирован.', copiedText: 'Текст сообщения скопирован. Вставьте его в новое письмо.', copyFail: 'Не удалось скопировать. Выделите адрес и скопируйте его.' }
  };

  var root = document.documentElement;
  var LV = {}, lang = 'lv';
  var q = function (s, c) { return (c || document).querySelector(s); };
  var qa = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // snapshot the Latvian texts from the HTML
  qa('[data-t]').forEach(function (el) { LV[el.getAttribute('data-t')] = el.innerHTML; });
  qa('[data-t-alt]').forEach(function (el) { LV[el.getAttribute('data-t-alt')] = el.getAttribute('alt'); });
  qa('[data-t-aria]').forEach(function (el) { LV[el.getAttribute('data-t-aria')] = el.getAttribute('aria-label'); });
  qa('[data-t-ph]').forEach(function (el) { LV[el.getAttribute('data-t-ph')] = el.getAttribute('placeholder'); });
  LV.menuOpen = q('.menu-btn').getAttribute('aria-label');

  function t(k) { return lang === 'ru' ? (RU[k] != null ? RU[k] : EXTRA.ru[k]) : (LV[k] != null ? LV[k] : EXTRA.lv[k]); }
  function x(k) { return EXTRA[lang][k]; }
  function meta(sel, v) { var m = q(sel); if (m) m.setAttribute('content', v); }

  function apply(l, save) {
    lang = l === 'ru' ? 'ru' : 'lv';
    root.lang = lang;
    qa('[data-t]').forEach(function (el) { var v = t(el.getAttribute('data-t')); if (v != null) el.innerHTML = v; });
    qa('[data-t-alt]').forEach(function (el) { el.setAttribute('alt', t(el.getAttribute('data-t-alt'))); });
    qa('[data-t-aria]').forEach(function (el) { el.setAttribute('aria-label', t(el.getAttribute('data-t-aria'))); });
    qa('[data-t-ph]').forEach(function (el) { el.setAttribute('placeholder', t(el.getAttribute('data-t-ph'))); });
    qa('.lang__b').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang)); });
    document.title = x('title');
    meta('meta[name="description"]', x('desc'));
    meta('meta[property="og:title"]', x('title'));
    meta('meta[property="og:description"]', x('ogDesc'));
    meta('meta[property="og:image:alt"]', x('ogAlt'));
    meta('meta[property="og:locale"]', lang === 'ru' ? 'ru_RU' : 'lv_LV');
    meta('meta[property="og:locale:alternate"]', lang === 'ru' ? 'lv_LV' : 'ru_RU');
    setMenu(menuOpen, true);
    refreshErrors();
    refreshCopied();
    if (save) {
      try { localStorage.setItem(KEY, lang); } catch (e) { /* storage blocked: the page still works */ }
      try {
        var u = new URL(location.href);
        if (lang === 'ru') u.searchParams.set('lang', 'ru'); else u.searchParams.delete('lang');
        history.replaceState(null, '', u.pathname + u.search + u.hash);
      } catch (e) { /* file:// or old browser */ }
    }
  }

  // ---------- menu ----------
  var menuBtn = q('.menu-btn'), menu = q('#menu'), menuOpen = false;
  function setMenu(open, quiet) {
    menuOpen = !!open;
    menu.hidden = !menuOpen;
    menuBtn.setAttribute('aria-expanded', String(menuOpen));
    menuBtn.setAttribute('aria-label', t(menuOpen ? 'menuClose' : 'menuOpen'));
    root.style.overflow = menuOpen ? 'hidden' : '';
    if (menuOpen && !quiet) { var f = q('a', menu); if (f) f.focus(); }
  }
  menuBtn.addEventListener('click', function () { setMenu(!menuOpen); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false, true); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) { setMenu(false, true); menuBtn.focus(); } });
  document.addEventListener('click', function (e) { if (menuOpen && !e.target.closest('#menu') && !e.target.closest('.menu-btn')) setMenu(false, true); });
  window.addEventListener('resize', function () { if (menuOpen && window.innerWidth >= 1024) setMenu(false, true); });

  // ---------- language ----------
  qa('.lang__b').forEach(function (b) { b.addEventListener('click', function () { apply(b.getAttribute('data-lang'), true); }); });

  // ---------- call bar: on once the hero buttons scrolled away, off over contacts and footer ----------
  var bar = q('#callbar');
  if ('IntersectionObserver' in window && bar) {
    var heroSeen = true, endSeen = false;
    var upd = function () {
      var on = !heroSeen && !endSeen;
      bar.classList.toggle('is-on', on);
      bar.setAttribute('aria-hidden', String(!on));
      qa('a', bar).forEach(function (a) { a.tabIndex = on ? 0 : -1; });
    };
    new IntersectionObserver(function (es) { es.forEach(function (e) { heroSeen = e.isIntersecting || e.boundingClientRect.top > 0; }); upd(); }).observe(q('.hero__cta'));
    var vis = {};
    var endObs = new IntersectionObserver(function (es) { es.forEach(function (e) { vis[e.target.id] = e.isIntersecting; }); endSeen = !!(vis.kontakti || vis.kajene); upd(); });
    endObs.observe(q('#kontakti')); endObs.observe(q('#kajene'));
  }

  // ---------- form: checks, mailto, address box with copy buttons ----------
  var form = q('#forma'), fName = q('#f-name'), fContact = q('#f-contact'), fObj = q('#f-obj'), fMsg = q('#f-msg');
  var done = q('#f-done'), copied = q('#f-copied');
  var errState = {}, copiedKey = '', lastText = '';
  function showErr(input, key) {
    var p = q('#e-' + input.id.slice(2));
    errState[input.id] = key;
    if (key) { p.textContent = x(key); p.hidden = false; input.setAttribute('aria-invalid', 'true'); }
    else { p.textContent = ''; p.hidden = true; input.removeAttribute('aria-invalid'); }
  }
  function refreshErrors() { Object.keys(errState).forEach(function (id) { if (errState[id]) showErr(q('#' + id), errState[id]); }); }
  function refreshCopied() { if (copiedKey) copied.textContent = x(copiedKey); }
  function contactOk(v) {
    if (/@/.test(v)) return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    var d = v.replace(/\D/g, '');
    return d.length >= 7 && d.length <= 15;
  }
  function buildText() {
    var obj = fObj.value ? fObj.options[fObj.selectedIndex].text : '';
    var lines = [x('bName') + ': ' + fName.value.trim(), x('bContact') + ': ' + fContact.value.trim()];
    if (obj) lines.push(x('bObj') + ': ' + obj);
    return { subject: x('subj') + fName.value.trim(), body: lines.join('\n') + '\n\n' + fMsg.value.trim() };
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var first = null;
    var n = fName.value.trim(), c = fContact.value.trim(), m = fMsg.value.trim();
    showErr(fName, n ? '' : 'eName'); if (!n) first = first || fName;
    showErr(fContact, !c ? 'eContact' : (contactOk(c) ? '' : 'eContactBad')); if (!c || !contactOk(c)) first = first || fContact;
    showErr(fMsg, m ? '' : 'eMsg'); if (!m) first = first || fMsg;
    if (first) { done.hidden = true; copiedKey = ''; copied.textContent = ''; first.focus(); return; }
    var mail = buildText();
    lastText = mail.subject + '\n\n' + mail.body;
    done.hidden = false; copiedKey = ''; copied.textContent = '';
    var link = document.createElement('a');
    link.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(mail.subject) + '&body=' + encodeURIComponent(mail.body);
    link.hidden = true; document.body.appendChild(link); link.click(); document.body.removeChild(link);
  });
  [fName, fContact, fMsg].forEach(function (el) { el.addEventListener('input', function () { if (errState[el.id]) showErr(el, ''); }); });

  function copy(text, okKey) {
    var fallback = function () {
      var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta); copiedKey = ok ? okKey : 'copyFail'; refreshCopied();
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { copiedKey = okKey; refreshCopied(); }, fallback);
    } else fallback();
  }
  q('#copy-addr').addEventListener('click', function () { copy(MAIL, 'copiedAddr'); });
  q('#copy-text').addEventListener('click', function () { copy(lastText || buildText().subject, 'copiedText'); });

  // ---------- start: ?lang= first, then the saved choice, else Latvian ----------
  var start = 'lv';
  try { var p = new URLSearchParams(location.search).get('lang'); if (p === 'ru' || p === 'lv') start = p; else { var s = localStorage.getItem(KEY); if (s === 'ru' || s === 'lv') start = s; } }
  catch (e) { /* storage blocked */ }
  if (start !== 'lv') apply(start, false);
})();
