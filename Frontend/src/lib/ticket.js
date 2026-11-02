const PREFIX = 'WWR-TKT'
const CODE_RE = /^[a-f0-9]{32}$/

export function ticketPayload(reservationId, code) {
  return `${PREFIX}|${reservationId}|${code}`
}

export function parseTicketPayload(raw) {
  const parts = String(raw ?? '').trim().split('|')
  if (parts.length !== 3 || parts[0] !== PREFIX) return null
  const [, id, code] = parts
  if (!id.startsWith('WWR-') || !CODE_RE.test(code)) return null
  return { id, code }
}

export function buildTicketUrl(origin, reservationId, code, manualCode) {
  const base = String(origin ?? '').replace(/\/+$/, '')
  const manual = /^\d{6}$/.test(String(manualCode ?? '')) ? String(manualCode) : ''
  const suffix = manual ? `&manual=${manual}` : ''
  return `${base}/tiket?data=${encodeURIComponent(ticketPayload(reservationId, code))}${suffix}`
}

export function parseManualTicketCode(raw) {
  const code = String(raw ?? '').trim().toLowerCase()
  return CODE_RE.test(code) ? code : null
}

export function parseManualCode(raw) {
  const value = String(raw ?? '').trim()
  if (/^\d{6}$/.test(value)) return value
  return parseManualTicketCode(value)
}

export function randomManualCode() {
  const value = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000
  return String(value).padStart(6, '0')
}

export function todayWIB(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(date)
}

export function randomTicketCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

// ponytail: hitung orang di dalam; keluar mengurangi, masuk menambah.
export function nextTicketState(reservation, mode, today = todayWIB()) {
  if (!reservation) return { ok: false, reason: 'Tiket tidak ditemukan.' }
  if (reservation.status !== 'dikonfirmasi') {
    return { ok: false, reason: 'Reservasi ini belum disetujui.' }
  }
  if (reservation.tanggal !== today) {
    return {
      ok: false,
      reason: `Tiket hanya berlaku pada tanggal kunjungan (${reservation.tanggal}).`,
    }
  }

  const pax = Number(reservation.pax) || 0
  const inside = Number(reservation.inside) || 0
  const entries = Number(reservation.entries) || 0
  const exits = Number(reservation.exits) || 0

  if (mode === 'masuk') {
    if (inside >= pax) {
      return {
        ok: false,
        reason: `Semua ${pax} peserta sudah berada di dalam. Scan keluar terlebih dahulu.`,
      }
    }
    return { ok: true, next: { inside: inside + 1, entries: entries + 1, exits } }
  }

  if (mode === 'keluar') {
    if (inside <= 0) {
      return { ok: false, reason: 'Tidak ada peserta di dalam yang bisa discan keluar.' }
    }
    return { ok: true, next: { inside: inside - 1, entries, exits: exits + 1 } }
  }

  return { ok: false, reason: 'Mode scan tidak dikenal.' }
}
