'use strict';
(function () {
  const CFG = window.EURO_CONFIG || {};
  const $ = (id) => document.getElementById(id);

  const ACTS = {
    m: { ar: 'قداس', en: 'Mass', ico: '⛪' },
    s: { ar: 'فقرة افتتاحية', en: 'Service', ico: '🎤' },
    c: { ar: 'درس الفصل', en: 'Class', ico: '📖' },
    t: { ar: 'تسبحة', en: 'Tasbeha', ico: '🎶' }
  };

  const T = {
    ar: {
      appName: 'محفظة اليورو', setupIntro: 'احضر، امسح الكود، واجمع اليورو!', yourName: 'اسمك بالكامل',
      namePh: 'مثال: مينا جرجس', start: 'ابدأ', haveCode: 'عندي كود استرجاع', recoveryCode: 'كود الاسترجاع',
      restore: 'استرجع محفظتي', back: 'رجوع', hello: 'أهلاً', balance: 'رصيدك', history: 'آخر الحضور',
      scan: 'امسح الكود', scanHint: 'وجّه الكاميرا على كود الـ QR', cancel: 'إلغاء', ok: 'تمام', scanAgain: 'امسح تاني',
      recoveryHint: 'احتفظ بالكود ده عشان ترجّع رصيدك لو غيّرت الموبايل',
      nameShort: 'اكتب اسمك بالكامل', needNet: 'محتاج إنترنت للاسترجاع. جرّب تاني وانت متصل.',
      badCode: 'الكود ده مش موجود', noSync: 'الاسترجاع مش متاح دلوقتي',
      synced: 'الرصيد متسجّل عند الخادم', pending: (n) => `${n} يورو مستني الإنترنت عشان يتبعت`,
      localOnly: 'الرصيد محفوظ على الموبايل', syncing: 'جاري الإرسال…',
      empty: 'لسه مفيش يورو. امسح أول كود!', waiting: 'مستني الإرسال',
      gotTitle: (v) => `+${v} يورو!`, gotText: (a) => `اتسجّل حضورك في ${a}`,
      eNotOurs: ['ده مش كود يورو', 'امسح الكود اللي الخادم بيعرضه.'],
      eFake: ['كود غير صحيح', 'الكود ده مش أصلي.'],
      eDup: ['أخدته قبل كده', 'انت مسجّل اليورو ده بالفعل.'],
      eExpired: ['الكود انتهى', 'الكود ده كان ليوم فات.'],
      eNotYet: ['لسه بدري', 'الكود ده ليوم لسه ماجاش. اتأكد من تاريخ الموبايل.'],
      eEarly: ['لسه بدري', 'الكود ده بيشتغل من الساعة '],
      eClosed: ['الوقت خلص', 'ميعاد تسجيل الفقرة دي انتهى.'],
      eCam: ['الكاميرا مش شغّالة', 'اسمح للتطبيق باستخدام الكاميرا من الإعدادات وجرّب تاني.'],
      install: 'تثبيت', tipIos: 'للتثبيت: دوس على زر المشاركة ثم «إضافة إلى الشاشة الرئيسية»',
      tipAndroid: 'ثبّت التطبيق على موبايلك عشان يشتغل من غير إنترنت', otherLang: 'English'
    },
    en: {
      appName: 'Euro Wallet', setupIntro: 'Attend, scan the code, collect Euros!', yourName: 'Your full name',
      namePh: 'e.g. Mina Gerges', start: 'Start', haveCode: 'I have a recovery code', recoveryCode: 'Recovery code',
      restore: 'Restore my wallet', back: 'Back', hello: 'Hello', balance: 'Your balance', history: 'Recent attendance',
      scan: 'Scan code', scanHint: 'Point the camera at the QR code', cancel: 'Cancel', ok: 'OK', scanAgain: 'Scan again',
      recoveryHint: 'Keep this code to get your balance back if you change phones',
      nameShort: 'Please type your full name', needNet: 'Restoring needs internet. Try again when connected.',
      badCode: 'This code was not found', noSync: 'Restore is not available right now',
      synced: 'Balance saved with your servant', pending: (n) => `${n} Euro waiting for internet to send`,
      localOnly: 'Balance saved on this phone', syncing: 'Sending…',
      empty: 'No Euros yet. Scan your first code!', waiting: 'waiting to send',
      gotTitle: (v) => `+${v} Euro!`, gotText: (a) => `Your attendance at ${a} is recorded`,
      eNotOurs: ['Not a Euro code', 'Scan the code your servant is showing.'],
      eFake: ['Invalid code', 'This code is not genuine.'],
      eDup: ['Already collected', 'You already have this Euro.'],
      eExpired: ['Code expired', 'This code was for a past day.'],
      eNotYet: ['Too early', 'This code is for a future day. Check your phone date.'],
      eEarly: ['Too early', 'This code works from '],
      eClosed: ['Time is over', 'Scanning for this activity has closed.'],
      eCam: ['Camera not available', 'Allow camera access for this app in settings and try again.'],
      install: 'Install', tipIos: 'To install: tap the Share button, then "Add to Home Screen"',
      tipAndroid: 'Install the app on your phone so it works offline', otherLang: 'عربي'
    }
  };

  /* ---------- storage ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('euro.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('euro.' + k, JSON.stringify(v)); } catch (e) { /* storage full or blocked */ } }
  };
  let lang = store.get('lang', CFG.lang === 'en' ? 'en' : 'ar');
  let profile = store.get('profile', null);          // {id, name, registered}
  let events = store.get('events', []);              // {key, act, date, value, ts, code, synced}
  const t = (k) => T[lang][k];
  const saveEvents = () => store.set('events', events);

  /* ---------- helpers ---------- */
  function b64uToBytes(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    const bin = atob(s); const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function newId() {
    const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const r = crypto.getRandomValues(new Uint8Array(8));
    return 'M-' + Array.from(r, (b) => abc[b % 32]).join('');
  }
  function fmtDate(d8) {
    const d = new Date(+d8.slice(0, 4), +d8.slice(4, 6) - 1, +d8.slice(6, 8));
    return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  }
  const total = () => events.reduce((s, e) => s + e.value, 0);

  /* ---------- QR code checking ---------- */
  // Code format: E1.<activity>.<yyyymmdd>.<euros>.<serverTag>.<signature>
  let keyPromise;
  function pubKey() {
    if (!keyPromise) keyPromise = crypto.subtle.importKey('jwk', CFG.publicKey, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    return keyPromise;
  }
  function parseCode(code) {
    const p = String(code).trim().split('.');
    if (p.length < 5 || p[0] !== 'E1' || !ACTS[p[1]] || !/^\d{8}$/.test(p[2]) || !/^[1-9]\d?$/.test(p[3])) return null;
    return { act: p[1], date: p[2], value: +p[3], key: p[1] + '.' + p[2], msg: p.slice(0, 5).join('.'), sig: p[5] };
  }
  async function redeem(text) {
    const c = parseCode(text);
    if (!c || !c.sig || String(text).trim().split('.').length !== 6) return { err: 'eNotOurs' };
    let ok = false;
    try {
      ok = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, await pubKey(), b64uToBytes(c.sig), new TextEncoder().encode(c.msg));
    } catch (e) { ok = false; }
    if (!ok) return { err: 'eFake' };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const day = new Date(+c.date.slice(0, 4), +c.date.slice(4, 6) - 1, +c.date.slice(6, 8));
    const diff = Math.round((today - day) / 86400000);
    if (diff < 0) return { err: 'eNotYet' };
    const rule = (CFG.hours || {})[c.act];
    if (rule) {
      const mins = (hm) => { const x = String(hm).split(':'); return (+x[0]) * 60 + (+x[1] || 0); };
      const nowM = now.getHours() * 60 + now.getMinutes();
      if (diff > 0) return { err: 'eExpired' };
      if (rule.from && nowM < mins(rule.from)) return { err: 'eEarly', at: rule.from };
      if (rule.to && nowM > mins(rule.to)) return { err: 'eClosed' };
    } else if (diff > (CFG.graceDays || 0)) return { err: 'eExpired' };
    if (events.some((e) => e.key === c.key)) return { err: 'eDup' };

    events.push({ key: c.key, act: c.act, date: c.date, value: c.value, ts: Date.now(), code: c.msg, synced: false });
    saveEvents();
    return { ok: true, act: c.act, value: c.value };
  }

  /* ---------- sync with the Google Sheet ---------- */
  let syncing = false;
  async function post(body) {
    const res = await fetch(CFG.syncUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },   // plain text avoids a CORS preflight
      body: JSON.stringify(body)
    });
    return res.json();
  }
  function mergeServer(list) {
    const have = {};
    events.forEach((e) => { have[e.key] = e; });
    (list || []).forEach((s) => {
      const c = parseCode(s.code);
      if (!c) return;
      if (have[c.key]) have[c.key].synced = true;
      else events.push({ key: c.key, act: c.act, date: c.date, value: c.value, ts: s.ts || Date.now(), code: c.msg, synced: true });
    });
    events.sort((a, b) => a.ts - b.ts);
    saveEvents();
  }
  async function sync() {
    if (syncing || !CFG.syncUrl || !profile) return;
    const pending = events.filter((e) => !e.synced);
    if (!pending.length && profile.registered) return;
    if (navigator.onLine === false) return;
    syncing = true; renderSync();
    try {
      const j = await post({ v: 1, memberId: profile.id, name: profile.name, events: pending.map((e) => ({ code: e.code, ts: e.ts })) });
      if (j && j.ok) {
        profile.registered = true; store.set('profile', profile);
        mergeServer(j.events);
      }
    } catch (e) { /* offline or server unreachable: stays queued, retried later */ }
    syncing = false; render();
  }

  /* ---------- rendering ---------- */
  function applyLang() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = t('appName');
    document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
    document.querySelectorAll('[data-ph]').forEach((el) => { el.placeholder = t(el.dataset.ph); });
    document.querySelectorAll('.langBtn').forEach((el) => { el.textContent = t('otherLang'); });
  }
  function renderSync() {
    const el = $('syncState');
    const n = events.filter((e) => !e.synced).reduce((s, e) => s + e.value, 0);
    let cls = 'ok', txt = t('synced');
    if (!CFG.syncUrl) { cls = ''; txt = t('localOnly'); }
    else if (syncing) { cls = 'pending'; txt = t('syncing'); }
    else if (n > 0) { cls = 'pending'; txt = t('pending')(n); }
    else if (!profile.registered) { cls = 'pending'; txt = t('localOnly'); }
    el.className = 'sync ' + cls;
    el.innerHTML = '<span class="dot"></span>';
    el.appendChild(document.createTextNode(txt));
  }
  function render() {
    applyLang();
    $('setup').hidden = !!profile;
    $('home').hidden = !profile;
    if (!profile) return;
    $('memberName').textContent = profile.name;
    $('memberId').textContent = profile.id;
    $('balance').textContent = total();
    renderSync();

    const acts = $('acts'); acts.textContent = '';
    Object.keys(ACTS).forEach((k) => {
      const n = events.filter((e) => e.act === k).reduce((s, e) => s + e.value, 0);
      const d = document.createElement('div'); d.className = 'act';
      d.innerHTML = '<div class="ico"></div><div class="num"></div><div class="lbl"></div>';
      d.children[0].textContent = ACTS[k].ico; d.children[1].textContent = n; d.children[2].textContent = ACTS[k][lang];
      acts.appendChild(d);
    });

    const ul = $('history'); ul.textContent = '';
    const recent = events.slice().sort((a, b) => b.ts - a.ts).slice(0, 30);
    if (!recent.length) {
      const li = document.createElement('li'); li.className = 'empty'; li.textContent = t('empty'); ul.appendChild(li);
    }
    recent.forEach((e) => {
      const li = document.createElement('li');
      li.innerHTML = '<span class="ico"></span><span class="what"><div></div><div class="when"></div></span><span class="plus"></span>';
      li.children[0].textContent = ACTS[e.act].ico;
      li.children[1].children[0].textContent = ACTS[e.act][lang];
      li.children[1].children[1].textContent = fmtDate(e.date);
      if (!e.synced && CFG.syncUrl) {
        const w = document.createElement('span'); w.className = 'wait'; w.textContent = ' · ' + t('waiting');
        li.children[1].children[1].appendChild(w);
      }
      li.children[2].textContent = '+' + e.value + ' €';
      ul.appendChild(li);
    });
  }

  /* ---------- setup ---------- */
  function setupMsg(k) { $('setupMsg').textContent = k ? t(k) : ''; }
  $('startBtn').onclick = () => {
    const name = $('nameInput').value.replace(/\s+/g, ' ').trim();
    if (name.length < 5 || name.indexOf(' ') < 0) return setupMsg('nameShort');
    profile = { id: newId(), name: name, registered: false };
    store.set('profile', profile);
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    render(); sync();
  };
  $('showRestore').onclick = () => { $('setupNew').hidden = true; $('setupRestore').hidden = false; setupMsg(); };
  $('showNew').onclick = () => { $('setupNew').hidden = false; $('setupRestore').hidden = true; setupMsg(); };
  $('restoreBtn').onclick = async () => {
    let id = $('codeInput').value.trim().toUpperCase().replace(/\s/g, '');
    if (/^[A-Z0-9]{8}$/.test(id)) id = 'M-' + id;
    if (!/^M-[A-Z0-9]{8}$/.test(id)) return setupMsg('badCode');
    if (!CFG.syncUrl) return setupMsg('noSync');
    $('restoreBtn').disabled = true; setupMsg();
    try {
      const j = await post({ v: 1, memberId: id, restore: true, events: [] });
      if (j && j.ok) {
        profile = { id: id, name: j.name, registered: true };
        store.set('profile', profile);
        events = []; mergeServer(j.events);
        render();
      } else setupMsg('badCode');
    } catch (e) { setupMsg('needNet'); }
    $('restoreBtn').disabled = false;
  };
  document.querySelectorAll('.langBtn').forEach((b) => {
    b.onclick = () => { lang = lang === 'ar' ? 'en' : 'ar'; store.set('lang', lang); setupMsg(); render(); };
  });

  /* ---------- scanner ---------- */
  let stream = null, scanning = false;
  const video = $('video'), canvas = $('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  async function startScan() {
    $('result').hidden = true;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }, audio: false });
    } catch (e) { return showResult({ err: 'eCam' }); }
    $('scanner').hidden = false;
    video.srcObject = stream;
    try { await video.play(); } catch (e) { /* autoplay attribute covers it */ }
    scanning = true;
    requestAnimationFrame(tick);
  }
  function stopScan() {
    scanning = false;
    if (stream) stream.getTracks().forEach((tr) => tr.stop());
    stream = null; video.srcObject = null;
    $('scanner').hidden = true;
  }
  let lastTick = 0;
  function tick(now) {
    if (!scanning) return;
    if (video.readyState >= 2 && video.videoWidth && now - lastTick > 120) {
      lastTick = now;
      const scale = Math.min(1, 800 / Math.max(video.videoWidth, video.videoHeight));
      const w = Math.round(video.videoWidth * scale), h = Math.round(video.videoHeight * scale);
      canvas.width = w; canvas.height = h;
      ctx.drawImage(video, 0, 0, w, h);
      const img = ctx.getImageData(0, 0, w, h);
      const found = window.jsQR(img.data, w, h, { inversionAttempts: 'dontInvert' });
      if (found && found.data) { stopScan(); handleCode(found.data); return; }
    }
    requestAnimationFrame(tick);
  }
  async function handleCode(text) {
    const r = await redeem(text);
    showResult(r);
    if (r.ok) {
      if (navigator.vibrate) navigator.vibrate(120);
      render();
      const b = $('balance').parentNode; b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
      sync();
    }
  }
  function showResult(r) {
    const icon = $('resultIcon');
    if (r.ok) {
      icon.innerHTML = '<span class="coin">€</span>';
      $('resultTitle').textContent = t('gotTitle')(r.value);
      $('resultText').textContent = t('gotText')(ACTS[r.act][lang]);
    } else {
      icon.textContent = r.err === 'eDup' ? '👍' : '⚠️';
      $('resultTitle').textContent = t(r.err)[0];
      $('resultText').textContent = t(r.err)[1] + (r.at || '');
    }
    $('resultAgain').hidden = !!r.ok || r.err === 'eCam';
    $('result').hidden = false;
  }
  $('scanBtn').onclick = startScan;
  $('scanCancel').onclick = stopScan;
  $('resultOk').onclick = () => { $('result').hidden = true; };
  $('resultAgain').onclick = startScan;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && scanning) stopScan();
    if (!document.hidden) sync();
  });

  /* ---------- install tip ---------- */
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  let installEvt = null;
  function showTip(text, withBtn) {
    if (standalone || store.get('tipClosed', false)) return;
    $('installText').textContent = text; $('installBtn').hidden = !withBtn; $('installTip').hidden = false;
  }
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; showTip(t('tipAndroid'), true); });
  $('installBtn').onclick = () => { if (installEvt) { installEvt.prompt(); installEvt = null; $('installTip').hidden = true; } };
  $('installClose').onclick = () => { $('installTip').hidden = true; store.set('tipClosed', true); };
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) showTip(t('tipIos'), false);

  /* ---------- start ---------- */
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  window.addEventListener('online', sync);
  setInterval(sync, 60000);
  window.__euro = { redeem: handleCode, sync: sync };
  render();
  sync();
})();
