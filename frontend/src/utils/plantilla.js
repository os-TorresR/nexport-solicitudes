/** Reemplaza {variable} por su valor. Las variables desconocidas quedan tal cual. */
export function renderPlantilla(texto, variables) {
  return String(texto ?? '').replace(/\{(\w+)\}/g, (completo, clave) =>
    Object.prototype.hasOwnProperty.call(variables, clave) ? String(variables[clave] ?? '') : completo,
  );
}
