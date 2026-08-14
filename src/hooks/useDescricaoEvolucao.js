import descricoes from '../data/descricoes_evolucao.json'

export function useDescricaoEvolucao(sei, ano) {
  return descricoes[sei]?.[String(ano)] || null
}
