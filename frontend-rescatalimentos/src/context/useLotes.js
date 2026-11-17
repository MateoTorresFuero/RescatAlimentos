import { useContext } from 'react'
import { LotesContext } from './lotesContextBase.js'

function useLotes() {
  const contexto = useContext(LotesContext)
  if (!contexto) {
    throw new Error('useLotes debe utilizarse dentro de LotesProvider.')
  }
  return contexto
}

export { useLotes }
