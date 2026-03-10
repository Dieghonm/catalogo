import { useEffect, useRef, useState } from 'react'

// Gera o PDF usando jsPDF (carregado via CDN no index.html)
// e html2canvas para capturar a tabela com fidelidade visual

export default function GerarPedidoPDF({ fabrica, itens, subtotal, cliente, onFinalizar, onVoltar }) {
  const previewRef = useRef(null)
  const [gerando, setGerando] = useState(false)
  const [gerado, setGerado] = useState(false)

  const numeroPedido = `${fabrica.id.toUpperCase()}-${Date.now().toString().slice(-6)}`
  const dataHoje = new Date().toLocaleDateString('pt-BR')

  const baixarPDF = async () => {
    setGerando(true)
    try {
      // jsPDF carregado globalmente via CDN
      const { jsPDF } = window.jspdf
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      const W = 210
      const margin = 14
      let y = 0

      // ── Cabeçalho colorido ─────────────────────────────────
      const hexTorgb = hex => {
        const r = parseInt(hex.slice(1,3),16)
        const g = parseInt(hex.slice(3,5),16)
        const b = parseInt(hex.slice(5,7),16)
        return [r, g, b]
      }
      const [r,g,b] = hexTorgb(fabrica.cor)
      doc.setFillColor(r, g, b)
      doc.rect(0, 0, W, 36, 'F')

      // Logo da fábrica (tenta carregar)
      try {
        const img = await loadImageAsBase64(fabrica.logo)
        doc.addImage(img, 'PNG', margin, 6, 40, 22)
      } catch (_) {
        doc.setTextColor(255,255,255)
        doc.setFontSize(18)
        doc.setFont('helvetica','bold')
        doc.text(fabrica.nome, margin, 22)
      }

      // Título direito
      doc.setTextColor(255,255,255)
      doc.setFontSize(11)
      doc.setFont('helvetica','bold')
      doc.text('PEDIDO DE COMPRA', W - margin, 14, { align: 'right' })
      doc.setFontSize(9)
      doc.setFont('helvetica','normal')
      doc.text(`Nº ${numeroPedido}`, W - margin, 20, { align: 'right' })
      doc.text(`Data: ${dataHoje}`, W - margin, 26, { align: 'right' })

      y = 44

      // ── Dados do cliente ────────────────────────────────────
      doc.setTextColor(30,30,30)
      doc.setFillColor(245,242,238)
      doc.rect(margin, y, W - margin*2, 7, 'F')
      doc.setFont('helvetica','bold')
      doc.setFontSize(9)
      doc.text('DADOS DO CLIENTE', margin+2, y+5)
      y += 10

      doc.setFont('helvetica','normal')
      doc.setFontSize(8.5)
      const col1 = margin
      const col2 = W/2
      const campos = [
        ['Nome', cliente.nome,    'Empresa', cliente.empresa],
        ['CNPJ', cliente.cnpj,    'Telefone', cliente.telefone],
        ['E-mail', cliente.email, 'CEP', cliente.cep],
        ['Endereço', cliente.endereco, 'Cidade/UF', `${cliente.cidade}${cliente.estado ? ' - '+cliente.estado : ''}`],
      ]
      campos.forEach(([l1,v1,l2,v2]) => {
        doc.setFont('helvetica','bold')
        doc.text(`${l1}:`, col1, y)
        doc.setFont('helvetica','normal')
        doc.text(v1 || '—', col1 + 22, y)
        doc.setFont('helvetica','bold')
        doc.text(`${l2}:`, col2, y)
        doc.setFont('helvetica','normal')
        doc.text(v2 || '—', col2 + 24, y)
        y += 6
      })
      if (cliente.obs) {
        doc.setFont('helvetica','bold')
        doc.text('Obs:', col1, y)
        doc.setFont('helvetica','normal')
        const lines = doc.splitTextToSize(cliente.obs, W - margin*2 - 20)
        doc.text(lines, col1+14, y)
        y += lines.length * 5
      }
      y += 4

      // ── Tabela de itens ─────────────────────────────────────
      doc.setFillColor(r, g, b)
      doc.rect(margin, y, W - margin*2, 7, 'F')
      doc.setTextColor(255,255,255)
      doc.setFont('helvetica','bold')
      doc.setFontSize(8)

      const cols = { ref:margin, nome:margin+22, tam:margin+88, cx:margin+104, qtd:margin+118, preco:margin+134, sub:margin+155 }
      doc.text('Ref.',      cols.ref+1,  y+5)
      doc.text('Produto',   cols.nome+1, y+5)
      doc.text('Tam.',      cols.tam+1,  y+5)
      doc.text('CX',        cols.cx+1,   y+5)
      doc.text('Qtd.',      cols.qtd+1,  y+5)
      doc.text('Preço un.', cols.preco+1,y+5)
      doc.text('Subtotal',  cols.sub+1,  y+5)
      y += 9

      doc.setTextColor(30,30,30)
      itens.forEach((item, idx) => {
        if (idx % 2 === 0) {
          doc.setFillColor(250,248,245)
          doc.rect(margin, y-4, W-margin*2, 7, 'F')
        }
        doc.setFont('helvetica','bold')
        doc.setFontSize(8)
        doc.text(item.referencia,                              cols.ref+1,  y)
        doc.setFont('helvetica','normal')
        doc.text(item.nome.slice(0,28),                        cols.nome+1, y)
        doc.text(item.tamanho || '—',                          cols.tam+1,  y)
        doc.text(String(item.cxMestre || 1),                   cols.cx+1,   y)
        doc.setFont('helvetica','bold')
        doc.text(String(item.qty),                             cols.qtd+1,  y)
        doc.setFont('helvetica','normal')
        doc.text(`R$ ${item.preco.toFixed(2).replace('.',',')}`, cols.preco+1, y)
        doc.setFont('helvetica','bold')
        doc.text(`R$ ${(item.preco*item.qty).toFixed(2).replace('.',',')}`, cols.sub+1, y)
        y += 7
      })

      // ── Total ────────────────────────────────────────────────
      y += 2
      doc.setFillColor(r, g, b)
      doc.rect(W-margin-55, y-1, 55, 10, 'F')
      doc.setTextColor(255,255,255)
      doc.setFont('helvetica','bold')
      doc.setFontSize(10)
      doc.text('TOTAL', W-margin-52, y+6)
      doc.text(`R$ ${subtotal.toFixed(2).replace('.',',')}`, W-margin-2, y+6, { align:'right' })

      // ── Rodapé ───────────────────────────────────────────────
      doc.setTextColor(160,155,148)
      doc.setFont('helvetica','normal')
      doc.setFontSize(7.5)
      doc.text(
        `Pedido gerado em ${dataHoje} • ${fabrica.nome} • ${numeroPedido}`,
        W/2, 290, { align: 'center' }
      )

      doc.save(`pedido-${fabrica.id}-${numeroPedido}.pdf`)
      setGerado(true)
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
      alert('Erro ao gerar PDF. Verifique o console.')
    } finally {
      setGerando(false)
    }
  }

  return (
    <div className="checkout-step">
      <div className="checkout-fab-header" style={{ '--fab-cor': fabrica.cor }}>
        <img src={fabrica.logo} alt={fabrica.nome} className="checkout-fab-logo" />
        <div>
          <p className="checkout-fab-sub">Pedido pronto!</p>
          <h2>{fabrica.nome}</h2>
        </div>
      </div>

      {/* Preview do pedido */}
      <div className="pdf-preview" ref={previewRef}>
        <div className="pdf-preview-header" style={{ background: fabrica.cor }}>
          <img src={fabrica.logo} alt={fabrica.nome} />
          <div>
            <p>PEDIDO DE COMPRA</p>
            <p>Nº {numeroPedido} — {dataHoje}</p>
          </div>
        </div>

        <div className="pdf-cliente-info">
          <div><strong>Cliente:</strong> {cliente.nome}</div>
          <div><strong>Empresa:</strong> {cliente.empresa}</div>
          {cliente.cnpj    && <div><strong>CNPJ:</strong> {cliente.cnpj}</div>}
          {cliente.telefone && <div><strong>Tel:</strong> {cliente.telefone}</div>}
          {cliente.email   && <div><strong>E-mail:</strong> {cliente.email}</div>}
          {cliente.cidade  && <div><strong>Cidade:</strong> {cliente.cidade}{cliente.estado ? ` - ${cliente.estado}` : ''}</div>}
          {cliente.obs     && <div><strong>Obs:</strong> {cliente.obs}</div>}
        </div>

        <table className="checkout-table">
          <thead>
            <tr>
              <th>Ref.</th>
              <th>Produto</th>
              <th>Tam.</th>
              <th>CX</th>
              <th>Qtd.</th>
              <th>Preço</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {itens.map(item => (
              <tr key={item.referencia}>
                <td><code>{item.referencia}</code></td>
                <td>{item.nome}</td>
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
              <td className="total-value" style={{ color: fabrica.cor }}>
                R$ {subtotal.toFixed(2).replace('.', ',')}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="checkout-actions">
        {!gerado && (
          <button className="btn-voltar-checkout" onClick={onVoltar}>← Editar dados</button>
        )}
        {!gerado ? (
          <button className="btn-prosseguir" onClick={baixarPDF} disabled={gerando}>
            {gerando ? 'Gerando PDF...' : '⬇ Baixar PDF do pedido'}
          </button>
        ) : (
          <button className="btn-finalizar-ok" onClick={onFinalizar}>
            ✓ Pedido concluído — voltar ao carrinho
          </button>
        )}
      </div>
    </div>
  )
}

// Helper: carrega imagem como base64 para o jsPDF
async function loadImageAsBase64(url) {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
