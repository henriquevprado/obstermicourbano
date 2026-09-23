import { useState } from 'react'
import Top10Queda from './Top10Queda'
import RankingBairros from './RankingBairros'

const ABAS = [
  { id: 'empreendimentos', rotulo: 'Empreendimentos' },
  { id: 'bairros', rotulo: 'Bairros' },
]

export default function PainelRanking({ empreendimentos, onSelecionar }) {
  const [aba, setAba] = useState('empreendimentos')

  return (
    <div className="card">
      {aba === 'empreendimentos'
        ? <Top10Queda empreendimentos={empreendimentos} onSelecionar={onSelecionar} />
        : <RankingBairros empreendimentos={empreendimentos} />}
      <div className="ranking-abas">
        {ABAS.map(a => (
          <button
            key={a.id}
            className={`filtro-btn ${aba === a.id ? 'ativo' : ''}`}
            onClick={() => setAba(a.id)}
          >
            {a.rotulo}
          </button>
        ))}
      </div>
    </div>
  )
}
