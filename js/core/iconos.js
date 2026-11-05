/* Iconos propios en SVG (trazos de 24 × 24). Se inyectan una vez como
   «sprite» dentro del documento para que <use> funcione también con file://. */
(function () {
  'use strict';

  const PE = window.PE;

  const TRAZOS = {
    // Etiquetas de fiabilidad (sección 3.1)
    'oficial': 'M3 21h18M5 10v11M9.7 10v11M14.3 10v11M19 10v11M2.5 10 12 4l9.5 6z',
    'estudio': 'M2 5h6.5A3.5 3.5 0 0 1 12 8.5V20a2.5 2.5 0 0 0-2.5-2.5H2zM22 5h-6.5A3.5 3.5 0 0 0 12 8.5V20a2.5 2.5 0 0 1 2.5-2.5H22z',
    'norma': 'M12 3v18M7 21h10M4 7h16M7 7l-3 7a3 3 0 0 0 6 0zM17 7l-3 7a3 3 0 0 0 6 0z',
    'didactica': 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5.9 1.2.9 2.2h5.4c0-1 .3-1.7.9-2.2A6 6 0 0 0 12 3z',
    'simulacion': 'M4 7h9M17 7h3M15 5v4M4 17h3M11 17h9M9 15v4M4 12h14M20 12h0',
    'propuesta': 'M4 5h16v11H10l-5 4v-4H4z',
    'prevision': 'M6 3h12M6 21h12M7 3c0 5 10 5 10 9s-10 4-10 9M17 3c0 5-10 5-10 9s10 4 10 9',
    'interpretacion': 'M10 7H6a2 2 0 0 0-2 2v3h5v5H4M20 7h-4a2 2 0 0 0-2 2v3h5v5h-5',
    'estimacion': 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
    'pendiente': 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9.2a2.6 2.6 0 1 1 3.6 2.4c-.7.3-1.1.9-1.1 1.6v.8M12 17.2v.1',
    // Instituciones (sección 7.4)
    'congreso': 'M4 20h16M6 20v-7M10 20v-7M14 20v-7M18 20v-7M3 13h18M5 13a7 7 0 0 1 14 0M12 3v3',
    'senado': 'M4 20h16M5 20V9M19 20V9M3 9h18M12 4 3 9h18zM9 20v-6h6v6',
    'gobierno': 'M12 3 4 7v5c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V7z',
    'justicia': 'M12 3v18M8 21h8M5 7h14M5 7l-2.5 6a2.5 2.5 0 0 0 5 0zM19 7l-2.5 6a2.5 2.5 0 0 0 5 0z',
    'comunidades': 'M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2zM9 4v14M15 6v14',
    'ayuntamientos': 'M3 21h18M5 21V11l7-5 7 5v10M10 21v-5h4v5M12 6V3',
    'ue': 'M12 4v.1M16 5.1v.1M18.9 8v.1M20 12v.1M18.9 16v.1M16 18.9v.1M12 20v.1M8 18.9v.1M5.1 16v.1M4 12v.1M5.1 8v.1M8 5.1v.1',
    // Interfaz
    'menu': 'M4 6h16M4 12h16M4 18h16',
    'cerrar': 'M6 6l12 12M18 6 6 18',
    'externo': 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
    'fuente': 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6',
    'flecha': 'M5 12h14M13 6l6 6-6 6',
    'flecha-izq': 'M19 12H5M11 6l-6 6 6 6',
    'acierto': 'M5 12.5l4.5 4.5L19 7',
    'fallo': 'M7 7l10 10M17 7 7 17',
    'buscar': 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
    'ciudadania': 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3 2.5-5 5-5s5 2 5 5M11 20c0-3 2.5-5 5-5s5 2 5 5',
    'rey': 'M4 18h16M5 18 4 8l4.5 3L12 5l3.5 6L20 8l-1 10',
    'tc': 'M4 20h16M6 20V10M18 20V10M12 20V10M3 10l9-6 9 6zM9 14h6',
    'mas': 'M12 5v14M5 12h14',
    'urna': 'M4 10h16v10H4zM8 10V4h8v6M10 7h4',
    'calendario': 'M4 6h16v14H4zM4 10h16M8 3v5M16 3v5'
  };

  function inyectar() {
    if (document.getElementById('pe-sprite')) return;
    const ns = 'http://www.w3.org/2000/svg';
    const sprite = document.createElementNS(ns, 'svg');
    sprite.setAttribute('id', 'pe-sprite');
    sprite.setAttribute('aria-hidden', 'true');
    sprite.setAttribute('focusable', 'false');
    sprite.style.display = 'none';
    Object.keys(TRAZOS).forEach(function (nombre) {
      const simbolo = document.createElementNS(ns, 'symbol');
      simbolo.setAttribute('id', 'i-' + nombre);
      simbolo.setAttribute('viewBox', '0 0 24 24');
      const trazo = document.createElementNS(ns, 'path');
      trazo.setAttribute('d', TRAZOS[nombre]);
      simbolo.appendChild(trazo);
      sprite.appendChild(simbolo);
    });
    document.body.insertBefore(sprite, document.body.firstChild);
  }

  /* Devuelve un <svg> decorativo (aria-hidden) que usa el icono indicado. */
  function icono(nombre, clase) {
    if (!TRAZOS[nombre]) throw new Error('Icono desconocido: ' + nombre);
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'icono' + (clase ? ' ' + clase : ''));
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const uso = document.createElementNS(ns, 'use');
    uso.setAttribute('href', '#i-' + nombre);
    svg.appendChild(uso);
    return svg;
  }

  PE.iconos = { inyectar: inyectar, icono: icono, nombres: Object.keys(TRAZOS) };
  PE.icono = icono;
})();
