// Link rapidi e domande frequenti della home (il sito classico). Li scrive nell'HTML prepara-pagina.mjs, dagli stessi dati del laboratorio.
import { PANNELLI, FAQ, CONTATTI, CV } from './dati.js';

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const t = (a, L) => Array.isArray(a) ? (a[L] ?? a[0]) : a;
const lista = voci => '<ul>' + voci.map(([testo, href, fuori]) => `<li><a href="${href}"${fuori ? ' target="_blank" rel="noopener"' : ''}>${esc(testo)}</a></li>`).join('') + '</ul>';

export function homeExtraHTML(L = 0) {
  const it = !L;
  const mestieri = it
    ? [['In luce · Foto, video e siti web', '/luce/'], ['Foto e video', '/luce/foto-video/'], ['Siti web', '/luce/siti-web/'], ['In soccorso · Tecnico soccorritore su fune', '/soccorso/'],
       ['Lavori su fune', '/quota/'], ['Assistenza e soccorso', '/cura/'], ['Laboratorio 3D', '/lab/']]
    : [['In focus · Photo, video and websites', '/en/luce/'], ['Photo and video', '/en/luce/photo-video/'], ['Websites', '/en/luce/websites/'], ['In rescue · Rope rescue technician', '/en/soccorso/'],
       ['Rope access', '/en/quota/'], ['Care and rescue', '/en/cura/'], ['3D workshop', '/lab/?lang=en']];
  const cv = PANNELLI.stampante.cv.map(([i, e, s, f, fe]) => [(it ? 'CV ' + i : e + ' résumé') + ' · ' + t(s, L), CV(L ? fe : f)]);
  const contatti = [['WhatsApp · ' + CONTATTI.telTxt, CONTATTI.wa(it ? 'Ciao Mattia, ' : 'Hi Mattia, '), 1], [(it ? 'Telefono · ' : 'Phone · ') + CONTATTI.telTxt, 'tel:' + CONTATTI.tel],
                    ['Email · ' + CONTATTI.mail, 'mailto:' + CONTATTI.mail], ['Instagram · @crapanzano.work', CONTATTI.instagram, 1], ['LinkedIn · mattia-crapanzano', CONTATTI.linkedin, 1]];
  const altro = [[it ? 'Area clienti' : 'Client area', '/area-clienti/'], [it ? 'Laboratorio 3D, versione testo' : '3D workshop, text version', '/lab/?testo' + (it ? '' : '&lang=en')],
                 ['Privacy', it ? '/privacy/' : '/en/privacy/'], [it ? 'Note legali' : 'Legal notice', it ? '/note-legali/' : '/en/legal/'], [it ? 'English version' : 'Versione italiana', it ? '/en/' : '/']];
  return `
  <section class="lk" id="link-rapidi" aria-labelledby="lk-t">
    <h2 id="lk-t">${it ? 'Link <em>rapidi</em>' : 'Quick <em>links</em>'}</h2>
    <div class="lk__grid">
      <div><h3 class="mono">${it ? 'I miei percorsi' : 'My paths'}</h3>${lista(mestieri)}</div>
      <div><h3 class="mono">${it ? 'Curriculum in PDF' : 'Résumés (PDF)'}</h3>${lista(cv)}</div>
      <div><h3 class="mono">${it ? 'Contatti' : 'Contacts'}</h3>${lista(contatti)}</div>
      <div><h3 class="mono">${it ? 'Altro' : 'More'}</h3>${lista(altro)}</div>
    </div>
  </section>
  <section class="lk" id="faq" aria-labelledby="faq-t">
    <h2 id="faq-t">${it ? 'Domande <em>frequenti</em>' : 'Frequently asked <em>questions</em>'}</h2>
    <div class="lk__faq">${FAQ.map(q => `<details><summary>${esc(q[L][0])}</summary><p>${esc(q[L][1])}</p></details>`).join('')}</div>
  </section>`;
}
