/* Simulador de mayorías con bloques ficticios (sección 10.8). La persona
   reparte los 350 escaños y decide qué vota cada bloque en una investidura.
   Aplica la Constitución, art. 99.3: en la primera votación hace falta la
   mayoría absoluta (176); en la segunda, 48 horas después, basta la
   mayoría simple (más síes que noes). No usa partidos reales. */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;
  const TOTAL = 350;
  let contador = 0;

  function T() {
    return PE.textos('ui').mayorias;
  }

  function simulador(e) {
    contador += 1;
    const base = 'may' + contador;
    const t = T();
    const umbrales = PE.calc.mayorias.umbrales(TOTAL);
    const bloques = e.bloques.map(function (b, i) {
      return { id: b.id, nombre: b.nombre, escanos: e.inicial[i].escanos, voto: e.inicial[i].voto };
    });
    const resultado = h('div', { class: 'mayorias__resultado', 'aria-live': 'polite' });
    const suma = h('p', { class: 'mayorias__suma', role: 'status' });

    const filas = bloques.map(function (b) {
      const idE = base + '-' + b.id + '-e';
      const idV = base + '-' + b.id + '-v';
      const escanos = h('input', { type: 'number', id: idE, class: 'campo campo--numero', min: '0', max: String(TOTAL), step: '1', inputmode: 'numeric', value: String(b.escanos) });
      const voto = h('select', { id: idV, class: 'selector' },
        ['si', 'no', 'abstencion'].map(function (v) { return h('option', { value: v }, t['voto_' + v]); }));
      voto.value = b.voto;
      escanos.addEventListener('input', function () { b.escanos = Number(escanos.value); calcular(); });
      voto.addEventListener('change', function () { b.voto = voto.value; calcular(); });
      return h('tr', null,
        h('th', { scope: 'row' }, b.nombre),
        h('td', null, h('label', { for: idE, class: 'visualmente-oculto' }, PE.vistas.reemplazar(t.etiqueta_escanos, { bloque: b.nombre })), escanos),
        h('td', null, h('label', { for: idV, class: 'visualmente-oculto' }, PE.vistas.reemplazar(t.etiqueta_voto, { bloque: b.nombre })), voto));
    });

    function linea(icono, fuerte, texto) {
      return h('p', null, PE.icono(icono), ' ', h('strong', null, fuerte + ' '), texto);
    }

    function calcular() {
      resultado.textContent = '';
      const validos = bloques.every(function (b) { return Number.isInteger(b.escanos) && b.escanos >= 0; });
      const total = bloques.reduce(function (s, b) { return s + (Number.isInteger(b.escanos) ? b.escanos : 0); }, 0);
      if (!validos) {
        suma.textContent = t.error_entero;
        return;
      }
      if (total !== TOTAL) {
        suma.textContent = PE.vistas.reemplazar(total < TOTAL ? t.faltan_escanos : t.sobran_escanos, { n: Math.abs(TOTAL - total), total: total });
        return;
      }
      suma.textContent = PE.vistas.reemplazar(t.suma_ok, { total: TOTAL });
      const cuenta = { si: 0, no: 0, abstencion: 0 };
      bloques.forEach(function (b) { cuenta[b.voto] += b.escanos; });
      const r = PE.calc.mayorias.evaluar({ total: TOTAL, favor: cuenta.si, contra: cuenta.no });
      resultado.appendChild(h('p', null, PE.vistas.reemplazar(t.recuento, { si: cuenta.si, no: cuenta.no, abs: cuenta.abstencion })));
      if (r.absoluta) {
        resultado.appendChild(linea('acierto', t.primera_si, PE.vistas.reemplazar(t.primera_si_texto, { si: cuenta.si, mayoria: umbrales.absoluta })));
      } else {
        resultado.appendChild(linea('fallo', t.primera_no, PE.vistas.reemplazar(t.primera_no_texto, { si: cuenta.si, mayoria: umbrales.absoluta, faltan: r.faltanParaAbsoluta })));
        if (r.simple) {
          resultado.appendChild(linea('acierto', t.segunda_si, PE.vistas.reemplazar(t.segunda_si_texto, { si: cuenta.si, no: cuenta.no })));
        } else {
          const faltan = cuenta.no - cuenta.si + 1;
          resultado.appendChild(linea('fallo', t.segunda_no, PE.vistas.reemplazar(t.segunda_no_texto, { si: cuenta.si, no: cuenta.no, faltan: faltan })));
          resultado.appendChild(h('p', null, PE.contenido.enLinea(t.sin_investidura)));
        }
      }
      const solo = bloques.find(function (b) { return b.escanos >= umbrales.absoluta; });
      resultado.appendChild(h('p', { class: 'meta-texto' }, solo
        ? PE.vistas.reemplazar(t.bloque_solo, { bloque: solo.nombre, mayoria: umbrales.absoluta })
        : PE.vistas.reemplazar(t.ningun_bloque, { mayoria: umbrales.absoluta })));
    }

    calcular();
    return h('div', { class: 'mayorias' },
      h('p', null, PE.etiquetas.crear('SIMULACIÓN'), ' ', t.aviso),
      h('div', { class: 'tabla-contenedor' },
        h('table', null,
          h('caption', null, t.tabla),
          h('thead', null, h('tr', null, h('th', { scope: 'col' }, t.col_bloque), h('th', { scope: 'col' }, t.col_escanos), h('th', { scope: 'col' }, t.col_voto))),
          h('tbody', null, filas))),
      suma,
      resultado,
      h('p', { class: 'meta-texto' }, PE.etiquetas.crear('NORMA VIGENTE'), ' ', t.base_legal, ' ', PE.fuentes.botonVerFuente('boe-constitucion')));
  }

  PE.esquemas.registrar('simulador-mayorias', simulador);
})();
