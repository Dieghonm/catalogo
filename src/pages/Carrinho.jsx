import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context'
import { FABRICAS } from '../data/index'

export default function Carrinho() {
  const navigate = useNavigate()
  const { items, remove, updateQty, total, clear, itensFabrica, subtotalFabrica } = useCart()

  if (items.length === 0) {
    return (
      <div className="carrinho-vazio">
        <div className="empty-icon">🛒</div>
        <h2>Seu carrinho está vazio</h2>
        <p>Adicione produtos para continuar.</p>
        <Link to="/" className="btn-voltar">← Ver fábricas</Link>
      </div>
    )
  }

  // Apenas as fábricas que têm itens no carrinho
  const fabricasComItens = FABRICAS.filter(f => itensFabrica(f.id).length > 0)
  const totalItens = items.reduce((s, i) => s + i.qty, 0)

  return (
    <div className="carrinho-page">
      <div className="carrinho-header">
        <h1>Carrinho</h1>
        <button className="clear-filters" onClick={clear}>Limpar tudo</button>
      </div>

      <div className="carrinho-layout">
        <div className="carrinho-items">
          {fabricasComItens.map(fab => {
            const itens    = itensFabrica(fab.id)
            const subtotal = subtotalFabrica(fab.id)
            const falta    = Math.max(0, fab.pedidoMinimo - subtotal)
            const ok       = subtotal >= fab.pedidoMinimo

            return (
              <div key={fab.id} className="carrinho-grupo">
                {/* Header da fábrica */}
                <div className="carrinho-grupo-header" style={{ '--fab-cor': fab.cor }}>
                  <img src={fab.logo} alt={fab.nome} className="grupo-logo" />
                  <span className="grupo-nome">{fab.nome}</span>
                  <span className="grupo-subtotal">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {/* Itens */}
                {itens.map(item => (
                  <div key={item.referencia} className="carrinho-item">
                    <img src={item.imagem} alt={item.nome} />
                    <div className="item-info">
                      <Link to={`/produto/${fab.id}/${item.referencia}`} className="item-nome">
                        {item.nome}
                      </Link>
                      <p className="item-ref">
                        <code>{item.referencia}</code>
                        {item.tamanho && <span> · {item.tamanho}</span>}
                      </p>
                      <p className="item-preco-unit">
                        R$ {item.preco.toFixed(2).replace('.', ',')} · CX {item.cxMestre}
                      </p>
                    </div>
                    <div className="item-qty">
                      <button onClick={() => updateQty(fab.id, item.referencia, item.qty - item.cxMestre)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(fab.id, item.referencia, item.qty + item.cxMestre)}>+</button>
                    </div>
                    <div className="item-subtotal">
                      R$ {(item.preco * item.qty).toFixed(2).replace('.', ',')}
                    </div>
                    <button className="item-remove" onClick={() => remove(fab.id, item.referencia)}>✕</button>
                  </div>
                ))}

                {/* Barra de pedido mínimo + botão finalizar */}
                <div className="grupo-footer" style={{ '--fab-cor': fab.cor }}>
                  <div className="pedido-minimo-wrap">
                    <div className="pedido-minimo-barra">
                      <div
                        className="pedido-minimo-fill"
                        style={{
                          width: `${Math.min(100, (subtotal / fab.pedidoMinimo) * 100)}%`,
                          background: ok ? '#2D7A5F' : fab.cor
                        }}
                      />
                    </div>
                    {ok ? (
                      <p className="pedido-minimo-ok">✓ Pedido mínimo atingido!</p>
                    ) : (
                      <p className="pedido-minimo-falta">
                        Faltam <strong>R$ {falta.toFixed(2).replace('.', ',')}</strong> para o mínimo
                        de R$ {fab.pedidoMinimo.toFixed(0)}
                      </p>
                    )}
                  </div>
                  <button
                    className="btn-finalizar-fab"
                    style={{ background: ok ? '#2D7A5F' : '#ccc', cursor: ok ? 'pointer' : 'not-allowed' }}
                    disabled={!ok}
                    onClick={() => navigate(`/checkout#?fabrica=${fab.id}`)}
                    title={!ok ? `Pedido mínimo: R$ ${fab.pedidoMinimo}` : `Finalizar pedido ${fab.nome}`}
                  >
                    {ok ? `Finalizar pedido ${fab.nome} →` : `Mínimo R$ ${fab.pedidoMinimo}`}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Resumo lateral */}
        <aside className="carrinho-resumo">
          <h3>Resumo geral</h3>
          {fabricasComItens.map(fab => {
            const sub = subtotalFabrica(fab.id)
            const ok  = sub >= fab.pedidoMinimo
            return (
              <div key={fab.id} className="resumo-linha">
                <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ color: fab.cor }}>{fab.icone}</span> {fab.nome}
                  {!ok && <span className="resumo-alerta">⚠</span>}
                </span>
                <span style={{ color: ok ? 'inherit' : '#c0392b' }}>
                  R$ {sub.toFixed(2).replace('.', ',')}
                </span>
              </div>
            )
          })}
          <hr />
          <div className="resumo-total">
            <span>{totalItens} item{totalItens !== 1 ? 's' : ''}</span>
            <strong>R$ {total.toFixed(2).replace('.', ',')}</strong>
          </div>
          <p className="resumo-hint">Finalize cada fábrica separadamente no bloco acima.</p>
        </aside>
      </div>
    </div>
  )
}
