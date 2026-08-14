export default function Rodape() {
  return (
    <footer className="rodape">
      <div className="rodape-conteudo">
        <div>
          <strong style={{ color: 'var(--text-secondary)' }}>
            Observatório Térmico Urbano · POC SMAMUS
          </strong>
          <br />
          Dados: Landsat / Google Earth Engine · Análise: Zonal Statistics
          (buffer 200 m) · Série: Janeiro 2017–2026 (sem 2018/2019)
          <br />
          Esta é uma demonstração técnica — não constitui publicação oficial
          da Prefeitura Municipal de Porto Alegre.
        </div>
        <div className="rodape-desenvolvido">
          Desenvolvido por
          <img src="/logo_codex.png" alt="Codex" className="rodape-logo-codex" />
        </div>
      </div>
    </footer>
  )
}
