import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import Field from '../../components/common/Field';
import Notice from '../../components/common/Notice';
import { useAuth } from '../../hooks/useAuth';
import AuthLayout from '../../layouts/AuthLayout';
import { PATHS } from '../../routes/paths';
import { inicioSegunRol } from '../../routes/RequireAuth';

const INICIAL = { nombre: '', empresa: '', correo: '', telefono: '', password: '', confirmar: '' };

function validar(f) {
  const e = {};
  if (!f.nombre.trim()) e.nombre = 'Ingresa tu nombre.';
  if (!f.empresa.trim()) e.empresa = 'Ingresa tu empresa.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.correo.trim())) e.correo = 'Ingresa un correo válido.';
  if (f.password.length < 8) e.password = 'La contraseña debe tener al menos 8 caracteres.';
  if (f.confirmar !== f.password) e.confirmar = 'Las contraseñas no coinciden.';
  return e;
}

export default function RegistroPage() {
  const { usuario, registro } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(INICIAL);
  const [errores, setErrores] = useState({});
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [pendiente, setPendiente] = useState('');

  if (usuario) return <Navigate to={inicioSegunRol(usuario)} replace />;

  const cambiar = (campo) => (e) => {
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    const encontrados = validar(form);
    if (Object.keys(encontrados).length) {
      setErrores(encontrados);
      return;
    }
    setEnviando(true);
    try {
      const { confirmar: _confirmar, ...datos } = form;
      const respuesta = await registro({ ...datos, correo: datos.correo.trim() });
      if (respuesta.requiereAprobacion) setPendiente(respuesta.mensaje);
      else navigate(PATHS.inicio, { replace: true });
    } catch (err) {
      setErrores(err.campos ?? {});
      setError(err.message);
      setEnviando(false);
    }
  };

  if (pendiente) {
    return (
      <AuthLayout>
        <div className="success">
          <div className="success-icon" aria-hidden="true">
            ✓
          </div>
          <p className="eyebrow" style={{ marginTop: 18 }}>
            REGISTRO RECIBIDO
          </p>
          <h2>Cuenta creada</h2>
          <p className="muted">{pendiente}</p>
          <div className="form-actions" style={{ justifyContent: 'center' }}>
            <Link to={PATHS.ingresar} className="primary">
              Ir a ingresar
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <form className="form-card auth-card wide" onSubmit={enviar} noValidate>
        <p className="eyebrow">NUEVA CUENTA</p>
        <h2>Registro de usuario</h2>
        <p className="muted">Crea tu cuenta para solicitar servicios. Si tu empresa está habilitada podrás ingresar de inmediato; si no, un administrador activará tu cuenta.</p>
        {error && <Notice tipo="error">{error}</Notice>}
        <div className="grid two">
          <Field label="Nombre y apellido" required error={errores.nombre}>
            <input value={form.nombre} onChange={cambiar('nombre')} autoComplete="name" />
          </Field>
          <Field label="Empresa" required error={errores.empresa}>
            <input value={form.empresa} onChange={cambiar('empresa')} autoComplete="organization" placeholder="Ej. Bridgestone" />
          </Field>
          <Field label="Correo" required error={errores.correo}>
            <input type="email" value={form.correo} onChange={cambiar('correo')} autoComplete="email" />
          </Field>
          <Field label="Teléfono" error={errores.telefono}>
            <input type="tel" value={form.telefono} onChange={cambiar('telefono')} autoComplete="tel" placeholder="+56 9 ..." />
          </Field>
          <Field label="Contraseña" required error={errores.password}>
            <input type="password" value={form.password} onChange={cambiar('password')} autoComplete="new-password" placeholder="Mínimo 8 caracteres" />
          </Field>
          <Field label="Confirmar contraseña" required error={errores.confirmar}>
            <input type="password" value={form.confirmar} onChange={cambiar('confirmar')} autoComplete="new-password" />
          </Field>
        </div>
        <div className="form-actions">
          <Link to={PATHS.ingresar} className="ghost">
            Ya tengo cuenta
          </Link>
          <button type="submit" className="primary" disabled={enviando}>
            {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
