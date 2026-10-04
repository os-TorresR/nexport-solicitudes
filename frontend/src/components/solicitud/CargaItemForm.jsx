import { useState } from 'react';

import { UNIDADES_MEDIDA } from '../../data/catalogos';
import { validarItem } from '../../utils/validacion';
import Field from '../common/Field';

const VACIO = { bl: '', tipo: '', id: '', dim: '', cantidad: '', peso: '', um: '' };

export default function CargaItemForm({ onAgregar }) {
  const [item, setItem] = useState(VACIO);
  const [errores, setErrores] = useState({});

  const cambiar = (campo) => (e) => {
    setItem((prev) => ({ ...prev, [campo]: e.target.value }));
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  const agregar = () => {
    const encontrados = validarItem(item);
    if (Object.keys(encontrados).length) {
      setErrores(encontrados);
      return;
    }
    onAgregar(item);
    setItem(VACIO);
    setErrores({});
  };

  // Enter dentro de un campo de carga agrega el ítem (no envía la solicitud completa).
  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      agregar();
    }
  };

  return (
    <div onKeyDown={onKeyDown}>
      <div className="grid three">
        <Field label="BL / GD" required error={errores.bl}>
          <input value={item.bl} onChange={cambiar('bl')} placeholder="BL o GD" />
        </Field>
        <Field label="Tipo de carga" required error={errores.tipo}>
          <input value={item.tipo} onChange={cambiar('tipo')} placeholder="Ej. Neumáticos" />
        </Field>
        <Field label="ID / Contenedor">
          <input value={item.id} onChange={cambiar('id')} placeholder="Ej. TGHU1234567" />
        </Field>
        <Field label="Dimensiones">
          <input value={item.dim} onChange={cambiar('dim')} placeholder="Ej. 12 x 2,4 x 2,6 m" />
        </Field>
        <Field label="Cantidad" required error={errores.cantidad}>
          <input type="number" min="0" step="1" value={item.cantidad} onChange={cambiar('cantidad')} />
        </Field>
        <Field label="Peso" error={errores.peso}>
          <input type="number" min="0" step="0.01" value={item.peso} onChange={cambiar('peso')} />
        </Field>
        <Field label="Unidad de medida" required error={errores.um}>
          <select value={item.um} onChange={cambiar('um')}>
            <option value="">Seleccionar...</option>
            {UNIDADES_MEDIDA.map((um) => (
              <option key={um}>{um}</option>
            ))}
          </select>
        </Field>
      </div>
      <button type="button" className="secondary" onClick={agregar}>
        + Agregar ítem de carga
      </button>
    </div>
  );
}
