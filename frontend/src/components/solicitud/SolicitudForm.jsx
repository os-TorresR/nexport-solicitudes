import { useState } from 'react';
import { Link } from 'react-router-dom';

import { TURNOS } from '../../data/catalogos';
import { hoyIso } from '../../utils/format';
import Field from '../common/Field';
import Notice from '../common/Notice';
import CargaItemForm from './CargaItemForm';
import CargaItemsTable from './CargaItemsTable';

export const FORM_VACIO = {
  cliente: '',
  solicitante: '',
  correoSolicitante: '',
  agencia: '',
  denominacionOT: '',
  nave: '',
  viaje: '',
  lineaNaviera: '',
  diasDemurrage: '0',
  fechaRequerida: '',
  turno: '',
  observaciones: '',
};

/**
 * Formulario de solicitud (información general, carga y observaciones).
 * Lo usan "Nueva solicitud" y "Corregir solicitud". `onEnviar` recibe los datos y puede
 * lanzar un error con `campos` para marcar los campos con problemas.
 */
export default function SolicitudForm({
  inicial,
  itemsIniciales = [],
  onEnviar,
  textoEnviar = 'Enviar solicitud',
  cancelarA,
  conComentario = false,
}) {
  const [form, setForm] = useState(() => ({ ...FORM_VACIO, ...inicial, comentario: '' }));
  const [items, setItems] = useState(itemsIniciales);
  const [errores, setErrores] = useState({});
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cambiar = (campo) => (e) => {
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  const agregarItem = (item) => {
    setItems((prev) => [...prev, item]);
    if (errores.items) setErrores((prev) => ({ ...prev, items: undefined }));
  };

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    if (conComentario && !form.comentario.trim()) {
      setErrores({ comentario: 'Cuéntale a Operación qué información agregaste.' });
      setError('Revisa los campos marcados.');
      return;
    }
    setEnviando(true);
    try {
      await onEnviar({ ...form, items });
    } catch (err) {
      setErrores(err.campos ?? {});
      setError(err.message);
      setEnviando(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const n = conComentario ? 1 : 0; // con comentario, la respuesta va primero

  return (
    <>
      {error && <Notice tipo="error">{error}</Notice>}
      <form className="form-card" onSubmit={enviar} noValidate>
        {conComentario && (
          <>
            <div className="form-title">1. Respuesta a Operación</div>
            <div className="stack" style={{ marginBottom: 18 }}>
              <Field label="¿Qué información agregaste o corregiste?" required error={errores.comentario}>
                <textarea
                  rows={3}
                  value={form.comentario}
                  onChange={cambiar('comentario')}
                  placeholder="Ej. Agregué el número de contenedor TGHU1234567 en el ítem 1."
                />
              </Field>
            </div>
          </>
        )}

        <div className="form-title">{1 + n}. Información general</div>
        <div className="grid two">
          <Field label="Cliente" required error={errores.cliente}>
            <input value={form.cliente} onChange={cambiar('cliente')} placeholder="Ej. Bridgestone" autoComplete="organization" />
          </Field>
          <Field label="Solicitante" required error={errores.solicitante}>
            <input value={form.solicitante} onChange={cambiar('solicitante')} placeholder="Nombre solicitante" autoComplete="name" />
          </Field>
          <Field label="Correo del solicitante" required error={errores.correoSolicitante}>
            <input
              type="email"
              value={form.correoSolicitante}
              onChange={cambiar('correoSolicitante')}
              placeholder="Para enviar la confirmación"
              autoComplete="email"
            />
          </Field>
          <Field label="Agencia">
            <input value={form.agencia} onChange={cambiar('agencia')} placeholder="Agencia" />
          </Field>
          <Field label="Denominación OT">
            <input value={form.denominacionOT} onChange={cambiar('denominacionOT')} placeholder="Descripción breve" />
          </Field>
          <Field label="Nave">
            <input value={form.nave} onChange={cambiar('nave')} placeholder="Nave" />
          </Field>
          <Field label="Viaje">
            <input value={form.viaje} onChange={cambiar('viaje')} placeholder="Viaje" />
          </Field>
          <Field label="Línea naviera">
            <input value={form.lineaNaviera} onChange={cambiar('lineaNaviera')} placeholder="Línea naviera" />
          </Field>
          <Field label="Días libres demurrage" error={errores.diasDemurrage}>
            <input type="number" min="0" value={form.diasDemurrage} onChange={cambiar('diasDemurrage')} />
          </Field>
          <Field label="Fecha requerida" required error={errores.fechaRequerida}>
            <input type="date" min={hoyIso()} value={form.fechaRequerida} onChange={cambiar('fechaRequerida')} />
          </Field>
          <Field label="Turno" required error={errores.turno}>
            <select value={form.turno} onChange={cambiar('turno')}>
              <option value="">Seleccionar...</option>
              {TURNOS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="form-title">{2 + n}. Detalle de carga</div>
        <CargaItemForm onAgregar={agregarItem} />
        {errores.items && (
          <p className="field-error" role="alert">
            {errores.items}
          </p>
        )}
        <CargaItemsTable items={items} onEliminar={(i) => setItems((prev) => prev.filter((_, j) => j !== i))} />

        <div className="form-title spaced">{3 + n}. Observaciones</div>
        <Field label="Información relevante" error={errores.observaciones}>
          <textarea
            rows={4}
            value={form.observaciones}
            onChange={cambiar('observaciones')}
            placeholder="Condiciones especiales, restricciones, referencias, etc."
          />
        </Field>

        <div className="form-actions">
          <Link to={cancelarA} className="ghost">
            Cancelar
          </Link>
          <button type="submit" className="primary" disabled={enviando}>
            {enviando ? 'Enviando…' : textoEnviar}
          </button>
        </div>
      </form>
    </>
  );
}
