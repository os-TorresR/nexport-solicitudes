export default function KpiTile({ valor, etiqueta, alerta = false }) {
  return (
    <div className={`kpi${alerta && valor > 0 ? ' alert' : ''}`}>
      <strong>{valor}</strong>
      <span>{etiqueta}</span>
    </div>
  );
}
