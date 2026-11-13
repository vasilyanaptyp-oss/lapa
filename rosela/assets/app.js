(function () {
  "use strict";
  var doc = document, body = doc.body;
  var L = JSON.parse(doc.getElementById("i18n").textContent);
  var PRODUCTS = JSON.parse(doc.getElementById("products").textContent);
  var IMG = body.getAttribute("data-img") || "img/";
  var WA = "https://wa.me/37127049639?text=";

  /* header state */
  var hdr = doc.querySelector(".hdr");
  function onScroll() { hdr.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* mobile menu */
  var burger = doc.querySelector(".burger"), menu = doc.getElementById("menu");
  function setMenu(open) {
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? L.menuClose : L.menuOpen);
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    if (open) { menu.removeAttribute("inert"); } else { menu.setAttribute("inert", ""); }
    body.style.overflow = open ? "hidden" : "";
  }
  burger.addEventListener("click", function () { setMenu(burger.getAttribute("aria-expanded") !== "true"); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu.classList.contains("is-open")) setMenu(false); });
  window.addEventListener("resize", function () { if (window.innerWidth >= 1024 && menu.classList.contains("is-open")) setMenu(false); });

  /* sticky action bar: visible when the hero buttons are out of view */
  var bar = doc.querySelector(".actbar"), heroCta = doc.querySelector(".hero-cta"), contactCta = doc.querySelector(".contact-cta");
  if ("IntersectionObserver" in window && bar && heroCta) {
    var seen = { hero: true, contact: false };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { seen[en.target === heroCta ? "hero" : "contact"] = en.isIntersecting; });
      var on = !seen.hero && !seen.contact;
      bar.classList.toggle("is-on", on);
      bar.setAttribute("aria-hidden", on ? "false" : "true");
      body.classList.toggle("has-bar", on);
    }, { threshold: 0 });
    io.observe(heroCta); if (contactCta) io.observe(contactCta);
  }

  /* catalogue filter */
  var tiles = doc.querySelectorAll(".tile[data-filter]"), cards = doc.querySelectorAll(".card[data-type]"), countEl = doc.getElementById("count");
  function applyFilter(f) {
    var n = 0;
    cards.forEach(function (c) {
      var show = f === "all" || (" " + c.getAttribute("data-type") + " ").indexOf(" " + f + " ") > -1;
      c.hidden = !show; if (show) n++;
    });
    tiles.forEach(function (t) { t.setAttribute("aria-pressed", t.getAttribute("data-filter") === f ? "true" : "false"); });
    if (countEl) countEl.textContent = L.shown.replace("{n}", n);
  }
  tiles.forEach(function (t) {
    t.addEventListener("click", function () {
      var f = t.getAttribute("data-filter");
      applyFilter(t.getAttribute("aria-pressed") === "true" && f !== "all" ? "all" : f);
    });
  });
  applyFilter("all");

  /* product dialog */
  var pd = doc.getElementById("pd"), pdImg = pd.querySelector(".pd-media img"), pdLast = null;
  function money(v) { return v.toFixed(2).replace(".", ",") + " €"; }
  function openProduct(id, opener) {
    var p = PRODUCTS[id]; if (!p) return;
    pdLast = opener || null;
    pd.querySelector(".pd-media").style.background = p.bg;
    pdImg.src = IMG + p.img + "-l.webp"; pdImg.alt = p.alt;
    pdImg.setAttribute("data-full", IMG + p.img + "-l.webp");
    pdImg.setAttribute("data-cap", p.name + " · " + p.size);
    pd.querySelector(".card-type").textContent = p.type;
    pd.querySelector("h3").textContent = p.name;
    pd.querySelector(".pd-price b").textContent = money(p.price);
    pd.querySelector(".pd-price s").textContent = p.old ? money(p.old) : "";
    var dl = pd.querySelector(".pd-specs"); dl.innerHTML = "";
    p.specs.forEach(function (s) {
      var dt = doc.createElement("dt"), dd = doc.createElement("dd");
      dt.textContent = s[0]; dd.textContent = s[1]; dl.appendChild(dt); dl.appendChild(dd);
    });
    pd.querySelector(".pd-wa").href = WA + encodeURIComponent(L.waProduct.replace("{p}", p.name + ", " + p.size + " (" + money(p.price) + ")"));
    pd.querySelector(".pd-shop").href = p.url;
    if (typeof pd.showModal === "function") pd.showModal(); else pd.setAttribute("open", "");
    body.style.overflow = "hidden"; body.classList.add("dlg-open");
    pd.querySelector(".pd-close").focus();
  }
  function closeProduct() { if (pd.open) pd.close(); }
  pd.addEventListener("close", function () { body.style.overflow = ""; body.classList.remove("dlg-open"); if (pdLast) pdLast.focus(); });
  pd.addEventListener("click", function (e) { if (e.target === pd) closeProduct(); });
  pd.querySelector(".pd-close").addEventListener("click", closeProduct);
  doc.querySelectorAll(".card-open").forEach(function (b) {
    b.addEventListener("click", function () { openProduct(b.closest(".card").getAttribute("data-id"), b); });
  });

  /* lightbox */
  var lb = doc.getElementById("lb"), lbImg = lb.querySelector(".lb-stage img"), lbCap = lb.querySelector(".lb-cap-t"), lbCount = lb.querySelector(".lb-count");
  var group = [], idx = 0, lbLast = null;
  function show(i) {
    idx = (i + group.length) % group.length;
    var el = group[idx];
    lbImg.src = el.getAttribute("data-full");
    lbImg.alt = el.getAttribute("data-cap") || "";
    lbCap.textContent = el.getAttribute("data-cap") || "";
    lbCount.textContent = (idx + 1) + " / " + group.length;
    var multi = group.length > 1;
    lb.querySelectorAll(".lb-prev,.lb-next").forEach(function (b) { b.hidden = !multi; });
  }
  function openLb(el) {
    var g = el.getAttribute("data-group");
    group = g ? Array.prototype.slice.call(doc.querySelectorAll('[data-full][data-group="' + g + '"]')) : [el];
    lbLast = el;
    show(Math.max(0, group.indexOf(el)));
    if (typeof lb.showModal === "function") lb.showModal(); else lb.setAttribute("open", "");
    body.style.overflow = "hidden"; body.classList.add("dlg-open");
  }
  doc.addEventListener("click", function (e) {
    var el = e.target.closest("[data-full]");
    if (!el || el.closest(".lb")) return;
    e.preventDefault();
    openLb(el);
  });
  lb.querySelector(".lb-prev").addEventListener("click", function () { show(idx - 1); });
  lb.querySelector(".lb-next").addEventListener("click", function () { show(idx + 1); });
  lb.querySelector(".lb-close").addEventListener("click", function () { lb.close(); });
  lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lb-stage")) lb.close(); });
  lb.addEventListener("close", function () {
    body.style.overflow = pd.open ? "hidden" : "";
    if (!pd.open) body.classList.remove("dlg-open");
    if (lbLast && typeof lbLast.focus === "function") lbLast.focus();
  });
  lb.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
  var sx = null;
  lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (sx === null || group.length < 2) return;
    var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* reveal on scroll */
  var rv = doc.querySelectorAll(".rv");
  if ("IntersectionObserver" in window) {
    var ro = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); ro.unobserve(x.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    rv.forEach(function (el) { ro.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add("in"); }); }
})();
