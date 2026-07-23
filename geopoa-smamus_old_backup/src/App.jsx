import Cabecalho from './components/Cabecalho'
import Hero from './components/Hero'
import Indicadores from './components/Indicadores'
import Graficos from './components/Graficos'
import Mapa from './components/Mapa'
import Ranking from './components/Ranking'
import Rodape from './components/Rodape'

export default function App() {
  return (
    <>
      <Cabecalho />
      <Hero />
      <main className="container">
        <Indicadores />
        <Graficos />
        <Mapa />
        <Ranking />
      </main>
      <Rodape />
    </>
  )
}
