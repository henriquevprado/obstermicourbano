# GeoPOA · Clima Urbano — Plataforma de visualização (POC SMAMUS)

Plataforma web que cruza a **temperatura de superfície (LST / Landsat)** com
**empreendimentos sustentáveis certificados** na região central de Porto Alegre,
ao longo de dez semestres (2021–2025).

Desenvolvida como prova de conceito para a Secretaria Municipal do Meio Ambiente
e Urbanismo (SMAMUS). Identidade visual ancorada no padrão **gov.br** usado pela
Prefeitura de Porto Alegre.

## O que a plataforma mostra

- **Indicadores macro**: total de empreendimentos, árvores implantadas/preservadas,
  telhado verde, temperatura média da série.
- **Gráficos agregados**: distribuição por nível de certificação e evolução da
  temperatura média da cidade por semestre.
- **Mapa interativo** com controle de tempo (time slider + play), cor por nível de
  certificação, tamanho do ponto proporcional à temperatura, filtro por certificação
  e painel lateral de detalhes ao clicar em cada empreendimento.
- **Ranking** dos empreendimentos com maior aquecimento e maior resfriamento entre
  o primeiro e o último período.

## Stack

- React 18 + Vite (build e dev server)
- Leaflet + React-Leaflet (mapa)
- Recharts (gráficos)

## Como rodar localmente

Pré-requisito: **Node.js 18+** instalado.

```bash
# 1. Instalar as dependências
npm install

# 2. Subir o servidor de desenvolvimento (abre em http://localhost:5173)
npm run dev
```

O navegador abre automaticamente. Qualquer alteração no código recarrega a página
na hora (hot reload).

## Gerar versão de produção

```bash
npm run build      # gera a pasta dist/
npm run preview    # pré-visualiza o build de produção localmente
```

A pasta `dist/` resultante pode ser hospedada em qualquer servidor estático.

## Estrutura

```
geopoa-smamus/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx              # ponto de entrada
│   ├── App.jsx               # monta as seções
│   ├── styles.css            # design system (tokens gov.br)
│   ├── components/
│   │   ├── Cabecalho.jsx
│   │   ├── Hero.jsx
│   │   ├── Indicadores.jsx
│   │   ├── Graficos.jsx
│   │   ├── Mapa.jsx          # mapa + time slider + painel de detalhe
│   │   ├── Ranking.jsx
│   │   └── Rodape.jsx
│   └── data/
│       ├── empreendimentos.json   # dados (118 empreendimentos × 10 períodos)
│       └── utils.js               # funções de processamento/derivação
```

## Substituir os dados

O arquivo `src/data/empreendimentos.json` contém os 118 empreendimentos, cada um
com um array `periodos` (10 semestres) e os atributos de certificação. Para
atualizar com novos dados, basta exportar do ArcGIS Pro no mesmo formato e
substituir esse arquivo — a interface se ajusta automaticamente.

## Próximos passos sugeridos

- Adicionar camada raster de fundo (LST contínuo) por período.
- Integrar diretamente com serviços do ArcGIS Enterprise (Feature Service) quando
  publicados, substituindo o JSON estático.
- Exportar relatório PDF por empreendimento.
