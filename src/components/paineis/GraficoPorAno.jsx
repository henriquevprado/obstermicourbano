import { useMemo } from 'react'
import GraficoReducao from './GraficoReducao'

export default function GraficoPorAno({ empreendimentos }) {
  const dados = useMemo(() => {
    const grupos = {}
    empreendimentos.forEach(e => {
      if (e.delta_2023 == null || !e.ano_certificacao) return
      const g = grupos[e.ano_certificacao] || (grupos[e.ano_certificacao] = { soma: 0, n: 0 })
      g.soma += e.delta_2023
      g.n += 1
    })
    return Object.keys(grupos)
      .sort()
      .map(ano => ({ nome: ano, reducao: -grupos[ano].soma / grupos[ano].n, quantidade: grupos[ano].n }))
  }, [empreendimentos])

  return <GraficoReducao dados={dados} />
}
