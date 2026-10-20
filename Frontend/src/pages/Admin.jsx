import { useEffect, useRef, useState } from 'react'
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { STATUS_LABEL, filterReservations } from '../lib/admin'
import { auth, db } from '../lib/firebase'
import { todayISO } from '../lib/reservation'

const AUTH_ERROR = {
  'auth/invalid-credential': 'Email atau password salah.',
  'auth/wrong-password': 'Email atau password salah.',
  'auth/user-not-found': 'Email atau password salah.',
  'auth/invalid-email': 'Format email tidak valid.',
  'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.',
  'auth/configuration-not-found':
    'Login email/password belum diaktifkan di Firebase Console.',
  'auth/network-request-failed': 'Koneksi bermasalah. Coba lagi.',
}

const authMessage = (err) => AUTH_ERROR[err.code] ?? 'Terjadi kesalahan. Coba lagi.'

const BADGE = {
  'menunggu-konfirmasi': 'bg-sand-100 text-ink-700',
  dikonfirmasi: 'bg-forest-100 text-forest-700',
  ditolak: 'bg-clay-100 text-clay-600',
}

const inputClass =
  'mt-1 w-full rounded-xl border border-forest-100 bg-white px-4 py-3 text-base outline-none transition focus:border-forest-600'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
    } catch (err) {
      setError(authMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function resetPassword() {
    setError('')
    setInfo('')
    if (!email.trim()) {
      setError('Isi email terlebih dahulu, lalu klik lupa password.')
      return
    }
    setBusy(true)
    try {
      await sendPasswordResetEmail(auth, email.trim())
      setInfo('Link reset password sudah dikirim ke email tersebut.')
    } catch (err) {
      setError(authMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <a
        href="/"
        className="mb-8 text-sm font-semibold text-forest-700 hover:text-forest-900"
      >
        ← Kembali ke situs
      </a>
      <div className="rounded-3xl border border-forest-100 bg-white p-8">
        <h1 className="font-display text-2xl font-medium text-ink-900">Login Admin</h1>
        <p className="mt-2 text-sm text-ink-700">Dashboard reservasi WaraWiri Village.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-clay-500 bg-clay-100/60 px-4 py-3 text-sm font-medium text-clay-600"
            >
              {error}
            </p>
          )}
          {info && (
            <p
              role="status"
              className="rounded-xl border border-forest-100 bg-forest-50 px-4 py-3 text-sm font-medium text-forest-700"
            >
              {info}
            </p>
          )}

          <div>
            <label htmlFor="admin-email" className="text-sm font-semibold text-forest-700">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="text-sm font-semibold text-forest-700">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-forest-700 px-6 py-3 text-sm font-semibold text-sand-50 transition hover:bg-forest-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Memproses…' : 'Masuk'}
          </button>

          <button
            type="button"
            onClick={resetPassword}
            disabled={busy}
            className="w-full text-sm font-semibold text-forest-700 hover:text-forest-900 disabled:opacity-60"
          >
            Lupa password? Kirim link reset ke email
          </button>
        </form>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-forest-100 bg-white p-5">
      <p className="text-sm text-ink-700">{label}</p>
      <p className="mt-1 font-display text-2xl font-medium text-ink-900">{value}</p>
    </div>
  )
}

function Dashboard({ user }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [tanggal, setTanggal] = useState('')
  const [savingId, setSavingId] = useState('')
  const [notice, setNotice] = useState(null)
  const [quotaTanggal, setQuotaTanggal] = useState(todayISO())
  const [quotaLimit, setQuotaLimit] = useState(100)
  const [quotaUsed, setQuotaUsed] = useState(0)
  const [quotaError, setQuotaError] = useState(false)
  const [quotaNotice, setQuotaNotice] = useState(null)
  const [quotaBusy, setQuotaBusy] = useState(false)
  const quotaEdited = useRef(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        // paksa token segar supaya claim admin yang baru dipasang langsung berlaku
        await user.getIdToken(true)
        const snap = await getDocs(
          query(collection(db, 'reservations'), orderBy('createdAt', 'desc')),
        )
        if (active) setRows(snap.docs.map((d) => d.data()))
      } catch (err) {
        if (active) {
          setError(
            err.code === 'permission-denied'
              ? 'Akun ini tidak punya akses admin. Jalankan npm run make-admin untuk email ini.'
              : 'Gagal memuat reservasi. Muat ulang halaman untuk mencoba lagi.',
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [user])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const snap = await getDoc(doc(db, 'quotas', quotaTanggal))
        if (!active) return
        setQuotaError(false)
        setQuotaUsed(snap.exists() ? Number(snap.data().used ?? 0) : 0)
        if (!quotaEdited.current) {
          setQuotaLimit(snap.exists() ? Number(snap.data().limit) : 100)
        }
      } catch {
        if (active) setQuotaError(true)
      }
    })()
    return () => {
      active = false
    }
  }, [quotaTanggal])

  const filtered = filterReservations(rows, { q, tanggal })
  const totalPax = filtered.reduce((sum, r) => sum + (Number(r.pax) || 0), 0)
  const count = (status) => filtered.filter((r) => r.status === status).length

  async function setStatus(id, status) {
    setSavingId(id)
    setError('')
    setNotice(null)
    try {
      if (status === 'ditolak') {
        // tolak = kembalikan kuota; status + counter ditulis atomik.
        await runTransaction(db, async (tx) => {
          const rRef = doc(db, 'reservations', id)
          const rSnap = await tx.get(rRef)
          if (!rSnap.exists()) throw new Error('Reservasi tidak ditemukan.')
          const data = rSnap.data()
          const qRef = doc(db, 'quotas', data.tanggal)
          const qSnap = await tx.get(qRef)
          const limit = qSnap.exists() ? Number(qSnap.data().limit) || 100 : 100
          const used = qSnap.exists() ? Number(qSnap.data().used ?? 0) : 0
          tx.update(rRef, { status })
          if (data.status !== 'ditolak') {
            tx.set(
              qRef,
              {
                tanggal: data.tanggal,
                limit,
                used: Math.max(0, used - (Number(data.pax) || 0)),
              },
              { merge: true },
            )
          }
        })
      } else {
        await updateDoc(doc(db, 'reservations', id), { status })
      }
      setRows((current) => current.map((r) => (r.id === id ? { ...r, status } : r)))
      const q = await getDoc(doc(db, 'quotas', quotaTanggal)).catch(() => null)
      if (q) setQuotaUsed(q.exists() ? Number(q.data().used ?? 0) : 0)
    } catch {
      setError('Gagal menyimpan perubahan status. Coba lagi.')
      setSavingId('')
      return
    }
    setSavingId('')

    // ponytail: email best-effort lewat backend; status tetap tersimpan walau gagal.
    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.sent) {
        setNotice({ ok: true, text: `Status tersimpan. Email notifikasi terkirim ke ${data.to}.` })
      } else {
        setNotice({
          ok: false,
          text: `Status tersimpan, email tidak terkirim: ${data.reason ?? data.error ?? 'backend tidak terjangkau'}`,
        })
      }
    } catch {
      setNotice({
        ok: false,
        text: 'Status tersimpan, tetapi layanan email tidak terjangkau (backend tidak berjalan?).',
      })
    }
  }

  async function saveQuota(event) {
    event.preventDefault()
    setQuotaNotice(null)
    setQuotaBusy(true)
    const limit = Number(quotaLimit)
    try {
      await setDoc(
        doc(db, 'quotas', quotaTanggal),
        { tanggal: quotaTanggal, limit },
        { merge: true },
      )
      setQuotaNotice({ ok: true, text: `Kuota ${quotaTanggal} diset ${limit} orang.` })
    } catch {
      setQuotaNotice({ ok: false, text: 'Gagal menyimpan kuota. Pastikan akun ini admin.' })
    } finally {
      setQuotaBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-ink-900">
            Dashboard Reservasi
          </h1>
          <p className="mt-1 text-sm text-ink-700">Masuk sebagai {user.email}</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/"
            className="rounded-full border border-forest-100 px-5 py-2.5 text-sm font-semibold text-forest-700 transition hover:bg-forest-100"
          >
            Lihat situs
          </a>
          <button
            type="button"
            onClick={() => signOut(auth)}
            className="rounded-full bg-forest-700 px-5 py-2.5 text-sm font-semibold text-sand-50 transition hover:bg-forest-900"
          >
            Keluar
          </button>
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <Stat label="Menunggu" value={count('menunggu-konfirmasi')} />
        <Stat label="Disetujui" value={count('dikonfirmasi')} />
        <Stat label="Ditolak" value={count('ditolak')} />
        <Stat label="Total peserta" value={totalPax} />
      </div>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-clay-500 bg-clay-100/60 px-4 py-3 text-sm font-medium text-clay-600"
        >
          {error}
        </p>
      )}

      {notice && (
        <p
          role="status"
          className={`mt-6 rounded-xl border px-4 py-3 text-sm font-medium ${
            notice.ok
              ? 'border-forest-100 bg-forest-50 text-forest-700'
              : 'border-clay-500 bg-clay-100/60 text-clay-600'
          }`}
        >
          {notice.text}
        </p>
      )}

      <section className="mt-6 rounded-2xl border border-forest-100 bg-white p-5">
        <h2 className="font-display text-lg font-medium text-ink-900">Kuota per tanggal</h2>
        <p className="mt-1 text-sm text-ink-700">
          Default 100 orang. Reservasi berstatus ditolak tidak dihitung.
        </p>
        <form onSubmit={saveQuota} className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="admin-quota-tanggal" className="text-sm font-semibold text-forest-700">
              Tanggal kunjungan
            </label>
            <input
              id="admin-quota-tanggal"
              type="date"
              required
              value={quotaTanggal}
              onChange={(event) => {
                setQuotaTanggal(event.target.value)
                setQuotaNotice(null)
                quotaEdited.current = false
              }}
              className={inputClass}
            />
          </div>
          <div className="w-32">
            <label htmlFor="admin-quota-limit" className="text-sm font-semibold text-forest-700">
              Kuota (orang)
            </label>
            <input
              id="admin-quota-limit"
              type="number"
              min="1"
              required
              value={quotaLimit}
              onChange={(event) => {
                setQuotaLimit(event.target.value)
                quotaEdited.current = true
              }}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={quotaBusy}
            className="rounded-full bg-forest-700 px-5 py-3 text-sm font-semibold text-sand-50 transition hover:bg-forest-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {quotaBusy ? 'Menyimpan…' : 'Simpan kuota'}
          </button>
        </form>
        {quotaError ? (
          <p className="mt-3 text-sm text-ink-700">
            Gagal memuat kuota. Pastikan akun ini admin.
          </p>
        ) : (
          <p className="mt-3 text-sm text-ink-700">
            Terpakai {quotaUsed} dari {quotaLimit} orang (
            {Math.max(0, Number(quotaLimit) - quotaUsed)} tersisa).
          </p>
        )}
        {quotaNotice && (
          <p
            role="status"
            className={`mt-3 rounded-xl border px-4 py-3 text-sm font-medium ${
              quotaNotice.ok
                ? 'border-forest-100 bg-forest-50 text-forest-700'
                : 'border-clay-500 bg-clay-100/60 text-clay-600'
            }`}
          >
            {quotaNotice.text}
          </p>
        )}
      </section>

      <div className="mt-6 flex flex-wrap items-end gap-4">
        <div className="min-w-56 flex-1">
          <label htmlFor="admin-search" className="text-sm font-semibold text-forest-700">
            Cari wisatawan
          </label>
          <input
            id="admin-search"
            type="search"
            placeholder="Nama atau kontak…"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="admin-filter-tanggal" className="text-sm font-semibold text-forest-700">
            Tanggal kunjungan
          </label>
          <input
            id="admin-filter-tanggal"
            type="date"
            value={tanggal}
            onChange={(event) => setTanggal(event.target.value)}
            className={inputClass}
          />
        </div>
        {(q || tanggal) && (
          <button
            type="button"
            onClick={() => {
              setQ('')
              setTanggal('')
            }}
            className="pb-3 text-sm font-semibold text-forest-700 hover:text-forest-900"
          >
            Reset filter
          </button>
        )}
      </div>

      {loading ? (
        <p className="mt-10 text-center text-ink-700">Memuat data reservasi…</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-forest-100 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-forest-50 text-forest-700">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Kontak</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Pax</th>
                <th className="px-4 py-3">Jenis wisata</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-forest-100">
                  <td className="px-4 py-3 font-semibold text-ink-900">{r.nama}</td>
                  <td className="px-4 py-3 text-ink-700">{r.kontak}</td>
                  <td className="px-4 py-3 text-ink-700">{r.tanggal}</td>
                  <td className="px-4 py-3 text-ink-700">{r.pax}</td>
                  <td className="px-4 py-3 text-ink-700">{r.jenisWisata ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        BADGE[r.status] ?? 'bg-sand-100 text-ink-700'
                      }`}
                    >
                      {STATUS_LABEL[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.status === 'menunggu-konfirmasi' ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={savingId === r.id}
                          onClick={() => setStatus(r.id, 'dikonfirmasi')}
                          className="rounded-full bg-forest-700 px-4 py-1.5 text-xs font-semibold text-sand-50 transition hover:bg-forest-900 disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={savingId === r.id}
                          onClick={() => setStatus(r.id, 'ditolak')}
                          className="rounded-full border border-clay-500 px-4 py-1.5 text-xs font-semibold text-clay-600 transition hover:bg-clay-100 disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-ink-700">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center text-ink-700">
                    Tidak ada reservasi yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function Admin() {
  const [user, setUser] = useState(undefined)

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  if (user === undefined) {
    return <p className="p-10 text-center text-ink-700">Memuat…</p>
  }

  return (
    <div className="min-h-screen bg-sand-50">
      {user ? <Dashboard user={user} /> : <Login />}
    </div>
  )
}
