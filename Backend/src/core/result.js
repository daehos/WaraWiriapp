// Ringkas hasil job untuk satu reservasi (yang baru di-approve admin).
// Murni — dipakai Backend (/api/guide-notify) dan dashboard admin (mode browser).
export function resultFor(id, summary) {
  const failed = summary.failed.find((f) => f.id === id)
  if (failed) return { status: 'gagal', reason: failed.error }
  const sent = summary.sent.find((s) => s.id === id)
  if (sent) return { status: 'terkirim', guide: sent.guide, to: sent.to }
  const unassigned = summary.unassigned.find((u) => u.id === id)
  if (unassigned) {
    return {
      status: 'tanpa-pemandu',
      reason: unassigned.reason,
      managerNotified: summary.alerts.some((a) => a.id === id),
    }
  }
  const assigned = summary.assigned.find((a) => a.id === id)
  if (assigned) return { status: 'menunggu', guide: assigned.guide }
  return { status: 'tidak-berubah' }
}
