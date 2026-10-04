import { LISTA_ESTADOS } from '../../data/estados';

export default function SolicitudFilters({ busqueda, onBusqueda, estado, onEstado, opcionesExtra = [], children }) {
  return (
    <div className={`filters${children ? ' three' : ''}`}>
      <input
        type="search"
        value={busqueda}
        onChange={(e) => onBusqueda(e.target.value)}
        placeholder="Buscar por folio, cliente o servicio..."
        aria-label="Buscar solicitudes"
      />
      <select value={estado} onChange={(e) => onEstado(e.target.value)} aria-label="Filtrar por estado">
        {opcionesExtra.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
        <option value="">Todos los estados</option>
        {LISTA_ESTADOS.map((e) => (
          <option key={e}>{e}</option>
        ))}
      </select>
      {children}
    </div>
  );
}
