import { INDICADORES } from '../../data/utils'

export default function Indicadores() {
  return (
    <div className="grid-indicadores">
      <div className="card-indicador">
        <div className="rotulo">Empreendimentos certificados</div>
        <div className="valor">{INDICADORES.total}</div>
      </div>

      <div className="card-indicador frio">
        <div className="rotulo">Com queda de temperatura</div>
        <div className="valor">{INDICADORES.queda_2023} de {INDICADORES.total}</div>
      </div>

      <div className="card-indicador frio">
        <div className="rotulo">Queda média desde 2023</div>
        <div className="valor">{INDICADORES.queda_media.toFixed(1).replace('-', '−')} °C</div>
      </div>

      <div className="card-indicador verde">
        <div className="rotulo">Efeito adicional de esfriamento</div>
        <div className="valor">{INDICADORES.efeito_adicional.toFixed(2).replace('-', '−')} °C</div>
        <div className="detalhe">vs. temperatura da região</div>
      </div>

      <div className="card-indicador quente">
        <div className="rotulo">Temperatura média jan/2025</div>
        <div className="valor">34,9 °C</div>
      </div>
    </div>
  )
}
