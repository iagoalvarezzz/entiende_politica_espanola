/* Secciones con módulos («El Estado», «Elecciones generales»): portada con el
   progreso y páginas de bloque con la plantilla de la sección 7.2 (en 30
   segundos, paso a paso, ejemplo cotidiano, error frecuente, datos y fuentes,
   cuestionario y para profundizar), migas de pan y botones anterior y
   siguiente. Las secciones y sus módulos están en content/es/modulos.json. */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;
  const u = PE.util;

  function config() {
    return PE.textos('modulos');
  }

  function t() {
    return PE.textos('ui').modulo;
  }

  function seccion(id) {
    return config().secciones.find(function (s) { return s.id === id; }) || null;
  }

  function seccionDeModulo(idModulo) {
    return config().secciones.find(function (s) { return s.modulos.indexOf(idModulo) !== -1; }) || null;
  }

  function modulo(id) {
    return config().modulos.find(function (m) { return m.id === id; }) || null;
  }

  function bloque(id) {
    const modulos = config().modulos;
    for (let i = 0; i < modulos.length; i++) {
      const contenido = PE.textos(modulos[i].id);
      const b = contenido && contenido.bloques.find(function (x) { return x.id === id; });
      if (b) return { modulo: modulos[i], bloque: b, seccion: seccionDeModulo(modulos[i].id) };
    }
    return null;
  }

  /* Ruta de la página de un bloque: la de su sección más el id. */
  function ruta(idBloque) {
    const b = bloque(idBloque);
    return b ? b.seccion.ruta + '/' + idBloque : null;
  }

  /* Todos los bloques en orden de lectura: { modulo, bloque, seccion }. */
  function secuencia() {
    const lista = [];
    config().secciones.forEach(function (s) {
      s.modulos.forEach(function (idModulo) {
        modulo(idModulo).bloques.forEach(function (id) { lista.push(bloque(id)); });
      });
    });
    return lista.filter(Boolean);
  }

  function idsDeModulo(idModulo) {
    const m = modulo(idModulo);
    return m ? m.bloques.slice() : [];
  }

  function barraProgreso(resumen, etiqueta) {
    return h('div', { class: 'progreso' },
      h('progress', { max: String(resumen.total), value: String(resumen.completados), 'aria-label': etiqueta }),
      h('span', { class: 'progreso__texto' }, PE.vistas.reemplazar(t().progreso, resumen)));
  }

  function estadoBloque(id) {
    if (PE.progreso.completado(id)) return t().completado;
    if (PE.progreso.estaEstudiado(id)) return t().estudiado_sin_cuestionario;
    return t().sin_empezar;
  }

  function selectorModo() {
    const ampliado = PE.almacen.leer('modo', 'basico') === 'ampliado';
    const boton = h('button', { type: 'button', class: 'boton boton--alternar', 'aria-pressed': String(ampliado) }, t().modo_ampliado);
    boton.addEventListener('click', function () {
      const nuevo = boton.getAttribute('aria-pressed') !== 'true';
      boton.setAttribute('aria-pressed', String(nuevo));
      PE.almacen.guardar('modo', nuevo ? 'ampliado' : 'basico');
      PE.aplicarModo();
    });
    return h('div', { class: 'selector-modo' }, boton, h('span', { class: 'meta-texto' }, t().modo_ayuda));
  }

  function migas(partes) {
    return h('nav', { class: 'migas', 'aria-label': t().migas },
      h('ol', null, partes.map(function (p, i) {
        const ultimo = i === partes.length - 1;
        return h('li', null, ultimo ? h('span', { 'aria-current': 'page' }, p.texto) : h('a', { href: '#' + p.ruta }, p.texto));
      })));
  }

  /* ---------- Portada de la sección ---------- */
  function portada(main, s) {
    main.appendChild(migas([{ ruta: '/', texto: PE.textos('ui').menu[0].texto }, { texto: s.titulo }]));
    main.appendChild(h('h1', null, s.titulo));
    s.intro.forEach(function (p) { main.appendChild(h('p', null, PE.contenido.enLinea(p))); });
    main.appendChild(selectorModo());
    s.modulos.forEach(function (idModulo) {
      const m = modulo(idModulo);
      main.appendChild(h('h2', { id: m.id }, m.titulo));
      main.appendChild(h('p', null, m.objetivo));
      main.appendChild(barraProgreso(PE.progreso.resumen(m.bloques), m.titulo));
      main.appendChild(h('ol', { class: 'lista-bloques' }, m.bloques.map(function (id) {
        const b = bloque(id).bloque;
        return h('li', null,
          h('a', { href: '#' + ruta(id) }, b.numero + ' ' + b.titulo),
          h('span', { class: 'lista-bloques__estado' }, estadoBloque(id)));
      })));
    });
    if (s.pie) main.appendChild(h('div', { class: 'aviso' }, h('p', null, PE.contenido.enLinea(s.pie))));
    return s.titulo;
  }

  /* ---------- Página de bloque ---------- */
  function seccionBloque(titulo, id, contenido, etiqueta) {
    return h('section', { class: 'seccion-bloque', 'aria-labelledby': id },
      h('h2', { id: id }, titulo, etiqueta ? [' ', PE.etiquetas.crear(etiqueta)] : null),
      contenido);
  }

  function filaNorma(idNorma) {
    const conjunto = PE.datos('normas');
    const n = conjunto && conjunto.registros.find(function (r) { return r.id === idNorma; });
    if (!n) throw new Error('Norma desconocida: ' + idNorma);
    const fuente = PE.fuentes.obtener(n.fuente_id);
    const enlaceArticulo = PE.fuentes.comprobada(fuente)
      ? h('a', { href: n.url + (n.ancla ? '#' + n.ancla : ''), rel: 'noopener', target: '_blank', class: 'enlace-externo' },
        t().leer_articulo, PE.icono('externo'), h('span', { class: 'visualmente-oculto' }, ' (se abre en otra pestaña)'))
      : null;
    return h('div', { class: 'dato' },
      PE.etiquetas.crear(n.etiqueta),
      h('div', { class: 'dato__texto' },
        h('p', null, h('strong', null, n.norma + ', ' + n.articulo + '. '), n.valor),
        h('p', { class: 'cita' }, h('q', null, n.cita)),
        h('p', { class: 'meta-texto' }, PE.vistas.reemplazar(t().version_norma, {
          publicacion: u.formatoFecha(n.fecha_publicacion), consulta: u.formatoFecha(n.fecha_consulta)
        }))),
      h('div', { class: 'dato__acciones' }, PE.fuentes.botonVerFuente(n.fuente_id), enlaceArticulo));
  }

  function filaTermino(idTermino) {
    const termino = PE.glosario.obtener(idTermino);
    return h('div', { class: 'dato' },
      PE.etiquetas.crear(termino.disputado ? 'INTERPRETACIÓN ATRIBUIDA' : termino.etiqueta),
      h('div', { class: 'dato__texto' },
        h('p', null, h('strong', null, termino.termino + '. '), termino.definicion),
        h('p', { class: 'meta-texto' }, termino.disputado ? termino.atribucion : termino.articulo)),
      h('div', { class: 'dato__acciones' }, PE.fuentes.botonVerFuente(termino.fuente_id),
        h('a', { href: '#/glosario/' + termino.id }, t().ver_en_glosario)));
  }

  function bancoDe(b) {
    return PE.cuestionario.preguntasDeBloques(b.preguntas_de || [b.id]);
  }

  function zonaCuestionario(b) {
    const banco = bancoDe(b);
    const zona = h('div', { class: 'cuestionario' });
    const contenedor = h('div', { class: 'cuestionario__preguntas' });
    const fallidas = PE.progreso.fallidas(banco.map(function (p) { return p.id; }));
    if (fallidas.length) {
      const repaso = banco.filter(function (p) { return fallidas.indexOf(p.id) !== -1; });
      zona.appendChild(h('div', { class: 'aviso' },
        h('p', null, PE.vistas.reemplazar(t().repasar, { n: fallidas.length })),
        h('p', null, h('button', {
          type: 'button',
          class: 'boton',
          onclick: function () {
            PE.cuestionario.montar(contenedor, { bloque: b.id, banco: repaso, aleatorio: false });
            contenedor.setAttribute('tabindex', '-1');
            contenedor.focus();
          }
        }, t().repasar_boton))));
    }
    zona.appendChild(contenedor);
    PE.cuestionario.montar(contenedor, { bloque: b.id, banco: banco });
    return zona;
  }

  function botonEstudiado(id) {
    const estado = h('span', { class: 'meta-texto', 'aria-live': 'polite' });
    const boton = h('button', { type: 'button', class: 'boton boton--alternar', 'aria-pressed': String(PE.progreso.estaEstudiado(id)) }, t().marcar_estudiado);
    function pintar() {
      const fecha = PE.progreso.cargar().estudiados[id];
      boton.setAttribute('aria-pressed', String(!!fecha));
      estado.textContent = fecha ? PE.vistas.reemplazar(t().estudiado_el, { fecha: u.formatoFecha(fecha) }) : '';
    }
    boton.addEventListener('click', function () {
      PE.progreso.marcarEstudiado(id, boton.getAttribute('aria-pressed') !== 'true');
      pintar();
    });
    pintar();
    return h('div', { class: 'estudiado' }, boton, ' ', estado);
  }

  function navegacionBloques(id) {
    const lista = secuencia();
    const i = lista.findIndex(function (x) { return x.bloque.id === id; });
    const anterior = lista[i - 1];
    const siguiente = lista[i + 1];
    return h('nav', { class: 'anterior-siguiente', 'aria-label': t().navegacion_bloques },
      anterior ? h('a', { href: '#' + ruta(anterior.bloque.id), class: 'anterior-siguiente__enlace' },
        PE.icono('flecha-izq'), h('span', null, h('span', { class: 'meta-texto' }, t().anterior), h('br'), anterior.bloque.titulo)) : h('span'),
      siguiente ? h('a', { href: '#' + ruta(siguiente.bloque.id), class: 'anterior-siguiente__enlace anterior-siguiente__enlace--siguiente' },
        h('span', null, h('span', { class: 'meta-texto' }, t().siguiente), h('br'), siguiente.bloque.titulo), PE.icono('flecha')) : h('span'));
  }

  function paginaBloque(main, id, s) {
    const encontrado = bloque(id);
    if (!encontrado || encontrado.seccion.id !== s.id) return PE.vistas.noEncontrada(main, { ruta: s.ruta + '/' + id });
    const m = encontrado.modulo;
    const b = encontrado.bloque;
    const T = t();
    main.appendChild(migas([
      { ruta: '/', texto: PE.textos('ui').menu[0].texto },
      { ruta: s.ruta, texto: s.titulo },
      { ruta: s.ruta, texto: m.titulo_corto },
      { texto: b.titulo }
    ]));
    const titulo = b.numero + ' ' + b.titulo;
    main.appendChild(h('h1', null, titulo));
    main.appendChild(selectorModo());

    main.appendChild(seccionBloque(T.en_30, 'en-30', h('ul', { class: 'lista resumen-30' }, b.resumen.map(function (l) {
      return h('li', null, PE.contenido.enLinea(l));
    })), 'EXPLICACIÓN DIDÁCTICA'));

    if (b.tipo !== 'repaso') {
      const paso = h('div');
      PE.contenido.renderizar(paso, b.explicacion);
      main.appendChild(seccionBloque(T.paso_a_paso, 'paso-a-paso', paso, 'EXPLICACIÓN DIDÁCTICA'));
      main.appendChild(seccionBloque(T.ejemplo, 'ejemplo', h('p', null, PE.contenido.enLinea(b.ejemplo))));
      main.appendChild(seccionBloque(T.error, 'error-frecuente', h('div', { class: 'aviso aviso--error-frecuente' },
        h('p', { class: 'aviso__titulo' }, b.error.titulo), h('p', null, PE.contenido.enLinea(b.error.texto)))));
      const datos = h('div');
      (b.normas || []).forEach(function (idNorma) { datos.appendChild(filaNorma(idNorma)); });
      (b.terminos || []).forEach(function (idT) { datos.appendChild(filaTermino(idT)); });
      main.appendChild(seccionBloque(T.datos, 'datos-fuentes', datos));
      if (b.ampliado && b.ampliado.length) {
        const extra = h('div');
        PE.contenido.renderizar(extra, b.ampliado);
        main.appendChild(h('div', { class: 'solo-ampliado' }, seccionBloque(T.saber_mas, 'saber-mas', extra)));
      }
    }

    main.appendChild(seccionBloque(T.comprueba, 'comprueba', zonaCuestionario(b)));
    main.appendChild(seccionBloque(T.profundizar, 'profundizar', h('ul', { class: 'lista' }, (b.profundizar || []).map(function (idF) {
      const f = PE.fuentes.obtener(idF);
      if (!f) throw new Error('Fuente desconocida: ' + idF);
      return h('li', null, PE.fuentes.enlace(f));
    }))));
    main.appendChild(botonEstudiado(b.id));
    main.appendChild(navegacionBloques(b.id));
    return titulo;
  }

  /* Vista de una sección: portada sin subruta; página de bloque con ella. */
  function vistaSeccion(idSeccion) {
    return function (main, params) {
      const s = seccion(idSeccion);
      if (params.resto) return paginaBloque(main, params.resto, s);
      return portada(main, s);
    };
  }

  PE.vistas = PE.vistas || {};
  PE.vistas.seccion = vistaSeccion;
  PE.vistas.migas = migas;
  PE.vistas.barraProgreso = barraProgreso;
  PE.modulos = {
    secciones: function () { return config().secciones; },
    bloque: bloque,
    ruta: ruta,
    secuencia: secuencia,
    idsDeModulo: idsDeModulo
  };
})();
