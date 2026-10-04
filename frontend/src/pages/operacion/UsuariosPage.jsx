import { useEffect, useMemo, useState } from 'react';

import EmptyState from '../../components/common/EmptyState';
import LoadError from '../../components/common/LoadError';
import Notice from '../../components/common/Notice';
import SectionHead from '../../components/common/SectionHead';
import KpiTile from '../../components/operacion/KpiTile';
import { ETIQUETA_ROL, ROLES, useAuth } from '../../hooks/useAuth';
import OperacionLayout from '../../layouts/OperacionLayout';
import { actualizarUsuario, listarUsuarios } from '../../services/usuariosService';
import { formatFechaHora, normalizarTexto } from '../../utils/format';

const ESTADOS_USUARIO = ['Pendiente', 'Activo', 'Inactivo'];

/** Administración de usuarios: activar registros nuevos y asignar roles. Solo Admin. */
export default function UsuariosPage() {
  const { usuario: yo } = useAuth();
  const [usuarios, setUsuarios] = useState(null);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [guardando, setGuardando] = useState(null);

  const cargar = () => {
    setError(null);
    listarUsuarios().then(setUsuarios).catch(setError);
  };
  useEffect(cargar, []);

  const filtrados = useMemo(() => {
    const q = normalizarTexto(busqueda.trim());
    return (usuarios ?? []).filter((u) => !q || normalizarTexto(`${u.nombre} ${u.correo} ${u.empresa ?? ''}`).includes(q));
  }, [usuarios, busqueda]);

  const cambiar = async (u, cambios, mensaje) => {
    setGuardando(u.id);
    setAviso(null);
    try {
      const actualizado = await actualizarUsuario(u.id, cambios);
      setUsuarios((lista) => lista.map((x) => (x.id === actualizado.id ? actualizado : x)));
      setAviso({ tipo: 'normal', texto: mensaje(actualizado) });
    } catch (e) {
      setAviso({ tipo: 'error', texto: e.message });
    } finally {
      setGuardando(null);
    }
  };

  const pendientes = (usuarios ?? []).filter((u) => u.estado === 'Pendiente').length;

  return (
    <OperacionLayout>
      <SectionHead eyebrow="ADMINISTRACIÓN" titulo="Usuarios" first>
        <button type="button" className="ghost" onClick={cargar}>
          Actualizar
        </button>
      </SectionHead>
      <LoadError error={error} onReintentar={cargar} />
      {aviso && <Notice tipo={aviso.tipo}>{aviso.texto}</Notice>}

      {usuarios && (
        <>
          <div className="kpis">
            <KpiTile valor={pendientes} etiqueta="Por activar" alerta />
            <KpiTile valor={usuarios.filter((u) => u.estado === 'Activo').length} etiqueta="Activos" />
            <KpiTile valor={usuarios.filter((u) => u.rol === ROLES.CLIENTE).length} etiqueta="Clientes" />
            <KpiTile valor={usuarios.filter((u) => u.rol !== ROLES.CLIENTE).length} etiqueta="Personal" />
          </div>

          <div className="filters" style={{ gridTemplateColumns: '1fr' }}>
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, correo o empresa..."
              aria-label="Buscar usuarios"
            />
          </div>

          {!filtrados.length ? (
            <EmptyState>No hay usuarios con este filtro.</EmptyState>
          ) : (
            <div className="table-wrap card" style={{ padding: 0 }}>
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Empresa</th>
                    <th>Registro</th>
                    <th>Estado</th>
                    <th>Rol</th>
                    <th aria-label="Acciones" />
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((u) => {
                    const soyYo = u.id === yo?.id;
                    const ocupado = guardando === u.id;
                    return (
                      <tr key={u.id}>
                        <td>
                          <strong>{u.nombre}</strong>
                          <div className="muted">{u.correo}</div>
                        </td>
                        <td>{u.empresa || '—'}</td>
                        <td>{formatFechaHora(u.creadoEn)}</td>
                        <td>
                          <span className={`estado-usuario ${u.estado.toLowerCase()}`}>{u.estado}</span>
                        </td>
                        <td>
                          <select
                            aria-label={`Rol de ${u.nombre}`}
                            value={u.rol}
                            disabled={ocupado || soyYo}
                            onChange={(e) =>
                              cambiar(u, { rol: e.target.value }, (x) => `${x.nombre} ahora es ${ETIQUETA_ROL[x.rol]}.`)
                            }
                          >
                            {Object.values(ROLES).map((r) => (
                              <option key={r} value={r}>
                                {ETIQUETA_ROL[r]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          {u.estado !== 'Activo' ? (
                            <button
                              type="button"
                              className="primary small"
                              disabled={ocupado}
                              onClick={() => cambiar(u, { estado: 'Activo' }, (x) => `${x.nombre} fue activado.`)}
                            >
                              {u.estado === 'Pendiente' ? 'Activar' : 'Reactivar'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="ghost small"
                              disabled={ocupado || soyYo}
                              onClick={() => cambiar(u, { estado: 'Inactivo' }, (x) => `${x.nombre} fue desactivado.`)}
                            >
                              Desactivar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <p className="muted">
            Los usuarios nuevos se registran como Cliente y quedan pendientes hasta que los actives (reciben un correo al
            activarse). Estados posibles: {ESTADOS_USUARIO.join(', ')}.
          </p>
        </>
      )}
    </OperacionLayout>
  );
}
