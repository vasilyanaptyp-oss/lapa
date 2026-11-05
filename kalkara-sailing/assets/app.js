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
      "meta.desc": "Sailing school at Marina Kalkara, Malta. Training programmes and ISSA practice courses with an instructor, two yachts, the 2027 racing calendar and VIP charters. Book on WhatsApp.",
      "skip": "Skip to booking form",
      "nav.courses": "Courses", "nav.fleet": "Fleet", "nav.calendar": "Racing 2027", "nav.charters": "Charters",
      "nav.how": "How it works", "nav.location": "Location", "nav.book": "Book",
      "hero.eyebrow": "Marina Kalkara · Malta",
      "hero.h1": "Learn to sail on the Grand Harbour",
      "hero.lead": "A sailing school at Marina Kalkara, Malta. Training on the water, ISSA practice courses, regattas and charters.",
      "hero.book": "Book a lesson",
      "hero.wa": "WhatsApp",
      "ticker.a": "Training programmes", "ticker.b": "ISSA practice", "ticker.c": "Racing calendar 2027",
      "ticker.d": "Bareboat expeditions", "ticker.e": "VIP charters",
      "courses.eyebrow": "What you can learn",
      "courses.h2": "Courses on the water",
      "courses.lead": "Start from zero or sharpen what you already know. Every course runs on the boat, in the harbour and outside it, and the programme is agreed with you before the first session.",
      "price": "Price on request",
      "ask": "Ask about this course",
      "c1.t": "Learn to sail",
      "c1.d": "Your first days on the water: handling the boat, setting the sails and moving safely around the deck, with an instructor beside you.",
      "c2.t": "Sail training",
      "c2.d": "With a trainer on board: team building, sail trimming, and the spinnaker and gennaker course. From half a day to two weeks, solo, double handed or full crew.",
      "c2.price": "Half day from 400 €",
      "c3.t": "ISSA practice with an instructor",
      "c3.d": "Five programmes from Yacht Crew to Boat Master, each with a set number of days on the water and an instructor on board.",
      "c3.price": "From 1 300 € per person",
      "c4.t": "Regatta and racing training",
      "c4.d": "Training for the start line: tactics, racing rules, manoeuvres and crew roles, with sessions run in racing mode.",
      "c5.t": "Private lessons",
      "c5.d": "One to one, or with your own group, at your pace and on the dates that suit you.",
      "tr.eyebrow": "Programmes", "tr.h3": "Sailing training with a trainer",
      "tr.lead": "Team building, sail trimming, spinnaker and gennaker course. Two formats: solo or double handed, and full crew.",
      "tr.duration": "Duration", "tr.solo": "Solo / Double Hand", "tr.crew": "Full Crew",
      "dur.half": "Half day", "dur.1": "1 day", "dur.3": "3 days", "dur.7": "7 days", "dur.2w": "2 weeks",
      "issa.eyebrow": "ISSA programmes", "issa.h3": "ISSA sailing practice with an instructor",
      "issa.lead": "Price per person. Choose the programme by the number of days you want to spend on the water.",
      "issa.vip": "VIP, solo / double hand", "issa.crew": "Full crew (4-6)", "issa.7d": "7 days",
      "issa.14d": "14 days", "issa.10d": "10 days", "issa.ask": "Ask about this programme",
      "issa.note": "ISSA is the sailing schools association whose programmes these courses follow. The practice days are spent on the water with an instructor.",
      "issa.crew.t": "ISSA Yacht Crew, 7 days",
      "issa.inshore.t": "ISSA Inshore Skipper, 14 days",
      "issa.offshore.t": "ISSA Offshore Skipper, 14 days",
      "issa.master.t": "ISSA Boat Master, 14 days",
      "issa.storm.t": "ISSA Storm Training, 10 days",
      "fleet.eyebrow": "The fleet", "fleet.h2": "Two yachts, one school",
      "fleet.lead": "The school fleet: one yacht is set up for racing and training, the other for VIP charters with a captain and a stewardess on board.",
      "boat1.kicker": "Racing and training", "boat2.kicker": "VIP charters with crew",
      "boat2.crew": "Captain and stewardess",
      "boat.note": "Photos of the boat coming soon", "boat.ask": "Ask about this yacht",
      "spec.built": "Built", "spec.cabins": "Cabins", "spec.wc": "WC", "spec.pax": "PAX", "spec.crew": "Crew",
      "how.eyebrow": "How it works",
      "how.h2": "Three steps from here to the water",
      "s1.t": "Choose your course and date",
      "s1.d": "Pick a course and a date that suits you and send the form. If you are not sure yet, write to us and we will suggest the right course.",
      "s2.t": "We confirm on WhatsApp",
      "s2.d": "We answer on WhatsApp, agree the time and place with you, and tell you what to bring.",
      "s3.t": "Meet at Marina Kalkara",
      "s3.d": "We meet you at the marina in Kalkara, Malta. On the boat, the instructor goes through the plan for the day.",
      "cal.eyebrow": "Racing", "cal.h2": "Racing calendar 2027",
      "cal.lead": "Seven races in 2027, from a coastal classic in Malta to the Atlantic crossing. Each price covers the programme, the boat and the crew.",
      "cal.regatta": "Regatta and place", "cal.dates": "Dates", "cal.distance": "Distance",
      "cal.dh": "Double Hand", "cal.fc": "Full Crew", "cal.price": "Price",
      "cal.ask": "Ask about this regatta",
      "place.malta": "Malta", "place.greece": "Greece", "place.genoa": "Genoa / Saint-Tropez",
      "place.malaga": "Malaga", "place.medchamp": "Mediterranean Championship",
      "place.barcelona": "Barcelona", "place.arc": "Las Palmas to Saint Lucia",
      "dist.coastal": "Coastal race", "dist.offshore": "offshore", "dist.ocean": "Ocean race",
      "race.mssr": "Rolex Middle Sea Race, Malta", "race.aegean": "Aegean 600, Greece",
      "race.giraglia": "Giraglia, Genoa / Saint-Tropez", "race.orc": "ORC European Championship, Malaga",
      "race.tregolfi": "Tre Golfi Sailing Week", "race.1000": "1000 nm Race, Barcelona",
      "race.arc": "ARC 2027, Las Palmas to Saint Lucia",
      "ch.eyebrow": "Yacht club and charters", "ch.h2": "Expeditions and charters",
      "ch.lead": "Bareboat expeditions for yacht club members, and VIP charters on “Albachiara” with a captain and a stewardess.",
      "ch.bare.h3": "Bareboat expeditions", "ch.bare.sub": "For yacht club members. Fuel, 300 L, included.",
      "ch.vip.h3": "VIP charters on “Albachiara”", "ch.vip.sub": "With a captain and a stewardess on board.",
      "ch.season": "Season", "ch.week": "Weekly", "ch.week2": "Week", "ch.10": "10 days", "ch.day": "Day",
      "ch.ask": "Ask about a charter",
      "ch.note": "Prices are for the whole boat, not per person. The seasons repeat every year on the same dates.",
      "season.low": "Low", "season.mid": "Mid", "season.high": "High",
      "band": "Beginners are welcome.",
      "loc.eyebrow": "Where we sail",
      "loc.h2": "Marina Kalkara, Malta",
      "loc.p": "The school is based at Marina Kalkara in Kalkara, on the Grand Harbour, a few minutes from Valletta. The harbour itself is where most of the training happens.",
      "loc.f1k": "Address", "loc.f2k": "WhatsApp", "loc.dir": "Get directions",
      "book.eyebrow": "Booking",
      "book.h2": "Book a lesson",
      "book.p": "Tell us what you would like to sail and when. The message goes straight to the school's WhatsApp, and we answer there.",
      "book.alt": "Prefer to write first? You can also message us on WhatsApp without filling the form.",
      "form.course": "Course or charter", "form.choose": "Choose a course", "form.unsure": "Not sure yet",
      "form.g.courses": "Courses", "form.g.issa": "ISSA practice", "form.g.races": "Racing calendar 2027",
      "form.g.charters": "Yacht club and charters",
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
      "meta.desc": "Burāšanas skola Marina Kalkara, Maltā. Treniņu programmas un ISSA prakses kursi ar instruktoru, divas jahtas, 2027. gada regašu kalendārs un VIP čārteri. Piesakies WhatsApp.",
      "skip": "Pāriet uz pieteikuma formu",
      "nav.courses": "Kursi", "nav.fleet": "Flote", "nav.calendar": "Regates 2027", "nav.charters": "Čārteri",
      "nav.how": "Kā tas notiek", "nav.location": "Atrašanās vieta", "nav.book": "Pieteikties",
      "hero.eyebrow": "Marina Kalkara · Malta",
      "hero.h1": "Mācies burāt Lielajā ostā",
      "hero.lead": "Burāšanas skola Marina Kalkara, Maltā. Treniņi uz ūdens, ISSA prakses kursi, regates un čārteri.",
      "hero.book": "Pieteikties nodarbībai",
      "hero.wa": "WhatsApp",
      "ticker.a": "Treniņu programmas", "ticker.b": "ISSA prakse", "ticker.c": "Regašu kalendārs 2027",
      "ticker.d": "Ekspedīcijas bez apkalpes", "ticker.e": "VIP čārteri",
      "courses.eyebrow": "Ko var apgūt",
      "courses.h2": "Kursi uz ūdens",
      "courses.lead": "Sāc no nulles vai uzlabo to, ko jau proti. Katrs kurss notiek uz laivas, ostā un ārpus tās, un programmu saskaņojam ar jums pirms pirmās nodarbības.",
      "price": "Cena pēc pieprasījuma",
      "ask": "Jautāt par šo kursu",
      "c1.t": "Mācies burāt",
      "c1.d": "Pirmās dienas uz ūdens: laivas vadīšana, buru pacelšana un droša pārvietošanās pa klāju kopā ar instruktoru blakus.",
      "c2.t": "Burāšanas treniņi",
      "c2.d": "Ar treneri uz klāja: komandas darbs, buru regulēšana, spinnaker un gennaker kurss. Solo, divatā vai pilna komanda, no pusdienas līdz divām nedēļām.",
      "c2.price": "Pusdiena no 400 €",
      "c3.t": "ISSA prakse ar instruktoru",
      "c3.d": "Piecas programmas no Yacht Crew līdz Boat Master, katrai ir noteikts dienu skaits uz ūdens un instruktors uz klāja.",
      "c3.price": "No 1 300 € par personu",
      "c4.t": "Regates un sacīkšu treniņi",
      "c4.d": "Treniņi starta līnijai: taktika, sacīkšu noteikumi, manevri un komandas lomas, nodarbības sacīkšu režīmā.",
      "c5.t": "Privātstundas",
      "c5.d": "Individuāli vai ar savu grupu, savā tempā un sev ērtos datumos.",
      "tr.eyebrow": "Programmas", "tr.h3": "Burāšanas treniņi ar treneri",
      "tr.lead": "Komandas darbs, buru regulēšana, spinnaker un gennaker kurss. Divi formāti: solo vai divatā un pilna komanda.",
      "tr.duration": "Ilgums", "tr.solo": "Solo / divatā", "tr.crew": "Pilna komanda",
      "dur.half": "Pusdiena", "dur.1": "1 diena", "dur.3": "3 dienas", "dur.7": "7 dienas", "dur.2w": "2 nedēļas",
      "issa.eyebrow": "ISSA programmas", "issa.h3": "ISSA burāšanas prakse ar instruktoru",
      "issa.lead": "Cena par personu. Programmu izvēlies pēc dienu skaita, ko vēlies pavadīt uz ūdens.",
      "issa.vip": "VIP, solo / divatā", "issa.crew": "Pilna komanda (4-6)", "issa.7d": "7 dienas",
      "issa.14d": "14 dienas", "issa.10d": "10 dienas", "issa.ask": "Jautāt par šo programmu",
      "issa.note": "ISSA ir burāšanas skolu asociācija, pēc kuras programmām veidoti šie kursi. Prakses dienas notiek uz ūdens ar instruktoru.",
      "issa.crew.t": "ISSA Yacht Crew, 7 dienas",
      "issa.inshore.t": "ISSA Inshore Skipper, 14 dienas",
      "issa.offshore.t": "ISSA Offshore Skipper, 14 dienas",
      "issa.master.t": "ISSA Boat Master, 14 dienas",
      "issa.storm.t": "ISSA Storm Training, 10 dienas",
      "fleet.eyebrow": "Flote", "fleet.h2": "Divas jahtas, viena skola",
      "fleet.lead": "Skolas flote: viena jahta iekārtota sacīkstēm un treniņiem, otra VIP čārteriem ar kapteini un stjuarti uz klāja.",
      "boat1.kicker": "Sacīkstes un treniņi", "boat2.kicker": "VIP čārteri ar apkalpi",
      "boat2.crew": "Kapteinis un stjuarte",
      "boat.note": "Laivas fotogrāfijas būs drīzumā", "boat.ask": "Jautāt par šo jahtu",
      "spec.built": "Būvēta", "spec.cabins": "Kajītes", "spec.wc": "WC", "spec.pax": "Cilvēki", "spec.crew": "Apkalpe",
      "how.eyebrow": "Kā tas notiek",
      "how.h2": "Trīs soļi līdz ūdenim",
      "s1.t": "Izvēlies kursu un datumu",
      "s1.d": "Izvēlies kursu un sev ērtu datumu un nosūti pieteikumu. Ja vēl neesi pārliecināts, raksti mums, un mēs ieteiksim piemērotāko kursu.",
      "s2.t": "Apstiprinām WhatsApp",
      "s2.d": "Atbildam WhatsApp, saskaņojam laiku un vietu un pasakām, kas līdzi jāņem.",
      "s3.t": "Tiekamies Marina Kalkara ostā",
      "s3.d": "Tiekamies ostā Kalkarā, Maltā. Uz laivas instruktors izstāsta dienas plānu.",
      "cal.eyebrow": "Regates", "cal.h2": "Regašu kalendārs 2027",
      "cal.lead": "Septiņas regates 2027. gadā, no piekrastes klasikas Maltā līdz Atlantijas šķērsojumam. Cenas norādītas par programmu, laivu un komandu.",
      "cal.regatta": "Regate un vieta", "cal.dates": "Datumi", "cal.distance": "Distance",
      "cal.dh": "Divatā", "cal.fc": "Pilna komanda", "cal.price": "Cena",
      "cal.ask": "Jautāt par šo regati",
      "place.malta": "Malta", "place.greece": "Grieķija", "place.genoa": "Dženova / Saint-Tropez",
      "place.malaga": "Malaga", "place.medchamp": "Vidusjūras čempionāts",
      "place.barcelona": "Barselona", "place.arc": "Las Palmasa - Sentlūsija",
      "dist.coastal": "Piekrastes regate", "dist.offshore": "atklātas jūras posms", "dist.ocean": "Okeāna regate",
      "race.mssr": "Rolex Middle Sea Race, Malta", "race.aegean": "Aegean 600, Grieķija",
      "race.giraglia": "Giraglia, Dženova / Saint-Tropez", "race.orc": "ORC Eiropas čempionāts, Malaga",
      "race.tregolfi": "Tre Golfi regašu nedēļa", "race.1000": "1000 nm regate, Barselona",
      "race.arc": "ARC 2027, Las Palmasa - Sentlūsija",
      "ch.eyebrow": "Jachtklubs un čārteri", "ch.h2": "Ekspedīcijas un čārteri",
      "ch.lead": "Ekspedīcijas bez apkalpes jachtklubu biedriem, un VIP čārteri uz “Albachiara” ar kapteini un stjuarti.",
      "ch.bare.h3": "Ekspedīcijas bez apkalpes", "ch.bare.sub": "Jachtklubu biedriem. Degviela, 300 L, iekļauta.",
      "ch.vip.h3": "VIP čārteri uz “Albachiara”", "ch.vip.sub": "Ar kapteini un stjuarti uz klāja.",
      "ch.season": "Sezona", "ch.week": "Nedēļa", "ch.week2": "Nedēļa", "ch.10": "10 dienas", "ch.day": "Diena",
      "ch.ask": "Jautāt par čārteri",
      "ch.note": "Cenas par visu laivu, nevis par personu. Sezonas atkārtojas katru gadu tajos pašos datumos.",
      "season.low": "Zemā", "season.mid": "Vidējā", "season.high": "Augstā",
      "band": "Iesācēji ir gaidīti.",
      "loc.eyebrow": "Kur mēs burājam",
      "loc.h2": "Marina Kalkara, Malta",
      "loc.p": "Skola atrodas Kalkarā, Marina Kalkara ostā, Lielajā ostā, dažu minūšu attālumā no Valletas. Lielākā daļa treniņu notiek tieši ostā.",
      "loc.f1k": "Adrese", "loc.f2k": "WhatsApp", "loc.dir": "Atvērt maršrutu",
      "book.eyebrow": "Pieteikšanās",
      "book.h2": "Piesakies nodarbībai",
      "book.p": "Pastāsti, ko gribi burāt un kad. Ziņa aiziet tieši skolas WhatsApp, un tur arī atbildam.",
      "book.alt": "Gribi vispirms vienkārši uzrakstīt? Vari rakstīt WhatsApp arī bez formas.",
      "form.course": "Kurss vai čārteris", "form.choose": "Izvēlies kursu", "form.unsure": "Vēl neesmu pārliecināts",
      "form.g.courses": "Kursi", "form.g.issa": "ISSA prakse", "form.g.races": "Regašu kalendārs 2027",
      "form.g.charters": "Jachtklubs un čārteri",
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
      "meta.desc": "Школа парусного спорта Marina Kalkara, Мальта. Программы тренировок и практические курсы ISSA с инструктором, две яхты, календарь регат 2027 и VIP-чартеры. Запись в WhatsApp.",
      "skip": "Перейти к форме записи",
      "nav.courses": "Курсы", "nav.fleet": "Флот", "nav.calendar": "Регаты 2027", "nav.charters": "Чартеры",
      "nav.how": "Как это работает", "nav.location": "Где мы", "nav.book": "Записаться",
      "hero.eyebrow": "Marina Kalkara · Мальта",
      "hero.h1": "Научитесь ходить под парусом в Большой гавани",
      "hero.lead": "Школа парусного спорта в Marina Kalkara, Мальта. Тренировки на воде, практические курсы ISSA, регаты и чартеры.",
      "hero.book": "Записаться на занятие",
      "hero.wa": "WhatsApp",
      "ticker.a": "Программы тренировок", "ticker.b": "Практика ISSA", "ticker.c": "Календарь регат 2027",
      "ticker.d": "Экспедиции без экипажа", "ticker.e": "VIP-чартеры",
      "courses.eyebrow": "Чему можно научиться",
      "courses.h2": "Курсы на воде",
      "courses.lead": "Начните с нуля или отточите то, что уже умеете. Каждый курс проходит на лодке, в гавани и за её пределами, а программу мы согласуем с вами до первого занятия.",
      "price": "Цена по запросу",
      "ask": "Спросить об этом курсе",
      "c1.t": "Научиться ходить под парусом",
      "c1.d": "Первые дни на воде: управление лодкой, постановка парусов и безопасное перемещение по палубе рядом с инструктором.",
      "c2.t": "Тренировки на воде",
      "c2.d": "С тренером на борту: командообразование, настройка парусов, курс спинакера и генакера. Соло, вдвоём или полным экипажем, от половины дня до двух недель.",
      "c2.price": "Полдня от 400 €",
      "c3.t": "Практика ISSA с инструктором",
      "c3.d": "Пять программ от Yacht Crew до Boat Master, у каждой своё число дней на воде и инструктор на борту.",
      "c3.price": "От 1 300 € с человека",
      "c4.t": "Регаты и гоночные тренировки",
      "c4.d": "Подготовка к стартовой линии: тактика, гоночные правила, манёвры и роли в экипаже, занятия в гоночном режиме.",
      "c5.t": "Частные уроки",
      "c5.d": "Индивидуально или своей группой, в своём темпе и в удобные вам даты.",
      "tr.eyebrow": "Программы", "tr.h3": "Тренировки с тренером",
      "tr.lead": "Командообразование, настройка парусов, курс спинакера и генакера. Два формата: соло или вдвоём и полный экипаж.",
      "tr.duration": "Длительность", "tr.solo": "Соло / вдвоём", "tr.crew": "Полный экипаж",
      "dur.half": "Полдня", "dur.1": "1 день", "dur.3": "3 дня", "dur.7": "7 дней", "dur.2w": "2 недели",
      "issa.eyebrow": "Программы ISSA", "issa.h3": "Практика ISSA с инструктором",
      "issa.lead": "Цена с человека. Программу выбирают по числу дней, которые вы хотите провести на воде.",
      "issa.vip": "VIP, соло / вдвоём", "issa.crew": "Полный экипаж (4-6)", "issa.7d": "7 дней",
      "issa.14d": "14 дней", "issa.10d": "10 дней", "issa.ask": "Спросить об этой программе",
      "issa.note": "ISSA это ассоциация парусных школ, по программам которой построены эти курсы. Практические дни проходят на воде с инструктором.",
      "issa.crew.t": "ISSA Yacht Crew, 7 дней",
      "issa.inshore.t": "ISSA Inshore Skipper, 14 дней",
      "issa.offshore.t": "ISSA Offshore Skipper, 14 дней",
      "issa.master.t": "ISSA Boat Master, 14 дней",
      "issa.storm.t": "ISSA Storm Training, 10 дней",
      "fleet.eyebrow": "Флот", "fleet.h2": "Две яхты, одна школа",
      "fleet.lead": "Флот школы: одна яхта подготовлена к гонкам и тренировкам, вторая к VIP-чартерам с капитаном и стюардессой на борту.",
      "boat1.kicker": "Гонки и тренировки", "boat2.kicker": "VIP-чартеры с экипажем",
      "boat2.crew": "Капитан и стюардесса",
      "boat.note": "Фото лодки скоро появятся", "boat.ask": "Спросить об этой яхте",
      "spec.built": "Постройка", "spec.cabins": "Каюты", "spec.wc": "WC", "spec.pax": "Человек", "spec.crew": "Экипаж",
      "how.eyebrow": "Как это работает",
      "how.h2": "Три шага до воды",
      "s1.t": "Выберите курс и дату",
      "s1.d": "Выберите курс и удобную дату и отправьте заявку. Если ещё не определились, напишите нам, и мы подскажем подходящий курс.",
      "s2.t": "Подтверждаем в WhatsApp",
      "s2.d": "Отвечаем в WhatsApp, согласуем время и место и говорим, что взять с собой.",
      "s3.t": "Встречаемся в Marina Kalkara",
      "s3.d": "Встречаемся в марине в Калкаре, Мальта. На лодке инструктор рассказывает план на день.",
      "cal.eyebrow": "Регаты", "cal.h2": "Календарь регат 2027",
      "cal.lead": "Семь регат в 2027 году, от прибрежной классики на Мальте до перехода через Атлантику. Цена указана за программу, лодку и экипаж.",
      "cal.regatta": "Регата и место", "cal.dates": "Даты", "cal.distance": "Дистанция",
      "cal.dh": "Вдвоём", "cal.fc": "Полный экипаж", "cal.price": "Цена",
      "cal.ask": "Спросить об этой регате",
      "place.malta": "Мальта", "place.greece": "Греция", "place.genoa": "Генуя / Сен-Тропе",
      "place.malaga": "Малага", "place.medchamp": "Чемпионат Средиземноморья",
      "place.barcelona": "Барселона", "place.arc": "Лас-Пальмас - Сент-Люсия",
      "dist.coastal": "Прибрежная гонка", "dist.offshore": "офшорный этап", "dist.ocean": "Океанская гонка",
      "race.mssr": "Rolex Middle Sea Race, Мальта", "race.aegean": "Aegean 600, Греция",
      "race.giraglia": "Giraglia, Генуя / Сен-Тропе", "race.orc": "ORC European Championship, Малага",
      "race.tregolfi": "Tre Golfi Sailing Week", "race.1000": "1000 nm Race, Барселона",
      "race.arc": "ARC 2027, Лас-Пальмас - Сент-Люсия",
      "ch.eyebrow": "Яхт-клуб и чартеры", "ch.h2": "Экспедиции и чартеры",
      "ch.lead": "Экспедиции без экипажа для членов яхт-клубов и VIP-чартеры на “Albachiara” с капитаном и стюардессой.",
      "ch.bare.h3": "Экспедиции без экипажа", "ch.bare.sub": "Для членов яхт-клубов. Топливо, 300 л, включено.",
      "ch.vip.h3": "VIP-чартеры на “Albachiara”", "ch.vip.sub": "С капитаном и стюардессой на борту.",
      "ch.season": "Сезон", "ch.week": "Неделя", "ch.week2": "Неделя", "ch.10": "10 дней", "ch.day": "День",
      "ch.ask": "Спросить о чартере",
      "ch.note": "Цены за всю лодку, не с человека. Сезоны повторяются каждый год в те же даты.",
      "season.low": "Низкий", "season.mid": "Средний", "season.high": "Высокий",
      "band": "Новичкам здесь рады.",
      "loc.eyebrow": "Где мы ходим",
      "loc.h2": "Marina Kalkara, Мальта",
      "loc.p": "Школа находится в Marina Kalkara в Калкаре, в Большой гавани, в нескольких минутах от Валлетты. Большая часть тренировок проходит прямо в гавани.",
      "loc.f1k": "Адрес", "loc.f2k": "WhatsApp", "loc.dir": "Построить маршрут",
      "book.eyebrow": "Запись",
      "book.h2": "Записаться на занятие",
      "book.p": "Расскажите, на чём хотите ходить и когда. Сообщение уходит прямо в WhatsApp школы, там мы и отвечаем.",
      "book.alt": "Хотите сначала просто написать? Можно написать в WhatsApp и без формы.",
      "form.course": "Курс или чартер", "form.choose": "Выберите курс", "form.unsure": "Пока не уверен",
      "form.g.courses": "Курсы", "form.g.issa": "Практика ISSA", "form.g.races": "Календарь регат 2027",
      "form.g.charters": "Яхт-клуб и чартеры",
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

    var groups = document.querySelectorAll("optgroup[data-i18n-label]");
    for (var g = 0; g < groups.length; g++) {
      groups[g].setAttribute("label", t(groups[g].getAttribute("data-i18n-label")));
    }

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

  /* every option value -> its i18n key, so the label follows the language */
  var COURSE_KEYS = {
    "learn": "c1.t", "training": "c2.t", "regatta": "c4.t", "private": "c5.t",
    "issa-crew": "issa.crew.t", "issa-inshore": "issa.inshore.t", "issa-offshore": "issa.offshore.t",
    "issa-master": "issa.master.t", "issa-storm": "issa.storm.t",
    "race-mssr": "race.mssr", "race-aegean": "race.aegean", "race-giraglia": "race.giraglia",
    "race-orc": "race.orc", "race-tregolfi": "race.tregolfi", "race-1000": "race.1000", "race-arc": "race.arc",
    "bareboat": "ch.bare.h3", "vip": "ch.vip.h3", "unsure": "form.unsure"
  };

  function syncCourseLabel() {
    if (!courseSelect) return;
    var opts = courseSelect.querySelectorAll("option[value]");
    for (var i = 0; i < opts.length; i++) {
      var k = COURSE_KEYS[opts[i].value];
      if (k) opts[i].textContent = t(k);
    }
  }
  function courseKey(v) {
    return COURSE_KEYS[v] ? v : "";
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
    var courseLabel = course ? t(COURSE_KEYS[course] || "form.unsure") : "";

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
