import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import {
  DADOS_GRAFICO_PROJECAO, CENARIOS_CALCULADOS, REGRESSAO, REDUCAO_RITMO_PCT,
} from '../../data/projecao'
import { formatarDelta } from '../../data/utils'

export default function AbaProjecao() {
  return (
    <>
      <div className="aviso-metodologico">
        As projeções abaixo são extrapolações estatísticas baseadas em dados
        históricos limitados (4 anos com programa de certificação). Devem
        ser interpretadas como cenários indicativos, não previsões
        climáticas — fatores externos como variabilidade climática e
        urbanização não estão isolados.
      </div>

      <section className="secao">
        <div className="grid-indicadores">
          <div className="card-indicador quente">
            <div className="rotulo">Ritmo de aquecimento sem programa</div>
            <div className="valor">+{REGRESSAO.semPrograma.slope.toFixed(2)} °C/ano</div>
          </div>
          <div className="card-indicador verde">
            <div className="rotulo">Ritmo com programa de certificação</div>
            <div className="valor">+{REGRESSAO.comPrograma.slope.toFixed(2)} °C/ano</div>
          </div>
          <div className="card-indicador">
            <div className="rotulo">Redução no ritmo de aquecimento</div>
            <div className="valor">{REDUCAO_RITMO_PCT}%</div>
          </div>
        </div>
      </section>

      <section className="secao">
        <div className="secao-titulo">Cenário</div>
        <div className="secao-subtitulo">Tendência histórica vs. programa de certificação</div>
        <p className="secao-desc">
          Extrapolação da regressão linear 2017–2022 (sem programa) e
          2023–2026 (com programa) até 2035, com os valores reais
          observados marcados como pontos.
        </p>
        <div className="card">
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={DADOS_GRAFICO_PROJECAO}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="ano" type="number" domain={[2020, 2035]} stroke="var(--text-muted)" fontSize={12} />
              <YAxis
                stroke="var(--text-muted)"
                fontSize={12}
                unit="°C"
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 13,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
              <ReferenceLine
                x={2023}
                stroke="var(--text-muted)"
                strokeDasharray="4 4"
                label={{ value: 'Início do programa', position: 'insideTopLeft', fill: 'var(--text-muted)', fontSize: 11 }}
              />
              <Area
                dataKey="comPrograma"
                name="Projeção com programa"
                stroke="none"
                fill="rgba(0,128,160,0.12)"
                isAnimationActive={false}
              />
              <Line
                dataKey="semPrograma"
                name="Projeção sem programa"
                stroke="var(--temp-quente)"
                strokeDasharray="6 4"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                dataKey="comPrograma"
                name="Projeção com programa"
                stroke="var(--azul)"
                strokeDasharray="6 4"
                strokeWidth={2}
                dot={false}
                legendType="none"
                isAnimationActive={false}
              />
              <Line
                dataKey="realSem"
                name="Dado real (sem programa)"
                stroke="var(--temp-quente)"
                strokeWidth={0}
                dot={{ r: 5, fill: 'var(--temp-quente)', strokeWidth: 0 }}
                connectNulls={false}
                isAnimationActive={false}
              />
              <Line
                dataKey="realCom"
                name="Dado real (com programa)"
                stroke="var(--azul)"
                strokeWidth={0}
                dot={{ r: 5, fill: 'var(--azul)', strokeWidth: 0 }}
                connectNulls={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="secao">
        <div className="secao-titulo">Cenários</div>
        <div className="secao-subtitulo">Expansão do programa de certificação</div>
        <div className="tabela-wrapper">
          <table>
            <thead>
              <tr>
                <th>Cenário</th>
                <th>Empreendimentos</th>
                <th>Temperatura projetada</th>
                <th>Redução vs. 2023</th>
              </tr>
            </thead>
            <tbody>
              {CENARIOS_CALCULADOS.map(c => (
                <tr key={c.nome}>
                  <td>{c.nome}</td>
                  <td>{c.n}</td>
                  <td>{c.temp.toFixed(1)}°C</td>
                  <td className={c.reducaoVs2023 < 0 ? 'variacao-negativa' : 'variacao-positiva'}>
                    {formatarDelta(c.reducaoVs2023)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="secao-desc">
        Os dados dos últimos 4 anos sugerem que cada novo empreendimento
        certificado está associado a uma redução média de 0,022°C na
        temperatura local. Com 200 empreendimentos, a projeção indica uma
        redução de cerca de 1°C em relação a 2023 — mas essa estimativa tem
        incerteza significativa e precisará ser validada com mais anos de
        dados.
      </p>
    </>
  )
}
