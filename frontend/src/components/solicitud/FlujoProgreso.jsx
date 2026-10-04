import { ESTADOS } from '../../data/estados';

const PASOS = ['Solicitud', 'Revisión', 'Aprobación', 'Confirmación', 'Programación'];

function pasosCompletados(estado) {
  switch (estado) {
    case ESTADOS.APROBADA:
      return 4;
    case ESTADOS.PROGRAMADA:
    case ESTADOS.EN_EJECUCION:
    case ESTADOS.FINALIZADA:
      return 5;
    default:
      return 1;
  }
}

/** Solicitar → Revisar → Aprobar → Confirmar → Programar (presentación "Fase inicial"). */
export default function FlujoProgreso({ estado }) {
  const completados = pasosCompletados(estado);
  return (
    <ol className="flow" aria-label="Avance de la solicitud">
      {PASOS.map((paso, i) => {
        const clase = i < completados ? 'done' : i === completados ? 'current' : '';
        return (
          <li key={paso} className={clase} aria-current={i === completados ? 'step' : undefined}>
            <span className="dot">{i < completados ? '✓' : i + 1}</span>
            <span className="label">{paso}</span>
          </li>
        );
      })}
    </ol>
  );
}
