/* Leyenda de etiquetas, colores de institución y estados de enlace
   (sección 7.3: accesible desde cualquier página por el pie). */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;

  function leyenda(main) {
    const t = PE.textos('leyenda');
    main.appendChild(h('h1', null, t.titulo));
    main.appendChild(h('p', null, t.intro));
    main.appendChild(h('ul', { class: 'leyenda' }, PE.etiquetas.lista.map(function (e) {
      return h('li', null, PE.etiquetas.crear(e.texto), h('p', null, t.etiquetas[e.id]));
    })));

    main.appendChild(h('h2', { id: 'instituciones' }, t.instituciones.titulo));
    main.appendChild(h('p', null, t.instituciones.intro));
    main.appendChild(h('ul', { class: 'leyenda' }, t.instituciones.lista.map(function (i) {
      return h('li', null, h('span', { class: 'institucion institucion--' + i.id }, PE.icono(i.id), i.nombre));
    })));

    main.appendChild(h('h2', { id: 'estados-enlace' }, t.estados_enlace.titulo));
    PE.contenido.renderizar(main, [{ tipo: 'definiciones', items: t.estados_enlace.items }]);
    return t.titulo;
  }

  PE.vistas = PE.vistas || {};
  PE.vistas.leyenda = leyenda;
})();
