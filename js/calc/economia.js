/* Cálculos didácticos de economía (sección 12.6, vectores T6 a T9).
   Funciones puras; las calculadoras del módulo 5 las usarán tal cual. */
(function () {
  'use strict';

  const PE = window.PE = window.PE || {};
  PE.calc = PE.calc || {};

  /* Variación porcentual entre dos valores: de 100 a 103 es un 3 %. */
  function variacionPorcentual(inicial, final) {
    return (final - inicial) / inicial * 100;
  }

  /* Crecimiento real a partir del nominal y de la subida de precios (en %). */
  function crecimientoReal(nominalPct, preciosPct) {
    return ((1 + nominalPct / 100) / (1 + preciosPct / 100) - 1) * 100;
  }

  /* Diferencia en puntos porcentuales y variación relativa (en %). */
  function puntosYRelativo(inicialPct, finalPct) {
    return { puntos: finalPct - inicialPct, relativo: (finalPct - inicialPct) / inicialPct * 100 };
  }

  /* Impuesto por tramos: cada tipo se aplica solo a la parte de la base que cae en su tramo.
     tramos: [{ hasta: 12000, tipo: 10 }, ..., { hasta: null, tipo: 30 }] en orden creciente. */
  function cuotaPorTramos(base, tramos) {
    let cuota = 0;
    let desde = 0;
    let marginal = 0;
    const desglose = [];
    for (let i = 0; i < tramos.length; i++) {
      const t = tramos[i];
      const tope = t.hasta === null ? Infinity : t.hasta;
      if (base > desde) {
        const parte = Math.min(base, tope) - desde;
        cuota += parte * t.tipo / 100;
        desglose.push({ desde: desde, hasta: t.hasta, tipo: t.tipo, parte: parte, cuota: parte * t.tipo / 100 });
        marginal = t.tipo;
      }
      desde = tope;
    }
    return { cuota: cuota, tipoMedio: base > 0 ? cuota / base * 100 : 0, tipoMarginal: marginal, desglose: desglose };
  }

  function media(valores) {
    return valores.reduce(function (s, v) { return s + v; }, 0) / valores.length;
  }

  function mediana(valores) {
    const v = valores.slice().sort(function (a, b) { return a - b; });
    const m = Math.floor(v.length / 2);
    return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
  }

  /* Deuda y proporción del PIB tras un año. Supuesto del vector T9: el déficit
     es un porcentaje del PIB del año de partida y se financia entero con deuda. */
  function deudaTrasUnAno(p) {
    const deficit = p.pib * p.deficitPctPib / 100;
    const deuda = p.deuda + deficit;
    const pib = p.pib * (1 + p.crecimientoNominalPct / 100);
    return { deuda: deuda, pib: pib, ratio: deuda / pib * 100 };
  }

  PE.calc.economia = {
    variacionPorcentual: variacionPorcentual,
    crecimientoReal: crecimientoReal,
    puntosYRelativo: puntosYRelativo,
    cuotaPorTramos: cuotaPorTramos,
    media: media,
    mediana: mediana,
    deudaTrasUnAno: deudaTrasUnAno
  };
})();
