/* «Mi aprendizaje» (sección 17.3): progreso por módulo y global, resultados
   de los cuestionarios con su fecha, preguntas falladas para repasar,
   exportar e importar el progreso en JSON y borrarlo. Todo queda en el
   navegador; no se guarda nada sobre ideología ni opiniones. */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;
  const u = PE.util;

  function descargar(texto) {
    const blob = new Blob([texto], { type: 'application/json' });
    const enlace = h('a', { href: URL.createObjectURL(blob), download: 'mi-progreso-politica-espana.json' });
    document.body.appendChild(enlace);
    enlace.click();
    setTimeout(function () { URL.revokeObjectURL(enlace.href); enlace.remove(); }, 0);
  }

  function vista(main) {
    const T = PE.textos('ui').aprendizaje;
    const modulos = PE.textos('modulos').modulos;
    const todos = [];
    modulos.forEach(function (m) { Array.prototype.push.apply(todos, m.bloques); });

    main.appendChild(h('h1', null, T.titulo));
    main.appendChild(h('p', null, T.intro));
    main.appendChild(h('p', { class: 'meta-texto' }, PE.almacen.persistente ? T.guardado_local : T.guardado_memoria));

    main.appendChild(h('h2', null, T.global));
    main.appendChild(PE.vistas.barraProgreso(PE.progreso.resumen(todos), T.global));
    main.appendChild(h('p', { class: 'meta-texto' }, T.nota_global));

    const datos = PE.progreso.cargar();
    modulos.forEach(function (m) {
      main.appendChild(h('h2', null, m.titulo));
      main.appendChild(PE.vistas.barraProgreso(PE.progreso.resumen(m.bloques), m.titulo));
      main.appendChild(h('div', { class: 'tabla-contenedor', role: 'region', tabindex: '0', 'aria-label': m.titulo },
        h('table', null,
          h('caption', { class: 'visualmente-oculto' }, m.titulo),
          h('thead', null, h('tr', null,
            h('th', { scope: 'col' }, T.bloque), h('th', { scope: 'col' }, T.estudiado), h('th', { scope: 'col' }, T.ultimo_cuestionario), h('th', { scope: 'col' }, T.falladas))),
          h('tbody', null, m.bloques.map(function (id) {
            const b = PE.modulos.bloque(id).bloque;
            const intentos = datos.cuestionarios[id] || [];
            const ultimo = intentos[intentos.length - 1];
            const banco = PE.cuestionario.preguntasDeBloques(b.preguntas_de || [id]).map(function (p) { return p.id; });
            const falladas = PE.progreso.fallidas(banco).length;
            return h('tr', null,
              h('th', { scope: 'row' }, h('a', { href: '#' + PE.modulos.ruta(id) }, b.numero + ' ' + b.titulo)),
              h('td', null, datos.estudiados[id] ? u.formatoFecha(datos.estudiados[id]) : T.no),
              h('td', null, ultimo ? PE.vistas.reemplazar(T.resultado, { aciertos: ultimo.aciertos, total: ultimo.total, fecha: u.formatoFecha(ultimo.fecha) }) : T.sin_cuestionario),
              h('td', null, falladas ? h('a', { href: '#' + PE.modulos.ruta(id) }, PE.vistas.reemplazar(T.repasar, { n: falladas })) : '0'));
          })))));
    });

    main.appendChild(h('h2', null, T.ruta_titulo));
    main.appendChild(h('p', null, PE.contenido.enLinea(T.ruta_texto)));

    main.appendChild(h('h2', null, T.copia_titulo));
    main.appendChild(h('p', null, T.copia_texto));
    const mensaje = h('p', { role: 'status', class: 'meta-texto' });
    const fichero = h('input', { type: 'file', id: 'importar-progreso', accept: 'application/json,.json', class: 'campo-fichero' });
    fichero.addEventListener('change', function () {
      const f = fichero.files && fichero.files[0];
      if (!f) return;
      f.text().then(function (texto) {
        const n = PE.almacen.importar(texto);
        mensaje.textContent = PE.vistas.reemplazar(T.importado, { n: n });
        PE.router.navegar();
      }).catch(function (e) {
        mensaje.textContent = T.error_importar + ' ' + e.message;
      });
    });
    main.appendChild(h('div', { class: 'acciones' },
      h('button', { type: 'button', class: 'boton', onclick: function () { descargar(PE.almacen.exportar()); mensaje.textContent = T.exportado; } }, T.exportar),
      fichero, h('label', { for: 'importar-progreso', class: 'boton boton--fichero' }, T.importar)));
    main.appendChild(mensaje);

    main.appendChild(h('h2', null, T.borrar_titulo));
    const confirmar = h('button', { type: 'button', class: 'boton', hidden: true }, T.borrar_confirmar);
    const borrar = h('button', { type: 'button', class: 'boton' }, T.borrar);
    borrar.addEventListener('click', function () {
      confirmar.hidden = false;
      confirmar.focus();
      mensaje.textContent = T.borrar_aviso;
    });
    confirmar.addEventListener('click', function () {
      PE.progreso.borrarTodo();
      PE.router.navegar();
    });
    main.appendChild(h('p', null, borrar, ' ', confirmar));
    return T.titulo;
  }

  PE.vistas = PE.vistas || {};
  PE.vistas.aprendizaje = vista;
})();
