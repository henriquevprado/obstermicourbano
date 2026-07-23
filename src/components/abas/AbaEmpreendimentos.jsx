import { useState } from 'react'
import Indicadores from '../paineis/Indicadores'
import MapaCalor from '../paineis/MapaCalor'
import EvolucaoTemperatura from '../paineis/EvolucaoTemperatura'
import Top10Queda from '../paineis/Top10Queda'
import GraficoCertificacao from '../paineis/GraficoCertificacao'
import GraficoPorAno from '../paineis/GraficoPorAno'
import BotaoCena3D from '../paineis/BotaoCena3D'
import ComparacaoRegiao from '../paineis/ComparacaoRegiao'
import TabelaEmpreendimentos from '../paineis/TabelaEmpreendimentos'
import { useEmpreendimentos } from '../../hooks/useEnterprise'

export default function AbaEmpreendimentos() {
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div>
              <div className="secao-titulo">Mapa de calor</div>
              <div className="secao-subtitulo">Temperatura de superfície e empreendimentos</div>
            </div>
            <BotaoCena3D />
          </div>
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
          <Top10Queda empreendimentos={empreendimentos} onSelecionar={setEmpreendimentoSelecionado} />
        </div>
      </section>

      <section className="secao">
        <div className="secao-titulo">Comparativo</div>
        <div className="secao-subtitulo">Região vs. empreendimentos certificados</div>
        <ComparacaoRegiao />
      </section>

      <section className="secao">
        <div className="secao-titulo">Série histórica</div>
        <div className="secao-subtitulo">Evolução da temperatura média</div>
        <EvolucaoTemperatura empreendimentos={empreendimentos} />
      </section>

      <section className="secao grid-2">
        <div>
          <div className="secao-titulo">Certificação</div>
          <div className="secao-subtitulo">Distribuição dos empreendimentos</div>
          <GraficoCertificacao empreendimentos={empreendimentos} />
        </div>
        <div>
          <div className="secao-titulo">Certificação</div>
          <div className="secao-subtitulo">Segmentação por ano de certificação</div>
          <GraficoPorAno empreendimentos={empreendimentos} />
        </div>
      </section>

      <section className="secao">
        <div className="secao-titulo">Detalhamento</div>
        <div className="secao-subtitulo">Todos os empreendimentos</div>
        <TabelaEmpreendimentos empreendimentos={empreendimentos} />
      </section>
    </>
  )
}
