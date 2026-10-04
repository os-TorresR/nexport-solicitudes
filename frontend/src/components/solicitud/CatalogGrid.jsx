import { SERVICIOS } from '../../data/servicios';
import ServiceCard from './ServiceCard';

export default function CatalogGrid({ onSelect }) {
  return (
    <div id="catalogo" className="catalog-grid">
      {SERVICIOS.map((servicio) => (
        <ServiceCard key={servicio.id} servicio={servicio} onSelect={onSelect} />
      ))}
    </div>
  );
}
