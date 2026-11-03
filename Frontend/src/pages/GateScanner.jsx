import { useEffect, useRef, useState } from 'react'
import { signOut } from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction,
  where,
} from 'firebase/firestore'
import { Html5Qrcode } from 'html5-qrcode'
import { auth, db } from '../lib/firebase'
import {
  nextTicketState,
  parseManualCode,
  parseTicketPayload,
  todayWIB,
} from '../lib/ticket'

const CAMERA_KEY = 'warawiri.scan.cameras'
const QR_LOST_MS = 1200

const PANELS = {
  masuk: {
    title: 'Pintu Masuk',
    position: 'Kamera kiri',
    readerId: 'qr-reader-masuk',
    border: 'border-forest-100',
    titleColor: 'text-forest-700',
    button: 'bg-forest-700 hover:bg-forest-900',
    badge: 'bg-forest-50 text-forest-700',
    dot: 'bg-forest-600',
  },
  keluar: {
    title: 'Pintu Keluar',
    position: 'Kamera kanan',
    readerId: 'qr-reader-keluar',
    border: 'border-clay-500/50',
    titleColor: 'text-clay-600',
    button: 'bg-clay-600 hover:bg-clay-500',
    badge: 'bg-clay-100 text-clay-600',
    dot: 'bg-clay-500',
  },
}

function readSavedDevices() {
  try {
    const value = JSON.parse(localStorage.getItem(CAMERA_KEY) ?? '{}')
    return {
      masuk: typeof value.masuk === 'string' ? value.masuk : '',
      keluar: typeof value.keluar === 'string' ? value.keluar : '',
    }
  } catch {
    return { masuk: '', keluar: '' }
  }
}

function saveDevices(devices) {
  try {
    localStorage.setItem(CAMERA_KEY, JSON.stringify(devices))
  } catch {
    // localStorage bisa diblokir; pilihan kamera tetap berlaku selama halaman terbuka.
  }
}

function cameraLabel(camera, index) {
  return camera.label?.trim() || `Kamera ${index + 1}`
}

async function stopScannerInstance(scanner) {
  if (!scanner) return
  try {
    await scanner.stop()
  } catch {
    // kamera memang belum/tidak berjalan
  }
  try {
    scanner.clear()
  } catch {
    // abaikan
  }
}

function cameraErrorMessage(err) {
  if (err?.name === 'NotAllowedError') {
    return 'Izin kamera ditolak. Izinkan kamera di browser, atau pakai input manual di bawah.'
  }
  if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
    return 'Kamera sedang dipakai aplikasi atau panel lain. Pilih kamera berbeda, tutup aplikasi lain, lalu coba lagi.'
  }
  if (err?.name === 'OverconstrainedError' || err?.name === 'NotFoundError') {
    return 'Kamera yang dipilih tidak ditemukan. Pilih kamera lain atau pakai input manual di bawah.'
  }
  return 'Kamera tidak bisa diakses. Pilih kamera lain atau pakai input manual di bawah.'
}

// html5-qrcode memakai id global "qr-shaded-region" saat qrbox aktif. Dengan dua
// instance, stop() panel kanan bisa mencoba menghapus shade panel kiri. Karena itu
// scanner memakai area penuh dan overlay bingkai dibuat sendiri di bawah.

export default function GateScanner({ user }) {
  const [cameras, setCameras] = useState([])
  const [devices, setDevices] = useState({ masuk: '', keluar: '' })
  const [loadingCameras, setLoadingCameras] = useState(true)
  const [cameraListError, setCameraListError] = useState('')
  const activeRef = useRef(true)
  const detectingRef = useRef(false)

  useEffect(() => {
    activeRef.current = true
    // Timer kecil membuat StrictMode tidak memicu dua permintaan kamera.
    const timer = setTimeout(() => {
      void detectCameras()
    }, 0)
    return () => {
      activeRef.current = false
      clearTimeout(timer)
    }
  }, [])

  async function detectCameras() {
    if (detectingRef.current) return
    detectingRef.current = true
    setLoadingCameras(true)
    setCameraListError('')
    try {
      const list = await Html5Qrcode.getCameras()
      if (!activeRef.current) return

      setCameras(list)
      const saved = readSavedDevices()
      const exists = (id) => list.some((camera) => camera.id === id)
      const masuk = exists(saved.masuk) ? saved.masuk : list[0]?.id ?? ''
      const keluar =
        exists(saved.keluar) && saved.keluar !== masuk
          ? saved.keluar
          : list.find((camera) => camera.id !== masuk)?.id ?? ''
      const next = { masuk, keluar }
      setDevices(next)
      saveDevices(next)
    } catch {
      if (activeRef.current) {
        setCameraListError(
          'Kamera belum bisa dideteksi. Izinkan akses kamera di browser, lalu coba deteksi ulang. Input manual tetap bisa dipakai.',
        )
      }
    } finally {
      detectingRef.current = false
      if (activeRef.current) setLoadingCameras(false)
    }
  }

  function changeDevice(mode, id) {
    setDevices((current) => {
      const next = { ...current, [mode]: id }
      saveDevices(next)
      return next
    })
  }

  const duplicate = Boolean(devices.masuk && devices.masuk === devices.keluar)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <a href="/admin" className="text-sm font-semibold text-forest-700 hover:text-forest-900">
            ← Dashboard
          </a>
          <h1 className="mt-3 font-display text-3xl font-medium text-ink-900">
            Scan Masuk &amp; Keluar
          </h1>
          <p className="mt-1 text-sm text-ink-700">
            {user.email} · Berlaku untuk kunjungan {todayWIB()} (WIB)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => signOut(auth)}
            className="rounded-full bg-forest-700 px-4 py-2 text-sm font-semibold text-sand-50 transition hover:bg-forest-900"
          >
            Keluar
          </button>
        </div>
      </header>

      <div className="mb-4 rounded-2xl border border-forest-100 bg-white px-4 py-3 text-sm text-ink-700">
        <p className="font-semibold text-forest-700">
          Kamera kiri = pintu masuk · kamera kanan = pintu keluar
        </p>
        <p className="mt-1 text-xs">
          {loadingCameras
            ? 'Menyiapkan kamera… Izinkan akses kamera jika browser meminta.'
            : cameras.length === 0
              ? 'Tidak ada kamera terdeteksi. Gunakan input manual atau coba deteksi ulang.'
              : `${cameras.length} kamera terdeteksi. Kamera langsung aktif; pilihan perangkat tersimpan otomatis.`}
        </p>
      </div>

      {!loadingCameras && (cameraListError || cameras.length === 0) && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-clay-500 bg-clay-100/60 px-4 py-3 text-sm text-clay-600"
        >
          <p className="font-medium">
            {cameraListError ||
              'Tidak ada kamera yang terdeteksi. Sambungkan kamera, lalu coba deteksi ulang. Input manual tetap bisa dipakai.'}
          </p>
          <button
            type="button"
            onClick={detectCameras}
            className="mt-3 rounded-full border border-clay-500 px-4 py-2 text-xs font-semibold transition hover:bg-clay-100"
          >
            Coba deteksi ulang
          </button>
        </div>
      )}

      {!loadingCameras && !cameraListError && cameras.length === 1 && (
        <p className="mb-4 rounded-xl border border-sand-100 bg-sand-100/60 px-4 py-3 text-sm text-ink-700">
          Baru satu kamera terdeteksi. Panel masuk aktif otomatis; panel keluar bisa memakai input
          manual atau tambahkan kamera kedua.
        </p>
      )}

      {duplicate && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-clay-500 bg-clay-100/60 px-4 py-3 text-sm font-medium text-clay-600"
        >
          Kamera masuk dan kamera keluar tidak boleh memakai perangkat yang sama. Pilih kamera
          berbeda untuk salah satu panel.
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {Object.keys(PANELS).map((mode) => (
          <CameraPanel
            key={mode}
            mode={mode}
            cameras={cameras}
            cameraId={devices[mode]}
            duplicate={duplicate}
            loadingCameras={loadingCameras}
            onDeviceChange={(id) => changeDevice(mode, id)}
          />
        ))}
      </div>
    </div>
  )
}

function CameraPanel({
  mode,
  cameras,
  cameraId,
  duplicate,
  loadingCameras,
  onDeviceChange,
}) {
  const panel = PANELS[mode]
  const [cameraOn, setCameraOn] = useState(false)
  const [starting, setStarting] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [manual, setManual] = useState('')
  const scannerRef = useRef(null)
  const busyRef = useRef(false)
  const startingRef = useRef(false)
  const autoStartedForRef = useRef('')
  const startCameraRef = useRef(null)
  const acceptedRawRef = useRef('')
  const lastSeenAtRef = useRef(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      const scanner = scannerRef.current
      scannerRef.current = null
      stopScannerInstance(scanner)
    }
  }, [])

  useEffect(() => {
    if (loadingCameras || !cameraId || duplicate) return
    if (!cameras.some((camera) => camera.id === cameraId)) return
    if (autoStartedForRef.current === cameraId) return

    // Timer menghindari start ganda dari StrictMode tanpa menambah aksi pengguna.
    const timer = setTimeout(() => {
      if (!mountedRef.current || autoStartedForRef.current === cameraId) return
      autoStartedForRef.current = cameraId
      void startCameraRef.current?.()
    }, 0)
    return () => clearTimeout(timer)
  }, [cameraId, cameras, duplicate, loadingCameras])

  async function stopCamera(updateState = true) {
    const scanner = scannerRef.current
    scannerRef.current = null
    await stopScannerInstance(scanner)
    if (updateState && mountedRef.current) {
      setCameraOn(false)
    }
  }

  async function startCamera() {
    setError('')
    setResult(null)
    if (scannerRef.current || startingRef.current) return
    acceptedRawRef.current = ''
    lastSeenAtRef.current = 0
    if (!cameraId) {
      setError('Pilih kamera untuk panel ini terlebih dahulu.')
      return
    }
    if (duplicate) {
      setError('Kamera masuk dan keluar tidak boleh memakai perangkat yang sama.')
      return
    }

    startingRef.current = true
    setStarting(true)
    let scanner
    try {
      scanner = new Html5Qrcode(panel.readerId, { verbose: false })
      scannerRef.current = scanner
      await scanner.start(
        { deviceId: { exact: cameraId } },
        { fps: 10 },
        (decoded) => {
          lastSeenAtRef.current = Date.now()
          if (decoded === acceptedRawRef.current) return
          handleScan(decoded)
        },
        () => {
          if (
            acceptedRawRef.current &&
            Date.now() - lastSeenAtRef.current > QR_LOST_MS
          ) {
            acceptedRawRef.current = ''
          }
        },
      )
      if (mountedRef.current) {
        setCameraOn(true)
      }
    } catch (err) {
      scannerRef.current = null
      try {
        scanner?.clear()
      } catch {
        // abaikan
      }
      if (mountedRef.current) setError(cameraErrorMessage(err))
    } finally {
      startingRef.current = false
      if (mountedRef.current) setStarting(false)
    }
  }

  startCameraRef.current = startCamera

  async function handleScan(raw) {
    if (busyRef.current) return
    acceptedRawRef.current = raw
    lastSeenAtRef.current = Date.now()
    busyRef.current = true
    setBusy(true)
    setResult(null)
    try {
      await processTicket(raw)
    } finally {
      // Kamera tetap hidup. QR yang sama baru diproses lagi setelah hilang
      // dari frame sebentar, jadi tidak terhitung berulang.
      busyRef.current = false
      if (mountedRef.current) setBusy(false)
    }
  }

  async function resolveTicket(raw) {
    const parsed = parseTicketPayload(raw)
    if (parsed) return parsed

    const manualCode = parseManualCode(raw)
    if (!manualCode) return null
    if (/^\d{6}$/.test(manualCode)) {
      const map = await getDoc(doc(db, 'manualCodes', manualCode))
      if (!map.exists()) return null
      return { id: map.data().reservationId, manualCode }
    }

    // Kompatibilitas kode hex lama sebelum ada kode manual 6 digit.
    const found = await getDocs(
      query(collection(db, 'reservations'), where('ticketCode', '==', manualCode), limit(1)),
    )
    if (found.empty) return null
    return { id: found.docs[0].id, code: manualCode }
  }

  async function processTicket(raw) {
    setError('')
    let parsed
    try {
      parsed = await resolveTicket(raw)
    } catch {
      if (mountedRef.current) {
        setResult({ ok: false, message: 'Gagal mencari kode tiket. Coba lagi.' })
      }
      return
    }
    if (!parsed) {
      setResult({ ok: false, message: 'QR/kode bukan tiket WaraWiri yang valid.' })
      return
    }

    try {
      const ticket = await runTransaction(db, async (tx) => {
        const ref = doc(db, 'reservations', parsed.id)
        const snap = await tx.get(ref)
        if (!snap.exists()) throw new Error('Tiket tidak ditemukan.')
        const data = snap.data()
        if (parsed.manualCode) {
          if (data.manualCode !== parsed.manualCode) throw new Error('Kode manual tidak cocok.')
        } else if (data.ticketCode !== parsed.code) {
          throw new Error('Kode tiket tidak cocok.')
        }

        const state = nextTicketState(data, mode)
        if (!state.ok) throw new Error(state.reason)

        tx.update(ref, { ...state.next, lastScanAt: new Date().toISOString() })
        return { ...data, ...state.next }
      })
      if (mountedRef.current) setResult({ ok: true, ticket })
    } catch (err) {
      const message =
        err?.code === 'permission-denied'
          ? 'Akun ini tidak punya akses memproses tiket.'
          : err?.message || 'Gagal memproses tiket.'
      if (mountedRef.current) setResult({ ok: false, message })
    }
  }

  function submitManual(event) {
    event.preventDefault()
    const value = manual.trim()
    if (!value || busyRef.current) return
    setManual('')
    handleScan(value)
  }

  const canStart =
    cameras.some((camera) => camera.id === cameraId) && !duplicate && !busy && !starting

  return (
    <section className={`flex flex-col rounded-3xl border bg-white p-4 ${panel.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-700">
            {panel.position}
          </p>
          <h2 className={`font-display text-2xl font-medium ${panel.titleColor}`}>
            {panel.title}
          </h2>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            cameraOn ? panel.badge : 'bg-sand-100 text-ink-700'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${cameraOn ? panel.dot : 'bg-ink-700/30'}`} />
          {cameraOn ? 'Live' : 'Kamera mati'}
        </span>
      </div>

      <label htmlFor={`camera-${mode}`} className="mt-4 text-sm font-semibold text-forest-700">
        Pilih kamera
      </label>
      <select
        id={`camera-${mode}`}
        value={cameraId}
        onChange={(event) => onDeviceChange(event.target.value)}
        disabled={cameraOn || starting || busy}
        className="mt-1 w-full rounded-xl border border-forest-100 bg-white px-3 py-2.5 text-sm outline-none focus:border-forest-600 disabled:bg-sand-50 disabled:text-ink-700"
      >
        <option value="">Pilih kamera…</option>
        {cameras.map((camera, index) => (
          <option key={camera.id} value={camera.id}>
            {cameraLabel(camera, index)}
          </option>
        ))}
      </select>
      {cameras.length === 0 && !loadingCameras && (
        <p className="mt-1 text-xs text-ink-700">
          Belum ada kamera terdeteksi. Gunakan input manual atau coba deteksi ulang di atas.
        </p>
      )}

      <div className="relative mt-3 overflow-hidden rounded-2xl bg-ink-900/5">
        <div id={panel.readerId} className="qr-reader aspect-[4/3] w-full" />
        {cameraOn && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[220px] w-[220px] rounded-2xl border-2 border-sand-50/90 shadow-[0_0_0_9999px_rgba(28,51,39,0.32)]" />
          </div>
        )}
        {!cameraOn && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-sand-50/70 px-4 text-center text-sm font-semibold text-ink-700">
            {starting || loadingCameras ? 'Menyiapkan kamera…' : 'Kamera belum aktif'}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!cameraOn && !starting && !loadingCameras && cameraId && (
          <button
            type="button"
            onClick={startCamera}
            disabled={!canStart}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold text-sand-50 transition disabled:cursor-not-allowed disabled:opacity-60 ${panel.button}`}
          >
            Aktifkan kamera
          </button>
        )}
        {cameraOn && (
          <button
            type="button"
            onClick={() => stopCamera()}
            disabled={busy}
            className="rounded-full border border-forest-100 px-5 py-2.5 text-sm font-semibold text-forest-700 transition hover:bg-forest-100 disabled:opacity-60"
          >
            Matikan kamera
          </button>
        )}
        {busy && <p className="text-sm font-semibold text-forest-700">Memproses…</p>}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-xl border border-clay-500 bg-clay-100/60 px-4 py-3 text-sm font-medium text-clay-600"
        >
          {error}
        </p>
      )}

      {result && (
        <div
          role="status"
          aria-live="polite"
          className={`mt-4 rounded-2xl border px-4 py-3 ${
            result.ok
              ? 'border-forest-100 bg-forest-50 text-forest-700'
              : 'border-clay-500 bg-clay-100/60 text-clay-600'
          }`}
        >
          <p className="font-display text-lg font-medium">
            {result.ok
              ? mode === 'masuk'
                ? 'Masuk tercatat'
                : 'Keluar tercatat'
              : 'Scan ditolak'}
          </p>
          {result.ok ? (
            <>
              <p className="mt-1 text-sm font-semibold text-ink-900">{result.ticket.nama}</p>
              <p className="text-sm">
                {result.ticket.tanggal} · {result.ticket.inside} dari {result.ticket.pax} orang di
                dalam
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm">{result.message}</p>
          )}
          {cameraOn && (
            <p className="mt-2 text-xs opacity-80">
              Kamera tetap aktif. Arahkan QR berikutnya.
            </p>
          )}
        </div>
      )}

      <form
        onSubmit={submitManual}
        className="mt-4 rounded-2xl border border-forest-100 bg-sand-50/60 p-3"
      >
        <label htmlFor={`manual-${mode}`} className="text-sm font-semibold text-forest-700">
          Input manual (cadangan)
        </label>
        <p className="mt-1 text-xs text-ink-700">
          Tempel isi QR: <code>WWR-TKT|nomor-reservasi|kode</code>, atau ketik 6 digit kode manual
          dari email.
        </p>
        <div className="mt-2 flex gap-2">
          <input
            id={`manual-${mode}`}
            value={manual}
            onChange={(event) => setManual(event.target.value)}
            disabled={busy || starting}
            placeholder="WWR-TKT|… atau 6 digit"
            className="min-w-0 flex-1 rounded-xl border border-forest-100 bg-white px-3 py-2.5 text-sm outline-none focus:border-forest-600 disabled:bg-sand-50"
          />
          <button
            type="submit"
            disabled={busy || starting}
            className="rounded-full border border-forest-100 px-4 py-2.5 text-sm font-semibold text-forest-700 transition hover:bg-forest-100 disabled:opacity-60"
          >
            Proses
          </button>
        </div>
      </form>
    </section>
  )
}
