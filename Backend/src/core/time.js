// Semua logika jadwal memakai WIB (Asia/Jakarta, UTC+7, tanpa DST) karena
// kunjungan dan jam kerja pemandu mengikuti waktu desa, bukan waktu server.
const WIB_OFFSET = '+07:00'

const pad = (n) => String(n).padStart(2, '0')

// Tanggal kalender WIB sebagai YYYY-MM-DD.
export function wibDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(now)
}

// Geser tanggal kalender (YYYY-MM-DD) sebanyak n hari.
export function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

// Instan absolut untuk "tanggal iso jam hour:00 WIB".
export function wibInstant(iso, hour = 0) {
  return new Date(`${iso}T${pad(hour)}:00:00${WIB_OFFSET}`)
}

// Jendela pengiriman notifikasi: dibuka H-1 pukul `hour` WIB, ditutup saat
// hari kunjungan berakhir (00:00 WIB hari berikutnya). Reservasi yang baru
// disetujui setelah jendela dibuka tetap terkirim di run berikutnya.
export function notifyWindow(tanggal, hour = 7) {
  return {
    start: wibInstant(addDays(tanggal, -1), hour),
    end: wibInstant(addDays(tanggal, 1), 0),
  }
}

export function formatTanggalID(iso) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`))
}

export function formatJamWIB(date) {
  return `${new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  })
    .format(date)
    .replace('.', ':')} WIB`
}
