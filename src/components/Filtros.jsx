import { useState } from 'react'
import { FABRICAS, TODOS_PRODUTOS } from '../data/index'

function GrupoFiltro({ titulo, children, defaultOpen = true }) {
  const [aberto, setAberto] = useState(defaultOpen)
  return (
    <div className="filter-group">
      <button className="filter-group-header" onClick={() => setAberto(v => !v)}>
        <h4>{titulo}</h4>
        <span className={`filter-chevron ${aberto ? 'aberto' : ''}`}>›</span>
      </button>
      {aberto && <div className="filter-group-body">{children}</div>}
    </div>
  )
}

export default function Filtros({ filtros, setFiltros, categorias = [], ocultarFabricas = false }) {
  const toggle = (key, value) => {
    setFiltros(prev => {
      const arr = prev[key]
      return { ...prev, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] }
    })
  }
  const set = (key, value) => setFiltros(prev => ({ ...prev, [key]: value }))

  const allPrices = TODOS_PRODUTOS.map(p => p.preco)
  const globalMin = Math.floor(Math.min(...allPrices))
  const globalMax = Math.ceil(Math.max(...allPrices))

  const clear = () => setFiltros({ categorias: [], fabricas: [], apenasDestaques: false, precoMin: '', precoMax: '' })

  const hasFilters =
    filtros.categorias.length > 0 || filtros.fabricas.length > 0 ||
    filtros.apenasDestaques || filtros.precoMin !== '' || filtros.precoMax !== ''

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Filtros</h3>
        {hasFilters && <button className="clear-filters" onClick={clear}>Limpar</button>}
      </div>

      <div className="sidebar-scroll">

        {/* Destaques */}
        <GrupoFiltro titulo="Destaques" defaultOpen={false}>
          <label className="filter-label filter-label-toggle">
            <span className="toggle-text">⭐ Apenas destaques</span>
            <div
              className={`toggle-switch ${filtros.apenasDestaques ? 'on' : ''}`}
              onClick={() => set('apenasDestaques', !filtros.apenasDestaques)}
            >
              <div className="toggle-knob" />
            </div>
          </label>
        </GrupoFiltro>

        {/* Preço */}
        <GrupoFiltro titulo="Preço" defaultOpen={false}>
          <div className="preco-range">
            <div className="preco-input-wrap">
              <span>R$</span>
              <input
                type="number"
                placeholder={globalMin}
                value={filtros.precoMin}
                onChange={e => set('precoMin', e.target.value)}
                min={0}
              />
            </div>
            <span className="preco-sep">–</span>
            <div className="preco-input-wrap">
              <span>R$</span>
              <input
                type="number"
                placeholder={globalMax}
                value={filtros.precoMax}
                onChange={e => set('precoMax', e.target.value)}
                min={0}
              />
            </div>
          </div>
        </GrupoFiltro>

        {/* Categorias */}
        {categorias.length > 0 && (
          <GrupoFiltro titulo="Categoria" defaultOpen={false}>
            {categorias.map(cat => (
              <label key={cat} className="filter-label">
                <input
                  type="checkbox"
                  checked={filtros.categorias.includes(cat)}
                  onChange={() => toggle('categorias', cat)}
                />
                <span>{cat}</span>
              </label>
            ))}
          </GrupoFiltro>
        )}

        {/* Fábricas */}
        {!ocultarFabricas && (
          <GrupoFiltro titulo="Fábrica" defaultOpen={false}>
            {FABRICAS.map(fab => (
              <label key={fab.id} className="filter-label">
                <input
                  type="checkbox"
                  checked={filtros.fabricas.includes(fab.id)}
                  onChange={() => toggle('fabricas', fab.id)}
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <img src={fab.logo} alt={fab.nome} style={{ width: 22, height: 15, objectFit: 'contain' }} />
                  {fab.nome}
                </span>
              </label>
            ))}
          </GrupoFiltro>
        )}

      </div>
    </aside>
  )
}
