/* Cálculos didácticos de encuestas y evaluación (secciones 15.4 y 15.6, vector T10). */
(function () {
  'use strict';

  const PE = window.PE = window.PE || {};
  PE.calc = PE.calc || {};

  /* Margen de error en puntos porcentuales, solo por muestreo aleatorio simple:
     z · √(p(1 − p) / n) · 100. Los diseños reales de muestra lo modifican. */
  function margenError(p, n, z) {
    const factor = z === undefined ? 1.96 : z;
    return factor * Math.sqrt(p * (1 - p) / n) * 100;
  }

  /* Diferencia entre diferencias: cambio en A menos cambio en B (grupo de comparación).
     Solo es atribuible a la medida si, sin ella, A habría evolucionado como B. */
  function difEnDif(aAntes, aDespues, bAntes, bDespues) {
    return (aDespues - aAntes) - (bDespues - bAntes);
  }

  PE.calc.encuestas = { margenError: margenError, difEnDif: difEnDif };
})();
