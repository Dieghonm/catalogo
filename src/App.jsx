import { useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { CartProvider, DataProvider, useData } from './context'
import Header from './components/Header'
import Home from './pages/Home'
import Catalogo from './pages/Catalogo'
import Produto from './pages/Produto'
import Carrinho from './pages/Carrinho'
import Checkout from './pages/Checkout'
import './styles/index.css'

// Tela de loading/erro enquanto os xlsx carregam
function AppShell({ children }) {
  const { status, error } = useData()

  if (status === 'loading') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', gap: '16px',
        fontFamily: 'var(--font-body, sans-serif)',
        color: 'var(--ink2, #666)',
      }}>
        <div style={{
          width: 48, height: 48,
          border: '4px solid #eee',
          borderTopColor: 'var(--accent, #D4572A)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ margin: 0 }}>Carregando catálogo…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', gap: '12px', padding: '24px',
        fontFamily: 'var(--font-body, sans-serif)',
        color: '#c00',
      }}>
        <h2 style={{ margin: 0 }}>Erro ao carregar dados</h2>
        <p style={{ margin: 0, color: '#666', textAlign: 'center' }}>
          Verifique se os arquivos .xlsx estão em <code>public/data/fabricas/</code>
        </p>
        {error && (
          <pre style={{
            background: '#fff3f3', border: '1px solid #fcc',
            padding: '12px', borderRadius: '8px',
            fontSize: '0.8rem', maxWidth: '600px', overflowX: 'auto',
          }}>{error}</pre>
        )}
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 20px', borderRadius: '8px',
            background: '#D4572A', color: '#fff',
            border: 'none', cursor: 'pointer', fontSize: '0.95rem',
          }}
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return children
}

function AppRoutes() {
  const [search, setSearch] = useState('')
  return (
    <HashRouter>
      <Header search={search} setSearch={setSearch} />
      <div className="app-body">
        <Routes>
          <Route path="/"                                   element={<Home />} />
          <Route path="/catalogo"                           element={<Catalogo search={search} />} />
          <Route path="/fabrica/:fabricaId"                 element={<Catalogo search={search} />} />
          <Route path="/produto/:fabricaId/:referencia"     element={<Produto />} />
          <Route path="/carrinho"                           element={<Carrinho />} />
          <Route path="/checkout"                           element={<Checkout />} />
        </Routes>
      </div>
    </HashRouter>
  )
}

export default function App() {
  return (
    <DataProvider>
      <CartProvider>
        <AppShell>
          <AppRoutes />
        </AppShell>
      </CartProvider>
    </DataProvider>
  )
}