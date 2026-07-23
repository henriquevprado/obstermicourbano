import empreendimentos from './empreendimentos.json'

export const CERT_CORES = {
  BRONZE: '#cd7f32',
  PRATA: '#8a9197',
  OURO: '#d4a017',
  DIAMANTE: '#1351b4'
}

export const CERT_ORDEM = ['BRONZE', 'PRATA', 'OURO', 'DIAMANTE']

export function getEmpreendimentos() {
  return empreendimentos
}

export function getPeriodos() {
  return empreendimentos[0].periodos.map((p) => ({
    ano: p.ano,
    semestre: p.semestre,
    stdtime: p.stdtime,
    label: `${p.ano} S${p.semestre}`
  }))
}

export function getIndicadoresMacro() {
  const total = empreendimentos.length
  const arvores = empreendimentos.reduce((s, e) => s + (e.arvores_implantadas || 0), 0)
  const arvoresPres = empreendimentos.reduce((s, e) => s + (e.arvores_preservadas || 0), 0)
  const telhado = empreendimentos.reduce((s, e) => s + (e.telhado_verde_m2 || 0), 0)
  const tempGeral =
    empreendimentos.reduce((s, e) => s + e.temp_media_geral, 0) / total

  return {
    total,
    arvores,
    arvoresPres,
    telhado: Math.round(telhado),
    tempGeral: Math.round(tempGeral * 10) / 10
  }
}

export function getDistribuicaoCertificacao() {
  const cont = { BRONZE: 0, PRATA: 0, OURO: 0, DIAMANTE: 0 }
  empreendimentos.forEach((e) => {
    cont[e.certificado] = (cont[e.certificado] || 0) + 1
  })
  return CERT_ORDEM.map((c) => ({
    nome: c.charAt(0) + c.slice(1).toLowerCase(),
    chave: c,
    valor: cont[c],
    cor: CERT_CORES[c]
  }))
}

export function getTendenciaCidade() {
  const periodos = getPeriodos()
  return periodos.map((per, i) => {
    const vals = empreendimentos.map((e) => e.periodos[i].temp_media)
    const media = vals.reduce((a, b) => a + b, 0) / vals.length
    return {
      periodo: per.label,
      temperatura: Math.round(media * 10) / 10
    }
  })
}

export function getRankingVariacao(n = 6) {
  const ordenado = [...empreendimentos].sort((a, b) => b.delta_temp - a.delta_temp)
  const topo = ordenado.slice(0, n)
  const base = ordenado.slice(-n).reverse()
  return [...topo, ...base].map((e) => ({
    nome: (e.endereco || e.sei).trim().slice(0, 26),
    delta: e.delta_temp,
    cert: e.certificado
  }))
}

export function tempParaCor(temp, min = 23, max = 38) {
  const t = Math.max(0, Math.min(1, (temp - min) / (max - min)))
  if (t < 0.5) {
    const r = t * 2
    return interpolar('#2c7fb8', '#fec44f', r)
  } else {
    const r = (t - 0.5) * 2
    return interpolar('#fec44f', '#d7301f', r)
  }
}

function interpolar(c1, c2, t) {
  const a = hexToRgb(c1)
  const b = hexToRgb(c2)
  const r = Math.round(a.r + (b.r - a.r) * t)
  const g = Math.round(a.g + (b.g - a.g) * t)
  const bl = Math.round(a.b + (b.b - a.b) * t)
  return `rgb(${r}, ${g}, ${bl})`
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}
