export const STATUS_LABEL = {
  'menunggu-konfirmasi': 'Menunggu',
  dikonfirmasi: 'Disetujui',
  ditolak: 'Ditolak',
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
