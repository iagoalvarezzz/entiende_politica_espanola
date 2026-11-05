/* Página «Fuentes oficiales» (sección 17.2): inventario de data/sources.json
   agrupado por tipo, con índice de grupos y recuentos, buscador (ignora
   mayúsculas y tildes), filtro por estado del enlace y fecha de comprobación
   de cada fuente. El estado lo escribe tools/check_links.py. Al final, la
   fecha de actualización de cada conjunto de datos (sección 3.5). */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;
  const u = PE.util;

  /* Clave del estado para el filtro: comprobada, navegador, anexo, raiz o no. */
  function claveEstado(f) {
    if (PE.fuentes.comprobada(f)) return 'comprobadas';
    if (f.estado_enlace === 'no_verificada') return 'no';
    if (f.estado_enlace === 'raiz_sin_verificar') return 'raiz';
    if (f.comprobado_por === 'navegador') return 'navegador';
    return 'anexo';
  }

  function resumen(fuentes, plantilla) {
    const cuenta = { comprobadas: 0, navegador: 0, anexo: 0, raiz: 0, no: 0 };
    fuentes.forEach(function (f) { cuenta[claveEstado(f)]++; });
    return PE.vistas.reemplazar(plantilla, cuenta);
  }

  function tablaConjuntos(t) {
    const indice = PE.datos('_indice');
    if (!indice) return null;
    return h('div', { class: 'tabla-contenedor', role: 'region', tabindex: '0', 'aria-label': t.titulo },
      h('table', null,
        h('caption', { class: 'visualmente-oculto' }, t.titulo),
        h('thead', null, h('tr', null,
          h('th', { scope: 'col' }, t.conjunto),
          h('th', { scope: 'col' }, t.version),
          h('th', { scope: 'col' }, t.actualizado),
          h('th', { scope: 'col' }, t.descripcion))),
        h('tbody', null, indice.conjuntos.map(function (c) {
          return h('tr', null,
            h('td', null, h('code', null, c.conjunto)),
            h('td', null, c.version),
            h('td', null, u.formatoFecha(c.actualizado)),
            h('td', null, c.descripcion));
        }))));
  }

  function ficha(f, campos, destacada) {
    const estadoTexto = PE.fuentes.describirEstado(f);
    return h('article', { class: 'fuente' + (destacada ? ' fuente--destacada' : ''), id: 'fuente-' + f.id, 'data-estado': claveEstado(f), tabindex: destacada ? '-1' : null },
      h('h3', null, f.titulo),
      h('p', { class: 'meta-texto' }, f.institucion),
      f.uso ? h('p', null, h('strong', null, campos.para_que), ' ' + f.uso) : null,
      h('p', null, h('strong', null, campos.enlace), ' ', PE.fuentes.enlace(f)),
      h('p', null, h('strong', null, campos.estado), ' ' + estadoTexto),
      h('p', null, h('strong', null, campos.fecha), ' ' + (f.fecha_comprobacion ? u.formatoFecha(f.fecha_comprobacion) : campos.sin_fecha)),
      f.resultado ? h('p', { class: 'meta-texto' }, campos.resultado + ' ' + f.resultado) : null,
      f.nota ? h('p', { class: 'meta-texto' }, campos.nota + ' ' + f.nota) : null);
  }

  function texto(f) {
    return u.normalizar([f.titulo, f.institucion, f.uso || '', f.url, f.id].join(' '));
  }

  function vista(main, params) {
    const t = PE.textos('fuentes');
    const fuentes = PE.fuentes.todas();
    const destacada = params.resto || null;
    const grupos = Object.keys(t.grupos).filter(function (g) { return fuentes.some(function (f) { return f.grupo === g; }); });

    main.appendChild(h('h1', null, t.titulo));
    t.intro.forEach(function (p) { main.appendChild(h('p', null, p)); });
    if (destacada && !PE.fuentes.obtener(destacada)) {
      main.appendChild(h('div', { class: 'aviso', role: 'status' }, h('p', null, PE.vistas.reemplazar(t.no_encontrada, { id: destacada }))));
    }
    main.appendChild(h('p', null, resumen(fuentes, t.resumen)));

    /* Índice de grupos con recuentos. */
    main.appendChild(h('nav', { class: 'indice-fuentes', 'aria-label': t.indice },
      h('h2', null, t.indice),
      h('ul', { class: 'lista' }, grupos.map(function (g) {
        const n = fuentes.filter(function (f) { return f.grupo === g; }).length;
        return h('li', null, h('a', { href: '#/fuentes', 'data-grupo': g }, t.grupos[g]), ' ', h('span', { class: 'meta-texto' }, PE.vistas.reemplazar(t.n_fuentes, { n: n })));
      })),
      h('p', null, h('a', { href: '#/fuentes', 'data-grupo': 'conjuntos' }, t.conjuntos.titulo))));

    /* Buscador y filtro por estado. */
    const buscador = h('input', { type: 'search', id: 'fuentes-buscar', class: 'campo', autocomplete: 'off' });
    const estado = h('select', { id: 'fuentes-estado', class: 'selector' },
      h('option', { value: '' }, t.filtro.todos),
      Object.keys(t.estados).map(function (k) { return h('option', { value: k }, t.estados[k]); }));
    const recuento = h('p', { class: 'meta-texto', 'aria-live': 'polite' });
    main.appendChild(h('div', { class: 'formulario-filtros', role: 'search' },
      h('p', null, h('label', { for: 'fuentes-buscar' }, t.filtro.buscar), ' ', buscador),
      h('p', null, h('label', { for: 'fuentes-estado' }, t.filtro.estado), ' ', estado)));
    main.appendChild(recuento);

    const secciones = grupos.map(function (g) {
      const lista = fuentes.filter(function (f) { return f.grupo === g; })
        .slice().sort(function (a, b) { return a.titulo.localeCompare(b.titulo, 'es'); })
        .map(function (f) { return { f: f, nodo: ficha(f, t.campos, f.id === destacada), texto: texto(f) }; });
      const titulo = h('h2', { id: 'grupo-' + g, tabindex: '-1' }, t.grupos[g]);
      const vacio = h('p', { class: 'meta-texto', hidden: true }, t.filtro.sin_resultados_grupo);
      const seccion = h('section', { class: 'grupo-fuentes', 'aria-labelledby': 'grupo-' + g }, titulo, lista.map(function (x) { return x.nodo; }), vacio);
      main.appendChild(seccion);
      return { g: g, lista: lista, seccion: seccion, vacio: vacio };
    });

    function filtrar() {
      const q = u.normalizar(buscador.value.trim());
      const e = estado.value;
      let total = 0;
      secciones.forEach(function (s) {
        let visibles = 0;
        s.lista.forEach(function (x) {
          const ok = (!q || x.texto.indexOf(q) !== -1) && (!e || claveEstado(x.f) === e);
          x.nodo.hidden = !ok;
          if (ok) visibles++;
        });
        s.seccion.hidden = !visibles && !!(q || e);
        s.vacio.hidden = !!visibles || !(q || e);
        total += visibles;
      });
      recuento.textContent = PE.vistas.reemplazar(t.filtro.recuento, { n: total, total: fuentes.length });
    }
    buscador.addEventListener('input', filtrar);
    estado.addEventListener('change', filtrar);
    filtrar();

    /* Los enlaces del índice llevan a su grupo sin cambiar la ruta. */
    Array.prototype.forEach.call(main.querySelectorAll('.indice-fuentes a[data-grupo]'), function (a) {
      a.addEventListener('click', function (ev) {
        ev.preventDefault();
        const destino = document.getElementById(a.getAttribute('data-grupo') === 'conjuntos' ? 'conjuntos' : 'grupo-' + a.getAttribute('data-grupo'));
        if (destino) { destino.scrollIntoView(); destino.focus(); }
      });
    });

    main.appendChild(h('h2', { id: 'conjuntos', tabindex: '-1' }, t.conjuntos.titulo));
    const tabla = tablaConjuntos(t.conjuntos);
    if (tabla) main.appendChild(tabla);
    return t.titulo;
  }

  PE.vistas = PE.vistas || {};
  PE.vistas.fuentes = vista;
})();
