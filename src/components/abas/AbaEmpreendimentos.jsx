import { useState } from 'react'
import Indicadores from '../paineis/Indicadores'
import MapaCalor from '../paineis/MapaCalor'
import PainelRanking from '../paineis/PainelRanking'
import GraficoCertificacao from '../paineis/GraficoCertificacao'
import GraficoPorAno from '../paineis/GraficoPorAno'
import ComparacaoRegiao from '../paineis/ComparacaoRegiao'
import TabelaEmpreendimentos from '../paineis/TabelaEmpreendimentos'
import { useEmpreendimentos } from '../../hooks/useEnterprise'

export default function AbaEmpreendimentos({ onMonitorar }) {
  const { data: empreendimentos, loading, error } = useEmpreendimentos()
  const [empreendimentoSelecionado, setEmpreendimentoSelecionado] = useState(null)

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
        Carregando dados do ArcGIS Enterprise…
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--temp-quente)' }}>
        Não foi possível carregar os dados do Enterprise. Tente novamente mais tarde.
      </div>
    )
  }

  return (
    <>
      <section className="secao">
        <Indicadores />
      </section>

      <section className="secao grid-mapa">
        <div>
          <div className="secao-titulo">Mapa de calor</div>
          <div className="secao-subtitulo">Temperatura de superfície e empreendimentos</div>
          <p className="secao-desc">
            Sobreposição raster de temperatura de superfície (Landsat) por ano,
            com os empreendimentos certificados plotados por variação de
            temperatura desde 2023.
          </p>
          <MapaCalor empreendimentos={empreendimentos} selecionado={empreendimentoSelecionado} />
        </div>
        <div>
          <div className="secao-titulo">Ranking</div>
          <div className="secao-subtitulo">Maiores quedas de temperatura</div>
          <PainelRanking empreendimentos={empreendimentos} onSelecionar={setEmpreendimentoSelecionado} />
        </div>
      </section>

      <section className="secao">
        <div className="secao-titulo">Comparativo</div>
        <div className="secao-subtitulo">Região vs. empreendimentos certificados</div>
        <ComparacaoRegiao />
      </section>

      <section className="secao grid-2">
        <div>
          <div className="secao-titulo">Certificação</div>
          <div className="secao-subtitulo">Redução média de temperatura por tipo de certificação</div>
          <GraficoCertificacao empreendimentos={empreendimentos} />
        </div>
        <div>
          <div className="secao-titulo">Certificação</div>
          <div className="secao-subtitulo">Redução média de temperatura por ano de certificação</div>
          <GraficoPorAno empreendimentos={empreendimentos} />
        </div>
      </section>

      <section className="secao">
        <div className="secao-titulo">Detalhamento</div>
        <div className="secao-subtitulo">Todos os empreendimentos</div>
        <TabelaEmpreendimentos empreendimentos={empreendimentos} onMonitorar={onMonitorar} />
      </section>
    </>
  )
}
