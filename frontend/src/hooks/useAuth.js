import { useContext } from 'react';

import { AuthContext } from '../context/authContext';

export const ROLES = {
  CLIENTE: 'Cliente',
  OPERACION: 'Operacion',
  JEFE_TURNO: 'JefeTurno',
  ADMIN: 'Admin',
};

export const ETIQUETA_ROL = {
  Cliente: 'Cliente',
  Operacion: 'Operación',
  JefeTurno: 'Jefe de Turno',
  Admin: 'Administrador',
};

export const ROLES_PERSONAL = [ROLES.OPERACION, ROLES.JEFE_TURNO, ROLES.ADMIN];
export const ROLES_VB = [ROLES.JEFE_TURNO, ROLES.ADMIN];

export const esPersonal = (usuario) => ROLES_PERSONAL.includes(usuario?.rol);
export const puedeDarVb = (usuario) => ROLES_VB.includes(usuario?.rol);

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return contexto;
}
