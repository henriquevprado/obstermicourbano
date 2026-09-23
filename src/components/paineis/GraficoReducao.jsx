import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, Cell, ResponsiveContainer } from 'recharts'

const fmt = v => `${v.toFixed(1).replace('.', ',')}°C`

// dados: [{ nome, reducao, quantidade, cor? }] — reducao em °C (positivo = queda)
export default function GraficoReducao({ dados }) {
  return (
    <div className="card">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={dados} margin={{ top: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="nome" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} unit="°C" />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 13,
            }}
            formatter={(v, _n, item) => [`${fmt(v)} (${item.payload.quantidade} empreendimentos)`, 'Redução média']}
          />
          <Bar dataKey="reducao" fill="var(--azul)" radius={[4, 4, 0, 0]}>
            {dados.map(d => <Cell key={d.nome} fill={d.cor || 'var(--azul)'} />)}
            <LabelList dataKey="reducao" position="top" formatter={fmt} fill="var(--text-primary)" fontSize={12} fontWeight={600} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
