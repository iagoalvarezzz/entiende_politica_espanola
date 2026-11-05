/* Módulo 5, «Economía y hacienda» (secciones 12.1, 12.6 y 12.8).
   - tablero-indicadores: últimos datos oficiales precargados desde
     data/indicadores.json, con periodo, fechas, etiqueta y fuente. No hace
     llamadas en tiempo de ejecución.
   - fichas-indicadores: las seis partes de cada ficha (qué mide, cómo se
     calcula, quién lo publica, qué no dice, error frecuente y último dato).
   - grafico-serie: barras con el eje desde cero y una tabla con los mismos
     datos como alternativa textual.
   - calculadoras-economia: reproducen los vectores T6 a T9 (SIMULACIÓN). */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;
  const u = PE.util;
  const NS = 'http://www.w3.org/2000/svg';
  let contador = 0;

  function T() {
    return PE.textos('ui').economia;
  }

  function dato(id) {
    const d = PE.datos('indicadores').registros.find(function (r) { return r.id === id; });
    if (!d) throw new Error('Indicador desconocido: ' + id);
    return d;
  }

  function numero(v, decimales) {
    return new Intl.NumberFormat('es-ES', { minimumFractionDigits: decimales || 0, maximumFractionDigits: decimales === undefined ? 3 : decimales }).format(v);
  }

  function fechas(d) {
    const t = T();
    return [d.fecha_publicacion ? PE.vistas.reemplazar(t.publicado, { fecha: u.formatoFecha(d.fecha_publicacion) }) : null,
      d.fecha_consulta ? PE.vistas.reemplazar(t.consultado, { fecha: u.formatoFecha(d.fecha_consulta) }) : null].filter(Boolean).join(' ');
  }

  function ultimoDato(d) {
    const t = T();
    if (d.estado === 'pendiente') {
      return h('div', { class: 'indicador__dato' }, PE.etiquetas.crear(d.etiqueta), ' ', t.sin_dato, ' ', PE.fuentes.botonVerFuente(d.fuente_id),
        d.nota ? h('p', { class: 'meta-texto' }, d.nota) : null);
    }
    return h('div', { class: 'indicador__dato' },
      h('p', { class: 'indicador__valor' }, h('strong', null, typeof d.valor === 'number' ? numero(d.valor) : d.valor), ' ', h('span', { class: 'indicador__unidad' }, d.unidad)),
      h('p', { class: 'meta-texto' }, d.periodo + '. ' + fechas(d)),
      d.nota ? h('p', { class: 'meta-texto' }, d.nota) : null,
      h('p', null, PE.etiquetas.crear(d.etiqueta), ' ', PE.fuentes.botonVerFuente(d.fuente_id)));
  }

  /* ---------- Tablero ---------- */
  function tablero(e) {
    return h('ul', { class: 'tablero' }, e.indicadores.map(function (x) {
      return h('li', { class: 'tablero__tarjeta' }, h('h3', { class: 'tablero__nombre' }, x.nombre), ultimoDato(dato(x.id)));
    }));
  }

  /* ---------- Fichas ---------- */
  function fichas(e) {
    const t = T();
    return h('div', { class: 'fichas' }, e.fichas.map(function (f) {
      const filas = [[t.mide, f.mide], [t.calculo, f.calculo], [t.publica, f.publica], [t.no_dice, f.no_dice], [t.error, f.error]];
      return h('details', { class: 'ficha' },
        h('summary', null, h('span', { class: 'ficha__nombre' }, f.nombre)),
        h('dl', { class: 'ficha__partes' }, filas.map(function (p) {
          return [h('dt', null, p[0]), h('dd', null, PE.contenido.enLinea(p[1]))];
        }), h('dt', null, t.ultimo), h('dd', null, f.dato ? ultimoDato(dato(f.dato)) : t.sin_dato)));
    }));
  }

  /* ---------- Gráfico de barras ---------- */
  function s(etiqueta, atributos, texto) {
    const el = document.createElementNS(NS, etiqueta);
    Object.keys(atributos || {}).forEach(function (k) { el.setAttribute(k, atributos[k]); });
    if (texto !== undefined) el.textContent = texto;
    return el;
  }

  function grafico(e) {
    contador += 1;
    const id = 'graf' + contador;
    const t = T();
    const datos = PE.datos('indicadores').registros.filter(function (r) { return r.grupo === e.grupo && (e.excluir || []).indexOf(r.id) === -1; });
    if (e.ordenar) datos.sort(function (a, b) { return b.valor - a.valor; });
    const etiquetaDe = function (d) { return e.etiquetas && e.etiquetas[d.periodo] ? e.etiquetas[d.periodo] : (d.nota || d.periodo); };
    const maximo = Math.ceil(Math.max.apply(null, datos.map(function (d) { return d.valor; })) / e.paso) * e.paso;
    const ANCHO = 640;
    const horizontal = e.orientacion === 'horizontal';
    const ALTO = horizontal ? datos.length * 30 + 50 : 300;
    const M = horizontal ? { izq: 210, der: 50, arr: 10, aba: 40 } : { izq: 50, der: 10, arr: 20, aba: 60 };
    const svg = s('svg', { viewBox: '0 0 ' + ANCHO + ' ' + ALTO, class: 'grafico__svg', role: 'img', 'aria-labelledby': id + '-t' });
    svg.appendChild(s('title', { id: id + '-t' }, e.titulo + '. ' + t.grafico_alternativa));
    const escala = function (v) { return v / maximo; };
    const marcas = [];
    for (let v = 0; v <= maximo + 1e-9; v += e.paso) marcas.push(Math.round(v * 1000) / 1000);
    if (horizontal) {
      const largo = ANCHO - M.izq - M.der;
      marcas.forEach(function (v) {
        const x = M.izq + escala(v) * largo;
        svg.appendChild(s('line', { x1: x, x2: x, y1: M.arr, y2: ALTO - M.aba, class: 'grafico__rejilla' }));
        svg.appendChild(s('text', { x: x, y: ALTO - M.aba + 16, 'text-anchor': 'middle', class: 'grafico__eje-texto' }, numero(v)));
      });
      datos.forEach(function (d, i) {
        const y = M.arr + i * 30 + 4;
        svg.appendChild(s('text', { x: M.izq - 8, y: y + 15, 'text-anchor': 'end', class: 'grafico__etiqueta' }, etiquetaDe(d)));
        svg.appendChild(s('rect', { x: M.izq, y: y, width: Math.max(1, escala(d.valor) * largo), height: 20, class: 'grafico__barra' }));
        svg.appendChild(s('text', { x: M.izq + escala(d.valor) * largo + 6, y: y + 15, class: 'grafico__valor' }, numero(d.valor)));
      });
      svg.appendChild(s('line', { x1: M.izq, x2: M.izq, y1: M.arr, y2: ALTO - M.aba, class: 'grafico__eje' }));
      svg.appendChild(s('text', { x: M.izq + largo / 2, y: ALTO - 6, 'text-anchor': 'middle', class: 'grafico__eje-texto' }, e.unidad));
    } else {
      const alto = ALTO - M.arr - M.aba;
      const ancho = (ANCHO - M.izq - M.der) / datos.length;
      marcas.forEach(function (v) {
        const y = ALTO - M.aba - escala(v) * alto;
        svg.appendChild(s('line', { x1: M.izq, x2: ANCHO - M.der, y1: y, y2: y, class: 'grafico__rejilla' }));
        svg.appendChild(s('text', { x: M.izq - 6, y: y + 4, 'text-anchor': 'end', class: 'grafico__eje-texto' }, numero(v)));
      });
      datos.forEach(function (d, i) {
        const x = M.izq + i * ancho + ancho * 0.15;
        const altura = escala(d.valor) * alto;
        svg.appendChild(s('rect', { x: x, y: ALTO - M.aba - altura, width: ancho * 0.7, height: altura, class: 'grafico__barra' }));
        svg.appendChild(s('text', { x: x + ancho * 0.35, y: ALTO - M.aba + 16, 'text-anchor': 'middle', class: 'grafico__eje-texto' }, etiquetaDe(d)));
      });
      svg.appendChild(s('line', { x1: M.izq, x2: ANCHO - M.der, y1: ALTO - M.aba, y2: ALTO - M.aba, class: 'grafico__eje' }));
      svg.appendChild(s('text', { x: 12, y: M.arr + alto / 2, transform: 'rotate(-90 12 ' + (M.arr + alto / 2) + ')', 'text-anchor': 'middle', class: 'grafico__eje-texto' }, e.unidad));
    }
    // La fecha que se muestra es la de la publicación más reciente de la serie.
    const reciente = datos.slice().sort(function (a, b) { return (b.fecha_publicacion || '').localeCompare(a.fecha_publicacion || ''); })[0];
    return h('div', { class: 'grafico' },
      h('div', { class: 'grafico__lienzo' }, svg),
      h('p', { class: 'meta-texto' }, PE.etiquetas.crear(reciente.etiqueta), ' ', e.nota_fuente + ' ' + fechas(reciente) + ' ', PE.fuentes.botonVerFuente(reciente.fuente_id)),
      h('details', { class: 'grafico__tabla' },
        h('summary', null, t.ver_tabla),
        h('div', { class: 'tabla-contenedor', role: 'region', tabindex: '0', 'aria-label': e.titulo },
          h('table', null,
            h('caption', { class: 'visualmente-oculto' }, e.titulo),
            h('thead', null, h('tr', null, h('th', { scope: 'col' }, e.columna), h('th', { scope: 'col' }, e.unidad))),
            h('tbody', null, datos.map(function (d) {
              return h('tr', null, h('th', { scope: 'row' }, etiquetaDe(d)), h('td', { class: 'numero' }, numero(d.valor)));
            }))))));
  }

  /* ---------- Calculadoras ---------- */
  function leer(campo) {
    const n = Number(String(campo.value).replace(/\./g, '').replace(',', '.'));
    return campo.value.trim() === '' ? NaN : n;
  }

  function campoNumero(id, etiqueta, valor) {
    const c = h('input', { type: 'text', inputmode: 'decimal', id: id, class: 'campo campo--numero', value: numero(valor, 2).replace(/,00$/, '') });
    return { campo: c, nodo: h('p', null, h('label', { for: id }, etiqueta), ' ', c) };
  }

  function calculadora(titulo, explicacion, campos, calcular) {
    const salida = h('p', { class: 'calc__resultado', 'aria-live': 'polite' });
    function actualizar() {
      const valores = campos.map(function (c) { return leer(c.campo); });
      if (valores.some(function (v) { return !Number.isFinite(v); })) { salida.textContent = T().error_numero; return; }
      try { salida.textContent = calcular(valores); } catch (err) { salida.textContent = err.message; }
    }
    campos.forEach(function (c) { c.campo.addEventListener('input', actualizar); });
    actualizar();
    return h('section', { class: 'calc' }, h('h4', null, titulo), h('p', { class: 'meta-texto' }, explicacion),
      h('div', { class: 'calc__campos' }, campos.map(function (c) { return c.nodo; })), salida);
  }

  function calculadoras() {
    contador += 1;
    const b = 'ce' + contador;
    const t = T().calc;
    const E = PE.calc.economia;
    const d2 = function (v) { return numero(v, 2); };

    const v1 = campoNumero(b + '-vi', t.inicial, 100);
    const v2 = campoNumero(b + '-vf', t.final, 103);
    const variacion = calculadora(t.variacion, t.variacion_ayuda, [v1, v2], function (v) {
      return PE.vistas.reemplazar(t.variacion_res, { pct: d2(E.variacionPorcentual(v[0], v[1])) });
    });

    const n1 = campoNumero(b + '-nom', t.nominal, 5);
    const n2 = campoNumero(b + '-pre', t.precios, 3);
    const real = calculadora(t.real, t.real_ayuda, [n1, n2], function (v) {
      return PE.vistas.reemplazar(t.real_res, { pct: d2(E.crecimientoReal(v[0], v[1])) });
    });

    const p1 = campoNumero(b + '-pi', t.tasa_inicial, 12);
    const p2 = campoNumero(b + '-pf', t.tasa_final, 10);
    const puntos = calculadora(t.puntos, t.puntos_ayuda, [p1, p2], function (v) {
      const r = E.puntosYRelativo(v[0], v[1]);
      return PE.vistas.reemplazar(t.puntos_res, { puntos: d2(r.puntos), relativo: d2(r.relativo) });
    });

    const lista = h('input', { type: 'text', id: b + '-lista', class: 'campo campo--lista', value: '1000; 1200; 1300; 1500; 8000' });
    const salidaMedia = h('p', { class: 'calc__resultado', 'aria-live': 'polite' });
    function actualizarMedia() {
      const valores = lista.value.split(';').map(function (x) { return x.trim(); }).filter(Boolean)
        .map(function (x) { return Number(x.replace(/\./g, '').replace(',', '.')); });
      if (!valores.length || valores.some(function (x) { return !Number.isFinite(x); })) { salidaMedia.textContent = T().error_numero; return; }
      salidaMedia.textContent = PE.vistas.reemplazar(t.media_res, { media: d2(E.media(valores)), mediana: d2(E.mediana(valores)) });
    }
    lista.addEventListener('input', actualizarMedia);
    actualizarMedia();
    const media = h('section', { class: 'calc' }, h('h4', null, t.media), h('p', { class: 'meta-texto' }, t.media_ayuda),
      h('p', null, h('label', { for: b + '-lista' }, t.valores), ' ', lista), salidaMedia);

    const base = campoNumero(b + '-base', t.base, 35000);
    const filasTramos = [[12000, 10], [30000, 20], [null, 30]].map(function (x, i) {
      const hasta = h('input', { type: 'text', inputmode: 'decimal', id: b + '-h' + i, class: 'campo campo--numero', value: x[0] === null ? '' : String(x[0]) });
      const tipo = h('input', { type: 'text', inputmode: 'decimal', id: b + '-t' + i, class: 'campo campo--numero', value: String(x[1]) });
      return { hasta: hasta, tipo: tipo };
    });
    const salidaTramos = h('div', { class: 'calc__resultado', 'aria-live': 'polite' });
    function actualizarTramos() {
      const b0 = leer(base.campo);
      const tramos = filasTramos.map(function (f, i) {
        return { hasta: i === filasTramos.length - 1 || f.hasta.value.trim() === '' ? null : leer(f.hasta), tipo: leer(f.tipo) };
      });
      if (!Number.isFinite(b0) || tramos.some(function (x) { return !Number.isFinite(x.tipo) || (x.hasta !== null && !Number.isFinite(x.hasta)); })) {
        salidaTramos.textContent = T().error_numero;
        return;
      }
      const r = E.cuotaPorTramos(b0, tramos);
      const mas = E.cuotaPorTramos(b0 + 1000, tramos);
      salidaTramos.textContent = '';
      salidaTramos.appendChild(h('p', null, PE.vistas.reemplazar(t.tramos_res, { cuota: d2(r.cuota), medio: d2(r.tipoMedio), marginal: d2(r.tipoMarginal) })));
      salidaTramos.appendChild(h('p', null, PE.vistas.reemplazar(t.tramos_mas, { impuesto: d2(mas.cuota - r.cuota), neto: d2(1000 - (mas.cuota - r.cuota)) })));
    }
    [base.campo].concat(filasTramos.reduce(function (a, f) { return a.concat([f.hasta, f.tipo]); }, [])).forEach(function (c) { c.addEventListener('input', actualizarTramos); });
    actualizarTramos();
    const tramos = h('section', { class: 'calc' }, h('h4', null, t.tramos), h('p', { class: 'meta-texto' }, t.tramos_ayuda),
      base.nodo,
      h('div', { class: 'tabla-contenedor' }, h('table', { class: 'calc__tramos' },
        h('caption', null, t.tramos_tabla),
        h('thead', null, h('tr', null, h('th', { scope: 'col' }, t.tramo), h('th', { scope: 'col' }, t.hasta), h('th', { scope: 'col' }, t.tipo))),
        h('tbody', null, filasTramos.map(function (f, i) {
          const ultimo = i === filasTramos.length - 1;
          return h('tr', null, h('th', { scope: 'row' }, String(i + 1)),
            h('td', null, ultimo ? t.sin_limite : [h('label', { for: f.hasta.id, class: 'visualmente-oculto' }, PE.vistas.reemplazar(t.hasta_n, { n: i + 1 })), f.hasta]),
            h('td', null, h('label', { for: f.tipo.id, class: 'visualmente-oculto' }, PE.vistas.reemplazar(t.tipo_n, { n: i + 1 })), f.tipo));
        })))),
      salidaTramos);

    const dd = campoNumero(b + '-deuda', t.deuda, 1000);
    const dp = campoNumero(b + '-pib', t.pib, 1000);
    const df = campoNumero(b + '-def', t.deficit, 3);
    const dc = campoNumero(b + '-crec', t.crecimiento, 4);
    const deuda = calculadora(t.deuda_titulo, t.deuda_ayuda, [dd, dp, df, dc], function (v) {
      const r = E.deudaTrasUnAno({ deuda: v[0], pib: v[1], deficitPctPib: v[2], crecimientoNominalPct: v[3] });
      return PE.vistas.reemplazar(t.deuda_res, { deuda: d2(r.deuda), pib: d2(r.pib), ratio: d2(r.ratio) });
    });

    return h('div', { class: 'calculadoras' },
      h('p', null, PE.etiquetas.crear('SIMULACIÓN'), ' ', t.aviso),
      variacion, real, puntos, media, tramos, deuda);
  }

  PE.esquemas.registrar('tablero-indicadores', tablero);
  PE.esquemas.registrar('fichas-indicadores', fichas);
  PE.esquemas.registrar('grafico-serie', grafico);
  PE.esquemas.registrar('calculadoras-economia', calculadoras);
})();
