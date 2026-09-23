import { useEffect, useMemo, useState } from 'react'

const BASE = 'https://arcgis-ope.codexremote.com.br/server/rest/services/Hosted'

export const SERVICES = {
  empreendimentos: `${BASE}/LST_Janeiro_Queda_2023/FeatureServer/129`,
  bairros: `${BASE}/bairros_centrais/FeatureServer/50`,
}

export const WEBMAP_ID = '12a4367e688047c89eb89463978387ed'

const ANOS_TEMP = [2020, 2021, 2022, 2023, 2024, 2025, 2026]

function normalizar(feature) {
  const p = feature.properties
  const [lon, lat] = feature.geometry.coordinates

  const periodos = ANOS_TEMP
    .map(ano => ({ ano, temp: p[`temp_${ano}`] }))
    .filter(per => per.temp != null)

  return {
    objectid: p.objectid,
    sei: p.sei,
    endereco: p.endereco,
    certificado: p.certificado,
    ano_certificacao: p.ano,
    enquadramento: p.enquadramento,
    lat,
    lon,
    periodos,

    media_pre2023: p.media_pre2023,
    media_pos2023: p.media_pos2023,
    delta_2023: p.delta_2023,
    delta_total: p.delta_total,
    slope_linear: p.slope_linear,

    arvores_implantadas: p.total_de_árvores_implantadas,
    arvores_nativas_implantadas: p.total_de_árvores_nativas_implan,
    arvores_nativas_preservadas: p.total_de_árvores_nativas_preser,
    arvores_no_empreendimento: p.total_de_árvores_no_empreendime,
    arvores_nativas_ameacadas: p.total_de_árvores_nativas_ameaça,
    especies_nativas_ameacadas: p.total_de_espécies_nativas_ameaç,
    total_arvores: p.total_de_árvores,

    telhado_verde_m2: p.área_de_telhado_verde_instalado,
    parede_verde_m2: p.área_de_parede_verde_instalada_,
    area_permeavel_excedente: p.área_permeável_excedente_ao_sol,
    pavimentacao_permeavel: p.pavimentação_permeável_instalad,

    vagas_bicicletario: p.quantidade_de_vagas_no_biciclet,
    vagas_veiculos_eletricos: p.quantidade_de_vagas_para_veícul,
    vagas_bicicleta: p.quantidade_de_vagas_para_bicicl,

    pontuacao_biodiversidade: p.pontuação_de_conservação_de_bio,
    pontuacao_adequacao_climatica: p.pontuação_de_adequação_às_condi,
  }
}

export function useEmpreendimentos() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const url = `${SERVICES.empreendimentos}/query?where=1%3D1&outFields=*&outSR=4326&f=geojson`
    fetch(url)
      .then(r => r.json())
      .then(d => {
        setData((d.features || []).map(normalizar))
        setLoading(false)
      })
      .catch(e => {
        setError(e)
        setLoading(false)
      })
  }, [])

  return { data, loading, error }
}

function pontoNoAnel(x, y, anel) {
  let dentro = false
  for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
    const [xi, yi] = anel[i]
    const [xj, yj] = anel[j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dentro = !dentro
  }
  return dentro
}

function pontoNoBairro(lon, lat, geometry) {
  const poligonos = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
  return poligonos.some(p => pontoNoAnel(lon, lat, p[0]) && !p.slice(1).some(b => pontoNoAnel(lon, lat, b)))
}

/**
 * Variação média de temperatura (delta_2023) por bairro. A camada de bairros
 * só traz nome/geometria, então o cálculo é o cruzamento espacial: cada
 * empreendimento entra na média do bairro cujo polígono o contém.
 */
export function useBairrosRanking(empreendimentos) {
  const [bairros, setBairros] = useState([])

  useEffect(() => {
    const url = `${SERVICES.bairros}/query?where=1%3D1&outFields=nome&outSR=4326&f=geojson`
    fetch(url)
      .then(r => r.json())
      .then(d => setBairros(d.features || []))
      .catch(() => setBairros([]))
  }, [])

  return useMemo(() => {
    const acc = new Map(bairros.map(b => [b.properties.nome, { soma: 0, n: 0 }]))
    empreendimentos.forEach(e => {
      const bairro = bairros.find(b => pontoNoBairro(e.lon, e.lat, b.geometry))
      if (!bairro || e.delta_2023 == null) return
      const a = acc.get(bairro.properties.nome)
      a.soma += e.delta_2023
      a.n += 1
    })
    return [...acc.entries()]
      .filter(([, a]) => a.n > 0)
      .map(([nome, a]) => ({ nome, delta: a.soma / a.n, quantidade: a.n }))
      .sort((a, b) => a.delta - b.delta)
  }, [bairros, empreendimentos])
}

// Imagens do Google Earth Pro: uso interno/demonstrativo apenas — não
// publicar em portal oficial público sem licenciamento adequado. Usado só
// quando o empreendimento não tem NENHUM anexo no Enterprise.
export const FALLBACK_IMAGENS = {
  '23.0.000104967-4': [
    { nome: 'Antes (2022)', url: '/swipe/koseritz_antes_2022.jpg' },
    { nome: 'Depois (2026)', url: '/swipe/koseritz_depois_2026.jpg' },
  ],
}

function extrairAno(nomeArquivo) {
  const match = nomeArquivo.match(/(\d{4})/)
  return match ? parseInt(match[1], 10) : null
}

function classificarAnexo(nomeArquivo) {
  return {
    ano: extrairAno(nomeArquivo),
    tipo: /fachada/i.test(nomeArquivo) ? 'fachada' : 'topo',
  }
}

async function buscarAnexos(objectId) {
  const url = `${SERVICES.empreendimentos}/${objectId}/attachments?f=json`
  const res = await fetch(url)
  const data = await res.json()
  return (data.attachmentInfos || []).map(a => ({
    id: a.id,
    nome: a.name,
    url: `${SERVICES.empreendimentos}/${objectId}/attachments/${a.id}`,
  }))
}

/**
 * Busca os anexos reais do Enterprise. Se não houver nenhum, cai no
 * FALLBACK_IMAGENS (para empreendimentos sem nenhum anexo cadastrado ainda).
 */
async function buscarAnexosCompletos(objectId, sei) {
  let anexos = []
  try {
    anexos = await buscarAnexos(objectId)
  } catch {
    anexos = []
  }

  if (anexos.length === 0) {
    const fallback = FALLBACK_IMAGENS[sei] || []
    return fallback.map((f, i) => ({ ...f, id: `fallback-${i}` }))
  }

  return anexos
}

/**
 * Busca os anexos (fotos) de um empreendimento, ordena por ano extraído do
 * nome do arquivo e rotula: fotos de fachada como "Fachada (ano)"; entre as
 * aéreas ("topo"), a mais antiga vira "Antes", a mais recente "Depois" e
 * as intermediárias "Durante a obra" — tudo com o ano ao lado.
 */
export async function buscarAnexosOrdenados(objectId, sei) {
  const anexos = await buscarAnexosCompletos(objectId, sei)

  const comInfo = anexos
    .map(a => ({ ...a, ...classificarAnexo(a.nome) }))
    .filter(a => a.ano !== null)
    .sort((a, b) => a.ano - b.ano)

  const aereas = comInfo.filter(a => a.tipo !== 'fachada')

  return comInfo.map(a => {
    if (a.tipo === 'fachada') {
      return { ...a, nome: `Fachada (${a.ano})` }
    }
    const idx = aereas.indexOf(a)
    const nome = idx === 0 ? `Antes (${a.ano})`
      : idx === aereas.length - 1 ? `Depois (${a.ano})`
        : `Durante a obra (${a.ano})`
    return { ...a, nome }
  })
}
