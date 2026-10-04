import { Link, useLocation } from 'react-router-dom';

import NavItem from '../components/common/NavItem';
import Topbar from '../components/common/Topbar';
import UserMenu from '../components/common/UserMenu';
import { esPersonal, useAuth } from '../hooks/useAuth';
import { PATHS } from '../routes/paths';

/** Portal del cliente: barra superior + navegación inferior (como el MVP original). */
export default function ClienteLayout({ children }) {
  const { pathname } = useLocation();
  const { usuario } = useAuth();
  return (
    <>
      <Topbar subtitulo="Solicitud de Servicios Operacionales">
        <div className="topbar-right">
          {esPersonal(usuario) && (
            <nav className="topbar-nav" aria-label="Panel">
              <NavItem to={PATHS.operacion}>Panel de operación</NavItem>
            </nav>
          )}
          <UserMenu />
        </div>
      </Topbar>
      <main className="shell">{children}</main>
      <nav className="bottom-nav" aria-label="Navegación principal">
        <NavItem to={PATHS.inicio} exacto>
          Inicio
        </NavItem>
        <NavItem to={PATHS.misSolicitudes}>Solicitudes</NavItem>
        <Link
          to={PATHS.inicio}
          state={{ irA: 'catalogo' }}
          className={pathname.startsWith('/solicitar/') ? 'active' : undefined}
        >
          Catálogo
        </Link>
      </nav>
    </>
  );
}
