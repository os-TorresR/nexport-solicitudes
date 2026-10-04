import { useEffect, useState } from 'react';

import { SECTOR_POR_DEFECTO, TURNOS } from '../../data/catalogos';
import { ESTADOS } from '../../data/estados';
import { puedeDarVb, useAuth } from '../../hooks/useAuth';
import { plantillaParaServicio } from '../../services/plantillasService';
import { aprobarSolicitud, previsualizarConfirmacion, solicitarInformacion } from '../../services/solicitudesService';
import Field from '../common/Field';
import Notice from '../common/Notice';
import MailPreview from './MailPreview';

export default function AprobacionPanel({ solicitud, onActualizada }) {
  const { usuario } = useAuth();
  const [form, setForm] = useState(() => ({
    turnoConfirmado: solicitud.turno,
    sector: SECTOR_POR_DEFECTO,
    observacion: '',
  }));
  const [errores, setErrores] = useState({});
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [plantilla, setPlantilla] = useState(null);

  // Solo el Jefe de Turno o un administrador aprueban solicitudes extraordinarias (después de las 15:00).
  const bloqueadaPorVb = solicitud.extraordinaria && !puedeDarVb(usuario);

  // La plantilla del servicio se carga una vez; la vista previa se arma al escribir.
  useEffect(() => {
    let vigente = true;
    plantillaParaServicio(solicitud.servicioId)
      .then((p) => vigente && setPlantilla(p))
      .catch(() => vigente && setPlantilla(null));
    return () => {
      vigente = false;
    };
  }, [solicitud.servicioId]);
  const preview = plantilla
    ? previsualizarConfirmacion(solicitud, { ...form, responsable: usuario?.nombre ?? '' }, plantilla)
    : null;

  const cambiar = (campo) => (e) => {
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  const ejecutar = async (accion) => {
    setError('');
    if (accion === 'info' && !form.observacion.trim()) {
      setErrores({ observacion: 'Explica qué información falta.' });
      setError('Completa los datos para solicitar información.');
      return;
    }
    setEnviando(true);
    try {
      const actualizada =
        accion === 'aprobar'
          ? await aprobarSolicitud(solicitud.folio, form)
          : await solicitarInformacion(solicitud.folio, form);
      setErrores({});
      onActualizada(actualizada);
    } catch (e) {
      setErrores(e.campos ?? {});
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="card">
      <h3>Aprobación operacional</h3>
      {solicitud.extraordinaria && (
        <Notice tipo="extra">
          Solicitud extraordinaria: la aprobación corresponde al Jefe de Turno.
          {bloqueadaPorVb ? ' Tu rol puede pedir información, pero no aprobarla.' : ''}
        </Notice>
      )}
      {solicitud.estado === ESTADOS.INFO_SOLICITADA && solicitud.aprobacion?.observacion && (
        <Notice tipo="info">Información pedida al cliente: {solicitud.aprobacion.observacion}</Notice>
      )}
      {error && <Notice tipo="error">{error}</Notice>}

      <p className="muted" style={{ marginTop: 0 }}>
        Responsable: <strong>{usuario?.nombre}</strong>
      </p>
      <div className="grid two">
        <Field label="Turno confirmado" required error={errores.turnoConfirmado}>
          <select value={form.turnoConfirmado} onChange={cambiar('turnoConfirmado')}>
            <option value="">Seleccionar...</option>
            {TURNOS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Sector / ventana" required error={errores.sector}>
          <input value={form.sector} onChange={cambiar('sector')} />
        </Field>
      </div>
      <div className="stack" style={{ marginBottom: 18 }}>
        <Field label="Observación" error={errores.observacion}>
          <input
            value={form.observacion}
            onChange={cambiar('observacion')}
            placeholder="Ej. Operación aprobada según disponibilidad"
          />
        </Field>
      </div>

      <p className="eyebrow">MENSAJE AL CLIENTE · {preview?.plantilla?.toUpperCase() ?? 'PLANTILLA'}</p>
      {preview && <MailPreview {...preview} />}

      <div className="form-actions">
        <button type="button" className="danger" disabled={enviando} onClick={() => ejecutar('info')}>
          Solicitar info
        </button>
        <button type="button" className="primary" disabled={enviando || bloqueadaPorVb} onClick={() => ejecutar('aprobar')}>
          {enviando ? 'Guardando…' : 'Aprobar y enviar confirmación'}
        </button>
      </div>
      <p className="muted">Para "Solicitar info" escribe en Observación qué falta; el cliente recibe un correo.</p>
    </div>
  );
}
