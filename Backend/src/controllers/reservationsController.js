import { readJsonBody, sendJson } from '../http.js'
import { createId, readReservations, saveReservation } from '../models/reservationModel.js'
import { validateReservation } from '../validators.js'

export async function createReservation(req, res) {
  const body = await readJsonBody(req)
  const values = {
    nama: String(body.nama ?? ''),
    kontak: String(body.kontak ?? ''),
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
    tanggal: values.tanggal,
    pax: Number(values.pax),
    jenisWisata: values.jenisWisata.trim() || null,
    createdAt: new Date().toISOString(),
  }

  await saveReservation(entry)
  sendJson(res, 201, entry)
}

export async function listReservations(req, res) {
  const reservations = await readReservations()
  sendJson(res, 200, { count: reservations.length, reservations })
}
