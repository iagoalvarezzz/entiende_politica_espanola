/* Vistas de páginas generales: inicio, páginas de contenido, secciones
   pendientes y página no encontrada. Cada vista devuelve su título. */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;
  const u = PE.util;

  function reemplazar(plantilla, valores) {
    return plantilla.replace(/\{(\w+)\}/g, function (_, clave) {
      return valores[clave] !== undefined ? valores[clave] : '{' + clave + '}';
    });
  }

  /* Un dato con su etiqueta y su enlace «Ver fuente». */
  function filaDato(texto, etiqueta, fuenteId) {
    return h('div', { class: 'dato' },
      PE.etiquetas.crear(etiqueta),
      h('p', { class: 'dato__texto' }, texto),
      fuenteId ? PE.fuentes.botonVerFuente(fuenteId) : null);
  }

  function hito(convocatoria, id) {
    return convocatoria.hitos.find(function (x) { return x.id === id; });
  }

  function tarjetaConvocatoria() {
    const t = PE.textos('inicio').convocatoria;
    const conjunto = PE.datos('convocatorias');
    const conv = conjunto && conjunto.registros.find(function (c) { return c.id === 'eg-2026'; });
    if (!conv) return null;
    const votacion = hito(conv, 'votacion');
    const campana = hito(conv, 'campana');
    const cortes = hito(conv, 'constitucion-cortes');
    const etiqueta = function (x) { return PE.etiquetas.segunEstado(x.estado); };
    return h('section', { class: 'tarjeta', 'aria-labelledby': 'titulo-convocatoria' },
      h('h2', { id: 'titulo-convocatoria' }, t.titulo),
      filaDato(t.norma, 'DATO OFICIAL', conv.norma_id),
      filaDato(reemplazar(t.votacion, { fecha: u.formatoFecha(votacion.desde, true) }), etiqueta(votacion), votacion.fuente_id),
      filaDato(reemplazar(t.campana, { desde: u.formatoFecha(campana.desde), hasta: u.formatoFecha(campana.hasta) }), etiqueta(campana), campana.fuente_id),
      filaDato(reemplazar(t.cortes, { fecha: u.formatoFecha(cortes.desde), hora: cortes.hora }), etiqueta(cortes), cortes.fuente_id),
      h('p', null, t.sin_resultados),
      h('p', { class: 'meta-texto' }, PE.contenido.enLinea(t.mas)));
  }

  /* Ruta recomendada (sección 18.2), con el progreso de las secciones disponibles. */
  function rutaRecomendada(t) {
    const ui = PE.textos('ui');
    return h('ol', { class: 'ruta' }, t.ruta.pasos.map(function (p) {
      const entrada = ui.menu.find(function (m) { return m.ruta === p.ruta; });
      let estado;
      if (entrada && entrada.modulos) {
        const bloques = [];
        entrada.modulos.forEach(function (id) { Array.prototype.push.apply(bloques, PE.modulos.idsDeModulo(id)); });
        estado = PE.vistas.reemplazar(ui.modulo.progreso, PE.progreso.resumen(bloques));
      } else {
        estado = ui.menu_hito_prefijo + ' ' + entrada.hito;
      }
      return h('li', { class: 'ruta__paso' },
        h('a', { href: '#' + p.ruta }, entrada.texto),
        h('span', { class: 'ruta__descripcion' }, p.descripcion),
        h('span', { class: 'meta-texto' }, estado));
    }));
  }

  function inicio(main) {
    const t = PE.textos('inicio');
    main.appendChild(h('h1', null, t.titulo));
    t.intro.forEach(function (p) { main.appendChild(h('p', null, p)); });
    main.appendChild(h('h2', null, t.mapa.titulo));
    main.appendChild(PE.esquemas.renderizar(t.mapa.esquema));
    const tarjeta = tarjetaConvocatoria();
    if (tarjeta) main.appendChild(tarjeta);
    main.appendChild(h('h2', null, t.ruta.titulo));
    t.ruta.texto.forEach(function (p) { main.appendChild(h('p', null, PE.contenido.enLinea(p))); });
    main.appendChild(rutaRecomendada(t));
    main.appendChild(h('h2', null, t.estado.titulo));
    main.appendChild(h('p', null, t.estado.texto));
    main.appendChild(h('ul', { class: 'lista' }, t.estado.disponibles.map(function (i) {
      return h('li', null, PE.contenido.enLinea(i));
    })));
    return t.titulo;
  }

  /* Página construida con bloques de content/es/<nombre>.json. */
  function paginaDeContenido(nombre) {
    return function (main) {
      const t = PE.textos(nombre);
      main.appendChild(h('h1', null, t.titulo));
      PE.contenido.renderizar(main, t.bloques);
      return t.titulo;
    };
  }

  function pendiente(ruta) {
    return function (main) {
      const ui = PE.textos('ui').pendiente;
      const p = PE.textos('pendientes').rutas.find(function (r) { return r.ruta === ruta; });
      main.appendChild(h('h1', null, p.titulo));
      main.appendChild(h('p', null, reemplazar(ui.texto, { hito: p.hito })));
      main.appendChild(h('p', null, ui.incluira));
      main.appendChild(h('ul', { class: 'lista' }, p.incluira.map(function (i) { return h('li', null, i); })));
      main.appendChild(h('p', null, h('a', { href: '#/' }, ui.volver)));
      return p.titulo;
    };
  }

  function noEncontrada(main, params) {
    const t = PE.textos('ui').no_encontrada;
    main.appendChild(h('h1', null, t.titulo));
    main.appendChild(h('p', null, reemplazar(t.texto, { ruta: params.ruta || '' })));
    main.appendChild(h('p', null, h('a', { href: '#/' }, t.volver)));
    return t.titulo;
  }

  PE.vistas = PE.vistas || {};
  PE.vistas.inicio = inicio;
  PE.vistas.paginaDeContenido = paginaDeContenido;
  PE.vistas.pendiente = pendiente;
  PE.vistas.noEncontrada = noEncontrada;
  PE.vistas.reemplazar = reemplazar;
})();
