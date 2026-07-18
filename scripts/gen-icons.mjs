/**
 * Generates the PWA icons (public/icons/192.png, 512.png) with zero
 * dependencies — a minimalist enso (open zen ring) in noircut off-white on the
 * near-black theme background. Run: `node scripts/gen-icons.mjs`
 */
import zlib from 'node:zlib'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// ── PNG encoding (RGBA, single IDAT) ──────────────────────────────────────────
const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data])
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

// ── Icon design ───────────────────────────────────────────────────────────────
const BG = [10, 10, 10]     // #0a0a0a (manifest theme_color)
const FG = [229, 229, 229]  // #e5e5e5 (noircut off-white)

const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v)
const mix = (a, b, t) => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
]
function angDist(a, b) {
  let d = Math.abs(a - b) % (2 * Math.PI)
  if (d > Math.PI) d = 2 * Math.PI - d
  return d
}

function makePng(S) {
  const cx = S / 2, cy = S / 2
  const outerR = S * 0.36   // inside the maskable safe zone (~0.4*S)
  const stroke = S * 0.075
  const innerR = outerR - stroke
  const feather = Math.max(1, S * 0.005)
  const gapStart = -0.35, gapEnd = 0.55, taper = 0.28 // enso opening (radians)

  const raw = Buffer.alloc(S * (S * 4 + 1))
  let p = 0
  for (let y = 0; y < S; y++) {
    raw[p++] = 0 // filter: none
    for (let x = 0; x < S; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy
      const dist = Math.hypot(dx, dy)
      let a = Math.min(clamp01((outerR - dist) / feather), clamp01((dist - innerR) / feather))
      if (a > 0) {
        const ang = Math.atan2(dy, dx)
        if (ang > gapStart && ang < gapEnd) {
          a = 0
        } else {
          const near = Math.min(angDist(ang, gapStart), angDist(ang, gapEnd))
          if (near < taper) a *= clamp01(near / taper)
        }
      }
      const [r, g, b] = mix(BG, FG, a)
      raw[p++] = r; raw[p++] = g; raw[p++] = b; raw[p++] = 255
    }
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4)
  ihdr[8] = 8; ihdr[9] = 6 // 8-bit RGBA
  const idat = zlib.deflateSync(raw, { level: 9 })
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))])
}

const root = path.resolve(fileURLToPath(import.meta.url), '../..')
const outDir = path.join(root, 'public', 'icons')
fs.mkdirSync(outDir, { recursive: true })
for (const size of [192, 512]) {
  const file = path.join(outDir, `${size}.png`)
  fs.writeFileSync(file, makePng(size))
  console.log(`wrote ${path.relative(root, file)}`)
}
