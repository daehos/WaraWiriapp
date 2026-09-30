import assert from 'node:assert/strict'
import { test } from 'node:test'
import { todayISO, validateReservation } from './reservation.js'

const JENIS = ['Trekking Sawah', 'Budaya & Kerajinan', 'Homestay']

const base = {
  nama: 'Budi Santoso',
  kontak: '081234567890',
  tanggal: '2099-01-15',
  pax: '2',
  jenisWisata: '',
}

test('data lengkap dan valid menghasilkan error kosong', () => {
  assert.deepEqual(validateReservation(base, JENIS), {})
})

test('field kosong semua menghasilkan 4 error wajib', () => {
  const errors = validateReservation({ nama: '', kontak: '', tanggal: '', pax: '' }, JENIS)
  assert.deepEqual(Object.keys(errors).sort(), ['nama', 'pax', 'tanggal', 'kontak'].sort())
})

test('nama pendek ditolak', () => {
  assert.ok(validateReservation({ ...base, nama: 'A' }, JENIS).nama)
})

test('kontak bukan HP/email ditolak', () => {
  assert.ok(validateReservation({ ...base, kontak: 'abc' }, JENIS).kontak)
})

test('kontak email dan format HP +62 diterima', () => {
  assert.equal(validateReservation({ ...base, kontak: 'budi@mail.com' }, JENIS).kontak, undefined)
  assert.equal(validateReservation({ ...base, kontak: '+62 812-3456-7890' }, JENIS).kontak, undefined)
})

test('tanggal hari ini dan masa lalu ditolak', () => {
  const today = todayISO()
  assert.ok(validateReservation({ ...base, tanggal: today }, JENIS).tanggal)
  assert.ok(validateReservation({ ...base, tanggal: '2000-01-01' }, JENIS).tanggal)
})

test('pax 0, negatif, dan pecahan ditolak', () => {
  assert.ok(validateReservation({ ...base, pax: '0' }, JENIS).pax)
  assert.ok(validateReservation({ ...base, pax: '-3' }, JENIS).pax)
  assert.ok(validateReservation({ ...base, pax: '1.5' }, JENIS).pax)
})

test('jenis wisata optional, tapi harus terdaftar jika diisi', () => {
  assert.equal(validateReservation({ ...base, jenisWisata: '' }, JENIS).jenisWisata, undefined)
  assert.ok(validateReservation({ ...base, jenisWisata: 'Paralayang' }, JENIS).jenisWisata)
})

test('todayISO memakai tanggal lokal, bukan UTC', () => {
  assert.match(todayISO(new Date(2026, 0, 5)), /^2026-01-05$/)
})
