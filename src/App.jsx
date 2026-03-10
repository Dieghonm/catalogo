import { useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context'
import Header from './components/Header'
import Home from './pages/Home'
import Catalogo from './pages/Catalogo'
import Produto from './pages/Produto'
import Carrinho from './pages/Carrinho'
import Checkout from './pages/Checkout'
import './styles/index.css'

export default function App() {
  const [search, setSearch] = useState('')

  return (
    <CartProvider>
      <HashRouter>
        <Header search={search} setSearch={setSearch} />
        <div className="app-body">
          <Routes>
            <Route path="/"                         element={<Home />} />
            <Route path="/catalogo"                 element={<Catalogo search={search} />} />
            <Route path="/fabrica/:fabricaId"       element={<Catalogo search={search} />} />
            <Route path="/produto/:fabricaId/:referencia" element={<Produto />} />
            <Route path="/carrinho"                 element={<Carrinho />} />
            <Route path="/checkout"                 element={<Checkout />} />
          </Routes>
        </div>
      </HashRouter>
    </CartProvider>
  )
}
