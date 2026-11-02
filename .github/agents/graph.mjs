// Snake de Clawd: recorre tus contribuciones reales del último año, se come cada día con actividad
// y por cada pocos que come se le suma un subagente (mini Clawd) a la cola.
// Uso: node .github/agents/graph.mjs [usuario]  → assets/agents/graph-dark.svg y graph-light.svg
// Lee la gráfica pública de github.com/users/<usuario>/contributions (no necesita token).
import { writeFileSync, mkdirSync } from 'node:fs'
import { clawd, svg, reseed, tidy, f } from './lib.mjs'

const USER = process.argv[2] || 'leonardos4enz'
const OUT_DIR = new URL('../../assets/agents/', import.meta.url)

async function calendar(user) {
  const res = await fetch(`https://github.com/users/${user}/contributions`, { headers: { 'user-agent': 'inhabited-graph' } })
  if (!res.ok) throw new Error(`GitHub respondió ${res.status}`)
  const html = await res.text()
  // <td ... data-date="2025-11-02" id="contribution-day-component-{díaSemana}-{semana}" data-level="0">
  const cells = [...html.matchAll(/data-date="(\d{4}-\d{2}-\d{2})"\s+id="contribution-day-component-(\d)-(\d+)"\s+data-level="(\d)"/g)]
    .map(([, date, r, c, lv]) => ({ date, r: +r, c: +c, lv: +lv }))
  if (cells.length < 300) throw new Error(`solo encontré ${cells.length} días: ¿cambió el HTML de GitHub?`)
  return cells
}

const X0 = 18, Y0 = 44, CS = 13, GAP = 3, STEP = CS + GAP
const cx = (c) => X0 + c * STEP + CS / 2, cy = (r) => Y0 + r * STEP + CS / 2

/** Ruta tipo snake: columna por columna, subiendo y bajando, con giros en ángulo recto. */
function route(cells) {
  const food = cells.filter((d) => d.lv > 0).sort((a, b) => a.c - b.c || a.r - b.r)
  // dentro de cada columna alterna el sentido para que serpentee
  const byCol = new Map()
  for (const d of food) { if (!byCol.has(d.c)) byCol.set(d.c, []); byCol.get(d.c).push(d) }
  const order = []; let down = true
  for (const col of [...byCol.keys()].sort((a, b) => a - b)) {
    const list = byCol.get(col); order.push(...(down ? list : list.slice().reverse())); down = !down
  }
  let x = X0 - 40, y = cy(3), dist = 0
  const pts = [[x, y]], eat = []
  const go = (nx, ny) => { dist += Math.abs(nx - x) + Math.abs(ny - y); x = nx; y = ny; pts.push([x, y]) }
  for (const d of order) {
    const tx = cx(d.c), ty = cy(d.r)
    if (tx !== x) go(tx, y)
    if (ty !== y) go(x, ty)
    eat.push({ d, at: dist })
  }
  go(Math.max(...cells.map((d) => cx(d.c))) + 60, y)  // sale por la derecha
  return { pts, eat, length: dist }
}

function graph(cells, theme) {
  reseed(31)
  const W = 880, H = 182, V = 80  // velocidad en px/s
  const empty = theme === 'dark' ? '#151b23' : '#eff2f5'
  const lv = theme === 'dark' ? [empty, '#033a16', '#196c2e', '#2ea043', '#56d364'] : [empty, '#aceebb', '#4ac26b', '#2da44e', '#116329']
  const { pts, eat, length } = route(cells)
  const D = length / V, T = D + 3   // recorrido + pausa antes de volver a empezar
  const kt = (t) => f(Math.min(1, t / T))
  const active = eat.length

  let s = `<text x="${X0}" y="24" font-size="12" fill="var(--mut)">$ claude --eat ~/contributions   <tspan fill="var(--ink)">${active}</tspan> active days in the last year</text>`
  // celdas: las que tienen actividad se vacían cuando Clawd pasa por ellas y vuelven al reiniciar
  const when = new Map(eat.map((e) => [e.d, e.at / V]))
  for (const d of cells) {
    const x = X0 + d.c * STEP, y = Y0 + d.r * STEP
    const t = when.get(d)
    s += `<rect x="${x}" y="${y}" width="${CS}" height="${CS}" rx="2.5" fill="${lv[d.lv]}">` +
      (t == null ? '' : `<animate attributeName="fill" values="${lv[d.lv]};${empty};${lv[d.lv]}" keyTimes="0;${kt(t)};${kt(T - 0.4)}" calcMode="discrete" dur="${f(T)}s" repeatCount="indefinite"/>`) + `</rect>`
  }
  // chispa de código donde come
  const toks = ['{ }', '01', '=&gt;', '&amp;&amp;', '&lt;/&gt;', ';']
  eat.forEach(({ d, at }, i) => {
    const t = at / V
    s += `<text x="${cx(d.c)}" y="${cy(d.r)}" font-size="9" font-weight="700" text-anchor="middle" fill="#d97757" opacity="0">${toks[i % toks.length]}` +
      `<animate attributeName="opacity" values="0;0;1;0;0" keyTimes="0;${kt(t)};${kt(t + 0.05)};${kt(t + 0.7)};1" dur="${f(T)}s" repeatCount="indefinite"/>` +
      `<animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 -16;0 -16" keyTimes="0;${kt(t)};${kt(t + 0.7)};1" dur="${f(T)}s" repeatCount="indefinite"/></text>`
  })

  const path = 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')
  const motion = (delay) => `<animateMotion path="${path}" keyPoints="0;1;1" keyTimes="0;${kt(D)};1" calcMode="linear" dur="${f(T)}s" begin="${f(delay)}s" repeatCount="indefinite"/>`
  // cola: un subagente nuevo cada pocos días comidos (máximo 8), cada uno siguiendo el camino de la cabeza
  const tail = Math.min(8, Math.max(2, Math.round(active / 5)))
  const colors = ['#5b8def', '#a77bf3', '#5cc98a', '#ef7bb8', '#29d3ff', '#f5c451', '#7cc4f2', '#ee9cc4']
  for (let k = tail; k >= 1; k--) {
    const grown = eat[Math.min(eat.length - 1, Math.round((k * active) / (tail + 1)))].at / V
    s += `<g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;${kt(grown)};${kt(grown + 0.2)};${kt(D + k * 0.32)};1" calcMode="linear" dur="${f(T)}s" repeatCount="indefinite"/>` +
      `<g>${motion(k * 0.32)}${clawd(0, 7, 1.4, colors[(k - 1) % colors.length], 'walk', { shadow: false })}</g></g>`
  }
  // cabeza: Clawd caminando
  s += `<g>${motion(0)}${clawd(0, 9, 2, '#d97757', 'walk', { shadow: false })}</g>`
  return svg(W, H, s, { theme })
}

const cells = await calendar(USER)
mkdirSync(OUT_DIR, { recursive: true })
for (const theme of ['dark', 'light']) writeFileSync(new URL(`graph-${theme}.svg`, OUT_DIR), tidy(graph(cells, theme)))
console.log(`graph-*.svg: ${cells.length} días, ${cells.filter((d) => d.lv > 0).length} con actividad`)
