import { useRef, useState } from 'react'
import { submitReservation, todayISO, validateReservation } from '../lib/reservation'
import { village } from '../data/village'

const EMPTY = { nama: '', kontak: '', tanggal: '', pax: '', jenisWisata: '' }

// ponytail: dihitung sekali saat load, bukan tiap render — validasi tanggal yang
// benar-benar menentukan tetap di validateReservation() saat submit.
const MIN_DATE = (() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return todayISO(tomorrow)
})()

function formatDate(iso) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const fieldClass = (hasError) =>
  `w-full rounded-xl border px-4 py-3 text-base outline-none transition ${
    hasError
      ? 'border-clay-500 bg-clay-100/40 focus:border-clay-600'
      : 'border-forest-100 bg-white focus:border-forest-600'
  }`

export default function ReservationSection() {
  const formRef = useRef(null)
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState('')
  const [confirmation, setConfirmation] = useState(null)

  const jenisOptions = village.reservation.jenisWisata

  const setField = (name) => (event) => {
    setValues((current) => ({ ...current, [name]: event.target.value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    const nextErrors = validateReservation(values, jenisOptions)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      const firstField = Object.keys(nextErrors)[0]
      formRef.current?.querySelector(`[name="${firstField}"]`)?.focus()
      return
    }

    setSending(true)
    try {
      const entry = await submitReservation(values)
      setConfirmation(entry)
      setValues(EMPTY)
      setErrors({})
    } catch (err) {
      setFormError(err.message)
      if (err.fields) setErrors(err.fields)
    } finally {
      setSending(false)
    }
  }

  function reset() {
    setConfirmation(null)
    setFormError('')
  }

  return (
    <section id="reservasi" className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-forest-600">
            Reservasi
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium text-ink-900 sm:text-4xl">
            Amankan kedatanganmu
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-700">
            Isi data kunjunganmu di bawah ini. Kuota harian dibatasi agar sawah dan jalur
            trekking tetap lestari, jadi setiap kedatangan kami catat dan konfirmasi lebih
            dahulu.
          </p>
          <p className="mt-4 text-sm text-ink-700">
            Kunjungan wajib dipesan minimal 1 hari sebelumnya. Konfirmasi dikirim maksimal
            1x24 jam lewat kontak yang kamu berikan.
          </p>
        </div>

        {confirmation ? (
          <div
            id="konfirmasi"
            role="status"
            className="rounded-3xl border border-forest-100 bg-forest-50 p-8"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-700 text-sand-50">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="mt-4 font-display text-2xl font-medium text-forest-900">
              Menunggu Konfirmasi
            </h3>
            <p className="mt-2 text-ink-700">
              Reservasimu sudah tercatat. Tim desa akan menghubungi kamu lewat kontak yang
              diberikan untuk konfirmasi akhir.
            </p>

            <dl className="mt-6 space-y-3 rounded-2xl bg-white p-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-forest-700">Nomor reservasi</dt>
                <dd className="text-ink-900">{confirmation.id}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-forest-700">Nama</dt>
                <dd className="text-ink-900">{confirmation.nama}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-forest-700">Tanggal</dt>
                <dd className="text-ink-900">{formatDate(confirmation.tanggal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-forest-700">Jumlah orang</dt>
                <dd className="text-ink-900">{confirmation.pax} pax</dd>
              </div>
              {confirmation.jenisWisata && (
                <div className="flex justify-between gap-4">
                  <dt className="font-semibold text-forest-700">Jenis wisata</dt>
                  <dd className="text-ink-900">{confirmation.jenisWisata}</dd>
                </div>
              )}
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={reset}
                className="rounded-full bg-forest-700 px-5 py-2.5 text-sm font-semibold text-sand-50 transition hover:bg-forest-900"
              >
                Buat reservasi lain
              </button>
              <a
                href="#beranda"
                className="rounded-full border border-forest-100 px-5 py-2.5 text-sm font-semibold text-forest-700 transition hover:bg-forest-100"
              >
                Kembali ke beranda
              </a>
            </div>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
            {formError && (
              <p
                role="alert"
                className="rounded-xl border border-clay-500 bg-clay-100/60 px-4 py-3 text-sm font-medium text-clay-600"
              >
                {formError}
              </p>
            )}

            <div>
              <label htmlFor="reservasi-nama" className="text-sm font-semibold text-forest-700">
                Nama <span className="text-clay-600">*</span>
              </label>
              <input
                id="reservasi-nama"
                name="nama"
                type="text"
                value={values.nama}
                onChange={setField('nama')}
                aria-invalid={Boolean(errors.nama)}
                aria-describedby={errors.nama ? 'error-nama' : undefined}
                placeholder="Nama lengkap"
                className={`mt-1 ${fieldClass(errors.nama)}`}
              />
              {errors.nama && (
                <p id="error-nama" className="mt-1 text-sm text-clay-600">
                  {errors.nama}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="reservasi-kontak" className="text-sm font-semibold text-forest-700">
                Kontak (HP / email) <span className="text-clay-600">*</span>
              </label>
              <input
                id="reservasi-kontak"
                name="kontak"
                type="text"
                value={values.kontak}
                onChange={setField('kontak')}
                aria-invalid={Boolean(errors.kontak)}
                aria-describedby={errors.kontak ? 'error-kontak' : undefined}
                placeholder="0812… atau nama@email.com"
                className={`mt-1 ${fieldClass(errors.kontak)}`}
              />
              {errors.kontak && (
                <p id="error-kontak" className="mt-1 text-sm text-clay-600">
                  {errors.kontak}
                </p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="reservasi-tanggal"
                  className="text-sm font-semibold text-forest-700"
                >
                  Tanggal kunjungan <span className="text-clay-600">*</span>
                </label>
                <input
                  id="reservasi-tanggal"
                  name="tanggal"
                  type="date"
                  min={MIN_DATE}
                  value={values.tanggal}
                  onChange={setField('tanggal')}
                  aria-invalid={Boolean(errors.tanggal)}
                  aria-describedby={errors.tanggal ? 'error-tanggal' : undefined}
                  className={`mt-1 ${fieldClass(errors.tanggal)}`}
                />
                {errors.tanggal && (
                  <p id="error-tanggal" className="mt-1 text-sm text-clay-600">
                    {errors.tanggal}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="reservasi-pax" className="text-sm font-semibold text-forest-700">
                  Jumlah orang <span className="text-clay-600">*</span>
                </label>
                <input
                  id="reservasi-pax"
                  name="pax"
                  type="number"
                  min="1"
                  step="1"
                  value={values.pax}
                  onChange={setField('pax')}
                  aria-invalid={Boolean(errors.pax)}
                  aria-describedby={errors.pax ? 'error-pax' : undefined}
                  placeholder="2"
                  className={`mt-1 ${fieldClass(errors.pax)}`}
                />
                {errors.pax && (
                  <p id="error-pax" className="mt-1 text-sm text-clay-600">
                    {errors.pax}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="reservasi-jenis"
                className="text-sm font-semibold text-forest-700"
              >
                Jenis wisata yang diminati{' '}
                <span className="font-normal text-ink-700">(opsional)</span>
              </label>
              <select
                id="reservasi-jenis"
                name="jenisWisata"
                value={values.jenisWisata}
                onChange={setField('jenisWisata')}
                aria-invalid={Boolean(errors.jenisWisata)}
                aria-describedby={errors.jenisWisata ? 'error-jenis' : undefined}
                className={`mt-1 ${fieldClass(errors.jenisWisata)}`}
              >
                <option value="">Belum menentukan</option>
                {jenisOptions.map((jenis) => (
                  <option key={jenis} value={jenis}>
                    {jenis}
                  </option>
                ))}
              </select>
              {errors.jenisWisata && (
                <p id="error-jenis" className="mt-1 text-sm text-clay-600">
                  {errors.jenisWisata}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-full bg-forest-700 px-6 py-3.5 text-sm font-semibold text-sand-50 transition hover:bg-forest-900 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {sending ? 'Mengirim…' : 'Kirim permintaan reservasi'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
