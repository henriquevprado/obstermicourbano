import jsPDF from 'jspdf'
import descricoes from '../data/descricoes_evolucao.json'

const CORES = {
  azulEscuro: '#0c326f',
  azul: '#1351b4',
  verde: '#168821',
  cinzaTexto: '#333333',
  cinzaClaro: '#767676',
  cinzaFundo: '#f4f6f8',
  borda: '#e0e0e0',
}

// Converte uma URL de imagem em dataURL (necessário para addImage do jsPDF)
export async function carregarImagemComoDataURL(url) {
  const res = await fetch(url, { mode: 'cors' })
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Retorna {width, height} da imagem a partir do dataURL
function medirImagem(dataURL) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.width, height: img.height })
    img.src = dataURL
  })
}

// jsPDF precisa saber o formato (JPEG/PNG) de cada imagem — extrai do dataURL
// em vez de assumir um formato fixo, já que os anexos vêm tanto em .png
// (Enterprise) quanto em .jpg (fallback local).
function formatoDaDataURL(dataURL) {
  const match = dataURL.match(/^data:image\/(\w+);/)
  const tipo = match ? match[1].toUpperCase() : 'JPEG'
  return tipo === 'JPG' ? 'JPEG' : tipo
}

export async function gerarRelatorioPDF(empreendimento, anexosSelecionados, logoDataURL) {
  // anexosSelecionados: array já ordenado por ano, cada item:
  // { ano, tipo: 'topo'|'fachada', url, nome }
  // Agrupar por ano (um card por ano, podendo ter 1+ imagens naquele ano)
  const porAno = {}
  anexosSelecionados.forEach(a => {
    if (!porAno[a.ano]) porAno[a.ano] = []
    porAno[a.ano].push(a)
  })
  const anos = Object.keys(porAno).sort((a, b) => a - b)

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const larguraPagina = 210
  const margem = 18
  const larguraUtil = larguraPagina - margem * 2
  let y = margem

  // --- Cabeçalho ---
  if (logoDataURL) {
    doc.addImage(logoDataURL, formatoDaDataURL(logoDataURL), margem, y, 22, 22)
  }
  doc.setTextColor(CORES.azulEscuro)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('Relatório de Evolução', margem + 28, y + 9)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(CORES.cinzaClaro)
  doc.text('Observatório Térmico Urbano · SMAMUS · Porto Alegre', margem + 28, y + 15)

  y += 26
  doc.setDrawColor(CORES.azul)
  doc.setLineWidth(0.8)
  doc.line(margem, y, larguraPagina - margem, y)
  y += 8

  // --- Info do empreendimento ---
  doc.setFontSize(9.5)
  doc.setTextColor(CORES.cinzaTexto)
  const variacao = Number(empreendimento.delta_2023).toFixed(2).replace('.', ',')
  const linhasInfo = [
    `Empreendimento: ${empreendimento.endereco}`,
    `Certificação: ${empreendimento.certificado}   |   Período: ${anos[0]} – ${anos[anos.length - 1]}   |   Registros: ${anos.length}   |   Variação: ${variacao} °C`,
  ]
  linhasInfo.forEach(linha => {
    const quebradas = doc.splitTextToSize(linha, larguraUtil)
    doc.text(quebradas, margem, y)
    y += quebradas.length * 5
  })
  y += 5

  // --- Cards por ano ---
  for (const ano of anos) {
    const imagensDoAno = porAno[ano]
    const descricao = descricoes[empreendimento.sei]?.[ano] || null

    // Carrega e mede todas as imagens deste ano
    const imagensCarregadas = []
    for (const img of imagensDoAno) {
      try {
        const dataURL = await carregarImagemComoDataURL(img.url)
        const dim = await medirImagem(dataURL)
        imagensCarregadas.push({ ...img, dataURL, ...dim })
      } catch (e) {
        console.warn(`Não foi possível carregar a imagem "${img.nome}" para o PDF:`, e)
      }
    }
    if (imagensCarregadas.length === 0) continue

    // Calcula altura estimada do card para decidir se cabe na página atual
    const alturaImg = 55 // mm, altura fixa das imagens no card
    const alturaTexto = descricao ? 14 : 0
    const alturaCard = 14 + alturaImg + 8 + alturaTexto + 10

    if (y + alturaCard > 290) { // próximo da margem inferior
      doc.addPage()
      y = margem
    }

    // Fundo do card
    doc.setFillColor(CORES.cinzaFundo)
    doc.setDrawColor(CORES.borda)
    doc.roundedRect(margem, y, larguraUtil, alturaCard, 1, 1, 'FD')

    // Ano + badge (primeiro ano = Início, último = Atual)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(CORES.azulEscuro)
    doc.text(String(ano), margem + 6, y + 10)

    if (ano === anos[0]) {
      doc.setFillColor(CORES.verde)
      doc.roundedRect(margem + 30, y + 5, 22, 6, 1, 1, 'F')
      doc.setFontSize(8)
      doc.setTextColor('#ffffff')
      doc.text('Início', margem + 33, y + 9)
    } else if (ano === anos[anos.length - 1]) {
      doc.setFillColor(CORES.azulEscuro)
      doc.roundedRect(margem + 30, y + 5, 22, 6, 1, 1, 'F')
      doc.setFontSize(8)
      doc.setTextColor('#ffffff')
      doc.text('Atual', margem + 34, y + 9)
    }

    // Imagens lado a lado (largura dividida pelo número de imagens do ano)
    const espacamento = 4
    const larguraCardInterna = larguraUtil - 12
    const larguraPorImg = (larguraCardInterna - espacamento * (imagensCarregadas.length - 1)) / imagensCarregadas.length

    let x = margem + 6
    const yImg = y + 14
    imagensCarregadas.forEach(img => {
      const escala = Math.min(larguraPorImg / img.width, alturaImg / img.height)
      const wFinal = img.width * escala
      const hFinal = img.height * escala
      const xCentralizado = x + (larguraPorImg - wFinal) / 2
      doc.addImage(img.dataURL, formatoDaDataURL(img.dataURL), xCentralizado, yImg, wFinal, hFinal)

      // Legenda
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(CORES.cinzaClaro)
      doc.text(img.nome || '', x + larguraPorImg / 2, yImg + alturaImg + 4, { align: 'center' })

      x += larguraPorImg + espacamento
    })

    // Texto descritivo
    if (descricao) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      doc.setTextColor(CORES.cinzaTexto)
      const linhas = doc.splitTextToSize(descricao, larguraCardInterna)
      doc.text(linhas, margem + 6, yImg + alturaImg + 12)
    }

    y += alturaCard + 6
  }

  // --- Rodapé ---
  if (y > 270) { doc.addPage(); y = margem }
  doc.setDrawColor(CORES.borda)
  doc.setLineWidth(0.3)
  doc.line(margem, 285, larguraPagina - margem, 285)
  doc.setFontSize(7.5)
  doc.setTextColor(CORES.cinzaClaro)
  doc.text(
    'Observatório Térmico Urbano · POC SMAMUS | Documento gerado automaticamente — não constitui publicação oficial da Prefeitura Municipal de Porto Alegre.',
    larguraPagina / 2, 289, { align: 'center', maxWidth: larguraUtil }
  )

  // Salva/baixa o PDF
  const nomeArquivo = `relatorio_evolucao_${empreendimento.sei.replace(/[.-]/g, '')}.pdf`
  doc.save(nomeArquivo)
}
