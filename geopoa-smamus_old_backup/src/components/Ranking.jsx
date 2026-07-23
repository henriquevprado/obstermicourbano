import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts'
import { getRankingVariacao } from '../data/utils'

export default function Ranking() {
  const dados = getRankingVariacao(6)

  return (
    <section className="secao">
      <p className="secao-titulo">Comparativo</p>
      <h3 className="secao-subtitulo">Variação de temperatura por empreendimento</h3>
      <p className="secao-desc">
        Diferença de temperatura entre o primeiro (2021 S1) e o último período
        (2025 S2) no entorno de cada empreendimento. Valores negativos (azul)
        indicam resfriamento da área; positivos (vermelho), aquecimento.
      </p>

      <div className="painel">
        <ResponsiveContainer width="100%" height={360}>
          <BarChart
            layout="vertical"
            data={dados}
            margin={{ top: 8, right: 32, bottom: 8, left: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: '#555' }}
              tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}°`}
            />
            <YAxis
              type="category"
              dataKey="nome"
              tick={{ fontSize: 11, fill: '#555' }}
              width={170}
            />
            <Tooltip
              formatter={(v) => [`${v >= 0 ? '+' : ''}${v} °C`, 'Variação']}
              contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e6e6e6' }}
            />
            <ReferenceLine x={0} stroke="#767676" />
            <Bar dataKey="delta" radius={[0, 4, 4, 0]}>
              {dados.map((d, i) => (
                <Cell key={i} fill={d.delta >= 0 ? '#d7301f' : '#2c7fb8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
