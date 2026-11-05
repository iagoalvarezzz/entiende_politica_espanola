/* Módulo 7, «Los temas políticos» (sección 14).
   - ciclo-medida: las ocho fases de una medida, del anuncio a la medición de
     resultados, con el documento que prueba cada una y su etiqueta (sección
     14.2). La medida es inventada (SIMULACIÓN). Funciona como lista ordenada
     y, con JavaScript, como un recorrido fase a fase. */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;
  let contador = 0;

  function T() {
    return PE.textos('ui').temas;
  }

  function ciclo(e) {
    contador += 1;
    const id = 'ciclo' + contador;
    const t = T();
    let actual = 0;
    const panel = h('div', { class: 'ciclo__panel', id: id + '-panel', 'aria-live': 'polite' });
    const botones = e.fases.map(function (f, i) {
      return h('button', { type: 'button', class: 'ciclo__fase', 'aria-controls': id + '-panel', 'data-fase': String(i + 1),
        onclick: function () { actual = i; pintar(); } },
      h('span', { class: 'ciclo__numero' }, String(i + 1)), ' ', f.nombre);
    });
    const anterior = h('button', { type: 'button', class: 'boton', onclick: function () { if (actual > 0) { actual -= 1; pintar(); } } }, t.anterior);
    const siguiente = h('button', { type: 'button', class: 'boton', onclick: function () { if (actual < e.fases.length - 1) { actual += 1; pintar(); } } }, t.siguiente);

    function pintar() {
      const f = e.fases[actual];
      botones.forEach(function (b, i) { b.setAttribute('aria-current', i === actual ? 'step' : 'false'); });
      anterior.disabled = actual === 0;
      siguiente.disabled = actual === e.fases.length - 1;
      panel.textContent = '';
      panel.appendChild(h('h3', { class: 'ciclo__titulo' }, PE.vistas.reemplazar(t.fase, { n: actual + 1, total: e.fases.length }) + ': ' + f.nombre));
      panel.appendChild(h('p', null, PE.contenido.enLinea(f.que)));
      panel.appendChild(h('p', null, h('strong', null, t.prueba + ': '), PE.contenido.enLinea(f.prueba)));
      panel.appendChild(h('p', null, h('strong', null, t.etiqueta + ': '), PE.etiquetas.crear(f.etiqueta)));
      panel.appendChild(h('p', { class: 'ciclo__ejemplo' }, PE.etiquetas.crear('SIMULACIÓN'), ' ', PE.contenido.enLinea(f.ejemplo)));
    }
    pintar();

    return h('div', { class: 'ciclo' },
      h('p', null, PE.etiquetas.crear('SIMULACIÓN'), ' ', PE.contenido.enLinea(e.medida)),
      h('ol', { class: 'ciclo__fases' }, botones.map(function (b) { return h('li', null, b); })),
      panel,
      h('p', { class: 'ciclo__navegacion' }, anterior, ' ', siguiente));
  }

  PE.esquemas.registrar('ciclo-medida', ciclo);
})();
