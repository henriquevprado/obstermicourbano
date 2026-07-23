export default function Cabecalho({ abaAtiva, onAba, abas }) {
  return (
    <>
      <div className="aviso-poc">
        PROVA DE CONCEITO · Dados demonstrativos para avaliação técnica —
        não constitui publicação oficial da Prefeitura de Porto Alegre
      </div>
      <header className="cabecalho">
        <div className="inner">
          <img src="/logo_smamus.jpg" alt="SMAMUS" className="logo-img" />
          <div className="divider" />
          <div className="titulo-app">
            <h1>Observatório Térmico Urbano</h1>
            <p>Temperatura de superfície · Empreendimentos certificados · Porto Alegre</p>
          </div>
          <nav className="nav-abas">
            {abas.map(a => (
              <button
                key={a.id}
                className={`aba-btn ${abaAtiva === a.id ? 'ativa' : ''}`}
                onClick={() => onAba(a.id)}
              >
                {a.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
    </>
  )
}
