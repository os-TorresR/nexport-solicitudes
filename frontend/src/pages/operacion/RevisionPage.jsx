import { Link, useParams } from 'react-router-dom';

import EmptyState from '../../components/common/EmptyState';
import LoadError from '../../components/common/LoadError';
import SectionHead from '../../components/common/SectionHead';
import StatusBadge from '../../components/common/StatusBadge';
import AprobacionPanel from '../../components/operacion/AprobacionPanel';
import ComunicacionCard from '../../components/operacion/ComunicacionCard';
import EstadoActions from '../../components/operacion/EstadoActions';
import FlujoProgreso from '../../components/solicitud/FlujoProgreso';
import Historial from '../../components/solicitud/Historial';
import SolicitudResumen from '../../components/solicitud/SolicitudResumen';
import { ESTADOS_EN_REVISION } from '../../data/estados';
import { useSolicitud } from '../../hooks/useSolicitudes';
import OperacionLayout from '../../layouts/OperacionLayout';
import { PATHS } from '../../routes/paths';
import { formatFechaHora } from '../../utils/format';

export default function RevisionPage() {
  const { folio } = useParams();
  const { solicitud: r, cargando, error, recargar, setSolicitud } = useSolicitud(folio);

  if (cargando) return <OperacionLayout />;
  if (error) {
    return (
      <OperacionLayout>
        <LoadError error={error} onReintentar={recargar} />
      </OperacionLayout>
    );
  }
  if (!r) {
    return (
      <OperacionLayout>
        <EmptyState>
          No existe la solicitud {folio}. <Link to={PATHS.operacion}>Volver a la bandeja</Link>
        </EmptyState>
      </OperacionLayout>
    );
  }

  const enRevision = ESTADOS_EN_REVISION.includes(r.estado);
  const aprobada = r.aprobacion?.resultado === 'APROBADA';

  return (
    <OperacionLayout>
      <SectionHead eyebrow={`${r.servicio} · ${r.cliente}`.toUpperCase()} titulo={r.folio} first>
        <StatusBadge estado={r.estado} />
        <Link to={PATHS.operacion} className="ghost">
          ← Bandeja
        </Link>
      </SectionHead>

      <div className="card" style={{ marginBottom: 16 }}>
        <FlujoProgreso estado={r.estado} />
      </div>

      <div className="detail-layout">
        <div>
          <SolicitudResumen solicitud={r} />
        </div>
        <div className="stack">
          {enRevision && <AprobacionPanel key={r.estado} solicitud={r} onActualizada={setSolicitud} />}

          {aprobada && (
            <div className="card">
              <h3>Aprobación registrada</h3>
              <dl className="data-list" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', marginBottom: 0 }}>
                <div>
                  <dt>Responsable</dt>
                  <dd>{r.aprobacion.responsable}</dd>
                </div>
                <div>
                  <dt>Fecha / hora</dt>
                  <dd>{formatFechaHora(r.aprobacion.fechaHora)}</dd>
                </div>
                <div>
                  <dt>Turno confirmado</dt>
                  <dd>{r.aprobacion.turnoConfirmado}</dd>
                </div>
                <div>
                  <dt>Sector / ventana</dt>
                  <dd>{r.aprobacion.sector}</dd>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <dt>Observación</dt>
                  <dd>{r.aprobacion.observacion || '—'}</dd>
                </div>
              </dl>
            </div>
          )}

          <EstadoActions solicitud={r} onActualizada={setSolicitud} />

          {[...r.comunicaciones].reverse().map((c) => (
            <ComunicacionCard key={c.id} folio={r.folio} comunicacion={c} onActualizada={setSolicitud} permitirReenvio />
          ))}

          <div className="card">
            <h3>Historial</h3>
            <Historial eventos={r.historial} />
          </div>
        </div>
      </div>
    </OperacionLayout>
  );
}
