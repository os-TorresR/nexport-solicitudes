import { useState } from 'react';

import { SIGUIENTE_ESTADO } from '../../data/estados';
import { avanzarEstado } from '../../services/solicitudesService';
import Notice from '../common/Notice';

export default function EstadoActions({ solicitud, onActualizada }) {
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const siguiente = SIGUIENTE_ESTADO[solicitud.estado];
  if (!siguiente) return null;

  const avanzar = async () => {
    setError('');
    setEnviando(true);
    try {
      onActualizada(await avanzarEstado(solicitud.folio));
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="card">
      <h3>Seguimiento operativo</h3>
      {error && <Notice tipo="error">{error}</Notice>}
      <p className="muted" style={{ marginTop: 0 }}>
        Estado actual: <strong>{solicitud.estado}</strong>
      </p>
      <button type="button" className="primary" onClick={avanzar} disabled={enviando}>
        Marcar como {siguiente}
      </button>
    </div>
  );
}
