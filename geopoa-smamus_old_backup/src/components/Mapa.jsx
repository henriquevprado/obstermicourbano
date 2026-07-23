import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet'
import {
  getEmpreendimentos,
  getPeriodos,
  CERT_CORES,
  CERT_ORDEM
} from '../data/utils'

const empreendimentos = getEmpreendimentos()
const periodos = getPeriodos()

function raioPorTemp(temp, min = 23, max = 38) {
  const t = Math.max(0, Math.min(1, (temp - min) / (max - min)))
  return 6 + t * 10
}

export default function Mapa() {
  const [idx, setIdx] = useState(0)
  const [tocando, setTocando] = useState(false)
  const [filtroCert, setFiltroCert] = useState('TODOS')
  const [selecionado, setSelecionado] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (tocando) {
      intervalRef.current = setInterval(() => {
        setIdx((prev) => (prev + 1) % periodos.length)
      }, 1300)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [tocando])

  const visiveis = empreendimentos.filter(
    (e) => filtroCert === 'TODOS' || e.certificado === filtroCert
  )

  return (
    <section className="secao">
      <p className="secao-titulo">Distribuição espacial</p>
      <h3 className="secao-subtitulo">Mapa interativo por período</h3>
      <p className="secao-desc">
        Navegue pelos semestres com o controle de tempo. A cor de cada ponto
        indica o nível de certificação e o tamanho reflete a temperatura média
        no período. Clique em um empreendimento para ver detalhes.
      </p>

      <div className="filtros">
        <button
          className={`filtro-btn ${filtroCert === 'TODOS' ? 'ativo' : ''}`}
          onClick={() => setFiltroCert('TODOS')}
        >
          Todos ({empreendimentos.length})
        </button>
        {CERT_ORDEM.map((c) => {
          const n = empreendimentos.filter((e) => e.certificado === c).length
          return (
            <button
              key={c}
              className={`filtro-btn ${filtroCert === c ? 'ativo' : ''}`}
              onClick={() => setFiltroCert(c)}
            >
              {c.charAt(0) + c.slice(1).toLowerCase()} ({n})
            </button>
          )
        })}
      </div>

      <div className="controle-tempo">
        <button
          className="botao-play"
          onClick={() => setTocando((t) => !t)}
          aria-label={tocando ? 'Pausar' : 'Reproduzir'}
        >
          {tocando ? '❚❚' : '▶'}
        </button>
        <input
          type="range"
          className="slider-tempo"
          min="0"
          max={periodos.length - 1}
          step="1"
          value={idx}
          onChange={(e) => {
            setTocando(false)
            setIdx(parseInt(e.target.value, 10))
          }}
        />
        <span className="periodo-atual">{periodos[idx].label}</span>
      </div>

      <div className="layout-mapa">
        <div className="mapa-wrapper">
          <MapContainer
            center={[-30.0305, -51.1895]}
            zoom={14}
            scrollWheelZoom={false}
            className="mapa-container"
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {visiveis.map((e) => {
              const p = e.periodos[idx]
              const cor = CERT_CORES[e.certificado]
              return (
                <CircleMarker
                  key={e.sei}
                  center={[e.lat, e.lon]}
                  radius={raioPorTemp(p.temp_media)}
                  pathOptions={{
                    fillColor: cor,
                    color: cor,
                    weight: selecionado?.sei === e.sei ? 3 : 1,
                    fillOpacity: 0.75
                  }}
                  eventHandlers={{
                    click: () => setSelecionado(e)
                  }}
                >
                  <LeafletTooltip direction="top" offset={[0, -6]}>
                    <div className="tooltip-emp">
                      <strong>{p.temp_media.toFixed(1)} °C</strong>
                      <br />
                      {(e.endereco || e.sei).trim()}
                      <br />
                      {e.certificado.charAt(0) + e.certificado.slice(1).toLowerCase()}
                    </div>
                  </LeafletTooltip>
                </CircleMarker>
              )
            })}
          </MapContainer>
        </div>

        <PainelDetalhe emp={selecionado} idx={idx} />
      </div>

      <div className="legenda">
        {CERT_ORDEM.map((c) => (
          <div key={c} className="item">
            <span className="ponto" style={{ background: CERT_CORES[c] }}></span>
            {c.charAt(0) + c.slice(1).toLowerCase()}
          </div>
        ))}
        <div className="item" style={{ marginLeft: 'auto', color: '#767676' }}>
          Tamanho do ponto proporcional à temperatura
        </div>
      </div>
    </section>
  )
}

function PainelDetalhe({ emp, idx }) {
  if (!emp) {
    return (
      <div className="painel-detalhe">
        <div className="vazio">
          Clique em um ponto no mapa para ver os detalhes do empreendimento.
        </div>
      </div>
    )
  }

  const p = emp.periodos[idx]
  const cor = CERT_CORES[emp.certificado]
  const certNome = emp.certificado.charAt(0) + emp.certificado.slice(1).toLowerCase()

  return (
    <div className="painel-detalhe">
      <span className="badge-cert" style={{ background: cor }}>
        {certNome}
      </span>
      <h4 style={{ marginTop: 12, marginBottom: 4, fontSize: 15 }}>
        {(emp.endereco || emp.sei).trim()}
      </h4>
      <p style={{ fontSize: 12, color: '#767676', marginBottom: 16 }}>
        SEI {emp.sei}
      </p>

      <div className="detalhe-linha">
        <span className="chave">Temperatura ({periodos[idx].label})</span>
        <span className="valor">{p.temp_media.toFixed(1)} °C</span>
      </div>
      <div className="detalhe-linha">
        <span className="chave">Variação 2021→2025</span>
        <span className="valor" style={{ color: emp.delta_temp >= 0 ? '#d7301f' : '#2c7fb8' }}>
          {emp.delta_temp >= 0 ? '+' : ''}{emp.delta_temp.toFixed(1)} °C
        </span>
      </div>
      <div className="detalhe-linha">
        <span className="chave">Ano de certificação</span>
        <span className="valor">{emp.ano_certificacao}</span>
      </div>
      <div className="detalhe-linha">
        <span className="chave">Árvores implantadas</span>
        <span className="valor">{emp.arvores_implantadas}</span>
      </div>
      <div className="detalhe-linha">
        <span className="chave">Árvores preservadas</span>
        <span className="valor">{emp.arvores_preservadas}</span>
      </div>
      <div className="detalhe-linha">
        <span className="chave">Telhado verde</span>
        <span className="valor">{emp.telhado_verde_m2} m²</span>
      </div>
      <div className="detalhe-linha">
        <span className="chave">Parede verde</span>
        <span className="valor">{emp.parede_verde_m2} m²</span>
      </div>
      <div className="detalhe-linha" style={{ borderBottom: 'none' }}>
        <span className="chave">Pontuação biodiversidade</span>
        <span className="valor">{emp.pontuacao_biodiversidade}</span>
      </div>
    </div>
  )
}
