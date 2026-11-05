# Informe de verificación — Hito H0

Fecha: 29-10-2026. Versión 0.1.0.
Marcas: **Hecho** (comprobado en esta sesión), **Inferencia** (deducido de lo comprobado), **Supuesto** (adoptado sin comprobar); confianza Alta, Media o Baja.

## 1. Capacidades usadas y lo que no se pudo hacer

| Capacidad | Uso en H0 | Límite |
|---|---|---|
| Navegación web | Navegador integrado: lectura literal de 4 páginas del BOE. `check_links.py` (urllib): 59 peticiones. | No he abierto el calendario de la JEC (PDF): leerlo exige descargarlo. |
| Ejecución de código | Python 3.13.14 (solo biblioteca estándar) y Chrome sin interfaz. | No hay Node, npm ni git. No he pasado axe ni Lighthouse. |
| Sistema de archivos | Creación de todos los ficheros del proyecto. | — |
| Descargas | Ninguna. | — |

## 2. Qué se ha construido

- `index.html`, `assets/css/` (tokens, base, componentes), `js/core/` (pe, almacen, iconos, etiquetas, fuentes, contenido, router), `js/calc/` (dhondt, mayorias, economia, encuestas), `js/vistas/` (paginas, leyenda, fuentes) y `js/app.js`.
- Páginas:
  - Inicio, con la convocatoria en curso y datos verificados.
  - Metodología y límites, Leyenda, Fuentes oficiales (preliminar) y Licencias.
  - Avisos para las 9 secciones pendientes y página de «no encontrada».
- Textos en `content/es/*.json`, separados del código.
- Datos:
  - `data/sources.json`: 60 fuentes del Anexo B.
  - `data/convocatorias.json`: eg-2026 y eg-2023, con 52 circunscripciones del Congreso, 60 y 59 del Senado, fechas clave y bloque de verificaciones.
- Esquemas: `data/schemas/` (comun + los 8 tipos del Anexo C).
- Herramientas: `tools/build.py`, `validate.py`, `check_links.py` y `run_tests.py`.
- Versión de un solo archivo: `dist/politica-espana.html`.
- Pruebas: `tests/vectores.json`, `casos_validador.json`, `run.html` y `pruebas.js`.
- Documentación: `README.md` y `CHANGELOG.md`.
- `.claude/launch.json`, para servir la web en local con `python -m http.server 8765`.

## 3. Pruebas ejecutadas (salida real en `tests/ultima-ejecucion.txt`)

`python tools/run_tests.py` → **99 de 99 superadas, 0 fallos** (Hecho, Alta).

| Bloque | Pruebas | Resultado |
|---|---|---|
| Ficheros generados al día | 1 | OK |
| Validación de `data/` | 2 | OK |
| Casos del validador (Anexo C.3): 3 válidos y 18 que deben fallar | 21 | OK: cada caso inválido produce su error |
| T1: integridad de tablas | 10 | OK: 52 circunscripciones; 350 escaños; 102 + 248; solo Madrid (37 → 38) y Cádiz (9 → 8); Senado 188 + 9 + 4 + 8 = 209; 208 en 2023 |
| Contraste WCAG AA (40 pares por tema) | 2 | OK: mínimo 4,62 en claro y 4,18 en oscuro (este último es un par no textual con umbral 3) |
| Tema oscuro, etiquetas y textos | 4 | OK |
| Cálculos en Chrome: T2, T3 (las dos lecturas), T4 (con y sin barrera), T5, propiedad 1/(M+1), barrera exacta, empates, umbrales 176/210/234/35, mayoría simple, T6 a T10, utilidades | 21 | OK |
| Humo de interfaz, 17 rutas + controles, a 1280 y 375 px | 36 | OK: sin errores de consola, un h1, título, sin desplazamiento horizontal, nombres accesibles, ids únicos, objetivos de ≥ 44 px, `aria-current`, tema, menú móvil, Escape, «Saltar al contenido» primero |
| Apertura con `file://` de `index.html` y `dist/` | 2 | OK |

Durante el hito, una prueba falló y se corrigió. El botón de menú se veía en escritorio porque `.boton` sobrescribía la regla que lo oculta. Lo arreglé y la ejecución siguiente quedó en verde.

Revisión visual en el navegador integrado (Hecho, Alta):
- Inicio a 800 px.
- Fuentes a 1280 px.
- Leyenda y menú abierto a 375 px en tema oscuro.
- Consola sin errores.

**No probado:**
- Auditoría axe o Lighthouse.
- Lector de pantalla.
- Firefox y Safari.
- Un móvil físico.

## 4. Datos cargados

| Conjunto | Fuente | Periodo | Estado | Consulta |
|---|---|---|---|---|
| Escaños por circunscripción 2026 | RD 806/2026, anexo (BOE) | 29-11-2026 | verificado, DATO OFICIAL | 29-10-2026 |
| Senadores elegidos 2026 | RD 806/2026, art. 3.2 | 29-11-2026 | verificado | 29-10-2026 |
| Casillas máximas en el Senado | LOREG, arts. 96.3 y 166.1.a (consolidada, 02-07-2026) | vigente | verificado, NORMA VIGENTE | 29-10-2026 |
| Escaños y senadores 2023 | RD 400/2023 (BOE) | 23-07-2023 | verificado | 29-10-2026 |
| Fechas 2026: convocatoria, campaña, votación, constitución de las Cortes | RD 806/2026, arts. 2, 4 y 5 | — | verificado | 29-10-2026 |
| Otras 13 fechas 2026 (candidaturas, mesas, voto por correo, extranjero, sondeos, escrutinio, tarjetas) | Calendario JEC / La Moncloa (Anexo A.3) | — | pendiente | — |
| Inventario de fuentes | Anexo B + `check_links.py` | — | ver punto 5 | 29-10-2026 |

Las 13 fechas pendientes coinciden con los plazos de la LOREG contados desde el 06-10-2026 (Inferencia, Alta). No las publico como oficiales hasta leer el calendario de la JEC.

## 5. Enlaces (`check_links.py`, 29-10-2026)

- **48 confirmados**: respuesta 200 y aparece el texto esperado. En el PDF de la JEC solo se confirma que se recibe un PDF.
- **11 no verificados**:
  - **7 con HTTP 403** (rechazo del acceso automatizado): web-pp, web-vox, web-erc, interior, web-29n, parlamento-europeo y newtral. No se ha reintentado por otra vía.
  - **4 con respuesta 200 pero sin el texto esperado** (probablemente se generan con JavaScript): jec-eg-2026, jec-loreg, web-psoe y seg-social.
- **1 sin evaluar**: boe-api. El Anexo B no da su dirección.

Cambios respecto al Anexo B (Hecho, Alta):
- efe-verifica y verificartve, que el anexo daba por bloqueadas, se abren con normalidad.
- Las dos páginas HTML de la JEC, que el anexo daba por abiertas, no muestran el texto esperado en el HTML.

## 6. Tabla de simetría

No aplica en H0: todavía no hay fichas de partidos ni de medios.

## 7. Contradicciones y novedades

1. **Origen de la modificación de la LOREG (Hecho, Alta).** La página consolidada del BOE indica que los arts. 161.2 y 165.2 se modificaron por la **Ley Orgánica 2/2026, de 30 de junio (BOE-A-2026-14329)**, en vigor desde el 03-07-2026.
   - El PDF no lo decía. `PROMPT.md` (A.5) sigue diciendo que la norma no se conoce. No lo he cambiado porque me pediste no tocarlo.
2. **208 senadores en 2023 (Hecho, Alta).** El Anexo A.5 lo calcula sin haber leído el texto anterior. Ahora lo confirma el RD 400/2023, art. 3.2: Ibiza-Formentera era una sola circunscripción.
3. **Esquema C.1.3.** No puede representar las islas del Senado, porque un solo objeto por provincia no sirve para Baleares, Las Palmas y Santa Cruz de Tenerife.
   - Lo he ampliado con `circunscripciones_senado` y `verificaciones`.
   - En las provincias insulares, `senadores_elegidos` guarda la suma de sus islas.
4. **T8 (Anexo C.2.6).** El anexo escribe «16,7 %», pero la regla de tolerancia exige dos decimales. El vector usa −16,67 (bajada). No contradice el cálculo.
5. **Fuentes (C.1.1).** He añadido `grupo`, `uso`, `texto_esperado` y `comprobado_por`. Sin ellos no se puede distinguir lo que confirmó el script de lo que dice el anexo.

## 8. Decisiones que necesito

1. **Canal para comunicar errores**: correo, formulario o repositorio. La página lo marca como pendiente.
2. **Licencia del código y de los textos.**
3. **Calendario de la JEC (PDF).** Para pasar a verificadas las 13 fechas pendientes (hito H2) hay dos opciones:
   - me autorizas a descargarlo: `eg2026_calendario.pdf`, desde juntaelectoralcentral.es, con el tamaño a confirmar antes de bajarlo;
   - o lo dejas tú en la carpeta.
4. **Las 7 webs con HTTP 403.** ¿Las compruebas tú a mano o las dejamos como no verificadas? No las abriré por otra vía para saltarme el bloqueo.
5. **`PROMPT.md`.** ¿Añado al A.5 el dato de la Ley Orgánica 2/2026 y actualizo las columnas Estado de las filas ya confirmadas?

## 9. Supuestos y límites

- Sin dependencias ni CDN. Los gráficos irán en SVG propio (Supuesto de diseño, Alta).
- La lectura de la barrera con los blancos dentro de la base se basa en el texto de la LOREG (arts. 96.5, 108.4 y 163.1.a) (Hecho, Alta). La calculadora mostrará qué lectura usa.
- Ante un empate con los mismos votos totales, la calculadora avisa del sorteo y no asigna el escaño (art. 163.1.d) (Hecho, Alta).
- Como no hay git, el versionado se hace con `meta.version` y `meta.actualizado` en cada JSON y con `CHANGELOG.md`.
- La página de Fuentes es preliminar. La completa corresponde al hito H5.

## 10. Fuera de H0 y propuesta de H1

Quedan fuera:
- los módulos de contenido;
- el glosario y su buscador;
- los cuestionarios y el progreso;
- las migas de pan y los botones anterior y siguiente;
- el buscador global.

H1 propuesto:
- Inicio con mapa general y ruta de aprendizaje.
- Módulos 1 (fundamentos) y 2 (el Estado), con textos verificados en la Constitución consolidada, la Ley del Gobierno y el Reglamento del Congreso.
- Glosario con buscador tolerante («dhont» → «D'Hondt»).
- Motor de cuestionarios y «Mi aprendizaje», con exportación e importación.

## 11. Periodo electoral

Hay una convocatoria en curso (votación el 29-11-2026). Antes de publicar la web, revisa con un jurista las implicaciones de hacerlo en periodo electoral. Son especialmente relevantes los arts. 50.4, 50.5 y 69.7 de la LOREG. Esto no es asesoramiento jurídico.
