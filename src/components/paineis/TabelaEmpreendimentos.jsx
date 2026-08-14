import { useMemo, useState } from 'react'
import { formatarDelta } from '../../data/utils'

const CERTIFICACOES = ['Todos', 'BRONZE', 'PRATA', 'OURO', 'DIAMANTE']
const POR_PAGINA = 15

const MEDALHAS = {
  DIAMANTE: '/medals/diamond_medal.png',
  OURO: '/medals/gold-medal.png',
  PRATA: '/medals/silver-medal.png',
  BRONZE: '/medals/bronze-medal.png',
}

const COLUNAS_FIXAS = [
  { chave: 'certificado', rotulo: 'Certificação' },
  { chave: 'sei', rotulo: 'SEI' },
  { chave: 'endereco', rotulo: 'Endereço' },
  { chave: 'ano_certificacao', rotulo: 'Ano cert.' },
]

const GRUPOS = [
  { chave: 'temperatura', rotulo: 'Temperatura' },
  { chave: 'arborizacao', rotulo: 'Arborização' },
  { chave: 'infraestrutura', rotulo: 'Infraestrutura verde' },
  { chave: 'mobilidade', rotulo: 'Mobilidade' },
  { chave: 'pontuacao', rotulo: 'Pontuação' },
]

const COLUNAS_GRUPO = {
  temperatura: [
    { chave: 'media_pre2023', rotulo: 'Temp. pré-2023', formato: 'temp' },
    { chave: 'media_pos2023', rotulo: 'Temp. pós-2023', formato: 'temp' },
    { chave: 'delta_2023', rotulo: 'Variação', formato: 'delta' },
  ],
  arborizacao: [
    { chave: 'arvores_implantadas', rotulo: 'Árvores implantadas' },
    { chave: 'arvores_nativas_implantadas', rotulo: 'Árvores nativas implantadas' },
    { chave: 'arvores_nativas_preservadas', rotulo: 'Árvores nativas preservadas' },
    { chave: 'arvores_nativas_ameacadas', rotulo: 'Árvores nativas ameaçadas' },
    { chave: 'total_arvores', rotulo: 'Total de árvores' },
    { chave: 'especies_nativas_ameacadas', rotulo: 'Espécies nativas ameaçadas implantadas' },
  ],
  infraestrutura: [
    { chave: 'telhado_verde_m2', rotulo: 'Telhado verde (m²)', formato: 'm2' },
    { chave: 'parede_verde_m2', rotulo: 'Parede verde (m²)', formato: 'm2' },
    { chave: 'area_permeavel_excedente', rotulo: 'Área permeável excedente (m²)', formato: 'm2' },
    { chave: 'pavimentacao_permeavel', rotulo: 'Pavimentação permeável (m²)', formato: 'm2' },
  ],
  mobilidade: [
    { chave: 'vagas_bicicletario', rotulo: 'Vagas bicicletário' },
    { chave: 'vagas_veiculos_eletricos', rotulo: 'Vagas veículos elétricos' },
    { chave: 'vagas_bicicleta', rotulo: 'Vagas bicicleta' },
  ],
  pontuacao: [
    { chave: 'pontuacao_biodiversidade', rotulo: 'Pontuação biodiversidade' },
    { chave: 'pontuacao_adequacao_climatica', rotulo: 'Pontuação adequação climática' },
  ],
}

function formatarValor(valor, formato) {
  if (valor == null || Number.isNaN(valor)) return '—'
  switch (formato) {
    case 'temp': return `${valor.toFixed(1)}°C`
    case 'delta': return formatarDelta(valor)
    case 'm2': return `${valor} m²`
    case 'numero3': return valor.toFixed(3)
    default: return valor
  }
}

export default function TabelaEmpreendimentos({ empreendimentos, onMonitorar }) {
  const [busca, setBusca] = useState('')
  const [filtroCert, setFiltroCert] = useState('Todos')
  const [gruposAtivos, setGruposAtivos] = useState(new Set(['temperatura']))
  const [ordenacao, setOrdenacao] = useState({ coluna: 'delta_2023', direcao: 'asc' })
  const [pagina, setPagina] = useState(1)

  const colunas = useMemo(() => [
    ...COLUNAS_FIXAS,
    ...GRUPOS.filter(g => gruposAtivos.has(g.chave)).flatMap(g => COLUNAS_GRUPO[g.chave]),
  ], [gruposAtivos])

  const filtrados = useMemo(() => {
    let lista = empreendimentos
    if (filtroCert !== 'Todos') lista = lista.filter(e => e.certificado === filtroCert)
    if (busca.trim()) {
      const termo = busca.trim().toLowerCase()
      lista = lista.filter(e => e.endereco.toLowerCase().includes(termo))
    }
    const { coluna, direcao } = ordenacao
    const sinal = direcao === 'asc' ? 1 : -1
    return [...lista].sort((a, b) => {
      const va = a[coluna]
      const vb = b[coluna]
      if (va == null) return 1
      if (vb == null) return -1
      if (typeof va === 'string') return va.localeCompare(vb) * sinal
      return (va - vb) * sinal
    })
  }, [empreendimentos, busca, filtroCert, ordenacao])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const paginaAtual = Math.min(pagina, totalPaginas)
  const inicio = (paginaAtual - 1) * POR_PAGINA
  const paginaDados = filtrados.slice(inicio, inicio + POR_PAGINA)

  function ordenarPor(coluna) {
    setPagina(1)
    setOrdenacao(o => ({
      coluna,
      direcao: o.coluna === coluna && o.direcao === 'asc' ? 'desc' : 'asc',
    }))
  }

  function toggleGrupo(chave) {
    setGruposAtivos(atual => {
      const novo = new Set(atual)
      novo.has(chave) ? novo.delete(chave) : novo.add(chave)
      return novo
    })
  }

  function toggleTudo() {
    setGruposAtivos(atual =>
      atual.size === GRUPOS.length ? new Set() : new Set(GRUPOS.map(g => g.chave))
    )
  }

  return (
    <div className="card">
      <div className="tabela-toolbar">
        <input
          className="tabela-busca"
          placeholder="Buscar por endereço…"
          value={busca}
          onChange={e => { setBusca(e.target.value); setPagina(1) }}
        />
        <div className="tabela-filtros">
          {CERTIFICACOES.map(c => (
            <button
              key={c}
              className={`filtro-btn ${filtroCert === c ? 'ativo' : ''}`}
              onClick={() => { setFiltroCert(c); setPagina(1) }}
            >
              {c === 'Todos' ? 'Todos' : c.charAt(0) + c.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="tabela-grupos">
        <span className="tabela-grupos-rotulo">Colunas:</span>
        {GRUPOS.map(g => (
          <button
            key={g.chave}
            className={`filtro-btn ${gruposAtivos.has(g.chave) ? 'ativo' : ''}`}
            onClick={() => toggleGrupo(g.chave)}
          >
            {g.rotulo}
          </button>
        ))}
        <button
          className={`filtro-btn ${gruposAtivos.size === GRUPOS.length ? 'ativo' : ''}`}
          onClick={toggleTudo}
        >
          Tudo
        </button>
      </div>

      <div className="tabela-wrapper">
        <table>
          <thead>
            <tr>
              {colunas.map(col => (
                <th key={col.chave} onClick={() => ordenarPor(col.chave)}>
                  <span className="th-ordenavel">
                    {col.rotulo}
                    {ordenacao.coluna === col.chave && (ordenacao.direcao === 'asc' ? '▲' : '▼')}
                  </span>
                </th>
              ))}
              <th>Monitoramento</th>
            </tr>
          </thead>
          <tbody>
            {paginaDados.map(e => (
              <tr key={e.sei}>
                {colunas.map(col => {
                  if (col.chave === 'certificado') {
                    return (
                      <td key={col.chave}>
                        <img
                          src={MEDALHAS[e.certificado]}
                          alt={e.certificado}
                          title={e.certificado}
                          style={{ width: 28, height: 28 }}
                        />
                      </td>
                    )
                  }
                  const valor = e[col.chave]
                  const classe = col.formato === 'delta'
                    ? (valor < 0 ? 'variacao-negativa' : 'variacao-positiva')
                    : undefined
                  return (
                    <td key={col.chave} className={classe}>
                      {formatarValor(valor, col.formato)}
                    </td>
                  )
                })}
                <td>
                  <button
                    className="filtro-btn"
                    onClick={() => onMonitorar?.(e.sei)}
                    title="Ver monitoramento deste empreendimento"
                  >
                    📷 Monitorar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="tabela-paginacao">
        <span>
          {filtrados.length === 0 ? '0' : `${inicio + 1}–${Math.min(inicio + POR_PAGINA, filtrados.length)}`} de {filtrados.length}
        </span>
        <button disabled={paginaAtual <= 1} onClick={() => setPagina(p => p - 1)}>Anterior</button>
        <button disabled={paginaAtual >= totalPaginas} onClick={() => setPagina(p => p + 1)}>Próximo</button>
      </div>
    </div>
  )
}
