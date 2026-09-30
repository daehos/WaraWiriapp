export default function Footer({ name }) {
  return (
    <footer className="border-t border-forest-100 bg-forest-900 px-6 py-8 text-sand-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} {name}. Dibuat dengan semangat wisata berkelanjutan.</p>
        <p className="text-sand-100/70">Foto: Unsplash (placeholder, akan diganti dengan foto asli desa)</p>
      </div>
    </footer>
  )
}
