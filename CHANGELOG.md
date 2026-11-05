# Historial de cambios

## 0.6.0 — 2026-11-05 — Hito H5

### Añadido
- **Módulo 8, «Análisis de políticas públicas y lectura de datos»**, en la sección «Temas» (`#/temas/m8-…`), con seis bloques: la ficha de ocho preguntas; objetivos, previsiones, resultados y opiniones; causalidad y evidencia; fuentes de evaluación; encuestas y estadísticas; repaso.
- **Herramientas del módulo 8** (`js/vistas/analisis.js`, `js/vistas/ejercicios.js`):
  - ficha de ocho preguntas con tres medidas inventadas de ámbitos distintos (movilidad, educación y medio ambiente), cada respuesta con su etiqueta o «sin información verificada», sin veredicto;
  - clasificación de doce frases inventadas (objetivo, previsión, resultado u opinión), con corrección y explicación;
  - calculadora del margen de error (vector T10; 1.000 entrevistas y 50 % dan ±3,1 puntos al 95 %);
  - comparador antes-después y con grupo de comparación, editable, con el ejemplo de la sección 15.4.
- **Sección «Información y medios»** (`#/medios`), con el módulo 9 en seis bloques: quién hay detrás de un medio; fichas de medios; orientación, paralelismo y confianza; páginas para contrastar y verificadores; cinco comprobaciones; repaso.
- **Herramientas del módulo 9** (`js/vistas/medios.js`):
  - 25 fichas de medios con la misma estructura (identidad, propiedad, línea editorial, audiencia y orientación), filtros por soporte y por tipo de propietario y ningún filtro por orientación;
  - mapa de propiedad con los grupos y sociedades de EurOMo 2025;
  - tabla de verificadores con el estado del sello de la IFCN, la propiedad y la metodología;
  - analizador de una noticia inventada con las cinco comprobaciones;
  - clasificación de seis textos (noticia, análisis u opinión) y ejercicio de fecha y contexto.
- **Página «Fuentes oficiales» completa** (sección 17.2): índice de grupos con recuentos, buscador que ignora mayúsculas y tildes, filtro por estado del enlace y fecha de comprobación en cada fuente.
- **Datos:**
  - `data/medios.json`: 25 medios (18 de la muestra de EurOMo España 2025, 5 del Anexo D.6 y 2 del Digital News Report España 2026);
  - `data/verificadores.json`: 6 servicios, con su estado en la IFCN el 5 de noviembre de 2026;
  - 10 artículos más en `data/normas.json` (232), de la Ley 27/2022 de evaluación de políticas públicas y de la Ley 13/2022 General de Comunicación Audiovisual;
  - 23 términos más en el glosario (177), entre ellos «bulo» y «polarización» a partir de la FundéuRAE, y una definición actualizada («evaluación de políticas», ahora con la Ley 27/2022);
  - 51 preguntas más (303);
  - 19 fuentes nuevas (183 en total): perfiles de la IFCN, páginas de financiación y metodología de los verificadores, dos leyes y una orden del BOE, el código de la FAPE, la metodología del CIS dos recomendaciones de la FundéuRAE y el repositorio del proyecto.
- **Esquemas:** `verificador.schema.json` (nuevo) y campos opcionales en `medio.schema.json` (tipo de propietario, criterio de entrada y pendientes).
- **Pruebas:** auditoría de accesibilidad en la prueba de humo (saltos de nivel en los títulos, referencias ARIA y etiquetas a ids existentes, grupos con leyenda); comprobaciones de medios, verificadores y herramientas de los módulos 8 y 9; ocho interacciones nuevas.

### Cambiado
- El menú muestra el progreso de «Temas» (módulos 7 y 8) y de «Información y medios» (módulo 9). Ya no queda ninguna ruta pendiente.
- El título de cada fase del ciclo de una medida pasa de `h4` a `h3`, para no saltar niveles.
- Se descarta la orientación aproximada sin fuente del Anexo D.6 (decisión del 05-11-2026). Lo explican el bloque 9.3 y la metodología.
- Portada, metodología (criterios de medios y verificadores, límites nuevos) y licencias (EurOMo con CC BY 4.0, Digital News Report, FAPE, CIS y FundéuRAE con CC BY-SA 3.0).
- Licencia decidida el 05-11-2026: MIT para el código (`LICENSE`) y CC BY 4.0 para los textos propios (`LICENCIA-TEXTOS.md`). Lo recogen la página de licencias y el README.
- Canal de errores y quejas decidido el 05-11-2026: un correo electrónico en el pie de todas las páginas y en «Cómo comunicar un error» (`contacto.correo` en `content/es/ui.json`, bloque de contenido `correo`), con nota en la sección de privacidad. Incidencias de GitHub como opción secundaria, con la plantilla «Error de contenido» (`.github/ISSUE_TEMPLATE/`), en https://github.com/iagoalvarezzz/entiende_politica_espanola (fuente `repositorio-proyecto` en un grupo nuevo «Proyecto» y bloque de contenido `repositorio`).
- `PE.version`: 0.6.0.
## 0.5.0 — 2026-11-05 — Hito H4

### Añadido
- **Sección «Partidos»** (`#/partidos`), con el módulo 6 en seis bloques: qué es un partido; grupos parlamentarios y Grupo Mixto; ámbito, votos y escaños; fichas; comparador y votaciones; repaso.
- **26 fichas de partido** con la misma estructura, el mismo orden y las mismas 6 fuentes (`data/partidos.json`):
  - lista según el criterio de la sección 4.4: representación en el Congreso o el Senado en la disolución (6 de octubre de 2026), escaño en el Parlamento Europeo, lista mínima del encargo y grupo propio en un parlamento autonómico;
  - representación: Congreso (datos abiertos), Senado (fichas de senado.es), Parlamento Europeo (BOE de 2024) y 16 parlamentos autonómicos;
  - resultados de las generales de 2023 (BOE);
  - clasificación del CHES 2024 para los 13 partidos que cubre;
  - 76 votaciones por grupo parlamentario;
  - autodefinición, gobiernos y programa: pendientes para todos por igual.
- **Herramientas del módulo 6:**
  - buscador y filtros por ámbito y por cámara, orden alfabético o por escaños;
  - comparador de propuestas por tema, sin puntuación, con las celdas pendientes hasta los programas del 29-N;
  - efecto territorial: escaños por circunscripción en 2023 y un ejemplo ficticio con D'Hondt (mismo 12 %, 2 escaños frente a 0);
  - tabla de control de simetría en la propia página.
- **Sección «Temas»** (`#/temas`), con el módulo 7 en doce bloques:
  - el ciclo de una medida, en 8 fases con su prueba y su etiqueta, sobre una medida inventada;
  - nueve temas con la misma estructura: cinco preguntas, «¿Quién decide?» incrustado, marco legal, datos oficiales, comparador y lo que sigue abierto;
  - temas disputados (sección 4.6): doce temas con marco jurídico y sentencias verificadas;
  - repaso.
- **Datos:**
  - `data/votaciones.json`: 3 investiduras, 56 convalidaciones de real decreto-ley y 17 leyes orgánicas de la XV Legislatura;
  - 36 artículos más en `data/normas.json` (222 en total);
  - 19 términos más en el glosario (154), con el bloque «Temas políticos»;
  - 108 preguntas más (252);
  - 58 fuentes nuevas (164 en total), entre ellas 15 webs de partido y 16 parlamentos autonómicos.
- **Esquemas:**
  - `partido` gana campos opcionales para la denominación, el criterio de ámbito, los resultados de 2023, las fuentes y los pendientes;
  - nuevo esquema `votacion`;
  - `meta.contexto` para datos comunes de un conjunto.
- **Pruebas:**
  - cuadres de partidos: 350 diputados, 257 senadores de partido y 57 eurodiputados de candidatura propia;
  - votaciones: cada grupo suma el total oficial;
  - temas y ciclo;
  - cinco interacciones nuevas a 1280 y 375 px.

### Cambiado
- «¿Quién decide?» admite reutilizar preguntas del módulo 4 desde otros módulos; el módulo 4 tiene cuatro preguntas más (vivienda, juzgados, medio ambiente y energía).
- Menú: «Partidos» y «Temas» muestran el progreso; ya no son páginas pendientes.

### Verificado en esta versión (consultas del 04 y 05-11-2026)
- **Congreso:** composición en la disolución (datos abiertos: 137 + 213 diputados) y 76 votaciones (datos abiertos descargados con permiso).
- **Senado:** 311 fichas de senadores de la XV Legislatura.
- **BOE:**
  - resultados de las europeas de 2024 y de las generales de 2023;
  - Constitución (arts. 6, 13.4, 15, 40, 45, 62.i, 94, 138, 150 y 155);
  - Ley Orgánica 6/2002 y Ley Orgánica 8/2007;
  - Reglamentos del Congreso (con la reforma de 23-07-2026 para la XVI Legislatura) y del Senado;
  - LOREG, art. 44;
  - 13 leyes de los temas y las sentencias del Tribunal Constitucional 137/2025, 44/2023 y 19/2023.
- **CHES 2024:** datos y libro de códigos, descargados con permiso.
- **Parlamentos autonómicos:** grupos de 16 parlamentos. Asturias rechaza el acceso automatizado.

## 0.4.0 — 2026-11-04 — Hito H3

### Añadido
- **Sección «Quién decide qué»** (`#/competencias`), módulo 4, con seis bloques:
  - pregunta guía y cuatro niveles, con las 17 comunidades y las 2 ciudades autónomas según el Ministerio de Política Territorial;
  - reparto por materia;
  - financiación;
  - ayuntamientos;
  - Unión Europea;
  - repaso.
- **Sección «Economía y hacienda»** (`#/economia`), módulo 5, con seis bloques:
  - indicadores y su último dato;
  - reglas para leer datos;
  - impuestos y Presupuestos;
  - pensiones;
  - política monetaria y fiscal;
  - repaso.
- **Herramientas:**
  - Tabla buscable de 15 materias × 4 niveles. Cada celda lleva su artículo y su etiqueta; 12 celdas quedan como PENDIENTE DE VERIFICAR.
  - Herramienta «¿Quién decide?» con 12 preguntas cotidianas.
  - Tablero de 15 indicadores precargados, con periodo, fechas y fuente.
  - 13 fichas de indicadores con sus seis partes.
  - Dos gráficos reales con el eje desde cero y tabla alternativa: el euríbor mensual del Banco de España y el gasto por funciones de Eurostat.
  - Seis calculadoras que reproducen T6 a T9.
- **Datos:**
  - `data/competencias.json` (60 celdas) y `data/indicadores.json` (17 datos del tablero, 4 pendientes, 12 meses de euríbor y 11 funciones del gasto).
  - 67 artículos más en `data/normas.json` (186 en total).
  - 39 términos más en el glosario (135 en total).
  - 43 preguntas más (144 en total).
  - 25 fuentes nuevas.
- **Esquema `dato`:** campos opcionales `materia`, `nivel`, `normas` y `grupo`.
- **Pruebas:**
  - comprobaciones cruzadas de competencias, «¿Quién decide?» e indicadores;
  - las 14 páginas de los módulos 4 y 5 en la prueba de humo;
  - cuatro interacciones nuevas a 1280 y 375 px.

### Cambiado
- El menú muestra el progreso de «Competencias» y «Economía básica»; ya no son páginas pendientes.
- La tabla de competencias se apila en fichas por debajo de 60em.

### Verificado en esta versión (consultas del 04-11-2026)
- **Constitución:** arts. 41, 50, 93, 133 a 135, 142, 148, 149 y 156 a 158.
- **Leyes:**
  - Ley 7/1985, de Bases del Régimen Local: arts. 19, 25.2, 26.1 y 36.1;
  - LOFCA: arts. 4 y 11 y disposiciones adicionales primera y segunda;
  - Haciendas Locales: arts. 2 y 59;
  - Ley 22/2009: art. 46;
  - Ley General de la Seguridad Social: arts. 42, 58 y 110;
  - Real Decreto 126/2026 (SMI): art. 1.
- **Tratados de la UE:** TFUE, arts. 2 a 6, 127, 282 y 288 y Protocolo n.º 12; TUE, arts. 14 a 17 y 19.
- **Indicadores:**
  - INE: Contabilidad Nacional Trimestral y Anual, IPC, EPA, Encuesta de Condiciones de Vida y Encuesta Anual de Estructura Salarial;
  - Banco de España: deuda y euríbor;
  - Ministerio de Hacienda: déficit de 2025;
  - Eurostat: presión fiscal y COFOG;
  - BCE: tipos oficiales;
  - Ministerios de Inclusión y de Trabajo: afiliación y paro registrado de octubre de 2026.
- **Enlaces:**
  - `check_links.py` confirma 21 de las 25 fuentes nuevas.
  - Las otras 4 se abrieron a mano en el navegador integrado y quedan como no verificadas:
    - EUR-Lex (TFUE y TUE): HTTP 202, una comprobación anti-bots;
    - el navegador de datos de Eurostat y la nota del Ministerio de Trabajo: se generan con JavaScript.

## 0.3.0 — 2026-10-30 — Hito H2

### Añadido
- Sección «Elecciones generales» (`#/elecciones`) con el módulo 3, en 11 bloques: 3.1 a 3.10 y el repaso.
  - Contenidos: qué se vota; circunscripciones y escaños; papeletas y tipos de voto; barrera y D'Hondt; Senado; convocatoria del 29-N; votar y escrutinio; de los votos al Gobierno; otras elecciones; errores frecuentes.
- Herramientas, todas con partidos o bloques ficticios:
  - Calculadora D'Hondt. Muestra la barrera con la lectura de la LOREG a la vista, el cuadro de cocientes, el orden de cocientes, el último con escaño y el primero sin él, los avisos de empate y la propiedad 1/(M+1). Trae cuatro ejercicios guiados (T3, T4, T5 y «mismos votos, distintos escaños») con comparación etiquetada como simulación.
  - Cartograma de casillas de las 52 circunscripciones, vista por escaños y tabla buscable con la comparación con 2023.
  - Calendario del 29-N, con etiqueta, fuente y nota en cada fecha y los días que faltan calculados con la fecha de hoy. Incluye el censo.
  - Suma de los 209 senadores, con la base de cada línea.
  - Papeleta del Senado de práctica: dice si el voto es válido, en blanco o nulo.
  - Simulador de investidura: primera y segunda votación.
- Datos:
  - 32 artículos más en `data/normas.json` (119 en total).
  - 27 términos electorales en el glosario (96 en total).
  - 40 preguntas del módulo 3 (101 en total).
  - Censo del 29-N y 2 hitos nuevos en `data/convocatorias.json`.
  - 3 fuentes nuevas.
- Pruebas: 238 en total. Las nuevas cubren:
  - secciones y menú;
  - el mapa con sus 52 casillas;
  - la suma del Senado;
  - las fuentes y notas del calendario;
  - los ejercicios de la calculadora;
  - los días que faltan;
  - todas las páginas del módulo 3 en la prueba de humo;
  - cinco interacciones nuevas a 1280 y 375 px.

### Cambiado
- Las secciones con módulos se definen en `content/es/modulos.json` (`secciones`). El menú y el buscador usan la ruta de cada bloque.
- Calendario del 29-N: las 14 fechas pendientes pasan a verificadas y ya no queda ninguna. Las fuentes son:
  - el calendario de la JEC, descargado con permiso del usuario el 30-10-2026;
  - las notas de La Moncloa del 20-10-2026;
  - el BOE de 28-10-2026.
- Las tablas con textos ocultos ya no ensanchan la página en móvil (`.tabla-contenedor` posicionado).

### Verificado en esta versión
- LOREG consolidada (02-07-2026): arts. 42.1, 45, 47, 51, 69.7, 84.1, 85.1, 96, 103.1, 162, 163, 166, 176, 179, 180, 196, 210, 214, 215 y 216.
- Constitución consolidada (20-05-2026): arts. 68, 69 y 90.
- La Moncloa:
  - guía básica del 29-N y notas sobre el voto por correo y desde el extranjero (las tres del 20-10-2026);
  - guía de las europeas de 2024.
- BOE núm. 267, de 28-10-2026: candidaturas presentadas.
- Calendario electoral de la JEC para el 29-N (PDF, 9 páginas, modificado el 29-10-2026), leído completo.
- Enlaces: las 3 fuentes nuevas, confirmadas por `check_links.py`.

## 0.2.0 — 2026-10-30 — Hito H1

### Añadido
- Inicio: mapa general «Cómo se conecta todo» enlazado a los bloques y ruta recomendada en siete pasos.
- Sección «El Estado» con los módulos 1 (fundamentos, 8 bloques) y 2 (el Estado español, 8 bloques). Cada bloque sigue la plantilla 7.2: en 30 segundos, paso a paso, ejemplo cotidiano, error frecuente, datos y fuentes, «Para saber más» (modo ampliado), cuestionario y fuentes para profundizar. Incluye migas de pan, anterior y siguiente, y un botón para marcar el bloque como estudiado.
- Esquemas en HTML (pasos, comparativa, jerarquía y grupos), diagrama interactivo de relaciones entre instituciones con filtro y lista equivalente, y simulación de ejes ideológicos con partidos ficticios.
- Glosario de 69 términos: búsqueda sin mayúsculas ni tildes y con tolerancia a erratas, índice alfabético, filtros por bloque y módulo, términos relacionados y definición emergente la primera vez que un término aparece en una página.
- Cuestionarios de 4 a 6 preguntas, sin temporizador ni nota mínima, con corrección, explicación, artículo y fuente. Las opciones se barajan, salvo en verdadero o falso.
- «Mi aprendizaje»: progreso por módulo y global, últimos resultados, preguntas falladas para repasar, y exportar, importar o borrar el progreso. El menú muestra el porcentaje de la sección.
- Buscador global en la cabecera (glosario y títulos de páginas y bloques).
- Datos: `data/normas.json` (87 artículos citados), `data/glosario.json` (69), `data/preguntas.json` (61) y `data/relaciones.json` (17), con sus esquemas. 18 fuentes nuevas en `data/sources.json`.
- Pruebas: referencias cruzadas entre contenido y datos, doce búsquedas del glosario, progreso y cuestionarios, todas las páginas de bloque en la prueba de humo e interacciones (definición emergente, modo ampliado, cuestionario, marcar como estudiado, repaso de falladas, filtro de relaciones, ejes, glosario y buscador).

### Cambiado
- En pantallas estrechas, las tablas comparativas se apilan en fichas.
- Metodología y licencias: privacidad del progreso, límites del Diccionario y atribución.

### Verificado en esta versión
- Constitución consolidada (20-05-2026): los artículos citados en `data/normas.json`.
- Ley 50/1997 del Gobierno (arts. 1.2, 5.1, 21 y 24.2), Código Civil (arts. 1.2, 2.1 y 2.2), LOREG (art. 162.1) y Reglamento del Congreso (art. 79.1).
- Enlaces: las 3 fuentes nuevas del BOE, confirmadas por `check_links.py`. Las 15 entradas del Diccionario devuelven HTTP 403 al acceso automatizado. Se abrieron a mano el 29-10-2026 y figuran como no verificadas.

## 0.1.0 — 2026-10-29 — Hito H0

### Añadido
- Estructura de la web estática: `index.html` con rutas por hash, menú de once entradas, cabecera con selector de tema, pie con metodología, licencias, leyenda, aviso de independencia y fecha de actualización.
- Sistema de diseño: colores en `tokens.css` para modo claro y oscuro, diez etiquetas de fiabilidad con icono y texto, colores de institución, foco visible, objetivos táctiles de 44 px y `prefers-reduced-motion`.
- Páginas: Inicio (con la convocatoria en curso), Metodología y límites, Leyenda de etiquetas, Fuentes oficiales (versión preliminar), Licencias y atribuciones, y avisos de las secciones pendientes.
- Datos: `data/sources.json` (60 fuentes del Anexo B) y `data/convocatorias.json` (elecciones de 2026 y 2023: escaños, senadores y fechas clave).
- Esquemas JSON de los ocho tipos del Anexo C y validador con las reglas del Anexo C.3.
- Cálculos: D'Hondt con barrera y empates según la LOREG (art. 163), umbrales de mayoría, economía (T6 a T9) y encuestas (T10).
- Herramientas: `build.py`, `validate.py`, `check_links.py` y `run_tests.py`.
- Versión de un solo archivo: `dist/politica-espana.html`.

### Verificado en esta versión
- Real Decreto 806/2026: anexo de escaños, senadores (art. 3.2), votación, campaña y constitución de las Cámaras.
- Real Decreto 400/2023: anexo de escaños y senadores de 2023.
- LOREG consolidada (última modificación publicada el 02-07-2026) y Constitución consolidada (20-05-2026).
- Enlaces: 48 confirmados por `check_links.py`, 11 no verificados (con motivo) y 1 sin evaluar.
