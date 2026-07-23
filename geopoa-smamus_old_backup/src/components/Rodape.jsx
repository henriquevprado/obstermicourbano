export default function Rodape() {
  return (
    <footer className="rodape">
      <div className="conteudo">
        <strong>GeoPOA · Clima Urbano — Prova de Conceito</strong>
        Desenvolvido para a Secretaria Municipal do Meio Ambiente e Urbanismo (SMAMUS).
        Dados de temperatura de superfície derivados de imagens Landsat processadas no
        Google Earth Engine, cruzados com a base de empreendimentos certificados da SMAMUS.
        Análise por estatística zonal em buffers de 200 m. Período: 2021–2025 (semestral).
        <br /><br />
        Esta é uma demonstração técnica e não representa publicação oficial da Prefeitura
        Municipal de Porto Alegre.
      </div>
    </footer>
  )
}
