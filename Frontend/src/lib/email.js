// ponytail: EmailJS client config is public by design (browser SDK); lock it by domain in the dashboard.
const SERVICE_ID = 'service_585vhga'
const TEMPLATE_ID = 'template_m9m7tsf'
const PUBLIC_KEY = 'nRFEKnNfwxqkGusmn'
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
    waktu_kunjungan: 'Sesuai jam operasional',
    lokasi_gedung_ruangan: 'Desa Wisata Manud Jaya, Kecamatan Cililin',
    jumlah_orang: `${reservation.pax} orang`,
    alasan_penolakan: 'jadwal atau kuota pada tanggal yang diajukan tidak tersedia',
  }
}

export async function sendStatusEmail(reservation) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    return { sent: false, reason: 'Email belum dikonfigurasi (EmailJS).' }
  }

  const to = isEmail(reservation.email)
    ? reservation.email
    : isEmail(reservation.kontak)
      ? reservation.kontak
      : ''

  if (!to) {
    return { sent: false, reason: 'Pengunjung tidak meninggalkan alamat email.' }
  }

  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: PUBLIC_KEY,
        template_params: { ...buildTemplateParams(reservation), to_email: to },
      }),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      return {
        sent: false,
        reason: `EmailJS menolak pengiriman (${res.status}). ${detail.slice(0, 120)}`,
      }
    }
    return { sent: true, to }
  } catch {
    return { sent: false, reason: 'Layanan email tidak terjangkau.' }
  }
}
