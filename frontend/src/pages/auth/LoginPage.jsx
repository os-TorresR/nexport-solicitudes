import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import Field from '../../components/common/Field';
import Notice from '../../components/common/Notice';
import { useAuth } from '../../hooks/useAuth';
import AuthLayout from '../../layouts/AuthLayout';
import { PATHS } from '../../routes/paths';
import { inicioSegunRol } from '../../routes/RequireAuth';

export default function LoginPage() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to={inicioSegunRol(usuario)} replace />;

  const ingresar = async (e) => {
    e.preventDefault();
    setError('');
    if (!correo.trim() || !password) {
      setError('Ingresa tu correo y contraseña.');
      return;
    }
    setEnviando(true);
    try {
      const u = await login(correo.trim(), password);
      navigate(location.state?.desde ?? inicioSegunRol(u), { replace: true });
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <AuthLayout>
      <form className="form-card auth-card" onSubmit={ingresar} noValidate>
        <p className="eyebrow">PORTAL DE SOLICITUDES</p>
        <h2>Ingresar</h2>
        <p className="muted">Solicita servicios CFS IMPO y revisa el estado de tus solicitudes.</p>
        {location.state?.mensaje && <Notice tipo="normal">{location.state.mensaje}</Notice>}
        {error && <Notice tipo="error">{error}</Notice>}
        <div className="stack">
          <Field label="Correo">
            <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} autoComplete="email" autoFocus />
          </Field>
          <Field label="Contraseña">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </Field>
        </div>
        <div className="form-actions">
          <button type="submit" className="primary block" disabled={enviando}>
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </button>
        </div>
        <p className="muted auth-switch">
          ¿No tienes cuenta? <Link to={PATHS.registro}>Regístrate</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
