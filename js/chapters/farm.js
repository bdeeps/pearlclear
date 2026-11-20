// Chapter 5: cultured pearls. The Mise-Nishikawa method (Mise patent 1907, Nishikawa filed the same year;
// Mikimoto adopted it from 1916): a shell bead plus a small square of mantle from a donor oyster, slipped
// into the gonad. Sizes and culture times from GIA "Differences between pearl types" and Shor 2007 (GIA Gems &
// Gemology): Akoya 6-9 mm, 10-24 months; Tahitian 8-14 mm, about 18-24 months; South Sea 8-18 mm, often
// 2-4 years; freshwater typically 6-12 mm, tissue graft only, several years for larger sizes.
// Drawn sizes on the tray are the middle of each range, to scale with each other.
import { THREE, M, COL, makeOyster, pearlMat, sphere, clamp, lerp, smooth } from '../pearl.js';
import { box, beam } from '../kit.js';

const KINDS = {
  akoya: { n: 'Akoya', sp: 'Pinctada fucata (Akoya oyster)', where: 'Japan and China', size: '6–9 mm', mm: 7.5, time: 'about 10–24 months', nuc: 'Bead + graft', c: 0xf5f0ea, sheen: 0xffd2e4, R: 1.3, shell: 0x6d5a45 },
  south: { n: 'South Sea', sp: 'Pinctada maxima (silver- or gold-lipped)', where: 'Australia, Indonesia, the Philippines', size: '8–18 mm', mm: 13, time: 'often 2–4 years', nuc: 'Bead + graft', c: 0xeedfb8, sheen: 0xfff1c9, R: 2.1, shell: 0x8a7a5a },
  tahiti: { n: 'Tahitian', sp: 'Pinctada margaritifera (black-lipped)', where: 'French Polynesia', size: '8–14 mm', mm: 11, time: 'about 18–24 months', nuc: 'Bead + graft', c: 0x3a3b44, sheen: 0x7fe0b0, R: 1.8, shell: 0x3a3430 },
  fresh: { n: 'Freshwater', sp: 'Hyriopsis mussels', where: 'mostly China', size: 'typically 6–12 mm', mm: 9, time: 'several years for larger sizes', nuc: 'Mantle graft only (many per mussel)', c: 0xf1e9ef, sheen: 0xd7c9ff, R: 1.7, shell: 0x4a4636 },
};
const STEPS = [[0, 'Cut a donor’s mantle into small squares'], [0.15, 'Slip a bead and one square into the gonad'], [0.4, 'Close up and return to the sea'], [0.55, 'Months in a net under a raft'], [0.85, 'Open and harvest the pearl']];

export default {
  id: 'farm',
  short: 'Pearl farming',
  title: 'Cultured pearls: a bead and a scrap of skin',
  subtitle: 'Farmers do on purpose what a parasite does by accident, one oyster at a time.',
  view: { pos: [1.2, 5.6, 11.5], target: [1.2, 0.2, 0] },
  learn: `<p>In <b>1893</b>, Kokichi Mikimoto and his wife <b>Ume</b>, working in Ago Bay, Japan, grew the first cultured <b>half-pearls</b>, domes stuck to the inside of the shell. The secret of loose, round pearls was found by others. <b>Tatsuhei Mise</b> harvested round cultured pearls in 1904 and won Japan’s first patent for them in 1907, and <b>Tokichi Nishikawa</b>, a marine biologist, filed for the same method that year. Mikimoto took up the <b>Mise–Nishikawa method</b> from 1916, and round cultured pearls reached the market in 1921. Mikimoto’s own accounts date his first round pearl to 1905.</p>
    <p>The method is the one this box has been building to. A skilled technician opens a living oyster a little, holds it with a wedge, and slips in a polished <b>bead</b> of shell together with a small square of <b>mantle</b> cut from a sacrificed donor oyster. The donor cells grow round the bead into a pearl sac, which coats it in nacre. Freshwater mussels are usually given mantle squares alone, many at once.</p>
    <p>Today <b>Akoya</b> pearls come mainly from Japan and China, <b>South Sea</b> pearls from big Pinctada maxima oysters in Australia and Southeast Asia, <b>Tahitian</b> black pearls from French Polynesia, and <b>freshwater</b> pearls, by far the most numerous, mostly from China.</p>
    <p><b>An honest note.</b> Each oyster is operated on by hand, and every bead needs a donor oyster’s mantle. Some oysters reject the bead or die. Oysters have simple nervous systems without a brain; whether they feel anything like pain is not known, and people weigh that differently. Farms need clean water and can help keep it clean, since oysters filter it, but crowded farms can spread disease, as when mass deaths hit Japan’s Akoya farms in the 1990s, and farm gear and added nutrients can harm local waters. Before culturing, natural pearls cost many divers their health or lives.</p>
    <p class="tip"><b>Try it:</b> press play or drag <b>Step</b>, and switch between the four kinds of pearl.</p>
    <p class="note">Sizes and times are typical ranges from the Gemological Institute of America. The tray shows mid-range sizes to scale.</p>`,
  terms: [
    { t: 'Cultured pearl', d: 'A pearl grown with human help, usually from a bead and a mantle graft. It is real nacre.' },
    { t: 'Nucleus (bead)', d: 'A polished bead of shell placed in an oyster as the core of a cultured pearl.' },
    { t: 'Graft (saibo)', d: 'A small square of donor mantle that grows into the pearl sac.' },
    { t: 'Mise–Nishikawa method', d: 'Bead plus mantle graft placed in the gonad: the basis of round pearl culture since the 1900s.' },
    { t: 'Keshi', d: 'A small all-nacre pearl that forms by accident in a cultured oyster, without a bead.' },
  ],
  defaults: { kind: 'akoya', step: 0, play: true },
  onChange(s, key) { if (key === 'step') s.play = false; },
  controls: [
    { key: 'kind', type: 'seg', label: 'Kind of pearl', options: Object.entries(KINDS).map(([v, k]) => ({ v, label: k.n })) },
    { key: 'play', type: 'toggle', label: 'Play' },
    { key: 'step', type: 'range', label: 'Step', min: 0, max: 1, step: 0.005, fmt: (v) => [...STEPS].reverse().find((p) => v >= p[0])[1] },
  ],
  quiz: [
    { q: 'What goes into an oyster to make a round cultured pearl?', options: ['A grain of sand', 'A shell bead and a square of donor mantle', 'A glass bead only', 'A parasite'], answer: 1, why: 'The bead is the core; the donor mantle cells form the pearl sac that coats it in nacre.' },
    { q: 'Who won Japan’s first patent for round cultured pearls, in 1907?', options: ['Kokichi Mikimoto', 'Tatsuhei Mise', 'Carl Linnaeus', 'Pliny the Elder'], answer: 1, why: 'Mise patented it in 1907; Nishikawa filed for the same method that year. Mikimoto adopted it from 1916.' },
    { q: 'Where do most freshwater cultured pearls come from today?', options: ['Japan', 'French Polynesia', 'China', 'Australia'], answer: 2, why: 'China grows freshwater pearls in mussels in vast numbers, far more than any other source.' },
  ],
  reel: [
    { ms: 6000, caption: 'Pearl farmers copy the trick: a shell bead and a scrap of donor mantle, slipped inside by hand.', set: { kind: 'akoya', play: false }, anim: { step: [0.02, 0.5] }, view: { pos: [-0.4, 4.2, 7.4], target: [-1.4, 0.3, 0] }, spin: 0 },
    { ms: 5400, caption: 'Months later, a pearl. Akoya, South Sea, Tahitian or freshwater, from Japan to French Polynesia.', set: { kind: 'tahiti', play: false }, anim: { step: [0.8, 1] }, view: { pos: [1.2, 5.6, 11.5], target: [1.2, 0.2, 0] }, spin: 0.2 },
  ],
  build({ stage, s }) {
    stage.scene.background = new THREE.Color(0x09141c);
    stage.floor.visible = false;
    const root = stage.root;
    const deck = box(16, 0.2, 7, M.matte(0x2b3138)); deck.position.set(1, -1.3, 0); root.add(deck);
    // the oyster (rebuilt when the kind changes)
    let oy = null, kindNow = '';
    const home = new THREE.Vector3(-2.2, 0, 0);
    const wedge = box(0.25, 0.5, 0.25, M.matte(0x9a6a3a)); root.add(wedge);
    // donor mantle strip and its squares
    const graftMat = M.plastic(COL.mantle, { roughness: 0.5, emissive: COL.lime, emissiveIntensity: 0.25 });
    const squares = []; for (let i = 0; i < 4; i++) { const q = box(0.32, 0.06, 0.32, graftMat); root.add(q); squares.push(q); }
    const bead = sphere(0.22, M.plastic(COL.bead, { roughness: 0.3 }), 24); root.add(bead);
    const tool = beam([0, 0, 0], [0, 1.6, 0], 0.025, M.metal()); root.add(tool);
    // raft and net
    const raft = new THREE.Group(); raft.position.set(-2.2, 0, 0); root.add(raft);
    const net = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.8, 3.0), new THREE.MeshBasicMaterial({ color: 0x8ef0ff, wireframe: true, transparent: true, opacity: 0.25 })); net.position.y = 0.1; raft.add(net);
    const water = box(5, 2.2, 4, M.ghost(0x1f6a8a, 0.18)); water.position.y = 0.1; water.castShadow = false; raft.add(water);
    // the tray of finished pearls, to scale (1 unit = 10 mm)
    const tray = new THREE.Group(); tray.position.set(3.6, -1.0, 0); root.add(tray);
    const cloth = box(4.8, 0.12, 2.2, M.matte(0x1b1d2a)); tray.add(cloth);
    const tp = {};
    Object.entries(KINDS).forEach(([k, d], i) => {
      const m = pearlMat(d.c, { sheenColor: new THREE.Color(d.sheen), sheen: 0.8 });
      const r = d.mm / 20, p = sphere(r, m, 48); p.position.set(-1.8 + i * 1.2, 0.06 + r, 0); tray.add(p); tp[k] = p;
      stage.label(`${d.n}<br><small>${d.size}</small>`, [-1.8 + i * 1.2, -0.25, 1.25], tray);
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.03, 8, 48), M.glow(COL.lime)); ring.rotation.x = Math.PI / 2; tray.add(ring);
    const harvested = sphere(1, pearlMat(), 48); root.add(harvested);
    const lStep = stage.label('', [-2.2, 2.2, 0], root, 'hot');
    stage.label('To scale: 1 cm', [3.6, 0.9, -1.0]);
    let ph = 0, tt = 0;
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    return {
      update(dt, st) {
        tt += dt;
        if (st.play) { ph += dt / 14; if (ph > 1.1) ph = 0; st.step = clamp(ph, 0, 1); } else ph = st.step;
        const t = clamp(ph, 0, 1), d = KINDS[st.kind], fresh = st.kind === 'fresh';
        if (kindNow !== st.kind) {
          kindNow = st.kind;
          if (oy) { root.remove(oy); oy.traverse((o) => { o.geometry?.dispose(); }); }
          oy = makeOyster(d.R); oy.rotation.y = -0.3; root.add(oy);
          harvested.material.color.setHex(d.c); harvested.material.sheenColor.setHex(d.sheen); harvested.material.sheen = 0.8;
          bead.visible = !fresh;
        }
        const k1 = smooth(t / 0.15), k2 = smooth((t - 0.15) / 0.25), k3 = smooth((t - 0.4) / 0.15), k4 = smooth((t - 0.55) / 0.3), k5 = smooth((t - 0.85) / 0.15);
        // position: on the bench, then down into the net, then back up
        const down = k4 > 0 && t < 0.85 ? Math.sin(Math.PI * clamp((t - 0.55) / 0.3, 0, 1)) : 0;
        oy.position.copy(home).add(V(0, -down * 0.2, 0));
        raft.visible = t > 0.5 && t < 0.9;
        net.position.y = 0.1; water.material.opacity = 0.18 * smooth((t - 0.5) / 0.05) * (1 - smooth((t - 0.85) / 0.05));
        const gape = t < 0.4 ? 0.35 : t < 0.85 ? lerp(0.35, 0.02, k3) : lerp(0.02, 0.4, k5);
        oy.set({ gape, cut: false, glow: '' }, dt);
        // wedge holds the shell open
        wedge.visible = t < 0.45 || t > 0.86;
        wedge.position.copy(oy.position).add(V(Math.sin(-0.3) * d.R * 0.85, 0.12 + gape * 0.6, Math.cos(-0.3) * d.R * 0.85));
        // gonad in world space
        const gon = oy.gonad.clone().applyAxisAngle(V(0, 1, 0), -0.3).add(oy.position).add(V(0, 0.12, 0));
        // donor strip, cut into squares
        squares.forEach((q, i) => {
          const strip = V(-5.2 + i * 0.33 + k1 * i * 0.15, -1.1, 1.6);
          let p = strip;
          if (i === 0 || (fresh && i < 3)) {
            const entry = gon.clone().add(V(fresh ? (i - 1) * 0.3 : 0.25, 0, fresh ? 0.1 : 0));
            p = strip.clone().lerp(V(-2.2, 1.6, 2.4), smooth(k2 * 2)).lerp(entry, smooth(k2 * 2 - 1));
          }
          q.position.copy(p); q.visible = t < 0.42 || i > (fresh ? 2 : 0);
          q.visible = q.visible && t < 0.85;
        });
        bead.position.copy(V(-4.2, -1.0, 2.0).lerp(V(-2.0, 1.8, 2.4), smooth(k2 * 2)).lerp(gon, smooth(k2 * 2 - 1)));
        bead.visible = !fresh && t < 0.42;
        tool.visible = t > 0.15 && t < 0.4;
        tool.position.copy(bead.position).add(V(0.05, 0.1, 0.1)); tool.rotation.set(-0.7, 0, 0.3);
        // harvest
        harvested.visible = t > 0.86;
        const pr = d.mm / 20;
        const from = gon.clone().add(V(0, 0.2, 0)), to = tray.position.clone().add(tp[st.kind].position);
        harvested.position.copy(from.lerp(to, smooth((t - 0.9) / 0.1)).add(V(0, Math.sin(Math.PI * clamp((t - 0.9) / 0.1, 0, 1)) * 1.2, 0)));
        harvested.scale.setScalar(pr * smooth((t - 0.86) / 0.04) + 0.001);
        Object.entries(tp).forEach(([k, p]) => { p.rotation.y = tt * 0.3; p.visible = !(k === st.kind && t > 0.86 && t < 0.999); });
        ring.position.copy(tp[st.kind].position).setY(0.08);
        lStep.element.textContent = [...STEPS].reverse().find((p) => t >= p[0])[1];
      },
      readout(st) {
        const d = KINDS[st.kind];
        const months = st.step > 0.55 ? Math.round(clamp((st.step - 0.55) / 0.3, 0, 1) * 100) : 0;
        return `<div class="big">${d.n} pearls</div><p class="r-say">${[...STEPS].reverse().find((p) => st.step >= p[0])[1]}${months && st.step < 0.85 ? ` (${months}% of the way)` : ''}.</p>
          <div class="row"><span>Mollusc</span><b>${d.sp}</b></div>
          <div class="row"><span>Mainly from</span><b>${d.where}</b></div>
          <div class="row"><span>Typical size</span><b>${d.size}</b></div>
          <div class="row"><span>Time in the water</span><b>${d.time}</b></div>
          <div class="row"><span>Core</span><b>${d.nuc}</b></div>`;
      },
    };
  },
};
