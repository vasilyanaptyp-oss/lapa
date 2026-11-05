/* Kalkara Sailing School | first version.
   The working name lives here in one place: SITE.name. */
(function () {
  "use strict";

  var SITE = {
    name: "Kalkara Sailing School",
    phone: "+37127422801",
    wa: "https://wa.me/37127422801"
  };

  var I18N = {
    en: {
      "meta.title": "Kalkara Sailing School | learn to sail in Malta",
      "meta.desc": "Sailing school at Marina Kalkara, Malta. Beginner courses, sail training, regatta and racing training, qualification upgrade courses and private lessons. Book a lesson on WhatsApp.",
      "skip": "Skip to booking form",
      "nav.courses": "Courses", "nav.how": "How it works", "nav.location": "Location", "nav.book": "Book",
      "hero.eyebrow": "Marina Kalkara · Malta",
      "hero.h1": "Learn to sail on the Grand Harbour",
      "hero.lead": "A sailing school at Marina Kalkara, Malta. Trainings on the water, regattas and qualification courses for anyone who wants to handle a boat with confidence.",
      "hero.book": "Book a lesson",
      "hero.wa": "WhatsApp",
      "ticker.a": "Beginner courses", "ticker.b": "Sail training", "ticker.c": "Regattas",
      "ticker.d": "Qualification upgrade", "ticker.e": "Private lessons",
      "courses.eyebrow": "What you can learn",
      "courses.h2": "Courses on the water",
      "courses.lead": "Five ways to start or to move forward. Every course is taught on the boat, in the harbour and outside it.",
      "price": "Price on request",
      "ask": "Ask about this course",
      "c1.t": "Learn to sail",
      "c1.d": "Your first days on the water: handling the boat, setting the sails and moving safely around the deck, with an instructor beside you.",
      "c2.t": "Sail training",
      "c2.d": "Sessions for sailors who already know the basics: boat speed, sail trim, crew work and sailing in stronger weather.",
      "c3.t": "Regatta and racing training",
      "c3.d": "Training for the start line: tactics, racing rules, manoeuvres and crew roles, with sessions run in racing mode.",
      "c4.t": "Qualification upgrade courses",
      "c4.d": "For sailors moving to a larger boat or taking on more responsibility. We agree the programme with you before the first session.",
      "c5.t": "Private lessons",
      "c5.d": "One to one, or with your own group, at your pace and on the dates that suit you.",
      "how.eyebrow": "How it works",
      "how.h2": "Three steps from here to the water",
      "s1.t": "Choose your course and date",
      "s1.d": "Pick a course and a date that suits you and send the form. If you are not sure yet, write to us and we will suggest the right course.",
      "s2.t": "We confirm on WhatsApp",
      "s2.d": "We answer on WhatsApp, agree the time and place with you, and tell you what to bring.",
      "s3.t": "Meet at Marina Kalkara",
      "s3.d": "We meet you at the marina in Kalkara, Malta. On the boat, the instructor goes through the plan for the day.",
      "band": "Beginners are welcome.",
      "loc.eyebrow": "Where we sail",
      "loc.h2": "Marina Kalkara, Malta",
      "loc.p": "The school is based at Marina Kalkara in Kalkara, on the Grand Harbour, a few minutes from Valletta. The harbour itself is where most of the training happens.",
      "loc.f1k": "Address", "loc.f2k": "WhatsApp", "loc.dir": "Get directions",
      "book.eyebrow": "Booking",
      "book.h2": "Book a lesson",
      "book.p": "Tell us what you would like to sail and when. The message goes straight to the school's WhatsApp, and we answer there.",
      "book.alt": "Prefer to write first? You can also message us on WhatsApp without filling the form.",
      "form.course": "Course", "form.choose": "Choose a course", "form.unsure": "Not sure yet",
      "form.date": "Preferred date", "form.people": "Number of people", "form.name": "Your name",
      "form.phone": "Phone or WhatsApp",
      "form.email": "E-mail", "form.optional": "(optional)", "form.msg": "Message",
      "form.msgph": "Experience so far, questions, anything we should know.",
      "form.send": "Send on WhatsApp",
      "form.note": "Nothing is sent until you press send in WhatsApp.",
      "form.err.required": "Please fill in the fields marked in red.",
      "form.err.people": "Number of people must be between 1 and 20.",
      "ftr.loc": "Marina Kalkara, Kalkara, Malta",
      "msg.title": "Booking request, Kalkara Sailing School",
      "msg.course": "Course", "msg.date": "Date", "msg.people": "People", "msg.name": "Name",
      "msg.phone": "Phone", "msg.email": "E-mail", "msg.note": "Message"
    },
    lv: {
      "meta.title": "Kalkara Sailing School | mācies burāt Maltā",
      "meta.desc": "Burāšanas skola Marina Kalkara, Maltā. Kursi iesācējiem, burāšanas treniņi, regates un kvalifikācijas celšanas kursi, privātstundas. Piesakies WhatsApp.",
      "skip": "Pāriet uz pieteikuma formu",
      "nav.courses": "Kursi", "nav.how": "Kā tas notiek", "nav.location": "Atrašanās vieta", "nav.book": "Pieteikties",
      "hero.eyebrow": "Marina Kalkara · Malta",
      "hero.h1": "Mācies burāt Lielajā ostā",
      "hero.lead": "Burāšanas skola Marina Kalkara, Maltā. Treniņi uz ūdens, regates un kvalifikācijas kursi visiem, kuri grib droši vadīt laivu.",
      "hero.book": "Pieteikties nodarbībai",
      "hero.wa": "WhatsApp",
      "ticker.a": "Kursi iesācējiem", "ticker.b": "Burāšanas treniņi", "ticker.c": "Regates",
      "ticker.d": "Kvalifikācijas celšana", "ticker.e": "Privātstundas",
      "courses.eyebrow": "Ko var apgūt",
      "courses.h2": "Kursi uz ūdens",
      "courses.lead": "Pieci veidi, kā sākt vai virzīties tālāk. Katrs kurss notiek uz laivas, ostā un ārpus tās.",
      "price": "Cena pēc pieprasījuma",
      "ask": "Jautāt par šo kursu",
      "c1.t": "Mācies burāt",
      "c1.d": "Pirmās dienas uz ūdens: laivas vadīšana, buru pacelšana un droša pārvietošanās pa klāju kopā ar instruktoru blakus.",
      "c2.t": "Burāšanas treniņi",
      "c2.d": "Nodarbības tiem, kas pamatus jau zina: laivas ātrums, buru regulēšana, komandas darbs un burāšana stiprākā vējā.",
      "c3.t": "Regates un sacīkšu treniņi",
      "c3.d": "Treniņi starta līnijai: taktika, sacīkšu noteikumi, manevri un komandas lomas, nodarbības sacīkšu režīmā.",
      "c4.t": "Kvalifikācijas celšanas kursi",
      "c4.d": "Tiem, kas pāriet uz lielāku laivu vai uzņemas lielāku atbildību. Programmu saskaņojam ar jums pirms pirmās nodarbības.",
      "c5.t": "Privātstundas",
      "c5.d": "Individuāli vai ar savu grupu, savā tempā un sev ērtos datumos.",
      "how.eyebrow": "Kā tas notiek",
      "how.h2": "Trīs soļi līdz ūdenim",
      "s1.t": "Izvēlies kursu un datumu",
      "s1.d": "Izvēlies kursu un sev ērtu datumu un nosūti pieteikumu. Ja vēl neesi pārliecināts, raksti mums, un mēs ieteiksim piemērotāko kursu.",
      "s2.t": "Apstiprinām WhatsApp",
      "s2.d": "Atbildam WhatsApp, saskaņojam laiku un vietu un pasakām, kas līdzi jāņem.",
      "s3.t": "Tiekamies Marina Kalkara ostā",
      "s3.d": "Tiekamies ostā Kalkarā, Maltā. Uz laivas instruktors izstāsta dienas plānu.",
      "band": "Iesācēji ir gaidīti.",
      "loc.eyebrow": "Kur mēs burājam",
      "loc.h2": "Marina Kalkara, Malta",
      "loc.p": "Skola atrodas Kalkarā, Marina Kalkara ostā, Lielajā ostā, dažu minūšu attālumā no Valletas. Lielākā daļa treniņu notiek tieši ostā.",
      "loc.f1k": "Adrese", "loc.f2k": "WhatsApp", "loc.dir": "Atvērt maršrutu",
      "book.eyebrow": "Pieteikšanās",
      "book.h2": "Piesakies nodarbībai",
      "book.p": "Pastāsti, ko gribi burāt un kad. Ziņa aiziet tieši skolas WhatsApp, un tur arī atbildam.",
      "book.alt": "Gribi vispirms vienkārši uzrakstīt? Vari rakstīt WhatsApp arī bez formas.",
      "form.course": "Kurss", "form.choose": "Izvēlies kursu", "form.unsure": "Vēl neesmu pārliecināts",
      "form.date": "Vēlamais datums", "form.people": "Cilvēku skaits", "form.name": "Tavs vārds",
      "form.phone": "Tālrunis vai WhatsApp",
      "form.email": "E-pasts", "form.optional": "(nav obligāts)", "form.msg": "Ziņa",
      "form.msgph": "Pieredze līdz šim, jautājumi, viss, kas mums jāzina.",
      "form.send": "Nosūtīt uz WhatsApp",
      "form.note": "Nekas netiek nosūtīts, kamēr neuzspiedīsi nosūtīt WhatsApp.",
      "form.err.required": "Lūdzu, aizpildi sarkanā atzīmētos laukus.",
      "form.err.people": "Cilvēku skaitam jābūt no 1 līdz 20.",
      "ftr.loc": "Marina Kalkara, Kalkara, Malta",
      "msg.title": "Pieteikums, Kalkara Sailing School",
      "msg.course": "Kurss", "msg.date": "Datums", "msg.people": "Cilvēki", "msg.name": "Vārds",
      "msg.phone": "Tālrunis", "msg.email": "E-pasts", "msg.note": "Ziņa"
    },
    ru: {
      "meta.title": "Kalkara Sailing School | научиться ходить под парусом на Мальте",
      "meta.desc": "Школа парусного спорта Marina Kalkara, Мальта. Курсы для начинающих, тренировки на воде, регаты и гонки, курсы повышения квалификации, частные уроки. Запись в WhatsApp.",
      "skip": "Перейти к форме записи",
      "nav.courses": "Курсы", "nav.how": "Как это работает", "nav.location": "Где мы", "nav.book": "Записаться",
      "hero.eyebrow": "Marina Kalkara · Мальта",
      "hero.h1": "Научитесь ходить под парусом в Большой гавани",
      "hero.lead": "Школа парусного спорта в Marina Kalkara, Мальта. Тренировки на воде, регаты и курсы повышения квалификации для всех, кто хочет уверенно управлять лодкой.",
      "hero.book": "Записаться на занятие",
      "hero.wa": "WhatsApp",
      "ticker.a": "Курсы для начинающих", "ticker.b": "Тренировки на воде", "ticker.c": "Регаты",
      "ticker.d": "Повышение квалификации", "ticker.e": "Частные уроки",
      "courses.eyebrow": "Чему можно научиться",
      "courses.h2": "Курсы на воде",
      "courses.lead": "Пять способов начать или пойти дальше. Каждый курс проходит на лодке, в гавани и за её пределами.",
      "price": "Цена по запросу",
      "ask": "Спросить об этом курсе",
      "c1.t": "Научиться ходить под парусом",
      "c1.d": "Первые дни на воде: управление лодкой, постановка парусов и безопасное перемещение по палубе рядом с инструктором.",
      "c2.t": "Тренировки на воде",
      "c2.d": "Занятия для тех, кто уже знает основы: скорость лодки, настройка парусов, работа в экипаже и ход в сильный ветер.",
      "c3.t": "Регаты и гоночные тренировки",
      "c3.d": "Подготовка к стартовой линии: тактика, гоночные правила, манёвры и роли в экипаже, занятия в гоночном режиме.",
      "c4.t": "Курсы повышения квалификации",
      "c4.d": "Для тех, кто переходит на большую лодку или берёт на себя больше ответственности. Программу согласуем с вами до первого занятия.",
      "c5.t": "Частные уроки",
      "c5.d": "Индивидуально или своей группой, в своём темпе и в удобные вам даты.",
      "how.eyebrow": "Как это работает",
      "how.h2": "Три шага до воды",
      "s1.t": "Выберите курс и дату",
      "s1.d": "Выберите курс и удобную дату и отправьте заявку. Если ещё не определились, напишите нам, и мы подскажем подходящий курс.",
      "s2.t": "Подтверждаем в WhatsApp",
      "s2.d": "Отвечаем в WhatsApp, согласуем время и место и говорим, что взять с собой.",
      "s3.t": "Встречаемся в Marina Kalkara",
      "s3.d": "Встречаемся в марине в Калкаре, Мальта. На лодке инструктор рассказывает план на день.",
      "band": "Новичкам здесь рады.",
      "loc.eyebrow": "Где мы ходим",
      "loc.h2": "Marina Kalkara, Мальта",
      "loc.p": "Школа находится в Marina Kalkara в Калкаре, в Большой гавани, в нескольких минутах от Валлетты. Большая часть тренировок проходит прямо в гавани.",
      "loc.f1k": "Адрес", "loc.f2k": "WhatsApp", "loc.dir": "Построить маршрут",
      "book.eyebrow": "Запись",
      "book.h2": "Записаться на занятие",
      "book.p": "Расскажите, на чём хотите ходить и когда. Сообщение уходит прямо в WhatsApp школы, там мы и отвечаем.",
      "book.alt": "Хотите сначала просто написать? Можно написать в WhatsApp и без формы.",
      "form.course": "Курс", "form.choose": "Выберите курс", "form.unsure": "Пока не уверен",
      "form.date": "Желаемая дата", "form.people": "Сколько человек", "form.name": "Ваше имя",
      "form.phone": "Телефон или WhatsApp",
      "form.email": "E-mail", "form.optional": "(необязательно)", "form.msg": "Сообщение",
      "form.msgph": "Опыт до этого, вопросы, всё, что нам стоит знать.",
      "form.send": "Отправить в WhatsApp",
      "form.note": "Ничего не отправляется, пока вы не нажмёте отправить в WhatsApp.",
      "form.err.required": "Заполните поля, отмеченные красным.",
      "form.err.people": "Количество человек должно быть от 1 до 20.",
      "ftr.loc": "Marina Kalkara, Kalkara, Malta",
      "msg.title": "Заявка, Kalkara Sailing School",
      "msg.course": "Курс", "msg.date": "Дата", "msg.people": "Человек", "msg.name": "Имя",
      "msg.phone": "Телефон", "msg.email": "E-mail", "msg.note": "Сообщение"
    }
  };

  var LANG_KEY = "kalkara-lang";
  var current = "en";

  function t(key) {
    var d = I18N[current] || I18N.en;
    return Object.prototype.hasOwnProperty.call(d, key) ? d[key] : (I18N.en[key] || key);
  }

  /* ---------- language ---------- */
  function apply(lang, store) {
    if (!I18N[lang]) lang = "en";
    current = lang;
    document.documentElement.lang = lang;
    document.title = t("meta.title");

    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", t("meta.desc"));
    var ogt = document.querySelector('meta[property="og:title"]');
    if (ogt) ogt.setAttribute("content", t("meta.title"));
    var ogd = document.querySelector('meta[property="og:description"]');
    if (ogd) ogd.setAttribute("content", t("meta.desc"));

    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute("data-i18n");
      var val = t(key);
      var attr = el.getAttribute("data-i18n-attr");
      if (attr) {
        var parts = attr.split(":");
        if (parts.length === 2) el.setAttribute(parts[0], t(parts[1]));
      }
      if (key) el.textContent = val;
    }
    var placeholderNodes = document.querySelectorAll("[data-i18n-attr]");
    for (var j = 0; j < placeholderNodes.length; j++) {
      var pn = placeholderNodes[j];
      var spec = pn.getAttribute("data-i18n-attr").split(":");
      if (spec.length === 2) pn.setAttribute(spec[0], t(spec[1]));
    }

    var buttons = document.querySelectorAll("[data-lang]");
    for (var k = 0; k < buttons.length; k++) {
      buttons[k].setAttribute("aria-pressed", buttons[k].getAttribute("data-lang") === lang ? "true" : "false");
    }
    if (store) {
      try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* private mode */ }
    }
    // keep an already-filled course choice readable
    syncCourseLabel();
  }

  function savedLang() {
    try {
      var v = localStorage.getItem(LANG_KEY);
      if (v && I18N[v]) return v;
    } catch (e) { /* ignore */ }
    var nav = (navigator.language || "en").slice(0, 2).toLowerCase();
    if (I18N[nav]) return nav;
    return "en";
  }

  /* ---------- course select ---------- */
  var courseSelect = document.getElementById("f-course");

  function syncCourseLabel() {
    if (!courseSelect) return;
    var v = courseSelect.value;
    if (!v) return;
    var k = courseKey(v);
    if (!k) return;
    var opt = courseSelect.querySelector('option[value="' + v + '"]');
    if (opt) opt.textContent = t("c" + k + ".t");
  }
  function courseKey(v) {
    return { learn: "1", training: "2", regatta: "3", upgrade: "4", private: "5" }[v] || "";
  }

  /* ---------- form ---------- */
  var form = document.getElementById("bookForm");
  var errorBox = document.getElementById("formError");

  function showError(msg) {
    if (!errorBox) return;
    errorBox.textContent = msg;
    errorBox.hidden = false;
  }
  function clearError() {
    if (errorBox) errorBox.hidden = true;
  }

  function markInvalid(el, bad) {
    if (!el) return;
    if (bad) el.setAttribute("aria-invalid", "true");
    else el.removeAttribute("aria-invalid");
  }

  function validate() {
    var ok = true;
    var required = ["f-course", "f-date", "f-people", "f-name", "f-phone"];
    for (var i = 0; i < required.length; i++) {
      var el = document.getElementById(required[i]);
      if (!el) continue;
      var bad = !el.value || !String(el.value).trim();
      markInvalid(el, bad);
      if (bad) ok = false;
    }
    var people = document.getElementById("f-people");
    if (people && people.value) {
      var n = Number(people.value);
      if (!(n >= 1 && n <= 20)) { markInvalid(people, true); ok = false; showError(t("form.err.people")); return false; }
    }
    var email = document.getElementById("f-email");
    if (email && email.value.trim() && email.value.indexOf("@") < 1) { markInvalid(email, true); ok = false; }
    else markInvalid(email, false);

    if (!ok) showError(t("form.err.required"));
    else clearError();
    return ok;
  }

  function buildMessage() {
    var course = courseSelect ? courseSelect.value : "";
    var courseLabel = "";
    if (course === "unsure") courseLabel = t("form.unsure");
    else if (course) courseLabel = t("c" + courseKey(course) + ".t");

    var rows = [
      t("msg.title"),
      t("msg.course") + ": " + courseLabel,
      t("msg.date") + ": " + (document.getElementById("f-date") || {}).value,
      t("msg.people") + ": " + (document.getElementById("f-people") || {}).value,
      t("msg.name") + ": " + (document.getElementById("f-name") || {}).value,
      t("msg.phone") + ": " + (document.getElementById("f-phone") || {}).value
    ];
    var email = (document.getElementById("f-email") || {}).value;
    if (email) rows.push(t("msg.email") + ": " + email);
    var msg = (document.getElementById("f-msg") || {}).value;
    if (msg && msg.trim()) rows.push(t("msg.note") + ": " + msg.trim());
    return rows.join("\n");
  }

  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!validate()) {
        var firstBad = form.querySelector('[aria-invalid="true"]');
        if (firstBad) firstBad.focus();
        return;
      }
      var url = SITE.wa + "?text=" + encodeURIComponent(buildMessage());
      window.open(url, "_blank", "noopener");
    });
    form.addEventListener("input", function (ev) {
      if (ev.target && ev.target.getAttribute("aria-invalid") === "true") {
        if (String(ev.target.value || "").trim()) markInvalid(ev.target, false);
        if (!form.querySelector('[aria-invalid="true"]')) clearError();
      }
    });
  }

  /* ---------- "ask about this course" ---------- */
  var asks = document.querySelectorAll(".ask");
  for (var a = 0; a < asks.length; a++) {
    asks[a].addEventListener("click", function () {
      var value = this.getAttribute("data-course");
      if (courseSelect) {
        courseSelect.value = value;
        syncCourseLabel();
        markInvalid(courseSelect, false);
      }
      var book = document.getElementById("book");
      if (book) book.scrollIntoView({ behavior: "smooth", block: "start" });
      var date = document.getElementById("f-date");
      if (date) window.setTimeout(function () { date.focus({ preventScroll: true }); }, 420);
    });
  }

  /* ---------- language buttons ---------- */
  var langButtons = document.querySelectorAll("[data-lang]");
  for (var b = 0; b < langButtons.length; b++) {
    langButtons[b].addEventListener("click", function () {
      apply(this.getAttribute("data-lang"), true);
    });
  }

  /* ---------- misc ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // no booking in the past
  var dateField = document.getElementById("f-date");
  if (dateField) {
    var today = new Date();
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    dateField.min = today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate());
  }

  // the hero fills the first screen minus the sticky header
  var hdr = document.getElementById("hdr");
  function setHeaderHeight() {
    if (!hdr) return;
    document.documentElement.style.setProperty("--hdr-h", hdr.offsetHeight + "px");
  }
  setHeaderHeight();
  window.addEventListener("resize", setHeaderHeight);
  window.addEventListener("orientationchange", setHeaderHeight);

  apply(savedLang(), false);
})();
