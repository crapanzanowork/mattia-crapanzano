// Area clienti: il codice diventa una chiave qui nel browser e non viene mai inviato.
// Dal sito arrivano solo file cifrati (li prepara _privato/clienti/cifra.mjs, con gli stessi SALE e GIRI).
const SALE = 'crapanzano.work/clienti/v1', GIRI = 600000;
const subtle = crypto.subtle, te = new TextEncoder();
const $ = id => document.getElementById(id);
const norm = c => c.toUpperCase().replace(/[^A-Z0-9]/g, '');
const hex = b => Array.from(b, x => x.toString(16).padStart(2, '0')).join('');

async function chiavi(codice) {
  const base = await subtle.importKey('raw', te.encode(norm(codice)), 'PBKDF2', false, ['deriveBits']);
  const m = await subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: te.encode(SALE), iterations: GIRI }, base, 256);
  const hk = await subtle.importKey('raw', m, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const h = async t => new Uint8Array(await subtle.sign('HMAC', hk, te.encode(t)));
  return { id: hex((await h('id')).slice(0, 16)), key: await subtle.importKey('raw', await h('aes'), 'AES-GCM', false, ['decrypt']) };
}
// ogni file: 12 byte di iv, poi il contenuto cifrato con il suo sigillo
async function apri(nome, key) {
  const r = await fetch('/area-clienti/d/' + nome + '.bin', { cache: 'no-store' });
  if (!r.ok) throw new Error('assente');
  const b = new Uint8Array(await r.arrayBuffer());
  return subtle.decrypt({ name: 'AES-GCM', iv: b.slice(0, 12) }, key, b.slice(12));
}

function el(tag, cls, testo) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (testo) e.textContent = testo;
  return e;
}
function bottone(cls, testo, fai) {
  const b = el('button', cls, testo);
  b.type = 'button';
  b.addEventListener('click', fai);
  return b;
}
const fuori = (a, link) => { a.href = link; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a; };
const peso = n => n > 1048576 ? (n / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
const giorno = s => s ? s.split('-').reverse().join('/') : '';
const euro = n => '€ ' + Number(n).toLocaleString('it-IT', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
const recenti = l => [...l].sort((a, b) => (b.data || '').localeCompare(a.data || ''));
function titolo(testo, em) {
  const h = el('h2', '', testo + ' ');
  h.append(el('em', '', em));
  return h;
}
const vuoto = testo => el('p', 'vuoto', testo);
function lista(voci, fai, seVuota) {
  if (!voci.length) return vuoto(seVuota);
  const l = el('div', 'lista');
  voci.forEach(v => l.append(fai(v)));
  return l;
}
// linguette (Recenti, Inviati da me…): ognuna ridisegna il contenuto sotto
function schede(nomi, disegna) {
  const box = el('div', 'linguette'), barra = el('div', 'schede'), corpo = el('div');
  barra.setAttribute('role', 'tablist');
  nomi.forEach((n, i) => {
    const b = bottone('scheda', n, () => {
      for (const x of barra.children) x.setAttribute('aria-selected', x === b);
      corpo.replaceChildren(disegna(i));
    });
    b.setAttribute('role', 'tab');
    barra.append(b);
  });
  box.append(barra, corpo);
  barra.firstChild.click();
  return box;
}

function rigaFile(f, key) {
  const v = el('div', 'voce'), t = el(f.web ? 'button' : 'div', 'testo');
  // copertina: la prima pagina del PDF, oppure il tipo di file
  const cop = el(f.web || f.id ? 'button' : 'span', 'cop');
  if (f.img) { const i = el('img'); i.src = f.img; i.alt = ''; cop.append(i); }
  else cop.append(el('span', '', f.id ? f.nome.split('.').pop() : 'Link'));
  const et = el('div', 'etichette');
  et.append(el('span', 'chi ' + f.da, f.da === 'te' ? 'Da te' : 'Da me'));
  if (f.nuovo) et.append(el('span', 'nuovo', 'Nuovo'));
  t.append(et, el('b', '', f.titolo),
           el('span', '', [f.progetto, giorno(f.data), f.dettaglio].filter(Boolean).join(' · ')));
  v.append(cop, t);
  if (f.stato) v.append(el('span', 'stato', f.stato));
  let b;
  if (f.id) {
    b = bottone(f.web ? 'pill' : 'pill pieno', 'Scarica', () => scarica(f, key, b));
    b.title = f.nome + ' · ' + peso(f.peso);
  }
  if (f.web) {
    const g = bottone('pill pieno', 'Guarda', () => guarda(f, key, g));
    t.type = 'button';
    t.addEventListener('click', () => guarda(f, key, g));
    v.append(g);
  }
  if (b) v.append(b);
  if (f.link) v.append(fuori(el('a', 'pill', 'Apri'), f.link));
  if (cop.tagName === 'BUTTON') {
    cop.type = 'button';
    cop.setAttribute('aria-label', (f.web ? 'Guarda ' : 'Scarica ') + f.titolo);
    cop.addEventListener('click', () => f.web ? guarda(f, key, cop) : scarica(f, key, b));
  }
  return v;
}
function rigaFattura(x, key) {
  const v = el('div', 'voce fattura'), t = el('div', 'testo');
  t.append(el('b', '', 'Fattura n. ' + x.numero),
           el('span', '', [x.progetto, 'del ' + giorno(x.data), !x.saldata && x.scadenza ? 'scade il ' + giorno(x.scadenza) : ''].filter(Boolean).join(' · ')));
  v.append(t, el('b', 'importo', euro(x.importo)), el('span', 'stato ' + (x.saldata ? 'ok' : 'attesa'), x.saldata ? 'Saldata' : 'Da saldare'));
  if (x.id) { const b = bottone('pill', 'PDF', () => scarica(x, key, b)); v.append(b); }
  return v;
}

function mostra(s, key) {
  const a = $('area');
  a.replaceChildren();
  const daSaldare = s.fatture.filter(x => !x.saldata), totale = daSaldare.reduce((n, x) => n + Number(x.importo || 0), 0);

  // benvenuto
  a.append(el('p', 'k', s.azienda || s.nome));
  const h = el('h1', '', 'Ciao ');
  h.append(el('em', '', s.saluto + '.'));
  a.append(h);
  if (s.benvenuto) a.append(el('p', 'lead', s.benvenuto));
  a.append(el('p', 'agg', 'Aggiornata il ' + s.aggiornata));
  const numeri = el('div', 'numeri');
  for (const [n, t] of [[s.progetti.length, s.progetti.length === 1 ? 'progetto' : 'progetti'], [s.file.length, 'file'],
                        [daSaldare.length ? euro(totale) : '0', 'da saldare']]) {
    const c = el('div', 'numero');
    c.append(el('b', '', String(n)), el('span', '', t));
    numeri.append(c);
  }
  a.append(numeri);

  // progetti
  a.append(titolo('I nostri', 'progetti.'));
  a.append(lista(s.progetti, p => {
    const c = el('div', 'progetto'), top = el('div', 'top');
    top.append(el('span', 'k', p.per || ''), el('span', 'stato', p.stato || ''));
    c.append(top, el('b', '', p.nome), el('p', '', p.dettaglio || ''));
    if (p.prossimo) { const n = el('p', 'prossimo'); n.append(el('span', 'k', 'Prossimo passo'), el('span', '', p.prossimo)); c.append(n); }
    return c;
  }, 'Qui compariranno i progetti che facciamo insieme.'));

  // file
  a.append(titolo('I nostri', 'file.'));
  const mie = s.file.filter(f => f.da !== 'te'), tue = s.file.filter(f => f.da === 'te');
  if (mie.length) recenti(mie)[0].nuovo = true;   // l'ultimo file che ho mandato porta l'etichetta "Nuovo"
  a.append(schede(['Recenti', 'Inviati da me · ' + mie.length, 'Inviati da te · ' + tue.length, 'Archivio · ' + s.file.length], i => {
    const r = f => rigaFile(f, key);
    if (i === 0) return lista(recenti(s.file).slice(0, 5), r, 'Ancora nessun file.');
    if (i === 1) return lista(recenti(mie), r, 'Qui trovi quello che ti mando: preventivi, anteprime e consegne.');
    if (i === 2) return lista(recenti(tue), r, 'Qui trovi quello che mi mandi tu: brief, loghi, font e materiali.');
    if (!s.file.length) return vuoto("L'archivio si riempie progetto dopo progetto.");
    const box = el('div');   // archivio: tutto, diviso per progetto
    for (const p of [...new Set(s.file.map(f => f.progetto || 'Altro'))]) {
      box.append(el('h3', 'gruppo', p), lista(recenti(s.file.filter(f => (f.progetto || 'Altro') === p)), r, ''));
    }
    return box;
  }));

  // fatture
  a.append(titolo('Le', 'fatture.'));
  const saldate = s.fatture.filter(x => x.saldata), rf = x => rigaFattura(x, key);
  a.append(schede(['Da saldare · ' + daSaldare.length, 'Saldate · ' + saldate.length], i => i === 0
    ? lista(recenti(daSaldare), rf, 'Nessuna fattura da saldare.')
    : lista(recenti(saldate), rf, 'Le fatture saldate restano qui, in archivio.')));
  const pg = s.pagamento, paga = el('div', 'paga'), kv = el('div', 'kv');
  paga.append(el('span', 'k', 'Pagamento con bonifico'));
  for (const [k, v] of [['Intestatario', pg.intestatario], ['IBAN', pg.iban.replace(/(.{4})/g, '$1 ').trim()], ['Banca', pg.banca], ['BIC', pg.bic], ['Causale', 'il numero della fattura']]) {
    const r = el('div', 'riga');
    r.append(el('span', 'k', k), el('span', '', v));
    if (k === 'IBAN') r.append(bottone('pill', 'Copia', async e => { await navigator.clipboard.writeText(pg.iban); e.target.textContent = 'Copiato'; }));
    kv.append(r);
  }
  paga.append(kv);
  a.append(paga);

  // contatti
  a.append(titolo('Per qualsiasi', 'cosa.'));
  const p = el('div', 'contatti'), mail = el('a', 'pill', 'crapanzano.work@gmail.com');
  mail.href = 'mailto:crapanzano.work@gmail.com';
  p.append(mail, fuori(el('a', 'pill', 'WhatsApp · 351 465 8810'), 'https://wa.me/393514658810'),
    fuori(el('a', 'pill', 'Instagram · @crapanzano.work'), 'https://www.instagram.com/crapanzano.work/'),
    fuori(el('a', 'pill', 'LinkedIn · mattia-crapanzano'), 'https://www.linkedin.com/in/mattia-crapanzano/'));
  a.append(p);

  $('accesso').hidden = true;
  a.hidden = false;
  document.body.classList.add('dentro');
  $('esci').hidden = false;
  document.title = 'Area clienti · ' + (s.azienda || s.nome);
  window.scrollTo(0, 0);
}

async function scarica(d, key, b) {
  const prima = b.textContent;
  b.disabled = true; b.textContent = 'Apro…';
  try {
    const url = URL.createObjectURL(new Blob([await apri(d.id, key)], { type: d.tipo || 'application/pdf' }));
    const x = el('a'); x.href = url; x.download = d.nome; document.body.append(x); x.click(); x.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    b.textContent = prima;
  } catch { b.textContent = 'Riprova'; }
  b.disabled = false;
}

// il documento come pagina del sito: dalla versione web tengo solo il contenuto (niente stili, script, testate e firme del PDF)
// e lo ridisegno con clienti.css
let torna = 0;
async function guarda(d, key, b) {
  b.disabled = true;
  try {
    const doc = new DOMParser().parseFromString(new TextDecoder().decode(await apri(d.web, key)), 'text/html');
    doc.querySelectorAll('script, style, link, .hd, .ft, .wm, body > svg').forEach(e => e.remove());
    const firma = doc.querySelector('.sign');
    doc.querySelectorAll('.fill').forEach(e => (e.closest('.row') || e).remove());
    doc.querySelectorAll('.sign').forEach(e => e.remove());
    doc.querySelectorAll('[style]').forEach(e => e.removeAttribute('style'));
    doc.querySelectorAll('a[href]').forEach(x => { x.target = '_blank'; x.rel = 'noopener noreferrer'; });
    const prev = el('article', 'prev');
    prev.append(...[...doc.body.children].map(n => document.importNode(n, true)));
    const pagine = prev.querySelectorAll('section.page');
    pagine.forEach(p => { if (/segue/i.test(p.querySelector('.sec')?.textContent || '')) p.classList.add('segue'); });
    // indice in copertina: ogni riga porta alla sua parte
    for (const r of prev.querySelectorAll('.index .row')) {
      const n = parseInt((r.textContent.match(/pag\.\s*(\d+)/i) || [])[1], 10), p = pagine[n - 1];
      if (!p) continue;
      r.lastElementChild.textContent = '→';
      r.addEventListener('click', () => p.scrollIntoView({ behavior: 'smooth' }));
    }
    if (firma) {
      const f = el('div', 'firma');
      f.append(el('p', '', 'Per accettare scarica il PDF, firmalo dove indicato e rimandamelo per email.'));
      const pdf = bottone('pill pieno', 'Scarica PDF', () => scarica(d, key, pdf));
      f.append(pdf);
      prev.append(f);
    }
    const v = $('vista'), barra = el('div', 'barra'), t = el('div', 'testo');
    t.append(el('b', '', d.titolo), el('span', '', [d.progetto, d.dettaglio].filter(Boolean).join(' · ')));
    const pdf = bottone('pill pieno', 'Scarica PDF', () => scarica(d, key, pdf));
    barra.append(bottone('pill', '← Area', () => history.back()), t);
    if (d.id) barra.append(pdf);
    v.replaceChildren(barra, prev);
    torna = scrollY;
    $('area').hidden = true; v.hidden = false; document.body.classList.add('largo');
    history.pushState({ vista: 1 }, '');
    scrollTo(0, 0);
  } catch { b.textContent = 'Riprova'; }
  b.disabled = false;
}
function chiudi() {
  $('vista').hidden = true; $('vista').replaceChildren();
  $('area').hidden = false; document.body.classList.remove('largo');
  scrollTo(0, torna);
}
addEventListener('popstate', () => { if (!$('vista').hidden) chiudi(); });

async function entra(codice) {
  const msg = $('msg'), btn = $('vai');
  if (norm(codice).length !== 20) { msg.textContent = 'Il codice ha 5 blocchi da 4 caratteri: controlla di averlo scritto per intero.'; return; }
  btn.disabled = true; btn.textContent = 'Apro…'; msg.textContent = '';
  try {
    const { id, key } = await chiavi(codice);
    mostra(JSON.parse(new TextDecoder().decode(await apri(id, key))), key);
  } catch {
    msg.textContent = 'Codice non riconosciuto. Controlla di averlo scritto per intero.';
  }
  btn.disabled = false; btn.textContent = 'Entra';
}

$('modulo').addEventListener('submit', e => { e.preventDefault(); entra($('codice').value); });
$('esci').addEventListener('click', () => location.replace(location.pathname));
