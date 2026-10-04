import { servicioPorId } from '../data/servicios';
import { apiFetch } from './api';

// Plantillas de confirmación al cliente: una general y, opcionalmente, una por servicio.

export const obtenerPlantillas = () => apiFetch('/plantillas');

/** Plantilla que corresponde a un servicio: la propia si existe, si no la general. */
export async function plantillaParaServicio(servicioId) {
  const { general, porServicio } = await obtenerPlantillas();
  const propia = porServicio?.[servicioId];
  if (propia) return { ...propia, origen: `Plantilla ${servicioPorId(servicioId)?.nombre ?? servicioId}` };
  return { ...general, origen: 'Plantilla general' };
}

/** destino: 'general' o el id de un servicio. Devuelve todas las plantillas actualizadas. */
export function guardarPlantilla(destino, { asunto, mensaje }) {
  if (!String(asunto ?? '').trim() || !String(mensaje ?? '').trim()) {
    return Promise.reject(new Error('El asunto y el mensaje son obligatorios.'));
  }
  return apiFetch(`/plantillas/${encodeURIComponent(destino)}`, { method: 'PUT', body: { asunto, mensaje } });
}

/** 'general' vuelve al texto estándar; un servicio vuelve a usar la general. */
export const restablecerPlantilla = (destino) =>
  apiFetch(`/plantillas/${encodeURIComponent(destino)}`, { method: 'DELETE' });
