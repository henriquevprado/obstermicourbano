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
  return (
    <>
      <Cabecalho abaAtiva={abaAtiva} onAba={setAbaAtiva} abas={ABAS} />
      <Hero />
      <main className="container">
        {abaAtiva === 'empreendimentos' && <AbaEmpreendimentos />}
        {abaAtiva === 'monitoramento'   && <AbaMonitoramento />}
        {abaAtiva === 'projecao'        && <AbaProjecao />}
      </main>
      <Rodape />
    </>
  )
}
