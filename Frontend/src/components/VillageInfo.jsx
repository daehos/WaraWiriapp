export default function VillageInfo({ description, highlights }) {
  return (
    <section id="tentang" className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-forest-600">
            Tentang Desa
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium text-ink-900 sm:text-4xl">
            Wisata yang tumbuh bersama warganya
          </h2>
        </div>
        <p className="text-lg leading-relaxed text-ink-700">{description}</p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-forest-100 bg-forest-50 p-6"
          >
            <h3 className="font-display text-lg font-medium text-forest-900">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
