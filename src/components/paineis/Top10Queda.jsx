import { useMemo } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { formatarDelta } from '../../data/utils'

function truncar(texto, n) {
  return texto.length > n ? `${texto.slice(0, n)}…` : texto
}

export default function Top10Queda({ empreendimentos, onSelecionar }) {
  const dados = useMemo(() => {
    return [...empreendimentos]
      .sort((a, b) => a.delta_2023 - b.delta_2023)
      .slice(0, 10)
      .map((e, i) => ({ endereco: `${i + 1}º ${truncar(e.endereco, 20)}`, delta: e.delta_2023, empreendimento: e }))
  }, [empreendimentos])

  return (
    <div className="card">
      <ResponsiveContainer width="100%" height={600}>
        <BarChart data={dados} layout="vertical" margin={{ left: 10, right: 20 }}>
          <CartesianGrid stroke="var(--border)" horizontal={false} />
          <XAxis type="number" stroke="var(--text-muted)" fontSize={12} unit="°C" />
          <YAxis
            type="category"
            dataKey="endereco"
            stroke="var(--text-muted)"
            fontSize={11}
            width={140}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 13,
            }}
            formatter={v => [formatarDelta(v), 'Variação']}
          />
          <Bar
            dataKey="delta"
            fill="var(--azul)"
            radius={[0, 4, 4, 0]}
            cursor="pointer"
            onClick={d => onSelecionar?.(d.empreendimento)}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
