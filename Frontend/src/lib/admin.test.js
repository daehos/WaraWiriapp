import assert from 'node:assert/strict'
import { test } from 'node:test'
import { filterReservations } from './admin.js'

const rows = [
  { id: '1', nama: 'Budi Santoso', kontak: '081234567890', tanggal: '2026-11-01' },
  { id: '2', nama: 'Siti Aminah', kontak: 'budi@mail.com', tanggal: '2026-11-02' },
]

test('pencarian mencocokkan nama dan kontak, case-insensitive', () => {
  assert.deepEqual(filterReservations(rows, { q: 'budi' }).map((r) => r.id), ['1', '2'])
  assert.deepEqual(filterReservations(rows, { q: 'SITI' }).map((r) => r.id), ['2'])
  assert.equal(filterReservations(rows, { q: 'zzz' }).length, 0)
})

test('filter tanggal bisa digabung dengan pencarian', () => {
  assert.deepEqual(filterReservations(rows, { tanggal: '2026-11-02' }).map((r) => r.id), ['2'])
  assert.deepEqual(
    filterReservations(rows, { q: 'budi', tanggal: '2026-11-01' }).map((r) => r.id),
    ['1'],
  )
})

test('tanpa filter mengembalikan semua data', () => {
  assert.equal(filterReservations(rows).length, 2)
})
