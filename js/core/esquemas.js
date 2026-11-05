/* Esquemas de los módulos en HTML (sin imágenes): pasos, comparativa,
   jerarquía y grupos. Cada uno es una lista o una tabla, así que ya es su
   propia alternativa textual. Los esquemas interactivos (ejes y relaciones)
   se registran desde sus vistas. */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;
  const interactivos = {};

  function texto(t) {
    return PE.contenido.enLinea(t);
  }

  function pasos(e) {
    return h('ol', { class: 'esquema-pasos' }, e.pasos.map(function (p) {
      return h('li', { class: 'esquema-pasos__paso' + (p.institucion ? ' institucion--' + p.institucion : '') },
        h('span', { class: 'esquema-pasos__titulo' }, p.titulo),
        p.texto ? h('span', { class: 'esquema-pasos__texto' }, texto(p.texto)) : null);
    }));
  }

  /* En pantallas estrechas la tabla se apila en fichas (modulos.css); los
     roles explícitos conservan la semántica de tabla al cambiar el display. */
  function comparativa(e) {
    return h('div', { class: 'tabla-contenedor', role: 'region', tabindex: '0', 'aria-label': e.titulo },
      h('table', { class: 'tabla-apilable', role: 'table' },
        h('caption', { class: 'visualmente-oculto' }, e.titulo),
        h('thead', { role: 'rowgroup' }, h('tr', { role: 'row' }, e.columnas.map(function (c) { return h('th', { scope: 'col', role: 'columnheader' }, c); }))),
        h('tbody', { role: 'rowgroup' }, e.filas.map(function (f) {
          return h('tr', { role: 'row' }, f.map(function (celda, i) {
            return i === 0
              ? h('th', { scope: 'row', role: 'rowheader' }, texto(celda))
              : h('td', { role: 'cell', 'data-columna': e.columnas[i] }, texto(celda));
          }));
        }))));
  }

  function jerarquia(e) {
    return h('ol', { class: 'esquema-jerarquia' }, e.niveles.map(function (n, i) {
      return h('li', { class: 'esquema-jerarquia__nivel', style: '--nivel:' + i },
        h('span', { class: 'esquema-jerarquia__titulo' }, n.titulo),
        n.texto ? h('span', { class: 'esquema-jerarquia__texto' }, texto(n.texto)) : null);
    }));
  }

  function grupos(e) {
    return h('ul', { class: 'esquema-grupos' }, e.grupos.map(function (g) {
      return h('li', { class: 'esquema-grupos__grupo' + (g.institucion ? ' institucion--' + g.institucion : '') },
        h('span', { class: 'esquema-grupos__titulo' }, g.institucion ? PE.icono(g.institucion) : null, g.titulo),
        h('ul', null, g.items.map(function (i) { return h('li', null, texto(i)); })));
    }));
  }

  const TIPOS = { pasos: pasos, comparativa: comparativa, jerarquia: jerarquia, grupos: grupos };

  function registrar(tipo, fn) {
    interactivos[tipo] = fn;
  }

  function renderizar(e) {
    const fn = TIPOS[e.tipo] || interactivos[e.tipo];
    if (!fn) throw new Error('Tipo de esquema desconocido: ' + e.tipo);
    return h('figure', { class: 'esquema esquema--' + e.tipo },
      h('figcaption', null, h('span', { class: 'esquema__titulo' }, e.titulo), e.descripcion ? h('span', { class: 'esquema__descripcion' }, e.descripcion) : null),
      fn(e));
  }

  PE.esquemas = { renderizar: renderizar, registrar: registrar };
})();
