import { useEffect, useMemo, useRef, useState } from 'react'
import WebMap from '@arcgis/core/WebMap'
import MapView from '@arcgis/core/views/MapView'
import MediaLayer from '@arcgis/core/layers/MediaLayer'
import ImageElement from '@arcgis/core/layers/support/ImageElement'
import ExtentAndRotationGeoreference from '@arcgis/core/layers/support/ExtentAndRotationGeoreference'
import Extent from '@arcgis/core/geometry/Extent'
import Legend from '@arcgis/core/widgets/Legend'
import BasemapGallery from '@arcgis/core/widgets/BasemapGallery'
import { ANOS } from '../../data/utils'
import { WEBMAP_ID } from '../../hooks/useEnterprise'

const ICONE_CAMADAS = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
)

const ICONE_LEGENDA = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)

const ICONE_BASEMAP = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

export default function MapaCalor({ empreendimentos, selecionado }) {
  const mapDivRef = useRef(null)
  const viewRef = useRef(null)
  const camadaEmpreendRef = useRef(null)
  const highlightHandleRef = useRef(null)
  const mediaLayerRef = useRef(null)
  const opacidadeRef = useRef(0.6)
  const intervalRef = useRef(null)

  const legendaDivRef = useRef(null)
  const basemapGaleriaDivRef = useRef(null)
  const legendWidgetRef = useRef(null)
  const basemapGalleryWidgetRef = useRef(null)

  const [bounds, setBounds] = useState(null)
  const [indiceAno, setIndiceAno] = useState(ANOS.length - 1)
  const [tocando, setTocando] = useState(false)
  const [opacidade, setOpacidade] = useState(0.6)
  const [mapaPronto, setMapaPronto] = useState(false)

  const [painelAberto, setPainelAberto] = useState(null)
  const [legendaVisivel, setLegendaVisivel] = useState(true)
  const [camadaRaster, setCamadaRaster] = useState(true)
  const [camadasWebmap, setCamadasWebmap] = useState([])
  const [visibilidadeCamadas, setVisibilidadeCamadas] = useState({})

  const ano = ANOS[indiceAno]

  useEffect(() => {
    fetch('/raster_overlays/bounds.json')
      .then(r => r.json())
      .then(setBounds)
      .catch(() => setBounds({}))
  }, [])

  useEffect(() => {
    if (tocando) {
      intervalRef.current = setInterval(() => {
        setIndiceAno(i => (i + 1) % ANOS.length)
      }, 1200)
    }
    return () => clearInterval(intervalRef.current)
  }, [tocando])

  useEffect(() => {
    opacidadeRef.current = opacidade
  }, [opacidade])

  const boundsAno = bounds?.[String(ano)]

  const pontosVisiveis = useMemo(
    () => empreendimentos.filter(e => e.ano_certificacao && e.ano_certificacao <= ano),
    [empreendimentos, ano]
  )

  // Inicializa o WebMap + MapView uma única vez — traz mapa base, renderer,
  // clustering e popups exatamente como configurados no Enterprise. Legenda
  // e mapa base usam os widgets nativos do ArcGIS (Legend, BasemapGallery)
  // ligados à view, então continuam refletindo o webmap automaticamente. O
  // painel de camadas usa checkboxes próprios (visual do app), mas a lista
  // de camadas é montada a partir do próprio webmap.layers — então uma
  // camada nova adicionada no Enterprise aparece aqui sem alterar o código.
  useEffect(() => {
    const webmap = new WebMap({ portalItem: { id: WEBMAP_ID } })
    const view = new MapView({ container: mapDivRef.current, map: webmap })
    viewRef.current = view

    webmap.when(() => {
      camadaEmpreendRef.current =
        webmap.layers.find(l => l.title === 'Empreendimentos com Certificação Sustentável') ||
        webmap.layers.find(l => l.url?.includes('LST_Janeiro_Queda_2023'))

      // Filtra layers com listMode "hide" (ex.: o raster de temperatura,
      // adicionado por código à mesma coleção webmap.layers) — mesmo
      // critério que a Legend/LayerList nativas usam para não listá-los.
      const camadas = webmap.layers
        .filter(layer => layer.listMode !== 'hide')
        .toArray()
        .map(layer => ({ id: layer.id, title: layer.title, layer }))
      setCamadasWebmap(camadas)
      setVisibilidadeCamadas(Object.fromEntries(camadas.map(c => [c.id, c.layer.visible])))

      legendWidgetRef.current = new Legend({ view, container: legendaDivRef.current })
      basemapGalleryWidgetRef.current = new BasemapGallery({ view, container: basemapGaleriaDivRef.current })

      setMapaPronto(true)
    }, err => {
      // AbortError é esperado em dev por causa do double-invoke de efeitos
      // do StrictMode (monta → desmonta → monta de novo); só logar falhas reais.
      if (err?.name !== 'AbortError') {
        console.error('[MapaCalor] erro ao carregar webmap:', err)
      }
    })

    return () => {
      legendWidgetRef.current?.destroy()
      basemapGalleryWidgetRef.current?.destroy()
      highlightHandleRef.current?.remove()
      view.destroy()
    }
  }, [])

  function alternarCamadaWebmap(id) {
    setVisibilidadeCamadas(v => {
      const novoValor = !v[id]
      const camada = camadasWebmap.find(c => c.id === id)
      if (camada) camada.layer.visible = novoValor
      return { ...v, [id]: novoValor }
    })
  }

  // Filtro cumulativo de pontos por ano — via definitionExpression, no
  // próprio ArcGIS, em vez de filtrar manualmente no React.
  useEffect(() => {
    if (camadaEmpreendRef.current) {
      camadaEmpreendRef.current.definitionExpression = `ano <= ${ano}`
    }
  }, [ano, mapaPronto])

  // Ao clicar num item do ranking (Top10Queda), avança o ano do slider até
  // o ano de certificação do ponto (se ele ainda não estiver visível pelo
  // filtro cumulativo), leva a view até as coordenadas do empreendimento e
  // destaca a feição correspondente na camada (highlight nativo do ArcGIS).
  useEffect(() => {
    if (!selecionado || !mapaPronto || !viewRef.current) return

    const anoIndex = ANOS.indexOf(selecionado.ano_certificacao)
    if (anoIndex !== -1 && anoIndex > indiceAno) {
      setTocando(false)
      setIndiceAno(anoIndex)
    }

    viewRef.current.goTo(
      { center: [selecionado.lon, selecionado.lat], zoom: 17 },
      { duration: 1200 }
    )

    let cancelado = false
    if (camadaEmpreendRef.current) {
      Promise.all([
        viewRef.current.whenLayerView(camadaEmpreendRef.current),
        camadaEmpreendRef.current.queryFeatures({
          objectIds: [selecionado.objectid],
          outFields: ['*'],
          returnGeometry: true,
        }),
      ]).then(([layerView, resultado]) => {
        if (cancelado) return
        highlightHandleRef.current?.remove()
        const feature = resultado.features[0]
        if (feature) {
          highlightHandleRef.current = layerView.highlight(feature)
        }
      }).catch(() => {})
    }

    return () => { cancelado = true }
  }, [selecionado, mapaPronto])

  // Camada de imagem (raster) georreferenciada — equivalente ao
  // ImageOverlay do Leaflet, via MediaLayer + ImageElement.
  useEffect(() => {
    if (!viewRef.current?.map) return

    if (mediaLayerRef.current) {
      viewRef.current.map.remove(mediaLayerRef.current)
      mediaLayerRef.current = null
    }

    if (!camadaRaster || !boundsAno) return

    const [[latMin, lonMin], [latMax, lonMax]] = boundsAno
    const extent = new Extent({
      xmin: lonMin, ymin: latMin, xmax: lonMax, ymax: latMax,
      spatialReference: { wkid: 4326 },
    })

    const imageElement = new ImageElement({
      image: `/raster_overlays/lst_${ano}.png`,
      georeference: new ExtentAndRotationGeoreference({ extent }),
    })

    const mediaLayer = new MediaLayer({
      source: [imageElement],
      opacity: opacidadeRef.current,
      title: `LST ${ano}`,
      // Camada só do app (não faz parte do webmap do Enterprise) — fica de
      // fora da Legend nativa e do painel de camadas do webmap; o controle
      // dela continua no toggle próprio "Raster de temperatura".
      listMode: 'hide',
    })

    viewRef.current.map.add(mediaLayer)
    mediaLayerRef.current = mediaLayer
  }, [ano, boundsAno, camadaRaster, mapaPronto])

  useEffect(() => {
    if (mediaLayerRef.current) mediaLayerRef.current.opacity = opacidade
  }, [opacidade])

  function alternarPainel(nome) {
    setPainelAberto(p => (p === nome ? null : nome))
  }

  return (
    <div className="mapa-painel">
      {/* calcite-mode-dark: os widgets nativos do ArcGIS (Legend,
          BasemapGallery, zoom) são componentes Calcite e só assumem a
          paleta escura com essa classe num ancestral — sem ela, ficam no
          modo claro padrão e destoam dos painéis escuros do app. */}
      <div className="mapa-leaflet calcite-mode-dark">
        <div ref={mapDivRef} style={{ width: '100%', height: '100%' }} />

        <div className="mapa-ferramentas">
          <div className="ferramenta-grupo">
            <button
              className={`ferramenta-btn ${painelAberto === 'camadas' ? 'ativo' : ''}`}
              onClick={() => alternarPainel('camadas')}
              title="Ligar/desligar camadas"
              aria-label="Ligar/desligar camadas"
            >
              {ICONE_CAMADAS}
            </button>
            {painelAberto === 'camadas' && (
              <div className="ferramenta-painel">
                <label>
                  <input type="checkbox" checked={camadaRaster} onChange={() => setCamadaRaster(v => !v)} />
                  Raster de temperatura
                </label>
                {camadasWebmap.map(c => (
                  <label key={c.id}>
                    <input
                      type="checkbox"
                      checked={visibilidadeCamadas[c.id] ?? true}
                      onChange={() => alternarCamadaWebmap(c.id)}
                    />
                    {c.title}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="ferramenta-grupo">
            <button
              className={`ferramenta-btn ${legendaVisivel ? 'ativo' : ''}`}
              onClick={() => setLegendaVisivel(v => !v)}
              title="Ligar/desligar legenda"
              aria-label="Ligar/desligar legenda"
            >
              {ICONE_LEGENDA}
            </button>
          </div>

          <div className="ferramenta-grupo">
            <button
              className={`ferramenta-btn ${painelAberto === 'basemap' ? 'ativo' : ''}`}
              onClick={() => alternarPainel('basemap')}
              title="Mudar mapa base"
              aria-label="Mudar mapa base"
            >
              {ICONE_BASEMAP}
            </button>
            <div
              className="ferramenta-painel"
              style={{ display: painelAberto === 'basemap' ? 'flex' : 'none' }}
            >
              {/* BasemapGallery nativo — mesma galeria de mapas base
                  configurada na organização do ArcGIS Enterprise. */}
              <div ref={basemapGaleriaDivRef} className="basemap-webmap-galeria" />
            </div>
          </div>
        </div>

        <div className="mapa-legenda" style={{ display: legendaVisivel ? 'block' : 'none' }}>
          <div className="legenda-nota">Números em círculo = agrupamentos (cor = média do grupo)</div>
          {/* Legend nativo — mostra a simbologia real de cada camada do
              webmap (Empreendimentos, Bairros, Corredores Verdes etc.)
              exatamente como configurada no Enterprise, sem precisar
              atualizar este componente quando uma camada é adicionada. */}
          <div ref={legendaDivRef} className="legenda-webmap" />
          <div className="legenda-titulo">Temperatura de superfície</div>
          <div className="legenda-barra raster" />
          <div className="legenda-labels">
            <span>25°C</span><span>48°C</span>
          </div>
        </div>
      </div>

      <div className="mapa-controles">
        <button className="play-btn" onClick={() => setTocando(t => !t)} aria-label="Reproduzir">
          {tocando ? '❚❚' : '▶'}
        </button>
        <div className="ano-atual">{ano}</div>
        <input
          type="range"
          min={0}
          max={ANOS.length - 1}
          step={1}
          value={indiceAno}
          onChange={e => { setTocando(false); setIndiceAno(Number(e.target.value)) }}
        />
        <div className="opacidade-controle">
          Opacidade
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={opacidade}
            onChange={e => setOpacidade(Number(e.target.value))}
          />
        </div>
      </div>
      <p className="mapa-nota">
        Ao mudar o ano, o mapa de calor (raster) é atualizado e os
        empreendimentos certificados até aquele ano são exibidos
        progressivamente ({pontosVisiveis.length} de {empreendimentos.length} em {ano}).
        Cor e tamanho dos pontos refletem sempre a variação de temperatura
        desde 2023 (delta_2023), que é fixa por empreendimento — mapa base,
        simbologia e agrupamento vêm diretamente do Web Map configurado no
        ArcGIS Enterprise.
      </p>
    </div>
  )
}
