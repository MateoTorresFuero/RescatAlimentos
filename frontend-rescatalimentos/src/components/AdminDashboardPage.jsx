import { useState } from 'react'

const CLAVE_USUARIOS_DEMO = 'rescatalimentos-usuarios-admin-demo'

const usuariosIniciales = [
  {
    id: 'solicitud-mercado-demo',
    entidad: 'Mercado San Pedro (prueba)',
    perfil: 'Donante',
    referencia: 'Registro comercial de ejemplo',
    estado: 'PENDIENTE',
  },
  {
    id: 'solicitud-comedor-demo',
    entidad: 'Comedor Nueva Esperanza (prueba)',
    perfil: 'Comedor',
    referencia: 'Organización comunitaria de ejemplo',
    estado: 'PENDIENTE',
  },
  {
    id: 'solicitud-voluntario-demo',
    entidad: 'Voluntario de logística (prueba)',
    perfil: 'Voluntario',
    referencia: 'Registro de movilidad de ejemplo',
    estado: 'PENDIENTE',
  },
]

function esSolicitudValida(usuario) {
  return (
    usuario &&
    typeof usuario.id === 'string' &&
    typeof usuario.entidad === 'string' &&
    typeof usuario.perfil === 'string' &&
    typeof usuario.referencia === 'string' &&
    ['PENDIENTE', 'APROBADA', 'RECHAZADA'].includes(usuario.estado)
  )
}

function cargarUsuariosDemo() {
  try {
    const guardados = window.localStorage.getItem(CLAVE_USUARIOS_DEMO)
    if (!guardados) return { usuarios: usuariosIniciales, error: '' }

    const usuarios = JSON.parse(guardados)
    if (!Array.isArray(usuarios) || !usuarios.every(esSolicitudValida)) {
      throw new Error('El formato de las cuentas de prueba no es válido.')
    }

    return { usuarios, error: '' }
  } catch {
    return {
      usuarios: usuariosIniciales,
      error:
        'No se pudieron leer las decisiones guardadas. Se muestran las cuentas sintéticas iniciales.',
    }
  }
}

function etiquetaEstado(estado) {
  if (estado === 'APROBADA') return 'Aprobada'
  if (estado === 'RECHAZADA') return 'Rechazada'
  return 'Pendiente'
}

function AdminDashboardPage() {
  const [estadoInicial] = useState(cargarUsuariosDemo)
  const [usuarios, setUsuarios] = useState(estadoInicial.usuarios)
  const [errorPersistencia, setErrorPersistencia] = useState(estadoInicial.error)
  const pendientes = usuarios.filter(
    (usuario) => usuario.estado === 'PENDIENTE',
  ).length

  function cambiarEstado(id, estado) {
    const usuariosActualizados = usuarios.map((usuario) =>
      usuario.id === id && usuario.estado === 'PENDIENTE'
        ? { ...usuario, estado }
        : usuario,
    )
    setUsuarios(usuariosActualizados)

    try {
      window.localStorage.setItem(
        CLAVE_USUARIOS_DEMO,
        JSON.stringify(usuariosActualizados),
      )
      setErrorPersistencia('')
    } catch {
      setErrorPersistencia(
        'No se pudo guardar la decisión en este navegador. Solo estará disponible mientras la página permanezca abierta.',
      )
    }
  }

  return (
    <main className="access-page section-padding prototipo-page">
      <header className="access-heading">
        <p className="eyebrow">Administración · Datos de prueba</p>
        <h1>Revisión de cuentas</h1>
        <p>
          Revisa solicitudes sintéticas y consulta indicadores ilustrativos. Las
          decisiones solo cambian la demo local; no activan ni rechazan cuentas
          reales.
        </p>
      </header>

      {errorPersistencia && (
        <p className="prototipo-storage-error" role="alert">
          {errorPersistencia}
        </p>
      )}

      <section aria-label="Indicadores ilustrativos" className="admin-metricas">
        <article className="admin-metrica">
          <span>Solicitudes pendientes</span>
          <strong>{pendientes}</strong>
        </article>
        <article className="admin-metrica">
          <span>Lotes publicados · ejemplo</span>
          <strong>4</strong>
        </article>
        <article className="admin-metrica">
          <span>Alimentos rescatados · ejemplo</span>
          <strong>46 kg</strong>
        </article>
      </section>

      <section aria-labelledby="admin-solicitudes-titulo" className="admin-solicitudes">
        <div className="admin-solicitudes-heading">
          <h2 id="admin-solicitudes-titulo">Solicitudes de registro</h2>
          <p>Registros de muestra; no provienen del formulario ni de un servidor.</p>
        </div>
        {usuarios.length ? (
          <div className="admin-solicitudes-grid">
            {usuarios.map((usuario) => (
              <article className="admin-solicitud" key={usuario.id}>
                <div className="admin-solicitud-heading">
                  <div>
                    <span className="lote-badge">{usuario.perfil}</span>
                    <h3>{usuario.entidad}</h3>
                  </div>
                  <span
                    className={`admin-estado admin-estado-${usuario.estado.toLowerCase()}`}
                    role="status"
                  >
                    {etiquetaEstado(usuario.estado)}
                  </span>
                </div>
                <p>{usuario.referencia}</p>
                {usuario.estado === 'PENDIENTE' ? (
                  <div className="admin-acciones">
                    <button
                      className="button button-primary"
                      onClick={() => cambiarEstado(usuario.id, 'APROBADA')}
                      type="button"
                    >
                      Aprobar
                    </button>
                    <button
                      className="button prototipo-button-secondary"
                      onClick={() => cambiarEstado(usuario.id, 'RECHAZADA')}
                      type="button"
                    >
                      Rechazar
                    </button>
                  </div>
                ) : (
                  <p className="form-message">
                    Decisión registrada en esta demo.
                  </p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="prototipo-empty" role="status">
            No hay solicitudes sintéticas para mostrar.
          </p>
        )}
      </section>
    </main>
  )
}

export default AdminDashboardPage
