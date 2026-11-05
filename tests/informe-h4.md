# Informe de verificación — Hito H4

Fecha: 05-11-2026. Versión 0.5.0.

Marcas: **Hecho** (comprobado en esta sesión), **Inferencia** (deducido de lo comprobado), **Supuesto** (adoptado sin comprobar); confianza Alta, Media o Baja.

## 1. Capacidades usadas y lo que no se pudo hacer

| Capacidad | Uso en H4 | Límite |
|---|---|---|
| Navegación web | Navegador integrado (04 y 05-11-2026):<br>• congreso.es: datos abiertos de diputados y votaciones, grupos y publicaciones oficiales;<br>• senado.es: grupos y las 311 fichas de senadores de la XV Legislatura;<br>• BOE: resultados de 2023 y 2024, Constitución, 16 leyes y 3 sentencias del Tribunal Constitucional;<br>• webs de 16 parlamentos autonómicos;<br>• chesdata.eu;<br>• webs de 5 partidos, para buscar sus programas.<br>Buscador web: para localizar referencias del BOE; cada dato se leyó después en el BOE.<br>`check_links.py`: 58 peticiones. | No he abierto las webs que bloquean el acceso automatizado: PP, Vox, ERC, Ministerio del Interior, Parlamento Europeo y Junta General del Principado de Asturias (403 anti-bots). |
| Ejecución de código | Python 3 (biblioteca estándar) y Chrome sin interfaz. Lectura de JSON del Congreso en memoria. | No hay axe ni Lighthouse. |
| Sistema de archivos | Ficheros nuevos y modificados del proyecto; descargas en carpetas propias del scratchpad. | — |
| Descargas (con tu permiso) | • **Congreso:** 111 JSON de votaciones (3.686.727 bytes) y 7 ZIP de sesión (8.690.487 bytes).<br>• **CHES 2024:** CSV (99.668 bytes) y libro de códigos (356.182 bytes).<br>• **Senado:** XML «Composición desde 1977» (1.236.629 bytes). | 30 de los 111 JSON no se usan: la primera lista estaba mal clasificada (punto 7.3). El XML del Senado no traía partido ni fechas, y no se usa. Los ZIP de las investiduras solo traen un gráfico. |

Además leí en memoria, sin guardarlos, los dos JSON de diputados del Congreso. Para medir su tamaño, el servidor me envió entero un JSON de votación (31.834 bytes); te lo dije el 04-11-2026.

## 2. Qué se ha construido

- **Sección «Partidos»** (`#/partidos`), con el módulo 6 en 6 bloques (6.1 a 6.6). Siguen la plantilla 7.2 y cubren la sección 13.1:
  - partido, federación, coalición, agrupación de electores y candidatura;
  - inscripción, financiación y Tribunal de Cuentas;
  - grupos parlamentarios y Grupo Mixto;
  - estatal y autonómico;
  - afiliados, votantes y escaños;
  - programa frente a acción de gobierno.
- **Fichas** (`js/vistas/partidos.js`, esquema `fichas-partidos`):
  - 26 fichas con las mismas siete partes, el mismo orden y las mismas 6 fuentes;
  - buscador sin tildes, filtros por ámbito y por cámara;
  - orden alfabético por siglas o por escaños en el Congreso el 06-10-2026;
  - marca neutra: las siglas, con el mismo tamaño y peso para todas.
- **Descripción paralela:** seis frases con los mismos verbos para todas (sección 13.4). No se usan las frases del Anexo D.5.
- **Comparador** (`comparador-propuestas`):
  - filas por tema y columnas por partido; por defecto, la lista mínima;
  - no suma ni puntúa;
  - las 72 celdas dicen lo mismo para todos: programa del 29-N pendiente.
- **Efecto territorial** (`efecto-territorial`): escaños por circunscripción de cada candidatura en 2023 (BOE) y un ejemplo ficticio calculado con `PE.calc.dhondt`. A y B tienen el mismo 12 %; A obtiene 2 escaños y B ninguno.
- **Tabla de simetría** (`tabla-simetria`): se calcula en la propia página.
- **Sección «Temas»** (`#/temas`), con el módulo 7 en 12 bloques:
  - **7.1, ciclo de una medida** (`js/vistas/temas.js`, `ciclo-medida`): ocho fases con su prueba y su etiqueta, sobre una medida inventada de Ejemplandia;
  - **7.2 a 7.10, los nueve temas** de la sección 14.3: cinco preguntas, «¿Quién decide?» incrustado, marco legal verificado, datos oficiales (tablero), comparador del tema y lo que sigue abierto;
  - **7.11, temas disputados:** los doce de la sección 4.6 en una tabla común;
  - **7.12, repaso.**
- **«¿Quién decide?»** reutiliza preguntas del módulo 4 con `{ desde, ids }`. El módulo 4 gana cuatro preguntas: vivienda, juzgados, medio ambiente y energía.
- **Datos:**
  - `data/partidos.json` (26) y `data/votaciones.json` (76);
  - normas: +36 (222);
  - glosario: +19 (154), con el bloque nuevo «Temas políticos»;
  - preguntas: +108 (252). El módulo 6 tiene 26 y el módulo 7, 82: al menos 8 por tema, con los ejercicios de clasificar frases por fase y por etiqueta;
  - fuentes: +58 (164).
- **Esquemas:**
  - `partido`: campos opcionales `denominacion_fuente`, `ambito_criterio`, `resultados_2023`, `fuentes`, `pendientes` y `web.fuente_id`;
  - `votacion`: esquema nuevo, no previsto en el Anexo C;
  - `meta.contexto`;
  - glosario: bloque `temas`.

## 3. Pruebas ejecutadas (salida real en `tests/ultima-ejecucion.txt`)

`python tools/run_tests.py` → **331 de 331 superadas, 0 fallos** (Hecho, Alta).

| Bloque | Pruebas | Resultado |
|---|---|---|
| Ficheros generados, validación de `data/` (10 ficheros) y casos del validador | 1 + 10 + 21 | OK |
| T1: integridad de tablas | 10 | OK |
| Diseño: contraste (40 pares; mínimo 4,62 en claro y 4,18 en oscuro, par no textual), tema, etiquetas y textos | 7 | OK |
| Referencias | 17 | OK. Nuevas en H4:<br>• «¿Quién decide?» con 16 preguntas, reutilizadas en 9 temas;<br>• partidos: 26 fichas con las mismas fuentes; 350 diputados, 257 senadores de partido y 57 eurodiputados de candidatura propia;<br>• votaciones: 3 + 56 + 17; en las 68 con desglose, los grupos suman el total oficial;<br>• temas: 9 con «¿Quién decide?», comparador y al menos 8 preguntas;<br>• ciclo: 8 fases con su etiqueta. |
| Unitarias: D'Hondt (T2 a T5), umbrales, empates, economía y encuestas (T6 a T10), glosario, progreso y cuestionarios, ejercicios | 47 | OK |
| Humo: 81 rutas + controles, a 1280 y 375 px | 164 | OK. Incluye las 18 páginas de bloque de los módulos 6 y 7 y sus dos portadas. |
| Interacciones, a 1280 y 375 px | 52 | OK. Las cinco nuevas:<br>• **fichas:** 26; orden alfabético; misma estructura; «bildu»; estatales = PP, PSOE, Vox, Sumar, Podemos y SALF; 7 con escaño europeo propio; orden por escaños; 76 votaciones en UPN y ninguna en Podemos;<br>• **comparador:** 8 columnas, 9 temas y 72 celdas pendientes; columna nueva al marcar BNG; simetría sin desviaciones;<br>• **efecto territorial:** A = 2, B = 0; PP en 52 circunscripciones con 137 escaños;<br>• **ciclo:** 8 fases; PROPUESTA en la 1; NORMA VIGENTE en la 5; avance;<br>• **vivienda:** «¿Quién decide?» con sus dos preguntas, 3 datos y 1 fila del comparador. |
| Apertura con `file://` | 2 | OK |

**Fallos encontrados y corregidos durante el hito (Hecho, Alta)**

- **Clasificación de votaciones.** La primera lectura de las páginas del Congreso tomaba el texto de tarjetas que agrupan varias votaciones. Varias de «tramitación como proyecto de ley» salieron como convalidaciones.
  - Solución: rehíce la lectura asociando cada JSON a su propio título.
  - La lista buena tiene 77 entradas, que quedan en 76 votaciones al unir la votación repetida del RDL 8/2023. Hubo que pedirte 31 JSON más.
- **Lista de senadores incompleta.** La lectura en paralelo perdió letras: 213 enlaces de 311. Se repitió letra a letra.
- **«¿Quién decide?» en las pruebas.** La comprobación de H3 suponía que todas las preguntas estaban escritas en el esquema. Ahora admite las reutilizadas y comprueba que existan.
- **Esquema de metadatos.** No admitía datos comunes del conjunto. Se añadió `meta.contexto`.

**Revisión visual en el navegador integrado (Hecho, Alta)**

- Ficha del BNG y ciclo de una medida a 800 px en claro.
- Comparador a 375 px: sin desplazamiento horizontal y apilado en fichas.
- Las 20 páginas nuevas, sin errores en la consola.

**No probado**

- axe o Lighthouse, lector de pantalla, Firefox, Safari y móvil físico.
- Modo oscuro de las páginas nuevas: no revisado a ojo, aunque el contraste de los tokens pasa la prueba.

### Tabla de control de simetría (sección 4.1)

Descripción paralela: media de 74,7 palabras. Margen permitido: ±15 %.

| Siglas | Palabras | Desviación | Fuentes | Votaciones | Propuestas |
|---|---|---|---|---|---|
| ADELANTE ANDALUCÍA | 76 | +1,8 % | 6 | 0 | 0 |
| AHI | 73 | −2,2 % | 6 | 0 | 0 |
| ASG | 71 | −4,9 % | 6 | 0 | 0 |
| BNG | 76 | +1,8 % | 6 | 76 | 0 |
| CCa | 75 | +0,5 % | 6 | 76 | 0 |
| CCPV (Compromís) | 70 | −6,2 % | 6 | 0 | 0 |
| CHA | 70 | −6,2 % | 6 | 0 | 0 |
| COMUNS | 69 | −7,6 % | 6 | 0 | 0 |
| CUP | 76 | +1,8 % | 6 | 0 | 0 |
| EAJ-PNV | 78 | +4,5 % | 6 | 76 | 0 |
| EH Bildu | 77 | +3,1 % | 6 | 76 | 0 |
| ERC | 77 | +3,1 % | 6 | 76 | 0 |
| GBAI | 75 | +0,5 % | 6 | 0 | 0 |
| JUNTS | 76 | +1,8 % | 6 | 76 | 0 |
| MÁS MADRID | 71 | −4,9 % | 6 | 0 | 0 |
| MÉS | 71 | −4,9 % | 6 | 0 | 0 |
| NC-bc | 76 | +1,8 % | 6 | 0 | 0 |
| PODEMOS | 72 | −3,6 % | 6 | 0 | 0 |
| PP | 75 | +0,5 % | 6 | 76 | 0 |
| PRC | 74 | −0,9 % | 6 | 0 | 0 |
| PSC | 79 | +5,8 % | 6 | 76 | 0 |
| PSOE | 77 | +3,1 % | 6 | 76 | 0 |
| SALF | 78 | +4,5 % | 6 | 0 | 0 |
| SUMAR | 77 | +3,1 % | 6 | 76 | 0 |
| UPN | 77 | +3,1 % | 6 | 76 | 0 |
| VOX | 75 | +0,5 % | 6 | 76 | 0 |

Todas las fichas quedan dentro del ±15 % y citan las mismas 6 fuentes (Hecho, Alta).

Las votaciones solo existen para las 12 formaciones con grupo propio o con diputado propio en el Grupo Mixto; es una diferencia de los datos, no de la estructura de la ficha. Las propuestas son 0 para todos hasta los programas del 29-N.

## 4. Datos cargados

| Conjunto | Fuente | Periodo | Estado | Consulta |
|---|---|---|---|---|
| Diputados por formación electoral y grupo: 350 | Datos abiertos del Congreso (137 en activo + 213 con baja el 06/10/2026) | disolución, 06-10-2026 | verificado, DATO OFICIAL | 04 y 05-11-2026 |
| Senadores por partido: 258, de ellos 1 independiente | Fichas de senado.es: «Baja (disolución): 05/10/2026» o Diputación Permanente | disolución | verificado | 05-11-2026 |
| Escaños europeos por candidatura: 61 | BOE-A-2024-13092 (JEC) | elecciones del 9-6-2024 | verificado | 04-11-2026 |
| Resultados de las generales por candidatura y circunscripción | BOE-A-2023-18907 (JEC), cuadros II y III | 23-7-2023 | verificado | 04 y 05-11-2026 |
| Grupos propios en 16 parlamentos autonómicos | Webs de cada parlamento | composición actual | verificado | 04 y 05-11-2026 |
| Clasificación de 13 partidos | CHES 2024 (`CHES_2024_final_v2.csv`) | encuesta de octubre y noviembre de 2024 | verificado, DATO DE ESTUDIO | 04-11-2026 |
| 76 votaciones: 68 con desglose por grupo y 8 solo con el total | Datos abiertos del Congreso | XV Legislatura | verificado, DATO OFICIAL | 04-11-2026 |
| 36 artículos de normas y 3 sentencias del Tribunal Constitucional | BOE | vigentes | verificado, NORMA VIGENTE / DATO OFICIAL | 04 y 05-11-2026 |
| Datos de los temas (gasto COFOG, paro, AROPE, etc.) | Los de H3 | — | verificado | 04-11-2026 |
| Ejemplos del ciclo y del efecto territorial; 25 preguntas | Ficticios | — | ejemplo, SIMULACIÓN | — |

## 5. Enlaces

Total: 164 fuentes.

- **122 abiertas**:
  - 47 confirmadas por `check_links.py` entre las 58 nuevas;
  - 75 anteriores.
- **42 no verificadas.** Las 11 nuevas son:
  - 4 webs de partido con HTTP 403: PSC, BNG, Podemos y Más Madrid;
  - Parlamento de Galicia y Parlamento de Navarra con HTTP 403;
  - Asamblea de Madrid con HTTP 307 y Asamblea de Murcia con HTTP 400;
  - datos abiertos de diputados y de votaciones del Congreso, y la página del BOCG: se generan con JavaScript.

  Todas las páginas de Congreso y parlamentos que usan las fichas se abrieron en el navegador integrado y llevan su nota.
- **Webs de partido confirmadas:** 15 de 26.
  - Sin dirección localizada: AHI, ASG y SALF.
  - Con dirección pero sin confirmar: PP, PSOE, Vox, ERC, PSC, BNG, Podemos y Más Madrid. Se muestran como texto con PENDIENTE DE VERIFICAR.

## 6. Tabla de simetría

La de partidos está en el punto 3, dentro de márgenes. La de medios no aplica todavía: el módulo de medios es de H5.

## 7. Contradicciones y novedades

1. **Reforma del Reglamento del Congreso** de 23-07-2026 (BOE-A-2026-16353; leída su nota en el texto consolidado, no la disposición). Cambia desde la XVI Legislatura la excepción para formar grupo:
   - antes: 15 % de los votos de las circunscripciones donde se presentaron o 5 % nacional;
   - después: media del 10 % en las circunscripciones donde obtengan representación o 3 % nacional.

   El bloque 6.2 lo explica (Hecho, Alta).
2. **Investiduras y amnistía sin desglose.** Las votaciones por llamamiento (3 investiduras y 2 de la amnistía) y tres de reales decretos-ley no tienen el voto de cada diputado en los datos abiertos: los ZIP solo traen un gráfico con el total. Las fichas dan el total oficial y lo dicen (Hecho, Alta).
3. **Primera lista de votaciones mal clasificada.** Corregida antes de usarla (punto 3). Los 30 JSON sobrantes no se usan (Hecho, Alta).
4. **Senado: 258 frente a 266.** Las fichas con baja por disolución o sin baja suman 258 senadores. La diferencia de 8 puede deberse a vacantes, pero no lo he comprobado (Inferencia, Baja). La web da las cifras «según las fichas» y lo explica en la metodología.
5. **XML del Senado.** El fichero «Composición desde 1977» no trae partido ni fechas de baja: no servía para lo que te pedí descargarlo (Hecho, Alta).
6. **Anexo D.5 frente al estado actual de las webs** (`check_links.py`, 04 y 05-11-2026):
   - pp.es: el anexo la daba como abierta (solo la raíz); ahora da 403;
   - junts.cat: el anexo la daba como no verificada; ahora está abierta;
   - psoe.es: sigue sin verificar.

   Prevalece la comprobación (Hecho, Alta).
7. **Ámbito estatal o autonómico.** La ley no define estas categorías. La web usa un criterio operativo declarado:
   - candidatura en más de la mitad de las circunscripciones en 2023;
   - si no la hubo, la candidatura propia a las europeas de 2024.

   Con él, EH Bildu (Navarra y País Vasco) queda como autonómico (Supuesto de diseño, Media).
8. **Parlamento Europeo.** Su web rechaza el acceso automatizado. La ficha da los escaños de la elección de 2024 según el BOE, no la composición el 06-10-2026, y lo dice. Los escaños de las coaliciones (Ahora Repúblicas, 3; CEUS, 1) no se atribuyen a cada partido (Hecho, Alta).
9. **Podemos.** Sus diputados fueron elegidos en la candidatura SUMAR y los datos abiertos registran la formación electoral, no el partido. La web no le atribuye votaciones ni escaños en el Congreso (Hecho, Alta).
10. **PRC.** El Parlamento de Cantabria solo publica el nombre del grupo («Regionalista»). «Partido Regionalista de Cantabria» y «PRC» no tienen una fuente oficial abierta en esta sesión. La web de prc.es se confirmó con el texto «Regionalista» (Inferencia, Media).
11. **BOCG.** congreso.es lo publica con esa sigla en «Publicaciones oficiales». El desarrollo «Boletín Oficial de las Cortes Generales» no aparece en la página leída (Inferencia, Alta).
12. **Familias de CHES.** Los nombres originales están en inglés («Radical Right», «Regionalist»…). La traducción entre paréntesis es mía (Inferencia, Alta). CHES clasifica a ERC, Junts, EH Bildu, PNV, BNG, CC y UPN como «Regionalist».

## 8. Decisiones que necesito

1. **Autodefinición de PP, Vox y ERC.** Sus webs bloquean el acceso automatizado, así que la autodefinición está pendiente para los 26. ¿Me pasas sus estatutos o su declaración de principios? Si no, ¿prefieres quitar esa parte de todas las fichas?
2. **Programas del 29-N.** Cuando se publiquen, ¿te pido permiso para descargarlos (nombre y tamaño de cada PDF)? Los de PP, Vox y ERC tendrías que pasármelos tú. Hasta entonces el comparador y las propuestas siguen pendientes para todos.
3. **Gobiernos en los que participa cada partido.** No he encontrado una fuente oficial que asocie gobiernos y partidos. ¿Acepto la web de cada gobierno autonómico (nombramientos en su boletín) o dejamos la parte vacía para todos?
4. **Investiduras y amnistía por grupo.** Las votaciones por llamamiento deberían figurar nominalmente en el Diario de Sesiones (PDF), pero no lo he comprobado. ¿Descargo los diarios de las sesiones afectadas (hasta 7)? Te diría antes el nombre y el tamaño de cada uno.
5. **Coaliciones con grupo propio.** Son Por Andalucía, Unidas por Extremadura, Contigo Navarra y Podemos-IU en La Rioja. ¿Las añado con ficha propia o las dejo como nota, como ahora?
6. **Asturias.** Su parlamento bloquea el acceso. ¿Me pasas la lista de grupos de la Junta General o la dejamos sin comprobar?
7. **Senado.** ¿Investigo la diferencia de 8 escaños (vacantes) o basta con la nota?
8. **Reutilización.** Las condiciones de los datos abiertos del Congreso, del Senado y del CHES están sin comprobar, igual que las de H3.
9. **Pendientes de hitos anteriores.** Siguen abiertos:
   - de H3: 3 % y 60 %, Estatutos, metodología del INE, cuatro indicadores, proyecciones de pensiones, tarifas del IRPF y actualización del tablero;
   - de antes: composición de las Cámaras, que ahora ya se muestra en la disolución; población del INE; filas A.3, A.6 y A.7 de `PROMPT.md`; fuentes académicas de ideologías; Diccionario; canal de errores; licencia.

## 9. Supuestos y límites

- **Unidad de la ficha** (Supuesto de diseño, Alta):
  - una ficha por partido o agrupación de electores; las coaliciones no tienen ficha propia;
  - el PSOE agrupa sus federaciones (PSE-EE, PsdeG, PSIB, PSN);
  - el PSC tiene ficha propia porque concurre con su propia candidatura.
- **Simetría por campos** (Supuesto de diseño, Alta): un campo que no puede completarse para todos queda pendiente para todos.
- **Votaciones** (Supuesto de diseño, Alta):
  - se atribuyen por grupo parlamentario;
  - en el Grupo Mixto, solo a BNG, CCa y UPN;
  - el diputado elegido por VOX que pasó al Mixto en julio de 2026 no se atribuye a VOX desde ese día.
- **Medición de la simetría** (Supuesto, Media): se mide la descripción paralela, no los listados de datos, que dependen de los datos de cada partido.
- **Temas.** Usan datos ya verificados en H3. Precios de la vivienda, listas de espera, estadística judicial, migraciones y emisiones están pendientes de su fuente.
- **Ejemplo territorial.** Es ficticio y lo calcula la calculadora probada en H0 a H2.

## 10. Fuera de H4 y propuesta de H5

Quedan fuera:
- las propuestas de los programas del 29-N;
- autodefinición y gobiernos;
- el desglose de las votaciones por llamamiento;
- las coaliciones con grupo;
- Asturias;
- los datos de los temas que siguen pendientes;
- las posiciones atribuidas en los temas disputados.

H5 propuesto, según el encargo:
- módulo 8, análisis de políticas públicas y lectura de datos y encuestas;
- módulo 9, información y medios, con fichas de medios y su tabla de simetría y verificadores;
- página completa de fuentes oficiales;
- revisión final de accesibilidad, neutralidad y enlaces.

También, completar H4 cuando estén los programas.

## 11. Periodo electoral

Hay una convocatoria en curso: la votación es el 29-11-2026. Este hito publica, por primera vez, fichas de partidos reales con datos oficiales, clasificación académica y votaciones. No contiene encuestas, estimaciones ni proyecciones, y ningún lenguaje de recomendación.

Antes de publicar la web, revisa con un jurista las implicaciones de hacerlo en periodo electoral. Son especialmente relevantes los arts. 50.4, 50.5 y 69.7 de la LOREG. Esto no es asesoramiento jurídico.
