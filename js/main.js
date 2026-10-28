// Il laboratorio di Mattia: motore, camera, luci, interazioni, suoni.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { ombreContatto, aggiungiGrana, PellicolaShader } from './realismo.js';
import { costruisci } from './costruisci.js';
import { VISTE, PUNTI, ZONA_DI, PANNELLI, T, COLORI, VIDEO_YT, VIDEO_QUOTA, VIDEO_QUOTA_NOMI, SITI, ATTESTATI, CV, K, PERCORSO, CHIAVI, FAQ } from './dati.js';
import { testoHTML } from './testo.js';
import { portaHTML } from './porta.js';

const $ = s => document.querySelector(s);
const Q = new URLSearchParams(location.search);
const TOUCH = matchMedia('(pointer: coarse)').matches;
const SMALL = () => innerWidth < 760;
const RIDUCI = matchMedia('(prefers-reduced-motion: reduce)').matches;   // "riduci movimento" attivo: voli brevi e diretti, niente animazioni automatiche
const MOBILE = TOUCH || Math.min(screen.width, screen.height) < 700;
const store = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };

// ------------------------------------------------------------ lingua
let L = (Q.get('lang') || store.get('lab-lang') || (navigator.language || 'it').slice(0, 2)) === 'en' ? 1 : 0;
const tr = a => Array.isArray(a) ? (a[L] ?? a[0]) : a;
const TITOLO_IT = document.title;
function applyLang() {
  document.documentElement.lang = L ? 'en' : 'it';
  $('#lang').dataset.v = L ? 'en' : 'it';
  document.querySelectorAll('#bar [data-go]').forEach(b => { b.querySelector('.tip').textContent = tr(T.barra[b.dataset.go]); b.setAttribute('aria-label', tr(T.barra[b.dataset.go])); });
  $('#txtEntra').textContent = tr(T.entra); $('#classico').textContent = tr(T.classico); $('#classico').href = L ? '/en/' : '/classico/';
  $('#lnkPrivacy').href = L ? '/en/privacy/' : '/privacy/'; $('#lnkLegali').href = L ? '/en/legal/' : '/note-legali/'; $('#lnkLegali').textContent = tr(T.legali);
  $('#c').setAttribute('aria-label', tr(T.canvas)); $('#salta').textContent = tr(T.salta); $('#giro b').textContent = tr(T.giro);
  $('#q').placeholder = tr(T.cerca); $('#q').setAttribute('aria-label', tr(T.cerca)); $('#indietro').setAttribute('aria-label', tr(T.indietro)); $('#indietro .tip').textContent = tr(T.indietro);
  if ($('#q').value) cerca();
  $('#hint').textContent = tr(TOUCH ? T.suggerimentoTouch : T.suggerimento);
  $('#luce').title = tr(T.comandi.giorno) + ' / ' + tr(T.comandi.notte); $('#audio').title = tr(T.comandi.audio); $('#audio').setAttribute('aria-label', tr(T.comandi.audio));
  hots.forEach(h => { h.el.querySelector('.lbl').textContent = labelOf(h.p.id); h.lw = 0; });
  if (panel.classList.contains('open') && current) openPanel(current);
  orologio();
  if (W) { W.lingua(L); disegnaStampante(); telStato = ''; }
  if (testo && !testo.classList.contains('chiuso')) apriTesto();
  $('#btnTesto').title = $('#btnTesto').ariaLabel = tr(T.testo);
  if (portaAperta()) { porta.innerHTML = portaHTML(L); $('#pProg').style.width = (caricato ? 100 : carico) + '%'; }
  $('#testo').setAttribute('aria-label', tr(T.testo));
  document.title = L ? 'Mattia Crapanzano · IRATA rope access, photographer, care worker' : TITOLO_IT;
}
$('#lang').onclick = () => { L = 1 - L; store.set('lab-lang', L ? 'en' : 'it'); sfx.click(); applyLang(); };
const labelOf = id => { const p = PANNELLI[id]; if (!p) return id; const lab = tr(p.lab); return lab.replace(/^0\d · /, ''); };

// ------------------------------------------------------------ statistiche (Umami, senza cookie): solo azioni utili, mai dati personali
const traccia = (nome, dati) => { try { window.umami?.track(nome, dati); } catch (e) {} };
document.addEventListener('click', e => { const a = e.target.closest('a[href]'); if (!a) return; const h = a.getAttribute('href');
  if (h.startsWith('tel:')) traccia('contatto', { tipo: 'telefono' }); else if (h.includes('wa.me')) traccia('contatto', { tipo: 'whatsapp' });
  else if (h.startsWith('mailto:')) traccia('contatto', { tipo: 'email' }); else if (h.endsWith('.pdf')) traccia('cv', { file: h.split('/').pop() });
  else if (/linkedin|instagram/.test(h)) traccia('social', { dove: /linkedin/.test(h) ? 'linkedin' : 'instagram' }); });

// ------------------------------------------------------------ versione testo (motori di ricerca, assistenti AI, accessibilità, dispositivi senza 3D)
const testo = $('#testo');
function apriTesto() { if (testo.classList.contains('chiuso')) primaDelTesto = document.activeElement; $('#testoCorpo').innerHTML = testoHTML(L); $('#chiudiTesto').textContent = '← ' + tr(T.torna3d); testo.classList.remove('chiuso'); testo.scrollTop = 0; setTimeout(() => $('#chiudiTesto').focus(), 60);   /* dopo la comparsa: un elemento ancora invisibile non riceve il fuoco */ traccia('versione-testo'); }
let primaDelTesto = null;
function chiudiTesto() { testo.classList.add('chiuso'); (primaDelTesto && document.contains(primaDelTesto) ? primaDelTesto : $('#btnTesto')).focus?.(); }
$('#btnTesto').onclick = apriTesto; $('#chiudiTesto').onclick = chiudiTesto;
$('#salta').onclick = e => { e.preventDefault(); apriTesto(); };
// senza WebGL il 3D non può partire: si mostra direttamente la versione testo
const glOk = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } })();
if (!glOk || Q.has('testo')) { $('#loader').classList.add('gone'); apriTesto(); $('#chiudiTesto').hidden = !glOk; if (!glOk) throw new Error('WebGL non disponibile: mostro la versione testo'); }

// ------------------------------------------------------------ motore
const canvas = $('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !MOBILE, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, MOBILE ? 1.25 : 1.75));
THREE.Cache.enabled = true;   // la stessa immagine si scarica e si decodifica una volta sola
renderer.setSize(innerWidth, innerHeight);
// AgX: curva dei colori più vicina a una foto (alte luci morbide, meno saturazione "da videogioco"); ?tm=aces per confronto
renderer.toneMapping = Q.get('tm') === 'aces' ? THREE.ACESFilmicToneMapping : THREE.AgXToneMapping; renderer.toneMappingExposure = 1;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = !MOBILE; renderer.shadowMap.type = THREE.PCFSoftShadowMap;   // sui telefoni bastano le ombre morbide a terra (calcolate una volta)
const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x0e1014, .011);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, .05, 400);

// post-produzione (occlusione, bagliore, pellicola) solo su computer: sui telefoni si disegna direttamente, senza memoria in più
const composer = MOBILE ? null : new EffectComposer(renderer);
let gtao = null;
const pellicola = new ShaderPass(PellicolaShader);
if (composer) {
  composer.addPass(new RenderPass(scene, camera));
  if (Q.get('ao') !== '0') {
    try { gtao = new GTAOPass(scene, camera, innerWidth, innerHeight); gtao.blendIntensity = .9;
      gtao.updateGtaoMaterial({ radius: .6, distanceExponent: 1.4, thickness: 2, scale: 1.2, samples: 12 });
      gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
      composer.addPass(gtao); } catch (e) { gtao = null; }
  }
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), .28, .5, .92));
  composer.addPass(new OutputPass());
  if (Q.get('fx') !== '0') composer.addPass(pellicola);
}

// ------------------------------------------------------------ caricamento
const manager = new THREE.LoadingManager();
const tl = new THREE.TextureLoader(manager);
const draco = new DRACOLoader().setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/draco/gltf/');
const gl = new GLTFLoader(manager).setDRACOLoader(draco);
const cache = {};
const gltf = f => { if (MOBILE) f = f.replace(/^modelli\//, 'modelli-mobile/');   // sui telefoni: stessi modelli con immagini più leggere
  if (!cache[f]) cache[f] = gl.loadAsync(f); return cache[f].then(g => ({ scene: g.scene.clone(true) })); };
const prog = $('#prog'), msg = $('#msg');
// porta d'ingresso: sito classico o laboratorio. Chi sceglie il laboratorio mentre carica vede la barra e poi entra da solo
const porta = $('#porta');
let carico = 0, sceltoLab = false, caricato = false;
const portaAperta = () => !document.documentElement.classList.contains('senza-porta') && !porta.classList.contains('via');
porta.addEventListener('click', e => {
  if (e.target.closest('#pLang')) $('#lang').click();
  else if (e.target.closest('#pLab')) { porta.classList.add('via'); sceltoLab = true; if (caricato) { $('#loader').classList.add('gone'); entra(); } }
});
let mi = 0; msg.textContent = tr(T.carico)[0];
const mt = setInterval(() => { const m = tr(T.carico); mi = (mi + 1) % m.length; msg.textContent = m[mi]; }, 1100);
manager.onProgress = (u, a, b) => { carico = Math.round(a / b * 100); prog.style.width = carico + '%'; const p = $('#pProg'); if (p) p.style.width = carico + '%'; };
const fonts = Promise.all(['800 100px Archivo', '400 100px Archivo', '600 30px Archivo', '500 20px "JetBrains Mono"', 'italic 30px "Instrument Serif"'].map(f => document.fonts.load(f))).catch(() => {});

new RGBELoader(manager).load('hdri/capannone_1k.hdr', t => {
  t.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = new THREE.PMREMGenerator(renderer).fromEquirectangular(t).texture;
  scene.environmentRotation.y = .6;
});

// ------------------------------------------------------------ luci generali
const sun = new THREE.DirectionalLight(0xfff1dc, 0); sun.position.set(-26, 30, 16); sun.target.position.set(0, 0, -2);
sun.castShadow = true; sun.shadow.mapSize.set(MOBILE ? 1024 : 2048, MOBILE ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 22, bottom: -22, near: 5, far: 90 }); sun.shadow.bias = -.0005; sun.shadow.normalBias = .03;
scene.add(sun, sun.target);
const hemi = new THREE.HemisphereLight(0xdbe6ff, 0x3a3631, .2); scene.add(hemi);
const deskSpot = new THREE.SpotLight(0xfff4e6, 0, 9, .6, .8, 1.2); deskSpot.position.set(1.3, 2.6, -11.3); deskSpot.target.position.set(-.6, .8, -10.2); if (!MOBILE) scene.add(deskSpot, deskSpot.target);
const ringLight = new THREE.PointLight(0xfff3e2, 0, 10, 1.6); ringLight.position.set(0, 2.4, 1.5); scene.add(ringLight);
const certLight = new THREE.RectAreaLight(0xfff0d8, 0, 6, .4); certLight.position.set(0, 3.8, 7.6); certLight.lookAt(0, 1.8, 9.0); if (!MOBILE) scene.add(certLight);
const extLight = new THREE.HemisphereLight(0x9fb4d8, 0x1a1a1a, 0);

let W = null;   // mondo costruito
const C = n => new THREE.Color(n);

// ------------------------------------------------------------ giorno e notte
let manuale = null;  // null = segue l'ora; 1 = giorno; 0 = notte
const ore = () => { const o = parseFloat(Q.get('ora')); if (!isNaN(o)) return o; const d = new Date(); return d.getHours() + d.getMinutes() / 60; };
let DAY = 1, dayTarget = 1;
function giornoDaOra() { const h = ore(); return h < 6 || h >= 19 ? 0 : h < 7 ? h - 6 : h >= 18 ? 19 - h : 1; }
function orologio() {}   // l'orologio in alto non c'è più: al suo posto la ricerca
function setGiorno(v) { dayTarget = v; const notte = v < .5; $('#luce .sole').style.display = notte ? 'none' : ''; $('#luce .luna').style.display = notte ? '' : 'none'; $('#luce').setAttribute('aria-pressed', notte); orologio(); }
$('#luce').onclick = () => { manuale = dayTarget >= .5 ? 0 : 1; setGiorno(manuale); sfx.interruttore(); if (W) W.anim.leva.rotation.x = manuale ? 0 : .5; };
setInterval(() => { if (manuale === null) setGiorno(giornoDaOra()); else orologio(); }, 30000);
setGiorno(giornoDaOra());
function applyLight(d) {
  if (!W) return;
  const night = 1 - d;
  sun.intensity = 6 * d; hemi.intensity = .28 + .9 * d; hemi.color.set(0xdfe7f5); hemi.groundColor.set(0x8a8580);
  scene.environmentIntensity = .32 + .5 * d;
  W.mat.cielo.color.set(0x0c1220).lerp(C(0xdcebf8), d);
  W.mat.sfondo.color.set(0x0b1020).lerp(C(0xffffff), d);
  W.mat.led.emissiveIntensity = .02 + 4.4 * night;              // neon del soffitto: spenti di giorno
  W.luci.rect.forEach(l => l.intensity = 38 * night);
  if (W.mat.cerchio) W.mat.cerchio.emissiveIntensity = .15 + 6.5 * night; ringLight.intensity = 32 * night;
  if (W.mat.softbox) W.mat.softbox.emissiveIntensity = 1.5 + 2.5 * night; deskSpot.intensity = 70 * night + 18;
  if (W.mat.ledAttestati) W.mat.ledAttestati.emissiveIntensity = 1.5 + 4 * night; certLight.intensity = 25 * night + 4;
  for (const x of [W.mat.ledRosa, W.mat.ledViola]) if (x) x.emissiveIntensity = .9 + 1.6 * night;   // LED rosa e viola: si vede il colore, non il bianco
  if (W.mat.pannelloForato) W.mat.pannelloForato.emissiveIntensity = .35 + .9 * night;
  (W.luci.luce || []).forEach(l => l.intensity = 2.5 + 9 * night);
  W.mat.insegna.emissiveIntensity = .5 + 1.4 * night;
  if (W.schermi.tv && W.schermi.tv.material.emissiveMap) W.schermi.tv.material.emissiveIntensity = 1.5 + .5 * night;   // immagine proiettata: di giorno più slavata
  if (W.mat.fascio) W.mat.fascio.uniforms.forza.value = .004 + .014 * night;
  (W.luci.porta || []).forEach(l => l.intensity = 120 * night);
  scene.fog.color.set(0x0e1014).lerp(C(0xc8cdd3), d);
  renderer.toneMappingExposure = 1.05 + .08 * night;
}


// ------------------------------------------------------------ inquadrature
const cam = { pos: new THREE.Vector3(...VISTE.fuori.pos), look: new THREE.Vector3(...VISTE.fuori.look) };
let fovMul = 1, fly = null;
const baseFov = () => camera.aspect < .8 ? 66 : camera.aspect < 1.2 ? 58 : 50;
function fit(k) {
  const v = VISTE[k], a = camera.aspect;
  if (a < 1 && v.portrait) return { p: new THREE.Vector3(...v.portrait.pos), l: new THREE.Vector3(...v.portrait.look), f: v.portrait.fov || 1 };
  const p = new THREE.Vector3(...v.pos), l = new THREE.Vector3(...v.look);
  if (a < 1) p.add(p.clone().sub(l).multiplyScalar((1 - a) * .55));
  return { p, l, f: v.fov || 1 };
}
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function flyTo(k, dur = 1.9, arco = true, via = null) {
  if (RIDUCI) { dur = Math.min(dur, .5); arco = false; via = null; }
  const { p, l, f } = fit(k); const p0 = cam.pos.clone(), l0 = cam.look.clone();
  const mid = p0.clone().lerp(p, .5); if (arco) mid.y += Math.min(2.2, p0.distanceTo(p) * .12); else mid.y = Math.min(p0.y, p.y);
  fly = { t: 0, dur, p0, l0, p, l, mid, via, f0: fovMul, f1: f }; sfx.whoosh(dur);
}

// ------------------------------------------------------------ pallini
const hots = [];
function buildHots() {
  const box = $('#hots');
  PUNTI.forEach(p => {
    const b = document.createElement('button'); b.className = 'hot lv' + p.livello; b.style.setProperty('--c', COLORI[p.colore]);
    b.innerHTML = `<span class="arr"></span><span class="dot"></span><span class="lbl glass mono"></span>`; b.onclick = () => go(p.id);
    box.appendChild(b); hots.push({ p, el: b, v: new THREE.Vector3(...p.at) });
  });
}

// ------------------------------------------------------------ pannelli
const panel = $('#panel');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function openPanel(k) {
  const d = PANNELLI[k]; if (!d) return closePanel();
  panel.style.setProperty('--c', COLORI[d.c] || COLORI.base);
  let h = `<div class="lab mono">${tr(d.lab)}</div><h2>${tr(d.h)}</h2>`, passi = '';
  if (d.p) h += `<p>${tr(d.p)}</p>`;
  if (d.li) h += `<ul>${tr(d.li).map(([a, b]) => `<li><b>${esc(a)}</b><span class="mono">${esc(b)}</span></li>`).join('')}</ul>`;
  if (d.tappe) h += `<div class="tappe">${d.tappe.map(t => `<div><b>${esc(L ? t[2] : t[0])}</b><span>${esc(L ? t[3] : t[1])}</span></div>`).join('')}</div>`;
  if (d.foto) h += `<div class="galleria">${d.foto.map(f => `<img src="${f}" alt="" loading="lazy">`).join('')}</div>`;
  if (d.siti) h += `<div class="lista">${SITI.map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener"><span><b>${esc(n)}</b><small class="mono">${esc(u.replace('https://', '').replace(/\/$/, ''))}</small></span><em class="mono">↗</em></a>`).join('')}</div>`;
  if (d.attestati) h += `<div class="attestati">${ATTESTATI.map(x => { const a = x[L]; return `<div><b>${esc(a[0])}</b><small>${esc(a[1])} · ${esc(a[2])}</small></div>`; }).join('')}</div>`;
  if (d.video === 'yt') h += `<div class="lista">${VIDEO_YT.map(([id, n, s, se], i) => `<button data-yt="${i}"><img src="yt/${id}.jpg" alt=""><span><b>${esc(n)}</b><small>${esc(L ? se : s)}</small></span></button>`).join('')}</div>`;
  if (d.video === 'quota') h += `<div class="lista">${VIDEO_QUOTA.map((v, i) => `<button data-vq="${i}"><span><b>${esc(VIDEO_QUOTA_NOMI[i][L])}</b><small class="mono">IRATA · Sicurlive</small></span><em class="mono">▶</em></button>`).join('')}</div>`;
  if (d.cv) h += `<div class="lista">${d.cv.map(([it, en, s, f, fe, c], i) => `<button data-cv="${i}" style="--k:${COLORI[c]}"><i class="k"></i><span><b>${esc(L ? en : it)}</b><small>${esc(tr(s))}</small></span><em class="mono">PDF ↓</em></button>`).join('')}</div><p class="stampa mono" id="stampa"></p>`;
  if (d.faq) h += `<div class="faq">${FAQ.map(q => `<details><summary>${esc(q[L][0])}</summary><p>${esc(q[L][1])}</p></details>`).join('')}</div>`;
  if (d.btn) h += `<div class="ctas">${d.btn.map(b => { const u = b.u ? tr(b.u) : ''; return b.azione ? `<button class="btn ${b.cl || ''}" data-azione="${b.azione}">${tr(b.t)}</button>` : b.go ? `<button class="btn ${b.cl || ''}" data-goto="${b.go}">${tr(b.t)}</button>` : `<a class="btn ${b.cl || ''}" ${u ? `href="${u}"` : 'aria-disabled="true"'}${b.dl ? ' download' : ''}${u.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${tr(b.t)}</a>`; }).join('')}</div>`;
  // avanti e indietro nel giro guidato
  const i = PERCORSO.indexOf(k);
  if (i >= 0) { const n = PERCORSO.length, pv = PERCORSO[(i + n - 1) % n], nx = PERCORSO[(i + 1) % n];
    passi = `<nav class="passi"><button class="pv" data-goto="${pv}" aria-label="${tr(T.prima)}: ${esc(labelOf(pv))}">←</button><span class="mono">${i + 1} / ${n}</span><button class="nx" data-goto="${nx}"><small class="mono">${tr(T.poi)}</small><b>${esc(labelOf(nx))}</b><i>→</i></button></nav>`; }
  panel.innerHTML = `<button class="maniglia" aria-label="${tr(T.espandi)}"><i></i></button><button class="x" aria-label="${tr(T.chiudi)}">×</button><div class="corpo">${h}</div>${passi}`;
  panel.classList.remove('esteso');
  panel.querySelector('.maniglia').onclick = () => panel.classList.toggle('esteso');
  panel.querySelector('.x').onclick = () => go('casa');
  panel.querySelectorAll('[data-goto]').forEach(b => b.onclick = () => go(b.dataset.goto));
  panel.querySelectorAll('[data-azione="testo"]').forEach(b => b.onclick = apriTesto);
  panel.querySelectorAll('.faq details').forEach((x, i) => x.addEventListener('toggle', () => { if (x.open) traccia('faq', { domanda: FAQ[i][0][0] }); }));
  traccia('pannello', { punto: k });
  panel.querySelectorAll('[data-yt]').forEach(b => b.onclick = () => { const [id, n] = VIDEO_YT[+b.dataset.yt]; video(`<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`, n); });
  panel.querySelectorAll('[data-vq]').forEach(b => b.onclick = () => video(`<video src="${VIDEO_QUOTA[+b.dataset.vq]}" autoplay controls playsinline></video>`, 'IRATA · Sicurlive', true));
  panel.querySelectorAll('[data-cv]').forEach(b => b.onclick = () => stampa(d.cv[+b.dataset.cv]));
  panel.querySelectorAll('a,button').forEach(b => b.addEventListener('click', () => sfx.click()));
  // i link verso altri siti si aprono sempre in una scheda nuova, il laboratorio resta aperto
  panel.querySelectorAll('a[href^="http"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); window.open(a.href, '_blank', 'noopener'); }));
  panel.classList.add('open'); panel.querySelector('.corpo').scrollTop = 0;
}
function closePanel() { panel.classList.remove('open'); }

// ------------------------------------------------------------ video
function video(html, title, vert = false) {
  const box = $('#vbox'); box.className = 'v-box' + (vert ? ' vert' : ''); box.innerHTML = html; $('#vtitle').textContent = title || '';
  $('#video').classList.remove('gone'); musica.pausa(true);
}
function chiudiVideo() { $('#vbox').innerHTML = ''; $('#video').classList.add('gone'); musica.pausa(false); }
$('#video .v-x').onclick = chiudiVideo; $('#video').onclick = e => { if (e.target.id === 'video') chiudiVideo(); };

// ------------------------------------------------------------ stampante
let stampaAnim = null;
const caricaFoglio = new THREE.TextureLoader();   // fuori dal LoadingManager: non deve far ripartire la schermata di caricamento
function stampa([it, en, s, f, fe]) {
  traccia('cv', { file: L ? fe : f });
  const file = CV(L ? fe : f), el = $('#stampa'); el.textContent = L ? 'Printing…' : 'Stampa in corso…';
  if (stampaAnim?.m) scene.remove(stampaAnim.m);
  // il foglio che esce è la prima pagina del curriculum vero, nella lingua scelta
  const tex = caricaFoglio.load('tex/cv/' + (L ? fe : f).replace(/\.pdf$/, '.jpg')); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  sfx.stampa(); stampaAnim = { t: 0, tex };
  // la camera si avvicina al vassoio mentre il foglio esce, poi torna alla stampante
  clearTimeout(stampa.vicino); clearTimeout(stampa.ritorno);
  stampa.vicino = setTimeout(() => { if (current === 'stampante') { look.ty = look.tp = 0; flyTo('foglio', 1.5, false); } }, 350);
  stampa.ritorno = setTimeout(() => { if (current === 'stampante' && !fly) flyTo('stampante', 1.4, false); }, 8500); disegnaStampante(L ? 'Printing…' : 'Stampa in corso…'); setTimeout(() => disegnaStampante(), 4200);
  setTimeout(() => { const a = document.createElement('a'); a.href = file; a.download = ''; document.body.appendChild(a); a.click(); a.remove(); el.textContent = L ? 'Done: your PDF is downloading.' : 'Fatto: il PDF si sta scaricando.'; }, 1600);
}

// ------------------------------------------------------------ navigazione
let current = 'fuori', started = false;
const storia = [];   // punti visitati, per il tasto indietro
function go(k, indietro = false) {
  if (!started) { if (!$('#entra').classList.contains('gone')) entra(k); return; }   // da fuori (es. dalla ricerca): si entra e si va lì
  if (k === 'interruttore') { $('#luce').click(); return; }
  sfx.click(); if (k === current && k !== 'casa') return;
  if (!indietro && current && current !== k && current !== 'fuori') { storia.push(current); if (storia.length > 40) storia.shift(); }
  current = k; closePanel(); $('#indietro').classList.toggle('vuoto', !storia.length);
  if (k === 'telefono') stopRing(true);
  flyTo(k);
  setTimeout(() => { if (current === k && k !== 'casa') openPanel(k); }, 1000);
  const zona = ZONA_DI[k] || k;
  document.querySelectorAll('#bar [data-go]').forEach(b => b.classList.toggle('on', b.dataset.go === k || b.dataset.go === zona));
  history.replaceState(null, '', k === 'casa' ? location.pathname + location.search : '#' + k);
  $('#giro').classList.toggle('gone', k !== 'casa');
  look.ty = look.tp = 0; zoomT = 0;
}
document.querySelectorAll('#bar [data-go]').forEach(b => b.onclick = () => go(b.dataset.go));
$('#indietro').onclick = () => { if (storia.length) go(storia.pop(), true); };
addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (!testo.classList.contains('chiuso')) chiudiTesto(); else if (!$('#video').classList.contains('gone')) chiudiVideo(); else if (started) go('casa'); }
  if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && started && $('#video').classList.contains('gone') && testo.classList.contains('chiuso') && document.activeElement !== qIn) {
    const n = PERCORSO.length, i = PERCORSO.indexOf(current); go(PERCORSO[i < 0 ? 0 : (i + (e.key === 'ArrowRight' ? 1 : n - 1)) % n]); }
});
$('#giro').onclick = () => go(PERCORSO[0]);

// ------------------------------------------------------------ ricerca nel laboratorio
const senzaAccenti = t => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const pulito = t => String(t).replace(/<[^>]+>/g, '');
function indice() {   // testo cercabile di ogni punto, nella lingua scelta
  return Object.entries(PANNELLI).map(([k, d]) => {
    const parti = [tr(d.lab), pulito(tr(d.h)), d.p ? tr(d.p) : ''];
    if (d.li) parti.push(...tr(d.li).flat());
    if (d.tappe) parti.push(...d.tappe.map(t => L ? t[2] + ' ' + t[3] : t[0] + ' ' + t[1]));
    if (d.attestati) parti.push(...ATTESTATI.map(a => a[L].join(' ')));
    if (d.siti) parti.push(...SITI.map(([n, u]) => n + ' ' + u));
    if (d.video === 'yt') parti.push(...VIDEO_YT.map(v => v[1] + ' ' + (L ? v[3] : v[2])));
    if (d.video === 'quota') parti.push(...VIDEO_QUOTA_NOMI.map(n => n[L]));
    if (d.cv) parti.push(...d.cv.map(c => (L ? c[1] : c[0]) + ' ' + tr(c[2]) + ' CV curriculum résumé'));
    return { k, titolo: tr(d.lab).replace(/^0\d · /, ''), testo: parti.join(' · ') };
  });
}
const qIn = $('#q'), ris = $('#risultati'); let selez = 0, trovati = [];
// parole da ignorare nelle frasi ("vorrei scaricare il tuo cv" → "scaricare", "cv")
const VUOTE = new Set('il lo la i gli le un uno una di a da in con su per tra fra e o ed che chi cosa come dove quando mi ti si ci vi me te tu io lui lei noi voi loro mio tuo suo tua mia sua del della dei delle al alla ai alle dal dalla nel nella sul sulla vorrei voglio posso puoi hai ho sei sono e è cerco cercando trovare vedere avere fare serve servirebbe bisogno need want can you your my the a an of to for in on with and or i is are me show find please'.split(' '));
const radice = w => w.length > 5 ? w.slice(0, w.length - 2) : w;   // "scaricare" e "scarica" condividono "scaric"
function vicine(a, b) {   // stessa radice, oppure al massimo una lettera sbagliata (errori di battitura)
  if (a === b) return true;
  if (a.length > 3 && b.length > 3 && (b.startsWith(radice(a)) || a.startsWith(radice(b)))) return true;   // parole troppo corte non contano
  if (Math.abs(a.length - b.length) > 1 || a.length < 5) return false;
  let i = 0, j = 0, d = 0; while (i < a.length && j < b.length) { if (a[i] === b[j]) { i++; j++; continue; } if (++d > 1) return false; if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; } }
  return d + (a.length - i) + (b.length - j) <= 1;
}
function cerca() {
  const q = senzaAccenti(qIn.value.trim()); selez = 0;
  if (q.length < 2) { suggerisci(); return; }
  const parole = q.split(/[^a-z0-9]+/).filter(w => w && !VUOTE.has(w));
  if (!parole.length) { suggerisci(); return; }
  const ultima = /\s$/.test(qIn.value) ? '' : parole[parole.length - 1];   // la parola che si sta scrivendo: basta l'inizio ("magis" → Magistral)
  const vale = (p, w) => vicine(p, w) || (p === ultima && p.length >= 3 && w.startsWith(p));
  trovati = indice().map(r => {
    const t = senzaAccenti(r.titolo).split(/[^a-z0-9]+/), c = senzaAccenti(CHIAVI[r.k] || '').split(/[^a-z0-9]+/), b = senzaAccenti(r.testo).split(/[^a-z0-9]+/);
    let punti = 0;
    for (const p of parole) { if (t.some(w => vale(p, w))) punti += 4; else if (c.some(w => vale(p, w))) punti += 3; else if (b.some(w => vale(p, w))) punti += 1; }
    return punti ? { ...r, punti } : null; })
    .filter(Boolean).sort((a, b) => b.punti - a.punti);
  const top = trovati[0]?.punti || 0; trovati = trovati.filter(r => r.punti >= Math.max(parole.length > 1 ? 2 : 1, top * .5)).slice(0, 5);   // solo i risultati vicini al migliore
  if (!trovati.length) { suggerisci(true); return; }
  ris.innerHTML = trovati.map((r, i) => {
    const b = senzaAccenti(r.testo), j = Math.max(0, ...parole.map(p => b.indexOf(radice(p)))), da = j > 30 ? r.testo.indexOf(' ', j - 30) + 1 : 0;   // l'anteprima parte da una parola intera
    const pezzo = (da ? '…' : '') + r.testo.slice(da, da + 90) + '…';
    return `<button data-i="${i}" class="${i === selez ? 'sel' : ''}"><b>${esc(r.titolo)}</b><small>${esc(pezzo)}</small></button>`; }).join('');
  ris.classList.add('aperto');
  ris.querySelectorAll('[data-i]').forEach(b => b.onclick = () => scegli(+b.dataset.i));
}
// completamento: vocabolario delle parole del laboratorio nella lingua scelta (titoli e parole chiave contano di più)
let vocab = null, vocabL = -1;
function vocabolario() {
  if (vocab && vocabL === L) return vocab;
  const peso = new Map(), forma = new Map();
  const aggiungi = (testo, p) => String(testo).split(/[^A-Za-zÀ-ÿ0-9']+/).forEach(w => { w = w.replace(/^'+|'+$/g, ''); if (w.length < 4) return; const k = senzaAccenti(w);
    if (VUOTE.has(k)) return; peso.set(k, (peso.get(k) || 0) + p); if (!forma.has(k) || /^[A-ZÀ-Ý]/.test(w)) forma.set(k, w); });
  indice().forEach(r => { aggiungi(r.titolo, 6); aggiungi(r.testo, 1); aggiungi(CHIAVI[r.k] || '', 2); });
  vocab = [...peso].map(([k, n]) => ({ k, n, w: forma.get(k) })); vocabL = L; return vocab;
}
const fantasma = $('#qFantasma'); let completa = '';
function suggerimento() {   // aggiorna il testo grigio dopo il cursore
  completa = ''; fantasma.textContent = '';
  const v = qIn.value, m = v.match(/([A-Za-zÀ-ÿ0-9']{2,})$/);
  if (!m || qIn.selectionStart !== v.length || qIn.scrollWidth > qIn.clientWidth) return;
  const p = senzaAccenti(m[1]);
  const c = vocabolario().filter(x => x.k.startsWith(p) && x.k.length > p.length).sort((a, b) => b.n - a.n || a.k.length - b.k.length)[0];
  if (!c) return;
  completa = c.w.slice(m[1].length);
  fantasma.style.font = getComputedStyle(qIn).font;
  fantasma.innerHTML = `<i>${esc(v)}</i>${esc(completa)}`;
}
function suggerisci(nulla = false) {   // senza testo (o senza risultati): scorciatoie alle cose più richieste
  const ids = ['stampante', 'telefono', 'quota', 'luce', 'cura', 'tv'];
  trovati = ids.map(k => ({ k, titolo: k === 'stampante' ? tr(T.barra.stampante) : k === 'telefono' ? tr(T.barra.telefono) : labelOf(k).replace(/^0\d · /, '') }));
  ris.innerHTML = `<p class="mono">${tr(nulla ? T.nessuno : T.suggeriti)}</p><div class="chips">${trovati.map((r, i) => `<button data-i="${i}" class="chip">${esc(r.titolo)}</button>`).join('')}</div>`;
  ris.classList.add('aperto'); selez = -1;
  ris.querySelectorAll('[data-i]').forEach(b => b.onclick = () => scegli(+b.dataset.i));
}
qIn.addEventListener('focus', () => { if (!qIn.value.trim()) suggerisci(); });
function scegli(i) { const r = trovati[i]; if (!r) return; traccia('ricerca', { punto: r.k }); /* solo il punto scelto: il testo scritto non viene inviato (vedi privacy) */ qIn.value = ''; fantasma.textContent = ''; completa = ''; qIn.blur(); ris.classList.remove('aperto'); $('#cerca').classList.remove('aperta'); go(r.k); }
qIn.addEventListener('input', () => { cerca(); suggerimento(); });
qIn.addEventListener('blur', () => { fantasma.textContent = ''; completa = ''; });
qIn.addEventListener('keydown', e => {
  if (completa && (e.key === 'Tab' || (e.key === 'ArrowRight' && qIn.selectionStart === qIn.value.length))) {   // accetta il completamento
    e.preventDefault(); qIn.value += completa; cerca(); suggerimento(); e.stopPropagation(); return; }
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); selez = (selez + (e.key === 'ArrowDown' ? 1 : trovati.length - 1)) % Math.max(1, trovati.length); ris.querySelectorAll('[data-i]').forEach((b, i) => b.classList.toggle('sel', i === selez)); }
  if (e.key === 'Enter') scegli(Math.max(0, selez));
  if (e.key === 'Escape') { qIn.value = ''; cerca(); qIn.blur(); $('#cerca').classList.remove('aperta'); }
  e.stopPropagation();
});
$('#cerca .lente').onclick = () => { $('#cerca').classList.add('aperta'); qIn.focus(); };
addEventListener('pointerdown', e => { if (!e.target.closest('#cerca')) { ris.classList.remove('aperto'); $('#cerca').classList.remove('aperta'); } });
addEventListener('keydown', e => { if (e.key === '/' && document.activeElement !== qIn) { e.preventDefault(); $('#cerca').classList.add('aperta'); qIn.focus(); } });

// ------------------------------------------------------------ guardarsi intorno
// yaw positivo = sguardo a sinistra, pitch positivo = sguardo in basso
const look = { yaw: 0, pitch: 0, ty: 0, tp: 0, px: 0, py: 0, fx: 0, fy: 0 };
let down = null, zoom = 0, zoomT = 0;
const dita = new Map(); let pinch0 = 0, zoom0 = 0;
canvas.addEventListener('pointerdown', e => {
  dita.set(e.pointerId, [e.clientX, e.clientY]);
  if (dita.size === 2) { const [a, b] = [...dita.values()]; pinch0 = Math.hypot(a[0] - b[0], a[1] - b[1]); zoom0 = zoomT; down = null; return; }
  down = { x: e.clientX, y: e.clientY, yaw: look.ty, pitch: look.tp, moved: 0 }; canvas.setPointerCapture(e.pointerId); canvas.classList.add('drag');
});
canvas.addEventListener('pointermove', e => {
  look.px = e.clientX / innerWidth - .5; look.py = e.clientY / innerHeight - .5;
  if (dita.has(e.pointerId)) dita.set(e.pointerId, [e.clientX, e.clientY]);
  if (dita.size === 2 && pinch0) { const [a, b] = [...dita.values()]; zoomT = THREE.MathUtils.clamp(zoom0 + (pinch0 - Math.hypot(a[0] - b[0], a[1] - b[1])) / 260, 0, 1); return; }
  if (down) { const dx = e.clientX - down.x, dy = e.clientY - down.y; down.moved = Math.max(down.moved, Math.hypot(dx, dy));
    // nella panoramica si può girare quasi di 90° per lato; nelle altre viste meno, per non perdere l'oggetto
    const yl = current === 'casa' ? Infinity : camera.aspect < 1 ? .9 : .6; look.ty = THREE.MathUtils.clamp(down.yaw - dx * .0042, -yl, yl); look.tp = THREE.MathUtils.clamp(down.pitch + dy * .0024, current === 'casa' ? -.5 : -.25, current === 'casa' ? .55 : .25); }
  else hover(e);
});
const fineDito = e => { dita.delete(e.pointerId); if (dita.size < 2) pinch0 = 0; };
canvas.addEventListener('pointerup', e => { fineDito(e); canvas.classList.remove('drag'); if (down && down.moved < 6) pick(e); down = null; });
canvas.addEventListener('pointercancel', e => { fineDito(e); down = null; canvas.classList.remove('drag'); });
// rotella: ci si allontana per vedere meglio intorno, senza cambiare sezione
canvas.addEventListener('wheel', e => { if (!started) return; e.preventDefault(); zoomT = THREE.MathUtils.clamp(zoomT + e.deltaY * .0011, 0, 1); }, { passive: false });
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function hit(e) {
  if (!W) return null;
  ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
  const h = ray.intersectObjects(W.cliccabili, false)[0]; return h ? h.object.userData.punto : null;
}
let lastHover = 0;
function hover(e) { const n = performance.now(); if (n - lastHover < 70 || !started) return; lastHover = n; canvas.classList.toggle('hover', !!hit(e)); }
function pick(e) { if (!started) return; const k = hit(e); if (k) go(k); }

// ------------------------------------------------------------ suoni (generati, nessun file)
let AC = null, MASTER = null, SFX = null;
// un solo interruttore per musica e suoni (acceso di serie: parte quando si entra, che vale come gesto dell'utente)
let audioOn = store.get('lab-audio') !== '0', suoniOn = audioOn, musicaOn = audioOn;
const sfx = {
  init() { if (AC) { AC.resume(); return; } AC = new (window.AudioContext || window.webkitAudioContext)(); MASTER = AC.createGain(); MASTER.connect(AC.destination); SFX = AC.createGain(); SFX.gain.value = suoniOn ? 1 : 0; SFX.connect(MASTER); this.stanza(); musica.init(); },
  env(n, t, a, peak, r, dest = SFX) { const g = AC.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + r); n.connect(g); g.connect(dest); return g; },
  noise() { if (this._n) return this._n; const b = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate), d = b.getChannelData(0); let l = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; l = (l + .02 * w) / 1.02; d[i] = l * 3.5; } return (this._n = b); },
  click() { if (!AC) return; const t = AC.currentTime, o = AC.createOscillator(); o.frequency.setValueAtTime(1300, t); o.frequency.exponentialRampToValueAtTime(700, t + .05); this.env(o, t, .003, .05, .06); o.start(t); o.stop(t + .1); },
  whoosh(d) { if (!AC) return; const t = AC.currentTime, s = AC.createBufferSource(); s.buffer = this.noise(); s.loop = true; const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = .7;
    f.frequency.setValueAtTime(200, t); f.frequency.exponentialRampToValueAtTime(800, t + d * .5); f.frequency.exponentialRampToValueAtTime(240, t + d); s.connect(f); this.env(f, t, d * .45, .16, d * .6); s.start(t); s.stop(t + d + .2); },
  stanza() { const s = AC.createBufferSource(); s.buffer = this.noise(); s.loop = true; const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 140; const g = AC.createGain(); g.gain.value = .035; s.connect(f); f.connect(g); g.connect(SFX); s.start(); },
  squillo() { if (!AC) return; const t0 = AC.currentTime; for (let i = 0; i < 2; i++) { const t = t0 + i * .5, o = AC.createOscillator(), o2 = AC.createOscillator(), lfo = AC.createOscillator(), am = AC.createGain(), g = AC.createGain();
    o.frequency.value = 880; o2.frequency.value = 1320; lfo.frequency.value = 16; am.gain.value = .5; lfo.connect(am.gain); o.connect(am); o2.connect(am);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.018, t + .02); g.gain.setValueAtTime(.018, t + .36); g.gain.linearRampToValueAtTime(0, t + .4); am.connect(g); g.connect(SFX);
    [o, o2, lfo].forEach(n => { n.start(t); n.stop(t + .42); }); } },
  interruttore() { if (!AC) return; const t = AC.currentTime, s = AC.createBufferSource(); s.buffer = this.noise(); const f = AC.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2000; s.connect(f); this.env(f, t, .001, .5, .04); s.start(t); s.stop(t + .08); },
  stampa() { if (!AC) return; const t0 = AC.currentTime; for (let i = 0; i < 12; i++) { const t = t0 + i * .12, s = AC.createBufferSource(); s.buffer = this.noise(); const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 2; s.connect(f); this.env(f, t, .01, .25, .08); s.start(t); s.stop(t + .12); } },
  scatto() { if (!AC) return; const t = AC.currentTime; [0, .07].forEach(d => { const s = AC.createBufferSource(); s.buffer = this.noise(); const f = AC.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1500; s.connect(f); this.env(f, t + d, .002, .4, .05); s.start(t + d); s.stop(t + d + .08); }); },
};
// musica di sottofondo generata: accordi morbidi che cambiano lentamente
const musica = {
  g: null, on: false,
  init() {
    this.g = AC.createGain(); this.g.gain.value = 0; this.g.connect(MASTER);
    const rev = AC.createConvolver(), len = AC.sampleRate * 3, b = AC.createBuffer(2, len, AC.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.4); }
    rev.buffer = b; const wet = AC.createGain(); wet.gain.value = .7; this.bus = AC.createGain(); this.bus.connect(this.g); this.bus.connect(rev); rev.connect(wet); wet.connect(this.g);
    const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.connect(this.bus); this.lp = lp;
    const CH = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 66]]; let i = 0;
    const hz = n => 440 * Math.pow(2, (n - 69) / 12);
    const play = () => {
      const t = AC.currentTime;
      CH[i % CH.length].forEach((n, k) => { [0, 4].forEach(det => { const o = AC.createOscillator(); o.type = k ? 'triangle' : 'sine'; o.frequency.value = hz(n - (k ? 0 : 12)); o.detune.value = det - 2; const g = AC.createGain();
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05 / (k + 1.5), t + 2.5); g.gain.setValueAtTime(.05 / (k + 1.5), t + 7); g.gain.linearRampToValueAtTime(0, t + 10.5); o.connect(g); g.connect(lp); o.start(t); o.stop(t + 11); }); });
      if (Math.random() < .7) { const o = AC.createOscillator(); o.type = 'sine'; o.frequency.value = hz(CH[i % CH.length][Math.floor(Math.random() * 4)] + 12); const g = AC.createGain(); g.gain.setValueAtTime(0, t + 1); g.gain.linearRampToValueAtTime(.03, t + 1.05); g.gain.exponentialRampToValueAtTime(.0001, t + 4); o.connect(g); g.connect(this.bus); o.start(t + 1); o.stop(t + 4.2); }
      i++;
    };
    play(); setInterval(play, 8000); this.set(musicaOn);
  },
  set(v) { musicaOn = v; if (this.g) this.g.gain.setTargetAtTime(v ? .55 : 0, AC.currentTime, .8); },
  pausa(p) { if (this.g) this.g.gain.setTargetAtTime(p || !musicaOn ? 0 : .55, AC.currentTime, .4); },
};
function paintAudio() { $('#audio').setAttribute('aria-pressed', audioOn); $('#audio .w').style.display = audioOn ? '' : 'none'; $('#audio .off').style.display = audioOn ? 'none' : ''; }
$('#audio').onclick = () => {
  audioOn = !audioOn; store.set('lab-audio', audioOn ? '1' : '0'); suoniOn = audioOn;
  sfx.init(); if (SFX) SFX.gain.value = audioOn ? 1 : 0; musica.set(audioOn); paintAudio();
};
paintAudio();

// ------------------------------------------------------------ telefono che squilla
const ring = { on: false, timer: null, n: 0, done: false };
function startRing() {
  if (RIDUCI || ring.done || current === 'telefono' || !started) return; ring.on = true; ring.n = 0; $('#btnTel').classList.add('vibra');
  const h = hots.find(h => h.p.id === 'telefono'); if (h) { h.el.classList.add('ring'); h.el.querySelector('.lbl').textContent = tr(T.squilla); }
  const tick = () => { if (!ring.on) return; sfx.squillo(); if (++ring.n >= 4) { stopRing(false); ring.timer = setTimeout(startRing, 45000); return; } ring.timer = setTimeout(tick, 2600); }; tick();
}
function stopRing(answered) { ring.on = false; clearTimeout(ring.timer); if (answered) ring.done = true; $('#btnTel').classList.remove('vibra'); const h = hots.find(h => h.p.id === 'telefono'); if (h) { h.el.classList.remove('ring'); h.el.querySelector('.lbl').textContent = labelOf('telefono'); } }

// ------------------------------------------------------------ schermi
const SITI_TEX = ['tex/siti/lorenzics.jpg', 'tex/siti/alessioburini.jpg'].map(u => { const t = tl.load(u); t.colorSpace = THREE.SRGBColorSpace; return t; });
const YT_IMG = VIDEO_YT.map(([id]) => { const i = new Image(); i.src = `yt/${id}.jpg`; return i; });
const canvasTV = document.createElement('canvas'); canvasTV.width = MOBILE ? 640 : 1280; canvasTV.height = MOBILE ? 360 : 720; const gTV = canvasTV.getContext('2d'); if (MOBILE) gTV.scale(.5, .5);
const texTV = new THREE.CanvasTexture(canvasTV); texTV.colorSpace = THREE.SRGBColorSpace;
function disegnaTV(t) {  // immagine proiettata: i video scorrono lenti, con solo una didascalia discreta (niente comandi da TV)
  const per = 7, i = Math.floor(t / per) % VIDEO_YT.length, k = (t % per) / per, img = YT_IMG[i], g = gTV, W = 1280, H = 720;
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  if (img.complete && img.naturalWidth) { const s = 1.05 + k * .12, w = W * s, h = H * s; g.globalAlpha = Math.min(1, .25 + k * 8, .25 + (1 - k) * 8); g.drawImage(img, (W - w) / 2 - k * 40, (H - h) / 2, w, h); g.globalAlpha = 1; }
  // caduta di luce verso i bordi, come la proiezione vera
  const v = g.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, W * .62); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.42)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  g.globalAlpha = Math.min(1, k * 6, (1 - k) * 6) * .9; g.fillStyle = '#fff'; g.font = '700 34px Archivo'; g.fillText(VIDEO_YT[i][1], 56, H - 70);
  g.font = '500 20px "JetBrains Mono"'; g.fillStyle = '#d0d0d0'; g.fillText((L ? VIDEO_YT[i][3] : VIDEO_YT[i][2]).toUpperCase(), 58, H - 40); g.globalAlpha = 1;
  texTV.needsUpdate = true;
}
const canvasSt = document.createElement('canvas'); canvasSt.width = 512; canvasSt.height = 230; const texSt = new THREE.CanvasTexture(canvasSt); texSt.colorSpace = THREE.SRGBColorSpace;
function disegnaStampante(msg) {
  const g = canvasSt.getContext('2d'); g.fillStyle = '#0e1a24'; g.fillRect(0, 0, 512, 230);
  g.fillStyle = '#fff'; g.font = '700 30px Archivo'; g.fillText(msg || (L ? 'Which résumé?' : 'Quale CV stampo?'), 24, 48);
  [['IN QUOTA', '#ff5b1f'], ['IN LUCE', '#c45cff'], ['IN CURA', '#2fe3c0']].forEach(([t, c], i) => { g.fillStyle = c; g.fillRect(24 + i * 160, 80, 144, 120); g.fillStyle = '#0a0b0d'; g.font = '800 24px Archivo'; g.fillText(t, 36 + i * 160, 150); });
  texSt.needsUpdate = true;
}
const canvasTel = document.createElement('canvas'); canvasTel.width = 300; canvasTel.height = 620; const texTel = new THREE.CanvasTexture(canvasTel); texTel.colorSpace = THREE.SRGBColorSpace;
let telStato = '';
function disegnaTel(squilla) {
  const st = squilla ? 'r' : 'n'; if (st === telStato) return; telStato = st;
  const g = canvasTel.getContext('2d'), W = 300, H = 620;
  // schermata di blocco: sfondo con i colori del logo, ora e data; quando squilla, chiamata in arrivo
  const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, squilla ? '#0f5132' : '#3b1d6e'); gr.addColorStop(1, squilla ? '#03140c' : '#0c1636'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.globalAlpha = .18; g.fillStyle = '#c85cff'; g.beginPath(); g.arc(W * .9, H * .78, 170, 0, 7); g.fill(); g.fillStyle = '#6f80ff'; g.beginPath(); g.arc(W * .05, H * .95, 120, 0, 7); g.fill(); g.globalAlpha = 1;
  g.fillStyle = '#fff'; g.textAlign = 'center';
  const d = new Date(), gg = L ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
  g.font = '500 20px Archivo'; g.fillText(`${gg[d.getDay()]} ${d.getDate()}`, W / 2, 92);
  g.font = '300 96px Archivo'; g.fillText(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`, W / 2, 182);
  if (squilla) { g.font = '600 26px Archivo'; g.fillText(L ? 'Incoming call' : 'Chiamata in arrivo', W / 2, 300); g.font = '800 38px Archivo'; g.fillText(L ? 'For you' : 'Per te', W / 2, 348);
    g.fillStyle = '#3fe07c'; g.beginPath(); g.arc(W / 2, 520, 44, 0, 7); g.fill(); }
  else { g.fillStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.roundRect(18, 470, W - 36, 74, 18); g.fill(); g.fillStyle = '#fff'; g.textAlign = 'left'; g.font = '700 17px Archivo'; g.fillText(L ? 'New message' : 'Nuovo messaggio', 36, 500);
    g.font = '400 16px Archivo'; g.fillStyle = 'rgba(255,255,255,.8)'; g.fillText(L ? 'Are you free next week?' : 'Sei libero la prossima settimana?', 36, 526); }
  g.textAlign = 'left'; texTel.needsUpdate = true;
}
let vq = null;
function quotaVideo(on) {
  if (!W || !W.schermi.video) return;
  if (on && !vq) {
    const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.crossOrigin = 'anonymous'; let i = 0;
    const next = () => { v.src = VIDEO_QUOTA[i % VIDEO_QUOTA.length]; i++; v.play().catch(() => {}); }; v.onended = next; next();
    const t = new THREE.VideoTexture(v); t.colorSpace = THREE.SRGBColorSpace;
    W.schermi.video.material = Object.assign(new THREE.MeshBasicMaterial({ map: t, toneMapped: false }), { fog: false }); vq = v;
  } else if (vq) { on ? vq.play().catch(() => {}) : vq.pause(); }
}
function schermi() {
  const s = W.schermi; const B = o => Object.assign(new THREE.MeshBasicMaterial(o), { fog: false, toneMapped: false });
  if (s.monitor) s.monitor.material = B({ map: SITI_TEX[0] });
  if (s.tv) { s.tv.material = new THREE.MeshStandardMaterial({ color: 0x2e2e2d, roughness: .95, emissive: 0xffffff, emissiveMap: texTV, emissiveIntensity: 1 }); disegnaTV(0); }
  if (s.stampante) { s.stampante.material = B({ map: texSt }); disegnaStampante(); }
  if (s.telefono) { s.telefono.material = B({ map: texTel }); disegnaTel(false); }
  if (s.video) s.video.material = new THREE.MeshBasicMaterial({ color: 0x111111 });
}

// ------------------------------------------------------------ ingresso
// se si entra da soli (link diretto a una sezione) il browser tiene l'audio fermo fino al primo tocco: lì lo si riattiva
addEventListener('pointerdown', () => { if (AC && AC.state === 'suspended') AC.resume(); }, { capture: true });
function entra(meta) {
  sfx.init(); $('#entra').classList.add('gone'); started = true; sfx.whoosh(3.5);
  apri = { t: 0 };
  setTimeout(() => { current = 'casa'; flyTo('casa', 4.6, false, [new THREE.Vector3(0, 2.6, 18), new THREE.Vector3(0, 5.9, 10.5)]); }, 900);   // passa sopra la parete della formazione
  setTimeout(() => $('#hint').classList.remove('gone'), 4400); setTimeout(() => $('#hint').classList.add('gone'), 11000);
  const h = typeof meta === 'string' ? meta : location.hash.slice(1); if (PANNELLI[h] || VISTE[h]) setTimeout(() => go(h), RIDUCI ? 1200 : 4800);
  ring.timer = setTimeout(startRing, 12000); quotaVideo(true);
  document.querySelector('#bar [data-go="casa"]').classList.add('on'); $('#bar').classList.remove('gone');
  setTimeout(() => { if (current === 'casa') $('#giro').classList.remove('gone'); }, 4000);
}
let apri = null;
$('#btnEntra').onclick = entra;

// ------------------------------------------------------------ avvio
buildHots(); applyLang();
$('#bar').classList.add('gone');
const mondo = costruisci({ scene, tl, gltf, mobile: MOBILE, fonts, lingua: L });
manager.onLoad = () => fine();
async function fine() {
  if (caricato) return;
  try { W = await mondo; } catch (e) { console.error(e); msg.textContent = 'Errore: ' + e.message; return; }
  if (caricato) return; caricato = true;
  clearInterval(mt); prog.style.width = '100%'; msg.textContent = tr(T.pronto);
  schermi(); DAY = dayTarget; applyLight(DAY); window.__W = W;
  // realismo: grana sulle superfici lisce e ombre morbide a terra (calcolate una volta, a scena ferma)
  if (Q.get('fx') !== '0') { if (!MOBILE) aggiungiGrana(scene); W.ombre = ombreContatto(renderer, scene, { w: 40 * K, d: 32 * K, res: MOBILE ? 1024 : 2048, salta: o => o.userData.senzaOmbra || /fronde|foglie/.test(o.name) }); }
  if (!MOBILE) scene.add(extLight);
  const meta = location.hash.slice(1);
  if (Q.has('auto')) { $('#loader').style.transition = 'none'; $('#loader').classList.add('gone'); autoEnter(); }
  else if (PANNELLI[meta] || VISTE[meta]) setTimeout(() => { $('#loader').classList.add('gone'); entra(); }, 500);   // link diretto a una sezione: niente porta da aprire
  else if (sceltoLab) setTimeout(() => { $('#loader').classList.add('gone'); entra(); }, 500);   // scelto dalla porta mentre caricava
  else if (portaAperta()) { $('#loader').classList.add('gone'); const p = $('#pProg'); if (p) p.style.width = '100%'; }   // si entra dal pulsante della porta
  else setTimeout(() => { $('#loader').classList.add('gone'); $('#entra').classList.remove('gone'); }, 500);
}
setTimeout(() => fine(), 25000);
// per le anteprime: ?auto&vista=quota entra subito senza volo
function autoEnter() {
  started = true; const k = VISTE[Q.get('vista')] ? Q.get('vista') : 'casa'; current = k;
  W.anim.serranda.position.y = 5.2; W.anim.serranda.visible = false;
  const { p, l, f } = fit(k); cam.pos.copy(p); cam.look.copy(l); fovMul = f; resize();
  $('#bar').classList.remove('gone'); $('#giro').classList.toggle('gone', k !== 'casa'); if (PANNELLI[k] && k !== 'casa') { openPanel(k); offX = SMALL() ? 0 : PANEL_W / 2; offY = SMALL() ? panel.offsetHeight * .5 : 0; }
  document.querySelectorAll('#bar [data-go]').forEach(b => b.classList.toggle('on', b.dataset.go === k || b.dataset.go === ZONA_DI[k]));
  quotaVideo(true);
  // solo anteprime: camera libera (pos, look, fov) per controllare la pianta dall'alto
  window.__scena = scene;
  window.__cam = (p, l, f = 1) => { current = 'libera'; closePanel(); cam.pos.set(...p); cam.look.set(...l); fovMul = f; look.ty = look.tp = look.yaw = look.pitch = 0; resize(); };
  // solo anteprime: salta a una vista senza volo (usato dagli screenshot automatici)
  window.__vista = (v, ora) => { if (ora !== undefined) { manuale = ora >= 7 && ora < 19 ? 1 : 0; setGiorno(manuale); DAY = manuale; applyLight(DAY); }
    current = v; closePanel(); $('#giro').classList.toggle('gone', v !== 'casa'); const r = fit(v); cam.pos.copy(r.p); cam.look.copy(r.l); fovMul = r.f; look.ty = look.tp = look.yaw = look.pitch = 0; resize();
    if (PANNELLI[v] && v !== 'casa') { openPanel(v); offX = SMALL() ? 0 : PANEL_W / 2; offY = SMALL() ? panel.offsetHeight * .5 : 0; } else { offX = offY = 0; }
    document.querySelectorAll('#bar [data-go]').forEach(b => b.classList.toggle('on', b.dataset.go === v || b.dataset.go === ZONA_DI[v])); };
}

// ------------------------------------------------------------ ridimensiona
const PANEL_W = 440; let offX = 0, offY = 0;
function resize() {
  camera.aspect = innerWidth / innerHeight; camera.fov = baseFov() * fovMul; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); composer?.setSize(innerWidth, innerHeight);
}
addEventListener('resize', resize); resize();

// ------------------------------------------------------------ ciclo
const clock = new THREE.Clock(); const tmp = new THREE.Vector3(), dir = new THREE.Vector3(), proj = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
let screenT = 0, siteI = 0, tvI = 0, lastLight = -1, frameN = 0;
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
  if (!W) return;
  // serranda che si alza
  if (apri) { apri.t = Math.min(1, apri.t + dt / 2.2); W.anim.serranda.position.y = ease(apri.t) * 5.2; if (apri.t >= 1) { W.anim.serranda.visible = false; apri = null; } }
  // volo
  if (fly) {
    fly.t = Math.min(1, fly.t + dt / fly.dur); const e = ease(fly.t), u = 1 - e;
    if (fly.via) cam.pos.set(0, 0, 0).addScaledVector(fly.p0, u * u * u).addScaledVector(fly.via[0], 3 * u * u * e).addScaledVector(fly.via[1], 3 * u * e * e).addScaledVector(fly.p, e * e * e);
    else cam.pos.set(0, 0, 0).addScaledVector(fly.p0, u * u).addScaledVector(fly.mid, 2 * u * e).addScaledVector(fly.p, e * e);
    cam.look.copy(fly.l0).lerp(fly.l, ease(Math.min(1, fly.t * 1.12)));
    fovMul = fly.f0 + (fly.f1 - fly.f0) * e; camera.fov = baseFov() * fovMul; camera.updateProjectionMatrix();
    if (fly.t >= 1) fly = null;
  }
  // sguardo
  if (!TOUCH && started && !fly && !down && current === 'casa' && Math.abs(look.px) > .3) {
    // nella panoramica, col mouse vicino al bordo la vista continua a girare da sola, fino a quasi 90° per lato
    const spinta = (Math.abs(look.px) - .3) / .2;
    look.ty -= Math.sign(look.px) * spinta * 1.3 * dt;   // dal centro si gira a 360°
  }
  look.yaw += (look.ty - look.yaw) * .08; look.pitch += (look.tp - look.pitch) * .08;
  if (!down && current !== 'casa') { look.ty *= .985; look.tp *= .985; }
  // il cursore guida lo sguardo: a sinistra guarda a sinistra; nella panoramica l'escursione è ampia
  const segui = TOUCH || !started || fly || down ? 0 : 1, ampio = current === 'casa';
  look.fx += (-look.px * (ampio ? .9 : .26) * segui - look.fx) * .05; look.fy += (look.py * (ampio ? .4 : .14) * segui - look.fy) * .05;
  const yaw = look.yaw + look.fx + Math.sin(t * .23) * .005, pitch = look.pitch + look.fy + Math.sin(t * .29) * .003;
  dir.copy(cam.look).sub(cam.pos); dir.applyAxisAngle(UP, yaw); const side = tmp.copy(UP).cross(dir).normalize(); dir.applyAxisAngle(side, pitch);
  // zoom con la rotella: la camera arretra e si alza un po', senza uscire dal capannone
  zoom += (zoomT - zoom) * .08;
  camera.position.copy(cam.pos);
  if (zoom > .002 && current !== 'fuori') {
    const avanti = tmp.copy(cam.look).sub(cam.pos).setY(0).normalize();
    camera.position.addScaledVector(avanti, -4.2 * zoom); camera.position.y += 1.4 * zoom;
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -16.4, 16.4); camera.position.z = THREE.MathUtils.clamp(camera.position.z, -13.1, 13.3); camera.position.y = Math.min(camera.position.y, 8);
  }
  camera.fov = baseFov() * fovMul * (1 + .2 * zoom); camera.updateProjectionMatrix();
  camera.lookAt(tmp.copy(camera.position).add(dir));
  // spazio per il pannello
  const open = panel.classList.contains('open');
  const wx = open && !SMALL() ? PANEL_W / 2 : 0, wy = open && SMALL() ? panel.offsetHeight * .5 : 0;
  offX += (wx - offX) * .07; offY += (wy - offY) * .07;
  if (Math.abs(offX) > .5 || Math.abs(offY) > .5) camera.setViewOffset(innerWidth, innerHeight, offX, offY, innerWidth, innerHeight); else camera.clearViewOffset();
  // giorno e notte, con passaggio morbido
  DAY += (dayTarget - DAY) * Math.min(1, dt * 1.6);
  if (Math.abs(DAY - lastLight) > .002) { applyLight(DAY); lastLight = DAY; }
  // lampeggianti dell'ambulanza
  const ph = (t * 1.6) % 1, a1 = ph < .08 || (ph > .16 && ph < .24), ph2 = (t * 1.6 + .5) % 1, a2 = ph2 < .08 || (ph2 > .16 && ph2 < .24), on = a1 || a2 ? 1 : 0;
  W.mat.lampeggiante.emissiveIntensity = 8 * on; W.luci.ambulanza.intensity = (110 + 150 * (1 - DAY)) * on;
  { const q = (t * 1.35 + .3) % 1, on2 = q < .07 || (q > .14 && q < .21) || (q > .5 && q < .57) ? 1 : 0;
    if (W.mat.lampeggiante2) W.mat.lampeggiante2.emissiveIntensity = 8 * on2; if (W.luci.vvf) W.luci.vvf.intensity = (110 + 150 * (1 - DAY)) * on2; }
  // telefono che vibra
  if (W.anim.telefono) { const r = ring.on && (t * 2.6) % 2.6 < .9; W.anim.telefono.userData.x0 ??= W.anim.telefono.position.x; W.anim.telefono.position.x = W.anim.telefono.userData.x0 + (r ? Math.sin(t * 90) * .003 : 0); W.anim.telefono.rotation.y = .38 + (r ? Math.sin(t * 70) * .05 : 0); disegnaTel(ring.on); }
  if (W.schermi.tv && (frameN++ % (MOBILE ? 4 : 2) === 0)) disegnaTV(t);
  // schermi che cambiano
  screenT += dt; if (screenT > 5) { screenT = 0; siteI = (siteI + 1) % SITI_TEX.length;
    if (W.schermi.monitor) W.schermi.monitor.material.map = SITI_TEX[siteI]; }
  // foglio che esce dalla stampante
  if (stampaAnim) { stampaAnim.t += dt; if (!stampaAnim.m) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.21, .297), new THREE.MeshBasicMaterial({ color: 0xd2d0cb, map: stampaAnim.tex, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2 + .25; scene.add(m); stampaAnim.m = m; }
    const k = Math.min(1, stampaAnim.t / 1.5), d = .1 + k * .26; stampaAnim.m.rotation.order = 'YXZ'; stampaAnim.m.rotation.set(-Math.PI / 2 + .25, -.314, 0); stampaAnim.m.position.set(2.46 - .309 * d, .98, -9.48 + .951 * d); if (stampaAnim.t > 20) { scene.remove(stampaAnim.m); stampaAnim.tex.dispose(); stampaAnim = null; } }   // il foglio resta sul vassoio per un po'
  // pallini
  const zona = ZONA_DI[current] || (['quota', 'luce', 'cura'].includes(current) ? current : '');
  // area libera per i pallini: niente sotto la testata, la barra in basso o il pannello aperto
  const bx0 = 34, by0 = 84, bx1 = innerWidth - 34 - (open && !SMALL() ? PANEL_W + 40 : 0), by1 = innerHeight - (current === 'casa' ? 160 : 110) - (open && SMALL() ? panel.offsetHeight : 0);   // in panoramica resta posto per "Fai il giro"
  for (const h of hots) {
    proj.copy(h.v).project(camera);
    let ok = started && !fly;
    if (h.p.livello === 1) ok = ok && (current === 'casa' || (['quota', 'luce', 'cura'].includes(h.p.id) && h.p.id !== zona));
    else ok = ok && h.p.zona === zona && !(open && h.p.id === current);
    if (h.p.id === 'telefono' && ring.on && started && !fly) ok = true;
    const dietro = proj.z > 1;
    let sx = (proj.x * .5 + .5) * innerWidth, sy = (-proj.y * .5 + .5) * innerHeight;
    const dentro = !dietro && sx > bx0 && sx < bx1 && sy > by0 && sy < by1;
    // fuori dallo schermo: una freccia sul bordo indica che di lato c'è altro (solo pallini della panoramica o della zona)
    const bordo = ok && !dentro && current === 'casa' && h.p.livello === 1;   // le frecce solo nella panoramica, per non affollare le viste vicine
    let mostra = true;
    if (bordo) {
      tmp.copy(h.v); camera.worldToLocal(tmp); const ang = Math.atan2(tmp.x, -tmp.z);
      const semiH = Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.aspect);
      mostra = Math.abs(ang) < 2.4;   // quelli proprio alle spalle non si indicano
      if (tmp.z < 0 && Math.abs(ang) < semiH) {   // davanti ma sotto o sopra lo schermo: freccia in basso o in alto
        const giu = sy > (by0 + by1) / 2; sx = THREE.MathUtils.clamp(sx, bx0 + 120, bx1 - 120); sy = giu ? by1 : by0;
        h.el.style.setProperty('--a', (giu ? Math.PI / 2 : -Math.PI / 2) + 'rad');
      } else {
        const dx = ang > 0 ? 1 : -1; sx = dx > 0 ? bx1 : bx0;
        sy = tmp.z < 0 ? THREE.MathUtils.clamp(sy, by0 + 10, by1 - 10) : (by0 + by1) / 2;
        h.el.style.setProperty('--a', (dx > 0 ? 0 : Math.PI) + 'rad');
      }
    }
    h.el.classList.toggle('hide', !(ok && (dentro || (bordo && mostra)))); h.el.classList.toggle('edge', bordo);
    h.sx = sx; h.sy = sy; h.bordo = bordo && mostra;
  }
  // le frecce sullo stesso bordo si distanziano tra loro (almeno 42 px)
  const ai = hots.filter(h => h.bordo), oriz = h => h.sy >= by1 - 1 || h.sy <= by0 + 1;   // frecce in basso/in alto
  for (const lato of [ai.filter(h => !oriz(h) && h.sx < innerWidth / 2), ai.filter(h => !oriz(h) && h.sx >= innerWidth / 2)]) {
    lato.sort((a, b) => a.sy - b.sy);
    for (let i = 1; i < lato.length; i++) if (lato[i].sy - lato[i - 1].sy < 42) lato[i].sy = lato[i - 1].sy + 42;
    const over = lato.length ? lato[lato.length - 1].sy - by1 : 0; if (over > 0) lato.forEach(h => h.sy -= over);
  }
  for (const riga of [ai.filter(h => oriz(h) && h.sy >= by1 - 1), ai.filter(h => oriz(h) && h.sy <= by0 + 1)]) {   // in basso e in alto si distanziano in orizzontale (etichette larghe)
    riga.sort((a, b) => a.sx - b.sx);
    for (let i = 1; i < riga.length; i++) if (riga[i].sx - riga[i - 1].sx < 190) riga[i].sx = riga[i - 1].sx + 190;
  }
  // etichette che si toccherebbero: la seconda sale o scende di una riga; se non c'è posto resta solo il pallino
  const posti = [];
  for (const h of hots.filter(h => !h.el.classList.contains('hide')).sort((a, b) => a.sy - b.sy)) {
    const flip = h.sx > bx1 - 200, lbl = h.el.querySelector('.lbl'); h.lw ||= lbl.offsetWidth || 120;
    const x0 = flip ? h.sx - 16 - h.lw : h.sx + 16, x1 = flip ? h.sx - 16 : h.sx + 16 + h.lw;
    let dy = null;
    for (const d of [0, -30, 30, -60, 60]) { const y0 = h.sy + d - 15, y1 = y0 + 30;
      if (!posti.some(r => x0 < r[2] && x1 > r[0] && y0 < r[3] && y1 > r[1])) { dy = d; posti.push([x0, y0, x1, y1]); break; } }
    h.el.style.setProperty('--ly', (dy ?? 0) + 'px'); h.el.classList.toggle('nolbl', dy === null);
  }
  for (const h of hots) { h.el.classList.toggle('flip', h.sx > bx1 - 200); h.el.style.transform = `translate(${h.sx}px,${h.sy}px)`; }
  pellicola.uniforms.tempo.value = t % 10;
  if (composer) composer.render(); else renderer.render(scene, camera);   // sui telefoni niente effetti di post-produzione: pesano su ogni pixel
}
frame();
