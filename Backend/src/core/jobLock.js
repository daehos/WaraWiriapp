// Antrian proses tunggal: dua klik Approve beruntun tidak boleh menjalankan job
// bersamaan (bisa membuat email ganda). Cukup untuk satu proses Backend.
let tail = Promise.resolve()

export function serialize(task) {
  const run = tail.then(task, task)
  tail = run.catch(() => {})
  return run
}
