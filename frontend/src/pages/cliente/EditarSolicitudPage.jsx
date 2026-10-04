import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';

import EmptyState from '../../components/common/EmptyState';
import LoadError from '../../components/common/LoadError';
import Notice from '../../components/common/Notice';
import SectionHead from '../../components/common/SectionHead';
import SolicitudForm from '../../components/solicitud/SolicitudForm';
import { ESTADOS } from '../../data/estados';
import { useAuth } from '../../hooks/useAuth';
import { useSolicitud } from '../../hooks/useSolicitudes';
import ClienteLayout from '../../layouts/ClienteLayout';
import { PATHS, rutaDetalle } from '../../routes/paths';
import { corregirSolicitud } from '../../services/solicitudesService';

const texto = (v) => (v == null ? '' : String(v));

/** El cliente corrige su solicitud cuando Operación le pidió más información. */
export default function EditarSolicitudPage() {
  const { folio } = useParams();
  const navigate = useNavigate();
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
  // Solo se corrige cuando Operación pidió información (el servidor también lo valida).
  if (r.estado !== ESTADOS.INFO_SOLICITADA || !usuario) return <Navigate to={rutaDetalle(folio)} replace />;

  const enviar = async (datos) => {
    await corregirSolicitud(folio, datos);
    navigate(rutaDetalle(folio), { replace: true, state: { corregida: true } });
  };

  return (
    <ClienteLayout>
      <SectionHead eyebrow={`CORREGIR · ${r.servicio.toUpperCase()}`} titulo={r.folio} first>
        <Link to={rutaDetalle(folio)} className="ghost">
          ← Volver
        </Link>
      </SectionHead>
      <Notice tipo="extra">Operación pidió más información: {r.aprobacion?.observacion}</Notice>
      <SolicitudForm
        conComentario
        inicial={{
          cliente: texto(r.cliente),
          solicitante: texto(r.solicitante),
          correoSolicitante: texto(r.correoSolicitante),
          agencia: texto(r.agencia),
          denominacionOT: texto(r.denominacionOT),
          nave: texto(r.nave),
          viaje: texto(r.viaje),
          lineaNaviera: texto(r.lineaNaviera),
          diasDemurrage: texto(r.diasDemurrage ?? 0),
          fechaRequerida: texto(r.fechaRequerida),
          turno: texto(r.turno),
          observaciones: texto(r.observaciones),
        }}
        itemsIniciales={r.items.map((i) => ({
          bl: texto(i.bl),
          tipo: texto(i.tipo),
          id: texto(i.id),
          dim: texto(i.dim),
          cantidad: texto(i.cantidad),
          peso: Number(i.peso) ? texto(i.peso) : '',
          um: texto(i.um),
        }))}
        onEnviar={enviar}
        textoEnviar="Enviar corrección"
        cancelarA={rutaDetalle(folio)}
      />
    </ClienteLayout>
  );
}
