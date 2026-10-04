import { formatFecha } from '../utils/format';
import { renderPlantilla } from '../utils/plantilla';
import { validarSolicitud } from '../utils/validacion';
import { apiFetch } from './api';

// Acceso a la API de solicitudes. Las páginas usan estas funciones; no llaman a fetch directamente.
const f = (folio) => `/solicitudes/${encodeURIComponent(folio)}`;

const numero = (valor) => (valor === '' || valor == null ? null : Number(valor));

/** Cliente: sus solicitudes. Personal: todas. */
export function listarSolicitudes({ estado, q } = {}) {
  const params = new URLSearchParams();
  if (estado) params.set('estado', estado);
  if (q) params.set('q', q);
  const query = params.toString();
  return apiFetch(`/solicitudes${query ? `?${query}` : ''}`);
}

export async function obtenerSolicitud(folio) {
  try {
    return await apiFetch(f(folio));
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

/** Valida en el navegador (respuesta inmediata) y luego en el servidor, que es quien decide. */
export async function crearSolicitud(datos) {
  const errores = validarSolicitud(datos);
  if (Object.keys(errores).length) {
    const error = new Error('Revisa los campos marcados.');
    error.campos = errores;
    throw error;
  }
  return apiFetch('/solicitudes', {
    method: 'POST',
    body: {
      ...datos,
      diasDemurrage: numero(datos.diasDemurrage) ?? 0,
      items: datos.items.map((i) => ({ ...i, cantidad: numero(i.cantidad), peso: numero(i.peso) ?? 0 })),
    },
  });
}

/** El cliente corrige su solicitud (solo en "Info solicitada"); vuelve a revisión. */
export async function corregirSolicitud(folio, datos) {
  const errores = validarSolicitud(datos);
  if (Object.keys(errores).length) {
    const error = new Error('Revisa los campos marcados.');
    error.campos = errores;
    throw error;
  }
  return apiFetch(f(folio), {
    method: 'PUT',
    body: {
      ...datos,
      diasDemurrage: numero(datos.diasDemurrage) ?? 0,
      items: datos.items.map((i) => ({ ...i, cantidad: numero(i.cantidad), peso: numero(i.peso) ?? 0 })),
    },
  });
}

export const aprobarSolicitud = (folio, { turnoConfirmado, sector, observacion }) =>
  apiFetch(`${f(folio)}/aprobar`, { method: 'POST', body: { turnoConfirmado, sector, observacion } });

export const solicitarInformacion = (folio, { observacion }) =>
  apiFetch(`${f(folio)}/solicitar-info`, { method: 'POST', body: { observacion } });

/** Aprobada → Programada → En ejecución → Finalizada. */
export const avanzarEstado = (folio) => apiFetch(`${f(folio)}/avanzar`, { method: 'POST' });

export const reenviarComunicacion = (folio, id) =>
  apiFetch(`${f(folio)}/comunicaciones/${id}/reenviar`, { method: 'POST' });

// ---------- Vista previa del correo de confirmación (el envío real lo arma el servidor)

export function variablesConfirmacion(solicitud, aprobacion) {
  return {
    folio: solicitud.folio,
    servicio: solicitud.servicio,
    cliente: solicitud.cliente,
    solicitante: solicitud.solicitante,
    fecha_requerida: formatFecha(solicitud.fechaRequerida),
    turno: aprobacion.turnoConfirmado || solicitud.turno,
    sector: aprobacion.sector,
    obs_aprobacion: aprobacion.observacion || 'Sin observaciones',
    responsable: aprobacion.responsable,
  };
}

/** Arma la vista previa con una plantilla ya cargada (sin llamar a la API). */
export function previsualizarConfirmacion(solicitud, aprobacion, plantilla) {
  const variables = variablesConfirmacion(solicitud, aprobacion);
  return {
    plantilla: plantilla.origen,
    destinatario: solicitud.correoSolicitante,
    asunto: renderPlantilla(plantilla.asunto, variables),
    mensaje: renderPlantilla(plantilla.mensaje, variables),
  };
}
