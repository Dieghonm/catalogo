import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart, useData } from '../context'
import GerarPedidoPDF from '../components/GerarPedidoPDF'

// ─── Etapa 1: Conferência do pedido ─────────────────────────
function ConferenciaPedido({ fabrica, itens, subtotal, onProsseguir, onVoltar }) {
  return (
    <div className="checkout-step">
      <div className="checkout-fab-header" style={{ '--fab-cor': fabrica.cor }}>
        <img src={fabrica.logo} alt={fabrica.nome} className="checkout-fab-logo" />
        <div>
          <p className="checkout-fab-sub">Conferência do pedido</p>
          <h2>{fabrica.nome}</h2>
        </div>
      </div>

      <div className="checkout-table-wrap">
        <table className="checkout-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Ref.</th>
              <th>Tam.</th>
              <th>CX</th>
              <th>Qtd.</th>
              <th>Preço unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {itens.map(item => (
              <tr key={item.referencia}>
                <td>{item.nome}</td>
                <td><code>{item.referencia}</code></td>
                <td>{item.tamanho}</td>
                <td>{item.cxMestre}</td>
                <td><strong>{item.qty}</strong></td>
                <td>R$ {item.preco.toFixed(2).replace('.', ',')}</td>
                <td><strong>R$ {(item.preco * item.qty).toFixed(2).replace('.', ',')}</strong></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="6" className="total-label">Total do pedido</td>
              <td className="total-value">R$ {subtotal.toFixed(2).replace('.', ',')}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="checkout-actions">
        <button className="btn-voltar-checkout" onClick={onVoltar}>← Voltar ao carrinho</button>
        <button className="btn-prosseguir" onClick={onProsseguir}>
          Prosseguir →
        </button>
      </div>
    </div>
  )
}

// ─── Etapa 2: Dados do cliente ───────────────────────────────
function DadosCliente({ fabrica, onProsseguir, onVoltar }) {
  const [dados, setDados] = useState({
    nome: '', empresa: '', cnpj: '', telefone: '', email: '', endereco: '', cidade: '', estado: '', cep: '', obs: ''
  })

  const set = (k, v) => setDados(prev => ({ ...prev, [k]: v }))
  const valido = dados.nome && dados.empresa && dados.telefone

  return (
    <div className="checkout-step">
      <div className="checkout-fab-header" style={{ '--fab-cor': fabrica.cor }}>
        <img src={fabrica.logo} alt={fabrica.nome} className="checkout-fab-logo" />
        <div>
          <p className="checkout-fab-sub">Dados do cliente</p>
          <h2>{fabrica.nome}</h2>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group full">
          <label>Nome completo *</label>
          <input value={dados.nome} onChange={e => set('nome', e.target.value)} placeholder="João da Silva" />
        </div>
        <div className="form-group">
          <label>Empresa *</label>
          <input value={dados.empresa} onChange={e => set('empresa', e.target.value)} placeholder="Loja XYZ" />
        </div>
        <div className="form-group">
          <label>CNPJ</label>
          <input value={dados.cnpj} onChange={e => set('cnpj', e.target.value)} placeholder="00.000.000/0001-00" />
        </div>
        <div className="form-group">
          <label>Telefone / WhatsApp *</label>
          <input value={dados.telefone} onChange={e => set('telefone', e.target.value)} placeholder="(11) 99999-9999" />
        </div>
        <div className="form-group">
          <label>E-mail</label>
          <input value={dados.email} onChange={e => set('email', e.target.value)} placeholder="joao@loja.com.br" />
        </div>
        <div className="form-group full">
          <label>Endereço</label>
          <input value={dados.endereco} onChange={e => set('endereco', e.target.value)} placeholder="Rua das Flores, 123" />
        </div>
        <div className="form-group">
          <label>Cidade</label>
          <input value={dados.cidade} onChange={e => set('cidade', e.target.value)} placeholder="São Paulo" />
        </div>
        <div className="form-group">
          <label>Estado</label>
          <input value={dados.estado} onChange={e => set('estado', e.target.value)} placeholder="SP" maxLength={2} />
        </div>
        <div className="form-group">
          <label>CEP</label>
          <input value={dados.cep} onChange={e => set('cep', e.target.value)} placeholder="00000-000" />
        </div>
        <div className="form-group full">
          <label>Observações</label>
          <textarea value={dados.obs} onChange={e => set('obs', e.target.value)} placeholder="Informações adicionais para o pedido..." rows={3} />
        </div>
      </div>

      <div className="checkout-actions">
        <button className="btn-voltar-checkout" onClick={onVoltar}>← Voltar</button>
        <button
          className="btn-prosseguir"
          onClick={() => valido && onProsseguir(dados)}
          disabled={!valido}
          title={!valido ? 'Preencha os campos obrigatórios (*)' : ''}
        >
          Gerar PDF do pedido →
        </button>
      </div>
    </div>
  )
}

// ─── Componente principal de Checkout ───────────────────────
export default function Checkout() {
  const navigate = useNavigate()
  const { itensFabrica, subtotalFabrica, clearFabrica } = useCart()
  const { getFabrica } = useData()
  const [etapa, setEtapa]           = useState(1)
  const [dadosCliente, setDadosCliente] = useState(null)

  const params = new URLSearchParams(window.location.hash.split('?')[1] ?? '')
  const fabAtiva = params.get('fabrica')

  const fabrica  = fabAtiva ? getFabrica(fabAtiva) : null
  const itens    = fabAtiva ? itensFabrica(fabAtiva) : []
  const subtotal = fabAtiva ? subtotalFabrica(fabAtiva) : 0

  const irParaPDF = (dados) => {
    setDadosCliente(dados)
    setEtapa(3)
  }

  const finalizarPedido = () => {
    clearFabrica(fabAtiva)
    navigate('/carrinho')
  }

  if (!fabrica || itens.length === 0) {
    return (
      <div className="carrinho-vazio">
        <div className="empty-icon">📋</div>
        <h2>Nenhum pedido para finalizar</h2>
        <p>Volte ao carrinho e selecione uma fábrica para prosseguir.</p>
        <Link to="/carrinho" className="btn-voltar">← Ir ao carrinho</Link>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="etapas-bar">
        <div className={`etapa ${etapa >= 1 ? 'ativa' : ''} ${etapa > 1 ? 'concluida' : ''}`}>
          <span>1</span> Conferência
        </div>
        <div className="etapa-linha" />
        <div className={`etapa ${etapa >= 2 ? 'ativa' : ''} ${etapa > 2 ? 'concluida' : ''}`}>
          <span>2</span> Seus dados
        </div>
        <div className="etapa-linha" />
        <div className={`etapa ${etapa >= 3 ? 'ativa' : ''}`}>
          <span>3</span> PDF
        </div>
      </div>

      {etapa === 1 && (
        <ConferenciaPedido
          fabrica={fabrica}
          itens={itens}
          subtotal={subtotal}
          onProsseguir={() => setEtapa(2)}
          onVoltar={() => navigate('/carrinho')}
        />
      )}

      {etapa === 2 && (
        <DadosCliente
          fabrica={fabrica}
          onProsseguir={irParaPDF}
          onVoltar={() => setEtapa(1)}
        />
      )}

      {etapa === 3 && dadosCliente && (
        <GerarPedidoPDF
          fabrica={fabrica}
          itens={itens}
          subtotal={subtotal}
          cliente={dadosCliente}
          onFinalizar={finalizarPedido}
          onVoltar={() => setEtapa(2)}
        />
      )}
    </div>
  )
}