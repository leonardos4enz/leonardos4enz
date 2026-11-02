// Gráfica de contribuciones habitada: la flota recorre tus contribuciones reales del último año.
// Uso: node .github/agents/graph.mjs [usuario]  → assets/agents/graph-dark.svg y graph-light.svg
// Lee la gráfica pública de github.com/users/<usuario>/contributions (no necesita token).
import { writeFileSync, mkdirSync } from 'node:fs'
import { agent, clawd, minion, travel, svg, loop, reseed, tidy, OUT } from './lib.mjs'

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

function graph(cells, theme) {
  reseed(31)
  const W = 880, H = 190, X0 = 18, Y0 = 46, CS = 13, GAP = 3
  const cols = Math.max(...cells.map((d) => d.c)) + 1
  const lv = theme === 'dark' ? ['#151b23', '#033a16', '#196c2e', '#2ea043', '#56d364'] : ['#eff2f5', '#aceebb', '#4ac26b', '#2da44e', '#116329']
  const active = cells.filter((d) => d.lv > 0).length
  let s = `<text x="${X0}" y="26" font-size="12" fill="var(--mut)">$ git log --graph   <tspan fill="var(--ink)">${active}</tspan> active days in the last year</text>`
  for (const d of cells) s += `<rect x="${X0 + d.c * (CS + GAP)}" y="${Y0 + d.r * (CS + GAP)}" width="${CS}" height="${CS}" rx="2.5" fill="${lv[d.lv]}"/>`
  // barrido: la columna por la que pasa la flota se ilumina
  const D = 26, span = (cols - 1) * (CS + GAP)
  s += `<rect y="${Y0 - 4}" width="${CS + 6}" height="${7 * (CS + GAP) + 4}" rx="4" fill="none" stroke="#d4ff3a" stroke-width="1.5" opacity=".7"><animate attributeName="x" values="${X0 - 3};${X0 - 3 + span}" dur="${D}s" repeatCount="indefinite"/></rect>`
  const ground = Y0 + 7 * (CS + GAP) + 26
  s += `<path d="M${X0} ${ground}H${W - 18}" stroke="var(--line)" stroke-width="1.5" stroke-dasharray="1 6"/>`
  s += travel(`<g>${loop('translate', ['0 0', '0 -6', '0 0'], 0.46, { curve: OUT })}${agent(0, ground, 34, '#2d6fd8', 'iniciando', { tag: 'A02', acc: false })}</g>`, X0 + 8, X0 + 8 + span, D, 0)
  s += travel(clawd(0, ground, 3, '#d97757', 'walk'), X0 - 30, X0 - 30 + span, D, 0)
  s += travel(minion(0, ground, 0.9, '#b59cf5', 0), X0 - 62, X0 - 62 + span, D, 0)
  // los que se quedan sentados encima de la gráfica
  s += agent(470, Y0 - 1, 26, '#e0705a', 'review', { acc: false })
  s += clawd(640, Y0 - 1, 2.2, '#a77bf3', 'sleep')
  s += agent(800, Y0 - 1, 26, '#1f9e8f', 'pr', { acc: false })
  return svg(W, H, s, { theme })
}

const cells = await calendar(USER)
mkdirSync(OUT_DIR, { recursive: true })
for (const theme of ['dark', 'light']) writeFileSync(new URL(`graph-${theme}.svg`, OUT_DIR), tidy(graph(cells, theme)))
console.log(`graph-*.svg: ${cells.length} días, ${cells.filter((d) => d.lv > 0).length} con actividad`)
