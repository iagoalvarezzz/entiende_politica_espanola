/* Arranque de la aplicación: cabecera, buscador, menú con progreso, tema,
   modo de lectura, pie y rutas. */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;

  const CLAVE_TEMA = 'tema';
  const TEMAS = { sistema: null, claro: 'light', oscuro: 'dark' };

  function aplicarTema(tema) {
    const valor = TEMAS[tema];
    if (valor) document.documentElement.setAttribute('data-theme', valor);
    else document.documentElement.removeAttribute('data-theme');
  }

  /* Modo de lectura (sección 7.1): básico por defecto; el ampliado muestra «Para saber más». */
  PE.aplicarModo = function () {
    document.documentElement.setAttribute('data-modo', PE.almacen.leer('modo', 'basico') === 'ampliado' ? 'ampliado' : 'basico');
  };

  function montarCabecera(ui) {
    const enlaceSaltar = document.getElementById('saltar');
    enlaceSaltar.textContent = ui.cabecera.saltar;
    enlaceSaltar.addEventListener('click', function (e) {
      e.preventDefault();
      document.getElementById('contenido').focus();
    });

    document.getElementById('marca').textContent = ui.sitio.nombre;

    const boton = document.getElementById('boton-menu');
    boton.appendChild(PE.icono('menu'));
    boton.appendChild(h('span', null, ui.cabecera.menu));
    const menu = document.getElementById('menu-principal');
    menu.setAttribute('aria-label', ui.cabecera.menu_aria);
    boton.addEventListener('click', function () {
      const abierto = boton.getAttribute('aria-expanded') === 'true';
      boton.setAttribute('aria-expanded', String(!abierto));
      menu.classList.toggle('abierto', !abierto);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && boton.getAttribute('aria-expanded') === 'true') {
        cerrarMenu();
        boton.focus();
      }
    });

    const buscador = document.getElementById('buscador');
    const campo = document.getElementById('campo-buscador');
    document.getElementById('etiqueta-buscador').textContent = ui.buscador.etiqueta;
    const enviar = document.getElementById('boton-buscador');
    enviar.appendChild(PE.icono('buscar'));
    enviar.appendChild(h('span', { class: 'visualmente-oculto' }, ui.buscador.boton));
    buscador.addEventListener('submit', function (e) {
      e.preventDefault();
      const q = campo.value.trim();
      if (q) window.location.hash = '#/buscar/' + encodeURIComponent(q);
    });

    const tema = PE.almacen.leer(CLAVE_TEMA, 'sistema');
    const selector = document.getElementById('selector-tema');
    document.getElementById('etiqueta-tema').textContent = ui.cabecera.tema;
    [['sistema', ui.cabecera.tema_sistema], ['claro', ui.cabecera.tema_claro], ['oscuro', ui.cabecera.tema_oscuro]]
      .forEach(function (op) { selector.appendChild(h('option', { value: op[0] }, op[1])); });
    selector.value = Object.prototype.hasOwnProperty.call(TEMAS, tema) ? tema : 'sistema';
    aplicarTema(selector.value);
    selector.addEventListener('change', function () {
      aplicarTema(selector.value);
      PE.almacen.guardar(CLAVE_TEMA, selector.value);
    });
  }

  function cerrarMenu() {
    document.getElementById('boton-menu').setAttribute('aria-expanded', 'false');
    document.getElementById('menu-principal').classList.remove('abierto');
  }

  /* Bloques cuyo progreso se muestra en cada entrada del menú. */
  function bloquesDeEntrada(entrada) {
    if (!entrada.modulos) return null;
    const lista = [];
    entrada.modulos.forEach(function (id) { Array.prototype.push.apply(lista, PE.modulos.idsDeModulo(id)); });
    return lista;
  }

  function montarMenu(ui) {
    const lista = document.getElementById('lista-menu');
    lista.textContent = '';
    ui.menu.forEach(function (entrada) {
      const bloques = bloquesDeEntrada(entrada);
      let detalle = null;
      if (bloques) {
        const r = PE.progreso.resumen(bloques);
        detalle = h('span', { class: 'menu__hito' }, PE.vistas.reemplazar(ui.menu_progreso, { porcentaje: r.porcentaje }));
      } else if (entrada.hito) {
        detalle = h('span', { class: 'menu__hito' }, ui.menu_hito_prefijo + ' ' + entrada.hito);
      }
      lista.appendChild(h('li', null,
        h('a', { href: '#' + entrada.ruta, 'data-ruta': entrada.ruta }, h('span', null, entrada.texto), detalle)));
    });
    if (PE.router.rutaActual()) marcarMenu(PE.router.rutaActual());
  }

  function marcarMenu(ruta) {
    const enlaces = document.querySelectorAll('#lista-menu a');
    Array.prototype.forEach.call(enlaces, function (a) {
      const r = a.getAttribute('data-ruta');
      const activo = r === '/' ? ruta === '/' : (ruta === r || ruta.indexOf(r + '/') === 0);
      if (activo) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function montarPie(ui) {
    const indice = PE.datos('_indice');
    const pie = document.getElementById('pie');
    pie.appendChild(h('ul', { class: 'pie__enlaces' },
      h('li', null, h('a', { href: '#/metodologia' }, ui.pie.metodologia)),
      h('li', null, h('a', { href: '#/licencias' }, ui.pie.licencias)),
      h('li', null, h('a', { href: '#/leyenda' }, ui.pie.leyenda)),
      h('li', null, h('a', { href: '#/metodologia/errores' }, ui.pie.errores)),
      h('li', null, ui.contacto.etiqueta + ' ', PE.contenido.correo())));
    pie.appendChild(h('p', null, ui.sitio.aviso_independiente));
    if (indice) pie.appendChild(h('p', null, PE.vistas.reemplazar(ui.pie.actualizado, { fecha: PE.util.formatoFecha(indice.actualizado) })));
    pie.appendChild(h('p', { class: 'meta-texto' }, PE.vistas.reemplazar(ui.pie.version, { version: PE.version })));
  }

  function registrarRutas(ui) {
    const v = PE.vistas;
    const router = PE.router;
    router.registrar({ ruta: '/', vista: v.inicio });
    PE.modulos.secciones().forEach(function (s) {
      router.registrar({ ruta: s.ruta, vista: v.seccion(s.id), subrutas: true });
    });
    router.registrar({ ruta: '/glosario', vista: v.glosario, subrutas: true });
    router.registrar({ ruta: '/buscar', vista: v.buscar, subrutas: true, enfocarResto: false });
    router.registrar({ ruta: '/aprendizaje', vista: v.aprendizaje });
    router.registrar({ ruta: '/fuentes', vista: v.fuentes, subrutas: true });
    router.registrar({ ruta: '/metodologia', vista: v.paginaDeContenido('metodologia'), subrutas: true });
    router.registrar({ ruta: '/licencias', vista: v.paginaDeContenido('licencias') });
    router.registrar({ ruta: '/leyenda', vista: v.leyenda });
    PE.textos('pendientes').rutas.forEach(function (p) {
      router.registrar({ ruta: p.ruta, vista: v.pendiente(p.ruta) });
    });
    router.registrar({ ruta: '*', vista: v.noEncontrada });
    router.alNavegar(function (ruta) {
      marcarMenu(ruta);
      cerrarMenu();
      if (PE.modoPrueba) document.body.setAttribute('data-pe-errores', String(PE.errores.length));
    });
    PE.progreso.alCambiar(function () { montarMenu(ui); });
  }

  function iniciar() {
    const ui = PE.textos('ui');
    PE.iconos.inyectar();
    PE.aplicarModo();
    montarCabecera(ui);
    montarMenu(ui);
    montarPie(ui);
    registrarRutas(ui);
    PE.router.iniciar();
    PE.listo = true;
  }

  iniciar();
})();
