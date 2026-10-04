import { useState } from 'react';

import { reenviarComunicacion } from '../../services/solicitudesService';
import { formatFechaHora } from '../../utils/format';
import Notice from '../common/Notice';
import MailPreview from './MailPreview';

const CLASE_ESTADO = { Enviado: 'ok', Simulado: 'ok', Error: 'error', Pendiente: '' };
const ETIQUETA_ESTADO = { Enviado: 'Enviado', Simulado: 'Simulado (SMTP apagado)', Error: 'Error de envío', Pendiente: 'Pendiente' };

export default function ComunicacionCard({ folio, comunicacion: c, onActualizada, permitirReenvio = false }) {
  const [aviso, setAviso] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const fallida = c.estadoEnvio === 'Error' || c.estadoEnvio === 'Pendiente';

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(`Asunto: ${c.asunto}\n\n${c.mensaje}`);
      setAviso({ tipo: 'info', texto: 'Mensaje copiado.' });
    } catch {
      setAviso({ tipo: 'info', texto: 'No se pudo copiar automáticamente; selecciona el texto y cópialo.' });
    }
  };

  const reenviar = async () => {
    setEnviando(true);
    setAviso(null);
    try {
      onActualizada(await reenviarComunicacion(folio, c.id));
    } catch (e) {
      setAviso({ tipo: 'error', texto: e.message });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="card">
      <div className="row-between" style={{ marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>{c.tipo}</h3>
        <span className={`envio ${CLASE_ESTADO[c.estadoEnvio] ?? ''}`}>{ETIQUETA_ESTADO[c.estadoEnvio] ?? c.estadoEnvio}</span>
      </div>
      <p className="muted" style={{ marginTop: 0 }}>
        {c.plantilla ? `${c.plantilla} · ` : ''}generada {formatFechaHora(c.fechaHora)}
        {c.enviadaEn ? ` · enviada ${formatFechaHora(c.enviadaEn)}` : ''}
      </p>
      {c.estadoEnvio === 'Error' && c.error && <Notice tipo="error">No se pudo enviar: {c.error}</Notice>}
      <MailPreview destinatario={c.destinatario} asunto={c.asunto} mensaje={c.mensaje} />
      {aviso && (
        <div style={{ marginTop: 12 }}>
          <Notice tipo={aviso.tipo}>{aviso.texto}</Notice>
        </div>
      )}
      <div className="form-actions">
        <button type="button" className="ghost small" onClick={copiar}>
          Copiar mensaje
        </button>
        {permitirReenvio && fallida && (
          <button type="button" className="primary small" onClick={reenviar} disabled={enviando}>
            {enviando ? 'Enviando…' : 'Reintentar envío'}
          </button>
        )}
      </div>
    </div>
  );
}
