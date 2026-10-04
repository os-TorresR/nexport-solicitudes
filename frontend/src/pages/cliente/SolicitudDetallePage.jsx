import { Link, useLocation, useParams } from 'react-router-dom';

import EmptyState from '../../components/common/EmptyState';
import LoadError from '../../components/common/LoadError';
import Notice from '../../components/common/Notice';
import SectionHead from '../../components/common/SectionHead';
import StatusBadge from '../../components/common/StatusBadge';
import FlujoProgreso from '../../components/solicitud/FlujoProgreso';
import Historial from '../../components/solicitud/Historial';
import SolicitudResumen from '../../components/solicitud/SolicitudResumen';
import { ESTADOS } from '../../data/estados';
import { esPersonal, useAuth } from '../../hooks/useAuth';
import { useSolicitud } from '../../hooks/useSolicitudes';
import ClienteLayout from '../../layouts/ClienteLayout';
import { PATHS, rutaEditar } from '../../routes/paths';
import { formatFechaHora } from '../../utils/format';

/** Seguimiento de una solicitud desde el lado del cliente. */
export default function SolicitudDetallePage() {
  const { folio } = useParams();
  const location = useLocation();
  const { usuario } = useAuth();
  const { solicitud: r, cargando, error, recargar } = useSolicitud(folio);

  if (cargando) return <ClienteLayout />;
  if (error) {
    return (
      <ClienteLayout>
        <LoadError error={error} onReintentar={recargar} />
      </ClienteLayout>
    );
  }
  if (!r) {
    return (
      <ClienteLayout>
        <EmptyState>
          No encontramos la solicitud {folio}. <Link to={PATHS.misSolicitudes}>Ver mis solicitudes</Link>
        </EmptyState>
      </ClienteLayout>
    );
  }

  const aprobada = r.aprobacion?.resultado === 'APROBADA';

  return (
    <ClienteLayout>
      <SectionHead eyebrow="SEGUIMIENTO" titulo={r.folio} first>
        <StatusBadge estado={r.estado} />
        <Link to={PATHS.misSolicitudes} className="ghost">
          ← Mis solicitudes
        </Link>
      </SectionHead>

      <div className="card">
        <FlujoProgreso estado={r.estado} />
        {location.state?.corregida && r.estado !== ESTADOS.INFO_SOLICITADA && (
          <Notice tipo="normal">Corrección enviada: la solicitud volvió a revisión de Operación.</Notice>
        )}
        {r.estado === ESTADOS.INFO_SOLICITADA && (
          <Notice tipo="extra">
            Operación necesita más información: {r.aprobacion?.observacion}
            {!esPersonal(usuario) && (
              <div style={{ marginTop: 10 }}>
                <Link to={rutaEditar(r.folio)} className="primary small">
                  Corregir y reenviar solicitud
                </Link>
              </div>
            )}
          </Notice>
        )}
        {aprobada && (
          <Notice tipo="normal">
            Aprobada para {r.aprobacion.turnoConfirmado} · Sector {r.aprobacion.sector}
            {r.aprobacion.observacion ? ` · ${r.aprobacion.observacion}` : ''} ({formatFechaHora(r.aprobacion.fechaHora)})
          </Notice>
        )}
      </div>

      <div className="detail-layout" style={{ marginTop: 16 }}>
        <div>
          <SolicitudResumen solicitud={r} />
        </div>
        <div className="stack">
          <div className="card">
            <h3>Historial</h3>
            <Historial eventos={r.historial} />
          </div>
          {r.comunicaciones?.length > 0 && (
            <div className="card">
              <h3>Correos enviados</h3>
              <ul className="timeline">
                {r.comunicaciones.map((c) => (
                  <li key={c.id}>
                    <strong>{c.asunto}</strong>
                    <span>
                      {c.destinatario} · {formatFechaHora(c.fechaHora)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </ClienteLayout>
  );
}
