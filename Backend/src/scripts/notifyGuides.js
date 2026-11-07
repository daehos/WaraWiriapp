// Job produksi: alokasi pemandu + notifikasi H-1 ke Firestore sungguhan.
//   npm run notify                       -> jalankan sekarang (wajib SMTP_*; menulis status ke Firestore)
//   npm run notify -- --dry-run          -> hitung & tampilkan saja; tidak menulis, tidak mengirim
//   npm run notify -- --dry-run --outbox -> sama, tapi email dirender ke Backend/outbox/*.html untuk dilihat
//   npm run notify -- --now=2026-11-04T07:05:00+07:00 -> "pura-pura" sekarang adalah waktu ini
//   npm run notify -- --mode=segera      -> kirim begitu disetujui (default 'h-1', atau env NOTIFY_MODE)
//   npm run notify -- --h-1              -> "pura-pura" sekarang = hari ini pukul 07:05 WIB (jendela H-1 untuk kunjungan besok)
// Terhadap emulator lokal (`npm run local:notify`): email selalu ke Backend/outbox/, tidak pernah SMTP.
// Tanpa Firebase? Pakai `npm run simulate` (data demo di memori).
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadJobConfig } from '../config.js'
import { runNotificationJob } from '../core/runJob.js'
import { wibDate, wibInstant } from '../core/time.js'
import { createOutboxMailer } from '../mailers/outboxMailer.js'
import { pickEmulatorMailer } from '../mailers/emulatorMailer.js'
import { createSmtpMailer } from '../mailers/smtpMailer.js'
import { createFirestoreStore } from '../stores/firestoreStore.js'

const args = process.argv.slice(2)
const flag = (name) => args.includes(`--${name}`)
const value = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=')

const dryRun = flag('dry-run')
const emulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST)
const nowArg = value('now')
const now = nowArg
  ? new Date(nowArg)
  : flag('h-1')
    ? new Date(wibInstant(wibDate(), 7).getTime() + 5 * 60_000)
    : new Date()
if (Number.isNaN(now.getTime())) {
  console.error(`--now tidak valid: ${nowArg}`)
  process.exit(1)
}
if (flag('outbox') && !dryRun && !emulator) {
  console.error('--outbox hanya boleh bersama --dry-run (supaya status "terkirim" tidak tercatat padahal tidak ada email sungguhan).')
  process.exit(1)
}

// Folder terpisah supaya email simulasi, emulator, dan pratinjau tidak bercampur.
const outboxDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../outbox',
  emulator ? 'local' : 'preview',
)
const config = loadJobConfig()
if (value('mode')) config.notifyMode = value('mode') === 'segera' ? 'segera' : 'h-1'

let mailer = null
if (emulator) {
  mailer = pickEmulatorMailer(process.env, outboxDir) // default outbox; SMTP hanya bila SEND_REAL_EMAIL=true
} else if (dryRun) {
  if (flag('outbox')) mailer = createOutboxMailer(outboxDir)
} else {
  mailer = createSmtpMailer()
  if (!mailer) {
    console.error('SMTP belum dikonfigurasi (SMTP_HOST, SMTP_USER, SMTP_PASS). Isi Backend/.env, atau pakai --dry-run.')
    process.exit(1)
  }
}

console.log(
  `Mode: ${emulator ? 'emulator lokal' : dryRun ? 'dry-run' : 'smtp'} · sekarang: ${now.toISOString()}` +
    (config.managerEmail ? '' : ' · MANAGER_EMAIL kosong (tembusan & peringatan pengelola dilewati)'),
)

const summary = await runNotificationJob({
  store: createFirestoreStore(),
  mailer,
  config,
  now,
  dryRun,
  log: (line) => console.log(`  ${line}`),
})

if (mailer?.writeIndex) {
  await mailer.writeIndex()
  console.log(`Preview email: ${path.join(outboxDir, 'index.html')}`)
}

console.log(
  `Selesai: ${summary.assigned.length} dialokasikan, ${summary.sent.length} terkirim, ` +
    `${summary.alerts.length} peringatan pengelola, ${summary.failed.length} gagal, ` +
    `${summary.unassigned.length} belum punya pemandu.`,
)
// Exit non-zero saat ada kegagalan kirim supaya run GitHub Actions ditandai gagal & terlihat.
process.exit(summary.failed.length > 0 ? 1 : 0)
