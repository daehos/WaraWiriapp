import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[c])

const slug = (value) =>
  String(value ?? 'tanpa-penerima')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

// "Kotak keluar" lokal: menulis tiap email sebagai file HTML yang bisa dibuka
// di browser. Dipakai untuk simulasi (`npm run simulate`) dan pratinjau
// `npm run notify -- --dry-run --outbox`; tidak pernah menjangkau penerima nyata.
export function createOutboxMailer(dir) {
  const items = []
  let loaded = false

  // Lanjutkan dari run sebelumnya supaya email lama tetap bisa dilihat.
  async function load() {
    if (loaded) return
    loaded = true
    try {
      items.push(...JSON.parse(await readFile(path.join(dir, 'index.json'), 'utf8')))
    } catch {
      // belum ada index.json: mulai dari kosong
    }
  }

  return {
    name: 'outbox',
    local: true, // hanya menulis file, tidak menjangkau penerima nyata
    items,
    async send(message) {
      await load()
      await mkdir(dir, { recursive: true })
      const file = `${String(items.length + 1).padStart(2, '0')}-${slug(message.to)}.html`
      const header = [
        ['Dari', message.from],
        ['Kepada', message.to],
        ['Cc', message.cc],
        ['Subjek', message.subject],
      ]
        .filter(([, v]) => v)
        .map(
          ([k, v]) =>
            `<tr><td style="padding:2px 12px 2px 0;color:#666">${k}</td><td><strong>${escapeHtml(v)}</strong></td></tr>`,
        )
        .join('')
      const page =
        `<div style="font:14px system-ui;background:#fff;border-bottom:1px solid #ddd;padding:12px 24px">` +
        `<table>${header}</table></div>\n${message.html}`
      await writeFile(path.join(dir, file), page)
      items.push({ file, to: message.to, cc: message.cc, subject: message.subject })
      return { id: file }
    },
    async writeIndex() {
      await load()
      const rows = items
        .map(
          (i) =>
            `<li style="margin:8px 0"><a href="${i.file}">${escapeHtml(i.subject)}</a><br>` +
            `<small>Kepada: ${escapeHtml(i.to)}${i.cc ? ` · Cc: ${escapeHtml(i.cc)}` : ''}</small></li>`,
        )
        .join('')
      await mkdir(dir, { recursive: true })
      await writeFile(path.join(dir, 'index.json'), JSON.stringify(items, null, 2))
      await writeFile(
        path.join(dir, 'index.html'),
        `<!doctype html><meta charset="utf-8"><title>Outbox simulasi</title>` +
          `<body style="font:16px system-ui;max-width:720px;margin:32px auto;padding:0 16px">` +
          `<h1>Outbox simulasi WaraWiri</h1><p>${items.length} email dihasilkan.</p><ol>${rows}</ol></body>`,
      )
    },
  }
}
