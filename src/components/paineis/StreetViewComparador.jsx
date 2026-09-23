import { useEffect, useRef, useState } from 'react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

if (API_KEY) {
  setOptions({ key: API_KEY, v: 'weekly' })
}

const formatarData = (data) =>
  new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(data)

// O campo `time` do StreetViewPanoramaData (retornado por
// StreetViewService.getPanorama) NÃO é documentado oficialmente pelo Google:
// lista os panoramas históricos disponíveis no mesmo ponto, cada um com
// {pano, <chave minificada>: Date}. A chave da data muda entre versões da
// API, então detectamos por tipo (instância de Date), não por nome fixo —
// qualquer falha aqui cai no fallback de mostrar a imagem atual nos dois
// painéis.
function extrairDataHistorica(item) {
  for (const chave of Object.keys(item)) {
    if (chave === 'pano') continue
    const valor = item[chave]
    if (valor instanceof Date && !isNaN(valor.getTime())) return valor
  }
  return null
}

// Retorna a lista completa de {pano, data} disponíveis no ponto, ordenada
// da mais antiga para a mais recente, ou null se houver menos de 2 datas
// (nesse caso os dois painéis caem no fallback: imagem atual, sem seletor).
async function buscarHistoricoPanoramas(StreetViewService, lat, lon) {
  try {
    const svc = new StreetViewService()
    const resp = await svc.getPanorama({ location: { lat, lng: lon }, radius: 50 })
    const bruto = resp?.data?.time
    if (!Array.isArray(bruto)) return null

    const itens = bruto
      .map(item => ({ pano: item.pano, data: extrairDataHistorica(item) }))
      .filter(item => item.pano && item.data)
      .sort((a, b) => a.data - b.data)

    return itens.length >= 2 ? itens : null
  } catch (e) {
    console.warn('[StreetViewComparador] não foi possível obter datas históricas (campo não-documentado da API do Google):', e)
    return null
  }
}

function SeletorData({ historico, indice, onSelecionar }) {
  return (
    <label className="streetview-seletor-data">
      <span aria-hidden="true">🕐</span>
      <select value={indice} onChange={e => onSelecionar(Number(e.target.value))}>
        {historico.map((item, i) => (
          <option key={item.pano} value={i}>{formatarData(item.data)}</option>
        ))}
      </select>
    </label>
  )
}

export default function StreetViewComparador({ lat, lon, endereco }) {
  const painelA = useRef(null)
  const painelB = useRef(null)
  const panoA = useRef(null)
  const panoB = useRef(null)
  const [erro, setErro] = useState(null)
  const [historico, setHistorico] = useState(null) // [{pano, data}, ...] ou null (sem histórico)
  const [indiceA, setIndiceA] = useState(0)
  const [indiceB, setIndiceB] = useState(0)
  const sincronizando = useRef(false) // evita loop infinito de eventos

  useEffect(() => {
    if (!API_KEY) {
      setErro('Chave de API do Google Maps não configurada (VITE_GOOGLE_MAPS_API_KEY).')
      return
    }

    let cancelado = false
    const listeners = []
    setHistorico(null)

    importLibrary('streetView').then(async ({ StreetViewPanorama, StreetViewService }) => {
      if (cancelado) return

      const lista = await buscarHistoricoPanoramas(StreetViewService, lat, lon)
      if (cancelado) return

      const opcoesBase = {
        pov: { heading: 0, pitch: 0 },
        zoom: 1,
        addressControl: true, // mostra o painel de endereço nativo
        showRoadLabels: false,
        fullscreenControl: false,
      }

      if (lista) {
        panoA.current = new StreetViewPanorama(painelA.current, { ...opcoesBase, pano: lista[0].pano })
        panoB.current = new StreetViewPanorama(painelB.current, { ...opcoesBase, pano: lista[lista.length - 1].pano })
        setHistorico(lista)
        setIndiceA(0)
        setIndiceB(lista.length - 1)
      } else {
        const posicao = { lat, lng: lon }
        panoA.current = new StreetViewPanorama(painelA.current, { ...opcoesBase, position: posicao })
        panoB.current = new StreetViewPanorama(painelB.current, { ...opcoesBase, position: posicao })
      }

      // --- Sincronização de ângulo de visão (heading/pitch/zoom) ---
      listeners.push(panoA.current.addListener('pov_changed', () => {
        if (sincronizando.current) return
        sincronizando.current = true
        panoB.current.setPov(panoA.current.getPov())
        panoB.current.setZoom(panoA.current.getZoom())
        sincronizando.current = false
      }))

      listeners.push(panoB.current.addListener('pov_changed', () => {
        if (sincronizando.current) return
        sincronizando.current = true
        panoA.current.setPov(panoB.current.getPov())
        panoA.current.setZoom(panoB.current.getZoom())
        sincronizando.current = false
      }))
    }).catch((e) => {
      if (cancelado) return
      console.error('Erro ao carregar Google Maps:', e)
      setErro('Não foi possível carregar o Street View. Verifique a chave de API e a conexão.')
    })

    return () => {
      cancelado = true
      listeners.forEach(l => l.remove())
      panoA.current = null
      panoB.current = null
    }
  }, [lat, lon])

  function selecionarDataA(indice) {
    setIndiceA(indice)
    panoA.current?.setPano(historico[indice].pano)
  }

  function selecionarDataB(indice) {
    setIndiceB(indice)
    panoB.current?.setPano(historico[indice].pano)
  }

  return (
    <div className="card streetview-secao">
      <div className="streetview-titulo">Comparativo de fachada</div>
      <p className="streetview-desc">
        {endereco} — navegue em um dos painéis; o ângulo de visão é
        espelhado automaticamente no outro.{' '}
        {historico
          ? 'Use o seletor de data (🕐) em cada painel para comparar períodos diferentes.'
          : 'Este endereço só tem uma data de captura disponível no Street View — os dois painéis mostram a mesma imagem.'}
      </p>

      {erro && (
        <p className="streetview-erro">{erro}</p>
      )}

      <div className="streetview-grid">
        <div className="streetview-coluna">
          {historico && (
            <SeletorData historico={historico} indice={indiceA} onSelecionar={selecionarDataA} />
          )}
          <div ref={painelA} className="streetview-painel" />
        </div>
        <div className="streetview-coluna">
          {historico && (
            <SeletorData historico={historico} indice={indiceB} onSelecionar={selecionarDataB} />
          )}
          <div ref={painelB} className="streetview-painel" />
        </div>
      </div>
    </div>
  )
}
