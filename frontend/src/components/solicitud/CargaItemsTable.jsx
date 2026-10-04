import { formatNumero } from '../../utils/format';

export default function CargaItemsTable({ items, onEliminar }) {
  if (!items.length) return null;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>BL/GD</th>
            <th>Tipo</th>
            <th>ID</th>
            <th>Dimensiones</th>
            <th className="num">Cant.</th>
            <th className="num">Peso</th>
            <th>UM</th>
            {onEliminar && <th aria-label="Acciones" />}
          </tr>
        </thead>
        <tbody>
          {items.map((x, i) => (
            <tr key={`${x.bl}-${i}`}>
              <td>{x.bl}</td>
              <td>{x.tipo}</td>
              <td>{x.id || '—'}</td>
              <td>{x.dim || '—'}</td>
              <td className="num">{formatNumero(x.cantidad)}</td>
              <td className="num">{Number(x.peso) ? formatNumero(x.peso) : '—'}</td>
              <td>{x.um}</td>
              {onEliminar && (
                <td>
                  <button type="button" className="delete-item" onClick={() => onEliminar(i)}>
                    Eliminar
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
