import { useEffect, useRef, useState } from 'react';

import Field from '../../components/common/Field';
import LoadError from '../../components/common/LoadError';
import Notice from '../../components/common/Notice';
import SectionHead from '../../components/common/SectionHead';
import MailPreview from '../../components/operacion/MailPreview';
import { VARIABLES_PLANTILLA } from '../../data/plantillaPorDefecto';
import { SERVICIOS } from '../../data/servicios';
import { puedeDarVb, useAuth } from '../../hooks/useAuth';
import OperacionLayout from '../../layouts/OperacionLayout';
import { guardarPlantilla, obtenerPlantillas, restablecerPlantilla } from '../../services/plantillasService';
import { renderPlantilla } from '../../utils/plantilla';

const EJEMPLO = {
  folio: 'SOL-CFS-20260925-0041',
  servicio: 'Desconsolidación',
  cliente: 'Bridgestone',
  solicitante: 'María Pérez',
  fecha_requerida: '26-09-2026',
  turno: '2° Turno',
  sector: 'CFS IMPO',
  obs_aprobacion: 'Operación aprobada según disponibilidad',
  responsable: 'Jefe de Turno',
};

export default function PlantillasPage() {
  const { usuario } = useAuth();
  const puedeEditar = puedeDarVb(usuario);
  const [todas, setTodas] = useState(null);
  const [errorCarga, setErrorCarga] = useState(null);
  const [destino, setDestino] = useState('general');
  const [borrador, setBorrador] = useState({ asunto: '', mensaje: '' });
  const [aviso, setAviso] = useState(null);
  const mensajeRef = useRef(null);

  const cargar = () => {
    setErrorCarga(null);
    obtenerPlantillas().then(setTodas).catch(setErrorCarga);
  };
  useEffect(cargar, []);

  // Al cambiar de destino, carga la plantilla correspondiente (la propia o la general).
  useEffect(() => {
    if (!todas) return;
    const base = destino === 'general' ? todas.general : (todas.porServicio[destino] ?? todas.general);
    setBorrador({ asunto: base.asunto, mensaje: base.mensaje });
  }, [todas, destino]);

  if (!todas) {
    return (
      <OperacionLayout>
        <LoadError error={errorCarga} onReintentar={cargar} />
      </OperacionLayout>
    );
  }

  const tienePropia = destino !== 'general' && Boolean(todas.porServicio[destino]);
  const nombreServicio = SERVICIOS.find((s) => s.id === destino)?.nombre;

  const insertarVariable = (clave) => {
    const campo = mensajeRef.current;
    const token = `{${clave}}`;
    const inicio = campo?.selectionStart ?? borrador.mensaje.length;
    const fin = campo?.selectionEnd ?? borrador.mensaje.length;
    setBorrador((prev) => ({ ...prev, mensaje: prev.mensaje.slice(0, inicio) + token + prev.mensaje.slice(fin) }));
    requestAnimationFrame(() => {
      campo?.focus();
      campo?.setSelectionRange(inicio + token.length, inicio + token.length);
    });
  };

  const guardar = async () => {
    try {
      setTodas(await guardarPlantilla(destino, borrador));
      setAviso({ tipo: 'normal', texto: 'Plantilla guardada.' });
    } catch (e) {
      setAviso({ tipo: 'error', texto: e.message });
    }
  };

  const restablecer = async () => {
    try {
      setTodas(await restablecerPlantilla(destino));
    } catch (e) {
      setAviso({ tipo: 'error', texto: e.message });
      return;
    }
    setAviso({
      tipo: 'info',
      texto: destino === 'general' ? 'Se restauró la plantilla estándar.' : `${nombreServicio} vuelve a usar la plantilla general.`,
    });
  };

  return (
    <OperacionLayout>
      <SectionHead eyebrow="CONFIRMACIÓN AL CLIENTE" titulo="Plantillas de respuesta" first />
      <p className="muted" style={{ marginTop: -6 }}>
        Al aprobar una solicitud, el mensaje al cliente se arma con la plantilla del servicio o, si no tiene una propia,
        con la general.
      </p>
      {!puedeEditar && <Notice tipo="info">Solo el Jefe de Turno o un administrador pueden modificar las plantillas.</Notice>}
      {aviso && <Notice tipo={aviso.tipo}>{aviso.texto}</Notice>}

      <div className="detail-layout">
        <div className="card">
          <div className="grid two" style={{ marginBottom: 12 }}>
            <Field label="Plantilla para">
              <select
                value={destino}
                onChange={(e) => {
                  setDestino(e.target.value);
                  setAviso(null);
                }}
              >
                <option value="general">General (todos los servicios)</option>
                {SERVICIOS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                    {todas.porServicio[s.id] ? ' · propia' : ''}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          {destino !== 'general' && !tienePropia && (
            <Notice tipo="info">{nombreServicio} usa hoy la plantilla general. Al guardar, tendrá una propia.</Notice>
          )}
          <div className="stack">
            <Field label="Asunto" required>
              <input value={borrador.asunto} onChange={(e) => setBorrador((p) => ({ ...p, asunto: e.target.value }))} />
            </Field>
            <Field label="Mensaje" required>
              <textarea
                ref={mensajeRef}
                rows={9}
                value={borrador.mensaje}
                onChange={(e) => setBorrador((p) => ({ ...p, mensaje: e.target.value }))}
              />
            </Field>
          </div>
          <p className="eyebrow" style={{ marginTop: 14 }}>
            VARIABLES (CLIC PARA INSERTAR EN EL MENSAJE)
          </p>
          <div className="chips">
            {VARIABLES_PLANTILLA.map((v) => (
              <button key={v.clave} type="button" className="chip" title={v.descripcion} onClick={() => insertarVariable(v.clave)}>
                {`{${v.clave}}`}
              </button>
            ))}
          </div>
          {puedeEditar && (
            <div className="form-actions">
              {(destino === 'general' || tienePropia) && (
                <button type="button" className="ghost" onClick={restablecer}>
                  {destino === 'general' ? 'Restaurar estándar' : 'Usar la general'}
                </button>
              )}
              <button type="button" className="primary" onClick={guardar}>
                Guardar plantilla
              </button>
            </div>
          )}
        </div>

        <div className="card">
          <h3>Vista previa</h3>
          <p className="muted" style={{ marginTop: 0 }}>
            Con datos de ejemplo.
          </p>
          <MailPreview
            destinatario="cliente@empresa.cl"
            asunto={renderPlantilla(borrador.asunto, EJEMPLO)}
            mensaje={renderPlantilla(borrador.mensaje, EJEMPLO)}
          />
        </div>
      </div>
    </OperacionLayout>
  );
}
