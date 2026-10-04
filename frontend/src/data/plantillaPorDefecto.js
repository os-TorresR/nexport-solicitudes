// Plantilla estándar de confirmación al cliente (presentación "Fase inicial", lámina 5).
export const PLANTILLA_POR_DEFECTO = {
  asunto: 'Solicitud {folio} aprobada · {servicio}',
  mensaje:
    'Estimado/a {solicitante}:\n\n' +
    'Su solicitud {folio} fue aprobada para {fecha_requerida} · {turno}.\n' +
    'Sector: {sector}. Observaciones: {obs_aprobacion}.\n\n' +
    'Saludos cordiales,\nOperaciones CFS IMPO · NXPORT',
};

export const VARIABLES_PLANTILLA = [
  { clave: 'folio', descripcion: 'Folio de la solicitud' },
  { clave: 'servicio', descripcion: 'Servicio solicitado' },
  { clave: 'cliente', descripcion: 'Cliente' },
  { clave: 'solicitante', descripcion: 'Nombre del solicitante' },
  { clave: 'fecha_requerida', descripcion: 'Fecha requerida' },
  { clave: 'turno', descripcion: 'Turno confirmado' },
  { clave: 'sector', descripcion: 'Sector / ventana' },
  { clave: 'obs_aprobacion', descripcion: 'Observación de la aprobación' },
  { clave: 'responsable', descripcion: 'Responsable que aprobó' },
];
