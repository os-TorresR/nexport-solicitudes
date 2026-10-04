import { apiFetch } from './api';

export const listarUsuarios = () => apiFetch('/usuarios');

/** cambios: { rol?, estado? } */
export const actualizarUsuario = (id, cambios) => apiFetch(`/usuarios/${id}`, { method: 'PATCH', body: cambios });
