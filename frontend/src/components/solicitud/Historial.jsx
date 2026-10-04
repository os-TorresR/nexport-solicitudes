import { formatFechaHora } from '../../utils/format';

export default function Historial({ eventos }) {
  return (
    <ol className="timeline">
      {[...eventos].reverse().map((ev, i) => (
        <li key={`${ev.fechaHora}-${i}`}>
          <strong>{ev.accion}</strong>
          {ev.detalle && <span>{ev.detalle}</span>}
          <span>
            {formatFechaHora(ev.fechaHora)}
            {ev.usuario ? ` · ${ev.usuario}` : ''}
          </span>
        </li>
      ))}
    </ol>
  );
}
