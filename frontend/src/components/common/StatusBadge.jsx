import { estadoClase } from '../../data/estados';

export default function StatusBadge({ estado }) {
  return <span className={`status ${estadoClase(estado)}`}>{estado}</span>;
}
