/* Rutas con hash (#/estado) que funcionan sin servidor. Al navegar cambia el
   título de la página, el foco pasa al encabezado principal y se marca la
   entrada activa del menú. Los hash que no empiezan por «#/» no son rutas. */
(function () {
  'use strict';

  const PE = window.PE;
  const rutas = [];
  const oyentes = [];
  let actual = null;
  let primeraVez = true;

  /* def: { ruta: '/fuentes', vista: function (contenedor, params) -> título, subrutas: bool } */
  function registrar(def) {
    rutas.push(def);
  }

  function resolver(ruta) {
    for (let i = 0; i < rutas.length; i++) {
      const def = rutas[i];
      if (def.ruta === ruta) return { def: def, params: {} };
      if (def.subrutas && ruta.indexOf(def.ruta + '/') === 0) {
        return { def: def, params: { resto: decodeURIComponent(ruta.slice(def.ruta.length + 1)) } };
      }
    }
    return { def: rutas.find(function (d) { return d.ruta === '*'; }), params: { ruta: ruta } };
  }

  function rutaDelHash() {
    const hash = window.location.hash;
    if (!hash || hash === '#') return '/';
    if (hash.indexOf('#/') !== 0) return null;
    return hash.slice(1).replace(/\/+$/, '') || '/';
  }

  function navegar() {
    const ruta = rutaDelHash();
    if (ruta === null) return;
    const r = resolver(ruta);
    const main = document.getElementById('contenido');
    main.textContent = '';
    if (PE.glosario) PE.glosario.reiniciarPagina();
    const titulo = r.def.vista(main, r.params);
    const sitio = PE.textos('ui').sitio.nombre;
    document.title = titulo === sitio ? sitio : titulo + ' · ' + sitio;
    main.setAttribute('data-ruta', ruta);
    actual = ruta;

    let destino = null;
    if (r.params.resto && r.def.enfocarResto !== false) {
      destino = document.getElementById(r.params.resto) ||
        document.getElementById('fuente-' + r.params.resto) ||
        document.getElementById('termino-' + r.params.resto);
    }
    if (!destino && !primeraVez) destino = main.querySelector('h1');
    if (destino) {
      if (!destino.hasAttribute('tabindex')) destino.setAttribute('tabindex', '-1');
      destino.focus({ preventScroll: true });
      destino.scrollIntoView({ block: 'start' });
    } else {
      window.scrollTo(0, 0);
    }
    primeraVez = false;
    oyentes.forEach(function (fn) { fn(ruta, r.def); });
  }

  function alNavegar(fn) {
    oyentes.push(fn);
  }

  function iniciar() {
    window.addEventListener('hashchange', navegar);
    navegar();
  }

  PE.router = {
    registrar: registrar,
    iniciar: iniciar,
    alNavegar: alNavegar,
    navegar: navegar,
    rutaActual: function () { return actual; }
  };
})();
