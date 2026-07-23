import { useEffect, useRef, useState } from 'react'

const URL_CENA = 'https://arcgis-ope.codexremote.com.br/portal/home/webscene/viewer.html?webscene=94b5163b3e32494c8e4d6e68e5bfba33&ui=min'

const ICONE_3D = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5, verticalAlign: -2 }}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)

export default function BotaoCena3D() {
  const [aberto, setAberto] = useState(false)
  const [carregado, setCarregado] = useState(false)
  const [bloqueado, setBloqueado] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (!aberto) return
    setCarregado(false)
    setBloqueado(false)
    timeoutRef.current = setTimeout(() => setBloqueado(true), 5000)
    return () => clearTimeout(timeoutRef.current)
  }, [aberto])

  function aoCarregar() {
    clearTimeout(timeoutRef.current)
    setCarregado(true)
  }

  function fechar() {
    setAberto(false)
  }

  return (
    <>
      <button className="filtro-btn" onClick={() => setAberto(true)}>
        {ICONE_3D}Ver em 3D
      </button>
      {aberto && (
        <div className="modal-overlay" onClick={fechar}>
          <div className="modal-3d" onClick={e => e.stopPropagation()}>
            <button className="modal-fechar" onClick={fechar} aria-label="Fechar">✕</button>
            {bloqueado && !carregado && (
              <div className="modal-3d-bloqueado">
                <p>Não foi possível carregar a cena 3D embutida.</p>
                <button className="filtro-btn ativo" onClick={() => window.open(URL_CENA, '_blank')}>
                  Abrir em nova aba
                </button>
              </div>
            )}
            <iframe
              src={URL_CENA}
              title="Cena 3D — Observatório Térmico Urbano"
              style={{ width: '100%', height: '100%', border: 'none', display: bloqueado && !carregado ? 'none' : 'block' }}
              onLoad={aoCarregar}
            />
          </div>
        </div>
      )}
    </>
  )
}
