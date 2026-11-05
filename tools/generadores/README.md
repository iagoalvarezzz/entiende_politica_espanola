# Generadores de datos (registro histórico)

Scripts con los que se crearon los datos de los hitos H1 a H5. Se guardan para que se pueda ver de dónde sale cada dato y cómo se construyó.

**No los vuelvas a ejecutar a ciegas.** Varios reescriben ficheros enteros de `data/` o `content/es/` y deshacerían los cambios posteriores. El estado vigente es el de los JSON de `data/` y `content/es/`, que son la fuente de verdad. Para un cambio nuevo, edita esos JSON o escribe un script nuevo e idempotente, y después ejecuta `python tools/build.py` y `python tools/run_tests.py`.

Los generadores de H0 a H2 no se conservaron.

| Script | Hito | Qué hace | Entradas además de la raíz del proyecto |
|---|---|---|---|
| `generar_normas.py` | H1–H2 | Artículos de normas leídos en el BOE (`data/normas.json`) | — |
| `generar_glosario.py` | H1 | Términos del glosario de los módulos 1 y 2 | — |
| `generar_preguntas.py` | H1 | Preguntas de los módulos 1 y 2 | — |
| `datos_h3.py` | H3 | Fuentes, competencias e indicadores económicos | — |
| `parse_votaciones.py` | H4 | Resume los JSON de votaciones del Congreso | lista de votaciones y carpeta con los JSON descargados (no están en el repositorio) |
| `generar_votaciones.py` | H4 | `data/votaciones.json` | lista de votaciones, carpeta con los JSON descargados y fichero de salida |
| `datos_h4.py` | H4 | Fuentes, esquemas, `data/partidos.json` | `data/votaciones.json` |
| `h4_hechos.md` | H4 | Hechos verificados que usa `datos_h4.py` | — |
| `datos_h5.py` | H5 | Fuentes de medios y verificadores, `data/medios.json` y `data/verificadores.json` | — |
| `contenido_h5.py` | H5 | Fuentes, normas, glosario, preguntas, textos de interfaz y secciones de los módulos 8 y 9 | — |

Uso original: `python -I <script> <raíz del proyecto> [entradas]`.

Los ficheros descargados con permiso (votaciones del Congreso, CHES 2024, XML del Senado) no están en el repositorio. Para volver a descargarlos hay que pedir permiso al autor indicando nombre, origen y tamaño (ver `CLAUDE.md`).
