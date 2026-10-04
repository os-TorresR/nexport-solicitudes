import { Route, Routes } from 'react-router-dom';

import { ROLES, ROLES_PERSONAL } from '../hooks/useAuth';
import LoginPage from '../pages/auth/LoginPage';
import RegistroPage from '../pages/auth/RegistroPage';
import MiCuentaPage from '../pages/cuenta/MiCuentaPage';
import EditarSolicitudPage from '../pages/cliente/EditarSolicitudPage';
import HomePage from '../pages/cliente/HomePage';
import MisSolicitudesPage from '../pages/cliente/MisSolicitudesPage';
import NuevaSolicitudPage from '../pages/cliente/NuevaSolicitudPage';
import SolicitudDetallePage from '../pages/cliente/SolicitudDetallePage';
import SolicitudEnviadaPage from '../pages/cliente/SolicitudEnviadaPage';
import NotFoundPage from '../pages/NotFoundPage';
import BandejaPage from '../pages/operacion/BandejaPage';
import PlantillasPage from '../pages/operacion/PlantillasPage';
import RevisionPage from '../pages/operacion/RevisionPage';
import UsuariosPage from '../pages/operacion/UsuariosPage';
import { PATHS } from './paths';
import RequireAuth from './RequireAuth';

const conSesion = (pagina, roles) => <RequireAuth roles={roles}>{pagina}</RequireAuth>;

export default function AppRouter() {
  return (
    <Routes>
      {/* Acceso */}
      <Route path={PATHS.ingresar} element={<LoginPage />} />
      <Route path={PATHS.registro} element={<RegistroPage />} />

      {/* Portal del cliente (cualquier usuario con sesión) */}
      <Route path={PATHS.inicio} element={conSesion(<HomePage />)} />
      <Route path={PATHS.solicitar} element={conSesion(<NuevaSolicitudPage />)} />
      <Route path={PATHS.enviada} element={conSesion(<SolicitudEnviadaPage />)} />
      <Route path={PATHS.misSolicitudes} element={conSesion(<MisSolicitudesPage />)} />
      <Route path={PATHS.detalle} element={conSesion(<SolicitudDetallePage />)} />
      <Route path={PATHS.editar} element={conSesion(<EditarSolicitudPage />)} />
      <Route path={PATHS.cuenta} element={conSesion(<MiCuentaPage />)} />

      {/* Panel de operación */}
      <Route path={PATHS.operacion} element={conSesion(<BandejaPage />, ROLES_PERSONAL)} />
      <Route path={PATHS.plantillas} element={conSesion(<PlantillasPage />, ROLES_PERSONAL)} />
      <Route path={PATHS.usuarios} element={conSesion(<UsuariosPage />, [ROLES.ADMIN])} />
      <Route path={PATHS.revision} element={conSesion(<RevisionPage />, ROLES_PERSONAL)} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
