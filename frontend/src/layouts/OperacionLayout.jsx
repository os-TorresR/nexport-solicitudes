import NavItem from '../components/common/NavItem';
import Topbar from '../components/common/Topbar';
import UserMenu from '../components/common/UserMenu';
import { ROLES, useAuth } from '../hooks/useAuth';
import { PATHS } from '../routes/paths';

/** Panel interno de Operación CFS IMPO (revisión, aprobación, plantillas y usuarios). */
export default function OperacionLayout({ children }) {
  const { usuario } = useAuth();
  return (
    <>
      <Topbar subtitulo="Panel de operación · CFS IMPO" inicio={PATHS.operacion} className="operacion">
        <div className="topbar-right">
          <nav className="topbar-nav" aria-label="Panel de operación">
            <NavItem to={PATHS.operacion} exacto>
              Bandeja
            </NavItem>
            <NavItem to={PATHS.plantillas}>Plantillas</NavItem>
            {usuario?.rol === ROLES.ADMIN && <NavItem to={PATHS.usuarios}>Usuarios</NavItem>}
            <NavItem to={PATHS.inicio} exacto>
              Portal cliente
            </NavItem>
          </nav>
          <UserMenu />
        </div>
      </Topbar>
      <main className="shell wide">{children}</main>
    </>
  );
}
