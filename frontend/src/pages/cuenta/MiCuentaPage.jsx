import { useState } from 'react';

import Field from '../../components/common/Field';
import Notice from '../../components/common/Notice';
import SectionHead from '../../components/common/SectionHead';
import { ETIQUETA_ROL, esPersonal, useAuth } from '../../hooks/useAuth';
import ClienteLayout from '../../layouts/ClienteLayout';
import OperacionLayout from '../../layouts/OperacionLayout';
import { cambiarPassword } from '../../services/authService';

const VACIO = { actual: '', nueva: '', confirmar: '' };

/** Datos de la cuenta y cambio de contraseña (cualquier usuario con sesión). */
export default function MiCuentaPage() {
  const { usuario } = useAuth();
  const Layout = esPersonal(usuario) ? OperacionLayout : ClienteLayout;
  const [form, setForm] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [aviso, setAviso] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (campo) => (e) => {
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  const guardar = async (e) => {
    e.preventDefault();
    setAviso(null);
    const encontrados = {};
    if (!form.actual) encontrados.actual = 'Ingresa tu contraseña actual.';
    if (form.nueva.length < 8) encontrados.nueva = 'La nueva contraseña debe tener al menos 8 caracteres.';
    if (form.confirmar !== form.nueva) encontrados.confirmar = 'Las contraseñas no coinciden.';
    if (Object.keys(encontrados).length) {
      setErrores(encontrados);
      return;
    }
    setEnviando(true);
    try {
      const { mensaje } = await cambiarPassword(form.actual, form.nueva);
      setForm(VACIO);
      setErrores({});
      setAviso({ tipo: 'normal', texto: mensaje });
    } catch (err) {
      // El servidor responde con los nombres passwordActual / passwordNueva.
      const c = err.campos ?? {};
      setErrores({ actual: c.passwordActual, nueva: c.passwordNueva });
      setAviso({ tipo: 'error', texto: err.message });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Layout>
      <SectionHead eyebrow="MI CUENTA" titulo={usuario?.nombre ?? 'Mi cuenta'} first />
      <div className="detail-layout">
        <form className="card" onSubmit={guardar} noValidate>
          <h3>Cambiar contraseña</h3>
          {aviso && <Notice tipo={aviso.tipo}>{aviso.texto}</Notice>}
          <div className="stack">
            <Field label="Contraseña actual" required error={errores.actual}>
              <input type="password" value={form.actual} onChange={cambiar('actual')} autoComplete="current-password" />
            </Field>
            <Field label="Nueva contraseña" required error={errores.nueva}>
              <input
                type="password"
                value={form.nueva}
                onChange={cambiar('nueva')}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
              />
            </Field>
            <Field label="Confirmar nueva contraseña" required error={errores.confirmar}>
              <input type="password" value={form.confirmar} onChange={cambiar('confirmar')} autoComplete="new-password" />
            </Field>
          </div>
          <div className="form-actions">
            <button type="submit" className="primary" disabled={enviando}>
              {enviando ? 'Guardando…' : 'Cambiar contraseña'}
            </button>
          </div>
        </form>

        <div className="card">
          <h3>Datos de la cuenta</h3>
          <dl className="data-list" style={{ gridTemplateColumns: '1fr', marginBottom: 0 }}>
            <div>
              <dt>Correo</dt>
              <dd>{usuario?.correo}</dd>
            </div>
            <div>
              <dt>Empresa</dt>
              <dd>{usuario?.empresa || '—'}</dd>
            </div>
            <div>
              <dt>Rol</dt>
              <dd>{ETIQUETA_ROL[usuario?.rol] ?? usuario?.rol}</dd>
            </div>
          </dl>
        </div>
      </div>
    </Layout>
  );
}
