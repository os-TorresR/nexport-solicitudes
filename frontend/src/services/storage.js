// Acceso a localStorage tolerante a errores (modo privado, almacenamiento bloqueado).
// Es la persistencia provisoria de la fase inicial: en la fase backend se reemplaza por la API.

export function leer(clave, porDefecto) {
  try {
    const valor = window.localStorage.getItem(clave);
    return valor == null ? porDefecto : JSON.parse(valor);
  } catch {
    return porDefecto;
  }
}

export function escribir(clave, valor) {
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}
