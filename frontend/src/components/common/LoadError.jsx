import Notice from './Notice';

/** Error al cargar datos desde la API, con opción de reintentar. */
export default function LoadError({ error, onReintentar }) {
  if (!error) return null;
  return (
    <Notice tipo="error">
      {error.message}{' '}
      {onReintentar && (
        <button type="button" className="ghost small" onClick={onReintentar} style={{ marginLeft: 8 }}>
          Reintentar
        </button>
      )}
    </Notice>
  );
}
