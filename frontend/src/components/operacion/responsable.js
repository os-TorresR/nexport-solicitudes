import { escribir, leer } from '../../services/storage';

// Recuerda el último nombre usado en este navegador (comodidad mientras no hay login).
const CLAVE = 'nexport_responsable';
export const responsableGuardado = () => leer(CLAVE, '');
export const guardarResponsable = (nombre) => escribir(CLAVE, String(nombre ?? '').trim());
