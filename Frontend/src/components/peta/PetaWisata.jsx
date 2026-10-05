import { useEffect, useRef } from 'react'
import { initPetaWisata } from './initPetaWisata'
import './petaWisata.css'

const ICON_SPRITE = `
<symbol id="ic-foto" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13.5" r="3.4"/></g></symbol>
<symbol id="ic-saung" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 11.5 12 4l9.5 7.5"/><path d="M5.5 10v10M18.5 10v10M4 15.5h16"/></g></symbol>
<symbol id="ic-toilet" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 20v-7a6 6 0 0 1 12 0v7"/><path d="M12 3.5V7M4 20h16M10 20v-3.5a2 2 0 0 1 4 0V20"/></g></symbol>
<symbol id="ic-parkir" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M10 17V8h3.2a2.6 2.6 0 0 1 0 5.2H10"/></g></symbol>
<symbol id="ic-info" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.6v.2"/></g></symbol>
<symbol id="ic-trekking" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2.5 20 6.5-10.5 4 6 2.5-3.5L21.5 20z"/><path d="M15 3.5V9M15 3.5l4 1.6L15 6.7"/></g></symbol>
<symbol id="ic-sanggar" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5c4.5 1.6 9.5 1.6 14 0v6.5a7 7 0 0 1-14 0z"/><path d="M8.8 10.2h1.4M13.8 10.2h1.4M9.5 14.6c1.6 1.3 3.4 1.3 5 0"/></g></symbol>
<symbol id="ic-homestay" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11 12 4l9 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/></g></symbol>
<symbol id="ic-kuliner" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 12h17a8.5 7 0 0 1-17 0z"/><path d="M9 3.5c-1 1.4 1 2.6 0 4.2M13.5 3.5c-1 1.4 1 2.6 0 4.2"/></g></symbol>
<symbol id="ic-kerajinan" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h16l-2 10H6z"/><path d="M8 10a4 4 0 0 1 8 0M5.2 14.5h13.6M9.5 10l.8 10M14.5 10l-.8 10"/></g></symbol>
<symbol id="ic-search" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></g></symbol>
<symbol id="ic-back" viewBox="0 0 24 24"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="ic-close" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></symbol>
<symbol id="ic-pin" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></g></symbol>`

function Icon({ id, className = 'ico' }) {
  return (
    <svg className={className} aria-hidden="true">
      <use href={`#${id}`} />
    </svg>
  )
}

export default function PetaWisata() {
  const rootRef = useRef(null)

  useEffect(() => initPetaWisata(rootRef.current, { allowEditorKey: import.meta.env.DEV }), [])

  return (
    <section id="peta-wisata" ref={rootRef} className="peta-wisata" aria-labelledby="peta-title">
      <svg
        width="0"
        height="0"
        style={{ position: 'absolute' }}
        aria-hidden="true"
        focusable="false"
        dangerouslySetInnerHTML={{ __html: `<defs>${ICON_SPRITE}</defs>` }}
      />

      <div className="peta">
        <header className="peta-head">
          <p className="eyebrow">
            <span className="dot"><Icon id="ic-pin" className="" /></span>
            Jelajahi Peta Wisata Desa Batulayang
          </p>
          <h2 id="peta-title">
            Jelajahi Pesona <span>Desa Wisata Batulayang!</span>
          </h2>
          <p className="lead">
            Temukan keindahan alam terasering, kehangatan homestay warga, kuliner khas, dan
            kebudayaan Cililin.
          </p>
        </header>

        <div className="peta-body" id="peta-body">
          <aside className="legend" aria-labelledby="legend-title">
            <h3 className="block-title" id="legend-title">Zona Wisata</h3>
            <ol className="legend-list" id="legend-list" />
            <p className="legend-hint">
              Arahkan kursor atau ketuk zona untuk melihat spot wisata. Tekan <kbd>Esc</kbd> untuk
              kembali.
            </p>
          </aside>

          <div className="stage" id="stage">
            <div className="water" aria-hidden="true" />
            <div className="map-frame" id="map-frame">
              <div className="skeleton" id="skeleton" role="status">
                <svg viewBox="0 0 200 120" aria-hidden="true">
                  <path d="M100 8 192 56 100 104 8 56z" fill="#bcd9f2" />
                  <path d="M8 56v14l92 48 92-48V56l-92 48z" fill="#a9cde9" />
                </svg>
                <span id="skeleton-text">Memuat peta wisata…</span>
              </div>
              <svg
                id="map"
                role="group"
                aria-label="Peta interaktif Desa Wisata Batulayang. Pilih zona untuk melihat daftar spot."
              />
            </div>
            <button className="back-float" id="back-float" type="button" tabIndex={-1}>
              <Icon id="ic-back" />
              Kembali ke Peta
            </button>
            <div className="tooltip" id="tooltip" aria-hidden="true" />
            <div className="poi-pop" id="poi-pop" role="dialog" aria-modal="false" aria-labelledby="pop-title" hidden />
          </div>

          <nav className="rail" aria-labelledby="rail-title">
            <h3 className="block-title" id="rail-title">Kategori</h3>
            <div className="rail-list" id="rail-list" />
          </nav>

          <aside className="panel" id="panel" aria-hidden="true" aria-labelledby="panel-title">
            <div className="panel-handle" aria-hidden="true" />
            <div className="panel-top">
              <button className="btn-back" id="btn-back" type="button">
                <Icon id="ic-back" />
                Kembali ke Peta
              </button>
            </div>
            <header className="panel-head">
              <span className="num-badge" id="panel-badge" aria-hidden="true">1</span>
              <div>
                <p className="panel-kicker">Zona <span id="panel-num" /></p>
                <h3 id="panel-title">–</h3>
                <p className="panel-count" id="panel-count" />
              </div>
            </header>
            <p className="panel-blurb" id="panel-blurb" />
            <details className="quota" id="quota" hidden>
              <summary className="quota-sum">
                <span className="quota-title">Informasi Kuota Harian</span>
                <span className="quota-status" id="quota-status" />
                <span className="quota-left" id="quota-left" />
              </summary>
              <div className="quota-body">
                <div className="quota-bar" aria-hidden="true">
                  <span id="quota-bar" />
                </div>
                <p className="quota-meta" id="quota-meta" />
                <ul className="quota-sessions" id="quota-sessions" aria-label="Kuota per sesi" />
                <p className="quota-note" id="quota-note" />
              </div>
            </details>
            <label className="search">
              <Icon id="ic-search" className="" />
              <input
                id="poi-search"
                type="search"
                placeholder="Cari nama spot…"
                autoComplete="off"
                aria-label="Cari spot berdasarkan nama"
              />
            </label>
            <div className="chips" id="chips" role="group" aria-label="Filter layanan" />
            <p className="result-line" id="result-line" aria-live="polite" />
            <ul className="poi-list" id="poi-list" aria-label="Daftar spot" />
          </aside>
        </div>

        <div className="poi-strip" aria-labelledby="strip-title">
          <h3 className="block-title" id="strip-title">Keterangan Ikon</h3>
          <ul className="strip-list" id="strip-list" />
        </div>
        <p className="sr-only" id="live" aria-live="polite" />
      </div>
    </section>
  )
}
