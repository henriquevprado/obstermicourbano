import { useMemo } from 'react'
import GraficoReducao from './GraficoReducao'
import { CERT_CORES } from '../../data/utils'

const ORDEM = ['DIAMANTE', 'OURO', 'PRATA', 'BRONZE']

export default function GraficoCertificacao({ empreendimentos }) {
  const dados = useMemo(() => {
    const grupos = {}
    empreendimentos.forEach(e => {
      if (e.delta_2023 == null) return
      const g = grupos[e.certificado] || (grupos[e.certificado] = { soma: 0, n: 0 })
      g.soma += e.delta_2023
      g.n += 1
    })
    return ORDEM
      .filter(c => grupos[c])
      .map(c => ({
        nome: c.charAt(0) + c.slice(1).toLowerCase(),
        reducao: -grupos[c].soma / grupos[c].n,
        quantidade: grupos[c].n,
        cor: CERT_CORES[c],
      }))
  }, [empreendimentos])

  return <GraficoReducao dados={dados} />
}
