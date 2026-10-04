import Topbar from '../components/common/Topbar';
import { PATHS } from '../routes/paths';

/** Pantallas de ingreso y registro: tarjeta centrada, sin menús. */
export default function AuthLayout({ children }) {
  return (
    <>
      <Topbar subtitulo="Solicitud de Servicios Operacionales" badge="Portal web" inicio={PATHS.ingresar} />
      <main className="shell auth-shell">{children}</main>
    </>
  );
}
