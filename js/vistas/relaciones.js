/* Diagrama interactivo de relaciones entre instituciones (sección 9.7).
   Las relaciones salen de data/relaciones.json y cada una cita su artículo.
   El diagrama es una ayuda visual: la lista de debajo contiene la misma
   información y es la alternativa textual. */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;
  const NS = 'http://www.w3.org/2000/svg';
  const ANCHO = 156;
  const ALTO = 40;

  function s(etiqueta, atributos) {
    const el = document.createElementNS(NS, etiqueta);
    Object.keys(atributos || {}).forEach(function (k) { el.setAttribute(k, atributos[k]); });
    return el;
  }

  /* Punto del borde del rectángulo de un nodo en dirección a otro. */
  function borde(desde, hacia) {
    const dx = hacia.x - desde.x;
    const dy = hacia.y - desde.y;
    const escala = Math.min((ANCHO / 2 + 4) / Math.abs(dx || 1e-9), (ALTO / 2 + 4) / Math.abs(dy || 1e-9));
    return { x: desde.x + dx * escala, y: desde.y + dy * escala };
  }

  function diagrama(e) {
    const T = PE.textos('ui').relaciones;
    const relaciones = PE.datos('relaciones').registros;
    const nodos = {};
    e.nodos.forEach(function (n) { nodos[n.id] = n; });
    let seleccion = null;

    const svg = s('svg', { viewBox: '0 0 680 480', class: 'relaciones__svg', role: 'img', 'aria-labelledby': 'relaciones-titulo' });
    const titulo = s('title', { id: 'relaciones-titulo' });
    titulo.textContent = T.descripcion_svg;
    svg.appendChild(titulo);
    const defs = s('defs');
    const marcador = s('marker', { id: 'flecha-relacion', viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' });
    marcador.appendChild(s('path', { d: 'M0 0L10 5L0 10z', class: 'relaciones__punta' }));
    defs.appendChild(marcador);
    svg.appendChild(defs);

    /* Las relaciones entre el mismo par de nodos (en cualquier sentido) se
       separan en paralelo para que ninguna flecha tape a otra. */
    const pares = {};
    relaciones.forEach(function (r) {
      const clave = [r.origen, r.destino].sort().join('|');
      (pares[clave] = pares[clave] || []).push(r.id);
    });

    const lineas = relaciones.map(function (r) {
      const a = nodos[r.origen];
      const b = nodos[r.destino];
      const clave = [r.origen, r.destino].sort().join('|');
      const grupo = pares[clave];
      const desplazamiento = (grupo.indexOf(r.id) - (grupo.length - 1) / 2) * 10;
      const primero = nodos[clave.split('|')[0]];
      const segundo = nodos[clave.split('|')[1]];
      const largo = Math.hypot(segundo.x - primero.x, segundo.y - primero.y) || 1;
      const nx = -(segundo.y - primero.y) / largo * desplazamiento;
      const ny = (segundo.x - primero.x) / largo * desplazamiento;
      const p1 = borde(a, b);
      const p2 = borde(b, a);
      const linea = s('line', { x1: p1.x + nx, y1: p1.y + ny, x2: p2.x + nx, y2: p2.y + ny, class: 'relaciones__linea', 'marker-end': 'url(#flecha-relacion)' });
      linea.dataset.origen = r.origen;
      linea.dataset.destino = r.destino;
      svg.appendChild(linea);
      return linea;
    });

    const grupos = e.nodos.map(function (n) {
      const g = s('g', { class: 'relaciones__nodo' + (n.institucion ? ' institucion--' + n.institucion : ''), transform: 'translate(' + (n.x - ANCHO / 2) + ' ' + (n.y - ALTO / 2) + ')' });
      g.appendChild(s('rect', { width: ANCHO, height: ALTO, rx: 8 }));
      const texto = s('text', { x: ANCHO / 2, y: ALTO / 2 + 5, 'text-anchor': 'middle' });
      texto.textContent = n.nombre;
      g.appendChild(texto);
      g.dataset.id = n.id;
      g.addEventListener('click', function () { seleccionar(n.id); });
      svg.appendChild(g);
      return g;
    });

    const botones = [{ id: null, nombre: T.todas }].concat(e.nodos).map(function (n) {
      const b = h('button', { type: 'button', class: 'boton boton--filtro', 'aria-pressed': String(n.id === null) }, n.nombre);
      b.addEventListener('click', function () { seleccionar(n.id); });
      b.dataset.id = n.id === null ? '' : n.id;
      return b;
    });
    const filtros = h('div', { class: 'relaciones__filtros', role: 'group', 'aria-label': T.filtro }, botones);
    const recuento = h('p', { class: 'meta-texto', 'aria-live': 'polite' });
    const lista = h('ul', { class: 'relaciones__lista' });

    function nombre(id) {
      return nodos[id].nombre;
    }

    function seleccionar(id) {
      seleccion = id;
      botones.forEach(function (b) { b.setAttribute('aria-pressed', String((b.dataset.id || null) === id)); });
      lineas.forEach(function (l) {
        const activa = !id || l.dataset.origen === id || l.dataset.destino === id;
        l.classList.toggle('relaciones__linea--activa', !!id && activa);
        l.classList.toggle('relaciones__linea--atenuada', !activa);
      });
      grupos.forEach(function (g) { g.classList.toggle('relaciones__nodo--seleccionado', g.dataset.id === id); });
      lista.textContent = '';
      const visibles = relaciones.filter(function (r) { return !id || r.origen === id || r.destino === id; });
      visibles.forEach(function (r) {
        lista.appendChild(h('li', null,
          h('p', null, h('strong', null, nombre(r.origen) + ' → ' + T.tipos[r.tipo] + ' → ' + nombre(r.destino) + '. '), r.descripcion),
          h('p', { class: 'meta-texto' }, PE.etiquetas.crear(r.etiqueta), ' Constitución, ' + r.articulo + '. ', PE.fuentes.botonVerFuente(r.fuente_id))));
      });
      recuento.textContent = PE.vistas.reemplazar(T.recuento, { n: visibles.length, de: id ? nombre(id) : T.todas_minusculas });
    }

    seleccionar(null);
    return h('div', { class: 'relaciones' },
      filtros,
      h('div', { class: 'relaciones__lienzo' }, svg),
      h('h3', null, T.lista_titulo),
      recuento,
      lista);
  }

  PE.esquemas.registrar('relaciones', diagrama);
})();
