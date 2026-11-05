/* Calculadora D'Hondt con partidos ficticios (sección 10.4). Usa
   PE.calc.dhondt, que aplica la LOREG (art. 163.1): barrera del 3 % con los
   votos en blanco dentro de la base, cocientes y regla de empate. La lectura
   aplicada se muestra siempre en pantalla. Los ejercicios guiados pueden
   añadir una comparación (otra lectura, sin barrera u otro número de
   escaños), etiquetada como simulación. */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;
  const MAX_CANDIDATURAS = 10;
  const MAX_ESCANOS = 60;
  const MATRIZ_HASTA = 10;
  let contador = 0;

  function T() {
    return PE.textos('ui').calculadora;
  }

  function entero(n) {
    return new Intl.NumberFormat('es-ES').format(n);
  }

  function decimal(n, digitos) {
    return new Intl.NumberFormat('es-ES', { minimumFractionDigits: digitos, maximumFractionDigits: digitos }).format(n);
  }

  function porcentaje(parte, total) {
    return total > 0 ? decimal(parte * 100 / total, 2) + ' %' : '—';
  }

  /* Cifra de votos: sin decimales si es entera (la barrera puede no serlo). */
  function votos(n) {
    return Number.isInteger(n) ? entero(n) : decimal(n, 2);
  }

  function letra(i) {
    return String.fromCharCode(65 + i);
  }

  function copiar(estado) {
    return {
      escanos: estado.escanos,
      blancos: estado.blancos,
      candidaturas: estado.candidaturas.map(function (c) { return { id: c.id, votos: c.votos }; })
    };
  }

  function calculadora(e) {
    contador += 1;
    const base = 'calc' + contador;
    const t = T();
    let estado = copiar(e.inicial);
    let ejercicio = null;

    const campoEscanos = h('input', { type: 'number', id: base + '-escanos', class: 'campo campo--numero', min: '1', max: String(MAX_ESCANOS), step: '1', inputmode: 'numeric' });
    const campoBlancos = h('input', { type: 'number', id: base + '-blancos', class: 'campo campo--numero', min: '0', step: '1', inputmode: 'numeric' });
    const filas = h('tbody');
    const anadir = h('button', { type: 'button', class: 'boton' }, PE.icono('mas'), ' ', t.anadir);
    const aviso = h('p', { class: 'calculadora__aviso', role: 'alert' });
    const resultado = h('div', { class: 'calculadora__resultado', 'aria-live': 'polite' });
    const textoEjercicio = h('div', { class: 'calculadora__ejercicio' });

    const botonesEjercicio = (e.ejercicios || []).map(function (ej) {
      const b = h('button', { type: 'button', class: 'boton boton--filtro', 'aria-pressed': 'false' }, ej.titulo);
      b.dataset.id = ej.id;
      b.addEventListener('click', function () { cargarEjercicio(ej); });
      return b;
    });
    const libre = h('button', { type: 'button', class: 'boton boton--filtro', 'aria-pressed': 'true' }, t.libre);
    libre.dataset.id = '';
    libre.addEventListener('click', function () { cargarEjercicio(null); });

    function cargarEjercicio(ej) {
      ejercicio = ej;
      estado = copiar(ej || e.inicial);
      [libre].concat(botonesEjercicio).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.id === (ej ? ej.id : ''))); });
      textoEjercicio.textContent = '';
      if (ej) {
        textoEjercicio.appendChild(h('p', null, h('strong', null, ej.titulo + '. '), PE.contenido.enLinea(ej.texto)));
      }
      pintarFormulario();
      calcular();
    }

    function pintarFormulario() {
      campoEscanos.value = String(estado.escanos);
      campoBlancos.value = String(estado.blancos);
      filas.textContent = '';
      estado.candidaturas.forEach(function (c, i) {
        const id = base + '-votos-' + i;
        const votos = h('input', { type: 'number', id: id, class: 'campo campo--numero', min: '0', step: '1', inputmode: 'numeric', value: String(c.votos) });
        votos.addEventListener('input', function () { c.votos = leerEntero(votos.value); calcular(); });
        const quitar = h('button', { type: 'button', class: 'boton boton--icono', 'aria-label': PE.vistas.reemplazar(t.quitar, { id: c.id }) }, PE.icono('cerrar'));
        quitar.disabled = estado.candidaturas.length <= 2;
        quitar.addEventListener('click', function () {
          estado.candidaturas.splice(i, 1);
          pintarFormulario();
          calcular();
        });
        filas.appendChild(h('tr', null,
          h('th', { scope: 'row' }, h('label', { for: id }, PE.vistas.reemplazar(t.candidatura, { id: c.id }))),
          h('td', null, votos),
          h('td', null, quitar)));
      });
      anadir.disabled = estado.candidaturas.length >= MAX_CANDIDATURAS;
    }

    function leerEntero(texto) {
      const n = Number(String(texto).replace(/\./g, '').replace(',', '.'));
      return Number.isFinite(n) ? n : NaN;
    }

    campoEscanos.addEventListener('input', function () { estado.escanos = leerEntero(campoEscanos.value); calcular(); });
    campoBlancos.addEventListener('input', function () { estado.blancos = leerEntero(campoBlancos.value); calcular(); });
    anadir.addEventListener('click', function () {
      const usadas = estado.candidaturas.map(function (c) { return c.id; });
      let i = 0;
      while (usadas.indexOf(letra(i)) !== -1) i += 1;
      estado.candidaturas.push({ id: letra(i), votos: 0 });
      pintarFormulario();
      calcular();
      const ultimo = filas.querySelector('tr:last-child input');
      if (ultimo) ultimo.focus();
    });

    function validar() {
      if (!Number.isInteger(estado.escanos) || estado.escanos < 1 || estado.escanos > MAX_ESCANOS) {
        return PE.vistas.reemplazar(t.error_escanos, { max: MAX_ESCANOS });
      }
      if (!Number.isInteger(estado.blancos) || estado.blancos < 0) return t.error_blancos;
      const mal = estado.candidaturas.find(function (c) { return !Number.isInteger(c.votos) || c.votos < 0; });
      if (mal) return PE.vistas.reemplazar(t.error_votos, { id: mal.id });
      if (!estado.candidaturas.some(function (c) { return c.votos > 0; })) return t.error_sin_votos;
      return null;
    }

    function repartir(extra) {
      return PE.calc.dhondt.repartir(Object.assign({
        escanos: estado.escanos,
        blancos: estado.blancos,
        candidaturas: estado.candidaturas
      }, extra || {}));
    }

    /* En pantallas estrechas se apila en fichas (modulos.css); los roles
       explícitos conservan la semántica de tabla al cambiar el display. */
    function tablaResultado(r) {
      const excluidas = {};
      r.excluidas.forEach(function (x) { excluidas[x.id] = x; });
      const columnas = [t.col_candidatura, t.col_votos, t.col_pct_votos, t.col_barrera, t.col_escanos, t.col_pct_escanos];
      const fila = function (clase, celdas) {
        return h('tr', { class: clase, role: 'row' }, celdas.map(function (c, i) {
          return i === 0
            ? h('th', { scope: 'row', role: 'rowheader' }, c)
            : h('td', { role: 'cell', 'data-columna': columnas[i], class: i === 3 ? null : 'numero' }, c);
        }));
      };
      return h('div', { class: 'tabla-contenedor', role: 'region', tabindex: '0', 'aria-label': t.tabla_resultado },
        h('table', { class: 'tabla-apilable', role: 'table' },
          h('caption', null, t.tabla_resultado),
          h('thead', { role: 'rowgroup' }, h('tr', { role: 'row' }, columnas.map(function (c) {
            return h('th', { scope: 'col', role: 'columnheader' }, c);
          }))),
          h('tbody', { role: 'rowgroup' }, estado.candidaturas.map(function (c) {
            return fila(r.reparto[c.id] ? 'fila--con-escano' : null, [c.id, entero(c.votos), porcentaje(c.votos, r.validos),
              excluidas[c.id] ? t.no_supera : t.supera, String(r.reparto[c.id]), porcentaje(r.reparto[c.id], r.escanos)]);
          }).concat([fila(null, [t.blancos, entero(r.blancos), porcentaje(r.blancos, r.validos), t.blancos_no_compiten, '—', '—'])]))));
    }

    function matriz(r) {
      const admitidas = r.admitidas.filter(function (id) { return estado.candidaturas.find(function (c) { return c.id === id; }).votos > 0; });
      const porClave = {};
      r.cocientes.forEach(function (q) { porClave[q.id + '/' + q.divisor] = q; });
      const divisores = [];
      for (let d = 1; d <= r.escanos; d++) divisores.push(d);
      return h('div', { class: 'tabla-contenedor', role: 'region', tabindex: '0', 'aria-label': t.tabla_matriz },
        h('table', { class: 'tabla-cocientes' },
          h('caption', null, t.tabla_matriz),
          h('thead', null, h('tr', null, h('th', { scope: 'col' }, t.col_candidatura), divisores.map(function (d) {
            return h('th', { scope: 'col' }, PE.vistas.reemplazar(t.entre, { d: d }));
          }))),
          h('tbody', null, admitidas.map(function (id) {
            return h('tr', null, h('th', { scope: 'row' }, id), divisores.map(function (d) {
              const q = porClave[id + '/' + d];
              return h('td', { class: 'numero' + (q && q.asignado ? ' cociente--escano' : '') },
                q ? decimal(q.votos / q.divisor, 0) : '—',
                q && q.asignado ? h('span', { class: 'cociente__marca' }, ' ', PE.icono('acierto'), h('span', { class: 'visualmente-oculto' }, ' ' + t.escano)) : null);
            }));
          }))));
    }

    function ranking(r) {
      const filasMostradas = r.cocientes.slice(0, r.escanos + 3);
      return h('div', { class: 'tabla-contenedor', role: 'region', tabindex: '0', 'aria-label': t.tabla_ranking },
        h('table', null,
          h('caption', null, PE.vistas.reemplazar(t.tabla_ranking_caption, { n: filasMostradas.length })),
          h('thead', null, h('tr', null, [t.col_orden, t.col_candidatura, t.col_division, t.col_cociente, t.col_resultado].map(function (c) {
            return h('th', { scope: 'col' }, c);
          }))),
          h('tbody', null, filasMostradas.map(function (q, i) {
            return h('tr', { class: q.asignado ? 'fila--con-escano' : null },
              h('td', { class: 'numero' }, String(i + 1)),
              h('th', { scope: 'row' }, q.id),
              h('td', { class: 'numero' }, entero(q.votos) + ' ÷ ' + q.divisor),
              h('td', { class: 'numero' }, decimal(q.votos / q.divisor, 2)),
              h('td', null, q.asignado ? h('strong', null, t.escano) : t.sin_escano));
          }))));
    }

    function frases(r) {
      const lista = [];
      lista.push(PE.vistas.reemplazar(t.resumen, {
        validos: entero(r.validos), blancos: entero(r.blancos),
        barrera: votos(r.barreraVotos), escanos: r.escanos
      }));
      r.excluidas.forEach(function (x) {
        lista.push(PE.vistas.reemplazar(t.excluida, { id: x.id, votos: entero(x.votos), pct: porcentaje(x.votos, r.validos), necesarios: votos(r.barreraVotos) }));
      });
      if (r.ultimoAsignado) {
        lista.push(PE.vistas.reemplazar(t.ultimo, { id: r.ultimoAsignado.id, d: r.ultimoAsignado.divisor, c: decimal(r.ultimoAsignado.votos / r.ultimoAsignado.divisor, 2) }));
      }
      if (r.primeroSinEscano) {
        lista.push(PE.vistas.reemplazar(t.primero_fuera, { id: r.primeroSinEscano.id, d: r.primeroSinEscano.divisor, c: decimal(r.primeroSinEscano.votos / r.primeroSinEscano.divisor, 2) }));
      }
      if (r.empateResuelto) lista.push(PE.vistas.reemplazar(t.empate_resuelto, r.empateResuelto));
      const admitidos = r.admitidas.reduce(function (s, id) { return s + estado.candidaturas.find(function (c) { return c.id === id; }).votos; }, 0);
      lista.push(PE.vistas.reemplazar(t.garantia, { m: r.escanos, pct: decimal(100 / (r.escanos + 1), 2), votos: entero(Math.floor(admitidos / (r.escanos + 1)) + 1) }));
      return h('ul', { class: 'lista' }, lista.map(function (f) { return h('li', null, f); }));
    }

    function comparacion(r) {
      const c = ejercicio && ejercicio.comparar;
      if (!c) return null;
      const otra = repartir(c.opciones);
      const reparto = estado.candidaturas.map(function (x) {
        const cambio = otra.reparto[x.id] - r.reparto[x.id];
        return x.id + ': ' + otra.reparto[x.id] + (cambio ? ' (' + (cambio > 0 ? '+' : '') + cambio + ')' : '');
      }).join('; ');
      return h('div', { class: 'aviso calculadora__comparacion' },
        h('p', null, PE.etiquetas.crear('SIMULACIÓN'), ' ', h('strong', null, c.titulo + '. '), reparto + '.'),
        c.texto ? h('p', null, PE.contenido.enLinea(c.texto)) : null);
    }

    function calcular() {
      resultado.textContent = '';
      const error = validar();
      aviso.textContent = error || '';
      if (error) return;
      let r;
      try {
        r = repartir();
      } catch (err) {
        aviso.textContent = err.message;
        return;
      }
      if (r.sorteo) {
        resultado.appendChild(h('div', { class: 'aviso aviso--empate', role: 'status' },
          h('p', null, h('strong', null, t.sorteo_titulo + ' '), PE.vistas.reemplazar(t.sorteo, { candidaturas: r.sorteo.candidaturas.join(' y '), n: r.sorteo.escanosEnJuego }))));
      }
      resultado.appendChild(frases(r));
      resultado.appendChild(tablaResultado(r));
      if (r.escanos <= MATRIZ_HASTA) resultado.appendChild(matriz(r));
      resultado.appendChild(ranking(r));
      const comp = comparacion(r);
      if (comp) resultado.appendChild(comp);
    }

    const contenedor = h('div', { class: 'calculadora' },
      h('p', null, PE.etiquetas.crear('SIMULACIÓN'), ' ', t.aviso),
      h('p', { class: 'calculadora__lectura' }, PE.etiquetas.crear('NORMA VIGENTE'), ' ', PE.contenido.enLinea(t.lectura), ' ', PE.fuentes.botonVerFuente('boe-loreg')),
      botonesEjercicio.length ? h('div', { class: 'calculadora__ejercicios', role: 'group', 'aria-label': t.ejercicios }, [libre].concat(botonesEjercicio)) : null,
      textoEjercicio,
      h('div', { class: 'calculadora__datos' },
        h('p', null, h('label', { for: base + '-escanos' }, t.escanos), ' ', campoEscanos),
        h('p', null, h('label', { for: base + '-blancos' }, t.blancos), ' ', campoBlancos)),
      h('div', { class: 'tabla-contenedor' },
        h('table', { class: 'calculadora__votos' },
          h('caption', null, t.votos_caption),
          h('thead', null, h('tr', null, h('th', { scope: 'col' }, t.col_candidatura), h('th', { scope: 'col' }, t.col_votos), h('th', { scope: 'col' }, h('span', { class: 'visualmente-oculto' }, t.col_acciones)))),
          filas)),
      h('p', null, anadir),
      aviso,
      resultado);

    pintarFormulario();
    calcular();
    return contenedor;
  }

  PE.esquemas.registrar('calculadora-dhondt', calculadora);
})();
