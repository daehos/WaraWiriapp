import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { createEmailJsMailer, notifyGuideInBrowser } from './guideJob.js'

const realFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = realFetch
})

const guides = [
  { id: 'asep', nama: 'Asep Kurnia', email: 'pemandu.asep@mailinator.com', destinasi: [], maxGroups: 2, aktif: true, urutan: 1 },
]
const reservation = (extra = {}) => ({
  id: 'WWR-20261108-100000-AAAA',
  status: 'dikonfirmasi',
  nama: 'SMA 1',
  kontak: '081234567890',
  tanggal: '2026-11-20',
  waktu: '08:00 – 10:00',
  pax: 10,
  jenisWisata: 'Kuliner lokal',
  createdAt: '2026-11-08T01:00:00.000Z',
  ticketIssuedAt: '2026-11-08T01:05:00.000Z',
  ...extra,
})

function memoryStore(reservations) {
  return {
    async listConfirmedReservations() {
      return reservations
    },
    async listGuides() {
      return guides
    },
    async updateReservation(id, fields) {
      Object.assign(reservations.find((r) => r.id === id), fields)
    },
  }
}

function stubFetch(status = 200, body = '') {
  const calls = []
  globalThis.fetch = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) })
    return { ok: status < 300, status, text: async () => body }
  }
  return calls
}

const NOW = new Date('2026-11-08T10:00:00+07:00')

test('Approve: pemandu dialokasikan dan email EmailJS dikirim ke mailinator pemandu + tembusan pengelola', async () => {
  const calls = stubFetch()
  const r = reservation()
  const out = await notifyGuideInBrowser({
    store: memoryStore([r]),
    mailer: createEmailJsMailer({ gapMs: 0 }),
    id: r.id,
    now: NOW,
  })
  assert.equal(out.status, 'terkirim')
  assert.equal(out.via, 'emailjs')
  assert.equal(out.to, 'pemandu.asep@mailinator.com')
  assert.equal(calls.length, 1)
  const { template_id, template_params: p } = calls[0].body
  assert.equal(template_id, 'template_pemandu')
  assert.equal(p.to_email, 'pemandu.asep@mailinator.com')
  assert.equal(p.cc_email, 'pengelola.warawiri@mailinator.com')
  assert.match(p.subject, /rombongan SMA 1 \(10 orang\)/)
  assert.match(p.message_html, /<table/)
  assert.match(p.message, /081234567890/)
  assert.match(p.message_html, /P3K/)
  assert.equal(r.guideNotifyStatus, 'terkirim')
})

test('klik ulang tidak mengirim email ganda (idempoten)', async () => {
  const calls = stubFetch()
  const r = reservation()
  const store = memoryStore([r])
  const args = { store, mailer: createEmailJsMailer({ gapMs: 0 }), id: r.id, now: NOW }
  await notifyGuideInBrowser(args)
  const again = await notifyGuideInBrowser(args)
  assert.equal(again.status, 'tidak-berubah')
  assert.equal(calls.length, 1)
})

test('hanya reservasi yang di-approve yang diberi email, reservasi lain tidak', async () => {
  const calls = stubFetch()
  const a = reservation({ id: 'WWR-20261108-100000-AAAA' })
  const b = reservation({ id: 'WWR-20261108-100001-BBBB', waktu: '10:00 – 12:00' })
  await notifyGuideInBrowser({ store: memoryStore([a, b]), mailer: createEmailJsMailer({ gapMs: 0 }), id: b.id, now: NOW })
  assert.equal(calls.length, 1)
  assert.match(calls[0].body.template_params.message, /WWR-20261108-100001-BBBB/)
  assert.equal(a.guideNotifiedAt, undefined)
})

test('template EmailJS belum dibuat: gagal dengan petunjuk jelas, dicatat untuk dicoba ulang', async () => {
  stubFetch(400, 'The template ID not found')
  const r = reservation()
  const out = await notifyGuideInBrowser({
    store: memoryStore([r]),
    mailer: createEmailJsMailer({ gapMs: 0 }),
    id: r.id,
    now: NOW,
  })
  assert.equal(out.status, 'gagal')
  assert.match(out.reason, /template_pemandu/)
  assert.equal(r.guideNotifyStatus, 'gagal')
  assert.equal(r.guideNotifiedAt, undefined)
})

test('pengiriman ulang setelah template diperbaiki berhasil', async () => {
  stubFetch(400, 'nope')
  const r = reservation()
  const store = memoryStore([r])
  const mailer = createEmailJsMailer({ gapMs: 0 })
  await notifyGuideInBrowser({ store, mailer, id: r.id, now: NOW })
  stubFetch(200)
  const out = await notifyGuideInBrowser({ store, mailer, id: r.id, now: NOW })
  assert.equal(out.status, 'terkirim')
  assert.equal(r.guideNotifyAttempts, 2)
})

test('template pemandu belum ada: pakai template tiket sebagai cadangan, salinan pengelola dikirim terpisah', async () => {
  const calls = []
  globalThis.fetch = async (url, init) => {
    const body = JSON.parse(init.body)
    calls.push(body)
    const missing = body.template_id === 'template_pemandu'
    return { ok: !missing, status: missing ? 400 : 200, text: async () => 'template not found' }
  }
  const r = reservation({ jenisWisata: 'Kuliner lokal' })
  const out = await notifyGuideInBrowser({
    store: memoryStore([r]),
    mailer: createEmailJsMailer({ gapMs: 0 }),
    id: r.id,
    now: NOW,
  })
  assert.equal(out.status, 'terkirim')
  assert.deepEqual(
    calls.map((c) => [c.template_id, c.template_params.to_email]),
    [
      ['template_pemandu', 'pemandu.asep@mailinator.com'],
      ['template_m9m7tsf', 'pemandu.asep@mailinator.com'],
      ['template_m9m7tsf', 'pengelola.warawiri@mailinator.com'],
    ],
  )
  const p = calls[1].template_params
  assert.equal(p.status, 'Penugasan pemandu baru')
  assert.match(p.jumlah_orang, /^10 orang/)
  assert.equal(p.is_approved, 'true') // blok rincian di template tiket hanya tampil bila disetujui
  assert.equal(p.is_declined, '')
  assert.match(p.lokasi_gedung_ruangan, /Kontak: 081234567890/)
  assert.match(p.jumlah_orang, /P3K/)
  assert.match(p.jumlah_orang, /konsumsi/)
  assert.equal(r.guideNotifyStatus, 'terkirim')
})
