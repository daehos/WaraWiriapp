import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { db } from '../firebase.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, '../../data/reservations.json')
const COLLECTION = 'reservations'

async function main() {
  let raw
  try {
    raw = await fs.readFile(DATA_FILE, 'utf8')
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`Tidak ada file ${DATA_FILE} — tidak ada yang dimigrasi.`)
      return
    }
    throw err
  }

  const entries = JSON.parse(raw).reservations ?? []
  if (entries.length === 0) {
    console.log('File sumber kosong — tidak ada yang dimigrasi.')
    return
  }

  const kol = db.collection(COLLECTION)
  let created = 0
  let skipped = 0

  for (const entry of entries) {
    const ref = kol.doc(entry.id)
    const existing = await ref.get()
    if (existing.exists) {
      skipped += 1
      continue
    }
    await ref.set(entry)
    created += 1
    console.log(`+ ${entry.id} — ${entry.nama}`)
  }

  console.log(`Selesai: ${created} reservasi dimigrasi, ${skipped} sudah ada (dilewati).`)
}

main()
  .catch((err) => {
    console.error('Migrasi gagal:', err.message)
    process.exitCode = 1
  })
  .finally(() => db.terminate())
