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

// Data yang dibutuhkan pemandu untuk bertugas: tanggal & waktu, destinasi, siapa
// rombongannya + cara menghubunginya, dan jumlah pengunjung. Kontak pengunjung
// ikut dikirim karena pemandu perlu mengonfirmasi titik kumpul.
function details(reservation) {
  const rows = [
    ['Tanggal', formatTanggalID(reservation.tanggal)],
    ['Waktu', reservation.waktu ? `${reservation.waktu} WIB` : 'Sesuai jam operasional'],
    ['Destinasi', reservation.jenisWisata || 'Belum ditentukan — koordinasikan dengan pengelola'],
    ['Rombongan', reservation.nama],
    ['Kontak rombongan', reservation.kontak],
  ]
  if (reservation.email) rows.push(['Email rombongan', reservation.email])
  rows.push(['Jumlah pengunjung', `${reservation.pax} orang`], ['No. reservasi', reservation.id])
  return rows
}

// Peralatan penunjang khas tiap destinasi (nama sama dengan village.reservation.jenisWisata).
const GEAR = {
  'Trekking sawah terasering': [
    'Jas hujan, sepatu/sandal trekking cadangan, dan tongkat untuk jalur licin',
    'Tali atau tanda jalur untuk bagian yang curam',
  ],
  'Kerajinan & budaya warga': [
    'Bahan dan alat praktik kerajinan yang cukup untuk semua peserta',
    'Celemek/alas kerja dan jadwal pengrajin yang akan tampil',
  ],
  'Homestay warga': [
    'Pembagian kamar, kunci, dan perlengkapan kebersihan (handuk, sabun) tambahan',
    'Info WiFi, aturan rumah, dan kontak darurat',
  ],
  'Kuliner lokal': [
    'Peralatan masak dan makan untuk seluruh peserta, plus sarung tangan dan tisu',
    'Tanyakan alergi makanan peserta sebelum mulai',
  ],
}
const GEAR_DEFAULT = [
  'Peralatan penunjang sesuai kegiatan hari itu',
  'Radio/HT atau pastikan ponsel terisi penuh',
]

/** Daftar persiapan: P3K, konsumsi, dan peralatan penunjang sesuai destinasi. */
export function checklist(reservation) {
  const { pax, jenisWisata } = reservation
  return [
    ['Kotak P3K lengkap', 'plester, antiseptik, perban, obat luka, minyak angin, obat maag/diare, dan obat alergi dasar.'],
    ['Konsumsi & air minum', `siapkan untuk ${pax} orang, tambah sedikit cadangan; kabari pengelola bila ada peserta pantangan makanan.`],
    ['Peralatan penunjang', (GEAR[jenisWisata] ?? GEAR_DEFAULT).join('; ') + '.'],
    ['Komunikasi', `hubungi rombongan paling lambat sehari sebelumnya untuk memastikan titik kumpul dan jumlah peserta.`],
  ]
}

const textBlock = (rows) => rows.map(([k, v]) => `${k.padEnd(18)}: ${v}`).join('\n')
const textChecklist = (items) => items.map(([k, v], i) => `${i + 1}. ${k}: ${v}`).join('\n')

function htmlPage({ title, intro, rows, outro, hero, items }) {
  const tr = rows
    .map(
      ([k, v, raw]) =>
        `<tr><td style="padding:7px 16px 7px 0;color:#5a6e68;white-space:nowrap;vertical-align:top">${escapeHtml(k)}</td>` +
        `<td style="padding:7px 0;font-weight:600">${raw ?? escapeHtml(v)}</td></tr>`,
    )
    .join('')
  const heroBlock = hero
    ? `<div style="margin:16px 0;padding:16px 18px;background:#1c3327;border-radius:12px;color:#f4f1ea">` +
      `<div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#a9c9b5">Jadwal tugas</div>` +
      `<div style="font-size:20px;font-weight:700;margin-top:4px">${escapeHtml(hero.title)}</div>` +
      `<div style="font-size:15px;margin-top:2px;color:#d9e8de">${escapeHtml(hero.sub)}</div></div>`
    : ''
  const list = items?.length
    ? `<div style="margin:16px 0;padding:14px 18px;background:#fff8e6;border:1px solid #f0dca0;border-radius:12px">` +
      `<div style="font-weight:700;color:#7a5a00;margin-bottom:6px">Mohon bawa &amp; siapkan</div>` +
      items
        .map(
          ([k, v]) =>
            `<div style="margin:6px 0"><span style="font-weight:700">&#9744; ${escapeHtml(k)}</span> &mdash; ${escapeHtml(v)}</div>`,
        )
        .join('') +
      `</div>`
    : ''
  return `<!doctype html>
<html lang="id"><body style="margin:0;background:#f4f1ea">
<div style="max-width:580px;margin:0 auto;padding:24px;font-family:system-ui,Arial,sans-serif;font-size:16px;line-height:1.5;color:#211e1a">
  <p style="margin:0 0 4px;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#2f5d42">WaraWiri Village</p>
  <h1 style="margin:0 0 12px;font-size:22px;color:#1c3327">${escapeHtml(title)}</h1>
  <p>${intro}</p>
  ${heroBlock}
  <table style="border-collapse:collapse;margin:12px 0;background:#ffffff;border-radius:12px;padding:12px 16px;width:100%">${tr}</table>
  ${list}
  <p>${outro}</p>
  <p style="margin-top:24px;font-size:12px;color:#5a6e68">Email otomatis dari sistem reservasi WaraWiri Village.</p>
</div></body></html>`
}

/** Email penugasan ke pemandu, tembusan ke pengelola desa. */
export function buildGuideEmail({ reservation, guide, managerEmail, from, now = new Date() }) {
  const { label, phrase } = when(reservation.tanggal, now)
  const destinasi = reservation.jenisWisata || 'destinasi belum ditentukan'
  const rows = details(reservation).map(([k, v]) =>
    k === 'Kontak rombongan' && /^[+\d][\d+]*$/.test(String(v))
      ? [k, v, `<a href="tel:${escapeHtml(v)}" style="color:#1c3327">${escapeHtml(v)}</a>`]
      : [k, v],
  )
  const items = checklist(reservation)
  const subject = `[WaraWiri] ${label}: rombongan ${reservation.nama} (${reservation.pax} orang) - ${destinasi}`
  const intro = `Halo ${escapeHtml(guide.nama)}, ada rombongan yang ditugaskan kepada Anda untuk kunjungan <strong>${escapeHtml(phrase)}</strong>. Berikut rinciannya.`
  const outro = `Jika berhalangan, segera hubungi pengelola desa agar rombongan bisa dialihkan. Terima kasih sudah menjaga pengalaman tamu kita!`
  const hero = {
    title: formatTanggalID(reservation.tanggal),
    sub: `${reservation.waktu ? `${reservation.waktu} WIB` : 'Sesuai jam operasional'} · ${reservation.pax} orang · ${destinasi}`,
  }

  const text = [
    `Halo ${guide.nama},`,
    '',
    `Ada rombongan yang ditugaskan kepada Anda untuk kunjungan ${phrase}.`,
    '',
    textBlock(details(reservation)),
    '',
    'MOHON BAWA & SIAPKAN',
    textChecklist(items),
    '',
    outro,
    '',
    'WaraWiri Village',
  ].join('\n')

  return {
    meta: { kind: 'guide', name: guide.nama, reservation },
    from,
    to: guide.email,
    cc: managerEmail || undefined,
    replyTo: managerEmail || undefined,
    subject,
    text,
    html: htmlPage({ title: `Penugasan rombongan: ${label}`, intro, rows, outro, hero, items }),
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
    meta: { kind: 'manager', name: 'Pengelola', reservation, reason },
    from,
    to: managerEmail,
    subject,
    text,
    html: htmlPage({ title: 'Rombongan belum punya pemandu', intro, rows, outro }),
  }
}
