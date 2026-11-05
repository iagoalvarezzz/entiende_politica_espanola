/* Núcleo: espacio de nombres PE, utilidades comunes y registro de errores.
   Se carga antes que cualquier otro script (scripts clásicos, sin módulos,
   para que la web funcione abriendo index.html desde el disco). */
(function () {
  'use strict';

  const PE = window.PE = window.PE || {};
  PE.version = '0.6.0';
  PE.calc = PE.calc || {};
  PE.errores = [];
  PE.modoPrueba = /[?&]prueba=1(&|$)/.test(window.location.search);

  window.addEventListener('error', function (evento) {
    PE.errores.push(String(evento.message || evento.error || 'Error desconocido'));
  });
  window.addEventListener('unhandledrejection', function (evento) {
    PE.errores.push('Promesa rechazada: ' + String(evento.reason));
  });
  if (PE.modoPrueba && window.console && typeof console.error === 'function') {
    const original = console.error.bind(console);
    console.error = function () {
      PE.errores.push(Array.prototype.join.call(arguments, ' '));
      original.apply(null, arguments);
    };
  }

  /* Acceso a los conjuntos generados por tools/build.py. */
  PE.datos = function (nombre) {
    return (window.PE_DATOS || {})[nombre] || null;
  };
  PE.textos = function (nombre) {
    return (window.PE_TEXTOS || {})[nombre] || null;
  };

  /* Crea un elemento HTML. Los textos se insertan siempre como nodos de texto. */
  function h(etiqueta, atributos) {
    const el = document.createElement(etiqueta);
    if (atributos) {
      Object.keys(atributos).forEach(function (clave) {
        const valor = atributos[clave];
        if (valor === null || valor === undefined || valor === false) return;
        if (clave === 'class') el.className = valor;
        else if (clave === 'text') el.textContent = valor;
        else if (clave.indexOf('on') === 0 && typeof valor === 'function') el.addEventListener(clave.slice(2), valor);
        else el.setAttribute(clave, valor === true ? '' : String(valor));
      });
    }
    for (let i = 2; i < arguments.length; i++) anadir(el, arguments[i]);
    return el;
  }

  function anadir(el, hijo) {
    if (hijo === null || hijo === undefined || hijo === false) return;
    if (Array.isArray(hijo)) hijo.forEach(function (c) { anadir(el, c); });
    else if (typeof hijo === 'string' || typeof hijo === 'number') el.appendChild(document.createTextNode(String(hijo)));
    else el.appendChild(hijo);
  }

  /* Minúsculas y sin tildes, para buscar y comparar. */
  function normalizar(texto) {
    return String(texto || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[’'`´]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const formatoEntero = new Intl.NumberFormat('es-ES');

  function formatoNumero(n, decimales) {
    if (typeof decimales === 'number') {
      return new Intl.NumberFormat('es-ES', { minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(n);
    }
    return formatoEntero.format(n);
  }

  /* Interpreta AAAA-MM-DD como fecha local, sin desfases de zona horaria. */
  function fechaDesdeIso(iso) {
    const partes = String(iso).split('-').map(Number);
    return new Date(partes[0], partes[1] - 1, partes[2]);
  }

  function formatoFecha(iso, conDiaSemana) {
    const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
    if (conDiaSemana) opciones.weekday = 'long';
    return new Intl.DateTimeFormat('es-ES', opciones).format(fechaDesdeIso(iso));
  }

  PE.util = {
    h: h,
    anadir: anadir,
    normalizar: normalizar,
    formatoNumero: formatoNumero,
    fechaDesdeIso: fechaDesdeIso,
    formatoFecha: formatoFecha
  };
  PE.h = h;
})();
