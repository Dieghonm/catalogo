import { Link, useNavigate } from 'react-router-dom'
import { useCart, useData } from '../context'

export default function Carrinho() {
  const navigate = useNavigate()
  const { items, remove, updateQty, total, clear, itensFabrica, subtotalFabrica } = useCart()
  const { FABRICAS } = useData()

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
                <div className="carrinho-grupo-header" style={{ '--fab-cor': fab.cor }}>
                  <img src={fab.logo} alt={fab.nome} className="grupo-logo" />
                  <span className="grupo-nome">{fab.nome}</span>
                  <span className="grupo-subtotal">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>

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
                        R$ {item.preco.toFixed(2).replace('.', ',')} / un.
                      </p>
                    </div>
                    <div className="item-qty-ctrl">
                      <button onClick={() => updateQty(fab.id, item.referencia, item.qty - (item.cxMestre || 1))}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(fab.id, item.referencia, item.qty + (item.cxMestre || 1))}>+</button>
                    </div>
                    <div className="item-subtotal">
                      R$ {(item.preco * item.qty).toFixed(2).replace('.', ',')}
                    </div>
                    <button className="item-remove" onClick={() => remove(fab.id, item.referencia)}>✕</button>
                  </div>
                ))}

                <div className={`pedido-minimo-bar ${ok ? 'ok' : 'pendente'}`}>
                  {ok ? (
                    <span>✓ Pedido mínimo atingido</span>
                  ) : (
                    <span>
                      Falta R$ {falta.toFixed(2).replace('.', ',')} para o pedido mínimo de R$ {fab.pedidoMinimo.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </div>

                <div className="carrinho-grupo-footer">
                  <button
                    className="btn-checkout"
                    disabled={!ok}
                    style={{ background: ok ? fab.cor : undefined }}
                    onClick={() => navigate(`/checkout?fabrica=${fab.id}`)}
                  >
                    Fechar pedido {fab.nome}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <aside className="carrinho-resumo">
          <h3>Resumo</h3>
          <p>{totalItens} item{totalItens !== 1 ? 's' : ''}</p>
          <div className="resumo-total">
            <span>Total</span>
            <strong>R$ {total.toFixed(2).replace('.', ',')}</strong>
          </div>
          <Link to="/" className="btn-continuar">← Continuar comprando</Link>
        </aside>
      </div>
    </div>
  )
}