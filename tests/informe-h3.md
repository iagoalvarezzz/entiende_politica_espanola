# Informe de verificación — Hito H3

Fecha: 04-11-2026. Versión 0.4.0.

Marcas: **Hecho** (comprobado en esta sesión), **Inferencia** (deducido de lo comprobado), **Supuesto** (adoptado sin comprobar); confianza Alta, Media o Baja.

## 1. Capacidades usadas y lo que no se pudo hacer

| Capacidad | Uso en H3 | Límite |
|---|---|---|
| Navegación web | Navegador integrado (04-11-2026):<br>• BOE consolidado: Constitución, Ley 7/1985, LOFCA, Haciendas Locales, Ley 22/2009, LGSS y Real Decreto 126/2026;<br>• EUR-Lex: TFUE y TUE;<br>• Ministerio de Política Territorial: Estatutos vigentes;<br>• Hacienda: déficit de 2025 y presupuestos de las entidades locales;<br>• INE: páginas de seis operaciones;<br>• Banco de España: deuda y euríbor;<br>• Eurostat: presión fiscal, y COFOG mediante su API;<br>• BCE: tipos oficiales;<br>• Inclusión y Trabajo: afiliación y paro de octubre.<br>Buscador web: para localizar notas. Ninguna cifra se tomó del buscador: todas se leyeron después en la fuente.<br>`check_links.py`: 25 peticiones. | No he abierto las webs que bloquean el acceso automatizado, ni he intentado sortear el desafío anti-bots de EUR-Lex en `check_links.py`. El buscador alcanzó su límite de peticiones una vez. |
| Ejecución de código | Python 3 (solo biblioteca estándar) y Chrome sin interfaz. | No hay axe ni Lighthouse. |
| Sistema de archivos | Ficheros nuevos y modificados del proyecto. | — |
| Descargas | Ninguna. | No he leído los PDF de metodología del INE, porque habría que descargarlos (decisión 8.3). |

## 2. Qué se ha construido

- **Sección «Quién decide qué»** (`#/competencias`). Contiene el módulo 4 en 6 bloques:
  - los cuatro niveles, con las 17 comunidades y 2 ciudades autónomas según la lista del Ministerio de Política Territorial;
  - el reparto por materia;
  - la financiación: LOFCA, Concierto y Convenio, y haciendas locales;
  - los ayuntamientos, con dónde consultar su presupuesto;
  - la Unión Europea: instituciones, tipos de competencias, reglamento, directiva y trasposición;
  - el repaso.
- **Sección «Economía y hacienda»** (`#/economia`). Contiene el módulo 5 en 6 bloques:
  - indicadores;
  - reglas para leer datos;
  - impuestos y Presupuestos (art. 134 CE y tramos ficticios);
  - pensiones;
  - política monetaria y fiscal, deuda pública y privada;
  - el repaso.
- **Vistas nuevas** en `js/vistas/`:
  - `competencias.js`:
    - `tabla-competencias`: 15 materias × 4 niveles, buscable sin tildes y apilada en fichas por debajo de 60em. Cada celda tiene etiqueta, artículo, fecha de consulta y enlace a la fuente.
    - `quien-decide`: 12 preguntas cotidianas. Por cada nivel muestra icono, papel, artículo, NORMA VIGENTE y fecha de consulta.
  - `economia.js`:
    - `tablero-indicadores`: último dato, periodo, fecha de publicación y de consulta, y fuente.
    - `fichas-indicadores`: 13 fichas con sus seis partes.
    - `grafico-serie`: SVG con el eje desde cero y una tabla equivalente.
    - `calculadoras-economia`: variación, nominal y real, puntos y porcentajes, media y mediana, tramos editables, y deuda sobre PIB.
- **Datos**:
  - `data/competencias.json`: 60 celdas.
  - `data/indicadores.json`:
    - 21 registros del tablero: 17 con dato y 4 pendientes, mostrados en 15 casillas;
    - 12 meses de euríbor;
    - las 10 funciones de gasto y el total.
  - 67 artículos más en `normas` (186 en total).
  - 39 términos más en el glosario (135 en total).
  - 43 preguntas más (144 en total):
    - módulo 4: 20 preguntas. Incluye las 3 de verdadero o falso pedidas y 11 sobre qué nivel o institución decide.
    - módulo 5: 23 preguntas. Incluye 12 con cifras ficticias y corrección automática, y 3 que se responden leyendo el gráfico real del euríbor.
  - 25 fuentes nuevas.
  - El esquema `dato` gana cuatro campos opcionales: `materia`, `nivel`, `normas` y `grupo`.
- **Textos actualizados**:
  - Las remisiones de los módulos 1 y 3 que anunciaban «hito H3» enlazan ahora a los bloques nuevos.
  - Se actualizan el inicio, la metodología (límites de H3) y las licencias (EUR-Lex y los gráficos propios).

## 3. Pruebas ejecutadas (salida real en `tests/ultima-ejecucion.txt`)

`python tools/run_tests.py` → **275 de 275 superadas, 0 fallos** (Hecho, Alta).

| Bloque | Pruebas | Resultado |
|---|---|---|
| Ficheros generados, validación de `data/` y casos del validador | 1 + 8 + 21 | OK. `competencias.json` e `indicadores.json` validan contra `dato`. |
| T1: integridad de tablas | 10 | OK |
| Diseño: contraste (40 pares; mínimo 4,62 en claro y 4,18 en oscuro, par no textual), tema, etiquetas y textos | 7 | OK |
| Referencias | 13 | OK. Nuevas en H3:<br>• las 60 celdas de la tabla de competencias tienen norma existente o PENDIENTE DE VERIFICAR;<br>• «¿Quién decide?» tiene 12 preguntas (mínimo 10) y cada nivel apunta a una celda;<br>• el tablero, las fichas y los gráficos apuntan a datos existentes. |
| Unitarias: D'Hondt (T2 a T5), umbrales, empates, economía y encuestas (T6 a T10), utilidades | 21 | OK |
| Glosario | 17 | OK |
| Progreso y cuestionarios | 6 | OK |
| H2: ejercicios de la calculadora, días que faltan y simulador | 3 | OK |
| Humo: 61 rutas + controles, a 1280 y 375 px | 124 | OK. Incluye las 12 páginas de bloque de los módulos 4 y 5 y sus dos portadas. |
| Interacciones, a 1280 y 375 px | 42 | OK. Las cuatro nuevas:<br>• competencias: búsqueda «policia» sin tilde, y la pregunta del IRPF con 2 niveles, icono, NORMA VIGENTE, fecha y nota;<br>• calculadoras: 3,00 %; 1,94 %; −2 puntos y −16,67 %; media 2600 y mediana 1300; cuota 6300, tipo medio 18 %, tipo marginal 30 % y +300/+700; deuda 1030 y 99,04 %. Si la base es 12.000, el marginal se recalcula al 10 %;<br>• tablero: 15 casillas, cada una con etiqueta y fuente; 13 fichas; los datos sin cargar aparecen como PENDIENTE DE VERIFICAR;<br>• gráfico del euríbor con el eje desde cero, tabla equivalente y fecha de la publicación más reciente. |
| Apertura con `file://` | 2 | OK |

Comprobador de enlaces: se ejecutó sobre las 25 fuentes nuevas; el resultado está en el punto 5.

**Fallos encontrados y corregidos durante el hito (Hecho, Alta)**

- **Desbordamiento a 375 px.** El selector de «¿Quién decide?» ensanchaba la página. Se corrigió con `max-width: 100%`. Lo detectó la prueba de humo.
- **Tabla de competencias demasiado ancha en escritorio** (cinco columnas de texto). Se apila en fichas por debajo de 60em. Lo detectó la revisión visual.
- **Fecha del gráfico del euríbor.** Mostraba la fecha de la primera nota de la serie. Ahora muestra la de la más reciente, el 03-11-2026.
- **Arnés de pruebas.** `tests/run.html` no cargaba los contenidos de los módulos 4 y 5.
- **Generación de la tabla.** Una celda sin norma podía quedar como verificada. Ahora solo se marca verificada si tiene artículos en `normas`.

**Revisión visual en el navegador integrado (Hecho, Alta)**

- La tabla de competencias en escritorio, en modo claro. De esta revisión salió el apilado por debajo de 60em.
- El gráfico del euríbor y la tabla de competencias a 800 px en oscuro: los textos, las barras y las etiquetas se leen.

**No probado**

- axe o Lighthouse.
- Lector de pantalla.
- Firefox y Safari.
- Móvil físico.

## 4. Datos cargados

Todos los datos del tablero se consultaron el 04-11-2026. El valor se muestra tal como lo publica la fuente.

| Conjunto | Fuente | Periodo | Estado | Publicación |
|---|---|---|---|---|
| 67 artículos de normas (Constitución, Ley 7/1985, LOFCA, Haciendas Locales, Ley 22/2009, LGSS, Real Decreto 126/2026, TFUE y TUE) | BOE consolidado y EUR-Lex | vigente | verificado, NORMA VIGENTE | — |
| Tabla de competencias: 60 celdas | Las normas anteriores | vigente | 48 verificadas, NORMA VIGENTE; 12 pendientes | — |
| Lista de comunidades y ciudades autónomas: 17 y 2 | Ministerio de Política Territorial | vigente | verificado | — |
| PIB: +0,6 % trimestral y +2,7 % interanual | INE, Contabilidad Nacional Trimestral | 3.er trimestre de 2026 (avance) | verificado, DATO OFICIAL | 30-10-2026 |
| PIB nominal: 1.690.012 millones de euros | INE, Contabilidad Nacional Anual | 2025 (avance) | verificado | 18-09-2026 |
| IPC: 4,9 % general y 3,1 % subyacente | INE | octubre de 2026 (indicador adelantado) | verificado | 30-10-2026 |
| Tasa de paro: 10,18 %; ocupados: 22.852,6 miles | INE, EPA | 3.er trimestre de 2026 | verificado | 27-10-2026 |
| Paro registrado: 2.422.633 | Ministerio de Trabajo | octubre de 2026 | verificado | 04-11-2026 |
| Afiliación media: 22.624.165 | Ministerio de Inclusión | octubre de 2026 | verificado | 04-11-2026 |
| Salario medio: 29.540,26 € brutos al año | INE, Encuesta Anual de Estructura Salarial | 2024 | verificado | 28-05-2026 |
| SMI: 1.221 € al mes en 14 pagas | Real Decreto 126/2026 (BOE) | 2026 | verificado | 19-02-2026 |
| Déficit: 2,18 % del PIB | Hacienda | 2025 | verificado | 31-03-2026 |
| Deuda: 99,7 % del PIB | Banco de España | agosto de 2026 (avance) | verificado | 21-10-2026 |
| Presión fiscal: 38,1 % del PIB | Eurostat | 2025 | verificado | 29-10-2026 |
| AROPE: 25,7 % | INE, Encuesta de Condiciones de Vida | 2025 | verificado | 05-02-2026 |
| Facilidad de depósito del BCE: 2,50 % | BCE | vigente desde el 16-09-2026 | verificado | — |
| Euríbor a un año: 12 meses, de 2,217 % a 3,239 % | Banco de España, notas mensuales | de noviembre de 2025 a octubre de 2026 | verificado | la última, 03-11-2026 |
| Gasto por funciones (COFOG): 10 funciones y total del 45,5 % del PIB | Eurostat, gov_10a_exp (actualizado el 21-10-2026) | 2024 (provisional) | verificado | 21-10-2026 |
| PIB per cápita, productividad, salario mediano y Gini | INE | — | pendiente, PENDIENTE DE VERIFICAR | — |
| Calculadoras y preguntas con cifras | Datos ficticios | — | ejemplo, SIMULACIÓN | — |

**Las 12 celdas pendientes de la tabla de competencias.** Necesitan Estatutos, leyes sectoriales o jurisprudencia que no he leído:
- educación, justicia, energía, inmigración, exterior y defensa, y moneda en las comunidades;
- justicia, inmigración, exterior y defensa, moneda, y agricultura y pesca en los ayuntamientos;
- vivienda en el Estado.

## 5. Enlaces

Total: 106 fuentes.

- **75 confirmadas** por `check_links.py`: las 54 anteriores y 21 de las 25 nuevas (04-11-2026).
- **31 no verificadas:**
  - 15 del Diccionario y 7 webs con HTTP 403, sin cambios desde H1;
  - **2 nuevas de EUR-Lex** (TFUE y TUE): HTTP 202, que es un desafío anti-bots. Las leí en el navegador integrado y no he intentado sortear el bloqueo;
  - 6 con HTTP 200 pero sin el texto esperado: las 4 anteriores y **2 nuevas**, el navegador de datos de Eurostat (COFOG) y la nota del Ministerio de Trabajo. Las dos se generan con JavaScript; las leí en el navegador integrado;
  - 1 raíz sin evaluar: boe-api.

Las cuatro fuentes nuevas no verificadas llevan una nota con la fecha de la lectura manual.

## 6. Tabla de simetría

No aplica en H3: no hay fichas de partidos ni de medios. Los módulos 4 y 5 no atribuyen posiciones a partidos. El debate sobre las pensiones se presenta sin posiciones cargadas.

## 7. Contradicciones y novedades

1. **Valores del 3 % y del 60 % (sección 12.2).** El encargo pide verificar el marco vigente de reglas fiscales antes de citarlos.
   - Verifiqué el Protocolo n.º 12 de los Tratados, art. 1, en EUR-Lex (Hecho, Alta).
   - No he revisado el resto del marco: la reforma de las reglas fiscales de 2024 (Supuesto, Media: lo sé de memoria y no lo he comprobado).
   - Qué muestra la web: cita los dos valores con su artículo y dice que no ha revisado el resto del marco. Ver la decisión 8.1.
2. **Déficit de 2025.** El titular de la nota de Hacienda redondea al 2,2 %; el texto da el 2,18 %. La web usa el 2,18 % y la nota de la fuente lo explica (Hecho, Alta).
3. **Gasto por funciones.** Las diez funciones suman el 45,6 % del PIB y el total publicado es el 45,5 %. La diferencia es de redondeo (Inferencia, Alta). La web muestra el total de Eurostat y lo advierte.
4. **Notas del euríbor del Banco de España.** En al menos una nota, la dirección web y el titular no dan la misma cifra. Uso la del titular y el texto de la nota (Hecho, Alta).
   - El Banco de España advierte que estos índices no son referencia oficial hasta que se publican en el BOE; la web lo repite.
5. **Esquema `dato` del Anexo C.** No prevé enlazar un dato con varios artículos ni clasificarlo por materia y nivel. Añadí cuatro campos opcionales. Los datos anteriores siguen siendo válidos (Hecho, Alta: el validador los acepta).
6. **Ley 7/1985, art. 25.2.** Solo leí la lista hasta la letra p. Por eso «justicia en los ayuntamientos» queda pendiente en lugar de deducirse (Hecho, Alta).
7. **Paro registrado (tabla de la sección 12.2).** El encargo cita al SEPE como fuente; uso la nota mensual del Ministerio de Trabajo, que publica esa misma estadística (Inferencia, Media). No he contrastado la cifra en la web del SEPE.
8. **Tarifas reales del IRPF (sección 12.3).** El encargo dice que se cargan de la Agencia Tributaria con su año. No están cargadas: la web solo usa los tramos ficticios y dice que no corresponden a ninguna tarifa vigente.

## 8. Decisiones que necesito

1. **3 % y 60 %.** ¿Reviso en EUR-Lex el marco de reglas fiscales vigente y completo el texto? ¿O retiro la mención hasta entonces?
2. **Estatutos de Autonomía.** ¿Leo en el BOE los títulos de competencias de los 19 Estatutos para completar las celdas pendientes? Educación en las comunidades es la más visible. Es lectura en HTML, sin descargas.
3. **Metodología del INE.** Las fichas se basan en las páginas de cada operación. ¿Descargo los PDF de metodología? Antes te diría el nombre y el tamaño de cada fichero.
4. **Indicadores pendientes:** PIB per cápita, productividad, salario mediano y Gini. ¿Los cargo de las tablas del INE, de una en una y sin combinar fuentes?
5. **Pensiones.** ¿Qué proyecciones muestro con la etiqueta PREVISIÓN, y con qué autores? Por ejemplo, la AIReF o el informe de envejecimiento de la Comisión Europea. Ahora no hay ninguna cargada.
6. **Tarifas del IRPF** de la Agencia Tributaria, con su año. ¿Las cargo en H4 o las dejas fuera?
7. **Condiciones de reutilización.** La web ya muestra datos del INE, el Banco de España, Eurostat, el BCE, Hacienda y dos ministerios. La página de licencias las sigue dando como pendientes. ¿Las compruebo antes de publicar?
8. **Actualización del tablero.** Los datos llevan la fecha del 04-11-2026, y algunos son provisionales: el avance del PIB, el IPC adelantado y el avance de la deuda. ¿Los actualizo al cerrar cada hito o solo antes de publicar?
9. **Pendientes de hitos anteriores:**
   - la composición de las Cámaras en la disolución;
   - la población del INE por provincia;
   - las filas A.3, A.6 y A.7 de `PROMPT.md`;
   - las fuentes académicas de ideologías;
   - los enlaces del Diccionario;
   - el canal para comunicar errores;
   - la licencia;
   - las 7 webs con HTTP 403.

## 9. Supuestos y límites

- **Tabla de competencias** (Supuesto de diseño, Alta). Resume la Constitución y las leyes estatales citadas:
  - las columnas del Estado y de las comunidades siguen los arts. 149.1 y 148.1;
  - la de los ayuntamientos sigue los arts. 25.2 y 26.1 de la Ley 7/1985;
  - la de la UE sigue los arts. 3, 4 y 6 del TFUE.
  
  Lo que asume cada comunidad depende de su Estatuto (art. 149.3 CE). El municipio ejerce sus competencias en los términos de las leyes estatales y autonómicas (Ley 7/1985, art. 25.2). La página dice las dos cosas.
- **«¿Quién decide?»** simplifica casos cotidianos. Cada respuesta cita el artículo. La página avisa de que en un caso concreto pueden intervenir otras leyes sectoriales o autonómicas.
- **Indicadores.** La web no calcula indicadores combinando fuentes: lo que no publica la fuente queda como pendiente. Los datos provisionales lo indican en el periodo (avance, adelantado o provisional).
- **Formato de las cifras.** Las calculadoras usan el formato de `Intl` para el español. No agrupa las cifras de cuatro dígitos («2600», no «2.600») (Hecho, Alta). El texto del encargo sí las agrupa.
- **Fichas de indicadores.** Las definiciones se basan en las páginas de cada operación del INE, no en sus documentos metodológicos completos (Inferencia, Media).

## 10. Fuera de H3 y propuesta de H4

Quedan fuera:
- las celdas pendientes;
- los cuatro indicadores pendientes;
- las proyecciones de pensiones;
- las tarifas reales del IRPF;
- la jurisprudencia del Tribunal Constitucional sobre vivienda;
- el resto del marco fiscal europeo.

H4, según el encargo: módulos 6 y 7, con los partidos, el comparador y los temas políticos. Es el primer hito con partidos reales y en plena campaña, así que:
- la tabla de simetría pasa a aplicarse;
- el criterio de selección de partidos (metodología) necesita que confirmes la lista;
- las webs de PP, Vox y ERC rechazan el acceso automatizado: para sus programas haría falta que me indiques otra vía o que los descargue con tu permiso.

## 11. Periodo electoral

Hay una convocatoria en curso: la votación es el 29-11-2026. Este hito no añade contenido sobre partidos, encuestas ni proyecciones. Antes de publicar la web, revisa con un jurista las implicaciones de hacerlo en periodo electoral. Son especialmente relevantes los arts. 50.4, 50.5 y 69.7 de la LOREG. Esto no es asesoramiento jurídico.
