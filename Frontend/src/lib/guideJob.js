// Penugasan & email pemandu yang berjalan LANGSUNG di browser admin, supaya
// situs online (Firebase Hosting statis, tanpa server Backend) tetap bisa
// mengirim email ke pemandu begitu admin menekan Approve.
//
// Logika alokasi/jadwal/template memakai kode inti yang sama dengan Backend
// (Backend/src/core) — hanya penyimpanan (Firestore klien) dan pengiriman
// (EmailJS) yang berbeda.
import { serialize } from '../../../Backend/src/core/jobLock.js'
import { resultFor } from '../../../Backend/src/core/result.js'
import { runNotificationJob } from '../../../Backend/src/core/runJob.js'
import { EMAILJS, postEmailJs } from './emailjs.js'

// Mode simulasi: kirim begitu disetujui, tanpa menunggu H-1.
export const GUIDE_JOB_CONFIG = {
  managerEmail: 'pengelola.warawiri@mailinator.com',
  notifyMode: 'segera',
  notifyHour: 7,
  maxAttempts: 5,
}

function explain(result) {
  if (result.status === 400 || result.status === 404) {
    return (
      `Template EmailJS "${EMAILJS.guideTemplateId}" belum dibuat/cocok ` +
      `(${result.status}: ${result.detail || 'ditolak'}). Lihat README bagian "Email pemandu di situs online".`
    )
  }
  if (result.status === 429) return 'Batas kirim EmailJS tercapai (429). Coba lagi sebentar lagi.'
  if (result.status === 0) return result.detail
  return `EmailJS menolak pengiriman (${result.status}). ${result.detail}`
}

/** Mailer EmailJS: template hanya perlu {{subject}}, {{to_email}}, {{cc_email}} dan isi {{{message_html}}}. */
export function createEmailJsMailer({ gapMs } = {}) {
  return {
    name: 'emailjs',
    async send(message) {
      const result = await postEmailJs(
        EMAILJS.guideTemplateId,
        {
          to_email: message.to,
          cc_email: message.cc ?? '',
          reply_to: message.replyTo ?? '',
          from_name: 'WaraWiri Village',
          subject: message.subject,
          message: message.text,
          message_html: message.html,
        },
        gapMs === undefined ? undefined : { gapMs },
      )
      if (!result.ok) throw new Error(explain(result))
    },
  }
}

/**
 * Jalankan job untuk satu reservasi yang baru disetujui (atau kirim ulang).
 * Alokasi dihitung untuk semua reservasi; email hanya untuk `id`.
 * @returns {{ ran: true, mode, via, status, ... }} bentuk sama dengan /api/guide-notify
 */
export function notifyGuideInBrowser({ store, mailer, id, now = new Date(), config = GUIDE_JOB_CONFIG }) {
  return serialize(async () => {
    const summary = await runNotificationJob({ store, mailer, config, now, notifyOnly: [id] })
    return { ran: true, mode: config.notifyMode, via: mailer.name, ...resultFor(id, summary) }
  })
}
