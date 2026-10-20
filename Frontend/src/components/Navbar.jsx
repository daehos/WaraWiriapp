const links = [
  { href: '#beranda', label: 'Beranda' },
  { href: '#tentang', label: 'Tentang' },
  { href: '#peta-wisata', label: 'Peta Wisata' },
  { href: '#galeri', label: 'Galeri' },
  { href: '#reservasi', label: 'Reservasi' },
  { href: '#kontak', label: 'Kontak' },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-forest-100 bg-sand-50/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#beranda" className="font-display text-lg font-medium text-forest-900">
          WaraWiri Village
        </a>
        <ul className="hidden gap-8 text-sm font-medium text-ink-700 sm:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="transition hover:text-forest-700">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <a
            href="/admin"
            className="rounded-full border border-forest-100 px-4 py-2 text-sm font-semibold text-forest-700 transition hover:bg-forest-100"
          >
            Admin
          </a>
          <a
            href="#kontak"
            className="rounded-full bg-forest-700 px-4 py-2 text-sm font-semibold text-sand-50 transition hover:bg-forest-900"
          >
            Hubungi Kami
          </a>
        </div>
      </nav>
    </header>
  )
}
