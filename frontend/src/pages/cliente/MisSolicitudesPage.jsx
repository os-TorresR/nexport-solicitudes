import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import EmptyState from '../../components/common/EmptyState';
import LoadError from '../../components/common/LoadError';
import SectionHead from '../../components/common/SectionHead';
import SolicitudCard from '../../components/solicitud/SolicitudCard';
import SolicitudFilters from '../../components/solicitud/SolicitudFilters';
import { useSolicitudes } from '../../hooks/useSolicitudes';
import ClienteLayout from '../../layouts/ClienteLayout';
import { PATHS, rutaDetalle } from '../../routes/paths';
import { normalizarTexto } from '../../utils/format';

export default function MisSolicitudesPage() {
  const { solicitudes, cargando, error, recargar } = useSolicitudes();
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');

  const filtradas = useMemo(() => {
    const q = normalizarTexto(busqueda.trim());
    return solicitudes.filter(
      (r) =>
        (!q || normalizarTexto([r.folio, r.cliente, r.servicio].join(' ')).includes(q)) && (!estado || r.estado === estado),
    );
  }, [solicitudes, busqueda, estado]);

  return (
    <ClienteLayout>
      <SectionHead eyebrow="SEGUIMIENTO" titulo="Mis solicitudes" first>
        <Link to={PATHS.inicio} className="primary">
          + Nueva solicitud
        </Link>
      </SectionHead>
      <LoadError error={error} onReintentar={recargar} />
      <SolicitudFilters busqueda={busqueda} onBusqueda={setBusqueda} estado={estado} onEstado={setEstado} />
      <div className="requests">
        {!cargando && !error && !filtradas.length && <EmptyState>No hay solicitudes para mostrar.</EmptyState>}
        {filtradas.map((r) => (
          <SolicitudCard key={r.folio} solicitud={r} to={rutaDetalle(r.folio)} />
        ))}
      </div>
    </ClienteLayout>
  );
}
