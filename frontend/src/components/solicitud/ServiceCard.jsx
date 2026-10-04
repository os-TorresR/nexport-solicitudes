export default function ServiceCard({ servicio, onSelect }) {
  return (
    <button type="button" className="service-card" onClick={() => onSelect(servicio)}>
      <div className="service-icon" aria-hidden="true">
        {servicio.icono}
      </div>
      <h3>{servicio.nombre}</h3>
      <p>{servicio.descripcion}</p>
    </button>
  );
}
