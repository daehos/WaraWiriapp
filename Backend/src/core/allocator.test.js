import assert from 'node:assert/strict'
import { test } from 'node:test'
import { allocate, guideHandles, maxGroupsOf } from './allocator.js'

const TODAY = '2026-11-04'
const VISIT = '2026-11-05'

const guide = (id, extra = {}) => ({
  id,
  nama: id.toUpperCase(),
  email: `${id}@example.com`,
  destinasi: [],
  maxGroups: 2,
  aktif: true,
  urutan: 0,
  ...extra,
})

let seq = 0
const res = (extra = {}) => {
  seq += 1
  return {
    id: `WWR-${String(seq).padStart(4, '0')}`,
    status: 'dikonfirmasi',
    tanggal: VISIT,
    waktu: '08:00 – 10:00',
    pax: 3,
    jenisWisata: 'Trekking sawah terasering',
    createdAt: `2026-11-01T00:00:${String(seq).padStart(2, '0')}.000Z`,
    ...extra,
  }
}

const idsOf = (result) => result.assignments.map((a) => [a.reservation.id, a.guide.id])

test('destinasi kosong berarti pemandu menguasai semua; reservasi tanpa destinasi cocok dengan siapa pun', () => {
  assert.equal(guideHandles(guide('a'), res()), true)
  assert.equal(guideHandles(guide('a', { destinasi: ['Homestay warga'] }), res()), false)
  assert.equal(
    guideHandles(guide('a', { destinasi: ['Homestay warga'] }), res({ jenisWisata: null })),
    true,
  )
})

test('maxGroups tidak valid memakai batas default', () => {
  assert.equal(maxGroupsOf({ maxGroups: 4 }), 4)
  assert.equal(maxGroupsOf({}), 3)
  assert.equal(maxGroupsOf({ maxGroups: 0 }), 3)
})

test('antrian FIFO: reservasi yang disetujui lebih dulu mendapat pemandu prioritas', () => {
  const late = res({ ticketIssuedAt: '2026-11-03T10:00:00.000Z', waktu: '10:00 – 12:00' })
  const early = res({ ticketIssuedAt: '2026-11-02T10:00:00.000Z', waktu: '08:00 – 10:00' })
  const out = allocate({
    reservations: [late, early],
    guides: [guide('a', { urutan: 1 }), guide('b', { urutan: 2 })],
    today: TODAY,
  })
  // early diproses dulu; keduanya 'a' karena satu pemandu diisi dulu sampai penuh
  assert.deepEqual(idsOf(out), [[early.id, 'a'], [late.id, 'a']])
})

test('pemandu penuh otomatis dioper ke pemandu lain', () => {
  const r1 = res({ waktu: '08:00 – 10:00' })
  const r2 = res({ waktu: '10:00 – 12:00' })
  const r3 = res({ waktu: '13:00 – 15:00' })
  const out = allocate({
    reservations: [r1, r2, r3],
    guides: [guide('a', { maxGroups: 1, urutan: 1 }), guide('b', { maxGroups: 5, urutan: 2 })],
    today: TODAY,
  })
  assert.deepEqual(idsOf(out), [[r1.id, 'a'], [r2.id, 'b'], [r3.id, 'b']])
})

test('pemandu tidak ditugaskan dua rombongan di slot waktu yang sama', () => {
  const r1 = res()
  const r2 = res()
  const out = allocate({
    reservations: [r1, r2],
    guides: [guide('a', { urutan: 1 }), guide('b', { urutan: 2 })],
    today: TODAY,
  })
  assert.deepEqual(idsOf(out), [[r1.id, 'a'], [r2.id, 'b']])
})

test('kalau tak ada pemandu yang tersedia, rombongan dilaporkan dengan alasan', () => {
  const r1 = res()
  const r2 = res()
  const r3 = res({ jenisWisata: 'Homestay warga' })
  const out = allocate({
    reservations: [r1, r2, r3],
    guides: [guide('a', { destinasi: ['Trekking sawah terasering'], urutan: 1 })],
    today: TODAY,
  })
  assert.deepEqual(idsOf(out), [[r1.id, 'a']])
  assert.equal(out.unassigned.length, 2)
  assert.match(out.unassigned.find((u) => u.reservation.id === r2.id).reason, /slot waktu/)
  assert.match(out.unassigned.find((u) => u.reservation.id === r3.id).reason, /destinasi/)
})

test('batas rombongan per hari dihitung per tanggal, bukan total', () => {
  const day1 = res({ tanggal: '2026-11-05' })
  const day2 = res({ tanggal: '2026-11-06' })
  const out = allocate({
    reservations: [day1, day2],
    guides: [guide('a', { maxGroups: 1 })],
    today: TODAY,
  })
  assert.equal(out.assignments.length, 2)
})

test('penugasan yang sudah ada dipertahankan dan dihitung sebagai beban (idempoten)', () => {
  const kept = res({ guideId: 'a', guideName: 'A' })
  const fresh = res({ waktu: '10:00 – 12:00' })
  const out = allocate({
    reservations: [kept, fresh],
    guides: [guide('a', { maxGroups: 1, urutan: 1 }), guide('b', { urutan: 2 })],
    today: TODAY,
  })
  assert.deepEqual(idsOf(out), [[fresh.id, 'b']])
})

test('pemandu nonaktif yang belum diberi notifikasi dialokasikan ulang; yang sudah diberi tetap', () => {
  const notified = res({ guideId: 'old', guideNotifiedAt: '2026-11-04T00:00:00.000Z' })
  const pending = res({ guideId: 'old', waktu: '10:00 – 12:00' })
  const out = allocate({
    reservations: [notified, pending],
    guides: [guide('old', { aktif: false }), guide('new')],
    today: TODAY,
  })
  assert.deepEqual(idsOf(out), [[pending.id, 'new']])
})

test('reservasi tanggal lampau diabaikan', () => {
  const past = res({ tanggal: '2026-11-03' })
  const out = allocate({ reservations: [past], guides: [guide('a')], today: TODAY })
  assert.equal(out.assignments.length + out.unassigned.length, 0)
})

test('batas 4 rombongan/hari: rombongan ke-5 otomatis dioper ke pemandu kedua', () => {
  const guides = [guide('a', { maxGroups: 4, urutan: 1 }), guide('b', { maxGroups: 4, urutan: 2 })]
  const slots = ['08:00', '10:00', '13:00', '15:00', '17:00']
  const reservations = slots.map((waktu, i) =>
    res({ id: `R${i + 1}`, waktu, ticketIssuedAt: `2026-11-03T0${i}:00:00Z` }),
  )
  const { assignments, unassigned } = allocate({ reservations, guides, today: TODAY })
  assert.equal(unassigned.length, 0)
  const byGuide = (id) => assignments.filter((a) => a.guide.id === id).map((a) => a.reservation.id)
  assert.deepEqual(byGuide('a'), ['R1', 'R2', 'R3', 'R4'])
  assert.deepEqual(byGuide('b'), ['R5'])
})
