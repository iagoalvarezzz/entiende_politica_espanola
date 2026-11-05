/* Umbrales de mayoría para una cámara de «total» miembros (Anexo C.2.7).
   Se calculan con enteros: mayoría absoluta = mitad + 1 (176 de 350);
   tres quintos, dos tercios y una décima parte, redondeados hacia arriba. */
(function () {
  'use strict';

  const PE = window.PE = window.PE || {};
  PE.calc = PE.calc || {};

  function techo(numerador, denominador) {
    return Math.floor((numerador + denominador - 1) / denominador);
  }

  function umbrales(total) {
    if (!Number.isInteger(total) || total < 1) throw new Error('El total debe ser un entero positivo');
    return {
      absoluta: Math.floor(total / 2) + 1,
      tresQuintos: techo(3 * total, 5),
      dosTercios: techo(2 * total, 3),
      decima: techo(total, 10)
    };
  }

  /* Mayoría simple: más votos a favor que en contra; las abstenciones no cuentan como votos en contra. */
  function evaluar(votacion) {
    const u = umbrales(votacion.total);
    return {
      absoluta: votacion.favor >= u.absoluta,
      simple: votacion.favor > votacion.contra,
      faltanParaAbsoluta: Math.max(0, u.absoluta - votacion.favor)
    };
  }

  PE.calc.mayorias = { umbrales: umbrales, evaluar: evaluar };
})();
