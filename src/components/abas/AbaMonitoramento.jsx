import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet'
import { ReactCompareSlider, ReactCompareSliderImage, ReactCompareSliderHandle } from 'react-compare-slider'
import { useEmpreendimentos, buscarAnexosOrdenados } from '../../hooks/useEnterprise'
import { CERT_CORES, formatarDelta, TILE_SATELITE } from '../../data/utils'
import ModalRelatorioEvolucao from '../paineis/ModalRelatorioEvolucao'

const CENTRO_PADRAO = [-30.0305, -51.1895]
const QTD_LISTA = 5
const SEI_COM_IMAGENS = '24.0.000105822-0' // R. Sao Manoel, 730 — já tem anexos reais no Enterprise

const ICONE_GEOBIM = (
  <img src="/geobim-logo.png" alt="" width="16" height="16" style={{ marginRight: 6, verticalAlign: -3 }} />
)

function FlyToSelecionado({ lat, lon }) {
  const map = useMap()
  useEffect(() => {
    if (lat != null && lon != null) map.flyTo([lat, lon], 17, { duration: 1 })
  }, [lat, lon, map])
  return null
}

function CorrigirTamanho() {
  const map = useMap()
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 150)
    return () => clearTimeout(t)
  }, [map])
  return null
}

export default function AbaMonitoramento({ seiInicial }) {
  const { data: empreendimentos, loading } = useEmpreendimentos()
  const [busca, setBusca] = useState('')
  const [selecionado, setSelecionado] = useState(null)
  const [anexos, setAnexos] = useState([])
  const [carregandoAnexos, setCarregandoAnexos] = useState(false)
  const [marcados, setMarcados] = useState([])
  const [comparando, setComparando] = useState(false)
  const [disponibilidade, setDisponibilidade] = useState({})
  const [relatorioAberto, setRelatorioAberto] = useState(false)

  const listaCurada = useMemo(() => {
    const ordenado = [...empreendimentos].sort((a, b) => a.delta_2023 - b.delta_2023)
    const destaque = ordenado.find(e => e.sei === SEI_COM_IMAGENS)
    if (!destaque) return ordenado.slice(0, QTD_LISTA)
    const resto = ordenado.filter(e => e.sei !== SEI_COM_IMAGENS).slice(0, QTD_LISTA - 1)
    return [destaque, ...resto]
  }, [empreendimentos])

  const filtrados = useMemo(() => {
    if (!busca.trim()) return listaCurada
    const termo = busca.trim().toLowerCase()
    return listaCurada.filter(e => e.endereco.toLowerCase().includes(termo))
  }, [listaCurada, busca])

  useEffect(() => {
    if (listaCurada.length === 0) return
    let cancelado = false
    Promise.all(
      listaCurada.map(e =>
        buscarAnexosOrdenados(e.objectid, e.sei).then(lista => [e.sei, lista.length > 0])
      )
    ).then(pares => {
      if (!cancelado) setDisponibilidade(Object.fromEntries(pares))
    })
    return () => { cancelado = true }
  }, [listaCurada])

  // Pré-seleciona o empreendimento vindo do botão "Monitorar" da tabela —
  // busca na lista completa (não só na curada), já que pode ser qualquer
  // um dos 118.
  useEffect(() => {
    if (!seiInicial || empreendimentos.length === 0) return
    const encontrado = empreendimentos.find(e => e.sei === seiInicial)
    if (encontrado) setSelecionado(encontrado)
  }, [seiInicial, empreendimentos])

  useEffect(() => {
    if (!selecionado) return
    setCarregandoAnexos(true)
    setMarcados([])
    setComparando(false)
    buscarAnexosOrdenados(selecionado.objectid, selecionado.sei)
      .then(setAnexos)
      .finally(() => setCarregandoAnexos(false))
  }, [selecionado])

  function selecionarEmpreendimento(e) {
    setSelecionado(e)
  }

  function toggleAnexo(id) {
    setMarcados(sel => (
      sel.includes(id) ? sel.filter(s => s !== id) : [...sel, id]
    ))
  }

  function abrirRelatorio() {
    if (!selecionado) return
    setRelatorioAberto(true)
  }

  // anexos já vem ordenado cronologicamente — com 2+ marcados, o relatório e
  // o swipe usam exatamente essas imagens, na mesma ordem.
  const anexosMarcados = anexos.filter(a => marcados.includes(a.id))
  const imagensComparacao = anexosMarcados.length >= 2
    ? [anexosMarcados[0], anexosMarcados[anexosMarcados.length - 1]]
    : []

  return (
    <section className="secao">
      <div className="secao-titulo">Monitoramento</div>
      <div className="secao-subtitulo">Comparação de imagens antes/depois por empreendimento</div>
      <p className="secao-desc">
        Selecione um empreendimento e duas ou mais imagens para comparar
        visualmente a evolução do local com a ferramenta de arraste (swipe).
      </p>

      <div className="monitoramento-layout">
        <aside className="monitoramento-sidebar">
          <h3>Selecionar Empreendimento</h3>
          <input
            className="tabela-busca"
            style={{ width: '100%' }}
            placeholder="Buscar por endereço…"
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
          <div className="monitoramento-lista">
            {loading && <div className="monitoramento-vazio">Carregando…</div>}
            {!loading && filtrados.map(e => (
              <button
                key={e.sei}
                className={`monitoramento-item ${selecionado?.sei === e.sei ? 'ativo' : ''}`}
                onClick={() => selecionarEmpreendimento(e)}
              >
                <span className="badge-cert" style={{ background: CERT_CORES[e.certificado] }}>
                  {e.certificado}
                </span>
                <span>
                  {e.endereco}
                  {disponibilidade[e.sei] === false && (
                    <span className="monitoramento-sem-imagens"> (Sem imagens)</span>
                  )}
                </span>
              </button>
            ))}
          </div>

          {selecionado && (
            <div className="monitoramento-detalhe">
              <div className="monitoramento-card-selecionado">
                <strong>{selecionado.endereco}</strong>
                <span className="badge-cert" style={{ background: CERT_CORES[selecionado.certificado] }}>
                  {selecionado.certificado}
                </span>
                <span>Variação: {formatarDelta(selecionado.delta_2023)}</span>
              </div>

              <div className="monitoramento-anexos-titulo">Imagens disponíveis</div>
              {carregandoAnexos && <div className="monitoramento-vazio">Buscando imagens…</div>}
              {!carregandoAnexos && anexos.length === 0 && (
                <div className="monitoramento-vazio">Nenhuma imagem disponível.</div>
              )}
              {!carregandoAnexos && anexos.map(a => (
                <label key={a.id} className="monitoramento-anexo-item">
                  <input
                    type="checkbox"
                    checked={marcados.includes(a.id)}
                    onChange={() => toggleAnexo(a.id)}
                  />
                  <img src={a.url} alt={a.nome} />
                  <span>{a.nome}</span>
                </label>
              ))}

              {anexos.length > 0 && (
                <>
                  <div className="monitoramento-contagem">{marcados.length} imagens selecionadas</div>
                  <button
                    className="filtro-btn ativo"
                    style={{ width: '100%' }}
                    disabled={marcados.length < 2}
                    onClick={() => setComparando(true)}
                  >
                    Comparar (Swipe)
                  </button>
                  <button
                    className="filtro-btn"
                    style={{ width: '100%', marginTop: 8 }}
                    disabled={marcados.length < 2}
                    onClick={abrirRelatorio}
                  >
                    Gerar Relatório de Evolução
                  </button>
                  <button
                    className="filtro-btn geobim-btn"
                    style={{ width: '100%' }}
                    disabled
                    title="Integração futura com o ArcGIS GeoBIM"
                  >
                    {ICONE_GEOBIM}
                    Ver projeto 3D no GeoBIM
                    <span className="badge-em-breve">Em breve</span>
                  </button>
                </>
              )}
            </div>
          )}
        </aside>

        <div className="monitoramento-principal">
          {selecionado && (
            <div className="monitoramento-minimapa-canto">
              <MapContainer center={[selecionado.lat, selecionado.lon]} zoom={16} style={{ width: '100%', height: '100%' }} zoomControl={false}>
                <TileLayer url={TILE_SATELITE.url} attribution={TILE_SATELITE.attribution} />
                <CorrigirTamanho />
                <FlyToSelecionado lat={selecionado.lat} lon={selecionado.lon} />
                <CircleMarker
                  center={[selecionado.lat, selecionado.lon]}
                  radius={8}
                  pathOptions={{ color: 'var(--azul)', fillColor: 'var(--azul)', fillOpacity: 0.85, weight: 2 }}
                />
              </MapContainer>
            </div>
          )}

          <div className="monitoramento-conteudo">
            {!selecionado && (
              <div className="monitoramento-vazio-principal">
                Selecione um empreendimento e duas ou mais imagens para comparar.
              </div>
            )}

            {selecionado && (
              <div className="monitoramento-indicadores-selecao">
                <div className="grid-indicadores">
                  <div className={`card-indicador ${selecionado.delta_2023 < 0 ? 'frio' : 'quente'}`}>
                    <div className="rotulo">Redução de temperatura</div>
                    <div className="valor">{formatarDelta(selecionado.delta_2023)}</div>
                  </div>
                  <div className="card-indicador">
                    <div className="rotulo">Imagens disponíveis</div>
                    <div className="valor">{carregandoAnexos ? '…' : anexos.length}</div>
                  </div>
                  <div className="card-indicador verde">
                    <div className="rotulo">Árvores implantadas</div>
                    <div className="valor">{selecionado.arvores_implantadas ?? '—'}</div>
                  </div>
                  <div className="card-indicador">
                    <div className="rotulo">Telhado verde</div>
                    <div className="valor">{selecionado.telhado_verde_m2 ?? 0} m²</div>
                  </div>
                </div>
                {!comparando && (
                  <p className="monitoramento-dica">
                    Marque duas ou mais imagens na barra lateral e clique em "Comparar (Swipe)" para visualizar a evolução.
                  </p>
                )}
              </div>
            )}

            {comparando && imagensComparacao.length === 2 && (
              <div className="swipe-area">
                <div className="swipe-header">
                  <span>Comparando {imagensComparacao[0].nome} → {imagensComparacao[1].nome}</span>
                  <button onClick={() => { setComparando(false); setMarcados([]) }}>Fechar</button>
                </div>
                <ReactCompareSlider
                  style={{ width: '100%', height: '100%' }}
                  itemOne={<ReactCompareSliderImage src={imagensComparacao[0].url} alt={imagensComparacao[0].nome} />}
                  itemTwo={<ReactCompareSliderImage src={imagensComparacao[1].url} alt={imagensComparacao[1].nome} />}
                  handle={
                    <ReactCompareSliderHandle
                      buttonStyle={{ background: 'var(--azul)', color: '#fff', border: '2px solid #fff' }}
                      linesStyle={{ background: 'var(--azul)' }}
                    />
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {relatorioAberto && (
        <ModalRelatorioEvolucao
          empreendimento={selecionado}
          anexos={anexosMarcados}
          onClose={() => setRelatorioAberto(false)}
        />
      )}
    </section>
  )
}
