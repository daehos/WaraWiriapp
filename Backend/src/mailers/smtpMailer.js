import nodemailer from 'nodemailer'

// Pengirim SMTP produksi. Mengembalikan null bila SMTP belum dikonfigurasi,
// supaya pemanggil bisa jatuh ke outbox lokal.
//
// Agar masuk Inbox (bukan Spam): kirim dari domain yang punya SPF + DKIM +
// DMARC, atau lewat penyedia terautentikasi (Gmail App Password, Brevo,
// Resend, dsb). Template sudah berisi versi teks + HTML dan tanpa lampiran.
export function createSmtpMailer(env = process.env) {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(env.SMTP_PORT) || 587,
    secure: env.SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })

  return {
    name: 'smtp',
    async send(message) {
      const info = await transporter.sendMail({
        ...message,
        headers: { 'X-Auto-Response-Suppress': 'OOF, AutoReply' },
      })
      return { id: info.messageId }
    },
  }
}
