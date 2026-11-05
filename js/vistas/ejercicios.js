/* Ejercicios comunes de los módulos 8 y 9 (secciones 15.7 y 16.7).
   - clasificador: frases inventadas que se clasifican en categorías (objetivo,
     previsión, resultado u opinión; noticia, análisis u opinión), con
     corrección y explicación al pulsar «Comprobar».
   - ejercicio-revelar: un caso inventado, una pregunta y la respuesta en un
     desplegable.
   - analizador-noticia: una noticia inventada y las cinco comprobaciones de la
     sección 16.6 como lista interactiva.
   Todos los textos son inventados y llevan la etiqueta SIMULACIÓN. */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;
  let contador = 0;

  function T() {
    return PE.textos('ui').ejercicios;
  }

  function clasificador(e) {
    contador += 1;
    const id = 'cl' + contador;
    const t = T();
    const resultado = h('p', { class: 'clasificador__resultado', 'aria-live': 'polite' });
    const items = e.items.map(function (it, i) {
      const nombre = id + '-' + i;
      const retro = h('p', { class: 'clasificador__retro', 'aria-live': 'polite' });
      const fs = h('fieldset', { class: 'clasificador__item', 'data-correcta': it.correcta },
        h('legend', null, h('span', { class: 'clasificador__numero' }, (i + 1) + '. '), PE.contenido.enLinea(it.texto)),
        h('div', { class: 'clasificador__opciones' }, e.categorias.map(function (c) {
          const r = h('input', { type: 'radio', name: nombre, id: nombre + '-' + c.id, value: c.id });
          return h('span', { class: 'clasificador__opcion' }, r, h('label', { for: nombre + '-' + c.id }, c.nombre));
        })),
        retro);
      return { fs: fs, retro: retro, it: it, nombre: nombre };
    });
    const boton = h('button', { type: 'button', class: 'boton' }, t.comprobar);
    boton.addEventListener('click', function () {
      let aciertos = 0;
      items.forEach(function (x) {
        const marcada = x.fs.querySelector('input:checked');
        const ok = marcada && marcada.value === x.it.correcta;
        if (ok) aciertos += 1;
        const nombre = e.categorias.find(function (c) { return c.id === x.it.correcta; }).nombre;
        x.retro.textContent = '';
        x.retro.className = 'clasificador__retro retroalimentacion ' + (ok ? 'retroalimentacion--acierto' : 'retroalimentacion--fallo');
        x.retro.appendChild(h('strong', null, (ok ? t.correcto : (marcada ? t.incorrecto : t.sin_responder)) + ' '));
        x.retro.appendChild(document.createTextNode(PE.vistas.reemplazar(t.es, { categoria: nombre }) + ' ' + x.it.explicacion));
      });
      resultado.textContent = PE.vistas.reemplazar(t.aciertos, { n: aciertos, total: items.length });
    });
    return h('div', { class: 'clasificador' },
      h('p', null, PE.etiquetas.crear('SIMULACIÓN'), ' ', PE.contenido.enLinea(e.instrucciones)),
      items.map(function (x) { return x.fs; }),
      h('p', null, boton), resultado);
  }

  function revelar(e) {
    const t = T();
    return h('div', { class: 'revelar' }, e.items.map(function (it) {
      return h('article', { class: 'revelar__caso' },
        h('p', { class: 'revelar__titular' }, PE.etiquetas.crear('SIMULACIÓN'), ' ', h('strong', null, it.titular)),
        h('p', null, PE.contenido.enLinea(it.texto)),
        h('p', null, h('strong', null, t.pregunta + ' '), it.pregunta),
        h('details', null, h('summary', null, t.ver_respuesta), h('p', null, PE.contenido.enLinea(it.respuesta))));
    }));
  }

  function analizador(e) {
    contador += 1;
    const id = 'an' + contador;
    const t = T();
    const progreso = h('p', { class: 'meta-texto', 'aria-live': 'polite' });
    const casillas = [];
    const lista = h('ol', { class: 'analizador__lista' }, e.comprobaciones.map(function (c, i) {
      const casilla = h('input', { type: 'checkbox', id: id + '-' + i });
      casillas.push(casilla);
      const hallazgo = h('div', { class: 'analizador__hallazgo', hidden: true },
        h('p', null, h('strong', null, t.que_encontramos + ' '), PE.contenido.enLinea(c.hallazgo)));
      casilla.addEventListener('change', function () {
        hallazgo.hidden = !casilla.checked;
        pintar();
      });
      return h('li', { class: 'analizador__paso' },
        h('p', null, casilla, ' ', h('label', { for: id + '-' + i }, h('strong', null, c.titulo + '. '), c.pregunta)),
        hallazgo);
    }));
    function pintar() {
      const n = casillas.filter(function (c) { return c.checked; }).length;
      progreso.textContent = PE.vistas.reemplazar(t.progreso, { n: n, total: casillas.length }) + (n === casillas.length ? ' ' + e.conclusion : '');
    }
    pintar();
    return h('div', { class: 'analizador' },
      h('article', { class: 'analizador__noticia' },
        h('p', null, PE.etiquetas.crear('SIMULACIÓN'), ' ', h('span', { class: 'meta-texto' }, e.noticia.medio + ' · ' + e.noticia.fecha)),
        h('p', { class: 'analizador__titular' }, e.noticia.titular),
        h('p', null, e.noticia.texto)),
      h('p', null, t.instrucciones_analizador),
      lista, progreso);
  }

  PE.esquemas.registrar('clasificador', clasificador);
  PE.esquemas.registrar('ejercicio-revelar', revelar);
  PE.esquemas.registrar('analizador-noticia', analizador);
})();
