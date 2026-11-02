// Personajes en SVG puro (SMIL + CSS dentro del SVG): lo único que GitHub anima en un README.
// Sin JavaScript, sin fuentes externas.

export const f = (n) => (Math.round(n * 100) / 100).toString()
export const EASE = '0.45 0 0.55 1', OUT = '0.2 0.7 0.35 1', IN = '0.65 0 0.8 0.35', BOUNCE = '0.15 0.85 0.3 1'
export const MONO = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,'Liberation Mono',monospace"

let seed = 7
export const rnd = (a, b) => { seed = (seed * 16807) % 2147483647; return a + ((seed - 1) / 2147483646) * (b - a) }
export const reseed = (s) => { seed = s }

export function mix(hex, to, k) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
  const a = p(hex), b = p(to)
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * k).toString(16).padStart(2, '0')).join('')
}

/** animateTransform con curvas. frames: [[valor, tiempo(s)], ...]; dur = total. */
export function at(type, frames, dur, { curve = EASE, curves, begin = 0, repeat = 'indefinite', additive = false, freeze = false } = {}) {
  if (frames[frames.length - 1][1] < dur) frames = [...frames, [frames[frames.length - 1][0], dur]]  // keyTimes debe cerrar en 1
  const vals = frames.map((x) => x[0]).join(';')
  const times = frames.map((x) => f(Math.min(1, x[1] / dur))).join(';')
  const spl = frames.slice(0, -1).map((_, i) => (curves && curves[i]) || curve).join(';')
  return `<animateTransform attributeName="transform" type="${type}" values="${vals}" keyTimes="${times}" calcMode="spline" keySplines="${spl}" dur="${f(dur)}s"${begin ? ` begin="${f(begin)}s"` : ''} repeatCount="${repeat}"${additive ? ' additive="sum"' : ''}${freeze ? ' fill="freeze"' : ''}/>`
}
/** Bucle uniforme ida-vuelta. */
export const loop = (type, vals, dur, opt = {}) => at(type, vals.map((v, i) => [v, (i / (vals.length - 1)) * dur]), dur, opt)

/** Visible solo en [t0, t1) de un ciclo de T segundos. */
export function windowed(t0, t1, T, begin = 0) {
  if (t0 <= 0 && t1 >= T) return '<set attributeName="opacity" to="1"/>'
  const vals = [], times = []
  if (t0 > 0) { vals.push(0); times.push(0) }
  vals.push(1); times.push(t0 / T)
  if (t1 < T) { vals.push(0); times.push(t1 / T) }
  return `<animate attributeName="opacity" values="${vals.join(';')}" keyTimes="${times.map(f).join(';')}" calcMode="discrete" dur="${f(T)}s"${begin ? ` begin="${f(begin)}s"` : ''} repeatCount="indefinite"/>`
}

/* =================== Agentes de la flota (<fleet-eyes> pasado a SMIL) =================== */
export const SC = { rest: '#7d9cc8', work: '#3b7be0', plan: '#8a6fe0', ok: '#2fa36d', warn: '#d9930f', bad: '#d24a4a' }
const STATE_C = {
  libre: SC.rest, planificando: SC.plan, programando: SC.work, verificando: SC.ok, pr: SC.ok,
  review: SC.plan, sync: SC.work, conflicto: SC.warn, arreglo: SC.work, atencion: SC.warn, fallo: SC.bad, iniciando: SC.work
}
const ACC = {
  libre: `<path class="z z1" d="M0 0h6l-6 7h6"/><path class="z z2" d="M0 0h6l-6 7h6"/><path class="z z3" d="M0 0h6l-6 7h6"/>`,
  iniciando: `<rect x="2" y="11" width="28" height="10" rx="2.5"/><rect class="fill bar" x="4.5" y="13.5" width="23" height="5" rx="1"/>`,
  planificando: `<rect x="6" y="3" width="22" height="27" rx="2"/><path class="thin" d="M3 8h5M3 14h5M3 20h5M3 26h5"/>
    <path class="ln ln1" d="M11 10h13"/><path class="ln ln2" d="M11 16h13"/><path class="ln ln3" d="M11 22h8"/>`,
  programando: `<path d="M10 9L3 16l7 7M22 9l7 7-7 7"/><path class="slash" d="M18.5 7l-5 18"/>`,
  verificando: `<path d="M10 3h9M12 3v8L4.6 25.4A2 2 0 0 0 6.4 28.4h16.2a2 2 0 0 0 1.8-3L17 11V3"/><path class="thin" d="M7.5 21h14"/>
    <circle class="fill bub b1" cx="13" cy="25" r="1.4"/><circle class="fill bub b2" cx="17" cy="24" r="1.1"/><path class="chk" d="M21 9l3.4 3.4L31 4.5"/>`,
  pr: `<g class="rise"><circle cx="8" cy="7" r="3.2"/><circle cx="8" cy="25" r="3.2"/><path d="M8 10.2v11.6"/>
    <circle cx="24" cy="25" r="3.2"/><path d="M24 21.8V14a4.5 4.5 0 0 0-4.5-4.5H14"/><path d="M17.5 6L14 9.5l3.5 3.5"/></g>`,
  review: `<g class="scan"><circle cx="13" cy="13" r="8"/><path class="thick" d="M19 19l8 8"/><path class="thin" d="M9 10a5 5 0 0 1 4-2.4"/></g>`,
  sync: `<g class="spin"><path d="M6.6 12.6A10 10 0 0 1 25.4 12.6"/><path d="M22.3 11.9l3.1.7.8-3.1"/>
    <path d="M25.4 19.4A10 10 0 0 1 6.6 19.4"/><path d="M9.7 20.1l-3.1-.7-.8 3.1"/></g>`,
  conflicto: `<path class="arL" d="M1 16h9M7 12.5l3.5 3.5L7 19.5"/><path class="arR" d="M31 16h-9M25 12.5L21.5 16l3.5 3.5"/>
    <path class="spark" d="M16 7.5v3.5M16 21v3.5M10 10l2.4 2.4M22 10l-2.4 2.4M10 22l2.4-2.4M22 22l-2.4-2.4"/>`,
  arreglo: `<g class="wr"><path d="M27.9 9A6 6 0 1 1 23 4.1"/><path class="thick" d="M17.8 14.2L6 26"/></g>`,
  atencion: `<g class="pop"><path d="M5 3h22a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H14l-6 5.5V22H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z"/>
    <path class="thick" d="M16 7.5v7"/><circle class="fill" cx="16" cy="18.2" r="1.5"/></g>`,
  fallo: `<path class="cloud" d="M9 21a5 5 0 0 1 .8-9.9 7 7 0 0 1 13.5 1.6A4.2 4.2 0 0 1 24 21z"/>
    <path class="drop d1" d="M12 24.5v3"/><path class="drop d2" d="M17 24.5v3"/><path class="drop d3" d="M22 24.5v3"/>`
}

/** CSS de los accesorios y animaciones comunes; va una vez en el <style> del SVG. */
export const CSS = `
.acc *{fill:none;stroke:var(--fc);stroke-width:2.3;stroke-linecap:round;stroke-linejoin:round;transform-box:fill-box;transform-origin:center}
.acc g{stroke:none}.acc .thin{stroke-width:1.4;opacity:.7}.acc .thick{stroke-width:3.2}.acc .fill{fill:var(--fc);stroke:none}
.z{transform:translate(2px,22px);animation:zrise 2.7s linear infinite;opacity:0}.z2{animation-delay:.9s}.z3{animation-delay:1.8s}
@keyframes zrise{0%{opacity:0;transform:translate(2px,22px) scale(.55)}18%{opacity:1}100%{opacity:0;transform:translate(20px,-2px) scale(1.15)}}
.bar{transform-origin:left center;animation:load 2.4s cubic-bezier(.6,.1,.3,1) infinite}
@keyframes load{0%{transform:scaleX(0)}70%,86%{transform:scaleX(1);opacity:1}100%{transform:scaleX(1);opacity:0}}
.ln{stroke-dasharray:14;stroke-dashoffset:14;animation:write 3.2s ease-in-out infinite}.ln2{animation-delay:.5s}.ln3{animation-delay:1s}
@keyframes write{0%{stroke-dashoffset:14}30%,80%{stroke-dashoffset:0;opacity:1}100%{stroke-dashoffset:0;opacity:0}}
.slash{animation:blinkc 1s steps(1) infinite}@keyframes blinkc{0%,55%{opacity:1}56%,100%{opacity:.15}}
.bub{animation:bub 1.6s ease-in infinite}.b2{animation-delay:.7s}
@keyframes bub{0%{transform:translateY(0);opacity:0}20%{opacity:1}100%{transform:translateY(-11px);opacity:0}}
.chk{stroke-dasharray:16;stroke-dashoffset:16;animation:draw 2.6s ease-out infinite}
@keyframes draw{0%,20%{stroke-dashoffset:16}50%,85%{stroke-dashoffset:0;opacity:1}100%{stroke-dashoffset:0;opacity:0}}
.rise{animation:rise 2.2s cubic-bezier(.3,1.4,.5,1) infinite}
@keyframes rise{0%{transform:translateY(9px);opacity:0}30%{transform:translateY(0);opacity:1}78%{opacity:1}100%{transform:translateY(-9px);opacity:0}}
.scan{animation:scan 3.4s ease-in-out infinite}@keyframes scan{0%,100%{transform:translate(-3px,1px)}50%{transform:translate(4px,-1px)}}
.spin{animation:spin 2.4s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
.arL{animation:arL 1.3s cubic-bezier(.5,0,.7,1) infinite}.arR{animation:arR 1.3s cubic-bezier(.5,0,.7,1) infinite}
@keyframes arL{0%,100%{transform:translateX(-2px)}45%{transform:translateX(3px)}}@keyframes arR{0%,100%{transform:translateX(2px)}45%{transform:translateX(-3px)}}
.spark{stroke-width:1.6;animation:spark 1.3s ease-out infinite}@keyframes spark{0%,40%{opacity:0;transform:scale(.4)}48%{opacity:1;transform:scale(1.1)}75%,100%{opacity:0;transform:scale(1.3)}}
.wr{transform-origin:30% 70%;animation:wr 1.5s ease-in-out infinite alternate}@keyframes wr{from{transform:rotate(-16deg)}to{transform:rotate(18deg)}}
.pop{transform-origin:30% 100%;animation:pop 2.8s cubic-bezier(.3,1.8,.5,1) infinite}
@keyframes pop{0%,60%,100%{transform:scale(1) rotate(0)}66%{transform:scale(1.18) rotate(-6deg)}74%{transform:scale(1) rotate(4deg)}}
.cloud{animation:drift 3.6s ease-in-out infinite alternate}@keyframes drift{from{transform:translateX(-1.5px)}to{transform:translateX(1.5px)}}
.drop{stroke-width:1.6;animation:drop 1.4s ease-in infinite;opacity:0}.d2{animation-delay:.45s}.d3{animation-delay:.9s}
@keyframes drop{0%{transform:translateY(-2px);opacity:0}25%{opacity:.9}100%{transform:translateY(5px);opacity:0}}
.zz{animation:zz 3s linear infinite;opacity:0}.zz2{animation-delay:1s}.zz3{animation-delay:2s}
@keyframes zz{0%{opacity:0;transform:translate(0,0) scale(.6)}20%{opacity:1}100%{opacity:0;transform:translate(14px,-26px) scale(1.2)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`

export const DEFS = `<linearGradient id="agHl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".26"/><stop offset=".46" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="agSh" x1="0" y1="0" x2="0" y2="1"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>`

const SQ = 'M50 3C84 3 97 16 97 50C97 84 84 97 50 97C16 97 3 84 3 50C3 16 16 3 50 3Z'
const HAPPY = 'M-7.5 3Q-6.6 -5.2 0 -5.2Q6.6 -5.2 7.5 3'
const SLEEP = 'M-7.5 -1Q-6 3.6 0 3.6Q6 3.6 7.5 -1'
const SADL = 'M-7 3Q0 -2 7 3'

// Mirada por estado: secuencia de puntos [x, y, espera s] (unidades del ojo).
function gazeFor(state) {
  switch (state) {
    case 'programando': { const s = []; for (let l = 0; l < 3; l++) for (let i = 0; i < 4; i++) s.push([-6 + i * 4, 3 + l * 0.8, i === 3 ? 0.35 : 0.16]); return s }
    case 'verificando': return [[6, -4, 1.1], [5, -3.4, 0.9], [6.5, -4.4, 1.2]]
    case 'planificando': return [[3, -4.5, 0.9], [6, -2.5, 0.8], [0, -5, 1], [4, -3, 0.7]]
    case 'arreglo': return [[-4, 4, 0.8], [-5, 3.4, 0.6], [-3, 4.4, 0.9]]
    case 'conflicto': return [[-7, 0, 0.5], [7, 0, 0.5]]
    case 'atencion': return [[0, 0, 2]]
    case 'fallo': return [[0, 4, 2]]
    default: return [[0, 0, 1.6], [4, -1, 1.2], [-3, 1, 1.4], [5, 2, 0.9], [0, 0, 1.2], [-5, -1, 1.1]]
  }
}
const EYE_SCALE = { programando: [0.84, 0.8], verificando: [0.8, 0.8], review: [1.18, 0.6], planificando: [0.94, 0.94], atencion: [1.17, 1.17], fallo: [0.96, 0.8], arreglo: [0.88, 0.86] }

function gazeAnim(state) {
  if (state === 'review') return loop('translate', ['-7 1', '7 1', '-7 1'], 2.8)
  if (state === 'sync') return loop('translate', ['6 0', '0 4', '-6 0', '0 -4', '6 0'], 2.4, { curve: '0 0 1 1' })
  const pts = gazeFor(state)
  if (pts.length === 1) return ''
  const fr = []; let t = 0
  for (const [x, y, w] of pts) { fr.push([`${x} ${y}`, t]); t += 0.09; fr.push([`${x} ${y}`, t]); t += w }
  fr.push([`${pts[0][0]} ${pts[0][1]}`, t])
  // de cada punto al siguiente: sacádico rápido (OUT) y luego quieto
  return at('translate', fr.map(([v, tt], i) => [v, tt]), t, { curves: fr.slice(0, -1).map((_, i) => (i % 2 ? OUT : '0 0 1 1')) })
}

function eyes(state, color) {
  if (state === 'libre') return [-1, 1].map((s) => `<path d="${SLEEP}" transform="translate(${50 + s * 16} 56)" fill="none" stroke="#fff" stroke-width="4.8" stroke-linecap="round"/>`).join('')
  if (state === 'pr') return [-1, 1].map((s) => `<path d="${HAPPY}" transform="translate(${50 + s * 16} 50)" fill="none" stroke="#fff" stroke-width="5.8" stroke-linecap="round"/>`).join('') +
    `<ellipse cx="22" cy="68" rx="8" ry="4.5" fill="#ffd2dc" opacity=".45"/><ellipse cx="78" cy="68" rx="8" ry="4.5" fill="#ffd2dc" opacity=".45"/>`
  const [sx, sy] = EYE_SCALE[state] || [1, 1]
  const dy = state === 'fallo' ? 3.5 : state === 'programando' ? 1 : 0
  const blinkDur = rnd(3.6, 5.6), blinkBegin = -rnd(0, 4)
  const pill = (s) => `<g transform="translate(${50 + s * 16} ${52 + dy}) scale(${sx} ${sy})"><g>` +
    `<animateTransform attributeName="transform" type="scale" values="1 1;1 1;1 .1;1 1" keyTimes="0;.93;.96;1" dur="${f(blinkDur)}s" begin="${f(blinkBegin)}s" repeatCount="indefinite"/>` +
    `<rect x="-8" y="-15" width="16" height="30" rx="8" fill="#fff"/><circle cx="-2.8" cy="-8.4" r="2.5" fill="${color}" opacity=".42"/></g></g>`
  const lid = state === 'fallo' ? [-1, 1].map((s) => `<path d="M${50 + s * 16 - 10} ${40 + (s < 0 ? 4 : 0)}L${50 + s * 16 + 10} ${40 + (s < 0 ? 0 : 4)}L${50 + s * 16 + 10} 30L${50 + s * 16 - 10} 30Z" fill="${color}"/>`).join('') : ''
  return `<g>${gazeAnim(state)}${pill(-1)}${pill(1)}${lid}</g>`
}

/**
 * Un agente de la flota. (x, y) = centro del piso. script = [[estado, segundos], ...] (un ciclo).
 * hops: para 'pr' brinca solo. tag: id en la frente.
 */
export function agent(x, y, size, color, script, { tag = '', begin = 0, flip = false, acc = true } = {}) {
  if (typeof script === 'string') script = [[script, 10]]
  const T = script.reduce((a, s) => a + s[1], 0)
  let t = 0
  const parts = script.map(([st, d]) => { const w = { st, t0: t, t1: t + d }; t += d; return w })
  const k = size / 100
  // saltos en las ventanas 'pr' (y 'atencion' más bajitos)
  const hopFr = [['0 0', 0]], sqFr = [['1 1', 0]]
  for (const p of parts) {
    if (p.st !== 'pr' && p.st !== 'atencion') continue
    const h = p.st === 'pr' ? 16 : 8
    for (let t0 = p.t0 + 0.15; t0 + 0.75 < p.t1; t0 += p.st === 'pr' ? 1.1 : 1.8) {
      hopFr.push(['0 0', t0], ['0 3', t0 + 0.08], [`0 ${-h}`, t0 + 0.34], ['0 0', t0 + 0.58], ['0 0', t0 + 0.75])
      sqFr.push(['1 1', t0], ['1.1 .9', t0 + 0.08], ['.95 1.07', t0 + 0.34], ['1.12 .86', t0 + 0.58], ['1 1', t0 + 0.75])
    }
  }
  hopFr.push(['0 0', T]); sqFr.push(['1 1', T])
  const hopC = hopFr.slice(0, -1).map((_, i) => [OUT, OUT, IN, BOUNCE, '0 0 1 1'][(i + 4) % 5])
  const hop = hopFr.length > 2 ? at('translate', hopFr, T, { curves: hopC, begin }) : ''
  const sq = hopFr.length > 2 ? at('scale', sqFr, T, { curves: hopC, begin }) : ''
  const breath = loop('scale', ['1 1', '1.015 .985', '1 1'], rnd(2.4, 3.4), { begin: -rnd(0, 2) })
  // conflicto: tiembla
  const shake = parts.some((p) => p.st === 'conflicto') ? loop('translate', ['-1 0', '1.2 0', '-0.8 0', '1 0', '-1 0'], 0.5) : ''

  const faces = parts.map((p) => `<g>${windowed(p.t0, p.t1, T, begin)}${eyes(p.st, color)}</g>`).join('')
  const accs = acc ? parts.map((p) => `<g class="acc" style="--fc:${STATE_C[p.st] || SC.work}">${windowed(p.t0, p.t1, T, begin)}${ACC[p.st] || ''}</g>`).join('') : ''
  const tagEl = tag ? `<text x="50" y="25" text-anchor="middle" font-family="${MONO}" font-size="9" font-weight="600" fill="#fff" opacity=".55" letter-spacing=".8">${tag}</text>` : ''
  return `<g transform="translate(${f(x - size / 2)} ${f(y - size)}) scale(${f(k)})${flip ? ' translate(100 0) scale(-1 1)' : ''}">` +
    `<ellipse cx="50" cy="100" rx="32" ry="4.5" fill="#000" opacity=".2"/>` +
    `<g>${hop}<g transform="translate(50 97)"><g>${sq}<g>${breath}<g transform="translate(-50 -97)"><g>${shake}` +
    `<path d="${SQ}" fill="${color}"/><path d="${SQ}" fill="url(#agSh)"/><path d="${SQ}" fill="url(#agHl)"/>` +
    `<ellipse cx="40" cy="14" rx="15" ry="3.6" fill="#fff" opacity=".12"/>${tagEl}${faces}</g></g></g></g></g></g>` +
    `<g transform="translate(88 -24)">${accs}</g></g>`
}

/* =================== Clawd (pixel art del mod claude-pet) =================== */
const EYE = '#16120f'
/**
 * Clawd. (x, y) = centro del piso; c = tamaño de celda (cuerpo 16×9 celdas).
 * mood: idle | work | sleep | happy | think | walk | wave
 */
export function clawd(x, y, c, body, mood = 'idle', { acc = '', begin = 0, laptop = false, shadow = true } = {}) {
  const L = mix(body, '#ffffff', 0.22), D = mix(body, '#000000', 0.25)
  const X = (gx) => f((gx - 8) * c), Y = (gy) => f((gy - 9) * c)
  const R = (gx, gy, gw, gh, fill, extra = '') => `<rect x="${X(gx)}" y="${Y(gy)}" width="${f(gw * c)}" height="${f(gh * c)}" fill="${fill}"${extra}/>`
  const yy = (k) => `0 ${f(k * c)}`
  const b = -rnd(0, 3)
  const arm = (side) => {
    const alt = (a, bb, d, cv = BOUNCE) => loop('translate', side ? [yy(a), yy(bb), yy(a)] : [yy(bb), yy(a), yy(bb)], d, { curve: cv })
    switch (mood) {
      case 'work': return alt(0.3, -0.7, 0.32)
      case 'walk': return alt(0.2, -0.6, 0.42, EASE)
      case 'happy': return loop('translate', [yy(-2.6), yy(-2), yy(-2.6)], 0.5)
      case 'wave': return side ? loop('translate', [yy(-3.2), yy(-1.4), yy(-3.2)], 0.6) : ''
      case 'think': return side ? loop('translate', [yy(-2.2), yy(-2.6), yy(-2.2)], 2.4) : ''
      case 'sleep': return loop('translate', [yy(0.6), yy(0.75), yy(0.6)], 4)
      default: return loop('translate', [yy(0), yy(-0.35), yy(0.15), yy(0)], side ? 5.3 : 4.7)
    }
  }
  const px = (cx, rows, dy = 0) => rows.map((r, j) => [...r].map((ch, i) => ch === 'X' ? R(cx - r.length / 4 + i * 0.5, 3 - rows.length / 4 + j * 0.5 + dy, 0.5, 0.5, EYE) : '').join('')).join('')
  const eye = (cx) => {
    if (mood === 'happy' || mood === 'wave') return px(cx, ['.XX.', 'X..X'])
    if (mood === 'sleep') return px(cx, ['XXX'], 0.6)
    const h = mood === 'work' ? 1.5 : 2, top = 4 - h + (mood === 'work' ? 0.3 : 0)
    const d = rnd(3.8, 5.4)
    return `<rect x="${X(cx - 0.5)}" y="${Y(top)}" width="${f(c)}" height="${f(h * c)}" fill="${EYE}">` +
      `<animate attributeName="height" values="${f(h * c)};${f(h * c)};${f(0.2 * c)};${f(h * c)}" keyTimes="0;.94;.965;1" dur="${f(d)}s" begin="${f(b)}s" repeatCount="indefinite"/>` +
      `<animate attributeName="y" values="${Y(top)};${Y(top)};${Y(top + h - 0.2)};${Y(top)}" keyTimes="0;.94;.965;1" dur="${f(d)}s" begin="${f(b)}s" repeatCount="indefinite"/></rect>`
  }
  const jump = (h, period, idle) => {
    const T = period + idle, a = 0.07, up = period * 0.42, dn = period * 0.42
    const ts = [0, idle, idle + a, idle + a + up, idle + a + up + dn, T]
    const cv = ['0 0 1 1', EASE, OUT, IN, OUT]
    return [at('translate', ['0 0', '0 0', '0 2', `0 ${-h}`, '0 0', '0 0'].map((v, i) => [v, ts[i]]), T, { curves: cv, begin: b }),
      at('scale', ['1 1', '1 1', '1.12 .86', '.94 1.1', '1.14 .84', '1 1'].map((v, i) => [v, ts[i]]), T, { curves: cv, begin: b })]
  }
  const [hop, squash] = mood === 'happy' || mood === 'wave' ? jump(c * 2.6, 0.6, 0.6) : mood === 'idle' ? jump(c * 1.4, 0.5, rnd(5, 9)) : ['', '']
  const breath = mood === 'sleep' ? loop('scale', ['1 .93', '1.02 .9', '1 .93'], 4) : loop('scale', ['1 1', '1.012 .985', '1 1'], mood === 'work' ? 1.2 : 2.6)
  const look = mood === 'idle' ? loop('translate', ['0 0', `${f(c * 0.4)} 0`, `${f(c * 0.4)} 0`, `${f(-c * 0.4)} 0`, '0 0'], 7, { begin: b })
    : mood === 'walk' ? '' : ''
  const steps = mood === 'work' || mood === 'walk'
  const legs = [3, 5, 10, 12].map((lx, i) => steps
    ? `<g>${at('translate', [['0 0', 0], [`0 ${f(-0.6 * c)}`, 0.16], ['0 0', 0.32], ['0 0', mood === 'walk' ? 0.5 : 0.64]], mood === 'walk' ? 0.5 : 0.64, { curves: [OUT, IN, '0 0 1 1'], begin: i * (mood === 'walk' ? 0.25 : 0.16) })}${R(lx, 7, 1, 2, D)}</g>`
    : R(lx, 7, 1, 2, D)).join('')
  const blush = mood === 'happy' || mood === 'wave' ? R(2.5, 4.2, 1.5, 0.5, '#f3a48e') + R(12, 4.2, 1.5, 0.5, '#f3a48e') : ''
  const zs = mood === 'sleep' ? `<g transform="translate(${f(5 * c)} ${f(-10 * c)})" font-family="${MONO}" font-weight="700" font-size="${f(c * 2.2)}" fill="currentColor">` +
    ['zz zz1', 'zz zz2', 'zz zz3'].map((cl) => `<text class="${cl}">z</text>`).join('') + '</g>' : ''
  const think = mood === 'think' ? `<g transform="translate(${f(6 * c)} ${f(-12 * c)})"><circle r="${f(c * 0.5)}" cx="${f(-c * 1.5)}" cy="${f(c * 2.6)}" fill="currentColor" opacity=".5"/><circle r="${f(c * 0.9)}" fill="currentColor" opacity=".5"><animate attributeName="opacity" values=".2;.7;.2" dur="1.6s" repeatCount="indefinite"/></circle></g>` : ''
  // laptop visto por detrás: tapa las patas, deja ver ojos y brazos tecleando; el logo late
  const lap = laptop ? `<g><rect x="${f(-5.6 * c)}" y="${f(-3.7 * c)}" width="${f(11.2 * c)}" height="${f(3.5 * c)}" rx="${f(c * 0.35)}" fill="#3a3733"/>` +
    `<rect x="${f(-5.6 * c)}" y="${f(-3.7 * c)}" width="${f(11.2 * c)}" height="${f(0.35 * c)}" fill="#55504a"/>` +
    `<circle cx="0" cy="${f(-2 * c)}" r="${f(0.7 * c)}" fill="${L}"><animate attributeName="opacity" values=".35;.9;.35" dur="2.2s" repeatCount="indefinite"/></circle>` +
    `<rect x="${f(-7 * c)}" y="${f(-0.25 * c)}" width="${f(14 * c)}" height="${f(0.6 * c)}" rx="${f(c * 0.3)}" fill="#4a4641"/></g>` : ''
  return `<g transform="translate(${f(x)} ${f(y)})">${shadow ? `<ellipse cx="0" cy="${f(c * 0.3)}" rx="${f(c * 7)}" ry="${f(c * 0.9)}" fill="#000" opacity=".22"/>` : ''}` +
    `<g>${hop}<g>${squash}<g>${breath}` +
    `<g>${arm(0)}${R(0, 4, 2.2, 2, body)}</g><g>${arm(1)}${R(13.8, 4, 2.2, 2, body)}</g>${legs}` +
    R(2, 0, 12, 7, body) + R(2, 0, 12, 0.5, L) + R(2, 6.5, 12, 0.5, D) + blush +
    `<g>${look}${eye(4.5)}${eye(11.5)}</g>${hat(acc, c, body, X, Y, R)}</g></g></g>${lap}${zs}${think}</g>`
}

function hat(a, c, body, X, Y, R) {
  switch (a) {
    case 'corona': return R(4, -1.5, 8, 1.5, '#f5c451') + R(4, -3, 1, 1.5, '#f5c451') + R(7.5, -3.2, 1, 1.7, '#f5c451') + R(11, -3, 1, 1.5, '#f5c451') + R(7.6, -1.1, 0.8, 0.7, '#e5484d')
    case 'gorro': return R(3, -2.2, 10, 2.4, '#4a6fd8') + R(2.6, -0.3, 10.8, 0.9, '#3554b0') + R(7.3, -3.2, 1.4, 1.1, '#e8e4da')
    case 'audifonos': return R(1.4, 1.6, 1.2, 3, '#26232a') + R(13.4, 1.6, 1.2, 3, '#26232a') + R(2, -1, 12, 0.7, '#26232a') + R(1.8, -1, 0.7, 2.7, '#26232a') + R(13.5, -1, 0.7, 2.7, '#26232a')
    case 'mono': return R(10.5, -1.2, 1.5, 1.4, '#ef6fae') + R(12, -0.8, 0.8, 0.7, '#c94f8c') + R(12.8, -1.2, 1.5, 1.4, '#ef6fae')
    case 'fiesta': return `<path d="M${X(6)} ${Y(0)}L${X(8)} ${Y(-4.5)}L${X(10)} ${Y(0)}Z" fill="#a77bf3"/>` + R(7.6, -5.2, 0.9, 0.9, '#f5c451') + R(6.6, -1.4, 2.8, 0.5, '#f5c451')
    default: return ''
  }
}

/** Minion del mod (bichito pixel 16×9 con ojitos), saltando. */
export function minion(x, y, s, col, begin = 0) {
  const dk = mix(col, '#000000', 0.3)
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><g>${at('translate', [['0 0', 0], ['0 -4', 0.25], ['0 0', 0.5]], 0.5, { curves: [OUT, IN], begin })}` +
    `<rect x="-8" y="-10" width="16" height="9" fill="${col}"/><rect x="-11" y="-6" width="3" height="3" fill="${col}"/><rect x="8" y="-6" width="3" height="3" fill="${col}"/>` +
    `<rect x="-4" y="-7" width="2" height="3" fill="${EYE}"/><rect x="2" y="-7" width="2" height="3" fill="${EYE}"/>` +
    `<rect x="-6" y="-1" width="2" height="2" fill="${dk}"/><rect x="-2" y="-1" width="2" height="2" fill="${dk}"/><rect x="2" y="-1" width="2" height="2" fill="${dk}"/><rect x="6" y="-1" width="2" height="2" fill="${dk}"/></g></g>`
}

/** Mueve un grupo de x0 a x1 en bucle (desfile). */
export const travel = (inner, x0, x1, dur, begin = 0, y = 0) =>
  `<g><animateTransform attributeName="transform" type="translate" values="${f(x0)} ${f(y)};${f(x1)} ${f(y)}" dur="${f(dur)}s" begin="${f(begin)}s" repeatCount="indefinite"/>${inner}</g>`

/** Agente viajando a saltitos (no tiene patas). */
export function hopper(color, size, tag = '') {
  return `<g>${loop('translate', ['0 0', '0 -7', '0 0'], 0.46, { curve: OUT })}${agent(0, 0, size, color, [['libre', 0.001], ['iniciando', 99]], { tag, acc: false })}</g>`
}

/** Chrome descarta un <animate> si values/keyTimes traen números sin cero inicial (".5"). */
export const tidy = (s) => s.replace(/(values|keyTimes|keySplines)="([^"]*)"/g, (_, a, v) => `${a}="${v.replace(/(^|[;\s,])(-?)\.(\d)/g, (m, p, sg, d) => `${p}${sg}0.${d}`)}"`)

export function svg(w, h, body, { theme = 'dark', extraCss = '' } = {}) {
  const ink = theme === 'dark' ? '#e6edf3' : '#1f2328', mut = theme === 'dark' ? '#9198a1' : '#59636e', line = theme === 'dark' ? '#3d444d' : '#d1d9e0', bg2 = theme === 'dark' ? '#161b22' : '#f6f8fa', bg = theme === 'dark' ? '#0d1117' : '#ffffff'
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="${MONO}" color="${ink}">` +
    `<style>:root{--ink:${ink};--mut:${mut};--line:${line};--bg2:${bg2};--bg:${bg}}${CSS}${extraCss}</style><defs>${DEFS}</defs>${body}</svg>`
}
