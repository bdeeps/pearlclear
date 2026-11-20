// Shared parts for PearlClear: materials (pearl and nacre use three.js thin-film iridescence), a pearl
// oyster drawn procedurally (two valves, mantle, gills, adductor muscle, foot and body), flat canvas
// panels for charts, and the thin-film maths used by the "Why it shines" chapter.
// Everything is drawn in code: no images, models or data from anyone else.
import { THREE, M, sphere, tube, canvasTexture, clamp, lerp, smooth } from './kit.js';

export { THREE, M, sphere, tube, canvasTexture, clamp, lerp, smooth };
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const COL = { lime: 0xa3e635, amber: 0xffb547, coral: 0xff7a59, cyan: 0x8ef0ff, violet: 0xc49bff, sea: 0x0a1a24, shellOut: 0x6d5a45, shellOut2: 0x3f3328, mantle: 0xd8957e, gill: 0xc9906e, muscle: 0xf1e3cf, body: 0xd9a58a, tissue: 0xe9a99a, cell: 0xa3e635, bead: 0xf2efe6 };
export const hex = (n) => '#' + n.toString(16).padStart(6, '0');
export const FONT = (px, w = 400) => `${w} ${Math.round(px)}px Geist, ui-sans-serif, system-ui, sans-serif`;

// ---------------------------------------------------------------- materials
// A pearl: smooth, bright and iridescent. `thick` is the thin-film range in nanometres that three.js uses
// for its iridescence, which is the same physics as light bouncing between nacre layers.
export function pearlMat(color = 0xf4eee6, o = {}) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.16, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12, iridescence: 1, iridescenceIOR: 1.6, iridescenceThicknessRange: [320, 620], sheen: 0.4, sheenColor: new THREE.Color(0xffdcea), sheenRoughness: 0.4, ...o });
}
export function nacreMat(o = {}) {
  return new THREE.MeshPhysicalMaterial({ color: 0xe9e6ee, roughness: 0.22, metalness: 0, clearcoat: 0.8, iridescence: 1, iridescenceIOR: 1.62, iridescenceThicknessRange: [250, 700], ...o });
}

// ---------------------------------------------------------------- one valve of a pearl oyster
// The valve lies in the XZ plane and bulges toward +y. The hinge is a straight line along x at z = -0.78 R,
// with the umbo (the oldest point of the shell) in its middle. Growth lines run around the umbo.
// th0..th1 limits the sweep, so a half valve can be drawn for a cutaway.
export function valveGeometry({ R = 2, depth = 0.45, seg = 72, rings = 26, th0 = 0, th1 = Math.PI * 2, frill = 1 } = {}) {
  const umbo = new THREE.Vector2(0, -0.78 * R);
  const pos = [], col = [], idx = [];
  const cA = new THREE.Color(COL.shellOut), cB = new THREE.Color(COL.shellOut2), c = new THREE.Color();
  for (let i = 0; i <= seg; i++) {
    const th = lerp(th0, th1, i / seg);
    let ox = R * Math.cos(th) * 1.02, oz = R * Math.sin(th) * 1.05;
    if (oz < -0.78 * R) oz = -0.78 * R;                       // straight hinge line, with small "ears"
    for (let j = 0; j <= rings; j++) {
      const u = j / rings;
      const x = lerp(umbo.x, ox, u), z = lerp(umbo.y, oz, u);
      const lip = frill * 0.03 * R * Math.sin(th * 23) * smooth((u - 0.85) / 0.15);
      const y = depth * (1 - Math.pow(u, 1.7)) * (0.35 + 0.65 * Math.sin(Math.PI * Math.min(1, 0.25 + u * 0.75))) + lip;
      pos.push(x, y, z);
      const band = 0.5 + 0.5 * Math.sin(u * 70 + Math.sin(th * 9) * 0.6);
      c.copy(cA).lerp(cB, band * 0.7 + 0.15 * Math.sin(th * 31));
      col.push(c.r, c.g, c.b);
    }
  }
  const W = rings + 1;
  for (let i = 0; i < seg; i++) for (let j = 0; j < rings; j++) {
    const a = i * W + j, b = (i + 1) * W + j;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// A valve as two meshes on one geometry: rough brown outside, iridescent nacre inside.
export function makeValve(opts = {}, inner = nacreMat({ side: THREE.BackSide })) {
  const g = valveGeometry(opts);
  const grp = new THREE.Group();
  const out = new THREE.Mesh(g, M.matte(0xffffff, { vertexColors: true, roughness: 0.95, side: THREE.FrontSide }));
  const ins = new THREE.Mesh(g, inner);
  out.castShadow = true; out.receiveShadow = true; ins.receiveShadow = true;
  grp.add(out, ins);
  grp.out = out; grp.ins = ins;
  return grp;
}

// The mantle lobe: a thin translucent sheet just inside a valve, with a frilly edge.
function mantleLobe(R, depth, mat, sign, th0 = 0, th1 = Math.PI * 2) {
  const g = valveGeometry({ R: R * 0.86, depth: depth * 0.8, seg: 64, rings: 18, th0, th1, frill: 0 });
  const m = new THREE.Mesh(g, mat);
  m.position.y = sign * 0.035;
  // the thickened, fringed mantle edge (it carries small tentacles and senses the water)
  const pts = [];
  const span = th1 - th0, N = 140;
  for (let i = 0; i <= N; i++) {
    const th = th0 + (span * i) / N;
    let ox = R * 0.86 * Math.cos(th) * 1.02, oz = R * 0.86 * Math.sin(th) * 1.05;
    if (oz < -0.78 * R * 0.86) continue;
    pts.push(new THREE.Vector3(ox * 0.98, sign * (0.04 + 0.02 * Math.sin(th * 40)), oz * 0.98));
  }
  const grp = new THREE.Group(); grp.add(m);
  if (pts.length > 3) { const edge = tube(pts, 0.035 * R, mat, false, 260); grp.add(edge); }
  return grp;
}

// A whole pearl oyster (Pinctada), hinge at the back (-z). R is the shell radius in scene units.
// Returns a group with .set({ gape, cut, glow }) where gape is the opening angle in radians,
// cut hides the near half of the upper valve and mantle, and glow highlights one part.
export function makeOyster(R = 2, { depth = 0.42 } = {}) {
  const g = new THREE.Group();
  const hingeZ = -0.78 * R;
  const mats = {
    mantle: M.plastic(COL.mantle, { transparent: true, opacity: 0.85, roughness: 0.55, side: THREE.DoubleSide, emissive: 0x000000 }),
    gills: M.plastic(COL.gill, { roughness: 0.6, emissive: 0x000000, side: THREE.DoubleSide }),
    muscle: M.plastic(COL.muscle, { roughness: 0.5, emissive: 0x000000 }),
    body: M.plastic(COL.body, { roughness: 0.6, emissive: 0x000000 }),
  };
  const lowerNacre = nacreMat({ side: THREE.BackSide, emissive: 0x000000 });
  const upperNacre = nacreMat({ side: THREE.BackSide, emissive: 0x000000 });
  // lower valve (cupped down)
  const lower = makeValve({ R, depth }, lowerNacre); lower.scale.y = -1; g.add(lower);
  // upper valve on a hinge pivot
  const hinge = new THREE.Group(); hinge.position.z = hingeZ; g.add(hinge);
  const upFull = makeValve({ R, depth: depth * 0.75 }, upperNacre); upFull.position.z = -hingeZ;
  const upHalf = makeValve({ R, depth: depth * 0.75, th0: Math.PI / 2, th1: Math.PI * 1.5 }, upperNacre); upHalf.position.z = -hingeZ;
  const ghost = new THREE.Mesh(valveGeometry({ R, depth: depth * 0.75 }), M.ghost(0xcfe8ff, 0.07)); ghost.position.z = -hingeZ;
  const ghostEdge = new THREE.LineSegments(new THREE.EdgesGeometry(ghost.geometry, 40), new THREE.LineBasicMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.35 })); ghost.add(ghostEdge);
  upHalf.visible = false;
  hinge.add(upFull, upHalf, ghost);
  // ligament at the hinge
  const lig = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * R, 0.06 * R, 0.5 * R, 16), M.matte(0x2a2018)); lig.rotation.z = Math.PI / 2; lig.position.z = hingeZ; g.add(lig);
  // soft body
  const soft = new THREE.Group(); g.add(soft);
  const mLow = mantleLobe(R, depth, mats.mantle, -1); mLow.scale.y = -1; soft.add(mLow);
  const mUpFull = mantleLobe(R, depth * 0.75, mats.mantle, 1), mUpHalf = mantleLobe(R, depth * 0.75, mats.mantle, 1, Math.PI / 2, Math.PI * 1.5);
  const mUp = new THREE.Group(); mUp.position.z = -hingeZ; mUp.add(mUpFull, mUpHalf);
  const mHinge = new THREE.Group(); mHinge.position.z = hingeZ; mHinge.add(mUp); soft.add(mHinge);
  // visceral mass (gut, gonad, heart) near the hinge
  const body = sphere(0.42 * R, mats.body, 32); body.scale.set(1.0, 0.32, 0.8); body.position.set(-0.12 * R, 0.0, -0.35 * R); soft.add(body);
  // the gonad region where a cultured pearl bead is placed
  const gonad = new THREE.Vector3(-0.15 * R, 0.02, -0.28 * R);
  // foot and byssus threads (pearl oysters anchor with byssus)
  const foot = sphere(0.09 * R, mats.body, 16); foot.scale.set(0.7, 0.6, 1.8); foot.position.set(-0.3 * R, 0.02, -0.05 * R); foot.rotation.y = 0.6; soft.add(foot);
  for (let k = 0; k < 6; k++) soft.add(tube([[-0.36 * R, 0, -0.02 * R], [-0.55 * R - k * 0.03, -0.12 * R, 0.1 * R], [-0.75 * R - k * 0.05, -0.2 * R - k * 0.02, 0.15 * R + k * 0.04]], 0.006 * R, M.matte(0x7a6a4a), false, 30));
  // adductor muscle: one big muscle that pulls the valves shut
  const musc = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * R, 0.22 * R, 1, 32), mats.muscle); musc.castShadow = true;
  musc.position.set(0.12 * R, 0, 0.1 * R); soft.add(musc);
  // gills: four curved plates arcing around the muscle, each striped with filaments
  const gillTex = canvasTexture(256, 32, (c, w, h) => { c.fillStyle = '#c9906e'; c.fillRect(0, 0, w, h); c.fillStyle = '#7b4e36'; for (let x = 0; x < w; x += 4) c.fillRect(x, 0, 1.5, h); });
  gillTex.tex.wrapS = THREE.RepeatWrapping; gillTex.tex.repeat.set(8, 1);
  mats.gills.map = gillTex.tex;
  const gills = new THREE.Group();
  for (let k = 0; k < 4; k++) {
    // a gill plate: a curved ribbon standing on edge, striped with filaments
    const r0 = 0.42 * R + k * 0.05 * R, a0 = -2.6, a1 = 1.2, N = 48, hh = 0.07 * R;
    const pos = [], uv = [], idx = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, a = lerp(a0, a1, u), taper = Math.sin(Math.PI * clamp(u * 1.1, 0, 1)) * 0.7 + 0.3;
      const x = 0.1 * R + Math.cos(a) * r0, z = 0.05 * R + Math.sin(a) * r0;
      pos.push(x, -hh * taper, z, x, hh * taper, z); uv.push(u, 0, u, 1);
      if (i < N) { const b = i * 2; idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3); }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mats.gills); m.castShadow = true; m.position.y = 0.02 * R; gills.add(m);
  }
  soft.add(gills);

  const all = { mantle: mats.mantle, gills: mats.gills, muscle: mats.muscle, body: mats.body, nacre: [lowerNacre, upperNacre] };
  let tt = 0;
  g.set = ({ gape = 0.35, cut = false, glow = '' } = {}, dt = 0) => {
    tt += dt;
    hinge.rotation.x = -gape; mHinge.rotation.x = -gape * 0.92;
    upFull.visible = !cut; ghost.visible = cut; mUpFull.visible = !cut; mUpHalf.visible = false;
    // stretch the muscle between the two valves at its position
    const zr = musc.position.z - hingeZ, top = zr * Math.sin(gape) + depth * 0.42, bot = -depth * 0.55;
    musc.scale.y = Math.max(0.05, top - bot); musc.position.y = (top + bot) / 2;
    const pulse = 0.35 + 0.35 * Math.sin(tt * 4);
    for (const [k, m] of Object.entries(all)) {
      const list = Array.isArray(m) ? m : [m];
      list.forEach((mm) => { mm.emissive.setHex(k === glow ? COL.lime : 0x000000); mm.emissiveIntensity = k === glow ? pulse : 0; });
    }
  };
  g.parts = { lower, hinge, soft, body, musc, gills, upFull, upHalf };
  g.gonad = gonad;
  g.hingeZ = hingeZ;
  g.set();
  return g;
}

// ---------------------------------------------------------------- panels
// A flat panel that can face the camera (call .face() each frame).
export function panel(stage, w, h, pxW, pxH, draw) {
  const { tex, redraw } = canvasTexture(pxW, pxH, draw);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthWrite: false, side: THREE.DoubleSide }));
  mesh.renderOrder = 20; mesh.frustumCulled = false;
  mesh.face = () => mesh.quaternion.copy(stage.camera.quaternion);
  mesh.redraw = redraw;
  return mesh;
}

// A panel fixed to the camera (a heads-up display) so it stays in the same corner however you orbit.
const HUDS = new Set();
export function clearHuds() { HUDS.forEach((m) => { m.parent?.remove(m); m.material.map?.dispose(); m.material.dispose(); m.geometry.dispose(); }); HUDS.clear(); }
export function hud(stage, pxW, pxH, draw, { wFrac = 0.4, top = 0.075, side = 'right' } = {}) {
  const { tex, redraw } = canvasTexture(pxW, pxH, draw);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, pxH / pxW), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthTest: false, depthWrite: false, side: THREE.DoubleSide }));
  mesh.renderOrder = 999; mesh.frustumCulled = false; mesh.redraw = redraw;
  if (!stage.camera.parent) stage.scene.add(stage.camera);
  stage.camera.add(mesh); HUDS.add(mesh);
  mesh.dock = () => {
    const cam = stage.camera, D = 10, hh = D * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)), hw = hh * cam.aspect;
    const w = Math.min(wFrac * 2 * hw, 1.1 * 2 * hh * (pxW / pxH) * 0.5), h = w * (pxH / pxW);
    mesh.scale.set(w, w, 1);
    const x = side === 'right' ? hw - w / 2 - 0.03 * hw : -hw + w / 2 + 0.03 * hw;
    mesh.position.set(x, hh - h / 2 - top * 2 * hh, -D);
  };
  mesh.dock();
  return mesh;
}

// Rounded dark card with a title, the backdrop of every panel.
export function card(g, w, h, title) {
  g.clearRect(0, 0, w, h);
  g.fillStyle = 'rgba(8,10,16,0.86)'; g.beginPath(); g.roundRect(2, 2, w - 4, h - 4, 18); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.16)'; g.lineWidth = 2; g.stroke();
  if (title) { g.fillStyle = '#a8aebf'; g.font = FONT(Math.round(h * 0.07), 500); g.textAlign = 'left'; g.fillText(title, 24, h * 0.12); }
}

// ---------------------------------------------------------------- thin-film optics
// Reflectance of a stack of N aragonite tablets (index nA, thickness dA nm) separated by thin organic
// layers (index nO, thickness dO nm), lit from water-free air at angle th (radians), for wavelength lam (nm).
// Uses the standard characteristic-matrix method for s-polarised light, no absorption.
// Indices: aragonite about 1.53 to 1.68 (we use an average of 1.6); organic matrix about 1.4 to 1.5.
export function stackReflectance(lam, { dA = 450, dO = 25, N = 12, nA = 1.6, nO = 1.45, th = 0 } = {}) {
  const n0 = 1.0, s0 = Math.sin(th);
  const cosIn = (n) => Math.sqrt(Math.max(0, 1 - (n0 * s0 / n) ** 2));
  // complex 2x2 matrix product, elements as [re, im]
  let m11 = [1, 0], m12 = [0, 0], m21 = [0, 0], m22 = [1, 0];
  const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const layer = (n, d) => {
    const c = cosIn(n), eta = n * c, del = (2 * Math.PI * n * d * c) / lam;
    const cs = Math.cos(del), sn = Math.sin(del);
    const L11 = [cs, 0], L12 = [0, sn / eta], L21 = [0, eta * sn], L22 = [cs, 0];
    const a11 = add(mul(m11, L11), mul(m12, L21)), a12 = add(mul(m11, L12), mul(m12, L22));
    const a21 = add(mul(m21, L11), mul(m22, L21)), a22 = add(mul(m21, L12), mul(m22, L22));
    m11 = a11; m12 = a12; m21 = a21; m22 = a22;
  };
  for (let i = 0; i < N; i++) { layer(nA, dA); if (i < N - 1) layer(nO, dO); }
  const eta0 = n0 * Math.cos(th), etaS = nA * cosIn(nA);              // substrate: more nacre
  // r = (eta0*B - C) / (eta0*B + C), with [B; C] = M [1; etaS]
  const B = add(m11, [m12[0] * etaS, m12[1] * etaS]), C = add(m21, [m22[0] * etaS, m22[1] * etaS]);
  const num = [eta0 * B[0] - C[0], eta0 * B[1] - C[1]], den = [eta0 * B[0] + C[0], eta0 * B[1] + C[1]];
  return (num[0] ** 2 + num[1] ** 2) / (den[0] ** 2 + den[1] ** 2);
}

// CIE 1931 colour matching functions, piecewise-Gaussian fit (Wyman, Sloan and Shirley 2013, JCGT 2(2)).
function g1(x, mu, s1, s2) { const t = (x - mu) / (x < mu ? s1 : s2); return Math.exp(-0.5 * t * t); }
const xBar = (l) => 1.056 * g1(l, 599.8, 37.9, 31.0) + 0.362 * g1(l, 442.0, 16.0, 26.7) - 0.065 * g1(l, 501.1, 20.4, 26.2);
const yBar = (l) => 0.821 * g1(l, 568.8, 46.9, 40.5) + 0.286 * g1(l, 530.9, 16.3, 31.1);
const zBar = (l) => 1.217 * g1(l, 437.0, 11.8, 36.0) + 0.681 * g1(l, 459.0, 26.0, 13.8);
const gam = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);
// Colour of a reflectance spectrum under flat white light. Returns sRGB 0..1 and the brightness Y.
export function spectrumColor(R, { gain = 1 } = {}) {
  let X = 0, Y = 0, Z = 0, Yw = 0;
  for (let l = 380; l <= 750; l += 5) { const r = R(l); X += r * xBar(l); Y += r * yBar(l); Z += r * zBar(l); Yw += yBar(l); }
  X /= Yw; Y /= Yw; Z /= Yw;
  X *= gain; Y *= gain; Z *= gain;
  let r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z, g = -0.9689 * X + 1.8758 * Y + 0.0415 * Z, b = 0.0557 * X - 0.204 * Y + 1.057 * Z;
  const mn = Math.min(r, g, b); if (mn < 0) { r -= mn; g -= mn; b -= mn; }
  const mx = Math.max(r, g, b, 1e-6); if (mx > 1) { r /= mx; g /= mx; b /= mx; }
  return { r: gam(clamp(r, 0, 1)), g: gam(clamp(g, 0, 1)), b: gam(clamp(b, 0, 1)), Y };
}
export function wavelengthColor(l) { const c = spectrumColor((x) => Math.exp(-0.5 * ((x - l) / 8) ** 2), { gain: 9 }); return `rgb(${(c.r * 255) | 0},${(c.g * 255) | 0},${(c.b * 255) | 0})`; }
