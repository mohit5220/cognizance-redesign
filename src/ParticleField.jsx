import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createParticleExhaust } from './createParticleExhaust';
import { buildEarthTargets, buildOutlineTargets, buildCloudTargets } from './earthData';

const FOREGROUND_COUNT = 10500;
const AMBIENT_COUNT = 1150;
const TAU = Math.PI * 2;

// Exhaust particles: 3 engines x 220 per engine, as set in createParticleExhaust.
const EXHAUST_PER_ENGINE = 220;
const EXHAUST_TOTAL = 3 * EXHAUST_PER_ENGINE;

// Spacecraft, star and Earth dots. The exhaust takes its share from the total.
const SHIP_COUNT = FOREGROUND_COUNT - EXHAUST_TOTAL;

// Scale for the spacecraft. Do not change without checking the layout.
const UNIT = 560;

// Star: 55% of its previous size. Only the star targets use this radius.
const STAR_SCALE = 0.55;
const STAR_UNIT = UNIT * STAR_SCALE;

// Star rotation and shimmer. The star turns slowly around its vertical axis
// and only while it is the main shape on screen.
const STAR_SPIN = 0.00018;
const STAR_SHIMMER_SPEED = 0.0025;
const STAR_SHIMMER_AMOUNT = 0.22;
const STAR_DRIFT = 1.6;

// The Earth is 42% of its previous diameter. Only the Earth dots, border lines
// and clouds use this radius.
const EARTH_SCALE = 0.42;
const EARTH_RADIUS = UNIT * EARTH_SCALE;

// Border lines and clouds sit slightly above the Earth's surface.
const OUTLINE_RADIUS = 1.002;
const CLOUD_RADIUS = 1.012;
const CLOUD_COUNT = 500;

// Layer opacities during the Earth stage. Lower them if the page text is hard to read.
const GLOBE_LINE_OPACITY = 0.3;
const CLOUD_OPACITY = 0.35;

// Earth spin speed during the Earth stage, in radians per millisecond.
const EARTH_SPIN = 0.00005;

const CAMERA_Z = 1400;
const FOV = 35;

// Thickness of the surface shell and the interior layer that adds volume.
const SHELL_THICKNESS = 26;
const INTERIOR_DEPTH = 60;
const INTERIOR_SHARE = 0.25;

// Shares of the spacecraft particles.
const COCKPIT_SHARE = 0.07;
const ENGINE_RING_SHARE = 0.05;

const KIND_BODY = 0;
const KIND_COCKPIT = 1;
const KIND_ENGINE = 2;

// Palette: the two main foreground colours, plus darker blues for depth.
const GOLD = [255, 228, 92];
const SKY = [142, 220, 255];
const DEEP = [36, 92, 146];
const DEEPEST = [16, 44, 78];

// Engine nozzles, taken from the spacecraft geometry.
// Positions: rear face of each housing (centre z minus half-thickness).
// Directions: backward (-z), with a small downward tilt. Wing engines angle
// slightly outward. +X is the right wing as seen from the front.
const ENGINE_NOZZLES = [
  { position: [0, 4, -266], direction: [0, -0.3, -1] },
  { position: [245, -2, -176], direction: [0.18, -0.4, -1] },
  { position: [-245, -2, -176], direction: [-0.18, -0.4, -1] },
];

function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// Smooth minimum: blends two distance fields so shapes join without a seam.
const smin = (a, b, k) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};

// Signed distance to an ellipsoid (negative inside), rotated about z.
function ellipsoid(x, y, z, cx, cy, cz, rx, ry, rz, ang) {
  const dx = x - cx;
  const dy = y - cy;
  const dz = z - cz;
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const qx = dx * c - dy * s;
  const qy = dx * s + dy * c;
  const k = Math.sqrt((qx / rx) ** 2 + (qy / ry) ** 2 + (dz / rz) ** 2);
  return (k - 1) * Math.min(rx, ry, rz);
}

// Signed distance to a capsule (a tube with rounded ends) from a to b.
function capsule(x, y, z, a, b, r) {
  const pax = x - a[0];
  const pay = y - a[1];
  const paz = z - a[2];
  const bax = b[0] - a[0];
  const bay = b[1] - a[1];
  const baz = b[2] - a[2];
  const bb = bax * bax + bay * bay + baz * baz;
  const h = clamp((pax * bax + pay * bay + paz * baz) / bb);
  return Math.hypot(pax - bax * h, pay - bay * h, paz - baz * h) - r;
}

// Signed distance to a flat disc (a cylinder with its faces in the xy plane).
function disc(x, y, z, cx, cy, cz, r, halfT) {
  const dx = x - cx;
  const dy = y - cy;
  const dz = z - cz;
  const dr = Math.hypot(dx, dy) - r;
  const dzz = Math.abs(dz) - halfT;
  const outside = Math.hypot(Math.max(dr, 0), Math.max(dzz, 0));
  return outside + Math.min(Math.max(dr, dzz), 0);
}

// Spacecraft coordinates: x is the wingspan, y is up, z points toward the nose.
// The nose is at z = +260 and the tail at z = -240.

// Fuselage: a slim, pointed body built from tapering capsules.
const BODY_PATH = [
  [0, 0, -240],
  [0, 0, -120],
  [0, 4, 0],
  [0, 4, 120],
  [0, 2, 220],
  [0, 0, 260],
];
const BODY_SEGMENTS = [];
for (let i = 0; i < BODY_PATH.length - 1; i++) {
  const t = i / (BODY_PATH.length - 2);
  const r = 42 - 22 * t * t;
  BODY_SEGMENTS.push({ a: BODY_PATH[i], b: BODY_PATH[i + 1], r });
}

// Swept wings: a row of capsules that sweep outward and back, tapering toward
// the tip. One set for each side.
function wingSegments(side) {
  const pts = [
    [side * 60, 0, 80],
    [side * 150, -4, 70],
    [side * 260, -6, 20],
    [side * 330, -4, -50],
    [side * 350, 0, -120],
  ];
  const segs = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const t = i / (pts.length - 2);
    segs.push({ a: pts[i], b: pts[i + 1], r: 42 - 16 * t });
  }
  return segs;
}
const WING_SEGMENTS = [...wingSegments(1), ...wingSegments(-1)];

// Engine housings: two on the wings, one at the tail.
const ENGINE_PODS = [
  { cx: 245, cy: -2, cz: -150, r: 42, t: 26 },
  { cx: -245, cy: -2, cz: -150, r: 42, t: 26 },
  { cx: 0, cy: 4, cz: -248, r: 34, t: 18 },
];

// Cockpit windshield: a dome on the front of the nose.
const COCKPIT = { cx: 0, cy: 26, cz: 150, rx: 36, ry: 22, rz: 54 };

// Hidden reference geometry: the whole spacecraft as one distance field.
// It is used only to place particles and is never rendered.
function shipSdf(x, y, z) {
  let d = 1e9;
  for (const seg of BODY_SEGMENTS) {
    d = smin(d, capsule(x, y, z, seg.a, seg.b, seg.r), 24);
  }
  for (const seg of WING_SEGMENTS) {
    d = smin(d, capsule(x, y, z, seg.a, seg.b, seg.r), 30);
  }
  for (const pod of ENGINE_PODS) {
    d = smin(d, disc(x, y, z, pod.cx, pod.cy, pod.cz, pod.r, pod.t), 22);
  }
  d = smin(
    d,
    ellipsoid(x, y, z, COCKPIT.cx, COCKPIT.cy, COCKPIT.cz, COCKPIT.rx, COCKPIT.ry, COCKPIT.rz, 0),
    14
  );
  return d;
}

// Samples the body. Most particles sit in a thin shell under the surface; a
// quarter sit slightly deeper to give the ship volume.
function sampleBody(rnd, count) {
  const out = [];
  let tries = 0;
  while (out.length < count && tries < 4000000) {
    tries++;
    const x = -380 + rnd() * 760;
    const y = -60 + rnd() * 120;
    const z = -280 + rnd() * 560;
    const d = shipSdf(x, y, z);
    if (rnd() < INTERIOR_SHARE) {
      if (d < -SHELL_THICKNESS && d > -SHELL_THICKNESS - INTERIOR_DEPTH) {
        out.push({ x, y, z, interior: true });
      }
    } else if (d < 0 && d > -SHELL_THICKNESS) {
      out.push({ x, y, z, interior: false });
    }
  }
  return out;
}

function writeColour(col, i3, c, k) {
  col[i3] = (c[0] / 255) * k;
  col[i3 + 1] = (c[1] / 255) * k;
  col[i3 + 2] = (c[2] / 255) * k;
}

// Body particle. Upper surfaces are lit more than lower ones. Wing seams are
// light-blue lines that suggest panels.
function writeBody(pos, col, n, p, rnd) {
  const i3 = n * 3;
  pos[i3] = p.x;
  pos[i3 + 1] = p.y;
  pos[i3 + 2] = p.z;
  const shade = clamp((p.y + 45) / 90, 0, 1);

  if (p.interior) {
    const c = rnd() < 0.5 ? DEEPEST : DEEP;
    writeColour(col, i3, c, 0.5 + 0.25 * shade);
    return;
  }

  const onWing = Math.abs(p.x) > 70;
  const seam = onWing && Math.abs(p.x % 40) < 1.6;
  if (seam) {
    writeColour(col, i3, SKY, 1.15);
    return;
  }
  const c = rnd() < 0.6 ? SKY : DEEP;
  writeColour(col, i3, c, 0.5 + 0.55 * shade);
}

// Cockpit particle on the front-upper surface of the windshield dome.
// Dark glass, light-blue rim, two panel dividers and a reflection streak.
function writeCockpit(pos, col, n, rnd) {
  let dx = 0;
  let dy = 0;
  let dz = 0;
  let tries = 0;
  do {
    const u = 2 * rnd() - 1;
    const phi = rnd() * TAU;
    const s = Math.sqrt(1 - u * u);
    dx = s * Math.cos(phi);
    dy = u;
    dz = s * Math.sin(phi);
    tries++;
  } while ((dz < 0.12 || dy < -0.05) && tries < 400);

  const i3 = n * 3;
  pos[i3] = COCKPIT.cx + dx * COCKPIT.rx;
  pos[i3 + 1] = COCKPIT.cy + dy * COCKPIT.ry;
  pos[i3 + 2] = COCKPIT.cz + dz * COCKPIT.rz;

  const rim = dz < 0.3 || dy > 0.85 || dy < 0.05;
  const divider = Math.abs(dx) < 0.03 || Math.abs(Math.abs(dx) - 0.42) < 0.03;
  const reflect = dx > 0.15 && dy > 0.25 && Math.abs(dx * 0.9 - dy * 0.6 - 0.1) < 0.06;

  if (rim) writeColour(col, i3, SKY, 1.0);
  else if (divider) writeColour(col, i3, SKY, 0.8);
  else if (reflect) writeColour(col, i3, SKY, 1.3);
  else writeColour(col, i3, rnd() < 0.15 ? DEEP : DEEPEST, 0.7 + 0.3 * rnd());
}

// Engine housing ring particles. Some sit on the exhaust face (golden core
// with a light-blue rim), and some on the cylindrical side (light-blue rim).
function writeEngineRing(pos, col, n, pod, rnd) {
  const i3 = n * 3;
  const th = rnd() * TAU;
  if (rnd() < 0.55) {
    const rr = pod.r * Math.sqrt(rnd());
    pos[i3] = pod.cx + rr * Math.cos(th);
    pos[i3 + 1] = pod.cy + rr * Math.sin(th);
    pos[i3 + 2] = pod.cz - pod.t;
    if (rr < 0.45 * pod.r) writeColour(col, i3, GOLD, 1.1);
    else writeColour(col, i3, SKY, 0.75);
  } else {
    pos[i3] = pod.cx + pod.r * Math.cos(th);
    pos[i3 + 1] = pod.cy + pod.r * Math.sin(th);
    pos[i3 + 2] = pod.cz + (rnd() * 2 - 1) * pod.t;
    writeColour(col, i3, SKY, 0.8);
  }
}

// Builds the spacecraft particles: body, cockpit and engine rings.
// The exhaust is a separate system and is not part of this array.
function buildShip(rnd, count) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const kind = new Uint8Array(count);

  const cockpitCount = Math.round(count * COCKPIT_SHARE);
  const ringCount = Math.round(count * ENGINE_RING_SHARE);
  const bodyCount = count - cockpitCount - ringCount;
  let n = 0;

  const body = sampleBody(rnd, bodyCount);
  const bodyStored = body.length;
  for (const p of body) {
    writeBody(pos, col, n, p, rnd);
    kind[n] = KIND_BODY;
    n++;
  }

  for (let k = 0; k < cockpitCount; k++) {
    writeCockpit(pos, col, n, rnd);
    kind[n] = KIND_COCKPIT;
    n++;
  }

  for (let k = 0; k < ringCount; k++) {
    writeEngineRing(pos, col, n, ENGINE_PODS[k % ENGINE_PODS.length], rnd);
    kind[n] = KIND_ENGINE;
    n++;
  }

  // If body sampling fell short, copy existing body particles so the total
  // stays exact.
  let fill = 0;
  while (n < count && bodyStored > 0) {
    const src = (fill % bodyStored) * 3;
    const i3 = n * 3;
    pos[i3] = pos[src];
    pos[i3 + 1] = pos[src + 1];
    pos[i3 + 2] = pos[src + 2];
    col[i3] = col[src];
    col[i3 + 1] = col[src + 1];
    col[i3 + 2] = col[src + 2];
    kind[n] = KIND_BODY;
    n++;
    fill++;
  }

  return { pos, col, kind };
}

// Star morph target: a filled five-point star, sized by STAR_UNIT.
function insidePolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-9) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function samplePolygon(poly, rnd, depth) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [px, py] of poly) {
    minX = Math.min(minX, px);
    maxX = Math.max(maxX, px);
    minY = Math.min(minY, py);
    maxY = Math.max(maxY, py);
  }
  let x = 0;
  let y = 0;
  let tries = 0;
  do {
    x = minX + rnd() * (maxX - minX);
    y = minY + rnd() * (maxY - minY);
    tries++;
  } while (!insidePolygon(x, y, poly) && tries < 500);
  return { x, y, z: (rnd() - 0.5) * depth };
}

// Star outline. Points alternate between the outer and inner corners of a
// five-point star, sized by STAR_UNIT.
const STAR = Array.from({ length: 10 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI) / 5;
  const r = i % 2 === 0 ? 1.08 : 0.49;
  return [Math.cos(a) * r * STAR_UNIT, Math.sin(a) * r * STAR_UNIT];
});

// Builds every spacecraft-particle target once. Each particle keeps the same
// index in every target, so it travels from spacecraft to star to Earth.
function buildData(rnd) {
  const N = SHIP_COUNT;
  const shipData = buildShip(rnd, N);
  const earthData = buildEarthTargets(rnd, N, EARTH_RADIUS);
  const star = new Float32Array(N * 3);
  const starCol = new Float32Array(N * 3);
  const sizes = new Float32Array(N);
  const alphas = new Float32Array(N);
  const phases = new Float32Array(N);
  const shimmer = new Float32Array(N);

  for (let i = 0; i < N; i++) {
    const i3 = i * 3;

    const sp = samplePolygon(STAR, rnd, 0.2 * STAR_UNIT);
    star[i3] = sp.x;
    star[i3 + 1] = -sp.y;
    star[i3 + 2] = sp.z;

    // Star particles are slightly brighter, so the filled star reads clearly.
    const sc = rnd() < 0.15 ? GOLD : SKY;
    writeColour(starCol, i3, sc, 0.95 + rnd() * 0.15);

    sizes[i] = 1.0 + rnd() * 1.1;
    alphas[i] = 0.55 + rnd() * 0.4;
    phases[i] = rnd() * TAU;
    shimmer[i] = rnd() * TAU;
  }

  return {
    ship: shipData.pos,
    shipCol: shipData.col,
    kind: shipData.kind,
    star,
    starCol,
    earth: earthData.pos,
    earthCol: earthData.col,
    sizes,
    alphas,
    phases,
    shimmer,
  };
}

const VERTEX_SHADER = `
attribute vec3 aColor;
attribute float aSize;
attribute float aAlpha;
uniform float uPixelRatio;
uniform float uBase;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float depth = -mv.z;
  float att = uBase / max(depth, 1.0);
  gl_PointSize = aSize * att * uPixelRatio * 1.6;
  float fade = clamp(1.0 - (depth - uBase) / 600.0, 0.35, 1.0);
  vAlpha = aAlpha * fade;
  vColor = aColor;
  gl_Position = projectionMatrix * mv;
}
`;

const FRAGMENT_SHADER = `
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.15, d) * vAlpha;
  gl_FragColor = vec4(vColor, a);
}
`;

// Cloud points: soft white and pale-blue dots above the Earth's surface.
const CLOUD_VERTEX_SHADER = `
attribute vec3 aColor;
attribute float aSize;
uniform float uPixelRatio;
uniform float uBase;
varying vec3 vColor;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float depth = max(-mv.z, 1.0);
  gl_PointSize = clamp(aSize * 1.6 * uPixelRatio * uBase / depth, 1.0, 10.0);
  gl_Position = projectionMatrix * mv;
  vColor = aColor;
}
`;

const CLOUD_FRAGMENT_SHADER = `
uniform float uOpacity;
varying vec3 vColor;
void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.1, d);
  gl_FragColor = vec4(vColor, a * uOpacity);
}
`;

// Border lines: thin, pale blue, drawn on the Earth's surface.
const OUTLINE_VERTEX_SHADER = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const OUTLINE_FRAGMENT_SHADER = `
uniform vec3 uColor;
uniform float uOpacity;
void main() {
  gl_FragColor = vec4(uColor, uOpacity);
}
`;

function styleLayer(el) {
  el.style.position = 'absolute';
  el.style.inset = '0';
  el.style.width = '100%';
  el.style.height = '100%';
  el.style.display = 'block';
  el.style.pointerEvents = 'none';
}

export default function ParticleField({ showSculpture = true }) {
  const containerRef = useRef(null);
  const sculptureCanvasRef = useRef(null);

  useEffect(() => {
    if (sculptureCanvasRef.current) {
      sculptureCanvasRef.current.style.visibility =
        showSculpture ? "visible" : "hidden";
  }
}, [showSculpture]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.matchMedia('(max-width: 640px)').matches;
    const maxDpr = mobile ? 1.25 : 1.6;
    let dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    let w = window.innerWidth;
    let h = window.innerHeight;
    let targetScroll = 0;
    let easedScroll = 0;
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    let lastTime = 0;
    let exhaust = null;

    const rnd = seeded(20261111);

    // Ambient layer: a full-page 2D canvas, kept separate from the spacecraft.
    const ambientCanvas = document.createElement('canvas');
    styleLayer(ambientCanvas);
    const actx = ambientCanvas.getContext('2d');
    const ambient = Array.from({ length: AMBIENT_COUNT }, (_, i) => {
      const big = i % 14 === 0;
      return {
        x: rnd(),
        y: rnd(),
        r: big ? 1.6 + rnd() * 0.9 : 0.45 + rnd() * 0.95,
        a: big ? 0.8 : 0.35 + rnd() * 0.5,
        phase: rnd() * TAU,
        vx: (rnd() - 0.5) * 0.00012,
        vy: (rnd() - 0.5) * 0.00012,
        cyan: rnd() > 0.12,
        big,
      };
    });
    container.appendChild(ambientCanvas);

    // Spacecraft, star and Earth layer: Three.js canvas.
    const sculptureCanvas = document.createElement('canvas');
    sculptureCanvasRef.current = sculptureCanvas;
    sculptureCanvas.style.visibility = showSculpture ? "visible" : "hidden";
    styleLayer(sculptureCanvas);
    container.appendChild(sculptureCanvas);

    let renderer = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: sculptureCanvas,
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
      });
      renderer.setClearColor(0x000000, 0);
    } catch (err) {
      renderer = null;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, w / h, 1, 5000);
    camera.position.set(0, 0, CAMERA_Z);
    const group = new THREE.Group();
    scene.add(group);

    const data = buildData(rnd);
    const N = SHIP_COUNT;
    const current = new Float32Array(data.ship);
    const currentCol = new Float32Array(data.shipCol);

    const positionAttr = new THREE.BufferAttribute(current, 3);
    positionAttr.setUsage(THREE.DynamicDrawUsage);
    const colorAttr = new THREE.BufferAttribute(currentCol, 3);
    colorAttr.setUsage(THREE.DynamicDrawUsage);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', positionAttr);
    geometry.setAttribute('aColor', colorAttr);
    geometry.setAttribute('aSize', new THREE.BufferAttribute(data.sizes, 1));
    geometry.setAttribute('aAlpha', new THREE.BufferAttribute(data.alphas, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uPixelRatio: { value: dpr },
        uBase: { value: CAMERA_Z },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    group.add(points);

    // Exhaust: three particle emitters added to the same group as the
    // spacecraft, so they follow its rotation and movement.
    const nozzles = ENGINE_NOZZLES.map((n) => ({
      position: new THREE.Vector3(n.position[0], n.position[1], n.position[2]),
      direction: new THREE.Vector3(n.direction[0], n.direction[1], n.direction[2]),
    }));
    exhaust = createParticleExhaust(THREE, group, nozzles, dpr);

    // Globe layers: border lines and clouds. They sit in their own group inside
    // the spacecraft group, so they turn with the Earth dots.
    const globe = new THREE.Group();
    globe.visible = false;
    group.add(globe);

    const outlinePos = buildOutlineTargets(EARTH_RADIUS * OUTLINE_RADIUS);
    const outlineGeo = new THREE.BufferGeometry();
    outlineGeo.setAttribute('position', new THREE.BufferAttribute(outlinePos, 3));
    const outlineMat = new THREE.ShaderMaterial({
      uniforms: {
        uOpacity: { value: 0 },
        uColor: { value: new THREE.Vector3(0.75, 0.9, 1.0) },
      },
      vertexShader: OUTLINE_VERTEX_SHADER,
      fragmentShader: OUTLINE_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const outline = new THREE.LineSegments(outlineGeo, outlineMat);
    outline.frustumCulled = false;
    globe.add(outline);

    const cloudData = buildCloudTargets(rnd, CLOUD_COUNT, EARTH_RADIUS * CLOUD_RADIUS);
    const cloudGeo = new THREE.BufferGeometry();
    cloudGeo.setAttribute('position', new THREE.BufferAttribute(cloudData.pos, 3));
    cloudGeo.setAttribute('aColor', new THREE.BufferAttribute(cloudData.col, 3));
    cloudGeo.setAttribute('aSize', new THREE.BufferAttribute(cloudData.size, 1));
    const cloudMat = new THREE.ShaderMaterial({
      uniforms: {
        uPixelRatio: { value: dpr },
        uBase: { value: CAMERA_Z },
        uOpacity: { value: 0 },
      },
      vertexShader: CLOUD_VERTEX_SHADER,
      fragmentShader: CLOUD_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const clouds = new THREE.Points(cloudGeo, cloudMat);
    clouds.frustumCulled = false;
    globe.add(clouds);

    // Centre of the viewport in the group's local space. It is updated each
    // frame, so the Earth stays centred even when the group sways.
    const centreLocal = new THREE.Vector3();

    // Places the spacecraft on the right half of the hero. The spacecraft
    // layout is unchanged.
    const layoutSpacecraft = () => {
      const halfH = CAMERA_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
      const unitsPerPx = (2 * halfH) / h;
      const shipWidth = 760;
      const targetPx = w * (mobile ? 0.8 : 0.5);
      const s = (targetPx * unitsPerPx) / shipWidth;
      const cx = w * (mobile ? 0.6 : 0.72);
      const cy = h * 0.5;
      group.scale.setScalar(s);
      group.position.set((cx - w / 2) * unitsPerPx, -(cy - h / 2) * unitsPerPx, 0);
      group.rotation.set(-0.35, 0, 0);
    };

    const requestFrame = () => {
      if (!raf && !document.hidden) {
        raf = requestAnimationFrame(frame);
      }
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

      ambientCanvas.width = Math.round(w * dpr);
      ambientCanvas.height = Math.round(h * dpr);
      actx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (renderer) {
        renderer.setPixelRatio(dpr);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        material.uniforms.uPixelRatio.value = dpr;
        cloudMat.uniforms.uPixelRatio.value = dpr;
        if (exhaust) exhaust.points.material.uniforms.uPixelRatio.value = dpr;
        layoutSpacecraft();
      }
      requestFrame();
    };

    const readScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - h);
      targetScroll = clamp(window.scrollY / max);
      if (reduced) {
        easedScroll = targetScroll;
        requestFrame();
      }
    };

    const onPointerMove = (e) => {
      tx = (e.clientX / w - 0.5) * 2;
      ty = (e.clientY / h - 0.5) * 2;
    };

    const drawAmbient = (time, dt) => {
      actx.clearRect(0, 0, w, h);
      for (const p of ambient) {
        if (!reduced) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.x > 1.02) p.x = -0.02;
          if (p.x < -0.02) p.x = 1.02;
          if (p.y > 1.02) p.y = -0.02;
          if (p.y < -0.02) p.y = 1.02;
        }
        const pulse = reduced ? 1 : 0.65 + 0.35 * Math.sin(time * 0.0015 + p.phase);
        const alpha = Math.min(1, p.a * pulse);
        const color = p.cyan ? '35, 220, 225' : '235, 245, 255';
        const cx = p.x * w;
        const cy = p.y * h;
        if (p.big) {
          actx.beginPath();
          actx.arc(cx, cy, p.r * 3, 0, TAU);
          actx.fillStyle = `rgba(${color}, ${alpha * 0.12})`;
          actx.fill();
        }
        actx.beginPath();
        actx.arc(cx, cy, p.r, 0, TAU);
        actx.fillStyle = `rgba(${color}, ${alpha})`;
        actx.fill();
      }
    };

    // Updates every spacecraft, star and Earth particle. Each particle moves from
    // its spacecraft position toward its star and Earth targets, using the same
    // index. The star is turned by `starSpin` around the vertical axis, with a
    // small shimmer. The Earth is turned by `spin` and moved to the centre `cl`.
    const updatePoints = (morphStar, morphEarth, time, spin, starSpin, cl) => {
      const { ship, star, earth, shipCol, starCol, earthCol, phases, shimmer } = data;
      const useEarthCol = morphEarth > 0.5;
      const useStarCol = !useEarthCol && morphStar > 0.45;
      const srcCol = useEarthCol ? earthCol : useStarCol ? starCol : shipCol;

      const cs = Math.cos(spin);
      const sn = Math.sin(spin);
      const ss = Math.cos(starSpin);
      const ssn = Math.sin(starSpin);

      for (let i = 0; i < N; i++) {
        const i3 = i * 3;
        const sx = ship[i3];
        const sy = ship[i3 + 1];
        const sz = ship[i3 + 2];

        // Star target: rotated around the vertical axis, with a gentle shimmer.
        // The shimmer is a small per-particle offset that changes over time.
        const stx0 = star[i3];
        const sty = star[i3 + 1];
        const stz0 = star[i3 + 2];
        const stx = stx0 * ss + stz0 * ssn;
        const stz = -stx0 * ssn + stz0 * ss;
        const sh = shimmer[i];
        const shimX = Math.sin(time * STAR_SHIMMER_SPEED + sh) * STAR_DRIFT;
        const shimZ = Math.cos(time * STAR_SHIMMER_SPEED * 0.8 + sh * 1.3) * STAR_DRIFT;
        const starX = stx + shimX;
        const starY = sty + Math.sin(time * STAR_SHIMMER_SPEED * 1.1 + sh) * STAR_DRIFT * 0.6;
        const starZ = stz + shimZ;

        let x = sx + (starX - sx) * morphStar;
        let y = sy + (starY - sy) * morphStar;
        let z = sz + (starZ - sz) * morphStar;

        // Earth target: turned by `spin` and moved to the viewport centre.
        const ex0 = earth[i3];
        const ey0 = earth[i3 + 1];
        const ez0 = earth[i3 + 2];
        const ex = ex0 * cs + ez0 * sn + cl.x;
        const ey = ey0 + cl.y;
        const ez = -ex0 * sn + ez0 * cs + cl.z;

        x += (ex - x) * morphEarth;
        y += (ey - y) * morphEarth;
        z += (ez - z) * morphEarth;

        // Small wobble on the spacecraft and Earth, as before.
        if (time && morphStar < 0.5) {
          const ph = phases[i];
          x += Math.sin(time * 0.00042 + ph) * 1.6;
          z += Math.cos(time * 0.00036 + ph) * 1.4;
        }

        current[i3] = x;
        current[i3 + 1] = y;
        current[i3 + 2] = z;
        currentCol[i3] = srcCol[i3];
        currentCol[i3 + 1] = srcCol[i3 + 1];
        currentCol[i3 + 2] = srcCol[i3 + 2];
      }
      positionAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;
    };

    const frame = (time) => {
      raf = 0;
      const dt = lastTime ? Math.min(50, time - lastTime) : 16;
      lastTime = time;

      if (reduced) {
        easedScroll = targetScroll;
      } else {
        easedScroll += (targetScroll - easedScroll) * 0.075;
        px += (tx - px) * 0.025;
        py += (ty - py) * 0.025;
      }

      if (renderer) {
        const morphStar = smooth(0.18, 0.43, easedScroll);
        const morphEarth = smooth(0.58, 0.86, easedScroll);
        const spin = reduced ? 0 : time * EARTH_SPIN;

        // The star spins only while it is the main shape. It fades out before
        // the Earth stage, so the Earth and spacecraft are not turned.
        const starActive = morphStar * (1 - smooth(0.5, 0.7, morphEarth));
        const starSpin = reduced ? 0 : time * STAR_SPIN * starActive;

        if (!reduced) {
          group.rotation.y = Math.sin(time * 0.00005) * 0.12 + px * 0.1;
          group.rotation.x = -0.35 + py * 0.06;
        }

        // Find the viewport centre in the group's local space.
        group.updateMatrixWorld(true);
        centreLocal.set(0, 0, 0);
        group.worldToLocal(centreLocal);

        updatePoints(
          morphStar,
          morphEarth,
          reduced ? 0 : time,
          spin,
          starSpin,
          centreLocal
        );

        // The globe layers follow the Earth dots. They fade in with the Earth
        // stage and move from the spacecraft position to the centre.
        globe.position.set(
          centreLocal.x * morphEarth,
          centreLocal.y * morphEarth,
          centreLocal.z * morphEarth
        );
        globe.rotation.y = spin;
        globe.visible = morphEarth > 0.005;
        outlineMat.uniforms.uOpacity.value = morphEarth * GLOBE_LINE_OPACITY;
        cloudMat.uniforms.uOpacity.value = morphEarth * CLOUD_OPACITY;

        // Exhaust fades out as the spacecraft turns into the star.
        const exhaustIntensity = clamp(1 - morphStar);
        if (exhaust) {
          exhaust.points.visible = exhaustIntensity > 0.01;
          if (!reduced && exhaustIntensity > 0.01) {
            exhaust.update(dt / 1000, exhaustIntensity);
          }
        }

        renderer.render(scene, camera);
      }

      drawAmbient(time, dt);

      if (!reduced) requestFrame();
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else {
        lastTime = 0;
        requestFrame();
      }
    };

    resize();
    readScroll();
    requestFrame();

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', readScroll, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', readScroll);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibility);
      if (exhaust) {
        exhaust.dispose();
        exhaust = null;
      }
      outlineGeo.dispose();
      outlineMat.dispose();
      cloudGeo.dispose();
      cloudMat.dispose();
      geometry.dispose();
      material.dispose();
      if (renderer) renderer.dispose();
      ambientCanvas.remove();
      sculptureCanvas.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    />
  );
}