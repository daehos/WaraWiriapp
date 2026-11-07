import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildTemplateParams, isEmail } from './email.js'

const base = {
  id: 'WWR-20260101-120000-ABCD',
  nama: 'Budi',
  tanggal: '2026-11-10',
  pax: 2,
}

test('reservasi disetujui memakai flag is_approved', () => {
  const params = buildTemplateParams({ ...base, status: 'dikonfirmasi' })
  assert.equal(params.status, 'Disetujui')
  assert.equal(params.is_approved, 'true')
  assert.equal(params.is_declined, '')
  assert.match(params.title, /WWR-20260101-120000-ABCD/)
})

test('reservasi ditolak memakai flag is_declined', () => {
  const params = buildTemplateParams({ ...base, status: 'ditolak' })
  assert.equal(params.status, 'Ditolak')
  assert.equal(params.is_approved, '')
  assert.equal(params.is_declined, 'true')
})

test('waktu kunjungan memakai slot reservasi, dengan fallback untuk data lama', () => {
  const withSlot = buildTemplateParams({ ...base, status: 'dikonfirmasi', waktu: '08:00 – 10:00' })
  assert.equal(withSlot.waktu_kunjungan, '08:00 – 10:00 WIB')
  const legacy = buildTemplateParams({ ...base, status: 'dikonfirmasi' })
  assert.equal(legacy.waktu_kunjungan, 'Sesuai jam operasional')
})

test('isEmail hanya menerima format email', () => {
  assert.equal(isEmail('budi@example.com'), true)
  assert.equal(isEmail('081234567890'), false)
  assert.equal(isEmail(undefined), false)
})
