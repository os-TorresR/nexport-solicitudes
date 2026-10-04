import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import LoadError from '../../components/common/LoadError';
import SectionHead from '../../components/common/SectionHead';
import CatalogGrid from '../../components/solicitud/CatalogGrid';
import { ESTADOS, ESTADOS_PENDIENTES } from '../../data/estados';
import { useSolicitudes } from '../../hooks/useSolicitudes';
import ClienteLayout from '../../layouts/ClienteLayout';
import { rutaSolicitar } from '../../routes/paths';

const irAlCatalogo = () => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { solicitudes, error, recargar } = useSolicitudes();

  // Botón "Catálogo" de la barra inferior.
  useEffect(() => {
    if (location.state?.irA === 'catalogo') setTimeout(irAlCatalogo, 100);
  }, [location]);

  const pendientes = solicitudes.filter((s) => ESTADOS_PENDIENTES.includes(s.estado)).length;
  const finalizadas = solicitudes.filter((s) => s.estado === ESTADOS.FINALIZADA).length;

  return (
    <ClienteLayout>
      <LoadError error={error} onReintentar={recargar} />
      <section className="hero">
        <div>
          <p className="eyebrow">SOLICITUD DIGITAL DE SERVICIOS</p>
          <h1>Solicita una faena sin correos ni planillas adjuntas</h1>
          <p>Selecciona el servicio, completa la información operacional y obtén un folio único para seguimiento.</p>
        </div>
        <div className="hero-card" aria-label="Resumen de solicitudes">
          <strong>{solicitudes.length}</strong>
          <span>Solicitudes</span>
          <strong>{pendientes}</strong>
          <span>Pendientes</span>
          <strong>{finalizadas}</strong>
          <span>Finalizadas</span>
        </div>
      </section>

      <SectionHead eyebrow="CATÁLOGO CFS IMPO" titulo="¿Qué servicio necesitas?" />
      <CatalogGrid onSelect={(s) => navigate(rutaSolicitar(s.id))} />
    </ClienteLayout>
  );
}
