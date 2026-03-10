import { createContext, useContext, useReducer } from 'react'

const CartContext = createContext(null)

// qty sempre deve ser múltiplo de cxMestre
function snapQty(qty, cxMestre) {
  if (!cxMestre || cxMestre <= 1) return Math.max(1, qty)
  return Math.max(cxMestre, Math.round(qty / cxMestre) * cxMestre)
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const p = action.product
      const step = p.cxMestre || 1
      const exists = state.find(i => i.fabricaId === p.fabricaId && i.referencia === p.referencia)
      if (exists) {
        return state.map(i =>
          i.fabricaId === p.fabricaId && i.referencia === p.referencia
            ? { ...i, qty: i.qty + step }
            : i
        )
      }
      return [...state, { ...p, qty: step }]
    }
    case 'REMOVE':
      return state.filter(i => !(i.fabricaId === action.fabricaId && i.referencia === action.referencia))

    case 'UPDATE_QTY': {
      const item = state.find(i => i.fabricaId === action.fabricaId && i.referencia === action.referencia)
      if (!item) return state
      const newQty = snapQty(action.qty, item.cxMestre)
      if (newQty <= 0) return state.filter(i => !(i.fabricaId === action.fabricaId && i.referencia === action.referencia))
      return state.map(i =>
        i.fabricaId === action.fabricaId && i.referencia === action.referencia
          ? { ...i, qty: newQty }
          : i
      )
    }
    case 'CLEAR_FABRICA':
      return state.filter(i => i.fabricaId !== action.fabricaId)
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [])

  const add    = product => dispatch({ type: 'ADD', product })
  const remove = (fabricaId, referencia) => dispatch({ type: 'REMOVE', fabricaId, referencia })
  const updateQty = (fabricaId, referencia, qty) => dispatch({ type: 'UPDATE_QTY', fabricaId, referencia, qty })
  const clearFabrica = fabricaId => dispatch({ type: 'CLEAR_FABRICA', fabricaId })
  const clear  = () => dispatch({ type: 'CLEAR' })

  // Subtotal de uma fábrica
  const subtotalFabrica = (fabricaId) =>
    items.filter(i => i.fabricaId === fabricaId)
         .reduce((s, i) => s + i.preco * i.qty, 0)

  // Itens de uma fábrica
  const itensFabrica = (fabricaId) => items.filter(i => i.fabricaId === fabricaId)

  const total = items.reduce((s, i) => s + i.preco * i.qty, 0)
  const count = items.reduce((s, i) => s + i.qty, 0)

  return (
    <CartContext.Provider value={{
      items, add, remove, updateQty, clearFabrica, clear,
      subtotalFabrica, itensFabrica, total, count,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
