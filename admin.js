'use strict';
(function () {
  const $ = (id) => document.getElementById(id);
  const ACTS = { m: ['Mass', 'قداس'], s: ['Service', 'فقرة افتتاحية'], c: ['Class', 'درس الفصل'], t: ['Tasbeha', 'تسبحة'] };
  const enc = new TextEncoder();
  let key = null;
  try { key = JSON.parse(localStorage.getItem('euro.adminKey')); } catch (e) { key = null; }

  function b64u(buf) {
    let s = ''; new Uint8Array(buf).forEach((b) => { s += String.fromCharCode(b); });
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function keyState() {
    $('keyState').textContent = key ? 'Key loaded ✓' : 'No key loaded';
    $('keyState').className = key ? 'ok' : 'bad';
    $('forget').hidden = !key;
  }
  $('keyFile').onchange = async (e) => {
    try {
      const k = JSON.parse(await e.target.files[0].text());
      if (!k.privateKey || !k.secret) throw new Error('bad');
      key = k; localStorage.setItem('euro.adminKey', JSON.stringify(k));
    } catch (err) { alert('This is not a valid admin-key.json file.'); }
    keyState();
  };
  $('forget').onclick = () => { key = null; localStorage.removeItem('euro.adminKey'); $('codes').textContent = ''; keyState(); };

  // Code format: E1.<activity>.<yyyymmdd>.<euros>.<serverTag>.<signature>
  async function makeCode(act, d8, value) {
    const base = ['E1', act, d8, value].join('.');
    const hk = await crypto.subtle.importKey('raw', enc.encode(key.secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const tag = b64u((await crypto.subtle.sign('HMAC', hk, enc.encode(base))).slice(0, 9));
    const msg = base + '.' + tag;
    const pk = await crypto.subtle.importKey('jwk', key.privateKey, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
    const sig = b64u(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, pk, enc.encode(msg)));
    return msg + '.' + sig;
  }

  $('make').onclick = async () => {
    if (!key) return alert('Load your admin-key.json file first.');
    const date = $('date').value;
    const value = Math.max(1, Math.min(99, parseInt($('value').value, 10) || 1));
    if (!date) return alert('Choose a date.');
    const d8 = date.replace(/-/g, '');
    const nice = new Date(date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const box = $('codes'); box.textContent = '';
    const picked = Array.from(document.querySelectorAll('#pick input:checked'), (i) => i.value);
    if (!picked.length) return alert('Tick at least one activity.');
    for (const act of picked) {
      const code = await makeCode(act, d8, value);
      const qr = window.qrcode(0, 'M'); qr.addData(code); qr.make();
      const div = document.createElement('div'); div.className = 'qr';
      div.innerHTML = '<h2></h2><h3></h3>' + qr.createSvgTag({ cellSize: 8, margin: 16, scalable: true }) + '<div class="meta"></div>';
      div.children[0].textContent = ACTS[act][1];
      div.children[1].textContent = ACTS[act][0];
      div.lastChild.textContent = nice + ' · ' + value + ' €';
      div.onclick = () => div.classList.toggle('full');
      box.appendChild(div);
    }
  };
  $('print').onclick = () => window.print();

  const now = new Date();
  $('date').value = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  // Friday -> Mass, Service, Class. Thursday -> Tasbeha.
  function autoTick() {
    const day = new Date($('date').value + 'T12:00:00').getDay();
    if (day !== 5 && day !== 4) return;
    document.querySelectorAll('#pick input').forEach((i) => { i.checked = day === 5 ? i.value !== 't' : i.value === 't'; });
  }
  $('date').onchange = autoTick;
  autoTick();
  keyState();
  window.__makeCode = makeCode;
})();
