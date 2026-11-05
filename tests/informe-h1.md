# Informe de verificación — Hito H1

Fecha: 30-10-2026. Versión 0.2.0.
Marcas: **Hecho** (comprobado en esta sesión), **Inferencia** (deducido de lo comprobado), **Supuesto** (adoptado sin comprobar); confianza Alta, Media o Baja.

## 1. Capacidades usadas y lo que no se pudo hacer

| Capacidad | Uso en H1 | Límite |
|---|---|---|
| Navegación web | Navegador integrado (29-10-2026): lectura de los artículos citados en el BOE consolidado (Constitución, Ley 50/1997, Código Civil, LOREG y Reglamento del Congreso) y de 15 entradas del Diccionario de la lengua española. `check_links.py`: 18 peticiones (30-10-2026). | El Diccionario rechaza el acceso automatizado (HTTP 403). No lo he esquivado. |
| Ejecución de código | Python 3 (solo biblioteca estándar) y Chrome sin interfaz. | No hay Node, npm ni git. No he pasado axe ni Lighthouse. |
| Sistema de archivos | Ficheros nuevos y modificados del proyecto. | — |
| Descargas | Ninguna. | — |

## 2. Qué se ha construido

- **Inicio**: mapa «Cómo se conecta todo», con cada paso enlazado a su bloque, y ruta recomendada en siete pasos.
- **Sección «El Estado»** (`#/estado`), con portada, progreso por módulo y estado de cada bloque.
  - Módulo 1, fundamentos: 8.1 a 8.8, y 8.9 como enlace a «Información y medios», que llega en H5.
  - Módulo 2, el Estado español: 9.1 a 9.6, el mapa de relaciones (9.7) y el repaso (9.8).
  - Cada bloque sigue la plantilla 7.2. Lleva migas de pan, anterior y siguiente, modo básico o ampliado, y un botón para marcarlo como estudiado.
- **Glosario** (`#/glosario`): 69 términos, buscador tolerante, índice alfabético, filtros por bloque y módulo, términos relacionados y definición emergente accesible con teclado.
- **Cuestionarios** de 4 a 6 preguntas, sin temporizador ni nota. Cada respuesta muestra icono y texto, explicación, etiqueta, artículo y «Ver fuente». Se puede repasar lo fallado.
- **Mi aprendizaje** (`#/aprendizaje`): progreso global y por módulo, último resultado de cada bloque, preguntas falladas, y exportar, importar o borrar. El menú muestra el porcentaje de «El Estado».
- **Buscador global** en la cabecera (`#/buscar/…`): busca en el glosario y en los títulos de páginas y bloques.
- **Código nuevo**:
  - `js/core/`: `glosario.js`, `progreso.js`, `cuestionario.js` y `esquemas.js` (`contenido.js` reescrito).
  - `js/vistas/`: `modulos.js`, `relaciones.js`, `ejes.js`, `glosario.js`, `buscar.js` y `aprendizaje.js`.
  - `assets/css/modulos.css`.
- **Datos y esquemas**:
  - `data/normas.json`: 87 artículos con cita literal de 25 palabras como máximo.
  - `data/glosario.json` (69 términos), `data/preguntas.json` (61 preguntas) y `data/relaciones.json` (17 relaciones).
  - 18 fuentes nuevas en `data/sources.json`, que suma 78.
  - Esquemas: `relacion.schema.json` nuevo; `dato`, `pregunta` y `termino` ampliados.
- **Textos**: `content/es/modulos.json`, `m1.json` y `m2.json`. También cambian `inicio.json`, `ui.json`, `metodologia.json` y `licencias.json`.

## 3. Pruebas ejecutadas (salida real en `tests/ultima-ejecucion.txt`)

`python tools/run_tests.py` → **194 de 194 superadas, 0 fallos** (Hecho, Alta).

| Bloque | Pruebas | Resultado |
|---|---|---|
| Ficheros generados al día | 1 | OK |
| Validación de `data/` (6 conjuntos) | 6 | OK |
| Casos del validador (Anexo C.3) | 21 | OK |
| T1: integridad de tablas | 10 | OK, sin cambios desde H0 |
| Diseño: contraste WCAG AA (40 pares por tema), tema oscuro, etiquetas, textos sin direcciones externas y con enlaces internos válidos | 6 | OK: mínimo 4,62 en claro y 4,18 en oscuro (par no textual, umbral 3) |
| Referencias (nuevo) | 7 | OK. Comprueba que:<br>• los bloques listados existen;<br>• existen las normas, términos, fuentes y repasos citados;<br>• los términos `{{id\|texto}}` existen;<br>• los términos relacionados existen;<br>• cada pregunta tiene bloque y cada bloque ≥ 4 preguntas;<br>• los nodos de las 17 relaciones están en el diagrama. |
| Unitarias de cálculo y utilidades: T2 a T10, umbrales, barrera, empates, almacén y etiquetas | 21 | OK |
| Glosario: 12 búsquedas de ejemplo, búsqueda sin resultados y distancia de edición | 14 | OK. Ejemplos de búsquedas:<br>• «dhont» y «DHONDT» → D'Hondt<br>• «cgpj» y «consejo general» → CGPJ<br>• «invetidura» → investidura<br>• «territorial» → Senado |
| Progreso y cuestionarios | 6 | OK: «completado» = estudiado + un cuestionario; máximo 10 intentos; solo se guardan aciertos y fechas; de 4 a 6 preguntas por bloque; corrección numérica con coma |
| Humo de interfaz: 37 rutas (16 bloques incluidos) + controles, a 1280 y 375 px | 76 | OK. Comprueba:<br>• sin errores ni desplazamiento horizontal;<br>• un h1 y título;<br>• nombres accesibles, también en los campos;<br>• SVG con nombre;<br>• ids únicos, objetivos de 44 px y `aria-current`;<br>• tema y menú móvil. |
| Interacciones (nuevo), a 1280 y 375 px | 24 | OK. Prueba:<br>• definición emergente (abrir, enlazar, Escape, una vez por página);<br>• modo ampliado;<br>• cuestionario (aviso sin respuesta, fallo y acierto, explicación, etiqueta, fuente, bloqueo, guardado);<br>• marcar como estudiado y progreso del menú;<br>• migas, anterior y siguiente;<br>• repaso de la fallada;<br>• portada y «Mi aprendizaje»;<br>• filtro de relaciones, ejes, glosario y buscador con errata. |
| Apertura con `file://` de `index.html` y `dist/` | 2 | OK |

**Fallos encontrados y corregidos durante el hito (Hecho, Alta)**

- **Desbordamiento del glosario a 375 px.**
  - Qué pasaba: el desplegable de bloques desbordaba 6 px.
  - Quién lo detectó: la prueba de humo.
- **Bloque 2.7 sin preguntas.**
  - Qué pasaba: el bloque no podía completarse.
  - Solución: 4 preguntas nuevas sobre los arts. 69.5, 99.3, 115.1 y 161.1.a, incluidas también en el repaso.
- **Respuesta correcta casi siempre en primer lugar.**
  - Solución: las opciones se barajan, salvo en verdadero o falso.
- **Título de las páginas de bloque.**
  - Qué pasaba: no empezaba por el h1, al que le faltaba el número.

**Revisión visual en el navegador integrado (Hecho, Alta)**

- Páginas revisadas:
  - bloque 1.1 a 360 px en tema oscuro;
  - diagrama de relaciones y ejes a 800 px en claro y oscuro;
  - Inicio en oscuro.
- Cambios que salieron de la revisión:
  - las tablas comparativas se apilan en fichas en móvil, con roles de tabla explícitos;
  - las flechas entre el mismo par de instituciones se dibujan en paralelo, para que no se tapen;
  - los rótulos de los ejes llevan un halo, para que el eje no los cruce.

**No probado**

- Auditoría axe o Lighthouse.
- Lector de pantalla.
- Firefox y Safari.
- Un móvil físico.
- Importar un fichero de progreso desde la interfaz: la función está probada, pero no el selector de ficheros.

## 4. Datos cargados

| Conjunto | Fuente | Periodo | Estado | Consulta |
|---|---|---|---|---|
| 87 artículos citados (`normas`) | Constitución consolidada (20-05-2026), Ley 50/1997, Código Civil, LOREG, Reglamento del Congreso (BOE) | vigente | verificado, NORMA VIGENTE | 29-10-2026 |
| 17 relaciones entre instituciones | Constitución (artículo en cada una) | vigente | verificado, NORMA VIGENTE | 29-10-2026 |
| 69 términos del glosario | Normas del BOE y Diccionario de la lengua española | — | verificado. Dos son de sentido disputado y van con atribución: eje izquierda-derecha y nacionalismo. | 29-10-2026 |
| 61 preguntas | Artículo y fuente en cada una | — | 60 verificadas; 1 de ejemplo (SIMULACIÓN, partidos ficticios) | 29 y 30-10-2026 |
| Partidos ficticios de la simulación de ejes | Inventados | — | ejemplo, SIMULACIÓN | — |

Los datos de H0 (convocatorias de 2026 y 2023) no han cambiado.

## 5. Enlaces (`check_links.py`)

Total: 78 fuentes.

- **51 confirmadas**: las 48 de H0 y las 3 nuevas del BOE (Ley 50/1997, Código Civil y Reglamento del Congreso), consultadas el 30-10-2026.
- **26 no verificadas**:
  - Las 11 de H0, con el mismo motivo.
  - Las **15 entradas del Diccionario**, con HTTP 403: rechaza el acceso automatizado y no se ha reintentado por otra vía.
    - Las abrí a mano en el navegador integrado el 29-10-2026, y así consta en la nota de cada fuente.
    - La web las muestra como no verificadas, porque solo da por comprobado lo que confirma el script.
- **1 sin evaluar**: boe-api, sin dirección en el Anexo B.

## 6. Tabla de simetría

No aplica en H1: todavía no hay fichas de partidos ni de medios. La simulación de ejes usa partidos ficticios (A, B y C) que se distinguen por forma y letra, no por color.

## 7. Contradicciones y novedades

1. **Entrada en vigor del real decreto-ley.**
   - Lo que dice `PROMPT.md` (8.8, que remite al A.6): «un real decreto-ley rige desde su publicación».
   - Lo que dice la norma: el Código Civil, art. 2.1, fija que las leyes entran en vigor a los veinte días de su completa publicación si no disponen otra cosa (Hecho, Alta). El art. 86 de la Constitución no fija la fecha.
   - Inferencia (Media): la fecha la pone cada real decreto-ley en su disposición final.
   - Prevalece la norma. La web dice que se mire la fecha de entrada en vigor en el propio texto y no generaliza.
2. **Ley Orgánica 2/2026 (pendiente desde H0).** Modificó los arts. 161.2 y 165.2 de la LOREG (BOE-A-2026-14329, en vigor desde el 03-07-2026). `PROMPT.md` (A.5) sigue sin recogerlo.
3. **Mayoría simple.**
   - Lo que dice `PROMPT.md` (10.8 y Anexo D.3): «más votos a favor que en contra, sin contar las abstenciones».
   - Lo que dicen las normas: la Constitución (art. 99.3) y el Reglamento del Congreso (art. 79.1, «mayoría simple de los miembros presentes») la exigen, pero no la definen así. No he encontrado una fuente oficial con esa definición (Hecho, Media).
   - Qué hace la web: el glosario se limita a lo que dicen las normas. La calculadora de H0 aplica la definición de `PROMPT.md`, que es Supuesto.
4. **Fuentes académicas de ideologías.** El encargo (8.7) pide definiciones de ciencia política. Hoy salen del Diccionario de la RAE y el bloque 1.7 lo avisa con PENDIENTE DE VERIFICAR.
5. **Gobierno en funciones.**
   - Qué dice la Constitución: el art. 101 hace cesar al Gobierno tras la celebración de las elecciones, y desde entonces sigue en funciones.
   - Inferencia (Alta): hoy, con elecciones convocadas pero no celebradas, el Gobierno no está en funciones.
   - Qué hace la web: la pregunta m2-gobierno-2 lo explica así.

Contenidos marcados PENDIENTE DE VERIFICAR, hasta comprobar su base:

- tramitación urgente y lectura única (Reglamento del Congreso);
- comisiones de investigación (art. 76);
- elección de los doce vocales judiciales del CGPJ (LOPJ vigente);
- lista y número de comunidades autónomas (hito H3).

## 8. Decisiones que necesito

> **Actualización del 30-10-2026.** Las decisiones 1 y 2 están resueltas: aprobaste los cinco cambios.
> - Líneas cambiadas en `PROMPT.md`: 263, 355, 1377, 1379 y 3107.
> - Qué recogen: la entrada en vigor del real decreto-ley, la Ley Orgánica 2/2026 en el A.5, y la mayoría simple como definición didáctica.
> - Consecuencia: la calculadora mantiene la definición de mayoría simple con la etiqueta EXPLICACIÓN DIDÁCTICA.
>
> Siguen abiertas las decisiones 3 a 5.

1. **`PROMPT.md`.** ¿Lo actualizo con los puntos 7.1 a 7.3? Serían:
   - la entrada en vigor del real decreto-ley;
   - la Ley Orgánica 2/2026;
   - una definición de mayoría simple con fuente, o la nota de que es convencional.
2. **Mayoría simple en la calculadora.**
   - ¿Mantengo la definición de `PROMPT.md` con la etiqueta EXPLICACIÓN DIDÁCTICA?
   - ¿O me das una fuente que la respalde?
3. **Fuentes académicas de ideologías.** ¿Qué manual o diccionario de ciencia política quieres que cite? Necesito su referencia y acceso al texto.
4. **Diccionario de la RAE (15 enlaces).**
   - Opción A: se quedan como no verificados, con la nota de la consulta manual.
   - Opción B: los compruebas tú.
5. **Pendientes de H0:**
   - canal para comunicar errores;
   - licencia;
   - calendario de la JEC (PDF): autorizar la descarga o dejarlo en la carpeta;
   - las 7 webs con HTTP 403.

## 9. Supuestos y límites

- Un bloque cuenta como completado cuando está marcado como estudiado y tiene al menos un cuestionario, sin nota mínima (Supuesto de diseño, Alta). Así lo explica «Mi aprendizaje».
- El progreso solo guarda identificadores, aciertos y fechas, en el navegador. Nada sobre ideología ni opiniones (Hecho, Alta: probado).
- La definición emergente aparece la primera vez que un término sale en cada página. Las siguientes apariciones son texto normal.
- El diagrama de relaciones simplifica: no recoge todas las relaciones de la Constitución. La lista de debajo es su alternativa textual y cada relación cita su artículo.
- Las posiciones de la simulación de ejes son inventadas y no representan a ningún partido real.
- Los nombres de los ficheros de contenido (`m1.json`, `m2.json`) siguen los módulos, no los números de sección del encargo (8.x y 9.x). La numeración visible es 1.1 a 2.8.

## 10. Fuera de H1 y propuesta de H2

Quedan fuera:
- el módulo de elecciones;
- competencias, economía, partidos, temas y medios;
- los términos del glosario de esos módulos (normativa básica, directiva, reglamento europeo, trasposición, etc.);
- la página completa de Fuentes.

H2 propuesto (sección 6):
- módulo de elecciones generales, con la convocatoria de 2026;
- calculadora D'Hondt con la lectura de la barrera explícita;
- mapa de circunscripciones en casillas;
- calendario electoral;
- glosario electoral.

Para pasar a verificadas las 13 fechas pendientes hace falta el calendario de la JEC (decisión 8.5).

## 11. Periodo electoral

Hay una convocatoria en curso (votación el 29-11-2026). Antes de publicar la web, revisa con un jurista las implicaciones de hacerlo en periodo electoral. Son especialmente relevantes los arts. 50.4, 50.5 y 69.7 de la LOREG. Esto no es asesoramiento jurídico.
