// Effetti per una resa più fotografica: ombre di contatto a terra, grana delle superfici, vignettatura e grana della pellicola.
import * as THREE from 'three';
import { HorizontalBlurShader } from 'three/addons/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from 'three/addons/shaders/VerticalBlurShader.js';

// ------------------------------------------------------------ ombre di contatto
// Una "foto" dal basso di tutto ciò che sta vicino al pavimento, sfocata e stesa a terra come ombra morbida.
// Si calcola una volta sola dopo il caricamento (la scena è ferma), quindi non pesa durante la navigazione.
// strati: [altezza massima considerata (m), sfocatura (px), intensità]
export function ombreContatto(renderer, scene, { w, d, y = .016, res = 2048, strati = [[.4, 4, 1.0], [2.2, 30, .55]], salta = () => false }) {
  const rw = res, rh = Math.round(res * d / w);
  const gruppo = new THREE.Group(); gruppo.position.y = y; scene.add(gruppo);
  // durante la "foto" nascondo pavimento, decorazioni piatte e tutto ciò che va saltato
  const nascosti = [];
  scene.traverse(o => {
    if (!o.visible || !o.isMesh) return;
    const b = new THREE.Box3().setFromObject(o), s = b.getSize(new THREE.Vector3());
    if (s.y < .03 || salta(o)) { o.visible = false; nascosti.push(o); }
  });
  const sfondo = scene.background, fog = scene.fog; scene.background = null; scene.fog = null;
  const blurPiano = new THREE.Mesh(new THREE.PlaneGeometry(1, 1)), blurCam = new THREE.OrthographicCamera(-.5, .5, .5, -.5, 0, 1);
  blurPiano.position.z = -.5; blurCam.add(blurPiano);
  const hMat = new THREE.ShaderMaterial(HorizontalBlurShader), vMat = new THREE.ShaderMaterial(VerticalBlurShader);
  hMat.depthTest = vMat.depthTest = false;
  const prima = renderer.getRenderTarget(), alfa = renderer.getClearAlpha(), col = renderer.getClearColor(new THREE.Color());
  for (const [alto, sfoca, buio] of strati) {
    const rt = new THREE.WebGLRenderTarget(rw, rh), rtB = new THREE.WebGLRenderTarget(rw, rh);
    rt.texture.generateMipmaps = rtB.texture.generateMipmaps = false;
    const cam = new THREE.OrthographicCamera(-w / 2, w / 2, d / 2, -d / 2, 0, alto); cam.rotation.x = Math.PI / 2; gruppo.add(cam); cam.updateMatrixWorld(true);
    // più l'oggetto è vicino a terra, più l'ombra è scura
    const prof = new THREE.MeshDepthMaterial(); prof.depthTest = prof.depthWrite = false; prof.side = THREE.DoubleSide;
    prof.onBeforeCompile = sh => { sh.uniforms.buio = { value: buio }; sh.fragmentShader = 'uniform float buio;\n' + sh.fragmentShader.replace('gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );', 'gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * buio );'); };
    scene.overrideMaterial = prof; renderer.setClearColor(0x000000, 0); renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, cam); scene.overrideMaterial = null;
    // sfocatura: tre passate che si stringono, per un bordo morbido ma un nucleo scuro sotto l'oggetto
    for (const f of [1, .55, .3]) {
      blurPiano.material = hMat; hMat.uniforms.tDiffuse.value = rt.texture; hMat.uniforms.h.value = sfoca * f / rw;
      renderer.setRenderTarget(rtB); renderer.render(blurPiano, blurCam);
      blurPiano.material = vMat; vMat.uniforms.tDiffuse.value = rtB.texture; vMat.uniforms.v.value = sfoca * f / rh;
      renderer.setRenderTarget(rt); renderer.render(blurPiano, blurCam);
    }
    rtB.dispose(); prof.dispose();
    const piano = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ map: rt.texture, transparent: true, depthWrite: false, fog: false }));
    piano.scale.y = -1; piano.renderOrder = 1; piano.position.y = .0005 * gruppo.children.length; gruppo.add(piano);
  }
  renderer.setRenderTarget(prima); renderer.setClearColor(col, alfa);
  scene.background = sfondo; scene.fog = fog; nascosti.forEach(o => o.visible = true);
  hMat.dispose(); vMat.dispose();
  return gruppo;
}

// ------------------------------------------------------------ grana delle superfici
// I materiali in tinta unita sembrano plastica perfetta: aggiungo una variazione minima di ruvidità e di rilievo.
let GRANA = null;
function grana() {
  if (GRANA) return GRANA;
  const n = 256, c = document.createElement('canvas'); c.width = c.height = n; const g = c.getContext('2d'), img = g.createImageData(n, n);
  const r = document.createElement('canvas'); r.width = r.height = n; const gr = r.getContext('2d'), imr = gr.createImageData(n, n);
  // rumore a più scale, ripetibile ai bordi
  const val = new Float32Array(n * n);
  for (const [scala, peso] of [[4, .5], [16, .3], [64, .2]]) {
    const gr0 = new Float32Array((scala + 1) * (scala + 1)).map(() => Math.random());
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const fx = x / n * scala, fy = y / n * scala, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
      const at = (a, b) => gr0[(b % scala) * (scala + 1) + (a % scala)];
      const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      val[y * n + x] += peso * ((at(x0, y0) * (1 - sx) + at(x0 + 1, y0) * sx) * (1 - sy) + (at(x0, y0 + 1) * (1 - sx) + at(x0 + 1, y0 + 1) * sx) * sy);
    }
  }
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const i = y * n + x, dx = val[y * n + (x + 1) % n] - val[y * n + (x + n - 1) % n], dy = val[((y + 1) % n) * n + x] - val[((y + n - 1) % n) * n + x];
    img.data[i * 4] = 128 + dx * 160; img.data[i * 4 + 1] = 128 + dy * 160; img.data[i * 4 + 2] = 255; img.data[i * 4 + 3] = 255;
    const v = 200 + (val[i] - .5) * 90; imr.data[i * 4] = imr.data[i * 4 + 1] = imr.data[i * 4 + 2] = v; imr.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0); gr.putImageData(imr, 0, 0);
  const nm = new THREE.CanvasTexture(c), rm = new THREE.CanvasTexture(r);
  for (const t of [nm, rm]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); t.anisotropy = 4; }
  return (GRANA = { nm, rm });
}
export function aggiungiGrana(oggetto) {
  const { nm, rm } = grana();
  oggetto.traverse(m => {
    if (!m.isMesh || !m.geometry.attributes.uv) return;   // senza coordinate UV la mappa darebbe artefatti
    for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
      if (!mat || !mat.isMeshStandardMaterial || mat.map || mat.normalMap || mat.roughnessMap || mat.emissiveIntensity > .5 || mat.transparent) continue;
      if (mat.userData.grana) continue; mat.userData.grana = 1;
      mat.normalMap = nm; mat.normalScale = new THREE.Vector2(.18, .18); mat.roughnessMap = rm; mat.needsUpdate = true;
    }
  });
}

// ------------------------------------------------------------ vignettatura e grana della pellicola (ultimo passaggio)
export const PellicolaShader = {
  uniforms: { tDiffuse: { value: null }, tempo: { value: 0 }, vignetta: { value: .28 }, grana: { value: .028 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float tempo, vignetta, grana; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + tempo) * 43758.5453); }
    void main(){ vec4 c = texture2D(tDiffuse, vUv); vec2 d = vUv - .5; float v = 1.0 - vignetta * smoothstep(.25, .85, dot(d, d) * 2.2);
      c.rgb *= v; c.rgb += (h(vUv * 1000.0) - .5) * grana; gl_FragColor = c; }`,
};
