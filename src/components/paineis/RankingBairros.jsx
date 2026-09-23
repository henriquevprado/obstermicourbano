import { useMemo } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { useBairrosRanking } from '../../hooks/useEnterprise'
import { formatarDelta } from '../../data/utils'

function nomeCurto(nome) {
  const t = nome.toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase()).replace(/ D([eao]s?) /g, ' d$1 ')
  return t.length > 20 ? `${t.slice(0, 20)}…` : t
}

export default function RankingBairros({ empreendimentos }) {
  const ranking = useBairrosRanking(empreendimentos)

  const dados = useMemo(
    () => ranking.map((b, i) => ({ ...b, rotulo: `${i + 1}º ${nomeCurto(b.nome)}` })),
    [ranking]
  )

  return (
    <ResponsiveContainer width="100%" height={560}>
      <BarChart data={dados} layout="vertical" margin={{ left: 10, right: 20 }}>
        <CartesianGrid stroke="var(--border)" horizontal={false} />
        <XAxis type="number" stroke="var(--text-muted)" fontSize={12} unit="°C" />
        <YAxis type="category" dataKey="rotulo" stroke="var(--text-muted)" fontSize={11} width={140} />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontSize: 13,
          }}
          formatter={(v, _n, item) => [
            `${formatarDelta(v)} (${item.payload.quantidade} empreendimentos)`,
            'Variação média',
          ]}
        />
        <Bar dataKey="delta" fill="var(--azul)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
