/* Almacén local: localStorage envuelto en try/catch; si no está disponible,
   guarda en memoria durante la visita. Sin cookies y sin enviar nada fuera. */
(function () {
  'use strict';

  const PE = window.PE;
  const PREFIJO = 'pe:';
  const memoria = {};

  function probarLocal() {
    try {
      const clave = PREFIJO + '__prueba__';
      window.localStorage.setItem(clave, '1');
      window.localStorage.removeItem(clave);
      return true;
    } catch (e) {
      return false;
    }
  }

  const local = probarLocal();

  function leer(clave, defecto) {
    let crudo = null;
    if (local) {
      try { crudo = window.localStorage.getItem(PREFIJO + clave); } catch (e) { crudo = null; }
    } else if (Object.prototype.hasOwnProperty.call(memoria, clave)) {
      crudo = memoria[clave];
    }
    if (crudo === null || crudo === undefined) return defecto;
    try { return JSON.parse(crudo); } catch (e) { return defecto; }
  }

  function guardar(clave, valor) {
    const crudo = JSON.stringify(valor);
    if (local) {
      try { window.localStorage.setItem(PREFIJO + clave, crudo); return true; } catch (e) { /* cae a memoria */ }
    }
    memoria[clave] = crudo;
    return false;
  }

  function borrar(clave) {
    if (local) {
      try { window.localStorage.removeItem(PREFIJO + clave); } catch (e) { /* sin acción */ }
    }
    delete memoria[clave];
  }

  function claves() {
    const lista = [];
    if (local) {
      try {
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.indexOf(PREFIJO) === 0) lista.push(k.slice(PREFIJO.length));
        }
      } catch (e) { /* sin acción */ }
    }
    Object.keys(memoria).forEach(function (k) { if (lista.indexOf(k) === -1) lista.push(k); });
    return lista.sort();
  }

  /* Exporta todo lo guardado como texto JSON, para descargarlo o copiarlo. */
  function exportar() {
    const contenido = {};
    claves().forEach(function (k) { contenido[k] = leer(k, null); });
    return JSON.stringify({ formato: 'politica-espana-progreso', version: 1, contenido: contenido }, null, 2);
  }

  /* Importa un texto generado por exportar(). Devuelve el número de claves. */
  function importar(texto) {
    const datos = JSON.parse(texto);
    if (!datos || datos.formato !== 'politica-espana-progreso' || typeof datos.contenido !== 'object') {
      throw new Error('El fichero no tiene el formato de progreso de esta web.');
    }
    Object.keys(datos.contenido).forEach(function (k) { guardar(k, datos.contenido[k]); });
    return Object.keys(datos.contenido).length;
  }

  PE.almacen = {
    persistente: local,
    leer: leer,
    guardar: guardar,
    borrar: borrar,
    claves: claves,
    exportar: exportar,
    importar: importar
  };
})();
