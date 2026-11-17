import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { registrationRoles } from '../data/registrationRoles.js'

const cuentasDemostracion = [
  {
    identidad: 'donante.demo@rescatalimentos.test',
    contraseña: 'DonanteDemo2026!',
    ruta: '/donante/publicar-lote',
  },
  {
    identidad: 'comedor.demo@rescatalimentos.test',
    contraseña: 'ComedorDemo2026!',
    ruta: '/comedor/dashboard',
  },
  {
    identidad: 'voluntario.demo@rescatalimentos.test',
    contraseña: 'VoluntarioDemo2026!',
    ruta: '/logistica/dashboard',
  },
  {
    identidad: 'admin.demo@rescatalimentos.test',
    contraseña: 'AdminDemo2026!',
    ruta: '/admin/usuarios',
  },
]

function PageIntro({ eyebrow, title, description }) {
  return (
    <header className="access-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  )
}

function RegistrationSelectionPage() {
  return (
    <main className="access-page section-padding">
      <PageIntro
        description="Elige el perfil que mejor representa tu participación. Cada formulario solicita información distinta para organizar el rescate."
        eyebrow="Registro de la red"
        title="¿Cómo quieres participar?"
      />
      <div className="registration-grid">
        {registrationRoles.map((role) => (
          <article className="registration-card" key={role.id}>
            <h2>{role.title}</h2>
            <p>{role.description}</p>
            <p className="registration-card-fields">
              <strong>Datos solicitados:</strong> {role.profile}
            </p>
            <Link className="button button-primary" to={role.route}>
              {role.action}
            </Link>
          </article>
        ))}
      </div>
      <p className="approval-note">
        Según la propuesta, los registros quedan pendientes de revisión
        administrativa antes de activar el acceso.
      </p>
      <p className="access-switch">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </main>
  )
}

function RegistrationPage() {
  const { role: roleId } = useParams()
  const role = registrationRoles.find((item) => item.id === roleId)
  const [values, setValues] = useState({ mobility: '' })
  const [submitted, setSubmitted] = useState(false)

  if (!role) return <Navigate replace to="/registro" />

  function handleChange(event) {
    const { checked, name, type, value } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="access-page section-padding">
      <div className="form-page-layout">
        <aside className="form-page-aside">
          <p className="eyebrow">Registro especializado</p>
          <h1>{role.title}</h1>
          <p>{role.description}</p>
          <Link className="back-link" to="/registro">
            ← Cambiar perfil
          </Link>
        </aside>
        <section className="registration-form-panel">
          <h2>Datos de registro</h2>
          <p className="form-panel-intro">
            Completa la información necesaria para organizar tu participación.
          </p>
          <form className="role-form" onSubmit={handleSubmit}>
            {role.fields.map((field) => {
              if (
                field.dependsOnMobility &&
                (!values.mobility || values.mobility === 'foot')
              ) {
                return null
              }

              if (field.type === 'select') {
                return (
                  <label key={field.name}>
                    {field.label}
                    <select
                      name={field.name}
                      onChange={handleChange}
                      required
                      value={values[field.name] || ''}
                    >
                      <option disabled value="">
                        Selecciona una opción
                      </option>
                      {field.options.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                )
              }

              if (field.type === 'checkbox') {
                return (
                  <label className="checkbox-field" key={field.name}>
                    <input
                      checked={Boolean(values[field.name])}
                      name={field.name}
                      onChange={handleChange}
                      type="checkbox"
                    />
                    {field.label}
                  </label>
                )
              }

              return (
                <label key={field.name}>
                  {field.label}
                  <input
                    autoComplete={field.autoComplete}
                    min={field.min}
                    name={field.name}
                    onChange={handleChange}
                    required={
                      field.dependsOnMobility
                        ? values.mobility !== 'foot'
                        : true
                    }
                    step={field.step}
                    type={field.type || 'text'}
                    value={values[field.name] || ''}
                  />
                </label>
              )
            })}
            <button className="button button-primary" type="submit">
              Validar registro
            </button>
            {submitted && (
              <p className="form-message" role="status">
                El formulario pasó la validación del navegador. No se envió ni
                guardó: el prototipo todavía no está conectado al backend.
              </p>
            )}
          </form>
          <p className="approval-note">
            El flujo propuesto requiere revisión administrativa antes de
            activar una cuenta.
          </p>
        </section>
      </div>
    </main>
  )
}

function LoginPage({ onLogin }) {
  const [errorCredenciales, setErrorCredenciales] = useState('')
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()
    const datos = new FormData(event.currentTarget)
    const identidad = String(datos.get('identity')).trim().toLowerCase()
    const contraseña = String(datos.get('password'))
    const cuenta = cuentasDemostracion.find(
      (item) =>
        item.identidad === identidad && item.contraseña === contraseña,
    )

    if (!cuenta) {
      setErrorCredenciales(
        'Credenciales incorrectas. Usa una de las cuentas de demostración indicadas.',
      )
      return
    }

    onLogin(cuenta)
    navigate(cuenta.ruta)
  }

  return (
    <main className="access-page section-padding">
      <section className="login-panel">
        <PageIntro
          description="Usa una cuenta de demostración para recorrer las vistas de donante, comedor, logística y administración."
          eyebrow="Acceso a la plataforma"
          title="Inicia sesión"
        />
        <p className="form-message">
          Acceso de demostración local: no crea una cuenta ni valida identidad
          con un servidor.
        </p>
        <form className="role-form" onSubmit={handleSubmit}>
          <label>
            Correo electrónico o RUC
            <input
              autoComplete="username"
              name="identity"
              placeholder="Correo electrónico o RUC"
              required
            />
          </label>
          <label>
            Contraseña
            <input
              autoComplete="current-password"
              name="password"
              required
              type="password"
            />
          </label>
          <button className="button button-primary" type="submit">
            Iniciar sesión
          </button>
          {errorCredenciales && (
            <p className="form-error-summary" role="alert">
              {errorCredenciales}
            </p>
          )}
        </form>
        <p className="access-switch">
          ¿Aún no tienes cuenta?{' '}
          <button type="button" onClick={() => navigate('/registro')}>
            Regístrate según tu perfil
          </button>
        </p>
      </section>
    </main>
  )
}

export { LoginPage, RegistrationPage, RegistrationSelectionPage }
