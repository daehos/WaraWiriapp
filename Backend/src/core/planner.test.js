import assert from 'node:assert/strict'
import { test } from 'node:test'
import { inNotifyWindow, planNotifications } from './planner.js'
import { addDays, notifyWindow, wibDate } from './time.js'

const wib = (iso) => new Date(iso) // iso harus menyertakan +07:00

const base = { id: 'R1', status: 'dikonfirmasi', tanggal: '2026-11-05', guideId: 'g1' }

test('tanggal WIB: lewat tengah malam WIB sudah hari berikutnya meski masih hari lama di UTC', () => {
  assert.equal(wibDate(new Date('2026-11-04T17:30:00Z')), '2026-11-05')
  assert.equal(wibDate(new Date('2026-11-04T16:30:00Z')), '2026-11-04')
  assert.equal(addDays('2026-12-31', 1), '2027-01-01')
})

test('jendela notifikasi: H-1 pukul 07:00 WIB sampai akhir hari kunjungan', () => {
  const { start, end } = notifyWindow('2026-11-05', 7)
  assert.equal(start.toISOString(), '2026-11-04T00:00:00.000Z') // 07:00 WIB
  assert.equal(end.toISOString(), '2026-11-05T17:00:00.000Z') // 00:00 WIB tanggal 6
})

test('belum terkirim sebelum H-1 07:00 WIB', () => {
  const now = wib('2026-11-04T06:59:00+07:00')
  assert.equal(inNotifyWindow(base, now), false)
  assert.deepEqual(planNotifications({ reservations: [base], now }).toGuide, [])
})

test('terkirim tepat saat jendela H-1 dibuka', () => {
  const now = wib('2026-11-04T07:00:00+07:00')
  assert.deepEqual(planNotifications({ reservations: [base], now }).toGuide, [base])
})

test('persetujuan terlambat (setelah jam 07:00 H-1) tetap masuk pada run berikutnya', () => {
  const now = wib('2026-11-04T21:00:00+07:00')
  assert.equal(planNotifications({ reservations: [base], now }).toGuide.length, 1)
})

test('sudah terkirim tidak dikirim lagi (idempoten)', () => {
  const now = wib('2026-11-04T08:00:00+07:00')
  const sent = { ...base, guideNotifiedAt: '2026-11-04T00:05:00.000Z' }
  assert.deepEqual(planNotifications({ reservations: [sent], now }).toGuide, [])
})

test('gagal dicoba ulang sampai batas percobaan', () => {
  const now = wib('2026-11-04T08:00:00+07:00')
  const retry = { ...base, guideNotifyAttempts: 4 }
  const stop = { ...base, guideNotifyAttempts: 5 }
  assert.equal(planNotifications({ reservations: [retry], now, maxAttempts: 5 }).toGuide.length, 1)
  assert.equal(planNotifications({ reservations: [stop], now, maxAttempts: 5 }).toGuide.length, 0)
})

test('tanpa pemandu: pengelola diberi tahu sekali saja', () => {
  const now = wib('2026-11-04T08:00:00+07:00')
  const noGuide = { ...base, guideId: undefined }
  assert.equal(planNotifications({ reservations: [noGuide], now }).toManager.length, 1)
  const alerted = { ...noGuide, managerAlertAt: '2026-11-04T01:00:00.000Z' }
  assert.equal(planNotifications({ reservations: [alerted], now }).toManager.length, 0)
})

test('hanya reservasi dikonfirmasi; lewat hari kunjungan tidak dikirim', () => {
  const now = wib('2026-11-04T08:00:00+07:00')
  assert.equal(
    planNotifications({ reservations: [{ ...base, status: 'ditolak' }], now }).toGuide.length,
    0,
  )
  const after = wib('2026-11-06T00:00:00+07:00')
  assert.equal(planNotifications({ reservations: [base], now: after }).toGuide.length, 0)
})

test("mode 'segera': terkirim begitu disetujui, walau kunjungan masih jauh; tetap berhenti setelah hari kunjungan", () => {
  const far = { ...base, tanggal: '2026-12-20' }
  const now = wib('2026-11-04T10:00:00+07:00') // jauh sebelum H-1
  assert.equal(planNotifications({ reservations: [far], now }).toGuide.length, 0) // default h-1
  assert.equal(planNotifications({ reservations: [far], now, mode: 'segera' }).toGuide.length, 1)
  const after = wib('2026-12-21T00:00:00+07:00')
  assert.equal(planNotifications({ reservations: [far], now: after, mode: 'segera' }).toGuide.length, 0)
})
