import { doc, getDoc, runTransaction } from 'firebase/firestore'
import { db } from './firebase.js'

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

  const email = (values.email ?? '').trim()
  if (email && !EMAIL_RE.test(email)) {
    errors.email = 'Format email tidak valid.'
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

export function createId(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  const stamp =
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `WWR-${stamp}-${rand}`
}

export function hasQuota(used, limit, pax) {
  return used + pax <= limit
}

// ponytail: kuota disimpan sebagai counter `quotas/{tanggal}`; dibaca langsung
// dari Firestore supaya tetap jalan tanpa backend.
export async function fetchQuota(tanggal) {
  const snap = await getDoc(doc(db, 'quotas', tanggal))
  const limit = snap.exists() ? Number(snap.data().limit) || 100 : 100
  const used = snap.exists() ? Number(snap.data().used ?? 0) : 0
  return { tanggal, limit, used, remaining: Math.max(0, limit - used), full: used >= limit }
}

export async function submitReservation(values) {
  const errors = validateReservation(values)
  if (Object.keys(errors).length > 0) {
    const error = new Error('Data reservasi belum lengkap.')
    error.fields = errors
    throw error
  }

  // ponytail: cek kuota best-effort lewat API backend. Kalau backend tidak ada
  // (hosting statis murni), submit tetap jalan; penegakan keras butuh transaksi server.
  let quota = null
  try {
    quota = await fetchQuota(values.tanggal)
  } catch {
    quota = null
  }

  if (quota && !hasQuota(quota.used, quota.limit, Number(values.pax))) {
    const message = quota.full
      ? 'Kuota habis untuk tanggal ini. Silakan pilih tanggal lain.'
      : `Sisa kuota tanggal ini ${quota.remaining} orang. Kurangi jumlah pengunjung atau pilih tanggal lain.`
    const error = new Error(message)
    error.fields = { tanggal: message }
    throw error
  }

  const entry = {
    id: createId(),
    status: 'menunggu-konfirmasi',
    nama: values.nama.trim(),
    kontak: values.kontak.trim().replace(/[\s-]/g, ''),
    email: values.email.trim().toLowerCase() || null,
    tanggal: values.tanggal,
    pax: Number(values.pax),
    jenisWisata: values.jenisWisata.trim() || null,
    createdAt: new Date().toISOString(),
  }

  // Counter kuota + reservasi ditulis atomik. Transaksi Firestore mendeteksi
  // konflik (dua orang submit bersamaan) lalu rules memvalidasi batas kuota.
  try {
    await runTransaction(db, async (tx) => {
      const quotaRef = doc(db, 'quotas', entry.tanggal)
      const snap = await tx.get(quotaRef)
      const limit = snap.exists() ? Number(snap.data().limit) || 100 : 100
      const used = snap.exists() ? Number(snap.data().used ?? 0) : 0

      if (!hasQuota(used, limit, entry.pax)) {
        const message = used >= limit
          ? 'Kuota habis untuk tanggal ini. Silakan pilih tanggal lain.'
          : `Sisa kuota tanggal ini ${Math.max(0, limit - used)} orang. Kurangi jumlah pengunjung atau pilih tanggal lain.`
        const error = new Error(message)
        error.fields = { tanggal: message }
        error.quota = true
        throw error
      }

      tx.set(doc(db, 'reservations', entry.id), entry)
      tx.set(
        quotaRef,
        {
          tanggal: entry.tanggal,
          limit,
          used: used + entry.pax,
          lastReservationId: entry.id,
        },
        { merge: true },
      )
    })
  } catch (err) {
    if (err.quota) throw err
    const error = new Error('Reservasi gagal dikirim. Coba lagi sebentar lagi.')
    error.fields = null
    throw error
  }
  return entry
}
