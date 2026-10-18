// Versione testo del laboratorio: gli stessi contenuti dei pannelli in HTML semplice.
// La usano i motori di ricerca e gli assistenti AI (che non leggono dentro il 3D), chi preferisce leggere
// e chi ha un dispositivo senza WebGL. Viene scritta nell'HTML in fase di pubblicazione e ridisegnata nella lingua scelta.
import { PANNELLI, FAQ, ATTESTATI, SITI, CONTATTI, CV } from './dati.js';

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const t = (a, L) => Array.isArray(a) ? (a[L] ?? a[0]) : a;
const titolo = (k, L) => t(PANNELLI[k].h, L);                 // contiene <em>, scritto da noi: non va scappato
const para = (k, L) => PANNELLI[k].p ? `<p>${esc(t(PANNELLI[k].p, L))}</p>` : '';
const elenco = (k, L) => PANNELLI[k].li ? `<ul>${t(PANNELLI[k].li, L).map(([a, b]) => `<li><b>${esc(a)}</b> · ${esc(b)}</li>`).join('')}</ul>` : '';
const blocco = (k, L, liv = 3) => `<h${liv}>${titolo(k, L)}</h${liv}>${para(k, L)}${elenco(k, L)}`;

export function testoHTML(L = 0) {
  const it = !L;
  const cv = PANNELLI.stampante.cv.map(([i, e, s, f, fe]) => `<li><a href="${CV(L ? fe : f)}">${esc(it ? 'CV ' + i : e + ' résumé')}</a> · ${esc(t(s, L))}</li>`).join('');
  return `
<header class="t-capo">
  <p class="t-k">${it ? 'Curriculum · Legnago (VR)' : 'Résumé · Legnago, Italy'}</p>
  <h1>Mattia Crapanzano</h1>
  <p class="t-sotto">${it ? 'Tecnico su fune IRATA · Fotografo e videomaker · Operatore Socio Sanitario e soccorritore' : 'IRATA rope access technician · Photographer and videomaker · Healthcare assistant and first responder'}</p>
  ${para('bacheca', L)}
  <p>${it ? 'Lo stesso contenuto, impaginato come un sito tradizionale' : 'The same content, laid out as a traditional website'}: <a href="${it ? '/classico/' : '/en/'}">${it ? 'sito classico' : 'classic site'}</a>.</p>
  <p class="t-contatti"><a href="tel:${CONTATTI.tel}">${esc(CONTATTI.telTxt)}</a> · <a href="mailto:${CONTATTI.mail}">${esc(CONTATTI.mail)}</a> · <a href="${CONTATTI.linkedin}">LinkedIn</a> · <a href="${CONTATTI.instagram}">Instagram</a></p>
</header>
<section id="t-quota"><p class="t-k t-q">01 · ${it ? 'In quota' : 'At height'}</p><h2>${titolo('quota', L)}</h2>${para('quota', L)}${elenco('quota', L)}
  ${blocco('struttura', L)}${blocco('tripode', L)}</section>
<section id="t-luce"><p class="t-k t-l">02 · ${it ? 'In luce' : 'In focus'}</p><h2>${titolo('luce', L)}</h2>${para('luce', L)}${elenco('luce', L)}
  <h3>${titolo('macchina', L)}</h3>${para('macchina', L)}<ul>${PANNELLI.macchina.tappe.map(x => `<li><b>${esc(L ? x[2] : x[0])}</b> · ${esc(L ? x[3] : x[1])}</li>`).join('')}</ul>
  ${blocco('consulenza', L)}${blocco('set', L)}
  <h3>${titolo('scrivania', L)}</h3>${para('scrivania', L)}<ul>${SITI.map(([n, u]) => `<li><a href="${u}">${esc(n)}</a></li>`).join('')}</ul>
  ${blocco('tv', L)}</section>
<section id="t-cura"><p class="t-k t-c">03 · ${it ? 'In cura' : 'In care'}</p><h2>${titolo('cura', L)}</h2>${para('cura', L)}
  ${blocco('divise', L)}${blocco('finestra', L)}${blocco('radio', L)}${blocco('vvf', L)}</section>
<section id="t-formazione"><h2>${titolo('attestati', L)}</h2>${para('attestati', L)}<ul>${ATTESTATI.map(x => `<li><b>${esc(x[L][0])}</b> · ${esc(x[L][1])} · ${esc(x[L][2])}</li>`).join('')}</ul></section>
<section id="t-fuori"><h2>${titolo('sup', L)}</h2>${para('sup', L)}${blocco('boulder', L)}</section>
<section id="t-faq"><h2>${titolo('faq', L)}</h2>${FAQ.map(q => `<h3>${esc(q[L][0])}</h3><p>${esc(q[L][1])}</p>`).join('')}</section>
<section id="t-cv"><h2>${it ? 'Curriculum in PDF' : 'Résumés (PDF)'}</h2><ul>${cv}</ul>
  <p>${it ? 'Partita IVA' : 'VAT number'} 05209460236</p></section>
<footer class="t-piede"><span>© 2026 Mattia Crapanzano</span><a href="${it ? '/classico/' : '/en/'}">${it ? 'Sito classico' : 'Classic site'}</a><a href="${it ? '/privacy/' : '/en/privacy/'}">Privacy</a><a href="${it ? '/note-legali/' : '/en/legal/'}">${it ? 'Note legali' : 'Legal notice'}</a></footer>`;
}
