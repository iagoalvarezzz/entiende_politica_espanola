/* Pruebas en el navegador: cálculos (vectores T2 a T10, umbrales, empates,
   barrera) y prueba de humo de la interfaz en dos anchos (1280 y 375 px).
   Escribe el resultado como JSON en #resultados y marca data-fin="1";
   tools/run_tests.py lo lee con Chrome o Edge sin interfaz. */
(function () {
  'use strict';

  const PE = window.PE;
  const C = PE.calc;
  const V = window.PE_VECTORES;
  const unitarias = [];

  function prueba(nombre, fn) {
    try {
      fn();
      unitarias.push({ nombre: nombre, ok: true });
    } catch (e) {
      unitarias.push({ nombre: nombre, ok: false, detalle: e.message });
    }
  }

  function igual(obtenido, esperado, que) {
    if (obtenido !== esperado) {
      throw new Error(que + ': se esperaba ' + JSON.stringify(esperado) + ' y se obtuvo ' + JSON.stringify(obtenido));
    }
  }

  function dosDecimales(x) {
    const r = Math.round(Math.abs(x) * 100 + 1e-9) / 100;
    return x < 0 ? -r : r;
  }

  function aprox(obtenido, esperado, que) {
    igual(dosDecimales(obtenido), esperado, que + ' (con dos decimales)');
  }

  /* ---------- Reparto D'Hondt ---------- */
  V.reparto.forEach(function (caso) {
    prueba(caso.id + ': ' + caso.descripcion, function () {
      const r = C.dhondt.repartir({
        escanos: caso.escanos,
        blancos: caso.blancos,
        baseIncluyeBlancos: caso.base_incluye_blancos,
        aplicarBarrera: caso.aplicar_barrera,
        candidaturas: caso.candidaturas
      });
      Object.keys(caso.esperado.escanos).forEach(function (id) {
        igual(r.reparto[id], caso.esperado.escanos[id], 'escaños de ' + id);
      });
      igual(r.escanosAsignados, caso.escanos, 'escaños asignados');
      igual(r.excluidas.map(function (e) { return e.id; }).join(','), caso.esperado.excluidas.join(','), 'excluidas por la barrera');
      if (caso.esperado.ultimo) {
        igual(r.ultimoAsignado.id + '/' + r.ultimoAsignado.divisor, caso.esperado.ultimo.id + '/' + caso.esperado.ultimo.divisor, 'último cociente con escaño');
      }
      if (caso.esperado.primero_fuera) {
        igual(r.primeroSinEscano.id + '/' + r.primeroSinEscano.divisor, caso.esperado.primero_fuera.id + '/' + caso.esperado.primero_fuera.divisor, 'primer cociente sin escaño');
      }
      igual(r.sorteo, null, 'sorteo');
      igual(C.dhondt.comprobarGarantia(r).length, 0, 'propiedad 1/(M+1)');
    });
  });

  prueba('Barrera: con exactamente el 3 % se entra en el reparto (art. 163.1.a, «al menos»)', function () {
    const r = C.dhondt.repartir({ escanos: 2, candidaturas: [{ id: 'A', votos: 9700 }, { id: 'B', votos: 300 }] });
    igual(r.admitidas.join(','), 'A,B', 'admitidas');
  });

  prueba('Barrera: con menos del 3 % se queda fuera', function () {
    const r = C.dhondt.repartir({ escanos: 2, candidaturas: [{ id: 'A', votos: 9701 }, { id: 'B', votos: 299 }] });
    igual(r.excluidas.map(function (e) { return e.id; }).join(','), 'B', 'excluidas');
  });

  prueba('Empate de cocientes: el escaño va a la candidatura con más votos (art. 163.1.d)', function () {
    const r = C.dhondt.repartir({ escanos: 2, candidaturas: [{ id: 'A', votos: 6000 }, { id: 'B', votos: 3000 }] });
    igual(r.reparto.A, 2, 'escaños de A');
    igual(r.reparto.B, 0, 'escaños de B');
    igual(r.empateResuelto && r.empateResuelto.ganadora, 'A', 'empate resuelto a favor de');
  });

  prueba('Empate con los mismos votos totales: avisa de sorteo y no asigna el escaño', function () {
    const r = C.dhondt.repartir({ escanos: 1, candidaturas: [{ id: 'A', votos: 5000 }, { id: 'B', votos: 5000 }] });
    igual(r.sorteo !== null, true, 'hay sorteo');
    igual(r.sorteo.candidaturas.join(','), 'A,B', 'candidaturas en el sorteo');
    igual(r.sorteo.escanosEnJuego, 1, 'escaños en juego');
    igual(r.escanosAsignados, 0, 'escaños asignados');
  });

  prueba('Entradas no válidas: 0 escaños provoca un error', function () {
    let fallo = false;
    try { C.dhondt.repartir({ escanos: 0, candidaturas: [{ id: 'A', votos: 1 }] }); } catch (e) { fallo = true; }
    igual(fallo, true, 'lanza error');
  });

  /* ---------- Mayorías ---------- */
  V.umbrales.forEach(function (u) {
    prueba('Umbrales con ' + u.total + ' escaños', function () {
      const r = C.mayorias.umbrales(u.total);
      igual(r.absoluta, u.absoluta, 'mayoría absoluta');
      igual(r.tresQuintos, u.tres_quintos, 'tres quintos');
      igual(r.dosTercios, u.dos_tercios, 'dos tercios');
      igual(r.decima, u.decima, 'una décima parte');
    });
  });

  prueba('Mayoría simple: más a favor que en contra; las abstenciones no cuentan en contra', function () {
    const r = C.mayorias.evaluar({ total: 350, favor: 170, contra: 160 });
    igual(r.simple, true, 'mayoría simple');
    igual(r.absoluta, false, 'mayoría absoluta');
    igual(r.faltanParaAbsoluta, 6, 'faltan para la absoluta');
  });

  /* ---------- Economía y encuestas ---------- */
  const E = V.economia;
  prueba('T6: inflación de la cesta y PIB real', function () {
    aprox(C.economia.variacionPorcentual(E.T6.cesta.inicial, E.T6.cesta.final), E.T6.cesta.esperado, 'inflación');
    aprox(C.economia.crecimientoReal(E.T6.pib_real.nominal, E.T6.pib_real.precios), E.T6.pib_real.esperado, 'PIB real');
  });
  prueba('T7: tipo medio y tipo marginal con tramos ficticios', function () {
    const r = C.economia.cuotaPorTramos(E.T7.base, E.T7.tramos);
    const mas = C.economia.cuotaPorTramos(E.T7.base + E.T7.esperado.aumento_base, E.T7.tramos);
    aprox(r.cuota, E.T7.esperado.cuota, 'cuota');
    aprox(r.tipoMedio, E.T7.esperado.tipo_medio, 'tipo medio');
    igual(r.tipoMarginal, E.T7.esperado.tipo_marginal, 'tipo marginal');
    aprox(mas.cuota - r.cuota, E.T7.esperado.aumento_cuota, 'aumento de la cuota');
    aprox(E.T7.esperado.aumento_base - (mas.cuota - r.cuota), E.T7.esperado.aumento_neto, 'aumento neto');
  });
  prueba('T8: puntos y porcentaje relativo; media y mediana', function () {
    const p = C.economia.puntosYRelativo(E.T8.paro.inicial, E.T8.paro.final);
    aprox(p.puntos, E.T8.paro.esperado_puntos, 'puntos');
    aprox(p.relativo, E.T8.paro.esperado_relativo, 'relativo');
    aprox(C.economia.media(E.T8.salarios.valores), E.T8.salarios.esperado_media, 'media');
    aprox(C.economia.mediana(E.T8.salarios.valores), E.T8.salarios.esperado_mediana, 'mediana');
  });
  prueba('T9: deuda sube y su proporción del PIB baja', function () {
    const r = C.economia.deudaTrasUnAno({ deuda: E.T9.deuda, pib: E.T9.pib, deficitPctPib: E.T9.deficit_pct_pib, crecimientoNominalPct: E.T9.crecimiento_nominal_pct });
    aprox(r.deuda, E.T9.esperado.deuda, 'deuda');
    aprox(r.pib, E.T9.esperado.pib, 'PIB');
    aprox(r.ratio, E.T9.esperado.ratio, 'deuda sobre PIB');
  });
  prueba('T10: margen de error y diferencia entre diferencias', function () {
    V.encuestas.T10.margen.forEach(function (m) {
      aprox(C.encuestas.margenError(m.p, m.n, m.z), m.esperado, 'margen con n = ' + m.n);
    });
    const d = V.encuestas.T10.dif_en_dif;
    aprox(C.encuestas.difEnDif(d.a_antes, d.a_despues, d.b_antes, d.b_despues), d.esperado, 'diferencia entre diferencias');
  });

  /* ---------- Utilidades ---------- */
  prueba('Normalizar: sin tildes, sin apóstrofos y en minúsculas', function () {
    igual(PE.util.normalizar('Ávila'), 'avila', 'Ávila');
    igual(PE.util.normalizar("D'Hondt"), 'dhondt', "D'Hondt");
  });
  prueba('Almacén: guardar, leer, exportar e importar', function () {
    PE.almacen.guardar('prueba-clave', { aciertos: 3 });
    igual(PE.almacen.leer('prueba-clave', null).aciertos, 3, 'leído');
    const exportado = PE.almacen.exportar();
    PE.almacen.borrar('prueba-clave');
    igual(PE.almacen.leer('prueba-clave', null), null, 'borrado');
    PE.almacen.importar(exportado);
    igual(PE.almacen.leer('prueba-clave', null).aciertos, 3, 'importado');
    PE.almacen.borrar('prueba-clave');
  });
  prueba('Etiquetas: diez, con icono y texto', function () {
    igual(PE.etiquetas.lista.length, 10, 'número de etiquetas');
    PE.etiquetas.lista.forEach(function (e) {
      const el = PE.etiquetas.crear(e.texto);
      igual(el.textContent, e.texto, 'texto de ' + e.id);
      igual(el.querySelector('svg') !== null, true, 'icono de ' + e.id);
    });
  });

  /* ---------- Glosario: diez búsquedas de ejemplo (sección 17.1) ---------- */
  [
    ['dhont', 'metodo-dhondt', 'sin apóstrofo y con una letra menos'],
    ['DHONDT', 'metodo-dhondt', 'en mayúsculas'],
    ['cgpj', 'cgpj', 'por sigla'],
    ['consejo general', 'cgpj', 'por parte del nombre'],
    ['BOE', 'boe', 'sigla en mayúsculas'],
    ['mocion censura', 'mocion-de-censura', 'sin tilde y sin «de»'],
    ['decreto ley', 'real-decreto-ley', 'sin guion'],
    ['jerarquia', 'jerarquia-normativa', 'inicio del nombre sin tilde'],
    ['invetidura', 'investidura', 'con una errata'],
    ['ESTADO DE DERECHO', 'estado-de-derecho', 'nombre completo en mayúsculas'],
    ['Moción de censura', 'mocion-de-censura', 'con tilde'],
    ['territorial', 'senado', 'palabra de la definición'],
    ['umbral electoral', 'barrera-electoral', 'por alias'],
    ['escrutino', 'escrutinio', 'con una letra menos'],
    ['VOTO EN BLANCO', 'voto-en-blanco', 'nombre en mayúsculas']
  ].forEach(function (c) {
    prueba('Glosario: «' + c[0] + '» encuentra ' + c[1] + ' en primer lugar (' + c[2] + ')', function () {
      const r = PE.glosario.buscar(c[0]);
      igual(r.length > 0 ? r[0].id : null, c[1], 'primer resultado');
    });
  });
  prueba('Glosario: una búsqueda sin parecido no devuelve nada', function () {
    igual(PE.glosario.buscar('xyzzyq').length, 0, 'resultados');
    igual(PE.glosario.buscar('   ').length, 0, 'resultados de una búsqueda vacía');
  });
  prueba('Glosario: distancia de edición con transposición', function () {
    igual(PE.glosario.distancia('censura', 'cesnura'), 1, 'transposición');
    igual(PE.glosario.distancia('dhont', 'dhondt'), 1, 'una letra');
  });

  /* ---------- Progreso (sección 17.3) ---------- */
  prueba('Progreso: un bloque se completa al estudiarlo y contestar un cuestionario', function () {
    const P = PE.progreso;
    P.borrarTodo();
    P.marcarEstudiado('bloque-x', true);
    igual(P.estaEstudiado('bloque-x'), true, 'estudiado');
    igual(P.completado('bloque-x'), false, 'completado sin cuestionario');
    P.registrarCuestionario('bloque-x', 1, 4);
    igual(P.completado('bloque-x'), true, 'completado con cuestionario (sin nota mínima)');
    const r = P.resumen(['bloque-x', 'bloque-y']);
    igual(r.completados + '/' + r.total + ' ' + r.porcentaje, '1/2 50', 'resumen');
    P.marcarEstudiado('bloque-x', false);
    igual(P.completado('bloque-x'), false, 'completado tras desmarcar');
    P.borrarTodo();
  });
  prueba('Progreso: preguntas falladas, límite de intentos y nada más que aciertos y fechas', function () {
    const P = PE.progreso;
    P.borrarTodo();
    P.registrarRespuesta('p1', false);
    P.registrarRespuesta('p2', true);
    igual(P.fallidas(['p1', 'p2', 'p3']).join(','), 'p1', 'falladas');
    P.registrarRespuesta('p1', true);
    igual(P.fallidas(['p1', 'p2']).length, 0, 'falladas tras acertar');
    for (let i = 0; i < 12; i++) P.registrarCuestionario('bloque-x', i % 5, 4);
    igual(P.intentos('bloque-x').length, 10, 'intentos guardados');
    igual(Object.keys(P.cargar()).sort().join(','), 'cuestionarios,estudiados,respuestas,version', 'claves guardadas');
    igual(Object.keys(P.cargar().respuestas.p1).sort().join(','), 'fecha,ok', 'datos de una respuesta');
    P.borrarTodo();
    igual(Object.keys(P.cargar().respuestas).length, 0, 'borrado');
  });

  /* ---------- Cuestionarios ---------- */
  prueba('Cuestionario: elige como máximo 6 preguntas y respeta el orden si se pide', function () {
    const banco = [1, 2, 3, 4, 5, 6, 7, 8].map(function (n) { return { id: 'q' + n }; });
    igual(PE.cuestionario.seleccionar(banco).length, 6, 'de un banco de 8');
    igual(PE.cuestionario.seleccionar(banco.slice(0, 4)).length, 4, 'de un banco de 4');
    igual(PE.cuestionario.seleccionar(banco.slice(0, 5), false).map(function (q) { return q.id; }).join(','), 'q1,q2,q3,q4,q5', 'sin barajar');
  });
  prueba('Cuestionario: corrección de opciones y de respuestas numéricas', function () {
    const C2 = PE.cuestionario;
    igual(C2.esCorrecta({ tipo: 'opcion_unica', correcta: 'b' }, 'b'), true, 'opción correcta');
    igual(C2.esCorrecta({ tipo: 'opcion_unica', correcta: 'b' }, 'a'), false, 'opción incorrecta');
    igual(C2.esCorrecta({ tipo: 'numerica', correcta: 176, tolerancia: 0 }, '176'), true, 'número exacto');
    igual(C2.esCorrecta({ tipo: 'numerica', correcta: 176, tolerancia: 0 }, '176,0'), true, 'con coma decimal');
    igual(C2.esCorrecta({ tipo: 'numerica', correcta: 176, tolerancia: 0 }, '175'), false, 'número distinto');
    igual(C2.esCorrecta({ tipo: 'numerica', correcta: 176, tolerancia: 0 }, 'ciento'), false, 'texto');
  });
  /* ---------- Módulo 3 (H2) ---------- */
  function ejercicio(id) {
    let encontrado = null;
    PE.textos('m3').bloques.forEach(function (b) {
      (b.explicacion || []).forEach(function (x) {
        if (x.tipo === 'esquema' && x.esquema.tipo === 'calculadora-dhondt') {
          encontrado = encontrado || x.esquema.ejercicios.find(function (e) { return e.id === id; }) || null;
        }
      });
    });
    if (!encontrado) throw new Error('No existe el ejercicio ' + id);
    return encontrado;
  }
  function repartoDe(e, extra) {
    const r = C.dhondt.repartir(Object.assign({ escanos: e.escanos, blancos: e.blancos, candidaturas: e.candidaturas }, extra || {}));
    return Object.keys(r.reparto).map(function (k) { return k + r.reparto[k]; }).join(' ');
  }
  prueba('Calculadora: los ejercicios guiados dan el resultado que explica su texto', function () {
    igual(repartoDe(ejercicio('provincia-pequena')), 'A2 B1 C1 D0 E0', 'provincia de 4 escaños (T5)');
    igual(repartoDe(ejercicio('circunscripcion-grande')), 'A15 B13 C7 D3 E0', 'circunscripción grande con barrera (T4)');
    igual(repartoDe(ejercicio('circunscripcion-grande'), { aplicarBarrera: false }), 'A15 B12 C7 D3 E1', 'sin barrera');
    igual(repartoDe(ejercicio('blancos')), 'A16 B11 C7 D4 P0', 'blancos en la base (T3)');
    igual(repartoDe(ejercicio('blancos'), { baseIncluyeBlancos: false }), 'A15 B11 C7 D4 P1', 'blancos fuera de la base');
    igual(repartoDe(ejercicio('dos-provincias')), 'A2 B1 C0', 'tres escaños');
    igual(repartoDe(ejercicio('dos-provincias'), { escanos: 10 }), 'A5 B3 C2', 'diez escaños');
  });
  prueba('Calendario: días que faltan, en curso y pasados, con la fecha de hoy', function () {
    const dia = new Date(2026, 9, 30);
    igual(PE.calendario.situacion({ desde: '2026-11-29' }, dia).texto, 'Faltan 30 días.', 'votación');
    igual(PE.calendario.situacion({ desde: '2026-10-31' }, dia).texto, 'Falta 1 día.', 'mañana');
    igual(PE.calendario.situacion({ desde: '2026-10-12', hasta: '2026-10-31' }, dia).clase, 'en-curso', 'plazo abierto');
    igual(PE.calendario.situacion({ desde: '2026-10-06' }, dia).clase, 'pasado', 'convocatoria');
  });
  prueba('Simulador de mayorías: el ejemplo inicial falla en la primera votación y sale en la segunda', function () {
    const r = C.mayorias.evaluar({ total: 350, favor: 170, contra: 145 });
    igual(r.absoluta + '/' + r.simple + '/' + r.faltanParaAbsoluta, 'false/true/6', 'primera y segunda votación');
  });

  prueba('Cuestionario: cada bloque de todos los módulos da entre 4 y 6 preguntas', function () {
    PE.textos('modulos').modulos.forEach(function (m) {
      PE.textos(m.id).bloques.forEach(function (b) {
        const n = PE.cuestionario.seleccionar(PE.cuestionario.preguntasDeBloques(b.preguntas_de || [b.id])).length;
        igual(n >= 4 && n <= 6, true, b.id + ' (' + n + ' preguntas)');
      });
    });
  });
  prueba('Cuestionario: cada pregunta trae explicación, artículo y fuente', function () {
    PE.datos('preguntas').registros.forEach(function (p) {
      igual(!!(p.articulo && p.fuente_id && p.explicacion), true, p.id + ' con artículo, fuente y explicación');
    });
  });

  /* ---------- Prueba de humo de la interfaz ---------- */
  const SECCIONES = [];
  PE.textos('modulos').secciones.forEach(function (s) {
    SECCIONES.push(s.ruta);
    s.modulos.forEach(function (idModulo) {
      PE.textos('modulos').modulos.find(function (m) { return m.id === idModulo; }).bloques.forEach(function (id) {
        SECCIONES.push(s.ruta + '/' + id);
      });
    });
  });
  const RUTAS = ['/'].concat(SECCIONES, ['/partidos', '/temas', '/medios',
    '/glosario', '/glosario/investidura', '/buscar', '/buscar/dhont', '/fuentes', '/aprendizaje', '/metodologia',
    '/metodologia/errores', '/licencias', '/leyenda', '/fuentes/boe-rd-806-2026', '/estado/bloque-que-no-existe',
    '/estado/m3-reparto', '/ruta-que-no-existe']);
  const ANCHOS = [1280, 375];
  const humo = [];

  function esperar(condicion, siguiente, fallo) {
    let intentos = 150;
    (function bucle() {
      let ok = false;
      try { ok = condicion(); } catch (e) { ok = false; }
      if (ok) { siguiente(); return; }
      if (--intentos <= 0) { fallo(); return; }
      setTimeout(bucle, 20);
    })();
  }

  function nombreAccesible(el) {
    const doc = el.ownerDocument;
    const aria = el.getAttribute('aria-label');
    if (aria && aria.trim()) return aria.trim();
    if (el.id) {
      const etiqueta = doc.querySelector('label[for="' + el.id + '"]');
      if (etiqueta && etiqueta.textContent.trim()) return etiqueta.textContent.trim();
    }
    return (el.textContent || '').trim();
  }

  function visible(el) {
    return el.getClientRects().length > 0;
  }

  function comprobarPagina(win, ruta) {
    const doc = win.document;
    const problemas = [];
    const main = doc.getElementById('contenido');
    const h1 = main.querySelectorAll('h1');
    if (h1.length !== 1) problemas.push('hay ' + h1.length + ' h1 en el contenido');
    if (h1[0] && doc.title.indexOf(h1[0].textContent) !== 0) problemas.push('el título de la página no empieza por el h1');
    if (win.PE.errores.length) problemas.push('errores en consola: ' + win.PE.errores.join(' | '));
    const raiz = doc.documentElement;
    if (raiz.scrollWidth > raiz.clientWidth + 1) problemas.push('desplazamiento horizontal: ' + raiz.scrollWidth + ' > ' + raiz.clientWidth);
    Array.prototype.forEach.call(doc.querySelectorAll('a, button, select'), function (el) {
      if (!nombreAccesible(el)) problemas.push('control sin nombre accesible: ' + el.outerHTML.slice(0, 80));
    });
    Array.prototype.forEach.call(doc.querySelectorAll('svg'), function (s) {
      if (s.id === 'pe-sprite') return;
      const titulo = s.getAttribute('aria-labelledby') && doc.getElementById(s.getAttribute('aria-labelledby'));
      const conNombre = s.getAttribute('role') === 'img' && (s.getAttribute('aria-label') || (titulo && titulo.textContent.trim()));
      if (s.getAttribute('aria-hidden') !== 'true' && !conNombre) problemas.push('svg sin aria-hidden ni nombre');
    });
    Array.prototype.forEach.call(doc.querySelectorAll('#contenido input:not([type=hidden]), #contenido textarea'), function (el) {
      if (!nombreAccesible(el)) problemas.push('campo sin etiqueta: ' + el.outerHTML.slice(0, 80));
    });
    Array.prototype.forEach.call(doc.querySelectorAll('img'), function (i) {
      if (!i.hasAttribute('alt')) problemas.push('imagen sin alt');
    });
    const ids = {};
    Array.prototype.forEach.call(doc.querySelectorAll('[id]'), function (el) {
      if (ids[el.id]) problemas.push('id duplicado: ' + el.id);
      ids[el.id] = true;
    });
    /* Auditoría de accesibilidad (H5): títulos sin saltos de nivel, referencias
       ARIA y etiquetas que apuntan a ids existentes, y grupos con leyenda. */
    let nivelAnterior = 0;
    Array.prototype.forEach.call(main.querySelectorAll('h1, h2, h3, h4, h5, h6'), function (t) {
      const nivel = Number(t.tagName.charAt(1));
      if (nivelAnterior && nivel > nivelAnterior + 1) problemas.push('salto de título h' + nivelAnterior + ' → h' + nivel + ': ' + t.textContent.trim().slice(0, 50));
      nivelAnterior = nivel;
    });
    ['aria-controls', 'aria-labelledby', 'aria-describedby'].forEach(function (atributo) {
      Array.prototype.forEach.call(doc.querySelectorAll('[' + atributo + ']'), function (el) {
        el.getAttribute(atributo).split(/\s+/).filter(Boolean).forEach(function (id) {
          if (!doc.getElementById(id)) problemas.push(atributo + ' apunta a un id inexistente: ' + id);
        });
      });
    });
    Array.prototype.forEach.call(doc.querySelectorAll('label[for]'), function (l) {
      if (!doc.getElementById(l.getAttribute('for'))) problemas.push('label apunta a un id inexistente: ' + l.getAttribute('for'));
    });
    Array.prototype.forEach.call(doc.querySelectorAll('fieldset'), function (f) {
      const leyenda = f.querySelector('legend');
      if (!leyenda || !leyenda.textContent.trim()) problemas.push('fieldset sin leyenda');
    });
    Array.prototype.forEach.call(doc.querySelectorAll('.cabecera a, .cabecera button, .cabecera select, .menu-principal a, .pie a, .ver-fuente'), function (el) {
      if (!visible(el)) return;
      const alto = el.getBoundingClientRect().height;
      if (alto < 44) problemas.push('objetivo táctil de ' + Math.round(alto) + ' px: ' + nombreAccesible(el));
    });
    const enMenu = win.PE.textos('ui').menu.some(function (m) {
      return m.ruta === '/' ? ruta === '/' : (ruta === m.ruta || ruta.indexOf(m.ruta + '/') === 0);
    });
    const marcados = doc.querySelectorAll('#lista-menu a[aria-current="page"]').length;
    if (marcados !== (enMenu ? 1 : 0)) problemas.push('entradas de menú marcadas como actuales: ' + marcados);
    return problemas;
  }

  function comprobarControles(win, ancho) {
    const doc = win.document;
    const problemas = [];
    const fondo = function () { return win.getComputedStyle(doc.body).backgroundColor; };

    const primero = doc.querySelector('a[href], button, select, [tabindex]:not([tabindex="-1"])');
    if (!primero || !primero.classList.contains('saltar')) problemas.push('el primer elemento enfocable no es «Saltar al contenido»');

    const selector = doc.getElementById('selector-tema');
    selector.value = 'oscuro';
    selector.dispatchEvent(new win.Event('change'));
    if (doc.documentElement.getAttribute('data-theme') !== 'dark') problemas.push('el tema oscuro no se aplica');
    if (fondo() !== 'rgb(21, 23, 26)') problemas.push('fondo en tema oscuro: ' + fondo());
    selector.value = 'claro';
    selector.dispatchEvent(new win.Event('change'));
    if (doc.documentElement.getAttribute('data-theme') !== 'light') problemas.push('el tema claro no se aplica');
    if (fondo() !== 'rgb(251, 250, 247)') problemas.push('fondo en tema claro: ' + fondo());
    selector.value = 'sistema';
    selector.dispatchEvent(new win.Event('change'));
    if (doc.documentElement.hasAttribute('data-theme')) problemas.push('el tema del sistema no quita data-theme');

    const boton = doc.getElementById('boton-menu');
    const menu = doc.getElementById('menu-principal');
    const menuVisible = function () { return win.getComputedStyle(menu).display !== 'none'; };
    if (ancho < 960) {
      if (!visible(boton)) problemas.push('el botón de menú no se ve en móvil');
      if (menuVisible()) problemas.push('el menú está abierto al cargar en móvil');
      boton.click();
      if (boton.getAttribute('aria-expanded') !== 'true' || !menuVisible()) problemas.push('el botón no abre el menú');
      doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      if (boton.getAttribute('aria-expanded') !== 'false' || menuVisible()) problemas.push('Escape no cierra el menú');
    } else {
      if (visible(boton)) problemas.push('el botón de menú se ve en escritorio');
      if (!menuVisible()) problemas.push('el menú no se ve en escritorio');
    }
    return problemas;
  }

  /* ---------- Interacciones de H1 ----------
     Cada paso navega (o ejecuta su acción), espera a que se pinte la ruta y
     devuelve la lista de problemas. El progreso se borra antes y después. */
  function todos(doc, selector) {
    return Array.prototype.slice.call(doc.querySelectorAll(selector));
  }

  const BLOQUE = 'm1-estado';
  let fallada = null;

  const PASOS = [
    { nombre: 'definición emergente del glosario', ruta: '/estado/' + BLOQUE, fn: function (win, doc) {
      const p = [];
      const botones = todos(doc, '#contenido button.termino');
      if (!botones.length) return ['no hay términos con definición emergente'];
      const boton = botones[0];
      const def = doc.getElementById(boton.getAttribute('aria-controls'));
      if (!def || !def.hidden) p.push('la definición no empieza oculta');
      boton.click();
      if (boton.getAttribute('aria-expanded') !== 'true' || def.hidden) p.push('el botón no despliega la definición');
      if (!def.querySelector('a[href^="#/glosario/"]')) p.push('la definición no enlaza al glosario');
      boton.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      if (boton.getAttribute('aria-expanded') !== 'false' || !def.hidden) p.push('Escape no cierra la definición');
      const ids = botones.map(function (b) { return b.getAttribute('aria-controls').replace(/-\d+$/, ''); });
      if (new Set(ids).size !== ids.length) p.push('un término despliega su definición más de una vez en la página');
      return p;
    } },
    { nombre: 'modo básico y ampliado', ruta: '/estado/' + BLOQUE, fn: function (win, doc) {
      const p = [];
      const raiz = doc.documentElement;
      const boton = doc.querySelector('.selector-modo button');
      const extra = doc.querySelector('#contenido .solo-ampliado');
      if (!extra) return ['el bloque no tiene «Para saber más»'];
      if (raiz.getAttribute('data-modo') !== 'basico' || visible(extra)) p.push('el modo básico muestra el contenido ampliado');
      boton.click();
      if (raiz.getAttribute('data-modo') !== 'ampliado' || !visible(extra) || boton.getAttribute('aria-pressed') !== 'true') p.push('el modo ampliado no muestra «Para saber más»');
      boton.click();
      if (raiz.getAttribute('data-modo') !== 'basico' || visible(extra)) p.push('no se vuelve al modo básico');
      return p;
    } },
    { nombre: 'cuestionario: aviso, corrección, explicación y fuente', ruta: '/estado/' + BLOQUE, fn: function (win, doc) {
      const p = [];
      const P = win.PE.progreso;
      const banco = win.PE.datos('preguntas').registros;
      const antes = P.intentos(BLOQUE).length;
      const preguntas = todos(doc, '#contenido fieldset.pregunta');
      if (preguntas.length < 4 || preguntas.length > 6) p.push('el cuestionario tiene ' + preguntas.length + ' preguntas');
      if (!preguntas.length) return p;
      preguntas[0].querySelector('button').click();
      if (!preguntas[0].querySelector('.pregunta__aviso').textContent.trim()) p.push('sin respuesta elegida no avisa');
      preguntas.forEach(function (f, i) {
        const datos = banco.find(function (q) { return q.id === f.getAttribute('data-pregunta'); });
        if (!datos) { p.push('pregunta sin datos: ' + f.getAttribute('data-pregunta')); return; }
        const radios = todos(f, 'input[type=radio]');
        // La primera se contesta mal a propósito; el resto, bien.
        const elegida = radios.find(function (r) { return i === 0 ? r.value !== String(datos.correcta) : r.value === String(datos.correcta); });
        if (elegida) elegida.checked = true;
        else f.querySelector('input').value = i === 0 ? '-1' : String(datos.correcta);
        f.querySelector('button').click();
        const retro = f.querySelector('.retroalimentacion');
        const clase = i === 0 ? 'retroalimentacion--fallo' : 'retroalimentacion--acierto';
        if (!retro.classList.contains(clase)) p.push(datos.id + ': se esperaba ' + clase);
        if (!retro.querySelector('svg') || !retro.querySelector('strong')) p.push(datos.id + ': la corrección no tiene icono y texto');
        if (retro.textContent.indexOf(datos.explicacion) === -1) p.push(datos.id + ': falta la explicación');
        if (!retro.querySelector('.etiqueta') || !retro.querySelector('.ver-fuente')) p.push(datos.id + ': falta la etiqueta o «Ver fuente»');
        if (!f.querySelector('input').disabled) p.push(datos.id + ': la respuesta no queda fijada');
      });
      fallada = preguntas[0].getAttribute('data-pregunta');
      if (P.intentos(BLOQUE).length !== antes + 1) p.push('el intento no se guarda en el progreso');
      const ultimo = P.intentos(BLOQUE)[P.intentos(BLOQUE).length - 1];
      if (!ultimo || ultimo.aciertos !== preguntas.length - 1) p.push('aciertos guardados: ' + (ultimo && ultimo.aciertos));
      if (P.fallidas([fallada]).length !== 1) p.push('la pregunta fallada no queda para repasar');
      if (!doc.querySelector('.cuestionario__resumen').textContent.trim()) p.push('no se muestra el resultado');
      return p;
    } },
    { nombre: 'marcar como estudiado, progreso en el menú, migas y anterior/siguiente', ruta: '/estado/' + BLOQUE, fn: function (win, doc) {
      const p = [];
      const P = win.PE.progreso;
      const boton = doc.querySelector('.estudiado button');
      boton.click();
      if (boton.getAttribute('aria-pressed') !== 'true' || !P.estaEstudiado(BLOQUE)) p.push('no se marca como estudiado');
      if (!P.completado(BLOQUE)) p.push('el bloque no cuenta como completado');
      const entrada = win.PE.textos('ui').menu.find(function (m) { return m.ruta === '/estado'; });
      const total = entrada.modulos.reduce(function (s, id) { return s + win.PE.modulos.idsDeModulo(id).length; }, 0);
      const esperado = win.PE.vistas.reemplazar(win.PE.textos('ui').menu_progreso, { porcentaje: Math.round(100 / total) });
      const hito = doc.querySelector('#lista-menu a[data-ruta="/estado"] .menu__hito');
      if (!hito || hito.textContent !== esperado) p.push('progreso del menú: «' + (hito && hito.textContent) + '», se esperaba «' + esperado + '»');
      if (todos(doc, '.migas a').length !== 3 || !doc.querySelector('.migas [aria-current="page"]')) p.push('migas de pan incompletas');
      const enlaces = todos(doc, '.anterior-siguiente a').map(function (a) { return a.getAttribute('href'); });
      if (enlaces.join(',') !== '#/estado/m1-democracia') p.push('anterior/siguiente del primer bloque: ' + enlaces.join(','));
      return p;
    } },
    { nombre: 'anterior y siguiente en un bloque intermedio', ruta: '/estado/m1-democracia', fn: function (win, doc) {
      const enlaces = todos(doc, '.anterior-siguiente a').map(function (a) { return a.getAttribute('href'); });
      return enlaces.join(',') === '#/estado/m1-estado,#/estado/m1-constitucion' ? [] : ['anterior/siguiente: ' + enlaces.join(',')];
    } },
    { nombre: 'repasar las preguntas falladas (vuelta al bloque)', ruta: '/estado/' + BLOQUE, fn: function (win, doc) {
      const boton = doc.querySelector('.cuestionario > .aviso button');
      if (!boton) return ['no se ofrece repasar la pregunta fallada'];
      boton.click();
      const preguntas = todos(doc, '#contenido fieldset.pregunta').map(function (f) { return f.getAttribute('data-pregunta'); });
      return preguntas.join(',') === fallada ? [] : ['el repaso muestra ' + preguntas.join(',') + ' en vez de ' + fallada];
    } },
    { nombre: 'portada de la sección con el estado de cada bloque', ruta: '/estado', fn: function (win, doc) {
      const T = win.PE.textos('ui').modulo;
      const primero = doc.querySelector('.lista-bloques li .lista-bloques__estado');
      const barra = doc.querySelector('.progreso progress');
      const p = [];
      if (!primero || primero.textContent !== T.completado) p.push('estado del primer bloque: ' + (primero && primero.textContent));
      if (!barra || barra.getAttribute('value') !== '1') p.push('barra de progreso del módulo 1: ' + (barra && barra.getAttribute('value')));
      return p;
    } },
    { nombre: 'Mi aprendizaje refleja el progreso', ruta: '/aprendizaje', fn: function (win, doc) {
      const fila = doc.querySelector('#contenido tbody tr');
      const p = [];
      if (!fila || fila.querySelectorAll('td')[0].textContent === win.PE.textos('ui').aprendizaje.no) p.push('el bloque estudiado no aparece con fecha');
      if (!doc.querySelector('#contenido tbody a[href="#/estado/' + BLOQUE + '"]')) p.push('sin enlace al bloque');
      return p;
    } },
    { nombre: 'diagrama de relaciones: filtro por institución', ruta: '/estado/m2-relaciones', fn: function (win, doc) {
      const p = [];
      const rel = win.PE.datos('relaciones').registros;
      const delRey = rel.filter(function (r) { return r.origen === 'rey' || r.destino === 'rey'; }).length;
      const boton = doc.querySelector('.relaciones__filtros button[data-id="rey"]');
      if (!boton) return ['no hay filtro para el Rey'];
      if (todos(doc, '.relaciones__lista li').length !== rel.length) p.push('la lista inicial no tiene todas las relaciones');
      boton.click();
      if (boton.getAttribute('aria-pressed') !== 'true') p.push('el filtro no queda pulsado');
      if (todos(doc, '.relaciones__lista li').length !== delRey) p.push('la lista filtrada tiene ' + todos(doc, '.relaciones__lista li').length + ' relaciones; se esperaban ' + delRey);
      if (todos(doc, '.relaciones__linea--atenuada').length !== rel.length - delRey) p.push('las flechas atenuadas no cuadran');
      doc.querySelector('.relaciones__filtros button[data-id=""]').click();
      if (todos(doc, '.relaciones__lista li').length !== rel.length) p.push('«Todas» no recupera la lista completa');
      return p;
    } },
    { nombre: 'simulación de ejes: cambiar y reiniciar', ruta: '/estado/m1-ideologia', fn: function (win, doc) {
      const p = [];
      const radios = todos(doc, '.ejes__opciones input[type=radio]');
      const titulo = doc.getElementById('ejes-titulo');
      if (radios.length < 2 || !titulo) return ['faltan los ejes alternativos'];
      if (!doc.querySelector('.ejes .etiqueta--simulacion')) p.push('falta la etiqueta SIMULACIÓN');
      const inicial = titulo.textContent;
      radios[1].checked = true;
      radios[1].dispatchEvent(new win.Event('change'));
      if (titulo.textContent === inicial) p.push('cambiar de eje no cambia el gráfico');
      todos(doc, '.ejes button').pop().click();
      if (!radios[0].checked || titulo.textContent !== inicial) p.push('reiniciar no vuelve al eje inicial');
      return p;
    } },
    { nombre: 'glosario: búsqueda, filtro por bloque e índice', ruta: '/glosario', fn: function (win, doc) {
      const p = [];
      const campo = doc.getElementById('buscar-glosario');
      campo.value = 'dhont';
      campo.dispatchEvent(new win.Event('input'));
      const primera = doc.querySelector('.glosario-resultados .termino-ficha');
      if (!primera || primera.id !== 'termino-metodo-dhondt') p.push('«dhont» no muestra primero el método D\'Hondt');
      campo.value = '';
      campo.dispatchEvent(new win.Event('input'));
      if (!todos(doc, '.indice-alfabetico button').length) p.push('sin índice alfabético');
      const filtro = doc.getElementById('filtro-bloque');
      filtro.value = 'ideologias';
      filtro.dispatchEvent(new win.Event('change'));
      const esperadas = win.PE.glosario.terminos().filter(function (t) { return t.bloque === 'ideologias'; }).length;
      if (todos(doc, '.glosario-resultados .termino-ficha').length !== esperadas) p.push('el filtro por bloque no cuadra');
      filtro.value = '';
      filtro.dispatchEvent(new win.Event('change'));
      return p;
    } },
    { nombre: 'calculadora D\'Hondt: ejemplo de la LOREG, ejercicio, edición y comparación', ruta: '/elecciones/m3-reparto', fn: function (win, doc) {
      const p = [];
      const calc = doc.querySelector('.calculadora');
      if (!calc) return ['no hay calculadora'];
      const escanosDe = function (id) {
        const fila = todos(calc, '.calculadora__resultado table tbody tr').find(function (tr) { return tr.querySelector('th').textContent === id; });
        return fila ? fila.querySelectorAll('td')[3].textContent : null;
      };
      if (escanosDe('A') !== '4' || escanosDe('D') !== '1') p.push('el ejemplo de la LOREG no da A 4 y D 1');
      if (!calc.querySelector('.cociente--escano')) p.push('el cuadro de cocientes no marca los escaños');
      const boton = calc.querySelector('.calculadora__ejercicios button[data-id="provincia-pequena"]');
      boton.click();
      if (boton.getAttribute('aria-pressed') !== 'true') p.push('el ejercicio no queda pulsado');
      if (escanosDe('D') !== '0' || escanosDe('A') !== '2') p.push('la provincia de 4 escaños no da A 2 y D 0');
      if (calc.querySelector('.calculadora__resultado').textContent.indexOf('E queda fuera del reparto') === -1) p.push('no explica por qué E queda fuera');
      const votosD = todos(calc, '.calculadora__votos input').find(function (i) { return calc.querySelector('label[for="' + i.id + '"]').textContent.indexOf(' D') !== -1; });
      votosD.value = '30000';
      votosD.dispatchEvent(new win.Event('input'));
      if (escanosDe('D') !== '1') p.push('al editar los votos de D no se recalcula');
      calc.querySelector('.calculadora__ejercicios button[data-id="blancos"]').click();
      const comp = calc.querySelector('.calculadora__comparacion');
      if (!comp || comp.textContent.indexOf('P: 1') === -1 || !comp.querySelector('.etiqueta--simulacion')) p.push('falta la comparación sin blancos, etiquetada como simulación');
      const campo = calc.querySelector('.calculadora__datos input');
      campo.value = '0';
      campo.dispatchEvent(new win.Event('input'));
      if (!calc.querySelector('.calculadora__aviso').textContent.trim()) p.push('no avisa de un número de escaños no válido');
      return p;
    } },
    { nombre: 'circunscripciones: casillas, vista por escaños y tabla buscable', ruta: '/elecciones/m3-circunscripciones', fn: function (win, doc) {
      const p = [];
      const casillas = todos(doc, '.mapa__casilla');
      if (casillas.length !== 52) p.push('hay ' + casillas.length + ' casillas');
      const madrid = casillas.find(function (c) { return c.getAttribute('aria-label').indexOf('Madrid') === 0; });
      madrid.click();
      if (doc.querySelector('.mapa__detalle').textContent.indexOf('Madrid: 38') !== 0) p.push('el detalle de Madrid no da 38 diputados');
      if (todos(doc, '.mapa__casilla--cambio').length !== 2) p.push('no se marcan solo los dos cambios frente a 2023');
      todos(doc, '.mapa__vistas button')[1].click();
      if (todos(doc, '.mapa__barra').length !== 52 || visible(doc.querySelector('.mapa__rejilla'))) p.push('la vista por escaños no sustituye a las casillas');
      const buscar = doc.querySelector('.mapa__tabla input[type=search]');
      buscar.value = 'cadiz';
      buscar.dispatchEvent(new win.Event('input'));
      if (todos(doc, '.mapa__tabla tbody tr').length !== 1) p.push('la búsqueda sin tilde no encuentra Cádiz');
      buscar.value = '';
      buscar.dispatchEvent(new win.Event('input'));
      const cambios = doc.querySelector('.mapa__tabla input[type=checkbox]');
      cambios.checked = true;
      cambios.dispatchEvent(new win.Event('change'));
      if (todos(doc, '.mapa__tabla tbody tr').length !== 2) p.push('el filtro de cambios no deja Madrid y Cádiz');
      const totales = todos(doc, '.mapa__tabla tfoot td').map(function (td) { return td.textContent; });
      if (totales[0] !== '350' || totales[1] !== '350' || totales[3] !== '209') p.push('totales de la tabla: ' + totales.join(','));
      return p;
    } },
    { nombre: 'Senado: suma de 209 y papeleta de práctica', ruta: '/elecciones/m3-senado', fn: function (win, doc) {
      const p = [];
      if (doc.querySelector('.suma-senado tfoot strong').textContent !== '209') p.push('la suma no da 209');
      const selector = doc.querySelector('.papeleta select');
      const veredicto = function () { return doc.querySelector('.papeleta__veredicto').className; };
      const cajas = function () { return todos(doc, '.papeleta__candidatos input[type=checkbox]'); };
      selector.value = 'zaragoza';
      selector.dispatchEvent(new win.Event('change'));
      if (veredicto().indexOf('--blanco') === -1) p.push('sin marcas no es voto en blanco');
      cajas().slice(0, 4).forEach(function (c) { c.checked = true; c.dispatchEvent(new win.Event('change')); });
      if (veredicto().indexOf('--nulo') === -1) p.push('cuatro marcas en una provincia no anulan el voto');
      cajas()[3].checked = false;
      cajas()[3].dispatchEvent(new win.Event('change'));
      if (veredicto().indexOf('--valido') === -1) p.push('tres marcas en una provincia no dan voto válido');
      selector.value = 'ibiza';
      selector.dispatchEvent(new win.Event('change'));
      cajas().slice(0, 2).forEach(function (c) { c.checked = true; c.dispatchEvent(new win.Event('change')); });
      if (veredicto().indexOf('--nulo') === -1) p.push('dos marcas en Ibiza no anulan el voto');
      return p;
    } },
    { nombre: 'calendario del 29-N: hitos, etiquetas, fuentes y días que faltan', ruta: '/elecciones/m3-convocatoria', fn: function (win, doc) {
      const p = [];
      const hitos = win.PE.datos('convocatorias').registros.find(function (c) { return c.id === 'eg-2026'; }).hitos;
      const items = todos(doc, '.calendario__hito');
      if (items.length !== hitos.length) p.push('hay ' + items.length + ' hitos de ' + hitos.length);
      if (items.some(function (li) { return !li.querySelector('.etiqueta') || !li.querySelector('.ver-fuente') || !li.querySelector('.calendario__situacion').textContent; })) p.push('algún hito no tiene etiqueta, fuente o situación');
      const pendientes = hitos.filter(function (x) { return x.estado !== 'verificado'; }).length;
      if (todos(doc, '.calendario__hito .etiqueta--pendiente').length !== pendientes) p.push('las fechas pendientes no llevan su etiqueta');
      if (!doc.querySelector('.calendario__hito--votacion')) p.push('no se destaca la votación');
      if (!doc.querySelector('.calendario .dato .etiqueta--oficial')) p.push('el censo no lleva la etiqueta de dato oficial');
      return p;
    } },
    { nombre: 'simulador de mayorías: segunda votación, sin investidura y suma de escaños', ruta: '/elecciones/m3-gobierno', fn: function (win, doc) {
      const p = [];
      const texto = function () { return doc.querySelector('.mayorias__resultado').textContent; };
      if (texto().indexOf('Segunda votación, 48 horas después: investidura.') === -1) p.push('el ejemplo inicial no sale en la segunda votación');
      const selects = todos(doc, '.mayorias select');
      selects[3].value = 'no';
      selects[3].dispatchEvent(new win.Event('change'));
      if (texto().indexOf('no hay investidura') === -1 || !doc.querySelector('.mayorias__resultado a[href="#/elecciones/m3-gobierno"]')) p.push('con más noes no explica qué pasa sin investidura');
      const escanos = todos(doc, '.mayorias input[type=number]');
      escanos[0].value = '200';
      escanos[0].dispatchEvent(new win.Event('input'));
      if (doc.querySelector('.mayorias__suma').textContent.indexOf('sobran 70') === -1) p.push('no avisa de que sobran escaños');
      if (texto()) p.push('muestra un resultado con una suma distinta de 350');
      return p;
    } },
    { nombre: 'competencias: tabla buscable y «¿Quién decide?»', ruta: '/competencias/m4-reparto', fn: function (win, doc) {
      const p = [];
      const filas = function () { return todos(doc, '.tabla-competencias tbody tr'); };
      if (filas().length !== 15) p.push('la tabla tiene ' + filas().length + ' materias');
      if (todos(doc, '.tabla-competencias td').some(function (td) { return !td.querySelector('.etiqueta') || !td.querySelector('.ver-fuente'); })) p.push('alguna celda no tiene etiqueta o fuente');
      const buscar = doc.querySelector('.competencias input[type=search]');
      buscar.value = 'policia';
      buscar.dispatchEvent(new win.Event('input'));
      if (filas().length !== 1 || filas()[0].querySelector('th').textContent !== 'Seguridad y policía') p.push('buscar «policia» no deja solo Seguridad y policía');
      const selector = doc.querySelector('.quien-decide select');
      selector.value = 'irpf';
      selector.dispatchEvent(new win.Event('change'));
      const niveles = todos(doc, '.quien-decide__nivel');
      if (niveles.length !== 2) p.push('la pregunta del IRPF muestra ' + niveles.length + ' niveles');
      if (niveles.some(function (li) { return !li.querySelector('.nivel .icono') || !li.querySelector('.etiqueta--norma') || li.textContent.indexOf('Consulta del') === -1; })) p.push('cada nivel debe tener icono, NORMA VIGENTE y fecha de consulta');
      if (doc.querySelector('.quien-decide__respuesta').textContent.indexOf('El ayuntamiento no fija el IRPF') === -1) p.push('falta la nota del IRPF');
      return p;
    } },
    { nombre: 'economía: tablero, fichas y calculadoras T6 a T9', ruta: '/economia/m5-leer-datos', fn: function (win, doc) {
      const p = [];
      // Sin separador de miles (el formato español no agrupa las cifras de cuatro dígitos) y con el signo menos normalizado.
      const res = todos(doc, '.calc .calc__resultado').map(function (x) { return x.textContent.replace(/(\d)\.(\d{3})/g, '$1$2').replace(/−/g, '-'); });
      const esperado = ['Variación: 3,00 %.', 'Crecimiento real: 1,94 %.', 'Diferencia: -2,00 puntos porcentuales; en términos relativos, -16,67 %.', 'Media: 2600,00. Mediana: 1300,00.'];
      esperado.forEach(function (x, i) { if (res[i] !== x) p.push('calculadora ' + (i + 1) + ': «' + res[i] + '»'); });
      if (res[4].indexOf('Cuota: 6300,00 euros. Tipo medio: 18,00 %. Tipo marginal: 30,00 %.') !== 0 || res[4].indexOf('sube 300,00 y la persona se queda con 700,00 más') === -1) p.push('tramos: «' + res[4] + '»');
      if (res[5] !== 'Deuda tras un año: 1030,00. PIB: 1040,00. Deuda sobre PIB: 99,04 %.') p.push('deuda: «' + res[5] + '»');
      const base = doc.getElementById(doc.querySelector('.calc__tramos').closest('.calc').querySelector('input').id);
      base.value = 12000;
      base.dispatchEvent(new win.Event('input'));
      if (doc.querySelectorAll('.calc .calc__resultado')[4].textContent.indexOf('Tipo marginal: 10,00 %') === -1) p.push('al cambiar la base no se recalcula el tipo marginal');
      return p;
    } },
    { nombre: 'economía: tablero de indicadores y gráfico con tabla', ruta: '/economia/m5-indicadores', fn: function (win, doc) {
      const p = [];
      const tarjetas = todos(doc, '.tablero__tarjeta');
      if (tarjetas.length !== 15) p.push('el tablero tiene ' + tarjetas.length + ' indicadores');
      if (tarjetas.some(function (t) { return !t.querySelector('.etiqueta') || !t.querySelector('.ver-fuente'); })) p.push('algún indicador no tiene etiqueta o fuente');
      if (todos(doc, '.ficha').length < 13) p.push('faltan fichas de indicadores');
      if (todos(doc, '.ficha .etiqueta--pendiente').length < 1) p.push('los datos sin cargar no aparecen como pendientes');
      return p;
    } },
    { nombre: 'economía: gráfico del euríbor con eje desde cero y tabla', ruta: '/economia/m5-monetaria', fn: function (win, doc) {
      const p = [];
      const svg = doc.querySelector('.grafico__svg');
      if (!svg || svg.querySelectorAll('.grafico__barra').length !== 12) p.push('el gráfico no tiene 12 barras');
      const ceros = todos(doc, '.grafico__svg .grafico__eje-texto').filter(function (t) { return t.textContent === '0'; });
      if (!ceros.length) p.push('el eje no empieza en cero');
      if (todos(doc, '.grafico__tabla tbody tr').length !== 12) p.push('la tabla alternativa no tiene 12 filas');
      if (doc.querySelector('.grafico .meta-texto').textContent.indexOf('3 de noviembre de 2026') === -1) p.push('no muestra la fecha de la publicación más reciente');
      return p;
    } },
    { nombre: 'partidos: fichas con buscador, filtros, orden y estructura común', ruta: '/partidos/m6-fichas', fn: function (win, doc) {
      const p = [];
      const fichas = function () { return todos(doc, '.ficha-partido'); };
      if (fichas().length !== 26) p.push('hay ' + fichas().length + ' fichas, no 26');
      if (fichas()[0].getAttribute('data-partido') !== 'adelante-andalucia') p.push('el orden por defecto no es alfabético por siglas');
      const partes = fichas().map(function (f) { return todos(f, '.ficha-partido__parte h4').map(function (x) { return x.textContent; }).join('|'); });
      if (partes.some(function (x) { return x !== partes[0]; }) || partes[0].split('|').length !== 8) p.push('las fichas no tienen las mismas siete partes y sus fuentes');
      const buscar = doc.querySelector('.fichas-partidos input[type="search"]');
      buscar.value = 'bildu';
      buscar.dispatchEvent(new win.Event('input'));
      if (fichas().length !== 1 || fichas()[0].getAttribute('data-partido') !== 'ehbildu') p.push('buscar «bildu» no deja solo EH Bildu');
      buscar.value = '';
      buscar.dispatchEvent(new win.Event('input'));
      const selects = todos(doc, '.fichas-partidos select');
      selects[0].value = 'estatal';
      selects[0].dispatchEvent(new win.Event('change'));
      const estatales = fichas().map(function (f) { return f.getAttribute('data-partido'); }).sort().join(',');
      if (estatales !== 'podemos,pp,psoe,salf,sumar,vox') p.push('filtro estatal: ' + estatales);
      selects[0].value = '';
      selects[0].dispatchEvent(new win.Event('change'));
      selects[1].value = 'europeo';
      selects[1].dispatchEvent(new win.Event('change'));
      if (fichas().length !== 7) p.push('con escaño propio en el Parlamento Europeo hay ' + fichas().length + ', no 7');
      selects[1].value = '';
      selects[1].dispatchEvent(new win.Event('change'));
      selects[2].value = 'congreso';
      selects[2].dispatchEvent(new win.Event('change'));
      if (fichas()[0].getAttribute('data-partido') !== 'pp' || fichas()[1].getAttribute('data-partido') !== 'psoe') p.push('el orden por escaños no empieza por PP y PSOE');
      const ficha = doc.querySelector('[data-partido="upn"]');
      if (!ficha.querySelector('.ficha-partido__votaciones') || ficha.querySelectorAll('.ficha-partido__votaciones tbody tr').length !== 76) p.push('UPN no muestra sus 76 votaciones');
      if (doc.querySelector('[data-partido="podemos"] .ficha-partido__votaciones')) p.push('Podemos no debería tener votaciones atribuidas');
      if (todos(doc, '.ficha-partido .etiqueta--pendiente').length < 26 * 3) p.push('faltan etiquetas de pendiente en autodefinición, gobiernos o programa');
      return p;
    } },
    { nombre: 'partidos: comparador sin puntuación y tabla de simetría', ruta: '/partidos/m6-comparador', fn: function (win, doc) {
      const p = [];
      const columnas = function () { return todos(doc, '.comparador thead th').length - 1; };
      if (columnas() !== 8) p.push('el comparador muestra ' + columnas() + ' partidos por defecto, no los 8 de la lista mínima');
      if (todos(doc, '.comparador tbody tr').length !== 9) p.push('el comparador no tiene los 9 temas');
      if (todos(doc, '.comparador td .etiqueta--pendiente').length !== 72) p.push('no todas las celdas dicen pendiente');
      const casilla = doc.querySelector('.comparador__partidos input[value="bng"]');
      casilla.checked = true;
      casilla.dispatchEvent(new win.Event('change', { bubbles: true }));
      if (columnas() !== 9) p.push('marcar BNG no añade una columna');
      const filas = todos(doc, '.tabla-simetria tbody tr');
      if (filas.length !== 26) p.push('la tabla de simetría no tiene 26 filas');
      if (doc.querySelector('.simetria--fuera')) p.push('alguna ficha se aparta más de un 15 %');
      const fuentes = filas.map(function (f) { return f.cells[3].textContent; });
      if (fuentes.some(function (x) { return x !== fuentes[0]; })) p.push('las fichas no tienen el mismo número de fuentes');
      return p;
    } },
    { nombre: 'partidos: efecto territorial con datos de 2023 y ejemplo ficticio', ruta: '/partidos/m6-tipos', fn: function (win, doc) {
      const p = [];
      const escanos = {};
      todos(doc, '.efecto-territorial tr[data-partido]').forEach(function (tr) { escanos[tr.getAttribute('data-partido')] = tr.cells[3].textContent; });
      if (escanos.A !== '2' || escanos.B !== '0') p.push('A y B deberían tener 2 y 0 escaños: ' + JSON.stringify(escanos));
      const sel = doc.querySelector('.efecto-territorial select');
      sel.value = 'pp';
      sel.dispatchEvent(new win.Event('change'));
      const texto = doc.querySelector('.efecto-territorial [aria-live]').textContent;
      if (texto.indexOf('52 circunscripciones') === -1 || texto.indexOf('137 escaños') === -1) p.push('el resumen del PP no dice 52 circunscripciones y 137 escaños');
      return p;
    } },
    { nombre: 'temas: ciclo de una medida en ocho fases', ruta: '/temas/m7-ciclo', fn: function (win, doc) {
      const p = [];
      const fases = todos(doc, '.ciclo__fase');
      if (fases.length !== 8) p.push('el ciclo tiene ' + fases.length + ' fases');
      if (doc.querySelector('.ciclo__panel .etiqueta--propuesta') === null) p.push('la fase 1 no lleva la etiqueta PROPUESTA');
      fases[4].click();
      if (fases[4].getAttribute('aria-current') !== 'step' || !doc.querySelector('.ciclo__panel .etiqueta--norma')) p.push('la fase 5 no muestra NORMA VIGENTE');
      const botones = todos(doc, '.ciclo__navegacion button');
      botones[1].click();
      if (fases[5].getAttribute('aria-current') !== 'step') p.push('«Fase siguiente» no avanza');
      return p;
    } },
    { nombre: 'temas: «¿Quién decide?» incrustado y datos del tema', ruta: '/temas/m7-vivienda', fn: function (win, doc) {
      const p = [];
      const sel = doc.querySelector('.quien-decide select');
      const opciones = todos(sel, 'option').map(function (o) { return o.value; }).filter(Boolean).join(',');
      if (opciones !== 'vivienda,ibi') p.push('las preguntas del tema son ' + opciones);
      sel.value = 'vivienda';
      sel.dispatchEvent(new win.Event('change'));
      if (todos(doc, '.quien-decide__nivel').length !== 2) p.push('la pregunta de vivienda no muestra dos niveles');
      if (todos(doc, '.tablero__tarjeta').length !== 3) p.push('el tema no muestra sus tres datos oficiales');
      if (todos(doc, '.comparador tbody tr').length !== 1) p.push('el comparador del tema no tiene una sola fila');
      return p;
    } },
    { nombre: 'análisis: ficha de ocho preguntas con tres medidas y «sin información verificada»', ruta: '/temas/m8-ficha', fn: function (win, doc) {
      const p = [];
      const sel = doc.querySelector('.ficha-medidas select');
      const ids = todos(sel, 'option').map(function (o) { return o.value; });
      if (ids.length !== 3) p.push('hay ' + ids.length + ' medidas, no 3');
      ids.forEach(function (id) {
        sel.value = id;
        sel.dispatchEvent(new win.Event('change'));
        const preguntas = todos(doc, '.ficha-medida__pregunta');
        if (preguntas.length !== 8) p.push(id + ': ' + preguntas.length + ' preguntas');
        if (preguntas.some(function (x) { return !x.querySelector('.etiqueta'); })) p.push(id + ': una respuesta sin etiqueta');
        const sin = preguntas.filter(function (x) { return x.textContent.indexOf('sin información verificada') !== -1; }).length;
        if (sin !== 2) p.push(id + ': ' + sin + ' respuestas sin información verificada, no 2');
        if (/no funciona|sí funciona|ha funcionado/i.test(doc.querySelector('.ficha-medidas').textContent)) p.push(id + ': la ficha da un veredicto');
      });
      return p;
    } },
    { nombre: 'análisis: clasificación de doce frases con corrección y explicación', ruta: '/temas/m8-afirmaciones', fn: function (win, doc) {
      const p = [];
      const items = todos(doc, '.clasificador__item');
      if (items.length !== 12) p.push('hay ' + items.length + ' frases, no 12');
      items.forEach(function (it, i) {
        const valor = i === 0 ? (it.getAttribute('data-correcta') === 'objetivo' ? 'prevision' : 'objetivo') : it.getAttribute('data-correcta');
        it.querySelector('input[value="' + valor + '"]').checked = true;
      });
      doc.querySelector('.clasificador .boton').click();
      const resultado = doc.querySelector('.clasificador__resultado').textContent;
      if (resultado.indexOf('11 de 12') === -1) p.push('el recuento dice «' + resultado + '», no 11 de 12');
      if (!items[0].querySelector('.retroalimentacion--fallo') || !items[1].querySelector('.retroalimentacion--acierto')) p.push('la corrección no distingue acierto y fallo');
      if (items.some(function (it) { return !it.querySelector('.clasificador__retro').textContent.trim(); })) p.push('alguna frase sin explicación');
      return p;
    } },
    { nombre: 'análisis: comparador antes-después (12→10 frente a 12→11) y edición', ruta: '/temas/m8-causalidad', fn: function (win, doc) {
      const p = [];
      const salida = function () { return doc.querySelector('.antes-despues .calc__resultado').textContent; };
      if (salida().indexOf('Cambio en A: -2') === -1 || salida().indexOf('Cambio en B: -1') === -1 || salida().indexOf('medida: -1 puntos') === -1) p.push('el ejemplo de 15.4 no da -2, -1 y -1: ' + salida());
      const campo = doc.querySelector('.antes-despues input[id$="-bd"]');
      campo.value = '12';
      campo.dispatchEvent(new win.Event('input'));
      if (salida().indexOf('medida: -2 puntos') === -1) p.push('si B no cambia, la diferencia debería ser -2: ' + salida());
      return p;
    } },
    { nombre: 'análisis: calculadora del margen de error (1.000 entrevistas, 50 %)', ruta: '/temas/m8-encuestas', fn: function (win, doc) {
      const p = [];
      const salida = function () { return doc.querySelector('.margen-error .calc__resultado').textContent; };
      if (salida().indexOf('±3,1 puntos') === -1 || salida().indexOf('95 %') === -1) p.push('el ejemplo no da ±3,1 al 95 %: ' + salida());
      const n = doc.querySelector('.margen-error input[id$="-n"]');
      n.value = '4000';
      n.dispatchEvent(new win.Event('input'));
      if (salida().indexOf('±1,5 puntos') === -1) p.push('con 4.000 entrevistas debería dar ±1,5: ' + salida());
      return p;
    } },
    { nombre: 'medios: fichas con la misma estructura y filtros sin orientación', ruta: '/medios/m9-fichas', fn: function (win, doc) {
      const p = [];
      const total = win.PE.datos('medios').registros.length;
      const fichas = function () { return todos(doc, '.ficha-medio'); };
      if (fichas().length !== total) p.push('se muestran ' + fichas().length + ' de ' + total + ' fichas');
      if (fichas().some(function (f) { return f.querySelectorAll('.ficha-medio__parte').length !== 5; })) p.push('alguna ficha no tiene cinco apartados');
      const nombres = fichas().map(function (f) { return f.querySelector('.ficha-medio__nombre').textContent; });
      const ordenados = nombres.slice().sort(function (a, b) { return a.localeCompare(b, 'es', { sensitivity: 'base' }); });
      if (nombres.join('|') !== ordenados.join('|')) p.push('las fichas no están en orden alfabético');
      /* Extensión del texto propio de cada ficha, sin contar etiquetas ni botones «Ver fuente». */
      const palabras = fichas().map(function (f) {
        const copia = f.querySelector('.ficha-medio__cuerpo').cloneNode(true);
        Array.prototype.forEach.call(copia.querySelectorAll('.etiqueta, .ver-fuente'), function (x) { x.remove(); });
        return copia.textContent.trim().split(/\s+/).length;
      });
      const media = palabras.reduce(function (a, b) { return a + b; }, 0) / palabras.length;
      palabras.forEach(function (n, i) {
        if (Math.abs(n - media) > 0.15 * media) p.push(nombres[i] + ': ' + n + ' palabras frente a una media de ' + Math.round(media) + ' (más de un 15 %)');
      });
      const selects = todos(doc, '.fichas-medios select');
      if (selects.length !== 2) p.push('hay ' + selects.length + ' filtros, no 2 (soporte y propietario)');
      if (/orientaci/i.test(selects.map(function (s) { return s.textContent + s.id; }).join(' '))) p.push('hay un filtro por orientación');
      selects[0].value = 'radio';
      selects[0].dispatchEvent(new win.Event('change'));
      if (fichas().length !== 4) p.push('el filtro de radio muestra ' + fichas().length + ' fichas, no 4');
      selects[0].value = '';
      selects[1].value = 'sin_documentar';
      selects[0].dispatchEvent(new win.Event('change'));
      selects[1].dispatchEvent(new win.Event('change'));
      if (fichas().length !== 6) p.push('el filtro de propiedad sin documentar muestra ' + fichas().length + ', no 6');
      if (todos(doc, '.mapa-propiedad__grupo').length < 5) p.push('el mapa de propiedad tiene menos de cinco grupos');
      return p;
    } },
    { nombre: 'medios: verificadores con sello de la IFCN, propiedad y metodología', ruta: '/medios/m9-contrastar', fn: function (win, doc) {
      const p = [];
      const filas = todos(doc, '.tabla-verificadores tbody tr');
      if (filas.length !== win.PE.datos('verificadores').registros.length) p.push('la tabla no tiene todos los verificadores');
      if (filas.some(function (f) { return f.cells.length !== 4; })) p.push('alguna fila no tiene cuatro columnas');
      ['newtral', 'efe-verifica', 'verificartve'].forEach(function (id) {
        if (!doc.querySelector('.tabla-verificadores tr[data-verificador="' + id + '"]')) p.push('falta ' + id + ' (Anexo D.7)');
      });
      return p;
    } },
    { nombre: 'medios: analizador de una noticia inventada y clasificación de seis textos', ruta: '/medios/m9-comprobaciones', fn: function (win, doc) {
      const p = [];
      const casillas = todos(doc, '.analizador input[type=checkbox]');
      if (casillas.length !== 5) p.push('el analizador tiene ' + casillas.length + ' comprobaciones, no 5');
      casillas.forEach(function (c) { c.checked = true; c.dispatchEvent(new win.Event('change')); });
      if (todos(doc, '.analizador__hallazgo[hidden]').length) p.push('alguna comprobación marcada no muestra lo que se encuentra');
      if (doc.querySelector('.analizador [aria-live]').textContent.indexOf('5 de 5') === -1) p.push('el progreso no llega a 5 de 5');
      if (!doc.querySelector('.analizador .etiqueta--simulacion')) p.push('la noticia no lleva SIMULACIÓN');
      const items = todos(doc, '.clasificador__item');
      if (items.length !== 6) p.push('hay ' + items.length + ' textos, no 6');
      if (todos(doc, '.revelar__caso').length < 1) p.push('falta el ejercicio de fecha y contexto');
      return p;
    } },
    { nombre: 'fuentes oficiales: índice de grupos, búsqueda, filtro por estado y fecha', ruta: '/fuentes', fn: function (win, doc) {
      const p = [];
      const total = win.PE.fuentes.todas().length;
      const visibles = function () { return todos(doc, '.fuente').filter(function (f) { return !f.hidden; }).length; };
      if (visibles() !== total) p.push('se ven ' + visibles() + ' de ' + total + ' fuentes');
      if (todos(doc, '.indice-fuentes a[data-grupo]').length < 8) p.push('el índice no tiene los grupos');
      if (/preliminar/i.test(doc.getElementById('contenido').textContent)) p.push('la página aún dice «versión preliminar»');
      if (todos(doc, '.fuente').some(function (f) { return f.textContent.indexOf('Fecha de comprobación:') === -1; })) p.push('alguna fuente sin fecha de comprobación');
      const campo = doc.getElementById('fuentes-buscar');
      campo.value = 'CONSTITUCION';
      campo.dispatchEvent(new win.Event('input'));
      if (!visibles() || !doc.getElementById('fuente-boe-constitucion') || doc.getElementById('fuente-boe-constitucion').hidden) p.push('buscar «CONSTITUCION» no encuentra la Constitución');
      campo.value = '';
      campo.dispatchEvent(new win.Event('input'));
      const estado = doc.getElementById('fuentes-estado');
      estado.value = 'no';
      estado.dispatchEvent(new win.Event('change'));
      const noVerif = win.PE.fuentes.todas().filter(function (f) { return f.estado_enlace === 'no_verificada'; }).length;
      if (visibles() !== noVerif) p.push('el filtro «No verificada» muestra ' + visibles() + ', no ' + noVerif);
      estado.value = '';
      estado.dispatchEvent(new win.Event('change'));
      return p;
    } },
    { nombre: 'buscador de la cabecera con una errata', ruta: '/buscar/invetidura', accion: function (win, doc) {
      doc.getElementById('campo-buscador').value = 'invetidura';
      doc.getElementById('buscador').dispatchEvent(new win.Event('submit', { bubbles: true, cancelable: true }));
    }, fn: function (win, doc) {
      return doc.querySelector('#contenido a[href="#/glosario/investidura"]') ? [] : ['no encuentra «investidura»'];
    } }
  ];

  function interacciones(win, ancho, siguiente) {
    win.PE.progreso.borrarTodo();
    win.PE.almacen.borrar('modo');
    win.PE.aplicarModo();
    (function paso(i) {
      if (i >= PASOS.length) {
        win.PE.progreso.borrarTodo();
        siguiente();
        return;
      }
      const s = PASOS[i];
      const contenido = win.document.getElementById('contenido');
      const apuntar = function (problemas) {
        humo.push({ ancho: ancho, ruta: '(interacción: ' + s.nombre + ')', ok: problemas.length === 0, problemas: problemas });
        paso(i + 1);
      };
      // Si ya estamos en la ruta, se vuelve a pintar pasando por otra.
      if (contenido.getAttribute('data-ruta') === s.ruta && !s.accion) {
        win.location.hash = '#/';
      }
      esperar(function () { return contenido.getAttribute('data-ruta') !== s.ruta; }, function () {
        if (s.accion) s.accion(win, win.document);
        else win.location.hash = '#' + s.ruta;
        esperar(function () { return contenido.getAttribute('data-ruta') === s.ruta; }, function () {
          let problemas;
          try { problemas = s.fn(win, win.document); } catch (e) { problemas = ['excepción: ' + e.message]; }
          apuntar(problemas);
        }, function () { apuntar(['la ruta ' + s.ruta + ' no se mostró']); });
      }, function () { apuntar(['no se pudo salir de la ruta ' + s.ruta]); });
    })(0);
  }

  function terminar() {
    const pre = document.getElementById('resultados');
    pre.textContent = JSON.stringify({ unitarias: unitarias, humo: humo }, null, 1);
    pre.setAttribute('data-fin', '1');
  }

  function ejecutarHumo() {
    if (window.location.protocol === 'file:') {
      humo.push({ ancho: 0, ruta: '(todas)', ok: false, problemas: ['la prueba de humo necesita un servidor local: usa python tools/run_tests.py'] });
      terminar();
      return;
    }
    const marco = document.createElement('iframe');
    marco.title = 'Web en pruebas';
    marco.style.height = '900px';
    marco.style.border = '1px solid #999';
    document.body.appendChild(marco);
    let a = 0;

    function siguienteAncho() {
      if (a >= ANCHOS.length) { terminar(); return; }
      const ancho = ANCHOS[a];
      marco.style.width = ancho + 'px';
      marco.onload = function () {
        esperar(function () { return marco.contentWindow.PE && marco.contentWindow.PE.listo; },
          function () { recorrer(ancho, 0); },
          function () { humo.push({ ancho: ancho, ruta: '/', ok: false, problemas: ['la web no terminó de cargar'] }); a++; siguienteAncho(); });
      };
      // La consulta cambia en cada ancho para forzar una carga nueva (no solo un cambio de #).
      marco.src = '../index.html?prueba=1&ancho=' + ancho + '#/';
    }

    function recorrer(ancho, i) {
      const win = marco.contentWindow;
      if (i >= RUTAS.length) {
        interacciones(win, ancho, function () {
          const problemas = comprobarControles(win, ancho);
          humo.push({ ancho: ancho, ruta: '(controles: tema, menú, saltar)', ok: problemas.length === 0, problemas: problemas });
          a++;
          siguienteAncho();
        });
        return;
      }
      const ruta = RUTAS[i];
      win.location.hash = '#' + ruta;
      esperar(function () { return win.document.getElementById('contenido').getAttribute('data-ruta') === ruta; },
        function () {
          const problemas = comprobarPagina(win, ruta);
          humo.push({ ancho: ancho, ruta: ruta, ok: problemas.length === 0, problemas: problemas });
          recorrer(ancho, i + 1);
        },
        function () {
          humo.push({ ancho: ancho, ruta: ruta, ok: false, problemas: ['la ruta no se mostró'] });
          recorrer(ancho, i + 1);
        });
    }

    siguienteAncho();
  }

  try {
    ejecutarHumo();
  } catch (e) {
    humo.push({ ancho: 0, ruta: '(arnés)', ok: false, problemas: ['excepción en la prueba de humo: ' + e.message] });
    terminar();
  }
})();
