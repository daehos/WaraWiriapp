export const STATUS_LABEL = {
  'menunggu-konfirmasi': 'Menunggu',
  dikonfirmasi: 'Disetujui',
  ditolak: 'Ditolak',
}

// Status penugasan pemandu + notifikasi H-1, ditulis oleh job di Backend
// (lihat Backend/src/core/runJob.js). Kolom ini hanya menampilkannya.
export function guideNotifyInfo(r) {
  if (r.status !== 'dikonfirmasi') return { label: '—', tone: 'muted' }
  if (r.guideNotifiedAt) return { label: 'Notifikasi terkirim', tone: 'ok' }
  if (r.guideNotifyStatus === 'gagal') return { label: 'Email gagal, dicoba ulang', tone: 'warn' }
  if (!r.guideId) {
    return r.guideNotifyStatus === 'tanpa-pemandu'
      ? { label: 'Belum ada pemandu (manajer diberi tahu)', tone: 'warn' }
      : { label: 'Menunggu alokasi', tone: 'muted' }
  }
  return { label: 'Ditugaskan, email belum terkirim', tone: 'muted' }
}

const collator = new Intl.Collator('id', { sensitivity: 'base', numeric: true })

export const SORT_VALUE = {
  nama: (r) => r.nama ?? '',
  kontak: (r) => r.kontak ?? '',
  tanggal: (r) => r.tanggal ?? '',
  waktu: (r) => r.waktu ?? '',
  pemandu: (r) => r.guideName ?? '',
  pax: (r) => Number(r.pax) || 0,
  jenisWisata: (r) => r.jenisWisata ?? '',
  status: (r) => STATUS_LABEL[r.status] ?? r.status ?? '',
}

export function sortReservations(reservations, sorts = []) {
  const active = sorts.filter((sort) => SORT_VALUE[sort.key])
  return [...reservations].sort((a, b) => {
    for (const { key, dir } of active) {
      const cmp = collator.compare(
        String(SORT_VALUE[key](a)),
        String(SORT_VALUE[key](b)),
      )
      if (cmp !== 0) return dir === 'desc' ? -cmp : cmp
    }
    return 0
  })
}

export function filterReservations(reservations, { q = '', tanggal = '' } = {}) {
  const needle = q.trim().toLowerCase()
  return reservations.filter((r) => {
    if (tanggal && r.tanggal !== tanggal) return false
    if (!needle) return true
    return (
      r.nama.toLowerCase().includes(needle) || r.kontak.toLowerCase().includes(needle)
    )
  })
}
