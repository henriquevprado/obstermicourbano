export const REGRESSAO = {
  semPrograma: { slope: 0.9043, intercept: -1787.09, periodo: '2016–2022' },
  comPrograma: { slope: 0.4006, intercept: -774.23, periodo: '2023–2026' },
}

export const DADOS_REAIS_SEM = [
  { ano: 2016, temp: 34.909 }, { ano: 2017, temp: 35.718 },
  { ano: 2020, temp: 42.448 }, { ano: 2021, temp: 41.320 },
  { ano: 2022, temp: 38.849 },
]

export const DADOS_REAIS_COM = [
  { ano: 2023, temp: 37.073 }, { ano: 2024, temp: 36.312 },
  { ano: 2025, temp: 34.870 }, { ano: 2026, temp: 38.889 },
]

export const CENARIOS_EXPANSAO = [
  { nome: 'Atual (2026)', n: 118 },
  { nome: 'Conservador', n: 150 },
  { nome: 'Moderado', n: 200 },
  { nome: 'Ambicioso', n: 250 },
  { nome: 'Transformador', n: 300 },
]

// projeção de temperatura por nº de empreendimentos (regressão empreend. x temp)
export const REGRESSAO_EXPANSAO = { slope: -0.022, intercept: 37.4 }

const BASE_2023 = DADOS_REAIS_COM.find(d => d.ano === 2023).temp

export const ANOS_PROJECAO = Array.from({ length: 2035 - 2016 + 1 }, (_, i) => 2016 + i)

export const DADOS_GRAFICO_PROJECAO = ANOS_PROJECAO.map(ano => {
  const semPrograma = REGRESSAO.semPrograma.intercept + REGRESSAO.semPrograma.slope * ano
  const comPrograma = ano >= 2023
    ? REGRESSAO.comPrograma.intercept + REGRESSAO.comPrograma.slope * ano
    : null
  return {
    ano,
    semPrograma: Number(semPrograma.toFixed(2)),
    comPrograma: comPrograma != null ? Number(comPrograma.toFixed(2)) : null,
    realSem: DADOS_REAIS_SEM.find(d => d.ano === ano)?.temp ?? null,
    realCom: DADOS_REAIS_COM.find(d => d.ano === ano)?.temp ?? null,
  }
})

export const CENARIOS_CALCULADOS = CENARIOS_EXPANSAO.map(c => {
  const temp = REGRESSAO_EXPANSAO.intercept + REGRESSAO_EXPANSAO.slope * c.n
  return {
    ...c,
    temp: Number(temp.toFixed(2)),
    reducaoVs2023: Number((temp - BASE_2023).toFixed(2)),
  }
})

export const REDUCAO_RITMO_PCT = Math.round(
  (1 - REGRESSAO.comPrograma.slope / REGRESSAO.semPrograma.slope) * 100
)
