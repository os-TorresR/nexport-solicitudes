import { Link, useNavigate } from 'react-router-dom';

import { ETIQUETA_ROL, useAuth } from '../../hooks/useAuth';
import { PATHS } from '../../routes/paths';

export default function UserMenu() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  if (!usuario) return null;

  const salir = () => {
    logout();
    navigate(PATHS.ingresar, { replace: true });
  };

  return (
    <div className="user-box">
      <div className="who">
        <strong title={usuario.correo}>{usuario.nombre}</strong>
        <span>
          {ETIQUETA_ROL[usuario.rol] ?? usuario.rol}
          {usuario.empresa ? ` · ${usuario.empresa}` : ''}
        </span>
      </div>
      <Link to={PATHS.cuenta} className="ghost small">
        Mi cuenta
      </Link>
      <button type="button" className="ghost small" onClick={salir}>
        Salir
      </button>
    </div>
  );
}
