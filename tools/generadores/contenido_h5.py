"""H5: fuentes, normas, glosario, preguntas, textos de interfaz y secciones de los
módulos 8 y 9. Lecturas del 05-11-2026 con el navegador integrado.

Uso: python -I contenido_h5.py <raíz del proyecto>. Es idempotente.
"""
import json
import pathlib
import sys

HOY = "2026-11-05"
NAV = "Abierta con el navegador integrado el 2026-11-05."


def leer(ruta):
    return json.loads(ruta.read_text(encoding="utf-8"))


def escribir(ruta, doc):
    ruta.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")


FUENTES = [
    ("boe-ley-comunicacion-audiovisual", "Ley 13/2022, de 7 de julio, General de Comunicación Audiovisual (texto consolidado)", "Boletín Oficial del Estado",
     "norma", "normas", "Servicio público, responsabilidad editorial, información y opinión, alfabetización mediática",
     "https://www.boe.es/buscar/act.php?id=BOE-A-2022-11311", "Ley 13/2022",
     "Leídos los artículos 2, 9, 10, 50 y 51. Última actualización publicada el 03-10-2026."),
    ("boe-orden-desinformacion", "Orden PCM/1030/2020, de 30 de octubre, por la que se publica el Procedimiento de actuación contra la desinformación", "Boletín Oficial del Estado",
     "norma", "normas", "Definición de desinformación que cita la norma (Comisión Europea, COM(2018) 236)",
     "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2020-13663", "Orden PCM/1030/2020",
     "BOE núm. 292, de 5 de noviembre de 2020. La definición es la de la Comunicación de la Comisión Europea COM(2018) 236, que la orden reproduce."),
    ("boe-ley-evaluacion", "Ley 27/2022, de 20 de diciembre, de institucionalización de la evaluación de políticas públicas en la Administración General del Estado", "Boletín Oficial del Estado",
     "norma", "normas", "Definiciones de política pública, indicador y evaluación; modalidades de evaluación",
     "https://www.boe.es/buscar/act.php?id=BOE-A-2022-21677", "Ley 27/2022",
     "Leídos los artículos 2, 3, 8, 9 y 10. Texto inicial publicado el 21-12-2022, sin modificaciones."),
    ("fape-codigo", "Código Deontológico de la FAPE (aprobado en la Asamblea General de Santiago de Compostela, 2026)", "Federación de Asociaciones de Periodistas de España",
     "otro", "medios_verificacion", "Distinción entre informaciones y opiniones, verificación y cita de fuentes (autorregulación)",
     "https://fape.es/home/codigo-deontologico-1/", "Código Deontológico",
     "La dirección https://fape.es/home/codigo-deontologico/ redirige a esta."),
    ("cis-muestra-ponderacion", "CIS: metodología, muestra y ponderación", "Centro de Investigaciones Sociológicas",
     "estudio", "estadisticas", "Universo, muestra, margen de error y ponderación de las encuestas del CIS",
     "https://www.cis.es/es/estudios/metodologia/muestra-y-ponderacion", "Muestra y ponderación",
     "Página de metodología. No se han abierto fichas técnicas de estudios concretos (son PDF)."),
("fundeu-noticias-falsas", "«noticias falsas» o «falseadas», mejor que «fake news» (recomendación del 28-09-2017)", "FundéuRAE",
     "otro", "estudios_academicos", "Definición de «bulo» que recoge la recomendación",
     "https://www.fundeu.es/recomendacion/noticia-falsa-falseada-fake-news/", "noticias falsas",
     "Contenidos de la FundéuRAE con licencia Creative Commons Reconocimiento-CompartirIgual 3.0."),
    ("fundeu-polarizacion", "«polarizar» y «polarización», varios significados (recomendación del 18-12-2023)", "FundéuRAE",
     "otro", "estudios_academicos", "Significados de «polarización»",
     "https://www.fundeu.es/recomendacion/polarizar-y-polarizacion-varios-significados/", "polarización",
     "Contenidos de la FundéuRAE con licencia Creative Commons Reconocimiento-CompartirIgual 3.0. La búsqueda de «sesgo» en fundeu.es no dio ninguna recomendación que lo defina."),
]

LGCA = ("Ley 13/2022, General de Comunicación Audiovisual", "boe-ley-comunicacion-audiovisual",
        "https://www.boe.es/buscar/act.php?id=BOE-A-2022-11311", "2026-10-03", "texto consolidado vigente el 05-11-2026")
LEV = ("Ley 27/2022, de evaluación de políticas públicas", "boe-ley-evaluacion",
       "https://www.boe.es/buscar/act.php?id=BOE-A-2022-21677", "2022-12-21", "texto vigente el 05-11-2026 (sin modificaciones desde su publicación)")

NORMAS = [
    ("ley-evaluacion-2-1", LEV, "art. 2.1", "a2",
     "Política pública: conjunto de actuaciones dirigidas al interés general o a resolver un problema o necesidad públicos, en normas, planes, programas o medidas.",
     "conjunto de actuaciones dirigidas a la satisfacción del interés general o a la solución de un problema o necesidad públicos"),
    ("ley-evaluacion-2-7", LEV, "art. 2.7", "a2",
     "Indicador: dato o información que permite medir el progreso o los efectos de una política pública.",
     "Es un dato o información, individual o agrupada, que permite medir el progreso o efectos de una política pública"),
    ("ley-evaluacion-8-1", LEV, "art. 8.1", "a8",
     "La evaluación es un proceso sistemático de generación de conocimiento para alcanzar un juicio valorativo, basado en evidencias, sobre el diseño, la puesta en práctica y los efectos de una política.",
     "el proceso sistemático y razonado de generación de conocimiento"),
    ("ley-evaluacion-9-1", LEV, "art. 9.1", "a9",
     "Según su contenido, la evaluación es de diseño, de implementación o de resultados e impactos.",
     "Evaluación de resultados e impactos, que prestará especial atención a la consecución de los objetivos previamente establecidos"),
    ("ley-evaluacion-10-1", LEV, "art. 10.1", "a1-2",
     "Según la fase de la política, la evaluación es ex ante (planificación o diseño), intermedia (durante la aplicación) o ex post (tras la ejecución).",
     "Evaluación ex post, con posterioridad a la finalización de la ejecución"),
    ("lgca-2-2", LGCA, "art. 2.2", "a2",
     "Responsabilidad editorial: control efectivo sobre la selección de los programas y su organización, en un horario o en un catálogo.",
     "Ejercicio de control efectivo sobre la selección de los programas y sobre su organización"),
    ("lgca-9-1", LGCA, "art. 9.1", "a9",
     "Los noticiarios y programas informativos deben respetar la veracidad y diferenciar de forma clara entre información y opinión.",
     "diferenciando de forma clara y comprensible entre información y opinión"),
    ("lgca-10-2", LGCA, "art. 10.2", "a1-2",
     "Las medidas de alfabetización mediática buscan que la ciudadanía analice críticamente la información, distinga hechos y opiniones y reconozca la desinformación.",
     "discernir entre hechos y opiniones, reconocer las noticias falsas y los procesos de desinformación"),
    ("lgca-50", LGCA, "art. 50", "a5-2",
     "El servicio público de comunicación audiovisual es un servicio esencial de interés económico general que prestan el Estado, las comunidades autónomas y las entidades locales.",
     "prestado por el Estado, las Comunidades Autónomas y las Entidades Locales"),
    ("lgca-51-b", LGCA, "art. 51.b", "a5-3",
     "Entre las misiones del servicio público está reflejar en la programación el pluralismo político, social y cultural.",
     "Reflejar en la programación el pluralismo político, social y cultural de la sociedad"),
]

DID = "EXPLICACIÓN DIDÁCTICA"
NOR = "NORMA VIGENTE"
# (id, término, alias, bloque, definición, ejemplo, módulo, relacionados, fuente, artículo, etiqueta)
TERMINOS = [
    ("politica-publica", "Política pública", ["políticas públicas"], "temas",
     "Conjunto de actuaciones dirigidas al interés general o a resolver un problema o necesidad públicos. Puede tomar forma de norma, plan, programa o medida.",
     "Una ayuda al alquiler o un plan de becas son políticas públicas.", "m8", ["evaluacion-de-politicas", "indicador"], "boe-ley-evaluacion", "Ley 27/2022, art. 2.1", NOR),
    ("indicador", "Indicador", [], "temas",
     "Dato o información, individual o agrupada, que permite medir el progreso o los efectos de una política pública.",
     "El número de viajes de jóvenes en transporte público puede ser un indicador de un abono joven.", "m8", ["politica-publica", "evaluacion-de-politicas"], "boe-ley-evaluacion", "Ley 27/2022, art. 2.7", NOR),
    ("evaluacion-ex-ante", "Evaluación ex ante", ["ex ante"], "temas",
     "Evaluación que se hace cuando la política pública está en la fase de planificación, formulación o diseño.",
     "Estimar cuánto costará una ayuda antes de aprobarla.", "m8", ["evaluacion-ex-post", "evaluacion-de-politicas"], "boe-ley-evaluacion", "Ley 27/2022, art. 10.1.a", NOR),
    ("evaluacion-ex-post", "Evaluación ex post", ["ex post"], "temas",
     "Evaluación que se hace después de terminar la ejecución de una política pública.",
     "Medir, al acabar un programa de becas, si los becados terminaron sus estudios.", "m8", ["evaluacion-ex-ante", "evaluacion-de-politicas"], "boe-ley-evaluacion", "Ley 27/2022, art. 10.1.c", NOR),
    ("muestra", "Muestra", ["universo"], "temas",
     "Selección representativa de la población de referencia, llamada universo, a la que se hace una encuesta. Toda muestra tiene un margen de error.",
     "Una encuesta entrevista a unas pocas miles de personas para describir a millones.", "m8", ["margen-de-error", "ponderacion"], "cis-muestra-ponderacion", "CIS, Muestra y ponderación", DID),
    ("margen-de-error", "Margen de error", ["error muestral", "error de muestreo"], "temas",
     "Intervalo alrededor del resultado de una encuesta en el que estaría el valor de toda la población con cierta confianza. Depende del tamaño y del diseño de la muestra.",
     "Un 50 % con un margen de ±3,1 puntos significa, aproximadamente, entre el 46,9 % y el 53,1 %.", "m8", ["muestra"], "cis-muestra-ponderacion", "CIS, Muestra y ponderación; explicación didáctica de esta web", DID),
    ("ponderacion", "Ponderación", ["ponderar"], "temas",
     "Ajuste de una muestra comparando su composición con la de la población, por ejemplo por sexo, edad o región.",
     "Si una muestra tiene pocos jóvenes, sus respuestas cuentan más al calcular el total.", "m8", ["muestra"], "cis-muestra-ponderacion", "CIS, Muestra y ponderación", DID),
    ("medio-publico", "Medio público", ["medio público y privado", "servicio público de comunicación audiovisual"], "ideologias",
     "Medio que presta el servicio público de comunicación audiovisual. Lo prestan el Estado, las comunidades autónomas y las entidades locales.",
     "La televisión de una comunidad autónoma puede ser un servicio público de ámbito autonómico.", "m9", ["medio-privado", "responsabilidad-editorial"], "boe-ley-comunicacion-audiovisual", "Ley 13/2022, art. 50", NOR),
    ("medio-privado", "Medio privado", [], "ideologias",
     "Medio cuyo propietario es una empresa o una persona privada. El Euromedia Ownership Monitor documenta quién controla los medios de su muestra.",
     "Una cadena de radio de un grupo empresarial es un medio privado.", "m9", ["medio-publico", "propiedad-mediatica"], "euromo-espana-2025", "Explicación didáctica de esta web", DID),
    ("responsabilidad-editorial", "Responsabilidad editorial", [], "ideologias",
     "Control efectivo sobre la selección de los programas y sobre su organización, en un horario de programación o en un catálogo.",
     "Quien decide qué programas emite una cadena y a qué hora tiene la responsabilidad editorial.", "m9", ["linea-editorial", "medio-publico"], "boe-ley-comunicacion-audiovisual", "Ley 13/2022, art. 2.2", NOR),
    ("linea-editorial", "Línea editorial", [], "ideologias",
     "Criterios con los que un medio decide qué publica y cómo lo enfoca. Algunos medios la declaran en su web.",
     "Un periódico puede declarar en sus principios editoriales qué valores defiende.", "m9", ["responsabilidad-editorial", "opinion"], "boe-ley-comunicacion-audiovisual", "Explicación didáctica a partir de la Ley 13/2022, arts. 2.2 y 2.3", DID),
    ("propiedad-mediatica", "Propiedad mediática", ["propiedad de los medios"], "ideologias",
     "Quién posee y controla un medio: la sociedad que lo edita, su grupo y sus accionistas. El Euromedia Ownership Monitor la documenta por países.",
     "Dos periódicos distintos pueden pertenecer al mismo grupo.", "m9", ["medio-privado", "paralelismo-politico"], "euromo-espana-2025", "Euromedia Ownership Monitor, España 2025", DID),
    ("paralelismo-politico", "Paralelismo político", [], "ideologias",
     "Relación entre los medios y los partidos o corrientes políticas de un país. El informe EurOMo España 2025 lo califica de alto en España.",
     "Elegir a los tertulianos de un programa en coordinación con los partidos es un rasgo que ese informe asocia al paralelismo.", "m9", ["propiedad-mediatica", "linea-editorial"], "euromo-espana-2025", "Euromedia Ownership Monitor, España 2025, apartado sobre paralelismo político", DID),
    ("verificacion-de-datos", "Verificación de datos", ["fact-checking", "verificación"], "ideologias",
     "Método para comprobar si una afirmación concreta es cierta, engañosa o falsa contrastando fuentes. Los servicios de verificación publican su metodología.",
     "Comprobar en el BOE si una ley que «ya es ley» se ha publicado.", "m9", ["ifcn", "fuente-primaria", "desinformacion"], "fape-codigo", "Código Deontológico de la FAPE, apartado II; explicación didáctica de esta web", DID),
    ("desinformacion", "Desinformación", [], "ideologias",
     "Información verificablemente falsa o engañosa que se crea, presenta y divulga para obtener beneficio o engañar deliberadamente, y que puede causar un perjuicio público.",
     "Un vídeo manipulado que se difunde para engañar sobre la fecha de unas elecciones.", "m9", ["verificacion-de-datos", "alfabetizacion-mediatica"], "boe-orden-desinformacion", "Orden PCM/1030/2020, que cita la Comunicación COM(2018) 236 de la Comisión Europea", NOR),
    ("noticia", "Noticia", ["información"], "ideologias",
     "Texto que informa de hechos contrastados, con sus fuentes, separado de las opiniones.",
     "«El Parlamento aprobó ayer la ley con 180 votos a favor» es una noticia.", "m9", ["analisis", "opinion", "fuente-primaria"], "fape-codigo", "Código Deontológico de la FAPE: distinción entre informaciones y opiniones", DID),
    ("analisis", "Análisis", ["texto de análisis"], "ideologias",
     "Texto que explica el contexto, las causas o las consecuencias de unos hechos con datos e interpretaciones atribuidas. No propone qué debe hacerse.",
     "Un texto que explica por qué ha bajado el paro, con datos y especialistas citados.", "m9", ["noticia", "opinion"], "fape-codigo", "Explicación didáctica de esta web", DID),
    ("opinion", "Opinión", ["columna", "editorial", "artículo de opinión"], "ideologias",
     "Texto que valora unos hechos o propone qué debería hacerse. El código de la FAPE pide distinguirla claramente de la información.",
     "Un editorial que pide retirar una ley es opinión.", "m9", ["noticia", "analisis", "linea-editorial"], "fape-codigo", "Código Deontológico de la FAPE: distinción entre informaciones y opiniones", DID),
    ("fuente-primaria", "Fuente primaria", ["fuente original"], "ideologias",
     "Documento, dato o declaración completa de la que procede una información, como una ley publicada o una estadística oficial.",
     "La fuente primaria de un «ya es ley» es el boletín oficial que la publica.", "m9", ["noticia", "verificacion-de-datos"], "fape-codigo", "Explicación didáctica a partir del Código Deontológico de la FAPE (citar las fuentes)", DID),
    ("ifcn", "IFCN", ["International Fact-Checking Network", "Red Internacional de Verificación de Datos"], "ideologias",
     "Red internacional de verificadores (International Fact-Checking Network). Publica la lista de servicios signatarios de su código de principios.",
     "Antes de citar a un verificador, comprueba en la lista de la IFCN si su sello está vigente.", "m9", ["verificacion-de-datos"], "ifcn-signatarios", "Lista pública de signatarios de la IFCN", DID),
    ("alfabetizacion-mediatica", "Alfabetización mediática", [], "ideologias",
     "Competencias para acceder a la información y analizarla críticamente, distinguir hechos y opiniones y reconocer noticias falsas y desinformación.",
     "Comprobar la fecha y la fuente de un titular antes de compartirlo.", "m9", ["desinformacion", "verificacion-de-datos"], "boe-ley-comunicacion-audiovisual", "Ley 13/2022, art. 10.2", NOR),
("bulo", "Bulo", ["noticia falsa", "noticia falseada", "fake news"], "ideologias",
     "Noticia falsa que se difunde con algún fin. La FundéuRAE lo propone, junto a «noticia falsa», como alternativa a «fake news».",
     "Un mensaje que atribuye a una ley algo que su texto no dice, difundido para que se comparta, es un bulo.", "m9", ["desinformacion", "verificacion-de-datos"], "fundeu-noticias-falsas", "FundéuRAE, «noticias falsas» o «falseadas», mejor que «fake news» (2017)", DID),
    ("polarizacion", "Polarización", ["polarizar"], "ideologias",
     "División en dos bloques, posiciones u opiniones enfrentadas. Se usa también para situaciones con dos posturas muy distanciadas, a veces con crispación.",
     "Que un debate se reduzca a dos posturas que no se escuchan suele describirse como polarización.", "m9", ["paralelismo-politico"], "fundeu-polarizacion", "FundéuRAE, «polarizar» y «polarización», varios significados (2023)", DID),
]

ACTUALIZAR_TERMINOS = {
    "evaluacion-de-politicas": {
        "definicion": "Proceso sistemático de generación de conocimiento para valorar, con evidencias, el diseño, la aplicación y los efectos de una política pública.",
        "relacionados": ["desarrollo-reglamentario", "programa-electoral", "politica-publica", "indicador", "evaluacion-ex-ante", "evaluacion-ex-post"],
        "fuente_id": "boe-ley-evaluacion", "articulo": "Ley 27/2022, art. 8.1", "etiqueta": NOR,
    },
}


def p_unica(id_, mod, bloque, enunciado, opciones, correcta, explicacion, articulo, fuente, etiqueta):
    return {"id": id_, "modulo": mod, "bloque": bloque, "tipo": "opcion_unica", "enunciado": enunciado,
            "opciones": [{"id": k, "texto": v} for k, v in opciones], "correcta": correcta, "explicacion": explicacion,
            "articulo": articulo, "fuente_id": fuente, "etiqueta": etiqueta, "estado": "verificado"}


def p_vf(id_, mod, bloque, enunciado, verdadero, explicacion, articulo, fuente, etiqueta):
    return {"id": id_, "modulo": mod, "bloque": bloque, "tipo": "verdadero_falso", "enunciado": enunciado,
            "opciones": [{"id": "verdadero", "texto": "Verdadero"}, {"id": "falso", "texto": "Falso"}],
            "correcta": "verdadero" if verdadero else "falso", "explicacion": explicacion,
            "articulo": articulo, "fuente_id": fuente, "etiqueta": etiqueta, "estado": "verificado"}


def p_num(id_, mod, bloque, enunciado, correcta, tolerancia, explicacion, articulo, fuente, etiqueta):
    return {"id": id_, "modulo": mod, "bloque": bloque, "tipo": "numerica", "enunciado": enunciado, "correcta": correcta,
            "tolerancia": tolerancia, "explicacion": explicacion, "articulo": articulo, "fuente_id": fuente,
            "etiqueta": etiqueta, "estado": "verificado"}


S15 = "Sección 15 de esta web: método de análisis"
S16 = "Sección 16 de esta web: medios y verificación"
PREGUNTAS = [
    # Módulo 8, bloque 8.1
    p_unica("m8-ficha-1", "m8", "m8-ficha", "¿Qué escribe la ficha cuando no encuentra una fuente para una de las ocho preguntas?",
            [("a", "«Sin información verificada»"), ("b", "Nada: la pregunta desaparece"), ("c", "La respuesta más repetida en los medios")], "a",
            "Las ocho preguntas aparecen siempre. Si no hay fuente, se dice, para mostrar qué falta.", S15, "boe-ley-evaluacion", DID),
    p_vf("m8-ficha-2", "m8", "m8-ficha", "La ficha de ocho preguntas termina con un veredicto: «funciona» o «no funciona».", False,
         "La ficha resume lo que dicen las fuentes y señala qué falta para poder concluir; no da veredictos.", S15, "boe-ley-evaluacion", DID),
    p_unica("m8-ficha-3", "m8", "m8-ficha", "¿En qué pregunta de la ficha se usa la tabla de competencias?",
            [("a", "¿Qué administración tiene competencias?"), ("b", "¿Qué efectos se esperan?"), ("c", "¿Qué críticas señalan los especialistas?")], "a",
            "Saber quién decide exige el reparto de competencias del módulo 4.", S15, "boe-constitucion", DID),
    p_unica("m8-ficha-4", "m8", "m8-ficha", "¿Qué pregunta solo puede responderse con datos posteriores a la aplicación de la medida?",
            [("a", "¿Qué resultados se han observado?"), ("b", "¿Qué propone exactamente?"), ("c", "¿Qué problema pretende resolver?")], "a",
            "Un resultado observado se mide después de aplicar la medida, con la comparación que los datos permitan.", S15, "boe-ley-evaluacion", DID),
    p_vf("m8-ficha-5", "m8", "m8-ficha", "Para comparar medidas, la ficha usa las mismas ocho preguntas, en el mismo orden, para todas.", True,
         "Las mismas preguntas y la misma extensión para todas las medidas evitan tratar a unas mejor que a otras.", S15, "boe-ley-evaluacion", DID),
    # 8.2
    p_unica("m8-afirmaciones-1", "m8", "m8-afirmaciones", "«La ley pretende reducir el paro juvenil». ¿Qué tipo de afirmación es?",
            [("a", "Un objetivo"), ("b", "Un resultado observado"), ("c", "Una previsión")], "a",
            "«Pretende» indica lo que se quiere lograr. No dice que el paro juvenil haya bajado.", S15, "boe-ley-evaluacion", DID),
    p_unica("m8-afirmaciones-2", "m8", "m8-afirmaciones", "«La oficina presupuestaria de Ejemplandia calcula que la medida costará 200 millones». ¿Qué etiqueta lleva?",
            [("a", "PREVISIÓN"), ("b", "DATO OFICIAL"), ("c", "INTERPRETACIÓN ATRIBUIDA")], "a",
            "Es un cálculo sobre el futuro hecho por un organismo identificado: una previsión.", S15, "boe-ley-evaluacion", DID),
    p_unica("m8-afirmaciones-3", "m8", "m8-afirmaciones", "¿Qué etiqueta lleva un resultado observado?",
            [("a", "DATO OFICIAL o DATO DE ESTUDIO, según quién lo publique"), ("b", "PROPUESTA"), ("c", "PREVISIÓN")], "a",
            "Si lo publica una administración es DATO OFICIAL; si lo publica otra entidad, DATO DE ESTUDIO.", S15, "boe-ley-evaluacion", DID),
    p_vf("m8-afirmaciones-4", "m8", "m8-afirmaciones", "Si una ley dice que pretende reducir algo, eso demuestra que se ha reducido.", False,
         "Un objetivo no es un resultado. Lo que ha pasado se mide después, con datos.", S15, "boe-ley-evaluacion", DID),
    p_unica("m8-afirmaciones-5", "m8", "m8-afirmaciones", "«Para la asociación de comerciantes, la tasa es injusta». ¿Qué etiqueta lleva?",
            [("a", "INTERPRETACIÓN ATRIBUIDA"), ("b", "DATO DE ESTUDIO"), ("c", "NORMA VIGENTE")], "a",
            "Es una valoración de un actor identificado: se atribuye a quien la hace.", S15, "boe-ley-evaluacion", DID),
    # 8.3
    p_num("m8-causalidad-1", "m8", "m8-causalidad", "El paro de la región A baja del 12 % al 10 % tras una medida; el de B, que no la aplicó, del 12 % al 11 %. Si A habría evolucionado como B, ¿cuántos puntos se atribuyen a la medida?",
          1, 0, "A baja 2 puntos y B baja 1. La diferencia, 2 − 1 = 1 punto, es lo atribuible a la medida bajo esa condición.", S15, "boe-ley-evaluacion", DID),
    p_num("m8-causalidad-2", "m8", "m8-causalidad", "Mirando solo la región A, cuyo paro baja del 12 % al 10 %, ¿cuántos puntos baja?",
          2, 0, "12 − 10 = 2 puntos. Es el cambio total, no lo que se debe a la medida.", S15, "boe-ley-evaluacion", DID),
    p_unica("m8-causalidad-3", "m8", "m8-causalidad", "Tras aprobar una medida, baja el paro. ¿Qué conclusión es correcta?",
            [("a", "Puede haber otras causas, como el ciclo económico; hace falta una comparación"), ("b", "La medida ha bajado el paro"), ("c", "La medida no ha tenido efecto")], "a",
            "Que dos cosas cambien a la vez no prueba que una cause la otra.", S15, "boe-ley-evaluacion", DID),
    p_unica("m8-causalidad-4", "m8", "m8-causalidad", "En general, ¿qué evidencia pesa más?",
            [("a", "Una revisión sistemática de evaluaciones con grupo de comparación"), ("b", "Un estudio aislado"), ("c", "Una anécdota bien contada")], "a",
            "Las revisiones sistemáticas y las evaluaciones con grupo de comparación pesan más que un estudio aislado, y este más que una anécdota.", S15, "boe-ley-evaluacion", DID),
    p_vf("m8-causalidad-5", "m8", "m8-causalidad", "Si dos estudios sobre la misma medida discrepan, uno de los dos tiene que estar mintiendo.", False,
         "Pueden discrepar porque estudian poblaciones, periodos o métodos distintos.", S15, "boe-ley-evaluacion", DID),
    # 8.4
    p_unica("m8-fuentes-1", "m8", "m8-fuentes", "Además de su conclusión, ¿qué hay que saber de una evaluación?",
            [("a", "Quién la elabora y la financia, su método, su año y sus limitaciones"), ("b", "Solo si coincide con lo que ya pensabas"), ("c", "Cuántas veces la han citado en redes sociales")], "a",
            "Sin saber quién la hizo, quién la pagó y cómo, no se puede valorar una evaluación.", S15, "boe-ley-evaluacion", DID),
    p_vf("m8-fuentes-2", "m8", "m8-fuentes", "Si solo hay una evaluación de una medida, la web lo dice.", True,
         "Se buscan al menos dos evaluaciones independientes; si solo hay una, se indica.", S15, "boe-ley-evaluacion", DID),
    p_unica("m8-fuentes-3", "m8", "m8-fuentes", "Según la Ley 27/2022, ¿cuándo se hace una evaluación ex post?",
            [("a", "Después de terminar la ejecución de la política"), ("b", "Durante la planificación"), ("c", "Antes de presentar el proyecto de ley")], "a",
            "La ley distingue la evaluación ex ante, la intermedia y la ex post, que se hace tras la ejecución.", "Ley 27/2022, art. 10.1", "boe-ley-evaluacion", NOR),
    p_unica("m8-fuentes-4", "m8", "m8-fuentes", "Según la Constitución, ¿qué órgano es el supremo fiscalizador de las cuentas y de la gestión económica del Estado?",
            [("a", "El Tribunal de Cuentas"), ("b", "El Defensor del Pueblo"), ("c", "El Banco de España")], "a",
            "Lo dice el artículo 136. Fiscalizar las cuentas no es lo mismo que medir si una política logra su objetivo.", "art. 136.1", "boe-constitucion", NOR),
    p_vf("m8-fuentes-5", "m8", "m8-fuentes", "Los informes de fundaciones y grupos de interés se presentan con su financiación y su orientación declaradas.", True,
         "Igual que con los medios: quién financia un informe es contexto para leerlo.", S15, "boe-ley-evaluacion", DID),
    # 8.5
    p_num("m8-encuestas-1", "m8", "m8-encuestas", "Con 1.000 entrevistas, muestreo aleatorio simple y un 50 % de respuestas afirmativas, ¿cuál es el margen de error aproximado al 95 % de confianza, en puntos?",
          3.1, 0.1, "1,96 × √(0,5 × 0,5 ÷ 1.000) ≈ 0,031, es decir, unos ±3,1 puntos. Los diseños reales lo modifican.", S15, "cis-muestra-ponderacion", DID),
    p_num("m8-encuestas-2", "m8", "m8-encuestas", "Un indicador pasa de 2 a 4 casos. ¿En qué porcentaje ha aumentado?",
          100, 0, "(4 − 2) ÷ 2 = 1, un 100 % más. En términos absolutos son solo dos casos más.", S15, "ine", DID),
    p_unica("m8-encuestas-3", "m8", "m8-encuestas", "¿Para qué sirve dar una cifra por cada 100.000 habitantes?",
            [("a", "Para comparar lugares con poblaciones de distinto tamaño"), ("b", "Para que la cifra parezca mayor"), ("c", "Para ocultar el número absoluto")], "a",
            "Una tasa divide por la población: así una ciudad grande y un pueblo se pueden comparar.", S15, "ine", DID),
    p_unica("m8-encuestas-4", "m8", "m8-encuestas", "Una encuesta da un 48 % a una opción y un 50 % a otra, con un margen de ±3 puntos. ¿Qué se puede decir?",
            [("a", "La diferencia está dentro del margen: la muestra no permite saber cuál es mayor"), ("b", "Gana claramente la segunda opción"), ("c", "La encuesta está mal hecha")], "a",
            "Con ±3 puntos, el 48 % puede estar entre 45 y 51 y el 50 %, entre 47 y 53: los intervalos se solapan.", S15, "cis-muestra-ponderacion", DID),
    p_vf("m8-encuestas-5", "m8", "m8-encuestas", "Un estudio publicado por una administración pública se etiqueta como DATO OFICIAL.", True,
         "El de una administración es DATO OFICIAL; el de otra entidad, DATO DE ESTUDIO.", "Sección 3.1 de esta web: etiquetas", "ine", DID),
    p_unica("m8-encuestas-6", "m8", "m8-encuestas", "¿Qué es una estimación de voto?",
            [("a", "Un cálculo, con un modelo, sobre el resultado de unas elecciones"), ("b", "Lo que responde cada persona entrevistada"), ("c", "El resultado oficial del escrutinio")], "a",
            "Una encuesta recoge respuestas; una estimación de voto las transforma con un modelo. Esta web no publica estimaciones del 29-N.", S15, "cis", DID),
    # Módulo 9, bloque 9.1
    p_vf("m9-idea-1", "m9", "m9-idea", "Saber quién es el propietario de un medio demuestra por sí solo que una noticia es parcial.", False,
         "La propiedad es contexto empresarial. Lo que se comprueba es la noticia: su fuente, su fecha y sus hechos.", S16, "euromo-espana-2025", DID),
    p_unica("m9-idea-2", "m9", "m9-idea", "Según la Ley 13/2022, ¿quién presta el servicio público de comunicación audiovisual?",
            [("a", "El Estado, las comunidades autónomas y las entidades locales"), ("b", "Solo el Estado"), ("c", "Cualquier empresa con licencia")], "a",
            "El artículo 50 lo define como un servicio esencial de interés económico general prestado por esas tres administraciones.", "Ley 13/2022, art. 50", "boe-ley-comunicacion-audiovisual", NOR),
    p_unica("m9-idea-3", "m9", "m9-idea", "¿Qué es la responsabilidad editorial según la Ley 13/2022?",
            [("a", "El control efectivo sobre la selección de los programas y su organización"), ("b", "La obligación de no publicar opiniones"), ("c", "La propiedad de las acciones del medio")], "a",
            "Lo define el artículo 2.2: quien elige y organiza los programas tiene la responsabilidad editorial.", "Ley 13/2022, art. 2.2", "boe-ley-comunicacion-audiovisual", NOR),
    p_unica("m9-idea-4", "m9", "m9-idea", "¿Qué exige la Ley 13/2022 a los noticiarios?",
            [("a", "Diferenciar de forma clara y comprensible entre información y opinión"), ("b", "No entrevistar a cargos públicos"), ("c", "Publicar la opinión de su propietario")], "a",
            "El artículo 9.1 pide veracidad y una diferencia clara entre información y opinión.", "Ley 13/2022, art. 9.1", "boe-ley-comunicacion-audiovisual", NOR),
    p_unica("m9-idea-5", "m9", "m9-idea", "¿Qué ofrece esta web sobre cada medio?",
            [("a", "Datos con su fuente, para que cada persona juzgue"), ("b", "Una nota de fiabilidad"), ("c", "Una etiqueta de orientación política")], "a",
            "La web no da veredictos sobre medios ni les asigna orientación.", S16, "euromo-espana-2025", DID),
    # 9.2
    p_unica("m9-fichas-1", "m9", "m9-fichas", "¿Qué dice la ficha de un medio que no figura en EurOMo cuando no se ha abierto otra fuente?",
            [("a", "«Propiedad sin documentar»"), ("b", "El propietario más probable"), ("c", "Nada: el medio no tiene ficha")], "a",
            "Ningún medio se omite: lo que falta se dice en la ficha.", S16, "euromo-espana-2025", DID),
    p_vf("m9-fichas-2", "m9", "m9-fichas", "El dato de confianza del Digital News Report que aparece en cada ficha describe a la audiencia, no al medio.", True,
         "Es lo que responden los encuestados sobre la marca; no mide la calidad del medio.", "Digital News Report España 2026", "dnr-espana-2026-confianza", "DATO DE ESTUDIO"),
    p_unica("m9-fichas-3", "m9", "m9-fichas", "¿Por qué las fichas no tienen un filtro por orientación política?",
            [("a", "Porque la web no asigna orientación y no hay una clasificación documentada para todos los medios"), ("b", "Porque todos los medios tienen la misma orientación"), ("c", "Porque la orientación es secreta")], "a",
            "Una orientación solo se mostraría con fuente académica, año y método, y para todos a la vez.", S16, "euromo-espana-2025", DID),
    p_unica("m9-fichas-4", "m9", "m9-fichas", "¿De dónde salen los datos del mapa de propiedad?",
            [("a", "Del Euromedia Ownership Monitor, edición de 2025"), ("b", "De las webs de los partidos"), ("c", "De la impresión de quien hizo la web")], "a",
            "El mapa recoge sociedad, grupo y año según EurOMo, sin completar lo que el informe no recoge.", "Euromedia Ownership Monitor, España 2025", "euromo-espana-2025", "DATO DE ESTUDIO"),
    p_num("m9-fichas-5", "m9", "m9-fichas", "De los 18 medios que propone el Anexo D.6, ¿cuántos figuran en EurOMo España 2025?",
          13, 0, "Figuran 13. No figuran Público, Libertad Digital, infoLibre, Vozpópuli ni The Objective.", "Euromedia Ownership Monitor, España 2025", "euromo-espana-2025", "DATO DE ESTUDIO"),
    # 9.3
    p_unica("m9-orientacion-1", "m9", "m9-orientacion", "¿Cómo califica el informe EurOMo España 2025 el paralelismo político de los medios españoles?",
            [("a", "Alto"), ("b", "Inexistente"), ("c", "No lo estudia")], "a",
            "El informe afirma que sigue siendo alto y cita estudios académicos, el Media Pluralism Monitor y el Digital News Report.", "Euromedia Ownership Monitor, España 2025", "euromo-espana-2025", "DATO DE ESTUDIO"),
    p_num("m9-orientacion-2", "m9", "m9-orientacion", "Según el Digital News Report España 2026, ¿qué porcentaje confía en las noticias en general?",
          33, 0, "El 33 %, frente al 31 % de 2025 y al 37 % de media en 48 países.", "Digital News Report España 2026", "dnr-espana-2026-confianza", "DATO DE ESTUDIO"),
    p_unica("m9-orientacion-3", "m9", "m9-orientacion", "Según el Digital News Report España 2026, ¿qué recibe más confianza?",
            [("a", "Las noticias que cada persona elige (42 %)"), ("b", "Las noticias en general (33 %)"), ("c", "Las dos, por igual")], "a",
            "El 42 % confía en las noticias que elige, frente al 33 % que confía en las noticias en general.", "Digital News Report España 2026", "dnr-espana-2026-confianza", "DATO DE ESTUDIO"),
    p_vf("m9-orientacion-4", "m9", "m9-orientacion", "La web muestra una orientación aproximada para algunos medios aunque no la tenga para todos.", False,
         "No se publica ninguna orientación hasta tenerla, con el mismo formato y con fuente, para todos los medios.", S16, "euromo-espana-2025", DID),
    p_unica("m9-orientacion-5", "m9", "m9-orientacion", "¿Qué haría falta para mostrar la orientación política de un medio en su ficha?",
            [("a", "Una fuente académica con año y metodología, y lo mismo para todos los medios"), ("b", "Que lo diga mucha gente"), ("c", "Que lo diga un partido")], "a",
            "Sin fuente, año y método, cada ficha dice «sin clasificación documentada».", S16, "euromo-espana-2025", DID),
    # 9.4
    p_unica("m9-contrastar-1", "m9", "m9-contrastar", "¿Para qué sirve congreso.es?",
            [("a", "Para comprobar qué ha votado cada partido y las iniciativas registradas"), ("b", "Para saber si una medida funciona"), ("c", "Para medir la confianza en los medios")], "a",
            "Una fuente oficial comprueba qué se ha votado; para saber si una medida funciona hacen falta evaluaciones.", S16, "congreso-votaciones-xv", DID),
    p_unica("m9-contrastar-2", "m9", "m9-contrastar", "Ante un «ya es ley», ¿dónde compruebas su publicación y su entrada en vigor?",
            [("a", "En el BOE"), ("b", "En las redes sociales del Gobierno"), ("c", "En un servicio de verificación")], "a",
            "El BOE publica la norma y su texto dice cuándo entra en vigor.", S16, "boe-constitucion", DID),
    p_unica("m9-contrastar-3", "m9", "m9-contrastar", "¿Para qué no sirve un servicio de verificación?",
            [("a", "Para valorar la línea editorial de un medio entero"), ("b", "Para comprobar una afirmación concreta"), ("c", "Para conocer su metodología publicada")], "a",
            "Un verificador comprueba afirmaciones concretas según su metodología.", S16, "ifcn-signatarios", DID),
    p_vf("m9-contrastar-4", "m9", "m9-contrastar", "Si un verificador figura en la lista de la IFCN, su sello está necesariamente vigente hoy.", False,
         "Los sellos caducan. En la consulta del 5 de noviembre de 2026, el de Newtral y el de Infoveritas figuraban como caducados en sus perfiles.", "Perfiles de la IFCN consultados el 05-11-2026", "ifcn-signatarios", "DATO DE ESTUDIO"),
    p_unica("m9-contrastar-5", "m9", "m9-contrastar", "Según su perfil en la IFCN consultado el 5 de noviembre de 2026, ¿qué servicio tenía el sello vigente?",
            [("a", "Verificat"), ("b", "Newtral"), ("c", "Infoveritas")], "a",
            "El sello de Verificat era válido hasta el 18 de mayo de 2027; los de Newtral e Infoveritas habían caducado.", "Perfil de Verificat en la IFCN", "ifcn-perfil-verificat", "DATO DE ESTUDIO"),
    # 9.5
    p_unica("m9-comprobaciones-1", "m9", "m9-comprobaciones", "¿Cuál es la primera de las cinco comprobaciones?",
            [("a", "Buscar la fuente original: el documento, dato o declaración completa"), ("b", "Mirar cuántas personas la han compartido"), ("c", "Ver quién es el propietario del medio")], "a",
            "Lo primero es saber qué hay detrás de la noticia y enlazarlo.", S16, "fape-codigo", DID),
    p_unica("m9-comprobaciones-2", "m9", "m9-comprobaciones", "«Columna. Esta ley es un error y el Gobierno debería retirarla». ¿Qué tipo de texto es?",
            [("a", "Opinión"), ("b", "Noticia"), ("c", "Análisis")], "a",
            "Valora y propone qué hacer. El código de la FAPE pide distinguir con claridad las informaciones de las opiniones.", S16, "fape-codigo", DID),
    p_unica("m9-comprobaciones-3", "m9", "m9-comprobaciones", "Un titular cierto de hace años circula hoy sin fecha. ¿Qué es?",
            [("a", "Engañoso: fue cierto, pero se presenta fuera de su contexto"), ("b", "Falso"), ("c", "Una noticia de hoy")], "a",
            "Un hecho real presentado como reciente induce a error. Mira siempre la fecha de publicación.", S16, "fape-codigo", DID),
    p_vf("m9-comprobaciones-4", "m9", "m9-comprobaciones", "Una acusación publicada en un medio equivale a una condena.", False,
         "Una acusación no es una condena: la Constitución reconoce a todos el derecho a la presunción de inocencia.", "art. 24.2", "boe-constitucion", NOR),
    p_unica("m9-comprobaciones-5", "m9", "m9-comprobaciones", "Según la Orden PCM/1030/2020, que cita a la Comisión Europea, ¿qué rasgo tiene la desinformación?",
            [("a", "Es información verificablemente falsa o engañosa que se difunde para obtener beneficio o engañar deliberadamente"), ("b", "Es cualquier error de un periodista"), ("c", "Es cualquier opinión con la que no se está de acuerdo")], "a",
            "La definición exige falsedad o engaño verificable e intención de lucro o de engañar, y que pueda causar un perjuicio público.", "Orden PCM/1030/2020", "boe-orden-desinformacion", NOR),
]

UI_EJERCICIOS = {
    "comprobar": "Comprobar", "correcto": "Correcto.", "incorrecto": "No es correcto.", "sin_responder": "Sin responder.",
    "es": "Es {categoria}:", "aciertos": "{n} de {total} correctas.", "pregunta": "Pregunta:", "ver_respuesta": "Ver la respuesta",
    "que_encontramos": "Qué se encuentra:", "progreso": "{n} de {total} comprobaciones hechas.",
    "instrucciones_analizador": "Marca cada comprobación al hacerla. Al marcarla verás lo que se encuentra.",
}
UI_ANALISIS = {
    "elige_medida": "Medida:", "sin_informacion": "sin información verificada.",
    "entrevistas": "Número de entrevistas", "porcentaje": "Porcentaje de respuestas afirmativas (%)", "confianza": "Nivel de confianza",
    "error_datos": "Revisa los datos: hacen falta números válidos.",
    "margen_resultado": "Margen de error: ±{m} puntos, con un nivel de confianza del {confianza}.",
    "margen_aviso": "Fórmula del muestreo aleatorio simple. Las encuestas reales usan cuotas y ponderación, que cambian el margen.",
    "a_antes": "Grupo A (aplica la medida), antes (%)", "a_despues": "Grupo A, después (%)",
    "b_antes": "Grupo B (no la aplica), antes (%)", "b_despues": "Grupo B, después (%)",
    "resultado_antes": "Cambio en A: {a} puntos. Cambio en B: {b} puntos. Diferencia atribuible a la medida: {d} puntos.",
    "condicion": "La diferencia solo es atribuible a la medida si, sin ella, A habría evolucionado como B.",
    "antes_aviso": "Datos ficticios. Cambia los valores para ver cómo cambia la conclusión.",
}
UI_MEDIOS = {
    "soportes": {"prensa": "Prensa", "television": "Televisión", "radio": "Radio", "nativo_digital": "Nativo digital"},
    "titularidades": {"publica": "público", "privada": "privado"},
    "propietarios": {"publico": "Público", "privado": "Privado", "iglesia": "Entidad religiosa", "sin_documentar": "Propiedad sin documentar"},
    "partes": ["1. Identidad", "2. Propiedad y control", "3. Línea editorial declarada", "4. Audiencia", "5. Orientación política"],
    "identidad": "{nombre}. Soporte: {soporte}. Carácter: {titularidad}.",
    "criterios": {"euromo": "Entra por la muestra de EurOMo España 2025.",
                  "anexo": "Entra por la lista del Anexo D.6.",
                  "dnr": "Entra por el Digital News Report España 2026."},
    "edicion": "(EurOMo, edición {anio}.)",
    "audiencia": "Confía en sus noticias el {v} % de los encuestados en {periodo}.",
    "sin_audiencia": "Sin dato publicado de audiencia.",
    "orientacion_nota": "La web no asigna orientación política a ningún medio.",
    "filtro_soporte": "Soporte:", "filtro_propietario": "Tipo de propietario:", "todos": "Todos",
    "recuento": "{n} de {total} medios.",
    "aviso_orientacion": "Las fichas no puntúan ni clasifican. No hay filtro por orientación porque la web no asigna orientación a ningún medio.",
    "mapa_intro": "Grupos y sociedades de los medios de la muestra de EurOMo España 2025, con el número de medios con ficha en esta web.",
    "sin_documentar": "Propiedad sin documentar",
    "verificadores_titulo": "Servicios de verificación",
    "verificadores_columnas": ["Servicio", "Sello de la IFCN", "Propiedad y financiación", "Metodología publicada"],
    "sin_propiedad": "No se ha podido abrir una fuente sobre su propiedad.",
    "sin_metodologia": "No se ha podido abrir su página de metodología.",
}

SECCION_MEDIOS = {
    "id": "medios", "ruta": "/medios", "titulo": "Información y medios",
    "intro": [
        "Quién hay detrás de cada medio, qué páginas sirven para contrastar y cinco comprobaciones ante una noticia.",
        "Las fichas tienen la misma estructura para todos los medios. La web no asigna orientación política ni dice qué medios son fiables."
    ],
    "pie": "Los ejemplos de noticias son inventados: no hay titulares reales ni nombres de medios, partidos o personas.",
    "modulos": ["m9"],
}
MODULOS = [
    {"id": "m8", "titulo": "Módulo 8. Análisis de políticas públicas y lectura de datos", "titulo_corto": "Módulo 8",
     "objetivo": "Un método para analizar una medida, distinguir objetivos de resultados y leer encuestas y estadísticas.",
     "bloques": ["m8-ficha", "m8-afirmaciones", "m8-causalidad", "m8-fuentes", "m8-encuestas", "m8-repaso"]},
    {"id": "m9", "titulo": "Módulo 9. Medios de comunicación y verificación", "titulo_corto": "Módulo 9",
     "objetivo": "Saber quién hay detrás de un medio, dónde contrastar y cómo detectar una noticia manipulada.",
     "bloques": ["m9-idea", "m9-fichas", "m9-orientacion", "m9-contrastar", "m9-comprobaciones", "m9-repaso"]},
]


def main(raiz):
    raiz = pathlib.Path(raiz)
    # Fuentes.
    ruta = raiz / "data" / "sources.json"
    doc = leer(ruta)
    ids = {r["id"] for r in doc["registros"]}
    for (id_, titulo, inst, tipo, grupo, uso, url, esperado, nota) in FUENTES:
        if id_ in ids:
            continue
        doc["registros"].append({"id": id_, "titulo": titulo, "institucion": inst, "tipo": tipo, "grupo": grupo, "uso": uso, "url": url,
                                 "texto_esperado": esperado, "estado_enlace": "abierta", "comprobado_por": "navegador",
                                 "fecha_comprobacion": HOY, "nota": (NAV + " " + nota).strip()})
    doc["meta"].update(version="0.6.0", actualizado=HOY)
    escribir(ruta, doc)

    # Normas.
    ruta = raiz / "data" / "normas.json"
    doc = leer(ruta)
    doc["registros"] = [r for r in doc["registros"] if r["id"] not in {n[0] for n in NORMAS}]
    for (id_, (norma, fuente, url, fpub, periodo), art, ancla, valor, cita) in NORMAS:
        doc["registros"].append({"id": id_, "conjunto": "normas", "norma": norma, "articulo": art, "valor": valor, "cita": cita,
                                 "unidad": "sin unidad", "periodo": periodo, "fuente_id": fuente, "url": url, "ancla": ancla,
                                 "fecha_publicacion": fpub, "fecha_consulta": HOY, "estado": "verificado", "etiqueta": "NORMA VIGENTE"})
    doc["meta"].update(version="0.6.0", actualizado=HOY)
    escribir(ruta, doc)

    # Glosario.
    ruta = raiz / "data" / "glosario.json"
    doc = leer(ruta)
    nuevos = {t[0] for t in TERMINOS}
    doc["registros"] = [r for r in doc["registros"] if r["id"] not in nuevos]
    for r in doc["registros"]:
        if r["id"] in ACTUALIZAR_TERMINOS:
            r.update(ACTUALIZAR_TERMINOS[r["id"]])
    for (id_, termino, alias, bloque, definicion, ejemplo, modulo, rel, fuente, art, etiqueta) in TERMINOS:
        doc["registros"].append({"id": id_, "termino": termino, "alias": alias, "bloque": bloque, "definicion": definicion,
                                 "ejemplo": ejemplo, "modulo": modulo, "relacionados": rel, "fuente_id": fuente,
                                 "articulo": art, "etiqueta": etiqueta, "disputado": False})
    doc["meta"].update(version="0.6.0", actualizado=HOY,
                       descripcion="Glosario de los módulos 1 a 9. Definiciones a partir de normas del BOE, de la información oficial de La Moncloa, del Diccionario de la lengua española y, en los módulos 8 y 9, del CIS, del informe EurOMo, de la IFCN, del código de la FAPE y de la FundéuRAE.")
    escribir(ruta, doc)

    # Preguntas.
    ruta = raiz / "data" / "preguntas.json"
    doc = leer(ruta)
    doc["registros"] = [r for r in doc["registros"] if r["modulo"] not in ("m8", "m9")] + PREGUNTAS
    doc["meta"].update(version="0.6.0", actualizado=HOY,
                       descripcion="Bancos de preguntas de los módulos 1 a 9: comprensión, con explicación, artículo y fuente.")
    escribir(ruta, doc)

    # Textos de interfaz.
    ruta = raiz / "content" / "es" / "ui.json"
    ui = leer(ruta)
    ui["ejercicios"], ui["analisis"], ui["medios"] = UI_EJERCICIOS, UI_ANALISIS, UI_MEDIOS
    for m in ui["menu"]:
        if m["ruta"] == "/temas":
            m["modulos"] = ["m7", "m8"]
        if m["ruta"] == "/medios":
            m.pop("hito", None)
            m["modulos"] = ["m9"]
    ui["pie"]["version"] = "Versión {version} (hito H5)."
    escribir(ruta, ui)

    # Secciones y módulos.
    ruta = raiz / "content" / "es" / "modulos.json"
    cfg = leer(ruta)
    for s in cfg["secciones"]:
        if s["id"] == "estado":
            s["pie"] = "¿Cómo seguir una noticia política? Lo explica la sección [Información y medios](#/medios)."
        if s["id"] == "temas":
            s["modulos"] = ["m7", "m8"]
            s["intro"] = [
                "Nueve temas con la misma estructura: el problema, quién decide, qué se propone, qué dicen los datos y qué sigue abierto.",
                "Empieza por el ciclo de una medida y sigue con el módulo 8: cómo analizar una medida y leer encuestas y estadísticas."
            ]
            s["pie"] = "Los ejemplos del módulo 8 son medidas inventadas. La web no valora medidas ni analiza propuestas de las candidaturas del 29-N."
    cfg["secciones"] = [s for s in cfg["secciones"] if s["id"] != "medios"] + [SECCION_MEDIOS]
    cfg["modulos"] = [m for m in cfg["modulos"] if m["id"] not in ("m8", "m9")] + MODULOS
    escribir(ruta, cfg)

    # Rutas pendientes: ninguna.
    escribir(raiz / "content" / "es" / "pendientes.json", {"rutas": []})
    print(f"{len(FUENTES)} fuentes, {len(NORMAS)} normas, {len(TERMINOS)} términos, {len(PREGUNTAS)} preguntas")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main(sys.argv[1])
