import { Navigate, useLocation } from 'react-router-dom';

import { esPersonal, useAuth } from '../hooks/useAuth';
import { PATHS } from './paths';

/** Página de inicio según el rol: el personal va al panel, el cliente al portal. */
export const inicioSegunRol = (usuario) => (esPersonal(usuario) ? PATHS.operacion : PATHS.inicio);

/**
 * Protege una página: sin sesión → /ingresar (y vuelve después del login);
 * con sesión pero sin el rol requerido → su página de inicio.
 */
export default function RequireAuth({ roles, children }) {
  const { usuario, verificando } = useAuth();
  const location = useLocation();

  if (verificando && !usuario) return null;
  if (!usuario) return <Navigate to={PATHS.ingresar} replace state={{ desde: location.pathname }} />;
  if (roles && !roles.includes(usuario.rol)) return <Navigate to={inicioSegunRol(usuario)} replace />;
  return children;
}
