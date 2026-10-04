import { cloneElement, isValidElement, useId } from 'react';

/** Etiqueta + control + mensaje de error, con accesibilidad (label/for, aria-invalid, describedby). */
export default function Field({ label, required = false, error, children }) {
  const id = useId();
  const errorId = `${id}-error`;
  const control = isValidElement(children)
    ? cloneElement(children, {
        id: children.props.id ?? id,
        'aria-invalid': error ? 'true' : undefined,
        'aria-describedby': error ? errorId : undefined,
        'aria-required': required ? 'true' : undefined,
      })
    : children;
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={isValidElement(children) ? (children.props.id ?? id) : undefined}>
        {label}
        {required && <span className="req" aria-hidden="true"> *</span>}
      </label>
      {control}
      {error && (
        <span className="field-error" id={errorId}>
          {error}
        </span>
      )}
    </div>
  );
}
