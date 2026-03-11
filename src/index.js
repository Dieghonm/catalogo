// ============================================================
//  DATA LOADER — lê arquivos .xlsx definidos em fabricas.json
//  Suporta xlsx com linhas de título antes do cabeçalho real.
// ============================================================

import fabricasRaw  from './data/fabricas.json'
import destaquesRaw from './data/destaques.json'

console.log('📦 [index.js] Módulo carregado')
console.log('📋 [index.js] fabricas.json:', fabricasRaw)

// Palavras-chave que indicam que uma linha É o cabeçalho real
const HEADER_KEYWORDS = new Set([
  'referencia', 'referência', 'ref', 'código', 'codigo', 'code',
  'nome', 'name', 'produto', 'product', 'nome do produto',
  'preco', 'preço', 'price', 'valor',
  'categoria', 'category', 'grupo',
  'descricao', 'descrição', 'description',
  'cx mestre', 'cxmestre', 'cx mestre (un)',
])

// ── Campos que NÃO entram na descrição extra ─────────────────
const CAMPOS_RESERVADOS = new Set([
  'referencia', 'referência', 'ref', 'código', 'codigo', 'code',
  'nome', 'name', 'produto', 'product', 'nome do produto',
  'preco', 'preço', 'price', 'valor', 'value', 'preco_unitario',
  'preço unit. (rs)', 'preco unit. (rs)', 'preço unitário', 'preço unit', 'preco unit',
  'cxmestre', 'cx_mestre', 'cx mestre', 'cx mestre (un)', 'caixamestre', 'caixa', 'cx',
  'qtd_cx', 'qtd cx', 'quantidade_cx',
  'categoria', 'category', 'grupo', 'group', 'tipo', 'type',
  'descricao', 'descrição', 'description', 'obs', 'observacao', 'observação',
  'especificações', 'especificacoes',
])

const norm = s => String(s ?? '').toLowerCase().trim()

const isImageCol = col => {
  const n = norm(col)
  return n.startsWith('imagem') || n.startsWith('img') || n === 'image'
}

const getCol = (row, ...names) => {
  for (const [k, v] of Object.entries(row)) {
    if (names.includes(norm(k)) && v !== undefined && v !== null && v !== '') {
      return v
    }
  }
}

const toFloat = v => {
  const n = parseFloat(String(v ?? '0').replace(',', '.'))
  return isNaN(n) ? 0 : n
}

const toInt = v => {
  const n = parseInt(String(v ?? '1'), 10)
  return isNaN(n) ? 1 : n
}

// ── Detecta a linha do cabeçalho real numa worksheet ─────────
// Procura a primeira linha onde pelo menos 2 células batem com HEADER_KEYWORDS
function findHeaderRow(ws, XLSX) {
  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1')

  for (let R = range.s.r; R <= Math.min(range.e.r, 20); R++) {
    let matches = 0
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })]
      if (!cell) continue
      const val = norm(String(cell.v ?? ''))
      if (HEADER_KEYWORDS.has(val)) matches++
    }
    if (matches >= 2) {
      console.log(`🎯 [findHeaderRow] Cabeçalho real encontrado na linha ${R + 1} (${matches} campos reconhecidos)`)
      return R
    }
  }

  console.warn('⚠️ [findHeaderRow] Cabeçalho não detectado automaticamente, usando linha 0')
  return 0
}

// ── Parseia uma aba, pulando linhas de título ─────────────────
function parseSheet(ws, fabricaId, sheetName, XLSX) {
  console.log(`\n🔍 [parseSheet] Aba="${sheetName}" | fábrica="${fabricaId}"`)

  const headerRow = findHeaderRow(ws, XLSX)

  // Lê o JSON a partir da linha do cabeçalho real
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '', header: 0, range: headerRow })

  console.log(`📊 [parseSheet] Linhas lidas a partir da linha ${headerRow + 1}: ${rows.length}`)

  if (!rows || rows.length === 0) {
    console.warn(`⚠️ [parseSheet] Nenhuma linha após o cabeçalho`)
    return []
  }

  const sample = rows[0]
  const allCols = Object.keys(sample)
  console.log(`📊 [parseSheet] Colunas detectadas (${allCols.length}):`, allCols)
  console.log(`📊 [parseSheet] Colunas normalizadas:`, allCols.map(c => `"${norm(c)}"`))
  console.log(`📊 [parseSheet] Primeira linha de dados (raw):`, sample)

  const imageCols = allCols.filter(isImageCol)
  console.log(`🖼️  [parseSheet] Colunas de imagem:`, imageCols)

  const extraCols = allCols.filter(col => {
    const n = norm(col)
    return !CAMPOS_RESERVADOS.has(n) && !isImageCol(col)
  })
  console.log(`➕ [parseSheet] Colunas extras:`, extraCols)

  // Testa detecção de campos no primeiro row
  const testeRef   = getCol(sample, 'referencia', 'referência', 'ref', 'código', 'codigo', 'code')
  const testeNome  = getCol(sample, 'nome', 'name', 'produto', 'product', 'nome do produto', 'descrição', 'descricao', 'description')
  const testePreco = getCol(sample, 'preco', 'preço', 'price', 'valor', 'value', 'preco_unitario', 'preço unitário', 'preço unit. (rs)', 'preco unit. (rs)', 'preço unit', 'preco unit')
  const testeCx    = getCol(sample, 'cxmestre', 'cx_mestre', 'cx mestre', 'cx mestre (un)', 'caixamestre', 'caixa', 'cx', 'qtd_cx', 'qtd cx', 'quantidade_cx')
  const testeCat   = getCol(sample, 'categoria', 'category', 'grupo', 'group', 'tipo', 'type')

  console.log(`🧪 [parseSheet] Detecção de campos na 1ª linha de dados:`)
  console.log(`   referencia → ${testeRef  !== undefined ? `✅ "${testeRef}"`  : '❌ NÃO ENCONTRADO'}`)
  console.log(`   nome       → ${testeNome !== undefined ? `✅ "${testeNome}"` : '❌ NÃO ENCONTRADO'}`)
  console.log(`   preco      → ${testePreco!== undefined ? `✅ "${testePreco}"`:'❌ NÃO ENCONTRADO'}`)
  console.log(`   cxMestre   → ${testeCx   !== undefined ? `✅ "${testeCx}"`   : '❌ NÃO ENCONTRADO'}`)
  console.log(`   categoria  → ${testeCat  !== undefined ? `✅ "${testeCat}"`  : '❌ NÃO ENCONTRADO (usará "Geral")'}`)

  // Filtra linhas não-vazias (ignora rodapé tipo "TOTAL GERAL")
  const linhasValidas = rows.filter(row =>
    Object.values(row).some(v => v !== null && v !== undefined && v !== '')
  )
  console.log(`🔢 [parseSheet] Linhas não-vazias: ${linhasValidas.length} de ${rows.length}`)

  const produtos = linhasValidas
    .map((row, idx) => {
      const referencia = String(
        getCol(row, 'referencia', 'referência', 'ref', 'código', 'codigo', 'code') ?? ''
      ).trim()

      const nome = String(
        getCol(row, 'nome', 'name', 'produto', 'product', 'nome do produto', 'descrição', 'descricao', 'description') ?? ''
      ).trim()

      const preco = toFloat(
        getCol(row, 'preco', 'preço', 'price', 'valor', 'value', 'preco_unitario', 'preço unitário', 'preço unit. (rs)', 'preco unit. (rs)', 'preço unit', 'preco unit')
      )

      const cxMestre = toInt(
        getCol(row, 'cxmestre', 'cx_mestre', 'cx mestre', 'cx mestre (un)', 'caixamestre', 'caixa', 'cx', 'qtd_cx', 'qtd cx', 'quantidade_cx')
      )

      const categoria = String(
        getCol(row, 'categoria', 'category', 'grupo', 'group', 'tipo', 'type') ?? 'Geral'
      ).trim()

      const descricaoBase = String(
        getCol(row, 'descricao', 'descrição', 'description', 'obs', 'observacao', 'observação', 'especificações', 'especificacoes') ?? ''
      ).trim()

      const imagens = imageCols
        .map(col => String(row[col] ?? '').trim())
        .filter(Boolean)

      const extrasTexto = extraCols
        .map(col => {
          const val = row[col]
          if (val === null || val === undefined || val === '') return null
          return `${col}: ${val}`
        })
        .filter(Boolean)

      let descricao = descricaoBase
      if (extrasTexto.length > 0) {
        descricao = descricao
          ? descricao + '\n\n' + extrasTexto.join('\n')
          : extrasTexto.join('\n')
      }

      if (!referencia && !nome) {
        console.warn(`⚠️ [parseSheet] Linha ${idx + 1} descartada (sem ref e sem nome):`, row)
        return null
      }

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

  console.log(`✅ [parseSheet] "${sheetName}" → ${produtos.length} produto(s) parseados`)
  if (produtos.length > 0) console.log(`   Exemplo:`, produtos[0])

  return produtos
}

// ── Carrega um arquivo .xlsx via fetch + SheetJS ─────────────
async function loadXlsx(path) {
  console.log(`\n📥 [loadXlsx] Carregando: "${path}"`)

  let XLSX
  try {
    XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs')
    console.log('✅ [loadXlsx] SheetJS carregado via CDN')
  } catch (err) {
    console.warn('⚠️ [loadXlsx] Falha no CDN, tentando window.XLSX:', err)
    XLSX = window.XLSX
  }

  if (!XLSX) {
    console.error('❌ [loadXlsx] SheetJS não encontrado!')
    return { rows: [], XLSX: null, wb: null }
  }

  let res
  try {
    res = await fetch(path)
  } catch (err) {
    console.error(`❌ [loadXlsx] Erro de rede: "${path}"`, err)
    return { wb: null, XLSX }
  }

  console.log(`🌐 [loadXlsx] HTTP ${res.status} ${res.statusText} → "${path}"`)

  if (!res.ok) {
    console.error(`❌ [loadXlsx] Arquivo não encontrado: "${path}" (HTTP ${res.status})`)
    console.error(`   ➡️ Verifique se o arquivo existe em public/data/fabricas/${path.split('/').pop()}`)
    return { wb: null, XLSX }
  }

  const buf = await res.arrayBuffer()
  console.log(`📄 [loadXlsx] ${path.split('/').pop()}: ${buf.byteLength} bytes`)

  let wb
  try {
    wb = XLSX.read(buf, { type: 'array' })
  } catch (err) {
    console.error(`❌ [loadXlsx] Erro ao parsear xlsx:`, err)
    return { wb: null, XLSX }
  }

  console.log(`📑 [loadXlsx] Abas:`, wb.SheetNames)
  return { wb, XLSX }
}

// ── Estado global ─────────────────────────────────────────────
let _FABRICAS       = []
let _TODOS_PRODUTOS = []
let _loadingPromise = null

// ── Carrega tudo de forma assíncrona ─────────────────────────
export async function loadAllData() {
  if (_loadingPromise) return _loadingPromise

  console.log('\n🚀 [loadAllData] Iniciando...')
  console.log(`🌍 BASE_URL = "${import.meta.env.BASE_URL}"`)

  _loadingPromise = (async () => {
    const base = import.meta.env.BASE_URL ?? '/'

    const fabricasComProdutos = await Promise.all(
      fabricasRaw.map(async fab => {
        console.log(`\n🏭 Fábrica: "${fab.id}" | arquivos: ${JSON.stringify(fab.arquivos)}`)
        const arquivos = fab.arquivos ?? []
        let todosProdutos = []

        for (const arquivo of arquivos) {
          const url = `${base}data/fabricas/${arquivo}`
          console.log(`📂 URL: "${url}"`)
          const { wb, XLSX } = await loadXlsx(url)

          if (!wb) {
            console.error(`❌ Workbook nulo para "${url}", pulando...`)
            continue
          }

          for (const sheetName of wb.SheetNames) {
            const ws = wb.Sheets[sheetName]
            const prods = parseSheet(ws, fab.id, sheetName, XLSX)
            todosProdutos.push(...prods)
          }
        }

        destaquesRaw.forEach(({ fabricaId, referencia }) => {
          if (fabricaId !== fab.id) return
          const prod = todosProdutos.find(p => p.referencia === referencia)
          if (prod) {
            prod.destaque = true
            console.log(`⭐ Destaque: fab="${fabricaId}" ref="${referencia}"`)
          } else {
            console.warn(`⚠️ Destaque NÃO encontrado: fab="${fabricaId}" ref="${referencia}"`)
          }
        })

        console.log(`🏭 "${fab.id}" total: ${todosProdutos.length} produto(s)`)
        return {
          ...fab,
          produtos: todosProdutos,
          categorias: [...new Set(todosProdutos.map(p => p.categoria))],
        }
      })
    )

    _FABRICAS       = fabricasComProdutos
    _TODOS_PRODUTOS = fabricasComProdutos.flatMap(f => f.produtos)

    console.log('\n✅ [loadAllData] CONCLUÍDO!')
    console.log(`   Fábricas: ${_FABRICAS.length}`)
    console.log(`   Total produtos: ${_TODOS_PRODUTOS.length}`)
    _FABRICAS.forEach(f =>
      console.log(`   → "${f.id}": ${f.produtos.length} produto(s) | cats: ${f.categorias.join(', ')}`)
    )
  })()

  return _loadingPromise
}

// ── Getters síncronos ─────────────────────────────────────────
export const getFabricas      = ()                      => _FABRICAS
export const getTodosProdutos = ()                      => _TODOS_PRODUTOS
export const getFabrica       = (id)                    => _FABRICAS.find(f => f.id === id)
export const getProduto       = (fabricaId, referencia) =>
  (_FABRICAS.find(f => f.id === fabricaId)?.produtos ?? [])
    .find(p => p.referencia === referencia) ?? null