// `npm run local` — satu perintah untuk mencoba seluruh sistem di laptop:
//   1. emulator Firebase (Firestore + Auth) memakai firestore.rules asli
//   2. isi data uji (admin, pemandu, reservasi besok)
//   3. website di http://localhost:5173 yang tersambung ke emulator
// Tidak menyentuh project Firebase asli dan tidak butuh kunci apa pun.
import { spawn } from 'node:child_process'
import { createWriteStream, mkdirSync } from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const BACKEND = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const REPO = path.resolve(BACKEND, '..')
const FRONTEND = path.join(REPO, 'Frontend')
const LOG_DIR = path.join(BACKEND, 'outbox')
const LOG_FILE = path.join(LOG_DIR, 'emulators.log')

const children = []
let stopping = false

function stop(code = 0) {
  if (stopping) return
  stopping = true
  console.log('\nMenghentikan emulator dan website…')
  for (const child of children) child.kill('SIGINT')
  setTimeout(() => process.exit(code), 1500).unref()
}
process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))

const portOpen = (port) =>
  new Promise((resolve) => {
    const socket = net.connect({ port, host: '127.0.0.1' })
    socket.once('connect', () => (socket.destroy(), resolve(true)))
    socket.once('error', () => resolve(false))
  })

async function waitForPort(port, label, timeoutMs) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    if (stopping) return false
    if (await portOpen(port)) return true
    await new Promise((r) => setTimeout(r, 500))
  }
  console.error(`${label} tidak kunjung aktif (lihat ${LOG_FILE}).`)
  return false
}

for (const [port, label] of [[8080, 'Firestore emulator'], [9099, 'Auth emulator'], [3001, 'Backend API']]) {
  if (await portOpen(port)) {
    console.error(`Port ${port} (${label}) sudah dipakai — tutup emulator lain dulu, lalu coba lagi.`)
    process.exit(1)
  }
}

mkdirSync(LOG_DIR, { recursive: true })
const log = createWriteStream(LOG_FILE)

console.log('1/3 Menyalakan emulator Firebase… (pertama kali mengunduh emulator, bisa beberapa menit)')
const emulators = spawn(
  path.join(BACKEND, 'node_modules/.bin/firebase'),
  ['emulators:start', '--only', 'auth,firestore', '--project', 'warawiriapp-da23e'],
  { cwd: REPO, stdio: ['ignore', 'pipe', 'pipe'] },
)
children.push(emulators)
emulators.stdout.pipe(log)
emulators.stderr.pipe(log)
emulators.on('exit', (code) => {
  if (!stopping) {
    console.error(`Emulator berhenti (kode ${code}). Detail: ${LOG_FILE}`)
    console.error('Pastikan Java terpasang (java -version) dan koneksi internet ada saat pertama kali.')
    stop(1)
  }
})

const ready =
  (await waitForPort(8080, 'Firestore emulator', 5 * 60_000)) &&
  (await waitForPort(9099, 'Auth emulator', 60_000))
if (!ready) stop(1)
else {
  console.log('2/3 Mengisi data uji…')
  const seed = spawn(process.execPath, ['--env-file-if-exists=.env', '--env-file=.env.emulator', 'src/scripts/localSeed.js'], {
    cwd: BACKEND,
    stdio: 'inherit',
  })
  children.push(seed)
  const seedCode = await new Promise((resolve) => seed.on('exit', resolve))
  if (seedCode !== 0) stop(1)
  else {
    console.log(`
3/3 Menyalakan website…

  Website        http://localhost:5173
  Admin          http://localhost:5173/admin     (admin@warawiri.local / admin123)
  Emulator UI    http://localhost:4000           (lihat isi database)

  Klik Approve di /admin → pemandu langsung dipilih & emailnya dibuat
  (mode NOTIFY_MODE=segera). Lihat hasilnya di Backend/outbox/local/index.html
  Job manual (opsional): cd Backend && npm run local:notify

  Tekan Ctrl+C di sini untuk berhenti.
`)
    // Backend API: dipanggil dashboard admin saat Approve (email ke pemandu langsung dikirim)
    const api = spawn(process.execPath, ['--env-file-if-exists=.env', '--env-file=.env.emulator', 'src/app.js'], {
      cwd: BACKEND,
      stdio: 'inherit',
    })
    children.push(api)
    api.on('exit', (code) => {
      if (!stopping) {
        console.error(`Backend API berhenti (kode ${code}).`)
        stop(1)
      }
    })

    const web = spawn('npm', ['run', 'dev:local'], { cwd: FRONTEND, stdio: 'inherit' })
    children.push(web)
    web.on('exit', (code) => {
      if (!stopping) stop(code ?? 0)
    })
  }
}
