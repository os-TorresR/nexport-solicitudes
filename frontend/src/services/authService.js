import { apiFetch, borrarSesion, guardarSesion, leerSesion } from './api';

/** Devuelve { mensaje, requiereAprobacion, sesion }. Si la cuenta queda activa, deja la sesión iniciada. */
export async function registrarUsuario(datos) {
  const respuesta = await apiFetch('/auth/registro', { method: 'POST', body: datos, publico: true });
  if (respuesta?.sesion) guardarSesion(respuesta.sesion);
  return respuesta;
}

export async function iniciarSesion(correo, password) {
  const sesion = await apiFetch('/auth/login', { method: 'POST', body: { correo, password }, publico: true });
  guardarSesion(sesion);
  return sesion.usuario;
}

/** Usuario de la sesión guardada (valida el token contra la API). */
export async function usuarioActual() {
  if (!leerSesion()?.token) return null;
  return apiFetch('/auth/me');
}

export const cambiarPassword = (passwordActual, passwordNueva) =>
  apiFetch('/auth/cambiar-password', { method: 'POST', body: { passwordActual, passwordNueva } });

export function cerrarSesion() {
  borrarSesion();
}
