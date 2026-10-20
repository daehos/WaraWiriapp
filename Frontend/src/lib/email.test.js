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
  assert.equal(params.is_approved, true)
  assert.equal(params.is_declined, false)
  assert.match(params.title, /WWR-20260101-120000-ABCD/)
})

test('reservasi ditolak memakai flag is_declined', () => {
  const params = buildTemplateParams({ ...base, status: 'ditolak' })
  assert.equal(params.status, 'Ditolak')
  assert.equal(params.is_approved, false)
  assert.equal(params.is_declined, true)
})

test('isEmail hanya menerima format email', () => {
  assert.equal(isEmail('budi@example.com'), true)
  assert.equal(isEmail('081234567890'), false)
  assert.equal(isEmail(undefined), false)
})
