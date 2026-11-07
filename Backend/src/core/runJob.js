import { allocate } from './allocator.js'
import { EMAIL_RE, buildGuideEmail, buildManagerAlertEmail } from './emailTemplate.js'
import { DEFAULT_MAX_ATTEMPTS, DEFAULT_NOTIFY_HOUR, planNotifications } from './planner.js'
import { wibDate } from './time.js'

/**
 * Satu putaran job: alokasikan pemandu (antrian) lalu kirim notifikasi H-1
 * yang sudah jatuh tempo. Aman dijalankan berulang (idempoten) — dipanggil
 * tiap jam oleh GitHub Actions, atau manual lewat `npm run notify`.
 *
 * @param {object}  deps
 * @param {object}  deps.store   { listConfirmedReservations, listGuides, updateReservation }
 * @param {object?} deps.mailer  { send(message), local? } — null berarti tidak kirim apa pun
 * @param {object}  deps.config  { managerEmail, from, notifyHour, maxAttempts, notifyMode: 'h-1' | 'segera' }
 * @param {Date}    deps.now
 * @param {boolean} deps.dryRun  tanpa menulis data; email hanya lewat mailer lokal (`local: true`)
 * @param {string[]?} deps.notifyOnly bila diisi, hanya reservasi ber-id ini yang diberi email
 *                   (alokasi tetap dihitung untuk semua). Dipakai dashboard admin
 *                   supaya Approve satu reservasi tidak mengirim ulang email lain.
 */
export async function runNotificationJob({
  store,
  mailer,
  config = {},
  now = new Date(),
  dryRun = false,
  notifyOnly = null,
  log = () => {},
}) {
  const hour = config.notifyHour ?? DEFAULT_NOTIFY_HOUR
  const maxAttempts = config.maxAttempts ?? DEFAULT_MAX_ATTEMPTS
  const mode = config.notifyMode ?? 'h-1'
  // dry-run tidak pernah menjangkau penerima nyata: hanya mailer lokal (file preview) yang dipakai.
  const sender = dryRun && !mailer?.local ? null : mailer
  const today = wibDate(now)
  const nowIso = now.toISOString()

  const summary = { today, assigned: [], unassigned: [], sent: [], failed: [], alerts: [], skipped: [] }

  const [all, guides] = await Promise.all([store.listConfirmedReservations(), store.listGuides()])
  const reservations = all.filter((r) => r.tanggal >= today)
  const guideById = new Map(guides.map((g) => [g.id, g]))
  log(`Jadwal ${today} WIB: ${reservations.length} reservasi aktif, ${guides.length} pemandu.`)

  const patch = async (reservation, fields) => {
    Object.assign(reservation, fields)
    if (!dryRun) await store.updateReservation(reservation.id, fields)
  }

  // 1) Alokasi antrian
  const { assignments, unassigned } = allocate({ reservations, guides, today })
  for (const { reservation, guide } of assignments) {
    await patch(reservation, {
      guideId: guide.id,
      guideName: guide.nama,
      guideAssignedAt: nowIso,
    })
    summary.assigned.push({ id: reservation.id, guide: guide.nama })
    log(`Alokasi ${reservation.id} -> ${guide.nama}`)
  }
  for (const { reservation, reason } of unassigned) {
    summary.unassigned.push({ id: reservation.id, reason })
    log(`Belum ada pemandu untuk ${reservation.id}: ${reason}`)
  }
  const reasonById = new Map(unassigned.map((u) => [u.reservation.id, u.reason]))

  // 2) Notifikasi yang jatuh tempo
  const plan = planNotifications({ reservations, now, hour, maxAttempts, mode })
  const only = notifyOnly ? new Set(notifyOnly) : null
  const toGuide = only ? plan.toGuide.filter((r) => only.has(r.id)) : plan.toGuide
  const toManager = only ? plan.toManager.filter((r) => only.has(r.id)) : plan.toManager

  for (const reservation of toGuide) {
    const guide = guideById.get(reservation.guideId)
    const attempts = (Number(reservation.guideNotifyAttempts) || 0) + 1

    if (!guide || !EMAIL_RE.test(guide.email ?? '')) {
      const error = 'Pemandu tidak ditemukan atau tidak punya email valid.'
      summary.failed.push({ id: reservation.id, error })
      log(`Gagal ${reservation.id}: ${error}`)
      await patch(reservation, {
        guideNotifyStatus: 'gagal',
        guideNotifyError: error,
        guideNotifyAttempts: attempts,
      })
      continue
    }

    const message = buildGuideEmail({
      reservation,
      guide,
      managerEmail: config.managerEmail,
      from: config.from,
      now,
    })

    if (!sender) {
      summary.skipped.push({ id: reservation.id, to: message.to })
      log(`[dry-run] akan kirim ke ${message.to}: ${message.subject}`)
      continue
    }

    try {
      await sender.send(message)
      summary.sent.push({ id: reservation.id, to: message.to, guide: guide.nama })
      log(`Terkirim ${reservation.id} -> ${message.to}`)
      await patch(reservation, {
        guideNotifiedAt: nowIso,
        guideNotifyStatus: 'terkirim',
        guideNotifyError: null,
        guideNotifyAttempts: attempts,
      })
    } catch (err) {
      const error = String(err?.message ?? err).slice(0, 200)
      summary.failed.push({ id: reservation.id, error })
      log(`Gagal ${reservation.id}: ${error} (akan dicoba lagi)`)
      await patch(reservation, {
        guideNotifyStatus: 'gagal',
        guideNotifyError: error,
        guideNotifyAttempts: attempts,
      })
    }
  }

  for (const reservation of toManager) {
    if (!config.managerEmail || !EMAIL_RE.test(config.managerEmail)) {
      summary.skipped.push({ id: reservation.id, to: null })
      log(`Lewati peringatan ${reservation.id}: MANAGER_EMAIL belum diisi.`)
      continue
    }
    const message = buildManagerAlertEmail({
      reservation,
      reason: reasonById.get(reservation.id),
      managerEmail: config.managerEmail,
      from: config.from,
      now,
    })

    if (!sender) {
      summary.skipped.push({ id: reservation.id, to: message.to })
      log(`[dry-run] akan memperingatkan pengelola: ${message.subject}`)
      continue
    }

    try {
      await sender.send(message)
      summary.alerts.push({ id: reservation.id, to: message.to })
      log(`Peringatan ${reservation.id} -> pengelola (${message.to})`)
      await patch(reservation, { managerAlertAt: nowIso, guideNotifyStatus: 'tanpa-pemandu' })
    } catch (err) {
      const error = String(err?.message ?? err).slice(0, 200)
      summary.failed.push({ id: reservation.id, error })
      log(`Gagal peringatan ${reservation.id}: ${error} (akan dicoba lagi)`)
    }
  }

  return summary
}
