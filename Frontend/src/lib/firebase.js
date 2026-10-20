import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Konfigurasi publik Firebase — memang dirancang untuk diketahui browser (bukan rahasia).
// Rahasia sejatinya ada di security rules, bukan di config ini.
const firebaseConfig = {
  apiKey: 'AIzaSyCdm7i9y8S3IqI27dUdYJTEpf-GkNKjjvU',
  authDomain: 'warawiriapp-da23e.firebaseapp.com',
  projectId: 'warawiriapp-da23e',
  storageBucket: 'warawiriapp-da23e.firebasestorage.app',
  messagingSenderId: '135310768297',
  appId: '1:135310768297:web:c48c0e502edf103c2451b8',
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)
