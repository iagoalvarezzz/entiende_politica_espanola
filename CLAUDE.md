# Entender la política española: instrucciones de trabajo

Web educativa, estática y sin dependencias para entender la política española desde cero. Se publica con GitHub Pages desde la rama `main`: **todo lo que se une a `main` se publica al momento**. Hay elecciones generales convocadas para el 29-11-2026.

El encargo completo (`PROMPT.md`) no está en el repositorio. Si necesitas una sección concreta, pídesela al autor; no la reconstruyas de memoria.

## Cómo trabajar

- Escribe en español, directo y sin relleno. Usa tablas para comparar.
- Trabaja en una rama propia y entrega un pull request. No unas nada a `main` ni hagas push a `main` sin el visto bueno expreso del autor.
- Los JSON de `data/` y `content/es/` son la fuente de verdad. `data/*.js`, `content/es/*.js` y `dist/` los genera `tools/build.py`: no los edites a mano.
- Comandos:
  - `python tools/build.py`: genera los envoltorios y `dist/politica-espana.html`;
  - `python tools/validate.py`: valida `data/` contra `data/schemas/`;
  - `python tools/run_tests.py`: todas las pruebas; las de interfaz necesitan Chrome o Edge (`PE_NAVEGADOR`). Si no puedes ejecutarlas, dilo como «no probado»;
  - `python tools/check_links.py --solo id1,id2`: comprueba fuentes concretas y escribe su estado;
  - `python tools/neutralidad.py`: barrido de expresiones que hay que revisar a mano.
- Antes de entregar, las pruebas deben pasar. No digas que algo está probado o verificado si no lo has hecho.
- Versión en `js/core/pe.js` (`PE.version`) y en `CHANGELOG.md`. Cada hito se cierra con `tests/informe-hN.md`, que marca cada afirmación como Hecho, Inferencia o Supuesto, con confianza Alta, Media o Baja.
- Los generadores históricos están en `tools/generadores/`; lee su README antes de usarlos.

## Neutralidad

- La web no recomienda votos, no puntúa partidos y no los clasifica.
- Las fichas de partidos y de medios tienen la misma estructura y las mismas fuentes, y una extensión parecida (±15 %; lo comprueban las pruebas). El orden por defecto es alfabético.
- Si un campo no puede completarse para todos, queda pendiente para todos.
- No asignes orientación política a partidos ni a medios. Solo se muestra una clasificación académica con fuente, año y metodología, y para todos a la vez. La orientación aproximada sin fuente del Anexo D.6 está descartada.
- No publiques encuestas, estimaciones ni proyecciones de voto del 29-N. Nunca entre el 24 y el 28 de noviembre (LOREG, art. 69.7).
- Los ejemplos y simuladores usan casos inventados (el país de Ejemplandia, partidos A, B, C…), con la etiqueta SIMULACIÓN y sin nombres reales.
- Los términos disputados se definen con atribución y no se aplican como etiqueta a partidos.
- Cada afirmación relevante lleva una de las diez etiquetas: DATO OFICIAL, DATO DE ESTUDIO, NORMA VIGENTE, EXPLICACIÓN DIDÁCTICA, SIMULACIÓN, PROPUESTA, PREVISIÓN, INTERPRETACIÓN ATRIBUIDA, ESTIMACIÓN DEL AUTOR y PENDIENTE DE VERIFICAR.

## Fuentes

- Cada dato lleva su fuente en `data/sources.json`, con fecha de consulta y botón «Ver fuente». Lee la fuente antes de afirmar algo; nunca de memoria.
- Los textos de `content/es/` no pueden llevar direcciones externas: los enlaces externos van siempre por `data/sources.json` (lo comprueba una prueba).
- El estado de cada enlace lo escribe `tools/check_links.py`, no se rellena a mano.
- Las citas literales tienen como máximo 25 palabras.
- Las definiciones del glosario salen de una fuente abierta: una o dos frases de menos de 25 palabras cada una.

## Permisos y límites

- Pide permiso al autor antes de descargar cualquier fichero, indicando nombre, origen y tamaño. Incluye los ficheros de datos (JSON, ZIP, XML, PDF) aunque solo se lean en memoria.
- No esquives los bloqueos de acceso automatizado. Rechazan el acceso, entre otros: las webs de PP, Vox, ERC, PSC, BNG, Podemos y Más Madrid, el Ministerio del Interior, Infoelectoral, la web del 29-N, el Parlamento Europeo, Newtral, el Diccionario de la RAE y los parlamentos de Asturias, Galicia y Navarra. EUR-Lex devuelve HTTP 202. Si una fuente bloquea el acceso, déjala como no verificada y pide el fichero al autor.
- No publiques datos personales. El único correo que aparece en la web es el de `contacto.correo` en `content/es/ui.json`.

## Periodo electoral

Cada entrega termina con este aviso: «Antes de publicar, revisa con un jurista las implicaciones de hacerlo en periodo electoral (votación el 29-11-2026), en especial los arts. 50.4, 50.5 y 69.7 de la LOREG. Esto no es asesoramiento jurídico.»

## Decisiones del autor vigentes (05-11-2026)

- Las propuestas de los partidos esperan a los programas del 29-N, para todos a la vez.
- La línea editorial declarada de los medios queda pendiente para los 25.
- La propiedad de Público, Libertad Digital, infoLibre, Vozpópuli, The Objective y 20 Minutos sigue «sin documentar»: no se usa el aviso legal de sus webs como fuente.
- Quedan pendientes la propiedad y la metodología que faltan de Factico, Newtral y VerificaRTVE.
- La FundéuRAE se acepta como fuente del glosario. «Sesgo» sigue sin fuente.
- Las condiciones de reutilización del Digital News Report y de la IFCN quedan sin comprobar.
- Licencias: MIT para el código y CC BY 4.0 para los textos propios.
- Canal de errores: el correo de la web y, como opción secundaria, las incidencias de GitHub.
- Pendiente: la nota de privacidad del correo (responsable del tratamiento y plazo de conservación) y la revisión jurídica antes de la versión 1.0.0.
