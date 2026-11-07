import { createOutboxMailer } from './outboxMailer.js'
import { createSmtpMailer } from './smtpMailer.js'

// Terhadap emulator, email SECARA DEFAULT hanya ditulis ke Backend/outbox/local/
// (aman: tidak ada yang sampai ke orang sungguhan). Untuk melihat email benar-benar
// tiba di inbox (mis. Mailinator), isi SMTP_* di Backend/.env dan set
// SEND_REAL_EMAIL=true: email dikirim lewat SMTP DAN salinannya tetap ditulis ke outbox.
export function pickEmulatorMailer(env, outboxDir, warn = console.warn) {
  const outbox = createOutboxMailer(outboxDir)
  if (env.SEND_REAL_EMAIL !== 'true') return outbox

  const smtp = createSmtpMailer(env)
  if (!smtp) {
    warn('SEND_REAL_EMAIL=true tetapi SMTP_HOST/SMTP_USER/SMTP_PASS belum diisi di Backend/.env — email hanya ditulis ke outbox.')
    return outbox
  }
  return {
    name: 'smtp+outbox',
    async send(message) {
      const result = await smtp.send(message) // gagal SMTP -> job mencatat & mencoba ulang
      await outbox.send(message)
      return result
    },
    writeIndex: () => outbox.writeIndex(),
  }
}
