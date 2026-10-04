import { useCallback, useEffect, useMemo, useState } from 'react';

import { EVENTO_SESION_VENCIDA, leerSesion } from '../services/api';
import { cerrarSesion, iniciarSesion, registrarUsuario, usuarioActual } from '../services/authService';
import { AuthContext } from './authContext';

export default function AuthProvider({ children }) {
  // Mientras se valida el token guardado, se muestra el usuario de la sesión (si existe).
  const [usuario, setUsuario] = useState(() => leerSesion()?.usuario ?? null);
  const [verificando, setVerificando] = useState(() => Boolean(leerSesion()?.token));

  useEffect(() => {
    if (!verificando) return;
    usuarioActual()
      .then((u) => setUsuario(u))
      .catch((e) => {
        // Sin conexión no se cierra la sesión; con 401/403 sí.
        if (e.status === 401 || e.status === 403) setUsuario(null);
      })
      .finally(() => setVerificando(false));
  }, [verificando]);

  useEffect(() => {
    const onVencida = () => setUsuario(null);
    window.addEventListener(EVENTO_SESION_VENCIDA, onVencida);
    return () => window.removeEventListener(EVENTO_SESION_VENCIDA, onVencida);
  }, []);

  const login = useCallback(async (correo, password) => {
    const u = await iniciarSesion(correo, password);
    setUsuario(u);
    return u;
  }, []);

  const registro = useCallback(async (datos) => {
    const respuesta = await registrarUsuario(datos);
    if (respuesta?.sesion) setUsuario(respuesta.sesion.usuario);
    return respuesta;
  }, []);

  const logout = useCallback(() => {
    cerrarSesion();
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, verificando, login, registro, logout }),
    [usuario, verificando, login, registro, logout],
  );
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
