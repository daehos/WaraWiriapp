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

const READER_ID = 'gate-qr-reader'
const TITLE = { masuk: 'Scan Masuk', keluar: 'Scan Keluar' }

export default function GateScanner({ user, mode }) {
  const [cameraOn, setCameraOn] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [manual, setManual] = useState('')
  const scannerRef = useRef(null)
  const busyRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      stopCamera(false)
    }
  }, [])

  async function stopCamera(updateState = true) {
    const scanner = scannerRef.current
    scannerRef.current = null
    if (scanner) {
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
    if (updateState && mountedRef.current) setCameraOn(false)
  }

  async function startCamera() {
    setError('')
    setResult(null)
    if (scannerRef.current) return

    const scanner = new Html5Qrcode(READER_ID, { verbose: false })
    scannerRef.current = scanner
    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => handleScan(decoded),
        () => {},
      )
      if (mountedRef.current) setCameraOn(true)
    } catch {
      scannerRef.current = null
      try {
        scanner.clear()
      } catch {
        // abaikan
      }
      if (mountedRef.current) {
        setError('Kamera tidak bisa diakses. Izinkan kamera atau pakai input manual di bawah.')
      }
    }
  }

  async function handleScan(raw) {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(true)
    await stopCamera()
    await processTicket(raw)
    busyRef.current = false
    setBusy(false)
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
    if (!value) return
    setManual('')
    handleScan(value)
  }

  const modeLabel = TITLE[mode]

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <header className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a href="/admin" className="text-sm font-semibold text-forest-700 hover:text-forest-900">
            ← Dashboard
          </a>
          <div className="flex items-center gap-3 text-sm">
            <a
              href={mode === 'masuk' ? '/admin/scan-keluar' : '/admin/scan-masuk'}
              className="font-semibold text-forest-700 hover:text-forest-900"
            >
              {mode === 'masuk' ? 'Scan Keluar' : 'Scan Masuk'}
            </a>
            <button
              type="button"
              onClick={() => signOut(auth)}
              className="font-semibold text-ink-700 hover:text-ink-900"
            >
              Keluar
            </button>
          </div>
        </div>
        <h1 className="mt-4 font-display text-3xl font-medium text-ink-900">{modeLabel}</h1>
        <p className="mt-1 text-sm text-ink-700">
          {user.email} · Berlaku untuk kunjungan {todayWIB()} (WIB)
        </p>
      </header>

      <section className="rounded-3xl border border-forest-100 bg-white p-4">
        <div
          id={READER_ID}
          className="mx-auto min-h-56 w-full max-w-sm overflow-hidden rounded-2xl bg-ink-900/5"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {!cameraOn && !busy && (
            <button
              type="button"
              onClick={startCamera}
              className="rounded-full bg-forest-700 px-5 py-2.5 text-sm font-semibold text-sand-50 transition hover:bg-forest-900"
            >
              Aktifkan kamera
            </button>
          )}
          {cameraOn && (
            <button
              type="button"
              onClick={() => stopCamera()}
              className="rounded-full border border-forest-100 px-5 py-2.5 text-sm font-semibold text-forest-700 transition hover:bg-forest-100"
            >
              Matikan kamera
            </button>
          )}
          {busy && <p className="self-center text-sm font-semibold text-forest-700">Memproses…</p>}
        </div>

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-xl border border-clay-500 bg-clay-100/60 px-4 py-3 text-sm font-medium text-clay-600"
          >
            {error}
          </p>
        )}
      </section>

      {result && (
        <div
          role="status"
          aria-live="polite"
          className={`mt-4 rounded-2xl border px-5 py-4 ${
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
          <button
            type="button"
            onClick={startCamera}
            className="mt-3 rounded-full bg-forest-700 px-4 py-2 text-xs font-semibold text-sand-50 transition hover:bg-forest-900"
          >
            Scan berikutnya
          </button>
        </div>
      )}

      <form onSubmit={submitManual} className="mt-6 rounded-2xl border border-forest-100 bg-white p-4">
        <label htmlFor="gate-manual" className="text-sm font-semibold text-forest-700">
          Input manual (cadangan)
        </label>
        <p className="mt-1 text-xs text-ink-700">
          Tempel isi QR: <code>WWR-TKT|nomor-reservasi|kode</code>, atau ketik 6 digit kode manual
          dari email.
        </p>
        <div className="mt-2 flex gap-2">
          <input
            id="gate-manual"
            value={manual}
            onChange={(event) => setManual(event.target.value)}
            placeholder="WWR-TKT|… atau 6 digit"
            className="min-w-0 flex-1 rounded-xl border border-forest-100 bg-white px-3 py-2.5 text-sm outline-none focus:border-forest-600"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-full border border-forest-100 px-4 py-2.5 text-sm font-semibold text-forest-700 transition hover:bg-forest-100 disabled:opacity-60"
          >
            Proses
          </button>
        </div>
      </form>
    </div>
  )
}
