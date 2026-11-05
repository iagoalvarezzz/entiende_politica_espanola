/* Módulo 9, «Medios de comunicación y verificación» (sección 16).
   - fichas-medios: misma estructura para todos (sección 16.2), con filtros por
     soporte y por tipo de propietario; ningún filtro por orientación.
   - mapa-propiedad: grupos y medios según EurOMo 2025, sin completar lo que el
     informe no recoge.
   - fichas-verificadores: estado en la IFCN, propiedad y metodología. */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;
  const u = PE.util;
  let contador = 0;

  function T() {
    return PE.textos('ui').medios;
  }

  function medios() {
    return PE.datos('medios').registros;
  }

  function pendiente(m, campo) {
    return (m.pendientes || []).find(function (x) { return x.campo === campo; });
  }

  function parte(titulo, contenido) {
    return h('section', { class: 'ficha-medio__parte' }, h('h4', null, titulo), contenido);
  }

  function ficha(m) {
    const t = T();
    const aud = m.audiencia;
    return h('details', { class: 'ficha-medio', 'data-medio': m.id },
      h('summary', null, h('span', { class: 'ficha-medio__nombre' }, m.nombre), ' ',
        h('span', { class: 'meta-texto' }, '· ' + t.soportes[m.soporte] + ' · ' + t.titularidades[m.titularidad])),
      h('div', { class: 'ficha-medio__cuerpo' },
        parte(t.partes[0], h('p', null, PE.vistas.reemplazar(t.identidad, { nombre: m.nombre, soporte: t.soportes[m.soporte], titularidad: t.titularidades[m.titularidad] }), ' ',
          h('span', { class: 'meta-texto' }, t.criterios[m.criterio]))),
        parte(t.partes[1], m.propiedad.fuente_id
          ? h('p', null, PE.etiquetas.crear('DATO DE ESTUDIO'), ' ', m.propiedad.texto, ' ', PE.vistas.reemplazar(t.edicion, { anio: m.propiedad.edicion }), ' ', PE.fuentes.botonVerFuente(m.propiedad.fuente_id))
          : h('p', null, PE.etiquetas.crear('PENDIENTE DE VERIFICAR'), ' ', m.propiedad.texto)),
        parte(t.partes[2], h('p', null, PE.etiquetas.crear('PENDIENTE DE VERIFICAR'), ' ', pendiente(m, 'linea_editorial').motivo)),
        parte(t.partes[3], typeof aud.valor === 'number'
          ? h('p', null, PE.etiquetas.crear('DATO DE ESTUDIO'), ' ', PE.vistas.reemplazar(t.audiencia, { v: u.formatoNumero(aud.valor), periodo: aud.periodo }), ' ', aud.nota, ' ', PE.fuentes.botonVerFuente(aud.fuente_id))
          : h('p', null, t.sin_audiencia, ' ', aud.nota)),
        parte(t.partes[4], h('p', null, m.orientacion.clasificacion.charAt(0).toUpperCase() + m.orientacion.clasificacion.slice(1) + '. ', t.orientacion_nota))));
  }

  function selector(id, etiqueta, opciones) {
    const s = h('select', { id: id, class: 'selector' }, opciones.map(function (o) { return h('option', { value: o[0] }, o[1]); }));
    return { campo: s, nodo: h('p', null, h('label', { for: id }, etiqueta), ' ', s) };
  }

  function fichas() {
    contador += 1;
    const id = 'fmed' + contador;
    const t = T();
    const soporte = selector(id + '-soporte', t.filtro_soporte, [['', t.todos]].concat(Object.keys(t.soportes).map(function (k) { return [k, t.soportes[k]]; })));
    const propietario = selector(id + '-prop', t.filtro_propietario, [['', t.todos]].concat(Object.keys(t.propietarios).map(function (k) { return [k, t.propietarios[k]]; })));
    const lista = h('div', { class: 'fichas-medios__lista' });
    const recuento = h('p', { class: 'meta-texto', 'aria-live': 'polite' });
    function pintar() {
      const visibles = medios().filter(function (m) {
        return (!soporte.campo.value || m.soporte === soporte.campo.value) && (!propietario.campo.value || m.tipo_propietario === propietario.campo.value);
      });
      lista.textContent = '';
      visibles.forEach(function (m) { lista.appendChild(ficha(m)); });
      recuento.textContent = PE.vistas.reemplazar(t.recuento, { n: visibles.length, total: medios().length });
    }
    [soporte.campo, propietario.campo].forEach(function (c) { c.addEventListener('change', pintar); });
    pintar();
    return h('div', { class: 'fichas-medios' },
      h('p', { class: 'aviso' }, t.aviso_orientacion),
      h('div', { class: 'formulario-filtros' }, soporte.nodo, propietario.nodo),
      recuento, lista);
  }

  function mapa() {
    const t = T();
    const grupos = {};
    medios().forEach(function (m) {
      if (!m.propiedad.fuente_id) return;
      const g = m.propiedad.grupo || m.propiedad.corporacion;
      (grupos[g] = grupos[g] || []).push(m);
    });
    const nombres = Object.keys(grupos).sort(function (a, b) { return grupos[b].length - grupos[a].length || a.localeCompare(b, 'es'); });
    const sinDoc = medios().filter(function (m) { return !m.propiedad.fuente_id; });
    return h('div', { class: 'mapa-propiedad' },
      h('p', null, PE.etiquetas.crear('DATO DE ESTUDIO'), ' ', t.mapa_intro, ' ', PE.fuentes.botonVerFuente('euromo-espana-2025')),
      h('ul', { class: 'mapa-propiedad__grupos' }, nombres.map(function (g) {
        return h('li', { class: 'mapa-propiedad__grupo', 'data-grupo': g },
          h('p', { class: 'mapa-propiedad__nombre' }, h('strong', null, g), ' ', h('span', { class: 'meta-texto' }, '(' + grupos[g].length + ')')),
          h('ul', { class: 'lista' }, grupos[g].map(function (m) {
            return h('li', null, m.nombre + ' — ' + t.soportes[m.soporte] + (m.propiedad.grupo && m.propiedad.corporacion !== m.propiedad.grupo ? ' (' + m.propiedad.corporacion + ')' : ''));
          })));
      })),
      h('p', null, h('strong', null, t.sin_documentar + ': '), sinDoc.map(function (m) { return m.nombre; }).join(', ') + '.'));
  }

  function verificadores() {
    const t = T();
    const lista = PE.datos('verificadores').registros;
    return h('div', { class: 'tabla-contenedor', role: 'region', tabindex: '0', 'aria-label': t.verificadores_titulo },
      h('table', { class: 'tabla-apilable tabla-verificadores', role: 'table' },
        h('caption', { class: 'visualmente-oculto' }, t.verificadores_titulo),
        h('thead', { role: 'rowgroup' }, h('tr', { role: 'row' }, t.verificadores_columnas.map(function (c) { return h('th', { scope: 'col', role: 'columnheader' }, c); }))),
        h('tbody', { role: 'rowgroup' }, lista.map(function (v) {
          return h('tr', { role: 'row', 'data-verificador': v.id },
            h('th', { scope: 'row', role: 'rowheader' }, v.nombre),
            h('td', { role: 'cell', 'data-columna': t.verificadores_columnas[1] }, PE.etiquetas.crear('DATO DE ESTUDIO'), ' ', v.ifcn_texto, ' ', PE.fuentes.botonVerFuente(v.ifcn_fuente)),
            h('td', { role: 'cell', 'data-columna': t.verificadores_columnas[2] }, v.propiedad
              ? [v.propiedad, ' ', PE.fuentes.botonVerFuente(v.propiedad_fuente)]
              : [PE.etiquetas.crear('PENDIENTE DE VERIFICAR'), ' ', t.sin_propiedad]),
            h('td', { role: 'cell', 'data-columna': t.verificadores_columnas[3] }, v.metodologia_fuente
              ? PE.fuentes.enlace(PE.fuentes.obtener(v.metodologia_fuente))
              : [PE.etiquetas.crear('PENDIENTE DE VERIFICAR'), ' ', t.sin_metodologia]));
        }))));
  }

  PE.esquemas.registrar('fichas-medios', fichas);
  PE.esquemas.registrar('mapa-propiedad', mapa);
  PE.esquemas.registrar('fichas-verificadores', verificadores);
})();
