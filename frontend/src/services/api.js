import { escribir, leer } from './storage';

// Cliente HTTP de la API (backend C#). La URL se configura en .env.local → VITE_API_URL.
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5080/api').replace(/\/$/, '');
const CLAVE_TOKEN = 'nexport_sesion';

export const leerSesion = () => leer(CLAVE_TOKEN, null);
export const guardarSesion = (sesion) => escribir(CLAVE_TOKEN, sesion);
export const borrarSesion = () => {
  try {
    window.localStorage.removeItem(CLAVE_TOKEN);
  } catch {
    /* almacenamiento no disponible */
  }
};

/** Se dispara cuando la API responde 401 (sesión vencida): el AuthProvider cierra la sesión. */
export const EVENTO_SESION_VENCIDA = 'nexport:sesion-vencida';

// "CorreoSolicitante" (ProblemDetails de ASP.NET) → "correoSolicitante" (campos del formulario).
const aCampo = (clave) => clave.replace(/^\$\./, '').replace(/^./, (c) => c.toLowerCase());

function crearError(status, cuerpo) {
  const error = new Error(cuerpo?.message || cuerpo?.title || `Error ${status} al comunicarse con el servidor.`);
  error.status = status;
  if (cuerpo?.campos) error.campos = cuerpo.campos;
  else if (cuerpo?.errors) {
    error.campos = Object.fromEntries(
      Object.entries(cuerpo.errors).map(([clave, mensajes]) => [aCampo(clave), [].concat(mensajes)[0]]),
    );
    error.message = 'Revisa los campos marcados.';
  }
  return error;
}

export async function apiFetch(ruta, { method = 'GET', body, publico = false } = {}) {
  const sesion = leerSesion();
  let respuesta;
  try {
    respuesta = await fetch(`${BASE_URL}${ruta}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(sesion?.token && !publico ? { Authorization: `Bearer ${sesion.token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa que la API esté encendida.');
  }

  const texto = await respuesta.text();
  let cuerpo = null;
  try {
    cuerpo = texto ? JSON.parse(texto) : null;
  } catch {
    cuerpo = null;
  }

  if (respuesta.status === 401 && !publico) {
    borrarSesion();
    window.dispatchEvent(new Event(EVENTO_SESION_VENCIDA));
  }
  if (!respuesta.ok) throw crearError(respuesta.status, cuerpo);
  return cuerpo;
}
