import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'
// Data pemandu diinput manual (sumber yang sama dengan Backend: `npm run seed-guides`).
import guideData from '../../../Backend/data/guides.json' with { type: 'json' }

/** Store Firestore klien (login admin): baca reservasi dikonfirmasi, tulis field penugasan. */
export function createBrowserStore(db) {
  return {
    name: 'firestore-browser',
    async listConfirmedReservations() {
      const snap = await getDocs(query(collection(db, 'reservations'), where('status', '==', 'dikonfirmasi')))
      return snap.docs.map((d) => d.data())
    },
    async listGuides() {
      return guideData.guides.map((g) => ({ ...g }))
    },
    async updateReservation(id, fields) {
      await updateDoc(doc(db, 'reservations', id), fields)
    },
  }
}
