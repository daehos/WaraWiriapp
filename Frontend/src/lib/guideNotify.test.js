import assert from 'node:assert/strict'
import { test } from 'node:test'
import { describeGuideResult } from './guideNotify.js'

test('Backend tidak aktif: pesan netral, bukan error', () => {
  const out = describeGuideResult({ ran: false })
  assert.equal(out.ok, false)
  assert.match(out.text, /job terjadwal/)
})

test('email terkirim menyebut nama dan alamat pemandu', () => {
  const out = describeGuideResult({ ran: true, status: 'terkirim', guide: 'Asep', to: 'a@x.id' })
  assert.equal(out.ok, true)
  assert.match(out.text, /Asep.*a@x\.id/)
})

test('mode H-1: pemandu ditetapkan tapi email menunggu jadwal', () => {
  const out = describeGuideResult({ ran: true, status: 'menunggu', guide: 'Wati' })
  assert.equal(out.ok, true)
  assert.match(out.text, /H-1/)
})

test('tanpa pemandu dan kegagalan email ditandai bermasalah', () => {
  const none = describeGuideResult({ ran: true, status: 'tanpa-pemandu', reason: 'Semua penuh.', managerNotified: true })
  assert.equal(none.ok, false)
  assert.match(none.text, /Pengelola sudah diberi tahu/)
  assert.equal(describeGuideResult({ ran: true, status: 'gagal', reason: 'SMTP down' }).ok, false)
})

test('kotak keluar lokal tidak diklaim sebagai terkirim sungguhan', () => {
  const out = describeGuideResult({ ran: true, status: 'terkirim', guide: 'Asep', to: 'a@x.id', via: 'outbox' })
  assert.match(out.text, /kotak keluar lokal/)
  assert.doesNotMatch(out.text, /terkirim ke/)
  assert.match(describeGuideResult({ ran: true, status: 'terkirim', guide: 'Asep', to: 'a@x.id', via: 'smtp+outbox' }).text, /terkirim ke a@x\.id/)
})
