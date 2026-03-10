// ============================================================
//  DATA LOADER
//  Estrutura dos arquivos de fábrica:
//  {
//    "categorias": [
//      { "nome": "NomeCategoria", "produtos": [ {...}, {...} ] }
//    ]
//  }
//
//  Para ADICIONAR uma fábrica:
//    1. Adicione entrada em fabricas.json
//    2. Crie src/data/fabricas/<id>.json
//    3. Opcionalmente adicione destaques em destaques.json
// ============================================================

import fabricasRaw  from './fabricas.json'
import destaquesRaw from './destaques.json'

const modulosFabricas = import.meta.glob('./fabricas/*.json', { eager: true })

// Monta mapa { fabricaId → [produtos_flat] }
// Achata categorias em lista plana, preservando campo categoria em cada produto
const produtosPorFabrica = {}

for (const [path, mod] of Object.entries(modulosFabricas)) {
  const id = path.replace('./fabricas/', '').replace('.json', '')
  const categorias = mod.default?.categorias ?? []

  const produtosFlat = categorias.flatMap(cat =>
    (cat.produtos ?? []).map(p => ({
      ...p,
      fabricaId: id,
      categoria: cat.nome,
      // normaliza: garante campo imagem (primeira da lista) e imagens
      imagem: p.imagens?.[0] ?? p.imagem ?? '',
      imagens: p.imagens ?? (p.imagem ? [p.imagem] : []),
      destaque: false,
    }))
  )

  produtosPorFabrica[id] = produtosFlat
}

// Injeta flag destaque
destaquesRaw.forEach(({ fabricaId, referencia }) => {
  const lista = produtosPorFabrica[fabricaId]
  if (!lista) return
  const prod = lista.find(p => p.referencia === referencia)
  if (prod) prod.destaque = true
})

export const FABRICAS = fabricasRaw.map(fab => ({
  ...fab,
  produtos: produtosPorFabrica[fab.id] ?? [],
  // categorias como lista de strings para filtros
  categorias: [...new Set((produtosPorFabrica[fab.id] ?? []).map(p => p.categoria))],
}))

export const TODOS_PRODUTOS = FABRICAS.flatMap(f => f.produtos)

export const getFabrica  = (id) => FABRICAS.find(f => f.id === id)
export const getProduto  = (fabricaId, referencia) =>
  (produtosPorFabrica[fabricaId] ?? []).find(p => p.referencia === referencia) ?? null
