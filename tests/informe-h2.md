# Informe de verificación — Hito H2

Fecha: 30-10-2026. Versión 0.3.0.

> **Actualización del 30-10-2026: calendario de la JEC.** Con tu permiso, descargué `eg2026_calendario.pdf` de juntaelectoralcentral.es.
> - Fichero: 1.483.376 bytes, modificado en el servidor el 29-10-2026; está en una carpeta propia del scratchpad, fuera del proyecto. Lo leí completo (9 páginas).
> - **Las 4 fechas pendientes quedan verificadas:**
>   - presentación de candidaturas, del 21 al 26-10;
>   - proclamación, el 2-11;
>   - publicación de las proclamadas, el 3-11;
>   - prohibición de sondeos, del 24 al 28-11.
> - **Ya no queda ninguna fecha pendiente: los 20 hitos están verificados.**
> - Otros cinco hitos pasan a citar el calendario de la JEC: voto por correo (dos hitos), voto desde el extranjero (dos hitos) y escrutinio general.
> - Contradicciones y decisiones afectadas: ver los puntos 7.2, 7.7 y 8.1.
Marcas: **Hecho** (comprobado en esta sesión), **Inferencia** (deducido de lo comprobado), **Supuesto** (adoptado sin comprobar); confianza Alta, Media o Baja.

## 1. Capacidades usadas y lo que no se pudo hacer

| Capacidad | Uso en H2 | Límite |
|---|---|---|
| Navegación web | Navegador integrado (30-10-2026):<br>• tres notas de La Moncloa sobre el 29-N y la guía de las europeas de 2024;<br>• página de la JEC sobre las generales de 2026;<br>• sumario del BOE de 28-10-2026;<br>• artículos de la LOREG y de la Constitución en el BOE consolidado.<br>`check_links.py`: 3 peticiones. | No he abierto las webs que bloquean el acceso automatizado. |
| Ejecución de código | Python 3 (solo biblioteca estándar) y Chrome sin interfaz. | No hay axe ni Lighthouse. |
| Sistema de archivos | Ficheros nuevos y modificados del proyecto. | — |
| Descargas | Una, con tu permiso: `eg2026_calendario.pdf` (JEC, 1.483.376 bytes), guardado en una carpeta propia del scratchpad. | — |

## 2. Qué se ha construido

- **Sección «Elecciones generales»** (`#/elecciones`), con el módulo 3 en 11 bloques (3.1 a 3.11). Cada bloque sigue la plantilla 7.2 y cumple la sección 10 del encargo:
  - cierra el bloque 3.1 con la frase pedida;
  - muestra en pantalla la lectura de la barrera;
  - no da cifras de votos por escaño sin la población oficial;
  - no da fechas futuras de otras elecciones.
- **Herramientas nuevas** en `js/vistas/`:
  - `calculadora.js`: calculadora D'Hondt.
    - Usa candidaturas ficticias editables, una fila para los blancos y escaños editables.
    - Muestra el cuadro de cocientes como el ejemplo del art. 163, el orden de cocientes, el último cociente con escaño y el primero sin él.
    - Indica las excluidas con su motivo, el porcentaje de votos frente al de escaños, los avisos de empate y sorteo, y la propiedad 1/(M+1).
    - Incluye cuatro ejercicios guiados.
  - `mapa.js`: cartograma de casillas diseñado para esta web (lo dice en pantalla), vista por escaños y tabla buscable con el filtro de cambios frente a 2023.
  - `calendario.js`: hitos con etiqueta, fuente y nota. Los días que faltan se calculan con la fecha del dispositivo, nunca a mano.
  - `senado.js`: suma de los senadores elegidos, calculada desde los datos, y papeleta de práctica con el máximo de marcas de cada circunscripción.
  - `mayorias.js`: simulador de investidura con cinco bloques ficticios.
- **Generalización**: `content/es/modulos.json` define `secciones`. Las rutas, las migas, el menú, el buscador y «Mi aprendizaje» usan la ruta de cada bloque.
- **Datos**:
  - 32 artículos nuevos en `normas` (119 en total).
  - 27 términos electorales (96 en total).
  - 40 preguntas del módulo 3 (101 en total): 4 por bloque y un repaso con todas.
  - Censo del 29-N en `convocatorias`.
  - 3 fuentes nuevas.
  - El esquema `convocatoria` amplía `censo` con `primera_vez`, `fuente_id` y `fecha_consulta`.

## 3. Pruebas ejecutadas (salida real en `tests/ultima-ejecucion.txt`)

`python tools/run_tests.py` → **238 de 238 superadas, 0 fallos** (Hecho, Alta).

| Bloque | Pruebas | Resultado |
|---|---|---|
| Ficheros generados, validación de `data/` y casos del validador | 1 + 6 + 21 | OK |
| T1: integridad de tablas | 10 | OK |
| Diseño: contraste (mínimo 4,62 en claro y 4,18 en oscuro, par no textual), tema, etiquetas y textos | 6 | OK |
| Referencias | 11 | OK. Nuevas en H2:<br>• cada módulo está en una sola sección, con su entrada de menú;<br>• el mapa tiene 52 casillas, sin solaparse, que coinciden con las circunscripciones de 2026 y 2023;<br>• la suma del Senado cubre todas las circunscripciones y da 209;<br>• cada uno de los 20 hitos tiene fuente y nota. |
| Unitarias: D'Hondt (T2 a T5), umbrales, empates, economía y encuestas (T6 a T10), utilidades | 21 | OK |
| Glosario: 15 búsquedas, búsqueda sin resultados y distancia de edición | 17 | OK. Nuevas: «umbral electoral», «escrutino» (con errata) y «VOTO EN BLANCO». |
| Progreso y cuestionarios | 6 | OK. Cada bloque de los módulos 1 a 3 da de 4 a 6 preguntas. |
| H2 | 3 | OK:<br>• los cuatro ejercicios de la calculadora dan el reparto que dice su texto (T3, T4 con y sin barrera, T5, y 3 frente a 10 escaños);<br>• días que faltan, en curso y pasados;<br>• el ejemplo inicial del simulador. |
| Humo: 49 rutas + controles, a 1280 y 375 px | 100 | OK. Incluye las 11 páginas del módulo 3 y un bloque pedido en la sección equivocada. |
| Interacciones, a 1280 y 375 px | 34 | OK. Las cinco nuevas:<br>• calculadora: ejemplo de la LOREG, ejercicio, edición de votos, comparación sin blancos y aviso de error;<br>• mapa: casillas, detalle de Madrid, cambios, vista por escaños, búsqueda sin tilde, filtro y totales 350/350/209;<br>• Senado: 209 y papeleta en blanco, válida y nula, también en Ibiza;<br>• calendario: etiquetas, fuentes, pendientes, votación y censo;<br>• simulador: segunda votación, sin investidura y suma distinta de 350. |
| Apertura con `file://` | 2 | OK |

**Fallos encontrados y corregidos durante el hito (Hecho, Alta)**

- **Desbordamiento de la calculadora a 375 px.**
  - Qué pasaba: los textos ocultos para lectores de pantalla tenían posición absoluta y escapaban del contenedor con desplazamiento.
  - Solución: `.tabla-contenedor { position: relative }`.
  - Quién lo detectó: la prueba de humo.
- **Calendario sin la función de plantillas en el arnés de pruebas.**
  - Solución: `tests/run.html` carga `paginas.js`.
- **Progreso del menú de «El Estado».**
  - Qué pasaba: la prueba contaba todos los bloques de la web y no solo los de la sección.
  - Solución: corregida la prueba.

**Revisión visual en el navegador integrado (Hecho, Alta)**

- Páginas revisadas:
  - mapa, calculadora, calendario y papeleta a 360 px en claro;
  - las mismas a 800 px en oscuro.
- Cambios que salieron de la revisión:
  - el cartograma encaja en 360 px sin desplazamiento;
  - la tabla de resultados de la calculadora se apila en fichas en móvil, con roles de tabla explícitos;
  - las cifras enteras ya no llevan «,00».

**No probado**

- axe o Lighthouse.
- Lector de pantalla.
- Firefox y Safari.
- Móvil físico.
- Un empate exacto con sorteo desde la interfaz: está probado en la función de cálculo, no en pantalla.

## 4. Datos cargados

| Conjunto | Fuente | Periodo | Estado | Consulta |
|---|---|---|---|---|
| 32 artículos (LOREG y Constitución) | BOE consolidado: LOREG del 02-07-2026 y Constitución del 20-05-2026 | vigente | verificado, NORMA VIGENTE | 30-10-2026 |
| Censo: 38.728.356 electores (35.958.711 en España y 2.769.645 en el extranjero), 1.615.127 que votan por primera vez, cierre a 01-08-2026 | Guía de La Moncloa del 20-10-2026 (cita al INE) | 29-N | verificado, DATO OFICIAL | 30-10-2026 |
| Calendario del 29-N, 20 hitos verificados | Real Decreto 806/2026; calendario de la JEC (PDF); notas de La Moncloa del 20-10-2026; BOE de 28-10-2026 | 29-N | verificado | 29 y 30-10-2026 |
| Europeas de 2024: 61 de 720 eurodiputados en España | Guía de La Moncloa del 16-04-2024 | 2024 | verificado (texto del bloque) | 30-10-2026 |
| Ejercicios, papeleta y simulador | Datos ficticios | — | ejemplo, SIMULACIÓN | — |

Los escaños de 2026 y 2023 y los senadores son los de H0 (DATO OFICIAL, verificados el 29-10-2026).

## 5. Enlaces

Total: 81 fuentes.

- **54 confirmadas** por `check_links.py`: las 51 anteriores y las 3 nuevas (dos notas de La Moncloa y el BOE de candidaturas, 30-10-2026).
- **26 no verificadas**, sin cambios desde H1:
  - 15 del Diccionario y 7 webs con HTTP 403;
  - 4 con respuesta 200 pero sin el texto esperado.
- **1 sin evaluar**: boe-api.

## 6. Tabla de simetría

No aplica en H2: no hay fichas de partidos ni de medios. Todas las herramientas usan candidaturas, formaciones o bloques ficticios. La web no muestra composición, encuestas ni proyecciones de escaños.

## 7. Contradicciones y novedades

1. **Ibiza y Formentera en la nulidad del Senado** (pendiente desde H0).
   - La guía de La Moncloa del 29-N sigue escribiendo «Ibiza-Formentera».
   - La LOREG (arts. 96.3 y 166.1.a) y el Real Decreto 806/2026 (art. 3.2) las separan.
   - Prevalece la ley. El bloque 3.3 lo explica en el modo ampliado (Hecho, Alta).
2. **Voto por correo (Anexo A.3).** Resuelto con el calendario de la JEC.
   - El calendario confirma las fechas del anexo: envío de la documentación del 9 al 22 de noviembre y remisión del voto del 10 al 25.
   - La nota de La Moncloa solo da «a partir del 9» y el 25 como último día.
   - Qué muestra ahora la web: las fechas de la JEC (Hecho, Alta).
3. **Real decreto-ley en el Anexo A.6.** La fila del A.6 (línea 1457, en estado Memoria) sigue diciendo «rige desde su publicación en el BOE salvo que diga otra cosa». La sección 8.8 ya se corrigió con tu aprobación.
4. **Europeas (Anexo A.7).**
   - El anexo pedía verificar que no hay barrera legal. Verificado: el art. 216 de la LOREG aplica el 163 sin su apartado 1.a (Hecho, Alta).
   - La guía de La Moncloa confirma 61 eurodiputados de 720 en 2024.
   - «La siguiente es en 2029» sigue siendo Memoria. La web no da la fecha de las próximas europeas.
5. **Municipales (Anexo A.7).** «Cuarto domingo de mayo» no está verificado (LOREG, art. 42.3, sin leer), así que la web no lo dice. Sí están verificados la barrera del 5 % (art. 180), la elección del alcalde (art. 196) y la escala de concejales (art. 179).
6. **Escrutinio general.** El art. 103.1 de la LOREG, en la redacción de la Ley Orgánica 12/2022, fija el inicio «el quinto día siguiente al de la votación»: el 4 de diciembre. Coincide con La Moncloa y con el calendario de la JEC, que da del 4 al 7 de diciembre (Hecho, Alta).
7. **Voto por correo desde el extranjero (residentes, CERA).**
   - El calendario de la JEC da del 6 de octubre al 24 de noviembre (LOREG, art. 75.10).
   - La nota de La Moncloa del 20-10-2026 da del 3 al 24 de noviembre.
   - Las dos coinciden en el último día. Las papeletas se envían del 4 al 8 de noviembre, y del 6 al 14 si hay recursos.
   - Qué muestra la web: las fechas de la JEC, que es la Administración Electoral, con la diferencia indicada en la nota del hito (Hecho, Alta).

## 8. Decisiones que necesito

1. ~~**Calendario de la JEC (PDF).**~~ Resuelto el 30-10-2026: lo descargué con tu permiso y las 4 fechas quedaron verificadas.
2. **Composición del Congreso y del Senado en la disolución.** El encargo permite mostrarla con datos de congreso.es y senado.es y su fecha; la web no la muestra todavía. ¿La cargo, indicando que es la del 6-10-2026, o la dejas fuera mientras dure la campaña?
3. **Población oficial por provincia (INE).** Sin ella, la web no da votos ni habitantes por escaño. ¿La cargo? Puede requerir descargar una tabla del INE: te pediría permiso antes, con el nombre y el tamaño del fichero.
4. **`PROMPT.md`.** ¿Actualizo las filas que ya están verificadas? Son estas:
   - A.6 (real decreto-ley);
   - A.7 (europeas sin barrera y 61 escaños; barrera del 5 % y alcalde en las municipales);
   - A.3 (voto por correo).
5. **Pendientes de H1 y H0:**
   - fuentes académicas de ideologías;
   - los 15 enlaces del Diccionario;
   - canal para comunicar errores;
   - licencia;
   - las 7 webs con HTTP 403.

## 9. Supuestos y límites

- **Cartograma de casillas** (Supuesto de diseño, Alta). Una casilla por circunscripción, colocada a mano según la posición aproximada; no es un mapa. Canarias, Ceuta y Melilla van en recuadros. Lo acompañan una tabla y una vista por escaños.
- **Papeleta de práctica.** Cada formación ficticia presenta tantos candidatos como senadores se eligen, con un máximo de tres. Es una simplificación: la ley limita las marcas, no el número de candidatos.
- **Mayoría simple.** El simulador la aplica como «más síes que noes» y lo dice en pantalla, según la corrección de `PROMPT.md` del 30-10-2026.
- **Días que faltan.** Dependen de la fecha del dispositivo de quien visita la web, y la página la muestra.
- **Cuarto paso del bloque 3.1.** El esquema de cuatro pasos añade la propuesta del Rey, que el Anexo D.9 omite, como pide la sección 10.1.

## 10. Fuera de H2 y propuesta de H3

Quedan fuera:
- la composición real de las Cámaras;
- los votos por escaño con población oficial;
- los resultados del 29-N, que solo se cargarán cuando sean oficiales.

H3 propuesto: módulos 4 (competencias: quién decide qué) y 5 (economía y hacienda). Cada cifra económica tendrá su fuente (INE, Banco de España, AIReF, Eurostat) y su fecha de consulta, y los cálculos T6 a T9 ya están probados desde H0.

## 11. Periodo electoral

Hay una convocatoria en curso (votación el 29-11-2026). Este hito añade contenido electoral: calendario, calculadoras y simulador, todos con datos ficticios y sin encuestas ni proyecciones. Antes de publicar la web, revisa con un jurista las implicaciones de hacerlo en periodo electoral. Son especialmente relevantes los arts. 50.4, 50.5 y 69.7 de la LOREG. Esto no es asesoramiento jurídico.
