import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  buildTicketUrl,
  nextTicketState,
  parseManualCode,
  parseManualTicketCode,
  parseTicketPayload,
  randomManualCode,
  randomTicketCode,
  ticketPayload,
  todayWIB,
} from './ticket.js'

const base = {
  status: 'dikonfirmasi',
  tanggal: '2026-11-10',
  pax: 2,
  inside: 0,
  entries: 0,
  exits: 0,
}

test('payload tiket bisa dibuat dan dibaca ulang', () => {
  const code = randomTicketCode()
  assert.match(code, /^[a-f0-9]{32}$/)
  assert.deepEqual(parseTicketPayload(ticketPayload('WWR-20260101-120000-ABCD', code)), {
    id: 'WWR-20260101-120000-ABCD',
    code,
  })
})

test('payload rusak ditolak', () => {
  assert.equal(parseTicketPayload('bukan-tiket'), null)
  assert.equal(parseTicketPayload('WWR-TKT|WWR-1|pendek'), null)
  assert.equal(parseTicketPayload('WWW-TKT|WWR-1|' + 'a'.repeat(32)), null)
})

test('link tiket berisi payload yang bisa di-decode kembali', () => {
  const code = 'a'.repeat(32)
  const url = buildTicketUrl('https://warawiri.test/', 'WWR-20260101-120000-ABCD', code, '123456')
  const parsed = new URL(url)
  assert.equal(parsed.origin, 'https://warawiri.test')
  assert.equal(parsed.pathname, '/tiket')
  assert.equal(parsed.searchParams.get('manual'), '123456')
  assert.deepEqual(parseTicketPayload(parsed.searchParams.get('data')), {
    id: 'WWR-20260101-120000-ABCD',
    code,
  })
})

test('kode manual hanya menerima 32 hex, case-insensitive', () => {
  assert.equal(parseManualTicketCode('A'.repeat(32)), 'a'.repeat(32))
  assert.equal(parseManualTicketCode('bukan-kode'), null)
  assert.equal(parseManualTicketCode('a'.repeat(31)), null)
})

test('kode manual 6 digit dan kode hex lama sama-sama dikenali', () => {
  assert.equal(parseManualCode('123456'), '123456')
  assert.equal(parseManualCode('12345'), null)
  assert.equal(parseManualCode('A'.repeat(32)), 'a'.repeat(32))
  assert.match(randomManualCode(), /^\d{6}$/)
})

test('tanggal WIB berubah setelah 17:00 UTC', () => {
  assert.equal(todayWIB(new Date('2026-11-10T16:59:00Z')), '2026-11-10')
  assert.equal(todayWIB(new Date('2026-11-10T17:00:00Z')), '2026-11-11')
})

test('masuk dibatasi jumlah peserta, keluar mengurangi orang di dalam', () => {
  const first = nextTicketState(base, 'masuk', '2026-11-10')
  assert.equal(first.ok, true)
  assert.deepEqual(first.next, { inside: 1, entries: 1, exits: 0 })

  const second = nextTicketState({ ...base, inside: 1, entries: 1 }, 'masuk', '2026-11-10')
  assert.equal(second.ok, true)
  assert.equal(second.next.inside, 2)

  const full = nextTicketState({ ...base, inside: 2, entries: 2 }, 'masuk', '2026-11-10')
  assert.equal(full.ok, false)
  assert.match(full.reason, /sudah berada di dalam/)

  const exit = nextTicketState({ ...base, inside: 2, entries: 2 }, 'keluar', '2026-11-10')
  assert.equal(exit.ok, true)
  assert.deepEqual(exit.next, { inside: 1, entries: 2, exits: 1 })

  const reentry = nextTicketState(
    { ...base, inside: 1, entries: 2, exits: 1 },
    'masuk',
    '2026-11-10',
  )
  assert.equal(reentry.ok, true)
  assert.equal(reentry.next.inside, 2)
})

test('tiket tanggal lain dan yang belum disetujui ditolak', () => {
  assert.match(nextTicketState(base, 'masuk', '2026-11-11').reason, /tanggal kunjungan/)
  assert.match(
    nextTicketState({ ...base, status: 'menunggu-konfirmasi' }, 'masuk', '2026-11-10').reason,
    /belum disetujui/,
  )
})
