import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { parseTicketPayload } from '../lib/ticket'

const params = new URLSearchParams(window.location.search)
const raw = (params.get('data') ?? '').trim()
const ticket = parseTicketPayload(raw)
const manualParam = (params.get('manual') ?? '').trim()
const manualCode = /^\d{6}$/.test(manualParam) ? manualParam : ''
const displayCode = manualCode || ticket?.code || ''

export default function Ticket() {
  const canvasRef = useRef(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!ticket || !canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, raw, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#1f3d2b', light: '#ffffff' },
    }).catch(() => setError('QR gagal dibuat. Coba muat ulang halaman ini.'))
  }, [])

  function downloadQr() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `tiket-${ticket.id}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(displayCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Tidak bisa menyalin otomatis. Pilih kode di bawah secara manual.')
    }
  }

  if (!ticket) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16">
        <p className="rounded-2xl border border-clay-500 bg-clay-100/60 px-5 py-4 text-sm font-medium text-clay-600">
          Link tiket tidak valid. Pastikan link dibuka persis seperti yang ada di email konfirmasi.
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <header className="text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-forest-700 uppercase">
          WaraWiri Village
        </p>
        <h1 className="mt-2 font-display text-3xl font-medium text-ink-900">Tiket Kunjungan</h1>
        <p className="mt-2 text-sm text-ink-700">
          Tunjukkan QR ini ke petugas di pintu masuk atau keluar.
        </p>
      </header>

      <section className="mt-8 rounded-3xl border border-forest-100 bg-white p-6 text-center">
        <canvas ref={canvasRef} className="mx-auto block w-full max-w-[320px]" />
        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-clay-600">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={downloadQr}
          className="mt-5 rounded-full bg-forest-700 px-5 py-2.5 text-sm font-semibold text-sand-50 transition hover:bg-forest-900"
        >
          Unduh QR
        </button>
        <p className="mt-3 text-xs text-ink-700">
          Simpan atau screenshot QR ini sebelum berangkat, karena lokasi kunjungan mungkin tanpa
          internet.
        </p>
      </section>

      <section className="mt-5 rounded-2xl border border-forest-100 bg-sand-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-forest-700">
            {manualCode ? 'Kode manual (6 digit)' : 'Kode manual'}
          </h2>
          <button
            type="button"
            onClick={copyCode}
            className="rounded-full border border-forest-100 px-3 py-1.5 text-xs font-semibold text-forest-700 transition hover:bg-forest-100"
          >
            {copied ? 'Tersalin' : 'Salin kode'}
          </button>
        </div>
        <p className="mt-2 text-xs text-ink-700">
          {manualCode
            ? 'Jika kamera petugas tidak bisa memindai QR, tunjukkan 6 digit ini untuk diinput manual.'
            : 'Jika kamera petugas tidak bisa memindai QR, gunakan kode manual yang tertera di email.'}
        </p>
        <code className="mt-3 block break-all rounded-xl bg-white px-3 py-2 text-xs text-ink-900">
          {displayCode}
        </code>
      </section>

      <p className="mt-6 text-center text-xs text-ink-700">
        Tiket hanya berlaku pada tanggal kunjungan yang tertera di email. QR dapat dipakai
        keluar-masuk selama jumlah orang di dalam tidak melebihi jumlah peserta.
      </p>
    </main>
  )
}
