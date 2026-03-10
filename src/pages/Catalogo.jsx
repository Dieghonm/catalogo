import { useState, useMemo } from 'react'
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import { TODOS_PRODUTOS, FABRICAS, getFabrica } from '../data/index'
import ProdutoCard from '../components/ProdutoCard'
import Filtros from '../components/Filtros'

const FILTROS_INIT = { categorias: [], fabricas: [], apenasDestaques: false, precoMin: '', precoMax: '' }

export default function Catalogo({ search }) {
  const { fabricaId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const categoriaParam = new URLSearchParams(location.search).get('categoria')
  const [filtros, setFiltros] = useState(() => ({
    ...FILTROS_INIT,
    categorias: categoriaParam ? [categoriaParam] : [],
  }))

  const fabricaAtiva = fabricaId ? getFabrica(fabricaId) : null
  const categorias = fabricaAtiva
    ? [...new Set(fabricaAtiva.produtos.map(p => p.categoria))]
    : [...new Set(TODOS_PRODUTOS.map(p => p.categoria))]

  const produtos = useMemo(() => {
    const fonte = fabricaAtiva ? fabricaAtiva.produtos : TODOS_PRODUTOS
    return fonte.filter(p => {
      if (search) {
        const q = search.toLowerCase()
        if (!p.nome.toLowerCase().includes(q) &&
            !p.descricao.toLowerCase().includes(q) &&
            !p.referencia.toLowerCase().includes(q)) return false
      }
      if (filtros.categorias.length && !filtros.categorias.includes(p.categoria)) return false
      if (filtros.fabricas.length && !filtros.fabricas.includes(p.fabricaId)) return false
      if (filtros.apenasDestaques && !p.destaque) return false
      if (filtros.precoMin !== '' && p.preco < Number(filtros.precoMin)) return false
      if (filtros.precoMax !== '' && p.preco > Number(filtros.precoMax)) return false
      return true
    })
  }, [search, filtros, fabricaAtiva])

  const activeCount = [
    filtros.categorias.length,
    filtros.fabricas.length,
    filtros.apenasDestaques ? 1 : 0,
    filtros.precoMin || filtros.precoMax ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  return (
    <div className="page-catalogo">
      {fabricaAtiva ? (
        <div className="fabrica-header" style={{ '--fab-cor': fabricaAtiva.cor }}>
          <Link to="/" className="btn-voltar">← Voltar</Link>
          <div className="fabrica-header-inner">
            <img src={fabricaAtiva.logo} alt={fabricaAtiva.nome} className="fab-header-logo" />
            <div>
              <p className="fabrica-header-sub">Catálogo da</p>
              <h1>{fabricaAtiva.nome}</h1>
              <p className="fabrica-header-count">
                {produtos.length} produto{produtos.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="catalogo-topo">
          <h1>Catálogo Completo</h1>
          <p>{produtos.length} produto{produtos.length !== 1 ? 's' : ''} encontrado{produtos.length !== 1 ? 's' : ''}</p>
        </div>
      )}

      <div className="catalog-layout">
        <Filtros
          filtros={filtros}
          setFiltros={setFiltros}
          categorias={categorias}
          ocultarFabricas={!!fabricaAtiva}
        />
        <main>
          {(search || activeCount > 0) && (
            <div className="search-bar-result">
              {search && (
                <p className="search-info">
                  {produtos.length} resultado{produtos.length !== 1 ? 's' : ''} para <strong>"{search}"</strong>
                </p>
              )}
              {activeCount > 0 && (
                <span className="active-filters-badge">{activeCount} filtro{activeCount > 1 ? 's' : ''} ativo{activeCount > 1 ? 's' : ''}</span>
              )}
            </div>
          )}
          {produtos.length === 0 ? (
            <div className="empty">
              <p>😕 Nenhum produto encontrado.</p>
              <p>Tente ajustar os filtros ou a busca.</p>
            </div>
          ) : (
            <div className="grid">
              {produtos.map(p => (
                <ProdutoCard key={`${p.fabricaId}-${p.referencia}`} produto={p} />
              ))}
            </div>
          )}

          {/* Botões de navegação ao final */}
          <div className="catalogo-bottom-nav">
            <Link to="/" className="bottom-nav-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><polyline points="9 21 9 12 15 12 15 21"/></svg>
              Página inicial
            </Link>
            <Link to="/carrinho" className="bottom-nav-btn bottom-nav-btn-accent">
              🛒 Ver carrinho
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}
