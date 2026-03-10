import { Link } from 'react-router-dom'
import { useCart } from '../context'
import { getFabrica } from '../data/index'

export default function ProdutoCard({ produto }) {
  const { add, itensFabrica } = useCart()
  const fab = getFabrica(produto.fabricaId)
  const itens = itensFabrica(produto.fabricaId)
  const noCart = itens.find(i => i.referencia === produto.referencia)

  return (
    <div className="card" style={{ '--fab-cor': fab?.cor || '#D4572A' }}>
      {produto.destaque && <span className="badge-destaque">★ Destaque</span>}
      <Link to={`/produto/${produto.fabricaId}/${produto.referencia}`}>
        <div className="card-img-wrap">
          <img src={produto.imagem} alt={produto.nome} loading="lazy" />
        </div>
      </Link>
      <div className="card-body">
        <div className="card-meta-row">
          <span className="card-cat">{produto.categoria}</span>
          {produto.tamanho && <span className="card-tam">{produto.tamanho}</span>}
        </div>
        <Link to={`/produto/${produto.fabricaId}/${produto.referencia}`}>
          <h3 className="card-title">{produto.nome}</h3>
        </Link>
        <p className="card-ref"><code>{produto.referencia}</code> · CX {produto.cxMestre}</p>
        <p className="card-desc">{produto.descricao}</p>
        <div className="card-footer">
          <span className="card-price">
            R$ {produto.preco.toFixed(2).replace('.', ',')}
          </span>
          <button
            className={`btn-add ${noCart ? 'in-cart' : ''}`}
            onClick={() => add(produto)}
            style={noCart ? { background: '#2D7A5F' } : { background: fab?.cor }}
          >
            {noCart ? `✓ ${noCart.qty} un.` : '+ Adicionar'}
          </button>
        </div>
      </div>
    </div>
  )
}
