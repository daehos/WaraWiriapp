import nodemailer from 'nodemailer'

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS

const transporter =
  SMTP_HOST && SMTP_USER && SMTP_PASS
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      })
    : null

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
}

export function buildStatusEmail(reservation) {
  const approved = reservation.status === 'dikonfirmasi'
  const subject = approved
    ? `Reservasi ${reservation.id} disetujui`
    : `Reservasi ${reservation.id} ditolak`

  const lines = approved
    ? [
        `Halo ${reservation.nama},`,
        '',
        'Kabar baik! Kunjungan Anda ke WaraWiri Village telah DISETUJUI.',
        '',
        `Nomor reservasi: ${reservation.id}`,
        `Tanggal: ${reservation.tanggal}`,
        `Jumlah peserta: ${reservation.pax} orang`,
        reservation.jenisWisata ? `Jenis wisata: ${reservation.jenisWisata}` : null,
        '',
        'Tunjukkan nomor reservasi ini saat tiba. Sampai jumpa!',
        '',
        'WaraWiri Village',
      ]
    : [
        `Halo ${reservation.nama},`,
        '',
        `Mohon maaf, reservasi Anda untuk kunjungan ke WaraWiri Village pada ${reservation.tanggal} (${reservation.pax} orang) belum dapat kami setujui.`,
        '',
        `Nomor reservasi: ${reservation.id}`,
        '',
        'Silakan ajukan reservasi ulang di tanggal lain melalui situs kami.',
        '',
        'WaraWiri Village',
      ]

  return { subject, text: lines.filter((line) => line !== null).join('\n') }
}

export async function sendStatusEmail(reservation) {
  if (!transporter) {
    return { sent: false, reason: 'Layanan email belum dikonfigurasi (SMTP).' }
  }

  const to = isEmail(reservation.email ?? '')
    ? reservation.email
    : isEmail(reservation.kontak ?? '')
      ? reservation.kontak
      : ''

  if (!to) {
    return { sent: false, reason: 'Pengunjung tidak meninggalkan alamat email.' }
  }

  const { subject, text } = buildStatusEmail(reservation)
  await transporter.sendMail({
    from: process.env.SMTP_FROM || SMTP_USER,
    to,
    subject,
    text,
  })
  return { sent: true, to }
}
