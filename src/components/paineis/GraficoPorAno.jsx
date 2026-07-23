import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const ORDEM = [2023, 2024, 2025, 2026]
const ANO_CORES = {
  2023: 'var(--azul)',
  2024: 'var(--verde)',
  2025: 'var(--laranja)',
  2026: 'var(--amarelo)',
}

export default function GraficoPorAno({ empreendimentos }) {
  const dados = useMemo(() => {
    const contagem = {}
    empreendimentos.forEach(e => {
      contagem[e.ano_certificacao] = (contagem[e.ano_certificacao] || 0) + 1
    })
    return ORDEM
      .filter(ano => contagem[ano])
      .map(ano => ({ nome: String(ano), valor: contagem[ano], cor: ANO_CORES[ano] }))
  }, [empreendimentos])

  return (
    <div className="card">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={dados}
            dataKey="valor"
            nameKey="nome"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            label={({ nome, valor }) => `${valor}`}
          >
            {dados.map(d => (
              <Cell key={d.nome} fill={d.cor} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 13,
            }}
            formatter={(v, n) => [`${v} empreendimentos`, n]}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
