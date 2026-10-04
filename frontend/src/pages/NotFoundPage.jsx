import { Link } from 'react-router-dom';

import EmptyState from '../components/common/EmptyState';
import ClienteLayout from '../layouts/ClienteLayout';
import { PATHS } from '../routes/paths';

export default function NotFoundPage() {
  return (
    <ClienteLayout>
      <EmptyState>
        Esta página no existe. <Link to={PATHS.inicio}>Volver al inicio</Link>
      </EmptyState>
    </ClienteLayout>
  );
}
