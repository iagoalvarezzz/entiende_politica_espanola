/* Módulo 6, «Los partidos políticos» (sección 13).
   - fichas-partidos: fichas con la misma estructura para todos (sección 4.1),
     buscador y filtros por ámbito y por presencia en cada cámara. Orden
     alfabético por defecto, o por escaños en el Congreso en la disolución.
   - comparador-propuestas: filas por tema y columnas por partido. No suma, no
     puntúa ni ofrece test de afinidad. Mientras no haya programas del 29-N,
     todas las celdas dicen lo mismo para todos.
   - efecto-territorial: escaños por circunscripción en 2023 (datos oficiales)
     y un ejemplo ficticio con la calculadora D'Hondt.
   - tabla-simetria: palabras, fuentes, votaciones y propuestas por ficha.
   Los partidos llevan una marca neutra: sus siglas, con el mismo tamaño y
   peso para todos (sección 7.4). Datos: data/partidos.json y
   data/votaciones.json. */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;
  const u = PE.util;
  let contador = 0;

  function T() {
    return PE.textos('ui').partidos;
  }

  function partidos() {
    return PE.datos('partidos').registros;
  }

  function votaciones() {
    return PE.datos('votaciones').registros;
  }

  function contexto() {
    return PE.datos('partidos').meta.contexto;
  }

  function siglas(p) {
    return h('span', { class: 'siglas' }, p.siglas);
  }

  function plural(n, uno, varios) {
    return u.formatoNumero(n) + ' ' + (n === 1 ? uno : varios);
  }

  /* Descripción paralela: mismas frases y mismos verbos para todos (sección 13.4). */
  function descripcion(p) {
    const t = T();
    const r = p.representacion;
    const frases = [
      PE.vistas.reemplazar(t.frase_ambito, { nombre: p.nombre_oficial, siglas: p.siglas, ambito: t.ambitos[p.ambito] }),
      PE.vistas.reemplazar(t.frase_cortes, { fecha: u.formatoFecha(r.fecha_referencia), diputados: plural(r.congreso, 'diputado', 'diputados'), senadores: plural(r.senado, 'senador', 'senadores') }),
      r.parlamento_europeo !== null
        ? PE.vistas.reemplazar(t.frase_europeo, { n: plural(r.parlamento_europeo, 'escaño', 'escaños') })
        : t.frase_europeo_sin,
      r.parlamentos_autonomicos.length
        ? PE.vistas.reemplazar(t.frase_autonomicos, { n: plural(r.parlamentos_autonomicos.length, 'parlamento autonómico', 'parlamentos autonómicos') })
        : t.frase_autonomicos_sin,
      p.resultados_2023
        ? PE.vistas.reemplazar(t.frase_2023, { votos: u.formatoNumero(p.resultados_2023.votos), escanos: plural(p.resultados_2023.escanos, 'escaño', 'escaños'), circ: plural(p.resultados_2023.circunscripciones, 'circunscripción', 'circunscripciones') })
        : t.frase_2023_sin,
      p.clasificacion.length
        ? PE.vistas.reemplazar(t.frase_ches, { familia: p.clasificacion[0].familia })
        : t.frase_ches_sin
    ];
    return frases;
  }

  function contarPalabras(textos) {
    return textos.join(' ').split(/\s+/).filter(Boolean).length;
  }

  function pendiente(p, campo) {
    return p.pendientes.find(function (x) { return x.campo === campo; });
  }

  function parrafoPendiente(texto) {
    return h('p', null, PE.etiquetas.crear('PENDIENTE DE VERIFICAR'), ' ', texto);
  }

  function web(p) {
    const t = T();
    if (!p.web.url) return parrafoPendiente(pendiente(p, 'web').motivo);
    const f = p.web.fuente_id ? PE.fuentes.obtener(p.web.fuente_id) : null;
    if (f && PE.fuentes.comprobada(f)) return h('p', null, t.web + ': ', PE.fuentes.enlace(f));
    return h('p', null, t.web + ': ', h('code', null, PE.fuentes.raiz(p.web.url)), ' ', PE.etiquetas.crear('PENDIENTE DE VERIFICAR'), ' ', pendiente(p, 'web').motivo);
  }

  function seccion(titulo, contenido) {
    return h('section', { class: 'ficha-partido__parte' }, h('h4', null, titulo), contenido);
  }

  function tablaVotaciones(p) {
    const t = T();
    if (!p.votaciones.length) return h('p', null, t.sin_votaciones);
    const porId = {};
    votaciones().forEach(function (v) { porId[v.id] = v; });
    const filas = p.votaciones.map(function (x) {
      const v = porId[x.votacion_id];
      return h('tr', { role: 'row' },
        h('td', { role: 'cell', 'data-columna': t.col_fecha }, u.formatoFecha(v.fecha)),
        h('td', { role: 'cell', 'data-columna': t.col_tipo }, t.tipos_votacion[v.tipo]),
        h('td', { role: 'cell', 'data-columna': t.col_asunto }, v.titulo),
        h('td', { role: 'cell', 'data-columna': t.col_resultado }, x.resultado, ' ',
          h('a', { href: x.enlace, rel: 'noopener', target: '_blank', class: 'enlace-externo' }, t.registro, PE.icono('externo'),
            h('span', { class: 'visualmente-oculto' }, ' (se abre en otra pestaña)'))));
    });
    return h('details', { class: 'ficha-partido__votaciones' },
      h('summary', null, PE.vistas.reemplazar(t.ver_votaciones, { n: p.votaciones.length })),
      h('p', { class: 'meta-texto' }, PE.etiquetas.crear('DATO OFICIAL'), ' ', t.votaciones_nota, ' ', PE.fuentes.botonVerFuente('congreso-votaciones-xv')),
      h('div', { class: 'tabla-contenedor', role: 'region', tabindex: '0', 'aria-label': t.votaciones_titulo + ' ' + p.siglas },
        h('table', { class: 'tabla-apilable', role: 'table' },
          h('caption', { class: 'visualmente-oculto' }, t.votaciones_titulo + ' ' + p.siglas),
          h('thead', { role: 'rowgroup' }, h('tr', { role: 'row' }, [t.col_fecha, t.col_tipo, t.col_asunto, t.col_resultado].map(function (c) { return h('th', { scope: 'col', role: 'columnheader' }, c); }))),
          h('tbody', { role: 'rowgroup' }, filas))));
  }

  function representacion(p) {
    const t = T();
    const r = p.representacion;
    const fila = function (nombre, valor, detalle, fuente) {
      return h('li', null, h('strong', null, nombre + ': '), valor, '. ', detalle, ' ', PE.fuentes.botonVerFuente(fuente));
    };
    const autonomicos = r.parlamentos_autonomicos.length
      ? h('ul', { class: 'lista' }, r.parlamentos_autonomicos.map(function (a) {
        return h('li', null, a.parlamento + ': ' + a.grupo + ' ', PE.fuentes.botonVerFuente(a.fuente_id));
      }))
      : h('p', null, t.sin_grupo_autonomico);
    const r23 = p.resultados_2023;
    return [
      h('p', { class: 'meta-texto' }, PE.etiquetas.crear('DATO OFICIAL'), ' ', PE.vistas.reemplazar(t.fecha_referencia, { fecha: u.formatoFecha(r.fecha_referencia) })),
      h('ul', { class: 'lista' },
        fila(t.congreso, u.formatoNumero(r.congreso), r.detalle.congreso, 'congreso-diputados-datos-abiertos'),
        fila(t.senado, u.formatoNumero(r.senado), r.detalle.senado, 'senado-composicion-xv'),
        fila(t.europeo, r.parlamento_europeo === null ? t.sin_dato_propio : u.formatoNumero(r.parlamento_europeo), r.detalle.parlamento_europeo, 'boe-resultados-pe-2024')),
      h('p', null, h('strong', null, t.autonomicos + ': '), r.detalle.parlamentos_autonomicos),
      autonomicos,
      h('p', null, h('strong', null, t.generales_2023 + ': '),
        r23 ? PE.vistas.reemplazar(t.resultado_2023, { candidatura: r23.candidatura, votos: u.formatoNumero(r23.votos), escanos: u.formatoNumero(r23.escanos), circ: u.formatoNumero(r23.circunscripciones) })
          : t.sin_2023, ' ', PE.fuentes.botonVerFuente('boe-resultados-eg-2023'))
    ];
  }

  function clasificacion(p) {
    const t = T();
    if (!p.clasificacion.length) return parrafoPendiente(pendiente(p, 'clasificacion').motivo);
    const c = p.clasificacion[0];
    return [
      h('p', null, PE.etiquetas.crear('DATO DE ESTUDIO'), ' ', PE.vistas.reemplazar(t.ches_familia, { familia: c.familia, traduccion: c.categoria.replace(/^.*\(|\)$/g, '') })),
      h('ul', { class: 'lista' },
        h('li', null, PE.vistas.reemplazar(t.ches_lrgen, { v: u.formatoNumero(c.lrgen, 1) })),
        h('li', null, PE.vistas.reemplazar(t.ches_lrecon, { v: u.formatoNumero(c.lrecon, 1) })),
        h('li', null, PE.vistas.reemplazar(t.ches_galtan, { v: u.formatoNumero(c.galtan, 1) }))),
      h('p', { class: 'meta-texto' }, t.ches_aviso, ' ', PE.fuentes.botonVerFuente(c.fuente_id))
    ];
  }

  function ficha(p) {
    const t = T();
    return h('details', { class: 'ficha-partido', id: 'partido-' + p.id, 'data-partido': p.id },
      h('summary', null, siglas(p), ' ', h('span', { class: 'ficha-partido__nombre' }, p.nombre_oficial), ' ',
        h('span', { class: 'meta-texto' }, '· ' + t.ambitos[p.ambito])),
      h('div', { class: 'ficha-partido__cuerpo' },
        h('p', { class: 'ficha-partido__descripcion' }, descripcion(p).join(' ')),
        seccion(t.partes[0], [
          h('p', null, PE.vistas.reemplazar(t.denominacion, { nombre: p.nombre_oficial, siglas: p.siglas }), ' ', PE.fuentes.botonVerFuente(p.denominacion_fuente)),
          h('p', null, PE.etiquetas.crear('EXPLICACIÓN DIDÁCTICA'), ' ', PE.vistas.reemplazar(t.ambito_texto, { ambito: t.ambitos[p.ambito], criterio: p.ambito_criterio })),
          web(p)]),
        seccion(t.partes[1], parrafoPendiente(pendiente(p, 'autodefinicion').motivo)),
        seccion(t.partes[2], clasificacion(p)),
        seccion(t.partes[3], representacion(p)),
        seccion(t.partes[4], parrafoPendiente(pendiente(p, 'gobiernos').motivo)),
        seccion(t.partes[5], parrafoPendiente(pendiente(p, 'programa').motivo)),
        seccion(t.partes[6], tablaVotaciones(p)),
        seccion(t.fuentes, h('ul', { class: 'lista' }, p.fuentes.map(function (id) {
          const f = PE.fuentes.obtener(id);
          return h('li', null, f.titulo + ' ', PE.fuentes.botonVerFuente(id));
        })))));
  }

  function presente(p, camara) {
    const r = p.representacion;
    if (camara === 'congreso') return r.congreso > 0;
    if (camara === 'senado') return r.senado > 0;
    if (camara === 'europeo') return r.parlamento_europeo !== null && r.parlamento_europeo > 0;
    if (camara === 'autonomico') return r.parlamentos_autonomicos.length > 0;
    return true;
  }

  function selector(id, etiqueta, opciones) {
    const s = h('select', { id: id, class: 'selector' }, opciones.map(function (o) { return h('option', { value: o[0] }, o[1]); }));
    return { campo: s, nodo: h('p', null, h('label', { for: id }, etiqueta), ' ', s) };
  }

  function fichas() {
    contador += 1;
    const id = 'fp' + contador;
    const t = T();
    const buscar = h('input', { type: 'search', id: id + '-buscar', class: 'campo', autocomplete: 'off' });
    const ambito = selector(id + '-ambito', t.filtro_ambito, [['', t.todos], ['estatal', t.ambitos.estatal], ['autonomico', t.ambitos.autonomico]]);
    const camara = selector(id + '-camara', t.filtro_camara, [['', t.todas], ['congreso', t.congreso], ['senado', t.senado], ['europeo', t.europeo], ['autonomico', t.autonomicos]]);
    const orden = selector(id + '-orden', t.orden, [['alfabetico', t.orden_alfabetico], ['congreso', PE.vistas.reemplazar(t.orden_escanos, { fecha: u.formatoFecha(contexto().fecha_referencia) })]]);
    const lista = h('div', { class: 'fichas-partidos__lista' });
    const recuento = h('p', { class: 'meta-texto', 'aria-live': 'polite' });

    function pintar() {
      const q = u.normalizar(buscar.value);
      let visibles = partidos().filter(function (p) {
        return (!q || u.normalizar(p.nombre_oficial + ' ' + p.siglas).indexOf(q) !== -1) &&
          (!ambito.campo.value || p.ambito === ambito.campo.value) && presente(p, camara.campo.value);
      });
      visibles = visibles.slice().sort(function (a, b) {
        if (orden.campo.value === 'congreso' && b.representacion.congreso !== a.representacion.congreso) return b.representacion.congreso - a.representacion.congreso;
        return a.siglas.localeCompare(b.siglas, 'es');
      });
      lista.textContent = '';
      visibles.forEach(function (p) { lista.appendChild(ficha(p)); });
      recuento.textContent = PE.vistas.reemplazar(t.recuento, { n: visibles.length, total: partidos().length });
    }
    [buscar, ambito.campo, camara.campo, orden.campo].forEach(function (c) { c.addEventListener(c === buscar ? 'input' : 'change', pintar); });
    pintar();
    return h('div', { class: 'fichas-partidos' },
      h('div', { class: 'formulario-filtros' }, h('p', null, h('label', { for: id + '-buscar' }, t.buscar), buscar), ambito.nodo, camara.nodo, orden.nodo),
      recuento, lista);
  }

  function comparador(e) {
    contador += 1;
    const id = 'cp' + contador;
    const t = T();
    const todos = partidos().slice().sort(function (a, b) { return a.siglas.localeCompare(b.siglas, 'es'); });
    const porDefecto = e.partidos || contexto().lista_minima || todos.map(function (p) { return p.id; });
    const temas = e.temas;
    const marcas = h('fieldset', { class: 'comparador__partidos' },
      h('legend', null, t.elige_partidos),
      todos.map(function (p) {
        const c = h('input', { type: 'checkbox', id: id + '-' + p.id, value: p.id, checked: porDefecto.indexOf(p.id) !== -1 });
        return h('span', { class: 'comparador__marca' }, c, h('label', { for: id + '-' + p.id }, p.siglas));
      }));
    const tabla = h('div', { class: 'tabla-contenedor', role: 'region', tabindex: '0', 'aria-label': e.titulo });

    function celda(p, tema) {
      const prop = p.programa.propuestas.filter(function (x) { return x.tema_id === tema.id; });
      if (prop.length) return prop.map(function (x) { return h('p', null, PE.etiquetas.crear('PROPUESTA'), ' ', x.texto); });
      return h('p', null, PE.etiquetas.crear('PENDIENTE DE VERIFICAR'), ' ', t.celda_pendiente);
    }

    function pintar() {
      const elegidos = [].slice.call(marcas.querySelectorAll('input:checked')).map(function (c) { return c.value; });
      const columnas = todos.filter(function (p) { return elegidos.indexOf(p.id) !== -1; });
      tabla.textContent = '';
      tabla.appendChild(h('table', { class: 'tabla-apilable comparador', role: 'table' },
        h('caption', { class: 'visualmente-oculto' }, e.titulo),
        h('thead', { role: 'rowgroup' }, h('tr', { role: 'row' }, h('th', { scope: 'col', role: 'columnheader' }, t.tema),
          columnas.map(function (p) { return h('th', { scope: 'col', role: 'columnheader' }, p.siglas); }))),
        h('tbody', { role: 'rowgroup' }, temas.map(function (tema) {
          return h('tr', { role: 'row' }, h('th', { scope: 'row', role: 'rowheader' }, tema.nombre),
            columnas.map(function (p) { return h('td', { role: 'cell', 'data-columna': p.siglas }, celda(p, tema)); }));
        }))));
    }
    marcas.addEventListener('change', pintar);
    pintar();
    return h('div', { class: 'comparador-propuestas' },
      h('p', { class: 'aviso' }, t.comparador_aviso), marcas, tabla);
  }

  function efectoTerritorial(e) {
    contador += 1;
    const id = 'et' + contador;
    const t = T();
    const con2023 = partidos().filter(function (p) { return p.resultados_2023 && p.resultados_2023.escanos > 0; })
      .sort(function (a, b) { return a.siglas.localeCompare(b.siglas, 'es'); });
    const sel = selector(id + '-partido', t.elige_partido, con2023.map(function (p) { return [p.id, p.siglas]; }));
    const salida = h('div', { 'aria-live': 'polite' });

    function pintar() {
      const p = con2023.find(function (x) { return x.id === sel.campo.value; });
      const r = p.resultados_2023;
      const conEscano = Object.keys(r.escanos_por_circunscripcion).filter(function (c) { return r.escanos_por_circunscripcion[c] > 0; });
      salida.textContent = '';
      salida.appendChild(h('p', null, PE.etiquetas.crear('DATO OFICIAL'), ' ',
        PE.vistas.reemplazar(t.efecto_resumen, { siglas: p.siglas, circ: plural(r.circunscripciones, 'circunscripción', 'circunscripciones'), con: plural(conEscano.length, 'circunscripción', 'circunscripciones'), escanos: plural(r.escanos, 'escaño', 'escaños') }),
        ' ', PE.fuentes.botonVerFuente('boe-resultados-eg-2023')));
      salida.appendChild(h('ul', { class: 'lista lista--columnas' }, conEscano.map(function (c) {
        return h('li', null, c + ': ' + plural(r.escanos_por_circunscripcion[c], 'escaño', 'escaños'));
      })));
    }
    sel.campo.addEventListener('change', pintar);
    pintar();

    // Ejemplo ficticio: mismo porcentaje nacional, voto concentrado o repartido.
    const ej = e.ejemplo;
    const filas = ej.circunscripciones.map(function (c) {
      const res = PE.calc.dhondt.repartir({ escanos: c.escanos, candidaturas: c.votos.map(function (v, i) { return { id: ej.partidos[i], votos: v }; }), blancos: 0 });
      return { nombre: c.nombre, escanos: c.escanos, res: res };
    });
    const totales = ej.partidos.map(function (pid) {
      return {
        id: pid,
        votos: ej.circunscripciones.reduce(function (s, c, i) { return s + c.votos[ej.partidos.indexOf(pid)]; }, 0),
        escanos: filas.reduce(function (s, f) { return s + (f.res.reparto[pid] || 0); }, 0)
      };
    });
    const totalVotos = totales.reduce(function (s, x) { return s + x.votos; }, 0);
    return h('div', { class: 'efecto-territorial' },
      sel.nodo, salida,
      h('h4', null, ej.titulo),
      h('p', null, PE.etiquetas.crear('SIMULACIÓN'), ' ', ej.texto),
      h('div', { class: 'tabla-contenedor', role: 'region', tabindex: '0', 'aria-label': ej.titulo },
        h('table', { class: 'tabla-apilable', role: 'table' },
          h('caption', { class: 'visualmente-oculto' }, ej.titulo),
          h('thead', { role: 'rowgroup' }, h('tr', { role: 'row' }, h('th', { scope: 'col', role: 'columnheader' }, t.partido_ficticio),
            h('th', { scope: 'col', role: 'columnheader' }, t.votos_totales), h('th', { scope: 'col', role: 'columnheader' }, t.porcentaje),
            h('th', { scope: 'col', role: 'columnheader' }, t.escanos_totales))),
          h('tbody', { role: 'rowgroup' }, totales.map(function (x) {
            return h('tr', { role: 'row', 'data-partido': x.id },
              h('th', { scope: 'row', role: 'rowheader' }, x.id),
              h('td', { role: 'cell', 'data-columna': t.votos_totales }, u.formatoNumero(x.votos)),
              h('td', { role: 'cell', 'data-columna': t.porcentaje }, u.formatoNumero(100 * x.votos / totalVotos, 1) + ' %'),
              h('td', { role: 'cell', 'data-columna': t.escanos_totales }, u.formatoNumero(x.escanos)));
          })))),
      h('p', { class: 'meta-texto' }, ej.conclusion, ' ', h('a', { href: '#/elecciones/m3-reparto' }, t.ir_calculadora)));
  }

  function filasSimetria() {
    return partidos().map(function (p) {
      const ids = {};
      p.fuentes.forEach(function (id) { ids[id] = true; });
      return {
        id: p.id, siglas: p.siglas,
        palabras: contarPalabras(descripcion(p)),
        fuentes: Object.keys(ids).length,
        votaciones: p.votaciones.length,
        propuestas: p.programa.propuestas.length,
        partes: Object.keys(p).length
      };
    });
  }

  function tablaSimetria() {
    const t = T();
    const filas = filasSimetria();
    const media = filas.reduce(function (s, f) { return s + f.palabras; }, 0) / filas.length;
    return h('div', { class: 'tabla-simetria' },
      h('p', null, PE.vistas.reemplazar(t.simetria_media, { media: u.formatoNumero(media, 1) })),
      h('div', { class: 'tabla-contenedor', role: 'region', tabindex: '0', 'aria-label': t.simetria_titulo },
        h('table', { class: 'tabla-apilable', role: 'table' },
          h('caption', { class: 'visualmente-oculto' }, t.simetria_titulo),
          h('thead', { role: 'rowgroup' }, h('tr', { role: 'row' }, t.simetria_columnas.map(function (c) { return h('th', { scope: 'col', role: 'columnheader' }, c); }))),
          h('tbody', { role: 'rowgroup' }, filas.map(function (f) {
            const desv = 100 * (f.palabras - media) / media;
            return h('tr', { role: 'row', class: Math.abs(desv) > 15 ? 'simetria--fuera' : null },
              h('th', { scope: 'row', role: 'rowheader' }, f.siglas),
              h('td', { role: 'cell', 'data-columna': t.simetria_columnas[1] }, u.formatoNumero(f.palabras)),
              h('td', { role: 'cell', 'data-columna': t.simetria_columnas[2] }, (desv >= 0 ? '+' : '') + u.formatoNumero(desv, 1) + ' %'),
              h('td', { role: 'cell', 'data-columna': t.simetria_columnas[3] }, u.formatoNumero(f.fuentes)),
              h('td', { role: 'cell', 'data-columna': t.simetria_columnas[4] }, u.formatoNumero(f.votaciones)),
              h('td', { role: 'cell', 'data-columna': t.simetria_columnas[5] }, u.formatoNumero(f.propuestas)));
          })))),
      h('p', { class: 'meta-texto' }, t.simetria_nota));
  }

  PE.partidos = { descripcion: descripcion, filasSimetria: filasSimetria, contarPalabras: contarPalabras };
  PE.esquemas.registrar('fichas-partidos', fichas);
  PE.esquemas.registrar('comparador-propuestas', comparador);
  PE.esquemas.registrar('efecto-territorial', efectoTerritorial);
  PE.esquemas.registrar('tabla-simetria', tablaSimetria);
})();
