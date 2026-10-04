// Catálogo CFS IMPO (mismo orden e íconos que el HTML original).
export const SERVICIOS = [
  { id: 'desconsolidacion', nombre: 'Desconsolidación', icono: '▣', descripcion: 'Contenedores / carga general' },
  { id: 'carguio', nombre: 'Carguío', icono: '↥', descripcion: 'Camión / contenedor' },
  { id: 'aforo', nombre: 'Aforo', icono: '☷', descripcion: 'Inspección de carga' },
  { id: 'rancho', nombre: 'Rancho', icono: '⚓', descripcion: 'Suministro a nave' },
  { id: 'varada-desvarada', nombre: 'Varada / Desvarada', icono: '◉', descripcion: 'Servicio operativo' },
  { id: 'recepcion', nombre: 'Recepción', icono: '▥', descripcion: 'Recepción de carga' },
  { id: 'porteo', nombre: 'Porteo', icono: '⇄', descripcion: 'Traslado interno' },
  { id: 'otros', nombre: 'Otros servicios', icono: '⚙', descripcion: 'Servicios especiales' },
];

export const servicioPorId = (id) => SERVICIOS.find((s) => s.id === id) ?? null;
