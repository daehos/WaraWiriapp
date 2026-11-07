import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildGuideEmail, buildManagerAlertEmail } from './emailTemplate.js'
import { runNotificationJob } from './runJob.js'
import { createMemoryStore } from '../stores/memoryStore.js'

const CONFIG = { managerEmail: 'manajer@desa.test', from: 'WaraWiri <no-reply@desa.test>', notifyHour: 7 }
const at = (hhmm, day = '2026-11-04') => new Date(`${day}T${hhmm}:00+07:00`)

const guides = [
  { id: 'asep', nama: 'Asep', email: 'asep@desa.test', destinasi: [], maxGroups: 2, aktif: true, urutan: 1 },
]
const reservation = (extra = {}) => ({
  id: 'WWR-20261101-100000-AAAA',
  status: 'dikonfirmasi',
  nama: 'Rombongan <SMA 1>',
  kontak: '081234567890',
  tanggal: '2026-11-05',
  waktu: '08:00 – 10:00',
  pax: 12,
  jenisWisata: 'Trekking sawah terasering',
  createdAt: '2026-11-01T10:00:00.000Z',
  ticketIssuedAt: '2026-11-01T11:00:00.000Z',
  ...extra,
})

function recorder({ failFor } = {}) {
  const sent = []
  return {
    sent,
    async send(message) {
      if (failFor && message.to === failFor.to && failFor.times-- > 0) throw new Error('SMTP 421 down')
      sent.push(message)
    },
  }
}

test('H-1: alokasi + kirim ke pemandu dengan tembusan ke pengelola, lalu tidak kirim ulang', async () => {
  const store = createMemoryStore({ reservations: [reservation()], guides })
  const mailer = recorder()

  const early = await runNotificationJob({ store, mailer, config: CONFIG, now: at('06:00') })
  assert.equal(early.assigned.length, 1) // dialokasikan lebih awal
  assert.equal(mailer.sent.length, 0) // tapi belum terkirim sebelum 07:00 H-1

  const run = await runNotificationJob({ store, mailer, config: CONFIG, now: at('07:05') })
  assert.equal(run.sent.length, 1)
  assert.equal(mailer.sent[0].to, 'asep@desa.test')
  assert.equal(mailer.sent[0].cc, 'manajer@desa.test')
  assert.match(mailer.sent[0].subject, /Besok/)
  assert.match(mailer.sent[0].text, /12 orang/)
  assert.match(mailer.sent[0].text, /08:00 – 10:00 WIB/)
  assert.match(mailer.sent[0].text, /Trekking sawah terasering/)

  const saved = store.get('WWR-20261101-100000-AAAA')
  assert.equal(saved.guideId, 'asep')
  assert.equal(saved.guideNotifyStatus, 'terkirim')
  assert.ok(saved.guideNotifiedAt)

  const again = await runNotificationJob({ store, mailer, config: CONFIG, now: at('08:05') })
  assert.equal(again.sent.length, 0)
  assert.equal(mailer.sent.length, 1)
})

test('kegagalan SMTP dicatat lalu dicoba ulang pada run berikutnya', async () => {
  const store = createMemoryStore({ reservations: [reservation()], guides })
  const mailer = recorder({ failFor: { to: 'asep@desa.test', times: 1 } })

  const first = await runNotificationJob({ store, mailer, config: CONFIG, now: at('07:05') })
  assert.equal(first.failed.length, 1)
  assert.equal(store.get('WWR-20261101-100000-AAAA').guideNotifyStatus, 'gagal')
  assert.equal(store.get('WWR-20261101-100000-AAAA').guideNotifyAttempts, 1)

  const retry = await runNotificationJob({ store, mailer, config: CONFIG, now: at('08:05') })
  assert.equal(retry.sent.length, 1)
  assert.equal(store.get('WWR-20261101-100000-AAAA').guideNotifyStatus, 'terkirim')
})

test('tanpa pemandu: pengelola diperingatkan sekali; begitu pemandu ada, notifikasi pemandu terkirim', async () => {
  const store = createMemoryStore({ reservations: [reservation()], guides: [] })
  const mailer = recorder()

  const first = await runNotificationJob({ store, mailer, config: CONFIG, now: at('07:05') })
  assert.equal(first.alerts.length, 1)
  assert.equal(mailer.sent[0].to, 'manajer@desa.test')
  assert.match(mailer.sent[0].subject, /PERLU TINDAKAN/)

  const second = await runNotificationJob({ store, mailer, config: CONFIG, now: at('08:05') })
  assert.equal(second.alerts.length, 0) // tidak spam

  store.addGuide(guides[0])
  const third = await runNotificationJob({ store, mailer, config: CONFIG, now: at('09:05') })
  assert.equal(third.sent.length, 1)
  assert.equal(mailer.sent.at(-1).to, 'asep@desa.test')
})

test('dry-run tidak menulis data dan tidak mengirim email', async () => {
  const store = createMemoryStore({ reservations: [reservation()], guides })
  const mailer = recorder()
  const out = await runNotificationJob({
    store,
    mailer,
    config: CONFIG,
    now: at('07:05'),
    dryRun: true,
  })
  assert.equal(out.assigned.length, 1)
  assert.equal(out.skipped.length, 1)
  assert.equal(mailer.sent.length, 0)
  assert.equal(store.get('WWR-20261101-100000-AAAA').guideId, undefined)
})

test('dry-run boleh menulis ke mailer lokal (preview) tapi tidak menyimpan status', async () => {
  const store = createMemoryStore({ reservations: [reservation()], guides })
  const preview = { local: true, sent: [], async send(m) { this.sent.push(m) } }
  const out = await runNotificationJob({ store, mailer: preview, config: CONFIG, now: at('07:05'), dryRun: true })
  assert.equal(out.sent.length, 1)
  assert.equal(preview.sent.length, 1)
  assert.equal(store.get('WWR-20261101-100000-AAAA').guideNotifiedAt, undefined)
})

test('reservasi belum disetujui atau tanggal lampau tidak disentuh', async () => {
  const store = createMemoryStore({
    reservations: [
      reservation({ id: 'WWR-20261101-100000-BBBB', status: 'menunggu-konfirmasi' }),
      reservation({ id: 'WWR-20261101-100000-CCCC', tanggal: '2026-11-03' }),
    ],
    guides,
  })
  const mailer = recorder()
  const out = await runNotificationJob({ store, mailer, config: CONFIG, now: at('07:05') })
  assert.equal(out.assigned.length, 0)
  assert.equal(mailer.sent.length, 0)
})

test('email memuat data minimum kartu PBI-5 dan meng-escape input pengunjung', () => {
  const message = buildGuideEmail({
    reservation: reservation(),
    guide: guides[0],
    managerEmail: CONFIG.managerEmail,
    from: CONFIG.from,
    now: at('07:05'),
  })
  for (const needle of ['Kamis, 5 November 2026', '08:00 – 10:00 WIB', 'Trekking sawah terasering', '12 orang']) {
    assert.ok(message.text.includes(needle), `teks harus memuat: ${needle}`)
    assert.ok(message.html.includes(needle), `html harus memuat: ${needle}`)
  }
  assert.ok(!message.html.includes('<SMA 1>'))
  assert.ok(message.html.includes('&lt;SMA 1&gt;'))
  assert.ok(!message.text.includes('081234567890'), 'kontak pengunjung tidak ikut dikirim')
})

test('email peringatan pengelola menyebut penyebab', () => {
  const message = buildManagerAlertEmail({
    reservation: reservation(),
    reason: 'Semua pemandu penuh.',
    managerEmail: CONFIG.managerEmail,
    from: CONFIG.from,
    now: at('07:05'),
  })
  assert.equal(message.to, CONFIG.managerEmail)
  assert.match(message.text, /Semua pemandu penuh\./)
})

test("notifyMode 'segera': satu run langsung mengalokasikan dan mengirim untuk kunjungan jauh", async () => {
  const far = reservation({ tanggal: '2026-12-20' })
  const store = createMemoryStore({ reservations: [far], guides })
  const mailer = recorder()

  const h1 = await runNotificationJob({ store, mailer, config: CONFIG, now: at('10:00') })
  assert.equal(h1.sent.length, 0) // mode default menunggu H-1

  const now = await runNotificationJob({
    store,
    mailer,
    config: { ...CONFIG, notifyMode: 'segera' },
    now: at('10:00'),
  })
  assert.equal(now.sent.length, 1)
  assert.equal(now.sent[0].guide, 'Asep')
  assert.match(mailer.sent[0].subject, /Minggu, 20 Desember 2026/)
  assert.match(mailer.sent[0].text, /untuk kunjungan pada /)
})

test('notifyOnly: hanya reservasi yang dipilih diberi email, yang lain tetap dialokasikan', async () => {
  const a = reservation({ id: 'WWR-20261101-100000-AAAA', waktu: '08:00 – 10:00' })
  const b = reservation({ id: 'WWR-20261101-100001-BBBB', waktu: '10:00 – 12:00' })
  const store = createMemoryStore({ reservations: [a, b], guides })
  const mailer = recorder()
  const summary = await runNotificationJob({
    store,
    mailer,
    config: { ...CONFIG, notifyMode: 'segera' },
    now: at('10:00'),
    notifyOnly: [b.id],
  })
  assert.equal(mailer.sent.length, 1)
  assert.match(mailer.sent[0].text, /WWR-20261101-100001-BBBB/)
  assert.equal(summary.assigned.length, 2)
  assert.equal(summary.sent.length, 1)
  const [ra, rb] = await store.listConfirmedReservations()
  assert.equal(ra.guideId, 'asep')
  assert.equal(ra.guideNotifiedAt, undefined)
  assert.ok(rb.guideNotifiedAt)
})
