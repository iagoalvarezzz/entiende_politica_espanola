/* Fuentes: consulta de data/sources.json y presentación de enlaces.
   Regla 3.4: un enlace solo se presenta como comprobado si lo ha confirmado
   tools/check_links.py; si no, se muestra la institución, el título, la raíz
   de su web y la etiqueta PENDIENTE DE VERIFICAR. */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;

  function todas() {
    const conjunto = PE.datos('sources');
    return conjunto ? conjunto.registros : [];
  }

  function obtener(id) {
    return todas().find(function (f) { return f.id === id; }) || null;
  }

  function comprobada(fuente) {
    return !!fuente && fuente.estado_enlace === 'abierta' && fuente.comprobado_por === 'check_links';
  }

  function raiz(url) {
    try {
      const u = new URL(url);
      return u.host.replace(/^www\./, '');
    } catch (e) {
      return url;
    }
  }

  /* Describe el estado del enlace en una frase. */
  function describirEstado(fuente) {
    const t = PE.textos('ui').fuentes;
    const fecha = PE.util.formatoFecha(fuente.fecha_comprobacion);
    if (comprobada(fuente)) return t.estado_comprobada.replace('{fecha}', fecha);
    if (fuente.comprobado_por === 'navegador') return t.estado_navegador.replace('{fecha}', fecha);
    if (fuente.estado_enlace === 'abierta') return t.estado_anexo_abierta;
    if (fuente.estado_enlace === 'raiz_sin_verificar') return t.estado_raiz;
    return t.estado_no_verificada;
  }

  /* Enlace a la fuente si está comprobado; si no, texto con la raíz y la etiqueta. */
  function enlace(fuente) {
    if (comprobada(fuente)) {
      return h('a', { href: fuente.url, rel: 'noopener', target: '_blank', class: 'enlace-externo' },
        fuente.titulo, PE.icono('externo'), h('span', { class: 'visualmente-oculto' }, ' (se abre en otra pestaña)'));
    }
    return h('span', { class: 'enlace-pendiente' },
      h('span', null, fuente.institucion + ': ' + fuente.titulo + '. '),
      h('span', null, PE.textos('ui').fuentes.raiz + ' ', h('code', null, raiz(fuente.url)), ' '),
      PE.etiquetas.crear('PENDIENTE DE VERIFICAR'));
  }

  /* Enlace interno «Ver fuente» hacia la ficha de la fuente. */
  function botonVerFuente(id) {
    const fuente = obtener(id);
    const texto = PE.textos('ui').fuentes.ver_fuente;
    return h('a', { class: 'ver-fuente', href: '#/fuentes/' + id, 'aria-label': texto + ': ' + (fuente ? fuente.titulo : id) },
      PE.icono('fuente'), h('span', null, texto));
  }

  PE.fuentes = {
    todas: todas,
    obtener: obtener,
    comprobada: comprobada,
    raiz: raiz,
    describirEstado: describirEstado,
    enlace: enlace,
    botonVerFuente: botonVerFuente
  };
})();
