(function () {
  'use strict';
  var MAIL = 'electric-riga.id@proton.me';
  var RU = {
    title: 'Electric-Riga.id | Электромонтаж в Риге',
    nav1: 'Услуги', nav2: 'Объекты', nav3: 'Как работаем', nav4: 'Контакты',
    eyebrow: 'SIA «Electric-Riga.id» · Рига',
    h1a: 'Электромонтаж', h1b: 'в Риге.',
    sub: 'Монтируем и меняем проводку, собираем щиты, подключаем освещение, делаем замеры и ведём технадзор.',
    call: 'Позвонить', write: 'Написать',
    aboutL: 'О фирме',
    aboutT: 'Делаем электрику в домах, квартирах, магазинах и на производстве в Риге. От первого кабеля до протокола замеров.',
    f1k: 'Реестр строительных фирм', f1v: 'Руководство монтажом электроустановок и технадзор',
    f2k: 'Зарегистрирована', f2v: 'в 2024 году, Рига', f3k: 'Регистрационный номер',
    svcL: 'Услуги', svcH: 'Что делаем',
    s1h: 'Проводка', s1p: 'Монтаж новой проводки и замена старой: кабели, розетки, выключатели, заземление.',
    s2h: 'Щиты', s2p: 'Сборка, монтаж и переделка щитов. Автоматы, УЗО, понятная маркировка.',
    s3h: 'Освещение', s3p: 'Монтаж и подключение света в помещениях и на улице, управление освещением.',
    s4h: 'Подключение к сети', s4p: 'Ввод, учётный щит и подготовка объекта к подключению к электросети.',
    s5h: 'Замеры и протоколы', s5p: 'Замеры сопротивления изоляции, заземления и петли. Результаты оформляем протоколами.',
    s6h: 'Руководство работами и технадзор', s6p: 'Руководим монтажом электроустановок и следим, чтобы работы шли по проекту и нормам.',
    whoL: 'Объекты', whoH: 'Где работаем',
    w1h: 'Частные дома', w1p: 'Новое строительство и реновация',
    w2h: 'Квартиры', w2p: 'Замена проводки во время ремонта',
    w3h: 'Магазины и офисы', w3p: 'Подготовка помещений к работе',
    w4h: 'Производство', w4p: 'Силовые сети и подключение оборудования',
    flowL: 'Порядок работы', flowH: 'Как работаем',
    p1h: 'Связь', p1p: 'Позвоните или напишите и расскажите об объекте.',
    p2h: 'Осмотр и смета', p2p: 'Смотрим объект, согласуем решение и готовим смету.',
    p3h: 'Монтаж', p3p: 'Выполняем работы по согласованному плану.',
    p4h: 'Замеры и сдача', p4p: 'Проверяем проводку, делаем замеры и передаём протоколы.',
    cL: 'Контакты', cH: 'Расскажите об объекте',
    r1k: 'Фирма', r2k: 'Рег. №', r3k: 'Юридический адрес',
    fl1: 'Имя', fl2: 'Телефон или e-mail', fl3: 'Что нужно сделать',
    fbtn: 'Отправить заявку',
    fnote: 'Откроется ваша почтовая программа с готовым письмом.',
    ferr: 'Заполните, пожалуйста, все поля.',
    footC: 'Электромонтаж в Риге', up: 'Наверх',
    subj: 'Заявка с сайта', mName: 'Имя', mContact: 'Контакт', mMsg: 'Что нужно сделать'
  };
  var LV = {
    title: document.title,
    ferr: 'Lūdzu, aizpildiet visus laukus.',
    subj: 'Pieprasījums no mājaslapas', mName: 'Vārds', mContact: 'Kontakti', mMsg: 'Kas jāizdara'
  };
  var nodes = [].slice.call(document.querySelectorAll('[data-i18n]'));
  nodes.forEach(function (n) { LV[n.getAttribute('data-i18n')] = n.textContent; });
  var lang = 'lv';
  function T(k) { return (lang === 'ru' ? RU : LV)[k] || LV[k] || ''; }

  function setLang(l, push) {
    lang = l === 'ru' ? 'ru' : 'lv';
    document.documentElement.lang = lang;
    document.title = T('title');
    nodes.forEach(function (n) { n.textContent = T(n.getAttribute('data-i18n')); });
    [].forEach.call(document.querySelectorAll('.lang a'), function (a) {
      var on = a.getAttribute('data-lang') === lang;
      a.classList.toggle('on', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    var note = document.getElementById('formNote');
    note.classList.remove('err');
    if (push) {
      try {
        var u = new URL(location.href);
        if (lang === 'ru') u.searchParams.set('lang', 'ru'); else u.searchParams.delete('lang');
        history.replaceState(null, '', u.pathname + u.search + u.hash);
      } catch (e) {}
    }
  }
  [].forEach.call(document.querySelectorAll('.lang a'), function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); setLang(a.getAttribute('data-lang'), true); });
  });
  var q = '';
  try { q = new URLSearchParams(location.search).get('lang') || ''; } catch (e) {}
  setLang(q === 'ru' ? 'ru' : 'lv', false);

  // header
  var top = document.getElementById('top');
  function onScroll() { top.classList.toggle('stuck', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // reveal
  var rs = [].slice.call(document.querySelectorAll('[data-r]'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    rs.forEach(function (n) { io.observe(n); });
  } else { rs.forEach(function (n) { n.classList.add('in'); }); }

  // services: list drives the photo
  var items = [].slice.call(document.querySelectorAll('.svc-list li'));
  var pics = [].slice.call(document.querySelectorAll('.frame img'));
  var no = document.getElementById('frameNo');
  function act(k) {
    items.forEach(function (li) { li.classList.toggle('on', li.getAttribute('data-k') === k); });
    pics.forEach(function (im) { im.classList.toggle('on', im.getAttribute('data-k') === k); });
    no.textContent = 'Q' + k;
  }
  items.forEach(function (li) {
    li.addEventListener('mouseenter', function () { act(li.getAttribute('data-k')); });
    li.addEventListener('click', function () { act(li.getAttribute('data-k')); });
  });
  if ('IntersectionObserver' in window) {
    var hovering = false;
    var list = document.querySelector('.svc-list');
    list.addEventListener('mouseenter', function () { hovering = true; });
    list.addEventListener('mouseleave', function () { hovering = false; });
    var so = new IntersectionObserver(function (es) {
      if (hovering) return;
      es.forEach(function (e) { if (e.isIntersecting) act(e.target.getAttribute('data-k')); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach(function (li) { so.observe(li); });
  }

  // form: no server, opens the visitor's mail program
  var form = document.getElementById('form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var note = document.getElementById('formNote');
    var ok = true;
    ['name', 'contact', 'msg'].forEach(function (n) {
      var f = form.elements[n];
      var bad = !f.value.trim();
      f.classList.toggle('bad', bad);
      if (bad) ok = false;
    });
    if (!ok) { note.textContent = T('ferr'); note.classList.add('err'); return; }
    note.textContent = T('fnote'); note.classList.remove('err');
    var body = T('mName') + ': ' + form.elements.name.value.trim() + '\n' +
      T('mContact') + ': ' + form.elements.contact.value.trim() + '\n\n' +
      T('mMsg') + ':\n' + form.elements.msg.value.trim() + '\n';
    var url = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(T('subj')) + '&body=' + encodeURIComponent(body);
    (window.__openMail || function (u) { window.location.href = u; })(url);
  });
})();
