import { db } from '../firebase.js'

// Store produksi: Firestore lewat Admin SDK (melewati security rules, jadi
// field penugasan/notifikasi hanya bisa ditulis job ini, bukan client).
export function createFirestoreStore() {
  return {
    name: 'firestore',
    async listConfirmedReservations() {
      // Filter satu field -> tidak butuh composite index; tanggal disaring di job.
      const snap = await db.collection('reservations').where('status', '==', 'dikonfirmasi').get()
      return snap.docs.map((d) => d.data())
    },
    async listGuides() {
      const snap = await db.collection('guides').get()
      return snap.docs.map((d) => ({ ...d.data(), id: d.id }))
    },
    async updateReservation(id, fields) {
      await db.collection('reservations').doc(id).update(fields)
    },
  }
}
