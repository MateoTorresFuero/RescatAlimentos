import { useState } from 'react'
import { crearLotesIniciales } from '../data/lotesIniciales.js'
import { LotesContext } from './lotesContextBase.js'

const CLAVE_ALMACENAMIENTO = 'rescatalimentos-lotes-prototipo'
const CLAVE_SOLICITUDES_LOGISTICA = 'rescatalimentos-solicitudes-logistica-prototipo'

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

function esSolicitudLogisticaValida(solicitud) {
  return (
    solicitud &&
    typeof solicitud.id === 'string' &&
    typeof solicitud.loteId === 'string' &&
    typeof solicitud.descripcion === 'string' &&
    typeof solicitud.categoria === 'string' &&
    Number.isFinite(solicitud.pesoKg) &&
    typeof solicitud.requiereFrio === 'boolean' &&
    typeof solicitud.donante === 'string' &&
    typeof solicitud.puntoRecojo === 'string' &&
    typeof solicitud.puntoEntrega === 'string' &&
    Number.isFinite(solicitud.distanciaKm) &&
    ['DISPONIBLE', 'ASIGNADA'].includes(solicitud.estado)
  )
}

function cargarLotes() {
  try {
    const guardados = window.localStorage.getItem(CLAVE_ALMACENAMIENTO)
    const lotes = guardados ? JSON.parse(guardados) : crearLotesIniciales()
    if (!Array.isArray(lotes) || !lotes.every(esLoteValido)) {
      throw new Error('El formato guardado no es válido.')
    }

    const solicitudesGuardadas = window.localStorage.getItem(
      CLAVE_SOLICITUDES_LOGISTICA,
    )
    const solicitudesLogistica = solicitudesGuardadas
      ? JSON.parse(solicitudesGuardadas)
      : []
    if (
      !Array.isArray(solicitudesLogistica) ||
      !solicitudesLogistica.every(esSolicitudLogisticaValida)
    ) {
      throw new Error('El formato de las solicitudes guardadas no es válido.')
    }

    return {
      lotes,
      solicitudesLogistica,
      puedePersistir: true,
      error: '',
    }
  } catch {
    return {
      lotes: crearLotesIniciales(),
      solicitudesLogistica: [],
      puedePersistir: false,
      error:
        'No se pudieron leer los datos guardados. Los cambios de esta sesión no se conservarán.',
    }
  }
}

function LotesProvider({ children }) {
  const [estadoInicial] = useState(cargarLotes)
  const [lotes, setLotes] = useState(estadoInicial.lotes)
  const [solicitudesLogistica, setSolicitudesLogistica] = useState(
    estadoInicial.solicitudesLogistica,
  )
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

  function solicitarApoyoLogistico(lote) {
    if (lote.estado !== 'DISPONIBLE') return

    actualizarLotes(
      lotes.map((elemento) =>
        elemento.id === lote.id && elemento.estado === 'DISPONIBLE'
          ? { ...elemento, estado: 'RESERVADO' }
          : elemento,
      ),
    )
    const solicitud = {
      id: `solicitud-${lote.id}-${Date.now()}`,
      loteId: lote.id,
      descripcion: lote.descripcion,
      categoria: lote.categoria,
      pesoKg: lote.pesoKg,
      requiereFrio: lote.requiereFrio,
      donante: lote.donante,
      puntoRecojo: `${lote.donante} · ubicación ficticia`,
      puntoEntrega: 'Comedor de prueba · ubicación ficticia',
      distanciaKm: lote.distanciaKm,
      estado: 'DISPONIBLE',
    }
    const nuevasSolicitudes = [solicitud, ...solicitudesLogistica]
    setSolicitudesLogistica(nuevasSolicitudes)
    if (!estadoInicial.puedePersistir) return
    try {
      window.localStorage.setItem(
        CLAVE_SOLICITUDES_LOGISTICA,
        JSON.stringify(nuevasSolicitudes),
      )
      setErrorPersistencia('')
    } catch {
      setErrorPersistencia(
        'No se pudieron guardar los cambios en este navegador. Seguirán disponibles mientras esta página permanezca abierta.',
      )
    }
  }

  function aceptarRuta(id) {
    const nuevasSolicitudes = solicitudesLogistica.map((solicitud) =>
      solicitud.id === id && solicitud.estado === 'DISPONIBLE'
        ? { ...solicitud, estado: 'ASIGNADA' }
        : solicitud,
    )
    setSolicitudesLogistica(nuevasSolicitudes)
    if (!estadoInicial.puedePersistir) return
    try {
      window.localStorage.setItem(
        CLAVE_SOLICITUDES_LOGISTICA,
        JSON.stringify(nuevasSolicitudes),
      )
      setErrorPersistencia('')
    } catch {
      setErrorPersistencia(
        'No se pudieron guardar los cambios en este navegador. Seguirán disponibles mientras esta página permanezca abierta.',
      )
    }
  }

  return (
    <LotesContext.Provider
      value={{
        lotes,
        publicarLote,
        reservarLote,
        solicitudesLogistica,
        solicitarApoyoLogistico,
        aceptarRuta,
        errorPersistencia,
      }}
    >
      {children}
    </LotesContext.Provider>
  )
}

export { LotesProvider }
