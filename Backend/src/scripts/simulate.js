// Simulasi PBI-5 tanpa Firebase/SMTP: data demo di memori, jam palsu (WIB),
// email ditulis ke Backend/outbox/ sebagai HTML yang bisa dibuka di browser.
//   npm run simulate
import { rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runNotificationJob } from '../core/runJob.js'
import { createOutboxMailer } from '../mailers/outboxMailer.js'
import { createMemoryStore } from '../stores/memoryStore.js'

const OUTBOX = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../outbox/simulate')
const CONFIG = {
  managerEmail: 'pengelola@warawiri.village',
  from: 'WaraWiri Village <no-reply@warawiri.village>',
  notifyHour: 7,
  maxAttempts: 5,
}

const HARI_H = '2026-11-05' // hari kunjungan; "hari ini" simulasi = H-1 = 2026-11-04
const TREK = 'Trekking sawah terasering'
const BUDAYA = 'Kerajinan & budaya warga'
const KULINER = 'Kuliner lokal'

const guides = [
  { id: 'asep', nama: 'Asep Kurnia', email: 'asep@warawiri.village', destinasi: [TREK, BUDAYA], maxGroups: 2, aktif: true, urutan: 1 },
  { id: 'wati', nama: 'Wati Susanti', email: 'wati@warawiri.village', destinasi: [BUDAYA, 'Homestay warga', KULINER], maxGroups: 3, aktif: true, urutan: 2 },
  { id: 'dede', nama: 'Dede Hermawan', email: 'dede@warawiri.village', destinasi: [], maxGroups: 1, aktif: true, urutan: 3 },
]

let n = 0
const booking = (nama, pax, waktu, jenisWisata) => {
  n += 1
  const sec = String(n).padStart(2, '0')
  return {
    id: `WWR-20261101-1000${sec}-SIM${n}`,
    status: 'dikonfirmasi',
    nama,
    kontak: '0812xxxxxxx',
    tanggal: HARI_H,
    waktu,
    pax,
    jenisWisata,
    createdAt: `2026-11-01T03:00:${sec}.000Z`,
    ticketIssuedAt: `2026-11-02T03:00:${sec}.000Z`, // urutan disetujui = urutan antrian
  }
}

const R = {
  a: booking('SMA Negeri 1 Cililin', 30, '08:00 – 10:00', TREK),
  b: booking('Keluarga Pratama', 6, '08:00 – 10:00', TREK),
  c: booking('Komunitas Fotografi', 12, '10:00 – 12:00', TREK),
  d: booking('Rombongan Kantor Dinas', 20, '13:00 – 15:00', TREK),
  e: booking('PKK Desa Sukamaju', 15, '08:00 – 10:00', BUDAYA),
  f: booking('Wisata Kuliner Alumni', 9, '10:00 – 12:00', KULINER),
}
const late = booking('Keluarga Wijaya (disetujui siang)', 4, '15:00 – 17:00', null)

const store = createMemoryStore({ reservations: Object.values(R), guides })
const outbox = createOutboxMailer(OUTBOX)

// SMTP palsu: pengiriman pertama ke Dede gagal (simulasi gangguan), selanjutnya normal.
let dedeFailures = 1
const flaky = {
  name: 'outbox',
  async send(message) {
    if (message.to === 'dede@warawiri.village' && dedeFailures-- > 0) {
      throw new Error('SMTP 421 layanan sementara tidak tersedia')
    }
    return outbox.send(message)
  },
}

const at = (hhmm) => new Date(`2026-11-04T${hhmm}:00+07:00`)
const line = (text = '') => console.log(text)
const rule = (title) => line(`\n━━ ${title} ${'━'.repeat(Math.max(2, 70 - title.length))}`)

async function step(title, hhmm, note) {
  rule(`${hhmm} WIB · ${title}`)
  if (note) line(`   ${note}`)
  await runNotificationJob({
    store,
    mailer: flaky,
    config: CONFIG,
    now: at(hhmm),
    log: (text) => line(`   • ${text}`),
  })
}

function table() {
  rule('Hasil akhir')
  line('   Rombongan                          Slot            Pax  Pemandu         Status')
  for (const r of store.all()) {
    const status = r.guideNotifiedAt
      ? 'email terkirim'
      : r.guideNotifyStatus === 'tanpa-pemandu'
        ? 'pengelola diperingatkan'
        : (r.guideNotifyStatus ?? '-')
    line(
      `   ${r.nama.padEnd(34).slice(0, 34)} ${r.waktu.padEnd(15)} ${String(r.pax).padStart(3)}  ` +
        `${String(r.guideName ?? '— belum ada —').padEnd(15)} ${status}`,
    )
  }
}

line('SIMULASI PBI-5 · Notifikasi Penugasan Warga (H-1)')
line(`Hari kunjungan: ${HARI_H} · "hari ini" simulasi: 2026-11-04 (WIB)`)
line(`Pemandu: ${guides.map((g) => `${g.nama} (maks ${g.maxGroups}/hari)`).join(', ')}`)

await rm(OUTBOX, { recursive: true, force: true })

await step('Run sebelum jendela H-1', '06:00', 'Alokasi berjalan, tetapi belum ada email (jendela H-1 dibuka 07:00 WIB).')
await step('Jendela H-1 dibuka', '07:05', 'Email ke pemandu (cc pengelola). Rombongan tanpa pemandu → pengelola diperingatkan. SMTP ke Dede sengaja gagal.')
await step('Run berikutnya (jam 08:05)', '08:05', 'Email Dede yang gagal dicoba ulang otomatis. Lainnya tidak dikirim ulang.')

store.addReservation(late)
await step('Reservasi disetujui terlambat', '09:30', 'Admin baru menyetujui reservasi untuk besok → langsung dialokasikan dan dikirim di run ini.')

store.addGuide({ id: 'lilis', nama: 'Lilis Marlina', email: 'lilis@warawiri.village', destinasi: [TREK], maxGroups: 2, aktif: true, urutan: 4 })
await step('Pemandu baru ditambahkan', '10:05', 'Rombongan yang tadi tanpa pemandu otomatis diambil pemandu baru; pengelola tidak diperingatkan lagi.')

await step('Run lagi (idempotensi)', '11:05', 'Tidak ada yang berubah dan tidak ada email dobel.')

table()

await outbox.writeIndex()
rule('Email yang dihasilkan')
line(`   ${outbox.items.length} email → ${path.join(OUTBOX, 'index.html')}`)
line('   Buka file itu di browser untuk melihat setiap email.\n')
