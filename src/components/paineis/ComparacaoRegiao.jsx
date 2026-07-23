import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine,
} from 'recharts'
import comparacao from '../../data/comparacao_geral.json'

export default function ComparacaoRegiao() {
  return (
    <div className="card">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={comparacao}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="ano" stroke="var(--text-muted)" fontSize={12} />
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
          <Line
            type="monotone"
            dataKey="media_geral"
            name="Temperatura geral dos bairros"
            stroke="#e06020"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="media_empreend"
            name="Temperatura dos empreendimentos"
            stroke="#0080a0"
            strokeWidth={2}
            dot={{ r: 3 }}
            fill="rgba(0,128,160,0.12)"
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="secao-desc" style={{ marginTop: 12, marginBottom: 0 }}>
        A queda de temperatura após 2023 ocorreu tanto na região (−2,89°C) quanto
        nos empreendimentos (−3,16°C). Os empreendimentos esfriaram 0,27°C a mais
        que o entorno — um efeito local positivo e crescente do programa.
      </p>
    </div>
  )
}
