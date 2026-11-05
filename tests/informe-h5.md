# Informe de verificación — Hito H5

Fecha: 05-11-2026. Versión 0.6.0.

Marcas: **Hecho** (comprobado en esta sesión), **Inferencia** (deducido de lo comprobado), **Supuesto** (adoptado sin comprobar); confianza Alta, Media o Baja.

## 1. Capacidades usadas y lo que no se pudo hacer

| Capacidad | Uso en H5 | Límite |
|---|---|---|
| Navegación web | Navegador integrado (05-11-2026):<br>• EurOMo España 2025 (muestra, propiedad, paralelismo político y licencia);<br>• Digital News Report España 2026 (confianza general y por marca);<br>• lista de signatarios de la IFCN y perfiles de EFE Verifica, Factico, Infoveritas, Newtral y Verificat;<br>• páginas de financiación y metodología de EFE Verifica, Infoveritas y Verificat;<br>• BOE: Ley 13/2022 (arts. 2, 9, 10, 50 y 51), Orden PCM/1030/2020 y Ley 27/2022 (arts. 2, 3, 8, 9 y 10);<br>• Código Deontológico de la FAPE (2026);<br>• CIS, página «Muestra y ponderación»;<br>• FundéuRAE: recomendaciones sobre «noticias falsas» (con «bulo») y sobre «polarizar» y «polarización», y su buscador para «sesgo», tras tu decisión del 05-11-2026.<br>Buscador web: para localizar la referencia del BOE de la Ley 27/2022 y la página de metodología del CIS. Cada dato se leyó después en la página oficial.<br>`check_links.py`: 180 peticiones, más 2 para las fuentes de la FundéuRAE, más unas 20 de un primer intento que se cortó (punto 3). | No he abierto newtral.es (HTTP 403) ni factico.org (no cargó). No he abierto las fichas técnicas del CIS ni el informe completo del Digital News Report: son PDF y abrirlos sería una descarga. |
| Ejecución de código | Python 3 (biblioteca estándar) y Chrome sin interfaz. | No hay axe ni Lighthouse. |
| Sistema de archivos | Ficheros nuevos y modificados del proyecto; generadores en el scratchpad. | — |
| Descargas | Ninguna en H5. | — |

## 2. Qué se ha construido

- **Módulo 8, «Análisis de políticas públicas y lectura de datos»**, en la sección «Temas», con 6 bloques (8.1 a 8.6). Cubre las secciones 15.1 a 15.9:
  - **8.1, ficha de ocho preguntas** (`ficha-medida`): tres medidas inventadas de Ejemplandia (abono joven, refuerzo de lectura y tasa sobre envases). Cada respuesta lleva su etiqueta o «sin información verificada», y la ficha dice qué falta para concluir; no da veredicto;
  - **8.2, objetivos, previsiones, resultados y opiniones**: tabla de los cuatro tipos y clasificador de 12 frases (3 por tipo), con corrección y explicación;
  - **8.3, causalidad y evidencia**: comparador antes-después y con grupo de comparación (`antes-despues`), editable, con el ejemplo 12→10 frente a 12→11;
  - **8.4, fuentes de evaluación**: modalidades de la Ley 27/2022 y tipos de fuente, con lo que hay que preguntar a cada una;
  - **8.5, encuestas y estadísticas**: calculadora del margen de error (`margen-error`, vector T10) y cinco trampas de las estadísticas;
  - **8.6, repaso.**
- **Sección «Información y medios»** (`#/medios`), con el módulo 9 en 6 bloques (9.1 a 9.6). Cubre las secciones 16.1 a 16.7:
  - **9.1, quién hay detrás de un medio**: servicio público y responsabilidad editorial (Ley 13/2022) y código de la FAPE;
  - **9.2, fichas de medios** (`fichas-medios`): 25 fichas con cinco apartados iguales, filtros por soporte y por tipo de propietario, ninguno por orientación; y el mapa de propiedad (`mapa-propiedad`);
  - **9.3, orientación, paralelismo y confianza**: por qué no hay etiquetas de orientación, el paralelismo según EurOMo y la confianza según el DNR 2026;
  - **9.4, páginas para contrastar y verificadores**: la tabla del Anexo D.7 y la tabla de verificadores (`fichas-verificadores`);
  - **9.5, cinco comprobaciones**: analizador de una noticia inventada (`analizador-noticia`), clasificador de 6 textos (noticia, análisis u opinión) y ejercicio de fecha y contexto (`ejercicio-revelar`);
  - **9.6, repaso.**
- **Vistas nuevas:** `js/vistas/ejercicios.js` (clasificador, revelar y analizador), `js/vistas/analisis.js` y `js/vistas/medios.js`.
- **Fuentes oficiales** (`js/vistas/fuentes.js`, sección 17.2): sin «versión preliminar»; índice de grupos con recuentos; buscador sin mayúsculas ni tildes; filtro por estado del enlace; fecha de comprobación en cada fuente.
- **Datos:**
  - `data/medios.json` (25) y `data/verificadores.json` (6);
  - normas: +10 (232);
  - glosario: +23 (177) y la definición de «evaluación de políticas», que ahora sale de la Ley 27/2022;
  - preguntas: +51 (303). El módulo 8 tiene 26 y el módulo 9, 25, con al menos 5 por bloque;
  - fuentes: +19 (183), con el repositorio del proyecto en un grupo nuevo «Proyecto».
- **Esquemas:** `verificador` (nuevo, no previsto en el Anexo C) y campos opcionales en `medio`: `tipo_propietario`, `criterio` y `pendientes`.
- **Conexión:** menú con progreso de «Temas» (m7 y m8) y de «Información y medios» (m9); `pendientes.json` sin rutas; portada, metodología, licencias, README, CHANGELOG y `PE.version` 0.6.0.

## 3. Pruebas ejecutadas (salida real en `tests/ultima-ejecucion.txt`)

`python tools/run_tests.py` → **379 de 379 superadas, 0 fallos** (Hecho, Alta).

| Bloque | Pruebas | Resultado |
|---|---|---|
| Ficheros generados, validación de `data/` (12 ficheros) y casos del validador | 1 + 12 + 21 | OK |
| T1: integridad de tablas | 10 | OK |
| Diseño: contraste (40 pares; mínimo 4,62 en claro y 4,18 en oscuro, par no textual), tema, etiquetas y textos | 7 | OK |
| Referencias | 21 | OK. Nuevas en H5:<br>• **medios:** 25 fichas con las mismas claves en el mismo orden; los 18 de EurOMo y los 18 del Anexo D.6; ninguna orientación asignada; línea editorial pendiente en todas; orden alfabético;<br>• **verificadores:** 6, con fuentes existentes y los 3 del Anexo D.7;<br>• **módulos 8 y 9:** ficha de 8 preguntas con 3 medidas, las mismas respuestas vacías y una extensión dentro del ±15 %; clasificadores de 12 y 6 frases equilibrados; ejemplos de 15.4 y 15.6; analizador con 5 comprobaciones; al menos 10 preguntas por módulo;<br>• **rutas pendientes:** ninguna. |
| Unitarias: D'Hondt (T2 a T5), umbrales, empates, economía y encuestas (T6 a T10), glosario, progreso y cuestionarios, ejercicios | 47 | OK |
| Humo con auditoría de accesibilidad: 94 rutas + controles, a 1280 y 375 px | 190 | OK. Incluye las 12 páginas de bloque de los módulos 8 y 9 y la portada de «Información y medios». |
| Interacciones, a 1280 y 375 px | 68 | OK. Las ocho nuevas:<br>• **ficha de medidas:** 3 medidas × 8 preguntas, todas con etiqueta, 2 «sin información verificada» en cada una, sin veredicto;<br>• **clasificador de 12 frases:** con 11 aciertos dice «11 de 12» y marca acierto y fallo;<br>• **antes-después:** −2, −1 y −1; si B no cambia, −2;<br>• **margen de error:** ±3,1 al 95 % con 1.000 entrevistas y ±1,5 con 4.000;<br>• **fichas de medios:** 25, cinco apartados cada una, orden alfabético, extensión dentro del ±15 %, 2 filtros y ninguno de orientación; 4 radios; 6 con propiedad sin documentar; mapa con al menos 5 grupos;<br>• **verificadores:** tabla de 4 columnas con los 6 y los 3 del Anexo D.7;<br>• **analizador:** 5 comprobaciones que muestran lo encontrado y llegan a «5 de 5», noticia con SIMULACIÓN, 6 textos y el ejercicio de fecha;<br>• **fuentes oficiales:** todas visibles (182 en la última ejecución); índice; sin «preliminar»; todas con fecha; «CONSTITUCION» encuentra la Constitución; el filtro «No verificada» muestra las 47. |
| Apertura con `file://` | 2 | OK |

**Auditoría de accesibilidad (nueva en H5).** La prueba de humo comprueba ahora en cada página y en los dos anchos (Hecho, Alta):
- que no haya saltos de nivel en los títulos;
- que `aria-controls`, `aria-labelledby`, `aria-describedby` y `label for` apunten a ids que existen;
- que cada `fieldset` tenga leyenda.

Ya comprobaba un solo `h1`, el nombre accesible de enlaces, botones, selectores y campos, los `svg` y las imágenes, los ids duplicados, el tamaño táctil de 44 px, el desplazamiento horizontal, el primer elemento enfocable y el menú con teclado.

**Fallos encontrados y corregidos durante el hito (Hecho, Alta)**

- **Salto de títulos en el ciclo de una medida (de H4).** La auditoría nueva detectó h2 → h4: el título de cada fase pasa a `h3`.
- **Desplazamiento horizontal a 375 px** en 8.1: el selector de medida medía 432 px. Se limita al ancho disponible.
- **Doble numeración** en la ficha de ocho preguntas («5. 5. ¿A quién…?»): se quitan los números del texto.
- **Punto doble** en la propiedad de TVE, RNE y COPE («S.A..»): corregido en el generador.
- **Simetría de las fichas de medios.** La primera versión iba de −27 % a +32 %, porque los avisos de «sin dato» eran más largos que los datos. Se acortaron esos avisos y los textos de criterio, y la medida excluye etiquetas y botones «Ver fuente». Ahora va de −12,9 % a +12,8 % (punto 6).
- **Primer intento de `check_links.py`.** Lo lancé con `--help`, que el script no admite. Empezó la comprobación completa y una tubería la cortó tras unas 20 peticiones, sin escribir nada. La repetí completa.

**Revisión en el navegador integrado (Hecho, Alta)**

- 8.1 en escritorio: ficha con etiquetas, «sin información verificada» y lo que falta.
- 9.2 a 375 px: 25 fichas, ficha de COPE desplegada y 13 grupos en el mapa de propiedad.

**Barrido de neutralidad (Hecho, Media).** Un script busca en todos los textos llamadas a votar, adjetivos valorativos, etiquetas ideológicas, veredictos y nombres reales en los ejemplos inventados. Dio 83 coincidencias, revisadas a mano:
- casi todas son descriptivas («se vota», «cómo funciona»);
- otras son opiniones inventadas y atribuidas en los ejercicios;
- los extremos de la escala del CHES («0 = extrema izquierda, 10 = extrema derecha») no se aplican a ningún partido.

Solo se cambió una frase: en la portada, «Vota a diputados…», que podía leerse como imperativo, pasa a «La ciudadanía vota…». El barrido busca palabras: no sustituye a una lectura completa.

**No probado**

- axe o Lighthouse, lector de pantalla, Firefox, Safari y móvil físico.
- Modo oscuro de las páginas nuevas: no revisado a ojo, aunque el contraste de los tokens pasa la prueba.

## 4. Datos cargados

| Conjunto | Fuente | Periodo | Estado | Consulta |
|---|---|---|---|---|
| Propiedad de 19 medios (sociedad y grupo) | EurOMo España 2025, tabla de la muestra y tabla de plataformas (OKDIARIO) | edición 2025 | verificado, DATO DE ESTUDIO | 05-11-2026 |
| Propiedad de 6 medios | — | — | pendiente («propiedad sin documentar») | — |
| Confianza por marca de 12 medios | Digital News Report España 2026 | 2026, con la variación frente a 2025 | verificado, DATO DE ESTUDIO | 05-11-2026 |
| Confianza general: 33 % (31 % en 2025), 42 % en las noticias elegidas; media de 48 países: 37 % confía y 29 % desconfía | Digital News Report España 2026 | 2026 | verificado, DATO DE ESTUDIO | 05-11-2026 |
| Paralelismo político «alto» | EurOMo España 2025 | edición 2025 | verificado, DATO DE ESTUDIO | 05-11-2026 |
| Sello de la IFCN de 6 servicios | Lista de signatarios y perfiles de la IFCN | fecha de consulta | verificado, DATO DE ESTUDIO | 05-11-2026 |
| Propiedad, financiación y metodología de 5 verificadores | Páginas de cada servicio y EurOMo | fecha de consulta | verificado; Factico, pendiente | 05-11-2026 |
| 10 artículos de normas | BOE: Ley 27/2022 y Ley 13/2022 | vigentes el 05-11-2026 | verificado, NORMA VIGENTE | 05-11-2026 |
| Línea editorial declarada de los 25 medios | — | — | pendiente para todos | — |
| Medidas, frases, noticia y titulares de los ejercicios; 3 medidas de la ficha | Inventados | — | ejemplo, SIMULACIÓN | — |

## 5. Enlaces

`check_links.py` completo el 05-11-2026, más las 2 fuentes de la FundéuRAE y el repositorio del proyecto, comprobados después con `--solo`. Total: 183 fuentes.

- **136 abiertas**, todas confirmadas por `check_links.py`. Ninguna de las que estaban abiertas en H4 ha dejado de estarlo (Hecho, Alta).
- **46 no verificadas por `check_links.py`**, más `boe-api`, que no tiene texto esperado y no se evalúa.
- **De las 19 fuentes nuevas, 14 abiertas y 5 no verificadas.** Las 5 son los perfiles de la IFCN: responden HTTP 200, pero se generan con JavaScript. Los abrí en el navegador integrado y llevan su nota.
- Siguen bloqueadas o sin verificar, por los mismos motivos que en H4:
  - **HTTP 403:** webs de PP, Vox, ERC, PSC, BNG, Podemos y Más Madrid; Ministerio del Interior, Infoelectoral, web del 29-N, Parlamento Europeo, Newtral, el Diccionario (15 entradas) y los parlamentos de Galicia y Navarra;
  - **EUR-Lex:** HTTP 202;
  - **páginas generadas con JavaScript o sin el texto esperado:** Junta Electoral Central (2), PSOE, Seguridad Social, Eurostat COFOG, paro registrado, datos abiertos de diputados y publicaciones del Congreso;
  - **otros:** Asamblea de Madrid (307) y Asamblea de Murcia (400).

## 6. Tabla de control de simetría (sección 4.1)

**Partidos:** sin cambios desde H4. Las 26 fichas siguen dentro del ±15 % y citan las mismas 6 fuentes; la prueba de simetría de la página sigue en verde (Hecho, Alta). La tabla completa está en `tests/informe-h4.md`.

**Medios.** Se cuentan las palabras del cuerpo de cada ficha, sin etiquetas ni botones «Ver fuente». Es la misma medida que aplica la prueba del navegador. Media: 89,6 palabras; margen permitido: ±15 %.

| Medio | Soporte | Propietario | Propiedad con fuente | Dato de audiencia | Palabras | Desviación |
|---|---|---|---|---|---|---|
| 20 Minutos | nativo digital | sin documentar | no | sí | 99 | +10,5 % |
| ABC | prensa | privado | sí | sí | 90 | +0,5 % |
| Antena 3 | televisión | privado | sí | sí | 94 | +5,0 % |
| Cadena SER | radio | privado | sí | sí | 98 | +9,4 % |
| COPE | radio | entidad religiosa | sí | no | 96 | +7,2 % |
| Cuatro | televisión | privado | sí | no | 81 | −9,6 % |
| El Confidencial | nativo digital | privado | sí | sí | 91 | +1,6 % |
| El Español | nativo digital | privado | sí | no | 82 | −8,4 % |
| El HuffPost | nativo digital | privado | sí | no | 78 | −12,9 % |
| El Mundo | prensa | privado | sí | sí | 93 | +3,8 % |
| El País | prensa | privado | sí | sí | 97 | +8,3 % |
| elDiario.es | nativo digital | privado | sí | sí | 101 | +12,8 % |
| infoLibre | nativo digital | sin documentar | no | no | 85 | −5,1 % |
| La Razón | prensa | privado | sí | no | 81 | −9,6 % |
| La Sexta | televisión | privado | sí | no | 82 | −8,4 % |
| La Vanguardia | prensa | privado | sí | no | 80 | −10,7 % |
| Libertad Digital | nativo digital | sin documentar | no | no | 86 | −4,0 % |
| OKDIARIO | nativo digital | privado | sí | sí | 100 | +11,7 % |
| Onda Cero | radio | privado | sí | sí | 94 | +5,0 % |
| Público | nativo digital | sin documentar | no | no | 85 | −5,1 % |
| RNE | radio | público | sí | no | 82 | −8,4 % |
| Telecinco | televisión | privado | sí | sí | 93 | +3,8 % |
| The Objective | nativo digital | sin documentar | no | no | 86 | −4,0 % |
| TVE (La 1) y rtve.es | televisión | público | sí | sí | 100 | +11,7 % |
| Vozpópuli | nativo digital | sin documentar | no | no | 85 | −5,1 % |

Todas quedan dentro del ±15 % (Hecho, Alta). Las fichas con dato de audiencia son algo más largas que las que no lo tienen. Es una diferencia de los datos publicados, no de la estructura: los cinco apartados son los mismos en todas.

**Medidas inventadas de la ficha de ocho preguntas:** 129, 123 y 130 palabras, con 2 respuestas «sin información verificada» cada una (Hecho, Alta).

## 7. Contradicciones y novedades

1. **Maldita.es.** La sección 16.5 pide incluirlo «si cumple el criterio de la sección 4.4». No figura en la lista de signatarios de la IFCN consultada el 05-11-2026, así que no tiene ficha; el bloque 9.4 lo dice (Hecho, Alta). Verificat sí figura y tiene ficha.
2. **Sellos caducados.** Newtral e Infoveritas figuran en la lista de la IFCN, pero su perfil da el sello como caducado: el de Newtral el 25-09-2026 y el de Infoveritas el 07-08-2026. El Anexo D.7 cita a Newtral como verificador; la web muestra el estado del perfil (Hecho, Alta).
3. **VerificaRTVE.** Lo cita el Anexo D.7, pero no figura en la lista de la IFCN consultada. Tiene ficha por el anexo, con ese estado (Hecho, Alta).
4. **EurOMo y el Anexo A.8.** Se confirma la lectura del 29-10-2026: 13 de los 18 medios del Anexo D.6 figuran en EurOMo, y no figuran Público, Libertad Digital, infoLibre, Vozpópuli ni The Objective. La muestra son 18 medios: 5 televisiones, 4 radios, 5 diarios y 4 nativos digitales, como dice la sección 4.4 (Hecho, Alta).
5. **OKDIARIO.** No está en la muestra de EurOMo. El informe lo recoge en su tabla de cuentas en plataformas digitales, con su sociedad (Dos Mil Palabras, SL). Entra por el Digital News Report y la propiedad sale de EurOMo, con esa aclaración (Hecho, Alta).
6. **Margen de error al 95 % o al 95,5 %.** El ejemplo de la sección 15.6 (±3,1 puntos) usa el 95 % (z = 1,96). Según los extractos del buscador, las fichas técnicas del CIS usan el 95,5 % (dos sigmas, z = 2), que da ±3,2 con 1.000 entrevistas. La calculadora ofrece las dos opciones. No he abierto las fichas, que son PDF (Inferencia, Media).
7. **Información y opinión.** La Ley 13/2022 exige diferenciarlas solo a los noticiarios audiovisuales (art. 9.1). Para el periodismo en general, la referencia abierta es el código de la FAPE, que es autorregulación. El bloque 9.1 lo distingue (Hecho, Alta).
8. **Definiciones del glosario.** La sección 17.1 pide definir cada término desde una fuente abierta. Trece de los términos nuevos son explicaciones didácticas de la web, apoyadas en una fuente que no da una definición literal: EurOMo, la FAPE, el CIS, la IFCN o la Ley 13/2022. Llevan EXPLICACIÓN DIDÁCTICA y su campo `articulo` lo dice. «Bulo» y «polarización» resumen dos recomendaciones de la FundéuRAE. Falta «sesgo»: la FundéuRAE no tiene ninguna recomendación que lo defina (Hecho, Alta).

## 8. Decisiones que necesito

1. **Orientación de los medios (Anexo D.6). Resuelta el 05-11-2026: descartada.** Cubría 7 de 18 medios y no tenía fuente. Cada ficha sigue diciendo «sin clasificación documentada»; el bloque 9.3 y la metodología recogen el descarte. Solo se mostraría una clasificación académica con año y metodología para todos los medios.
2. **Línea editorial declarada. Decidido el 05-11-2026: queda pendiente para los 25 medios.** No se abren las webs de los medios por ahora. Cada ficha y la metodología ya lo dicen.
3. **Propiedad de 6 medios** (Público, Libertad Digital, infoLibre, Vozpópuli, The Objective y 20 Minutos). **Decidido el 05-11-2026: sigue como «propiedad sin documentar».** No se usa el aviso legal de sus webs como fuente alternativa.
4. **Factico, Newtral y VerificaRTVE. Decidido el 05-11-2026: queda pendiente.** Siguen sin fuente la propiedad y la metodología de Factico (factico.org no cargó) y la metodología de Newtral (403) y de VerificaRTVE. La tabla de verificadores lo indica con PENDIENTE DE VERIFICAR.
5. **Glosario. Decidido el 05-11-2026: se acepta la FundéuRAE.** «Bulo» y «polarización» ya están en el glosario, con su recomendación como fuente. «Sesgo» sigue pendiente: la búsqueda en fundeu.es no da ninguna recomendación que lo defina.
6. **Reutilización. Decidido el 05-11-2026: queda pendiente.** Siguen sin comprobar las condiciones del Digital News Report y de la IFCN, además de las de H3 y H4. La web solo cita datos concretos con su fuente, y la página de licencias lo indica con PENDIENTE DE VERIFICAR. EurOMo es CC BY 4.0 y la FundéuRAE, CC BY-SA 3.0 (comprobados).
7. **Licencia. Decidido el 05-11-2026: MIT para el código y CC BY 4.0 para los textos propios.** Están en `LICENSE` y `LICENCIA-TEXTOS.md`, en la página de licencias y en el README. El titular lo has puesto tú en `LICENSE` y `LICENCIA-TEXTOS.md`.
8. **Canal de errores. Decidido el 05-11-2026: un correo electrónico visible para todos, con GitHub como opción secundaria.** El correo figura en el pie de todas las páginas y en «Cómo comunicar un error», y se configura en un solo sitio (`content/es/ui.json` → `contacto.correo`). La sección de privacidad dice para qué se usan los mensajes; el responsable del tratamiento y el plazo de conservación quedan para la revisión jurídica. Las incidencias de GitHub, con la plantilla «Error de contenido», son el canal secundario: el repositorio es https://github.com/iagoalvarezzz/entiende_politica_espanola y la página de errores enlaza con él. Publicar una dirección en una web política en campaña la expone a spam y a mensajes hostiles: si es tu correo personal, valora usar uno dedicado.
9. **Pendientes de H4**, sin cambios:
   - autodefinición de PP, Vox y ERC;
   - programas del 29-N;
   - gobiernos en los que participa cada partido;
   - investiduras y amnistía por grupo;
   - coaliciones con grupo propio;
   - Asturias;
   - diferencia de 8 escaños del Senado.
10. **Pendientes de H3 y anteriores**, sin cambios: los que lista el punto 8.9 de `tests/informe-h4.md`.

## 9. Supuestos y límites

- **Criterio de medios** (Supuesto de diseño, Alta): la muestra de EurOMo, más los del Anexo D.6 que no están en ella, más los que cita el dato de confianza por marca del DNR 2026 y no estaban ya.
- **Criterio de verificadores** (Supuesto de diseño, Alta): los españoles de la lista de la IFCN en la fecha de consulta, más los del Anexo D.7.
- **Simetría por campos** (Supuesto de diseño, Alta): la línea editorial y la orientación quedan pendientes para todos los medios, porque no pueden completarse para todos.
- **Tipo de propietario** (Supuesto, Media): «entidad religiosa» para COPE, porque EurOMo dice que la Conferencia Episcopal Española es su accionista mayoritario. «Privado» y «público» siguen la titularidad.
- **Medición de la simetría de medios** (Supuesto, Media): cuenta el texto propio de la ficha sin etiquetas ni botones, que dependen de si hay dato.
- **Ejemplos inventados.** Ninguna medida, frase, noticia ni titular de los módulos 8 y 9 es real. Los nombres de medios reales solo aparecen en las fichas y en los criterios.
- **Evaluaciones reales.** El módulo 8 no incluye medidas reales con evaluación publicada (la sección 15.1 lo permite). Habría que fijar antes el criterio de elección y equilibrar su procedencia (sección 15.8).
- **Dato de audiencia.** Es la confianza en la marca entre los encuestados del DNR, no audiencia en sentido estricto (lectores u oyentes). La web lo presenta así.

## 10. Fuera de H5 y propuesta de cierre

H5 era el último hito del encargo. Quedan fuera:
- las decisiones del punto 8;
- los datos pendientes de H3 y H4;
- las propuestas de los programas del 29-N;
- los resultados del 29-N, que solo se incorporarán cuando sean oficiales.

Propuesta de cierre, por este orden:
1. Revisión jurídica de la nota de privacidad del correo y del periodo electoral (los puntos 1 a 8 del apartado 8 ya están decididos) y, si quieres, la fuente para «sesgo».
2. Cargar los programas del 29-N para todos los partidos a la vez, cuando se publiquen.
3. Revisión con axe o Lighthouse y con lector de pantalla, si puedes ejecutarlos.
4. Publicar la versión 1.0.0.

## 11. Periodo electoral

Hay una convocatoria en curso: la votación es el 29-11-2026. Este hito añade fichas de medios reales, con propiedad y confianza documentadas, y verificadores con su estado en la IFCN. No asigna orientación a ningún medio. No contiene encuestas, estimaciones ni proyecciones de voto, ni lenguaje de recomendación.

Antes de publicar la web, revisa con un jurista las implicaciones de hacerlo en periodo electoral. Son especialmente relevantes los arts. 50.4, 50.5 y 69.7 de la LOREG. Esto no es asesoramiento jurídico.
