import { db } from '../firebase.js'

const COLLECTION = 'reservations'
const QUOTA_COLLECTION = 'quotas'

export const DEFAULT_QUOTA = 100

// ponytail: kuota per tanggal disimpan per-doc; default 100 kalau belum diatur admin.
export async function readQuotaLimit(tanggal) {
  const doc = await db.collection(QUOTA_COLLECTION).doc(tanggal).get()
  const limit = doc.exists ? Number(doc.data().limit) : 0
  return Number.isInteger(limit) && limit > 0 ? limit : DEFAULT_QUOTA
}export async function readReservations() {
  const snap = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get()
  return snap.docs.map((doc) => doc.data())
}

// ponytail: query + sum per tanggal; ganti ke counter doc kalau koleksi membesar.
// Reservasi yang ditolak tidak dihitung, jadi kuota tanggal itu terbuka lagi.
export async function sumPaxByDate(tanggal) {
  const snap = await db.collection(COLLECTION).where('tanggal', '==', tanggal).get()
  return snap.docs.reduce((sum, doc) => {
    const data = doc.data()
    if (data.status === 'ditolak') return sum
    return sum + (Number(data.pax) || 0)
  }, 0)
}

export async function saveReservation(entry) {
  // pakai id aplikasi sebagai doc ID — anti-duplikat, idempoten saat retry.
  await db.collection(COLLECTION).doc(entry.id).set(entry)
}

export async function readReservation(id) {
  if (!id) return null
  const doc = await db.collection(COLLECTION).doc(id).get()
  return doc.exists ? doc.data() : null
}

export function createId(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  const stamp =
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `WWR-${stamp}-${rand}`
}
