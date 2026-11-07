// Dipanggil dashboard admin tepat setelah Approve. Backend (POST /api/guide-notify)
// memilih pemandu dan mengirim email penugasan sesuai NOTIFY_MODE. Browser tidak
// bisa mengirim SMTP, jadi lewat Backend; bila Backend tidak aktif (mis. hosting
// statis), job terjadwal GitHub Actions yang akan menanganinya.
export async function requestGuideNotification(user, id) {
  try {
    const token = await user.getIdToken()
    const res = await fetch('/api/guide-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    })
    const isJson = (res.headers.get('content-type') ?? '').includes('application/json')
    if (!res.ok || !isJson) return { ran: false }
    return await res.json()
  } catch {
    return { ran: false }
  }
}

// Ubah hasil Backend menjadi kalimat untuk admin.
export function describeGuideResult(result) {
  if (!result?.ran) {
    return {
      ok: false,
      text:
        result?.reason ??
        'Backend notifikasi pemandu tidak aktif — pemandu akan diberi tahu oleh job terjadwal.',
    }
  }
  switch (result.status) {
    case 'terkirim':
      // Mode lokal default hanya menulis ke kotak keluar; jangan mengaku "terkirim".
      return result.via === 'outbox'
        ? {
            ok: true,
            text: `Pemandu ${result.guide} ditugaskan; email untuk ${result.to} dibuat di kotak keluar lokal (Backend/outbox/local), belum dikirim sungguhan.`,
          }
        : { ok: true, text: `Pemandu ${result.guide} ditugaskan; email penugasan terkirim ke ${result.to}.` }
    case 'menunggu':
      return { ok: true, text: `Pemandu ${result.guide} ditugaskan; email dikirim saat H-1 pukul 07:00 WIB.` }
    case 'tanpa-pemandu':
      return {
        ok: false,
        text: `Belum ada pemandu yang tersedia (${result.reason}) ${
          result.managerNotified ? 'Pengelola sudah diberi tahu.' : ''
        }`.trim(),
      }
    case 'gagal':
      return { ok: false, text: `Pemandu ditetapkan, tetapi email gagal: ${result.reason}. Akan dicoba lagi.` }
    default:
      return { ok: true, text: 'Penugasan pemandu tidak berubah.' }
  }
}
