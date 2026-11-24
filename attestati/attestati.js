// Attestati: il codice (dopo # nel link, o scritto nel riquadro) apre l'indice cifrato in /attestati/d/.
// Stessi passi di _privato/attestati/cifra-attestati.mjs: PBKDF2-SHA256 600.000 giri, poi AES-256-GCM. Il codice non lascia il dispositivo.
'use strict';
const SALE = 'crapanzano.work/attestati/v1', GIRI = 600000;
const subtle = crypto.subtle, te = new TextEncoder();
const $ = s => document.querySelector(s);
const norm = c => c.toUpperCase().replace(/[^A-Z0-9]/g, '');
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
let K = null, I = null, elenco = [], attuale = -1;

async function chiavi(codice) {
  const base = await subtle.importKey('raw', te.encode(norm(codice)), 'PBKDF2', false, ['deriveBits']);
  const m = await subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: te.encode(SALE), iterations: GIRI }, base, 256);
  const hk = await subtle.importKey('raw', m, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const h = t => subtle.sign('HMAC', hk, te.encode(t));
  return { id: hex((await h('id')).slice(0, 16)), key: await subtle.importKey('raw', await h('aes'), 'AES-GCM', false, ['decrypt']) };
}
async function apri(nome) {
  const r = await fetch('/attestati/d/' + nome + '.bin', { cache: 'no-cache' });
  if (!r.ok) throw new Error(r.status === 404 ? 'codice' : 'rete');
  const b = new Uint8Array(await r.arrayBuffer());
  return subtle.decrypt({ name: 'AES-GCM', iv: b.slice(0, 12) }, K.key, b.slice(12));
}
const blobUrl = new Map();
async function url(r, tipo) {
  if (!blobUrl.has(r.id)) blobUrl.set(r.id, apri(r.id).then(d => URL.createObjectURL(new Blob([d], { type: tipo }))));
  return blobUrl.get(r.id);
}
async function scarica(f, bottone) {
  const testo = bottone && bottone.textContent;
  if (bottone) { bottone.disabled = true; bottone.textContent = 'Preparo…'; }
  try {
    const a = document.createElement('a');
    a.href = await url(f, f.tipo); a.download = f.nome; document.body.append(a); a.click(); a.remove();
  } catch { alert('Download non riuscito. Riprova.'); }
  finally { if (bottone) { bottone.disabled = false; bottone.textContent = testo; } }
}

// ---------- date e scadenze ----------
const OGGI = new Date(); OGGI.setHours(0, 0, 0, 0);
const giorno = s => new Date(s + 'T00:00:00');
const it = (s, o = { day: '2-digit', month: '2-digit', year: 'numeric' }) => giorno(s).toLocaleDateString('it-IT', o);
const mesi = s => (giorno(s) - OGGI) / 864e5 / 30.44;
function quanto(s) {
  const m = Math.round(mesi(s));
  if (m < 0) return 'scaduto da ' + (-m) + (m === -1 ? ' mese' : ' mesi');
  if (m < 1) return 'tra meno di un mese';
  if (m < 18) return 'tra ' + m + (m === 1 ? ' mese' : ' mesi');
  const a = Math.floor(m / 12), r = m % 12;
  return 'tra ' + a + (a === 1 ? ' anno' : ' anni') + (r ? ' e ' + r + (r === 1 ? ' mese' : ' mesi') : '');
}
function stato(v) {
  if (v.tipo === 'programma') return { c: 'prog', t: 'In programma' };
  if (v.tipo === 'assorbito') return { c: 'muto', t: 'Superato' };
  if (!v.scadenza) return { c: 'muto', t: 'Senza scadenza' };
  const m = mesi(v.scadenza);
  if (m < 0) return { c: 'ko', t: 'Scaduto' };
  if (m <= 6) return { c: 'warn', t: 'In scadenza' };
  return { c: 'ok', t: 'Valido' };
}
const scadeTesto = v => v.tipo === 'norma' ? 'Da aggiornare entro il ' + it(v.scadenza) : 'Valido fino al ' + it(v.scadenza);

// ---------- costruzione ----------
const el = (tag, cls, testo) => { const e = document.createElement(tag); if (cls) e.className = cls; if (testo != null) e.textContent = testo; return e; };
const NUMERI = ['zero', 'un', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove', 'dieci', 'undici', 'dodici', 'tredici', 'quattordici', 'quindici', 'sedici',
  'diciassette', 'diciotto', 'diciannove', 'venti', 'ventuno', 'ventidue', 'ventitré', 'ventiquattro', 'venticinque', 'ventisei', 'ventisette', 'ventotto', 'ventinove', 'trenta'];
const maiusc = s => s[0].toUpperCase() + s.slice(1);

function costruisci() {
  const P = $('#pagina'); P.replaceChildren();
  const voci = I.gruppi.flatMap(g => g.voci.map(v => ({ ...v, g })));
  const conFile = voci.filter(v => v.file);
  const attive = voci.filter(v => v.scadenza && (v.tipo === 'attestato' || v.tipo === 'norma'));
  const scaduti = attive.filter(v => mesi(v.scadenza) < 0), vicini = attive.filter(v => mesi(v.scadenza) >= 0 && mesi(v.scadenza) <= 6);
  const prossima = attive.filter(v => mesi(v.scadenza) >= 0).sort((a, b) => a.scadenza.localeCompare(b.scadenza))[0];
  const programma = voci.filter(v => v.tipo === 'programma' && giorno(v.data) >= OGGI);
  elenco = conFile;

  // apertura
  const testa = el('section', 'testa');
  testa.append(el('p', 'k', 'Attestati e scadenze · aggiornato il ' + it(I.aggiornato)));
  const h1 = el('h1'); h1.append(maiusc(NUMERI[conFile.length] || String(conFile.length)) + ' attestati, ');
  h1.append(el('em', '', scaduti.length ? scaduti.length + ' da rinnovare.' : vicini.length ? vicini.length + ' in scadenza.' : 'tutti in regola.'));
  testa.append(h1);
  testa.append(el('p', 'lead', 'Tutti i miei attestati in un posto solo, da guardare e da scaricare, con le scadenze da tenere d’occhio.'));

  const numeri = el('div', 'numeri');
  const num = (b, s, cls) => { const d = el('div', 'numero ' + (cls || '')); d.append(el('b', '', b), el('span', '', s)); numeri.append(d); };
  num(String(conFile.length), 'attestati in ' + I.gruppi.length + ' aree');
  num(String(attive.length - scaduti.length - vicini.length), 'con scadenza, tutti validi oggi', 'ok');
  if (prossima) num(it(prossima.scadenza, { month: 'short', year: 'numeric' }), 'prima scadenza: ' + prossima.titolo.split(' · ')[0]);
  if (programma[0]) num(programma[0].quando || it(programma[0].data, { day: 'numeric', month: 'short' }), programma[0].titolo.split(' e ')[0] + ', in programma', 'prog');
  testa.append(numeri);

  // a colpo d'occhio: barra per aree
  const barra = el('div', 'barra'), legenda = el('div', 'legenda');
  for (const g of I.gruppi) {
    const n = g.voci.filter(v => v.file).length;
    const s = el('span', 'c-' + g.colore); s.style.flexGrow = n; s.title = g.titolo + ': ' + n; barra.append(s);
    const a = el('a', 'voce-legenda'); a.href = '#' + g.id;
    a.append(el('i', 'c-' + g.colore), el('b', '', String(n)), el('span', '', g.breve)); legenda.append(a);
  }
  testa.append(barra, legenda);

  // download principali
  const dl = el('div', 'scarichi');
  if (I.cv) { const b = el('button', 'pill pieno', 'Scarica il CV · Soccorso industriale'); b.type = 'button'; b.onclick = () => scarica(I.cv, b); dl.append(b); }
  const bz = el('button', 'pill', 'Scarica tutti gli attestati · ZIP ' + Math.round(I.zip.kb / 1024) + ' MB'); bz.type = 'button'; bz.onclick = () => scarica(I.zip, bz); dl.append(bz);
  if (I.learnn) { const a = el('a', 'pill', 'Profilo Learnn ↗'); a.href = I.learnn; a.target = '_blank'; a.rel = 'noopener noreferrer'; dl.append(a); }
  testa.append(dl);
  P.append(testa);

  // scadenze
  const sc = el('section', 'blocco');
  sc.id = 'scadenze';
  sc.append(el('p', 'k', 'Scadenze'), el('h2', '', 'Cosa rinnovare, e quando.'));
  const lista = el('ol', 'scadenze');
  const daMostrare = [...programma.map(v => ({ v, d: v.data })), ...attive.map(v => ({ v, d: v.scadenza }))].sort((a, b) => a.d.localeCompare(b.d));
  for (const { v, d } of daMostrare) {
    const st = stato(v), li = el('li', 'riga-sc ' + st.c);
    const data = el('div', 'sc-data'); data.append(el('b', '', it(d, { day: '2-digit', month: 'short' })), el('span', '', String(giorno(d).getFullYear())));
    const t = el('div', 'sc-testo'); t.append(el('b', '', v.titolo));
    t.append(el('span', '', v.tipo === 'programma' ? v.nota + ' · ' + v.ente : (v.tipo === 'norma' ? 'Aggiornamento previsto dalla norma* · ' : 'Scadenza sull’attestato · ') + quanto(d)));
    if (v.data && v.scadenza && v.tipo !== 'programma') {
      const tot = giorno(v.scadenza) - giorno(v.data), fatto = Math.min(1, Math.max(0, (OGGI - giorno(v.data)) / tot));
      const pr = el('div', 'resto'); const f = el('i'); f.style.width = (100 - fatto * 100).toFixed(1) + '%'; pr.append(f); t.append(pr);
    }
    li.append(data, t, el('span', 'chip ' + st.c, st.t));
    if (v.file) { li.classList.add('cliccabile'); li.onclick = () => mostra(elenco.indexOf(elenco.find(x => x.file.id === v.file.id))); }
    lista.append(li);
  }
  sc.append(lista, el('p', 'nota', '* Data calcolata da me in base alla legge, non scritta sull’attestato. La barra mostra quanta validità resta.'));
  P.append(sc);

  // gruppi
  for (const g of I.gruppi) {
    const s = el('section', 'blocco gruppo c-' + g.colore); s.id = g.id;
    const n = g.voci.filter(v => v.file).length;
    const tit = el('div', 'tit-gruppo'); tit.append(el('p', 'k', n + (n === 1 ? ' attestato' : ' attestati')), el('h2', '', g.titolo));
    s.append(tit);
    const griglia = el('div', 'griglia' + (g.piccole ? ' piccole' : ''));
    for (const v of g.voci) griglia.append(scheda(v));
    s.append(griglia);
    P.append(s);
  }
  osserva();
}

function scheda(v) {
  const st = stato(v), c = el('article', 'scheda ' + st.c);
  if (v.file) {
    const fig = el('button', 'cornice'); fig.type = 'button'; fig.setAttribute('aria-label', 'Guarda ' + v.titolo);
    const img = el('img'); img.alt = v.titolo; img.dataset.id = v.mini.id; img.decoding = 'async';
    fig.append(img); fig.onclick = () => mostra(elenco.findIndex(x => x.file.id === v.file.id));
    c.append(fig);
  } else {
    const vuota = el('div', 'cornice vuota'); vuota.append(el('span', 'k', 'Attestato in arrivo'), el('b', '', v.nota)); c.append(vuota);
  }
  const t = el('div', 'scheda-testo');
  const top = el('div', 'scheda-top'); top.append(el('span', 'chip ' + st.c, st.t)); if (v.data) top.append(el('span', 'k', it(v.data)));
  t.append(top, el('h3', '', v.titolo), el('p', 'ente', v.ente));
  if (v.scadenza) t.append(el('p', 'scade', scadeTesto(v) + (v.tipo === 'norma' ? '*' : '')));
  else if (v.nota && v.file) t.append(el('p', 'scade', v.nota));
  if (v.nota && v.scadenza) t.append(el('p', 'ente', v.nota));
  if (v.file) {
    const az = el('div', 'azioni');
    const b = el('button', 'pill pieno', 'Scarica'); b.type = 'button'; b.onclick = () => scarica(v.file, b);
    az.append(b);
    if (v.verifica) { const a = el('a', 'pill', 'Verifica ↗'); a.href = v.verifica; a.target = '_blank'; a.rel = 'noopener noreferrer'; az.append(a); }
    az.append(el('span', 'peso', v.file.nome.split('.').pop().toUpperCase() + ' · ' + (v.file.kb > 1000 ? (v.file.kb / 1024).toFixed(1) + ' MB' : v.file.kb + ' KB')));
    t.append(az);
  }
  c.append(t);
  return c;
}

// anteprime cifrate: si aprono quando entrano nello schermo, poche alla volta
let coda = [], attive = 0;
function prossima() {
  while (attive < 4 && coda.length) {
    const img = coda.shift(); attive++;
    url({ id: img.dataset.id }, 'image/jpeg').then(u => { img.src = u; img.onload = () => img.classList.add('pronta'); })
      .catch(() => img.closest('.cornice').classList.add('errore')).finally(() => { attive--; prossima(); });
  }
}
function osserva() {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); coda.push(e.target); prossima(); } }), { rootMargin: '600px' });
  document.querySelectorAll('img[data-id]').forEach(i => io.observe(i));
}

// ---------- vista grande ----------
const D = $('#vista');
async function mostra(i) {
  if (i < 0) return;
  attuale = (i + elenco.length) % elenco.length;
  const v = elenco[attuale];
  $('#v-titolo').textContent = v.titolo;
  $('#v-meta').textContent = [v.ente, v.data && it(v.data), v.scadenza && scadeTesto(v)].filter(Boolean).join(' · ');
  const ver = $('#v-verifica'); ver.hidden = !v.verifica; if (v.verifica) ver.href = v.verifica;
  const img = $('#v-img'); img.classList.remove('pronta'); img.alt = v.titolo;
  img.width = v.grande.w; img.height = v.grande.h;
  if (!D.open) D.showModal();
  const u = await url(v.grande, 'image/jpeg');
  if (elenco[attuale] === v) { img.src = u; img.onload = () => img.classList.add('pronta'); }
}
$('#v-chiudi').onclick = () => D.close();
$('#v-prima').onclick = () => mostra(attuale - 1);
$('#v-dopo').onclick = () => mostra(attuale + 1);
$('#v-scarica').onclick = e => scarica(elenco[attuale].file, e.currentTarget);
D.addEventListener('click', e => { if (e.target === D) D.close(); });
D.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') mostra(attuale - 1); if (e.key === 'ArrowRight') mostra(attuale + 1); });

// ---------- ingresso ----------
async function entra(codice) {
  const msg = $('#msg'), vai = $('#vai');
  vai.disabled = true; msg.textContent = 'Apro…';
  try {
    K = await chiavi(codice);
    I = JSON.parse(new TextDecoder().decode(await apri(K.id)));
    $('#accesso').hidden = true; $('#pagina').hidden = false; document.body.classList.add('dentro');
    const t = $('#tutti'); t.hidden = false; t.onclick = () => scarica(I.zip, t);
    costruisci();
    if (location.hash.length < 10) history.replaceState(null, '', '#' + norm(codice).match(/.{1,4}/g).join('-'));
  } catch (e) {
    K = null;
    msg.textContent = e.message === 'rete' ? 'Connessione non riuscita. Riprova.' : 'Codice non valido.';
  } finally { vai.disabled = false; }
}
$('#modulo').addEventListener('submit', e => { e.preventDefault(); const c = $('#codice').value; if (norm(c).length >= 20) entra(c); else $('#msg').textContent = 'Il codice ha 20 caratteri.'; });
const h = decodeURIComponent(location.hash.slice(1));
if (norm(h).length >= 20) entra(h);
