import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getFabrica } from '../data/index'
import { useCart } from '../context'

export default function Produto() {
  const { fabricaId, referencia } = useParams()
  const navigate = useNavigate()
  const fab = getFabrica(fabricaId)
  const produto = fab?.produtos.find(p => p.referencia === referencia)
  const { add, updateQty, itensFabrica } = useCart()
  const [imgAtiva, setImgAtiva] = useState(0)

  if (!produto || !fab) {
    return (
      <div className="not-found">
        <h2>Produto não encontrado 😕</h2>
        <Link to="/" className="btn-voltar">← Voltar</Link>
      </div>
    )
  }

  const imagens = produto.imagens?.length ? produto.imagens : [produto.imagem]
  const itens  = itensFabrica(fabricaId)
  const noCart = itens.find(i => i.referencia === referencia)
  const step   = produto.cxMestre || 1

  const relacionados = fab.produtos
    .filter(p => p.categoria === produto.categoria && p.referencia !== produto.referencia)
    .slice(0, 4)

  return (
    <div className="produto-page">
      <Link to={`/fabrica/${fabricaId}`} className="btn-voltar">← {fab.nome}</Link>

      <div className="produto-detail">
        {/* ── GALERIA ─────────────────────────────── */}
        <div className="produto-galeria">
          <div className="galeria-main">
            {produto.destaque && <span className="badge-destaque">★ Destaque</span>}
            <img
              key={imgAtiva}
              src={imagens[imgAtiva]}
              alt={produto.nome}
              className="galeria-main-img"
            />
          </div>
          {imagens.length > 1 && (
            <div className="galeria-thumbs">
              {imagens.map((src, i) => (
                <button
                  key={i}
                  className={`galeria-thumb ${i === imgAtiva ? 'ativa' : ''}`}
                  onClick={() => setImgAtiva(i)}
                  style={{ '--fab-cor': fab.cor }}
                >
                  <img src={src} alt={`${produto.nome} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── INFO ─────────────────────────────────── */}
        <div className="produto-info">
          <div className="produto-chips">
            <span className="chip">{produto.categoria}</span>
            {produto.tamanho && <span className="chip chip-gray">{produto.tamanho}</span>}
            {produto.destaque && <span className="chip chip-destaque">⭐ Destaque</span>}
          </div>

          <h1>{produto.nome}</h1>

          <div className="produto-refs">
            <span>Ref: <code>{produto.referencia}</code></span>
            <span>CX Mestre: <strong>{produto.cxMestre}</strong></span>
          </div>

          <div className="produto-fab-inline">
            <img src={fab.logo} alt={fab.nome} className="produto-fab-logo" />
            <span style={{ color: fab.cor }}>{fab.nome}</span>
          </div>

          <p className="produto-desc" style={{ whiteSpace: 'pre-line' }}>{produto.descricao}</p>

          <div className="produto-preco">
            R$ {produto.preco.toFixed(2).replace('.', ',')}
          </div>

          <p className="produto-cx-hint">
            Mínimo: {step} unidade{step > 1 ? 's' : ''} · múltiplos de {step}
          </p>

          {/* ── Controles do carrinho ──────────────── */}
          {noCart ? (
            <div className="produto-cart-controls">
              {/* Quantidade separada */}
              <div className="produto-qty-row">
                <span className="produto-qty-label">Quantidade</span>
                <div className="produto-qty-ctrl">
                  <button
                    onClick={() => updateQty(fabricaId, referencia, noCart.qty - step)}
                    className="qty-btn"
                  >−</button>
                  <span className="qty-value">{noCart.qty}</span>
                  <button
                    onClick={() => updateQty(fabricaId, referencia, noCart.qty + step)}
                    className="qty-btn"
                  >+</button>
                </div>
              </div>

              {/* Botão adicionar mais */}
              <button
                className="btn-add large in-cart"
                onClick={() => add(produto)}
                style={{ background: '#2D7A5F' }}
              >
                + Adicionar mais
              </button>

              {/* Ver carrinho */}
              <Link to="/carrinho" className="link-carrinho">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                Ver carrinho
              </Link>
            </div>
          ) : (
            <button
              className="btn-add large"
              onClick={() => add(produto)}
              style={{ background: fab.cor }}
            >
              🛒 Adicionar ao carrinho
            </button>
          )}

          {/* Continuar comprando */}
          <button
            className="btn-continuar-comprando"
            onClick={() => navigate(-1)}
          >
            ← Continuar comprando
          </button>
        </div>
      </div>

      {/* ── RELACIONADOS ─────────────────────────── */}
      {relacionados.length > 0 && (
        <section className="relacionados">
          <h2>Mais de {produto.categoria}</h2>
          <div className="grid mini">
            {relacionados.map(p => (
              <Link key={p.referencia} to={`/produto/${fabricaId}/${p.referencia}`} className="mini-card">
                <img src={p.imagem} alt={p.nome} />
                <div>
                  <p>{p.nome}</p>
                  <code style={{ fontSize: '0.72rem', color: '#888' }}>{p.referencia}</code>
                  <br />
                  <strong>R$ {p.preco.toFixed(2).replace('.', ',')}</strong>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
