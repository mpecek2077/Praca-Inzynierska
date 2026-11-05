/**
 * Lokalne grafiki pogladowe modeli i czesci (bez logo OEM).
 * Generuje SVG + PNG (sylwetki / stylizowane karty) do public/parts/.
 *
 * Uruchom: node scripts/generate-part-images.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const W = 640;
const H = 400;
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "parts");
mkdirSync(root, { recursive: true });

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
    }
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function mixRgb(a, b, t) {
  return [
    Math.round(lerp(a[0], b[0], t)),
    Math.round(lerp(a[1], b[1], t)),
    Math.round(lerp(a[2], b[2], t)),
  ];
}

/** Point-in-polygon (ray cast). */
function pointInPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];
    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi + 0.0000001) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function inCircle(x, y, cx, cy, r) {
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

function encodePng(pixels) {
  const raw = Buffer.alloc((W * 3 + 1) * H);
  for (let y = 0; y < H; y++) {
    const row = y * (W * 3 + 1);
    raw[row] = 0;
    for (let x = 0; x < W; x++) {
      const p = (y * W + x) * 3;
      const i = row + 1 + x * 3;
      raw[i] = pixels[p];
      raw[i + 1] = pixels[p + 1];
      raw[i + 2] = pixels[p + 2];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function paintScene({ top, bottom, accent, shapes, circles }) {
  const pixels = Buffer.alloc(W * H * 3);
  for (let y = 0; y < H; y++) {
    const t = y / (H - 1);
    const base = mixRgb(top, bottom, t);
    // Subtelny diagonalny blask (bez pomaranczowego paska).
    for (let x = 0; x < W; x++) {
      const glow = clamp(1 - Math.abs(x / W - 0.55 + (y / H - 0.4) * 0.35) * 2.2, 0, 1);
      const rgb = mixRgb(base, accent, glow * 0.12);
      const i = (y * W + x) * 3;
      pixels[i] = rgb[0];
      pixels[i + 1] = rgb[1];
      pixels[i + 2] = rgb[2];
    }
  }

  // Dekoracyjne kolo w tle
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (inCircle(x, y, 520, 90, 110)) {
        const i = (y * W + x) * 3;
        pixels[i] = Math.min(255, pixels[i] + 18);
        pixels[i + 1] = Math.min(255, pixels[i + 1] + 14);
        pixels[i + 2] = Math.min(255, pixels[i + 2] + 10);
      }
    }
  }

  for (const shape of shapes) {
    const fill = shape.fill;
    const edge = shape.edge || mixRgb(fill, [0, 0, 0], 0.35);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (!pointInPoly(x, y, shape.poly)) continue;
        const i = (y * W + x) * 3;
        // lekki cieniujacy gradient w dol
        const shade = 0.85 + 0.15 * (1 - y / H);
        const nearEdge =
          !pointInPoly(x - 1, y, shape.poly) ||
          !pointInPoly(x + 1, y, shape.poly) ||
          !pointInPoly(x, y - 1, shape.poly) ||
          !pointInPoly(x, y + 1, shape.poly);
        const c = nearEdge ? edge : fill;
        pixels[i] = Math.round(c[0] * shade);
        pixels[i + 1] = Math.round(c[1] * shade);
        pixels[i + 2] = Math.round(c[2] * shade);
      }
    }
  }

  for (const c of circles || []) {
    for (let y = Math.floor(c.cy - c.r - 1); y <= Math.ceil(c.cy + c.r + 1); y++) {
      for (let x = Math.floor(c.cx - c.r - 1); x <= Math.ceil(c.cx + c.r + 1); x++) {
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        const d = Math.hypot(x - c.cx, y - c.cy);
        if (d > c.r) continue;
        const i = (y * W + x) * 3;
        const ring = Math.abs(d - c.r * 0.72) < c.r * 0.18;
        const col = ring ? c.rim || [180, 190, 200] : c.fill || [28, 32, 40];
        pixels[i] = col[0];
        pixels[i + 1] = col[1];
        pixels[i + 2] = col[2];
      }
    }
  }

  return encodePng(pixels);
}

const CAR_SEDAN = [
  [70, 290],
  [110, 290],
  [130, 240],
  [190, 220],
  [230, 155],
  [410, 150],
  [470, 215],
  [560, 230],
  [590, 290],
  [70, 290],
];

const CAR_COUPE = [
  [75, 295],
  [115, 295],
  [140, 245],
  [200, 225],
  [250, 160],
  [390, 155],
  [455, 225],
  [555, 235],
  [585, 295],
  [75, 295],
];

const CAR_HATCH = [
  [80, 292],
  [120, 292],
  [145, 242],
  [205, 225],
  [245, 165],
  [400, 165],
  [455, 210],
  [520, 225],
  [555, 292],
  [80, 292],
];

const LOTKA = [
  [90, 265],
  [170, 220],
  [290, 155],
  [430, 140],
  [540, 155],
  [575, 195],
  [500, 220],
  [390, 255],
  [250, 285],
  [140, 285],
];

const SPOILER = [
  [100, 210],
  [540, 205],
  [555, 230],
  [520, 245],
  [500, 280],
  [470, 280],
  [455, 245],
  [185, 250],
  [170, 285],
  [140, 285],
  [125, 250],
  [95, 235],
];

const GENERIC = [
  [220, 120],
  [420, 120],
  [460, 200],
  [420, 280],
  [220, 280],
  [180, 200],
];

const assets = [
  {
    file: "model-m3",
    label: "M3",
    top: [28, 34, 48],
    bottom: [12, 16, 24],
    accent: [196, 92, 38],
    body: [52, 58, 70],
    car: CAR_COUPE,
    wheels: [
      { cx: 170, cy: 295, r: 28 },
      { cx: 500, cy: 295, r: 28 },
    ],
  },
  {
    file: "model-a4",
    label: "A4",
    top: [34, 38, 48],
    bottom: [16, 18, 26],
    accent: [150, 160, 175],
    body: [70, 74, 84],
    car: CAR_SEDAN,
    wheels: [
      { cx: 175, cy: 292, r: 27 },
      { cx: 505, cy: 292, r: 27 },
    ],
  },
  {
    file: "model-golf",
    label: "Golf",
    top: [26, 42, 38],
    bottom: [12, 24, 22],
    accent: [70, 150, 110],
    body: [48, 72, 62],
    car: CAR_HATCH,
    wheels: [
      { cx: 180, cy: 294, r: 27 },
      { cx: 470, cy: 294, r: 27 },
    ],
  },
  {
    file: "lotka",
    label: "Lotka",
    top: [36, 44, 56],
    bottom: [18, 24, 34],
    accent: [196, 92, 38],
    body: [200, 105, 55],
    car: LOTKA,
    wheels: [],
  },
  {
    file: "spoiler",
    label: "Spoiler",
    top: [30, 40, 54],
    bottom: [14, 18, 28],
    accent: [219, 109, 52],
    body: [210, 120, 60],
    car: SPOILER,
    wheels: [],
  },
  {
    file: "part-generic",
    label: "Part",
    top: [40, 36, 34],
    bottom: [18, 24, 34],
    accent: [154, 171, 188],
    body: [120, 130, 145],
    car: GENERIC,
    wheels: [],
  },
];

function svgCard({ label, top, bottom, accent, bodyPath, extra = "" }) {
  const topHex = rgbHex(top);
  const bottomHex = rgbHex(bottom);
  const accentHex = rgbHex(accent);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0%" stop-color="${topHex}"/>
      <stop offset="100%" stop-color="${bottomHex}"/>
    </linearGradient>
    <linearGradient id="glow" x1="0.2" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accentHex}" stop-opacity="0"/>
      <stop offset="55%" stop-color="${accentHex}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${accentHex}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" fill="url(#bg)"/>
  <rect width="640" height="400" fill="url(#glow)"/>
  <circle cx="520" cy="90" r="110" fill="#ffffff" fill-opacity="0.05"/>
  <text x="36" y="52" fill="#9aabbc" font-family="Arial, Helvetica, sans-serif" font-size="20">FLYDES</text>
  <text x="36" y="92" fill="#e8eef5" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700">${label}</text>
  ${bodyPath}
  ${extra}
</svg>
`;
}

function rgbHex([r, g, b]) {
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

function polyToPath(poly) {
  return poly.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`).join(" ") + " Z";
}

for (const asset of assets) {
  const bodyFill = rgbHex(asset.body);
  const edge = rgbHex(mixRgb(asset.body, [0, 0, 0], 0.35));
  let bodyPath = `<path d="${polyToPath(asset.car)}" fill="${bodyFill}" stroke="${edge}" stroke-width="3"/>`;
  let extra = "";
  if (asset.wheels.length) {
    extra = asset.wheels
      .map(
        (w) =>
          `<circle cx="${w.cx}" cy="${w.cy}" r="${w.r}" fill="#1c2028"/><circle cx="${w.cx}" cy="${w.cy}" r="${Math.round(w.r * 0.55)}" fill="none" stroke="#b4bec8" stroke-width="5"/>`,
      )
      .join("\n  ");
    // ground line
    extra += `\n  <line x1="60" y1="324" x2="600" y2="324" stroke="#9aabbc" stroke-opacity="0.25" stroke-width="2"/>`;
  } else if (asset.file === "spoiler") {
    extra = `<rect x="150" y="248" width="26" height="42" rx="4" fill="#9aabbc" fill-opacity="0.45"/><rect x="470" y="245" width="26" height="42" rx="4" fill="#9aabbc" fill-opacity="0.45"/>`;
  } else if (asset.file === "part-generic") {
    extra = `<circle cx="320" cy="200" r="36" fill="none" stroke="${rgbHex(asset.accent)}" stroke-width="6"/>`;
  }

  const svg = svgCard({
    label: asset.label,
    top: asset.top,
    bottom: asset.bottom,
    accent: asset.accent,
    bodyPath,
    extra,
  });
  writeFileSync(join(root, `${asset.file}.svg`), svg, "utf8");

  const png = paintScene({
    top: asset.top,
    bottom: asset.bottom,
    accent: asset.accent,
    shapes: [{ poly: asset.car, fill: asset.body }],
    circles: asset.wheels.map((w) => ({
      cx: w.cx,
      cy: w.cy,
      r: w.r,
      fill: [28, 32, 40],
      rim: [180, 190, 200],
    })),
  });
  writeFileSync(join(root, `${asset.file}.png`), png);
  console.log("wrote", asset.file + ".svg/.png", png.length, "bytes png");
}

console.log("OK: public/parts updated (no OEM logos)");
