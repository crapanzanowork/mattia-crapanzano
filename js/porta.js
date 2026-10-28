// Porta d'ingresso della home: le due esperienze affiancate (sito classico e laboratorio 3D), poi link rapidi e domande frequenti.
// Viene scritta nell'HTML in fase di pubblicazione (prepara-pagina.mjs) e ridisegnata da main.js quando si cambia lingua.
import { PANNELLI, FAQ, CONTATTI, CV } from './dati.js';

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const t = (a, L) => Array.isArray(a) ? (a[L] ?? a[0]) : a;
const LOGO = '<svg viewBox="240 270 1450 1390" aria-hidden="true"><g fill="url(#mg)"><path d="M448 393L735 367V705Q735 735 710 752L562 850Q522 878 528 915L715 1340Q735 1390 735 1440V1650H450V1480Q450 1430 428 1380L262 1010Q245 955 290 920L430 826Q448 812 448 790Z"/><path d="M920 350L1207 325V595Q1207 625 1182 640L1035 735Q1005 760 1015 800L1185 1190Q1207 1240 1207 1290V1650H920V1330Q920 1280 898 1225L752 890Q735 830 790 790L897 712Q920 695 920 675Z"/><path d="M1392 307L1680 280V480Q1680 505 1652 523L1520 608Q1488 632 1497 675L1655 1025Q1680 1080 1680 1135V1650H1392V1145Q1392 1095 1368 1045L1235 745Q1222 690 1262 655L1370 585Q1392 568 1392 545Z"/></g></svg>';
const lista = voci => '<ul>' + voci.map(([testo, href, fuori]) => `<li><a href="${href}"${fuori ? ' target="_blank" rel="noopener"' : ''}>${esc(testo)}</a></li>`).join('') + '</ul>';

export function portaHTML(L = 0) {
  const it = !L;
  const mestieri = it
    ? [['In quota · Tecnico su fune', '/quota/'], ['In luce · Foto, video e siti web', '/luce/'], ['Foto e video', '/luce/foto-video/'], ['Siti web', '/luce/siti-web/'], ['In cura · OSS e soccorritore', '/cura/']]
    : [['At height · Rope access technician', '/en/quota/'], ['In focus · Photo, video and websites', '/en/luce/'], ['Photo and video', '/en/luce/photo-video/'], ['Websites', '/en/luce/websites/'], ['In care · Care worker and first responder', '/en/cura/']];
  const cv = PANNELLI.stampante.cv.map(([i, e, s, f, fe]) => [(it ? 'CV ' + i : e + ' résumé') + ' · ' + t(s, L), CV(L ? fe : f)]);
  const contatti = [['WhatsApp · ' + CONTATTI.telTxt, CONTATTI.wa(it ? 'Ciao Mattia, ' : 'Hi Mattia, '), 1], [(it ? 'Telefono · ' : 'Phone · ') + CONTATTI.telTxt, 'tel:' + CONTATTI.tel],
                    ['Email · ' + CONTATTI.mail, 'mailto:' + CONTATTI.mail], ['Instagram · @crapanzano.work', CONTATTI.instagram, 1], ['LinkedIn · mattia-crapanzano', CONTATTI.linkedin, 1]];
  const altro = [[it ? 'Area clienti' : 'Client area', '/area-clienti/'], [it ? 'Versione testo del laboratorio' : 'Text version of the workshop', '/?testo' + (it ? '' : '&lang=en')],
                 ['Privacy', it ? '/privacy/' : '/en/privacy/'], [it ? 'Note legali' : 'Legal notice', it ? '/note-legali/' : '/en/legal/'], [it ? 'English version' : 'Versione italiana', it ? '/?lang=en' : '/?lang=it']];
  return `<div class="p-in">
  <header class="p-top"><a class="p-brand" href="/">${LOGO}<span>Mattia Crapanzano</span></a><button class="p-lang mono" id="pLang" type="button" aria-label="${it ? 'Switch to English' : 'Passa all’italiano'}"><b${it ? ' class="on"' : ''}>IT</b><b${it ? '' : ' class="on"'}>EN</b></button></header>
  <div class="p-intro">
    <p class="p-k mono">${it ? 'Tecnico su fune · Fotografo e videomaker · OSS e soccorritore' : 'Rope access technician · Photographer and videomaker · Care worker and first responder'}</p>
    <h1>${it ? 'Come vuoi <em>conoscermi?</em>' : 'How would you like <em>to meet me?</em>'}</h1>
    <p class="p-sotto">${it ? 'Stessi contenuti, due esperienze. Scegli tu.' : 'Same content, two experiences. Your choice.'}</p>
  </div>
  <div class="p-scelte">
    <a class="p-scelta" href="${it ? '/classico/' : '/en/'}"><span class="p-img"><img src="/assets/img/home/classico.jpg" alt="" width="1200" height="750"></span><span class="p-txt">
      <span class="p-n mono">01 · ${it ? 'Da leggere' : 'To read'}</span><b class="p-t">${it ? 'Il sito <em>classico</em>' : 'The classic <em>site</em>'}</b>
      <span class="p-d">${it ? 'Pagine semplici e veloci, anche dal telefono: i tre mestieri, i lavori, i curriculum e i contatti.' : 'Simple, fast pages, on your phone too: the three jobs, the work, the résumés and the contacts.'}</span>
      <span class="p-go">${it ? 'Apri il sito classico' : 'Open the classic site'} <i aria-hidden="true">→</i></span></span></a>
    <button class="p-scelta" id="pLab" type="button"><span class="p-img"><img src="/assets/img/home/laboratorio.jpg" alt="" width="1200" height="750"></span><span class="p-txt">
      <span class="p-n mono">02 · ${it ? 'Da esplorare' : 'To explore'}</span><b class="p-t">${it ? 'Il laboratorio <em>3D</em>' : 'The 3D <em>workshop</em>'}</b>
      <span class="p-d">${it ? 'Un capannone da esplorare: tocca gli oggetti e scopri i miei tre mestieri. Meglio da computer, con l’audio acceso.' : 'A warehouse to explore: touch the objects and discover my three jobs. Best on a computer, with sound on.'}</span>
      <span class="p-go"><span id="pStato">${it ? 'Entra nel laboratorio' : 'Enter the workshop'}</span> <i aria-hidden="true">→</i></span><span class="p-bar" aria-hidden="true"><i id="pProg"></i></span></span></button>
  </div>
  <section class="p-sez" aria-labelledby="p-link-t">
    <h2 id="p-link-t">${it ? 'Link <em>rapidi</em>' : 'Quick <em>links</em>'}</h2>
    <div class="p-link">
      <div><h3 class="mono">${it ? 'I miei mestieri' : 'My jobs'}</h3>${lista(mestieri)}</div>
      <div><h3 class="mono">${it ? 'Curriculum in PDF' : 'Résumés (PDF)'}</h3>${lista(cv)}</div>
      <div><h3 class="mono">${it ? 'Contatti' : 'Contacts'}</h3>${lista(contatti)}</div>
      <div><h3 class="mono">${it ? 'Altro' : 'More'}</h3>${lista(altro)}</div>
    </div>
  </section>
  <section class="p-sez" aria-labelledby="p-faq-t">
    <h2 id="p-faq-t">${it ? 'Domande <em>frequenti</em>' : 'Frequently asked <em>questions</em>'}</h2>
    <div class="p-faq">${FAQ.map(q => `<details><summary>${esc(q[L][0])}</summary><p>${esc(q[L][1])}</p></details>`).join('')}</div>
  </section>
  <footer class="p-piede mono"><span>© 2026 Mattia Crapanzano · ${it ? 'P.IVA' : 'VAT'} 05209460236</span><a href="${it ? '/privacy/' : '/en/privacy/'}">Privacy</a><a href="${it ? '/note-legali/' : '/en/legal/'}">${it ? 'Note legali' : 'Legal notice'}</a></footer>
</div>`;
}
