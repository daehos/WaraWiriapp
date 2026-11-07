import { addDays, formatTanggalID, wibDate } from './time.js'

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[c])

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// label: untuk subjek/judul; phrase: untuk kalimat ("untuk kunjungan <phrase>").
function when(tanggal, now) {
  const today = wibDate(now)
  if (tanggal === addDays(today, 1)) return { label: 'Besok', phrase: 'besok' }
  if (tanggal === today) return { label: 'Hari ini', phrase: 'hari ini' }
  const date = formatTanggalID(tanggal)
  return { label: date, phrase: `pada ${date}` }
}

// Data minimal yang diminta kartu PBI-5: tanggal & waktu, data + jumlah
// pengunjung, dan destinasi. Kontak pengunjung sengaja tidak disertakan
// (minimisasi data pribadi); koordinasi lewat pengelola desa.
function details(reservation) {
  return [
    ['Tanggal', formatTanggalID(reservation.tanggal)],
    ['Waktu', reservation.waktu ? `${reservation.waktu} WIB` : 'Sesuai jam operasional'],
    ['Destinasi', reservation.jenisWisata || 'Belum ditentukan — koordinasikan dengan pengelola'],
    ['Rombongan', reservation.nama],
    ['Jumlah pengunjung', `${reservation.pax} orang`],
    ['No. reservasi', reservation.id],
  ]
}

const textBlock = (rows) => rows.map(([k, v]) => `${k.padEnd(18)}: ${v}`).join('\n')

function htmlPage({ title, intro, rows, outro }) {
  const tr = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#5a6e68;white-space:nowrap">${escapeHtml(k)}</td>` +
        `<td style="padding:6px 0;font-weight:600">${escapeHtml(v)}</td></tr>`,
    )
    .join('')
  return `<!doctype html>
<html lang="id"><body style="margin:0;background:#f4f1ea">
<div style="max-width:560px;margin:0 auto;padding:24px;font-family:system-ui,Arial,sans-serif;font-size:16px;line-height:1.5;color:#211e1a">
  <p style="margin:0 0 4px;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#2f5d42">WaraWiri Village</p>
  <h1 style="margin:0 0 16px;font-size:22px;color:#1c3327">${escapeHtml(title)}</h1>
  <p>${intro}</p>
  <table style="border-collapse:collapse;margin:16px 0;background:#ffffff;border-radius:12px;padding:12px 16px;width:100%">${tr}</table>
  <p>${outro}</p>
  <p style="margin-top:24px;font-size:12px;color:#5a6e68">Email otomatis dari sistem reservasi WaraWiri Village.</p>
</div></body></html>`
}

/** Email H-1 ke pemandu, tembusan ke pengelola desa. */
export function buildGuideEmail({ reservation, guide, managerEmail, from, now = new Date() }) {
  const { label, phrase } = when(reservation.tanggal, now)
  const destinasi = reservation.jenisWisata || 'destinasi belum ditentukan'
  const rows = details(reservation)
  const subject = `[WaraWiri] ${label}: rombongan ${reservation.nama} (${reservation.pax} orang) - ${destinasi}`
  const intro = `Halo ${escapeHtml(guide.nama)}, ada rombongan yang ditugaskan kepada Anda untuk kunjungan <strong>${escapeHtml(phrase)}</strong>.`
  const outro = `Mohon siapkan diri dan konsumsi/katering untuk ${reservation.pax} orang. Jika berhalangan, segera hubungi pengelola desa.`

  const text = [
    `Halo ${guide.nama},`,
    '',
    `Ada rombongan yang ditugaskan kepada Anda untuk kunjungan ${phrase}.`,
    '',
    textBlock(rows),
    '',
    outro,
    '',
    'WaraWiri Village',
  ].join('\n')

  return {
    from,
    to: guide.email,
    cc: managerEmail || undefined,
    replyTo: managerEmail || undefined,
    subject,
    text,
    html: htmlPage({ title: `Penugasan rombongan: ${label}`, intro, rows, outro }),
  }
}

/** Peringatan ke pengelola desa: rombongan H-1 belum punya pemandu. */
export function buildManagerAlertEmail({ reservation, reason, managerEmail, from, now = new Date() }) {
  const { label, phrase } = when(reservation.tanggal, now)
  const rows = [...details(reservation), ['Penyebab', reason || 'Belum dialokasikan.']]
  const subject = `[WaraWiri] PERLU TINDAKAN ${label}: rombongan ${reservation.nama} belum punya pemandu`
  const intro = `Rombongan yang berkunjung <strong>${escapeHtml(phrase)}</strong> belum mendapat pemandu.`
  const outro =
    'Tambahkan pemandu atau naikkan batas rombongan; sistem akan mengalokasikan dan mengirim notifikasi otomatis pada run berikutnya.'

  const text = [
    'Halo Pengelola,',
    '',
    `Rombongan yang berkunjung ${phrase} belum mendapat pemandu.`,
    '',
    textBlock(rows),
    '',
    outro,
    '',
    'WaraWiri Village',
  ].join('\n')

  return {
    from,
    to: managerEmail,
    subject,
    text,
    html: htmlPage({ title: 'Rombongan belum punya pemandu', intro, rows, outro }),
  }
}
