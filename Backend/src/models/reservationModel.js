import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, '../../data/reservations.json')

export async function readReservations() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8')
    return JSON.parse(raw).reservations ?? []
  } catch (err) {
    if (err.code === 'ENOENT') return []
    throw err
  }
}

// ponytail: antrean tulis tunggal — cegah reservasi hilang saat 2 POST datang bersamaan.
// Kalau trafik pernah besar, ganti file JSON dengan SQLite.
let writeQueue = Promise.resolve()

export function saveReservation(entry) {
  writeQueue = writeQueue.then(async () => {
    const reservations = await readReservations()
    reservations.push(entry)
    const tmp = `${DATA_FILE}.tmp`
    await fs.writeFile(tmp, `${JSON.stringify({ reservations }, null, 2)}\n`, 'utf8')
    await fs.rename(tmp, DATA_FILE)
  })
  return writeQueue
}

export function createId(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  const stamp =
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `WWR-${stamp}-${rand}`
}
