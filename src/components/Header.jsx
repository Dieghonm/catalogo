import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context'

export default function Header({ search, setSearch }) {
  const { count } = useCart()
  const navigate = useNavigate()

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo" title="Início">
          <svg className="home-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
            <polyline points="9 21 9 12 15 12 15 21"/>
          </svg>
        </Link>

        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar produtos, referências..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        <nav className="header-nav">
          <Link to="/catalogo" className="nav-link">Catálogo</Link>
          <button className="cart-btn" onClick={() => navigate('/carrinho')}>
            🛒
            {count > 0 && <span className="cart-badge">{count}</span>}
          </button>
        </nav>
      </div>
    </header>
  )
}
