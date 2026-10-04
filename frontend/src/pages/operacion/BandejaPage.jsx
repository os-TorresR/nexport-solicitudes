import { useMemo, useState } from 'react';

import EmptyState from '../../components/common/EmptyState';
import LoadError from '../../components/common/LoadError';
import SectionHead from '../../components/common/SectionHead';
import KpiTile from '../../components/operacion/KpiTile';
import SolicitudCard from '../../components/solicitud/SolicitudCard';
import SolicitudFilters from '../../components/solicitud/SolicitudFilters';
import { ESTADOS, ESTADOS_EN_REVISION } from '../../data/estados';
import { useSolicitudes } from '../../hooks/useSolicitudes';
import OperacionLayout from '../../layouts/OperacionLayout';
import { rutaRevision } from '../../routes/paths';
import { normalizarTexto } from '../../utils/format';

const POR_REVISAR = '__por_revisar__';

export default function BandejaPage() {
  const { solicitudes, cargando, error, recargar } = useSolicitudes();
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState(POR_REVISAR);
  const [soloExtra, setSoloExtra] = useState(false);

  const enRevision = solicitudes.filter((s) => ESTADOS_EN_REVISION.includes(s.estado));
  const kpis = {
    revision: enRevision.length,
    vb: enRevision.filter((s) => s.estado === ESTADOS.PENDIENTE_VB).length,
    curso: solicitudes.filter((s) => [ESTADOS.APROBADA, ESTADOS.PROGRAMADA, ESTADOS.EN_EJECUCION].includes(s.estado)).length,
    finalizadas: solicitudes.filter((s) => s.estado === ESTADOS.FINALIZADA).length,
  };

  const filtradas = useMemo(() => {
    const q = normalizarTexto(busqueda.trim());
    return solicitudes
      .filter((r) => {
        if (estado === POR_REVISAR) return ESTADOS_EN_REVISION.includes(r.estado);
        return !estado || r.estado === estado;
      })
      .filter((r) => !soloExtra || r.extraordinaria)
      .filter((r) => !q || normalizarTexto([r.folio, r.cliente, r.servicio, r.solicitante].join(' ')).includes(q));
  }, [solicitudes, busqueda, estado, soloExtra]);

  return (
    <OperacionLayout>
      <SectionHead eyebrow="REVISIÓN Y APROBACIÓN" titulo="Bandeja de solicitudes" first>
        <button type="button" className="ghost" onClick={recargar}>
          Actualizar
        </button>
      </SectionHead>
      <LoadError error={error} onReintentar={recargar} />

      <div className="kpis">
        <KpiTile valor={kpis.revision} etiqueta="Por revisar" alerta />
        <KpiTile valor={kpis.vb} etiqueta="Pendientes VB (extraordinarias)" alerta />
        <KpiTile valor={kpis.curso} etiqueta="Aprobadas / en curso" />
        <KpiTile valor={kpis.finalizadas} etiqueta="Finalizadas" />
      </div>

      <SolicitudFilters
        busqueda={busqueda}
        onBusqueda={setBusqueda}
        estado={estado}
        onEstado={setEstado}
        opcionesExtra={[{ value: POR_REVISAR, label: 'Por revisar' }]}
      >
        <label className="check">
          <input type="checkbox" checked={soloExtra} onChange={(e) => setSoloExtra(e.target.checked)} />
          Solo extraordinarias
        </label>
      </SolicitudFilters>

      <div className="requests">
        {!cargando && !error && !filtradas.length && <EmptyState>No hay solicitudes con este filtro.</EmptyState>}
        {filtradas.map((r) => (
          <SolicitudCard key={r.folio} solicitud={r} to={rutaRevision(r.folio)} mostrarIngreso />
        ))}
      </div>
    </OperacionLayout>
  );
}
