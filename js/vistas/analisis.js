/* Módulo 8, «Análisis de políticas públicas y lectura de datos» (sección 15).
   - ficha-medida: las ocho preguntas de la sección 15.2 para tres medidas
     inventadas, con la etiqueta de cada respuesta o «sin información
     verificada». No concluye si una medida funciona (sección 15.8).
   - margen-error: margen por muestreo aleatorio simple (vector T10).
   - antes-despues: cambio antes y después frente a grupo de comparación
     (diferencia en diferencias), con datos ficticios editables. */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;
  const u = PE.util;
  let contador = 0;

  function T() {
    return PE.textos('ui').analisis;
  }

  function campo(id, etiqueta, valor, extra) {
    const input = h('input', Object.assign({ type: 'number', id: id, class: 'campo campo--numero', value: String(valor), inputmode: 'decimal' }, extra || {}));
    return { input: input, nodo: h('p', null, h('label', { for: id }, etiqueta), ' ', input) };
  }

  function numero(input) {
    const v = parseFloat(String(input.value).replace(',', '.'));
    return isFinite(v) ? v : NaN;
  }

  function fichaMedida(e) {
    contador += 1;
    const id = 'fm' + contador;
    const t = T();
    const selector = h('select', { id: id + '-medida', class: 'selector' }, e.medidas.map(function (m) { return h('option', { value: m.id }, m.nombre); }));
    const salida = h('div', { 'aria-live': 'polite' });
    function pintar() {
      const m = e.medidas.find(function (x) { return x.id === selector.value; });
      salida.textContent = '';
      salida.appendChild(h('p', null, PE.etiquetas.crear('SIMULACIÓN'), ' ', PE.contenido.enLinea(m.descripcion)));
      salida.appendChild(h('ol', { class: 'ficha-medida' }, e.preguntas.map(function (p, i) {
        const r = m.respuestas[i];
        return h('li', { class: 'ficha-medida__pregunta' },
          h('p', { class: 'ficha-medida__titulo' }, h('strong', null, p)),
          r ? h('p', null, PE.etiquetas.crear(r.etiqueta), ' ', PE.contenido.enLinea(r.texto))
            : h('p', null, PE.etiquetas.crear('PENDIENTE DE VERIFICAR'), ' ', t.sin_informacion));
      })));
      salida.appendChild(h('p', { class: 'aviso' }, PE.contenido.enLinea(m.falta)));
    }
    selector.addEventListener('change', pintar);
    pintar();
    return h('div', { class: 'ficha-medidas' }, h('p', null, h('label', { for: id + '-medida' }, t.elige_medida), ' ', selector), salida);
  }

  function margenError(e) {
    contador += 1;
    const id = 'me' + contador;
    const t = T();
    const n = campo(id + '-n', t.entrevistas, e.n, { min: '1', step: '1' });
    const p = campo(id + '-p', t.porcentaje, e.p, { min: '0', max: '100', step: '0.1' });
    const z = h('select', { id: id + '-z', class: 'selector' }, [['1.645', '90 %'], ['1.96', '95 %'], ['2', '95,5 % (dos sigmas)'], ['2.576', '99 %']].map(function (o) {
      return h('option', { value: o[0], selected: o[0] === '1.96' }, o[1]);
    }));
    const salida = h('p', { class: 'calc__resultado', 'aria-live': 'polite' });
    function pintar() {
      const nv = numero(n.input);
      const pv = numero(p.input) / 100;
      if (!(nv >= 1) || !(pv >= 0 && pv <= 1)) { salida.textContent = t.error_datos; return; }
      const m = PE.calc.encuestas.margenError(pv, nv, parseFloat(z.value));
      salida.textContent = PE.vistas.reemplazar(t.margen_resultado, { m: u.formatoNumero(m, 1), confianza: z.options[z.selectedIndex].text });
    }
    [n.input, p.input].forEach(function (x) { x.addEventListener('input', pintar); });
    z.addEventListener('change', pintar);
    pintar();
    return h('div', { class: 'calc margen-error' },
      h('p', null, PE.etiquetas.crear('SIMULACIÓN'), ' ', t.margen_aviso),
      n.nodo, p.nodo, h('p', null, h('label', { for: id + '-z' }, t.confianza), ' ', z), salida);
  }

  function antesDespues(e) {
    contador += 1;
    const id = 'ad' + contador;
    const t = T();
    const c = {
      aAntes: campo(id + '-aa', t.a_antes, e.a[0], { step: '0.1' }), aDespues: campo(id + '-ad', t.a_despues, e.a[1], { step: '0.1' }),
      bAntes: campo(id + '-ba', t.b_antes, e.b[0], { step: '0.1' }), bDespues: campo(id + '-bd', t.b_despues, e.b[1], { step: '0.1' })
    };
    const salida = h('div', { 'aria-live': 'polite' });
    function pintar() {
      const v = Object.keys(c).map(function (k) { return numero(c[k].input); });
      salida.textContent = '';
      if (v.some(function (x) { return !isFinite(x); })) { salida.appendChild(h('p', null, t.error_datos)); return; }
      const cambioA = v[1] - v[0];
      const cambioB = v[3] - v[2];
      const did = PE.calc.encuestas.difEnDif(v[0], v[1], v[2], v[3]);
      const formato = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 });
      const f = function (x) { return (x > 0 ? '+' : '') + formato.format(Math.round(x * 10) / 10 || 0); };
      salida.appendChild(h('p', { class: 'calc__resultado' }, PE.vistas.reemplazar(t.resultado_antes, { a: f(cambioA), b: f(cambioB), d: f(did) })));
      salida.appendChild(h('p', { class: 'meta-texto' }, t.condicion));
    }
    Object.keys(c).forEach(function (k) { c[k].input.addEventListener('input', pintar); });
    pintar();
    return h('div', { class: 'calc antes-despues' },
      h('p', null, PE.etiquetas.crear('SIMULACIÓN'), ' ', t.antes_aviso),
      h('div', { class: 'antes-despues__campos' }, c.aAntes.nodo, c.aDespues.nodo, c.bAntes.nodo, c.bDespues.nodo),
      salida);
  }

  PE.esquemas.registrar('ficha-medida', fichaMedida);
  PE.esquemas.registrar('margen-error', margenError);
  PE.esquemas.registrar('antes-despues', antesDespues);
})();
