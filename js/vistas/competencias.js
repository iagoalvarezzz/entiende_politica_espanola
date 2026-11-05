/* Módulo 4, «Quién decide qué» (secciones 11.3 y 11.7).
   - tabla-competencias: una fila por materia y una columna por nivel de
     gobierno, buscable, con el artículo, la etiqueta y la fuente de cada celda.
   - quien-decide: preguntas cotidianas; para cada una, los niveles que
     intervienen con su papel, el artículo, la etiqueta y la fecha de consulta.
   Los niveles se distinguen por icono y texto, no solo por color. Los datos
   salen de data/competencias.json. */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;
  const u = PE.util;
  const NIVELES = ['estado', 'autonomico', 'local', 'ue'];
  const ICONOS = { estado: 'gobierno', autonomico: 'comunidades', local: 'ayuntamientos', ue: 'ue' };
  const INSTITUCION = { estado: 'gobierno', autonomico: 'comunidades', local: 'ayuntamientos', ue: 'ue' };
  let contador = 0;

  function T() {
    return PE.textos('ui').competencias;
  }

  function competencia(id) {
    const c = PE.datos('competencias').registros.find(function (r) { return r.id === id; });
    if (!c) throw new Error('Competencia desconocida: ' + id);
    return c;
  }

  function nivel(id) {
    return h('span', { class: 'nivel institucion--' + INSTITUCION[id] }, PE.icono(ICONOS[id]), ' ', T().niveles[id]);
  }

  function base(c) {
    return h('p', { class: 'meta-texto competencia__base' },
      PE.etiquetas.crear(c.etiqueta), ' ', c.articulo + '. ',
      c.fecha_consulta ? PE.vistas.reemplazar(T().consulta, { fecha: u.formatoFecha(c.fecha_consulta) }) + ' ' : '',
      PE.fuentes.botonVerFuente(c.fuente_id));
  }

  function tabla(e) {
    contador += 1;
    const id = 'comp' + contador;
    const t = T();
    const campo = h('input', { type: 'search', id: id + '-buscar', class: 'campo', autocomplete: 'off' });
    const cuerpo = h('tbody', { role: 'rowgroup' });
    const recuento = h('p', { class: 'meta-texto', 'aria-live': 'polite' });
    const columnas = [t.materia].concat(NIVELES.map(function (n) { return t.niveles[n]; }));

    function pintar() {
      const q = PE.glosario.normalizar(campo.value);
      const visibles = e.materias.filter(function (m) {
        return !q || PE.glosario.normalizar(m.nombre + ' ' + (m.claves || '')).indexOf(q) !== -1;
      });
      cuerpo.textContent = '';
      visibles.forEach(function (m) {
        cuerpo.appendChild(h('tr', { role: 'row' },
          h('th', { scope: 'row', role: 'rowheader' }, m.nombre),
          NIVELES.map(function (n, i) {
            const c = competencia(m.id + '-' + n);
            return h('td', { role: 'cell', 'data-columna': columnas[i + 1], class: c.estado === 'pendiente' ? 'competencia competencia--pendiente' : 'competencia' },
              h('p', null, c.valor), base(c));
          })));
      });
      recuento.textContent = PE.vistas.reemplazar(t.recuento, { n: visibles.length, total: e.materias.length });
    }
    campo.addEventListener('input', pintar);
    pintar();

    return h('div', { class: 'competencias' },
      h('p', { class: 'competencias__leyenda' }, NIVELES.map(function (n) { return [nivel(n), ' ']; })),
      h('div', { class: 'formulario-filtros' }, h('p', null, h('label', { for: id + '-buscar' }, t.buscar), campo)),
      recuento,
      h('div', { class: 'tabla-contenedor', role: 'region', tabindex: '0', 'aria-label': e.titulo },
        h('table', { class: 'tabla-apilable tabla-competencias', role: 'table' },
          h('caption', { class: 'visualmente-oculto' }, e.titulo),
          h('thead', { role: 'rowgroup' }, h('tr', { role: 'row' }, columnas.map(function (c) { return h('th', { scope: 'col', role: 'columnheader' }, c); }))),
          cuerpo)));
  }

  /* Preguntas definidas en el módulo 4; un tema puede reutilizar algunas con
     { desde: 'm4', ids: [...] } en lugar de copiarlas. */
  function preguntasDe(e) {
    if (e.preguntas) return e.preguntas;
    let todas = [];
    PE.textos(e.desde).bloques.forEach(function (b) {
      (b.explicacion || []).forEach(function (x) {
        if (x.tipo === 'esquema' && x.esquema.tipo === 'quien-decide' && x.esquema.preguntas) todas = todas.concat(x.esquema.preguntas);
      });
    });
    return e.ids.map(function (idP) {
      const p = todas.find(function (x) { return x.id === idP; });
      if (!p) throw new Error('Pregunta «¿Quién decide?» desconocida: ' + idP);
      return p;
    });
  }

  function quienDecide(e) {
    contador += 1;
    const id = 'qd' + contador;
    const t = T();
    e = Object.assign({}, e, { preguntas: preguntasDe(e) });
    const selector = h('select', { id: id + '-pregunta', class: 'selector' },
      h('option', { value: '' }, t.elige),
      e.preguntas.map(function (p) { return h('option', { value: p.id }, p.pregunta); }));
    const respuesta = h('div', { class: 'quien-decide__respuesta', 'aria-live': 'polite' });

    function pintar() {
      respuesta.textContent = '';
      const p = e.preguntas.find(function (x) { return x.id === selector.value; });
      if (!p) return;
      respuesta.appendChild(h('h3', null, p.pregunta));
      respuesta.appendChild(h('ul', { class: 'quien-decide__niveles' }, p.niveles.map(function (x) {
        const c = competencia(x.competencia);
        return h('li', { class: 'quien-decide__nivel institucion--' + INSTITUCION[c.nivel] },
          h('p', { class: 'quien-decide__titulo' }, nivel(c.nivel)),
          h('p', null, x.papel),
          base(c));
      })));
      if (p.nota) respuesta.appendChild(h('p', { class: 'meta-texto' }, PE.contenido.enLinea(p.nota)));
    }
    selector.addEventListener('change', pintar);

    return h('div', { class: 'quien-decide' },
      h('p', null, h('label', { for: id + '-pregunta' }, t.pregunta), ' ', selector),
      respuesta);
  }

  PE.esquemas.registrar('tabla-competencias', tabla);
  PE.esquemas.registrar('quien-decide', quienDecide);
})();
