import { Link, useParams } from 'react-router-dom';

import { useSolicitud } from '../../hooks/useSolicitudes';
import ClienteLayout from '../../layouts/ClienteLayout';
import { PATHS, rutaDetalle } from '../../routes/paths';

export default function SolicitudEnviadaPage() {
  const { folio } = useParams();
  const { solicitud } = useSolicitud(folio);

  return (
    <ClienteLayout>
      <div className="success">
        <div className="success-icon" aria-hidden="true">
          ✓
        </div>
        <p className="eyebrow" style={{ marginTop: 18 }}>
          SOLICITUD REGISTRADA
        </p>
        <h2>Solicitud enviada correctamente</h2>
        <p className="muted">La solicitud quedó centralizada y lista para revisión operacional.</p>
        <div className="folio">{folio}</div>
        {solicitud?.extraordinaria && (
          <div className="notice extra">
            Ingresó después de las 15:00: queda pendiente del visto bueno del Jefe de Turno.
          </div>
        )}
        {solicitud?.correoSolicitante && (
          <p className="muted">
            Te enviamos un correo de confirmación a <strong>{solicitud.correoSolicitante}</strong>. Recibirás otro cuando la
            solicitud sea revisada.
          </p>
        )}
        <div className="form-actions" style={{ justifyContent: 'center' }}>
          <Link to={rutaDetalle(folio)} className="secondary">
            Ver seguimiento
          </Link>
          <Link to={PATHS.inicio} className="primary">
            Nueva solicitud
          </Link>
        </div>
      </div>
    </ClienteLayout>
  );
}
