// Chapter 4: why it shines. Light reflects a little from every boundary between tablet and mortar. The
// reflections from many evenly spaced layers add up strongly for some wavelengths and cancel for others:
// thin-film (multilayer) interference, the same physics as a soap film or an oil slick, repeated hundreds
// of times. The spectrum below is computed with the standard characteristic-matrix method (see pearl.js)
// for N aragonite tablets (n about 1.6) separated by 25 nm organic layers (n about 1.45). Real nacre also
// diffracts light at the stepped edges of its tablets, which adds colour; that is not modelled here.
// Body colour comes from pigments; the overtone is the interference colour floating on top (GIA).
import { THREE, M, COL, pearlMat, sphere, stackReflectance, spectrumColor, wavelengthColor, hud, clearHuds, card, FONT, clamp } from '../pearl.js';
import { box, beam } from '../kit.js';

const BODY = {
  white: { n: 'White', c: 0xf3efe8 },
  cream: { n: 'Cream', c: 0xefe2c4 },
  golden: { n: 'Golden', c: 0xd9b26a },
  dark: { n: 'Dark (Tahitian)', c: 0x3b3a40 },
};
const LMIN = 380, LMAX = 750;

function spectrum(st) {
  const th = (st.angle * Math.PI) / 180, out = [];
  for (let l = LMIN; l <= LMAX; l += 5) out.push([l, stackReflectance(l, { dA: st.dA, N: Math.round(st.n), th })]);
  return out;
}
function peaks(st) {
  const th = (st.angle * Math.PI) / 180, cA = Math.sqrt(1 - (Math.sin(th) / 1.6) ** 2), cO = Math.sqrt(1 - (Math.sin(th) / 1.45) ** 2);
  const opd = 2 * (1.6 * st.dA * cA + 1.45 * 25 * cO), list = [];
  for (let m = 1; m < 12; m++) { const l = opd / m; if (l >= LMIN && l <= LMAX) list.push([m, l]); }
  return list;
}

export default {
  id: 'shine',
  short: 'Why it shines',
  title: 'Colour from layers, not from paint',
  subtitle: 'Light bouncing between hundreds of thin layers adds up into a soft rainbow glow.',
  view: { pos: [0.6, 1.6, 10.5], target: [0.6, 0.6, 0] },
  learn: `<p>Nacre has no rainbow pigment. Its shimmer, called <b>iridescence</b> or <b>orient</b>, comes from its structure. Each boundary between a tablet and the mortar reflects a little light. Light from the second layer has travelled a bit further than light from the first, and so on down the stack.</p>
    <p>When the extra trip is a whole number of wavelengths, the reflections line up and add together: that colour is reflected strongly. For other colours they cancel. This is <b>thin-film interference</b>, the physics of a soap bubble, repeated over hundreds of layers. Because tablets are about half a micrometre thick, several colours line up at once, which gives pearls soft, pastel shades rather than pure ones.</p>
    <p>Tilt the pearl and the light takes a slightly shorter path through each layer, so the colour shifts. Pearl experts call the colour floating on the surface the <b>overtone</b>. The <b>body colour</b> underneath comes from pigments, which is why a dark Tahitian pearl can glow green or peacock. <b>Lustre</b>, the sharp bright reflections, needs smooth, even, thick nacre. Thin or patchy nacre looks chalky.</p>
    <p class="tip"><b>Try it:</b> slide the <b>tablet thickness</b> and watch the peaks move along the spectrum. Change the number of layers: one layer barely shines, and many even layers give stronger, purer colour.</p>
    <p class="note">The spectrum is calculated, not measured, from a simplified stack. Real nacre also diffracts light at the edges of its tablets, which adds colour too.</p>`,
  terms: [
    { t: 'Iridescence', d: 'Colour that changes with viewing angle because of light interfering in a fine structure.' },
    { t: 'Thin-film interference', d: 'Reflections from the top and bottom of thin layers adding or cancelling depending on wavelength.' },
    { t: 'Lustre', d: 'How bright and sharp the reflections on a pearl are. It depends on smooth, even, thick nacre.' },
    { t: 'Overtone', d: 'A translucent colour that seems to float over a pearl’s body colour, such as pink, green or blue.' },
    { t: 'Orient', d: 'The shimmering rainbow play of colour on and just below a pearl’s surface.' },
  ],
  defaults: { dA: 450, n: 16, angle: 10, body: 'white' },
  controls: [
    { key: 'dA', type: 'range', label: 'Tablet thickness', min: 200, max: 900, step: 5, fmt: (v) => Math.round(v) + ' nm', ends: ['thinner', 'thicker'] },
    { key: 'n', type: 'range', label: 'Number of layers', min: 1, max: 40, step: 1, fmt: (v) => Math.round(v) },
    { key: 'angle', type: 'range', label: 'Viewing angle', min: 0, max: 60, step: 1, fmt: (v) => Math.round(v) + '°' },
    { key: 'body', type: 'seg', label: 'Body colour (pigment)', options: Object.entries(BODY).map(([v, b]) => ({ v, label: b.n })) },
  ],
  quiz: [
    { q: 'Where does nacre’s rainbow shimmer come from?', options: ['Rainbow pigments', 'Light interfering between many thin layers', 'A coating of oil', 'Fluorescence'], answer: 1, why: 'Reflections from evenly spaced layers add up for some colours and cancel for others.' },
    { q: 'Why does the colour shift as you tilt a pearl?', options: ['The pigment moves', 'The light’s path through each layer changes', 'The pearl gets warmer', 'It does not shift'], answer: 1, why: 'At a slant, the extra path between layers changes, so different wavelengths line up.' },
    { q: 'What is a pearl’s overtone?', options: ['Its weight', 'A colour that seems to float over the body colour', 'The sound it makes', 'Its size grade'], answer: 1, why: 'The overtone is the interference colour on top. The body colour underneath comes from pigment.' },
  ],
  reel: [
    { ms: 5600, caption: 'The shine is not paint. Light bounces between hundreds of thin layers and some colours add up.', set: { n: 16, angle: 10, body: 'white' }, anim: { dA: [300, 650] }, view: { pos: [0.6, 1.6, 10.5], target: [0.6, 0.6, 0] }, spin: 0 },
  ],
  build({ stage, s }) {
    stage.scene.background = new THREE.Color(0x0a0b11);
    stage.floor.visible = false;
    const root = stage.root;
    // ---- the stack (drawn hugely magnified and with only a few layers)
    const stack = new THREE.Group(); stack.position.set(-2.6, -0.4, 0); root.add(stack);
    const SHOW = 6, PT = 0.22, GAP = 0.06;
    const plates = [];
    for (let i = 0; i < SHOW; i++) { const p = box(3.6, PT, 2, new THREE.MeshPhysicalMaterial({ color: 0xe9e4ea, roughness: 0.2, transparent: true, opacity: 0.55, transmission: 0.2 })); p.position.y = -i * (PT + GAP); stack.add(p); plates.push(p); }
    const mort = box(3.62, SHOW * (PT + GAP), 2.02, M.plastic(0x6a5038, { transparent: true, opacity: 0.25, depthWrite: false })); mort.position.y = -(SHOW - 1) * (PT + GAP) / 2; mort.castShadow = false; stack.add(mort);
    let rays = [];
    // ---- the pearl
    const pm = pearlMat(BODY.white.c);
    const pearl = sphere(1.25, pm, 96); pearl.position.set(2.7, -0.5, 0); root.add(pearl);
    const glow = new THREE.PointLight(0xffffff, 6, 8); glow.position.set(1.0, 2.5, 3); root.add(glow);
    stage.label('Tablets and mortar (a few of hundreds)', [-2.6, 0.55, 1.1]);
    stage.label('Reflections add up', [-0.6, 2.4, 0]);
    // ---- the spectrum panel
    let key = '', col = { r: 1, g: 1, b: 1 }, spec = [];
    const draw = (g, w, h, st) => {
      card(g, w, h, 'Reflected light, by wavelength (calculated)');
      const L = 70, R = w - 150, T = h * 0.2, B = h - 64;
      const X = (l) => L + ((l - LMIN) / (LMAX - LMIN)) * (R - L);
      const mx = Math.max(1e-4, ...spec.map((p) => p[1]));
      const Y = (r) => B - (r / mx) * (B - T);
      for (let l = LMIN; l < LMAX; l += 5) { g.fillStyle = wavelengthColor(l); g.globalAlpha = 0.18; g.fillRect(X(l), T, X(l + 5) - X(l) + 1, B - T); }
      g.globalAlpha = 1;
      g.beginPath(); g.moveTo(X(LMIN), B); spec.forEach(([l, r]) => g.lineTo(X(l), Y(r))); g.lineTo(X(LMAX), B); g.closePath();
      g.fillStyle = 'rgba(255,255,255,0.18)'; g.fill();
      g.beginPath(); spec.forEach(([l, r], i) => (i ? g.lineTo(X(l), Y(r)) : g.moveTo(X(l), Y(r)))); g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.stroke();
      g.font = FONT(20); g.fillStyle = '#737a8e'; g.textAlign = 'center';
      for (const l of [400, 500, 600, 700]) g.fillText(String(l), X(l), B + 26);
      g.fillText('wavelength (nm)', (L + R) / 2, h - 12);
      g.textAlign = 'left'; g.fillText(`peak ${(mx * 100).toFixed(mx < 0.1 ? 1 : 0)}%`, L, T - 8);
      // swatch
      g.fillStyle = `rgb(${(col.r * 255) | 0},${(col.g * 255) | 0},${(col.b * 255) | 0})`; g.beginPath(); g.roundRect(R + 26, T, 96, 96, 14); g.fill();
      g.fillStyle = '#a8aebf'; g.font = FONT(18); g.fillText('its colour', R + 30, T + 124);
    };
    const pn = hud(stage, 760, 400, draw, { wFrac: 0.36, top: 0.05 });
    return {
      dispose() { clearHuds(); },
      update(dt, st) {
        pn.dock();
        const k = [Math.round(st.dA), Math.round(st.n), Math.round(st.angle), st.body].join('|');
        if (k === key) return;
        key = k;
        spec = spectrum(st);
        const sp = new Map(spec);
        col = spectrumColor((l) => sp.get(Math.round(l / 5) * 5) ?? 0, { gain: 1 });
        // normalise to full brightness so the hue reads; the panel shows the real strength
        const mxc = Math.max(col.r, col.g, col.b, 1e-6); col = { r: col.r / mxc, g: col.g / mxc, b: col.b / mxc };
        pn.redraw(st);
        const over = new THREE.Color(col.r, col.g, col.b);
        pm.color.setHex(BODY[st.body].c).lerp(over, 0.12);
        pm.emissive.copy(over); pm.emissiveIntensity = st.body === 'dark' ? 0.06 : 0.1;
        pm.sheenColor.copy(over); pm.sheen = st.body === 'dark' ? 0.45 : 0.9;
        pm.iridescenceThicknessRange = [st.dA * 0.85, st.dA];
        pm.iridescence = clamp(0.25 + st.n / 30, 0.25, 1);
        // rays
        rays.forEach((r) => { root.remove(r); r.geometry.dispose(); });
        rays = [];
        const th = (Math.max(st.angle, 4) * Math.PI) / 180, hitX = -2.6, top = -0.4 + PT / 2;
        const inc = beam([hitX - Math.sin(th) * 4, top + Math.cos(th) * 4, 0], [hitX, top, 0], 0.03, M.glow(0xffffff)); root.add(inc); rays.push(inc);
        const shown = Math.min(SHOW, Math.round(st.n));
        for (let i = 0; i < shown; i++) {
          const y = top - i * (PT + GAP), x = hitX + i * 0.18 * Math.tan(th) * 2 + i * 0.06;
          const m = M.glow(over.clone(), { transparent: true, opacity: 1 - i * 0.12 });
          const r = beam([x, y, 0], [x + Math.sin(th) * 4.2, y + Math.cos(th) * 4.2, 0], 0.022, m); root.add(r); rays.push(r);
        }
        plates.forEach((p, i) => { p.visible = i < shown; });
      },
      readout(st) {
        const pk = peaks(st);
        return `<div class="big">${Math.round(st.dA)} nm tablets</div><p class="r-say">${st.n < 3 ? 'With so few layers the reflection is weak: a dull, pale sheen.' : 'Colours whose extra trip is a whole number of wavelengths add up. Several do at once, so the result is a soft pastel.'}</p>
          <div class="row"><span>Colours that add up</span><b>${pk.length ? pk.map(([m, l]) => Math.round(l) + ' nm').join(', ') : 'none in the visible range'}</b></div>
          <div class="row"><span>Layers</span><b>${Math.round(st.n)}</b></div>
          <div class="row"><span>Body colour</span><b>${BODY[st.body].n}</b></div>`;
      },
    };
  },
};
