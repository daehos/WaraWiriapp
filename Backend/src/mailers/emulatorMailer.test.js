import assert from 'node:assert/strict'
import { mkdtemp, readFile } from 'node:fs/promises'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { pickEmulatorMailer } from './emulatorMailer.js'

const message = {
  from: 'WaraWiri <no-reply@warawiri.local>',
  to: 'pemandu.asep@mailinator.com',
  cc: 'pengelola.warawiri@mailinator.com',
  subject: '[WaraWiri] Besok: rombongan Uji (4 orang)',
  text: 'halo',
  html: '<p>halo</p>',
}

// SMTP palsu minimal: cukup untuk nodemailer (EHLO, AUTH PLAIN, MAIL, RCPT, DATA, QUIT).
function startSmtpStub() {
  const received = { rcpt: [], data: '' }
  const server = net.createServer((socket) => {
    let buffer = ''
    let inData = false
    socket.write('220 stub ESMTP\r\n')
    socket.on('data', (chunk) => {
      buffer += chunk.toString()
      for (;;) {
        if (inData) {
          const end = buffer.indexOf('\r\n.\r\n')
          if (end === -1) return
          received.data += buffer.slice(0, end)
          buffer = buffer.slice(end + 5)
          inData = false
          socket.write('250 queued\r\n')
          continue
        }
        const eol = buffer.indexOf('\r\n')
        if (eol === -1) return
        const line = buffer.slice(0, eol)
        buffer = buffer.slice(eol + 2)
        if (/^EHLO|^HELO/i.test(line)) socket.write('250-stub\r\n250 AUTH PLAIN\r\n')
        else if (/^AUTH/i.test(line)) socket.write('235 ok\r\n')
        else if (/^RCPT TO/i.test(line)) (received.rcpt.push(line.replace(/^RCPT TO:\s*<?|>?$/gi, '')), socket.write('250 ok\r\n'))
        else if (/^DATA/i.test(line)) (inData = true, socket.write('354 go\r\n'))
        else if (/^QUIT/i.test(line)) (socket.write('221 bye\r\n'), socket.end())
        else socket.write('250 ok\r\n')
      }
    })
  })
  return new Promise((resolve) =>
    server.listen(0, '127.0.0.1', () => resolve({ server, received, port: server.address().port })),
  )
}

test('default: hanya outbox lokal, tidak pernah SMTP', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'wwr-outbox-'))
  const mailer = pickEmulatorMailer({ SMTP_HOST: 'x', SMTP_USER: 'x', SMTP_PASS: 'x' }, dir)
  assert.equal(mailer.name, 'outbox')
  assert.equal(mailer.local, true)
})

test('SEND_REAL_EMAIL tanpa SMTP: peringatan dan tetap outbox', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'wwr-outbox-'))
  const warnings = []
  const mailer = pickEmulatorMailer({ SEND_REAL_EMAIL: 'true' }, dir, (w) => warnings.push(w))
  assert.equal(mailer.name, 'outbox')
  assert.equal(warnings.length, 1)
})

test('SEND_REAL_EMAIL + SMTP: terkirim sungguhan ke penerima & cc, salinan tetap di outbox', async () => {
  const { server, received, port } = await startSmtpStub()
  try {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'wwr-outbox-'))
    const mailer = pickEmulatorMailer(
      { SEND_REAL_EMAIL: 'true', SMTP_HOST: '127.0.0.1', SMTP_PORT: String(port), SMTP_USER: 'u', SMTP_PASS: 'p' },
      dir,
    )
    assert.equal(mailer.name, 'smtp+outbox')
    assert.equal(mailer.local, undefined) // bukan mailer lokal -> dry-run tidak akan memakainya

    await mailer.send(message)
    await mailer.writeIndex()

    assert.deepEqual(received.rcpt.sort(), ['pemandu.asep@mailinator.com', 'pengelola.warawiri@mailinator.com'])
    assert.match(received.data, /Subject: \[WaraWiri\] Besok: rombongan Uji/)
    assert.match(await readFile(path.join(dir, 'index.html'), 'utf8'), /pemandu\.asep@mailinator\.com/)
  } finally {
    server.close()
  }
})
