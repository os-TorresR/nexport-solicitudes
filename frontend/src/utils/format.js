const dos = (n) => String(n).padStart(2, '0');

/** 'YYYY-MM-DD' → 'DD-MM-YYYY' sin pasar por Date (evita el desfase de zona horaria). */
export function formatFecha(isoDate) {
  if (!isoDate) return '—';
  const [y, m, d] = String(isoDate).slice(0, 10).split('-');
  return y && m && d ? `${d}-${m}-${y}` : String(isoDate);
}

/** ISO con hora → 'DD-MM-YYYY HH:mm' en hora local. */
export function formatFechaHora(iso) {
  if (!iso) return '—';
  const f = new Date(iso);
  if (Number.isNaN(f.getTime())) return String(iso);
  return `${dos(f.getDate())}-${dos(f.getMonth() + 1)}-${f.getFullYear()} ${dos(f.getHours())}:${dos(f.getMinutes())}`;
}

/** Fecha local de hoy en formato 'YYYY-MM-DD' (para inputs type=date). */
export function hoyIso(ahora = new Date()) {
  return `${ahora.getFullYear()}-${dos(ahora.getMonth() + 1)}-${dos(ahora.getDate())}`;
}

export function formatNumero(valor) {
  if (valor === '' || valor == null || Number.isNaN(Number(valor))) return '';
  return Number(valor).toLocaleString('es-CL', { maximumFractionDigits: 2 });
}

export function normalizarTexto(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}
