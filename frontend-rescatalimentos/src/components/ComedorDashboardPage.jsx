import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { useLotes } from '../context/useLotes.js'

function formatearVencimiento(valor) {
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return 'Fecha no disponible'
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(fecha)
}

function NavegacionPrototipo({ detalle = false }) {
  return (
    <nav aria-label="Navegación del prototipo" className="prototipo-nav">
      <Link className="button prototipo-button-secondary" to="/donante/publicar-lote">
        Publicar un lote
      </Link>
      <Link
        aria-current={detalle ? undefined : 'page'}
        className="button button-primary"
        to="/comedor/dashboard"
      >
        Ver lotes disponibles
      </Link>
    </nav>
  )
}

function DetalleLote({
  lote,
  reservarLote,
  solicitarApoyoLogistico,
  errorPersistencia,
}) {
  const [reservado, setReservado] = useState(false)
  const [mostrarOpcionesMovilidad, setMostrarOpcionesMovilidad] = useState(false)
  const [apoyoLogisticoSolicitado, setApoyoLogisticoSolicitado] = useState(false)

  function reservar() {
    reservarLote(lote.id)
    setReservado(true)
  }

  function solicitarTransporte() {
    solicitarApoyoLogistico(lote)
    setReservado(true)
    setApoyoLogisticoSolicitado(true)
  }

  return (
    <main className="access-page section-padding prototipo-page">
      <header className="access-heading">
        <p className="eyebrow">Comedor · Datos de prueba</p>
        <h1>Detalle del lote</h1>
        <p>Revisa la información antes de aceptar la reserva.</p>
      </header>
      <NavegacionPrototipo detalle />
      {errorPersistencia && (
        <p className="prototipo-storage-error" role="alert">
          {errorPersistencia}
        </p>
      )}
      <article className="lote-detalle-panel">
        {lote.imagen ? (
          <img alt={`Fotografía de ${lote.descripcion}`} src={lote.imagen} />
        ) : (
          <div aria-hidden="true" className="lote-imagen-vacia">
            Sin fotografía disponible
          </div>
        )}
        <div className="lote-detalle-contenido">
          <span className="lote-badge">{lote.categoria}</span>
          <h2>{lote.descripcion}</h2>
          <p className="lote-peso">{lote.pesoKg} kg</p>
          <dl className="lote-detalles lote-detalles-amplios">
            <div>
              <dt>Donante</dt>
              <dd>{lote.donante}</dd>
            </div>
            <div>
              <dt>Vencimiento</dt>
              <dd>{formatearVencimiento(lote.vencimiento)}</dd>
            </div>
            <div>
              <dt>Cadena de frío</dt>
              <dd>{lote.requiereFrio ? 'Requerida' : 'No requerida'}</dd>
            </div>
            <div>
              <dt>Distancia aproximada</dt>
              <dd>{lote.distanciaKm.toFixed(1)} km (referencia de prueba)</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd>{lote.estado === 'DISPONIBLE' ? 'Disponible' : 'Reservado'}</dd>
            </div>
          </dl>
          <p className="lote-origen">Datos de prueba · Ubicación aproximada ficticia</p>
          {reservado && (
            <p className="form-message" role="status">
              {apoyoLogisticoSolicitado
                ? 'Reserva confirmada. La solicitud sintética de transporte ya está disponible para el voluntario.'
                : 'Reserva confirmada en este prototipo. El lote ya no aparece entre los disponibles.'}
            </p>
          )}
          {lote.estado === 'DISPONIBLE' ? (
            mostrarOpcionesMovilidad ? (
              <div className="reserva-opciones">
                <p>¿Cómo recogerá el lote el comedor?</p>
                <button
                  className="button button-primary"
                  onClick={reservar}
                  type="button"
                >
                  Usar movilidad propia
                </button>
                <button
                  className="button prototipo-button-secondary"
                  onClick={solicitarTransporte}
                  type="button"
                >
                  Solicitar apoyo de transporte
                </button>
              </div>
            ) : (
              <button
                className="button button-primary"
                onClick={() => setMostrarOpcionesMovilidad(true)}
                type="button"
              >
                Aceptar y reservar lote
              </button>
            )
          ) : !reservado ? (
            <p className="lote-reservado" role="status">
              Este lote ya está reservado y no está disponible para otra reserva.
            </p>
          ) : null}
          <Link className="back-link prototipo-back-link" to="/comedor/dashboard">
            Volver a los lotes disponibles
          </Link>
        </div>
      </article>
    </main>
  )
}

function ComedorDashboardPage() {
  const { id } = useParams()
  const {
    lotes,
    reservarLote,
    solicitarApoyoLogistico,
    errorPersistencia,
  } = useLotes()

  if (id) {
    const lote = lotes.find((elemento) => elemento.id === id)
    if (!lote) {
      return (
        <main className="access-page section-padding prototipo-page">
          <section className="login-panel">
            <p className="eyebrow">Lote no encontrado</p>
            <h1>Esta publicación no está disponible</h1>
            <Link className="button button-primary" to="/comedor/dashboard">
              Volver al listado
            </Link>
          </section>
        </main>
      )
    }
    return (
      <DetalleLote
        errorPersistencia={errorPersistencia}
        lote={lote}
        reservarLote={reservarLote}
        solicitarApoyoLogistico={solicitarApoyoLogistico}
      />
    )
  }

  const lotesDisponibles = lotes.filter(
    (lote) => lote.estado === 'DISPONIBLE' && lote.distanciaKm < 5,
  )

  return (
    <main className="access-page section-padding prototipo-page">
      <header className="access-heading">
        <p className="eyebrow">Comedor · Datos de prueba</p>
        <h1>Lotes disponibles cerca de ti</h1>
        <p>
          Ejemplos ficticios a menos de 5 km. Las distancias son referencias de prueba;
          no provienen de un mapa ni representan ubicaciones reales.
        </p>
      </header>
      <NavegacionPrototipo />
      {errorPersistencia && (
        <p className="prototipo-storage-error" role="alert">
          {errorPersistencia}
        </p>
      )}
      {lotesDisponibles.length ? (
        <section aria-label="Lotes de alimentos disponibles" className="lotes-grid">
          {lotesDisponibles.map((lote) => (
            <article className="lote-card" key={lote.id}>
              {lote.imagen ? (
                <img alt={`Fotografía de ${lote.descripcion}`} src={lote.imagen} />
              ) : (
                <div aria-hidden="true" className="lote-imagen-vacia">
                  {lote.categoria}
                </div>
              )}
              <div className="lote-card-content">
                <div className="lote-card-heading">
                  <span className="lote-badge">{lote.categoria}</span>
                  <span className="lote-distancia">{lote.distanciaKm.toFixed(1)} km</span>
                </div>
                <h2>{lote.descripcion}</h2>
                <p className="lote-peso">{lote.pesoKg} kg</p>
                <dl className="lote-detalles">
                  <div>
                    <dt>Vence</dt>
                    <dd>{formatearVencimiento(lote.vencimiento)}</dd>
                  </div>
                  <div>
                    <dt>Cadena de frío</dt>
                    <dd>{lote.requiereFrio ? 'Requerida' : 'No requerida'}</dd>
                  </div>
                  <div>
                    <dt>Donante</dt>
                    <dd>{lote.donante}</dd>
                  </div>
                </dl>
                <span className="lote-origen">{lote.origen}</span>
                <Link className="button button-primary lote-ver-detalle" to={`/comedor/lote/${lote.id}`}>
                  Ver detalle y reservar
                </Link>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <p className="prototipo-empty" role="status">
          No hay lotes disponibles a menos de 5 km en los datos de prueba.
        </p>
      )}
    </main>
  )
}

export default ComedorDashboardPage
