// Costruisce il capannone, posiziona gli arredi e prepara luci, schermi e oggetti cliccabili.
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { ATTESTATI, SITI, VIDEO_YT, BASE, SCRITTE } from './dati.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const deg = d => d * Math.PI / 180;

export async function costruisci({ scene, tl, gltf, mobile, fonts, lingua = 0 }) {
  RectAreaLightUniformsLib.init();
  const out = { cliccabili: [], luci: {}, schermi: {}, anim: {}, mat: {} };
  // testi disegnati sugli oggetti: si ridisegnano quando cambia la lingua (out.lingua)
  const testi = [];
  const testo = (mesh, make) => { mesh.material.map = make(lingua); mesh.material.needsUpdate = true; testi.push({ mesh, make }); return mesh; };
  out.lingua = L => { lingua = L; for (const t of testi) { const old = t.mesh.material.map; t.mesh.material.map = t.make(L); t.mesh.material.needsUpdate = true; if (old) old.dispose(); } };
  const tag = (obj, punto) => { obj.traverse(o => { if (o.isMesh) { o.userData.punto = punto; out.cliccabili.push(o); } }); };

  // ------------------------------------------------------------ texture
  // sui telefoni la memoria grafica è poca: immagini più piccole (tex-mobile), niente rilievo/ruvidità, tele a metà risoluzione
  const TM = f => mobile ? f.replace(/^tex\//, 'tex-mobile/') : f;
  const T = (f, rep = [1, 1], srgb = true) => { const t = tl.load(TM(f)); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const pbr = (name, rep, extra = {}) => new THREE.MeshStandardMaterial(mobile ? { map: T(`tex/${name}_diffuse.jpg`, rep), ...extra } : { map: T(`tex/${name}_diffuse.jpg`, rep), normalMap: T(`tex/${name}_nor_gl.jpg`, rep, false), roughnessMap: T(`tex/${name}_rough.jpg`, rep, false), ...extra });
  const SC = mobile ? .5 : 1;
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = Math.max(4, Math.round(w * SC)); c.height = Math.max(4, Math.round(h * SC)); const g = c.getContext('2d'); g.scale(SC, SC); draw(g, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  // UV 0..1 proiettate sul lato largo della mesh (quelle esportate da Blender sono in metri):
  // lastra verticale -> u = x, v = y; lastra a terra -> u = x, v = verso il fondo
  const uvPiano = m => {
    const g = m.geometry; g.computeBoundingBox(); const b = g.boundingBox, s = b.getSize(new THREE.Vector3()), p = g.attributes.position, uv = new Float32Array(p.count * 2);
    const n = s.x <= s.y && s.x <= s.z ? 'x' : s.y <= s.z ? 'y' : 'z';
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      uv[i * 2] = n === 'x' ? (b.max.z - z) / s.z : (x - b.min.x) / s.x;
      uv[i * 2 + 1] = n === 'y' ? (b.max.z - z) / s.z : (y - b.min.y) / s.y;
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return m;
  };
  out.uvPiano = uvPiano;

  // texture schiarita e senza colore (per il pavimento chiaro)
  const chiaro = (url, rep, filtro) => { const c = document.createElement('canvas'), t = new THREE.CanvasTexture(c); const i = new Image();
    i.onload = () => { c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.filter = filtro; g.drawImage(i, 0, 0); t.needsUpdate = true; }; i.src = TM(url);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  // ------------------------------------------------------------ materiali dell'edificio
  const M = {
    pavimento: new THREE.MeshStandardMaterial({ map: chiaro('tex/smooth_concrete_floor_diffuse.jpg', [9, 7.2], 'grayscale(1) brightness(1.55) contrast(.7)'), ...(mobile ? {} : { normalMap: T('tex/smooth_concrete_floor_nor_gl.jpg', [9, 7.2], false), roughnessMap: T('tex/smooth_concrete_floor_rough.jpg', [9, 7.2], false), normalScale: new THREE.Vector2(.4, .4) }), color: 0xf2f0ec, roughness: .55, envMapIntensity: 1.25 }),
    parete: pbr('corrugated_iron_02', [1, 1], { color: 0x9a9ea5, metalness: .3, roughness: 1 }),
    zoccolo: pbr('hangar_concrete_floor', [10, .5], { color: 0x7d7c79, roughness: 1 }),
    soffitto: new THREE.MeshStandardMaterial({ color: 0x17181b, roughness: .9 }),
    acciaio: new THREE.MeshStandardMaterial({ color: 0x1b1c1f, metalness: .8, roughness: .42 }),
    vetro: new THREE.MeshPhysicalMaterial({ color: 0xbfd2e6, roughness: .08, transparent: true, opacity: .16, depthWrite: false }),
    cielo: new THREE.MeshBasicMaterial({ color: 0xa9c8e8, toneMapped: false }),
    led: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xf3f6ff, emissiveIntensity: 3 }),
    asfalto: pbr('asphalt_floor', [56, 56], { color: 0x55575b, roughness: .95 }),
    esterno: pbr('corrugated_iron_02', [1, 1], { color: 0x6a6f77, metalness: .25, roughness: .8 }),
    serranda: pbr('painted_metal_shutter', [2, 1.4], { color: 0x3b3e44, metalness: .6, roughness: 1 }),
  };
  out.mat = M;
  // capannone ridotto: le misure di progetto (40 x 32) scalate di K; gli arredi tengono la loro misura
  const K = .85, W = 40 * K, D = 32 * K, H = 9, X0 = -W / 2, X1 = W / 2, Z0 = -D / 2, Z1 = D / 2;

  const mesh = (geo, mat, x, y, z, ry = 0, cast = true, recv = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = cast; m.receiveShadow = recv; scene.add(m); return m; };
  const box = (w, h, d, mat, x, y, z, ry = 0, cast = true) => mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, ry, cast);
  // parete con texture ripetuta in base alla misura (1 ripetizione ogni 2.4 m)
  const wallMat = (w, h, base = M.parete) => { const m = base.clone(); ['map', 'normalMap', 'roughnessMap'].forEach(k => { if (m[k]) { m[k] = m[k].clone(); m[k].repeat.set(w / 2.4, h / 2.4); m[k].needsUpdate = true; } }); return m; };
  const wall = (w, h, x, y, z, ry, base) => mesh(new THREE.BoxGeometry(w, h, .25), wallMat(w, h, base), x, y, z, ry);

  // ------------------------------------------------------------ pavimento, soffitto, pareti
  const floor = mesh(new THREE.PlaneGeometry(W, D), M.pavimento, 0, 0, 0, 0, false, true); floor.rotation.x = -Math.PI / 2;
  const ground = mesh(new THREE.PlaneGeometry(160, 160), M.asfalto, 0, -.02, 0, 0, false, true); ground.rotation.x = -Math.PI / 2;
  box(W + .5, .3, D + .5, M.soffitto, 0, H + .15, 0);
  // sinistra con finestre alte (z da -14 a 14, h 7.2-8.8)
  wall(D + .5, 6.6, X0 - .125, 3.3, 0, Math.PI / 2); wall(D + .5, H - 8.2, X0 - .125, 8.2 + (H - 8.2) / 2, 0, Math.PI / 2);
  // fondo con finestre alte
  wall(W + .5, 6.6, 0, 3.3, Z0 - .125, 0); wall(W + .5, H - 8.2, 0, 8.2 + (H - 8.2) / 2, Z0 - .125, 0);
  for (let x = X0; x <= X1 + .01; x += 2.5) box(.12, 1.6, .3, M.acciaio, x, 7.4, Z0 - .1);
  for (let z = Z0; z <= Z1 + .01; z += 2.5) box(.3, 1.6, .12, M.acciaio, X0 - .1, 7.4, z);
  const gl1 = mesh(new THREE.PlaneGeometry(W, 1.6), M.vetro, 0, 7.4, Z0 - .05, 0, false, false);
  const gl2 = mesh(new THREE.PlaneGeometry(D, 1.6), M.vetro, X0 - .05, 7.4, 0, Math.PI / 2, false, false);
  // destra: due portoni da garage (nelle due campate verso il portone, il pilastro in mezzo) e finestre alte
  const GD = 9.5, GH = 6.0, PH = 4.5, PW = 5.4;                  // garage: profondità e altezza; portoni: altezza e larghezza
  const porte = [Z1 - 3 * D / 8, Z1 - D / 8];                     // centri delle due campate verso il portone: 0 = vigili del fuoco, 1 = ambulanza
  const tagli = porte.map(c => [c - PW / 2, c + PW / 2]);
  const pieni = [[Z0, tagli[0][0]], [tagli[0][1], tagli[1][0]], [tagli[1][1], Z1]];
  for (const [a, b] of pieni) wall(b - a, 6.6, X1 + .125, 3.3, (a + b) / 2, -Math.PI / 2);
  for (const [a, b] of tagli) wall(b - a, 6.6 - PH, X1 + .125, (PH + 6.6) / 2, (a + b) / 2, -Math.PI / 2);
  wall(D + .5, H - 8.2, X1 + .125, 8.2 + (H - 8.2) / 2, 0, -Math.PI / 2);
  for (let z = Z0; z <= Z1 + .01; z += 2.5) box(.3, 1.6, .12, M.acciaio, X1 + .1, 7.4, z);
  mesh(new THREE.PlaneGeometry(D, 1.6), M.vetro, X1 + .05, 7.4, 0, -Math.PI / 2, false, false);
  for (const [a, b] of tagli) {                                    // telaio in acciaio dei portoni
    box(.34, PH, .22, M.acciaio, X1 - .02, PH / 2, a + .11); box(.34, PH, .22, M.acciaio, X1 - .02, PH / 2, b - .11); box(.34, .26, b - a, M.acciaio, X1 - .02, PH + .13, (a + b) / 2);
  }
  // davanti: portone (x -2.6..2.6, alto 5)
  const DW = 5.2, DH = 5;
  wall((W - DW) / 2, H, -(DW / 2 + (W - DW) / 4), H / 2, Z1 + .125, Math.PI);
  wall((W - DW) / 2, H, (DW / 2 + (W - DW) / 4), H / 2, Z1 + .125, Math.PI);
  wall(DW, H - DH, 0, DH + (H - DH) / 2, Z1 + .125, Math.PI);
  box(.3, DH, .4, M.acciaio, -DW / 2 - .15, DH / 2, Z1 + .1); box(.3, DH, .4, M.acciaio, DW / 2 + .15, DH / 2, Z1 + .1); box(DW + .6, .3, .4, M.acciaio, 0, DH + .15, Z1 + .1);
  // zoccolo in cemento lungo le pareti interne
  const zoc = (w, x, z, ry) => mesh(new THREE.BoxGeometry(w, 1.0, .06), M.zoccolo, x, .5, z, ry, false, true);
  zoc(W, 0, Z0 + .03, 0); zoc(D, X0 + .03, 0, Math.PI / 2); for (const [a, b] of pieni) zoc(b - a, X1 - .03, (a + b) / 2, Math.PI / 2);
  zoc((W - DW) / 2, -(DW / 2 + (W - DW) / 4), Z1 - .03, 0); zoc((W - DW) / 2, (DW / 2 + (W - DW) / 4), Z1 - .03, 0);

  // ------------------------------------------------------------ garage dei mezzi di soccorso, dietro i portoni
  { const GZ0 = 0, GZ1 = Z1, gl = GZ1 - GZ0, gc = (GZ0 + GZ1) / 2, gx = X1 + GD / 2;
    const cemento = pbr('hangar_concrete_floor', [GD / 3, gl / 3], { color: 0x8a8884, roughness: .9 });
    const muroG = pbr('hangar_concrete_floor', [1, 1], { color: 0xcfccc5, roughness: .95 });
    const pav = mesh(new THREE.PlaneGeometry(GD, gl), cemento, gx, .002, gc, 0, false, true); pav.rotation.x = -Math.PI / 2;
    wall(gl, GH, X1 + GD + .125, GH / 2, gc, -Math.PI / 2, muroG);
    wall(GD, GH, gx, GH / 2, GZ0 - .125, 0, muroG); wall(GD, GH, gx, GH / 2, GZ1 + .125, 0, muroG);
    box(GD + .5, .25, gl + .5, M.soffitto, gx, GH + .125, gc);
    const ledG = M.led.clone(); ledG.emissiveIntensity = 3.2; out.mat.ledGarage = ledG; out.luci.garage = [];
    const giallo = new THREE.MeshStandardMaterial({ color: 0xd9ad00, roughness: .7 });
    for (const c of porte) {
      mesh(new THREE.BoxGeometry(GD - 2.4, .04, .14), ledG, gx + .4, GH - .04, c, 0, false, false);           // neon del garage, sempre accesi
      if (!mobile) { const L = new THREE.RectAreaLight(0xf4f6ff, 26, GD - 2.4, .4); L.position.set(gx + .4, GH - .08, c); L.rotation.x = -Math.PI / 2; scene.add(L); out.luci.garage.push(L); }
      box(PH - .3, .06, PW - .12, M.serranda, X1 + .45 + (PH - .3) / 2, PH + .32, c);                        // portone sezionale sollevato
      for (const sz of [-1, 1]) { box(PH + .1, .06, .06, M.acciaio, X1 + .4 + PH / 2, PH + .26, c + sz * (PW / 2 - .08)); box(.06, PH, .06, M.acciaio, X1 + .32, PH / 2, c + sz * (PW / 2 - .08)); }
      for (const sz of [-1, 1]) { const r = mesh(new THREE.PlaneGeometry(GD - 1.2, .1), giallo, gx + .3, .007, c + sz * 1.7, 0, false, true); r.rotation.x = -Math.PI / 2; }   // strisce del posto
    }
    // coni, naspi rossi e pannello attrezzi contro la parete di fondo
    const arancio = new THREE.MeshStandardMaterial({ color: 0xff5a14, roughness: .55 }), bianco = new THREE.MeshStandardMaterial({ color: 0xeeeeea, roughness: .4 });
    for (const [x, z] of [[X1 + 1.0, porte[0] - 2.2], [X1 + 1.6, porte[0] - 2.3], [X1 + 1.2, porte[1] + 2.15]]) {
      const cono = new THREE.Mesh(new THREE.ConeGeometry(.16, .5, 24), arancio); cono.position.set(x, .27, z); cono.castShadow = true; scene.add(cono);
      const fascia = new THREE.Mesh(new THREE.CylinderGeometry(.085, .11, .08, 24), bianco); fascia.position.set(x, .33, z); scene.add(fascia);
      box(.36, .03, .36, M.acciaio, x, .015, z, 0, false);
    }
    const rossoN = new THREE.MeshStandardMaterial({ color: 0xa3121a, roughness: .45 });
    for (const z of [porte[0] + 1.6, porte[1] - 1.6]) {
      const n = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .16, 32), rossoN); n.rotation.z = Math.PI / 2; n.position.set(X1 + GD - .1, 1.9, z); scene.add(n);
      const tubo = new THREE.Mesh(new THREE.TorusGeometry(.32, .05, 12, 40), new THREE.MeshStandardMaterial({ color: 0xd8d0b8, roughness: .9 })); tubo.rotation.y = Math.PI / 2; tubo.position.set(X1 + GD - .12, 1.9, z); scene.add(tubo);
    }
  }

  // pilastri in acciaio lungo le pareti e capriate sul soffitto
  for (const z of [Z0, Z0 / 2, 0, Z1 / 2, Z1]) {
    for (const x of [X0 + .2, X1 - .2]) box(.45, H, .3, M.acciaio, x, H / 2, z);
    // capriata: corrente superiore, inferiore e diagonali
    box(W, .3, .2, M.acciaio, 0, H - .25, z); box(W, .18, .14, M.acciaio, 0, H - 1.6, z);
    for (let x = X0 + 1; x < X1 - 1.5; x += 2) {
      const d = new THREE.Mesh(new THREE.BoxGeometry(.08, 1.6, .1), M.acciaio); d.position.set(x + 1, H - .92, z); d.rotation.z = (x / 2) % 2 ? .55 : -.55; scene.add(d);
    }
  }
  for (let x = X0 + 3; x <= X1 - 3; x += 4) box(.12, .14, D, M.acciaio, x, H - .35, 0);  // arcarecci

  // lucernari (giorno) tra le capriate
  out.mat.cielo = M.cielo;
  for (const zc of [-12, -4, 4, 12]) for (const xc of [-10, 10]) { const s = mesh(new THREE.PlaneGeometry(8 * K, 3 * K), M.cielo, xc * K, H - .01, zc * K, 0, false, false); s.rotation.x = Math.PI / 2; }
  // cielo fuori dalle finestre
  const sfuma = canvasTex(4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8fb4e6'); gr.addColorStop(.46, '#d6e6f6'); gr.addColorStop(.5, '#f2f4f2'); gr.addColorStop(1, '#9aa3ab'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(120, 32, 16), new THREE.MeshBasicMaterial({ map: sfuma, color: 0x0b0f18, side: THREE.BackSide, toneMapped: false, fog: false })); scene.add(sky); out.mat.sfondo = sky.material;

  // ------------------------------------------------------------ luci LED lineari
  out.luci.rect = []; const rows = (mobile ? [-8, 8] : [-12, -4, 4, 12]).map(x => x * K);
  for (const x of rows) {
    const corta = Math.abs(x) < 5 && !mobile, len = corta ? 11.6 : 22, zc0 = corta ? -6.4 : -1;
    box(.14, .1, len, M.acciaio, x, 7.0, zc0, 0, false);
    mesh(new THREE.BoxGeometry(.09, .02, len - .2), M.led, x, 6.94, zc0, 0, false, false);
    for (const zc of (mobile ? [-1] : corta ? [-6.4] : [-6.5, 4.5])) {
      const L = new THREE.RectAreaLight(0xf2f5ff, 0, .5, mobile ? 21 : corta ? 11.4 : 10.9); L.position.set(x, 6.9, zc); L.rotation.x = -Math.PI / 2; scene.add(L); out.luci.rect.push(L);
    }
    for (const z of (corta ? [-11, -1.5] : [-10, 0, 9])) box(.012, H - 7, .012, M.acciaio, x, 7 + (H - 7) / 2, z, 0, false);
  }

  // ------------------------------------------------------------ scritte grandi sulle pareti
  await fonts;
  const scritta = ([txt, num], col) => canvasTex(2048, 512, (g, cw, ch) => {
    g.clearRect(0, 0, cw, ch);
    let fs = 330; g.font = `800 ${fs}px Archivo`; g.textBaseline = 'alphabetic';
    const tot = g.measureText(num + '  ' + txt).width + 70; if (tot > cw * .98) { fs = fs * cw * .98 / tot; g.font = `800 ${fs}px Archivo`; }
    const nw = g.measureText(num).width;
    g.fillStyle = col; g.fillText(num, 20, 380);
    g.fillStyle = '#ece8e1'; g.fillText(txt, 20 + nw + 70 * fs / 330, 380);
  });
  const muro = (w, h, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ transparent: true, roughness: .8, metalness: 0 })); m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; scene.add(m); return m; };
  // sulle pareti laterali i pilastri stanno ogni D/4 (6.8 m): ogni scritta sta dentro una campata, tra due pilastri
  const campata = i => Z0 + D / 4 * (i + .5);          // centro della campata i (0 = fondo, 3 = portone)
  const scrittaDoppia = ([txt, num], col) => canvasTex(2048, 1024, (g, cw) => {
    g.textBaseline = 'alphabetic'; g.fillStyle = col; g.font = '800 430px Archivo'; g.fillText(num, 14, 410);
    let fs = 430; g.font = `800 ${fs}px Archivo`; while (g.measureText(txt).width > cw - 30) { fs -= 6; g.font = `800 ${fs}px Archivo`; }
    g.fillStyle = '#ece8e1'; g.fillText(txt, 10, 905);
  });
  // le scritte stanno tutte sotto la fascia delle finestre alte (6.6 m)
  testo(muro(6.2, 3.1, X0 + .03, 4.95, campata(1), Math.PI / 2), L => scrittaDoppia(SCRITTE.quota[L], '#ff5b1f'));
  testo(muro(7, 1.75, -.5, 5.75, Z0 + .03, 0), L => scritta(SCRITTE.luce[L], '#c45cff'));   // sopra le foto della parete attrezzatura
  testo(muro(6.2, 3.1, 10.6, 4.95, Z1 - .03, Math.PI), L => scrittaDoppia(SCRITTE.cura[L], '#2fe3c0'));   // sulla parete del portone, sopra la zona In cura
  // altre scritte su più righe: la tela si adatta al numero di righe, così niente resta tagliato.
  // stili = per ogni riga [colore, peso/corsivo]; le righe arrivano da SCRITTE in base alla lingua
  const frase = (chiave, stili, w, size, x, y, z, ry, col = '#ece8e1') => {
    const n = SCRITTE[chiave][0].length, cw = 2048, ch = Math.ceil(n * size * 1.04 + size * .32);
    return testo(muro(w, w * ch / cw, x, y, z, ry), L => canvasTex(cw, ch, g => {
      g.textBaseline = 'alphabetic';
      SCRITTE[chiave][L].forEach((s, i) => { const [c, f] = stili[i] || []; g.fillStyle = c || col; const fam = f && f.includes('italic') ? '"Instrument Serif"' : 'Archivo';
        let sz = size; g.font = `${f || 800} ${sz}px ${fam}`; const mw = g.measureText(s).width; if (mw > cw * .98) { sz = sz * cw * .98 / mw; g.font = `${f || 800} ${sz}px ${fam}`; }
        g.fillText(s, 10, size * (i + 1) * 1.04 - size * .1); });
    }));
  };
  frase('motto', [0, 0, ['#c45cff']], 6.6, 200, -9.8, 4.9, Z1 - .03, Math.PI);   // sulla parete del portone, a sinistra (sopra l'angolo caffè)
  frase('studio', [0, ['#c45cff', 'italic 400']], 5.2, 300, X1 - .03, 4.7, campata(0), -Math.PI / 2);   // parete destra, sopra la sala posa
  frase('formazione', [0, ['#d9d2c5', 'italic 400']], 5.2, 330, 0, 5.3, 8.9, Math.PI);   // sopra la parete della formazione, al centro: vale per tutti e tre i mestieri
  // scritte del garage: sopra i portoni (lato capannone) e sulla parete di fondo
  const insegnaPorta = (num, txt, col) => canvasTex(1024, 300, (g, w, h) => { g.fillStyle = '#16171a'; g.fillRect(0, 0, w, h); g.fillStyle = col; g.fillRect(0, 0, w, 16);
    g.font = '800 170px Archivo'; g.fillText(num, 40, 210); g.fillStyle = '#ece8e1'; g.font = '600 52px "JetBrains Mono"'; g.fillText(txt, 430, 182); });
  [[porte[0], '115', ['VIGILI DEL FUOCO', 'FIRE BRIGADE'], '#e5202e'], [porte[1], '118', ['AMBULANZA', 'AMBULANCE'], '#ff6a13']].forEach(([c, num, txt, col]) => {
    testo(muro(2.4, .7, X1 - .2, PH + .75, c, -Math.PI / 2), L => insegnaPorta(num, txt[L], col));
    testo(muro(4.6, 1.15, X1 + GD - .01, 4.4, c, -Math.PI / 2), L => canvasTex(2048, 512, g => { g.fillStyle = col; g.font = '800 300px Archivo'; g.fillText(num, 20, 360); g.fillStyle = '#2a2b2e'; g.font = '800 120px Archivo'; g.fillText(txt[L], 720, 340); }));
  });
  // numeri grandi dipinti a terra, uno per zona
  const numero = (n, col) => canvasTex(1024, 1024, g => { g.fillStyle = col; g.globalAlpha = .9; g.font = '800 700px Archivo'; g.textAlign = 'center'; g.fillText(n, 512, 760); });
  [['01', '#ff5b1f', -9.5, -2.0, .35], ['02', '#c45cff', -1.6, -6.9, 0], ['03', '#2fe3c0', 8.6, 4.6, -.35]].forEach(([n, c, x, z, r]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshStandardMaterial({ map: numero(n, c), transparent: true, opacity: .55, roughness: .7, depthWrite: false }));
    m.rotation.set(-Math.PI / 2, 0, r); m.position.set(x, .007, z); m.receiveShadow = true; scene.add(m);
  });
  // cartelli di sicurezza sulla struttura (blu, come in palestra)
  const cartello = (righe) => canvasTex(512, 720, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = '#1757a8'; g.beginPath(); g.arc(w / 2, 220, 170, 0, 7); g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 18; g.beginPath(); g.arc(w / 2, 240, 80, Math.PI, 0); g.stroke(); g.fillStyle = '#fff'; g.fillRect(w / 2 - 110, 236, 220, 22);
    g.fillStyle = '#1757a8'; g.fillRect(0, 440, w, h - 440); g.fillStyle = '#fff'; g.font = '800 52px Archivo'; g.textAlign = 'center'; righe.forEach((r, i) => g.fillText(r, w / 2, 530 + i * 64)); });
  [[['OBBLIGO', 'CASCO'], -13.5], [['OBBLIGO', 'IMBRAGATURA'], -6.9]].forEach(([r, x]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(.5, .7), new THREE.MeshStandardMaterial({ map: cartello(r), roughness: .6 })); m.position.set(x, 1.7, -8.54); scene.add(m); });
  // frecce a terra davanti al salottino
  const freccia = (txt, col, rot) => canvasTex(512, 256, (g) => { g.fillStyle = col; g.font = '800 120px Archivo'; g.fillText(txt, 20, 170); });
  [['01 ←', '#ff5b1f', -5.4, 5.9], ['02 ↑', '#c45cff', -.9, 6.4], ['03 →', '#2fe3c0', 3.6, 5.9]].forEach(([t, c, x, z]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.1), new THREE.MeshStandardMaterial({ map: freccia(t, c), transparent: true, roughness: .9 })); m.rotation.x = -Math.PI / 2; m.position.set(x, .006, z); m.receiveShadow = true; scene.add(m);
  });

  // ------------------------------------------------------------ esterno: facciata, insegna, serranda
  const fac = (w, h, x, y) => mesh(new THREE.PlaneGeometry(w, h), (() => { const m = M.esterno.clone(); ['map', 'normalMap', 'roughnessMap'].forEach(k => { if (m[k]) { m[k] = m[k].clone(); m[k].repeat.set(w / 2.4, h / 2.4); } }); return m; })(), x, y, Z1 + .26, 0, false, true);
  fac((W - DW) / 2, H, -(DW / 2 + (W - DW) / 4), H / 2); fac((W - DW) / 2, H, DW / 2 + (W - DW) / 4, H / 2); fac(DW, H - DH, 0, DH + (H - DH) / 2);
  const ZF = Z1 + .27;
  for (const sx of [-1, 1]) box((W + .6 - DW) / 2, 1.0, .12, M.zoccolo, sx * (DW / 2 + (W + .6 - DW) / 4), .5, ZF + .04);   // zoccolo, interrotto al portone
  box(W + .9, .45, .5, M.acciaio, 0, H + .1, Z1 + .2);                                   // cornice in alto
  for (const x of [-W / 2, -11.5, -DW / 2 - 1.4, DW / 2 + 1.4, 11.5, W / 2]) box(.22, H, .16, M.acciaio, x, H / 2, ZF + .06);  // lesene
  const vetroScuro = new THREE.MeshStandardMaterial({ color: 0x0d1117, roughness: .08, metalness: .6, envMapIntensity: 1.4 });
  for (const sx of [-1, 1]) { const x0 = DW / 2 + 1.7, x1 = W / 2 - .3, cx = sx * (x0 + x1) / 2, w = x1 - x0;   // finestre alte ai lati dell'insegna
    if (Math.abs(cx) < 5.6) continue;
    box(w, 1.5, .06, vetroScuro, cx, 7.45, ZF + .04, 0, false); box(w, .1, .12, M.acciaio, cx, 6.7, ZF + .07, 0, false); box(w, .1, .12, M.acciaio, cx, 8.2, ZF + .07, 0, false);
    for (let x = x0; x <= x1 + .01; x += 1.6) box(.07, 1.5, .1, M.acciaio, sx * x, 7.45, ZF + .07, 0, false); }
  const pensilina = box(DW + 2.4, .14, 1.7, M.acciaio, 0, 5.55, ZF + .85);               // pensilina sopra il portone
  const ledP = mesh(new THREE.BoxGeometry(DW + 2, .02, .06), M.led, 0, 5.47, ZF + 1.55, 0, false, false);
  const pietraF = new THREE.MeshStandardMaterial({ color: 0x8e8a83, roughness: .9 });
  for (const x of [-4.7, 4.7]) box(1.6, .7, .7, pietraF, x, .35, ZF + .9);              // fioriere (le piante più sotto)
  const righe = new THREE.MeshStandardMaterial({ color: 0xe9e7e1, roughness: .8 });
  for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) { const x = sx * (6.5 + i * 2.6); const r = mesh(new THREE.PlaneGeometry(.12, 5), righe, x, .008, Z1 + 7.6, 0, false, true); r.rotation.x = -Math.PI / 2; }
  for (const sx of [-1, 1]) { const r = mesh(new THREE.PlaneGeometry(13.1, .12), righe, sx * 13.0, .008, Z1 + 10.1, 0, false, true); r.rotation.x = -Math.PI / 2; }
  out.mat.ledPensilina = M.led;
  const insegnaTex = tl.load('tex/logo/insegna.png'); insegnaTex.colorSpace = THREE.SRGBColorSpace; insegnaTex.anisotropy = 8;
  const insegna = new THREE.Mesh(new THREE.BoxGeometry(10.6, 2.79, .2), [M.acciaio, M.acciaio, M.acciaio, M.acciaio, new THREE.MeshStandardMaterial({ map: insegnaTex, emissiveMap: insegnaTex, emissive: 0xffffff, emissiveIntensity: 1.6, roughness: .4 }), M.acciaio]);
  insegna.position.set(0, 7.3, Z1 + .4); scene.add(insegna); out.mat.insegna = insegna.material[4];
  const serranda = new THREE.Group(); serranda.position.set(0, 0, Z1 + .05);
  const telo = new THREE.Mesh(new THREE.PlaneGeometry(DW, DH), M.serranda); telo.position.y = DH / 2; telo.receiveShadow = true; serranda.add(telo);
  const teloInt = telo.clone(); teloInt.rotation.y = Math.PI; serranda.add(teloInt);
  scene.add(serranda); out.anim.serranda = serranda;
  box(DW + .4, .44, .46, M.acciaio, 0, DH + .25, Z1 + .53);   // cassonetto della serranda, tutto fuori dal capannone
  // luci sotto la pensilina
  for (const x of [-2.4, 2.4]) { const l = new THREE.SpotLight(0xfff1dc, 0, 14, deg(55), .6, 1.4); l.position.set(x, 5.4, ZF + 1.2); l.target.position.set(x, 0, Z1 + 3); scene.add(l, l.target); (out.luci.porta ||= []).push(l); }

  // fari a terra che illuminano la facciata di notte
  for (const x of [-13, -7.5, 7.5, 13]) { if (!mobile) { const l = new THREE.SpotLight(0xffe2bf, 0, 16, deg(28), .7, 1.2); l.position.set(x, .3, Z1 + 2.2); l.target.position.set(x, 8, Z1 + .3); scene.add(l, l.target); (out.luci.porta ||= []).push(l); }
    box(.3, .14, .3, M.acciaio, x, .07, Z1 + 2.2, 0, false); }
  const marciapiede = mesh(new THREE.PlaneGeometry(W + 4, 4), new THREE.MeshStandardMaterial({ map: chiaro('tex/smooth_concrete_floor_diffuse.jpg', [10, 1], 'grayscale(1) brightness(1.2)'), roughness: .9, color: 0xb9b8b4 }), 0, .005, Z1 + 2.3, 0, false, true); marciapiede.rotation.x = -Math.PI / 2;
  // interruttore della luce accanto al portone (dentro)
  const sw = new THREE.Group(); sw.position.set(3.4, 1.35, Z1 - .02);
  const plate = new THREE.Mesh(new THREE.BoxGeometry(.14, .2, .02), new THREE.MeshStandardMaterial({ color: 0xe8e6e1, roughness: .5 })); sw.add(plate);
  const lever = new THREE.Mesh(new THREE.BoxGeometry(.04, .07, .03), new THREE.MeshStandardMaterial({ color: 0x1b1c1f, roughness: .4 })); lever.position.z = -.02; sw.add(lever);
  sw.rotation.y = Math.PI; scene.add(sw); tag(sw, 'interruttore'); out.anim.leva = lever;

  // ------------------------------------------------------------ arredi (coordinate reali in metri: x -17..17, z -13.6 fondo .. 13.6 portone)
  const R = { c: (m, hex) => { m.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.color.multiply(new THREE.Color(hex)); } }); } };
  async function put(file, pos, ry = 0, opt = {}) {
    // se un modello non si carica, il laboratorio si apre lo stesso (senza quell'oggetto)
    const g = await gltf(file).catch(e => { console.warn('Modello non caricato:', file, e); return { scene: new THREE.Group() }; });
    const o = g.scene;
    o.position.set(...pos); o.rotation.y = deg(ry); if (opt.s) o.scale.setScalar(opt.s);
    o.traverse(m => { if (m.isMesh) { m.castShadow = opt.cast !== false; m.receiveShadow = true; if (m.material && m.material.map) m.material.map.anisotropy = 8; } });
    if (opt.tint) R.c(o, opt.tint);
    if (opt.punto) tag(o, opt.punto);
    (opt.in || scene).add(o); return o;
  }
  const SM = 'modelli/su-misura/', DL = 'modelli/';
  const jobs = [];
  const add = (...a) => { const p = put(...a); jobs.push(p); return p; };
  const gruppo = (x, z, ry = 0) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = deg(ry); scene.add(g); return g; };
  // piante: foglie visibili da entrambi i lati
  const pianta = (file, pos, ry = 0, s = 1) => add(file, pos, ry, { s }).then(o => { o.traverse(m => { if (m.isMesh) (Array.isArray(m.material) ? m.material : [m.material]).forEach(x => {
    if (/foglia|fronde|secche|leaf|leaves/i.test(x.name + m.name)) x.side = THREE.DoubleSide;
    if (x.name === 'tronco_palma') { x.color.set(0x3b2c20); x.roughness = .95; } }); }); return o; });

  // ===== CENTRO: salottino, con la camera della panoramica sopra
  const LX = 0, LZ = 1.5;
  add(SM + 'tappeto-tondo.glb', [LX, 0, LZ], 0, { cast: false, punto: 'salottino' });
  add(SM + 'divano-curvo.glb', [LX, 0, LZ], 180, { punto: 'salottino' });
  add(SM + 'tavolino-tondo.glb', [LX, 0, LZ + .17], 0, { punto: 'salottino' });
  add(SM + 'tavolino-laterale.glb', [LX + 2.0, 0, LZ - 1.25], 0, { punto: 'salottino' });
  add(DL + 'poltrona-eames.glb', [LX - 1.32, 0, LZ + 1.91], 160, { punto: 'salottino' });
  add(DL + 'poltrona-barcelona.glb', [LX + 1.32, 0, LZ + 1.96], -165, { punto: 'salottino' });
  add(DL + 'lampada-arco.glb', [LX - 2.0, 0, LZ + 1.38], 0, { punto: 'salottino' }).then(o => {   // tolgo il pezzo di pavimento incluso nel modello
    o.traverse(m => { if (m.isMesh) { const b = new THREE.Box3().setFromObject(m), s = b.getSize(new THREE.Vector3()); if (s.y < .06 && Math.max(s.x, s.z) > 1.2) m.visible = false; } });
  });
  add(DL + 'vasi.glb', [LX + .26, .385, LZ + .21], 20, { s: .7 });
  const RY = 2.6, RS = .58;   // anello luminoso sospeso sopra il salottino
  add(SM + 'lampada-cerchio.glb', [LX, RY, LZ], 0, { cast: false, s: RS }).then(o => {
    o.traverse(m => { if (m.isMesh && m.material.emissive && m.material.emissiveIntensity > 0) out.mat.cerchio = m.material; });
    // i cavi del modello arrivano a 3.2: li sostituisco con linee sottili fino al soffitto (da vicino non diventano barre nere)
    o.traverse(m => { if (m.isMesh) { const b = new THREE.Box3().setFromObject(m), sz = b.getSize(new THREE.Vector3()); if (sz.y > 1 && Math.max(sz.x, sz.z) < .1) m.visible = false; } });
    const top = (H - .05 - RY) / RS, pts = [];
    for (let a = 0; a < 3; a++) { const ang = a * Math.PI * 2 / 3 + Math.PI / 2; pts.push(Math.cos(ang) * 3, 0, -Math.sin(ang) * 3, Math.cos(ang) * 3, top, -Math.sin(ang) * 3); }
    const cavi = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)), new THREE.LineBasicMaterial({ color: 0x2a2b2e, transparent: true, opacity: .7 }));
    cavi.userData.senzaOmbra = true; o.add(cavi);
  });
  pianta(SM + 'kentia.glb', [LX - 3.9, 0, LZ - 1.5], 20); pianta(SM + 'ficus.glb', [LX + 3.9, 0, LZ - 1.4], 70, 1.1);

  // ===== CENTRO, verso l'ingresso: formazione continua (comune ai tre mestieri)
  const fc = gruppo(0, 9.0, 180);
  add(SM + 'parete-attestati.glb', [0, 0, 0], 0, { punto: 'attestati', in: fc }).then(o => {
    o.traverse(m => {
      if (!m.isMesh) return;
      const k = m.name.match(/foglio_(\d\d)/);
      if (k) { const a = ATTESTATI[+k[1]]; if (a) { uvPiano(m); m.material = new THREE.MeshStandardMaterial({ roughness: .85 }); testo(m, L => attestatoTex(a[L], SCRITTE.attestato[L])); } }
      if (m.name.includes('attestati_led')) out.mat.ledAttestati = m.material;
    });
  });
  { // sul retro, verso il portone: il logo
    const t = tl.load('tex/logo/insegna.png'); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    const l = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.6 / 3.8), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: .5, polygonOffset: true, polygonOffsetFactor: -2 }));
    l.position.set(0, 2.5, -.142); l.rotation.y = Math.PI; fc.add(l);
    for (const x of [-1.9, 1.9]) { const a = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .5, 8), M.acciaio); a.position.set(x, 4.38, .0); fc.add(a); }   // aste del cartello
  }

  // ===== FUORI ORARIO (sinistra, verso il portone): boulder e SUP
  add(SM + 'boulder.glb', [-16.87, 0, 3.4], 90, { punto: 'boulder' }).then(o => {
    // prese colorate a blocchi, come nelle palestre
    const C = { presa_rosa: 0xe8318f, presa_verde: 0x2fa84f, presa_blu: 0x1f5fd6, presa_gialla: 0xf2c230, presa_nera: 0x1d1d1f, presa_bianca: 0xeeeeea, presa_arancio: 0xff6a1a };
    // compensato di betulla chiaro e pannelli neri, entrambi con la griglia dei fori dei T-nut (uno ogni 20 cm)
    const pannello = (chiaro) => { const t = canvasTex(1200, 1200, (g, w) => {
      g.fillStyle = chiaro ? '#d8bb8e' : '#1b1b1d'; g.fillRect(0, 0, w, w);
      if (chiaro) for (let i = 0; i < 160; i++) { const y0 = Math.random() * w, a = 6 + Math.random() * 22, f = .004 + Math.random() * .01; g.strokeStyle = Math.random() < .5 ? 'rgba(150,110,60,.18)' : 'rgba(255,240,210,.2)'; g.lineWidth = 1 + Math.random() * 4;
        g.beginPath(); for (let x = 0; x <= w; x += 12) g.lineTo(x, y0 + Math.sin(x * f + i) * a); g.stroke(); }
      else for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * .025})`; g.fillRect(Math.random() * w, Math.random() * w, 2, 2); }
      for (let x = 100; x < w; x += 200) for (let y = 100; y < w; y += 200) { g.fillStyle = chiaro ? '#8a7a62' : '#38383c'; g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); g.fillStyle = chiaro ? '#2d2620' : '#050506'; g.beginPath(); g.arc(x, y, 5.5, 0, 7); g.fill(); }
      for (let x = 0; x < w; x += 600) { g.fillStyle = chiaro ? 'rgba(90,60,30,.35)' : 'rgba(0,0,0,.6)'; g.fillRect(x, 0, 3, w); }   // giunti tra i pannelli
    }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
    const chiaro = new THREE.MeshStandardMaterial({ map: pannello(true), roughness: .78 }), scuro = new THREE.MeshStandardMaterial({ map: pannello(false), roughness: .7 });
    o.traverse(m => { if (!m.isMesh) return;
      if (m.name.startsWith('boulder_pannelli')) m.material = chiaro;
      if (m.name.startsWith('boulder_neri')) m.material = scuro;
      for (const k in C) if (m.name.startsWith(k)) { m.material = m.material.clone(); m.material.color.set(C[k]); m.material.roughness = .82; } });
    const d = new THREE.Mesh(new THREE.PlaneGeometry(2.0, .25), new THREE.MeshStandardMaterial({ transparent: true, roughness: .6, polygonOffset: true, polygonOffsetFactor: -2 }));
    d.position.set(.03, .19, 3.08); o.add(d);   // scritta stampata sul bordo dei materassi
    testo(d, L => canvasTex(2048, 256, g => { const [a, b] = SCRITTE.boulder[L]; g.fillStyle = '#ece8e1'; g.font = '800 170px Archivo'; g.fillText(a, 30, 190); g.fillStyle = '#ff7a3f'; g.font = 'italic 150px "Instrument Serif"'; g.fillText(b, 900, 190); }));
  });
  { // SUP in piedi sulla coda, appoggiato al muro: fondo e pinne verso la stanza
    const g = new THREE.Group(); g.position.set(-16.45, 0, 8.4); g.rotation.z = .12; scene.add(g);
    jobs.push(put(SM + 'sup-tavola.glb', [0, 0, 0], 0, { punto: 'sup' }).then(o => {
      scene.remove(o); o.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(V(0, 1, 0), V(-1, 0, 0), V(0, 0, 1))); o.position.set(0, 1.605, 0); g.add(o);
      o.traverse(m => { if (!m.isMesh) return;
        if (m.name.includes('sup_fondo')) { uvPiano(m); m.material = new THREE.MeshStandardMaterial({ roughness: .35, map: canvasTex(1024, 256, (c, w, h) => {
          c.fillStyle = '#14213d'; c.fillRect(0, 0, w, h); c.fillStyle = '#1f9c93'; c.beginPath(); c.moveTo(w * .18, 0); c.lineTo(w * .52, 0); c.lineTo(w * .4, h); c.lineTo(w * .06, h); c.fill();
          c.fillStyle = '#f4f1ea'; c.fillRect(0, h * .47, w, h * .06); c.fillStyle = '#ff5b1f'; c.beginPath(); c.moveTo(w * .56, 0); c.lineTo(w * .6, 0); c.lineTo(w * .48, h); c.lineTo(w * .44, h); c.fill();
          c.fillStyle = 'rgba(244,241,234,.85)'; c.font = '800 44px Archivo'; c.fillText("10'6\"", w * .72, h * .4); }) }); }
        if (m.name.includes('sup_ponte')) { uvPiano(m); const t = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#1d1f22'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(0,0,0,.55)'; c.lineWidth = 3;
          for (let i = -h; i < w + h; i += 18) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + h, h); c.stroke(); c.beginPath(); c.moveTo(i + h, 0); c.lineTo(i, h); c.stroke(); } c.fillStyle = '#1f9c93'; c.fillRect(0, h * .9, w, h * .04); });
          m.material = new THREE.MeshStandardMaterial({ map: t, roughness: .95 }); }
      });
    }));
    const p = new THREE.Group(); p.position.set(-16.66, 0, 9.45); p.rotation.z = .15; scene.add(p);   // pagaia
    const nero = new THREE.MeshStandardMaterial({ color: 0x151618, roughness: .35, metalness: .2 });
    const asta = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, 1.95, 16), nero); asta.position.y = 1.0; p.add(asta);
    const pala = new THREE.Mesh(new THREE.BoxGeometry(.21, .46, .014), new THREE.MeshStandardMaterial({ color: 0x1f9c93, roughness: .4 })); pala.position.y = .25; p.add(pala);
    const t = new THREE.Mesh(new THREE.BoxGeometry(.13, .03, .035), nero); t.position.y = 1.98; p.add(t);
    p.traverse(m => { if (m.isMesh) m.castShadow = true; }); tag(p, 'sup');
  }
  // angolo caffè sulla parete del portone, con un tavolo alto: è la pausa del fuori orario
  add(SM + 'angolo-caffe.glb', [-10.4, 0, Z1 - .33], 180);
  add(SM + 'tavolo-alto.glb', [-10.2, 0, 10.6], 0);
  add(DL + 'sgabello.glb', [-10.9, 0, 10.0], 30); add(DL + 'sgabello.glb', [-9.5, 0, 11.1], -20);
  add(DL + 'poltrona-eames.glb', [-13.6, 0, 9.4], 200); add(SM + 'tavolino-laterale.glb', [-12.7, 0, 8.6], 0);
  add(SM + 'bacheca.glb', [-5.0, 0, 10.4], 150, { punto: 'bacheca' }).then(o => { o.traverse(m => { if (m.isMesh && m.name.includes('bacheca_fronte')) { out.anim.bacheca = uvPiano(m); m.material = new THREE.MeshStandardMaterial({ roughness: .9 }); testo(m, L => bachecaTex(L)); } }); });
  pianta(SM + 'kentia.glb', [-15.9, 0, 12.7], 40, 1.2); pianta(DL + 'monstera.glb', [-7.2, 0, 12.8], 10, 1.7); pianta(SM + 'ficus.glb', [-3.7, 0, 12.8], 200, 1.15);
  pianta(SM + 'kentia.glb', [-8.2, 0, 7.6], 120, 1.05);   // fuori dalla vista del boulder

  // ===== 01 IN QUOTA (sinistra, verso il fondo)
  add(SM + 'struttura.glb', [-10.2, 0, -10.9], 0, { punto: 'struttura' });
  add(SM + 'tripode.glb', [-9.4, 0, -5.0], 20, { punto: 'tripode' });
  add(SM + 'tavolo-polaroid.glb', [-12.8, 0, -2.4], 8, { punto: 'polaroid' });
  add(DL + 'sedie-tolix.glb', [-12.55, 0, -1.55], 190, { tint: 0x55575c });
  add(DL + 'sedia-eames.glb', [-13.5, 0, -3.25], -10);
  add(SM + 'schermo-verticale.glb', [-6.3, 0, -3.4], 38, { punto: 'videoquota' }).then(o => { o.traverse(m => { if (m.isMesh && m.name.includes('video_schermo')) out.schermi.video = uvPiano(m); }); });
  add(SM + 'scaffale-quota.glb', [-16.45, 0, -1.4], 90);
  add(SM + 'caschi-imbraghi.glb', [-16.87, 0, -4.8], 90);
  add(DL + 'carrello-attrezzi.glb', [-15.9, 0, -11.6], 80, { tint: 0x3a3c40 });
  add(DL + 'cassetta.glb', [-6.9, 0, -.9], 20, { tint: 0x2a2a2c }); add(DL + 'cassetta.glb', [-6.85, .26, -.95], 35, { tint: 0x2a2a2c });
  pianta(SM + 'kentia.glb', [-16.1, 0, -7.6], 0); pianta(DL + 'monstera.glb', [-4.6, 0, -.6], 60, 1.3);

  // ===== 02 IN LUCE (fondo, al centro e a destra)
  add(SM + 'parete-attrezzatura.glb', [-.5, 0, -13.45], 0, { punto: 'macchina' }).then(o => {
    // pannello forato a fessure, con un LED viola dietro che si vede attraverso i fori
    const [pm, pe] = pegTex();
    o.traverse(m => { if (!m.isMesh) return;
      if (m.name.includes('parete_pannello')) { uvPiano(m); m.material = new THREE.MeshStandardMaterial({ map: pm, emissiveMap: pe, emissive: 0xffffff, emissiveIntensity: .6, roughness: .7, metalness: .2 }); out.mat.pannelloForato = m.material; }
      for (const x of Array.isArray(m.material) ? m.material : [m.material]) {
        if (x.name === 'led_rosa') { x.emissive.set(0xff3fa4); out.mat.ledRosa = x; } if (x.name === 'led_viola') { x.emissive.set(0x9a4dff); out.mat.ledViola = x; } }
    });
  });
  if (!mobile) { out.luci.luce = [];   // luci rosa e viola: due lavano il pannello forato, due salgono sulle foto e sulla scritta
    for (const [col, x, y, z, rx, w] of [[0x9a4dff, -2.0, 3.0, -12.3, -.6, 3.2], [0xff3fa4, 1.0, 3.0, -12.3, -.6, 3.2], [0xff3fa4, -2.8, 3.6, -12.95, .35, 3.4], [0x9a4dff, 1.8, 3.6, -12.95, .35, 3.4]]) {
      const l = new THREE.RectAreaLight(col, 0, w, .3); l.position.set(x, y, z); l.rotation.x = rx; scene.add(l); out.luci.luce.push(l); }
  }
  // grandi stampe delle mie foto sopra la parete attrezzatura
  ['galleria-01.jpg', 'galleria-03.jpg', 'galleria-05.jpg', 'galleria-07.jpg'].forEach((f, i) => {
    const g = new THREE.Group(); g.position.set(-3.125 + i * 1.75, 4.25, Z0 + .06); scene.add(g);
    const fr = new THREE.Mesh(new THREE.BoxGeometry(1.37, 1.67, .05), M.acciaio); g.add(fr);
    const t = tl.load('foto/' + f); t.colorSpace = THREE.SRGBColorSpace;
    const ph = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.55), new THREE.MeshStandardMaterial({ map: t, roughness: .55 })); ph.position.z = .027; g.add(ph); tag(g, 'luce');
  });
  // scrivania
  const X0d = -.6, Z0d = -10.2;
  add(SM + 'scrivania.glb', [X0d, 0, Z0d], 0, { punto: 'scrivania' });
  add(SM + 'monitor.glb', [X0d, .76, Z0d - .19], 0, { punto: 'scrivania' }).then(o => { o.traverse(m => { if (m.isMesh && m.name.includes('monitor_schermo')) out.schermi.monitor = uvPiano(m); }); });
  add(SM + 'tastiera.glb', [X0d - .05, .76, Z0d + .15], 0, { punto: 'scrivania' });
  add(SM + 'smartphone.glb', [X0d + .55, .76, Z0d + .27], 22, { punto: 'telefono' }).then(o => { out.anim.telefono = o; o.traverse(m => { if (m.isMesh && m.name.includes('telefono_schermo')) out.schermi.telefono = uvPiano(m); }); });
  add(DL + 'lampada-scrivania.glb', [X0d - .72, .76, Z0d - .21], 35, { punto: 'scrivania' });
  add(DL + 'pianta-piccola.glb', [X0d + .77, .76, Z0d - .27], 0);
  add(DL + 'cartellina.glb', [X0d - .51, .762, Z0d + .21], -18);
  add(DL + 'sedia-ufficio.glb', [X0d + .04, 0, Z0d + .81], 172);
  add(SM + 'softbox-tondo.glb', [X0d + 2.1, 0, Z0d - 1.0], -66).then(o => { o.traverse(m => { if (m.isMesh && m.name.includes('softbox_luce')) out.mat.softbox = m.material; }); });
  add(DL + 'softbox.glb', [-4.4, 0, -11.0], 55);
  // la macchina fotografica in vetrina: piedistallo in pietra chiara con luce dall'alto
  const plinto = new THREE.Group(); plinto.position.set(-3.0, 0, -9.2); scene.add(plinto);
  const pietra = new THREE.MeshStandardMaterial({ color: 0xcfc8bb, roughness: .7 });
  const pb = new THREE.Mesh(new THREE.BoxGeometry(.46, 1.02, .46), pietra); pb.position.y = .51; pb.castShadow = pb.receiveShadow = true; plinto.add(pb);
  const pt = new THREE.Mesh(new THREE.BoxGeometry(.5, .03, .5), pietra); pt.position.y = 1.035; pt.castShadow = pt.receiveShadow = true; plinto.add(pt);
  const pz = new THREE.Mesh(new THREE.BoxGeometry(.48, .04, .48), M.acciaio); pz.position.y = .02; plinto.add(pz);
  if (!mobile) { const spot = new THREE.SpotLight(0xfff2e0, 7, 6, deg(16), .6, 1.4); spot.position.set(0, 4.2, .9); spot.target.position.set(0, 1.05, 0); plinto.add(spot, spot.target); out.luci.vetrina = spot; }
  tag(plinto, 'macchina');
  add(DL + 'macchina-foto.glb', [-3.0, 1.05, -9.2], 32, { punto: 'macchina', s: 1.35 });
  // stampante su una madia, girata verso il centro
  const md = gruppo(2.7, -9.4, -18);
  add(SM + 'mobile-stampante.glb', [0, 0, 0], 0, { punto: 'stampante', in: md });
  add(DL + 'pianta-piccola.glb', [.36, .72, -.07], 0, { in: md });
  add(SM + 'stampante.glb', [-.25, .72, 0], 0, { punto: 'stampante', in: md }).then(o => { out.anim.stampante = o; o.traverse(m => { if (m.isMesh && (m.name.includes('stampante_display') || (m.material && m.material.name === 'schermo'))) out.schermi.stampante = uvPiano(m); }); });
  pianta(SM + 'kentia.glb', [3.75, 0, -12.95], 120, .95);
  // tavolo della consulenza: comunicazione, social e progetti dei siti
  add(SM + 'tappeto.glb', [2.8, 0, -4.7], 0, { cast: false, s: .95 });
  add(SM + 'tavolo-polaroid.glb', [2.8, 0, -4.7], 0, { punto: 'consulenza', s: 1.12 }).then(o => o.traverse(m => { if (m.isMesh && /corda|alluminio|arancio|quaderno|carta/.test(m.material.name)) m.visible = false; }));
  add(DL + 'sedia-eames.glb', [2.2, 0, -5.55], 0, { punto: 'consulenza' }); add(DL + 'sedia-eames.glb', [3.4, 0, -5.55], 10, { punto: 'consulenza' });
  add(DL + 'sedia-eames.glb', [2.2, 0, -3.85], 180, { punto: 'consulenza' }); add(DL + 'sedia-eames.glb', [3.4, 0, -3.85], 170, { punto: 'consulenza' });
  { const carta = new THREE.MeshStandardMaterial({ color: 0xf2f1ec, roughness: .9 }), nero = new THREE.MeshStandardMaterial({ color: 0x1a1a1c, roughness: .4, metalness: .3 });
    const pc = new THREE.Group(); pc.position.set(2.6, .86, -4.85); pc.rotation.y = .2; scene.add(pc);   // portatile aperto
    const base = new THREE.Mesh(new THREE.BoxGeometry(.32, .012, .22), nero); pc.add(base);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(.32, .21, .008), nero); lid.position.set(0, .105, -.11); lid.rotation.x = -.18; pc.add(lid);
    for (const [x, z, r] of [[3.3, -4.6, .3], [3.15, -4.45, -.2], [2.1, -4.5, .1]]) { const f = new THREE.Mesh(new THREE.BoxGeometry(.21, .003, .297), carta); f.position.set(x, .862, z); f.rotation.y = r; scene.add(f); }
    tag(pc, 'consulenza'); }
  // il cinema: telo grande, proiettore appeso e due poltrone
  add(SM + 'proiettore.glb', [6.6, 0, -13.53], 0, { punto: 'tv', s: 1.15 }).then(o => {
    o.traverse(m => { if (m.isMesh && m.name.includes('proiettore_schermo')) out.schermi.tv = uvPiano(m); });
  });
  add(SM + 'videoproiettore.glb', [6.6, 3.35, -9.6], 180, { punto: 'tv' }).then(o => { out.anim.proiettore = o; });
  add(DL + 'poltrona-barcelona.glb', [5.6, 0, -8.4], 180, { punto: 'tv' }); add(DL + 'poltrona-barcelona.glb', [7.6, 0, -8.4], 180, { punto: 'tv' });
  // la sala posa: fondale grande contro la parete destra, due luci, sgabello e carrello
  add(SM + 'fondale.glb', [14.6, 0, -10.2], -90, { punto: 'set' });
  add(DL + 'softbox.glb', [11.4, 0, -12.5], 36, { punto: 'set' });
  add(SM + 'softbox-tondo.glb', [11.4, 0, -7.9], 144, { punto: 'set' });
  add(DL + 'sgabello.glb', [13.0, 0, -10.2], 0, { punto: 'set' });
  add(DL + 'carrello-set.glb', [15.6, 0, -4.4], -70, { tint: 0x3a3c40 });
  pianta(SM + 'kentia.glb', [16.1, 0, -6.1], 200, 1.15); pianta(SM + 'ficus.glb', [16.1, 0, -1.3], 20, 1.1); pianta(DL + 'monstera.glb', [12.4, 0, -1.0], 40, 1.5);

  // ===== 03 IN CURA (davanti a destra): portoni del garage sulla parete destra, attrezzatura sulla parete del portone
  add(SM + 'barella-118.glb', [11.9, 0, 8.7], 0, { punto: 'barella' });
  add(SM + 'bombole.glb', [11.0, 0, 7.3], 0, { punto: 'barella' });
  add(SM + 'manichino.glb', [7.2, 0, 11.1], 180, { punto: 'radio' });
  { // area di manovra davanti ai portoni: strisce gialle a 45° e scritta a terra, come nei garage veri
    const tx = L => canvasTex(512, 1024, (g, w, h) => { g.strokeStyle = 'rgba(232,186,20,.92)'; g.lineWidth = 34;
      for (let y = -w; y < h + w; y += 110) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + w); g.stroke(); }
      g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = 'rgba(20,20,22,.88)'; g.fillRect(70, h / 2 - 70, w - 140, 140);
      g.fillStyle = '#f2c200'; g.font = '800 70px Archivo'; g.textAlign = 'center'; g.fillText(['NON SOSTARE', 'KEEP CLEAR'][L], w / 2, h / 2 + 24); });
    for (const c of porte) { const m = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 5.1), new THREE.MeshStandardMaterial({ transparent: true, roughness: .75, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }));
      m.rotation.set(-Math.PI / 2, 0, -Math.PI / 2); m.position.set(X1 - 1.75, .006, c); m.receiveShadow = true; scene.add(m); testo(m, tx); } }
  const parete = (file, x, y, punto) => add(SM + file, [x, y, Z1 - .02], 180, { punto });   // oggetti appesi alla parete del portone
  parete('teca-dae.glb', 6.6, 1.15, 'radio').then(o => {
    o.traverse(m => { if (!m.isMesh) return;
      (Array.isArray(m.material) ? m.material : [m.material]).forEach(x => { if (x.name === 'vetro_teca') { x.transparent = true; x.opacity = .22; x.depthWrite = false; } });
      if (m.name.includes('teca_cartello')) { uvPiano(m); m.material = new THREE.MeshStandardMaterial({ roughness: .45, map: daeTex() }); } });
  });
  parete('caricatore-radio.glb', 7.8, 1.25, 'radio');
  add(SM + 'armadietti.glb', [10.2, 0, Z1 - .4], 180, { punto: 'vvf' }).then(o => { o.traverse(m => {   // armadietti in lamiera grigia: il ruolo lo dice la targhetta colorata
    if (!m.isMesh) return; const k = m.name.match(/targa_(\d)/);
    if (k) { uvPiano(m); m.material = new THREE.MeshStandardMaterial({ map: targaTex(...[['OSS', '#2fe3c0'], ['SOCCORSO 118', '#ff6a13'], ['VIGILI DEL FUOCO', '#d2322b']][+k[1]]), roughness: .6 }); return; }
    (Array.isArray(m.material) ? m.material : [m.material]).forEach(x => { if (['oss_blu', 'rosso', 'vvf'].includes(x.name)) { x.color.set(0x5d6266); x.metalness = .55; x.roughness = .48; } });
  }); });
  add(SM + 'casco-vvf.glb', [10.8, 1.95, Z1 - .4], 180, { punto: 'vvf' });
  add(DL + 'faro.glb', [9.6, 1.95, Z1 - .4], 160);
  add(SM + 'panca.glb', [13.4, 0, Z1 - .35], 0, { punto: 'borsone' });
  add(SM + 'zaino-118.glb', [12.7, .475, Z1 - .35], 170, { punto: 'borsone' }).then(o => {
    const t = canvasTex(256, 256, (g, w) => { g.fillStyle = '#f4f3ef'; g.fillRect(0, 0, w, w); g.fillStyle = '#1d4fa0'; g.translate(w / 2, w / 2);
      for (let k = 0; k < 3; k++) { g.save(); g.rotate(k * Math.PI / 3); g.fillRect(-26, -96, 52, 192); g.restore(); }
      g.fillStyle = '#fff'; g.fillRect(-5, -70, 10, 140); g.strokeStyle = '#fff'; g.lineWidth = 7; g.beginPath(); g.moveTo(-14, 50); g.bezierCurveTo(22, 30, -22, 0, 14, -20); g.bezierCurveTo(30, -32, -10, -50, 0, -60); g.stroke(); });
    const d = new THREE.Mesh(new THREE.PlaneGeometry(.1, .1), new THREE.MeshStandardMaterial({ map: t, roughness: .6 })); d.position.set(0, .2, .2025); o.add(d); });
  add(SM + 'borsone-oss.glb', [13.6, .475, Z1 - .35], 190, { punto: 'borsone' });
  add(DL + 'cassetta-medica.glb', [14.3, .475, Z1 - .38], 180, { punto: 'borsone' });
  parete('manichette.glb', 15.9, 0, 'vvf');
  add(SM + 'estintore.glb', [5.4, 0, Z1 - .35], 180, { punto: 'vvf' }).then(o => { o.traverse(m => { if (m.isMesh && m.name.includes('etichetta')) { uvPiano(m); m.material = new THREE.MeshStandardMaterial({ roughness: .5, map: canvasTex(260, 400, (g, w, h) => {
    g.fillStyle = '#f2f0ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#c4161c'; g.fillRect(0, 0, w, 86); g.fillStyle = '#fff'; g.font = '800 40px Archivo'; g.textAlign = 'center'; g.fillText('ESTINTORE', w / 2, 58);
    g.fillStyle = '#16171a'; g.font = '700 30px Archivo'; g.fillText('POLVERE ABC', w / 2, 140); g.font = '800 64px Archivo'; g.fillText('6 kg', w / 2, 220);
    [['A', '#2a7d3c'], ['B', '#c4161c'], ['C', '#1d4fa0']].forEach(([l, c], i) => { g.fillStyle = c; g.fillRect(28 + i * 74, 262, 60, 60); g.fillStyle = '#fff'; g.font = '800 40px Archivo'; g.fillText(l, 58 + i * 74, 306); });
    g.fillStyle = '#555'; g.font = '400 16px Archivo'; g.fillText('34A 233BC', w / 2, 360); }) }); } }); });
  { const c = new THREE.Mesh(new THREE.PlaneGeometry(.3, .3), new THREE.MeshStandardMaterial({ roughness: .5, map: canvasTex(256, 256, (g, w) => {
      g.fillStyle = '#c4161c'; g.fillRect(0, 0, w, w); g.fillStyle = '#fff'; g.fillRect(104, 70, 48, 140); g.beginPath(); g.arc(128, 74, 24, Math.PI, 0); g.fill(); g.fillRect(118, 40, 20, 14); g.fillRect(138, 42, 46, 10);
      g.font = '800 26px Archivo'; g.textAlign = 'center'; g.fillText('ESTINTORE', w / 2, 240); }) }));
    c.position.set(5.4, 2.2, Z1 - .02); c.rotation.y = Math.PI; scene.add(c); }
  add(SM + 'divise-stoffa.glb', [9.6, 0, 3.0], 180, { punto: 'divise' }).then(o => { for (const x of [-2, 2]) { const c = new THREE.Mesh(new THREE.BoxGeometry(.008, H - 3.4, .008), M.acciaio); c.position.set(x, 3.4 + (H - 3.4) / 2, 0); o.add(c); } });
  pianta(SM + 'kentia.glb', [3.9, 0, 12.75], 300, 1.1); pianta(DL + 'monstera.glb', [16.2, 0, 12.6], 0, 1.4);

  // ===== FUORI: palme vere davanti alla facciata e kentia nelle fioriere
  for (const [x, ry] of [[-14.6, 10], [-9.3, 120], [9.3, 200], [14.6, 300]]) {
    pianta(SM + 'palma.glb', [x, 0, Z1 + 2.9], ry, 1.05);
    const grata = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, .012, 40), new THREE.MeshStandardMaterial({ color: 0x1c1d1f, metalness: .6, roughness: .5 })); grata.position.set(x, .012, Z1 + 2.9); grata.receiveShadow = true; scene.add(grata);
  }
  for (const x of [-4.7, 4.7]) pianta(SM + 'kentia.glb', [x, .7, Z1 + 1.17], x > 0 ? 30 : 200, 1.1);

  // mezzi parcheggiati nel garage, muso verso il capannone; lampeggianti blu che illuminano il capannone dai portoni
  const blu = new THREE.MeshStandardMaterial({ color: 0x0b2cff, emissive: 0x2050ff, emissiveIntensity: 0, roughness: .3 }); out.mat.lampeggiante = blu;
  const blu2 = blu.clone(); out.mat.lampeggiante2 = blu2;
  const decal = (o, w, h, x, y, z, ry, make) => { const d = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ transparent: true, roughness: .3, polygonOffset: true, polygonOffsetFactor: -2 }));
    d.position.set(x, y, z); d.rotation.y = ry; o.add(d); testo(d, make); return d; };
  add(SM + 'ambulanza.glb', [X1 + 4.75, 0, porte[1]], 180, { punto: 'finestra' }).then(o => {
    o.traverse(m => { if (m.isMesh && m.name.includes('lampeggianti')) m.material = blu; });
    const livrea = L => canvasTex(2048, 560, (g, w, h) => {
      g.fillStyle = '#ff6a13'; g.fillRect(0, 300, w, 120); g.fillStyle = '#1b3a8a'; g.fillRect(0, 420, w, 26);
      for (let x = 0; x < w; x += 64) { g.fillStyle = (x / 64) % 2 ? '#1b3a8a' : '#f4f4f2'; g.fillRect(x, 446, 64, 40); }
      g.fillStyle = '#1b3a8a'; g.font = '800 230px Archivo'; g.fillText('118', 70, 250); g.font = '700 64px Archivo'; g.fillText(['EMERGENZA SANITARIA', 'EMERGENCY MEDICAL SERVICE'][L], 560, 140);
      g.fillStyle = '#ff6a13'; g.font = '600 52px "JetBrains Mono"'; g.fillText(['AMBULANZA DI SOCCORSO', 'RESCUE AMBULANCE'][L], 560, 230); });
    decal(o, 4.1, 1.12, -.9, 1.2, 1.031, 0, livrea); decal(o, 4.1, 1.12, -.9, 1.2, -1.031, Math.PI, livrea);
    decal(o, 1.1, .2, 2.985, 1.04, 0, Math.PI / 2, () => canvasTex(1024, 190, (g, w) => { g.translate(w, 0); g.scale(-1, 1); g.fillStyle = '#1b3a8a'; g.font = '800 150px Archivo'; g.textAlign = 'center'; g.fillText('AMBULANZA', w / 2, 150); }));   // a specchio, per lo specchietto
  });
  add(SM + 'autopompa.glb', [X1 + 4.8, 0, porte[0]], 180, { punto: 'finestra' }).then(o => {
    o.traverse(m => { if (m.isMesh && m.name.includes('lampeggianti')) m.material = blu2; });
    const stemma = L => canvasTex(512, 512, (g, w) => { g.fillStyle = '#f2f0ea'; g.beginPath(); g.arc(w / 2, 210, 150, 0, 7); g.fill(); g.fillStyle = '#b3121b'; g.beginPath(); g.arc(w / 2, 210, 120, 0, 7); g.fill();
      g.fillStyle = '#f2f0ea'; g.beginPath(); g.moveTo(w / 2, 120); g.bezierCurveTo(w / 2 + 70, 190, w / 2 + 40, 290, w / 2, 300); g.bezierCurveTo(w / 2 - 40, 290, w / 2 - 70, 190, w / 2, 120); g.fill();
      g.font = '800 64px Archivo'; g.textAlign = 'center'; g.fillText(['VIGILI', 'FIRE'][L], w / 2, 430); g.fillText(['DEL FUOCO', 'BRIGADE'][L], w / 2, 495); });
    for (const sz of [-1, 1]) decal(o, .6, .6, 2.72, 1.55, sz * 1.232, sz > 0 ? 0 : Math.PI, stemma);
    decal(o, 1.9, .26, 3.785, 1.78, 0, Math.PI / 2, L => canvasTex(1024, 140, (g, w) => { g.fillStyle = '#f2f0ea'; g.font = '800 96px Archivo'; g.textAlign = 'center'; g.fillText(['VIGILI DEL FUOCO', 'FIRE BRIGADE'][L], w / 2, 108); }));
    for (const sz of [-1, 1]) decal(o, 3.2, .34, -1.0, 2.72, sz * 1.245, sz > 0 ? 0 : Math.PI, L => canvasTex(2048, 220, (g, w) => { g.fillStyle = '#f2f0ea'; g.font = '800 170px Archivo'; g.fillText(['VIGILI DEL FUOCO', 'FIRE BRIGADE'][L], 20, 175); }));
  });
  const ambL = new THREE.SpotLight(0x2b5bff, 0, 26, deg(32), .55, 1.1); ambL.position.set(X1 + 3.2, 2.7, porte[1]); ambL.target.position.set(10, 0, porte[1]);
  const vvfL = new THREE.SpotLight(0x2b5bff, 0, 26, deg(32), .55, 1.1); vvfL.position.set(X1 + 1.6, 3.3, porte[0]); vvfL.target.position.set(9, 0, porte[0]);
  for (const l of [ambL, vvfL]) { if (!mobile) { l.castShadow = true; l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -.0006; scene.add(l, l.target); } }   // sui telefoni lampeggiano solo le luci dei mezzi
  out.luci.ambulanza = ambL; out.luci.vvf = vvfL;

  // nastro giallo e nero a terra attorno a In quota
  const haz = canvasTex(512, 64, (g, w, h) => { g.fillStyle = '#f2c200'; g.fillRect(0, 0, w, h); g.fillStyle = '#141414'; for (let x = -h; x < w + h; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 32, 0); g.lineTo(x + 32 + h, h); g.lineTo(x + h, h); g.fill(); } });
  haz.wrapS = THREE.RepeatWrapping;
  const tape = (len, x, z, ry) => { const t = haz.clone(); t.wrapS = THREE.RepeatWrapping; t.repeat.set(len / 1.2, 1); t.needsUpdate = true; const m = new THREE.Mesh(new THREE.PlaneGeometry(len, .12), new THREE.MeshStandardMaterial({ map: t, roughness: .7 })); m.rotation.set(-Math.PI / 2, 0, ry); m.position.set(x, .005, z); m.receiveShadow = true; scene.add(m); };
  tape(12.2, -10.7, -.3, 0); tape(13.3, -4.6, -6.95, Math.PI / 2);

  // riviste sul tavolino: LinkedIn, Instagram, Curriculum (porta alla stampante), Blog
  [['#0a66c2', -.38, -.04, .25, 'salottino'], ['#c13584', -.04, .17, -.2, 'salottino'], ['#16171a', .26, -.17, .1, 'stampante'], ['#ff5b1f', -.26, -.38, -.5, 'salottino']].forEach(([col, x, z, r, punto], i) => {
    const cop = new THREE.MeshStandardMaterial({ roughness: .4 }), carta = new THREE.MeshStandardMaterial({ color: 0xf2f2ee });
    const m = new THREE.Mesh(new THREE.BoxGeometry(.28, .006, .36), [carta, carta, cop, carta, carta, carta]);
    m.position.set(LX + x, .39, LZ + .17 + z); m.rotation.y = r; m.castShadow = true; scene.add(m); tag(m, punto);
    testi.push({ mesh: { material: cop }, make: L => canvasTex(400, 520, (g, w, h) => { const [titolo, sub] = SCRITTE.riviste[L][i];
      g.fillStyle = col; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, h - 120, w, 120);
      g.fillStyle = '#fff'; let fs = 64; g.font = `800 ${fs}px Archivo`; while (g.measureText(titolo).width > w - 50) { fs -= 4; g.font = `800 ${fs}px Archivo`; } g.fillText(titolo, 26, 96);
      g.font = '500 24px "JetBrains Mono"'; g.fillText(sub, 28, 140); g.font = '800 34px Archivo'; g.fillText('MATTIA', 28, h - 70); g.fillText('CRAPANZANO', 28, h - 30); }) });
    cop.map = testi[testi.length - 1].make(lingua);
  });

  // foto stampate sul tavolo (formato polaroid, abbastanza grandi da riconoscerle)
  const fotoQ = ['foto/irata-allenamento-sicurlive.jpg', 'foto/irata-imbrago.jpg', 'foto/quota-capannone.jpg', 'foto/quota-attrezzatura.jpg', 'foto/irata-palestra-sicurlive.jpg'];
  const polM = new THREE.MeshStandardMaterial({ color: 0xeeebe4, roughness: .75 });
  fotoQ.forEach((f, i) => {
    const t = tl.load(f, t => { const a = t.image.width / t.image.height; t.repeat.set(Math.min(1, 1 / a), Math.min(1, a)); t.offset.set((1 - t.repeat.x) / 2, (1 - t.repeat.y) / 2); });   // ritaglio quadrato
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    const g = new THREE.Group(); g.position.set(-12.8 - .64 + i * .306, .776 + i * .0015, -2.4 - .085 + Math.sin(i * 2.1) * .136); g.rotation.y = deg(8 + (i - 2) * 13);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(.2, .002, .245), polM); frame.receiveShadow = true; g.add(frame);
    const ph = new THREE.Mesh(new THREE.PlaneGeometry(.175, .175), new THREE.MeshStandardMaterial({ map: t, roughness: .45 })); ph.rotation.x = -Math.PI / 2; ph.position.set(0, .0018, -.022); g.add(ph);
    scene.add(g); tag(g, 'polaroid');
  });

  await Promise.all(jobs);
  // corde: trama intrecciata (anima e calza) al posto del colore pieno, così si capisce che sono corde
  { const trame = {};
    const trama = (col) => trame[col] ||= (() => { const c = new THREE.Color(col), hex = '#' + c.getHexString(); const chiaro = '#' + c.clone().lerp(new THREE.Color(1, 1, 1), .45).getHexString(), scuro = '#' + c.clone().multiplyScalar(.45).getHexString();
      const t = canvasTex(64, 64, (g, w) => { g.fillStyle = hex; g.fillRect(0, 0, w, w);
        for (let y = 0; y < w; y += 8) for (let x = 0; x < w; x += 8) { const d = ((x + y) / 8) % 2; g.fillStyle = d ? chiaro : scuro; g.globalAlpha = .55; g.beginPath(); g.ellipse(x + 4, y + 4, 4.2, 1.8, d ? .7 : -.7, 0, 7); g.fill(); }
        g.globalAlpha = 1; for (let i = 0; i < 26; i++) { g.fillStyle = i % 2 ? '#f2f0ea' : scuro; g.fillRect(Math.random() * w, Math.random() * w, 2, 2); } });
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; return t; })();
    scene.traverse(m => { if (!m.isMesh || !m.geometry.attributes.uv) return;
      (Array.isArray(m.material) ? m.material : [m.material]).forEach(x => { if (x && /^corda/.test(x.name) && !x.map) { x.map = trama(x.color.getHex()); x.color.set(0xffffff); x.roughness = .92; x.bumpMap = x.map; x.bumpScale = 1.5; x.needsUpdate = true; } }); }); }
  // fascio di luce dall'ottica del proiettore all'immagine sullo schermo (piramide trasparente che sfuma verso lo schermo)
  if (out.anim.proiettore && out.schermi.tv) {
    scene.updateMatrixWorld(true);
    const lente = new THREE.Vector3(-.1, 0, -.23).applyMatrix4(out.anim.proiettore.matrixWorld);   // ottica (il modello guarda verso -Y in Blender = +Z in three.js, ruotato di 180°)
    const b = new THREE.Box3().setFromObject(out.schermi.tv), zS = b.max.z + .002;
    const ang = [[b.min.x, b.min.y], [b.max.x, b.min.y], [b.max.x, b.max.y], [b.min.x, b.max.y]].map(([x, y]) => new THREE.Vector3(x, y, zS));
    const pos = [], t = [];
    for (let i = 0; i < 4; i++) { const a = ang[i], c = ang[(i + 1) % 4]; pos.push(...lente.toArray(), ...a.toArray(), ...c.toArray()); t.push(0, 1, 1); }   // t: 0 alla lente, 1 sul telo
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('t', new THREE.Float32BufferAttribute(t, 1));
    const fm = new THREE.ShaderMaterial({ uniforms: { forza: { value: .03 } }, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
      vertexShader: 'attribute float t; varying float vt; void main(){ vt = t; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform float forza; varying float vt; void main(){ gl_FragColor = vec4(vec3(.85, .9, 1.0) * forza * (1.0 - vt * .8), 1.0); }' });
    const fascio = new THREE.Mesh(geo, fm); fascio.renderOrder = 2; scene.add(fascio); out.mat.fascio = fm;
    // il fascio è solo luce: niente ombre a terra e niente occlusione ambientale (il GTAO salta le linee, quindi lo segno come tale; resta disegnato come mesh)
    fascio.userData.senzaOmbra = true; fascio.isLine = true;
  }
  return out;

  // ------------------------------------------------------------ texture disegnate
  function attestatoTex([t, sub, nota], intest) {
    return canvasTex(420, 540, (g, w, h) => {
      g.fillStyle = '#f6f3ea'; g.fillRect(0, 0, w, h); g.strokeStyle = '#b8a77a'; g.lineWidth = 6; g.strokeRect(18, 18, w - 36, h - 36);
      g.fillStyle = '#8a7a4e'; g.font = '500 20px "JetBrains Mono"'; g.textAlign = 'center'; g.fillText(intest, w / 2, 90);
      g.fillStyle = '#16171a'; let fs = 56; g.font = `800 ${fs}px Archivo`; while (g.measureText(t).width > w - 60) { fs -= 3; g.font = `800 ${fs}px Archivo`; } g.fillText(t, w / 2, 210);
      g.font = '600 30px Archivo'; g.fillText(sub, w / 2, 262); g.fillStyle = '#555'; g.font = '400 22px Archivo'; g.fillText(nota, w / 2, 300);
      g.fillStyle = '#16171a'; g.font = 'italic 34px "Instrument Serif"'; g.fillText('Mattia Crapanzano', w / 2, 400);
      g.strokeStyle = '#999'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(110, 412); g.lineTo(w - 110, 412); g.stroke();
      g.fillStyle = '#c8a64a'; g.beginPath(); g.arc(w - 80, h - 80, 34, 0, 7); g.fill();
    });
  }
  function daeTex() {   // cartello verde del DAE: cuore bianco con il fulmine e la scritta
    return canvasTex(360, 360, (g, w, h) => { g.fillStyle = '#0a8a43'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.beginPath(); const x = w / 2, y = 120;
      g.moveTo(x, y + 100); g.bezierCurveTo(x - 130, y + 10, x - 75, y - 80, x, y - 22); g.bezierCurveTo(x + 75, y - 80, x + 130, y + 10, x, y + 100); g.fill();
      g.fillStyle = '#0a8a43'; g.beginPath(); g.moveTo(x + 8, y - 34); g.lineTo(x - 28, y + 24); g.lineTo(x - 2, y + 24); g.lineTo(x - 12, y + 76); g.lineTo(x + 28, y + 8); g.lineTo(x + 2, y + 8); g.closePath(); g.fill();
      g.fillStyle = '#fff'; g.font = '800 72px Archivo'; g.textAlign = 'center'; g.fillText('DAE', x, 320); });
  }
  function targaTex(ruolo = '', col = '#16171a') { return canvasTex(512, 140, (g, w, h) => { g.fillStyle = '#e9e6dc'; g.fillRect(0, 0, w, h); g.fillStyle = col; g.fillRect(0, 0, 22, h);
    g.fillStyle = '#16171a'; g.textAlign = 'center'; g.font = '800 56px Archivo'; g.fillText('CRAPANZANO', w / 2 + 10, 70); g.fillStyle = col; g.font = '500 26px "JetBrains Mono"'; g.fillText(ruolo, w / 2 + 10, 115); }); }
  function pegTex() {  // fessure verticali sfalsate (tipo Skådis): colore e maschera della luce che passa dai fori
    const fess = (g, w, h, col) => { g.fillStyle = col; for (let x = 20, i = 0; x < w; x += 40, i++) for (let y = (i % 2) * 40 + 14; y < h; y += 80) { g.beginPath(); g.roundRect(x - 5, y, 10, 30, 5); g.fill(); } };
    const m = canvasTex(1024, 384, (g, w, h) => { g.fillStyle = '#1d1e21'; g.fillRect(0, 0, w, h); fess(g, w, h, '#050506'); });
    const e = canvasTex(1024, 384, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); fess(g, w, h, '#7a3dd6'); });
    for (const t of [m, e]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4.4, 4.4 * 2.4 / 6.6 * 1024 / 384); }   // fessure ogni 6 cm circa
    return [m, e];
  }
  function bachecaTex(L) {
    const B = SCRITTE.bacheca[L];
    const c = document.createElement('canvas'); c.width = 2048 * SC; c.height = 1260 * SC; const g = c.getContext('2d'); g.scale(SC, SC); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    // sughero
    g.fillStyle = '#a77a4c'; g.fillRect(0, 0, 2048, 1260);
    for (let i = 0; i < 26000; i++) { g.fillStyle = Math.random() < .5 ? 'rgba(90,55,25,.35)' : 'rgba(210,170,120,.3)'; const s = Math.random() * 3 + .5; g.fillRect(Math.random() * 2048, Math.random() * 1260, s, s); }
    const pin = (x, y, col) => { g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(x + 5, y + 7, 16, 0, 7); g.fill(); g.fillStyle = col; g.beginPath(); g.arc(x, y, 16, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(x - 5, y - 5, 5, 0, 7); g.fill(); };
    const nota = (x, y, w, h, col, righe, rot, size = 44) => { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(8, 10, w, h); g.fillStyle = col; g.fillRect(0, 0, w, h);
      g.fillStyle = '#1a1a1a'; righe.forEach((r, i) => { g.font = (i ? '400 ' : '800 ') + size + 'px Archivo'; g.fillText(r, 26, 70 + i * size * 1.25); }); g.restore(); pin(x + w / 2, y + 22, '#d2322b'); };
    const foto = (src, x, y, w, h, rot, did) => { const i = new Image(); i.onload = () => { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(10, 12, w + 40, h + 110); g.fillStyle = '#f6f4ee'; g.fillRect(0, 0, w + 40, h + 110);
      const s = Math.max(w / i.width, h / i.height), sw = w / s, sh = h / s; g.drawImage(i, (i.width - sw) / 2, (i.height - sh) / 3, sw, sh, 20, 20, w, h); g.fillStyle = '#222'; g.font = 'italic 46px "Instrument Serif"'; g.fillText(did, 30, h + 85); g.restore(); pin(x + (w + 40) / 2, y + 20, '#2f6fd8'); t.needsUpdate = true; }; i.src = src; };
    foto('foto/cartellino.jpg', 90, 110, 380, 460, -.04, B[5][0]);
    foto('foto/soccorritore.jpg', 1560, 90, 340, 420, .05, B[5][1]);
    foto('foto/irata-imbrago.jpg', 1140, 640, 330, 400, -.06, B[5][2]);
    nota(600, 120, 520, 360, '#f7e26b', B[0], .03);
    nota(640, 600, 440, 330, '#9ee3cf', B[1], -.04);
    nota(1160, 140, 340, 300, '#f6b0c8', B[2], .06, 40);
    nota(110, 760, 460, 300, '#ffffff', B[3], .02, 46);
    nota(1580, 700, 360, 280, '#ffb36b', B[4], -.03, 50);
    return t;
  }
}
