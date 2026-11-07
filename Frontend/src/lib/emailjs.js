// ponytail: EmailJS client config is public by design (browser SDK); lock it by domain in the dashboard.
export const EMAILJS = {
  serviceId: 'service_585vhga',
  publicKey: 'nRFEKnNfwxqkGusmn',
  visitorTemplateId: 'template_m9m7tsf',
  // Template kedua untuk email pemandu & peringatan pengelola. Buat di dashboard
  // EmailJS dengan Template ID persis ini (lihat README: "Email pemandu di situs online").
  guideTemplateId: 'template_pemandu',
}

// EmailJS membatasi 1 permintaan/detik per akun; Approve mengirim email pengunjung
// lalu email pemandu berurutan, jadi semua pengiriman diberi jeda minimum.
const MIN_GAP_MS = 1100
let nextSlot = 0
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function waitForSlot(gapMs) {
  const now = Date.now()
  const startAt = Math.max(now, nextSlot)
  nextSlot = startAt + gapMs
  if (startAt > now) await sleep(startAt - now)
}

/** Kirim lewat EmailJS. Mengembalikan { ok, status, detail } dan tidak pernah melempar. */
export async function postEmailJs(templateId, templateParams, { gapMs = MIN_GAP_MS } = {}) {
  try {
    await waitForSlot(gapMs)
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS.serviceId,
        template_id: templateId,
        user_id: EMAILJS.publicKey,
        template_params: templateParams,
      }),
    })
    if (res.ok) return { ok: true, status: res.status, detail: '' }
    const detail = await res.text().catch(() => '')
    return { ok: false, status: res.status, detail: detail.slice(0, 160) }
  } catch {
    return { ok: false, status: 0, detail: 'Layanan email tidak terjangkau.' }
  }
}
