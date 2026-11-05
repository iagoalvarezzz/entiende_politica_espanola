/* Página del glosario (sección 17.1): buscador que ignora mayúsculas y
   tildes y tolera pequeñas erratas, índice alfabético, filtros por bloque y
   por módulo, y enlaces entre términos relacionados. */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;

  function inicial(termino) {
    return PE.util.normalizar(termino.termino).charAt(0).toUpperCase();
  }

  function ficha(t, T) {
    const relacionados = (t.relacionados || []).map(function (id) { return PE.glosario.obtener(id); }).filter(Boolean);
    return h('article', { class: 'termino-ficha', id: 'termino-' + t.id, tabindex: '-1' },
      h('h3', null, t.termino),
      h('p', null, t.definicion),
      h('p', null, h('strong', null, T.ejemplo + ' '), t.ejemplo),
      t.disputado ? h('p', { class: 'aviso aviso--disputado' }, PE.etiquetas.crear('INTERPRETACIÓN ATRIBUIDA'), ' ', T.disputado + ' ' + t.atribucion) : null,
      h('p', { class: 'meta-texto' },
        PE.etiquetas.crear(t.etiqueta), ' ',
        t.articulo ? T.base + ' ' + t.articulo + '. ' : '',
        PE.fuentes.botonVerFuente(t.fuente_id)),
      relacionados.length ? h('p', null, h('strong', null, T.relacionados + ' '), relacionados.map(function (r, i) {
        return [i ? ', ' : '', h('a', { href: '#/glosario/' + r.id }, r.termino)];
      })) : null);
  }

  function vista(main, params) {
    const T = PE.textos('ui').glosario;
    const conjunto = PE.datos('glosario');
    const todos = PE.glosario.terminos().slice().sort(function (a, b) { return a.termino.localeCompare(b.termino, 'es'); });
    const modulos = PE.textos('modulos').modulos;

    main.appendChild(h('h1', null, T.titulo));
    T.intro.forEach(function (p) { main.appendChild(h('p', null, p)); });

    const campo = h('input', { type: 'search', id: 'buscar-glosario', class: 'campo', autocomplete: 'off', spellcheck: 'false' });
    const bloque = h('select', { id: 'filtro-bloque', class: 'selector' },
      h('option', { value: '' }, T.todos_bloques),
      Object.keys(conjunto.bloques).map(function (k) { return h('option', { value: k }, conjunto.bloques[k]); }));
    const modulo = h('select', { id: 'filtro-modulo', class: 'selector' },
      h('option', { value: '' }, T.todos_modulos),
      modulos.map(function (m) { return h('option', { value: m.id }, m.titulo_corto); }));
    const estado = h('p', { class: 'meta-texto', 'aria-live': 'polite' });
    const indice = h('nav', { class: 'indice-alfabetico', 'aria-label': T.indice });
    const resultados = h('div', { class: 'glosario-resultados' });

    main.appendChild(h('form', { class: 'formulario-filtros', role: 'search', onsubmit: function (e) { e.preventDefault(); } },
      h('p', null, h('label', { for: 'buscar-glosario' }, T.buscar), campo),
      h('p', null, h('label', { for: 'filtro-bloque' }, T.bloque), bloque),
      h('p', null, h('label', { for: 'filtro-modulo' }, T.modulo), modulo)));
    main.appendChild(estado);
    main.appendChild(indice);
    main.appendChild(resultados);

    function pintar() {
      const q = campo.value.trim();
      let lista = q ? PE.glosario.buscar(q) : todos;
      if (bloque.value) lista = lista.filter(function (t) { return t.bloque === bloque.value; });
      if (modulo.value) lista = lista.filter(function (t) { return t.modulo === modulo.value; });
      estado.textContent = PE.vistas.reemplazar(lista.length === 1 ? T.uno : T.varios, { n: lista.length });
      resultados.textContent = '';
      indice.textContent = '';
      if (!lista.length) {
        resultados.appendChild(h('p', null, T.sin_resultados));
        return;
      }
      if (q) {
        lista.forEach(function (t) { resultados.appendChild(ficha(t, T)); });
        return;
      }
      const grupos = {};
      lista.forEach(function (t) {
        const l = inicial(t);
        (grupos[l] = grupos[l] || []).push(t);
      });
      const letras = Object.keys(grupos).sort(function (a, b) { return a.localeCompare(b, 'es'); });
      indice.appendChild(h('ul', null, letras.map(function (l) {
        return h('li', null, h('button', {
          type: 'button',
          class: 'boton boton--letra',
          'aria-label': PE.vistas.reemplazar(T.ir_letra, { letra: l }),
          onclick: function () {
            const destino = document.getElementById('letra-' + l);
            destino.focus();
            destino.scrollIntoView({ block: 'start' });
          }
        }, l));
      })));
      letras.forEach(function (l) {
        resultados.appendChild(h('h2', { id: 'letra-' + l, tabindex: '-1' }, l));
        grupos[l].forEach(function (t) { resultados.appendChild(ficha(t, T)); });
      });
    }

    campo.addEventListener('input', pintar);
    bloque.addEventListener('change', pintar);
    modulo.addEventListener('change', pintar);
    pintar();
    if (params.resto) {
      const t = PE.glosario.obtener(params.resto);
      if (!t) main.insertBefore(h('div', { class: 'aviso', role: 'status' }, h('p', null, PE.vistas.reemplazar(T.no_existe, { id: params.resto }))), estado);
    }
    return T.titulo;
  }

  PE.vistas = PE.vistas || {};
  PE.vistas.glosario = vista;
})();
