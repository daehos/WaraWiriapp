import { db } from '../firebase.js'

const COLLECTION = 'reservations'
const QUOTA_COLLECTION = 'quotas'

export const DEFAULT_QUOTA = 100

// ponytail: counter `used` dijaga transaksi; admin SDK melewati rules.
export async function createReservationWithQuota(entry) {
  const quotaRef = db.collection(QUOTA_COLLECTION).doc(entry.tanggal)
  const reservationRef = db.collection(COLLECTION).doc(entry.id)

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(quotaRef)
    const limit = snap.exists ? Number(snap.data().limit) || DEFAULT_QUOTA : DEFAULT_QUOTA
    const used = snap.exists ? Number(snap.data().used ?? 0) : 0

    if (used + entry.pax > limit) {
      const error = new Error('Kuota tanggal ini tidak mencukupi.')
      error.code = 'quota-exceeded'
      throw error
    }

    tx.set(reservationRef, entry)
    tx.set(
      quotaRef,
      { tanggal: entry.tanggal, limit, used: used + entry.pax, lastReservationId: entry.id },
      { merge: true },
    )
  })
}

export async function readReservations() {
  const snap = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get()
  return snap.docs.map((doc) => doc.data())
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
