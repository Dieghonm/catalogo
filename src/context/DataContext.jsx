// src/context/DataContext.jsx
// Carrega os xlsx de forma assíncrona e fornece os dados para a app inteira.
// Use useData() em qualquer componente para acessar FABRICAS, TODOS_PRODUTOS, etc.

import { createContext, useContext, useEffect, useState } from 'react'
import { loadAllData, getFabricas, getTodosProdutos, getFabrica as _getFabrica, getProduto as _getProduto } from '../../public/data/index'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [error,  setError]  = useState(null)
  const [tick,   setTick]   = useState(0)

  useEffect(() => {
    loadAllData()
      .then(() => {
        setStatus('ready')
        setTick(t => t + 1)   // força re-render após load
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
    FABRICAS:       getFabricas(),
    TODOS_PRODUTOS: getTodosProdutos(),
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