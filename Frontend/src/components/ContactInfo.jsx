export default function ContactInfo({ phone, whatsapp, email, address }) {
  const items = [
    { label: 'Telepon', value: phone, href: `tel:${phone.replace(/\s|-/g, '')}` },
    { label: 'WhatsApp', value: 'Chat via WhatsApp', href: whatsapp },
    { label: 'Email', value: email, href: `mailto:${email}` },
    { label: 'Alamat', value: address, href: null },
  ]

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-forest-600">
        Kontak
      </p>
      <h2 className="mt-3 font-display text-3xl font-medium text-ink-900 sm:text-4xl">
        Rencanakan kunjunganmu
      </h2>
      <dl className="mt-8 space-y-6">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-sm font-semibold text-forest-700">{item.label}</dt>
            <dd className="mt-1 text-base text-ink-700">
              {item.href ? (
                <a
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                  className="underline decoration-clay-500 decoration-2 underline-offset-4 hover:text-forest-700"
                >
                  {item.value}
                </a>
              ) : (
                item.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
