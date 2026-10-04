const correoValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v ?? '').trim());

/** Valida un ítem de carga. Devuelve { campo: mensaje } (vacío si es válido). */
export function validarItem(item) {
  const errores = {};
  if (!String(item.bl ?? '').trim()) errores.bl = 'Ingresa el BL o GD.';
  if (!String(item.tipo ?? '').trim()) errores.tipo = 'Ingresa el tipo de carga.';
  if (item.cantidad === '' || item.cantidad == null) errores.cantidad = 'Ingresa la cantidad.';
  else if (Number(item.cantidad) < 0) errores.cantidad = 'La cantidad no puede ser negativa.';
  if (item.peso !== '' && item.peso != null && Number(item.peso) < 0) errores.peso = 'El peso no puede ser negativo.';
  if (!item.um) errores.um = 'Selecciona la unidad de medida.';
  return errores;
}

/** Valida la solicitud completa antes de enviarla. */
export function validarSolicitud(datos) {
  const errores = {};
  if (!String(datos.cliente ?? '').trim()) errores.cliente = 'Ingresa el cliente.';
  if (!String(datos.solicitante ?? '').trim()) errores.solicitante = 'Ingresa el nombre del solicitante.';
  if (!correoValido(datos.correoSolicitante)) errores.correoSolicitante = 'Ingresa un correo válido para la confirmación.';
  if (!datos.fechaRequerida) errores.fechaRequerida = 'Selecciona la fecha requerida.';
  if (!datos.turno) errores.turno = 'Selecciona el turno.';
  if (Number(datos.diasDemurrage) < 0) errores.diasDemurrage = 'No puede ser negativo.';
  if (!datos.items?.length) errores.items = 'Agrega al menos un ítem de carga.';
  return errores;
}
