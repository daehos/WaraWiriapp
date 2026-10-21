import assert from 'node:assert/strict'
import { test } from 'node:test'
import { filterReservations, sortReservations } from './admin.js'

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

test('sortir satu kolom naik dan turun', () => {
  const data = [
    { id: '1', nama: 'Budi', tanggal: '2026-11-02', pax: 3 },
    { id: '2', nama: 'Ani', tanggal: '2026-11-01', pax: 10 },
    { id: '3', nama: 'Cici', tanggal: '2026-11-01', pax: 2 },
  ]
  assert.deepEqual(
    sortReservations(data, [{ key: 'tanggal', dir: 'asc' }]).map((r) => r.id),
    ['2', '3', '1'],
  )
  assert.deepEqual(
    sortReservations(data, [{ key: 'pax', dir: 'desc' }]).map((r) => r.id),
    ['2', '1', '3'],
  )
})

test('multi-sort memakai kolom kedua saat kolom pertama sama', () => {
  const data = [
    { id: '1', nama: 'Budi', tanggal: '2026-11-01', pax: 3 },
    { id: '2', nama: 'Ani', tanggal: '2026-11-01', pax: 1 },
    { id: '3', nama: 'Cici', tanggal: '2026-11-02', pax: 2 },
  ]
  assert.deepEqual(
    sortReservations(data, [
      { key: 'tanggal', dir: 'asc' },
      { key: 'pax', dir: 'desc' },
    ]).map((r) => r.id),
    ['1', '2', '3'],
  )
})

test('sortir tidak mengubah array asli', () => {
  const data = [{ id: '1', nama: 'B' }, { id: '2', nama: 'A' }]
  sortReservations(data, [{ key: 'nama', dir: 'asc' }])
  assert.deepEqual(data.map((r) => r.id), ['1', '2'])
})
