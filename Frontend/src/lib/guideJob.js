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
import { formatTanggalID } from '../../../Backend/src/core/time.js'
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

// Cadangan bila template khusus pemandu belum dibuat di EmailJS: pakai template
// tiket yang sudah ada. Isinya dibentuk dari kolom yang dikenalnya (nama, judul,
// status, tanggal, waktu, jumlah orang, lokasi); tidak ada tautan/kode tiket.
function viaVisitorTemplate(message) {
  const { kind, name, reservation: r, reason } = message.meta
  const isGuide = kind === 'guide'
  const waktu = r.waktu ? `${r.waktu} WIB` : 'Sesuai jam operasional'
  const destinasi = r.jenisWisata || 'Destinasi belum ditentukan'
  return {
    to_email: message.to,
    name: isGuide ? `${name} (pemandu)` : name,
    title: isGuide
      ? `WaraWiri Village - Penugasan pemandu: ${r.nama}`
      : `WaraWiri Village - PERLU TINDAKAN: ${r.nama} belum punya pemandu`,
    status: isGuide ? 'Penugasan pemandu baru' : 'Belum ada pemandu',
    is_approved: '',
    is_declined: '',
    tanggal_kunjungan: formatTanggalID(r.tanggal),
    waktu_kunjungan: waktu,
    // Template tiket hanya menampilkan beberapa kolom pendek, jadi rincian
    // digabung ke kolom lokasi & jumlah orang.
    lokasi_gedung_ruangan:
      `${destinasi} | Rombongan: ${r.nama} | Kontak: ${r.kontak}` +
      `${r.email ? ` | Email: ${r.email}` : ''} | No. reservasi: ${r.id}`,
    jumlah_orang: isGuide
      ? `${r.pax} orang | MOHON BAWA: kotak P3K lengkap, konsumsi & air minum untuk ${r.pax} orang, ` +
        `dan peralatan penunjang untuk ${destinasi}`
      : `${r.pax} orang`,
    alasan_penolakan: reason || '',
    ticket_url: '',
    ticket_code: '',
  }
}

/** Mailer EmailJS: template pemandu hanya perlu {{subject}}, {{to_email}}, {{cc_email}} dan isi {{{message_html}}}. */
export function createEmailJsMailer({ gapMs } = {}) {
  const options = gapMs === undefined ? undefined : { gapMs }
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
        options,
      )
      if (result.ok) return

      // Template pemandu belum ada (400/404) -> pakai template tiket sebagai cadangan.
      if ((result.status === 400 || result.status === 404) && message.meta) {
        const fallback = await postEmailJs(EMAILJS.visitorTemplateId, viaVisitorTemplate(message), options)
        if (!fallback.ok) throw new Error(explain(fallback))
        if (message.cc) {
          // template tiket tidak punya kolom Cc: kirim salinan ke pengelola terpisah.
          const copyParams = { ...viaVisitorTemplate(message), to_email: message.cc, name: 'Pengelola' }
          const sentCopy = await postEmailJs(EMAILJS.visitorTemplateId, copyParams, options)
          if (!sentCopy.ok) throw new Error(explain(sentCopy))
        }
        return
      }
      throw new Error(explain(result))
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
