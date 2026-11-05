/* Simulación de ejes ideológicos con partidos ficticios (sección 8.7).
   Muestra que un partido puede estar en sitios distintos según el eje.
   Las posiciones son inventadas (SIMULACIÓN) y la tabla es la alternativa
   textual del gráfico. Paleta neutra: los partidos se distinguen por forma
   y letra, no por color. */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;
  const NS = 'http://www.w3.org/2000/svg';
  const LADO = 320;
  const MARGEN = 40;

  function s(etiqueta, atributos, texto) {
    const el = document.createElementNS(NS, etiqueta);
    Object.keys(atributos || {}).forEach(function (k) { el.setAttribute(k, atributos[k]); });
    if (texto !== undefined) el.textContent = texto;
    return el;
  }

  function coord(v) {
    return MARGEN + (v + 1) / 2 * (LADO - 2 * MARGEN);
  }

  function marca(forma, x, y) {
    if (forma === 'cuadrado') return s('rect', { x: x - 8, y: y - 8, width: 16, height: 16, class: 'ejes__marca' });
    if (forma === 'triangulo') return s('path', { d: 'M' + x + ' ' + (y - 10) + 'L' + (x + 10) + ' ' + (y + 8) + 'L' + (x - 10) + ' ' + (y + 8) + 'Z', class: 'ejes__marca' });
    return s('circle', { cx: x, cy: y, r: 9, class: 'ejes__marca' });
  }

  function describir(v, eje) {
    if (Math.abs(v) < 0.2) return eje.centro;
    return v < 0 ? eje.menos : eje.mas;
  }

  function simulacion(e) {
    const T = PE.textos('ui').ejes;
    let vertical = e.ejes_verticales[0].id;
    const svg = s('svg', { viewBox: '0 0 ' + LADO + ' ' + LADO, class: 'ejes__svg', role: 'img', 'aria-labelledby': 'ejes-titulo' });
    const tituloSvg = s('title', { id: 'ejes-titulo' });
    svg.appendChild(tituloSvg);
    const tabla = h('tbody');
    const cabeceraVertical = h('th', { scope: 'col' });

    function eje(id) {
      return e.ejes_verticales.find(function (x) { return x.id === id; });
    }

    function pintar() {
      const ev = eje(vertical);
      while (svg.childNodes.length > 1) svg.removeChild(svg.lastChild);
      svg.appendChild(s('line', { x1: MARGEN, y1: LADO / 2, x2: LADO - MARGEN, y2: LADO / 2, class: 'ejes__eje' }));
      svg.appendChild(s('line', { x1: LADO / 2, y1: MARGEN, x2: LADO / 2, y2: LADO - MARGEN, class: 'ejes__eje' }));
      svg.appendChild(s('text', { x: MARGEN, y: LADO / 2 - 8, class: 'ejes__rotulo' }, e.eje_horizontal.menos_corto));
      svg.appendChild(s('text', { x: LADO - MARGEN, y: LADO / 2 - 8, class: 'ejes__rotulo', 'text-anchor': 'end' }, e.eje_horizontal.mas_corto));
      svg.appendChild(s('text', { x: LADO / 2 + 6, y: MARGEN - 10, class: 'ejes__rotulo' }, ev.mas_corto));
      svg.appendChild(s('text', { x: LADO / 2 + 6, y: LADO - MARGEN + 22, class: 'ejes__rotulo' }, ev.menos_corto));
      e.partidos.forEach(function (p) {
        const x = coord(p.posiciones[e.eje_horizontal.id]);
        const y = LADO - coord(p.posiciones[vertical]);
        svg.appendChild(marca(p.forma, x, y));
        svg.appendChild(s('text', { x: x + 13, y: y + 5, class: 'ejes__letra' }, p.nombre));
      });
      tituloSvg.textContent = PE.vistas.reemplazar(T.descripcion_svg, { horizontal: e.eje_horizontal.titulo, vertical: ev.titulo });
      cabeceraVertical.textContent = ev.titulo;
      tabla.textContent = '';
      e.partidos.forEach(function (p) {
        tabla.appendChild(h('tr', null,
          h('th', { scope: 'row' }, p.nombre + ' (' + T.formas[p.forma] + ')'),
          h('td', null, describir(p.posiciones[e.eje_horizontal.id], e.eje_horizontal)),
          h('td', null, describir(p.posiciones[vertical], ev))));
      });
    }

    const opciones = h('fieldset', { class: 'ejes__opciones' },
      h('legend', null, T.elige_eje),
      e.ejes_verticales.map(function (ev, i) {
        const id = 'eje-' + ev.id;
        const radio = h('input', { type: 'radio', name: 'eje-vertical', id: id, value: ev.id });
        radio.checked = i === 0;
        radio.addEventListener('change', function () { vertical = ev.id; pintar(); });
        return h('div', { class: 'opcion' }, radio, h('label', { for: id }, ev.titulo));
      }));

    const reiniciar = h('button', { type: 'button', class: 'boton' }, T.reiniciar);
    reiniciar.addEventListener('click', function () {
      vertical = e.ejes_verticales[0].id;
      opciones.querySelector('input').checked = true;
      pintar();
    });

    pintar();
    return h('div', { class: 'ejes' },
      h('p', null, PE.etiquetas.crear('SIMULACIÓN'), ' ', T.aviso),
      opciones,
      h('div', { class: 'ejes__lienzo' }, svg),
      h('div', { class: 'tabla-contenedor', role: 'region', tabindex: '0', 'aria-label': T.tabla },
        h('table', null,
          h('caption', { class: 'visualmente-oculto' }, T.tabla),
          h('thead', null, h('tr', null, h('th', { scope: 'col' }, T.partido), h('th', { scope: 'col' }, e.eje_horizontal.titulo), cabeceraVertical)),
          tabla)),
      h('p', null, reiniciar));
  }

  PE.esquemas.registrar('ejes', simulacion);
})();
