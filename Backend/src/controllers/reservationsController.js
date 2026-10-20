import { getAuth } from 'firebase-admin/auth'
import { readJsonBody, sendJson } from '../http.js'
import { app } from '../firebase.js'
import { sendStatusEmail } from '../mail.js'
import {
  createId,
  createReservationWithQuota,
  readReservation,
  readReservations,
} from '../models/reservationModel.js'
import { validateReservation } from '../validators.js'

async function adminGuard(req, res) {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  try {
    const decoded = await getAuth(app).verifyIdToken(token)
    if (decoded.admin === true) return true
    sendJson(res, 403, { error: 'Akun ini bukan admin.' })
  } catch {
    sendJson(res, 401, { error: 'Token admin tidak valid.' })
  }
  return false
}

export async function createReservation(req, res) {
  const body = await readJsonBody(req)
  const values = {
    nama: String(body.nama ?? ''),
    kontak: String(body.kontak ?? ''),
    email: String(body.email ?? ''),
    tanggal: String(body.tanggal ?? ''),
    pax: String(body.pax ?? ''),
    jenisWisata: String(body.jenisWisata ?? ''),
  }

  const errors = validateReservation(values)
  if (Object.keys(errors).length > 0) {
    return sendJson(res, 400, { error: 'Data reservasi belum lengkap.', errors })
  }

  const entry = {
    id: createId(),
    status: 'menunggu-konfirmasi',
    nama: values.nama.trim(),
    kontak: values.kontak.trim(),
    email: values.email.trim().toLowerCase() || null,
    tanggal: values.tanggal,
    pax: Number(values.pax),
    jenisWisata: values.jenisWisata.trim() || null,
    createdAt: new Date().toISOString(),
  }

  try {
    await createReservationWithQuota(entry)
  } catch (error) {
    if (error.code === 'quota-exceeded') {
      return sendJson(res, 409, { error: error.message })
    }
    throw error
  }
  sendJson(res, 201, entry)
}

export async function listReservations(req, res) {
  const reservations = await readReservations()
  sendJson(res, 200, { count: reservations.length, reservations })
}

export async function notifyReservation(req, res) {
  if (!(await adminGuard(req, res))) return

  const body = await readJsonBody(req)
  const reservation = await readReservation(String(body.id ?? ''))
  if (!reservation) {
    return sendJson(res, 404, { error: 'Reservasi tidak ditemukan.' })
  }
  if (!['dikonfirmasi', 'ditolak'].includes(reservation.status)) {
    return sendJson(res, 400, { error: 'Status reservasi belum final.' })
  }

  try {
    sendJson(res, 200, await sendStatusEmail(reservation))
  } catch (error) {
    sendJson(res, 200, { sent: false, reason: error.message })
  }
}
