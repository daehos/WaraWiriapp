// Antrian alokasi pemandu (murni, tanpa I/O — mudah dites).
//
// Aturan:
//  1. Reservasi dilayani berurutan menurut waktu disetujui (FIFO).
//  2. Pemandu harus aktif dan menguasai destinasi (daftar kosong = semua).
//     Reservasi tanpa destinasi boleh dilayani pemandu mana pun.
//  3. Satu pemandu dibatasi `maxGroups` rombongan per hari; kalau penuh,
//     rombongan otomatis dioper ke pemandu berikutnya yang masih tersedia.
//  4. Satu pemandu tidak boleh memegang dua rombongan di slot waktu yang sama.
//  5. Di antara yang memenuhi syarat, pilih pemandu dengan prioritas tertinggi
//     (`urutan` terkecil, lalu nama): satu pemandu diisi sampai penuh dulu,
//     baru rombongan berikutnya dioper ke pemandu lain.

// Batas default bila data pemandu tidak menyebutkan `maxGroups`.
export const DEFAULT_MAX_GROUPS = 3

export const approvedAt = (r) => r.ticketIssuedAt ?? r.createdAt ?? ''

export function byQueueOrder(a, b) {
  return approvedAt(a).localeCompare(approvedAt(b)) || String(a.id).localeCompare(String(b.id))
}

export function maxGroupsOf(guide) {
  const n = Number(guide.maxGroups)
  return Number.isInteger(n) && n > 0 ? n : DEFAULT_MAX_GROUPS
}

export function guideHandles(guide, reservation) {
  const destinasi = guide.destinasi ?? []
  return (
    destinasi.length === 0 ||
    !reservation.jenisWisata ||
    destinasi.includes(reservation.jenisWisata)
  )
}

const dayKey = (guideId, tanggal) => `${guideId}|${tanggal}`
const slotKey = (guideId, r) => `${guideId}|${r.tanggal}|${r.waktu}`

/**
 * @param {object}   input
 * @param {object[]} input.reservations reservasi berstatus dikonfirmasi
 * @param {object[]} input.guides       dokumen pemandu ({ id, nama, destinasi, maxGroups, aktif, urutan })
 * @param {string}   input.today        YYYY-MM-DD (WIB); reservasi lampau diabaikan
 * @returns {{ assignments: {reservation, guide}[], unassigned: {reservation, reason}[] }}
 */
export function allocate({ reservations, guides, today }) {
  const active = guides
    .filter((g) => g.aktif !== false)
    .sort(
      (a, b) =>
        (Number(a.urutan) || 0) - (Number(b.urutan) || 0) ||
        String(a.nama).localeCompare(String(b.nama)),
    )
  const activeIds = new Set(active.map((g) => g.id))

  const load = new Map()
  const slots = new Set()
  const take = (guideId, r) => {
    load.set(dayKey(guideId, r.tanggal), (load.get(dayKey(guideId, r.tanggal)) ?? 0) + 1)
    if (r.waktu) slots.add(slotKey(guideId, r))
  }

  // Penugasan yang sudah ada dipertahankan (idempoten) dan dihitung sebagai beban.
  // Pengecualian: pemandu yang kini nonaktif/dihapus dan belum sempat diberi
  // notifikasi, supaya rombongannya dialokasikan ulang.
  const queue = []
  for (const r of reservations) {
    if (r.tanggal < today) continue
    const keep = r.guideId && (r.guideNotifiedAt || activeIds.has(r.guideId))
    if (keep) take(r.guideId, r)
    else queue.push(r)
  }
  queue.sort(byQueueOrder)

  const assignments = []
  const unassigned = []

  for (const r of queue) {
    const matching = active.filter((g) => guideHandles(g, r))
    if (matching.length === 0) {
      unassigned.push({ reservation: r, reason: 'Tidak ada pemandu aktif untuk destinasi ini.' })
      continue
    }

    const underLimit = matching.filter(
      (g) => (load.get(dayKey(g.id, r.tanggal)) ?? 0) < maxGroupsOf(g),
    )
    if (underLimit.length === 0) {
      unassigned.push({
        reservation: r,
        reason: 'Semua pemandu untuk destinasi ini sudah mencapai batas rombongan hari itu.',
      })
      continue
    }

    const free = underLimit.filter((g) => !r.waktu || !slots.has(slotKey(g.id, r)))
    if (free.length === 0) {
      unassigned.push({
        reservation: r,
        reason: 'Semua pemandu yang tersedia sudah bertugas di slot waktu yang sama.',
      })
      continue
    }

    // `free` sudah terurut menurut prioritas (`urutan`): isi satu pemandu sampai
    // penuh dulu, baru oper ke pemandu berikutnya.
    const pick = free[0]
    take(pick.id, r)
    assignments.push({ reservation: r, guide: pick })
  }

  return { assignments, unassigned }
}
