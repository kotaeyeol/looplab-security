/* The underground security control room (map 2), built from primitives.
   Shared by the title screen (as a backdrop) and the 30-day game page. */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { fetchGLB, iconCanvas, rr, CONCEPT, GEAR, GEAR_ORDER, CAST } from './common.js';

export const ROOM = { W: 4.6, D: 2.6, H: 2.5 };
/* scene slots from the scenario doc (§3) */
export const SLOT = {
  D: [-3.0, 1.9, -2.45], B: [-4.2, 1.0, -0.3], M: [-0.4, 1.65, -2.45], T: [0, 0.7, 0.85],
  C1: [-0.55, 0.6, 0.05], C2: [0.55, 0.6, 0.05], C3: [1.8, 0.6, 0.95],
  R1: [1.45, 1.1, -2.2], R2: [2.3, 1.1, -2.2], R3: [3.15, 1.1, -2.2],
  I: [4.45, 1.3, 0.55], U: [3.95, 0.6, 1.75], Q: [-3.95, 0.4, 1.55], W: [4.45, 1.6, -0.9], K: [3.25, 0.5, -1.0],
};

export function buildBunker(scene, renderer, o = {}) {
  const world = new THREE.Group(); scene.add(world);
  const mcache = {};
  const mat = (color, p = {}) => { const k = color + JSON.stringify(p); return mcache[k] || (mcache[k] = new THREE.MeshStandardMaterial({ color, roughness: p.r ?? 0.85, metalness: p.m ?? 0, emissive: p.e ?? 0, emissiveIntensity: p.ei ?? 1, transparent: !!p.t, opacity: p.t ?? 1 })); };
  const glow = (c, k = 3) => mcache['g' + c + k] || (mcache['g' + c + k] = new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k) }));
  function box(w, h, d, color, x, y, z, p = {}) {
    const g = p.round ? new RoundedBoxGeometry(w, h, d, 2, Math.min(p.round, w / 2, h / 2, d / 2)) : new THREE.BoxGeometry(w, h, d);
    const m = new THREE.Mesh(g, typeof color === 'object' ? color : mat(color, p)); m.position.set(x, y + h / 2, z);
    m.castShadow = p.cast !== false; m.receiveShadow = true; (p.parent || world).add(m); return m;
  }
  function cyl(rt, rb, h, color, x, y, z, p = {}) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, p.seg || 18), typeof color === 'object' ? color : mat(color, p));
    m.position.set(x, y + h / 2, z); m.castShadow = p.cast !== false; m.receiveShadow = true; (p.parent || world).add(m); return m;
  }
  function tex(w, h, draw) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
  const poolTex = tex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.3)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
  function pool(x, z, r, col, op = 0.4, y = 0.012, parent = world) { const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: poolTex, color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); parent.add(m); return m; }
  function wallGlow(x, y, z, col, r, op, ry = 0) { const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: poolTex, color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false })); m.position.set(x, y, z); m.rotation.y = ry; world.add(m); return m; }
  const { W, D, H } = ROOM;

  /* ---------- lights ---------- */
  scene.add(new THREE.HemisphereLight(0xffe2c4, 0x2a2440, 0.5));
  const key = new THREE.DirectionalLight(0xffd9b0, 0.55); key.position.set(-3, 9, 7); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { left: -7, right: 7, top: 6, bottom: -6, near: 1, far: 25 }); key.shadow.bias = -0.0008; key.shadow.normalBias = 0.03;
  scene.add(key);
  const warm = (x, y, z, i = 6, d = 5) => { const p = new THREE.PointLight(0xffb066, i, d, 1.6); p.position.set(x, y, z); world.add(p); return p; };
  const deskLight = warm(0, 2.3, 0.9, 7, 5.5);
  warm(-3.7, 1.7, -0.3, 2.6, 3.2); warm(-2.9, 2.6, -2.2, 3.2, 3.5); warm(-0.4, 2.2, -1.7, 3.5, 3.5); warm(3.6, 1.9, 1.0, 5, 4); warm(3.4, 1.6, -1.0, 3, 3);
  const rackLight = new THREE.PointLight(0x3d7fff, 9, 4.5, 1.6); rackLight.position.set(2.3, 1.5, -1.5); world.add(rackLight);
  const monLight = new THREE.PointLight(0x5aa0ff, 4, 3.5, 1.6); monLight.position.set(-0.4, 1.5, -1.8); world.add(monLight);

  /* ---------- floor + shell ---------- */
  const floorT = tex(512, 512, (g, w, h) => {
    g.fillStyle = '#8c8790'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '40,30,50'},${Math.random() * 0.05})`; g.fillRect(Math.random() * w, Math.random() * h, 3, 3); }
    g.strokeStyle = 'rgba(40,32,48,0.28)'; g.lineWidth = 2; for (let i = 0; i <= 2; i++) { g.beginPath(); g.moveTo(i * 256, 0); g.lineTo(i * 256, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 256); g.lineTo(w, i * 256); g.stroke(); }
  });
  floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping; floorT.repeat.set(W, D);
  { const f = new THREE.Mesh(new THREE.BoxGeometry(W * 2, 0.4, D * 2 + 0.3), [mat(0x3a3644), mat(0x3a3644), new THREE.MeshStandardMaterial({ map: floorT, roughness: 0.42, metalness: 0.06 }), mat(0x3a3644), mat(0x4a4554), mat(0x4a4554)]);
    f.position.set(0, -0.2, 0.15); f.receiveShadow = true; world.add(f); }
  { const g = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), new THREE.MeshStandardMaterial({ color: 0x1e1c28, roughness: 1 })); g.rotation.x = -Math.PI / 2; g.position.set(0, -0.42, 6); g.receiveShadow = true; world.add(g); }
  const blockT = tex(512, 512, (g, w, h) => {
    g.fillStyle = '#8a8393'; g.fillRect(0, 0, w, h);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { const x = c * 171 + (r % 2 ? 85 : 0), y = r * 128; g.fillStyle = `rgb(${132 + (r * 7 + c * 13) % 14},${126 + (r * 5 + c * 11) % 12},${142 + (r * 3 + c * 7) % 12})`; g.fillRect(x + 3, y + 3, 165, 122); g.fillRect(x - 171 + 3, y + 3, 165, 122); }
    g.strokeStyle = 'rgba(45,38,55,0.55)'; g.lineWidth = 4; for (let r = 0; r <= 4; r++) { g.beginPath(); g.moveTo(0, r * 128); g.lineTo(w, r * 128); g.stroke(); }
    for (let i = 0; i < 1800; i++) { g.fillStyle = `rgba(30,20,40,${Math.random() * 0.06})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  });
  blockT.wrapS = blockT.wrapT = THREE.RepeatWrapping;
  function wall(x, z, w, h, d, rep = 1) {
    const t = blockT.clone(); t.needsUpdate = true; t.repeat.set(Math.max(w, d) / 1.6, h / 1.6);
    const m = box(w, h, d, new THREE.MeshStandardMaterial({ map: t, roughness: 0.92 }), x, 0, z);
    box(w + 0.06, 0.12, d + 0.06, 0xa49dac, x, h, z, { cast: false, round: 0.02 });
    return m;
  }
  wall(1.375, -D - 0.15, 7.05, H, 0.3);                      // back wall (right of stairwell)
  wall(-W + 1.1, -D - 0.75, 2.5, H + 0.9, 0.3);              // back wall behind the raised door, set back
  wall(-W - 0.15, -0.3, 0.3, H, D * 2 + 1.2);                 // left
  wall(W + 0.15, 0, 0.3, H, D * 2 + 0.6);                    // right
  wall(-2.15, -D - 0.45, 0.3, H + 0.3, 0.9);                 // stairwell side return
  box(W * 2 + 0.6, 0.32, 0.36, 0x7d7787, 0, 0, D + 0.2, { round: 0.03 });   // front ledge (cut-away)
  box(W * 2 + 0.66, 0.06, 0.42, 0xa49dac, 0, 0.32, D + 0.2, { cast: false, round: 0.02 });
  [-W - 0.1, W + 0.1].forEach(x => { box(0.5, 0.9, 0.5, 0x7d7787, x, 0, D + 0.15, { round: 0.04 }); box(0.56, 0.06, 0.56, 0xa49dac, x, 0.9, D + 0.15, { cast: false }); });

  /* ---------- stairs + door (D) ---------- */
  const SX0 = -3.55, SX1 = -2.35, steps = 7, top = 1.1, zTop = -2.05, zBot = -0.55;
  for (let i = 0; i < steps; i++) {
    const h = top * (i + 1) / steps, z0 = zBot - (zBot - zTop) * i / steps, z1 = zBot - (zBot - zTop) * (i + 1) / steps;
    box(SX1 - SX0, h, z0 - z1, 0x958e9c, (SX0 + SX1) / 2, 0, (z0 + z1) / 2, { round: 0.015 });
    box(SX1 - SX0 - 0.1, 0.012, 0.04, glow(0xffb45a, 1.6), (SX0 + SX1) / 2, h, z0 - 0.03, { cast: false });
  }
  box(1.6, top, D - Math.abs(zTop) + 0.75, 0x958e9c, -3.0, 0, (zTop - D - 0.6) / 2);           // landing
  const door = new THREE.Group(); door.position.set(-3.0, top, -D - 0.58); world.add(door);
  box(1.06, 1.62, 0.12, 0x4a4552, 0, 0, 0, { parent: door, round: 0.03, m: 0.4, r: 0.5 });
  const doorLeaf = box(0.86, 1.48, 0.08, 0x6b6372, 0, 0.04, 0.07, { parent: door, round: 0.02, m: 0.5, r: 0.45 });
  box(0.4, 0.14, 0.02, 0x9aa0aa, 0, 1.15, 0.12, { parent: door, m: 0.7, r: 0.3 });
  cyl(0.025, 0.025, 0.18, 0xc9c3b6, 0.32, 0.62, 0.13, { parent: door, m: 0.8, r: 0.3 });
  const doorLamp = box(0.34, 0.06, 0.08, glow(0xffb45a, 3), 0, 1.66, 0.08, { parent: door, cast: false });
  wallGlow(-3.0, top + 1.2, -D - 0.42, 0xffa64d, 1.0, 0.35);
  // railing with warm LED
  const railMat = mat(0x6e5236, { r: 0.5 });
  { const len = Math.hypot(zBot - zTop, top), ang = Math.atan2(top, zBot - zTop);
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, len, 10), railMat); r.position.set(SX1 + 0.04, top / 2 + 0.75, (zBot + zTop) / 2); r.rotation.x = Math.PI / 2 - ang; r.rotation.x = -(Math.PI / 2 - ang); world.add(r);
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.015, len), glow(0xffb45a, 2.6)); l.position.set(SX1 + 0.04, top / 2 + 0.71, (zBot + zTop) / 2); l.rotation.x = ang; world.add(l);
    [zBot, (zBot + zTop) / 2, zTop].forEach((z, i) => box(0.04, 0.75, 0.04, 0x5b4a3a, SX1 + 0.04, top * i / 2, z)); }
  box(0.06, 0.04, 1.4, glow(0xffb45a, 2.2), -W + 0.02, 1.45, -1.6, { cast: false });

  /* ---------- shelf (B) with gear tiles ---------- */
  const shelf = new THREE.Group(); shelf.position.set(-W + 0.27, 0, -0.35); shelf.rotation.y = Math.PI / 2; world.add(shelf);
  const SW = 1.9, SH = 1.95, levels = [0.05, 0.52, 0.99, 1.46];
  [-SW / 2, SW / 2].forEach(x => box(0.06, SH, 0.46, 0x7a6450, x, 0, 0, { parent: shelf }));
  levels.forEach(y => { box(SW, 0.045, 0.46, 0x8c735c, 0, y, 0, { parent: shelf }); box(SW - 0.1, 0.012, 0.02, glow(0xffb45a, 2.4), 0, y - 0.015, 0.22, { parent: shelf, cast: false }); });
  box(SW, 0.05, 0.46, 0x8c735c, 0, SH, 0, { parent: shelf });
  const shelfSlots = []; // 6 gear spots on the 2 middle levels, then supplies on the bottom
  [levels[2], levels[1]].forEach(y => [-0.6, 0, 0.6].forEach(x => shelfSlots.push([x, y + 0.045])));
  const supplySlots = [[-0.55, levels[0] + 0.045], [0.05, levels[0] + 0.045], [0.6, levels[0] + 0.045]];
  // decor on the top level
  box(0.36, 0.3, 0.32, 0x2f3340, -0.55, levels[3] + 0.045, 0, { parent: shelf, round: 0.03 });
  [0, 1, 2, 3].forEach(i => box(0.07, 0.3 - (i % 2) * 0.05, 0.26, [0x5774a8, 0xd2643f, 0x5e8d5a, 0xe0b04a][i], 0.2 + i * 0.08, levels[3] + 0.045, 0, { parent: shelf }));
  wallGlow(-W + 0.03, 1.2, -0.35, 0xffa64d, 1.1, 0.28, Math.PI / 2);
  pool(-W + 0.6, -0.35, 1.0, 0xffa64d, 0.35);

  const gearTiles = {};
  const tileGeo = new THREE.PlaneGeometry(0.34, 0.34);
  function gearTile(id, i) {
    const gd = GEAR[id], col = CONCEPT[gd.concept].color;
    const g = new THREE.Group(); const [x, y] = shelfSlots[i]; g.position.set(x, y, 0.04); shelf.add(g);
    box(0.4, 0.06, 0.3, 0x2a2f3c, 0, 0, 0, { parent: g, round: 0.02 });
    const t = new THREE.CanvasTexture(iconCanvas(gd.icon, col, 128, true)); t.colorSpace = THREE.SRGBColorSpace;
    const face = new THREE.Mesh(tileGeo, new THREE.MeshBasicMaterial({ map: t, transparent: true, color: new THREE.Color(0.45, 0.45, 0.5) }));
    face.position.set(0, 0.24, 0.02); face.rotation.x = -0.12; g.add(face);
    const badge = new THREE.Mesh(new THREE.CircleGeometry(0.055, 20), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x5ef2b0).multiplyScalar(2.5) }));
    badge.position.set(0.14, 0.38, 0.05); badge.visible = false; g.add(badge);
    const lbl = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.07), new THREE.MeshBasicMaterial({ map: tex(160, 32, (c, w, h) => { c.fillStyle = '#1b1f2c'; c.fillRect(0, 0, w, h); c.fillStyle = col; c.font = 'bold 22px sans-serif'; c.textAlign = 'center'; c.fillText(gd.code, w / 2, 24); }) }));
    lbl.position.set(0, 0.035, 0.155); g.add(lbl);
    gearTiles[id] = { g, face, badge };
  }
  const supplyMeshes = {};
  function supplyMesh(id, i) {
    const g = new THREE.Group(); const [x, y] = supplySlots[i]; g.position.set(x, y, 0.02); shelf.add(g);
    if (id === 'food') { box(0.46, 0.3, 0.34, 0xc9a26a, 0, 0, 0, { parent: g, round: 0.02 }); box(0.12, 0.12, 0.01, 0xd9473a, 0, 0.1, 0.175, { parent: g, cast: false }); }
    if (id === 'coffee') { [-0.12, 0, 0.12].forEach((dx, k) => cyl(0.045, 0.04, 0.12, [0xf4efe6, 0xd2643f, 0xf0b84a][k], dx, 0, 0, { parent: g })); box(0.3, 0.16, 0.18, 0x6b4b34, 0.05, 0, -0.06, { parent: g, round: 0.02 }); }
    supplyMeshes[id] = g;
  }

  /* ---------- quarantine crate (Q) ---------- */
  const qGroup = new THREE.Group(); qGroup.position.set(SLOT.Q[0], 0, SLOT.Q[2]); qGroup.rotation.y = 0.25; world.add(qGroup);
  box(0.82, 0.48, 0.56, 0x5d6170, 0, 0, 0, { parent: qGroup, round: 0.04, m: 0.5, r: 0.45 });
  const qLid = box(0.86, 0.07, 0.6, 0x6f7383, 0, 0.48, 0, { parent: qGroup, round: 0.03, m: 0.5, r: 0.4 });
  { const st = tex(256, 48, (c, w, h) => { for (let i = -2; i < 12; i++) { c.fillStyle = i % 2 ? '#1d1d1d' : '#ffd21f'; c.beginPath(); c.moveTo(i * 24, 0); c.lineTo(i * 24 + 24, 0); c.lineTo(i * 24, h); c.lineTo(i * 24 - 24, h); c.fill(); } c.fillStyle = '#ffd21f'; c.fillRect(70, 8, 116, 32); c.fillStyle = '#1d1d1d'; c.font = 'bold 22px sans-serif'; c.textAlign = 'center'; c.fillText('격리함', 128, 32); });
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.13), new THREE.MeshStandardMaterial({ map: st, roughness: 0.6 })); s.position.set(0, 0.3, 0.285); qGroup.add(s); }
  const qLed = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), glow(0x5ef2b0, 2.5)); qLed.position.set(0.33, 0.42, 0.29); qGroup.add(qLed);
  box(0.6, 0.26, 0.42, 0x8a8e9a, -0.75, 0, 0.35, { parent: qGroup, round: 0.03, m: 0.4 });

  /* ---------- monitor wall (M) ---------- */
  const monCanvas = document.createElement('canvas'); monCanvas.width = 1024; monCanvas.height = 512;
  const monTex = new THREE.CanvasTexture(monCanvas); monTex.colorSpace = THREE.SRGBColorSpace; monTex.anisotropy = 4;
  { const g = new THREE.Group(); g.position.set(SLOT.M[0], 0, -D + 0.04); world.add(g);
    box(2.75, 1.42, 0.1, 0x1b1f2c, 0, 0.98, 0, { parent: g, round: 0.03 });
    const s = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.3), new THREE.MeshBasicMaterial({ map: monTex, color: new THREE.Color(1.35, 1.35, 1.45), toneMapped: false })); s.position.set(0, 1.69, 0.056); g.add(s);
    box(2.75, 0.03, 0.04, glow(0x5aa0ff, 2.2), 0, 0.96, 0.06, { parent: g, cast: false });
    // cabinet with binders + boxes
    box(2.3, 0.62, 0.48, 0x5a5462, 0, 0, 0.22, { parent: g, round: 0.03 });
    box(2.34, 0.04, 0.5, 0x6e6577, 0, 0.62, 0.22, { parent: g, cast: false });
    [[-0.75, 0x9aa0aa], [0.0, 0x9aa0aa], [0.72, 0xb6b0a4]].forEach(([x, c]) => box(0.5, 0.24, 0.36, c, x, 0.05, 0.27, { parent: g, round: 0.02 }));
    [0, 1, 2, 3, 4].forEach(i => box(0.06, 0.24, 0.24, [0x2f4b7a, 0x7a3b2f, 0x3d6b4a, 0x6a5a2f, 0x2f4b7a][i], -0.95 + i * 0.07, 0.36, 0.25, { parent: g }));
    box(0.32, 0.12, 0.24, 0x30343f, 0.55, 0.66, 0.25, { parent: g, round: 0.02 });
    box(0.18, 0.07, 0.12, 0xf0c94a, 0.95, 0.66, 0.3, { parent: g, round: 0.01 });
  }
  wallGlow(SLOT.M[0], 1.7, -D + 0.02, 0x4a8cff, 1.9, 0.22);
  // pendant lamp
  cyl(0.008, 0.008, 0.3, 0x2a2a30, -0.4, H - 0.3, -2.0, { cast: false }); cyl(0.07, 0.24, 0.16, 0x2a2a30, -0.4, H - 0.44, -2.0, { m: 0.4, r: 0.4 });
  { const b = new THREE.Mesh(new THREE.CircleGeometry(0.2, 20), glow(0xffd29a, 2.4)); b.rotation.x = Math.PI / 2; b.position.set(-0.4, H - 0.445, -2.0); world.add(b); }

  /* ---------- server racks (R1–R3) ---------- */
  const racks = [];
  ['R1', 'R2', 'R3'].forEach((k, ri) => {
    const [x, , z] = SLOT[k]; const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g);
    box(0.78, 2.05, 0.72, 0x1d2230, 0, 0, 0, { parent: g, round: 0.03, r: 0.45, m: 0.3 });
    box(0.68, 1.92, 0.02, 0x10141e, 0, 0.06, 0.36, { parent: g, cast: false });
    const leds = []; const ledGeo = new THREE.PlaneGeometry(0.035, 0.018);
    for (let r = 0; r < 14; r++) for (let c = 0; c < 6; c++) {
      if ((r * 7 + c * 3 + ri) % 4 === 0) continue;
      const m = new THREE.Mesh(ledGeo, new THREE.MeshBasicMaterial({ color: 0x3d8bff })); m.position.set(-0.24 + c * 0.095, 0.2 + r * 0.125, 0.375); g.add(m);
      leds.push({ m, ph: Math.random() * 10, sp: 0.5 + Math.random() * 3, amber: (r * 5 + c) % 17 === 0 });
    }
    for (let r = 0; r < 14; r++) box(0.66, 0.008, 0.01, 0x2a3142, 0, 0.17 + r * 0.125, 0.372, { parent: g, cast: false });
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.11), new THREE.MeshBasicMaterial({ map: tex(192, 48, (c, w, h) => { c.fillStyle = '#121728'; c.fillRect(0, 0, w, h); c.fillStyle = '#8fb6ff'; c.font = 'bold 26px sans-serif'; c.textAlign = 'center'; c.fillText(['R1 데이터', 'R2 서비스', 'R3 관리'][ri], w / 2, 34); }) }));
    tag.position.set(0, 2.08, 0.37); g.add(tag);
    const status = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.03), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x3d8bff).multiplyScalar(3) })); status.position.set(0, 2.0, 0.376); g.add(status);
    const sticker = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ map: tex(96, 96, (c, w, h) => { c.fillStyle = '#ffd21f'; c.beginPath(); c.arc(48, 48, 44, 0, 7); c.fill(); c.fillStyle = '#1d1d1d'; c.font = 'bold 54px sans-serif'; c.textAlign = 'center'; c.fillText('!', 48, 68); }), transparent: true }));
    sticker.position.set(0.22, 1.7, 0.38); sticker.visible = false; g.add(sticker);
    racks.push({ g, leds, status, sticker, mode: 'ok' });
  });
  box(2.6, 0.04, 0.03, glow(0x3d7fff, 2.4), 2.3, 2.15, -D + 0.02, { cast: false });
  pool(2.3, -1.4, 1.8, 0x3d7fff, 0.32);

  /* ---------- pipes ---------- */
  const pipeM = mat(0x3a3440, { m: 0.5, r: 0.45 });
  [[2.25, -D + 0.12], [2.36, -D + 0.18]].forEach(([y, z]) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, W * 2 - 2.4, 10), pipeM); p.rotation.z = Math.PI / 2; p.position.set(0.8, y, z); world.add(p); });
  [[2.3, W - 0.12], [2.4, W - 0.18]].forEach(([y, x]) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, D * 2, 10), pipeM); p.rotation.x = Math.PI / 2; p.position.set(x, y, 0); world.add(p); });
  [-1.95, 1.0].forEach(x => cyl(0.035, 0.035, 2.3, 0x3a3440, x, 0, -D + 0.14, { m: 0.5, r: 0.45 }));
  [-W + 0.12].forEach(x => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, D * 2, 10), pipeM); p.rotation.x = Math.PI / 2; p.position.set(x, 2.25, 0.2); world.add(p); });

  /* ---------- right wall: board (W), intercom (I), cabinet, UPS (U), armchair (K) ---------- */
  const boardCanvas = document.createElement('canvas'); boardCanvas.width = 512; boardCanvas.height = 384;
  const boardTex = new THREE.CanvasTexture(boardCanvas); boardTex.colorSpace = THREE.SRGBColorSpace;
  { const g = new THREE.Group(); g.position.set(W - 0.02, SLOT.W[1], SLOT.W[2]); g.rotation.y = -Math.PI / 2; world.add(g);
    box(1.32, 1.0, 0.05, 0x6b4a2f, 0, -0.5, 0, { parent: g });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.9), new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.9, emissive: 0xffffff, emissiveMap: boardTex, emissiveIntensity: 0.12 })); m.position.z = 0.03; g.add(m); }
  const intercom = new THREE.Group(); intercom.position.set(W - 0.02, SLOT.I[1], SLOT.I[2]); intercom.rotation.y = -Math.PI / 2; world.add(intercom);
  box(0.3, 0.44, 0.08, 0xd9d6cf, 0, -0.22, 0.02, { parent: intercom, round: 0.03 });
  box(0.2, 0.16, 0.02, 0x30343f, 0, 0.0, 0.07, { parent: intercom, round: 0.01 });
  const icLed = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.035), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffa64d).multiplyScalar(2.5) })); icLed.position.set(0, -0.14, 0.071); intercom.add(icLed);
  const icGlow = wallGlow(W - 0.03, SLOT.I[1], SLOT.I[2], 0xffa64d, 0.5, 0.0, -Math.PI / 2);
  box(0.62, 0.95, 0.52, 0x4a4552, W - 0.38, 0, 0.15, { round: 0.03 });
  [0.25, 0.55, 0.85].forEach(y => box(0.5, 0.012, 0.01, 0x6a6474, W - 0.38, y, 0.42, { cast: false }));
  const ups = new THREE.Group(); ups.position.set(SLOT.U[0], 0, SLOT.U[2]); world.add(ups);
  box(0.72, 1.0, 0.6, 0x2c2f3a, 0, 0, 0, { parent: ups, round: 0.04, m: 0.35, r: 0.45 });
  for (let i = 0; i < 9; i++) box(0.5, 0.012, 0.01, 0x434756, 0, 0.15 + i * 0.05, 0.305, { parent: ups, cast: false });
  const upsCanvas = document.createElement('canvas'); upsCanvas.width = 128; upsCanvas.height = 160; const upsTex = new THREE.CanvasTexture(upsCanvas); upsTex.colorSpace = THREE.SRGBColorSpace;
  const upsScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.28), new THREE.MeshBasicMaterial({ map: upsTex, color: new THREE.Color(2, 2, 2), toneMapped: false })); upsScreen.position.set(0, 0.72, 0.306); ups.add(upsScreen);
  const upsSticker = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.1), new THREE.MeshStandardMaterial({ map: tex(128, 80, (c, w, h) => { c.fillStyle = '#fffdf2'; c.fillRect(0, 0, w, h); c.fillStyle = '#1f9e94'; c.fillRect(0, 0, w, 20); c.fillStyle = '#fff'; c.font = 'bold 15px sans-serif'; c.fillText('점검 완료', 18, 16); c.fillStyle = '#2c2733'; c.font = 'bold 16px sans-serif'; c.fillText('시설팀 ✓', 24, 52); }) }));
  upsSticker.position.set(-0.2, 0.35, 0.306); upsSticker.visible = false; ups.add(upsSticker);
  pool(SLOT.U[0], SLOT.U[2] + 0.4, 0.7, 0x5ef2b0, 0.25);
  // armchair (K) with blanket
  const chairK = new THREE.Group(); chairK.position.set(SLOT.K[0], 0, SLOT.K[2]); chairK.rotation.y = -0.55; world.add(chairK);
  box(0.8, 0.38, 0.72, 0x6b4a32, 0, 0, 0, { parent: chairK, round: 0.08, r: 0.6 });
  box(0.8, 0.5, 0.18, 0x6b4a32, 0, 0.36, -0.29, { parent: chairK, round: 0.07, r: 0.6 });
  [-0.36, 0.36].forEach(x => box(0.12, 0.22, 0.66, 0x5e412c, x, 0.36, 0.02, { parent: chairK, round: 0.05 }));
  const blanketK = box(0.52, 0.06, 0.5, 0x8a6fb4, 0.05, 0.4, 0.06, { parent: chairK, round: 0.03, r: 0.95 }); blanketK.rotation.z = 0.15;
  blanketK.visible = false;

  /* ---------- rug, desk (T), chairs (C1–C3) ---------- */
  { const r = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.9), mat(0x4a4766, { r: 1 })); r.rotation.x = -Math.PI / 2; r.position.set(0, 0.008, 0.6); r.receiveShadow = true; world.add(r);
    const b = new THREE.Mesh(new THREE.PlaneGeometry(4.75, 3.05), mat(0x3a3752, { r: 1 })); b.rotation.x = -Math.PI / 2; b.position.set(0, 0.006, 0.6); b.receiveShadow = true; world.add(b); }
  pool(0, 0.7, 2.3, 0xffb066, 0.16);
  const DESK = { x: 0, z: 0.9, w: 2.3, d: 0.9, h: o.deskH || 0.5 };
  box(DESK.w, 0.06, DESK.d, 0x9c7350, DESK.x, DESK.h - 0.06, DESK.z, { round: 0.02, r: 0.6 });
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => box(0.05, DESK.h - 0.06, 0.05, 0x22242c, DESK.x + sx * (DESK.w / 2 - 0.08), 0, DESK.z + sz * (DESK.d / 2 - 0.08), { m: 0.5 }));
  const deskTop = DESK.h;
  // desk props
  const laptop = new THREE.Group(); laptop.position.set(0.82, deskTop, 0.8); laptop.rotation.y = 0.55; world.add(laptop);
  box(0.42, 0.018, 0.3, 0xb8bcc6, 0, 0, 0, { parent: laptop, round: 0.008, m: 0.6, r: 0.3 });
  const lid = new THREE.Group(); lid.position.set(0, 0.018, 0.15); lid.rotation.x = 1.9 - Math.PI / 2 * 2 + Math.PI / 2; laptop.add(lid);
  box(0.42, 0.29, 0.012, 0xb8bcc6, 0, 0, 0, { parent: lid, round: 0.006, m: 0.6, r: 0.3 });
  lid.rotation.x = -0.32;
  { const s = new THREE.Mesh(new THREE.CircleGeometry(0.035, 16), mat(0x2c2733)); s.position.set(0, 0.15, 0.008); lid.add(s); }
  const tablet = box(0.26, 0.015, 0.34, 0x2a2f3c, -0.45, deskTop, 0.82, { round: 0.01 }); tablet.rotation.y = 0.25;
  const tabScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.3), new THREE.MeshBasicMaterial({ map: tex(88, 120, (c, w, h) => { c.fillStyle = '#fbf6ea'; c.fillRect(0, 0, w, h); c.fillStyle = '#3d7fe0'; c.fillRect(0, 0, w, 18); c.fillStyle = '#9aa3b5'; for (let i = 0; i < 6; i++)c.fillRect(8, 28 + i * 14, w - 16 - (i % 3) * 14, 4); }), color: new THREE.Color(1.3, 1.3, 1.3) }));
  tabScreen.rotation.x = -Math.PI / 2; tabScreen.position.set(-0.45, deskTop + 0.017, 0.82); tabScreen.rotation.z = -0.25; world.add(tabScreen);
  const mugs = [[-0.8, 0.98, 0xf4efe6], [0.92, 0.95, 0x3a3f4b]].map(([x, z, c]) => { const m = cyl(0.045, 0.04, 0.1, c, x, deskTop, z); const h = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.009, 6, 12), mat(c)); h.position.set(x + 0.05, deskTop + 0.05, z); world.add(h); return m; });
  cyl(0.06, 0.05, 0.08, 0x4a4552, 0.02, deskTop, 0.95); { const g = new THREE.Group(); g.position.set(0.02, deskTop + 0.08, 0.95); world.add(g); for (let i = 0; i < 7; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), mat(i % 2 ? 0x5d9e3f : 0x3f7a2f)); l.scale.set(0.5, 1.5, 0.3); const a = i / 7 * Math.PI * 2; l.position.set(Math.cos(a) * 0.04, 0.06, Math.sin(a) * 0.04); l.rotation.set(Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6); g.add(l); } }
  [[-0.2, 1.15, 0xf6a6c8], [0.25, 1.2, 0xf6e27a], [0.7, 1.18, 0xb7a6f6]].forEach(([x, z, c]) => { const s = box(0.1, 0.004, 0.1, c, x, deskTop, z, { cast: false }); s.rotation.y = x * 2; });
  box(0.08, 0.012, 0.15, 0x1d1f26, -0.15, deskTop, 0.72, { round: 0.005 });
  box(0.24, 0.035, 0.18, 0x2a2f3c, 0.2, deskTop, 1.02, { round: 0.01 });
  // laptop on the desk for the "USB plugged in" scene
  const usbStick = box(0.03, 0.015, 0.08, 0xd2643f, 1.05, deskTop + 0.004, 0.72, { cast: false }); usbStick.visible = false;

  function officeChair(x, z, ry, color) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; world.add(g);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const l = box(0.04, 0.03, 0.26, 0x22242c, Math.sin(a) * 0.13, 0.03, Math.cos(a) * 0.13, { parent: g }); l.rotation.y = a; cyl(0.025, 0.025, 0.04, 0x16171c, Math.sin(a) * 0.25, 0, Math.cos(a) * 0.25, { parent: g }); }
    const post = cyl(0.025, 0.025, 1, 0x6c7280, 0, 0.05, 0, { parent: g });
    const seat = box(0.46, 0.08, 0.44, color, 0, 0.3, 0, { parent: g, round: 0.04 });
    const back = box(0.44, 0.52, 0.07, color, 0, 0.42, -0.23, { parent: g, round: 0.04 });
    return { g, post, seat, back, setSeat(h) { post.scale.y = Math.max(0.05, h - 0.09); seat.position.y = h - 0.08 + 0.04; back.position.y = h + 0.26; } };
  }
  const chairs = { C1: officeChair(SLOT.C1[0], SLOT.C1[2], 0, 0x26283a), C2: officeChair(SLOT.C2[0], SLOT.C2[2], 0, 0x26283a), C3: officeChair(SLOT.C3[0], SLOT.C3[2], -Math.PI / 2, 0x3a3150) };
  chairs.C3.g.visible = false;

  /* ---------- plants ---------- */
  function plant(x, z, s = 1, y = 0) {
    const g = new THREE.Group(); g.position.set(x, y, z); world.add(g);
    cyl(0.17 * s, 0.13 * s, 0.32 * s, 0xd9d4cb, 0, 0, 0, { parent: g });
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; const l = new THREE.Mesh(new THREE.SphereGeometry(0.1 * s, 8, 6), mat(i % 3 ? 0x5d9e3f : 0x3f7a2f, { r: 0.7 })); l.scale.set(0.6, 2.1, 0.3); l.position.set(Math.cos(a) * 0.1 * s, 0.32 * s + 0.15 * s + (i % 3) * 0.05 * s, Math.sin(a) * 0.1 * s); l.rotation.order = 'YXZ'; l.rotation.set(Math.sin(a) * 0.7, -a, -Math.cos(a) * 0.7); l.castShadow = true; g.add(l); }
  }
  plant(-4.2, 2.25, 1.15); plant(-2.0, -0.25, 0.95); plant(-2.0, -2.25, 0.8, 0); plant(4.25, 2.3, 1.1); plant(3.95, -1.95, 0.85, 0); plant(-4.25, -1.85, 0.75, 1.46 + 0.045);

  /* ---------- Fix: tabletop status robot ---------- */
  const fix = new THREE.Group(); fix.position.set(-0.98, deskTop, 0.88); fix.rotation.y = 0.5; world.add(fix);
  cyl(0.06, 0.07, 0.04, 0xeadfce, 0, 0, 0, { parent: fix });
  [-0.06, 0.06].forEach(x => { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 14), mat(0x1d1f26)); w.rotation.z = Math.PI / 2; w.position.set(x, 0.03, 0); fix.add(w); });
  const fixHead = new THREE.Group(); fixHead.position.y = 0.04; fix.add(fixHead);
  box(0.2, 0.15, 0.15, 0xeadfce, 0, 0, 0, { parent: fixHead, round: 0.045, r: 0.4 });
  [-0.105, 0.105].forEach(x => { const e = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 18), mat(0xa48fd0, { r: 0.5 })); e.rotation.z = Math.PI / 2; e.position.set(x, 0.075, 0); fixHead.add(e); const r = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.004, 6, 18), glow(0x55e8e0, 2.4)); r.rotation.y = Math.PI / 2; r.position.set(x * 1.1, 0.075, 0); fixHead.add(r); });
  box(0.16, 0.1, 0.01, 0x101629, 0, 0.025, 0.074, { parent: fixHead, round: 0.02 });
  const fixEyes = [-0.035, 0.035].map(x => { const e = new THREE.Mesh(new THREE.PlaneGeometry(0.026, 0.03), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x7ff6ff).multiplyScalar(2.6) })); e.position.set(x, 0.075, 0.081); fixHead.add(e); return e; });
  cyl(0.004, 0.004, 0.06, 0x2c2733, 0, 0.15, 0, { parent: fixHead });
  const fixTip = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), glow(0xffb84d, 2.5)); fixTip.position.y = 0.215; fixHead.add(fixTip);
  const FIX = { mood: 'idle', talk: 0, blink: 0 };

  /* ---------- visitor (procedural stand-in until NPC models exist) ---------- */
  function makeVisitor(colorHex, cap = true, who = 'facility') {
    const g = new THREE.Group(); world.add(g); g.visible = false;
    const body = new THREE.Group(); g.add(body);
    const col = mat(colorHex, { r: 0.75 });
    box(0.36, 0.42, 0.24, col, 0, 0.36, 0, { parent: body, round: 0.09 });
    const legs = [-0.08, 0.08].map(x => { const p = new THREE.Group(); p.position.set(x, 0.38, 0); body.add(p); box(0.11, 0.38, 0.12, mat(0x2c2f3a), 0, -0.38, 0, { parent: p, round: 0.04 }); box(0.12, 0.06, 0.18, mat(0x1d1f26), 0, -0.38, 0.03, { parent: p, round: 0.02 }); return p; });
    const arms = [-0.22, 0.22].map(x => { const p = new THREE.Group(); p.position.set(x, 0.74, 0); body.add(p); box(0.09, 0.34, 0.1, col, 0, -0.34, 0, { parent: p, round: 0.04 }); return p; });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 16), mat(0xf2c9a5, { r: 0.7 })); head.position.y = 1.0; head.scale.set(1, 0.95, 0.95); head.castShadow = true; body.add(head);
    [-0.07, 0.07].forEach(x => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), mat(0x2c2733)); e.position.set(x, 1.0, 0.18); body.add(e); });
    if (cap) { const c = new THREE.Mesh(new THREE.SphereGeometry(0.21, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), col); c.position.y = 1.03; body.add(c); box(0.22, 0.02, 0.14, col, 0, 1.03, 0.2, { parent: body }); }
    else { const h = new THREE.Mesh(new THREE.SphereGeometry(0.21, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x2b2320)); h.position.y = 1.02; body.add(h); }
    box(0.26, 0.2, 0.14, mat(0x5c4a3a), 0.26, 0.3, 0.05, { parent: body, round: 0.03 });
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.07), new THREE.MeshBasicMaterial({ map: tex(96, 56, (c, w, h) => { c.fillStyle = '#fffdf9'; c.fillRect(0, 0, w, h); c.fillStyle = CAST[who].color || '#888'; c.fillRect(0, 0, w, 14); c.fillStyle = '#2c2733'; c.font = 'bold 20px sans-serif'; c.textAlign = 'center'; c.fillText(CAST[who].full, w / 2, 42); }) }));
    tag.position.set(-0.09, 0.5, 0.125); body.add(tag);
    const bag = body.children[body.children.length - 2];
    return { g, body, legs, arms, path: null, t: 0, bag };
  }
  const visitors = { facility: makeVisitor(0x2f5f7a, false, 'facility'), intern: makeVisitor(0xe8892f, false, 'intern') };
  visitors.intern.bag.visible = false;
  // sitting pose for a stand-in figure: bend the legs forward and lower the body onto a seat
  function sitVisitor(v, on, x, z, ry, seatH = 0.44) {
    v.seated = on; v.path = null;
    if (on) { v.g.visible = true; v.g.position.set(x, seatH - 0.38, z); v.g.rotation.y = ry; v.face = ry; v.legs.forEach(l => l.rotation.x = -1.45); v.arms.forEach(l => l.rotation.x = -0.9); }
    else { v.legs.forEach(l => l.rotation.x = 0); v.arms.forEach(l => l.rotation.x = 0); v.g.position.y = 0; }
  }
  // Patch the cat (stand-in model)
  const cat = new THREE.Group(); cat.visible = false; world.add(cat);
  { const fur = mat(0xf7f1e8, { r: 0.95 }), dark = mat(0x2c2733), org = mat(0xe39a52, { r: 0.95 }), gry = mat(0x6e6a72, { r: 0.95 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), fur); body.scale.set(1, 0.72, 1.45); body.position.y = 0.11; body.castShadow = true; cat.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 12), fur); head.position.set(0, 0.2, 0.17); head.castShadow = true; cat.add(head);
    [[-1, org], [1, gry]].forEach(([sx, em]) => { const e = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.06, 4), em); e.position.set(sx * 0.045, 0.28, 0.17); cat.add(e); const ey = new THREE.Mesh(new THREE.SphereGeometry(0.011, 6, 4), dark); ey.position.set(sx * 0.03, 0.215, 0.245); cat.add(ey); });
    [[0.07, 0.15, -0.05, org], [-0.06, 0.17, -0.12, gry], [-0.04, 0.23, 0.15, org], [0.05, 0.24, 0.16, gry]].forEach(([x, y, z, m]) => { const p = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), m); p.scale.set(1, 0.6, 1); p.position.set(x, y, z); cat.add(p); });
    const tail = new THREE.Group(); tail.position.set(0, 0.12, -0.17); cat.add(tail);
    const t1 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.22, 8), gry); t1.position.y = 0.1; t1.rotation.x = -0.4; tail.add(t1); cat.userData.tail = tail; }
  cat.position.set(2.75, 0, 0.05); cat.rotation.y = -0.9;

  /* ---------- light motes ---------- */
  const NM = 140, mp = new Float32Array(NM * 3), ms = new Float32Array(NM);
  for (let i = 0; i < NM; i++) { mp[i * 3] = (Math.random() - 0.5) * W * 2; mp[i * 3 + 1] = Math.random() * H; mp[i * 3 + 2] = (Math.random() - 0.5) * D * 2; ms[i] = Math.random() * 10; }
  const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(mp, 3));
  const motes = new THREE.Points(mg, new THREE.PointsMaterial({ size: 0.05, map: poolTex, color: new THREE.Color(1.6, 1.25, 0.9), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); world.add(motes);

  /* ---------- highlight ring for scene slots ---------- */
  const hl = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.5, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd75e).multiplyScalar(2), transparent: true, opacity: 0, depthWrite: false }));
  hl.rotation.x = -Math.PI / 2; world.add(hl);
  let hlSlot = null;

  /* ---------- dynamic state ---------- */
  const state = { alert: 0, power: 1, rackModes: ['ok', 'ok', 'ok'], intercom: 0, usbAt: null, blanket: false, upsSticker: false, gear: {}, monitorDraw: null };
  let lastMon = '';
  function drawMonitor(spec) {
    const k = JSON.stringify(spec); if (k === lastMon) return; lastMon = k;
    const g = monCanvas.getContext('2d'), w = 1024, h = 512;
    const grd = g.createLinearGradient(0, 0, 0, h); grd.addColorStop(0, '#0f1730'); grd.addColorStop(1, '#0a0f20'); g.fillStyle = grd; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(90,160,255,0.08)'; g.lineWidth = 1; for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.fillStyle = '#1a2850'; g.fillRect(0, 0, w, 44); g.fillStyle = '#9cc7ff'; g.font = 'bold 24px sans-serif'; g.fillText('LOOPLAB SECURITY · ' + (spec.day ? 'DAY ' + String(spec.day).padStart(2, '0') : 'STANDBY'), 20, 30);
    g.textAlign = 'right'; g.fillStyle = spec.alert ? '#ffb84d' : '#5ef2b0'; g.fillText(spec.alert ? '● 확인 필요 ' + spec.alert : '● 안정', w - 20, 30); g.textAlign = 'left';
    if (spec.call) { // remote call card
      g.fillStyle = 'rgba(30,45,90,0.9)'; rr(g, 60, 80, 420, 360, 22); g.fill(); g.strokeStyle = spec.call.verified ? '#5ef2b0' : '#ffb84d'; g.lineWidth = 4; g.stroke();
      if (spec.callImg) g.drawImage(spec.callImg, 150, 110, 240, 240);
      g.fillStyle = '#fff'; g.font = 'bold 34px sans-serif'; g.textAlign = 'center'; g.fillText(spec.call.name, 270, 392);
      g.fillStyle = spec.call.verified ? '#5ef2b0' : '#ffb84d'; g.font = 'bold 22px sans-serif'; g.fillText(spec.call.verified ? '✓ 등록된 채널' : '미확인 발신', 270, 424); g.textAlign = 'left';
    } else { // network map with shield
      const cx = 270, cy = 270; const nodes = [[cx - 170, cy - 110], [cx + 170, cy - 110], [cx - 190, cy + 100], [cx + 180, cy + 110], [cx, cy - 175], [cx, cy + 180]];
      g.strokeStyle = '#3d7fe0'; g.lineWidth = 4; nodes.forEach(([x, y]) => { g.beginPath(); g.moveTo(cx, cy); g.lineTo(x, y); g.stroke(); });
      nodes.forEach(([x, y], i) => { g.fillStyle = '#0f1730'; g.beginPath(); g.arc(x, y, 22, 0, 7); g.fill(); g.strokeStyle = (spec.hot || []).includes(i) ? '#ffb84d' : '#5aa0ff'; g.lineWidth = 4; g.stroke(); });
      g.save(); g.translate(cx - 70, cy - 70); const ic = iconCanvas('shield', spec.alert ? '#ffb84d' : '#7cc4ff', 140, false); g.drawImage(ic, 0, 0); g.restore();
      if (spec.alert) { g.fillStyle = '#ffb84d'; g.beginPath(); g.moveTo(cx + 120, cy - 60); g.lineTo(cx + 160, cy + 10); g.lineTo(cx + 80, cy + 10); g.closePath(); g.fill(); g.fillStyle = '#0f1730'; g.font = 'bold 44px sans-serif'; g.textAlign = 'center'; g.fillText('!', cx + 120, cy + 2); g.textAlign = 'left'; }
    }
    // right column: up to 3 info cards
    (spec.cards || []).slice(0, 3).forEach((c, i) => {
      const x = 560, y = 70 + i * 140; g.fillStyle = 'rgba(25,38,78,0.92)'; rr(g, x, y, 430, 120, 16); g.fill();
      g.strokeStyle = c.tone === 'warn' ? '#ffb84d' : c.tone === 'ok' ? '#5ef2b0' : c.tone === 'ai' ? '#c3a6ff' : '#5aa0ff'; g.lineWidth = c.tone === 'ai' ? 4 : 3; if (c.tone === 'ai') g.setLineDash([10, 7]); g.stroke(); g.setLineDash([]);
      g.fillStyle = g.strokeStyle; g.font = 'bold 24px sans-serif'; g.fillText(c.t, x + 22, y + 40);
      g.fillStyle = '#dfe8ff'; g.font = '22px sans-serif'; wrapText(g, c.d || '', x + 22, y + 74, 390, 28, 2);
    });
    monTex.needsUpdate = true;
  }
  function wrapText(g, text, x, y, maxW, lh, maxLines) { let line = '', n = 0; for (const ch of text) { if (g.measureText(line + ch).width > maxW) { g.fillText(line, x, y + n * lh); line = ch; if (++n >= maxLines) return; } else line += ch; } g.fillText(line, x, y + n * lh); }
  function drawBoard(notes) {
    const g = boardCanvas.getContext('2d'), w = 512, h = 384;
    g.fillStyle = '#b98a5a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(80,50,20,${Math.random() * 0.12})`; g.fillRect(Math.random() * w, Math.random() * h, 3, 3); }
    const cols = ['#fff3a6', '#ffd0e4', '#cde9ff', '#d8f5c8'];
    (notes.length ? notes : ['확인된 연락처', '일지는 매일 저녁']).slice(0, 4).forEach((t, i) => {
      const x = 22 + (i % 2) * 248, y = 22 + Math.floor(i / 2) * 178; g.save(); g.translate(x + 110, y + 80); g.rotate(((i * 37) % 7 - 3) * 0.02); g.fillStyle = cols[i % 4]; g.fillRect(-110, -78, 220, 158);
      g.fillStyle = '#d9473a'; g.beginPath(); g.arc(0, -66, 8, 0, 7); g.fill(); g.fillStyle = '#2c2733'; g.font = 'bold 26px sans-serif'; g.textAlign = 'center'; wrapText2(g, t, 0, -22, 190, 34, 3); g.restore();
    });
    boardTex.needsUpdate = true;
  }
  function wrapText2(g, text, x, y, maxW, lh, maxLines) { const lines = []; let line = ''; for (const ch of text) { if (g.measureText(line + ch).width > maxW) { lines.push(line); line = ch; } else line += ch; } lines.push(line); lines.slice(0, maxLines).forEach((l, i) => g.fillText(l, x, y + i * lh)); }
  function drawUPS(level, serviced) {
    const g = upsCanvas.getContext('2d'), w = 128, h = 160; g.fillStyle = '#0b1220'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#5ef2b0'; g.lineWidth = 6; rr(g, 34, 22, 60, 110, 8); g.stroke(); g.fillStyle = '#5ef2b0'; g.fillRect(52, 10, 24, 12);
    const n = Math.max(1, Math.round(level * 4)); for (let i = 0; i < n; i++) { g.fillStyle = level < 0.4 ? '#ffb84d' : '#5ef2b0'; g.fillRect(44, 110 - i * 24, 40, 18); }
    upsTex.needsUpdate = true;
  }
  drawMonitor({}); drawBoard([]); drawUPS(0.75);

  function setGear(gs) { // gs: {id:{have,set}}
    for (const id of GEAR_ORDER) {
      const st = gs[id]; if (!st || !st.have) { if (gearTiles[id]) gearTiles[id].g.visible = false; continue; }
      if (!gearTiles[id]) gearTile(id, GEAR_ORDER.indexOf(id));
      const t = gearTiles[id]; t.g.visible = true; t.badge.visible = !!st.set;
      t.face.material.color.setScalar(st.set ? 1.7 : 0.55);
    }
  }
  function setSupplies(list) { ['food', 'coffee'].forEach((id, i) => { if (list.includes(id) && !supplyMeshes[id]) supplyMesh(id, i); if (supplyMeshes[id]) supplyMeshes[id].visible = list.includes(id); }); blanketK.visible = list.includes('blanket'); }

  /* ---------- per-frame ---------- */
  function update(t, dt) {
    for (const r of racks) {
      const mode = r.mode;
      for (const l of r.leds) {
        const on = 0.5 + 0.5 * Math.sin(t * l.sp + l.ph) > 0.35;
        const c = mode === 'off' ? 0x1a1e2a : mode === 'iso' ? (l.amber ? 0xff5a4a : 0x55304a) : mode === 'check' ? (l.amber || on ? 0xffb84d : 0x6a4a20) : (l.amber ? 0xffb84d : on ? 0x3d8bff : 0x1c3a7a);
        l.m.material.color.setHex(c); if (mode !== 'off') l.m.material.color.multiplyScalar(on ? 2.2 : 1);
      }
      r.status.material.color.setHex(mode === 'iso' ? 0xff5a4a : mode === 'check' ? 0xffb84d : mode === 'off' ? 0x222633 : 0x3d8bff).multiplyScalar(mode === 'off' ? 1 : 3);
    }
    // intercom blink
    const ring = state.intercom > 0; icLed.material.color.setHex(ring && Math.sin(t * 12) > 0 ? 0xff7a3a : 0xffa64d).multiplyScalar(ring ? 3.5 : 1.6); icGlow.material.opacity = ring ? 0.25 + 0.25 * Math.sin(t * 12) : 0;
    // Fix
    FIX.blink -= dt; if (FIX.blink < -3 - Math.random() * 3) FIX.blink = 0.12;
    fixEyes.forEach(e => { e.scale.y = FIX.blink > 0 ? 0.15 : FIX.mood === 'happy' ? 0.5 : 1; });
    fixHead.rotation.y = Math.sin(t * 0.7) * 0.25 + (FIX.talk > 0 ? Math.sin(t * 9) * 0.08 : 0); fixHead.position.y = 0.04 + (FIX.talk > 0 ? Math.abs(Math.sin(t * 10)) * 0.015 : 0);
    FIX.talk = Math.max(0, FIX.talk - dt); fixTip.material.color.setHex(state.alert ? 0xffb84d : 0x5ef2b0).multiplyScalar(2 + Math.sin(t * 4));
    // motes
    const p = mg.attributes.position.array; for (let i = 0; i < NM; i++) { p[i * 3 + 1] += dt * (0.05 + 0.04 * Math.sin(ms[i])); if (p[i * 3 + 1] > H) p[i * 3 + 1] = 0.05; } mg.attributes.position.needsUpdate = true;
    // highlight
    if (hlSlot) { hl.material.opacity = 0.55 + 0.35 * Math.sin(t * 4); hl.scale.setScalar(1 + 0.08 * Math.sin(t * 4)); } else hl.material.opacity = Math.max(0, hl.material.opacity - dt * 2);
    // lights
    const pw = state.power; deskLight.intensity = 7 * pw; doorLamp.material.color.setHex(0xffb45a).multiplyScalar(state.intercom ? 2 + 2 * Math.abs(Math.sin(t * 6)) : 3 * pw);
    // visitors
    if (cat.visible) { cat.userData.tail.rotation.z = Math.sin(t * 1.6) * 0.5; cat.children[1].rotation.y = Math.sin(t * 0.4) * 0.3; }
    for (const k in visitors) { const v = visitors[k]; if (!v.g.visible || v.seated) continue;
      if (v.path && v.path.length) { const [tx, ty, tz] = v.path[0]; const dx = tx - v.g.position.x, dy = ty - v.g.position.y, dz = tz - v.g.position.z, d = Math.hypot(dx, dy, dz);
        if (d < 0.04) v.path.shift(); else { const sp = Math.min(d, dt * 1.1); v.g.position.x += dx / d * sp; v.g.position.y += dy / d * sp; v.g.position.z += dz / d * sp; v.g.rotation.y = Math.atan2(dx, dz); v.walk = (v.walk || 0) + dt * 8; }
        v.legs.forEach((l, i) => l.rotation.x = Math.sin(v.walk + i * Math.PI) * 0.5); v.arms.forEach((l, i) => l.rotation.x = -Math.sin(v.walk + i * Math.PI) * 0.4);
        if (!v.path.length && v.onArrive) { const f = v.onArrive; v.onArrive = null; f(); } }
      else { v.legs.forEach(l => l.rotation.x *= 0.8); v.arms.forEach(l => l.rotation.x *= 0.8); v.body.position.y = Math.sin(t * 2) * 0.006; if (v.face !== undefined) v.g.rotation.y += ((v.face - v.g.rotation.y)) * Math.min(1, dt * 5); }
    }
  }

  return {
    world, SLOT, DESK, chairs, racks, cat, sitVisitor, door, doorLeaf, laptop, usbStick, qGroup, qLid, ups, upsSticker, intercom, fix, FIX, visitors, state, shelf,
    drawMonitor, drawBoard, drawUPS, setGear, setSupplies,
    highlight(slot) { hlSlot = slot; if (slot && SLOT[slot]) { const [x, , z] = SLOT[slot]; hl.position.set(x, 0.02, slot === 'M' || slot.startsWith('R') ? -1.7 : slot === 'B' ? -0.35 : slot === 'W' || slot === 'I' ? z : z); if (slot === 'B') hl.position.x = -W + 0.75; if (slot === 'W' || slot === 'I') hl.position.x = W - 0.6; if (slot === 'D') hl.position.set(-2.95, top + 0.02, -2.25); } },
    setRack(i, mode) { racks[i].mode = mode; racks[i].sticker.visible = mode === 'check' || mode === 'iso'; },
    update,
  };
}

/* ---------------- seated heroes ----------------
   Mixamo idle drives the upper body; hips + legs are pinned to a procedural sitting pose. */
const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3(), _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _q3 = new THREE.Quaternion(), _I = new THREE.Quaternion();
function rotWorld(bone, dq) { bone.getWorldQuaternion(_q2); bone.parent.getWorldQuaternion(_q3); bone.quaternion.copy(_q3.invert().multiply(dq.clone().multiply(_q2))); bone.updateMatrixWorld(true); }
function aimBone(bone, tip, target, w) { bone.getWorldPosition(_v1); tip.getWorldPosition(_v2); _v2.sub(_v1).normalize(); _v3.copy(target).sub(_v1).normalize(); _q1.setFromUnitVectors(_v2, _v3); rotWorld(bone, _I.clone().slerp(_q1, w)); }
const ONCE = new Set(['no', 'button', 'victory', 'pickup']);

export async function loadHero(key, scene, onProg, height = 1.62) {
  const c = CAST[key], file = `models/${c.model}.json`;
  const glb = await fetchGLB(file, onProg);
  const gltf = await new Promise((r, j) => new GLTFLoader().parse(glb, new URL(file, location.href).href.replace(/[^/]*$/, ''), r, j));
  const root = new THREE.Group(), m = gltf.scene; root.add(m); scene.add(root);
  const tx = new THREE.TextureLoader().load(`models/${c.model}_base.jpg`); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4;
  const skin = new THREE.MeshStandardMaterial({ map: tx, roughness: 0.85 });
  let skel = null; m.traverse(o => { if (o.isMesh) { o.material = skin; o.castShadow = true; o.frustumCulled = false; if (o.skeleton) skel = o.skeleton; } });
  m.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(m); m.scale.multiplyScalar(height / Math.max(0.01, bb.max.y - bb.min.y));
  const B = n => m.getObjectByName('mixamorig' + n);
  const bones = { hips: B('Hips'), spine: B('Spine'), spine1: B('Spine1'), spine2: B('Spine2'), neck: B('Neck'), head: B('Head'),
    L: [B('LeftArm'), B('LeftForeArm'), B('LeftHand')], R: [B('RightArm'), B('RightForeArm'), B('RightHand')],
    legs: [['LeftUpLeg', 'LeftLeg', 'LeftFoot'], ['RightUpLeg', 'RightLeg', 'RightFoot']].map(a => a.map(B)) };
  // compute the sitting pose from the bind pose
  if (skel) skel.pose(); root.updateMatrixWorld(true);
  const rest = { hipsQ: bones.hips.quaternion.clone(), hipsP: bones.hips.position.clone() };
  const right = new THREE.Vector3(1, 0, 0);
  bones.legs.forEach(([up, lo, ft], i) => {
    rotWorld(up, new THREE.Quaternion().setFromAxisAngle(right, -Math.PI / 2 + 0.08));
    rotWorld(up, new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (i ? -1 : 1) * 0.1));
    rotWorld(lo, new THREE.Quaternion().setFromAxisAngle(right, Math.PI / 2 + 0.05));
  });
  root.updateMatrixWorld(true);
  const sitQ = bones.legs.map(l => l.map(b => b.quaternion.clone()));
  bones.hips.getWorldPosition(_v1); const hipY = _v1.y;
  let footY = Infinity; bones.legs.forEach(l => { l[2].getWorldPosition(_v2); footY = Math.min(footY, _v2.y); });
  const toe = 0.05; // foot bone sits a little above the sole
  const drop = -(footY - toe);
  const seatH = hipY + drop - 0.05;
  const mixer = new THREE.AnimationMixer(m), acts = {};
  for (const clip of gltf.animations) { const a = mixer.clipAction(clip); if (ONCE.has(clip.name)) { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; } acts[clip.name] = a; }
  const ch = { key, root, model: m, bones, mixer, acts, cur: null, sit: true, sitQ, rest, drop, seatH, hands: 1, handsW: 1, look: null, lookW: 0, typing: 0, busy: 0, slump: 0, tilt: 0 };
  ch.play = (name, fade = 0.3, ts = 1) => { const a = acts[name]; if (!a) return; if (ch.cur === name && !ONCE.has(name)) return; const prev = ch.cur && acts[ch.cur]; a.reset(); a.enabled = true; a.timeScale = ts; a.setEffectiveWeight(1); a.play(); if (prev && prev !== a) prev.crossFadeTo(a, fade, false); ch.cur = name; };
  ch.gesture = (name, dur) => { if (!acts[name]) return; ch.play(name, 0.2); ch.busy = dur ?? acts[name].getClip().duration * 0.92; };
  ch.play('idle', 0); mixer.update(Math.random() * 3);
  // ID card on a lanyard (only for people whose badge is shown)
  if (c.badge && bones.spine2) {
    const cv = document.createElement('canvas'); cv.width = 96; cv.height = 128; const g = cv.getContext('2d');
    g.fillStyle = '#fffdf9'; g.fillRect(0, 0, 96, 128); g.fillStyle = c.lvColor; g.fillRect(0, 0, 96, 26); g.fillStyle = '#fff'; g.font = 'bold 16px sans-serif'; g.textAlign = 'center'; g.fillText(c.role, 48, 19);
    g.fillStyle = '#c9bfb2'; g.beginPath(); g.arc(48, 56, 18, 0, 7); g.fill(); g.fillStyle = '#2c2733'; g.font = 'bold 22px sans-serif'; g.fillText(c.full, 48, 100); g.font = '12px sans-serif'; g.fillStyle = '#6a6170'; g.fillText('LOOPLAB', 48, 118);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
    const card = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.093), new THREE.MeshStandardMaterial({ map: t, roughness: 0.5 }));
    const holder = new THREE.Group(); bones.spine2.add(holder); const ws = new THREE.Vector3(); bones.spine2.getWorldScale(ws); holder.scale.set(1 / ws.x, 1 / ws.y, 1 / ws.z);
    holder.add(card); ch.badgeHolder = holder; ch.badgeCard = card;
  }
  return ch;
}
export function seat(ch, x, z, ry, seatTop) {
  ch.root.position.set(x, 0, z); ch.root.rotation.y = ry; ch.seatTop = seatTop;
}
export function updateHero(ch, dt, t, deskPt) {
  ch.busy = Math.max(0, ch.busy - dt);
  if (ch.busy <= 0 && ch.cur !== 'idle') ch.play('idle', 0.35);
  ch.mixer.update(dt);
  const b = ch.bones;
  if (ch.sit) {
    // pin pelvis + legs
    b.hips.quaternion.copy(ch.rest.hipsQ); b.hips.position.copy(ch.rest.hipsP);
    b.legs.forEach((l, i) => l.forEach((bone, k) => bone.quaternion.copy(ch.sitQ[i][k])));
    ch.root.position.y = (ch.seatTop ?? ch.seatH) - ch.seatH + ch.drop;
    ch.root.updateMatrixWorld(true);
    const right = _v1.set(1, 0, 0).applyQuaternion(ch.root.quaternion).clone();
    // slump when tired, lean in when typing
    const lean = 0.02 + ch.slump * 0.25 + ch.typing * 0.05;
    if (b.spine) rotWorld(b.spine, new THREE.Quaternion().setFromAxisAngle(right, lean));
    // hands rest on the desk unless a gesture is playing
    ch.handsW += ((ch.busy > 0 ? 0 : ch.hands) - ch.handsW) * Math.min(1, dt * 4);
    if (ch.handsW > 0.02 && deskPt) {
      const fwd = _v2.set(0, 0, 1).applyQuaternion(ch.root.quaternion).clone();
      for (const [k, sx] of [['L', 1], ['R', -1]]) { const [a, f, h] = b[k]; if (!a || !h) continue;
        const ty = ch.typing ? Math.max(0, Math.sin(t * 14 + (sx > 0 ? 0 : 1.7))) * 0.025 * ch.typing : 0;
        const tgt = new THREE.Vector3(ch.root.position.x, deskPt.y + 0.03 + ty, ch.root.position.z).addScaledVector(fwd, deskPt.reach).addScaledVector(right, sx * 0.16);
        aimBone(a, h, tgt, ch.handsW * 0.95); aimBone(f, h, tgt, ch.handsW * 0.75); }
    }
    // head look
    if (ch.look && b.neck) {
      ch.lookW += (1 - ch.lookW) * Math.min(1, dt * 3);
      b.head.getWorldPosition(_v3); const dir = ch.look.clone().sub(_v3); const yaw = Math.atan2(dir.x, dir.z) - ch.root.rotation.y;
      const yy = Math.atan2(Math.sin(yaw), Math.cos(yaw)); const pitch = Math.atan2(dir.y, Math.hypot(dir.x, dir.z));
      rotWorld(b.neck, new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.clamp(yy, -1.1, 1.1) * 0.6 * ch.lookW));
      rotWorld(b.head, new THREE.Quaternion().setFromAxisAngle(right, -THREE.MathUtils.clamp(pitch, -0.5, 0.5) * 0.5 * ch.lookW));
    } else ch.lookW = 0;
  }
  if (ch.badgeHolder) { // keep the card hanging on the chest, facing forward
    const hb = ch.badgeHolder; hb.position.set(0, 0, 0); hb.quaternion.identity();
    b.spine2.updateMatrixWorld(true); const wq = new THREE.Quaternion(); b.spine2.getWorldQuaternion(wq);
    const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(ch.root.quaternion);
    const wp = new THREE.Vector3(); b.spine2.getWorldPosition(wp);
    const target = wp.clone().addScaledVector(fwd, ch.badgeFwd ?? 0.15).add(new THREE.Vector3(0, ch.badgeUp ?? -0.06, 0));
    const inv = new THREE.Matrix4().copy(b.spine2.matrixWorld).invert(); hb.position.copy(target.applyMatrix4(inv));
    hb.quaternion.copy(wq.invert().multiply(ch.root.quaternion.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.25))));
  }
}
