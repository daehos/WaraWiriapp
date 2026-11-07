import { EMAILJS, postEmailJs } from './emailjs.js'
import { USE_EMULATOR } from './env.js'
import { buildTicketUrl } from './ticket.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isEmail(value) {
  return EMAIL_RE.test(value ?? '')
}

export function buildTemplateParams(reservation) {
  const approved = reservation.status === 'dikonfirmasi'
  return {
    name: reservation.nama,
    title: `WaraWiri Village - ${reservation.id}`,
    status: approved ? 'Disetujui' : 'Ditolak',
    // EmailJS only supports {{flag}}...{{/flag}} conditionals, not Handlebars {{#if}}.
    is_approved: approved ? 'true' : '',
    is_declined: approved ? '' : 'true',
    tanggal_kunjungan: reservation.tanggal,
    waktu_kunjungan: reservation.waktu ? `${reservation.waktu} WIB` : 'Sesuai jam operasional',
    lokasi_gedung_ruangan: 'Desa Wisata Manud Jaya, Kecamatan Cililin',
    jumlah_orang: `${reservation.pax} orang`,
    alasan_penolakan: 'jadwal atau kuota pada tanggal yang diajukan tidak tersedia',
  }
}

export async function sendStatusEmail(reservation) {
  const approved = reservation.status === 'dikonfirmasi'

  if (USE_EMULATOR) {
    return { sent: false, reason: 'Email EmailJS dimatikan di mode lokal (emulator).' }
  }
  if (!EMAILJS.serviceId || !EMAILJS.visitorTemplateId || !EMAILJS.publicKey) {
    return { sent: false, reason: 'Email belum dikonfigurasi (EmailJS).' }
  }
  if (approved && (!reservation.ticketCode || !reservation.manualCode)) {
    return { sent: false, reason: 'Tiket belum lengkap (kode QR/manual belum dibuat).' }
  }

  const to = isEmail(reservation.email)
    ? reservation.email
    : isEmail(reservation.kontak)
      ? reservation.kontak
      : ''

  if (!to) {
    return { sent: false, reason: 'Pengunjung tidak meninggalkan alamat email.' }
  }

  const origin = typeof window === 'undefined' ? '' : window.location.origin
  if (approved && !origin) {
    return { sent: false, reason: 'Alamat situs tiket tidak diketahui.' }
  }
  const ticketCode = approved ? reservation.manualCode : ''
  const ticketUrl = approved
    ? buildTicketUrl(origin, reservation.id, reservation.ticketCode, reservation.manualCode)
    : ''

  const result = await postEmailJs(EMAILJS.visitorTemplateId, {
    ...buildTemplateParams(reservation),
    to_email: to,
    ticket_url: ticketUrl,
    ticket_code: ticketCode,
  })
  if (!result.ok) {
    return {
      sent: false,
      reason: result.status
        ? `EmailJS menolak pengiriman (${result.status}). ${result.detail}`
        : result.detail,
    }
  }
  return { sent: true, to }
}
