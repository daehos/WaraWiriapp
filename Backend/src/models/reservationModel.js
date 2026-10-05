import { db } from '../firebase.js'

const COLLECTION = 'reservations'

export async function readReservations() {
  const snap = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get()
  return snap.docs.map((doc) => doc.data())
}

export async function saveReservation(entry) {
  // pakai id aplikasi sebagai doc ID — anti-duplikat, idempoten saat retry.
  await db.collection(COLLECTION).doc(entry.id).set(entry)
}

export function createId(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  const stamp =
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `WWR-${stamp}-${rand}`
}
