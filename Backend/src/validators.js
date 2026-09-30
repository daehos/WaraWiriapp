const PHONE_RE = /^(\+62|62|0)8[1-9][0-9]{6,11}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function todayISO(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function validateReservation(values) {
  const errors = {}

  const nama = (values.nama ?? '').trim()
  if (nama.length < 2) errors.nama = 'Nama wajib diisi (min. 2 karakter).'
  else if (nama.length > 100) errors.nama = 'Nama terlalu panjang (maks. 100 karakter).'

  const kontak = (values.kontak ?? '').trim()
  if (!kontak) {
    errors.kontak = 'Kontak wajib diisi (nomor HP atau email).'
  } else {
    const normalized = kontak.replace(/[\s-]/g, '')
    if (!PHONE_RE.test(normalized) && !EMAIL_RE.test(normalized)) {
      errors.kontak = 'Gunakan nomor HP Indonesia (08… / +62…) atau email yang valid.'
    } else if (kontak.length > 100) {
      errors.kontak = 'Kontak terlalu panjang (maks. 100 karakter).'
    }
  }

  const tanggal = (values.tanggal ?? '').trim()
  if (!tanggal) {
    errors.tanggal = 'Tanggal kunjungan wajib dipilih.'
  } else if (tanggal <= todayISO()) {
    errors.tanggal = 'Tanggal kunjungan minimal besok.'
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
    errors.tanggal = 'Format tanggal tidak valid.'
  }

  const pax = values.pax
  if (pax === '' || pax === null || pax === undefined) {
    errors.pax = 'Jumlah orang wajib diisi.'
  } else if (!Number.isInteger(Number(pax)) || Number(pax) < 1) {
    errors.pax = 'Jumlah orang harus bilangan bulat minimal 1.'
  } else if (Number(pax) > 1000) {
    errors.pax = 'Jumlah orang terlalu besar.'
  }

  const jenis = (values.jenisWisata ?? '').trim()
  if (jenis.length > 100) errors.jenisWisata = 'Jenis wisata terlalu panjang.'

  return errors
}
