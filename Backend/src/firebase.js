import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function resolveCredential() {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (inline) return cert(JSON.parse(inline))

  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT ?? process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (keyPath) {
    const absolute = path.isAbsolute(keyPath) ? keyPath : path.resolve(__dirname, '..', keyPath)
    return cert(JSON.parse(readFileSync(absolute, 'utf8')))
  }

  // fallback: cukup taruh file kuncinya di Backend/ — tanpa .env pun jalan.
  const defaultKey = path.resolve(__dirname, '../serviceAccountKey.json')
  if (existsSync(defaultKey)) return cert(JSON.parse(readFileSync(defaultKey, 'utf8')))

  throw new Error(
    'Kunci service account tidak ditemukan. Simpan file kunci Firebase sebagai Backend/serviceAccountKey.json (atau set FIREBASE_SERVICE_ACCOUNT di Backend/.env)',
  )
}

let app
try {
  app = initializeApp({ credential: resolveCredential() })
} catch (err) {
  console.error(
    [
      'Gagal inisialisasi Firebase Firestore.',
      '',
      'Cara memperbaiki:',
      '1. Ambil file kunci dari pemilik project (WA/Drive — JANGAN lewat git)',
      '2. Simpan sebagai Backend/serviceAccountKey.json',
      '3. (Opsional) kalau nama file lain, set FIREBASE_SERVICE_ACCOUNT di Backend/.env',
      '',
      `Detail error: ${err.message}`,
    ].join('\n'),
  )
  process.exit(1)
}

export const db = getFirestore(app)
