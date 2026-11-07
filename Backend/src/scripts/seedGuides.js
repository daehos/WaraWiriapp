// Muat data pemandu manual (Backend/data/guides.json) ke koleksi Firestore `guides`.
// Aman dijalankan ulang: dokumen di-merge per id.
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { EMAIL_RE } from '../core/emailTemplate.js'
import { db } from '../firebase.js'

const FILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../data/guides.json')
const { guides } = JSON.parse(await fs.readFile(FILE, 'utf8'))

const problems = []
for (const g of guides) {
  if (!/^[a-z0-9-]+$/.test(g.id ?? '')) problems.push(`${g.id}: id harus huruf kecil/angka/-`)
  if (!g.nama) problems.push(`${g.id}: nama wajib`)
  if (!EMAIL_RE.test(g.email ?? '')) problems.push(`${g.id}: email tidak valid`)
  if (!Array.isArray(g.destinasi)) problems.push(`${g.id}: destinasi harus array`)
}
if (problems.length) {
  console.error(`Data pemandu tidak valid:\n- ${problems.join('\n- ')}`)
  process.exit(1)
}

const batch = db.batch()
for (const g of guides) batch.set(db.collection('guides').doc(g.id), g, { merge: true })
await batch.commit()

console.log(`${guides.length} pemandu dimuat ke Firestore:`)
for (const g of guides) console.log(`  - ${g.nama} <${g.email}> maks ${g.maxGroups} rombongan/hari`)
if (guides.some((g) => /@(example\.com|mailinator\.com)$/.test(g.email))) {
  console.log('Catatan: masih ada email demo (@example.com / @mailinator.com) — ganti dengan email asli untuk produksi.')
}
