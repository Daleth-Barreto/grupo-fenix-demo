/* Optimiza el logo y las imágenes de eventos para web */
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const pub = path.resolve(__dirname, '..', 'public')

async function run() {
  // Logo a 256x256 PNG con transparencia
  await sharp(path.join(pub, 'brand', 'logo-fenix.png'))
    .resize(256, 256, { fit: 'inside' })
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(path.join(pub, 'brand', 'logo-fenix.opt.png'))
  fs.renameSync(path.join(pub, 'brand', 'logo-fenix.opt.png'), path.join(pub, 'brand', 'logo-fenix.png'))

  // Imágenes de eventos a máx 1000px, JPG q78
  const events = ['neurodesarrollo.jpeg', 'sexualidad.jpg', 'tanatologia.png', 'psicooncologia.png']
  for (const name of events) {
    const src = path.join(pub, 'events', name)
    const tmp = src + '.tmp'
    await sharp(src)
      .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(tmp)
    fs.renameSync(tmp, src)
    const kb = Math.round(fs.statSync(src).size / 1024)
    console.log(name, '->', kb, 'KB')
  }
  const logoKb = Math.round(fs.statSync(path.join(pub, 'brand', 'logo-fenix.png')).size / 1024)
  console.log('logo-fenix.png ->', logoKb, 'KB')
}

run().catch((e) => { console.error(e); process.exit(1) })
