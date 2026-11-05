/* Glosario: búsqueda tolerante (sin mayúsculas, sin tildes y con una o dos
   letras de error) y definición breve accesible con teclado la primera vez
   que un término aparece en una página (sección 7.1). */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;
  let indice = null;
  let vistos = new Set();
  let contador = 0;

  function normalizar(texto) {
    return PE.util.normalizar(texto).replace(/[^a-z0-9ñ ]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function construir() {
    const conjunto = PE.datos('glosario');
    indice = (conjunto ? conjunto.registros : []).map(function (t) {
      const nombres = [t.termino].concat(t.alias || []).map(normalizar);
      return {
        termino: t,
        nombres: nombres,
        palabras: nombres.join(' ').split(' '),
        definicion: normalizar(t.definicion)
      };
    });
    return indice;
  }

  function terminos() {
    return (indice || construir()).map(function (e) { return e.termino; });
  }

  function obtener(id) {
    return terminos().find(function (t) { return t.id === id; }) || null;
  }

  /* Distancia de edición (Damerau-Levenshtein restringida). */
  function distancia(a, b) {
    const m = a.length;
    const n = b.length;
    const d = [];
    for (let i = 0; i <= m; i++) { d[i] = [i]; }
    for (let j = 0; j <= n; j++) { d[0][j] = j; }
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const coste = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + coste);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        }
      }
    }
    return d[m][n];
  }

  function tolerancia(palabra) {
    if (palabra.length >= 8) return 2;
    if (palabra.length >= 4) return 1;
    return 0;
  }

  function palabraParecida(palabra, candidatas) {
    const t = tolerancia(palabra);
    return candidatas.some(function (c) {
      return c.indexOf(palabra) === 0 || (t > 0 && Math.abs(c.length - palabra.length) <= t && distancia(palabra, c) <= t);
    });
  }

  function puntuar(entrada, q, palabrasQ) {
    let mejor = 0;
    entrada.nombres.forEach(function (n) {
      if (n === q) mejor = Math.max(mejor, 100);
      else if (n.indexOf(q) === 0) mejor = Math.max(mejor, 80);
      else if (n.indexOf(q) !== -1) mejor = Math.max(mejor, 60);
    });
    if (mejor) return mejor;
    if (palabrasQ.every(function (p) { return entrada.nombres.some(function (n) { return n.indexOf(p) !== -1; }); })) return 50;
    if (palabrasQ.every(function (p) { return palabraParecida(p, entrada.palabras); })) return 40;
    if (entrada.definicion.indexOf(q) !== -1) return 20;
    return 0;
  }

  /* Devuelve los términos que coinciden, de más a menos parecidos. */
  function buscar(texto) {
    const q = normalizar(texto);
    if (!q) return [];
    const palabrasQ = q.split(' ');
    return (indice || construir())
      .map(function (e) { return { termino: e.termino, puntuacion: puntuar(e, q, palabrasQ) }; })
      .filter(function (r) { return r.puntuacion > 0; })
      .sort(function (a, b) {
        return b.puntuacion - a.puntuacion || a.termino.termino.localeCompare(b.termino.termino, 'es');
      })
      .map(function (r) { return r.termino; });
  }

  /* Al cambiar de página, los términos vuelven a mostrar su definición la primera vez. */
  function reiniciarPagina() {
    vistos = new Set();
  }

  /* Término dentro de un texto. La primera vez en la página es un botón que
     despliega la definición breve; las siguientes, texto normal. */
  function enTexto(id, visible) {
    const t = obtener(id);
    if (!t) throw new Error('Término de glosario desconocido: ' + id);
    if (vistos.has(id)) return document.createTextNode(visible);
    vistos.add(id);
    contador += 1;
    const idDef = 'def-' + id + '-' + contador;
    const definicion = h('span', { class: 'termino__definicion', id: idDef, role: 'note', hidden: true },
      h('strong', null, t.termino + '. '),
      t.definicion + ' ',
      h('a', { href: '#/glosario/' + t.id }, PE.textos('ui').glosario.ver_en_glosario));
    const boton = h('button', { type: 'button', class: 'termino', 'aria-expanded': 'false', 'aria-controls': idDef }, visible);
    function alternar(abrir) {
      boton.setAttribute('aria-expanded', String(abrir));
      definicion.hidden = !abrir;
    }
    boton.addEventListener('click', function () { alternar(boton.getAttribute('aria-expanded') !== 'true'); });
    boton.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && boton.getAttribute('aria-expanded') === 'true') { alternar(false); e.stopPropagation(); }
    });
    definicion.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { alternar(false); boton.focus(); e.stopPropagation(); }
    });
    return h('span', { class: 'termino-envoltorio' }, boton, definicion);
  }

  PE.glosario = {
    normalizar: normalizar,
    distancia: distancia,
    terminos: terminos,
    obtener: obtener,
    buscar: buscar,
    reiniciarPagina: reiniciarPagina,
    enTexto: enTexto
  };
})();
