# Entender la política española

Web educativa, estática y sin dependencias para aprender cómo funciona la política española desde cero. Es un recurso independiente de las candidaturas: no recomienda ningún voto, no puntúa partidos y no hace clasificaciones.

Estado: **hito H5** (los nueve módulos). Incluye:
- H0: la estructura, el sistema de diseño, los esquemas de datos, la metodología y las pruebas.
- H1: los módulos 1 y 2 («El Estado»), el glosario, los cuestionarios, el progreso de aprendizaje y el buscador.
- H2: el módulo 3 («Elecciones generales»), con el calendario del 29-N, el cartograma de circunscripciones, la calculadora D'Hondt, la papeleta del Senado de práctica y el simulador de mayorías.
- H3: los módulos 4 («Quién decide qué») y 5 («Economía y hacienda»). Incluyen la tabla de competencias, la herramienta «¿Quién decide?», el tablero de indicadores, gráficos con su tabla y calculadoras económicas.

- H4: los módulos 6 («Los partidos políticos») y 7 («Los temas políticos»). Incluyen 26 fichas de partido con la misma estructura, el comparador de propuestas, las votaciones del Congreso, el ciclo de una medida y nueve temas.

- H5: los módulos 8 («Análisis de políticas públicas y lectura de datos») y 9 («Medios de comunicación y verificación»). Incluyen la ficha de ocho preguntas, ejercicios de clasificación, la calculadora del margen de error, el comparador antes-después, 25 fichas de medios, el mapa de propiedad, los verificadores y el analizador de una noticia inventada. La página de fuentes oficiales tiene buscador, filtro por estado e índice de grupos.

Quedan decisiones pendientes del autor (ver `tests/informe-h5.md`). Los datos económicos del tablero están precargados con su fecha y no se actualizan solos. Las propuestas de los partidos se cargarán con los programas del 29-N.

## Abrir la web

**Entra en https://iagoalvarezzz.github.io/entiende_politica_espanola/ y ya está.** No hace falta instalar ni descargar nada.

La web no tiene backend, cuentas, cookies ni analítica. El código está en este repositorio: https://github.com/iagoalvarezzz/entiende_politica_espanola

### Abrirla en tu ordenador (para desarrollar)

- **Con doble clic**: abre `index.html` o `dist/politica-espana.html` (un solo archivo con todo incrustado). Funciona sin servidor porque los datos se cargan como scripts clásicos.
- **Con un servidor local**:

  ```bash
  python -m http.server 8000
  ```

  y visita `http://localhost:8000/`.

## Requisitos

- Python 3.10 o posterior, solo con la biblioteca estándar (para generar, validar y probar).
- Chrome o Edge instalados, para las pruebas de JavaScript y de interfaz. Si no están en la ruta habitual, define `PE_NAVEGADOR` con la ruta al ejecutable.

No hay que instalar paquetes de pip ni de npm.

## Estructura

```
index.html                 página única con rutas por hash (#/estado, #/fuentes…)
assets/css/                tokens.css (colores claro/oscuro), base.css, componentes.css, modulos.css
js/core/                   núcleo: utilidades, almacén local, iconos, etiquetas, fuentes, rutas,
                           contenido, esquemas, glosario, progreso y cuestionarios
js/calc/                   cálculos puros: D'Hondt, mayorías, economía, encuestas
js/vistas/                 una vista por página
js/app.js                  arranque
content/es/*.json          textos de la interfaz y de las páginas (separados del código);
                           modulos.json ordena secciones, módulos y bloques, y m1.json a m9.json
                           los desarrollan
data/*.json                datos (fuente de verdad), cada fichero con meta y registros
data/schemas/              esquemas JSON del Anexo C (más definiciones comunes)
data/*.js, content/es/*.js envoltorios generados por tools/build.py (no editar)
tools/build.py             genera envoltorios y dist/politica-espana.html
tools/validate.py          valida data/ contra los esquemas y las reglas del Anexo C.3
tools/check_links.py       comprueba los enlaces de data/sources.json y registra el resultado
tools/run_tests.py         ejecuta todas las pruebas
tools/neutralidad.py       barrido de expresiones que hay que revisar por neutralidad
tools/generadores/         generadores históricos de los datos (ver su README)
CLAUDE.md                  reglas de trabajo para Claude Code
tests/                     vectores de prueba, casos del validador, pruebas en navegador e informes
dist/                      versión de un solo archivo (generada)
```

## Flujo de trabajo

1. Edita los datos en `data/*.json` o los textos en `content/es/*.json`.
2. Regenera los envoltorios y la versión de un solo archivo:

   ```bash
   python tools/build.py
   ```

3. Ejecuta las pruebas:

   ```bash
   python tools/run_tests.py
   ```

   Comprueba que lo generado está al día y valida los datos. Ejecuta los casos del validador, la integridad de las tablas (T1), el contraste de colores, los textos y las referencias entre contenido y datos. Prueba los cálculos (T2 a T10, umbrales y empates), el glosario, el progreso y los cuestionarios. Hace una prueba de humo de todas las páginas, con sus interacciones, a 1280 y 375 px. Por último abre `index.html` y `dist/` sin servidor. La salida queda en `tests/ultima-ejecucion.txt`.

4. Comprueba los enlaces (hace una petición por fuente, con un segundo de pausa):

   ```bash
   python tools/check_links.py
   ```

   Escribe en `data/sources.json` el estado, la fecha y el resultado de cada enlace, añade una línea por fuente a `tests/registro-enlaces.tsv` y regenera los envoltorios. La web solo muestra como comprobado un enlace que este script ha confirmado. Si una web rechaza el acceso automatizado, el script lo anota y no lo reintenta por otra vía.

## Reglas de datos

- Cada dato lleva estado (`verificado`, `pendiente` o `ejemplo`) y una de las diez etiquetas de fiabilidad. La interfaz solo presenta como verificado lo que tiene ese estado.
- Los porcentajes no se guardan: se calculan al mostrarlos.
- Los enlaces externos de los textos van siempre por `data/sources.json`.
- Los cambios de datos se anotan en `meta.version`, `meta.actualizado` y `CHANGELOG.md` (no hay control de versiones con git en esta carpeta).

## Periodo electoral

Hay elecciones generales convocadas para el 29 de noviembre de 2026 (Real Decreto 806/2026). La web no publica encuestas ni estimaciones de voto. Antes de publicarla durante el periodo electoral, conviene revisar sus implicaciones con un jurista (LOREG, arts. 50.4, 50.5 y 69.7).

## Comunicar errores

Escribe al correo de la web, que figura en el pie de cada página y en «Metodología y límites → Cómo comunicar un error» (se configura en `content/es/ui.json` → `contacto.correo`). Indica la página, qué dice la web, qué dice la fuente y la fecha de consulta.

También puedes abrir una incidencia en https://github.com/iagoalvarezzz/entiende_politica_espanola/issues con la plantilla «Error de contenido» (`.github/ISSUE_TEMPLATE/error-de-contenido.md`). Las incidencias son públicas: no incluyas datos personales.

## Licencia

Pendiente de decidir por el autor. Las atribuciones de terceros están en la página «Licencias y atribuciones».
