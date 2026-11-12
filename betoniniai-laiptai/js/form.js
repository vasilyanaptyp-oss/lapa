(function () {
  var form = document.getElementById('qform');
  if (!form) return;
  var RELAY = 'https://script.google.com/macros/s/AKfycbxG8sh9Xi-msP2Ol6iG9FBB__M4_Btafq6KlNpsJNSXS-XnmKKVrajYfpyaGgVzA8zG/exec', SITE = 'betoniniai', MAIL = 'sarunas_w@yahoo.com', TEL = '+370 684 02273';
  var MAX_PHOTOS = 6, MAX_SIDE = 1600, QUALITY = 0.8, MAX_ORIG = 4 * 1024 * 1024, MAX_TOTAL = 12 * 1024 * 1024, TIMEOUT = 25000;
  function field(id) { return document.getElementById(id); }
  var nameIn = field('f-name'), contactIn = field('f-contact'), sum = field('f-sum');
  var fileInput = field('f-file'), fileNames = field('f-files'), fileBox = field('f-box'), thumbs = field('f-thumbs'), fnote = field('f-note');
  var errBox = field('f-err'), hp = field('f-hp');
  var btn = form.querySelector('button[type=submit]'), btnLabel = btn.querySelector('.bl'), btnText = btnLabel.textContent;
  var photos = [], pending = Promise.resolve(), sending = false, sendId = 0, firstFocus = 0, processing = 0;
  form.addEventListener('focusin', function () { if (!firstFocus) firstFocus = Date.now(); });
  function val(id) { return field(id).value.trim(); }
  function check(input) {
    var ok = input.value.trim().length > 1, f = input.closest('.fld');
    f.classList.toggle('bad', !ok);
    if (ok) input.removeAttribute('aria-invalid'); else input.setAttribute('aria-invalid', 'true');
    return ok;
  }
  [nameIn, contactIn].forEach(function (input) {
    input.addEventListener('input', function () {
      if (this.closest('.fld').classList.contains('bad')) { check(this); if (!form.querySelector('.fld.bad')) sum.classList.remove('on'); }
    });
  });
  function jpgName(name) { return ((name || 'nuotrauka').replace(/\.[^.]*$/, '') || 'nuotrauka') + '.jpg'; }
  function shrink(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file), im = new Image();
      im.onload = function () {
        var w = im.naturalWidth, h = im.naturalHeight;
        if (!w || !h) { URL.revokeObjectURL(url); reject(new Error('size')); return; }
        var k = Math.min(1, MAX_SIDE / Math.max(w, h)), cw = Math.round(w * k), ch = Math.round(h * k);
        var c = document.createElement('canvas'); c.width = cw; c.height = ch;
        var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, cw, ch); x.drawImage(im, 0, 0, cw, ch);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) { c.width = c.height = 0; if (!b) { reject(new Error('blob')); return; } resolve(b); }, 'image/jpeg', QUALITY);
      };
      im.onerror = function () { URL.revokeObjectURL(url); reject(new Error('decode')); };
      im.src = url;
    });
  }
  function setNote(list) { fnote.textContent = list.join(' '); fnote.classList.toggle('on', list.length > 0); }
  function total() { return photos.reduce(function (s, p) { return s + p.blob.size; }, 0); }
  function render() {
    var n = photos.length;
    fileNames.textContent = processing > 0 ? 'Apdorojamos nuotraukos…' : n ? (n === 1 ? 'Pridėta 1 nuotrauka' : 'Pridėtos ' + n + ' nuotraukos') : 'Nepasirinktas joks failas';
    fileNames.classList.toggle('has', n > 0 && processing === 0);
    fileInput.disabled = n >= MAX_PHOTOS;
    fileBox.classList.toggle('full', n >= MAX_PHOTOS);
    thumbs.innerHTML = '';
    photos.forEach(function (p) {
      var li = document.createElement('li'), th;
      if (p.thumb) { th = new Image(); th.className = 'th'; th.alt = 'Pridėta nuotrauka'; th.width = 72; th.height = 72; th.src = p.thumb; }
      else { th = document.createElement('span'); th.className = 'th'; th.textContent = 'foto'; }
      var rm = document.createElement('button');
      rm.type = 'button'; rm.className = 'rm'; rm.setAttribute('aria-label', 'Pašalinti nuotrauką');
      rm.addEventListener('click', function () { removePhoto(p); });
      li.appendChild(th); li.appendChild(rm); thumbs.appendChild(li);
    });
    thumbs.classList.toggle('on', n > 0);
  }
  function dropThumb(p) { if (p.thumb) { URL.revokeObjectURL(p.thumb); p.thumb = null; } }
  function removePhoto(p) { if (sending) return; var i = photos.indexOf(p); if (i < 0) return; photos.splice(i, 1); dropThumb(p); setNote([]); render(); }
  function clearPhotos() { photos.forEach(dropThumb); photos = []; setNote([]); render(); }
  function addFiles(src) {
    var notes = [], room = MAX_PHOTOS - photos.length;
    if (src.length > room) { src = src.slice(0, Math.max(room, 0)); notes.push('Galima pridėti iki ' + MAX_PHOTOS + ' nuotraukų, kitos nepridėtos.'); }
    return src.reduce(function (p, f) {
      return p.then(function () {
        if (f.type && f.type.indexOf('image/') !== 0) { notes.push('Galima pridėti tik nuotraukas.'); return; }
        return shrink(f).then(function (b) { return { name: jpgName(f.name), type: 'image/jpeg', blob: b }; }, function () {
          if (f.size > MAX_ORIG) { notes.push('Nuotrauka per didelė, atsiųskite ją per WhatsApp.'); return null; }
          return { name: f.name || 'nuotrauka', type: f.type || (/\.hei[cf]$/i.test(f.name || '') ? 'image/heic' : 'image/jpeg'), blob: f };
        }).then(function (item) {
          if (!item) return;
          if (total() + item.blob.size > MAX_TOTAL) { notes.push('Nuotraukos per didelės, dalis nepridėta.'); return; }
          item.thumb = item.blob === f ? null : URL.createObjectURL(item.blob);
          photos.push(item); render();
        });
      });
    }, Promise.resolve()).then(function () { setNote(notes.filter(function (x, i) { return notes.indexOf(x) === i; })); });
  }
  fileInput.addEventListener('change', function () {
    var src = Array.prototype.slice.call(fileInput.files || []);
    fileInput.value = '';
    if (!src.length) return;
    processing++; render();
    pending = pending.then(function () { return addFiles(src); }).catch(function () {}).then(function () { processing--; render(); });
  });
  function toBase64(blob) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { var s = String(r.result), i = s.indexOf(','); resolve(i < 0 ? '' : s.slice(i + 1)); };
      r.onerror = function () { reject(new Error('read')); };
      r.readAsDataURL(blob);
    });
  }
  function uniqueName(name, seen) { var n = name, i = 1; while (seen[n.toLowerCase()]) { i++; n = name.replace(/(\.[^.]*)?$/, '-' + i + '$1'); } seen[n.toLowerCase()] = 1; return n; }
  function svcVal() { var s = form.querySelector('input[name="svc"]:checked'); return s ? s.value : ''; }
  function buildBody() {
    var seen = {};
    return Promise.all(photos.map(function (p) { return toBase64(p.blob).then(function (d) { return { name: uniqueName(p.name, seen), type: p.type, data: d }; }); }))
      .then(function (list) {
        return JSON.stringify({ site: SITE, name: val('f-name'), contact: val('f-contact'), svc: svcVal(), place: val('f-place'), msg: val('f-msg'),
          hp: hp.value, t: firstFocus ? Date.now() - firstFocus : 0, photos: list });
      });
  }
  function mailHref() {
    var lines = ['Vardas: ' + val('f-name'), 'Telefonas arba el. paštas: ' + val('f-contact'), 'Laiptai: ' + svcVal(),
                 'Vieta: ' + val('f-place'), 'Žinutė: ' + val('f-msg').replace(/\r?\n/g, ' ')];
    return 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Užklausa dėl laiptų') + '&body=' + encodeURIComponent(lines.join('\r\n'));
  }
  function setSending(on) {
    sending = on; btn.disabled = on; form.classList.toggle('sending', on);
    form.setAttribute('aria-busy', on ? 'true' : 'false'); btnLabel.textContent = on ? 'Siunčiama…' : btnText;
  }
  function showError() { field('f-err-mail').href = mailHref(); errBox.classList.add('on'); errBox.scrollIntoView({ block: 'nearest' }); }
  function showSent() {
    form.classList.add('done'); clearPhotos();
    var t = field('f-sent-t');
    try { t.focus({ preventScroll: true }); } catch (err) { t.focus(); }
    form.scrollIntoView({ block: 'nearest' });
  }
  function send() {
    var my = ++sendId, over = false, ctl = typeof AbortController === 'function' ? new AbortController() : null;
    setSending(true); errBox.classList.remove('on');
    var timer = setTimeout(function () { if (my !== sendId || over) return; over = true; if (ctl) ctl.abort(); setSending(false); showError(); }, TIMEOUT);
    function end(ok) { if (my !== sendId || over) return; over = true; clearTimeout(timer); setSending(false); if (ok) showSent(); else showError(); }
    pending.then(buildBody).then(function (body) {
      if (over) return null;
      return fetch(RELAY, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body, signal: ctl ? ctl.signal : undefined });
    }).then(function (r) { return r ? r.json() : null; }).then(function (j) { end(!!j && j.ok === true); }).catch(function () { end(false); });
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sending) return;
    var a = check(nameIn), b = check(contactIn);
    if (!(a && b)) {
      var bad = a ? contactIn : nameIn;
      sum.classList.add('on');
      bad.closest('.fld').scrollIntoView({ block: 'center' });
      try { bad.focus({ preventScroll: true }); } catch (err) { bad.focus(); }
      return;
    }
    sum.classList.remove('on');
    send();
  });
  field('f-again').addEventListener('click', function () {
    form.reset(); clearPhotos(); errBox.classList.remove('on');
    [nameIn, contactIn].forEach(function (i) { i.closest('.fld').classList.remove('bad'); i.removeAttribute('aria-invalid'); });
    sum.classList.remove('on'); firstFocus = 0; form.classList.remove('done');
    form.scrollIntoView({ block: 'nearest' }); nameIn.focus({ preventScroll: true });
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted && sending) { sendId++; setSending(false); } });
})();
