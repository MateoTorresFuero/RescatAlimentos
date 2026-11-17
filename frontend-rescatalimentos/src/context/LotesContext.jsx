import { useState } from 'react'
import { crearLotesIniciales } from '../data/lotesIniciales.js'
import { LotesContext } from './lotesContextBase.js'

const CLAVE_ALMACENAMIENTO = 'rescatalimentos-lotes-prototipo'

function esLoteValido(lote) {
  return (
    lote &&
    typeof lote.id === 'string' &&
    typeof lote.categoria === 'string' &&
    typeof lote.descripcion === 'string' &&
    Number.isFinite(lote.pesoKg) &&
    typeof lote.vencimiento === 'string' &&
    typeof lote.requiereFrio === 'boolean' &&
    typeof lote.imagen === 'string' &&
    typeof lote.donante === 'string' &&
    Number.isFinite(lote.distanciaKm) &&
    ['DISPONIBLE', 'RESERVADO'].includes(lote.estado) &&
    typeof lote.origen === 'string'
  )
}

function cargarLotes() {
  try {
    const guardados = window.localStorage.getItem(CLAVE_ALMACENAMIENTO)
    if (!guardados) {
      return { lotes: crearLotesIniciales(), puedePersistir: true, error: '' }
    }

    const lotes = JSON.parse(guardados)
    if (!Array.isArray(lotes) || !lotes.every(esLoteValido)) {
      throw new Error('El formato guardado no es válido.')
    }

    return { lotes, puedePersistir: true, error: '' }
  } catch {
    return {
      lotes: crearLotesIniciales(),
      puedePersistir: false,
      error:
        'No se pudieron leer los datos guardados. Los cambios de esta sesión no se conservarán.',
    }
  }
}

function LotesProvider({ children }) {
  const [estadoInicial] = useState(cargarLotes)
  const [lotes, setLotes] = useState(estadoInicial.lotes)
  const [errorPersistencia, setErrorPersistencia] = useState(estadoInicial.error)

  function actualizarLotes(nuevosLotes) {
    setLotes(nuevosLotes)
    if (!estadoInicial.puedePersistir) return
    try {
      window.localStorage.setItem(
        CLAVE_ALMACENAMIENTO,
        JSON.stringify(nuevosLotes),
      )
      setErrorPersistencia('')
    } catch {
      setErrorPersistencia(
        'No se pudieron guardar los cambios en este navegador. Seguirán disponibles mientras esta página permanezca abierta.',
      )
    }
  }

  function publicarLote(lote) {
    actualizarLotes([lote, ...lotes])
  }

  function reservarLote(id) {
    actualizarLotes(
      lotes.map((lote) =>
        lote.id === id && lote.estado === 'DISPONIBLE'
          ? { ...lote, estado: 'RESERVADO' }
          : lote,
      ),
    )
  }

  return (
    <LotesContext.Provider
      value={{ lotes, publicarLote, reservarLote, errorPersistencia }}
    >
      {children}
    </LotesContext.Provider>
  )
}

export { LotesProvider }
