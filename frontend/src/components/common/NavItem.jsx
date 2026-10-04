import { Link, useLocation } from 'react-router-dom';

/** Enlace que se marca como activo cuando la ruta actual coincide. */
export default function NavItem({ to, exacto = false, children }) {
  const { pathname } = useLocation();
  const activo = exacto ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
  return (
    <Link to={to} className={activo ? 'active' : undefined} aria-current={activo ? 'page' : undefined}>
      {children}
    </Link>
  );
}
