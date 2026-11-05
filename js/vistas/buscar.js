/* Buscador global (secciones 7.3 y 18.3): busca en el glosario y en los
   títulos de las páginas y bloques. Mismas reglas que el glosario: sin
   mayúsculas, sin tildes y con tolerancia a pequeñas erratas. */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;

  /* Títulos buscables: entradas del menú, páginas generales y bloques. */
  function paginas() {
    const ui = PE.textos('ui');
    const lista = ui.menu.map(function (m) { return { titulo: m.texto, ruta: m.ruta }; });
    lista.push({ titulo: ui.pie.metodologia, ruta: '/metodologia' });
    lista.push({ titulo: ui.pie.licencias, ruta: '/licencias' });
    lista.push({ titulo: ui.pie.leyenda, ruta: '/leyenda' });
    PE.modulos.secuencia().forEach(function (x) {
      lista.push({ titulo: x.bloque.numero + ' ' + x.bloque.titulo, ruta: PE.modulos.ruta(x.bloque.id), contexto: x.modulo.titulo_corto });
    });
    return lista;
  }

  function buscarPaginas(texto) {
    const q = PE.glosario.normalizar(texto);
    if (!q) return [];
    const palabras = q.split(' ');
    return paginas().filter(function (p) {
      const titulo = PE.glosario.normalizar(p.titulo);
      const suyas = titulo.split(' ');
      return palabras.every(function (w) {
        return titulo.indexOf(w) !== -1 || (w.length >= 4 && suyas.some(function (s) { return PE.glosario.distancia(w, s) <= (w.length >= 8 ? 2 : 1); }));
      });
    });
  }

  function formulario(valor) {
    const T = PE.textos('ui').buscador;
    const campo = h('input', { type: 'search', id: 'buscar-pagina', class: 'campo', value: valor || '', autocomplete: 'off' });
    return h('form', {
      class: 'formulario-filtros',
      role: 'search',
      onsubmit: function (e) {
        e.preventDefault();
        if (campo.value.trim()) window.location.hash = '#/buscar/' + encodeURIComponent(campo.value.trim());
      }
    }, h('p', null, h('label', { for: 'buscar-pagina' }, T.etiqueta), campo, ' ', h('button', { type: 'submit', class: 'boton' }, T.boton)));
  }

  function vista(main, params) {
    const T = PE.textos('ui').buscador;
    const q = params.resto || '';
    main.appendChild(h('h1', null, T.titulo));
    main.appendChild(formulario(q));
    if (!q) {
      main.appendChild(h('p', null, T.vacio));
      return T.titulo;
    }
    const terminos = PE.glosario.buscar(q);
    const encontradas = buscarPaginas(q);
    main.appendChild(h('p', { role: 'status' }, PE.vistas.reemplazar(T.resumen, { q: q, terminos: terminos.length, paginas: encontradas.length })));
    main.appendChild(h('h2', null, T.en_glosario));
    main.appendChild(terminos.length ? h('ul', { class: 'lista' }, terminos.map(function (t) {
      return h('li', null, h('a', { href: '#/glosario/' + t.id }, t.termino), ': ' + t.definicion);
    })) : h('p', null, T.nada));
    main.appendChild(h('h2', null, T.en_paginas));
    main.appendChild(encontradas.length ? h('ul', { class: 'lista' }, encontradas.map(function (p) {
      return h('li', null, h('a', { href: '#' + p.ruta }, p.titulo), p.contexto ? ' (' + p.contexto + ')' : '');
    })) : h('p', null, T.nada));
    return T.titulo;
  }

  PE.vistas = PE.vistas || {};
  PE.vistas.buscar = vista;
  PE.buscador = { paginas: paginas, buscarPaginas: buscarPaginas };
})();
