/* El Senado en las elecciones generales (sección 10.5).
   - suma-senado: los senadores elegidos, sumados desde los datos de la
     convocatoria, con cada línea enlazada a su fuente.
   - papeleta-senado: papeleta de práctica con candidaturas ficticias; aplica
     el máximo de marcas de cada circunscripción (LOREG, arts. 96.3, 96.5 y
     166.1.a) y dice si el voto sería válido, en blanco o nulo. */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;
  let contador = 0;

  function T() {
    return PE.textos('ui').senado;
  }

  function convocatoria(id) {
    return PE.datos('convocatorias').registros.find(function (c) { return c.id === id; });
  }

  function suma(e) {
    const t = T();
    const conv = convocatoria(e.convocatoria);
    const anterior = convocatoria(e.anterior);
    const senado = conv.circunscripciones_senado;
    const lineas = e.lineas.map(function (l) {
      const grupo = senado.filter(function (c) { return c.tipo === l.tipo && c.senadores_elegidos === l.senadores; });
      return { l: l, n: grupo.length, total: grupo.length * l.senadores, nombres: grupo.map(function (c) { return c.nombre; }) };
    });
    const total = lineas.reduce(function (s, x) { return s + x.total; }, 0);
    const totalSenado = senado.reduce(function (s, c) { return s + c.senadores_elegidos; }, 0);
    const totalAnterior = anterior.circunscripciones_senado.reduce(function (s, c) { return s + c.senadores_elegidos; }, 0);
    if (total !== totalSenado) throw new Error('La suma del Senado no cuadra: ' + total + ' frente a ' + totalSenado);
    const v = (conv.verificaciones || []).find(function (x) { return x.ambito === 'senadores_elegidos'; });
    return h('div', { class: 'suma-senado' },
      h('div', { class: 'tabla-contenedor', role: 'region', tabindex: '0', 'aria-label': e.titulo },
        h('table', null,
          h('caption', { class: 'visualmente-oculto' }, e.titulo),
          h('thead', null, h('tr', null, [t.col_donde, t.col_cuantas, t.col_cada, t.col_total, t.col_fuente].map(function (c) {
            return h('th', { scope: 'col' }, c);
          }))),
          h('tbody', null, lineas.map(function (x) {
            return h('tr', null,
              h('th', { scope: 'row' }, x.l.texto, x.n <= 8 ? h('span', { class: 'meta-texto suma-senado__nombres' }, ' (' + x.nombres.join(', ') + ')') : null),
              h('td', { class: 'numero' }, String(x.n)),
              h('td', { class: 'numero' }, String(x.l.senadores)),
              h('td', { class: 'numero' }, String(x.total)),
              h('td', null, x.l.articulo + ' ', PE.fuentes.botonVerFuente(x.l.fuente_id)));
          })),
          h('tfoot', null, h('tr', null,
            h('th', { scope: 'row' }, t.total),
            h('td', null, ''), h('td', null, ''),
            h('td', { class: 'numero' }, h('strong', null, String(total))),
            h('td', null, ''))))),
      h('p', null, PE.etiquetas.crear(v ? v.etiqueta : 'PENDIENTE DE VERIFICAR'), ' ', PE.vistas.reemplazar(t.total_texto, { total: total, anterior: totalAnterior }), ' ', PE.fuentes.botonVerFuente(v ? v.fuente_id : conv.norma_id)));
  }

  function papeleta(e) {
    contador += 1;
    const base = 'pap' + contador;
    const t = T();
    const conv = convocatoria(e.convocatoria);
    const opciones = conv.circunscripciones_senado.slice().sort(function (a, b) { return a.nombre.localeCompare(b.nombre, 'es'); });
    const selector = h('select', { id: base + '-circ', class: 'selector' }, opciones.map(function (c) {
      return h('option', { value: c.id }, c.nombre);
    }));
    selector.value = e.inicial || opciones[0].id;
    const regla = h('p', { 'aria-live': 'polite' });
    const lista = h('fieldset', { class: 'papeleta__candidatos' });
    const veredicto = h('div', { class: 'papeleta__veredicto', 'aria-live': 'polite' });

    function circunscripcion() {
      return opciones.find(function (c) { return c.id === selector.value; });
    }

    function evaluar() {
      const c = circunscripcion();
      const marcadas = lista.querySelectorAll('input:checked').length;
      let clave;
      if (marcadas === 0) clave = 'blanco';
      else if (marcadas <= c.max_marcas) clave = 'valido';
      else clave = 'nulo';
      veredicto.className = 'papeleta__veredicto papeleta__veredicto--' + clave;
      veredicto.textContent = '';
      veredicto.appendChild(h('p', null, PE.icono(clave === 'nulo' ? 'fallo' : 'acierto'), ' ',
        h('strong', null, t['veredicto_' + clave] + ' '),
        PE.vistas.reemplazar(t['explica_' + clave], { n: marcadas, max: c.max_marcas })));
    }

    function pintar() {
      const c = circunscripcion();
      regla.textContent = PE.vistas.reemplazar(c.max_marcas === 1 ? t.regla_uno : t.regla, { nombre: c.nombre, max: c.max_marcas, senadores: c.senadores_elegidos });
      lista.textContent = '';
      lista.appendChild(h('legend', null, t.candidatos));
      e.candidaturas.forEach(function (cand) {
        // Cada formación ficticia presenta tantos candidatos como senadores se eligen, con un máximo de tres.
        const n = Math.min(c.senadores_elegidos, 3);
        lista.appendChild(h('p', { class: 'papeleta__formacion' }, cand.nombre));
        for (let i = 1; i <= n; i++) {
          const id = base + '-' + cand.id + '-' + i;
          const caja = h('input', { type: 'checkbox', id: id });
          caja.addEventListener('change', evaluar);
          lista.appendChild(h('div', { class: 'opcion' }, caja, h('label', { for: id }, PE.vistas.reemplazar(t.candidato, { formacion: cand.id, n: i }))));
        }
      });
      evaluar();
    }

    selector.addEventListener('change', pintar);
    pintar();
    return h('div', { class: 'papeleta' },
      h('p', null, PE.etiquetas.crear('SIMULACIÓN'), ' ', t.aviso_papeleta),
      h('p', null, h('label', { for: base + '-circ' }, t.elige_circunscripcion), ' ', selector),
      regla,
      h('div', { class: 'papeleta__hoja' }, lista),
      veredicto,
      h('p', { class: 'meta-texto' }, PE.etiquetas.crear('NORMA VIGENTE'), ' ', t.base_legal, ' ', PE.fuentes.botonVerFuente('boe-loreg')));
  }

  PE.esquemas.registrar('suma-senado', suma);
  PE.esquemas.registrar('papeleta-senado', papeleta);
})();
