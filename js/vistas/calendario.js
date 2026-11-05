/* Calendario de una convocatoria (sección 10.6): hitos en orden, cada uno con
   su etiqueta, su fuente y su nota. Los días que faltan se calculan en el
   navegador con la fecha de hoy; nunca se escriben a mano. También muestra
   el censo con su fecha de cierre. */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;
  const u = PE.util;
  const DIA = 24 * 60 * 60 * 1000;

  function T() {
    return PE.textos('ui').calendario;
  }

  function aFecha(iso) {
    const p = iso.split('-').map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }

  function hoy() {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function iso(d) {
    const dos = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + dos(d.getMonth() + 1) + '-' + dos(d.getDate());
  }

  /* Situación de un hito respecto a hoy: pasado, en curso o pendiente (con días). */
  function situacion(hito, dia) {
    const t = T();
    const desde = aFecha(hito.desde);
    const hasta = aFecha(hito.hasta || hito.desde);
    if (dia > hasta) return { clase: 'pasado', texto: t.pasado };
    if (dia >= desde) return { clase: 'en-curso', texto: t.en_curso };
    const dias = Math.round((desde - dia) / DIA);
    return { clase: 'futuro', texto: dias === 1 ? t.falta_uno : PE.vistas.reemplazar(t.faltan, { n: dias }) };
  }

  function fechas(hito) {
    const t = T();
    if (hito.hasta && hito.hasta !== hito.desde) {
      return PE.vistas.reemplazar(t.rango, { desde: u.formatoFecha(hito.desde, true), hasta: u.formatoFecha(hito.hasta, true) });
    }
    return u.formatoFecha(hito.desde, true);
  }

  function censo(conv) {
    const t = T();
    const c = conv.censo;
    if (!c) return null;
    const n = function (x) { return new Intl.NumberFormat('es-ES').format(x); };
    return h('div', { class: 'dato' },
      PE.etiquetas.crear('DATO OFICIAL'),
      h('div', { class: 'dato__texto' },
        h('p', null, PE.vistas.reemplazar(t.censo, {
          total: n(c.total), espana: n(c.residentes_espana), extranjero: n(c.residentes_extranjero), cierre: u.formatoFecha(c.fecha_cierre)
        })),
        c.primera_vez ? h('p', null, PE.vistas.reemplazar(t.primera_vez, { n: n(c.primera_vez) })) : null,
        h('p', { class: 'meta-texto' }, PE.vistas.reemplazar(t.consulta, { fecha: u.formatoFecha(c.fecha_consulta) }))),
      h('div', { class: 'dato__acciones' }, PE.fuentes.botonVerFuente(c.fuente_id)));
  }

  function calendario(e) {
    const t = T();
    const conjunto = PE.datos('convocatorias');
    const conv = conjunto.registros.find(function (c) { return c.id === e.convocatoria; });
    const dia = hoy();
    const hitos = conv.hitos.slice().sort(function (a, b) { return a.desde.localeCompare(b.desde) || (a.hasta || a.desde).localeCompare(b.hasta || b.desde); });
    const pendientes = hitos.filter(function (x) { return x.estado !== 'verificado'; }).length;
    return h('div', { class: 'calendario' },
      h('p', { class: 'meta-texto' }, PE.vistas.reemplazar(t.hoy, { fecha: u.formatoFecha(iso(dia), true) })),
      pendientes ? h('p', { class: 'meta-texto' }, PE.vistas.reemplazar(t.pendientes, { n: pendientes })) : null,
      h('ol', { class: 'calendario__lista' }, hitos.map(function (x) {
        const s = situacion(x, dia);
        return h('li', { class: 'calendario__hito calendario__hito--' + s.clase + (x.id === 'votacion' ? ' calendario__hito--votacion' : '') },
          h('p', { class: 'calendario__fecha' }, PE.icono(x.id === 'votacion' ? 'urna' : 'calendario'), ' ', h('strong', null, fechas(x)), x.hora ? ' · ' + x.hora : ''),
          h('p', { class: 'calendario__nombre' }, x.nombre),
          h('p', { class: 'calendario__estado' }, PE.etiquetas.crear(PE.etiquetas.segunEstado(x.estado)), ' ', h('span', { class: 'calendario__situacion' }, s.texto), ' ', PE.fuentes.botonVerFuente(x.fuente_id)),
          x.nota ? h('p', { class: 'meta-texto' }, x.nota) : null);
      })),
      censo(conv));
  }

  PE.esquemas.registrar('calendario-electoral', calendario);
  PE.calendario = { situacion: situacion };
})();
