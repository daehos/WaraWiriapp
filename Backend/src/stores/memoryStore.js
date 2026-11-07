// Store di memori untuk tes dan simulasi offline (tanpa Firebase).
export function createMemoryStore({ reservations = [], guides = [] } = {}) {
  const rows = new Map(reservations.map((r) => [r.id, structuredClone(r)]))
  const guideRows = new Map(guides.map((g) => [g.id, structuredClone(g)]))

  return {
    name: 'memory',
    async listConfirmedReservations() {
      return [...rows.values()]
        .filter((r) => r.status === 'dikonfirmasi')
        .map((r) => structuredClone(r))
    },
    async listGuides() {
      return [...guideRows.values()].map((g) => structuredClone(g))
    },
    async updateReservation(id, fields) {
      if (!rows.has(id)) throw new Error(`Reservasi ${id} tidak ada.`)
      Object.assign(rows.get(id), fields)
    },
    // helper simulasi/tes
    addReservation(r) {
      rows.set(r.id, structuredClone(r))
    },
    addGuide(g) {
      guideRows.set(g.id, structuredClone(g))
    },
    get(id) {
      return structuredClone(rows.get(id))
    },
    all() {
      return [...rows.values()].map((r) => structuredClone(r))
    },
  }
}
