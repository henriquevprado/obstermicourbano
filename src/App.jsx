import { useState } from 'react'
import Cabecalho from './components/Cabecalho'
import Hero from './components/Hero'
import Rodape from './components/Rodape'
import AbaEmpreendimentos from './components/abas/AbaEmpreendimentos'
import AbaMonitoramento from './components/abas/AbaMonitoramento'
import AbaProjecao from './components/abas/AbaProjecao'

const ABAS = [
  { id: 'empreendimentos', label: 'Empreendimentos & Calor' },
  { id: 'monitoramento',   label: 'Monitoramento' },
  { id: 'projecao',        label: 'Projeções' },
]

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('empreendimentos')
  const [seiParaMonitorar, setSeiParaMonitorar] = useState(null)

  function irParaMonitoramento(sei) {
    setSeiParaMonitorar(sei)
    setAbaAtiva('monitoramento')
  }

  return (
    <>
      <Cabecalho abaAtiva={abaAtiva} onAba={setAbaAtiva} abas={ABAS} />
      <Hero />
      <main className="container">
        {abaAtiva === 'empreendimentos' && <AbaEmpreendimentos onMonitorar={irParaMonitoramento} />}
        {abaAtiva === 'monitoramento'   && <AbaMonitoramento seiInicial={seiParaMonitorar} />}
        {abaAtiva === 'projecao'        && <AbaProjecao />}
      </main>
      <Rodape />
    </>
  )
}
