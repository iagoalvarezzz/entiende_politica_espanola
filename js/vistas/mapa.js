/* Circunscripciones del Congreso (sección 10.2): cartograma de casillas
   diseñado para esta web (una casilla por circunscripción, no es un mapa a
   escala), vista por escaños y tabla buscable con la comparación con 2023.
   Los escaños salen de data/convocatorias.json; la posición de cada casilla,
   del esquema en content/es/m3.json. */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;
  let contador = 0;

  function T() {
    return PE.textos('ui').mapa;
  }

  function convocatoria(id) {
    const conjunto = PE.datos('convocatorias');
    return conjunto && conjunto.registros.find(function (c) { return c.id === id; });
  }

  function verificacion(conv, ambito) {
    return (conv.verificaciones || []).find(function (v) { return v.ambito === ambito; }) || null;
  }

  function filaFuente(conv, texto) {
    const v = verificacion(conv, 'escanos_congreso');
    const etiqueta = v ? v.etiqueta : 'PENDIENTE DE VERIFICAR';
    return h('p', { class: 'meta-texto' }, PE.etiquetas.crear(etiqueta), ' ', texto, ' ', PE.fuentes.botonVerFuente(v ? v.fuente_id : conv.norma_id));
  }

  function mapa(e) {
    contador += 1;
    const base = 'mapa' + contador;
    const t = T();
    const actual = convocatoria(e.convocatoria);
    const anterior = convocatoria(e.anterior);
    const previos = {};
    anterior.circunscripciones.forEach(function (c) { previos[c.id] = c.escanos_congreso; });
    const circ = actual.circunscripciones.map(function (c) {
      return { id: c.id, nombre: c.nombre, escanos: c.escanos_congreso, antes: previos[c.id], senadores: c.senadores_elegidos };
    });
    const porId = {};
    circ.forEach(function (c) { porId[c.id] = c; });
    const maximo = Math.max.apply(null, circ.map(function (c) { return c.escanos; }));

    const detalle = h('p', { class: 'mapa__detalle', 'aria-live': 'polite' }, t.elige);

    function describir(c) {
      return PE.vistas.reemplazar(c.escanos === 1 ? t.detalle_uno : t.detalle, {
        nombre: c.nombre, escanos: c.escanos, antes: c.antes, senadores: c.senadores
      }) + (c.escanos !== c.antes ? ' ' + PE.vistas.reemplazar(t.cambio, { antes: c.antes }) : '');
    }

    /* ---------- Casillas ---------- */
    const casillas = e.casillas.map(function (pos) {
      const c = porId[pos.id];
      if (!c) throw new Error('Casilla sin circunscripción: ' + pos.id);
      const b = h('button', {
        type: 'button',
        class: 'mapa__casilla' + (c.escanos !== c.antes ? ' mapa__casilla--cambio' : ''),
        style: 'grid-column:' + (pos.x + 1) + ';grid-row:' + (pos.y + 1) + ';--peso:' + Math.round(c.escanos * 100 / maximo),
        'aria-label': describir(c),
        title: c.nombre
      }, h('span', { class: 'mapa__abrev', 'aria-hidden': 'true' }, pos.abrev), h('span', { class: 'mapa__escanos', 'aria-hidden': 'true' }, String(c.escanos)));
      b.addEventListener('click', function () {
        casillasPulsadas.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        detalle.textContent = describir(c);
      });
      b.setAttribute('aria-pressed', 'false');
      return b;
    });
    const casillasPulsadas = casillas;
    const rejilla = h('div', { class: 'mapa__rejilla', role: 'group', 'aria-label': t.rejilla }, casillas,
      e.recuadros.map(function (r) {
        return h('div', { class: 'mapa__recuadro', style: 'grid-column:' + (r.x + 1) + ' / span ' + r.ancho + ';grid-row:' + (r.y + 1) + ' / span ' + r.alto, 'aria-hidden': 'true' },
          h('span', { class: 'mapa__recuadro-texto' }, r.texto));
      }));
    const vistaCasillas = h('div', { class: 'mapa__vista' },
      h('p', { class: 'meta-texto' }, t.aviso_casillas),
      h('div', { class: 'mapa__lienzo', role: 'region', tabindex: '0', 'aria-label': t.rejilla }, rejilla),
      h('p', { class: 'meta-texto' }, t.leyenda_casillas),
      detalle);

    /* ---------- Vista por escaños ---------- */
    const ordenadas = circ.slice().sort(function (a, b) { return b.escanos - a.escanos || a.nombre.localeCompare(b.nombre, 'es'); });
    const vistaEscanos = h('div', { class: 'mapa__vista', hidden: true },
      h('p', { class: 'meta-texto' }, t.aviso_escanos),
      h('ol', { class: 'mapa__barras' }, ordenadas.map(function (c) {
        const cuadros = [];
        for (let i = 0; i < c.escanos; i++) cuadros.push(h('span', { class: 'mapa__cuadro' }));
        return h('li', { class: 'mapa__barra' },
          h('span', { class: 'mapa__barra-nombre' }, c.nombre),
          h('span', { class: 'mapa__barra-cuadros', 'aria-hidden': 'true' }, cuadros),
          h('span', { class: 'mapa__barra-numero' }, String(c.escanos)));
      })));

    const botonCasillas = h('button', { type: 'button', class: 'boton boton--filtro', 'aria-pressed': 'true' }, t.vista_casillas);
    const botonEscanos = h('button', { type: 'button', class: 'boton boton--filtro', 'aria-pressed': 'false' }, t.vista_escanos);
    function mostrar(enCasillas) {
      botonCasillas.setAttribute('aria-pressed', String(enCasillas));
      botonEscanos.setAttribute('aria-pressed', String(!enCasillas));
      vistaCasillas.hidden = !enCasillas;
      vistaEscanos.hidden = enCasillas;
    }
    botonCasillas.addEventListener('click', function () { mostrar(true); });
    botonEscanos.addEventListener('click', function () { mostrar(false); });

    /* ---------- Tabla buscable ---------- */
    const campo = h('input', { type: 'search', id: base + '-buscar', class: 'campo', autocomplete: 'off' });
    const soloCambios = h('input', { type: 'checkbox', id: base + '-cambios' });
    const cuerpo = h('tbody');
    const recuento = h('p', { class: 'meta-texto', 'aria-live': 'polite' });
    const total = function (clave) { return circ.reduce(function (s, c) { return s + c[clave]; }, 0); };
    function pintarTabla() {
      const q = PE.glosario.normalizar(campo.value);
      const visibles = circ.filter(function (c) {
        return (!q || PE.glosario.normalizar(c.nombre).indexOf(q) !== -1) && (!soloCambios.checked || c.escanos !== c.antes);
      });
      cuerpo.textContent = '';
      visibles.forEach(function (c) {
        const dif = c.escanos - c.antes;
        cuerpo.appendChild(h('tr', null,
          h('th', { scope: 'row' }, c.nombre),
          h('td', { class: 'numero' }, String(c.escanos)),
          h('td', { class: 'numero' }, String(c.antes)),
          h('td', { class: 'numero' }, dif ? (dif > 0 ? '+' : '−') + Math.abs(dif) : '='),
          h('td', { class: 'numero' }, String(c.senadores))));
      });
      recuento.textContent = PE.vistas.reemplazar(t.recuento, { n: visibles.length, total: circ.length });
    }
    campo.addEventListener('input', pintarTabla);
    soloCambios.addEventListener('change', pintarTabla);
    pintarTabla();

    const tabla = h('div', { class: 'mapa__tabla' },
      h('h3', null, t.tabla_titulo),
      h('div', { class: 'formulario-filtros' },
        h('p', null, h('label', { for: base + '-buscar' }, t.buscar), campo),
        h('p', { class: 'opcion' }, soloCambios, h('label', { for: base + '-cambios' }, t.solo_cambios))),
      recuento,
      h('div', { class: 'tabla-contenedor', role: 'region', tabindex: '0', 'aria-label': t.tabla_titulo },
        h('table', null,
          h('caption', { class: 'visualmente-oculto' }, t.tabla_titulo),
          h('thead', null, h('tr', null, [t.col_nombre, t.col_2026, t.col_2023, t.col_cambio, t.col_senado].map(function (c) {
            return h('th', { scope: 'col' }, c);
          }))),
          cuerpo,
          h('tfoot', null, h('tr', null,
            h('th', { scope: 'row' }, t.total),
            h('td', { class: 'numero' }, String(total('escanos'))),
            h('td', { class: 'numero' }, String(total('antes'))),
            h('td', null, ''),
            h('td', { class: 'numero' }, String(total('senadores'))))))),
      filaFuente(actual, t.fuente_2026),
      filaFuente(anterior, t.fuente_2023));

    return h('div', { class: 'mapa' },
      h('div', { class: 'mapa__vistas', role: 'group', 'aria-label': t.vistas }, botonCasillas, botonEscanos),
      vistaCasillas,
      vistaEscanos,
      tabla);
  }

  PE.esquemas.registrar('mapa-circunscripciones', mapa);
})();
