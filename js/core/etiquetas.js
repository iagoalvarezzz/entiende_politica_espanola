/* Las diez etiquetas de fiabilidad (sección 3.1). Cada una tiene texto,
   icono y estilo fijos en toda la web; el color nunca es la única señal.
   Los textos canónicos coinciden con los valores del campo «etiqueta» de los datos. */
(function () {
  'use strict';

  const PE = window.PE;
  const h = PE.h;

  const ETIQUETAS = [
    { id: 'oficial', texto: 'DATO OFICIAL' },
    { id: 'estudio', texto: 'DATO DE ESTUDIO' },
    { id: 'norma', texto: 'NORMA VIGENTE' },
    { id: 'didactica', texto: 'EXPLICACIÓN DIDÁCTICA' },
    { id: 'simulacion', texto: 'SIMULACIÓN' },
    { id: 'propuesta', texto: 'PROPUESTA' },
    { id: 'prevision', texto: 'PREVISIÓN' },
    { id: 'interpretacion', texto: 'INTERPRETACIÓN ATRIBUIDA' },
    { id: 'estimacion', texto: 'ESTIMACIÓN DEL AUTOR' },
    { id: 'pendiente', texto: 'PENDIENTE DE VERIFICAR' }
  ];

  const porTexto = {};
  ETIQUETAS.forEach(function (e) { porTexto[e.texto] = e; });

  function definicion(texto) {
    const e = porTexto[texto];
    if (!e) throw new Error('Etiqueta desconocida: ' + texto);
    return e;
  }

  /* Devuelve la etiqueta visible: icono decorativo + texto. */
  function crear(texto) {
    const e = definicion(texto);
    return h('span', { class: 'etiqueta etiqueta--' + e.id, 'data-etiqueta': e.id },
      PE.icono(e.id), h('span', { class: 'etiqueta__texto' }, e.texto));
  }

  /* Etiqueta que corresponde al estado de un dato o de un hito. */
  function segunEstado(estado, etiquetaVerificada) {
    if (estado === 'verificado') return etiquetaVerificada || 'DATO OFICIAL';
    if (estado === 'ejemplo') return 'SIMULACIÓN';
    return 'PENDIENTE DE VERIFICAR';
  }

  PE.etiquetas = { lista: ETIQUETAS, definicion: definicion, crear: crear, segunEstado: segunEstado };
})();
