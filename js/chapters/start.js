// Chapter 2: how a pearl starts. A slice through the shell and mantle, seen from the side.
// Current understanding (GIA lab notes; Natural History Museum, London; Gim et al. 2021, PNAS): a free pearl
// needs a PEARL SAC, a pocket of mantle epithelial cells inside the soft tissue that secretes nacre inward.
// In natural pearls the cells usually get there when something breaks in: a burrowing parasite or an injury
// drags a few epithelial cells into the tissue. A grain of sand rarely starts a pearl. Grit that gets
// between mantle and shell is usually flushed out, or coated where it lies and joined to the shell as a
// blister. Cultured pearls copy the natural route on purpose with a bead and a scrap of donor mantle.
import { THREE, M, COL, pearlMat, nacreMat, sphere, canvasTexture, clamp, lerp, smooth } from '../pearl.js';
import { box, swarm } from '../kit.js';

const MODES = {
  sand: { n: 'Grain of sand', verdict: 'Rarely a pearl', say: 'The popular story. Grit that gets between the mantle and the shell is usually flushed out. If it stays, it is coated where it lies and welded to the shell as a blister, not a loose round pearl. No cells are carried into the tissue, so no pearl sac forms.' },
  parasite: { n: 'Parasite', verdict: 'A natural pearl', say: 'The likeliest start for many natural pearls. A tiny worm or larva bores in and drags a few mantle cells with it into the tissue. The cells multiply into a pocket, the pearl sac, and coat the intruder with nacre.' },
  injury: { n: 'Injury', verdict: 'A natural pearl', say: 'A wound can do the same without an invader. A tear pushes a few epithelial cells into the tissue, where they form a sac and start making nacre, often around nothing much at all.' },
  bead: { n: 'Cultured: bead + graft', verdict: 'A cultured pearl', say: 'People copy the natural route. A technician slips a shell bead and a small square of mantle cut from a donor oyster into the tissue. The donor cells grow round the bead into a pearl sac.' },
};
const PH = [
  [0, 'The intruder arrives'], [0.25, 'Cells are carried into the tissue'], [0.45, 'The cells multiply into a pearl sac'], [0.7, 'The sac coats it in nacre, layer by layer'],
];
const C = new THREE.Vector3(0, 0.9, -0.12);

export default {
  id: 'start',
  short: 'How a pearl starts',
  title: 'Not a grain of sand',
  subtitle: 'A pearl needs a pocket of shell-making cells inside the oyster: a pearl sac.',
  view: { pos: [0.3, 2.9, 9.8], target: [0, 1.4, -0.3] },
  learn: `<p>Everyone has heard it: a grain of sand gets into an oyster, and the oyster coats it in pearl. Oysters live in sand and silt all the time, though, and that story is <b>rarely</b> how it happens. Grit that slips between the mantle and the shell is usually flushed out. If it sticks, it is coated where it lies and joined to the shell as a <b>blister</b>.</p>
    <p>A loose, round pearl needs something more: shell-making cells in the wrong place. If a few cells of the mantle’s outer <b>epithelium</b> end up inside the soft tissue, they keep doing their one job. They multiply into a closed pocket, the <b>pearl sac</b>, and lay down nacre on whatever is inside it.</p>
    <p>For natural pearls, the most common way in is thought to be a <b>parasite</b>, such as a burrowing worm or a fluke larva, or an <b>injury</b>. Gem labs have found tunnels from boring parasites inside natural pearls. The exact trigger for any one pearl is usually unknown, so treat this as the best current explanation, not a closed case.</p>
    <p class="tip"><b>Try it:</b> pick a starting point and press play, or drag <b>Time</b>. Compare where the cells go with sand and with a parasite.</p>
    <p class="note">Drawn as a slice, enormously magnified. Real pearl sacs take weeks to form.</p>`,
  terms: [
    { t: 'Pearl sac', d: 'A closed pocket of mantle epithelial cells inside the tissue that secretes nacre inward. Every pearl grows inside one.' },
    { t: 'Blister pearl', d: 'A lump of nacre grown onto the inside of the shell, often over an intruder. It is part of the shell, not a loose pearl.' },
    { t: 'Natural pearl', d: 'A pearl that formed with no help from people.' },
    { t: 'Graft', d: 'A small square of mantle tissue from a donor oyster, put in to make a cultured pearl.' },
  ],
  defaults: { mode: 'parasite', t: 0, play: true },
  onChange(s, key) { if (key === 't') s.play = false; if (key === 'mode') s.t = 0; },
  controls: [
    { key: 'mode', type: 'seg', label: 'What gets in', options: Object.entries(MODES).map(([v, m]) => ({ v, label: m.n })) },
    { key: 'play', type: 'toggle', label: 'Play' },
    { key: 't', type: 'range', label: 'Time', min: 0, max: 1, step: 0.005, fmt: (v) => (v < 0.25 ? 'arriving' : v < 0.45 ? 'cells carried in' : v < 0.7 ? 'pearl sac forms' : 'nacre grows') },
  ],
  quiz: [
    { q: 'What does every pearl grow inside?', options: ['A grain of sand', 'A pearl sac of mantle cells', 'The gills', 'A bubble of water'], answer: 1, why: 'The sac is a pocket of shell-making cells. It lays nacre inward, onto whatever is in the middle.' },
    { q: 'Why does a grain of sand rarely make a pearl?', options: ['Sand is too hard', 'It usually stays outside the tissue, so no cells are carried in', 'Oysters never meet sand', 'Sand dissolves'], answer: 1, why: 'Sand is usually flushed out. If it sticks between mantle and shell it is coated onto the shell as a blister.' },
    { q: 'What do pearl farmers put into an oyster?', options: ['A grain of sand', 'A shell bead and a square of donor mantle', 'A drop of glue', 'A parasite'], answer: 1, why: 'The donor mantle cells grow round the bead into a pearl sac, which then covers the bead in nacre.' },
  ],
  reel: [
    { ms: 5000, caption: 'The grain of sand story? A pearl almost never starts that way.', set: { mode: 'sand', play: false, t: 0 }, anim: { t: [0.05, 1] }, view: { pos: [0.3, 3.0, 9.5], target: [0, 1.4, -0.3] }, spin: 0 },
    { ms: 6000, caption: 'Usually a parasite or a wound drags a few shell-making cells inside, and they form a pearl sac.', set: { mode: 'parasite', play: false, t: 0 }, anim: { t: [0, 1] }, view: { pos: [0.3, 2.6, 8.5], target: [0, 1.2, -0.3] }, spin: 0 },
  ],
  build({ stage, s }) {
    stage.scene.background = new THREE.Color(COL.sea);
    stage.floor.visible = false;
    const root = stage.root;
    const X0 = -4.5, X1 = 4.5, Z0 = -0.8;
    // shell slab: outside brown, inside nacre
    const shell = box(X1 - X0, 0.3, -Z0, M.matte(COL.shellOut)); shell.position.set(0, 2.45, Z0 / 2); root.add(shell);
    const nac = box(X1 - X0, 0.08, -Z0, nacreMat()); nac.position.set(0, 2.26, Z0 / 2); root.add(nac);
    // mantle tissue (translucent so the sac shows)
    const back = box(X1 - X0, 1.5, 0.3, M.plastic(COL.tissue, { roughness: 0.75, emissive: 0x5a2018, emissiveIntensity: 0.35 })); back.position.set(0, 0.88, Z0 + 0.15); root.add(back);
    const tissue = box(X1 - X0, 1.5, -Z0 - 0.3, M.plastic(COL.tissue, { transparent: true, opacity: 0.22, depthWrite: false, roughness: 0.7 })); tissue.position.set(0, 0.88, (Z0 + 0.3) / 2); tissue.castShadow = false; root.add(tissue);
    // epithelium: a sheet of cells on top of the tissue
    const NX = 30, NZ = 3;
    const cellMat = M.plastic(COL.cell, { roughness: 0.5, emissive: 0x2a4a08, emissiveIntensity: 0.35 });
    const row = swarm(NX * NZ, new THREE.BoxGeometry(0.27, 0.2, 0.24), cellMat);
    const rowPos = (i, k) => [X0 + 0.15 + i * 0.3, 1.74, -0.12 - k * 0.27];
    let n = 0; for (let i = 0; i < NX; i++) for (let k = 0; k < NZ; k++) row.place(n++, rowPos(i, k));
    row.done(); root.add(row);
    const inner = swarm(NX, new THREE.BoxGeometry(0.27, 0.1, 0.7), M.plastic(0xc98b7a, { roughness: 0.6 }));
    for (let i = 0; i < NX; i++) inner.place(i, [X0 + 0.15 + i * 0.3, 0.08, -0.4]); inner.done(); root.add(inner);
    // the pearl sac cells
    const NS = 54, CAR = 6;
    const sac = swarm(NS, new THREE.SphereGeometry(0.075, 12, 8), cellMat);
    const sphPos = (i, r) => { const y = 1 - (2 * (i + 0.5)) / NS, rr = Math.sqrt(1 - y * y), a = i * 2.39996; return new THREE.Vector3(C.x + Math.cos(a) * rr * r, C.y + y * r, C.z + Math.sin(a) * rr * r); };
    root.add(sac);
    // intruders
    const worm = new THREE.Group(); const wm = M.plastic(COL.coral, { roughness: 0.5 });
    const seg = []; for (let i = 0; i < 7; i++) { const b = sphere(0.07 - i * 0.006, wm, 12); worm.add(b); seg.push(b); }
    root.add(worm);
    const grain = new THREE.Mesh(new THREE.DodecahedronGeometry(0.15, 0), M.matte(0xc9a86a)); grain.scale.set(1.2, 0.8, 1); root.add(grain);
    const bead = sphere(0.3, M.plastic(COL.bead, { roughness: 0.35 }), 32); root.add(bead);
    const tear = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.9, 4), M.glow(0x7a1f1f)); tear.rotation.z = Math.PI; root.add(tear);
    const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.8, 8), M.metal()); root.add(needle);
    // the growing pearl: back half of a sphere plus a cut face showing its layers
    const pearl = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24, Math.PI, Math.PI), pearlMat()); pearl.position.copy(C); root.add(pearl);
    let ringMode = '';
    const rings = canvasTexture(256, 256, (g, w, h, mode = 'parasite') => {
      g.clearRect(0, 0, w, h);
      const R = w / 2, core = mode === 'bead' ? 0.7 : 0.08;
      g.fillStyle = '#efe9df'; g.beginPath(); g.arc(R, R, R - 1, 0, 7); g.fill();
      for (let k = 0; k < 18; k++) { const r = (core + (1 - core) * (k / 18)) * (R - 1); g.strokeStyle = k % 3 ? 'rgba(170,150,140,.35)' : 'rgba(120,100,95,.5)'; g.lineWidth = 1.5; g.beginPath(); g.arc(R, R, r, 0, 7); g.stroke(); }
      if (mode === 'bead') { g.fillStyle = '#f7f4ec'; g.beginPath(); g.arc(R, R, core * (R - 1), 0, 7); g.fill(); g.strokeStyle = 'rgba(160,140,120,.5)'; for (let y = -R; y < R; y += 9) { g.beginPath(); g.moveTo(R - core * R, R + y * core); g.lineTo(R + core * R, R + y * core); g.stroke(); } }
      else { g.fillStyle = mode === 'parasite' ? '#a0503a' : '#b9a59a'; g.beginPath(); g.arc(R, R, R * core, 0, 7); g.fill(); }
    });
    const face = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshStandardMaterial({ map: rings.tex, roughness: 0.4 })); face.position.copy(C); face.position.z += 0.002; root.add(face);
    // blister for the sand case
    const blister = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), pearlMat()); blister.position.set(0, 2.22, -0.3); root.add(blister);

    const lbl = {
      shell: stage.label('Shell, nacre side down', [-3.2, 2.85, 0]),
      epi: stage.label('Mantle epithelium', [-3.2, 1.45, 0.2]),
      tissue: stage.label('Mantle tissue', [3.0, 0.5, 0.1]),
      sac: stage.label('Pearl sac', [1.0, 1.25, 0.2], root, 'hot'),
      blist: stage.label('Coated onto the shell: a blister', [1.9, 2.6, 0.1], root, 'hot'),
    };
    let ph = 0;
    return {
      update(dt, st) {
        if (st.play) { ph += dt / 11; if (ph > 1.15) ph = 0; st.t = clamp(ph, 0, 1); } else ph = st.t;
        const t = clamp(ph, 0, 1), m = st.mode;
        if (ringMode !== m) { ringMode = m; rings.redraw(m); }
        const k1 = smooth(t / 0.25), k2 = smooth((t - 0.25) / 0.2), k3 = smooth((t - 0.45) / 0.25), k4 = smooth((t - 0.7) / 0.3);
        const time = t * 40;
        const enter = m === 'parasite' || m === 'injury' || m === 'bead';
        // intruder positions
        worm.visible = m === 'parasite'; grain.visible = m === 'sand'; bead.visible = m === 'bead'; needle.visible = m === 'bead' && t < 0.47; tear.visible = m === 'injury' && t < 0.7;
        const top = new THREE.Vector3(lerp(X0 + 0.3, 0, k1), 2.02, -0.12);
        const head = top.clone().lerp(C, k2);
        if (m === 'parasite') {
          seg.forEach((b, i) => {
            const back = i * 0.11, wig = Math.sin(time * 1.3 - i * 1.1) * 0.04;
            const p = k2 > 0 ? head.clone().add(new THREE.Vector3(0, back * (1 - k2 * 0.3), 0)) : new THREE.Vector3(top.x - back, top.y + wig, top.z);
            if (k2 > 0) p.x += wig;
            b.position.copy(p); b.scale.setScalar(1 - k4 * 0.4);
          });
        }
        if (m === 'sand') grain.position.set(lerp(X0 + 0.3, 0, k1), 2.1, -0.3), grain.rotation.set(t * 6, t * 4, 0);
        if (m === 'injury') { tear.position.set(0, 1.62, -0.12); tear.scale.set(1, smooth(t / 0.25) * (1 - k4), 1); }
        const bstart = new THREE.Vector3(1.6, -1.0, -0.12), bk = smooth(t / 0.45);
        if (m === 'bead') {
          bead.position.copy(bstart).lerp(C, bk);
          const dir = bstart.clone().sub(C).normalize();
          needle.position.copy(bead.position).addScaledVector(dir, 1.2);
          needle.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        }
        // sac cells
        const r0p = m === 'bead' ? 0.3 : 0.02, r1p = m === 'bead' ? 0.5 : 0.42, prNow = lerp(r0p, r1p, k4);
        const rs = Math.max(m === 'bead' ? 0.4 : 0.34, prNow + 0.08);
        for (let i = 0; i < NS; i++) {
          let p, sc;
          const target = sphPos(i, rs);
          if (!enter) { sac.place(i, [0, -50, 0], null, 0.001); continue; }
          const carried = i < CAR;
          let start;
          if (m === 'bead') {
            const off = new THREE.Vector3(0.36, 0.05 + (i % CAR) * 0.06 - 0.15, 0.1 * ((i % 3) - 1));
            start = bead.position.clone().add(off);
          } else {
            const rp = rowPos(14 + (i % 2), i % 3);
            const home = new THREE.Vector3(...rp);
            const near = head.clone().add(new THREE.Vector3(Math.cos(i * 2.1) * 0.13, 0.1 + (i % CAR) * 0.03, Math.sin(i * 2.1) * 0.13));
            start = home.lerp(near, k2);
          }
          if (carried) { p = start.clone().lerp(target, k3); sc = 1; }
          else { const born = smooth((k3 - (i / NS) * 0.6) / 0.4); const src = start; p = src.clone().lerp(target, born); sc = born; }
          if (k4 > 0 && p.z > C.z + 0.04) sc *= 1 - smooth(k4 * 4);
          sac.place(i, [p.x, p.y, p.z], null, Math.max(0.001, sc));
        }
        sac.done();
        // pearl
        const r0 = r0p, r1 = r1p;
        const pr = enter && k4 > 0 ? lerp(r0, r1, k4) : 0.001;
        pearl.visible = face.visible = enter && k4 > 0;
        pearl.scale.setScalar(pr); face.scale.setScalar(pr);
        blister.visible = m === 'sand' && t > 0.45;
        blister.scale.set(0.42 * smooth((t - 0.45) / 0.55) + 0.001, 0.3 * smooth((t - 0.45) / 0.55) + 0.001, 0.42 * smooth((t - 0.45) / 0.55) + 0.001);
        lbl.sac.visible = enter && t > 0.5; lbl.blist.visible = m === 'sand' && t > 0.55;
      },
      readout(st) {
        const md = MODES[st.mode], t = clamp(st.t, 0, 1);
        const stage = st.mode === 'sand' ? (t < 0.25 ? 'Grit slips between mantle and shell' : t < 0.45 ? 'No cells are carried into the tissue' : 'It is coated onto the shell where it lies') : st.mode === 'bead' ? (t < 0.45 ? 'Bead and graft are slipped into the tissue' : t < 0.7 ? 'Donor cells grow round the bead into a sac' : 'The sac coats the bead in nacre') : [...PH].reverse().find((p) => t >= p[0])[1];
        return `<div class="big">${md.n}</div><p class="r-say">${md.say}</p>
          <div class="row"><span>Now</span><b>${stage}</b></div>
          <div class="row"><span>Result</span><b>${md.verdict}</b></div>`;
      },
    };
  },
};
