import { formatFecha, formatFechaHora } from '../../utils/format';
import CargaItemsTable from './CargaItemsTable';

const Dato = ({ titulo, children }) => (
  <div>
    <dt>{titulo}</dt>
    <dd>{children || '—'}</dd>
  </div>
);

/** Datos de la solicitud: información general, carga y observaciones. */
export default function SolicitudResumen({ solicitud: r }) {
  return (
    <>
      <div className="card">
        <h3>Información general</h3>
        <dl className="data-list">
          <Dato titulo="Servicio">{r.servicio}</Dato>
          <Dato titulo="Cliente">{r.cliente}</Dato>
          <Dato titulo="Solicitante">{r.solicitante}</Dato>
          <Dato titulo="Correo">{r.correoSolicitante}</Dato>
          <Dato titulo="Agencia">{r.agencia}</Dato>
          <Dato titulo="Denominación OT">{r.denominacionOT}</Dato>
          <Dato titulo="Nave / Viaje">{[r.nave, r.viaje].filter(Boolean).join(' / ')}</Dato>
          <Dato titulo="Línea naviera">{r.lineaNaviera}</Dato>
          <Dato titulo="Días libres demurrage">{String(r.diasDemurrage ?? 0)}</Dato>
          <Dato titulo="Fecha requerida">{formatFecha(r.fechaRequerida)}</Dato>
          <Dato titulo="Turno solicitado">{r.turno}</Dato>
          <Dato titulo="Ingreso">{formatFechaHora(r.fechaSolicitud)}</Dato>
        </dl>
        {r.extraordinaria && (
          <div className="notice extra" style={{ marginBottom: 0 }}>
            ⚠ Ingresada después de las 15:00: requiere visto bueno del Jefe de Turno.
          </div>
        )}
      </div>

      <div className="card">
        <h3>Detalle de carga ({r.items.length})</h3>
        <CargaItemsTable items={r.items} />
      </div>

      <div className="card">
        <h3>Observaciones</h3>
        <p className="text-block">{r.observaciones || 'Sin observaciones.'}</p>
      </div>
    </>
  );
}
