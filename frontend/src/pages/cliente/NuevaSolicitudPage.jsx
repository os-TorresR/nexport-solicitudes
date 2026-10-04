import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';

import SectionHead from '../../components/common/SectionHead';
import CutoffNotice from '../../components/solicitud/CutoffNotice';
import SolicitudForm from '../../components/solicitud/SolicitudForm';
import { servicioPorId } from '../../data/servicios';
import { useAuth } from '../../hooks/useAuth';
import ClienteLayout from '../../layouts/ClienteLayout';
import { PATHS, rutaEnviada } from '../../routes/paths';
import { crearSolicitud } from '../../services/solicitudesService';

export default function NuevaSolicitudPage() {
  const { servicioId } = useParams();
  const servicio = servicioPorId(servicioId);
  const navigate = useNavigate();
  const { usuario } = useAuth();

  if (!servicio) return <Navigate to={PATHS.inicio} replace />;

  const enviar = async (datos) => {
    const creada = await crearSolicitud({ ...datos, servicioId: servicio.id });
    navigate(rutaEnviada(creada.folio), { replace: true });
  };

  return (
    <ClienteLayout>
      <SectionHead eyebrow="NUEVA SOLICITUD" titulo={servicio.nombre} first>
        <Link to={PATHS.inicio} className="ghost">
          ← Volver
        </Link>
      </SectionHead>
      <CutoffNotice />
      {/* Se completa con los datos de la cuenta; el usuario puede cambiarlos. */}
      <SolicitudForm
        inicial={{
          cliente: usuario?.empresa ?? '',
          solicitante: usuario?.nombre ?? '',
          correoSolicitante: usuario?.correo ?? '',
        }}
        onEnviar={enviar}
        cancelarA={PATHS.inicio}
      />
    </ClienteLayout>
  );
}
