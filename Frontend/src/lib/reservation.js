const PHONE_RE = /^(\+62|62|0)8[1-9][0-9]{6,11}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Local date (not UTC) as YYYY-MM-DD.
export function todayISO(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function validateReservation(values, jenisWisataOptions = []) {
  const errors = {}

  const nama = (values.nama ?? '').trim()
  if (nama.length < 2) errors.nama = 'Nama wajib diisi (min. 2 karakter).'

  const kontak = (values.kontak ?? '').trim()
  if (!kontak) {
    errors.kontak = 'Kontak wajib diisi (nomor HP atau email).'
  } else {
    const normalized = kontak.replace(/[\s-]/g, '')
    if (!PHONE_RE.test(normalized) && !EMAIL_RE.test(normalized)) {
      errors.kontak = 'Gunakan nomor HP Indonesia (08… / +62…) atau email yang valid.'
    }
  }

  const tanggal = (values.tanggal ?? '').trim()
  if (!tanggal) {
    errors.tanggal = 'Tanggal kunjungan wajib dipilih.'
  } else if (tanggal <= todayISO()) {
    errors.tanggal = 'Tanggal kunjungan minimal besok.'
  }

  const pax = values.pax
  if (pax === '' || pax === null || pax === undefined) {
    errors.pax = 'Jumlah orang wajib diisi.'
  } else if (!Number.isInteger(Number(pax)) || Number(pax) < 1) {
    errors.pax = 'Jumlah orang harus bilangan bulat minimal 1.'
  }

  const jenis = (values.jenisWisata ?? '').trim()
  if (jenis && jenisWisataOptions.length > 0 && !jenisWisataOptions.includes(jenis)) {
    errors.jenisWisata = 'Pilih jenis wisata yang tersedia.'
  }

  return errors
}

export async function submitReservation(values) {
  let response
  try {
    response = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
  } catch {
    throw new Error('Tidak bisa terhubung ke server. Coba lagi sebentar lagi.')
  }

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(body.error || 'Reservasi gagal dikirim. Coba lagi.')
    error.fields = body.errors || null
    throw error
  }
  return body
}
