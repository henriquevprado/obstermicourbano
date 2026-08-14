import { useMemo, useState } from 'react'
import { useDescricaoEvolucao } from '../../hooks/useDescricaoEvolucao'
import { gerarRelatorioPDF, carregarImagemComoDataURL } from '../../utils/gerarRelatorioPDF'

function CardAno({ empreendimento, p, primeiro }) {
  const descricao = useDescricaoEvolucao(empreendimento.sei, p.ano)
  return (
    <div className="timeline-item">
      <div className="timeline-marker" />
      <div className="timeline-card">
        <h4>
          {p.ano}
          {primeiro && (
            <span className="badge-cert" style={{ background: 'var(--verde)' }}>Início</span>
          )}
        </h4>
        <div className="timeline-imgs">
          {p.itens.map(a => (
            <img key={a.id} src={a.url} alt={a.nome} />
          ))}
        </div>
        {descricao && <p className="timeline-desc">{descricao}</p>}
      </div>
    </div>
  )
}

export default function ModalRelatorioEvolucao({ empreendimento, anexos, onClose }) {
  const [gerando, setGerando] = useState(false)

  const periodos = useMemo(() => {
    const grupos = {}
    anexos.forEach(a => {
      if (!grupos[a.ano]) grupos[a.ano] = { ano: a.ano, itens: [] }
      grupos[a.ano].itens.push(a)
    })
    return Object.values(grupos).sort((a, b) => a.ano - b.ano)
  }, [anexos])

  async function handleExportar() {
    setGerando(true)
    try {
      const logoDataURL = await carregarImagemComoDataURL('/logo_smamus.jpg')
      await gerarRelatorioPDF(empreendimento, anexos, logoDataURL)
    } catch (e) {
      console.error('Erro ao gerar PDF:', e)
      alert('Não foi possível gerar o PDF. Verifique o console.')
    } finally {
      setGerando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-relatorio" onClick={e => e.stopPropagation()}>
        <div className="modal-relatorio-header">
          <div>
            <h3>Relatório de Evolução</h3>
            <p>
              {empreendimento.endereco} · {periodos[0]?.ano} → {periodos[periodos.length - 1]?.ano} · {periodos.length} registros
            </p>
          </div>
          <button className="modal-fechar" onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        <div className="timeline">
          {periodos.map((p, i) => (
            <CardAno key={p.ano} empreendimento={empreendimento} p={p} primeiro={i === 0} />
          ))}
        </div>

        <button className="btn-exportar" disabled={gerando} onClick={handleExportar}>
          {gerando ? 'Gerando...' : 'Exportar PDF'}
        </button>
      </div>
    </div>
  )
}
