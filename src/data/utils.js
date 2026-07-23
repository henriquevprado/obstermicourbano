export const INDICADORES = {
  total: 118,
  queda_2023: 115,          // empreendimentos com queda
  queda_media: -2.0,        // °C, média de delta_2023
  maior_queda: -4.5,        // °C
  queda_regiao: -2.89,      // °C pré vs pós 2023
  queda_empreend: -3.16,    // °C pré vs pós 2023
  efeito_adicional: -0.27,  // °C
  arvores_total: 731,
  telhado_total: 4879,      // m²
  certificacoes: { DIAMANTE: 94, PRATA: 14, OURO: 8, BRONZE: 2 },
  por_ano: { 2023: 17, 2024: 51, 2025: 37, 2026: 13 },
}

export const CERT_CORES = {
  BRONZE: 'var(--cert-bronze)',
  PRATA: 'var(--cert-prata)',
  OURO: 'var(--cert-ouro)',
  DIAMANTE: 'var(--cert-diamante)',
}

export const ANOS = [2016, 2017, 2020, 2021, 2022, 2023, 2024, 2025, 2026]

export const TILE_SATELITE = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attribution: 'Tiles &copy; Esri &mdash; Esri, Maxar, Earthstar Geographics',
}

export function interpolarCor(c1, c2, t) {
  const h = s => parseInt(s, 16)
  const r = n => n.toString(16).padStart(2, '0')
  const [r1, g1, b1] = [c1.slice(1, 3), c1.slice(3, 5), c1.slice(5, 7)].map(h)
  const [r2, g2, b2] = [c2.slice(1, 3), c2.slice(3, 5), c2.slice(5, 7)].map(h)
  return `#${r(Math.round(r1 + (r2 - r1) * t))}${r(Math.round(g1 + (g2 - g1) * t))}${r(Math.round(b1 + (b2 - b1) * t))}`
}

export function corPorDelta(delta) {
  if (delta < 0) {
    const t = Math.min(1, Math.abs(delta) / 4.5)
    return interpolarCor('#e0e0e0', '#2c7fb8', t)
  } else {
    const t = Math.min(1, delta / 1.05)
    return interpolarCor('#e0e0e0', '#d7301f', t)
  }
}

export function raioPorDelta(delta) {
  return Math.min(15, 6 + Math.abs(delta) * 2)
}

/** Cor a partir dos class breaks reais do webmap (fallback: corPorDelta) */
export function corPorClassBreaks(delta, breaks) {
  if (!breaks || breaks.length === 0) return corPorDelta(delta)
  const encontrada = breaks.find(b => delta <= b.max)
  return (encontrada || breaks[breaks.length - 1]).cor
}

export function formatarDelta(delta) {
  const sinal = delta > 0 ? '+' : delta < 0 ? '−' : ''
  return `${sinal}${Math.abs(delta).toFixed(1)}°C`
}
