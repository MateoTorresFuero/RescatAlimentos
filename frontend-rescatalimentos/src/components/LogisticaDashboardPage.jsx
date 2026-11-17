import { useLotes } from '../context/useLotes.js'

function LogisticaDashboardPage() {
  const { solicitudesLogistica, aceptarRuta, errorPersistencia } = useLotes()

  return (
    <main className="access-page section-padding prototipo-page">
      <header className="access-heading">
        <p className="eyebrow">Logística · Datos de prueba</p>
        <h1>Solicitudes de transporte</h1>
        <p>
          Revisa el recojo, la entrega y los requisitos de cada lote. Las
          ubicaciones y distancias son ficticias y no representan rutas reales.
        </p>
      </header>
      {errorPersistencia && (
        <p className="prototipo-storage-error" role="alert">
          {errorPersistencia}
        </p>
      )}
      {solicitudesLogistica.length ? (
        <section
          aria-label="Solicitudes de transporte disponibles"
          className="rutas-grid"
        >
          {solicitudesLogistica.map((solicitud) => (
            <article className="ruta-card" key={solicitud.id}>
              <div className="ruta-card-heading">
                <span className="lote-badge">{solicitud.categoria}</span>
                <span className={`ruta-estado ruta-estado-${solicitud.estado.toLowerCase()}`}>
                  {solicitud.estado === 'DISPONIBLE' ? 'Disponible' : 'Asignada'}
                </span>
              </div>
              <h2>{solicitud.descripcion}</h2>
              <p className="lote-peso">{solicitud.pesoKg} kg</p>
              <dl className="ruta-detalles">
                <div>
                  <dt>Punto de recojo</dt>
                  <dd>{solicitud.puntoRecojo}</dd>
                </div>
                <div>
                  <dt>Punto de entrega</dt>
                  <dd>{solicitud.puntoEntrega}</dd>
                </div>
                <div>
                  <dt>Donante</dt>
                  <dd>{solicitud.donante}</dd>
                </div>
                <div>
                  <dt>Distancia de referencia</dt>
                  <dd>{solicitud.distanciaKm.toFixed(1)} km</dd>
                </div>
                <div>
                  <dt>Conservación</dt>
                  <dd>
                    {solicitud.requiereFrio
                      ? 'Requiere cooler o caja térmica'
                      : 'No requiere cadena de frío'}
                  </dd>
                </div>
              </dl>
              {solicitud.estado === 'DISPONIBLE' ? (
                <button
                  className="button button-primary"
                  onClick={() => aceptarRuta(solicitud.id)}
                  type="button"
                >
                  Aceptar ruta
                </button>
              ) : (
                <p className="form-message" role="status">
                  Ruta aceptada por el voluntario de demostración.
                </p>
              )}
              <span className="lote-origen">Solicitud sintética de prueba</span>
            </article>
          ))}
        </section>
      ) : (
        <p className="prototipo-empty" role="status">
          No hay solicitudes de transporte. Para generar una, entra como comedor
          de prueba, elige un lote y solicita apoyo de transporte al reservarlo.
        </p>
      )}
    </main>
  )
}

export default LogisticaDashboardPage
