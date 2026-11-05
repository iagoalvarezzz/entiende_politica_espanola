"""H4: fuentes, esquemas, data/partidos.json y data/votaciones.json.

Uso: python -I datos_h4.py <raíz del proyecto> <votaciones generadas (json)>
Es idempotente. Los hechos están en h4_hechos.md (scratchpad).
"""
import json
import pathlib
import sys

HOY = "2026-11-05"
AYER = "2026-11-04"
NAV4 = "Abierta con el navegador integrado el 2026-11-04."
NAV5 = "Abierta con el navegador integrado el 2026-11-05."
REF = "2026-10-06"

# (id, título, institución, tipo, grupo, uso, url, texto esperado, nota, fecha)
FUENTES = [
    ("boe-lopp", "Ley Orgánica 6/2002, de 27 de junio, de Partidos Políticos (texto consolidado)", "Boletín Oficial del Estado", "norma", "normas",
     "Creación, inscripción, funcionamiento democrático y disolución de los partidos", "https://www.boe.es/buscar/act.php?id=BOE-A-2002-12756", "Partidos Políticos",
     "Última actualización publicada el 02/08/2024. Artículos 1, 3, 4, 6, 7 y 10 leídos.", AYER),
    ("boe-lofpp", "Ley Orgánica 8/2007, de 4 de julio, sobre financiación de los partidos políticos (texto consolidado)", "Boletín Oficial del Estado", "norma", "normas",
     "Recursos de los partidos y fiscalización del Tribunal de Cuentas", "https://www.boe.es/buscar/act.php?id=BOE-A-2007-13022", "financiación de los partidos políticos",
     "Última actualización publicada el 30/05/2024. Artículos 1, 2, 14, 16 y 17 leídos.", AYER),
    ("boe-reglamento-senado", "Texto refundido del Reglamento del Senado (1994, texto consolidado)", "Boletín Oficial del Estado", "norma", "normas",
     "Grupos parlamentarios del Senado", "https://www.boe.es/buscar/act.php?id=BOE-A-1994-10830", "Reglamento del Senado",
     "Última actualización publicada el 14/11/2025. Artículo 27 leído.", AYER),
    ("boe-ley-vivienda", "Ley 12/2023, de 24 de mayo, por el derecho a la vivienda (texto consolidado)", "Boletín Oficial del Estado", "norma", "normas",
     "Tema Vivienda", "https://www.boe.es/buscar/act.php?id=BOE-A-2023-12203", "derecho a la vivienda",
     "Última actualización publicada el 07/10/2026. Artículo 1 leído.", HOY),
    ("boe-ley-general-sanidad", "Ley 14/1986, de 25 de abril, General de Sanidad (texto consolidado)", "Boletín Oficial del Estado", "norma", "normas",
     "Tema Sanidad y educación", "https://www.boe.es/buscar/act.php?id=BOE-A-1986-10499", "General de Sanidad",
     "Última actualización publicada el 23/03/2023. Artículo 3 leído.", HOY),
    ("boe-loe", "Ley Orgánica 2/2006, de 3 de mayo, de Educación (texto consolidado)", "Boletín Oficial del Estado", "norma", "normas",
     "Tema Sanidad y educación", "https://www.boe.es/buscar/act.php?id=BOE-A-2006-7899", "de Educación",
     "Última actualización publicada el 08/06/2024. Artículos 1 y 4 leídos.", HOY),
    ("boe-lo-extranjeria", "Ley Orgánica 4/2000, de 11 de enero, sobre derechos y libertades de los extranjeros en España y su integración social (texto consolidado)", "Boletín Oficial del Estado", "norma", "normas",
     "Tema Inmigración y seguridad", "https://www.boe.es/buscar/act.php?id=BOE-A-2000-544", "derechos y libertades de los extranjeros",
     "Última actualización publicada el 19/03/2025. Artículo 1 leído.", HOY),
    ("boe-ley-asilo", "Ley 12/2009, de 30 de octubre, reguladora del derecho de asilo y de la protección subsidiaria (texto consolidado)", "Boletín Oficial del Estado", "norma", "normas",
     "Tema Inmigración y seguridad", "https://www.boe.es/buscar/act.php?id=BOE-A-2009-17242", "derecho de asilo",
     "Última actualización publicada el 01/03/2023. Artículos 2 y 3 leídos.", HOY),
    ("boe-lo-violencia-genero", "Ley Orgánica 1/2004, de 28 de diciembre, de Medidas de Protección Integral contra la Violencia de Género (texto consolidado)", "Boletín Oficial del Estado", "norma", "normas",
     "Tema Igualdad y derechos sociales", "https://www.boe.es/buscar/act.php?id=BOE-A-2004-21760", "Violencia de Género",
     "Última actualización publicada el 07/09/2022. Artículo 1 leído.", HOY),
    ("boe-lo-igualdad", "Ley Orgánica 3/2007, de 22 de marzo, para la igualdad efectiva de mujeres y hombres (texto consolidado)", "Boletín Oficial del Estado", "norma", "normas",
     "Tema Igualdad y derechos sociales", "https://www.boe.es/buscar/act.php?id=BOE-A-2007-6115", "igualdad efectiva de mujeres y hombres",
     "Última actualización publicada el 02/08/2024. Artículo 1 leído.", HOY),
    ("boe-ley-cambio-climatico", "Ley 7/2021, de 20 de mayo, de cambio climático y transición energética (texto consolidado)", "Boletín Oficial del Estado", "norma", "normas",
     "Tema Medio ambiente y energía", "https://www.boe.es/buscar/act.php?id=BOE-A-2021-8447", "cambio climático",
     "Última actualización publicada el 30/06/2026. Artículo 3 leído.", HOY),
    ("boe-lo-2-2010", "Ley Orgánica 2/2010, de 3 de marzo, de salud sexual y reproductiva y de la interrupción voluntaria del embarazo (texto consolidado)", "Boletín Oficial del Estado", "norma", "normas",
     "Temas disputados: aborto", "https://www.boe.es/buscar/act.php?id=BOE-A-2010-3514", "interrupción voluntaria del embarazo",
     "Última actualización publicada el 01/03/2023. Artículo 14 leído.", HOY),
    ("boe-lo-eutanasia", "Ley Orgánica 3/2021, de 24 de marzo, de regulación de la eutanasia", "Boletín Oficial del Estado", "norma", "normas",
     "Temas disputados: eutanasia", "https://www.boe.es/buscar/act.php?id=BOE-A-2021-4628", "eutanasia",
     "Artículo 1 leído.", HOY),
    ("boe-ley-memoria-democratica", "Ley 20/2022, de 19 de octubre, de Memoria Democrática (texto consolidado)", "Boletín Oficial del Estado", "norma", "normas",
     "Temas disputados: memoria histórica", "https://www.boe.es/buscar/act.php?id=BOE-A-2022-17099", "Memoria Democrática",
     "Última actualización publicada el 04/03/2026. Artículo 1 leído.", HOY),
    ("boe-ley-indulto", "Ley de 18 de junio de 1870, estableciendo reglas para el ejercicio de la gracia de indulto (texto consolidado)", "Boletín Oficial del Estado", "norma", "normas",
     "Temas disputados: indultos", "https://www.boe.es/buscar/act.php?id=BOE-A-1870-4759", "gracia de indulto",
     "Última actualización publicada el 31/03/2015. Artículo 1 leído.", HOY),
    ("boe-lo-amnistia", "Ley Orgánica 1/2024, de 10 de junio, de amnistía para la normalización institucional, política y social en Cataluña (texto consolidado)", "Boletín Oficial del Estado", "norma", "normas",
     "Temas disputados: amnistía", "https://www.boe.es/buscar/act.php?id=BOE-A-2024-11776", "amnistía",
     "Última actualización publicada el 27/03/2026. Artículo 1 leído.", HOY),
    ("boe-stc-137-2025", "Pleno. Sentencia 137/2025, de 26 de junio de 2025 (recurso de inconstitucionalidad 6436-2024, Ley Orgánica 1/2024)", "Tribunal Constitucional (BOE)", "norma", "justicia",
     "Temas disputados: amnistía", "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-15939", "Sentencia 137/2025",
     "BOE núm. 183, de 31-07-2025. Título y fallo leídos.", HOY),
    ("boe-stc-44-2023", "Pleno. Sentencia 44/2023, de 9 de mayo de 2023 (recurso de inconstitucionalidad 4523-2010, Ley Orgánica 2/2010)", "Tribunal Constitucional (BOE)", "norma", "justicia",
     "Temas disputados: aborto", "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2023-13955", "Sentencia 44/2023",
     "BOE núm. 139, de 12-06-2023. Título y fallo leídos.", HOY),
    ("boe-stc-19-2023", "Pleno. Sentencia 19/2023, de 22 de marzo de 2023 (recurso de inconstitucionalidad 4057-2021, Ley Orgánica 3/2021)", "Tribunal Constitucional (BOE)", "norma", "justicia",
     "Temas disputados: eutanasia", "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2023-10044", "Sentencia 19/2023",
     "BOE núm. 98, de 25-04-2023. Título y fallo leídos.", HOY),
    ("boe-resultados-pe-2024", "Acuerdo de 27 de junio de 2024, de la Junta Electoral Central: resultados de las elecciones al Parlamento Europeo de 9 de junio de 2024", "Junta Electoral Central (BOE)", "resultados", "calendario_resultados",
     "Escaños de cada candidatura en el Parlamento Europeo", "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2024-13092", "Parlamento Europeo",
     "BOE núm. 156, de 28-06-2024. Cuadros I y II leídos.", AYER),
    ("boe-resultados-eg-2023", "Resolución de 30 de agosto de 2023, de la Presidencia de la Junta Electoral Central: resumen de los resultados de las elecciones al Congreso y al Senado de 23 de julio de 2023", "Junta Electoral Central (BOE)", "resultados", "calendario_resultados",
     "Resultados de las elecciones generales anteriores por candidatura y circunscripción", "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2023-18907", "resultados de las elecciones al Congreso",
     "BOE núm. 209, de 01-09-2023. Cuadros II y III leídos (el cuadro I es una imagen).", AYER),
    ("congreso-diputados-datos-abiertos", "Datos abiertos: diputados en activo y diputados de baja en la legislatura actual", "Congreso de los Diputados", "estadistica", "parlamento",
     "Composición del Congreso en la disolución (06-10-2026)", "https://www.congreso.es/es/opendata/diputados", "Diputados",
     "Ficheros DiputadosActivos__20261104050006.json y DiputadosDeBaja__20261104050008.json leídos en memoria el 04-11-2026 y el 05-11-2026: 137 en activo + 213 con baja el 06/10/2026 = 350.", AYER),
    ("congreso-votaciones-xv", "Datos abiertos: votaciones del Pleno, XV Legislatura", "Congreso de los Diputados", "estadistica", "parlamento",
     "Votaciones de investidura, convalidación de reales decretos-ley y leyes orgánicas", "https://www.congreso.es/es/opendata/votaciones", "Votaciones",
     "111 ficheros JSON y 7 ZIP descargados con permiso el 04-11-2026; 76 votaciones cumplen el criterio de la sección 4.4.", AYER),
    ("senado-composicion-xv", "Composición del Senado desde 1977: XV Legislatura (fichas de senadores)", "Senado", "estadistica", "parlamento",
     "Senadores de cada partido en la disolución", "https://www.senado.es/web/composicionorganizacion/senadores/composicionsenado/senadoresdesde1977/consultaorden/index.html", "Senado",
     "Leídas las 311 fichas de la XV Legislatura el 05-11-2026: 193 con baja por disolución el 05/10/2026 y 65 sin baja (Diputación Permanente).", HOY),
    ("senado-grupos", "Grupos parlamentarios del Senado (composición actual)", "Senado", "otro", "parlamento",
     "Denominación oficial de los grupos del Senado", "https://www.senado.es/web/composicionorganizacion/gruposparlamentarios/composiciongruposparlamentarios/index.html", "Grupos Parlamentarios",
     "Disueltas las Cámaras, la composición se reduce a la Diputación Permanente.", AYER),
    ("ches-2024", "2024 Chapel Hill Expert Survey (CHES-Europe)", "Chapel Hill Expert Survey", "estudio", "estudios_academicos",
     "Clasificación académica de los partidos (familia y posiciones de 0 a 10)", "https://www.chesdata.eu/ches-europe", "Chapel Hill",
     "Fichero CHES_2024_final_v2.csv y libro de códigos descargados con permiso el 04-11-2026. Cita: Rovny, Polk, Bakker, Hooghe, Jolly, Marks, Steenbergen y Vachudova (2025), Electoral Studies 97.", AYER),
    ("congreso-publicaciones", "Últimas publicaciones oficiales (BOCG y Diario de Sesiones)", "Congreso de los Diputados", "otro", "parlamento",
     "Dónde se publican las iniciativas legislativas (BOCG)", "https://www.congreso.es/es/ultimas-publicaciones-oficiales", "BOCG",
     "La entrada del 04-11-2026 es «BOCG. Congreso de los Diputados. Serie D», disolución de la legislatura.", HOY),
    ("parl-andalucia", "Grupos parlamentarios del Parlamento de Andalucía", "Parlamento de Andalucía", "otro", "parlamento", "Grupos propios en el Parlamento de Andalucía",
     "https://www.parlamentodeandalucia.es/webdinamica/portal-web-parlamento/composicionyfuncionamiento/gruposparlamentarios.do", "Grupos parlamentarios", "", AYER),
    ("parl-aragon", "Grupos parlamentarios de las Cortes de Aragón (XII Legislatura)", "Cortes de Aragón", "otro", "parlamento", "Grupos propios en las Cortes de Aragón",
     "https://www.cortesaragon.es/Grupos-parlamentarios.2369.0.html?&no_cache=1", "Grupos parlamentarios", "", AYER),
    ("parl-baleares", "Grups parlamentaris del Parlament de les Illes Balears", "Parlament de les Illes Balears", "otro", "parlamento", "Grupos propios en el Parlament de les Illes Balears",
     "https://www.parlamentib.es/Representants/GrupParlamentaris.aspx", "Grup", "", HOY),
    ("parl-canarias", "Los grupos parlamentarios del Parlamento de Canarias (XI Legislatura)", "Parlamento de Canarias", "otro", "parlamento", "Grupos propios en el Parlamento de Canarias",
     "https://www.parcan.es/composicion/grupos.py", "grupos parlamentarios", "", AYER),
    ("parl-cantabria", "Composición del Parlamento de Cantabria (XI Legislatura)", "Parlamento de Cantabria", "otro", "parlamento", "Grupos propios en el Parlamento de Cantabria",
     "https://parlamento-cantabria.es/", "Parlamento de Cantabria", "Grupos Popular, Regionalista, Socialista y Vox.", AYER),
    ("parl-clm", "Grupos parlamentarios de las Cortes de Castilla-La Mancha (XI Legislatura)", "Cortes de Castilla-La Mancha", "otro", "parlamento", "Grupos propios en las Cortes de Castilla-La Mancha",
     "https://www.cortesclm.es/web2/paginas/grupos.php", "GRUPOS PARLAMENTARIOS", "", HOY),
    ("parl-cyl", "Grupos parlamentarios de las Cortes de Castilla y León (XII Legislatura)", "Cortes de Castilla y León", "otro", "parlamento", "Grupos propios en las Cortes de Castilla y León",
     "https://www.ccyl.es/Parlamento/GruposParlamentarios", "Grupos", "", AYER),
    ("parl-catalunya", "Grups parlamentaris del Parlament de Catalunya", "Parlament de Catalunya", "otro", "parlamento", "Grupos propios en el Parlament de Catalunya",
     "https://www.parlament.cat/web/composicio/grups-parlamentaris/index.html", "Grup", "", AYER),
    ("parl-cv", "Grups parlamentaris de les Corts Valencianes (XI Legislatura)", "Corts Valencianes", "otro", "parlamento", "Grupos propios en las Corts Valencianes",
     "https://www.cortsvalencianes.es/ca-va/composicio/grups-parlamentaris", "Grups parlamentaris", "", HOY),
    ("parl-extremadura", "Grupos Parlamentarios de la Asamblea de Extremadura (XII Legislatura)", "Asamblea de Extremadura", "otro", "parlamento", "Grupos propios en la Asamblea de Extremadura",
     "https://www.asambleaex.es/grupos", "Grupo Parlamentario", "", HOY),
    ("parl-galicia", "Parlamento de Galicia: grupos parlamentarios", "Parlamento de Galicia", "otro", "parlamento", "Grupos propios en el Parlamento de Galicia",
     "https://www.parlamentodegalicia.gal/", "Grupo Parlamentario", "", HOY),
    ("parl-madrid", "Grupos parlamentarios de la Asamblea de Madrid", "Asamblea de Madrid", "otro", "parlamento", "Grupos propios en la Asamblea de Madrid",
     "https://www.asambleamadrid.es/composicion/grupos-parlamentarios", "Grupo Parlamentario", "", HOY),
    ("parl-murcia", "Grupos parlamentarios de la Asamblea Regional de Murcia (XI Legislatura)", "Asamblea Regional de Murcia", "otro", "parlamento", "Grupos propios en la Asamblea Regional de Murcia",
     "https://www.asambleamurcia.es/arm/grupos-xi", "Grupo Parlamentario", "", HOY),
    ("parl-navarra", "Grupos parlamentarios del Parlamento de Navarra", "Parlamento de Navarra", "otro", "parlamento", "Grupos propios en el Parlamento de Navarra",
     "https://parlamentodenavarra.es/es/composicion-organos/grupos-parlamentarios", "G.P.", "", HOY),
    ("parl-pais-vasco", "Parlamento Vasco: grupos, composición actual", "Parlamento Vasco", "otro", "parlamento", "Grupos propios en el Parlamento Vasco y candidatura de cada uno",
     "https://www.legebiltzarra.eus/c_comorga_gru_ACT.html", "Grupos", "", HOY),
    ("parl-rioja", "Grupos parlamentarios del Parlamento de La Rioja", "Parlamento de La Rioja", "otro", "parlamento", "Grupos propios en el Parlamento de La Rioja",
     "https://www.parlamento-larioja.org/composicion-y-organos/legislatura-grupos-parlamentarios", "Grupos Parlamentarios", "", HOY),
]

# Webs de partido nuevas: raíz propuesta; solo se presentan si check_links.py confirma el texto esperado.
WEBS_NUEVAS = [
    ("web-psc", "Web oficial del Partit dels Socialistes de Catalunya", "PSC", "https://www.socialistes.cat/", "PSC"),
    ("web-bng", "Web oficial del Bloque Nacionalista Galego", "BNG", "https://www.bng.gal/", "BNG"),
    ("web-cc", "Web oficial de Coalición Canaria", "Coalición Canaria", "https://coalicioncanaria.org/", "Coalición Canaria"),
    ("web-upn", "Web oficial de Unión del Pueblo Navarro", "UPN", "https://www.upn.org/", "UPN"),
    ("web-podemos", "Web oficial de Podemos", "Podemos", "https://podemos.info/", "Podemos"),
    ("web-mas-madrid", "Web oficial de Más Madrid", "Más Madrid", "https://www.masmadrid.org/", "Más Madrid"),
    ("web-compromis", "Web oficial de Compromís", "Compromís", "https://compromis.net/", "Compromís"),
    ("web-geroa-bai", "Web oficial de Geroa Bai", "Geroa Bai", "https://geroabai.eus/", "Geroa Bai"),
    ("web-adelante-andalucia", "Web oficial de Adelante Andalucía", "Adelante Andalucía", "https://adelanteandalucia.org/", "Adelante"),
    ("web-cha", "Web oficial de Chunta Aragonesista", "CHA", "https://www.chunta.org/", "Chunta"),
    ("web-nc-bc", "Web oficial de Nueva Canarias-Bloque Canarista", "NC-bc", "https://nuevacanarias.org/", "Nueva Canarias"),
    ("web-prc", "Web oficial del Partido Regionalista de Cantabria", "PRC", "https://www.prc.es/", "Regionalista"),
    ("web-comuns", "Web oficial de Catalunya en Comú", "Comuns", "https://catalunyaencomu.cat/", "Comú"),
    ("web-cup", "Web oficial de la CUP", "CUP", "https://cup.cat/", "CUP"),
    ("web-mes-mallorca", "Web oficial de MÉS per Mallorca", "MÉS per Mallorca", "https://www.mespermallorca.cat/", "MÉS"),
]

# Grupos propios por parlamento autonómico: (fuente, parlamento, [(grupo, partido_id o None)])
PARLAMENTOS = [
    ("parl-andalucia", "Parlamento de Andalucía", [("G.P. Popular de Andalucía", "pp"), ("G.P. Socialista", "psoe"), ("G.P. Vox en Andalucía", "vox"), ("G.P. Adelante Andalucía", "adelante-andalucia"), ("G.P. Por Andalucía", None)]),
    ("parl-aragon", "Cortes de Aragón", [("G. P. Popular", "pp"), ("G. P. Socialista", "psoe"), ("G. P. Vox en Aragón", "vox"), ("G. P. Chunta Aragonesista", "cha")]),
    ("parl-baleares", "Parlament de les Illes Balears", [("Grup Parlamentari Popular", "pp"), ("Grup Parlamentari Socialista-PSIB-PSOE", "psoe"), ("Grupo Parlamentario VOX", "vox"), ("Grup Parlamentari MÉS per Mallorca", "mes-mallorca")]),
    ("parl-canarias", "Parlamento de Canarias", [("GP Socialista Canario", "psoe"), ("GP Nacionalista Canario (CCa)", "cc"), ("GP Popular", "pp"), ("GP Nueva Canarias-Bloque Canarista (NC-bc)", "nc-bc"), ("GP Agrupación Socialista Gomera (ASG)", "asg"), ("GP VOX", "vox")]),
    ("parl-cantabria", "Parlamento de Cantabria", [("Grupo Parlamentario Popular", "pp"), ("Grupo Parlamentario Regionalista", "prc"), ("Grupo Parlamentario Socialista", "psoe"), ("Grupo Parlamentario Vox", "vox")]),
    ("parl-clm", "Cortes de Castilla-La Mancha", [("Grupo Parlamentario Socialista", "psoe"), ("Grupo Parlamentario Popular", "pp"), ("Grupo Parlamentario Vox", "vox")]),
    ("parl-cyl", "Cortes de Castilla y León", [("Popular", "pp"), ("Socialista", "psoe"), ("VOX Castilla y León", "vox")]),
    ("parl-catalunya", "Parlament de Catalunya", [("Grup Parlamentari Socialistes i Units per Avançar", "psc"), ("Grup Parlamentari de Junts", "junts"), ("Grup Parlamentari d'Esquerra Republicana de Catalunya", "erc"), ("Grup Parlamentari del Partit Popular de Catalunya", "pp"), ("Grup Parlamentari de VOX en Cataluña", "vox"), ("Grup Parlamentari Comuns", "comuns"), ("Grup Parlamentari de la Candidatura d'Unitat Popular-Defensem la Terra", "cup")]),
    ("parl-cv", "Corts Valencianes", [("Popular", "pp"), ("Socialista", "psoe"), ("Compromís", "compromis"), ("Vox Cortes Valencianas", "vox")]),
    ("parl-extremadura", "Asamblea de Extremadura", [("Grupo Parlamentario Popular", "pp"), ("Grupo Parlamentario Socialista", "psoe"), ("Grupo Parlamentario VOX Extremadura", "vox"), ("Grupo Parlamentario Unidas por Extremadura", None)]),
    ("parl-galicia", "Parlamento de Galicia", [("Grupo Parlamentario Popular de Galicia", "pp"), ("Grupo Parlamentario do Bloque Nacionalista Galego", "bng"), ("Grupo Parlamentario Socialista de Galicia", "psoe")]),
    ("parl-madrid", "Asamblea de Madrid", [("Grupo Parlamentario Popular", "pp"), ("Grupo Parlamentario Más Madrid", "mas-madrid"), ("Grupo Parlamentario Socialista", "psoe"), ("Grupo Parlamentario Vox en Madrid", "vox")]),
    ("parl-murcia", "Asamblea Regional de Murcia", [("Grupo Parlamentario Popular", "pp"), ("Grupo Parlamentario Socialista", "psoe"), ("Grupo Parlamentario Vox", "vox")]),
    ("parl-navarra", "Parlamento de Navarra", [("G.P. Unión del Pueblo Navarro", "upn"), ("G.P. Partido Socialista de Navarra", "psoe"), ("G.P. EH Bildu Nafarroa", "ehbildu"), ("G.P. Geroa Bai", "geroa-bai"), ("G.P. Partido Popular de Navarra", "pp"), ("G.P. Contigo Navarra-Zurekin Nafarroa", None)]),
    ("parl-pais-vasco", "Parlamento Vasco", [("Euzko Abertzaleak-Nacionalistas Vascos (EA-NV)", "pnv"), ("EH Bildu", "ehbildu"), ("Socialistas Vascos-Euskal Sozialistak (SV-ES)", "psoe"), ("Grupo Popular Vasco", "pp")]),
    ("parl-rioja", "Parlamento de La Rioja", [("Grupo Parlamentario Popular", "pp"), ("Grupo Parlamentario Socialista", "psoe"), ("Grupo Parlamentario Vox", "vox"), ("Grupo Parlamentario Podemos-Izquierda Unida", None)]),
]
COALICIONES_CON_GRUPO = [g for _, p, gs in PARLAMENTOS for g, pid in gs if pid is None]

# id, denominación, siglas, fuente de la denominación, ámbito, criterio del ámbito, web (id fuente o None)
PARTIDOS = [
    ("adelante-andalucia", "Adelante Andalucía", "ADELANTE ANDALUCÍA", "boe-resultados-eg-2023", "autonomico", "2023: candidatura solo en Cádiz", "web-adelante-andalucia"),
    ("ahi", "Agrupación Herreña Independiente", "AHI", "senado-composicion-xv", "autonomico", "sin candidatura propia al Congreso en 2023; representación en una sola comunidad", None),
    ("asg", "Agrupación Socialista Gomera", "ASG", "senado-composicion-xv", "autonomico", "sin candidatura propia al Congreso en 2023; representación en una sola comunidad", None),
    ("bng", "Bloque Nacionalista Galego", "BNG", "boe-resultados-eg-2023", "autonomico", "2023: candidatura en 4 circunscripciones de una comunidad", "web-bng"),
    ("cc", "Coalición Canaria", "CCa", "boe-resultados-eg-2023", "autonomico", "2023: candidatura en 2 circunscripciones de una comunidad", "web-cc"),
    ("cha", "Chunta Aragonesista", "CHA", "parl-aragon", "autonomico", "sin candidatura propia al Congreso en 2023; representación en una sola comunidad", "web-cha"),
    ("compromis", "Coalició Compromís", "CCPV", "senado-composicion-xv", "autonomico", "sin candidatura propia al Congreso en 2023; representación en una sola comunidad", "web-compromis"),
    ("comuns", "Comuns", "COMUNS", "parl-catalunya", "autonomico", "sin candidatura propia al Congreso en 2023; representación en una sola comunidad", "web-comuns"),
    ("cup", "Candidatura d'Unitat Popular", "CUP", "parl-catalunya", "autonomico", "2023: candidatura (CUP-PR) en 4 circunscripciones de una comunidad", "web-cup"),
    ("ehbildu", "Euskal Herria Bildu", "EH Bildu", "boe-resultados-eg-2023", "autonomico", "2023: candidatura en 4 circunscripciones de dos comunidades", "web-ehbildu"),
    ("erc", "Esquerra Republicana de Catalunya", "ERC", "boe-resultados-eg-2023", "autonomico", "2023: candidatura en 4 circunscripciones de una comunidad", "web-erc"),
    ("geroa-bai", "Geroa Bai", "GBAI", "boe-resultados-eg-2023", "autonomico", "2023: candidatura solo en Navarra", "web-geroa-bai"),
    ("junts", "Junts per Catalunya", "JUNTS", "senado-composicion-xv", "autonomico", "2023: candidatura en 4 circunscripciones de una comunidad", "web-junts"),
    ("mas-madrid", "Más Madrid", "MÁS MADRID", "senado-composicion-xv", "autonomico", "sin candidatura propia al Congreso en 2023; representación en una sola comunidad", "web-mas-madrid"),
    ("mes-mallorca", "MÉS per Mallorca", "MÉS", "parl-baleares", "autonomico", "sin candidatura propia al Congreso en 2023; representación en una sola comunidad", "web-mes-mallorca"),
    ("nc-bc", "Nueva Canarias-Bloque Canarista", "NC-bc", "boe-resultados-eg-2023", "autonomico", "2023: candidatura en 2 circunscripciones de una comunidad", "web-nc-bc"),
    ("pnv", "Euzko Alderdi Jeltzalea-Partido Nacionalista Vasco", "EAJ-PNV", "boe-resultados-eg-2023", "autonomico", "2023: candidatura en 3 circunscripciones de una comunidad", "web-pnv"),
    ("podemos", "Podemos", "PODEMOS", "boe-resultados-pe-2024", "estatal", "sin candidatura propia al Congreso en 2023; candidatura propia en las europeas de 2024 (circunscripción única)", "web-podemos"),
    ("pp", "Partido Popular", "PP", "boe-resultados-eg-2023", "estatal", "2023: candidatura en 52 circunscripciones", "web-pp"),
    ("prc", "Regionalista (grupo del Parlamento de Cantabria)", "PRC", "parl-cantabria", "autonomico", "sin candidatura propia al Congreso en 2023; representación en una sola comunidad", "web-prc"),
    ("psc", "Partit dels Socialistes de Catalunya (PSC-PSOE)", "PSC", "boe-resultados-eg-2023", "autonomico", "2023: candidatura en 4 circunscripciones de una comunidad", "web-psc"),
    ("psoe", "Partido Socialista Obrero Español", "PSOE", "boe-resultados-eg-2023", "estatal", "2023: candidatura en 48 circunscripciones (y el PSC en las 4 de Cataluña)", "web-psoe"),
    ("salf", "Se Acabó La Fiesta (agrupación de electores)", "SALF", "boe-resultados-pe-2024", "estatal", "sin candidatura propia al Congreso en 2023; candidatura en las europeas de 2024 (circunscripción única)", None),
    ("sumar", "Sumar", "SUMAR", "boe-resultados-eg-2023", "estatal", "2023: candidatura en 52 circunscripciones", "web-sumar"),
    ("upn", "Unión del Pueblo Navarro", "UPN", "boe-resultados-eg-2023", "autonomico", "2023: candidatura solo en Navarra", "web-upn"),
    ("vox", "VOX", "VOX", "boe-resultados-eg-2023", "estatal", "2023: candidatura en 51 circunscripciones", "web-vox"),
]

# Congreso en la disolución, por formación electoral (datos abiertos): escaños y explicación.
CONGRESO = {
    "pp": (137, "137 diputados elegidos en la candidatura del PP, todos en el Grupo Parlamentario Popular."),
    "psoe": (102, "102 diputados elegidos en candidaturas del PSOE (85 PSOE, 7 PsdeG-PSOE, 5 PSE-EE, 3 PSIB-PSOE y 2 PSN-PSOE), en el Grupo Parlamentario Socialista."),
    "psc": (19, "19 diputados elegidos en la candidatura del PSC-PSOE, en el Grupo Parlamentario Socialista."),
    "vox": (33, "33 diputados elegidos en la candidatura de VOX: 32 en el Grupo Parlamentario VOX y 1 en el Grupo Mixto desde el 17-07-2026."),
    "sumar": (31, "31 diputados elegidos en la candidatura de SUMAR: 26 en el Grupo Parlamentario Plurinacional SUMAR y 5 en el Grupo Mixto."),
    "erc": (7, "7 diputados elegidos en la candidatura de ERC, en el Grupo Parlamentario Republicano."),
    "junts": (7, "7 diputados elegidos en la candidatura de JxCAT-JUNTS, en el Grupo Parlamentario Junts per Catalunya."),
    "ehbildu": (6, "6 diputados elegidos en la candidatura de EH Bildu, en el Grupo Parlamentario Euskal Herria Bildu."),
    "pnv": (5, "5 diputados elegidos en la candidatura de EAJ-PNV, en el Grupo Parlamentario Vasco (EAJ-PNV)."),
    "bng": (1, "1 diputado elegido en la candidatura del BNG, en el Grupo Mixto."),
    "cc": (1, "1 diputada elegida en la candidatura de CCa, en el Grupo Mixto."),
    "upn": (1, "1 diputado elegido en la candidatura de UPN, en el Grupo Mixto."),
}
SIN_CONGRESO = "Sin diputados elegidos en una candidatura propia. Los datos abiertos del Congreso registran la formación electoral de cada diputado, no su partido."

# Senado en la disolución, por partido (fichas de senado.es): total y detalle.
SENADO = {
    "pp": (141, "141 senadores del PP: 140 en el Grupo Popular y 1 en el Grupo Mixto (119 + 1 elegidos y 21 designados)."),
    "psoe": (72, "72 senadores del PSOE y sus federaciones (66 PSOE, 4 PSE-EE y 2 PSdeG), en el Grupo Socialista."),
    "psc": (14, "14 senadores del PSC (12 elegidos y 2 designados), en el Grupo Socialista."),
    "ehbildu": (5, "5 senadores (4 elegidos y 1 designado), en el Grupo Izquierdas por la Independencia."),
    "pnv": (5, "5 senadores (4 elegidos y 1 designado), en el Grupo Vasco."),
    "erc": (4, "4 senadores (3 elegidos y 1 designado), en el Grupo Izquierdas por la Independencia."),
    "junts": (4, "4 senadores (1 elegido y 3 designados), en el Grupo Plural."),
    "vox": (4, "4 senadores designados, en el Grupo Mixto."),
    "upn": (1, "1 senador elegido, en el Grupo Mixto."),
    "asg": (1, "1 senador elegido, en el Grupo Izquierda Confederal."),
    "ahi": (1, "1 senador elegido por El Hierro, en el Grupo Plural."),
    "bng": (1, "1 senadora designada, en el Grupo Plural."),
    "cc": (1, "1 senador designado, en el Grupo Plural."),
    "compromis": (1, "1 senador designado, en el Grupo Izquierda Confederal."),
    "geroa-bai": (1, "1 senadora designada, en el Grupo Izquierda Confederal."),
    "mas-madrid": (1, "1 senadora designada, en el Grupo Izquierda Confederal."),
}
SIN_SENADO = "Ningún senador de este partido en las fichas de la XV Legislatura con baja por disolución o en la Diputación Permanente."

# Parlamento Europeo, elecciones de 2024 (BOE): escaños de la candidatura propia o explicación.
EUROPEO = {
    "pp": (22, "22 escaños de la candidatura del Partido Popular."),
    "psoe": (20, "20 escaños de la candidatura del Partido Socialista Obrero Español."),
    "vox": (6, "6 escaños de la candidatura de VOX."),
    "sumar": (3, "3 escaños de la candidatura SUMAR."),
    "salf": (3, "3 escaños de la Agrupación de electores «SE ACABÓ LA FIESTA»."),
    "podemos": (2, "2 escaños de la candidatura PODEMOS."),
    "junts": (1, "1 escaño de la candidatura Junts i Lliures per Europa (JUNTS UE)."),
}
EUROPEO_COALICION = "Sin candidatura propia. Concurrió en la coalición Ahora Repúblicas (ERC-EH BILDU-BNG-ARA MÉS), que obtuvo 3 escaños; el BOE no atribuye escaños a cada partido."
EUROPEO_COAL_IDS = ("erc", "ehbildu", "bng")
SIN_EUROPEO = "Sin escaño con candidatura propia en las elecciones de 2024."

CHES = {  # id: (familia, lrgen, lrecon, galtan)
    "psoe": ("Socialist", 3.81, 3.94, 2.94), "pp": ("Conservatives", 7.19, 7.25, 7.00), "pnv": ("Regionalist", 6.13, 6.20, 6.20),
    "erc": ("Regionalist", 3.40, 2.86, 2.57), "bng": ("Regionalist", 2.69, 2.73, 2.53), "cc": ("Regionalist", 6.00, 5.87, 6.17),
    "ehbildu": ("Regionalist", 2.38, 2.50, 2.20), "podemos": ("Radical Left", 1.56, 1.63, 1.44), "vox": ("Radical Right", 9.38, 9.00, 9.50),
    "junts": ("Regionalist", 6.60, 6.33, 5.93), "sumar": ("Radical Left", 2.31, 2.27, 1.20), "salf": ("Radical Right", 8.93, 8.43, 8.43),
    "upn": ("Regionalist", 7.63, 7.07, 7.23),
}
FAMILIAS = {"Radical Right": "derecha radical", "Conservatives": "conservadores", "Liberal": "liberales", "Christian-Democratic": "democristianos",
            "Socialist": "socialistas", "Radical Left": "izquierda radical", "Green": "verdes", "Regionalist": "regionalistas",
            "No family": "sin familia", "Confessional": "confesionales", "Agrarian/Centre": "agrarios o de centro"}

# Generales de 2023 (BOE-A-2023-18907): candidatura, votos, escaños, circunscripciones con candidatura y escaños por circunscripción.
R2023 = {
    "pp": ("Partido Popular (PP)", 8160837, 137, 52), "psoe": ("Partido Socialista Obrero Español (PSOE)", 6600383, 102, 48),
    "vox": ("VOX (VOX)", 3057000, 33, 51), "sumar": ("Sumar (SUMAR)", 3044996, 31, 52),
    "psc": ("Partit dels Socialistes de Catalunya (PSC-PSOE) (PSC)", 1221335, 19, 4), "erc": ("Esquerra Republicana de Catalunya (ERC)", 466020, 7, 4),
    "junts": ("Junts (JUNTS)", 395429, 7, 4), "ehbildu": ("Euskal Herria Bildu (EH Bildu)", 335129, 6, 4),
    "pnv": ("Euzko Alderdi Jeltzalea-Partido Nacionalista Vasco (EAJ-PNV)", 277289, 5, 3), "bng": ("Bloque Nacionalista Galego (BNG)", 153995, 1, 4),
    "cc": ("Coalición Canaria (CCa)", 116363, 1, 2), "upn": ("Unión del Pueblo Navarro (UPN)", 52188, 1, 1),
    "cup": ("Candidatura D'Unitat Popular-Per La Ruptura (CUP-PR)", 99644, 0, 4), "nc-bc": ("Nueva Canarias-Bloque Canarista (NC-bc)", 45595, 0, 2),
    "geroa-bai": ("Geroa Bai (GBAI)", 9938, 0, 1), "adelante-andalucia": ("Adelante Andalucía (ADELANTE ANDALUCÍA)", 9191, 0, 1),
}
CIRC_ESCANOS = {
    "pp": "Albacete=2;Alicante/Alacant=5;Almería=3;Araba/Álava=1;Asturias=3;Ávila=2;Badajoz=2;Balears (Illes)=3;Barcelona=5;Bizkaia=1;Burgos=2;Cáceres=2;Cádiz=4;Cantabria=2;Castellón/Castelló=2;Ciudad Real=2;Córdoba=2;Coruña (A)=4;Cuenca=2;Granada=3;Guadalajara=1;Huelva=2;Huesca=2;Jaén=2;León=2;Lugo=3;Madrid=16;Málaga=5;Murcia=4;Navarra=1;Ourense=3;Palencia=2;Palmas (Las)=3;Pontevedra=3;Rioja (La)=2;Salamanca=3;Santa Cruz de Tenerife=3;Segovia=2;Sevilla=4;Soria=1;Tarragona=1;Teruel=2;Toledo=3;Valencia/València=6;Valladolid=2;Zamora=2;Zaragoza=3;Ceuta=1;Melilla=1",
    "psoe": "Albacete=2;Alicante/Alacant=4;Almería=2;Araba/Álava=1;Asturias=2;Ávila=1;Badajoz=2;Balears (Illes)=3;Bizkaia=2;Burgos=2;Cáceres=2;Cádiz=3;Cantabria=2;Castellón/Castelló=2;Ciudad Real=2;Córdoba=2;Coruña (A)=2;Cuenca=1;Gipuzkoa=2;Granada=2;Guadalajara=1;Huelva=2;Huesca=1;Jaén=2;León=2;Lugo=1;Madrid=10;Málaga=3;Murcia=3;Navarra=2;Ourense=1;Palencia=1;Palmas (Las)=3;Pontevedra=3;Rioja (La)=2;Salamanca=1;Santa Cruz de Tenerife=3;Segovia=1;Sevilla=5;Soria=1;Teruel=1;Toledo=2;Valencia/València=5;Valladolid=2;Zamora=1;Zaragoza=2",
    "vox": "Alicante/Alacant=2;Almería=1;Asturias=1;Badajoz=1;Balears (Illes)=1;Barcelona=2;Cádiz=1;Cantabria=1;Castellón/Castelló=1;Ciudad Real=1;Córdoba=1;Granada=1;Guadalajara=1;Huelva=1;Jaén=1;Madrid=5;Málaga=2;Murcia=2;Palmas (Las)=1;Sevilla=1;Toledo=1;Valencia/València=2;Valladolid=1;Zaragoza=1",
    "sumar": "Alicante/Alacant=1;Asturias=1;Balears (Illes)=1;Barcelona=5;Bizkaia=1;Cádiz=1;Córdoba=1;Coruña (A)=1;Girona=1;Granada=1;Madrid=6;Málaga=1;Murcia=1;Palmas (Las)=1;Pontevedra=1;Sevilla=2;Tarragona=1;Valencia/València=3;Zaragoza=1",
    "psc": "Barcelona=13;Girona=2;Lleida=2;Tarragona=2", "erc": "Barcelona=4;Girona=1;Lleida=1;Tarragona=1",
    "junts": "Barcelona=3;Girona=2;Lleida=1;Tarragona=1", "ehbildu": "Araba/Álava=1;Bizkaia=2;Gipuzkoa=2;Navarra=1",
    "pnv": "Araba/Álava=1;Bizkaia=2;Gipuzkoa=2", "bng": "Coruña (A)=1", "cc": "Santa Cruz de Tenerife=1", "upn": "Navarra=1",
}

GRUPO_VOTOS = {"pp": ("grupo", "gp"), "psoe": ("grupo", "gs"), "psc": ("grupo", "gs"), "vox": ("grupo", "gvox"), "sumar": ("grupo", "gsumar"),
               "erc": ("grupo", "gr"), "junts": ("grupo", "gjxcat"), "ehbildu": ("grupo", "gehbildu"), "pnv": ("grupo", "gv"),
               "bng": ("mixto", "bng"), "cc": ("mixto", "cca"), "upn": ("mixto", "upn")}
FUENTES_FICHA = ["congreso-diputados-datos-abiertos", "senado-composicion-xv", "boe-resultados-pe-2024", "boe-resultados-eg-2023",
                 "ches-2024", "congreso-votaciones-xv"]


def pl(n, uno, varios):
    return f"{n} {uno if n == 1 else varios}"


def votacion_texto(v, clave):
    t = v["totales"]
    if not v["detalle"]:
        return f"Sin desglose por grupo en los datos abiertos. Total: {t['si']} sí, {t['no']} no, {t['abstencion']} abstenciones."
    tipo, k = clave
    fuente = v["grupos"] if tipo == "grupo" else v["mixto"]
    c = fuente.get(k)
    if not c:
        return "El grupo no participó en esta votación."
    return f"Sí: {c['si']}; no: {c['no']}; abstención: {c['abstencion']}; no vota: {c['no_vota']}."


def main(raiz, votaciones_json):
    raiz = pathlib.Path(raiz)

    # Esquema partido: campos opcionales de la ficha (ampliación H4).
    ruta = raiz / "data" / "schemas" / "partido.schema.json"
    esq = json.loads(ruta.read_text(encoding="utf-8"))
    p = esq["properties"]
    p["web"]["properties"].setdefault("fuente_id", {"type": ["string", "null"]})
    p.setdefault("denominacion_fuente", {"$ref": "comun.schema.json#/$defs/id"})
    p.setdefault("ambito_criterio", {"$ref": "comun.schema.json#/$defs/texto"})
    p.setdefault("resultados_2023", {"type": ["object", "null"]})
    p.setdefault("fuentes", {"type": "array", "items": {"$ref": "comun.schema.json#/$defs/id"}})
    p.setdefault("pendientes", {"type": "array", "items": {"type": "object", "required": ["campo", "motivo"],
                                                           "properties": {"campo": {"type": "string"}, "motivo": {"type": "string"}}}})
    esq["description"] = esq["description"].split(" Ampliación H4")[0] + (
        " Ampliación H4: denominacion_fuente (fuente de la denominación), ambito_criterio (por qué es estatal o autonómico), "
        "resultados_2023 (elecciones generales anteriores), fuentes (las mismas para todas las fichas) y pendientes (campos sin dato y motivo).")
    ruta.write_text(json.dumps(esq, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")

    # Esquema votacion (nuevo, fuera del Anexo C).
    ruta = raiz / "data" / "schemas" / "votacion.schema.json"
    ruta.write_text(json.dumps({
        "$schema": "https://json-schema.org/draft/2020-12/schema", "$id": "votacion.schema.json",
        "title": "Votación del Pleno del Congreso, fichero data/votaciones.json (ampliación H4, no prevista en el Anexo C)",
        "description": "Una votación por registro, con el total oficial y, si los datos abiertos lo permiten, el resultado por grupo parlamentario.",
        "type": "object",
        "required": ["id", "tipo", "fecha", "titulo", "totales", "detalle", "enlace", "fuente_id", "fecha_consulta", "estado"],
        "additionalProperties": False,
        "properties": {
            "id": {"$ref": "comun.schema.json#/$defs/id"},
            "tipo": {"enum": ["investidura", "convalidacion-rdl", "ley-organica", "presupuestos"]},
            "fecha": {"$ref": "comun.schema.json#/$defs/fecha"},
            "sesion": {"type": ["integer", "null"]}, "numero": {"type": ["integer", "null"]},
            "expediente": {"type": "string"}, "titulo": {"$ref": "comun.schema.json#/$defs/texto"},
            "totales": {"type": "object", "required": ["si", "no", "abstencion", "no_vota"]},
            "detalle": {"type": "boolean"}, "grupos": {"type": ["object", "null"]}, "mixto": {"type": ["object", "null"]},
            "enlace": {"type": "string"}, "json": {"type": ["string", "null"]},
            "fuente_id": {"$ref": "comun.schema.json#/$defs/id"}, "fecha_consulta": {"$ref": "comun.schema.json#/$defs/fecha"},
            "estado": {"$ref": "comun.schema.json#/$defs/estado"}, "nota": {"type": "string"},
        },
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")

    # Fuentes.
    ruta = raiz / "data" / "sources.json"
    doc = json.loads(ruta.read_text(encoding="utf-8"))
    ids = {r["id"] for r in doc["registros"]}
    for (id_, titulo, inst, tipo, grupo, uso, url, esperado, nota, fecha) in FUENTES:
        if id_ in ids:
            continue
        nav = NAV5 if fecha == HOY else NAV4
        doc["registros"].append({"id": id_, "titulo": titulo, "institucion": inst, "tipo": tipo, "grupo": grupo, "uso": uso, "url": url,
                                 "texto_esperado": esperado, "estado_enlace": "abierta", "comprobado_por": "navegador",
                                 "fecha_comprobacion": fecha, "nota": (nav + " " + nota).strip()})
    for (id_, titulo, inst, url, esperado) in WEBS_NUEVAS:
        if id_ in ids:
            continue
        doc["registros"].append({"id": id_, "titulo": titulo, "institucion": inst, "tipo": "otro", "grupo": "partidos",
                                 "uso": "Web oficial del partido (raíz)", "url": url, "texto_esperado": esperado,
                                 "estado_enlace": "raiz_sin_verificar", "comprobado_por": "anexo_b", "fecha_comprobacion": HOY,
                                 "nota": "Raíz propuesta en H4; solo se presenta como comprobada si check_links.py la confirma."})
    doc["meta"].update(version="0.5.0", actualizado=HOY)
    ruta.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    fuentes = {r["id"]: r for r in doc["registros"]}

    # Votaciones.
    vdoc = json.loads(pathlib.Path(votaciones_json).read_text(encoding="utf-8"))
    if "grupos" in vdoc["meta"]:
        vdoc["meta"]["contexto"] = {"grupos": vdoc["meta"].pop("grupos")}
    (raiz / "data" / "votaciones.json").write_text(json.dumps(vdoc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    votaciones = vdoc["registros"]

    # Partidos.
    autonomicos = {}
    for fuente, parlamento, grupos in PARLAMENTOS:
        for grupo, pid in grupos:
            if pid:
                autonomicos.setdefault(pid, []).append({"parlamento": parlamento, "grupo": grupo, "fuente_id": fuente})
    registros = []
    for (pid, nombre, siglas, fuente_nombre, ambito, criterio, web_id) in PARTIDOS:
        web = fuentes.get(web_id) if web_id else None
        if web:
            # Sin confirmar, la interfaz muestra la dirección como texto con PENDIENTE DE VERIFICAR (sección 3.4).
            web_obj = {"url": web["url"], "estado_enlace": web.get("estado_enlace", "no_verificada"), "fuente_id": web_id}
        else:
            web_obj = {"url": None, "estado_enlace": "no_verificada", "fuente_id": None}
        clas = []
        if pid in CHES:
            fam, lrgen, lrecon, galtan = CHES[pid]
            clas.append({"fuente_id": "ches-2024", "anio": 2024,
                         "metodologia": "Encuesta a especialistas (octubre-noviembre de 2024); media de las valoraciones en escalas de 0 a 10.",
                         "categoria": f"Familia «{fam}» ({FAMILIAS[fam]})",
                         "familia": fam, "lrgen": lrgen, "lrecon": lrecon, "galtan": galtan})
        cong = CONGRESO.get(pid)
        sen = SENADO.get(pid)
        if pid in EUROPEO:
            pe_n, pe_txt = EUROPEO[pid]
        elif pid in EUROPEO_COAL_IDS:
            pe_n, pe_txt = None, EUROPEO_COALICION
        else:
            pe_n, pe_txt = None, SIN_EUROPEO
        repr_ = {
            "fecha_referencia": REF,
            "congreso": cong[0] if cong else 0,
            "senado": sen[0] if sen else 0,
            "parlamento_europeo": pe_n,
            "parlamentos_autonomicos": autonomicos.get(pid, []),
            "fuente_id": "congreso-diputados-datos-abiertos",
            "detalle": {"congreso": cong[1] if cong else SIN_CONGRESO, "senado": sen[1] if sen else SIN_SENADO,
                        "parlamento_europeo": pe_txt + " Elecciones del 9-6-2024, no composición en la fecha de referencia.",
                        "parlamentos_autonomicos": "Grupos propios consultados el 04 y 05-11-2026. La Junta General del Principado de Asturias no se ha podido comprobar (rechaza el acceso automatizado)."},
        }
        vots = []
        if pid in GRUPO_VOTOS:
            for v in votaciones:
                vots.append({"criterio": v["tipo"], "votacion_id": v["id"], "enlace": v["enlace"],
                             "resultado": votacion_texto(v, GRUPO_VOTOS[pid])})
        r23 = None
        if pid in R2023:
            cand, votos, esc, ncirc = R2023[pid]
            r23 = {"candidatura": cand, "votos": votos, "escanos": esc, "circunscripciones": ncirc,
                   "escanos_por_circunscripcion": dict((x.split("=")[0], int(x.split("=")[1])) for x in CIRC_ESCANOS.get(pid, "").split(";") if x),
                   "fuente_id": "boe-resultados-eg-2023"}
        pendientes = [
            {"campo": "autodefinicion", "motivo": "Pendiente para todos los partidos: las webs de PP, Vox y ERC rechazan el acceso automatizado. Se publicará para todos a la vez (sección 4.1)."},
            {"campo": "gobiernos", "motivo": "Pendiente para todos los partidos: falta una fuente oficial que diga qué partidos forman cada gobierno."},
            {"campo": "programa", "motivo": "Pendiente para todos los partidos: se cargarán los programas del 29-N cuando estén publicados todos (decisión del 04-11-2026)."},
        ]
        if not clas:
            pendientes.append({"campo": "clasificacion", "motivo": "CHES 2024 no incluye este partido. La web no mezcla otra fuente sin avisar (sección 13.3)."})
        if web_obj["url"] is None:
            pendientes.append({"campo": "web", "motivo": "Dirección de la web oficial no localizada en una fuente abierta en esta sesión."})
        elif web_obj["estado_enlace"] != "abierta":
            pendientes.append({"campo": "web", "motivo": "La web rechaza el acceso automatizado o no se ha podido confirmar; se muestra la dirección sin enlace."})
        registros.append({
            "id": pid, "nombre_oficial": nombre, "siglas": siglas, "ambito": ambito, "web": web_obj,
            "autodefinicion": {"cita": None, "url": None, "fecha_consulta": None},
            "clasificacion": clas, "representacion": repr_, "gobiernos": [],
            "programa": {"url": None, "fecha": None, "propuestas": []},
            "votaciones": vots, "denominacion_fuente": fuente_nombre, "ambito_criterio": criterio,
            "resultados_2023": r23, "fuentes": FUENTES_FICHA, "pendientes": pendientes,
        })
    doc = {"meta": {"conjunto": "partidos", "esquema": "partido", "version": "0.5.0", "actualizado": HOY,
                    "descripcion": ("Fichas de las formaciones que cumplen el criterio de la sección 4.4 en la fecha de referencia "
                                    "(06-10-2026, disolución de las Cortes). Misma estructura y mismas fuentes para todas."),
                    "contexto": {"fecha_referencia": REF, "coaliciones_con_grupo": COALICIONES_CON_GRUPO,
                                 "lista_minima": ["erc", "ehbildu", "junts", "pnv", "pp", "psoe", "sumar", "vox"],
                                 "otras_del_anexo": ["bng", "cc", "podemos", "upn"],
                                 "asturias": "no comprobado"}},
           "registros": registros}
    (raiz / "data" / "partidos.json").write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(len(registros), "partidos;", len(votaciones), "votaciones;", sum(1 for r in registros if r["clasificacion"]), "con CHES")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
