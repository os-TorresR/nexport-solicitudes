import { Link } from 'react-router-dom';

import { formatFecha, formatFechaHora } from '../../utils/format';
import StatusBadge from '../common/StatusBadge';

export default function SolicitudCard({ solicitud: r, to, mostrarIngreso = false }) {
  return (
    <Link to={to} className="request">
      <div>
        <h3>{r.folio}</h3>
        <p>
          <strong>{r.servicio}</strong> · {r.cliente}
        </p>
        <p>
          Fecha requerida: {formatFecha(r.fechaRequerida)} · {r.turno} · {r.items.length} ítem(s)
        </p>
        {mostrarIngreso && <p>Ingresada: {formatFechaHora(r.fechaSolicitud)} · {r.solicitante}</p>}
      </div>
      <div className="side">
        <StatusBadge estado={r.estado} />
        {r.extraordinaria && <span className="tag-extra">Extraordinaria</span>}
      </div>
    </Link>
  );
}
