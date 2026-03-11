// src/context/DataContext.jsx
// Carrega os xlsx de forma assíncrona e fornece os dados para a app inteira.
// Use useData() em qualquer componente para acessar FABRICAS, TODOS_PRODUTOS, etc.

import { createContext, useContext, useEffect, useState } from 'react'
import { loadAllData, getFabricas, getTodosProdutos, getFabrica as _getFabrica, getProduto as _getProduto } from '../index'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [status,        setStatus]        = useState('loading') // 'loading' | 'ready' | 'error'
  const [error,         setError]         = useState(null)
  // ✅ CORREÇÃO: dados guardados no estado React (não em getters de módulo)
  const [fabricas,      setFabricas]      = useState([])
  const [todosProdutos, setTodosProdutos] = useState([])

  useEffect(() => {
    loadAllData()
      .then(() => {
        // ✅ Captura os dados DEPOIS do load e salva no estado React
        setFabricas(getFabricas())
        setTodosProdutos(getTodosProdutos())
        setStatus('ready')
      })
      .catch(err => {
        console.error('Erro ao carregar dados:', err)
        setError(err?.message ?? String(err))
        setStatus('error')
      })
  }, [])

  const value = {
    status,
    error,
    FABRICAS:       fabricas,
    TODOS_PRODUTOS: todosProdutos,
    getFabrica:     _getFabrica,
    getProduto:     _getProduto,
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData deve ser usado dentro de <DataProvider>')
  return ctx
}