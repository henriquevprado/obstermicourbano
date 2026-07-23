import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CERT_CORES } from '../../data/utils'

const ORDEM = ['DIAMANTE', 'OURO', 'PRATA', 'BRONZE']

export default function GraficoCertificacao({ empreendimentos }) {
  const dados = useMemo(() => {
    const contagem = {}
    empreendimentos.forEach(e => {
      contagem[e.certificado] = (contagem[e.certificado] || 0) + 1
    })
    return ORDEM
      .filter(c => contagem[c])
      .map(c => ({ nome: c, valor: contagem[c], cor: CERT_CORES[c] }))
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
