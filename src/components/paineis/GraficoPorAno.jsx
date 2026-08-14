import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ResponsiveContainer } from 'recharts'

const ORDEM = [2023, 2024, 2025, 2026]

export default function GraficoPorAno({ empreendimentos }) {
  const dados = useMemo(() => {
    const contagem = {}
    empreendimentos.forEach(e => {
      contagem[e.ano_certificacao] = (contagem[e.ano_certificacao] || 0) + 1
    })
    return ORDEM
      .filter(ano => contagem[ano])
      .map(ano => ({ ano: String(ano), valor: contagem[ano] }))
  }, [empreendimentos])

  return (
    <div className="card">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="ano" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 13,
            }}
            formatter={v => [`${v} empreendimentos`, '']}
          />
          <Bar dataKey="valor" fill="var(--azul)" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="valor" position="top" fill="var(--text-primary)" fontSize={12} fontWeight={600} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
