import { useEffect, useState } from 'react';

import { HORA_CORTE } from '../../data/catalogos';
import { esExtraordinaria } from '../../utils/horario';
import Notice from '../common/Notice';

/** Aviso de horario; se actualiza solo si se cruza las 15:00 mientras se llena el formulario. */
export default function CutoffNotice() {
  const [extra, setExtra] = useState(() => esExtraordinaria());
  useEffect(() => {
    const id = setInterval(() => setExtra(esExtraordinaria()), 30_000);
    return () => clearInterval(id);
  }, []);

  return extra ? (
    <Notice tipo="extra">
      ⚠ Solicitud extraordinaria: enviada después de las {HORA_CORTE}:00. Requiere visto bueno del Jefe de Turno.
    </Notice>
  ) : (
    <Notice tipo="normal">✓ Solicitud dentro del horario normal de recepción.</Notice>
  );
}
