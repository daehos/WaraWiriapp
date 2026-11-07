// Isi emulator lokal dengan data uji untuk mencoba PBI-5 dari browser.
// Dijalankan otomatis oleh `npm run local`; boleh dijalankan ulang kapan saja
// (`npm run local:seed`) untuk mengembalikan data ke kondisi awal.
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getAuth } from 'firebase-admin/auth'
import { addDays, wibDate } from '../core/time.js'
import { app, db } from '../firebase.js'

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.error('local:seed hanya boleh dijalankan terhadap emulator (FIRESTORE_EMULATOR_HOST kosong).')
  console.error('Pakai `npm run local:seed` atau `npm run local`, bukan `node` langsung.')
  process.exit(1)
}

const ADMIN_EMAIL = 'admin@warawiri.local'
const ADMIN_PASSWORD = 'admin123'

// 1) Admin uji (Auth emulator) + custom claim `admin`
const auth = getAuth(app)
let user
try {
  user = await auth.getUserByEmail(ADMIN_EMAIL)
} catch (err) {
  if (err.code !== 'auth/user-not-found') throw err
  user = await auth.createUser({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
}
await auth.setCustomUserClaims(user.uid, { admin: true })

// 2) Pemandu dari data manual yang sama dengan produksi
const FILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../data/guides.json')
const { guides } = JSON.parse(await fs.readFile(FILE, 'utf8'))
const batch = db.batch()
for (const g of guides) batch.set(db.collection('guides').doc(g.id), g)

// 3) Reservasi uji untuk BESOK (WIB): 3 sudah disetujui + 3 menunggu.
//    Kuota Asep (2/hari) & Dede (1/hari) sengaja bisa habis, sehingga menyetujui
//    "Rombongan Kantor Dinas" memicu kasus "belum ada pemandu".
const TREK = 'Trekking sawah terasering'
const BUDAYA = 'Kerajinan & budaya warga'
const KULINER = 'Kuliner lokal'
const tanggal = addDays(wibDate(), 1)
const stamp = tanggal.replaceAll('-', '')

const demo = [
  ['SMA Negeri 1 Cililin', 30, '08:00 – 10:00', TREK, true],
  ['Keluarga Pratama', 6, '08:00 – 10:00', TREK, true],
  ['Komunitas Fotografi', 12, '10:00 – 12:00', TREK, true],
  ['Rombongan Kantor Dinas', 20, '13:00 – 15:00', TREK, false],
  ['PKK Desa Sukamaju', 15, '08:00 – 10:00', BUDAYA, false],
  ['Wisata Kuliner Alumni', 9, '10:00 – 12:00', KULINER, false],
]

let used = 0
demo.forEach(([nama, pax, waktu, jenisWisata, approved], i) => {
  const n = String(i + 1).padStart(2, '0')
  const id = `WWR-${stamp}-1000${n}-S0${n}`
  used += pax
  const reservation = {
    id,
    status: approved ? 'dikonfirmasi' : 'menunggu-konfirmasi',
    nama,
    kontak: `08123456${String(7000 + i)}`,
    email: null,
    tanggal,
    pax,
    waktu,
    jenisWisata,
    createdAt: `2026-01-01T03:00:${n}.000Z`,
  }
  if (approved) {
    Object.assign(reservation, {
      ticketCode: `${n}`.repeat(16),
      manualCode: `1234${n}`,
      ticketIssuedAt: `2026-01-02T03:00:${n}.000Z`,
      inside: 0,
      entries: 0,
      exits: 0,
    })
    batch.set(db.collection('manualCodes').doc(reservation.manualCode), {
      reservationId: id,
      tanggal,
    })
  }
  batch.set(db.collection('reservations').doc(id), reservation)
})
batch.set(db.collection('quotas').doc(tanggal), { tanggal, limit: 200, used })

await batch.commit()

console.log(`Data uji siap (kunjungan besok: ${tanggal}):`)
console.log(`  • Admin  : ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
console.log(`  • Pemandu: ${guides.map((g) => `${g.nama} (maks ${g.maxGroups}/hari)`).join(', ')}`)
console.log(`  • ${demo.length} reservasi: ${demo.filter((d) => d[4]).length} disetujui, ${demo.filter((d) => !d[4]).length} menunggu`)
