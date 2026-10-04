export default function Notice({ tipo = 'info', children }) {
  return (
    <div className={`notice ${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}
