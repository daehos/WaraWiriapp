import {
  CATEGORIES,
  COORD_SPACE,
  MAP_IMAGE_URL,
  POIS,
  POI_TYPES,
  QUOTAS,
  QUOTA_UPDATED_AT,
  REGIONS,
  SERVICES,
  SKY,
  STRIP_TYPES,
} from './petaData'

const NS = 'http://www.w3.org/2000/svg'

function el(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag)
  if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k])
  if (parent) parent.appendChild(n)
  return n
}
function h(tag, cls, text) {
  const n = document.createElement(tag)
  if (cls) n.className = cls
  if (text != null) n.textContent = text
  return n
}
const iconSvg = (id, cls = 'ico') => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const ptsAttr = (pts) => pts.map((p) => p[0] + ',' + p[1]).join(' ')
const isLight = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 165
}
function mix(hex, to, t) {
  const a = parseInt(hex.slice(1), 16)
  const b = parseInt(to.slice(1), 16)
  const c = [16, 8, 0].map((s) => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t))
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('')
}
function pointInPolygon([x, y], poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
function centroid(pts) {
  let a = 0
  let cx = 0
  let cy = 0
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const f = pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1]
    a += f
    cx += (pts[j][0] + pts[i][0]) * f
    cy += (pts[j][1] + pts[i][1]) * f
  }
  return a ? [cx / (3 * a), cy / (3 * a)] : pts[0]
}
function bbox(pts) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
  for (const [x, y] of pts) {
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y)
  }
  return { x0, y0, x1, y1 }
}
/* Poligon klip sedikit diperbesar agar tidak ada garis celah anti-alias di antara zona. */
function offsetPolygon(pts, d) {
  let area = 0
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) area += pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1]
  const sign = area > 0 ? 1 : -1
  const n = pts.length
  const normal = (a, b) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1
    return [(sign * dy) / l, (-sign * dx) / l]
  }
  return pts.map((p, i) => {
    const n1 = normal(pts[(i - 1 + n) % n], p)
    const n2 = normal(p, pts[(i + 1) % n])
    let mx = n1[0] + n2[0], my = n1[1] + n2[1]
    const ml = Math.hypot(mx, my) || 1
    mx /= ml; my /= ml
    const k = d / Math.max(0.35, mx * n1[0] + my * n1[1])
    return [+(p[0] + mx * k).toFixed(2), +(p[1] + my * k).toFixed(2)]
  })
}

/**
 * Menghidupkan peta wisata di dalam `rootEl` (markup dari PetaWisata.jsx).
 * Mengembalikan fungsi cleanup yang membatalkan semua listener dan
 * menghapus node yang dibuat, sehingga aman untuk StrictMode.
 */
export function initPetaWisata(rootEl, { imageUrl = MAP_IMAGE_URL, allowEditorKey = false } = {}) {
  const ac = new AbortController()
  const sig = { signal: ac.signal }
  const timers = new Set()
  const later = (fn, ms) => {
    const t = setTimeout(() => { timers.delete(t); fn() }, ms)
    timers.add(t)
    return t
  }
  let disposed = false
  let resizeObserver = null

  const $ = (s) => rootEl.querySelector(s)
  const svg = $('#map')
  const frame = $('#map-frame')
  const stage = $('#stage')
  const body = $('#peta-body')
  const panel = $('#panel')
  const tooltip = $('#tooltip')
  const pop = $('#poi-pop')
  const backFloat = $('#back-float')
  const live = $('#live')
  const searchInput = $('#poi-search')
  const sheetMQ = matchMedia('(max-width: 759px)')
  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)')

  const byId = Object.fromEntries(REGIONS.map((r) => [r.id, r]))
  const regionEls = {}
  const pinEls = []
  const listEls = []
  const legendEls = {}
  const railEls = {}
  const chipEls = {}

  const state = {
    hover: null, selected: null, category: null,
    chips: new Set(), search: '',
    hlPoi: null, popPoi: null,
    edit: false, loaded: false,
    cam: { s: 1, tx: 0, ty: 0 },
    vb: { w: COORD_SPACE.w, h: COORD_SPACE.h }, sx: 1, sy: 1,
  }
  let camera, space, zonesG, pinsG, hitsG, socketsG
  let filterTimer = null

  /* ---------- Derived data ---------- */
  const poiMatchesCategory = (p) => !state.category || p.services.includes(state.category)
  const countFor = (regionId) => POIS.filter((p) => p.region === regionId && poiMatchesCategory(p)).length
  const totalFor = (regionId) => POIS.filter((p) => p.region === regionId).length
  const spotLabel = (n) => `${n} Spot`
  function visiblePoiIdx(regionId) {
    const q = state.search.trim().toLowerCase()
    const out = []
    POIS.forEach((p, i) => {
      if (p.region !== regionId) return
      if (!poiMatchesCategory(p)) return
      if (state.chips.size && !p.services.some((s) => state.chips.has(s))) return
      if (q && !p.name.toLowerCase().includes(q)) return
      out.push(i)
    })
    return out
  }

  /* =====================================================================
   * Static UI (legend, rail, chips, list, strip)
   * ===================================================================== */
  function buildLegend() {
    const list = $('#legend-list')
    REGIONS.forEach((r) => {
      const li = h('li')
      const b = h('button', 'lg-item')
      b.type = 'button'
      b.style.setProperty('--c', r.color)
      b.innerHTML = `<span class="num-badge${isLight(r.color) ? ' on-light' : ''}" style="--c:${r.color}">${r.number}</span>
        <span class="lg-text"><strong>${esc(r.nameId)}</strong><span class="lg-count"></span></span>`
      b.addEventListener('pointerenter', () => setHover(r.id, 'legend'))
      b.addEventListener('pointerleave', () => setHover(null, 'legend'))
      b.addEventListener('focus', () => setHover(r.id, 'legend'))
      b.addEventListener('blur', () => setHover(null, 'legend'))
      b.addEventListener('click', () => select(r.id))
      li.appendChild(b)
      list.appendChild(li)
      legendEls[r.id] = b
    })
  }
  function buildRail() {
    const wrap = $('#rail-list')
    CATEGORIES.forEach((c) => {
      const b = h('button', 'cat')
      b.type = 'button'
      b.setAttribute('aria-pressed', 'false')
      b.innerHTML = `<span class="cat-ico">${iconSvg(c.icon)}</span><span class="cat-label">${c.id}</span><span class="cat-count">0</span>`
      b.addEventListener('click', () => setCategory(state.category === c.id ? null : c.id))
      wrap.appendChild(b)
      railEls[c.id] = b
    })
  }
  function buildChips() {
    const wrap = $('#chips')
    SERVICES.forEach((s) => {
      const b = h('button', 'chip', s)
      b.type = 'button'
      b.setAttribute('aria-pressed', 'false')
      b.addEventListener('click', () => {
        if (state.chips.has(s)) state.chips.delete(s)
        else state.chips.add(s)
        b.setAttribute('aria-pressed', String(state.chips.has(s)))
        refreshFilters()
      })
      wrap.appendChild(b)
      chipEls[s] = b
    })
  }
  function buildList() {
    const ul = $('#poi-list')
    POIS.forEach((p, i) => {
      const r = byId[p.region]
      const t = POI_TYPES[p.type] || POI_TYPES.info
      const li = h('li', 'poi-item')
      li.hidden = true
      li.innerHTML = `<button type="button" class="poi-btn">
          <span class="poi-ico" style="background:${r.color}">${iconSvg(t.icon, '')}</span>
          <span class="poi-main">
            <span class="poi-name">${esc(p.name)}</span>
            <span class="poi-meta">${esc(t.label)} · ${esc(p.tag)}</span>
            <span class="poi-desc">${esc(p.description)}</span>
          </span>
        </button>`
      const btn = li.firstElementChild
      btn.addEventListener('pointerenter', () => setPoiHl(i))
      btn.addEventListener('pointerleave', () => setPoiHl(null))
      btn.addEventListener('focus', () => setPoiHl(i))
      btn.addEventListener('blur', () => setPoiHl(null))
      btn.addEventListener('click', () => openPopover(i, btn))
      ul.appendChild(li)
      listEls[i] = li
    })
    const empty = h('li', 'poi-empty', 'Tidak ada spot yang cocok dengan pencarian atau filter.')
    empty.id = 'poi-empty'
    empty.hidden = true
    ul.appendChild(empty)
  }
  function buildStrip() {
    const ul = $('#strip-list')
    STRIP_TYPES.forEach((k) => {
      const t = POI_TYPES[k]
      const li = h('li')
      li.innerHTML = `<span class="strip-ico">${iconSvg(t.icon, '')}</span>${esc(t.label)}`
      ul.appendChild(li)
    })
  }

  /* =====================================================================
   * SVG map (built once after the PNG is loaded)
   * ===================================================================== */
  function buildMap(natW, natH) {
    const { w: CW, h: CH } = COORD_SPACE
    state.vb = { w: natW, h: natH }
    state.sx = natW / CW
    state.sy = natH / CH
    svg.setAttribute('viewBox', `0 0 ${natW} ${natH}`)
    frame.style.aspectRatio = `${natW} / ${natH}`

    const defs = el('defs', null, svg)
    defs.innerHTML = `
      <filter id="f-socket" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
        <feColorMatrix type="saturate" values="0.3"/>
        <feComponentTransfer><feFuncR type="linear" slope="0.55"/><feFuncG type="linear" slope="0.58"/><feFuncB type="linear" slope="0.62"/></feComponentTransfer>
      </filter>
      <filter id="f-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>
      <filter id="f-feather" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.5"/></filter>
      <filter id="f-badge" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity=".3"/></filter>`

    camera = el('g', { id: 'camera' }, svg)
    space = el('g', { id: 'space', transform: `scale(${state.sx} ${state.sy})` }, camera)
    const imgAttrs = (extra) => Object.assign({ href: imageUrl, x: 0, y: 0, width: CW, height: CH, preserveAspectRatio: 'none' }, extra)

    const mask = el('mask', { id: 'm-backdrop', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: CW, height: CH }, defs)
    el('rect', { x: 0, y: 0, width: CW, height: CH, fill: '#fff' }, mask)

    REGIONS.forEach((r) => {
      const poly = el('polygon', { id: `rp-${r.id}`, points: ptsAttr(r.points) }, defs)
      const els = (regionEls[r.id] = { poly })
      if (r.kind === 'zone') {
        const cp = el('clipPath', { id: `clip-${r.id}`, clipPathUnits: 'userSpaceOnUse' }, defs)
        els.clipPoly = el('polygon', { points: ptsAttr(offsetPolygon(r.points, 0.9)) }, cp)
        el('use', { href: `#rp-${r.id}`, fill: '#000' }, mask)
      }
    })

    // a) Base "socket" layer: dimmed + desaturated
    el('image', imgAttrs({ class: 'base', filter: 'url(#f-socket)', 'aria-hidden': 'true' }), space)
    // Backdrop: full-brightness artwork outside the zones (sky, mountain, labels)
    el('image', imgAttrs({ class: 'backdrop', mask: 'url(#m-backdrop)', 'aria-hidden': 'true' }), space)

    const sky = el('g', { id: 'sky', 'aria-hidden': 'true' }, space)
    SKY.forEach((c) => {
      if (c.patch) el('polygon', { points: ptsAttr(c.points), fill: c.patch, filter: 'url(#f-feather)' }, sky)
      const m = el('mask', { id: `m-${c.id}`, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: CW, height: CH }, defs)
      el('polygon', { points: ptsAttr(c.points), fill: '#fff', filter: 'url(#f-feather)' }, m)
      const g = el('g', { class: 'cloud', 'data-drift': c.drift }, sky)
      el('image', imgAttrs({ mask: `url(#m-${c.id})` }), g)
    })

    socketsG = el('g', { id: 'sockets', 'aria-hidden': 'true' }, space)
    zonesG = el('g', { id: 'zones' }, space)
    hitsG = el('g', { id: 'hits' }, space)
    pinsG = el('g', { id: 'pins' }, space)

    REGIONS.forEach((r) => {
      const els = regionEls[r.id]
      els.socket = el('use', { href: `#rp-${r.id}`, class: 'socket', fill: '#06140f' }, socketsG)

      const g = el('g', { class: 'zone', 'data-id': r.id, 'aria-hidden': 'true' }, zonesG)
      els.zone = g
      el('use', { href: `#rp-${r.id}`, class: 'zone-shadow', transform: 'translate(3 14)', fill: '#0b2620', filter: 'url(#f-soft)' }, g)

      if (r.kind === 'zone') {
        el('image', imgAttrs({ 'clip-path': `url(#clip-${r.id})` }), g)
        const b = el('g', { class: 'badge', transform: `translate(${r.labelAnchor[0]} ${r.labelAnchor[1]})` }, g)
        const bs = el('g', { class: 'badge-scale' }, b)
        el('circle', { r: 14, fill: r.color, stroke: '#fff', 'stroke-width': 3, filter: 'url(#f-badge)' }, bs)
        const t = el('text', { class: 'badge-num', 'text-anchor': 'middle', dy: '.36em', 'font-size': 14, fill: isLight(r.color) ? '#3b2a00' : '#fff' }, bs)
        t.textContent = r.number
        els.badge = b
      } else {
        el('use', { href: `#rp-${r.id}`, transform: 'translate(0 8)', fill: mix(r.color, '#112233', 0.35) }, g)
        el('use', { href: `#rp-${r.id}`, fill: mix(r.color, '#ffffff', 0.78), stroke: '#fff', 'stroke-width': 2, 'stroke-linejoin': 'round' }, g)
        els.decor = el('g', { 'pointer-events': 'none' }, g)
        els.pill = el('g', { class: 'pill' }, g)
        renderTabDecor(r)
        renderPill(r)
      }

      els.hit = el('use', {
        href: `#rp-${r.id}`, class: 'hit', 'data-id': r.id, tabindex: 0, role: 'button',
        'aria-label': `Zona ${r.number}: ${r.nameId}, ${totalFor(r.id)} spot. Tekan Enter untuk membuka.`,
      }, hitsG)
      if (r.kind === 'tab') {
        els.pillHit = el('rect', { class: 'hit', 'data-id': r.id, rx: 12, 'aria-hidden': 'true' }, hitsG)
        placePillHit(r)
      }
    })

    POIS.forEach((p, i) => {
      const r = byId[p.region]
      nudgeInside(p, r)
      const t = POI_TYPES[p.type] || POI_TYPES.info
      const g = el('g', { class: 'pin', 'data-i': i, transform: `translate(${p.x} ${p.y})`, tabindex: -1, role: 'button', 'aria-label': `${p.name} (${t.label})` }, pinsG)
      const sc = el('g', { class: 'pin-scale' }, g)
      const dr = el('g', { class: 'pin-drop' }, sc)
      const bd = el('g', { class: 'pin-body' }, dr)
      el('ellipse', { cx: 0, cy: 0, rx: 7, ry: 2.6, fill: 'rgba(0,0,0,.32)' }, bd)
      el('circle', { class: 'pin-ring', cx: 0, cy: -21, r: 18, fill: 'none', stroke: r.color, 'stroke-width': 3, 'stroke-opacity': '.45' }, bd)
      el('path', { class: 'pin-head', d: 'M0 0C-2.6-5.6-12-11.4-12-21a12 12 0 1 1 24 0c0 9.6-9.4 15.4-12 21z', fill: r.color, stroke: '#fff', 'stroke-width': 2.2 }, bd)
      el('use', { href: `#${t.icon}`, x: -7.5, y: -28.5, width: 15, height: 15, color: '#fff' }, bd)
      pinEls[i] = g
    })

    bindMapEvents()
  }

  function nudgeInside(p, r) {
    if (pointInPolygon([p.x, p.y], r.points)) return
    const target = pointInPolygon(r.labelAnchor, r.points) ? r.labelAnchor : centroid(r.points)
    for (let t = 0.05; t <= 1.0001; t += 0.05) {
      const q = [p.x + (target[0] - p.x) * t, p.y + (target[1] - p.y) * t]
      if (pointInPolygon(q, r.points)) {
        p.x = Math.round(q[0])
        p.y = Math.round(q[1])
        return
      }
    }
  }

  function renderTabDecor(r) {
    const g = regionEls[r.id].decor
    g.textContent = ''
    const p = r.points
    if (p.length < 4) return
    const a = [(p[0][0] + p[1][0]) / 2, (p[0][1] + p[1][1]) / 2]
    const b = [(p[2][0] + p[3][0]) / 2, (p[2][1] + p[3][1]) / 2]
    el('line', { x1: b[0], y1: b[1], x2: a[0], y2: a[1], stroke: r.color, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', 'stroke-linecap': 'round', opacity: 0.8 }, g)
    const dx = a[0] - b[0], dy = a[1] - b[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L
    const tip = [a[0] - ux * 8, a[1] - uy * 8]
    const back = [tip[0] - ux * 11, tip[1] - uy * 11]
    el('path', { d: `M${back[0] - uy * 7} ${back[1] + ux * 7}L${tip[0]} ${tip[1]}L${back[0] + uy * 7} ${back[1] - ux * 7}`, fill: 'none', stroke: r.color, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g)
  }
  function pillGeom(r) {
    const w = Math.round(34 + (r.pillText || r.short).length * 6.9)
    const x = clamp(r.labelAnchor[0], w / 2 + 4, COORD_SPACE.w - w / 2 - 4)
    const y = clamp(r.labelAnchor[1], 15, COORD_SPACE.h - 15)
    return { w, x, y }
  }
  function renderPill(r) {
    const g = regionEls[r.id].pill
    const { w, x, y } = pillGeom(r)
    g.textContent = ''
    g.setAttribute('transform', `translate(${x} ${y})`)
    el('rect', { x: -w / 2, y: -12, width: w, height: 24, rx: 12, fill: '#fff', stroke: r.color, 'stroke-width': 2, filter: 'url(#f-badge)' }, g)
    el('circle', { cx: -w / 2 + 12, cy: 0, r: 8.5, fill: r.color }, g)
    const n = el('text', { class: 'pill-text', x: -w / 2 + 12, dy: '.35em', 'text-anchor': 'middle', 'font-size': 11, fill: '#fff' }, g)
    n.textContent = r.number
    const t = el('text', { class: 'pill-text', x: -w / 2 + 26, dy: '.35em', 'font-size': 12, fill: '#173a33' }, g)
    t.textContent = r.pillText || r.short
  }
  function placePillHit(r) {
    const { w, x, y } = pillGeom(r)
    const rc = regionEls[r.id].pillHit
    rc.setAttribute('x', x - w / 2)
    rc.setAttribute('y', y - 12)
    rc.setAttribute('width', w)
    rc.setAttribute('height', 24)
  }

  /* =====================================================================
   * Hover / lift
   * ===================================================================== */
  function applyLift() {
    REGIONS.forEach((r) => {
      const els = regionEls[r.id]
      if (!els || !els.zone) return
      const should = !state.edit && (r.id === state.hover || r.id === state.selected)
      const is = els.zone.classList.contains('is-lifted')
      if (should && !is) {
        zonesG.appendChild(els.zone)
        void getComputedStyle(els.zone).transform
        els.zone.classList.add('is-lifted')
      } else if (!should && is) {
        els.zone.classList.remove('is-lifted')
      }
      els.socket.classList.toggle('on', should)
      els.hit.setAttribute('aria-pressed', String(r.id === state.selected))
    })
    if (state.hover && state.selected && state.hover !== state.selected) {
      zonesG.appendChild(regionEls[state.hover].zone)
    }
    svg.classList.toggle('has-focus', !!state.hover && !state.selected)
    svg.classList.toggle('has-selection', !!state.selected)
    REGIONS.forEach((r) => legendEls[r.id].classList.toggle('is-active', r.id === state.hover || r.id === state.selected))
  }

  function setHover(id, source) {
    if (state.edit || !state.loaded) return
    if (state.hover === id) return
    state.hover = id
    applyLift()
    if (!id || source === 'legend') hideTooltip()
  }

  function showTooltipAt(r, clientX, clientY) {
    const sr = stage.getBoundingClientRect()
    const n = countFor(r.id)
    tooltip.innerHTML = `${esc(r.short)} <i>· ${spotLabel(n)}${state.category ? ' ' + esc(state.category) : ''}</i>`
    const tw = tooltip.offsetWidth
    const th = tooltip.offsetHeight
    const x = clamp(clientX - sr.left + 14, 6, sr.width - tw - 6)
    let y = clientY - sr.top - th - 14
    if (y < 6) y = clientY - sr.top + 18
    tooltip.style.transform = `translate3d(${x}px, ${y}px, 0)`
    tooltip.classList.add('on')
  }
  const hideTooltip = () => tooltip.classList.remove('on')
  function anchorClientPos(r) {
    const p = new DOMPoint(r.labelAnchor[0], r.labelAnchor[1]).matrixTransform(space.getScreenCTM())
    return [p.x, p.y]
  }

  /* =====================================================================
   * Camera (zoom & pan via CSS transform on #camera)
   * ===================================================================== */
  const isSheet = () => sheetMQ.matches
  function setCamera(s, tx, ty) {
    state.cam = { s, tx, ty }
    camera.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`
    updateScales()
  }
  function updateScales() {
    if (!camera) return
    const k = frame.clientWidth / state.vb.w || 1
    const z = k * state.cam.s * state.sx
    const pinPx = isSheet() ? 28 : 32
    const ps = (pinPx / 34 / z) * (state.selected || state.edit ? 1 : 0.82)
    svg.style.setProperty('--ps', ps.toFixed(4))
    svg.style.setProperty('--bs', clamp(1 / z, 0.55, 1.9).toFixed(4))
  }
  function frameRegion(r) {
    const { w: W, h: H } = state.vb
    const rect = frame.getBoundingClientRect()
    const k = rect.width / W
    let aL = 0, aT = 0, aR = W, aB = H
    if (panel.classList.contains('open')) {
      if (isSheet()) {
        const topPad = parseFloat(getComputedStyle(frame).scrollMarginTop) || 12
        const usable = window.innerHeight - panel.offsetHeight - topPad - 8
        aB = clamp(usable / k, 120 / k, H)
      } else {
        const panelLeft = body.getBoundingClientRect().right - panel.offsetWidth
        aR = clamp((panelLeft - 14 - rect.left) / k, W * 0.35, W)
      }
    }
    const b = bbox(r.points)
    const pad = 26
    const x0 = (b.x0 - pad) * state.sx, x1 = (b.x1 + pad) * state.sx
    const y0 = (b.y0 - pad - 12) * state.sy, y1 = (b.y1 + pad) * state.sy
    const s = clamp(Math.min((aR - aL) / (x1 - x0), (aB - aT) / (y1 - y0)), 1, 2.8)
    let tx = (aL + aR) / 2 - (s * (x0 + x1)) / 2
    let ty = (aT + aB) / 2 - (s * (y0 + y1)) / 2
    tx = clamp(tx, aR - s * W, aL)
    ty = clamp(ty, aB - s * H, aT)
    setCamera(s, tx, ty)
  }
  const resetCamera = () => setCamera(1, 0, 0)

  /* =====================================================================
   * Kuota harian
   * ===================================================================== */
  const quotaLevel = (booked, capacity) => {
    const ratio = capacity ? booked / capacity : 1
    if (ratio >= 1) return { key: 'full', label: 'Penuh' }
    if (ratio >= 0.8) return { key: 'low', label: 'Hampir Penuh' }
    return { key: 'ok', label: 'Tersedia' }
  }

  function renderQuota(id) {
    const box = $('#quota')
    const q = QUOTAS[id]
    box.hidden = !q
    if (!q) return
    const capacity = q.sessions.reduce((n, s) => n + s.capacity, 0)
    const booked = Math.min(capacity, q.sessions.reduce((n, s) => n + s.booked, 0))
    const left = capacity - booked
    const level = quotaLevel(booked, capacity)

    box.dataset.level = level.key
    box.open = false
    $('#quota-status').textContent = level.label
    $('#quota-left').textContent = left ? `Sisa ${left} ${q.unit}` : `Kuota ${q.unit} habis`
    $('#quota-bar').style.transform = `scaleX(${capacity ? booked / capacity : 1})`
    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
    $('#quota-meta').textContent = `${booked} dari ${capacity} ${q.unit} terisi · ${today} · diperbarui ${QUOTA_UPDATED_AT}`
    $('#quota-note').textContent = q.note || ''

    const list = $('#quota-sessions')
    list.replaceChildren()
    for (const s of q.sessions) {
      const sLeft = Math.max(0, s.capacity - s.booked)
      const sLevel = quotaLevel(s.booked, s.capacity)
      const li = document.createElement('li')
      li.className = 'quota-row'
      li.dataset.level = sLevel.key
      const info = document.createElement('div')
      const name = document.createElement('strong')
      name.textContent = s.label
      const time = document.createElement('span')
      time.textContent = s.time
      info.append(name, time)
      const val = document.createElement('span')
      val.className = 'quota-val'
      val.textContent = sLeft ? `${sLeft}/${s.capacity}` : 'Penuh'
      val.setAttribute('aria-label', sLeft ? `Sisa ${sLeft} dari ${s.capacity} ${q.unit}` : 'Penuh')
      li.append(info, val)
      list.append(li)
    }
  }

  /* =====================================================================
   * Select / back
   * ===================================================================== */
  function select(id) {
    if (state.edit || !state.loaded) return
    const r = byId[id]
    if (!r || state.selected === id) return
    const switching = !!state.selected
    state.selected = id
    closePopover()
    hideTooltip()
    state.search = ''
    searchInput.value = ''

    const badge = $('#panel-badge')
    badge.textContent = r.number
    badge.style.setProperty('--c', r.color)
    badge.classList.toggle('on-light', isLight(r.color))
    $('#panel-num').textContent = r.number
    $('#panel-title').textContent = r.nameId
    $('#panel-blurb').textContent = r.blurb || ''
    renderQuota(id)

    panel.classList.add('open')
    panel.setAttribute('aria-hidden', 'false')
    applyLift()
    refreshFilters({ restartPins: true, pinDelay: switching ? 120 : 260 })
    updateRailCounts()
    backFloat.classList.add('on')
    backFloat.tabIndex = 0

    if (isSheet()) frame.scrollIntoView({ block: 'start', behavior: reduceMQ.matches ? 'auto' : 'smooth' })
    requestAnimationFrame(() => { if (!disposed) frameRegion(r) })

    history.replaceState(null, '', '#zona-' + id)
    live.textContent = `Zona ${r.number}, ${r.nameId}, dibuka. ${spotLabel(totalFor(id))}.`
  }

  function back() {
    if (!state.selected) return
    const prev = state.selected
    state.selected = null
    state.hlPoi = null
    closePopover()
    panel.classList.remove('open')
    panel.setAttribute('aria-hidden', 'true')
    applyLift()
    resetCamera()
    updatePins({ restart: !!state.category })
    updateRailCounts()
    backFloat.classList.remove('on')
    backFloat.tabIndex = -1
    if (location.hash.startsWith('#zona-')) history.replaceState(null, '', location.pathname + location.search)
    live.textContent = 'Kembali ke peta lengkap.'
    const hit = regionEls[prev] && regionEls[prev].hit
    if (hit && panel.contains(document.activeElement)) hit.focus({ preventScroll: true })
  }

  /* =====================================================================
   * Filters, list, pins
   * ===================================================================== */
  function refreshFilters(opts = {}) {
    const id = state.selected
    if (id) {
      const vis = new Set(visiblePoiIdx(id))
      POIS.forEach((p, i) => { listEls[i].hidden = !vis.has(i) })
      $('#poi-empty').hidden = vis.size > 0
      const total = totalFor(id)
      const inCat = countFor(id)
      $('#panel-count').innerHTML = state.category
        ? `<strong>${spotLabel(total)}</strong> · ${inCat} untuk ${esc(state.category)}`
        : `<strong>${spotLabel(total)}</strong> di zona ini`
      $('#result-line').textContent = vis.size === total ? `Menampilkan semua ${total} spot` : `Menampilkan ${vis.size} dari ${total} spot`
      if (state.popPoi != null && !vis.has(state.popPoi)) closePopover()
    }
    SERVICES.forEach((s) => chipEls[s].classList.toggle('is-locked', state.category === s && !state.chips.has(s)))
    if (opts.restartPins) {
      hidePins()
      clearTimeout(filterTimer)
      filterTimer = later(() => updatePins({ restart: true }), opts.pinDelay || 0)
    } else {
      updatePins({ restart: false })
    }
  }

  function pinTargetSet() {
    if (state.edit) return new Set(POIS.map((_, i) => i))
    if (state.selected) return new Set(visiblePoiIdx(state.selected))
    if (state.category) return new Set(POIS.map((p, i) => (p.services.includes(state.category) ? i : -1)).filter((i) => i >= 0))
    return new Set()
  }
  function hidePins() {
    pinEls.forEach((g) => {
      g.classList.remove('show', 'hl')
      g.tabIndex = -1
    })
  }
  function updatePins({ restart }) {
    if (!pinsG) return
    const target = pinTargetSet()
    updateScales()
    if (restart) {
      hidePins()
      void svg.getBoundingClientRect()
    }
    let order = 0
    pinEls.forEach((g, i) => {
      const on = target.has(i)
      const was = g.classList.contains('show')
      if (on && !was) {
        g.style.setProperty('--d', `${Math.min(order++, 14) * 55}ms`)
        g.classList.add('show')
      } else if (!on && was) {
        g.classList.remove('show', 'hl')
      }
      g.tabIndex = on && !state.edit ? 0 : -1
    })
  }

  function setPoiHl(i, fromPin) {
    if (state.hlPoi === i) return
    if (state.hlPoi != null) {
      pinEls[state.hlPoi]?.classList.remove('hl')
      listEls[state.hlPoi]?.classList.remove('hl')
    }
    state.hlPoi = i
    if (i == null) return
    const g = pinEls[i]
    if (g) {
      g.classList.add('hl')
      g.parentNode.appendChild(g)
    }
    if (listEls[i]) {
      listEls[i].classList.add('hl')
      if (fromPin && panel.classList.contains('open') && !listEls[i].hidden) {
        listEls[i].scrollIntoView({ block: 'nearest', behavior: reduceMQ.matches ? 'auto' : 'smooth' })
      }
    }
  }

  function setCategory(cat) {
    state.category = cat
    CATEGORIES.forEach((c) => railEls[c.id].setAttribute('aria-pressed', String(c.id === cat)))
    svg.classList.toggle('has-category', !!cat)
    REGIONS.forEach((r) => regionEls[r.id]?.zone?.classList.toggle('is-served', countFor(r.id) > 0))
    updateLegendCounts()
    if (state.selected) refreshFilters()
    else updatePins({ restart: true })
    live.textContent = cat
      ? `Filter kategori ${cat} aktif: ${POIS.filter((p) => p.services.includes(cat)).length} spot.`
      : 'Filter kategori dinonaktifkan.'
  }

  function updateLegendCounts() {
    REGIONS.forEach((r) => {
      const n = countFor(r.id)
      const b = legendEls[r.id]
      b.querySelector('.lg-count').textContent = state.category ? `${n} spot ${state.category}` : `${n} spot`
      b.classList.toggle('is-muted', !!state.category && n === 0)
      b.setAttribute('aria-label', `Zona ${r.number}: ${r.nameId}, ${n} spot`)
    })
  }
  function updateRailCounts() {
    CATEGORIES.forEach((c) => {
      const n = POIS.filter((p) => p.services.includes(c.id) && (!state.selected || p.region === state.selected)).length
      railEls[c.id].querySelector('.cat-count').textContent = n
      railEls[c.id].setAttribute('aria-label', `${c.id}: ${n} spot${state.selected ? ' di zona ini' : ''}`)
    })
  }

  /* =====================================================================
   * POI popover
   * ===================================================================== */
  function openPopover(i, returnFocusEl) {
    if (state.edit) return
    const p = POIS[i]
    const r = byId[p.region]
    const t = POI_TYPES[p.type] || POI_TYPES.info
    state.popPoi = i
    pop.returnFocus = returnFocusEl || pinEls[i]
    pop.innerHTML = `
      <button class="pop-close" type="button" aria-label="Tutup">${iconSvg('ic-close')}</button>
      <div class="pop-head">
        <span class="pop-ico" style="background:${r.color}">${iconSvg(t.icon)}</span>
        <div><p class="pop-kicker">${esc(t.label)} · Zona ${r.number}</p><h3 class="pop-title" id="pop-title">${esc(p.name)}</h3></div>
      </div>
      <p class="pop-desc">${esc(p.description)}</p>
      <div class="pop-tags">${p.services.map((s) => `<span>${esc(s)}</span>`).join('')}</div>
      <p class="pop-loc">${iconSvg('ic-pin')}${esc(p.tag)} · ${esc(r.short)}</p>`
    pop.querySelector('.pop-close').addEventListener('click', () => closePopover(true))
    pop.hidden = false
    pop.classList.remove('on')
    positionPopover()
    requestAnimationFrame(() => pop.classList.add('on'))
    setPoiHl(i)
  }
  function positionPopover() {
    if (state.popPoi == null) return
    const pr = pinEls[state.popPoi].querySelector('.pin-head').getBoundingClientRect()
    const sr = stage.getBoundingClientRect()
    const pw = pop.offsetWidth
    const ph = pop.offsetHeight
    let maxX = sr.width
    if (panel.classList.contains('open') && !isSheet()) {
      maxX = Math.min(maxX, body.getBoundingClientRect().right - panel.offsetWidth - sr.left)
    }
    const cx = pr.left + pr.width / 2 - sr.left
    const left = clamp(cx - pw / 2, 8, Math.max(8, maxX - pw - 8))
    let top = pr.top - sr.top - ph - 12
    const below = top < 6
    if (below) top = pr.bottom - sr.top + 12
    pop.classList.toggle('below', below)
    pop.style.left = left + 'px'
    pop.style.top = top + 'px'
    pop.style.setProperty('--ax', clamp(cx - left, 18, pw - 18) + 'px')
  }
  function closePopover(restoreFocus) {
    if (state.popPoi == null) return
    state.popPoi = null
    pop.classList.remove('on')
    pop.hidden = true
    if (restoreFocus && pop.returnFocus) pop.returnFocus.focus({ preventScroll: true })
  }

  /* =====================================================================
   * Events
   * ===================================================================== */
  function bindMapEvents() {
    const hitId = (t) => (t && t.classList && t.classList.contains('hit') ? t.getAttribute('data-id') : null)

    hitsG.addEventListener('pointerover', (e) => {
      if (e.pointerType !== 'mouse') return
      const id = hitId(e.target)
      if (id) setHover(id)
    })
    hitsG.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || state.edit) return
      const id = hitId(e.target)
      if (id) showTooltipAt(byId[id], e.clientX, e.clientY)
    })
    hitsG.addEventListener('pointerout', (e) => {
      if (e.pointerType !== 'mouse') return
      if (!hitId(e.relatedTarget)) {
        setHover(null)
        hideTooltip()
      }
    })
    hitsG.addEventListener('click', (e) => {
      const id = hitId(e.target)
      if (!id) return
      e.stopPropagation()
      select(id)
    })
    hitsG.addEventListener('focusin', (e) => {
      const id = hitId(e.target)
      if (!id) return
      setHover(id)
      const [x, y] = anchorClientPos(byId[id])
      showTooltipAt(byId[id], x, y)
    })
    hitsG.addEventListener('focusout', () => {
      setHover(null)
      hideTooltip()
    })
    hitsG.addEventListener('keydown', (e) => {
      const id = hitId(e.target)
      if (id && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        select(id)
      }
    })

    pinsG.addEventListener('pointerover', (e) => {
      const g = e.target.closest('.pin')
      if (g && !state.edit) setPoiHl(+g.dataset.i, true)
    })
    pinsG.addEventListener('pointerout', (e) => {
      const g = e.target.closest('.pin')
      if (g && !g.contains(e.relatedTarget) && !state.edit && state.popPoi !== +g.dataset.i) setPoiHl(null)
    })
    pinsG.addEventListener('click', (e) => {
      const g = e.target.closest('.pin')
      if (!g || state.edit) return
      e.stopPropagation()
      const i = +g.dataset.i
      if (!state.selected) select(POIS[i].region)
      else openPopover(i)
    })
    pinsG.addEventListener('keydown', (e) => {
      const g = e.target.closest('.pin')
      if (g && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        const i = +g.dataset.i
        if (!state.selected) select(POIS[i].region)
        else openPopover(i, g)
      }
    })
    pinsG.addEventListener('focusin', (e) => {
      const g = e.target.closest('.pin')
      if (g) setPoiHl(+g.dataset.i, true)
    })
  }

  function bindGlobalEvents() {
    $('#btn-back').addEventListener('click', back, sig)
    backFloat.addEventListener('click', back, sig)
    stage.addEventListener('click', (e) => {
      if (e.target === stage || e.target.classList.contains('water')) back()
    }, sig)
    svg.addEventListener('click', (e) => {
      if (state.edit || e.target.closest('.hit, .pin')) return
      if (state.popPoi != null) {
        closePopover()
        return
      }
      back()
    }, sig)
    searchInput.addEventListener('input', () => {
      state.search = searchInput.value
      refreshFilters()
    }, sig)

    document.addEventListener('pointerdown', (e) => {
      if (state.popPoi == null) return
      if (pop.contains(e.target) || svg.contains(e.target) || e.target.closest('.poi-btn')) return
      closePopover()
    }, sig)

    document.addEventListener('keydown', (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable
      if (e.key === 'Escape') {
        if (state.popPoi != null) return closePopover(true)
        if (state.edit) return toggleEdit(false)
        if (state.selected) return back()
      }
      if (allowEditorKey && !typing && !e.ctrlKey && !e.metaKey && !e.altKey && (e.key === 'e' || e.key === 'E')) {
        if (state.loaded) toggleEdit()
      }
    }, sig)

    let rt
    const onResize = () => {
      clearTimeout(rt)
      rt = later(() => {
        updateScales()
        hideTooltip()
        if (state.selected) frameRegion(byId[state.selected])
        if (state.popPoi != null) later(positionPopover, 800)
      }, 120)
    }
    resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(frame)
    sheetMQ.addEventListener('change', onResize, sig)
  }

  /* =====================================================================
   * Calibration mode (?edit=1). Built lazily; nothing is rendered unless
   * activated.
   * ===================================================================== */
  const editor = { built: false, active: REGIONS[0].id, ui: null, under: null, over: null, outlines: {} }

  function toggleEdit(on) {
    const next = on === undefined ? !state.edit : on
    if (next === state.edit) return
    if (next) {
      if (state.selected) back()
      state.hover = null
      hideTooltip()
      closePopover()
      state.edit = true
      resetCamera()
      buildEditor()
      rootEl.classList.add('is-editing')
      editor.ui.hidden = false
      editor.under.style.display = ''
      editor.over.style.display = ''
      renderEditor()
      applyLift()
      updatePins({ restart: false })
    } else {
      state.edit = false
      rootEl.classList.remove('is-editing')
      if (editor.built) {
        editor.ui.hidden = true
        editor.under.style.display = 'none'
        editor.over.style.display = 'none'
      }
      applyLift()
      updatePins({ restart: true })
    }
  }

  function buildEditor() {
    if (editor.built) return
    editor.built = true
    editor.under = el('g', { id: 'ed-under' })
    space.insertBefore(editor.under, pinsG)
    editor.over = el('g', { id: 'ed-over' }, space)

    REGIONS.forEach((r) => {
      const u = el('use', { href: `#rp-${r.id}`, class: 'ed-outline', 'data-id': r.id }, editor.under)
      u.style.setProperty('--c', r.color)
      u.addEventListener('pointerdown', (e) => {
        if (editor.active !== r.id) {
          e.preventDefault()
          setActiveRegion(r.id)
        }
      })
      editor.outlines[r.id] = u
    })

    const ui = h('div', 'ed-panel')
    ui.setAttribute('role', 'dialog')
    ui.setAttribute('aria-label', 'Mode kalibrasi peta')
    ui.innerHTML = `
      <h3>Mode Kalibrasi</h3>
      <div class="ed-xy">x: –  y: –</div>
      <label>Zona aktif
        <select class="ed-region">${REGIONS.map((r) => `<option value="${r.id}">${r.number}. ${esc(r.nameId)}</option>`).join('')}</select>
      </label>
      <ul>
        <li>Seret titik putih untuk memindahkan.</li>
        <li>Klik garis tepi untuk menambah titik.</li>
        <li>Alt/Option + klik titik untuk menghapus.</li>
        <li>Seret pin POI dan penanda nomor (◆).</li>
      </ul>
      <div class="ed-actions"><button type="button" data-act="copy">Salin JSON</button><button type="button" data-act="exit">Keluar</button></div>
      <p class="ed-toast" aria-live="polite"></p>
      <textarea class="ed-out" readonly hidden aria-label="JSON hasil kalibrasi"></textarea>`
    rootEl.appendChild(ui)
    editor.ui = ui
    ui.querySelector('.ed-region').addEventListener('change', (e) => setActiveRegion(e.target.value))
    ui.querySelector('[data-act="copy"]').addEventListener('click', copyJson)
    ui.querySelector('[data-act="exit"]').addEventListener('click', () => toggleEdit(false))

    svg.addEventListener('pointermove', (e) => {
      if (!state.edit) return
      const p = svgPoint(e)
      ui.querySelector('.ed-xy').textContent = `x: ${p[0]}  y: ${p[1]}`
    }, sig)

    pinsG.addEventListener('pointerdown', (e) => {
      if (!state.edit) return
      const g = e.target.closest('.pin')
      if (!g) return
      const i = +g.dataset.i
      startDrag(e, (p) => {
        POIS[i].x = p[0]
        POIS[i].y = p[1]
        g.setAttribute('transform', `translate(${p[0]} ${p[1]})`)
      })
    })
  }

  function svgPoint(e) {
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(space.getScreenCTM().inverse())
    return [Math.round(p.x), Math.round(p.y)]
  }
  function startDrag(e, onMove) {
    e.preventDefault()
    e.stopPropagation()
    const drag = new AbortController()
    const opts = { signal: AbortSignal.any ? AbortSignal.any([drag.signal, ac.signal]) : drag.signal }
    window.addEventListener('pointermove', (ev) => onMove(svgPoint(ev)), opts)
    window.addEventListener('pointerup', () => drag.abort(), opts)
    window.addEventListener('pointercancel', () => drag.abort(), opts)
  }

  function setActiveRegion(id) {
    editor.active = id
    editor.ui.querySelector('.ed-region').value = id
    renderEditor()
  }

  function renderEditor() {
    const r = byId[editor.active]
    const g = editor.over
    g.textContent = ''
    REGIONS.forEach((x) => editor.outlines[x.id].classList.toggle('active', x.id === r.id))
    g.style.setProperty('--c', r.color)
    const k = (frame.clientWidth / state.vb.w) * state.sx || 1
    const pts = r.points

    pts.forEach((p, i) => {
      const q = pts[(i + 1) % pts.length]
      const line = el('line', { class: 'ed-edge', x1: p[0], y1: p[1], x2: q[0], y2: q[1], 'data-i': i }, g)
      line.addEventListener('pointerdown', (e) => {
        pts.splice(i + 1, 0, svgPoint(e))
        commitRegion(r)
        renderEditor()
        dragVertex(e, r, i + 1)
      })
    })
    pts.forEach((p, i) => {
      const c = el('circle', { class: 'ed-handle', cx: p[0], cy: p[1], r: Math.max(3, 6 / k), 'data-i': i }, g)
      c.addEventListener('pointerdown', (e) => {
        if (e.altKey) {
          e.preventDefault()
          if (pts.length > 3) {
            pts.splice(i, 1)
            commitRegion(r)
            renderEditor()
          }
          return
        }
        dragVertex(e, r, i)
      })
    })
    const s = Math.max(4, 8 / k)
    const a = el('rect', { class: 'ed-anchor', x: -s, y: -s, width: s * 2, height: s * 2, transform: `translate(${r.labelAnchor[0]} ${r.labelAnchor[1]}) rotate(45)` }, g)
    a.addEventListener('pointerdown', (e) => {
      startDrag(e, (p) => {
        r.labelAnchor = p
        a.setAttribute('transform', `translate(${p[0]} ${p[1]}) rotate(45)`)
        moveAnchor(r)
      })
    })
  }

  function dragVertex(e, r, i) {
    const g = editor.over
    startDrag(e, (p) => {
      r.points[i] = p
      commitRegion(r)
      const n = r.points.length
      const hd = g.querySelector(`.ed-handle[data-i="${i}"]`)
      if (hd) { hd.setAttribute('cx', p[0]); hd.setAttribute('cy', p[1]) }
      const e1 = g.querySelector(`.ed-edge[data-i="${i}"]`)
      if (e1) { e1.setAttribute('x1', p[0]); e1.setAttribute('y1', p[1]) }
      const e0 = g.querySelector(`.ed-edge[data-i="${(i - 1 + n) % n}"]`)
      if (e0) { e0.setAttribute('x2', p[0]); e0.setAttribute('y2', p[1]) }
    })
  }

  function commitRegion(r) {
    const els = regionEls[r.id]
    els.poly.setAttribute('points', ptsAttr(r.points))
    if (els.clipPoly) els.clipPoly.setAttribute('points', ptsAttr(offsetPolygon(r.points, 0.9)))
    if (r.kind === 'tab') renderTabDecor(r)
  }
  function moveAnchor(r) {
    const els = regionEls[r.id]
    if (els.badge) els.badge.setAttribute('transform', `translate(${r.labelAnchor[0]} ${r.labelAnchor[1]})`)
    if (els.pill) {
      renderPill(r)
      placePillHit(r)
    }
  }

  function copyJson() {
    const keys = ['id', 'number', 'kind', 'color', 'name', 'nameId', 'short', 'pillText', 'blurb', 'points', 'labelAnchor']
    const regions = REGIONS.map((r) => {
      const o = {}
      keys.forEach((k) => { if (r[k] !== undefined) o[k] = r[k] })
      return '    ' + JSON.stringify(o)
    })
    const pois = POIS.map((p) => '    ' + JSON.stringify({
      region: p.region, name: p.name, type: p.type, services: p.services, tag: p.tag, description: p.description, x: p.x, y: p.y,
    }))
    const text = `{\n  "REGIONS": [\n${regions.join(',\n')}\n  ],\n  "POIS": [\n${pois.join(',\n')}\n  ]\n}\n`
    const out = editor.ui.querySelector('.ed-out')
    const toast = editor.ui.querySelector('.ed-toast')
    out.value = text
    out.hidden = false
    const done = (ok) => { toast.textContent = ok ? 'JSON disalin ke clipboard.' : 'Salin manual dari kotak di bawah.' }
    const fallback = () => {
      out.select()
      let ok = false
      try { ok = document.execCommand('copy') } catch { ok = false }
      done(ok)
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(() => done(true), fallback)
    else fallback()
  }

  /* =====================================================================
   * Boot: single PNG preload with skeleton
   * ===================================================================== */
  buildLegend()
  buildRail()
  buildChips()
  buildList()
  buildStrip()
  updateLegendCounts()
  updateRailCounts()
  bindGlobalEvents()

  const img = new Image()
  img.decoding = 'async'
  img.onload = () => {
    if (disposed) return
    buildMap(img.naturalWidth || COORD_SPACE.w, img.naturalHeight || COORD_SPACE.h)
    state.loaded = true
    updateScales()
    REGIONS.forEach((r) => regionEls[r.id].zone.classList.toggle('is-served', countFor(r.id) > 0))
    requestAnimationFrame(() => { if (!disposed) rootEl.classList.add('is-loaded') })
    $('#skeleton').setAttribute('aria-busy', 'false')

    if (new URLSearchParams(location.search).get('edit') === '1') toggleEdit(true)
    else {
      const m = location.hash.match(/^#zona-(.+)$/)
      if (m && byId[m[1]]) {
        rootEl.scrollIntoView({ block: 'start' })
        later(() => select(m[1]), 350)
      }
    }
  }
  img.onerror = () => {
    if (disposed) return
    $('#skeleton').classList.add('is-error')
    $('#skeleton-text').textContent = `Gambar peta tidak dapat dimuat (${imageUrl}).`
  }
  img.src = imageUrl

  return () => {
    disposed = true
    ac.abort()
    resizeObserver?.disconnect()
    timers.forEach(clearTimeout)
    img.onload = img.onerror = null
    svg.replaceChildren()
    svg.removeAttribute('viewBox')
    svg.removeAttribute('class')
    svg.removeAttribute('style')
    frame.style.aspectRatio = ''
    ;['#legend-list', '#rail-list', '#chips', '#poi-list', '#strip-list', '#quota-sessions'].forEach((s) => $(s).replaceChildren())
    editor.ui?.remove()
    rootEl.classList.remove('is-loaded', 'is-editing')
    panel.classList.remove('open')
    panel.setAttribute('aria-hidden', 'true')
    backFloat.classList.remove('on')
    tooltip.classList.remove('on')
    pop.hidden = true
    pop.classList.remove('on')
  }
}
