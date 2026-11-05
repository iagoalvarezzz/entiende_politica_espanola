/* Presenta los textos de content/es/*.json. Los bloques son datos, no HTML:
   el texto se inserta como nodos de texto. En línea se admiten
   **negrita**, [texto](#/ruta) solo hacia rutas internas y {{id|texto}} para
   un término del glosario. Los enlaces externos van siempre por
   data/sources.json (regla 3.4). Un bloque con "nivel": "ampliado" solo se ve
   en el modo ampliado (sección 7.1). */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;

  const PATRON = /\*\*([^*]+)\*\*|\[([^\]]+)\]\((#\/[^)\s]*)\)|\{\{([a-z0-9-]+)\|([^}]+)\}\}/g;

  function enLinea(texto) {
    const fragmento = document.createDocumentFragment();
    let ultimo = 0;
    let m;
    PATRON.lastIndex = 0;
    while ((m = PATRON.exec(texto)) !== null) {
      if (m.index > ultimo) fragmento.appendChild(document.createTextNode(texto.slice(ultimo, m.index)));
      if (m[1] !== undefined) fragmento.appendChild(h('strong', null, m[1]));
      else if (m[3] !== undefined) fragmento.appendChild(h('a', { href: m[3] }, m[2]));
      else fragmento.appendChild(PE.glosario.enTexto(m[4], m[5]));
      ultimo = PATRON.lastIndex;
    }
    if (ultimo < texto.length) fragmento.appendChild(document.createTextNode(texto.slice(ultimo)));
    return fragmento;
  }

  function correo() {
    const direccion = PE.textos('ui').contacto.correo;
    return h('a', { href: 'mailto:' + direccion, class: 'correo-contacto__enlace' }, direccion);
  }

  /* El repositorio es una fuente más (data/sources.json → repositorio-proyecto):
     el enlace solo se activa si lo ha confirmado el comprobador (regla 3.4). */
  function repositorio() {
    return PE.fuentes.enlace(PE.fuentes.obtener('repositorio-proyecto'));
  }

  function bloque(b) {
    let el;
    switch (b.tipo) {
      case 'h2': el = h('h2', { id: b.id || null }, b.texto); break;
      case 'h3': el = h('h3', { id: b.id || null }, b.texto); break;
      case 'p':
        el = h('p', null, b.etiqueta ? [PE.etiquetas.crear(b.etiqueta), ' '] : null, enLinea(b.texto));
        break;
      case 'lista':
        el = h(b.ordenada ? 'ol' : 'ul', { class: 'lista' }, b.items.map(function (i) { return h('li', null, enLinea(i)); }));
        break;
      case 'aviso':
        el = h('div', { class: 'aviso aviso--' + (b.variante || 'info'), role: b.variante === 'importante' ? 'note' : null },
          b.titulo ? h('p', { class: 'aviso__titulo' }, b.titulo) : null,
          h('p', null, b.etiqueta ? [PE.etiquetas.crear(b.etiqueta), ' '] : null, enLinea(b.texto)));
        break;
      case 'definiciones':
        el = h('dl', { class: 'definiciones' }, b.items.map(function (i) {
          return [h('dt', null, i.termino), h('dd', null, enLinea(i.definicion))];
        }));
        break;
      case 'esquema':
        el = PE.esquemas.renderizar(b.esquema);
        break;
      case 'correo':
        /* Correo de contacto de la web (content/es/ui.json → contacto.correo). No es
           una fuente: es el canal para comunicar errores y quejas. */
        el = h('p', { class: 'correo-contacto' }, b.texto ? b.texto + ' ' : null, correo());
        break;
      case 'repositorio':
        /* Repositorio del proyecto, canal secundario para comunicar errores. */
        el = h('p', { class: 'correo-contacto' }, b.texto ? b.texto + ' ' : null, repositorio());
        break;
      default:
        throw new Error('Tipo de bloque desconocido: ' + b.tipo);
    }
    if (b.nivel === 'ampliado') {
      return h('div', { class: 'solo-ampliado' }, el);
    }
    return el;
  }

  function renderizar(contenedor, bloques) {
    bloques.forEach(function (b) { contenedor.appendChild(bloque(b)); });
  }

  PE.contenido = { enLinea: enLinea, bloque: bloque, renderizar: renderizar, correo: correo };
})();
