# Briefing — Aba "Mapa de Calor & Empreendimentos" (série Janeiro 2016–2026)

## Contexto
Este é o projeto `geopoa-smamus` já existente (React + Vite + Leaflet + Recharts).
Esta tarefa ADICIONA uma nova aba/tela ao projeto — não recria do zero.
Depois desta, ainda virão mais 2 abas (não implementar agora, só deixar a
estrutura de navegação pronta para receber).

## Passo 0 — Estrutura de navegação (se ainda não existir)
Adicionar um sistema de abas simples no topo do App (abaixo do Hero), com pelo
menos 3 posições: "Empreendimentos Sustentáveis" (tela já existente), "Calor &
Séries Anuais" (esta tarefa), e um placeholder "Em breve" para as próximas 2.
Usar estado local (useState) para trocar entre telas — sem necessidade de
React Router nesta fase.

## Passo 1 — Preparar o overlay do raster (fazer isso primeiro, com rasterio)
Os arquivos-fonte já recortados estão em:
`C:\Users\henrique.prado\Documents\SMAMUS\GEE_LST_Janeiro_10anos\rasters_clip\`
(rasterio 1.5.0 já confirmado disponível no ambiente Python do usuário)

Para cada um dos 9 rasters de ano (2016, 2017, 2020–2026), gerar um PNG
georreferenciado com fundo transparente nos pixels de NoData, usando uma
rampa de cor térmica (azul → amarelo → vermelho) com escala MIN/MAX FIXA
E IDÊNTICA entre todos os anos (para permitir comparação visual justa ao
trocar de ano). Usar os seguintes limites fixos: min=25°C, max=48°C
(cobrem a faixa observada em toda a série).

Script de referência (ajustar caminhos conforme necessário):

```python
import rasterio
import numpy as np
from PIL import Image
import matplotlib.cm as cm
import matplotlib.colors as mcolors
import json
from pyproj import Transformer
import os

pasta = r"C:\Users\henrique.prado\Documents\SMAMUS\GEE_LST_Janeiro_10anos\rasters_clip"
saida = r"C:\Users\henrique.prado\Documents\SMAMUS\geopoa-smamus\public\raster_overlays"
os.makedirs(saida, exist_ok=True)

VMIN, VMAX = 25, 48
cmap = mcolors.LinearSegmentedColormap.from_list(
    "termica", ["#2c7fb8", "#fec44f", "#d7301f"]
)

bounds_por_ano = {}

for fname in sorted(os.listdir(pasta)):
    if not fname.endswith(".tif"):
        continue
    ano = fname.split("_")[3]  # ajustar índice conforme nome real do arquivo

    with rasterio.open(os.path.join(pasta, fname)) as src:
        dados = src.read(1, masked=True)
        norm = np.clip((dados - VMIN) / (VMAX - VMIN), 0, 1)
        rgba = (cmap(norm) * 255).astype(np.uint8)
        rgba[..., 3] = np.where(dados.mask, 0, 180)  # transparência ~70%

        img = Image.fromarray(rgba, mode="RGBA")
        img.save(os.path.join(saida, f"lst_{ano}.png"))

        # Bounds em WGS84 (lat/lon) para o Leaflet ImageOverlay
        transformer = Transformer.from_crs(src.crs, "EPSG:4326", always_xy=True)
        left, bottom, right, top = src.bounds
        lon_min, lat_min = transformer.transform(left, bottom)
        lon_max, lat_max = transformer.transform(right, top)
        bounds_por_ano[ano] = [[lat_min, lon_min], [lat_max, lon_max]]

with open(os.path.join(saida, "bounds.json"), "w") as f:
    json.dump(bounds_por_ano, f)

print("PNGs e bounds.json gerados em", saida)
```

Se `pyproj` ou `Pillow` não estiverem instalados, instalar com pip antes.
Resultado esperado: 9 arquivos `lst_{ano}.png` + `bounds.json` dentro de
`public/raster_overlays/` no projeto React (Vite serve `public/` como raiz
estática, então os componentes podem referenciar `/raster_overlays/lst_2023.png`).

## Passo 2 — Dados dos empreendimentos
Usar o arquivo `dados_janeiro_completo.json` (fornecido junto a este
briefing) como `src/data/empreendimentos_janeiro.json`. Estrutura:

```json
[
  {
    "sei": "23.0.000104967-4",
    "endereco": "R. Carlos Von Koseritz, 1304",
    "lon": -51.1875,
    "lat": -30.0191,
    "certificado": "DIAMANTE",
    "ano_certificacao": 2023,
    "delta_2023": -4.5,
    "media_pre2023": 40.51,
    "media_pos2023": 36.01,
    "arvores_implantadas": 5,
    "telhado_verde_m2": 0,
    "periodos": [
      { "ano": 2016, "temp": 40.54 },
      { "ano": 2017, "temp": 37.14 },
      { "ano": 2020, "temp": 43.03 }
      // ... demais anos
    ]
  }
]
```

Indicadores agregados já calculados (usar como referência/validação, não
precisa recalcular do zero se os dados baterem):
- Empreendimentos com queda desde 2023: 115 de 118
- Queda média desde 2023: −2,0 °C | Maior queda individual: −4,5 °C
- Queda geral da região (pré vs pós 2023): −2,89 °C
- Queda nos empreendimentos (pré vs pós 2023): −3,16 °C
- Efeito adicional de esfriamento dos empreendimentos: −0,27 °C
- Certificações: Diamante 94, Prata 14, Ouro 8, Bronze 2

Também será necessário o arquivo de comparação geral (região vs
empreendimentos) para o gráfico de linha final — usar estes 9 pontos:
```json
[
  {"ano":2016,"media_geral":35.91,"media_empreend":34.91},
  {"ano":2017,"media_geral":35.72,"media_empreend":35.72},
  {"ano":2020,"media_geral":42.76,"media_empreend":42.45},
  {"ano":2021,"media_geral":41.42,"media_empreend":41.32},
  {"ano":2022,"media_geral":39.02,"media_empreend":38.85},
  {"ano":2023,"media_geral":37.56,"media_empreend":37.07},
  {"ano":2024,"media_geral":36.61,"media_empreend":36.31},
  {"ano":2025,"media_geral":36.06,"media_empreend":34.87},
  {"ano":2026,"media_geral":39.24,"media_empreend":38.89}
]
```
Salvar como `src/data/comparacao_geral.json`.

## Passo 3 — Componente do mapa (núcleo da tela)

Reaproveitar o padrão visual e a paleta gov.br já definida em
`src/styles.css` do projeto (--azul-gov, --verde, --cinza-*, cards com
`border-left` colorido, etc.) — manter consistência com a aba existente.

**Filtro de ano**: slider (input range) com os 9 anos disponíveis
(2016, 2017, 2020, 2021, 2022, 2023, 2024, 2025, 2026 — SEM 2018/2019, que
não existem na série). Ao mudar o ano:
  - Troca o overlay do raster (`ImageOverlay` do react-leaflet, usando o
    PNG e bounds do ano selecionado, opacity ~0.55–0.65)
  - Recalcula a simbologia dos pontos dos empreendimentos (ver abaixo)

**Simbologia dos pontos de empreendimento** — a lógica pedida é baseada na
VARIAÇÃO desde 2023, não na temperatura absoluta do ano corrente:
  - Cor: vermelho se `delta_2023 > 0` (esquentou), azul se `delta_2023 < 0`
    (esfriou). Usar uma escala contínua (não binária) — ex: interpolação
    de azul escuro (delta muito negativo) até vermelho escuro (delta muito
    positivo), passando por um tom neutro perto de zero.
  - Tamanho do ponto: proporcional ao valor ABSOLUTO de `delta_2023` (quanto
    maior a variação, maior o ponto — para cima ou para baixo).
  - Ícone/forma: usar marcador customizado que remeta a "edificação +
    árvore" (pode ser um DivIcon do Leaflet combinando um emoji ou SVG
    simples de prédio com uma folha/árvore sobreposta, mantendo performance
    para 118 pontos).
  - Para anos ANTERIORES a 2023 (2016–2022), como `delta_2023` é sempre o
    mesmo valor fixo (calculado sobre pré vs pós), a simbologia dos pontos
    não muda com o slider — apenas o raster de fundo muda. Deixar isso
    claro visualmente (ex: nota abaixo do slider: "cor e tamanho dos
    pontos refletem a variação 2023→2026; o mapa de fundo mostra a
    temperatura observada no ano selecionado").
  - Popup/tooltip ao clicar: endereço, certificação, delta_2023, temp no
    ano selecionado do slider.

**Camadas por ano alternativa**: se o slider não for satisfatório
visualmente, oferecer também um seletor de botões (2023 | 2024 | 2025 |
2026) como toggle rápido, adicional ao slider — não obrigatório, avaliar
depois de ver o resultado do slider.

## Passo 4 — Indicadores (cards no topo desta aba)
Cards no mesmo estilo `.card-indicador` já existente:
1. Empreendimentos certificados por ano (mostrar breakdown: 2023: 17 | 2024:
   +51 | 2025: +37 | 2026: +13 | Total: 118)
2. Queda geral da região (pré vs pós 2023): −2,89 °C
3. Queda nos empreendimentos (pré vs pós 2023): −3,16 °C
4. Efeito de esfriamento adicional dos empreendimentos: −0,27 °C
5. Redução média de temperatura por empreendimento desde 2023: −2,0 °C

## Passo 5 — Gráfico de linha (evolução da temperatura), abaixo do mapa
Line chart (Recharts) com a temperatura média dos empreendimentos por ano
(2016 a 2026), semelhante ao que já existe na aba anterior — pode reusar o
componente `Graficos.jsx` como referência de estilo.

## Passo 6 — Painel lateral direito: Top 10 maior queda desde 2023
Bar chart horizontal (Recharts), mesmo padrão do componente `Ranking.jsx`
já existente no projeto — adaptar para esta tela, ordenando por
`delta_2023` ascendente (mais negativo primeiro) e pegando os 10 primeiros.

## Passo 7 — Classificação de temperatura por certificação
Abaixo do mapa/gráficos: comparar a temperatura média (ou o delta médio)
agrupado por nível de certificação (Bronze, Prata, Ouro, Diamante) — pode
ser um bar chart agrupado ou um box-plot simplificado. Dados de referência
(delta médio pré vs pós 2023 por certificação):
  Bronze: −0,8 °C | Prata: −2,0 °C | Ouro: −1,8 °C | Diamante: −2,0 °C

## Passo 8 — Gráfico de linha dupla: região geral vs empreendimentos
Usar `comparacao_geral.json` (Passo 2). Duas linhas no mesmo gráfico
(Recharts LineChart com 2 `<Line>`): "Temperatura geral dos bairros" e
"Temperatura nos empreendimentos", eixo X = ano. Adicionar uma
área/preenchimento sutil entre as duas linhas para destacar a diferença
(efeito de esfriamento). Incluir uma legenda clara e, se possível, um texto
curto de interpretação abaixo do gráfico (pode reaproveitar o texto: "A
queda de temperatura após 2023 ocorreu tanto na região geral quanto nos
empreendimentos — que esfriaram cerca de 0,27°C a mais que o entorno,
sugerindo um efeito local positivo do programa de certificação.").

## Passo 9 — Tabela de atributos dos empreendimentos (mais abaixo, última seção)
Tabela paginada/rolável com uma linha por empreendimento (118 linhas),
reaproveitando os dados já carregados em `empreendimentos_janeiro.json` —
não precisa de novo arquivo de dados.

Colunas sugeridas:
- Endereço
- Certificação (badge colorido, mesma paleta CERT_CORES já usada)
- Ano de certificação
- Temp. pré-2023 (media_pre2023)
- Temp. pós-2023 (media_pos2023)
- Variação (delta_2023) — colorir célula (azul se negativo, vermelho se
  positivo), mesmo princípio de cor do mapa
- Árvores implantadas
- Telhado verde (m²)

Funcionalidades mínimas:
- Ordenação por coluna ao clicar no cabeçalho (pelo menos pela coluna de
  variação, que é a mais relevante — clicar ordena crescente/decrescente)
- Busca/filtro por texto (endereço) em um campo acima da tabela
- Filtro por certificação (reaproveitar os mesmos botões de filtro em pill
  já usados no componente `Mapa.jsx` da aba anterior, se fizer sentido
  visualmente)
- Paginação simples (ex: 15–20 linhas por página) OU rolagem interna com
  altura máxima fixa (ex: `max-height: 500px; overflow-y: auto`) — usar o
  que for mais simples de implementar bem; rolagem interna é aceitável e
  mais rápido de fazer.
- Ao clicar em uma linha, opcional: destacar/centralizar o ponto
  correspondente no mapa acima (nice-to-have, não bloqueante — só
  implementar se for rápido, senão deixar para uma iteração futura).

Estilo: usar os tokens já existentes em `styles.css` (bordas `--cinza-20`,
fonte `--font-corpo`, badges de certificação com as cores `CERT_CORES` de
`utils.js`). Cabeçalho da tabela com fundo `--cinza-05` e texto em
`--cinza-70`, consistente com o resto do design system.

Posicionamento: esta tabela é a ÚLTIMA seção da aba, abaixo do gráfico de
linha dupla do Passo 8.

## Ordem de montagem sugerida para o Claude Code
1. Rodar o script Python do Passo 1 primeiro (fora do React, direto no
   terminal) para gerar os PNGs/bounds antes de mexer em componentes.
2. Criar `MapaCalor.jsx` (mapa + slider + simbologia + overlay).
3. Criar `IndicadoresJaneiro.jsx` (cards do Passo 4).
4. Criar `EvolucaoTemperatura.jsx` (Passo 5).
5. Criar `Top10Queda.jsx` (Passo 6).
6. Criar `PorCertificacao.jsx` (Passo 7).
7. Criar `ComparacaoRegiao.jsx` (Passo 8).
8. Criar `TabelaEmpreendimentos.jsx` (Passo 9).
9. Montar a nova aba juntando os componentes acima, no mesmo padrão de
   `container` / `secao` já usado no App.jsx existente.
10. Adicionar a navegação por abas no topo (Passo 0) ligando tudo.

## Observações finais para o Claude Code
- Não modificar a aba/tela já existente (empreendimentos + mapa antigo) —
  esta é uma ADIÇÃO.
- Manter os tokens de cor e tipografia de `styles.css` — não introduzir
  nova paleta.
- Rodar `npm run dev` ao final e verificar visualmente antes de considerar
  concluído.
- Se o raster overlay pesar muito (PNGs grandes) e deixar o app lento,
  aceitável reduzir a resolução dos PNGs (downsample) — priorizar
  performance de interação do slider sobre nitidez do raster.
