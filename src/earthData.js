import { feature, mesh } from 'topojson-client';
import countriesTopo from 'world-atlas/countries-50m.json';

// Land mask resolution: about 0.09 degrees per pixel.
const MASK_W = 4096;
const MASK_H = 2048;

// Share of the remaining Earth dots (after country anchors) placed on land.
const LAND_SHARE = 0.7;

// How many vertices to test when choosing a country's anchor dot.
const ANCHOR_CANDIDATES = 40;

const GOLD = [255, 228, 92];
const SKY = [142, 220, 255];
const PALE = [205, 239, 255];
const WHITE = [255, 255, 255];

let landCache = null;
let outlineCache = null;

function writeColour(col, i3, c, k) {
  col[i3] = (c[0] / 255) * k;
  col[i3 + 1] = (c[1] / 255) * k;
  col[i3 + 2] = (c[2] / 255) * k;
}

// Writes a point on a sphere of radius R. Longitude 0 faces the camera and
// east is on the right as seen from the camera.
function sphereXYZ(lonDeg, latDeg, R, out, o) {
  const lam = (lonDeg * Math.PI) / 180;
  const phi = (latDeg * Math.PI) / 180;
  const cp = Math.cos(phi);
  out[o] = R * cp * Math.sin(lam);
  out[o + 1] = R * Math.sin(phi);
  out[o + 2] = R * cp * Math.cos(lam);
}

// Wraps a longitude into the range -180 to 180.
function normLon(lon) {
  return ((((lon + 540) % 360) + 360) % 360) - 180;
}

// Makes a ring continuous across the date line, so shapes such as Russia's
// Far East are not stretched across the whole map.
function unwrapRing(ring) {
  const out = [];
  let prev = null;
  for (const [lon, lat] of ring) {
    let x = lon;
    if (prev !== null) {
      while (x - prev > 180) x -= 360;
      while (x - prev < -180) x += 360;
    }
    out.push([x, lat]);
    prev = x;
  }
  return out;
}

function maskAt(mask, lon, lat) {
  let x = Math.floor(((lon + 180) / 360) * MASK_W);
  let y = Math.floor(((90 - lat) / 180) * MASK_H);
  if (x < 0) x = 0;
  if (x >= MASK_W) x = MASK_W - 1;
  if (y < 0) y = 0;
  if (y >= MASK_H) y = MASK_H - 1;
  return mask[y * MASK_W + x] === 1;
}

function pixelLonLat(idx) {
  const x = idx % MASK_W;
  const y = (idx - x) / MASK_W;
  return [
    ((x + 0.5) / MASK_W) * 360 - 180,
    90 - ((y + 0.5) / MASK_H) * 180,
  ];
}

// Draws every country polygon from the dataset into a land mask, and records
// one anchor point per country so every country gets at least one dot.
function buildLandCache() {
  if (landCache) return landCache;

  const canvas = document.createElement('canvas');
  canvas.width = MASK_W;
  canvas.height = MASK_H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, MASK_W, MASK_H);
  ctx.fillStyle = '#fff';

  const countries = feature(countriesTopo, countriesTopo.objects.countries).features;
  const featureVerts = [];

  for (const f of countries) {
    const g = f.geometry;
    if (!g) continue;
    const polygons =
      g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];

    const verts = [];
    for (const rings of polygons) {
      const unwrapped = rings.map(unwrapRing);
      for (const ring of unwrapped) {
        for (const v of ring) verts.push(v);
      }
      // Draw three copies, shifted by -360, 0 and +360 degrees, so polygons
      // crossing the date line appear on both sides of the map.
      for (const shift of [-MASK_W, 0, MASK_W]) {
        ctx.beginPath();
        for (const ring of unwrapped) {
          ring.forEach(([lon, lat], k) => {
            const x = ((lon + 180) / 360) * MASK_W + shift;
            const y = ((90 - lat) / 180) * MASK_H;
            if (k === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.closePath();
        }
        ctx.fill('evenodd');
      }
    }
    featureVerts.push(verts);
  }

  const px = ctx.getImageData(0, 0, MASK_W, MASK_H).data;
  const total = MASK_W * MASK_H;
  const mask = new Uint8Array(total);
  let landTotal = 0;
  for (let i = 0; i < total; i++) {
    // Any coverage counts as land, so very small islands are kept.
    if (px[i * 4] > 0) {
      mask[i] = 1;
      landTotal++;
    }
  }

  const landIdx = new Uint32Array(landTotal);
  let k = 0;
  for (let i = 0; i < total; i++) {
    if (mask[i]) landIdx[k++] = i;
  }

  // One anchor per country: the first vertex that lies on land. If none does,
  // the first vertex is used, so the country still gets a dot.
  const anchors = [];
  for (const verts of featureVerts) {
    if (!verts.length) continue;
    const step = Math.max(1, Math.floor(verts.length / ANCHOR_CANDIDATES));
    let chosen = null;
    for (let i = 0; i < verts.length; i += step) {
      const lon = normLon(verts[i][0]);
      const lat = verts[i][1];
      if (maskAt(mask, lon, lat)) {
        chosen = [lon, lat];
        break;
      }
    }
    if (!chosen) chosen = [normLon(verts[0][0]), verts[0][1]];
    anchors.push(chosen);
  }

  landCache = { mask, landIdx, anchors };
  return landCache;
}

// Builds N Earth dots on a sphere of radius R:
// 1. One gold anchor dot per country.
// 2. The rest are split between land (gold, evenly spread over land area) and
//    ocean (light blue, evenly spread over the sphere).
export function buildEarthTargets(rnd, N, R) {
  const { mask, landIdx, anchors } = buildLandCache();
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  let n = 0;

  for (const [lon, lat] of anchors) {
    if (n >= N) break;
    sphereXYZ(lon, lat, R, pos, n * 3);
    writeColour(col, n * 3, GOLD, 1.0);
    n++;
  }

  const landTarget = Math.round((N - n) * LAND_SHARE);
  let landWritten = 0;
  let guard = 0;
  while (landWritten < landTarget && landIdx.length > 0 && guard < landTarget * 60) {
    guard++;
    const idx = landIdx[Math.floor(rnd() * landIdx.length)];
    const [lon0, lat0] = pixelLonLat(idx);
    // Pixels near the poles cover less area. Accepting with probability
    // cos(lat) keeps the dot density even over the surface.
    if (rnd() > Math.cos((lat0 * Math.PI) / 180)) continue;
    const lon = lon0 + (rnd() - 0.5) * (360 / MASK_W);
    const lat = lat0 + (rnd() - 0.5) * (180 / MASK_H);
    sphereXYZ(lon, lat, R, pos, n * 3);
    writeColour(col, n * 3, GOLD, 0.85 + 0.15 * rnd());
    n++;
    landWritten++;
  }

  while (n < N) {
    let lon = 0;
    let lat = 0;
    let t = 0;
    do {
      lat = (Math.asin(rnd() * 2 - 1) * 180) / Math.PI;
      lon = rnd() * 360 - 180;
      t++;
    } while (maskAt(mask, lon, lat) && t < 30);
    sphereXYZ(lon, lat, R, pos, n * 3);
    writeColour(col, n * 3, SKY, 0.45 + 0.35 * rnd());
    n++;
  }

  // Shuffle so the Earth dots are not in continent order.
  for (let i = N - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    for (let c = 0; c < 3; c++) {
      let t = pos[i * 3 + c];
      pos[i * 3 + c] = pos[j * 3 + c];
      pos[j * 3 + c] = t;
      t = col[i * 3 + c];
      col[i * 3 + c] = col[j * 3 + c];
      col[j * 3 + c] = t;
    }
  }

  return { pos, col };
}

// Border and coastline lines from the dataset, on a unit sphere. Cached.
function buildUnitOutline() {
  if (outlineCache) return outlineCache;

  const lines = mesh(countriesTopo, countriesTopo.objects.countries);
  let segments = 0;
  for (const line of lines.coordinates) {
    segments += Math.max(0, line.length - 1);
  }

  const out = new Float32Array(segments * 6);
  let k = 0;
  for (const line of lines.coordinates) {
    for (let i = 0; i < line.length - 1; i++) {
      sphereXYZ(line[i][0], line[i][1], 1, out, k);
      sphereXYZ(line[i + 1][0], line[i + 1][1], 1, out, k + 3);
      k += 6;
    }
  }

  outlineCache = out;
  return out;
}

export function buildOutlineTargets(R) {
  const unit = buildUnitOutline();
  const out = new Float32Array(unit.length);
  for (let i = 0; i < unit.length; i++) {
    out[i] = unit[i] * R;
  }
  return out;
}

// Soft cloud pattern. This is procedural, not a cloud dataset.
function cloudDensity(lonDeg, latDeg) {
  const a = (lonDeg * Math.PI) / 180;
  const b = (latDeg * Math.PI) / 180;
  const v =
    Math.sin(3 * a + 1.3 * b) * Math.cos(2 * b - 0.7 * a) +
    0.5 * Math.sin(5 * a - 3 * b + 0.4);
  return v / 1.5 + 0.5;
}

export function buildCloudTargets(rnd, count, R) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const size = new Float32Array(count);

  for (let n = 0; n < count; n++) {
    let lon = 0;
    let lat = 0;
    for (let t = 0; t < 300; t++) {
      lat = (Math.asin(rnd() * 2 - 1) * 180) / Math.PI;
      lon = rnd() * 360 - 180;
      if (cloudDensity(lon, lat) > 0.78) break;
    }
    const i3 = n * 3;
    sphereXYZ(lon, lat, R, pos, i3);
    const c = rnd() < 0.6 ? WHITE : PALE;
    writeColour(col, i3, c, 0.85 + 0.15 * rnd());
    size[n] = 1.2 + rnd() * 1.2;
  }

  return { pos, col, size };
}