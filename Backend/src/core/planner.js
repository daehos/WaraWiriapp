import { notifyWindow } from './time.js'

export const DEFAULT_NOTIFY_HOUR = 7
export const DEFAULT_MAX_ATTEMPTS = 5

// Mode pengiriman:
//  - 'h-1'   (produksi): mulai H-1 pukul `hour` WIB, sesuai kartu PBI-5.
//  - 'segera' (simulasi/demo): begitu reservasi disetujui dan pemandu terpilih,
//             tanpa menunggu H-1. Batas akhir (akhir hari kunjungan) tetap berlaku.
export const NOTIFY_MODES = ['h-1', 'segera']

export function inNotifyWindow(reservation, now, hour = DEFAULT_NOTIFY_HOUR, mode = 'h-1') {
  const { start, end } = notifyWindow(reservation.tanggal, hour)
  return (mode === 'segera' || now >= start) && now < end
}

/**
 * Tentukan email apa yang harus dikirim saat ini. Murni dan idempoten: field
 * `guideNotifiedAt` / `managerAlertAt` yang ditulis job mencegah kirim ganda.
 *
 * - toGuide:   sudah ada pemandu, jendela H-1 terbuka, belum pernah terkirim,
 *              dan belum melewati batas percobaan (kegagalan SMTP dicoba ulang).
 * - toManager: jendela terbuka tapi belum ada pemandu — pengelola diberi tahu
 *              sekali supaya bisa menangani manual.
 */
export function planNotifications({
  reservations,
  now,
  hour = DEFAULT_NOTIFY_HOUR,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  mode = 'h-1',
}) {
  const toGuide = []
  const toManager = []

  for (const r of reservations) {
    if (r.status !== 'dikonfirmasi') continue
    if (!inNotifyWindow(r, now, hour, mode)) continue

    if (r.guideId) {
      if (!r.guideNotifiedAt && (Number(r.guideNotifyAttempts) || 0) < maxAttempts) {
        toGuide.push(r)
      }
    } else if (!r.managerAlertAt) {
      toManager.push(r)
    }
  }

  return { toGuide, toManager }
}
