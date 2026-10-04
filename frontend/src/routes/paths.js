export const PATHS = {
  ingresar: '/ingresar',
  registro: '/registro',
  cuenta: '/cuenta',
  inicio: '/',
  solicitar: '/solicitar/:servicioId',
  enviada: '/solicitud-enviada/:folio',
  misSolicitudes: '/solicitudes',
  detalle: '/solicitudes/:folio',
  editar: '/solicitudes/:folio/editar',
  operacion: '/operacion',
  revision: '/operacion/solicitudes/:folio',
  plantillas: '/operacion/plantillas',
  usuarios: '/operacion/usuarios',
};

const conParam = (ruta, clave, valor) => ruta.replace(`:${clave}`, encodeURIComponent(valor));

export const rutaSolicitar = (servicioId) => conParam(PATHS.solicitar, 'servicioId', servicioId);
export const rutaEnviada = (folio) => conParam(PATHS.enviada, 'folio', folio);
export const rutaDetalle = (folio) => conParam(PATHS.detalle, 'folio', folio);
export const rutaEditar = (folio) => conParam(PATHS.editar, 'folio', folio);
export const rutaRevision = (folio) => conParam(PATHS.revision, 'folio', folio);
