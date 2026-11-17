function fechaEnHoras(horas) {
  return new Date(Date.now() + horas * 60 * 60 * 1000).toISOString()
}

export function crearLotesIniciales() {
  return [
    {
      id: 'prueba-verduras',
      categoria: 'Frescos',
      descripcion: 'Verduras de estación surtidas',
      pesoKg: 12,
      vencimiento: fechaEnHoras(18),
      requiereFrio: false,
      imagen: '',
      donante: 'Mercado de ejemplo',
      distanciaKm: 1.2,
      estado: 'DISPONIBLE',
      origen: 'Datos de prueba',
    },
    {
      id: 'prueba-yogur',
      categoria: 'Lácteos',
      descripcion: 'Yogur natural en envases cerrados',
      pesoKg: 8,
      vencimiento: fechaEnHoras(24),
      requiereFrio: true,
      imagen: '',
      donante: 'Comercio ficticio',
      distanciaKm: 3.4,
      estado: 'DISPONIBLE',
      origen: 'Datos de prueba',
    },
    {
      id: 'prueba-arroz',
      categoria: 'Abarrotes',
      descripcion: 'Arroz en bolsas selladas',
      pesoKg: 20,
      vencimiento: fechaEnHoras(36),
      requiereFrio: false,
      imagen: '',
      donante: 'Almacén de muestra',
      distanciaKm: 2.6,
      estado: 'DISPONIBLE',
      origen: 'Datos de prueba',
    },
    {
      id: 'prueba-pollo',
      categoria: 'Carnes',
      descripcion: 'Pollo refrigerado en empaque sellado',
      pesoKg: 6,
      vencimiento: fechaEnHoras(12),
      requiereFrio: true,
      imagen: '',
      donante: 'Proveedor ficticio',
      distanciaKm: 4.1,
      estado: 'DISPONIBLE',
      origen: 'Datos de prueba',
    },
  ]
}
