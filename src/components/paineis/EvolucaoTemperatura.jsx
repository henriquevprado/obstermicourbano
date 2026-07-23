import { useMemo } from 'react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine,
} from 'recharts'
import { ANOS } from '../../data/utils'

export default function EvolucaoTemperatura({ empreendimentos }) {
  const dados = useMemo(() => {
    return ANOS.map(ano => {
      const temps = empreendimentos
        .map(e => e.periodos.find(p => p.ano === ano)?.temp)
        .filter(t => t != null)
      const media = temps.reduce((a, b) => a + b, 0) / temps.length
      return { ano, media: Number(media.toFixed(2)) }
    })
  }, [empreendimentos])

  return (
    <div className="card">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dados}>
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
            formatter={v => [`${v}°C`, 'Temperatura média']}
          />
          <ReferenceLine
            y={37.07}
            stroke="var(--text-muted)"
            strokeDasharray="4 4"
            label={{ value: 'Base 2023', position: 'insideTopRight', fill: 'var(--text-muted)', fontSize: 11 }}
          />
          <Line
            type="monotone"
            dataKey="media"
            stroke="var(--azul)"
            strokeWidth={2}
            dot={{ r: 3, fill: 'var(--azul)' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
