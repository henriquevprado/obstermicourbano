export default function Cabecalho() {
  return (
    <>
      <div className="aviso-poc">
        PROVA DE CONCEITO · Dados demonstrativos para avaliação técnica da SMAMUS — não constitui publicação oficial
      </div>
      <div className="barra-gov">
        <div className="conteudo">
          <span>Prefeitura Municipal de Porto Alegre</span>
          <span>SMAMUS · Secretaria do Meio Ambiente e Urbanismo</span>
        </div>
      </div>
      <header className="cabecalho">
        <div className="conteudo">
          <div className="marca">
            <div className="brasao">POA</div>
            <div className="titulos">
              <h1>GeoPOA · Clima Urbano</h1>
              <p>Monitoramento de ilhas de calor e empreendimentos sustentáveis</p>
            </div>
          </div>
          <div className="secretaria">
            Land Surface Temperature · Landsat<br />
            Série temporal 2021–2025
          </div>
        </div>
      </header>
    </>
  )
}
