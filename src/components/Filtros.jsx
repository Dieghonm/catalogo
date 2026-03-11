import { useState } from 'react'
import { useData } from '../context'

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
  const { FABRICAS, TODOS_PRODUTOS } = useData()

  const toggle = (key, value) => {
    setFiltros(prev => {
      const arr = prev[key]
      return { ...prev, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] }
    })
  }
  const set = (key, value) => setFiltros(prev => ({ ...prev, [key]: value }))

  const allPrices = TODOS_PRODUTOS.map(p => p.preco).filter(v => v > 0)
  const globalMin = allPrices.length ? Math.floor(Math.min(...allPrices)) : 0
  const globalMax = allPrices.length ? Math.ceil(Math.max(...allPrices)) : 9999

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
              className={`toggle-switch ${filtros.apenasDestaques ? 'on' : 'off'}`}
              onClick={() => set('apenasDestaques', !filtros.apenasDestaques)}
            >
              <div className="toggle-knob" />
            </div>
          </label>
        </GrupoFiltro>

        {/* Categorias */}
        {categorias.length > 0 && (
          <GrupoFiltro titulo="Categorias">
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
        {!ocultarFabricas && FABRICAS.length > 0 && (
          <GrupoFiltro titulo="Fábricas" defaultOpen={false}>
            {FABRICAS.map(fab => (
              <label key={fab.id} className="filter-label">
                <input
                  type="checkbox"
                  checked={filtros.fabricas.includes(fab.id)}
                  onChange={() => toggle('fabricas', fab.id)}
                />
                <span>{fab.nome}</span>
              </label>
            ))}
          </GrupoFiltro>
        )}

        {/* Preço */}
        <GrupoFiltro titulo="Preço" defaultOpen={false}>
          <p className="filter-price-range">R$ {globalMin} — R$ {globalMax}</p>
          <div className="filter-price-inputs">
            <input
              type="number"
              placeholder="Mín"
              value={filtros.precoMin}
              onChange={e => set('precoMin', e.target.value)}
              className="price-input"
              min={globalMin}
              max={globalMax}
            />
            <span>—</span>
            <input
              type="number"
              placeholder="Máx"
              value={filtros.precoMax}
              onChange={e => set('precoMax', e.target.value)}
              className="price-input"
              min={globalMin}
              max={globalMax}
            />
          </div>
        </GrupoFiltro>

      </div>
    </aside>
  )
}