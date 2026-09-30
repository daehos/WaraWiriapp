export default function Hero({ name, tagline, image }) {
  return (
    <section id="beranda" className="relative isolate overflow-hidden">
      <img
        src={image}
        alt={`Pemandangan alam ${name}`}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/30 to-ink-900/10" />
      <div className="relative mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-end px-6 pb-16 pt-32 sm:min-h-[80vh]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sand-100">
          Desa Wisata Berkelanjutan
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-medium text-sand-50 sm:text-6xl">
          {name}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-sand-100">{tagline}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#tentang"
            className="rounded-full bg-sand-50 px-6 py-3 text-sm font-semibold text-forest-900 transition hover:bg-sand-100"
          >
            Kenali Desa Kami
          </a>
          <a
            href="#reservasi"
            className="rounded-full border border-sand-50/60 px-6 py-3 text-sm font-semibold text-sand-50 transition hover:bg-sand-50/10"
          >
            Rencanakan Kunjungan
          </a>
        </div>
      </div>
    </section>
  )
}
