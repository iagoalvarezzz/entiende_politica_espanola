/* Progreso de aprendizaje (sección 17.3). Solo guarda identificadores,
   aciertos y fechas, en el navegador. Nada sobre ideología ni opiniones.
   Un bloque cuenta como completado cuando está marcado como estudiado y
   tiene al menos un cuestionario contestado (sin nota mínima). */
(function () {
  'use strict';

  const PE = window.PE;
  const CLAVE = 'progreso';
  const MAX_INTENTOS = 10;
  const oyentes = [];

  function vacio() {
    return { version: 1, estudiados: {}, respuestas: {}, cuestionarios: {} };
  }

  function hoy() {
    const d = new Date();
    const dos = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + dos(d.getMonth() + 1) + '-' + dos(d.getDate());
  }

  function cargar() {
    const datos = PE.almacen.leer(CLAVE, null);
    if (!datos || datos.version !== 1) return vacio();
    return {
      version: 1,
      estudiados: datos.estudiados || {},
      respuestas: datos.respuestas || {},
      cuestionarios: datos.cuestionarios || {}
    };
  }

  function guardar(datos) {
    PE.almacen.guardar(CLAVE, datos);
    oyentes.forEach(function (fn) { fn(datos); });
  }

  function marcarEstudiado(bloque, estudiado) {
    const datos = cargar();
    if (estudiado) datos.estudiados[bloque] = hoy();
    else delete datos.estudiados[bloque];
    guardar(datos);
  }

  function estaEstudiado(bloque) {
    return !!cargar().estudiados[bloque];
  }

  function registrarRespuesta(pregunta, acierto) {
    const datos = cargar();
    datos.respuestas[pregunta] = { ok: !!acierto, fecha: hoy() };
    guardar(datos);
  }

  function registrarCuestionario(bloque, aciertos, total) {
    const datos = cargar();
    const lista = datos.cuestionarios[bloque] || [];
    lista.push({ fecha: hoy(), aciertos: aciertos, total: total });
    datos.cuestionarios[bloque] = lista.slice(-MAX_INTENTOS);
    guardar(datos);
  }

  function intentos(bloque) {
    return cargar().cuestionarios[bloque] || [];
  }

  /* Preguntas cuya última respuesta fue incorrecta, entre las indicadas. */
  function fallidas(idsPreguntas) {
    const respuestas = cargar().respuestas;
    return idsPreguntas.filter(function (id) { return respuestas[id] && !respuestas[id].ok; });
  }

  function completado(bloque) {
    const datos = cargar();
    return !!datos.estudiados[bloque] && (datos.cuestionarios[bloque] || []).length > 0;
  }

  /* Progreso de una lista de bloques: { completados, total, porcentaje }. */
  function resumen(bloques) {
    const hechos = bloques.filter(completado).length;
    return { completados: hechos, total: bloques.length, porcentaje: bloques.length ? Math.round(hechos * 100 / bloques.length) : 0 };
  }

  function borrarTodo() {
    PE.almacen.borrar(CLAVE);
    oyentes.forEach(function (fn) { fn(vacio()); });
  }

  function alCambiar(fn) {
    oyentes.push(fn);
  }

  PE.progreso = {
    hoy: hoy,
    cargar: cargar,
    marcarEstudiado: marcarEstudiado,
    estaEstudiado: estaEstudiado,
    registrarRespuesta: registrarRespuesta,
    registrarCuestionario: registrarCuestionario,
    intentos: intentos,
    fallidas: fallidas,
    completado: completado,
    resumen: resumen,
    borrarTodo: borrarTodo,
    alCambiar: alCambiar
  };
})();
