// Testi, punti cliccabili e inquadrature del laboratorio.
// Coordinate in metri: x da -20 (sinistra) a 20 (destra), z da -16 (fondo) a 16 (portone), y in alto.

export const BASE = '/';                    // radice del sito (per CV e pagine): vale sia in anteprima sia online
export const CV = f => BASE + 'assets/cv/' + f;
// età calcolata dalla data di nascita (12/08/1996), così il testo non invecchia
export const ETA = (() => { const o = new Date(); return o.getFullYear() - 1996 - (o.getMonth() < 7 || (o.getMonth() === 7 && o.getDate() < 12) ? 1 : 0); })();
export const CONTATTI = {
  tel: '+393514658810', telTxt: '+39 351 465 8810', mail: 'crapanzano.work@gmail.com',
  wa: t => 'https://wa.me/393514658810?text=' + encodeURIComponent(t),
  linkedin: 'https://www.linkedin.com/in/mattia-crapanzano/', instagram: 'https://www.instagram.com/crapanzano.work/',
};

export const COLORI = { quota: '#ff5b1f', luce: '#c45cff', cura: '#2fe3c0', base: '#ece8e1', live: '#3fe07c' };

// Inquadrature, in metri reali (x -17..17, z -13.6 fondo .. 13.6 portone): pos = dove sta la camera, look = dove guarda, fov = moltiplicatore dell'angolo
// la panoramica sta al centro, sopra il salottino: da lì si gira tutto attorno
export const VISTE = {
  fuori:     { pos: [0, 2.0, 34], look: [0, 4.6, 13.6] },
  casa:      { pos: [0, 5.6, 1.6], look: [0, 1.3, -9], fov: 1.25, portrait: { pos: [0, 5.4, 2.4], look: [0, 1.1, -8], fov: 1.3 } },
  salottino: { pos: [0, 2.3, 6.2], look: [0, .5, 1.6] },
  faq:       { pos: [.25, 1.25, 3.05], look: [-.05, .4, 2.05] },
  attestati: { pos: [0, 2.3, 4.9], look: [0, 2.15, 9.0] },
  bacheca:   { pos: [-3.7, 1.7, 8.2], look: [-5.0, 1.35, 10.4] },
  sup:       { pos: [-12.9, 1.9, 7.0], look: [-16.6, 1.6, 8.6] },
  boulder:   { pos: [-10.4, 2.5, 8.4], look: [-16.5, 2.1, 2.9] },
  quota:     { pos: [-2.0, 4.3, .6], look: [-12.0, 2.0, -4.6], fov: 1.25 },
  struttura: { pos: [-7.0, 3.8, -3.4], look: [-10.4, 3.4, -11.5] },
  tripode:   { pos: [-6.6, 2.0, -2.2], look: [-9.4, 1.0, -5.0] },
  polaroid:  { pos: [-11.7, 2.0, -.6], look: [-12.8, .75, -2.5] },
  videoquota:{ pos: [-5.1, 1.65, -1.9], look: [-6.3, 1.55, -3.4] },
  luce:      { pos: [4.4, 3.4, -1.4], look: [1.2, 1.4, -11.5] },
  macchina:  { pos: [-2.3, 1.42, -8.2], look: [-3.0, 1.12, -9.25] },
  scrivania: { pos: [-.6, 1.75, -7.2], look: [-.6, 1.05, -10.4] },
  telefono:  { pos: [.06, 1.04, -9.6], look: [-.05, .76, -9.93] },
  tv:        { pos: [5.6, 2.2, -6.9], look: [6.6, 2.35, -13.5] },
  consulenza:{ pos: [2.8, 2.25, -1.5], look: [2.8, .8, -4.8] },
  stampante: { pos: [2.09, 1.5, -8.34], look: [2.46, .98, -9.48] },
  foglio: { pos: [2.25, 1.40, -8.83], look: [2.36, .97, -9.17] },   // primo piano sul CV appena stampato (lo usa la stampa, non è un punto da cliccare)
  set:       { pos: [8.8, 2.0, -10.2], look: [14.6, 1.3, -10.2] },
  cura:      { pos: [1.6, 3.9, 0.4], look: [12.0, 1.6, 9.0], fov: 1.15 },
  divise:    { pos: [9.6, 1.9, -.2], look: [9.6, 1.4, 3.0] },
  finestra:  { pos: [10.6, 2.3, 6.8], look: [21.0, 1.4, 6.8] },
  barella:   { pos: [8.9, 2.1, 5.2], look: [12.0, .8, 8.4] },
  radio:     { pos: [6.9, 1.7, 8.6], look: [7.0, 1.15, 13.4] },
  borsone:   { pos: [13.4, 1.5, 11.0], look: [13.4, .7, 13.3] },
  vvf:       { pos: [10.2, 1.85, 9.2], look: [10.2, 1.3, 13.4], portrait: { pos: [10.3, 2.2, 6.6], look: [10.3, 1.15, 13.4], fov: 1.15 } },
};

// Punti cliccabili. zona = a quale zona appartiene ('' = sempre visibile dalla panoramica)
// at = posizione del pallino. livello 1 = si vede dalla panoramica, 2 = solo dentro la sua zona
export const PUNTI = [
  { id: 'quota', zona: '', livello: 1, colore: 'quota', at: [-10.2, 6.9, -10.9] },
  { id: 'luce', zona: '', livello: 1, colore: 'luce', at: [-.5, 3.6, -12.6] },
  { id: 'cura', zona: '', livello: 1, colore: 'cura', at: [9.0, 3.4, 9.6] },
  { id: 'salottino', zona: '', livello: 1, colore: 'base', at: [0, 1.3, 1.5] },
  { id: 'bacheca', zona: '', livello: 1, colore: 'base', at: [-5.0, 2.3, 10.4] },
  { id: 'sup', zona: '', livello: 1, colore: 'base', at: [-16.0, 2.6, 8.4] },
  { id: 'attestati', zona: '', livello: 1, colore: 'base', at: [0, 3.9, 8.7] },
  { id: 'faq', zona: '', livello: 1, colore: 'base', at: [-.05, .75, 2.09] },

  { id: 'boulder', zona: 'quota', livello: 2, colore: 'quota', at: [-14.6, 3.4, 3.4] },
  { id: 'struttura', zona: 'quota', livello: 2, colore: 'quota', at: [-8.2, 4.6, -8.6] },
  { id: 'tripode', zona: 'quota', livello: 2, colore: 'quota', at: [-9.4, 2.2, -5.0] },
  { id: 'polaroid', zona: 'quota', livello: 2, colore: 'quota', at: [-12.8, 1.0, -2.4] },
  { id: 'videoquota', zona: 'quota', livello: 2, colore: 'quota', at: [-6.3, 2.5, -3.4] },

  { id: 'macchina', zona: 'luce', livello: 2, colore: 'luce', at: [-3.0, 1.45, -9.2] },
  { id: 'scrivania', zona: 'luce', livello: 2, colore: 'luce', at: [-.6, 1.45, -10.4] },
  { id: 'telefono', zona: 'luce', livello: 2, colore: 'live', at: [-.05, .92, -9.93] },
  { id: 'tv', zona: 'luce', livello: 2, colore: 'luce', at: [6.6, 4.3, -13.4] },
  { id: 'stampante', zona: 'luce', livello: 2, colore: 'luce', at: [2.46, 1.4, -9.48] },
  { id: 'set', zona: 'luce', livello: 2, colore: 'luce', at: [14.2, 2.6, -10.2] },
  { id: 'consulenza', zona: 'luce', livello: 2, colore: 'luce', at: [2.8, 1.35, -4.7] },

  { id: 'divise', zona: 'cura', livello: 2, colore: 'cura', at: [9.6, 2.5, 3.0] },
  { id: 'finestra', zona: 'cura', livello: 2, colore: 'cura', at: [16.5, 5.4, 6.8] },
  { id: 'barella', zona: 'cura', livello: 2, colore: 'cura', at: [11.9, 1.4, 8.7] },
  { id: 'radio', zona: 'cura', livello: 2, colore: 'cura', at: [6.6, 2.1, 13.3] },
  { id: 'borsone', zona: 'cura', livello: 2, colore: 'cura', at: [13.4, 1.2, 13.2] },
  { id: 'vvf', zona: 'cura', livello: 2, colore: 'cura', at: [10.38, 2.45, 13.2] },
];
// a quale zona porta ogni punto (per la barra in basso e per mostrare i pallini interni)
export const ZONA_DI = Object.fromEntries(PUNTI.map(p => [p.id, p.zona || (['quota', 'luce', 'cura'].includes(p.id) ? p.id : '')]));

// Video su YouTube (TV di In luce)
export const VIDEO_YT = [  // [id, titolo, sottotitolo, sottotitolo in inglese]
  ['zNV7I6VappI', 'Istituto Salesiano San Zeno', 'Open Day', 'Open Day'],
  ['SEUCP8vhjmQ', 'Missio Giovani Vicenza', 'El Campesino', 'El Campesino'],
  ['RthEJu2l68c', 'Festival della Missione', 'Spot · Milano 2022', 'Commercial · Milan 2022'],
  ['swnCMtJpE_M', 'Missio Giovani', 'Thailandia 2022', 'Thailand 2022'],
  ['WMwMvWZXViM', 'Patrimonio Europeo', 'Spot istituzionale', 'Institutional film'],
  ['-omNAXXxkcU', 'Le Donatella', 'Videoclip', 'Music video'],
  ['9okaU4dJcLY', 'Hostaria Càneva', 'Spot', 'Commercial'],
];
// i video con altre persone riconoscibili vanno pubblicati solo con il loro ok (attrezzatura.mp4: ok ricevuto il 2026-10-18)
const VQ = [['video/irata-salita.mp4', ['Salita su corda', 'Rope ascent']], ['video/attrezzatura.mp4', ['L\'attrezzatura', 'The gear']],
            ['video/irata-capannone.mp4', ['Il capannone di Sicurlive', 'The Sicurlive hall']], ['video/irata-saluto.mp4', ['Pronto a salire', 'Ready to climb']]];
export const VIDEO_QUOTA = VQ.map(v => v[0]);
export const VIDEO_QUOTA_NOMI = VQ.map(v => v[1]);
export const SITI = [
  ['Lorenzi Cleaning Service', 'https://www.lorenzics.com/'],
  ['Alessio Burini · artista circense', 'https://www.alessioburini.it/'],
  ['Osteopata Michele Zoccari', 'https://www.michelezoccariosteopata.it/'],
  ['Onoranze funebri La Luce', 'https://www.onoranzefunebrilaluce.it/'],
  ['Arked (collaborazione)', 'https://www.arked.it/'],
];
export const ATTESTATI = [  // [titolo, dettaglio, nota] in italiano e in inglese
  [['IRATA', 'Livello 1', 'Rope Access Technician'], ['IRATA', 'Level 1', 'Rope Access Technician']],
  [['Modulo A', 'Lavori in quota', 'Accesso su fune'], ['Module A', 'Work at height', 'Rope access (Italy)']],
  [['OSS', 'Qualifica', 'Operatore Socio Sanitario'], ['OSS', 'Qualification', 'Healthcare assistant']],
  [['BLSD', 'Adulto', 'Rianimazione e DAE'], ['BLSD', 'Adult', 'CPR and AED']],
  [['BLSD', 'Pediatrico', 'Rianimazione e DAE'], ['BLSD', 'Paediatric', 'CPR and AED']],
  [['PTC', 'Base', 'Trauma preospedaliero'], ['PTC', 'Basic', 'Prehospital trauma care']],
  [['Primo soccorso', '16 ore', '2026'], ['First aid', '16 hours', '2026']],
  [['Antincendio', 'Livello 2', '8 ore'], ['Fire safety', 'Level 2', '8 hours']],
  [['Estricazione', 'Corso', '2026'], ['Extrication', 'Course', '2026']],
  [['MIOS', 'Corso', '2026'], ['MIOS', 'Course', '2026']],
  [['Sicurezza', 'Lavoratori', '4 + 12 ore'], ['Workplace safety', 'Workers', '4 + 12 hours']],
  [['Drone', 'EASA A1/A3', 'fino al 2030'], ['Drone', 'EASA A1/A3', 'valid to 2030']],
];

// Testi: [italiano, inglese]
export const T = {
  entra: ['Entra nel mio laboratorio', 'Enter my workshop'],
  classico: ['Preferisci leggere? Vai al sito classico', 'Rather read? Go to the classic site'],
  legali: ['Note legali', 'Legal notice'],
  canvas: ['Laboratorio 3D di Mattia Crapanzano: tutti i contenuti sono anche nella versione testo', 'Mattia Crapanzano\'s 3D workshop: all the content is also in the text version'],
  salta: ['Vai alla versione testo', 'Skip to the text version'],
  carico: [['Accendo le luci del capannone…', 'Controllo i nodi…', 'Pulisco l\'obiettivo…', 'Sistemo la barella…', 'Preparo il caffè…'],
           ['Switching on the warehouse lights…', 'Checking the knots…', 'Cleaning the lens…', 'Setting up the stretcher…', 'Making coffee…']],
  pronto: ['Pronto.', 'Ready.'],
  suggerimento: ['Muovi il mouse per guardarti intorno · rotella per allontanarti · clicca gli oggetti', 'Move the mouse to look around · scroll to step back · click the objects'],
  suggerimentoTouch: ['Trascina per guardarti intorno · tocca gli oggetti', 'Drag to look around · tap the objects'],
  squilla: ['Squilla · rispondi', 'Ringing · answer'],
  barra: { casa: ['Panoramica', 'Overview'], quota: ['In quota', 'At height'], luce: ['In luce', 'In focus'], cura: ['In cura', 'In care'],
           stampante: ['Scarica il CV', 'Download CV'], telefono: ['Contatti', 'Contacts'] },
  comandi: { giorno: ['Giorno', 'Day'], notte: ['Notte', 'Night'], audio: ['Musica e suoni', 'Music and sounds'] },
  ora: { giorno: ['luce del giorno', 'daylight'], notte: ['luci accese', 'lights on'], alba: ['alba', 'dawn'], tramonto: ['tramonto', 'sunset'] },
  testo: ['Versione testo', 'Text version'], torna3d: ['Torna al laboratorio', 'Back to the workshop'],
  chiudi: ['Chiudi', 'Close'], espandi: ['Mostra tutto', 'Show more'], torna: ['Torna alla panoramica', 'Back to overview'],
  giro: ['Fai il giro', 'Take the tour'], poi: ['Poi', 'Next'], prima: ['Indietro', 'Back'],
  cerca: ['Chiedimi cosa ti serve', 'Ask me what you need'], nessuno: ['Non l\'ho trovato. Prova con una di queste:', 'I couldn\'t find that. Try one of these:'], suggeriti: ['Ti potrebbe servire', 'You might need'], indietro: ['Indietro', 'Back'],
};

// Giro guidato: l'ordine in cui si visitano i punti con Avanti / Indietro (finisce sui contatti)
export const PERCORSO = ['bacheca', 'attestati', 'quota', 'struttura', 'tripode', 'polaroid', 'videoquota', 'boulder', 'sup', 'luce', 'macchina', 'scrivania', 'consulenza', 'tv', 'set', 'stampante',
  'cura', 'finestra', 'barella', 'radio', 'divise', 'borsone', 'vvf', 'salottino', 'faq', 'telefono'];

const cvBtn = (it, en, f, fEn) => ({ t: [it, en], u: [CV(f), CV(fEn)], dl: 1 });

// Pannelli: lab = etichetta, h = titolo (con <em> per la parola in corsivo), p = testo, li = elenco, btn = pulsanti
// Tono: frasi corte e concrete, in prima persona, un filo di ironia sul lato creativo e serietà sul soccorso.
export const PANNELLI = {
  quota: { c: 'quota', lab: ['01 · In quota', '01 · At height'],
    h: ['Due corde, <em>un obiettivo.</em>', 'Two ropes, <em>one goal.</em>'],
    p: ['Sono tecnico IRATA di livello 1 e ho il Modulo A, quindi posso lavorare su fune anche in Italia. Cerco il primo cantiere: manutenzioni, ispezioni, lavori in quota. Il traguardo è il soccorso su fune.',
        'I am an IRATA Level 1 rope access technician with the Italian Module A, so I can work on ropes in Italy too. I am looking for my first job site: maintenance, inspections, work at height. The goal is rope rescue.'],
    li: [[['IRATA', 'livello 1'], ['Modulo A', 'valido in Italia'], ['Prossimo corso', 'ITRA, 16–21 nov'], ['Trasferte', 'Italia ed estero']],
         [['IRATA', 'level 1'], ['Module A', 'valid in Italy'], ['Next course', 'ITRA, 16–21 Nov'], ['Travel', 'Italy and abroad']]],
    btn: [{ t: ['Guarda i video', 'Watch the videos'], go: 'videoquota', cl: 'c' }, cvBtn('Scarica il CV', 'Download CV', 'Mattia-Crapanzano-CV-Lavori-in-quota.pdf', 'Mattia-Crapanzano-CV-Rope-access-EN.pdf')] },
  struttura: { c: 'quota', lab: ['Struttura di addestramento', 'Training rig'],
    h: ['Cinque giorni <em>appeso qui.</em>', 'Five days <em>hanging here.</em>'],
    p: ['L\'IRATA l\'ho preso da Sicurlive: cinque giorni di corso e un esame con un valutatore esterno. Salite, discese, frazionamenti, deviatori e il recupero di un compagno bloccato sulla corda. Questa struttura è la copia di quella dove mi sono allenato.',
        'I earned my IRATA at Sicurlive: a five-day course and an exam with an external assessor. Ascents, descents, rebelays, deviations and rescuing a teammate stuck on the rope. This rig is a copy of the one I trained on.'],
    btn: [{ t: ['Guarda i video', 'Watch the videos'], go: 'videoquota', cl: 'c' }] },
  boulder: { c: 'quota', lab: ['Fuori orario · boulder', 'Off duty · bouldering'],
    h: ['Principiante, <em>e si vede.</em>', 'Beginner, <em>and it shows.</em>'],
    p: ['Arrampico da poco. Mi piace perché prima di muoverti devi leggere la parete e decidere dove mettere mani e piedi: lo stesso ragionamento che serve sulla corda.',
        'I started climbing recently. I like it because you have to read the wall before you move and decide where your hands and feet go: the same thinking you need on the rope.'] },
  tripode: { c: 'quota', lab: ['Tripode e barella', 'Tripod and stretcher'],
    h: ['Riportare su <em>chi è rimasto giù.</em>', 'Bringing back up <em>whoever is stuck below.</em>'],
    p: ['Il tripode si monta sopra pozzi, cisterne e vani stretti: con il verricello e la barella si recupera chi non riesce a uscire da solo. Qui si incontrano le mie due strade, la tecnica su corda e l\'esperienza in ambulanza. A novembre faccio il corso ITRA con Prevent, per diventare tecnico di soccorso su fune.',
        'The tripod goes over wells, tanks and confined spaces: with the winch and the stretcher you bring up whoever cannot get out alone. This is where my two paths meet: rope technique and ambulance experience. In November I take the ITRA course with Prevent to become a rope rescue technician.'],
    li: [[['Corso ITRA', '16–21 novembre 2026'], ['Ente', 'Prevent'], ['Obiettivo', 'tecnico di soccorso su fune']],
         [['ITRA course', '16–21 November 2026'], ['Provider', 'Prevent'], ['Goal', 'rope rescue technician']]] },
  polaroid: { c: 'quota', lab: ['Il tavolo delle foto', 'The photo table'],
    h: ['Il corso, <em>in cinque foto.</em>', 'The course, <em>in five photos.</em>'],
    p: ['L\'imbrago nuovo, la palestra di Sicurlive, le corde in coppia e il giorno dell\'esame.', 'The new harness, the Sicurlive gym, the twin ropes and exam day.'],
    foto: ['foto/irata-allenamento-sicurlive.jpg', 'foto/irata-imbrago.jpg', 'foto/quota-capannone.jpg', 'foto/quota-attrezzatura.jpg'] },
  videoquota: { c: 'quota', lab: ['Video dal corso', 'Course videos'], h: ['Guardami <em>salire.</em>', 'Watch me <em>climb.</em>'],
    p: ['Spezzoni girati durante il corso IRATA da Sicurlive: salite, attrezzatura e il capannone dove mi sono allenato.', 'Clips shot during the IRATA course at Sicurlive: ascents, gear and the hall where I trained.'], video: 'quota' },
  sup: { c: 'base', lab: ['Fuori orario', 'Off duty'], h: ['Il tempo libero <em>lo passo così.</em>', 'This is how <em>I spend my time off.</em>'],
    p: ['Sul SUP quando c\'è acqua, sulla parete boulder quando piove. Equilibrio, presa e testa libera: sono anche il miglior allenamento per la corda.',
        'On the SUP when there is water, on the bouldering wall when it rains. Balance, grip and a clear head: also the best training for rope work.'],
    btn: [{ t: ['Vedi la parete boulder', 'See the bouldering wall'], go: 'boulder', cl: 'c' }] },

  luce: { c: 'luce', lab: ['02 · In luce', '02 · In focus'],
    h: ['Racconto aziende <em>per immagini.</em>', 'I tell companies\' stories <em>in pictures.</em>'],
    p: ['Faccio foto e video da dieci anni: ho avuto uno studio di produzione, ho lavorato in TV e sui set. Oggi lavoro con aziende e scuole: foto, video, riprese con il drone, siti web e consulenza di comunicazione.',
        'I have been doing photo and video for ten years: I ran a production studio and worked in TV and on film sets. Today I work with companies and schools: photo, video, drone footage, websites and communication consulting.'],
    li: [[['Foto e video', 'eventi, scuole, aziende'], ['Drone', 'EASA A1/A3'], ['Siti web', 'dal progetto alla messa online'], ['Consulenza', 'comunicazione e social']],
         [['Photo and video', 'events, schools, companies'], ['Drone', 'EASA A1/A3'], ['Websites', 'from design to launch'], ['Consulting', 'communication and social']]],
    btn: [{ t: ['Guarda i lavori', 'See the work'], go: 'tv', cl: 'c' }, cvBtn('Scarica il CV', 'Download CV', 'Mattia-Crapanzano-CV-Foto-e-video.pdf', 'Mattia-Crapanzano-CV-Photo-video-EN.pdf')] },
  macchina: { c: 'luce', lab: ['Come ho cominciato', 'How I started'],
    h: ['Prima di tutto, <em>una macchina fotografica.</em>', 'First of all, <em>a camera.</em>'],
    p: ['Ho cominciato raccontando storie di persone, con una macchina fotografica. Poi sono arrivati lo studio, la televisione e la comunicazione per le aziende.', 'I started by telling people\'s stories with a camera. Then came the studio, television and communication for companies.'],
    tappe: [['2017 · Fotografo e videomaker', 'Reportage e storytelling documentaristico per brand, progetti culturali ed eventi. Oggi con partita IVA.', '2017 · Photographer and videomaker', 'Reportage and documentary storytelling for brands, cultural projects and events. Now freelance with a VAT number.'],
            ['2021 · Magistral Studios', 'Ho fondato e guidato uno studio di produzione indipendente a Lonigo: video, foto e visual storytelling.', '2021 · Magistral Studios', 'I founded and ran an independent production studio in Lonigo: video, photo and visual storytelling.'],
            ['2023 · Operatore di ripresa TV', 'Videomedia, Vicenza: telegiornali, servizi esterni e format documentaristici.', '2023 · TV camera operator', 'Videomedia, Vicenza: news, outside broadcasts and documentary formats.'],
            ['2025 · Comunicazione e strategia visiva', 'Arked Partners, Verona: identità visiva, social e direzione foto e video.', '2025 · Communication and visual strategy', 'Arked Partners, Verona: visual identity, social media, photo and video direction.']] },
  scrivania: { c: 'luce', lab: ['Siti web', 'Websites'], h: ['Siti fatti <em>per farsi trovare.</em>', 'Websites built <em>to be found.</em>'],
    p: ['Progetto e metto online siti per professionisti e piccole aziende, insieme a un collaboratore: struttura, testi, foto e messa online. Questi sono alcuni dei clienti.',
        'Together with a partner, I design and launch websites for professionals and small businesses: structure, copy, photos and launch. These are some of the clients.'], siti: 1 },
  telefono: { c: 'live', lab: ['Contatti', 'Contacts'], h: ['Squillava <em>per te.</em>', 'It was ringing <em>for you.</em>'],
    p: ['Per un lavoro, un preventivo o anche solo una domanda: chiamami o scrivimi. Rispondo io, di solito in giornata.', 'For a job, a quote or just a question: call or message me. I answer myself, usually the same day.'],
    li: [[['Telefono', CONTATTI.telTxt], ['Email', CONTATTI.mail], ['Base', 'Legnago (VR)']], [['Phone', CONTATTI.telTxt], ['Email', CONTATTI.mail], ['Base', 'Legnago (VR), Italy']]],
    btn: [{ t: ['Chiama', 'Call'], u: ['tel:' + CONTATTI.tel, 'tel:' + CONTATTI.tel], cl: 'c' },
          { t: ['Scrivimi', 'Message me'], u: [CONTATTI.wa('Ciao Mattia, ti scrivo dal tuo sito.'), CONTATTI.wa('Hi Mattia, I\'m writing from your website.')], cl: 'ink' },
          { t: ['Email', 'Email'], u: ['mailto:' + CONTATTI.mail, 'mailto:' + CONTATTI.mail] }] },
  consulenza: { c: 'luce', lab: ['Consulenza', 'Consulting'], h: ['Prima di girare, <em>si decide cosa dire.</em>', 'Before shooting, <em>we decide what to say.</em>'],
    p: ['A questo tavolo partono i progetti: cosa raccontare, a chi e su quali canali. Poi foto, video, sito e social seguono la stessa idea, invece di andare ognuno per conto suo.',
        'Projects start at this table: what to say, to whom and on which channels. Then photos, video, website and social media follow the same idea instead of going their own way.'],
    btn: [{ t: ['Parliamone', 'Let\'s talk'], go: 'telefono', cl: 'c' }] },
  tv: { c: 'luce', lab: ['Video di lavoro', 'Video work'], h: ['Qualche lavoro <em>recente.</em>', 'Some <em>recent work.</em>'],
    p: ['Spot, videoclip ed eventi per aziende, scuole e associazioni: riprese, montaggio e colore.', 'Commercials, music videos and events for companies, schools and associations: shooting, editing and grading.'], video: 'yt' },
  stampante: { c: 'base', lab: ['Curriculum', 'Résumé'], h: ['Quale CV <em>ti stampo?</em>', 'Which résumé <em>shall I print?</em>'],
    p: ['Ne ho uno per ogni mestiere, aggiornato. Prendi quello che ti serve.', 'I keep one for each job, up to date. Take the one you need.'],
    cv: [['In quota', 'At height', ['Lavori su fune · IRATA L1', 'Rope access · IRATA L1'], 'Mattia-Crapanzano-CV-Lavori-in-quota.pdf', 'Mattia-Crapanzano-CV-Rope-access-EN.pdf', 'quota'],
         ['In luce', 'In focus', ['Foto, video e siti web', 'Photo, video and websites'], 'Mattia-Crapanzano-CV-Foto-e-video.pdf', 'Mattia-Crapanzano-CV-Photo-video-EN.pdf', 'luce'],
         ['In cura', 'In care', ['Soccorso e OSS', 'Rescue and care'], 'Mattia-Crapanzano-CV-OSS.pdf', 'Mattia-Crapanzano-CV-Care-worker-EN.pdf', 'cura']] },

  cura: { c: 'cura', lab: ['03 · In cura', '03 · In care'],
    h: ['Soccorso, fuoco <em>e assistenza.</em>', 'Rescue, fire <em>and care.</em>'],
    p: ['Faccio il soccorritore con la Croce Rossa di Vicenza e con Legnago Soccorso, sono vigile del fuoco volontario e lavoro come Operatore Socio Sanitario. Tre divise diverse, la stessa regola: restare lucidi.',
        'I am a first responder with the Vicenza Red Cross and Legnago Soccorso, a volunteer firefighter, and I work as a healthcare assistant (OSS). Three different uniforms, one rule: stay clear-headed.'],
    btn: [{ t: ['Scrivimi', 'Message me'], go: 'telefono', cl: 'c' }, cvBtn('Scarica il CV', 'Download CV', 'Mattia-Crapanzano-CV-OSS.pdf', 'Mattia-Crapanzano-CV-Care-worker-EN.pdf')] },
  divise: { c: 'cura', lab: ['Le divise', 'The uniforms'], h: ['Tre divise <em>nell\'armadio.</em>', 'Three uniforms <em>in the closet.</em>'],
    p: ['Bianca per il turno in struttura, gialla per l\'ambulanza, blu per la caserma.', 'White for the care home, yellow for the ambulance, blue for the fire station.'],
    li: [[['OSS', 'assistenza in struttura'], ['Soccorritore', 'Croce Rossa e Legnago Soccorso'], ['Vigile del fuoco', 'volontario']],
         [['OSS', 'care home assistant'], ['First responder', 'Red Cross and Legnago Soccorso'], ['Firefighter', 'volunteer']]] },
  attestati: { c: 'base', lab: ['In formazione · continua', 'In training · ongoing'], h: ['Dodici corsi, <em>e non è finita.</em>', 'Twelve courses, <em>and counting.</em>'],
    p: ['Corde, soccorso, sicurezza e drone: la formazione è la parte che tiene insieme i tre mestieri. Ogni corso nuovo finisce su questa parete.', 'Ropes, rescue, safety and drones: training is what holds the three jobs together. Every new course ends up on this wall.'], attestati: 1 },
  finestra: { c: 'cura', lab: ['Il garage', 'The garage'], h: ['Le luci <em>blu.</em>', 'The <em>blue lights.</em>'],
    p: ['Faccio turni in ambulanza con Legnago Soccorso e con la Croce Rossa di Vicenza, ed esco con i vigili del fuoco volontari. È lì che ho imparato a fare la cosa giusta anche quando il tempo è poco.',
        'I do ambulance shifts with Legnago Soccorso and the Vicenza Red Cross, and I go out on calls with the volunteer fire brigade. That is where I learned to do the right thing even when time is short.'] },
  radio: { c: 'cura', lab: ['DAE e radio', 'AED and radios'], h: ['Sempre <em>in carica.</em>', 'Always <em>charged.</em>'],
    p: ['La teca del defibrillatore, le radio in carica e il manichino per ripassare il massaggio cardiaco. Ho il BLSD adulto e pediatrico, il PTC base e il corso di primo soccorso da 16 ore.',
        'The defibrillator cabinet, the radios charging and the manikin for practising chest compressions. I hold adult and paediatric BLSD, basic PTC and a 16-hour first aid course.'] },
  set: { c: 'luce', lab: ['Set fotografico', 'Photo set'], h: ['Ritratti <em>senza imbarazzo.</em>', 'Portraits <em>without the awkwardness.</em>'],
    p: ['Fondale bianco, due luci e uno sgabello: ritratti aziendali, foto profilo per LinkedIn, prodotti e contenuti per i social. Ti metto a tuo agio, al resto pensa la luce.',
        'White backdrop, two lights and a stool: corporate portraits, LinkedIn headshots, products and social content. I put you at ease, the light does the rest.'],
    btn: [{ t: ['Prenota uno shooting', 'Book a shoot'], go: 'telefono', cl: 'c' }] },
  barella: { c: 'cura', lab: ['Barella e ossigeno', 'Stretcher and oxygen'], h: ['Il lavoro <em>in ambulanza.</em>', 'The work <em>on the ambulance.</em>'],
    p: ['Barella autocaricante e bombole di ossigeno: immobilizzare, caricare, trasportare e non perdere mai di vista la persona che hai davanti.', 'Self-loading stretcher and oxygen: immobilising, loading, transporting, and never losing sight of the person in front of you.'] },
  borsone: { c: 'cura', lab: ['Zaino e borsone', 'Bags'], h: ['Pronto <em>a uscire.</em>', 'Ready <em>to go.</em>'],
    p: ['Lo zaino rosso è quello che si porta fuori dall\'ambulanza: ossigeno, presidi, medicazioni. Il borsone blu è quello da OSS, per il turno in struttura.',
        'The red pack goes out with the ambulance crew: oxygen, kit, dressings. The blue bag is my OSS bag, for shifts at the care home.'] },
  vvf: { c: 'cura', lab: ['Vigili del fuoco', 'Fire brigade'], h: ['Vigile del fuoco <em>volontario.</em>', 'Volunteer <em>firefighter.</em>'],
    p: ['Casco, armadietto, manichette e l\'attestato antincendio di livello 2. Quando arriva la chiamata, si esce.', 'Helmet, locker, fire hoses and level 2 fire safety training. When the call comes, we go.'] },

  faq: { c: 'base', lab: ['Domande frequenti', 'FAQ'], h: ['Le domande <em>che mi fanno più spesso.</em>', 'The questions <em>I get asked most.</em>'],
    p: ['Le ho raccolte in questo documento. Se manca la tua, chiedimela.', 'I collected them in this document. If yours is missing, just ask.'], faq: 1,
    btn: [{ t: ['Scrivimi', 'Message me'], go: 'telefono', cl: 'c' }, { t: ['Versione testo', 'Text version'], azione: 'testo' }] },
  salottino: { c: 'base', lab: ['Salottino', 'Lounge'], h: ['Siediti <em>e sfoglia.</em>', 'Sit down <em>and browse.</em>'],
    p: ['LinkedIn per il lavoro, Instagram per le immagini, il curriculum e, presto, un blog con quello che imparo strada facendo.', 'LinkedIn for work, Instagram for pictures, my résumé and, soon, a blog about what I learn along the way.'],
    btn: [{ t: ['LinkedIn', 'LinkedIn'], u: [CONTATTI.linkedin, CONTATTI.linkedin], cl: 'c' }, { t: ['Instagram', 'Instagram'], u: [CONTATTI.instagram, CONTATTI.instagram] },
          { t: ['Curriculum', 'Résumé'], go: 'stampante' }, { t: ['Blog · presto', 'Blog · soon'], u: ['', ''] }] },
  bacheca: { c: 'base', lab: ['Bacheca', 'Board'], h: ['Ciao, <em>sono Mattia.</em>', 'Hi, <em>I\'m Mattia.</em>'],
    p: [`Ho ${ETA} anni e la mia base di lavoro è Legnago, in provincia di Verona. Faccio tre lavori diversi: corde, immagini e soccorso. Mi sposto volentieri, anche all'estero.`,
        `I am ${ETA} and my work base is Legnago, near Verona. I do three different jobs: ropes, images and rescue. I am happy to travel, abroad too.`],
    li: [[['Novità', 'corso ITRA, 16–21 novembre'], ['Lingue', 'italiano, inglese'], ['Base', 'Legnago (VR)']], [['News', 'ITRA course, 16–21 November'], ['Languages', 'Italian, English'], ['Base', 'Legnago (VR), Italy']]],
    btn: [{ t: ['Scrivimi', 'Message me'], go: 'telefono', cl: 'c' }] },
};

// Domande frequenti: [domanda, risposta] in italiano e in inglese. Compaiono nel documento sul tavolino del salottino,
// nella versione testo del sito e nei dati strutturati che leggono Google e gli assistenti AI.
export const FAQ = [
  [['Chi è Mattia Crapanzano?', `Ho ${ETA} anni e la mia base di lavoro è Legnago, in provincia di Verona. Faccio tre lavori: tecnico su fune IRATA, fotografo e videomaker per aziende, Operatore Socio Sanitario e soccorritore.`],
   ['Who is Mattia Crapanzano?', `I am ${ETA} and my work base is Legnago, near Verona, Italy. I do three jobs: IRATA rope access technician, photographer and videomaker for companies, and healthcare assistant and first responder.`]],
  [['Che certificazioni hai per lavorare su fune?', 'IRATA Livello 1 e Modulo A (D.Lgs. 81/08), quindi posso lavorare su fune anche in Italia. L\'IRATA l\'ho preso da Sicurlive. A novembre 2026 faccio il corso ITRA con Prevent per il soccorso su fune.'],
   ['What rope access certifications do you hold?', 'IRATA Level 1 and the Italian Module A (Legislative Decree 81/08), so I can also work on ropes in Italy. I trained for IRATA at Sicurlive. In November 2026 I take the ITRA rope rescue course with Prevent.']],
  [['Hai già esperienza di lavoro in quota?', 'Non ancora in cantiere, e preferisco dirlo chiaramente. Sono certificato e allenato: cerco il primo incarico per manutenzioni, ispezioni e lavori in quota.'],
   ['Do you already have experience working at height?', 'Not on a job site yet, and I prefer to say so clearly. I am certified and trained: I am looking for my first assignment in maintenance, inspections and work at height.']],
  [['Sei disponibile per trasferte?', 'Sì, in Italia e all\'estero, anche per periodi lunghi. Il mio campo base è Legnago (VR).'],
   ['Are you available to travel?', 'Yes, in Italy and abroad, including long assignments. My base is Legnago (Verona).']],
  [['Cosa fai come fotografo e videomaker?', 'Foto e video per aziende, scuole ed eventi, riprese con il drone (attestato EASA A1/A3), montaggio e color grading, comunicazione e strategia visiva. Ho lavorato come operatore di ripresa TV e ho fondato Magistral Studios.'],
   ['What do you do as a photographer and videomaker?', 'Photo and video for companies, schools and events, drone footage (EASA A1/A3), editing and colour grading, communication and visual strategy. I worked as a TV camera operator and founded Magistral Studios.']],
  [['Realizzi anche siti web?', 'Sì, insieme a un collaboratore: struttura, testi, foto e messa online, per professionisti e piccole aziende.'],
   ['Do you also build websites?', 'Yes, together with a partner: structure, copy, photos and launch, for professionals and small businesses.']],
  [['Quanto costa un servizio?', 'Dipende da cosa ti serve. Scrivimi o chiamami: dopo una breve chiacchierata ti preparo un preventivo.'],
   ['How much does a job cost?', 'It depends on what you need. Message or call me: after a short chat I will send you a quote.']],
  [['Dove lavori come OSS e soccorritore?', 'Sono Operatore Socio Sanitario qualificato da oltre dieci anni, oggi in struttura a Montecchio Precalcino (VI) e a Legnago (VR). Faccio il soccorritore con la Croce Rossa di Vicenza e con Legnago Soccorso, e sono vigile del fuoco volontario al Comando di Verona.'],
   ['Where do you work as a care worker and first responder?', 'I have been a qualified healthcare assistant (OSS) for over ten years, currently in care homes in Montecchio Precalcino (Vicenza) and Legnago (Verona). I am a first responder with the Vicenza Red Cross and Legnago Soccorso, and a volunteer firefighter with the Verona fire brigade.']],
  [['Lavori con partita IVA?', 'Sì, ho la partita IVA attiva e lavoro anche in libera professione.'],
   ['Do you work as a freelancer?', 'Yes, I am a registered freelancer in Italy (VAT number active).']],
  [['Come scarico il tuo curriculum?', 'Ne ho tre, uno per mestiere, in italiano e in inglese. Li trovi alla stampante, nella zona In luce, o con il pulsante CV in basso.'],
   ['How do I download your résumé?', 'I have three, one for each job, in Italian and English. You will find them at the printer in the In focus area, or with the CV button at the bottom.']],
  [['Come ti contatto?', 'Telefono o WhatsApp +39 351 465 8810, email crapanzano.work@gmail.com. Rispondo io, di solito in giornata.'],
   ['How can I contact you?', 'Phone or WhatsApp +39 351 465 8810, email crapanzano.work@gmail.com. I answer myself, usually the same day.']],
  [['Quali sono i tuoi profili ufficiali?', 'Questo sito, LinkedIn (linkedin.com/in/mattia-crapanzano) e Instagram @crapanzano.work. Ci sono altre persone con il mio nome: profili e attività diversi da questi non sono miei.'],
   ['Which profiles are officially yours?', 'This website, LinkedIn (linkedin.com/in/mattia-crapanzano) and Instagram @crapanzano.work. Other people share my name: profiles and businesses other than these are not mine.']],
  [['Parli inglese?', 'Sì, a livello base. Tutti i miei curriculum sono anche in inglese.'],
   ['Do you speak English?', 'Yes, at a basic level. All my résumés are also available in English.']],
];

// Parole chiave per la ricerca: sinonimi e domande tipiche che portano a ogni punto (italiano e inglese insieme)
export const CHIAVI = {
  stampante: 'stampante stampa stampare cv curriculum curriculum vitae pdf scarica scaricare download printer print resume résumé',
  telefono: 'contatti contatto telefono numero chiama chiamare whatsapp scrivimi scrivere messaggio email mail preventivo prezzo costo lavoro assunzione disponibilita disponibile contact phone call message quote hire',
  quota: 'quota fune funi corda corde altezza rope access irata lavori in quota tecnico manutenzione ispezione trasferte offshore estero height',
  struttura: 'struttura addestramento sicurlive corso irata esame palestra rig training',
  tripode: 'tripode barella soccorso su fune itra prevent recupero pozzo spazi confinati verricello rescue tripod stretcher',
  polaroid: 'foto polaroid immagini corso sicurlive photos',
  videoquota: 'video filmati salita discesa irata clips',
  boulder: 'boulder arrampicata arrampicare climbing parete prese hobby sport tempo libero',
  sup: 'sup tavola paddle acqua hobby sport tempo libero fuori orario board',
  luce: 'foto fotografia fotografo video videomaker riprese drone aziende scuole eventi comunicazione social photo video drone',
  macchina: 'macchina fotografica fotocamera storia inizio reportage studio tv biennale camera story',
  scrivania: 'siti web sito internet wordpress wix website websites clienti portfolio',
  consulenza: 'consulenza comunicazione strategia social instagram linkedin marketing progetto consulting strategy',
  tv: 'video spot videoclip lavori portfolio showreel youtube montaggio work commercials',
  set: 'set fotografico shooting ritratti ritratto foto profilo linkedin prodotti studio portrait headshot',
  cura: 'cura soccorso soccorritore croce rossa 118 ambulanza oss operatore socio sanitario assistenza vigile del fuoco care rescue',
  finestra: 'garage ambulanza autopompa mezzi 118 115 pompieri ambulance fire engine',
  barella: 'barella ossigeno bombole ambulanza trasporto stretcher oxygen',
  radio: 'dae defibrillatore blsd rianimazione massaggio cardiaco radio primo soccorso ptc aed cpr first aid',
  divise: 'divise divisa oss soccorritore vigile del fuoco uniformi uniforms',
  borsone: 'zaino borsone 118 oss bag',
  vvf: 'vigili del fuoco pompiere pompieri vvf antincendio estintore manichette casco firefighter fire',
  attestati: 'attestati certificati certificazioni corsi formazione qualifiche brevetto patentino drone irata oss blsd certificates courses training',
  salottino: 'salottino social linkedin instagram blog riviste lounge',
  bacheca: 'chi sei chi e mattia presentazione bacheca eta anni dove legnago verona about me who',
  faq: 'domande frequenti faq domande risposte informazioni dubbi trasferte partita iva inglese esperienza prezzo questions answers',
};

// Scritte sui muri e sugli oggetti, in italiano e in inglese (stesso numero di righe nelle due lingue)
export const SCRITTE = {
  quota: [['IN QUOTA', '01'], ['AT HEIGHT', '01']], luce: [['IN LUCE', '02'], ['IN FOCUS', '02']], cura: [['IN CURA', '03'], ['IN CARE', '03']],
  motto: [['OSSERVO.', 'RESTO LUCIDO.', 'CI SONO QUANDO SERVE.'], ['I OBSERVE.', 'I STAY SHARP.', 'I\'M THERE WHEN IT MATTERS.']],
  formazione: [['IN FORMAZIONE', 'continua.'], ['IN TRAINING', 'ongoing.']],
  pronti: [['PRONTI', 'a uscire.'], ['READY', 'to go.']],
  studio: [['STUDIO', 'foto · video · web'], ['STUDIO', 'photo · video · web']],
  boulder: [['BOULDER', 'primi passi'], ['BOULDER', 'first steps']],
  riviste: [[['LinkedIn', 'LAVORO · CORDE · SOCCORSO'], ['Instagram', '@crapanzano.work'], ['Curriculum', 'TRE MESTIERI'], ['Blog', 'PRESTO']],
            [['LinkedIn', 'WORK · ROPES · RESCUE'], ['Instagram', '@crapanzano.work'], ['Résumé', 'THREE JOBS'], ['Blog', 'SOON']]],
  bacheca: [[['Ciao, sono Mattia', 'Legnago (VR)', 'e in trasferta'], ['Prossimo corso', 'ITRA 16–21 nov', 'con Prevent'], ['Scrivimi', '351 465 8810'], ['Tre mestieri,', 'un solo modo', 'di lavorare'], ['Drone', 'EASA A1/A3'], [`Mattia, ${ETA} anni`, 'IRATA L1', 'disponibile']],
            [['Hi, I\'m Mattia', 'Legnago (VR)', 'and on the road'], ['Next course', 'ITRA 16–21 Nov', 'with Prevent'], ['Message me', '+39 351 465 8810'], ['Three jobs,', 'one way', 'of working'], ['Drone', 'EASA A1/A3'], [`Mattia, ${ETA}`, 'IRATA L1', 'available']]],
  attestato: ['ATTESTATO', 'CERTIFICATE'],
};

// Il capannone è più piccolo del progetto iniziale (40 x 32 m ridotto di K): K resta per chi lo usa ancora
export const K = .85;
