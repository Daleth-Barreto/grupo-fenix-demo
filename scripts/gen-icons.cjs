/* Genera los íconos PWA de Grupo Fénix (navy con "F" naranja) */
const fs = require('fs')
const path = require('path')
const { PNG } = require('pngjs')

const NAVY = [10, 25, 47]     // #0A192F
const ORANGE = [253, 118, 26] // #FD761A

function rect(png, S, x0, y0, x1, y1, color) {
  for (let y = Math.floor(y0); y < y1; y++) {
    for (let x = Math.floor(x0); x < x1; x++) {
      if (x < 0 || y < 0 || x >= S || y >= S) continue
      const idx = (S * y + x) << 2
      png.data[idx] = color[0]
      png.data[idx + 1] = color[1]
      png.data[idx + 2] = color[2]
      png.data[idx + 3] = 255
    }
  }
}

function makeIcon(S, file) {
  const png = new PNG({ width: S, height: S })
  // Fondo navy
  rect(png, S, 0, 0, S, S, NAVY)
  // Letra "F" en naranja
  const t = S * 0.1
  const xL = S * 0.34
  const xR = S * 0.66
  const yT = S * 0.28
  const yB = S * 0.72
  const mid = (yT + yB) / 2
  rect(png, S, xL, yT, xL + t, yB, ORANGE)              // barra vertical
  rect(png, S, xL, yT, xR, yT + t, ORANGE)              // barra superior
  rect(png, S, xL, mid - t / 2, xL + (xR - xL) * 0.8, mid + t / 2, ORANGE) // barra media
  const out = path.resolve(__dirname, '..', 'public', file)
  fs.writeFileSync(out, PNG.sync.write(png))
  console.log('icono ->', file)
}

makeIcon(192, 'pwa-192x192.png')
makeIcon(512, 'pwa-512x512.png')
makeIcon(512, 'maskable-512x512.png')
makeIcon(180, 'apple-touch-icon.png')

// Favicon SVG vectorial
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#0A192F"/>
  <path d="M174 143 h164 v51 h-113 v54 h96 v51 h-96 v109 h-51 z" fill="#FD761A"/>
</svg>`
fs.writeFileSync(path.resolve(__dirname, '..', 'public', 'favicon.svg'), svg)
console.log('icono -> favicon.svg')
