import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLotes } from '../context/useLotes.js'

const categorias = ['Frescos', 'Lácteos', 'Carnes', 'Abarrotes']
const TAMANO_MAXIMO_FOTO = 2 * 1024 * 1024

function leerImagenComoDataUrl(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader()
    lector.onload = () => resolve(lector.result)
    lector.onerror = () => reject(new Error('No se pudo leer la fotografía.'))
    lector.readAsDataURL(archivo)
  })
}

function formatearVencimiento(valor) {
  if (!valor) return 'La fecha y hora aparecerán aquí'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return 'La fecha y hora aparecerán aquí'
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(fecha)
}

function PublicarLotePage() {
  const { publicarLote, errorPersistencia } = useLotes()
  const [valores, setValores] = useState({
    categoria: '',
    descripcion: '',
    pesoKg: '',
    vencimiento: '',
    requiereFrio: false,
  })
  const [imagen, setImagen] = useState('')
  const [nombreArchivo, setNombreArchivo] = useState('')
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')

  function actualizarCampo(evento) {
    const { checked, name, type, value } = evento.target
    setValores((actuales) => ({
      ...actuales,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setErrores((actuales) => ({ ...actuales, [name]: '' }))
    setMensaje('')
  }

  async function seleccionarImagen(evento) {
    const archivo = evento.target.files?.[0]
    setImagen('')
    setNombreArchivo('')
    setErrores((actuales) => ({ ...actuales, imagen: '' }))
    setMensaje('')

    if (!archivo) return
    if (!archivo.type.startsWith('image/')) {
      setErrores((actuales) => ({
        ...actuales,
        imagen: 'Selecciona un archivo de imagen válido.',
      }))
      evento.target.value = ''
      return
    }
    if (archivo.size > TAMANO_MAXIMO_FOTO) {
      setErrores((actuales) => ({
        ...actuales,
        imagen: 'La fotografía debe pesar 2 MB o menos.',
      }))
      evento.target.value = ''
      return
    }

    try {
      const dataUrl = await leerImagenComoDataUrl(archivo)
      setImagen(dataUrl)
      setNombreArchivo(archivo.name)
    } catch (error) {
      setErrores((actuales) => ({
        ...actuales,
        imagen: error.message,
      }))
      evento.target.value = ''
    }
  }

  function validarFormulario() {
    const nuevosErrores = {}
    if (!valores.categoria) nuevosErrores.categoria = 'Selecciona una categoría.'
    if (!valores.descripcion.trim()) {
      nuevosErrores.descripcion = 'Escribe el nombre o una descripción breve.'
    }

    const peso = Number(valores.pesoKg)
    if (!valores.pesoKg || !Number.isFinite(peso) || peso <= 0) {
      nuevosErrores.pesoKg = 'Ingresa un peso mayor que 0 kg.'
    }

    const horasRestantes = (new Date(valores.vencimiento).getTime() - Date.now()) / 3600000
    if (!valores.vencimiento || !Number.isFinite(horasRestantes)) {
      nuevosErrores.vencimiento = 'Indica la fecha y hora de vencimiento.'
    } else if (horasRestantes <= 6 || horasRestantes >= 48) {
      nuevosErrores.vencimiento =
        'El vencimiento debe ocurrir estrictamente después de 6 horas y antes de 48 horas desde ahora.'
    }

    if (!imagen) nuevosErrores.imagen = 'Selecciona una fotografía del lote.'
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  function enviarFormulario(evento) {
    evento.preventDefault()
    setMensaje('')
    if (!validarFormulario()) {
      setMensaje('Revisa los campos indicados antes de publicar el lote.')
      return
    }

    publicarLote({
      id: `lote-${Date.now()}`,
      categoria: valores.categoria,
      descripcion: valores.descripcion.trim(),
      pesoKg: Number(valores.pesoKg),
      vencimiento: new Date(valores.vencimiento).toISOString(),
      requiereFrio: valores.requiereFrio,
      imagen,
      donante: 'Donante de prueba',
      distanciaKm: 2.1,
      estado: 'DISPONIBLE',
      origen: 'Datos de prueba',
    })
    setMensaje('Lote publicado correctamente como disponible en los datos de prueba.')
    setValores({
      categoria: '',
      descripcion: '',
      pesoKg: '',
      vencimiento: '',
      requiereFrio: false,
    })
    setImagen('')
    setNombreArchivo('')
    setErrores({})
    evento.target.reset()
  }

  function campoConError(nombre) {
    return errores[nombre] ? `${nombre}-error` : undefined
  }

  return (
    <main className="access-page section-padding prototipo-page">
      <header className="access-heading">
        <p className="eyebrow">Prototipo · Datos de prueba</p>
        <h1>Publicar un lote</h1>
        <p>
          Comparte alimentos aptos para el consumo. La publicación estará
          disponible para que un comedor de prueba la consulte y reserve.
        </p>
      </header>

      <nav aria-label="Navegación del prototipo" className="prototipo-nav">
        <Link aria-current="page" className="button button-primary" to="/donante/publicar-lote">
          Publicar lote
        </Link>
        <Link className="button prototipo-button-secondary" to="/comedor/dashboard">
          Ver lotes disponibles
        </Link>
      </nav>

      {errorPersistencia && (
        <p className="prototipo-storage-error" role="alert">
          {errorPersistencia}
        </p>
      )}

      <div className="publicar-layout">
        <section aria-labelledby="formulario-lote-titulo" className="prototipo-panel">
          <h2 id="formulario-lote-titulo">Datos del alimento</h2>
          <p className="form-panel-intro">
            El vencimiento debe estar entre 6 y 48 horas desde el momento de publicación.
          </p>
          <form className="lote-form" noValidate onSubmit={enviarFormulario}>
            {mensaje && (
              <p
                className={mensaje.startsWith('Lote publicado') ? 'form-message' : 'form-error-summary'}
                role={mensaje.startsWith('Lote publicado') ? 'status' : 'alert'}
              >
                {mensaje}
              </p>
            )}

            <label className="lote-campo" htmlFor="categoria">
              Categoría
              <select
                aria-describedby={campoConError('categoria')}
                aria-invalid={Boolean(errores.categoria)}
                id="categoria"
                name="categoria"
                onChange={actualizarCampo}
                value={valores.categoria}
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
              {errores.categoria && (
                <span className="field-error" id="categoria-error">
                  {errores.categoria}
                </span>
              )}
            </label>

            <label className="lote-campo" htmlFor="descripcion">
              Nombre o descripción breve
              <input
                aria-describedby={campoConError('descripcion')}
                aria-invalid={Boolean(errores.descripcion)}
                id="descripcion"
                maxLength={100}
                name="descripcion"
                onChange={actualizarCampo}
                placeholder="Ej. Verduras de estación surtidas"
                type="text"
                value={valores.descripcion}
              />
              {errores.descripcion && (
                <span className="field-error" id="descripcion-error">
                  {errores.descripcion}
                </span>
              )}
            </label>

            <label className="lote-campo" htmlFor="pesoKg">
              Peso (kg)
              <input
                aria-describedby={campoConError('pesoKg')}
                aria-invalid={Boolean(errores.pesoKg)}
                id="pesoKg"
                min="0.1"
                name="pesoKg"
                onChange={actualizarCampo}
                placeholder="Ej. 12"
                step="0.1"
                type="number"
                value={valores.pesoKg}
              />
              {errores.pesoKg && (
                <span className="field-error" id="pesoKg-error">
                  {errores.pesoKg}
                </span>
              )}
            </label>

            <label className="lote-campo" htmlFor="vencimiento">
              Fecha y hora de vencimiento
              <input
                aria-describedby={campoConError('vencimiento')}
                aria-invalid={Boolean(errores.vencimiento)}
                id="vencimiento"
                name="vencimiento"
                onChange={actualizarCampo}
                type="datetime-local"
                value={valores.vencimiento}
              />
              {errores.vencimiento && (
                <span className="field-error" id="vencimiento-error">
                  {errores.vencimiento}
                </span>
              )}
            </label>

            <label className="lote-checkbox" htmlFor="requiereFrio">
              <input
                checked={valores.requiereFrio}
                id="requiereFrio"
                name="requiereFrio"
                onChange={actualizarCampo}
                type="checkbox"
              />
              <span>Este lote requiere cadena de frío</span>
            </label>

            <label className="lote-campo" htmlFor="imagen">
              Fotografía del lote
              <input
                accept="image/*"
                aria-describedby={campoConError('imagen')}
                aria-invalid={Boolean(errores.imagen)}
                id="imagen"
                name="imagen"
                onChange={seleccionarImagen}
                type="file"
              />
              <span className="lote-ayuda">
                Solo imágenes de hasta 2 MB. Se guardará una copia local para el prototipo.
              </span>
              {errores.imagen && (
                <span className="field-error" id="imagen-error">
                  {errores.imagen}
                </span>
              )}
            </label>
            <button className="button button-primary" type="submit">
              Publicar lote
            </button>
          </form>
        </section>

        <aside aria-label="Vista previa del lote" className="prototipo-preview">
          <p className="eyebrow">Así lo verá un comedor</p>
          <article className="lote-card lote-preview-card">
            {imagen ? (
              <img alt={`Vista previa de ${valores.descripcion || 'la fotografía del lote'}`} src={imagen} />
            ) : (
              <div aria-hidden="true" className="lote-imagen-vacia">
                Fotografía del lote
              </div>
            )}
            <div className="lote-card-content">
              <div className="lote-card-heading">
                <span className="lote-badge">{valores.categoria || 'Categoría'}</span>
                <span className="lote-distancia">2.1 km</span>
              </div>
              <h2>{valores.descripcion || 'Nombre del alimento'}</h2>
              <p className="lote-peso">{valores.pesoKg || '—'} kg</p>
              <dl className="lote-detalles">
                <div>
                  <dt>Vence</dt>
                  <dd>{formatearVencimiento(valores.vencimiento)}</dd>
                </div>
                <div>
                  <dt>Cadena de frío</dt>
                  <dd>{valores.requiereFrio ? 'Requerida' : 'No requerida'}</dd>
                </div>
                <div>
                  <dt>Donante</dt>
                  <dd>Donante de prueba</dd>
                </div>
              </dl>
              {nombreArchivo && <p className="lote-ayuda">Foto: {nombreArchivo}</p>}
              <span className="lote-origen">Datos de prueba</span>
            </div>
          </article>
        </aside>
      </div>
    </main>
  )
}

export default PublicarLotePage
