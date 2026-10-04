import { useCallback, useEffect, useState } from 'react';

import { listarSolicitudes, obtenerSolicitud } from '../services/solicitudesService';

// Vuelve a pedir los datos cuando la pestaña recupera el foco (por ejemplo, Operación vuelve
// a la bandeja después de leer el correo de aviso).
function useRecargaAlVolver(recargar) {
  useEffect(() => {
    const onFocus = () => recargar();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [recargar]);
}

export function useSolicitudes() {
  const [estado, setEstado] = useState({ solicitudes: [], cargando: true, error: null });

  const recargar = useCallback(() => {
    listarSolicitudes()
      .then((solicitudes) => setEstado({ solicitudes, cargando: false, error: null }))
      .catch((error) => setEstado((prev) => ({ ...prev, cargando: false, error })));
  }, []);

  useEffect(recargar, [recargar]);
  useRecargaAlVolver(recargar);

  return { ...estado, recargar };
}

export function useSolicitud(folio) {
  const [estado, setEstado] = useState({ solicitud: null, cargando: true, error: null });

  const recargar = useCallback(() => {
    obtenerSolicitud(folio)
      .then((solicitud) => setEstado({ solicitud, cargando: false, error: null }))
      .catch((error) => setEstado((prev) => ({ ...prev, cargando: false, error })));
  }, [folio]);

  useEffect(recargar, [recargar]);

  const setSolicitud = useCallback((solicitud) => setEstado({ solicitud, cargando: false, error: null }), []);
  return { ...estado, recargar, setSolicitud };
}
