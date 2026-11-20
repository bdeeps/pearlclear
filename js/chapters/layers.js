// Chapter 3: layer by layer. Nacre is a brick wall: aragonite tablets about 0.5 micrometres thick (reported
// range roughly 0.2 to 0.9 um) and about 5 to 8 um wide, glued by organic "mortar" 10 to 30 nm thick.
// It is about 95 % mineral by volume. Sources: Zhao, Yang & Guo 2018, NPG Asia Materials,
// doi:10.1038/s41427-018-0009-6; Kakisawa & Sumitomo 2012, Sci Technol Adv Mater (PMC5090675);
// Gim et al. 2021, PNAS (PMC8545470): 2,615 layers in a 2.5 mm pearl over 548 days (about 4 to 5 a day),
// tablets about 0.5 um early and 0.34 um when mature.
// Growth rate: published figures vary with species, water temperature and season. Cultured Akoya pearls were
// traditionally given about 1 mm of nacre over a culture of roughly 1 to 2 years (Shor 2007, GIA Gems &
// Gemology). The rate slider is therefore a range (0.1 to 1 mm a year), not one number.
// Toughness: nacre absorbs up to about a thousand times more energy before breaking than plain aragonite
// (Currey 1977; Jackson, Vincent & Turner 1988, summarised in Kakisawa & Sumitomo 2012).
import { THREE, M, COL, pearlMat, nacreMat, canvasTexture, clamp, lerp, smooth } from '../pearl.js';
import { box, swarm } from '../kit.js';

const LAYER_UM = 0.35;   // a typical mature tablet layer in a pearl, micrometres
const TX = 200;          // where the micrometre-scale model sits in the scene
const ZOOMS = { pearl: 'Whole pearl', rings: 'Growth rings', tablets: 'Tablets (µm)' };
const BEAD = 2.5;        // bead radius in mm when "cultured" is on

export default {
  id: 'layers',
  short: 'Layer by layer',
  title: 'Bricks and mortar, layer by layer',
  subtitle: 'Thousands of layers, each thinner than a bacterium, laid one on another.',
  view: { pos: [2.1, 1.6, 6.5], target: [0, 0, 0] },
  learn: `<p>Cut a pearl in half and you see rings, like a tree. The pearl sac lays down nacre on the outside of the growing pearl, one thin layer after another, for as long as the pearl stays in the oyster.</p>
    <p>Zoom in and each layer is a sheet of flat <b>aragonite tablets</b>, a bit like six-sided tiles. Each is about <b>0.5 micrometres</b> thick (measurements range from roughly 0.2 to 0.9) and 5 to 8 micrometres across. A film of protein and chitin, the organic <b>mortar</b>, only 10 to 30 nanometres thick, glues them together. By volume, nacre is about 95 percent mineral.</p>
    <p>It grows slowly. In one pearl imaged in full detail, 2,615 layers were laid over 548 days, four or five a day. Growth depends on species, water temperature and season. Farmed Akoya pearls were traditionally given about a millimetre of nacre over a year or two.</p>
    <p>Nacre is also <b>tough</b>. Plain aragonite is brittle as chalk. In nacre, a crack has to wander through the soft mortar around every tablet, and the tablets slide and grip as it goes. It can take up to about a thousand times more energy to break than the pure mineral, which is why engineers copy it.</p>
    <p class="tip"><b>Try it:</b> drag <b>Time</b> to grow a pearl and switch on the bead to see how thin cultured nacre can be. Then zoom to the <b>tablets</b> and drag <b>Crack</b>.</p>
    <p class="note">Layer counts and rates are typical figures, not exact. In the tablet view the mortar is drawn thicker than real so you can see it.</p>`,
  terms: [
    { t: 'Aragonite tablet', d: 'A flat crystal of calcium carbonate, about 0.5 µm thick and 5 to 8 µm wide: the brick of nacre.' },
    { t: 'Organic matrix', d: 'The thin film of protein and chitin, 10 to 30 nm thick, that glues the tablets: the mortar.' },
    { t: 'Micrometre (µm)', d: 'A thousandth of a millimetre. A human hair is about 70 µm across.' },
    { t: 'Nacre thickness', d: 'How deep the nacre is over the core. It matters for a cultured pearl’s lustre and durability.' },
    { t: 'Crack deflection', d: 'When a crack is forced to turn and wander, so it needs much more energy to grow.' },
  ],
  defaults: { zoom: 'pearl', age: 1.5, rate: 0.6, bead: false, crack: 0 },
  controls: [
    { key: 'zoom', type: 'seg', label: 'Zoom', options: Object.entries(ZOOMS).map(([v, n]) => ({ v, label: n })) },
    { key: 'age', type: 'range', label: 'Time in the oyster', min: 0, max: 3, step: 0.01, fmt: (v) => (v < 1 ? Math.round(v * 12) + ' months' : v.toFixed(1) + ' years') },
    { key: 'rate', type: 'range', label: 'Nacre growth per year', min: 0.1, max: 1, step: 0.01, fmt: (v) => v.toFixed(2) + ' mm', hint: 'Published figures vary with species and water. Pick a value in the range.' },
    { key: 'bead', type: 'toggle', label: 'Cultured: start on a 5 mm bead' },
    { key: 'crack', type: 'range', label: 'Crack (tablet view)', min: 0, max: 1, step: 0.005, fmt: (v) => Math.round(v * 100) + '% of the energy' },
  ],
  quiz: [
    { q: 'About how thick is one aragonite tablet in nacre?', options: ['About 0.5 millimetres', 'About 0.5 micrometres', 'About 5 nanometres', 'About 1 centimetre'], answer: 1, why: 'Roughly half a micrometre, a two-thousandth of a millimetre, with a range of about 0.2 to 0.9 µm.' },
    { q: 'Why is nacre so much tougher than plain aragonite?', options: ['It is softer', 'Cracks must wander round the tablets through the organic mortar', 'It contains metal', 'It is wet'], answer: 1, why: 'The brick-and-mortar layout turns a straight crack into a long zigzag, soaking up energy.' },
    { q: 'In one carefully imaged pearl, about how many nacre layers were laid per day?', options: ['One every month', 'Four or five', 'About a hundred', 'Ten thousand'], answer: 1, why: '2,615 layers in 548 days: about four or five a day.' },
  ],
  reel: [
    { ms: 5400, caption: 'A pearl grows like a tree trunk, adding thin rings of nacre year after year.', set: { zoom: 'pearl', bead: false, rate: 0.6, crack: 0 }, anim: { age: [0.05, 3] }, view: { pos: [2.1, 1.6, 6.5], target: [0, 0, 0] }, spin: 0.3 },
    { ms: 5600, caption: 'Each ring is a wall of tiny tablets, half a micrometre thick, glued with protein. Cracks have to zigzag.', set: { zoom: 'tablets', age: 2, crack: 0 }, anim: { crack: [0, 1] }, view: { pos: [TX + 8, 10, 48], target: [TX + 5, 2.5, 0] }, spin: 0 },
  ],
  build({ stage, s }) {
    stage.scene.background = new THREE.Color(0x0b0d14);
    stage.floor.visible = false;
    const root = stage.root;
    // ---------------- the pearl, cut open (1 unit = 1 mm)
    const pg = new THREE.Group(); root.add(pg);
    const half = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32, Math.PI, Math.PI), pearlMat()); half.castShadow = true; pg.add(half);
    const rings = canvasTexture(1024, 1024, (g, w, h, st = s) => {
      g.clearRect(0, 0, w, h);
      const R = w / 2 - 2, tot = radius(st), core = (st.bead ? BEAD : 0.03) / tot;
      const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, R); gr.addColorStop(0, '#e6d9c8'); gr.addColorStop(1, '#f4eee6'); g.fillStyle = gr; g.beginPath(); g.arc(w / 2, h / 2, R, 0, 7); g.fill();
      const months = Math.max(1, Math.round(st.age * 12));
      for (let k = 1; k <= months; k++) {
        const r = (core + (1 - core) * (k / months)) * R;
        g.strokeStyle = k % 12 === 0 ? 'rgba(90,62,50,.95)' : 'rgba(130,100,85,.7)'; g.lineWidth = k % 12 === 0 ? 6 : 3;
        g.beginPath(); g.arc(w / 2, h / 2, r, 0, 7); g.stroke();
      }
      if (st.bead) {
        const br = core * R; g.save(); g.beginPath(); g.arc(w / 2, h / 2, br, 0, 7); g.clip();
        g.fillStyle = '#f6f1e6'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(170,150,120,.45)'; g.lineWidth = 2;
        for (let y = -br; y < br; y += 14) { g.beginPath(); g.moveTo(w / 2 - br, h / 2 + y + 4 * Math.sin(y)); g.lineTo(w / 2 + br, h / 2 + y); g.stroke(); }
        g.restore(); g.strokeStyle = 'rgba(90,70,60,.8)'; g.lineWidth = 3; g.beginPath(); g.arc(w / 2, h / 2, br, 0, 7); g.stroke();
      } else { g.fillStyle = '#9c8478'; g.beginPath(); g.arc(w / 2, h / 2, Math.max(3, core * R), 0, 7); g.fill(); }
    });
    rings.tex.anisotropy = 8;
    const face = new THREE.Mesh(new THREE.CircleGeometry(1, 96), new THREE.MeshStandardMaterial({ map: rings.tex, roughness: 0.35 })); face.position.z = 0.001; pg.add(face);
    // a 1 mm scale bar
    const bar = box(1, 0.04, 0.04, M.glow(COL.lime)); pg.add(bar);
    const lPearl = stage.label('Each line here is about a month of nacre', [0, 0, 0], pg);
    const lBar = stage.label('1 mm', [0, 0, 0], pg);

    // ---------------- the brick wall (1 unit = 1 µm), at x = TX
    const tg = new THREE.Group(); tg.position.x = TX; root.add(tg);
    const LAY = 12, TH = 0.5, MORT = 0.06, HEXR = 3, SP = HEXR * Math.sqrt(3);
    const XW = 13, ZW = 7, cells = [];
    for (let L = 0; L < LAY; L++) {
      const sx = (L % 2) * SP * 0.5 + (L % 3) * 0.7, sz = (L % 3) * 1.4;
      for (let j = -3; j <= 3; j++) for (let i = -4; i <= 4; i++) {
        const x = i * SP + (j % 2 ? SP / 2 : 0) + sx - SP / 2, z = j * HEXR * 1.5 + sz;
        if (Math.abs(x) > XW || Math.abs(z) > ZW) continue;
        cells.push({ L, x, z, y: L * (TH + MORT) + TH / 2, rot: ((i * 7 + j * 3 + L) % 5) * 0.03, seed: (i * 13 + j * 7 + L * 5) % 17 / 17 });
      }
    }
    const tabs = swarm(cells.length, new THREE.CylinderGeometry(HEXR - 0.06, HEXR - 0.06, TH, 6), nacreMat({ iridescenceThicknessRange: [300, 500] }));
    tg.add(tabs);
    const H = LAY * (TH + MORT);
    const mortar = box(XW * 2 + 2, H - 0.1, ZW * 2 + 2, M.plastic(0x3a2a1e, { transparent: true, opacity: 0.4, depthWrite: false })); mortar.position.y = H / 2 - 0.05; mortar.castShadow = false; tg.add(mortar);
    // plain aragonite for comparison
    const mono = box(9, H, ZW * 2, M.matte(0xe6e1d8)); mono.position.set(XW + 10, H / 2, 0); tg.add(mono);
    const crackMat = M.glow(0xff4d2e);
    let crackN = null, crackM = null;
    // the crack's route through the nacre: down through a joint, along the mortar to the next joint, and so on
    const route = [];
    { let x = 0.2; const zf = ZW + 0.05; route.push(new THREE.Vector3(x, H + 0.02, zf));
      for (let L = LAY - 1; L >= 0; L--) { const yTop = L * (TH + MORT) + TH, yBot = L * (TH + MORT); route.push(new THREE.Vector3(x, yTop, zf), new THREE.Vector3(x, yBot - MORT / 2, zf)); x += ((LAY - L) % 2 ? 1 : -1) * SP * 0.5 * (0.8 + 0.4 * ((L * 5) % 3) / 2); route.push(new THREE.Vector3(x, yBot - MORT / 2, zf)); }
    }
    const segLen = []; let totLen = 0; for (let i = 1; i < route.length; i++) { const d = route[i].distanceTo(route[i - 1]); segLen.push(d); totLen += d; }
    const pathTo = (len) => { const out = [route[0].clone()]; let acc = 0; for (let i = 1; i < route.length; i++) { const d = segLen[i - 1]; if (acc + d >= len) { out.push(route[i - 1].clone().lerp(route[i], (len - acc) / d)); break; } acc += d; out.push(route[i].clone()); } return out; };
    const makeCrack = (pts) => { if (pts.length < 2) return null; const path = new THREE.CurvePath(); for (let i = 1; i < pts.length; i++) if (pts[i].distanceTo(pts[i - 1]) > 1e-4) path.add(new THREE.LineCurve3(pts[i - 1], pts[i])); if (!path.curves.length) return null; const m = new THREE.Mesh(new THREE.TubeGeometry(path, Math.max(4, pts.length * 4), 0.16, 6, false), crackMat); tg.add(m); return m; };
    const lT = [
      stage.label('Aragonite tablet, about 0.5 µm thick', [-XW - 1, H * 0.75, ZW], tg),
      stage.label('Organic mortar, 10–30 nm (drawn thicker)', [-XW - 1, H * 0.3, ZW], tg),
      stage.label('Nacre', [0, H + 1.4, 0], tg, 'hot'),
      stage.label('Plain aragonite', [XW + 10, H + 1.4, 0], tg),
      stage.label('5 µm', [0, -1.2, ZW + 0.5], tg),
    ];
    const bar2 = box(5, 0.12, 0.12, M.glow(COL.lime)); bar2.position.set(0, -0.6, ZW + 0.5); tg.add(bar2);

    function radius(st) { return (st.bead ? BEAD : 0.03) + st.rate * st.age; }
    let lastKey = '', lastZoom = '', lastCrack = -1, tt = 0;
    return {
      update(dt, st) {
        tt += dt;
        const R = Math.max(0.05, radius(st));
        const key = [st.age.toFixed(2), st.rate.toFixed(2), st.bead].join('|');
        if (key !== lastKey) { lastKey = key; rings.redraw(st); }
        half.scale.setScalar(R); face.scale.setScalar(R);
        bar.position.set(-0.5 + R * 0.3, -R - 0.35, 0.2); lBar.position.set(R * 0.3 - 0.5, -R - 0.75, 0.2);
        lPearl.position.set(R * 0.7, R * 0.75 + 0.3, 0.1);
        const Rmax = Math.max(0.6, (st.bead ? BEAD : 0.03) + st.rate * 3);
        const vkey = st.zoom + (st.zoom === 'tablets' ? '' : '|' + Rmax.toFixed(1) + (st.zoom === 'rings' ? '|' + R.toFixed(1) : ''));
        if (vkey !== lastZoom) {
          lastZoom = vkey;
          if (st.zoom === 'pearl') stage.setView([Rmax * 0.9, Rmax * 0.7, Rmax * 2.9], [0, 0, 0], 0.9);
          if (st.zoom === 'rings') stage.setView([R * 0.72 + 0.3, R * 0.15 + 0.2, 1.7 + st.rate * st.age * 0.6], [R * 0.72, R * 0.12, 0], 0.9);
          if (st.zoom === 'tablets') stage.setView([TX + 8, 10, 48], [TX + 5, 2.5, 0], 0.9);
        }
        const tab = st.zoom === 'tablets';
        pg.visible = !tab; tg.visible = tab;
        lPearl.visible = lBar.visible = !tab; lT.forEach((l) => { l.visible = tab; });
        if (tab) {
          // the top layer keeps growing: tablets nucleate and spread sideways, then a new layer starts
          const cyc = (tt / 5) % 1, grow = st.crack > 0 ? 1 : cyc;
          cells.forEach((c, i) => {
            let sc = 1;
            if (c.L === LAY - 1) sc = clamp((grow - c.seed * 0.6) / 0.4, 0.02, 1);
            tabs.place(i, [c.x, c.y, c.z], [0, c.rot, 0], 1);
            if (sc < 1) { const mtx = new THREE.Matrix4().compose(new THREE.Vector3(c.x, c.y, c.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, c.rot, 0)), new THREE.Vector3(sc, 1, sc)); tabs.setMatrixAt(i, mtx); }
          });
          tabs.done();
          const ck = Math.round(st.crack * 200);
          if (ck !== lastCrack) {
            lastCrack = ck;
            [crackN, crackM].forEach((m) => { if (m) { tg.remove(m); m.geometry.dispose(); } });
            const k = ck / 200;
            crackN = makeCrack(pathTo(totLen * 0.62 * smooth(k)));       // the same energy takes it only part way
            const depth = H * clamp(k / 0.18, 0, 1);                        // straight through plain mineral
            crackM = depth > 0.01 ? makeCrack([new THREE.Vector3(XW + 10, H + 0.02, ZW + 0.05), new THREE.Vector3(XW + 10 + 0.3, H - depth, ZW + 0.05)]) : null;
            mono.material.color.setHex(k > 0.18 ? 0xd9b8a8 : 0xe6e1d8);
          }
        }
      },
      readout(st) {
        const R = radius(st), nac = st.rate * st.age, layers = Math.round((nac * 1000) / LAYER_UM);
        if (st.zoom === 'tablets') {
          const k = st.crack, through = k > 0.18;
          return `<div class="big">Brick and mortar</div><p class="r-say">Same energy, two materials. The crack runs straight through plain aragonite, but in nacre it must zigzag along the mortar between tablets.</p>
            <div class="row"><span>Tablet</span><b>about 0.5 µm thick, 5–8 µm wide</b></div>
            <div class="row"><span>Mortar</span><b>10–30 nm</b></div>
            <div class="row"><span>Plain aragonite</span><b>${through ? 'broken through' : k > 0 ? 'cracking' : 'intact'}</b></div>
            <div class="row"><span>Nacre</span><b>${k > 0 ? Math.round(62 * smooth(k)) + '% of the way, zigzagging' : 'intact'}</b></div>`;
        }
        return `<div class="big">${(R * 2).toFixed(R < 0.5 ? 2 : 1)} mm across</div><p class="r-say">${st.bead ? 'A cultured pearl is mostly bead. Only the outer skin is nacre.' : 'A natural pearl is nacre almost all the way through.'}</p>
          <div class="row"><span>Nacre thickness</span><b>${nac.toFixed(2)} mm</b></div>
          <div class="row"><span>Layers (at about 0.35 µm each)</span><b>about ${layers.toLocaleString('en')}</b></div>
          <div class="row"><span>Layers a day</span><b>about ${st.age > 0 ? (layers / (st.age * 365)).toFixed(1) : '–'}</b></div>`;
      },
    };
  },
};
