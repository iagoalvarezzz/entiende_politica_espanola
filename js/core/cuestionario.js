/* Motor de cuestionarios (secciones 7.2, 7.5 y 17.3): de 4 a 6 preguntas por
   intento, explicación con la regla y la fuente tras cada respuesta, sin
   temporizador, sin ranking y sin preguntas de opinión. Guarda solo aciertos
   y fechas en el progreso local. */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;
  const MAXIMO = 6;
  let contador = 0;

  function textos() {
    return PE.textos('ui').cuestionario;
  }

  function preguntasDeBloques(bloques) {
    const conjunto = PE.datos('preguntas');
    const lista = conjunto ? conjunto.registros : [];
    return lista.filter(function (p) { return bloques.indexOf(p.bloque) !== -1; });
  }

  function barajar(lista) {
    const copia = lista.slice();
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = copia[i];
      copia[i] = copia[j];
      copia[j] = t;
    }
    return copia;
  }

  /* Elige entre 4 y 6 preguntas (todas si hay menos de 4). */
  function seleccionar(banco, aleatorio) {
    const orden = aleatorio === false ? banco.slice() : barajar(banco);
    return orden.slice(0, Math.min(MAXIMO, orden.length));
  }

  function textoOpcion(p, id) {
    const op = (p.opciones || []).find(function (o) { return o.id === String(id); });
    return op ? op.texto : String(id);
  }

  function esCorrecta(p, respuesta) {
    if (p.tipo === 'numerica') {
      const n = Number(String(respuesta).replace(',', '.'));
      return Number.isFinite(n) && Math.abs(n - Number(p.correcta)) <= (p.tolerancia || 0);
    }
    return String(respuesta) === String(p.correcta);
  }

  function pregunta(p, numero, total, alResponder) {
    const t = textos();
    contador += 1;
    const base = 'p' + contador;
    const campo = h('fieldset', { class: 'pregunta', 'data-pregunta': p.id },
      h('legend', null, h('span', { class: 'pregunta__numero' }, PE.vistas.reemplazar(t.numero, { n: numero, total: total })), ' ', p.enunciado));
    let entrada = null;
    if (p.tipo === 'numerica') {
      entrada = h('input', { type: 'text', inputmode: 'decimal', id: base + '-n', class: 'campo', autocomplete: 'off' });
      campo.appendChild(h('p', null, h('label', { for: base + '-n' }, t.tu_respuesta), ' ', entrada));
    } else {
      // Verdadero y falso mantienen su orden; en el resto, la correcta no va siempre en el mismo sitio.
      const opciones = p.tipo === 'verdadero_falso' ? p.opciones : barajar(p.opciones);
      campo.appendChild(h('div', { class: 'opciones' }, opciones.map(function (o) {
        const idOp = base + '-' + o.id;
        return h('div', { class: 'opcion' },
          h('input', { type: 'radio', name: base, id: idOp, value: o.id }),
          h('label', { for: idOp }, o.texto));
      })));
    }
    const boton = h('button', { type: 'button', class: 'boton boton--principal' }, t.comprobar);
    const aviso = h('p', { class: 'pregunta__aviso', role: 'status' });
    const retro = h('div', { class: 'retroalimentacion', 'aria-live': 'polite' });
    campo.appendChild(h('p', null, boton));
    campo.appendChild(aviso);
    campo.appendChild(retro);

    boton.addEventListener('click', function () {
      let respuesta;
      if (p.tipo === 'numerica') respuesta = entrada.value.trim();
      else {
        const marcada = campo.querySelector('input[type=radio]:checked');
        respuesta = marcada ? marcada.value : '';
      }
      if (respuesta === '') { aviso.textContent = t.elige; return; }
      aviso.textContent = '';
      const ok = esCorrecta(p, respuesta);
      Array.prototype.forEach.call(campo.querySelectorAll('input'), function (i) { i.disabled = true; });
      boton.disabled = true;
      const correcta = p.tipo === 'numerica' ? String(p.correcta) : textoOpcion(p, p.correcta);
      retro.className = 'retroalimentacion ' + (ok ? 'retroalimentacion--acierto' : 'retroalimentacion--fallo');
      retro.appendChild(h('p', { class: 'retroalimentacion__resultado' },
        PE.icono(ok ? 'acierto' : 'fallo'), ' ',
        h('strong', null, ok ? t.correcta : t.incorrecta),
        ok ? null : ' ' + PE.vistas.reemplazar(t.la_correcta, { respuesta: correcta })));
      retro.appendChild(h('p', null, p.explicacion));
      retro.appendChild(h('p', { class: 'retroalimentacion__regla' },
        PE.etiquetas.crear(p.etiqueta), ' ', t.regla + ' ' + p.articulo + '. ', PE.fuentes.botonVerFuente(p.fuente_id)));
      PE.progreso.registrarRespuesta(p.id, ok);
      alResponder(ok);
    });
    return campo;
  }

  /* Monta un cuestionario.
     opciones: { bloque, banco: [preguntas], titulo, aleatorio } */
  function montar(contenedor, opciones) {
    const t = textos();
    contenedor.textContent = '';
    const elegidas = seleccionar(opciones.banco, opciones.aleatorio);
    if (!elegidas.length) {
      contenedor.appendChild(h('p', null, t.sin_preguntas));
      return;
    }
    let respondidas = 0;
    let aciertos = 0;
    const resumen = h('div', { class: 'cuestionario__resumen', 'aria-live': 'polite' });
    contenedor.appendChild(h('p', { class: 'meta-texto' }, PE.vistas.reemplazar(t.instrucciones, { total: elegidas.length })));
    elegidas.forEach(function (p, i) {
      contenedor.appendChild(pregunta(p, i + 1, elegidas.length, function (ok) {
        respondidas += 1;
        if (ok) aciertos += 1;
        if (respondidas === elegidas.length) {
          PE.progreso.registrarCuestionario(opciones.bloque, aciertos, elegidas.length);
          resumen.appendChild(h('p', null, h('strong', null, PE.vistas.reemplazar(t.resultado, { aciertos: aciertos, total: elegidas.length }))));
          resumen.appendChild(h('p', null, t.sin_nota));
          resumen.appendChild(h('p', null, h('button', {
            type: 'button',
            class: 'boton',
            onclick: function () {
              montar(contenedor, opciones);
              contenedor.setAttribute('tabindex', '-1');
              contenedor.focus();
            }
          }, t.otra_vez)));
        }
      }));
    });
    contenedor.appendChild(resumen);
  }

  PE.cuestionario = {
    preguntasDeBloques: preguntasDeBloques,
    seleccionar: seleccionar,
    esCorrecta: esCorrecta,
    montar: montar
  };
})();
