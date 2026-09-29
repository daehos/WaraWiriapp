import { useEffect, useState } from 'react'

const AUTO_ADVANCE_MS = 5000

export default function Carousel({ images }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % images.length)
    }, AUTO_ADVANCE_MS)
    return () => clearInterval(timer)
  }, [images.length])

  const goTo = (next) => setIndex((next + images.length) % images.length)

  return (
    <section id="galeri" className="mx-auto max-w-6xl px-6 pb-20">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-forest-600">
        Galeri
      </p>
      <h2 className="mt-3 font-display text-3xl font-medium text-ink-900 sm:text-4xl">
        Sekilas suasana desa
      </h2>

      <div className="relative mt-8 overflow-hidden rounded-3xl">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((image) => (
            <img
              key={image.src}
              src={image.src}
              alt={image.alt}
              className="aspect-[16/9] w-full flex-shrink-0 object-cover"
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => goTo(index - 1)}
          aria-label="Foto sebelumnya"
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-ink-900/50 p-2 text-sand-50 transition hover:bg-ink-900/70"
        >
          <ArrowIcon direction="left" />
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          aria-label="Foto berikutnya"
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-ink-900/50 p-2 text-sand-50 transition hover:bg-ink-900/70"
        >
          <ArrowIcon direction="right" />
        </button>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((image, dotIndex) => (
            <button
              key={image.src}
              type="button"
              onClick={() => goTo(dotIndex)}
              aria-label={`Ke foto ${dotIndex + 1}`}
              className={`h-2 rounded-full transition-all ${
                dotIndex === index ? 'w-6 bg-sand-50' : 'w-2 bg-sand-50/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function ArrowIcon({ direction }) {
  const rotation = direction === 'left' ? 'rotate-180' : ''
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`h-4 w-4 ${rotation}`}
      aria-hidden="true"
    >
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
