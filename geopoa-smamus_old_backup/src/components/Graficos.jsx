import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts'
import {
  getDistribuicaoCertificacao,
  getTendenciaCidade
} from '../data/utils'

export default function Graficos() {
  const dist = getDistribuicaoCertificacao()
  const tendencia = getTendenciaCidade()

  return (
    <section className="secao">
      <p className="secao-titulo">Análise agregada</p>
      <h3 className="secao-subtitulo">Certificação e evolução térmica</h3>
      <p className="secao-desc">
        À esquerda, a distribuição dos empreendimentos por nível de
        certificação. À direita, a temperatura média de superfície entre
        todos os empreendimentos, semestre a semestre.
      </p>

      <div className="grid-graficos">
        <div className="painel">
          <div className="painel-titulo">Empreendimentos por nível de certificação</div>
          <div className="painel-desc">Total de 118 empreendimentos certificados</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dist} margin={{ top: 8, right: 16, bottom: 8, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" vertical={false} />
              <XAxis dataKey="nome" tick={{ fontSize: 12, fill: '#555' }} />
              <YAxis tick={{ fontSize: 12, fill: '#555' }} allowDecimals={false} />
              <Tooltip
                formatter={(v) => [`${v} empreendimentos`, '']}
                contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e6e6e6' }}
              />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                {dist.map((d, i) => (
                  <Cell key={i} fill={d.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="painel">
          <div className="painel-titulo">Temperatura média da cidade por semestre</div>
          <div className="painel-desc">Média entre os 118 empreendimentos (°C)</div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={tendencia} margin={{ top: 8, right: 16, bottom: 8, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" vertical={false} />
              <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: '#555' }} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 12, fill: '#555' }} domain={[20, 40]} tickFormatter={(v) => `${v}°`} />
              <Tooltip
                formatter={(v) => [`${v} °C`, 'Temperatura']}
                contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e6e6e6' }}
              />
              <ReferenceLine y={30.9} stroke="#b0b0b0" strokeDasharray="4 4" label={{ value: 'média', fontSize: 10, fill: '#767676', position: 'right' }} />
              <Line
                type="monotone"
                dataKey="temperatura"
                stroke="#d7301f"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#d7301f' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}
