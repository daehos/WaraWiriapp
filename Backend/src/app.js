import { promises as fs } from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { sendJson } from './http.js'
import { handleReservationRoute } from './routes/reservations.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, '../../Frontend/dist')
const PORT = Number(process.env.PORT) || 3001

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

async function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  const requested = path.normalize(path.join(DIST, urlPath === '/' ? 'index.html' : urlPath))
  if (!requested.startsWith(DIST)) return sendJson(res, 403, { error: 'Forbidden.' })

  try {
    const stat = await fs.stat(requested)
    const filePath = stat.isDirectory() ? path.join(requested, 'index.html') : requested
    const data = await fs.readFile(filePath)
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] ?? 'application/octet-stream' })
    res.end(data)
    return
  } catch {
    // fallback: index.html (single page app), lalu pesan bantuan kalau belum di-build
  }

  try {
    const data = await fs.readFile(path.join(DIST, 'index.html'))
    res.writeHead(200, { 'Content-Type': MIME['.html'] })
    res.end(data)
  } catch {
    sendJson(res, 404, {
      error: 'Frontend belum di-build. Jalankan `npm run build` di Frontend/, atau pakai `npm run dev` untuk mode development.',
    })
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith('/api/')) return await handleReservationRoute(req, res)
    await serveStatic(req, res)
  } catch (err) {
    console.error(err)
    if (!res.headersSent) {
      sendJson(res, err.statusCode ?? 500, { error: err.statusCode ? err.message : 'Terjadi kesalahan server.' })
    }
  }
})

server.listen(PORT, () => {
  console.log(`WaraWiri backend berjalan di http://localhost:${PORT}`)
  console.log(`API: GET/POST http://localhost:${PORT}/api/reservations`)
})
