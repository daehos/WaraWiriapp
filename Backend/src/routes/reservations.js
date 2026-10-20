import {
  createReservation,
  listReservations,
  notifyReservation,
} from '../controllers/reservationsController.js'
import { sendJson } from '../http.js'

export async function handleReservationRoute(req, res) {
  const { pathname } = new URL(req.url, 'http://localhost')
  if (pathname === '/api/notify') {
    if (req.method === 'POST') return notifyReservation(req, res)
    return sendJson(res, 405, { error: 'Method tidak diizinkan.' })
  }
  if (pathname !== '/api/reservations') {
    return sendJson(res, 404, { error: 'Endpoint tidak ditemukan.' })
  }
  if (req.method === 'GET') return listReservations(req, res)
  if (req.method === 'POST') return createReservation(req, res)
  sendJson(res, 405, { error: 'Method tidak diizinkan.' })
}
