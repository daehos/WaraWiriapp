import assert from 'node:assert/strict'
import { test } from 'node:test'
import { resultFor } from './result.js'

const empty = { sent: [], failed: [], unassigned: [], assigned: [], alerts: [] }

test('resultFor memetakan ringkasan job ke satu reservasi', () => {
  assert.deepEqual(resultFor('R', { ...empty, sent: [{ id: 'R', guide: 'Asep', to: 'a@x.id' }] }), {
    status: 'terkirim',
    guide: 'Asep',
    to: 'a@x.id',
  })
  assert.equal(resultFor('R', { ...empty, failed: [{ id: 'R', error: 'x' }] }).status, 'gagal')
  assert.deepEqual(
    resultFor('R', { ...empty, unassigned: [{ id: 'R', reason: 'penuh' }], alerts: [{ id: 'R' }] }),
    { status: 'tanpa-pemandu', reason: 'penuh', managerNotified: true },
  )
  assert.equal(resultFor('R', { ...empty, assigned: [{ id: 'R', guide: 'Asep' }] }).status, 'menunggu')
  assert.equal(resultFor('R', empty).status, 'tidak-berubah')
})
