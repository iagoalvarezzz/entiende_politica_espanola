"""H3: fuentes, competencias por materia y nivel, e indicadores económicos.
Consultas del 04-11-2026. Uso: python datos_h3.py <raíz del proyecto>. Es idempotente."""
import json
import pathlib
import sys

HOY = "2026-11-04"
NAV = "Abierta con el navegador integrado el 2026-11-04."

INE = "https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid={}&menu=ultiDatos&idp={}"

# (id, título, institución, tipo, grupo, uso, url, texto esperado, nota)
FUENTES = [
    ("boe-lbrl", "Ley 7/1985, de 2 de abril, Reguladora de las Bases del Régimen Local (texto consolidado)", "Boletín Oficial del Estado", "norma", "normas",
     "Gobierno municipal y competencias de los ayuntamientos y diputaciones", "https://www.boe.es/buscar/act.php?id=BOE-A-1985-5392", "Bases del Régimen Local",
     "Última actualización publicada el 03/10/2026. Artículos 19, 25, 26 y 36 leídos."),
    ("boe-lofca", "Ley Orgánica 8/1980, de Financiación de las Comunidades Autónomas (texto consolidado)", "Boletín Oficial del Estado", "norma", "normas",
     "Recursos de las comunidades, tributos cedidos y regímenes forales", "https://www.boe.es/buscar/act.php?id=BOE-A-1980-21166", "Financiación de las Comunidades Autónomas",
     "Última actualización publicada el 29/07/2022. Artículos 4 y 11 y disposiciones adicionales primera y segunda leídos."),
    ("boe-trlrhl", "Texto refundido de la Ley Reguladora de las Haciendas Locales (Real Decreto Legislativo 2/2004)", "Boletín Oficial del Estado", "norma", "normas",
     "Recursos e impuestos de las entidades locales", "https://www.boe.es/buscar/act.php?id=BOE-A-2004-4214", "Haciendas Locales",
     "Última actualización publicada el 07/10/2026. Artículos 2, 20 y 59 leídos."),
    ("boe-ley-22-2009", "Ley 22/2009, sistema de financiación de las comunidades autónomas de régimen común (texto consolidado)", "Boletín Oficial del Estado", "norma", "normas",
     "Competencias normativas de las comunidades en el IRPF", "https://www.boe.es/buscar/act.php?id=BOE-A-2009-20375", "Ley 22/2009",
     "Última actualización publicada el 29/07/2022. Artículos 30 y 46 leídos."),
    ("boe-lgss", "Texto refundido de la Ley General de la Seguridad Social (Real Decreto Legislativo 8/2015)", "Boletín Oficial del Estado", "norma", "normas",
     "Sistema de reparto, pensiones contributivas y no contributivas, revalorización", "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724", "Ley General de la Seguridad Social",
     "Última actualización publicada el 21/10/2026. Artículos 42, 58, 109 y 110 leídos."),
    ("boe-smi-2026", "Real Decreto 126/2026, de 18 de febrero, por el que se fija el salario mínimo interprofesional para 2026", "Boletín Oficial del Estado", "norma", "normas",
     "Cuantía del salario mínimo interprofesional de 2026", "https://www.boe.es/buscar/act.php?id=BOE-A-2026-3815", "salario mínimo interprofesional",
     "BOE núm. 44, de 19-02-2026. Artículo 1 leído."),
    ("eurlex-tfue", "Tratado de Funcionamiento de la Unión Europea (versión consolidada, DO C 202 de 7-6-2016)", "EUR-Lex (Unión Europea)", "norma", "union_europea",
     "Categorías de competencias de la Unión, política monetaria, actos jurídicos y Protocolo n.º 12", "https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:12016E/TXT", "Tratado de Funcionamiento",
     "Artículos 2 a 6, 127, 282 y 288 y Protocolo n.º 12 leídos."),
    ("eurlex-tue", "Tratado de la Unión Europea (versión consolidada, DO C 202 de 7-6-2016)", "EUR-Lex (Unión Europea)", "norma", "union_europea",
     "Instituciones de la Unión", "https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:12016M/TXT", "Tratado de la Unión Europea",
     "Artículos 14 a 17 y 19 leídos."),
    ("mpt-estatutos", "Estatutos de Autonomía vigentes", "Ministerio de Política Territorial", "otro", "normas",
     "Lista oficial de comunidades y ciudades autónomas con Estatuto", "https://mptmd.gob.es/portal/politica-territorial/autonomica/estatutos_autonomia/est_autonomia", "Estatutos de Autonomía",
     "Lista de 17 comunidades y 2 ciudades autónomas."),
    ("hacienda-presupuestos-eell", "Presupuestos, ejecución presupuestaria y liquidaciones de las entidades locales", "Ministerio de Hacienda", "estadistica", "estadisticas",
     "Dónde consultar el presupuesto de un ayuntamiento (aplicación CONPREL)", "https://www.hacienda.gob.es/es-ES/Areas%20Tematicas/Administracion%20Electronica/OVEELL/Paginas/ConsultaPresupuestosYLiquidaciones.aspx", "Presupuestos",
     "Enlaza a la consulta CONPREL de presupuestos y liquidaciones."),
    ("ine-cntr", "Contabilidad Nacional Trimestral de España: últimos datos", "Instituto Nacional de Estadística", "estadistica", "estadisticas",
     "PIB trimestral", INE.format("1254736164439", "1254735576581"), "Contabilidad nacional trimestral", "Avance del tercer trimestre de 2026, publicado el 30-10-2026."),
    ("ine-cna", "Contabilidad Nacional Anual de España: últimos datos", "Instituto Nacional de Estadística", "estadistica", "estadisticas",
     "PIB anual a precios corrientes", INE.format("1254736177057", "1254735576581"), "Contabilidad nacional anual", "Avance de 2025, publicado el 18-09-2026."),
    ("ine-ipc", "Índice de Precios de Consumo: últimos datos", "Instituto Nacional de Estadística", "estadistica", "estadisticas",
     "Inflación general y subyacente", INE.format("1254736176802", "1254735976607"), "Índice de precios de consumo", "Indicador adelantado de octubre de 2026, publicado el 30-10-2026."),
    ("ine-epa", "Encuesta de Población Activa: últimos datos", "Instituto Nacional de Estadística", "estadistica", "estadisticas",
     "Tasa de paro y ocupados", INE.format("1254736176918", "1254735976595"), "Encuesta de población activa", "Tercer trimestre de 2026, publicado el 27-10-2026."),
    ("ine-ecv", "Encuesta de Condiciones de Vida: últimos datos", "Instituto Nacional de Estadística", "estadistica", "estadisticas",
     "Riesgo de pobreza o exclusión social (AROPE)", INE.format("1254736176807", "1254735976608"), "Encuesta de Condiciones de Vida", "Año 2025, publicado el 05-02-2026."),
    ("ine-eaes", "Encuesta Anual de Estructura Salarial: últimos datos", "Instituto Nacional de Estadística", "estadistica", "estadisticas",
     "Salario medio anual", INE.format("1254736177025", "1254735976596"), "estructura salarial", "Año 2024, publicado el 28-05-2026."),
    ("bde-deuda-2026-08", "La deuda de las Administraciones Públicas se situó en agosto de 2026 en el 99,7% del PIB", "Banco de España", "estadistica", "estadisticas",
     "Deuda pública según el Protocolo de Déficit Excesivo", "https://www.bde.es/wbe/es/noticias-eventos/actualidad-banco-espana/notas-banco-espana/deuda-aapp-agosto26.html", "deuda de las Administraciones Públicas",
     "Nota de prensa estadística del 21-10-2026 (avance mensual)."),
    ("bde-tipos-interes", "Estadísticas de tipos de interés", "Banco de España", "estadistica", "estadisticas",
     "Serie mensual del euríbor a un año (notas de prensa)", "https://www.bde.es/webbe/es/estadisticas/temas/tipos-interes.html", "tipos de interés",
     "Lista de notas de prensa mensuales del euríbor, de noviembre de 2025 a octubre de 2026."),
    ("bde-euribor-2026-10", "El euríbor se sitúa en el 3,239% en octubre, 1,052 puntos más que hace un año", "Banco de España", "estadistica", "estadisticas",
     "Euríbor a un año de octubre de 2026", "https://www.bde.es/wbe/es/noticias-eventos/actualidad-banco-espana/notas-banco-espana/euribor-octubre-2026.html", "euríbor",
     "Nota del 03-11-2026. Indica que el índice no es referencia oficial hasta su publicación en el BOE."),
    ("hacienda-deficit-2025", "España cierra 2025 con un déficit público del 2,2% del PIB", "Ministerio de Hacienda", "estadistica", "estadisticas",
     "Déficit del conjunto de las Administraciones Públicas en 2025", "https://www.hacienda.gob.es/es-ES/Prensa/Noticias/Paginas/2026/20260331-NP-CIERRE-DEFICIT.aspx", "déficit",
     "Nota de prensa del 31-03-2026. El titular redondea al 2,2 %; el texto da el 2,18 %."),
    ("eurostat-presion-fiscal-2025", "EU and euro area tax-to-GDP ratio up in 2025", "Eurostat", "estadistica", "union_europea",
     "Impuestos y cotizaciones sociales sobre el PIB (2025)", "https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20261029-3", "tax-to-GDP",
     "Noticia del 29-10-2026. Conjunto de datos gov_10a_taxag."),
    ("eurostat-cofog", "General government expenditure by function (COFOG), gov_10a_exp", "Eurostat", "estadistica", "union_europea",
     "Gasto público por funciones", "https://ec.europa.eu/eurostat/databrowser/view/gov_10a_exp/default/table?lang=es", "COFOG",
     "Datos consultados en la API de Eurostat el 04-11-2026; conjunto actualizado el 21-10-2026. 2024 es provisional."),
    ("bce-tipos", "Key ECB interest rates", "Banco Central Europeo", "estadistica", "union_europea",
     "Tipos de interés oficiales del BCE", "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/key_ecb_interest_rates/html/index.es.html", "Key ECB interest rates",
     "Página en inglés. Tipos vigentes desde el 16-09-2026."),
    ("inclusion-afiliacion-2026-10", "La Seguridad Social supera los 22,6 millones de afiliados en octubre", "Ministerio de Inclusión, Seguridad Social y Migraciones", "estadistica", "estadisticas",
     "Afiliación media a la Seguridad Social de octubre de 2026", "https://www.inclusion.gob.es/w/la-seguridad-social-supera-los-22-6-millones-de-afiliados-en-octubre-tras-sumar-784.573-afiliados-en-el-ultimo-ano", "afiliados",
     "Nota del 04-11-2026."),
    ("mites-paro-2026-10", "El paro registrado aumentó en 43.128 personas en octubre y se sitúa en 2.422.633", "Ministerio de Trabajo y Economía Social", "estadistica", "estadisticas",
     "Paro registrado de octubre de 2026", "https://prensa.mites.gob.es/webPrensa/listado-noticia/noticia/4575", "paro registrado",
     "Nota del 04-11-2026."),
]

# ---------- Competencias: materia × nivel ----------
# (materia, nivel, valor, normas, articulo, fuente_id) ; normas vacías = sin información verificada
SIN = "Sin información verificada"
EST = "mpt-estatutos"
C = [
    ("sanidad", "estado", "Bases y coordinación general de la sanidad, sanidad exterior y legislación sobre productos farmacéuticos.", ["ce-149-1-16"], "Constitución, art. 149.1.16.ª", "boe-constitucion"),
    ("sanidad", "autonomico", "Sanidad e higiene: pueden asumirla y gestionarla según su Estatuto.", ["ce-148-1-21"], "Constitución, art. 148.1.21.ª", "boe-constitucion"),
    ("sanidad", "local", "Protección de la salubridad pública.", ["lbrl-25-2"], "Ley 7/1985, art. 25.2.j", "boe-lbrl"),
    ("sanidad", "ue", "Apoya la protección de la salud humana; comparte los asuntos comunes de seguridad en salud pública.", ["tfue-6", "tfue-4"], "TFUE, arts. 4.2.k y 6.a", "eurlex-tfue"),
    ("educacion", "estado", "Títulos académicos y normas básicas para desarrollar el derecho a la educación.", ["ce-149-1-30"], "Constitución, art. 149.1.30.ª", "boe-constitucion"),
    ("educacion", "autonomico", SIN + ": depende de cada Estatuto. La Constitución permite que asuman lo no reservado al Estado.", ["ce-149-3"], "Constitución, art. 149.3; Estatutos sin leer", EST),
    ("educacion", "local", "Vigilar la escolaridad obligatoria y conservar los edificios de infantil, primaria y especial de titularidad local.", ["lbrl-25-2"], "Ley 7/1985, art. 25.2.n", "boe-lbrl"),
    ("educacion", "ue", "Apoya, coordina o complementa la acción de los Estados.", ["tfue-6"], "TFUE, art. 6.e", "eurlex-tfue"),
    ("vivienda", "estado", SIN + ": su alcance está en disputa jurídica y no se ha revisado la jurisprudencia.", [], "Pendiente: sentencias del Tribunal Constitucional", "tc"),
    ("vivienda", "autonomico", "Ordenación del territorio, urbanismo y vivienda.", ["ce-148-1-3"], "Constitución, art. 148.1.3.ª", "boe-constitucion"),
    ("vivienda", "local", "Urbanismo y promoción y gestión de vivienda de protección pública.", ["lbrl-25-2"], "Ley 7/1985, art. 25.2.a", "boe-lbrl"),
    ("vivienda", "ue", "No figura entre los ámbitos que enumeran los artículos 3 a 6 del TFUE.", ["tfue-3", "tfue-4", "tfue-6"], "TFUE, arts. 3 a 6", "eurlex-tfue"),
    ("transporte", "estado", "Ferrocarriles y transportes por más de una comunidad; tráfico; puertos y aeropuertos de interés general.", ["ce-149-1-21"], "Constitución, art. 149.1.20.ª y 21.ª", "boe-constitucion"),
    ("transporte", "autonomico", "Ferrocarriles y carreteras que discurren solo por su territorio.", ["ce-148-1-5"], "Constitución, art. 148.1.5.ª", "boe-constitucion"),
    ("transporte", "local", "Infraestructura viaria, tráfico y transporte colectivo urbano.", ["lbrl-25-2"], "Ley 7/1985, art. 25.2.d y g", "boe-lbrl"),
    ("transporte", "ue", "Transportes y redes transeuropeas: competencia compartida.", ["tfue-4"], "TFUE, art. 4.2.g y h", "eurlex-tfue"),
    ("seguridad", "estado", "Seguridad pública.", ["ce-149-1-29"], "Constitución, art. 149.1.29.ª", "boe-constitucion"),
    ("seguridad", "autonomico", "Vigilancia de sus edificios, coordinación de las policías locales y, según su Estatuto, policía propia.", ["ce-148-1-22", "ce-149-1-29"], "Constitución, arts. 148.1.22.ª y 149.1.29.ª", "boe-constitucion"),
    ("seguridad", "local", "Policía local, protección civil y prevención y extinción de incendios.", ["lbrl-25-2"], "Ley 7/1985, art. 25.2.f", "boe-lbrl"),
    ("seguridad", "ue", "Espacio de libertad, seguridad y justicia: competencia compartida.", ["tfue-4"], "TFUE, art. 4.2.j", "eurlex-tfue"),
    ("justicia", "estado", "Administración de Justicia y legislación penal y procesal.", ["ce-149-1-5", "ce-149-1-6"], "Constitución, art. 149.1.5.ª y 6.ª", "boe-constitucion"),
    ("justicia", "autonomico", SIN + ": depende de cada Estatuto.", [], "Estatutos sin leer", EST),
    ("justicia", "local", SIN + ".", [], "Ley 7/1985 sin norma específica revisada", "boe-lbrl"),
    ("justicia", "ue", "Espacio de libertad, seguridad y justicia: competencia compartida.", ["tfue-4"], "TFUE, art. 4.2.j", "eurlex-tfue"),
    ("impuestos", "estado", "Potestad originaria para crear tributos por ley y Hacienda general.", ["ce-133-1", "ce-149-1-14"], "Constitución, arts. 133.1 y 149.1.14.ª", "boe-constitucion"),
    ("impuestos", "autonomico", "Tributos propios y cedidos; en el IRPF pueden aprobar una escala autonómica.", ["ce-133-2", "lofca-11", "l22-46"], "Constitución, art. 133.2; LOFCA, art. 11; Ley 22/2009, art. 46", "boe-lofca"),
    ("impuestos", "local", "IBI, IAE y vehículos son obligatorios; construcciones y plusvalía, voluntarios; además, tasas.", ["trlrhl-59", "ce-133-2"], "Texto refundido de Haciendas Locales, art. 59", "boe-trlrhl"),
    ("impuestos", "ue", "Unión aduanera: competencia exclusiva.", ["tfue-3"], "TFUE, art. 3.1.a", "eurlex-tfue"),
    ("servicios-sociales", "estado", "Legislación básica y régimen económico de la Seguridad Social.", ["ce-149-1-17"], "Constitución, art. 149.1.17.ª", "boe-constitucion"),
    ("servicios-sociales", "autonomico", "Asistencia social.", ["ce-148-1-20"], "Constitución, art. 148.1.20.ª", "boe-constitucion"),
    ("servicios-sociales", "local", "Evaluar situaciones de necesidad social y atender de inmediato a personas en riesgo de exclusión.", ["lbrl-25-2", "lbrl-26-1"], "Ley 7/1985, arts. 25.2.e y 26.1.c", "boe-lbrl"),
    ("servicios-sociales", "ue", "Política social, en los aspectos que definen los Tratados: competencia compartida.", ["tfue-4"], "TFUE, art. 4.2.b", "eurlex-tfue"),
    ("medio-ambiente", "estado", "Legislación básica sobre protección del medio ambiente.", ["ce-149-1-23"], "Constitución, art. 149.1.23.ª", "boe-constitucion"),
    ("medio-ambiente", "autonomico", "Gestión de la protección del medio ambiente y normas adicionales de protección.", ["ce-148-1-9", "ce-149-1-23"], "Constitución, arts. 148.1.9.ª y 149.1.23.ª", "boe-constitucion"),
    ("medio-ambiente", "local", "Medio ambiente urbano: parques, residuos y contaminación acústica, lumínica y atmosférica.", ["lbrl-25-2"], "Ley 7/1985, art. 25.2.b", "boe-lbrl"),
    ("medio-ambiente", "ue", "Medio ambiente: competencia compartida.", ["tfue-4"], "TFUE, art. 4.2.e", "eurlex-tfue"),
    ("energia", "estado", "Bases del régimen minero y energético.", ["ce-149-1-25"], "Constitución, art. 149.1.25.ª", "boe-constitucion"),
    ("energia", "autonomico", SIN + ": depende de cada Estatuto.", [], "Estatutos sin leer", EST),
    ("energia", "local", "Promoción y participación en comunidades ciudadanas de energía y de energías renovables.", ["lbrl-25-2"], "Ley 7/1985, art. 25.2.p", "boe-lbrl"),
    ("energia", "ue", "Energía: competencia compartida.", ["tfue-4"], "TFUE, art. 4.2.i", "eurlex-tfue"),
    ("inmigracion", "estado", "Nacionalidad, inmigración, emigración, extranjería y derecho de asilo.", ["ce-149-1-2"], "Constitución, art. 149.1.2.ª", "boe-constitucion"),
    ("inmigracion", "autonomico", SIN + ": depende de cada Estatuto.", [], "Estatutos sin leer", EST),
    ("inmigracion", "local", SIN + ".", [], "Ley 7/1985 sin norma específica revisada", "boe-lbrl"),
    ("inmigracion", "ue", "Espacio de libertad, seguridad y justicia, que incluye fronteras, asilo e inmigración: competencia compartida.", ["tfue-4"], "TFUE, art. 4.2.j", "eurlex-tfue"),
    ("exterior-defensa", "estado", "Relaciones internacionales, defensa y Fuerzas Armadas.", ["ce-149-1-3", "ce-149-1-4"], "Constitución, art. 149.1.3.ª y 4.ª", "boe-constitucion"),
    ("exterior-defensa", "autonomico", SIN + ".", [], "Estatutos sin leer", EST),
    ("exterior-defensa", "local", SIN + ".", [], "Ley 7/1985 sin norma específica revisada", "boe-lbrl"),
    ("exterior-defensa", "ue", "Política exterior y de seguridad común, incluida la definición progresiva de una política común de defensa.", ["tfue-2"], "TFUE, art. 2.4", "eurlex-tfue"),
    ("moneda", "estado", "La Constitución reserva al Estado el sistema monetario; en la zona del euro, la política monetaria es de la Unión.", ["ce-149-1-11", "ce-93"], "Constitución, arts. 93 y 149.1.11.ª", "boe-constitucion"),
    ("moneda", "autonomico", SIN + ".", [], "Sin norma revisada", EST),
    ("moneda", "local", SIN + ".", [], "Sin norma revisada", "boe-lbrl"),
    ("moneda", "ue", "Política monetaria de los Estados del euro: competencia exclusiva. La dirige el Eurosistema, con el BCE.", ["tfue-3", "tfue-282"], "TFUE, arts. 3.1.c y 282", "eurlex-tfue"),
    ("agricultura-pesca", "estado", "Pesca marítima y bases de la planificación general de la economía.", ["ce-149-1-19", "ce-149-1-13"], "Constitución, art. 149.1.13.ª y 19.ª", "boe-constitucion"),
    ("agricultura-pesca", "autonomico", "Agricultura y ganadería; pesca en aguas interiores, marisqueo y acuicultura.", ["ce-148-1-7", "ce-148-1-11"], "Constitución, art. 148.1.7.ª y 11.ª", "boe-constitucion"),
    ("agricultura-pesca", "local", SIN + ".", [], "Ley 7/1985 sin norma específica revisada", "boe-lbrl"),
    ("agricultura-pesca", "ue", "Agricultura y pesca: compartida. La conservación de los recursos marinos en la política pesquera común es exclusiva.", ["tfue-3", "tfue-4"], "TFUE, arts. 3.1.d y 4.2.d", "eurlex-tfue"),
    ("comercio", "estado", "Comercio exterior y legislación mercantil.", ["ce-149-1-10", "ce-149-1-6"], "Constitución, art. 149.1.6.ª y 10.ª", "boe-constitucion"),
    ("comercio", "autonomico", "Ferias interiores y fomento del desarrollo económico de la comunidad.", ["ce-148-1-12"], "Constitución, art. 148.1.12.ª y 13.ª", "boe-constitucion"),
    ("comercio", "local", "Ferias, abastos, mercados, lonjas y comercio ambulante.", ["lbrl-25-2"], "Ley 7/1985, art. 25.2.i", "boe-lbrl"),
    ("comercio", "ue", "Política comercial común: exclusiva. Mercado interior: compartida.", ["tfue-3", "tfue-4"], "TFUE, arts. 3.1.e y 4.2.a", "eurlex-tfue"),
]

URLS = {
    "boe-constitucion": ("https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229", "2026-05-20"),
    "boe-lbrl": ("https://www.boe.es/buscar/act.php?id=BOE-A-1985-5392", "2026-10-03"),
    "boe-lofca": ("https://www.boe.es/buscar/act.php?id=BOE-A-1980-21166", "2022-07-29"),
    "boe-trlrhl": ("https://www.boe.es/buscar/act.php?id=BOE-A-2004-4214", "2026-10-07"),
    "eurlex-tfue": ("https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:12016E/TXT", "2016-06-07"),
}

# ---------- Indicadores ----------
# (id, grupo, valor, unidad, periodo, fuente_id, url, fecha_publicacion, nota)
def ind(id_, grupo, valor, unidad, periodo, fuente, url, publicacion, nota=None):
    return dict(id=id_, grupo=grupo, valor=valor, unidad=unidad, periodo=periodo, fuente_id=fuente, url=url, fecha_publicacion=publicacion, nota=nota)

F = {f[0]: f[6] for f in FUENTES}
I = [
    ind("pib-trimestral", "tablero", 0.6, "% de variación sobre el trimestre anterior, en volumen", "3.er trimestre de 2026 (avance)", "ine-cntr", F["ine-cntr"], "2026-10-30", "Datos ajustados de estacionalidad y calendario."),
    ind("pib-interanual", "tablero", 2.7, "% de variación sobre el mismo trimestre del año anterior, en volumen", "3.er trimestre de 2026 (avance)", "ine-cntr", F["ine-cntr"], "2026-10-30"),
    ind("pib-anual-nominal", "tablero", 1690012, "millones de euros a precios corrientes", "2025 (avance)", "ine-cna", F["ine-cna"], "2026-09-18", "Variación nominal del 5,7 % y en volumen del 2,6 %."),
    ind("ipc-anual", "tablero", 4.9, "% de variación anual", "Octubre de 2026 (indicador adelantado)", "ine-ipc", F["ine-ipc"], "2026-10-30", "Variación mensual: 0,6 %."),
    ind("ipc-subyacente", "tablero", 3.1, "% de variación anual", "Octubre de 2026 (indicador adelantado)", "ine-ipc", F["ine-ipc"], "2026-10-30", "Sin alimentos no elaborados ni productos energéticos."),
    ind("paro-epa", "tablero", 10.18, "% de la población activa", "3.er trimestre de 2026", "ine-epa", F["ine-epa"], "2026-10-27", "0,27 puntos menos que un año antes."),
    ind("ocupados-epa", "tablero", 22852.6, "miles de personas ocupadas", "3.er trimestre de 2026", "ine-epa", F["ine-epa"], "2026-10-27"),
    ind("paro-registrado", "tablero", 2422633, "personas inscritas en las oficinas de empleo", "Octubre de 2026 (último día del mes)", "mites-paro-2026-10", F["mites-paro-2026-10"], "2026-11-04", "43.128 más que en septiembre."),
    ind("afiliacion", "tablero", 22624165, "afiliados medios a la Seguridad Social", "Octubre de 2026", "inclusion-afiliacion-2026-10", F["inclusion-afiliacion-2026-10"], "2026-11-04", "784.573 más que un año antes."),
    ind("salario-medio", "tablero", 29540.26, "euros brutos al año por trabajador", "2024", "ine-eaes", F["ine-eaes"], "2026-05-28"),
    ind("smi-mensual", "tablero", 1221, "euros brutos al mes, en 14 pagas", "2026", "boe-smi-2026", F["boe-smi-2026"], "2026-02-19", "40,70 euros al día. En cómputo anual, 17.094 euros."),
    ind("deficit", "tablero", 2.18, "% del PIB", "2025", "hacienda-deficit-2025", F["hacienda-deficit-2025"], "2026-03-31", "36.780 millones de euros, conjunto de las Administraciones Públicas."),
    ind("deuda", "tablero", 99.7, "% del PIB", "Agosto de 2026 (avance)", "bde-deuda-2026-08", F["bde-deuda-2026-08"], "2026-10-21", "1.750 miles de millones de euros, según el Protocolo de Déficit Excesivo."),
    ind("presion-fiscal", "tablero", 38.1, "% del PIB (impuestos y cotizaciones sociales netas)", "2025", "eurostat-presion-fiscal-2025", F["eurostat-presion-fiscal-2025"], "2026-10-29", "En 2024, 37,2 %. Unión Europea: 40,7 %; zona del euro: 41,3 %."),
    ind("arope", "tablero", 25.7, "% de la población en riesgo de pobreza o exclusión social", "2025", "ine-ecv", F["ine-ecv"], "2026-02-05", "Tasa de riesgo de pobreza: 19,5 %."),
    ind("bce-deposito", "tablero", 2.5, "% (facilidad de depósito)", "Vigente desde el 16-09-2026", "bce-tipos", F["bce-tipos"], None, "Operaciones principales de financiación: 2,65 %."),
    ind("euribor", "tablero", 3.239, "% (euríbor a un año)", "Octubre de 2026", "bde-euribor-2026-10", F["bde-euribor-2026-10"], "2026-11-03", "1,052 puntos más que un año antes."),
]
PEND = [
    ("salario-mediano", "Salario mediano anual", "ine-eaes"),
    ("pib-per-capita", "PIB per cápita", "ine-cna"),
    ("productividad", "Productividad", "ine-cna"),
    ("gini", "Coeficiente de Gini", "ine-ecv"),
]
EURIBOR = [
    ("2025-11", 2.217, "2025-12-01"), ("2025-12", 2.267, "2026-01-02"), ("2026-01", 2.245, "2026-02-02"),
    ("2026-02", 2.221, "2026-03-02"), ("2026-03", 2.565, "2026-04-01"), ("2026-04", 2.747, "2026-05-04"),
    ("2026-05", 2.804, "2026-06-01"), ("2026-06", 2.798, "2026-07-01"), ("2026-07", 2.855, "2026-08-03"),
    ("2026-08", 2.954, "2026-09-01"), ("2026-09", 3.247, "2026-10-01"), ("2026-10", 3.239, "2026-11-03"),
]
COFOG = [
    ("gf01", "Servicios públicos generales", 5.8), ("gf02", "Defensa", 0.9), ("gf03", "Orden público y seguridad", 1.8),
    ("gf04", "Asuntos económicos", 5.1), ("gf05", "Protección del medio ambiente", 1.0), ("gf06", "Vivienda y servicios comunitarios", 0.5),
    ("gf07", "Sanidad", 6.5), ("gf08", "Ocio, cultura y religión", 1.2), ("gf09", "Educación", 4.1), ("gf10", "Protección social", 18.7),
    ("total", "Total", 45.5),
]


def main(raiz):
    raiz = pathlib.Path(raiz)

    # Esquema dato: campos opcionales para competencias e indicadores.
    ruta = raiz / "data" / "schemas" / "dato.schema.json"
    esquema = json.loads(ruta.read_text(encoding="utf-8"))
    props = esquema["properties"]
    props.setdefault("materia", {"$ref": "comun.schema.json#/$defs/id"})
    props.setdefault("nivel", {"enum": ["estado", "autonomico", "local", "ue"]})
    props.setdefault("normas", {"type": "array", "items": {"$ref": "comun.schema.json#/$defs/id"}})
    props.setdefault("grupo", {"$ref": "comun.schema.json#/$defs/id"})
    esquema["description"] = esquema["description"].split(" Ampliación H3")[0] + (
        " Ampliación H3: materia y nivel (competencias; el nivel de gobierno va en nivel y lo que decide, en valor), "
        "normas (ids de data/normas.json que la sostienen) y grupo (para separar series en un mismo conjunto).")
    ruta.write_text(json.dumps(esquema, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")

    ruta = raiz / "data" / "sources.json"
    doc = json.loads(ruta.read_text(encoding="utf-8"))
    ids = {r["id"] for r in doc["registros"]}
    for (id_, titulo, inst, tipo, grupo, uso, url, esperado, nota) in FUENTES:
        if id_ in ids:
            continue
        doc["registros"].append({
            "id": id_, "titulo": titulo, "institucion": inst, "tipo": tipo, "grupo": grupo, "uso": uso, "url": url,
            "texto_esperado": esperado, "estado_enlace": "abierta", "comprobado_por": "navegador",
            "fecha_comprobacion": HOY, "nota": NAV + " " + nota,
        })
    doc["meta"].update(version="0.4.0", actualizado=HOY)
    ruta.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")

    registros = []
    for materia, nivel, valor, normas, articulo, fuente in C:
        r = {"id": f"{materia}-{nivel}", "conjunto": "competencias", "materia": materia, "nivel": nivel, "valor": valor,
             "normas": normas, "articulo": articulo, "unidad": "sin unidad", "periodo": "normas vigentes el 04-11-2026",
             "fuente_id": fuente}
        if normas and not valor.startswith(SIN):
            url, publicacion = URLS[fuente]
            r.update(url=url, fecha_publicacion=publicacion, fecha_consulta=HOY, estado="verificado", etiqueta="NORMA VIGENTE")
        else:
            r.update(estado="pendiente", etiqueta="PENDIENTE DE VERIFICAR")
        registros.append(r)
    doc = {"meta": {"conjunto": "competencias", "esquema": "dato", "version": "0.4.0", "actualizado": HOY,
                    "descripcion": "Quién decide cada materia: Estado, comunidades autónomas, entidades locales y Unión Europea, con la norma que lo sostiene o PENDIENTE DE VERIFICAR."},
           "registros": registros}
    (raiz / "data" / "competencias.json").write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")

    registros = []
    for d in I:
        r = {"id": d["id"], "conjunto": "indicadores", "grupo": d["grupo"], "valor": d["valor"], "unidad": d["unidad"],
             "periodo": d["periodo"], "fuente_id": d["fuente_id"], "url": d["url"]}
        if d["fecha_publicacion"]:
            r["fecha_publicacion"] = d["fecha_publicacion"]
        r.update(fecha_consulta=HOY, estado="verificado", etiqueta="DATO OFICIAL")
        if d["nota"]:
            r["nota"] = d["nota"]
        registros.append(r)
    for id_, nombre, fuente in PEND:
        registros.append({"id": id_, "conjunto": "indicadores", "grupo": "tablero", "valor": "sin dato cargado", "unidad": "sin unidad",
                          "periodo": "sin periodo", "fuente_id": fuente, "estado": "pendiente", "etiqueta": "PENDIENTE DE VERIFICAR",
                          "nota": f"{nombre}: la fuente no lo da calculado en la página consultada; no se calcula aquí combinando fuentes."})
    for mes, valor, publicacion in EURIBOR:
        registros.append({"id": "euribor-" + mes, "conjunto": "indicadores", "grupo": "euribor-mensual", "valor": valor,
                          "unidad": "% (euríbor a un año, media mensual)", "periodo": mes, "fuente_id": "bde-tipos-interes",
                          "url": F["bde-tipos-interes"], "fecha_publicacion": publicacion, "fecha_consulta": HOY,
                          "estado": "verificado", "etiqueta": "DATO OFICIAL"})
    for cod, nombre, valor in COFOG:
        registros.append({"id": "cofog-" + cod, "conjunto": "indicadores", "grupo": "gasto-funciones", "valor": valor,
                          "unidad": "% del PIB", "periodo": "2024 (provisional)", "fuente_id": "eurostat-cofog",
                          "url": F["eurostat-cofog"], "fecha_publicacion": "2026-10-21", "fecha_consulta": HOY,
                          "estado": "verificado", "etiqueta": "DATO OFICIAL", "nota": nombre})
    doc = {"meta": {"conjunto": "indicadores", "esquema": "dato", "version": "0.4.0", "actualizado": HOY,
                    "descripcion": "Últimos datos oficiales de los indicadores económicos, la serie mensual del euríbor y el gasto público por funciones (COFOG), con fuente y fechas."},
           "registros": registros}
    (raiz / "data" / "indicadores.json").write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print("fuentes:", len(FUENTES), "competencias:", len(C), "indicadores:", len(I) + len(PEND) + len(EURIBOR) + len(COFOG))


if __name__ == "__main__":
    main(sys.argv[1])
