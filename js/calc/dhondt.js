/* Reparto de escaños por el método D'Hondt con barrera legal.
   Norma: LOREG, art. 163.1 (texto consolidado, última modificación 02-07-2026).
   - Barrera: no entran las candidaturas con menos del 3 % de los votos válidos
     de la circunscripción (163.1.a). Los votos en blanco son válidos (96.5 y
     108.4), así que por defecto entran en la base. Con exactamente el 3 % se entra.
   - Empate de cocientes: el escaño va a la candidatura con más votos totales;
     si también empatan en votos, la ley exige un sorteo (163.1.d). La
     calculadora no sortea: avisa y deja ese escaño sin asignar.
   Los cocientes se comparan multiplicando en cruz, sin dividir. */
(function () {
  'use strict';

  const PE = window.PE = window.PE || {};
  PE.calc = PE.calc || {};

  /* >0 si a/b > c/d (b y d positivos). */
  function compararFracciones(a, b, c, d) {
    return a * d - c * b;
  }

  function comprobarEntero(valor, nombre, minimo) {
    if (!Number.isInteger(valor) || valor < minimo) {
      throw new Error(nombre + ' debe ser un número entero mayor o igual que ' + minimo);
    }
  }

  function mismoCociente(x, y) {
    return compararFracciones(x.votos, x.divisor, y.votos, y.divisor) === 0;
  }

  /*
   opciones = {
     escanos: entero ≥ 1,
     candidaturas: [{ id, votos }],
     blancos: entero ≥ 0 (por defecto 0),
     baseIncluyeBlancos: true por defecto (lectura de la LOREG),
     aplicarBarrera: true por defecto,
     barreraPorcentaje: entero, 3 por defecto
   }
  */
  function repartir(opciones) {
    const escanos = opciones.escanos;
    const blancos = opciones.blancos || 0;
    const candidaturas = opciones.candidaturas || [];
    const baseIncluyeBlancos = opciones.baseIncluyeBlancos !== false;
    const aplicarBarrera = opciones.aplicarBarrera !== false;
    const barrera = opciones.barreraPorcentaje === undefined ? 3 : opciones.barreraPorcentaje;

    comprobarEntero(escanos, 'El número de escaños', 1);
    comprobarEntero(blancos, 'Los votos en blanco', 0);
    comprobarEntero(barrera, 'La barrera', 0);
    const vistos = {};
    candidaturas.forEach(function (c) {
      comprobarEntero(c.votos, 'Los votos de ' + c.id, 0);
      if (vistos[c.id]) throw new Error('Candidatura repetida: ' + c.id);
      vistos[c.id] = true;
    });

    const votosCandidaturas = candidaturas.reduce(function (s, c) { return s + c.votos; }, 0);
    const validos = votosCandidaturas + blancos;
    const base = baseIncluyeBlancos ? validos : votosCandidaturas;

    const admitidas = [];
    const excluidas = [];
    candidaturas.forEach(function (c) {
      if (!aplicarBarrera || c.votos * 100 >= barrera * base) admitidas.push(c);
      else excluidas.push({ id: c.id, votos: c.votos, motivo: 'barrera' });
    });

    const cocientes = [];
    admitidas.forEach(function (c) {
      if (c.votos === 0) return;
      for (let d = 1; d <= escanos; d++) cocientes.push({ id: c.id, votos: c.votos, divisor: d, asignado: false });
    });
    cocientes.sort(function (x, y) {
      const cmp = compararFracciones(y.votos, y.divisor, x.votos, x.divisor);
      if (cmp !== 0) return cmp;
      return y.votos - x.votos; // 163.1.d: a igual cociente, más votos totales
    });

    let sorteo = null;
    let empateResuelto = null;
    if (cocientes.length > escanos) {
      const ultimo = cocientes[escanos - 1];
      const siguiente = cocientes[escanos];
      if (mismoCociente(ultimo, siguiente)) {
        if (ultimo.votos === siguiente.votos) {
          const empatados = cocientes.filter(function (q) { return mismoCociente(q, ultimo) && q.votos === ultimo.votos; });
          const dentro = empatados.filter(function (q) { return cocientes.indexOf(q) < escanos; }).length;
          sorteo = { candidaturas: empatados.map(function (q) { return q.id; }), escanosEnJuego: dentro };
        } else {
          empateResuelto = { ganadora: ultimo.id, frente: siguiente.id };
        }
      }
    }

    const reparto = {};
    candidaturas.forEach(function (c) { reparto[c.id] = 0; });
    let asignados = 0;
    cocientes.forEach(function (q, i) {
      const enSorteo = sorteo && sorteo.candidaturas.indexOf(q.id) !== -1 && mismoCociente(q, cocientes[escanos - 1]);
      if (i < escanos && !enSorteo) {
        q.asignado = true;
        reparto[q.id] += 1;
        asignados += 1;
      }
    });

    const resumen = function (q) { return q ? { id: q.id, divisor: q.divisor, votos: q.votos } : null; };
    return {
      escanos: escanos,
      blancos: blancos,
      votosCandidaturas: votosCandidaturas,
      validos: validos,
      base: base,
      baseIncluyeBlancos: baseIncluyeBlancos,
      aplicarBarrera: aplicarBarrera,
      barreraPorcentaje: barrera,
      barreraVotos: base * barrera / 100,
      admitidas: admitidas.map(function (c) { return c.id; }),
      excluidas: excluidas,
      cocientes: cocientes,
      reparto: reparto,
      escanosAsignados: asignados,
      ultimoAsignado: sorteo ? null : resumen(cocientes[Math.min(escanos, cocientes.length) - 1]),
      primeroSinEscano: sorteo ? null : resumen(cocientes[escanos]),
      empateResuelto: empateResuelto,
      sorteo: sorteo
    };
  }

  /* Propiedad del método: con M escaños y V votos admitidos, toda candidatura
     admitida con más de V/(M+1) votos obtiene al menos un escaño.
     Devuelve la lista de candidaturas que la incumplirían (debe estar vacía). */
  function comprobarGarantia(resultado) {
    const admitidos = resultado.admitidas;
    const votos = {};
    resultado.cocientes.forEach(function (q) { votos[q.id] = q.votos; });
    const total = admitidos.reduce(function (s, id) { return s + (votos[id] || 0); }, 0);
    return admitidos.filter(function (id) {
      return (votos[id] || 0) * (resultado.escanos + 1) > total && resultado.reparto[id] === 0;
    });
  }

  PE.calc.dhondt = { repartir: repartir, comprobarGarantia: comprobarGarantia, compararFracciones: compararFracciones };
})();
