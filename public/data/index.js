// ============================================================
//  DATA LOADER — lê arquivos .xlsx definidos em fabricas.json
//  Usa SheetJS (xlsx) via CDN/import dinâmico no browser.
//
//  Colunas OBRIGATÓRIAS no xlsx (case-insensitive):
//    referencia, nome, preco, cxMestre, categoria, descricao
//  Colunas de IMAGEM detectadas automaticamente:
//    imagem, imagem1, imagem2, imagem_1, img1 … qualquer
//    coluna cujo nome comece com "imagem" ou "img"
//  QUALQUER outra coluna é incorporada na descrição como:
//    "NomeColuna: valor"
// ============================================================

import fabricasRaw  from './fabricas.json'
import destaquesRaw from './destaques.json'

// ── Campos que NÃO entram na descrição extra ─────────────────
const CAMPOS_RESERVADOS = new Set([
  'referencia', 'nome', 'preco', 'cxmestre', 'cx_mestre', 'cx mestre',
  'categoria', 'descricao', 'descrição',
  // imagens são tratadas separadamente
])

// Normaliza nome de coluna para comparação
const norm = s => String(s ?? '').toLowerCase().trim()

// Detecta se coluna é de imagem
const isImageCol = col => {
  const n = norm(col)
  return n.startsWith('imagem') || n.startsWith('img') || n === 'image'
}

// Detecta a coluna pelo nome normalizado, retorna valor ou undefined
const getCol = (row, ...names) => {
  for (const [k, v] of Object.entries(row)) {
    if (names.includes(norm(k)) && v !== undefined && v !== null && v !== '') {
      return v
    }
  }
}

// Converte valor numérico do xlsx para float seguro
const toFloat = v => {
  const n = parseFloat(String(v ?? '0').replace(',', '.'))
  return isNaN(n) ? 0 : n
}

// Converte valor para inteiro seguro
const toInt = v => {
  const n = parseInt(String(v ?? '1'), 10)
  return isNaN(n) ? 1 : n
}

// ── Parseia uma aba de xlsx (array de objetos) para produtos ──
function parseSheet(rows, fabricaId) {
  if (!rows || rows.length === 0) return []

  // Detecta colunas presentes no primeiro row com dados
  const sample = rows[0]
  const allCols = Object.keys(sample)

  // Colunas de imagem (ordem preservada)
  const imageCols = allCols.filter(isImageCol)

  // Colunas "extras" (não reservadas e não imagem)
  const extraCols = allCols.filter(col => {
    const n = norm(col)
    return !CAMPOS_RESERVADOS.has(n) && !isImageCol(col)
  })

  return rows
    .filter(row => {
      // Ignora linhas completamente vazias
      return Object.values(row).some(v => v !== null && v !== undefined && v !== '')
    })
    .map(row => {
      // ── Campos principais ──────────────────────────────
      const referencia = String(
        getCol(row, 'referencia', 'ref', 'código', 'codigo', 'code') ?? ''
      ).trim()

      const nome = String(
        getCol(row, 'nome', 'name', 'produto', 'product', 'descrição', 'descricao', 'description') ?? ''
      ).trim()

      const preco = toFloat(
        getCol(row, 'preco', 'preço', 'price', 'valor', 'value', 'preco_unitario', 'preço unitário')
      )

      const cxMestre = toInt(
        getCol(row, 'cxmestre', 'cx_mestre', 'cx mestre', 'caixamestre', 'caixa', 'cx', 'qtd_cx', 'qtd cx', 'quantidade_cx')
      )

      const categoria = String(
        getCol(row, 'categoria', 'category', 'grupo', 'group', 'tipo', 'type') ?? 'Geral'
      ).trim()

      const descricaoBase = String(
        getCol(row, 'descricao', 'descrição', 'description', 'obs', 'observacao', 'observação') ?? ''
      ).trim()

      // ── Imagens: detecta todas as colunas de imagem ────
      const imagens = imageCols
        .map(col => String(row[col] ?? '').trim())
        .filter(Boolean)

      // ── Campos extras → incorporados na descrição ──────
      const extrasTexto = extraCols
        .map(col => {
          const val = row[col]
          if (val === null || val === undefined || val === '') return null
          return `${col}: ${val}`
        })
        .filter(Boolean)

      // Monta descrição final
      let descricao = descricaoBase
      if (extrasTexto.length > 0) {
        if (descricao) {
          descricao = descricao + '\n\n' + extrasTexto.join('\n')
        } else {
          descricao = extrasTexto.join('\n')
        }
      }

      if (!referencia && !nome) return null // linha inválida

      return {
        referencia: referencia || `_${Math.random().toString(36).slice(2, 8)}`,
        nome: nome || referencia,
        preco,
        cxMestre,
        categoria,
        descricao,
        fabricaId,
        imagem: imagens[0] ?? '',
        imagens: imagens.length > 0 ? imagens : [],
        destaque: false,
      }
    })
    .filter(Boolean)
}

// ── Carrega um arquivo .xlsx via fetch + SheetJS ─────────────
async function loadXlsx(path) {
  // SheetJS deve estar disponível via import ou CDN
  // Tentamos import dinâmico primeiro, depois window.XLSX
  let XLSX
  try {
    XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs')
  } catch {
    XLSX = window.XLSX
  }

  if (!XLSX) {
    console.error('SheetJS não encontrado. Adicione ao index.html ou instale via npm.')
    return []
  }

  const res = await fetch(path)
  if (!res.ok) {
    console.warn(`Arquivo não encontrado: ${path}`)
    return []
  }

  const buf  = await res.arrayBuffer()
  const wb   = XLSX.read(buf, { type: 'array' })
  const rows = []

  // Processa todas as abas
  for (const sheetName of wb.SheetNames) {
    const ws   = wb.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(ws, { defval: '' })
    rows.push(...data)
  }

  return rows
}

// ── Estado global (preenchido por loadAllData) ───────────────
let _FABRICAS      = []
let _TODOS_PRODUTOS = []
let _loaded        = false

// ── Carrega tudo de forma assíncrona ─────────────────────────
export async function loadAllData() {
  if (_loaded) return

  // Resolve base URL para os xlsx (assumidos em /public/data/fabricas/)
  const base = import.meta.env.BASE_URL ?? '/'

  const fabricasComProdutos = await Promise.all(
    fabricasRaw.map(async fab => {
      const arquivos = fab.arquivos ?? []
      let todosProdutos = []

      for (const arquivo of arquivos) {
        const url  = `${base}data/fabricas/${arquivo}`
        const rows = await loadXlsx(url)
        const prods = parseSheet(rows, fab.id)
        todosProdutos.push(...prods)
      }

      // Injeta destaques
      destaquesRaw.forEach(({ fabricaId, referencia }) => {
        if (fabricaId !== fab.id) return
        const prod = todosProdutos.find(p => p.referencia === referencia)
        if (prod) prod.destaque = true
      })

      return {
        ...fab,
        produtos: todosProdutos,
        categorias: [...new Set(todosProdutos.map(p => p.categoria))],
      }
    })
  )

  _FABRICAS       = fabricasComProdutos
  _TODOS_PRODUTOS = fabricasComProdutos.flatMap(f => f.produtos)
  _loaded         = true
}

// ── Getters síncronos (usar após loadAllData) ─────────────────
export const getFabricas     = ()       => _FABRICAS
export const getTodosProdutos = ()      => _TODOS_PRODUTOS
export const getFabrica      = (id)    => _FABRICAS.find(f => f.id === id)
export const getProduto      = (fabricaId, referencia) =>
  (_FABRICAS.find(f => f.id === fabricaId)?.produtos ?? [])
    .find(p => p.referencia === referencia) ?? null

// ── Compatibilidade com imports estáticos existentes ──────────
// Exporta arrays reativos (inicialmente vazios, preenchidos após load)
export let FABRICAS       = _FABRICAS
export let TODOS_PRODUTOS = _TODOS_PRODUTOS