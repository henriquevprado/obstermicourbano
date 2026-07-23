import { getIndicadoresMacro } from '../data/utils'

export default function Indicadores() {
  const ind = getIndicadoresMacro()

  const cards = [
    { rotulo: 'Empreendimentos certificados', valor: ind.total, unidade: '', classe: '' },
    { rotulo: 'Árvores implantadas', valor: ind.arvores, unidade: '', classe: 'verde' },
    { rotulo: 'Árvores nativas preservadas', valor: ind.arvoresPres, unidade: '', classe: 'verde' },
    { rotulo: 'Telhado verde instalado', valor: ind.telhado.toLocaleString('pt-BR'), unidade: 'm²', classe: 'amarelo' },
    { rotulo: 'Temperatura média da série', valor: ind.tempGeral.toLocaleString('pt-BR'), unidade: '°C', classe: 'quente' }
  ]

  return (
    <section className="secao">
      <p className="secao-titulo">Panorama geral</p>
      <h3 className="secao-subtitulo">Indicadores consolidados</h3>
      <p className="secao-desc">
        Síntese dos empreendimentos analisados e da temperatura média de
        superfície medida no entorno imediato (buffer de 200 m) de cada um.
      </p>
      <div className="grid-indicadores">
        {cards.map((c, i) => (
          <div key={i} className={`card-indicador ${c.classe}`}>
            <div className="rotulo">{c.rotulo}</div>
            <div className="valor">
              {c.valor}
              {c.unidade && <span className="unidade"> {c.unidade}</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
