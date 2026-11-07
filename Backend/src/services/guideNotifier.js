import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadJobConfig } from '../config.js'
import { serialize } from '../core/jobLock.js'
import { runNotificationJob } from '../core/runJob.js'
import { pickEmulatorMailer } from '../mailers/emulatorMailer.js'
import { createSmtpMailer } from '../mailers/smtpMailer.js'
import { createFirestoreStore } from '../stores/firestoreStore.js'

const OUTBOX_LOCAL =
  process.env.OUTBOX_DIR ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../outbox/local')

// Dipanggil dashboard admin setelah Approve: jalankan job sekarang juga
// (alokasi + kirim sesuai NOTIFY_MODE). Diserialkan supaya klik beruntun
// tidak menghasilkan email ganda. Terhadap emulator, email hanya ditulis ke
// Backend/outbox/local/ — tidak pernah SMTP.
export function runGuideJobNow({ now = new Date() } = {}) {
  return serialize(async () => {
    const emulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST)
    const mailer = emulator ? pickEmulatorMailer(process.env, OUTBOX_LOCAL) : createSmtpMailer()
    if (!mailer) {
      return { ran: false, reason: 'SMTP belum dikonfigurasi di Backend (SMTP_HOST, SMTP_USER, SMTP_PASS).' }
    }
    const config = loadJobConfig()
    const summary = await runNotificationJob({ store: createFirestoreStore(), mailer, config, now })
    await mailer.writeIndex?.()
    return { ran: true, mode: config.notifyMode, via: mailer.name, summary }
  })
}

export { resultFor } from '../core/result.js'
