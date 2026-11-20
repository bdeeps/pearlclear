// Chapter 1: inside a pearl oyster (Pinctada). Two hinged valves, a mantle that lines them, gills that
// filter food, one big adductor muscle. The mantle's outer epithelium builds the shell in three layers:
// an organic skin (periostracum), a prismatic layer (calcite in Pinctada) and, inside, nacre (aragonite).
// The section on the right is drawn many thousands of times larger than the oyster beside it.
import { THREE, M, COL, makeOyster, nacreMat, sphere, clamp } from '../pearl.js';
import { box, swarm } from '../kit.js';

const PARTS = {
  mantle: { n: 'Mantle', say: 'A thin sheet of tissue that lines both valves. Its outer layer of cells, the epithelium, makes the shell, and it is the tissue that ends up making a pearl.' },
  gills: { n: 'Gills', say: 'Four curved plates covered in beating hairs. They pump water through the oyster, take in oxygen and sieve out plankton to eat.' },
  muscle: { n: 'Adductor muscle', say: 'One large muscle that pulls the valves shut. When it relaxes, a springy ligament at the hinge pushes them open again.' },
  nacre: { n: 'Nacre', say: 'Mother-of-pearl: the shining inner layer of the shell. A pearl is made of the same stuff, laid down by the same kind of cells.' },
};
const DEG = 180 / Math.PI;

export default {
  id: 'oyster',
  short: 'Inside the oyster',
  title: 'Inside a pearl oyster',
  subtitle: 'Two shells, a soft body, and a skin of cells that builds the shell.',
  view: { pos: [3.0, 6.4, 10.4], target: [1.7, 0.2, 0] },
  learn: `<p>A pearl oyster is a <b>bivalve</b>: a soft animal between two hinged shells, or <b>valves</b>. The pearl oysters used for most saltwater pearls belong to the genus <b>Pinctada</b>. Freshwater pearls come from mussels, which are built the same basic way.</p>
    <p>Lining each valve is the <b>mantle</b>, a thin sheet of tissue. Its outer layer of cells, the <b>epithelium</b>, is a shell factory. It pours minerals and proteins into a thin film of fluid against the shell. First comes a tough organic skin, then a layer of chalky prisms, and on the inside, layer after layer of <b>nacre</b>, or mother-of-pearl.</p>
    <p>Nacre is calcium carbonate in a crystal form called <b>aragonite</b>, built in tiny tablets glued with protein. The animal keeps adding it for life, so the shell thickens from the inside. A pearl is made of the very same nacre, by the very same kind of cell.</p>
    <p class="tip"><b>Try it:</b> open the shell, turn on the <b>cutaway</b>, and pick a part to light it up. On the right, watch the mantle cells send material up to the growing nacre.</p>
    <p class="note">The oyster is simplified. The shell section on the right is magnified many thousands of times, and its layers are not to scale.</p>`,
  terms: [
    { t: 'Bivalve', d: 'A mollusc with two hinged shells, such as an oyster, mussel or clam.' },
    { t: 'Mantle', d: 'The sheet of tissue that lines the shell and makes it.' },
    { t: 'Epithelium', d: 'A thin layer of cells covering a surface. The mantle’s outer epithelium secretes the shell.' },
    { t: 'Nacre', d: 'Mother-of-pearl: the iridescent inner layer of many shells, and the stuff of pearls.' },
    { t: 'Aragonite', d: 'A crystal form of calcium carbonate. Nacre tablets are made of it.' },
    { t: 'Periostracum', d: 'The thin organic skin on the outside of a shell.' },
  ],
  defaults: { gape: 0.3, cut: true, part: 'mantle' },
  controls: [
    { key: 'gape', type: 'range', label: 'Open the shell', min: 0, max: 0.7, step: 0.01, fmt: (v) => Math.round(v * DEG) + '°' },
    { key: 'cut', type: 'toggle', label: 'Cutaway (see through the top valve)' },
    { key: 'part', type: 'seg', label: 'Light up', options: Object.entries(PARTS).map(([v, p]) => ({ v, label: p.n })) },
  ],
  quiz: [
    { q: 'Which tissue makes the shell, and pearls too?', options: ['The gills', 'The mantle', 'The adductor muscle', 'The foot'], answer: 1, why: 'The mantle’s outer epithelium secretes the shell layers, including nacre. Pearls are made by the same kind of cells.' },
    { q: 'What is nacre mostly made of?', options: ['Protein only', 'Aragonite, a form of calcium carbonate', 'Silica, like glass', 'Keratin, like hair'], answer: 1, why: 'Nacre is about 95% mineral: tablets of aragonite glued with a thin organic layer.' },
    { q: 'What opens an oyster’s shell?', options: ['A second muscle', 'A springy ligament at the hinge', 'Water pressure', 'The gills'], answer: 1, why: 'The adductor muscle pulls the valves shut. When it relaxes, the elastic hinge ligament pushes them apart.' },
  ],
  reel: [
    { ms: 5200, caption: 'A pearl oyster is a soft animal between two shells, lined with a skin called the mantle.', set: { gape: 0.05, cut: false, part: 'mantle' }, anim: { gape: [0.05, 0.5] }, view: { pos: [2.4, 5.4, 7.2], target: [0.9, 0.3, 0] }, spin: 0.4 },
    { ms: 5200, caption: 'Mantle cells build the shell, and line it with shining nacre: mother-of-pearl.', set: { gape: 0.45, cut: true, part: 'nacre' }, view: { pos: [4.2, 3.6, 5.6], target: [2.6, 0.6, 0] }, spin: 0 },
  ],
  build({ stage, s }) {
    stage.scene.background = new THREE.Color(COL.sea);
    stage.floor.visible = false;
    const root = stage.root;
    // sandy sea floor
    const floor = new THREE.Mesh(new THREE.CircleGeometry(16, 64), M.matte(0x1d2a2e)); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.6; floor.receiveShadow = true; root.add(floor);
    const oy = makeOyster(2); oy.position.set(-0.6, 0, 0); oy.rotation.y = -0.5; root.add(oy);
    stage.label('Mantle', [-1.4, 0.6, 1.2], oy);
    stage.label('Gills', [0.9, 0.3, 1.0], oy);
    stage.label('Adductor muscle', [0.3, 1.1, 0.3], oy);
    stage.label('Hinge', [0, 0.3, -1.8], oy);
    stage.label('Nacre lining', [1.6, -0.4, -0.4], oy);

    // ---- a magnified section through the shell and mantle edge
    const sec = new THREE.Group(); sec.position.set(4.0, -0.5, -0.6); sec.rotation.y = -0.25; sec.scale.setScalar(0.75); root.add(sec);
    const W = 2.6, D = 1.3;
    const conn = box(W, 0.55, D, M.plastic(COL.tissue, { roughness: 0.7 })); conn.position.y = 0.27; sec.add(conn);
    // epithelial cells: tall, columnar
    const cells = swarm(13 * 6, new THREE.BoxGeometry(0.18, 0.3, 0.19), M.plastic(COL.cell, { roughness: 0.5, emissive: 0x2a4a08, emissiveIntensity: 0.4 }));
    let n = 0; for (let i = 0; i < 13; i++) for (let k = 0; k < 6; k++) cells.place(n++, [-W / 2 + 0.1 + i * 0.2, 0.71, -D / 2 + 0.11 + k * 0.215]);
    cells.done(); sec.add(cells);
    const fluid = box(W, 0.16, D, M.ghost(0x8ef0ff, 0.12)); fluid.position.y = 0.94; sec.add(fluid);
    // nacre: staggered tablets
    const tabs = swarm(6 * 7 * 4, new THREE.CylinderGeometry(0.2, 0.2, 0.055, 6), nacreMat());
    n = 0; for (let L = 0; L < 6; L++) for (let i = 0; i < 7; i++) for (let k = 0; k < 4; k++) tabs.place(n++, [-W / 2 + 0.2 + i * 0.37 + (L % 2) * 0.18, 1.06 + L * 0.065, -D / 2 + 0.18 + k * 0.32 + (L % 2) * 0.1], [0, (i * 7 + k * 3) % 5 * 0.2, 0]);
    tabs.count = n; tabs.done(); sec.add(tabs);
    // prismatic layer: columns
    const pr = swarm(12 * 6, new THREE.CylinderGeometry(0.11, 0.11, 0.42, 6), M.plastic(0xb08860, { roughness: 0.5 }));
    n = 0; for (let i = 0; i < 12; i++) for (let k = 0; k < 6; k++) pr.place(n++, [-W / 2 + 0.12 + i * 0.215 + (k % 2) * 0.05, 1.67, -D / 2 + 0.11 + k * 0.215]);
    pr.done(); sec.add(pr);
    const peri = box(W, 0.05, D, M.matte(0x3a2a1c)); peri.position.y = 1.91; sec.add(peri);
    stage.label('Outer skin (periostracum)', [-W / 2 - 0.2, 1.95, 0], sec, 'l');
    stage.label('Prisms', [-W / 2 - 0.2, 1.67, 0], sec, 'l');
    stage.label('Nacre, layer by layer', [-W / 2 - 0.2, 1.22, 0], sec, 'l');
    stage.label('Thin film of fluid', [-W / 2 - 0.2, 0.94, 0], sec, 'l');
    stage.label('Mantle epithelium (the builders)', [-W / 2 - 0.2, 0.68, 0], sec, 'l');
    stage.label('Shell section, hugely magnified', [0, 2.35, 0], sec);
    // material on its way from the cells to the growing nacre
    const NP = 40, dots = [];
    const dm = M.glow(COL.lime);
    for (let i = 0; i < NP; i++) { const d = sphere(0.025, dm, 8); d.castShadow = false; sec.add(d); dots.push(d); }
    let tt = 0;
    return {
      update(dt, st) {
        tt += dt;
        oy.set({ gape: st.gape, cut: st.cut, glow: st.part }, dt);
        dots.forEach((d, i) => {
          const ph = (tt * 0.45 + i / NP * 3.7) % 1;
          const x = -W / 2 + 0.15 + ((i * 0.618) % 1) * (W - 0.3), z = -D / 2 + 0.15 + ((i * 0.382) % 1) * (D - 0.3);
          d.position.set(x, 0.87 + ph * 0.18, z);
          d.scale.setScalar(clamp(Math.sin(ph * Math.PI) * 1.4, 0.01, 1));
        });
      },
      readout(st) {
        const p = PARTS[st.part];
        return `<div class="big">${p.n}</div><p class="r-say">${p.say}</p>
          <div class="row"><span>Shell opened</span><b>${Math.round(st.gape * DEG)}°</b></div>`;
      },
    };
  },
};
