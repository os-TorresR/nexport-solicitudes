import { HORA_CORTE } from '../data/catalogos';

/** Regla operacional: desde las 15:00 la solicitud es extraordinaria y requiere VB del Jefe de Turno. */
export const esExtraordinaria = (fecha = new Date()) => fecha.getHours() >= HORA_CORTE;
