// Estados de una solicitud. El orden refleja el flujo:
// Solicitar → Revisar → Aprobar → Confirmar → Programar → Ejecutar → Finalizar.
export const ESTADOS = {
  INGRESADA: 'Ingresada',
  PENDIENTE_VB: 'Pendiente VB',
  INFO_SOLICITADA: 'Info solicitada',
  APROBADA: 'Aprobada',
  PROGRAMADA: 'Programada',
  EN_EJECUCION: 'En ejecución',
  FINALIZADA: 'Finalizada',
};

export const LISTA_ESTADOS = Object.values(ESTADOS);

/** Estados que esperan una acción de Operación (revisión / VB). */
export const ESTADOS_EN_REVISION = [ESTADOS.INGRESADA, ESTADOS.PENDIENTE_VB, ESTADOS.INFO_SOLICITADA];

/** Estados considerados "pendientes" en los indicadores del cliente. */
export const ESTADOS_PENDIENTES = ESTADOS_EN_REVISION;

/** Siguiente estado operativo después de aprobar. */
export const SIGUIENTE_ESTADO = {
  [ESTADOS.APROBADA]: ESTADOS.PROGRAMADA,
  [ESTADOS.PROGRAMADA]: ESTADOS.EN_EJECUCION,
  [ESTADOS.EN_EJECUCION]: ESTADOS.FINALIZADA,
};

export const estadoClase = (estado) =>
  `estado-${String(estado ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')}`;
