"""Ejecuta todas las pruebas con un solo comando: python tools/run_tests.py

1. Ficheros generados al día (tools/build.py --check).
2. Validación de data/ (tools/validate.py) y casos del validador.
3. T1: integridad de las tablas de escaños y senadores (Anexo C.2.1).
4. Diseño y contenido: contraste de colores (WCAG 2.2 AA), etiquetas,
   enlaces de los textos y ausencia de enlaces externos en content/; y
   referencias entre módulos, glosario, normas, preguntas y relaciones.
5. Cálculos (T2 a T10, umbrales), glosario, progreso y cuestionarios, y humo
   de interfaz en 1280 y 375 px, con Chrome o Edge sin interfaz sobre un
   servidor local (tests/run.html).
6. Apertura sin servidor (file://) de index.html y dist/politica-espana.html.

La salida se guarda también en tests/ultima-ejecucion.txt.
Variable opcional PE_NAVEGADOR: ruta al ejecutable de Chrome o Edge.
"""
import functools
import html
import http.server
import json
import os
import pathlib
import re
import subprocess
import sys
import tempfile
import threading

RAIZ = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "tools"))

import build  # noqa: E402
import validate  # noqa: E402

NAVEGADORES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
]

lineas = []
fallos = []


def informar(texto=""):
    lineas.append(texto)
    print(texto)


def resultado(nombre, ok, detalles=()):
    informar(f"[{'OK' if ok else 'FALLO'}] {nombre}")
    for d in detalles:
        informar(f"        {d}")
    if not ok:
        fallos.append(nombre)


# ---------- 1 y 2: generados y datos ----------

def probar_generados():
    pendientes = [r for r, c in build.generados().items()
                  if not (RAIZ / r).exists() or (RAIZ / r).read_text(encoding="utf-8") != c]
    resultado("Ficheros generados al día (build.py --check)", not pendientes, pendientes)


def probar_datos():
    informe = validate.validar_todo()
    for nombre, errores in informe.items():
        resultado(f"Validación de {nombre}", not errores, errores[:20])


def probar_casos_validador():
    casos = validate.cargar_json(RAIZ / "tests" / "casos_validador.json")["casos"]
    fuentes = validate.cargar_json(RAIZ / "data" / "sources.json")
    ids = {r["id"] for r in fuentes["registros"]}
    esquemas = validate.Esquemas()
    for caso in casos:
        documento = {
            "meta": {"conjunto": "casos", "esquema": caso["esquema"], "version": "0.0.0",
                     "actualizado": "2026-10-29", "descripcion": caso["nombre"]},
            "registros": caso["registros"],
        }
        errores = validate.validar_documento("caso", documento, ids, esquemas)
        esperado = caso["error_esperado"]
        if esperado is None:
            resultado(f"Validador acepta: {caso['nombre']}", not errores, errores[:5])
        else:
            ok = any(esperado in e for e in errores)
            resultado(f"Validador rechaza: {caso['nombre']}", ok,
                      [] if ok else [f"se esperaba un error con «{esperado}»; errores: {errores[:5]}"])


# ---------- 3: T1 ----------

def probar_t1():
    t1 = json.loads((RAIZ / "tests" / "vectores.json").read_text(encoding="utf-8"))["T1"]
    convocatorias = {c["id"]: c for c in validate.cargar_json(RAIZ / "data" / "convocatorias.json")["registros"]}
    actual, anterior = convocatorias[t1["eleccion"]], convocatorias[t1["eleccion_anterior"]]
    circ = actual["circunscripciones"]
    provincias = [c for c in circ if c.get("tipo") == "provincia"]
    ciudades = [c for c in circ if c.get("tipo") == "ciudad_autonoma"]
    total = sum(c["escanos_congreso"] for c in circ)
    minimos = t1["minimo_provincia"] * len(provincias) + t1["escanos_ciudad_autonoma"] * len(ciudades)

    resultado("T1: 52 circunscripciones (50 provincias, Ceuta y Melilla)",
              len(circ) == t1["circunscripciones"] and len(provincias) == t1["provincias"]
              and sorted(c["id"] for c in ciudades) == sorted(t1["ciudades_autonomas"]),
              [f"circunscripciones {len(circ)}, provincias {len(provincias)}, ciudades {[c['id'] for c in ciudades]}"])
    resultado("T1: los escaños del Congreso suman 350", total == t1["escanos_total"], [f"suma {total}"])
    bajas = [c["id"] for c in provincias if c["escanos_congreso"] < t1["minimo_provincia"]]
    resultado("T1: cada provincia tiene al menos 2 escaños", not bajas, bajas)
    resultado("T1: Ceuta y Melilla tienen 1 escaño cada una",
              all(c["escanos_congreso"] == t1["escanos_ciudad_autonoma"] for c in ciudades))
    resultado("T1: 102 escaños mínimos y 248 repartidos por población",
              minimos == t1["escanos_minimos"] and total - minimos == t1["escanos_por_poblacion"],
              [f"mínimos {minimos}, por población {total - minimos}"])

    previos = {c["id"]: c["escanos_congreso"] for c in anterior["circunscripciones"]}
    cambios = {c["id"]: [previos.get(c["id"]), c["escanos_congreso"]] for c in circ if previos.get(c["id"]) != c["escanos_congreso"]}
    resultado("T1: frente a 2023 solo cambian Madrid (37 → 38) y Cádiz (9 → 8)",
              cambios == t1["cambios_frente_a_anterior"], [f"cambios {cambios}"])

    s = t1["senado"]
    senado = actual["circunscripciones_senado"]
    por_id = {c["id"]: c for c in senado}
    total_senado = sum(c["senadores_elegidos"] for c in senado)
    provincias_4 = [c for c in senado if c["tipo"] == "provincia" and c["senadores_elegidos"] == 4]
    ok_islas3 = all(por_id[i]["senadores_elegidos"] == 3 for i in s["islas_3"]["ids"])
    ok_ciudades = all(por_id[i]["senadores_elegidos"] == 2 for i in s["ciudades_2"]["ids"])
    ok_islas1 = sorted(c["id"] for c in senado if c["tipo"] == "isla" and c["senadores_elegidos"] == 1) == sorted(s["islas_1"]["ids"])
    resultado("T1: senadores elegidos 188 + 9 + 4 + 8 = 209",
              total_senado == s["total"] and len(provincias_4) == s["provincias_4"]["numero"]
              and 4 * len(provincias_4) == s["provincias_4"]["senadores"] and ok_islas3 and ok_ciudades and ok_islas1,
              [f"total {total_senado}, provincias con 4: {len(provincias_4)}, islas de 3: {ok_islas3}, "
               f"Ceuta y Melilla: {ok_ciudades}, islas de 1: {ok_islas1}"])
    por_provincia = {}
    for c in senado:
        por_provincia[c["provincia_id"]] = por_provincia.get(c["provincia_id"], 0) + c["senadores_elegidos"]
    distintos = [c["id"] for c in circ if por_provincia.get(c["id"]) != c["senadores_elegidos"]]
    resultado("T1: los senadores de cada provincia coinciden con la suma de sus circunscripciones del Senado", not distintos, distintos)
    total_anterior = sum(c["senadores_elegidos"] for c in anterior["circunscripciones_senado"])
    resultado("T1: en 2023 se eligieron 208 senadores (Ibiza-Formentera, una circunscripción)",
              total_anterior == s["total_anterior"], [f"total {total_anterior}"])
    no_verificados = [v["ambito"] for v in actual.get("verificaciones", []) if v["estado"] != "verificado"]
    resultado("T1: las tablas de escaños y senadores de 2026 están verificadas", not no_verificados, no_verificados)


# ---------- 4: diseño y contenido ----------

def variables(bloque):
    return dict(re.findall(r"--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;", bloque))


def bloques_de_color():
    css = (RAIZ / "assets" / "css" / "tokens.css").read_text(encoding="utf-8")
    claro = re.search(r"^:root \{(.*?)^\}", css, re.S | re.M).group(1)
    oscuro_sistema = re.search(r':root:not\(\[data-theme="light"\]\) \{(.*?)^  \}', css, re.S | re.M).group(1)
    oscuro = re.search(r'^:root\[data-theme="dark"\] \{(.*?)^\}', css, re.S | re.M).group(1)
    return variables(claro), variables(oscuro_sistema), variables(oscuro)


def luminancia(color):
    canales = [int(color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    lineal = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in canales]
    return 0.2126 * lineal[0] + 0.7152 * lineal[1] + 0.0722 * lineal[2]


def contraste(a, b):
    la, lb = sorted([luminancia(a), luminancia(b)], reverse=True)
    return (la + 0.05) / (lb + 0.05)


ETIQUETAS_ID = ["oficial", "estudio", "norma", "didactica", "simulacion", "propuesta", "prevision",
                "interpretacion", "estimacion", "pendiente"]
INSTITUCIONES = ["congreso", "senado", "gobierno", "justicia", "comunidades", "ayuntamientos", "ue"]


def pares_de_contraste():
    pares = []
    for texto in ("texto", "texto-suave", "enlace"):
        for fondo in ("fondo", "superficie", "superficie-2"):
            pares.append((texto, fondo, 4.5))
    pares.append(("cabecera-texto", "cabecera-fondo", 4.5))
    for fondo in ("fondo", "superficie", "superficie-2"):
        pares.append(("foco", fondo, 3.0))
        pares.append(("borde-fuerte", fondo, 3.0))
    for e in ETIQUETAS_ID:
        pares.append((f"et-{e}-texto", f"et-{e}-fondo", 4.5))
    for i in INSTITUCIONES:
        pares.append((f"inst-{i}", "fondo", 3.0))
        pares.append((f"inst-{i}", "superficie", 3.0))
    return pares


def probar_diseno():
    claro, oscuro_sistema, oscuro = bloques_de_color()
    resultado("Tema oscuro: el bloque del sistema y el manual son idénticos", oscuro_sistema == oscuro,
              sorted(set(oscuro_sistema.items()) ^ set(oscuro.items()))[:10])
    for nombre, tema in (("claro", claro), ("oscuro", oscuro)):
        problemas = []
        minimo = None
        for a, b, umbral in pares_de_contraste():
            if a not in tema or b not in tema:
                problemas.append(f"falta la variable --{a} o --{b}")
                continue
            c = contraste(tema[a], tema[b])
            minimo = c if minimo is None else min(minimo, c)
            if c < umbral:
                problemas.append(f"--{a} sobre --{b}: {c:.2f} (mínimo {umbral})")
        resultado(f"Contraste WCAG AA en tema {nombre} ({len(pares_de_contraste())} pares; mínimo {minimo:.2f})",
                  not problemas, problemas)

    js = (RAIZ / "js" / "core" / "etiquetas.js").read_text(encoding="utf-8")
    textos_js = re.findall(r"texto: '([^']+)'", js)
    ids_js = re.findall(r"\{ id: '([a-z]+)'", js)
    enumeracion = validate.cargar_json(RAIZ / "data" / "schemas" / "comun.schema.json")["$defs"]["etiqueta"]["enum"]
    resultado("Etiquetas: las diez de etiquetas.js coinciden con el esquema", textos_js == enumeracion,
              [f"js {textos_js}", f"esquema {enumeracion}"] if textos_js != enumeracion else [])
    css = (RAIZ / "assets" / "css" / "componentes.css").read_text(encoding="utf-8")
    sin_estilo = [i for i in ids_js if f".etiqueta--{i} " not in css]
    resultado("Etiquetas: cada una tiene estilo propio", ids_js == ETIQUETAS_ID and not sin_estilo, sin_estilo)

    rutas = {m["ruta"] for m in validate.cargar_json(RAIZ / "content" / "es" / "ui.json")["menu"]}
    rutas |= {"/metodologia", "/licencias", "/leyenda", "/fuentes", "/glosario", "/aprendizaje", "/buscar"}
    metodologia = validate.cargar_json(RAIZ / "content" / "es" / "metodologia.json")
    subrutas = {
        "/fuentes/": ids_de("sources"),
        "/metodologia/": {b["id"] for b in metodologia["bloques"] if b.get("id")},
        "/glosario/": ids_de("glosario"),
    }
    for ruta_seccion, bloques in rutas_de_bloques().items():
        rutas.add(ruta_seccion)
        subrutas[ruta_seccion + "/"] = bloques
    problemas = []
    for ruta in sorted((RAIZ / "content" / "es").glob("*.json")):
        texto = ruta.read_text(encoding="utf-8")
        if re.search(r"https?://", texto):
            problemas.append(f"{ruta.name}: contiene una dirección externa (debe ir por data/sources.json)")
        for destino in re.findall(r"\]\((#/[^)]*)\)", texto):
            r = destino[1:]
            if r in rutas or (r.startswith("/buscar/") and len(r) > len("/buscar/")):
                continue
            if any(r.startswith(p) and r[len(p):] in ids for p, ids in subrutas.items()):
                continue
            problemas.append(f"{ruta.name}: enlace interno roto {destino}")
    resultado("Textos: sin direcciones externas y con enlaces internos válidos", not problemas, problemas)


# ---------- 4 bis: referencias entre contenido y datos (H1) ----------

def ids_de(conjunto):
    return {r["id"] for r in validate.cargar_json(RAIZ / "data" / f"{conjunto}.json")["registros"]}


def bloques_de_contenido():
    """Bloques de los módulos, en orden: {id: bloque}."""
    modulos = validate.cargar_json(RAIZ / "content" / "es" / "modulos.json")["modulos"]
    bloques = {}
    for m in modulos:
        for b in validate.cargar_json(RAIZ / "content" / "es" / f"{m['id']}.json")["bloques"]:
            bloques[b["id"]] = b
    return bloques


def rutas_de_bloques():
    """{ruta de la sección: ids de los bloques de sus módulos}."""
    config = validate.cargar_json(RAIZ / "content" / "es" / "modulos.json")
    modulos = {m["id"]: m["bloques"] for m in config["modulos"]}
    return {s["ruta"]: {b for m in s["modulos"] for b in modulos[m]} for s in config["secciones"]}


def esquemas_de(tipo, bloques):
    return [v for v in recorrer([b.get("explicacion", []) for b in bloques.values()])
            if isinstance(v, dict) and v.get("tipo") == tipo]


def recorrer(x):
    """Todos los valores anidados (cadenas y diccionarios) de un JSON."""
    if isinstance(x, dict):
        yield x
        for v in x.values():
            yield from recorrer(v)
    elif isinstance(x, list):
        for v in x:
            yield from recorrer(v)
    else:
        yield x


def probar_referencias():
    config = validate.cargar_json(RAIZ / "content" / "es" / "modulos.json")
    modulos = config["modulos"]
    bloques = bloques_de_contenido()
    listados = [i for m in modulos for i in m["bloques"]]
    resultado("Módulos: cada bloque listado existe y no hay bloques sin listar",
              listados == list(bloques) and len(set(listados)) == len(listados),
              [f"listados {listados}", f"en contenido {list(bloques)}"] if listados != list(bloques) else [])
    en_secciones = [m for s in config["secciones"] for m in s["modulos"]]
    menu = {m["ruta"]: m for m in validate.cargar_json(RAIZ / "content" / "es" / "ui.json")["menu"]}
    problemas = []
    if sorted(en_secciones) != sorted(m["id"] for m in modulos) or len(set(en_secciones)) != len(en_secciones):
        problemas.append(f"módulos en secciones {en_secciones} frente a {[m['id'] for m in modulos]}")
    for s in config["secciones"]:
        entrada = menu.get(s["ruta"])
        if not entrada or entrada.get("modulos") != s["modulos"]:
            problemas.append(f"la entrada de menú de {s['ruta']} no muestra el progreso de {s['modulos']}")
    resultado("Secciones: cada módulo está en una sola sección, con su entrada de menú y su progreso", not problemas, problemas)

    normas, terminos, fuentes = ids_de("normas"), ids_de("glosario"), ids_de("sources")
    problemas = []
    for b in bloques.values():
        problemas += [f"{b['id']}: norma desconocida {n}" for n in b.get("normas", []) if n not in normas]
        problemas += [f"{b['id']}: término desconocido {t}" for t in b.get("terminos", []) if t not in terminos]
        problemas += [f"{b['id']}: fuente desconocida {f}" for f in b.get("profundizar", []) if f not in fuentes]
        problemas += [f"{b['id']}: bloque de repaso desconocido {x}" for x in b.get("preguntas_de", []) if x not in bloques]
        if not b.get("profundizar"):
            problemas.append(f"{b['id']}: sin fuentes para profundizar")
    resultado("Bloques: normas, términos, fuentes y repasos existen", not problemas, problemas)

    textos = [v for ruta in sorted((RAIZ / "content" / "es").glob("*.json"))
              for v in recorrer(validate.cargar_json(ruta)) if isinstance(v, str)]
    usados = {i for t in textos for i in re.findall(r"\{\{([a-z0-9-]+)\|[^}]+\}\}", t)}
    resultado(f"Textos: los {len(usados)} términos enlazados con {{{{id|texto}}}} existen en el glosario",
              usados <= terminos, sorted(usados - terminos))

    glosario = validate.cargar_json(RAIZ / "data" / "glosario.json")["registros"]
    rotos = [f"{t['id']} → {r}" for t in glosario for r in t.get("relacionados", []) if r not in terminos]
    resultado("Glosario: los términos relacionados existen", not rotos, rotos)

    preguntas = validate.cargar_json(RAIZ / "data" / "preguntas.json")["registros"]
    por_bloque = {}
    for p in preguntas:
        por_bloque[p["bloque"]] = por_bloque.get(p["bloque"], 0) + 1
    huerfanas = [p["id"] for p in preguntas if p["bloque"] not in bloques]
    resultado("Preguntas: cada una pertenece a un bloque existente", not huerfanas, huerfanas)
    cortos = []
    for b in bloques.values():
        n = sum(por_bloque.get(x, 0) for x in b.get("preguntas_de", [b["id"]]))
        if n < 4:
            cortos.append(f"{b['id']}: {n} preguntas")
    resultado("Preguntas: cada bloque tiene al menos 4 (cuestionarios de 4 a 6)", not cortos, cortos)

    nodos = set()
    for v in esquemas_de("relaciones", bloques):
        nodos |= {n["id"] for n in v["nodos"]}
    relaciones = validate.cargar_json(RAIZ / "data" / "relaciones.json")["registros"]
    sin_nodo = sorted({x for r in relaciones for x in (r["origen"], r["destino"])} - nodos)
    resultado(f"Relaciones: origen y destino de las {len(relaciones)} relaciones están en el diagrama",
              bool(nodos) and not sin_nodo, sin_nodo)

    # H2: las herramientas del módulo 3 cuadran con los datos de la convocatoria.
    convocatorias = {c["id"]: c for c in validate.cargar_json(RAIZ / "data" / "convocatorias.json")["registros"]}
    problemas = []
    for m in esquemas_de("mapa-circunscripciones", bloques):
        ids = [c["id"] for c in convocatorias[m["convocatoria"]]["circunscripciones"]]
        casillas = [c["id"] for c in m["casillas"]]
        celdas = [(c["x"], c["y"]) for c in m["casillas"]]
        if sorted(casillas) != sorted(ids):
            problemas.append(f"casillas sin circunscripción o al revés: {sorted(set(casillas) ^ set(ids))}")
        if len(set(celdas)) != len(celdas):
            problemas.append("dos casillas comparten celda")
        if {c["id"] for c in convocatorias[m["anterior"]]["circunscripciones"]} != set(ids):
            problemas.append("las circunscripciones de 2023 no coinciden con las de 2026")
    resultado("Mapa: una casilla por cada una de las 52 circunscripciones, sin solaparse",
              not problemas and bool(esquemas_de("mapa-circunscripciones", bloques)), problemas)

    problemas = []
    for s in esquemas_de("suma-senado", bloques):
        senado = convocatorias[s["convocatoria"]]["circunscripciones_senado"]
        cubiertas = [c for c in senado if any(l["tipo"] == c["tipo"] and l["senadores"] == c["senadores_elegidos"] for l in s["lineas"])]
        total = sum(c["senadores_elegidos"] for c in cubiertas)
        if len(cubiertas) != len(senado) or total != 209:
            problemas.append(f"las líneas cubren {len(cubiertas)} de {len(senado)} circunscripciones y suman {total}")
    resultado("Senado: las líneas de la suma cubren todas las circunscripciones y suman 209",
              not problemas and bool(esquemas_de("suma-senado", bloques)), problemas)

    # H3: competencias, «¿Quién decide?» e indicadores.
    competencias = {r["id"]: r for r in validate.cargar_json(RAIZ / "data" / "competencias.json")["registros"]}
    normas_ids = ids_de("normas")
    problemas = []
    tablas = esquemas_de("tabla-competencias", bloques)
    en_tabla = set()
    for t in tablas:
        for m in t["materias"]:
            for nivel in ("estado", "autonomico", "local", "ue"):
                en_tabla.add(f"{m['id']}-{nivel}")
                if f"{m['id']}-{nivel}" not in competencias:
                    problemas.append(f"falta la celda {m['id']}-{nivel}")
    problemas += [f"celda sin materia en la tabla: {i}" for i in sorted(set(competencias) - en_tabla)]
    problemas += [f"{i}: norma desconocida {n}" for i, r in competencias.items() for n in r.get("normas", []) if n not in normas_ids]
    problemas += [f"{i}: verificada sin normas" for i, r in competencias.items() if r["estado"] == "verificado" and not r.get("normas")]
    materias = sum(len(t["materias"]) for t in tablas)
    resultado(f"Competencias: {materias} materias × 4 niveles, cada celda con norma o PENDIENTE DE VERIFICAR",
              not problemas and materias >= 15, problemas)

    problemas = []
    preguntas_qd = [p for e in esquemas_de("quien-decide", bloques) if "preguntas" in e for p in e["preguntas"]]
    for p in preguntas_qd:
        problemas += [f"{p['id']}: competencia desconocida {x['competencia']}" for x in p["niveles"] if x["competencia"] not in competencias]
    ids_qd = {p["id"] for p in preguntas_qd}
    reusos = [e for e in esquemas_de("quien-decide", bloques) if "preguntas" not in e]
    problemas += [f"«¿Quién decide?» reutiliza una pregunta inexistente: {i}" for e in reusos for i in e["ids"] if i not in ids_qd]
    resultado(f"¿Quién decide?: {len(preguntas_qd)} preguntas (mínimo 10), cada nivel con su competencia; {len(reusos)} temas las reutilizan",
              not problemas and len(preguntas_qd) >= 10, problemas)

    indicadores = {r["id"]: r for r in validate.cargar_json(RAIZ / "data" / "indicadores.json")["registros"]}
    problemas = []
    for e in esquemas_de("tablero-indicadores", bloques):
        problemas += [f"tablero: indicador desconocido {x['id']}" for x in e["indicadores"] if x["id"] not in indicadores]
    for e in esquemas_de("fichas-indicadores", bloques):
        problemas += [f"ficha {f['nombre']}: indicador desconocido {f['dato']}" for f in e["fichas"] if f.get("dato") and f["dato"] not in indicadores]
        partes = ("mide", "calculo", "publica", "no_dice", "error")
        problemas += [f"ficha {f['nombre']}: le falta alguna de las seis partes" for f in e["fichas"] if not all(f.get(p) for p in partes)]
    for e in esquemas_de("grafico-serie", bloques):
        if not any(r.get("grupo") == e["grupo"] for r in indicadores.values()):
            problemas.append(f"gráfico sin datos: {e['grupo']}")
    resultado("Indicadores: el tablero, las fichas y los gráficos apuntan a datos existentes",
              not problemas and bool(esquemas_de("tablero-indicadores", bloques)), problemas)

    eg = convocatorias["eg-2026"]
    fuentes = ids_de("sources")
    problemas = [f"{h['id']}: fuente desconocida {h['fuente_id']}" for h in eg["hitos"] if h["fuente_id"] not in fuentes]
    problemas += [f"{h['id']}: termina antes de empezar" for h in eg["hitos"] if h.get("hasta", h["desde"]) < h["desde"]]
    problemas += [f"{h['id']}: sin nota que explique su base" for h in eg["hitos"] if not h.get("nota")]
    pendientes = [h["id"] for h in eg["hitos"] if h["estado"] != "verificado"]
    resultado(f"Calendario del 29-N: {len(eg['hitos'])} hitos con fuente y nota ({len(pendientes)} pendientes de contrastar)",
              not problemas, problemas)

    # H4: partidos, votaciones, comparador y ciclo de una medida.
    doc_p = validate.cargar_json(RAIZ / "data" / "partidos.json")
    partidos = {p["id"]: p for p in doc_p["registros"]}
    contexto = doc_p["meta"]["contexto"]
    problemas = [f"falta un partido de la lista mínima o del anexo: {i}" for i in contexto["lista_minima"] + contexto["otras_del_anexo"] if i not in partidos]
    fuentes_ficha = {tuple(p["fuentes"]) for p in partidos.values()}
    if len(fuentes_ficha) != 1:
        problemas.append("las fichas no citan las mismas fuentes")
    problemas += [f"{i}: fuente desconocida {f}" for i, p in partidos.items() for f in p["fuentes"] if f not in fuentes]
    problemas += [f"{i}: fuente de la denominación desconocida" for i, p in partidos.items() if p["denominacion_fuente"] not in fuentes]
    problemas += [f"{i}: grupo autonómico con fuente desconocida" for i, p in partidos.items() for a in p["representacion"]["parlamentos_autonomicos"] if a["fuente_id"] not in fuentes]
    con_rep = [i for i, p in partidos.items() if p["representacion"]["congreso"] or p["representacion"]["senado"] or p["representacion"]["parlamento_europeo"] or p["representacion"]["parlamentos_autonomicos"]]
    problemas += [f"{i}: sin representación que justifique su ficha" for i in partidos if i not in con_rep and i not in contexto["lista_minima"] + contexto["otras_del_anexo"]]
    congreso = sum(p["representacion"]["congreso"] for p in partidos.values())
    senado = sum(p["representacion"]["senado"] for p in partidos.values())
    europeo = sum(p["representacion"]["parlamento_europeo"] or 0 for p in partidos.values())
    if congreso != 350:
        problemas.append(f"los diputados de las fichas suman {congreso}, no 350")
    if senado != 257:
        problemas.append(f"los senadores de las fichas suman {senado}, no 257 (258 fichas menos 1 independiente)")
    if europeo != 57:
        problemas.append(f"los eurodiputados de candidatura propia suman {europeo}, no 57 (61 menos 3 de Ahora Repúblicas y 1 de CEUS)")
    sin_pendiente = [i for i, p in partidos.items() if {"autodefinicion", "gobiernos", "programa"} - {x["campo"] for x in p["pendientes"]}]
    problemas += [f"{i}: un campo pendiente para todos no figura como pendiente" for i in sin_pendiente]
    resultado(f"Partidos: {len(partidos)} fichas con las mismas fuentes; 350 diputados, 257 senadores de partido y 57 eurodiputados cuadran",
              not problemas, problemas)

    votaciones = validate.cargar_json(RAIZ / "data" / "votaciones.json")["registros"]
    ids_v = {v["id"] for v in votaciones}
    tipos = {t: sum(1 for v in votaciones if v["tipo"] == t) for t in ("investidura", "convalidacion-rdl", "ley-organica")}
    problemas = []
    for v in votaciones:
        if v["detalle"]:
            suma = {k: sum(g[k] for g in v["grupos"].values()) for k in ("si", "no", "abstencion")}
            if suma != {k: v["totales"][k] for k in suma}:
                problemas.append(f"{v['id']}: los grupos suman {suma} y el total es {v['totales']}")
    for i, p in partidos.items():
        if p["votaciones"] and {x["votacion_id"] for x in p["votaciones"]} != ids_v:
            problemas.append(f"{i}: no tiene todas las votaciones del criterio")
    if tipos != {"investidura": 3, "convalidacion-rdl": 56, "ley-organica": 17}:
        problemas.append(f"recuento por tipo inesperado: {tipos}")
    detalle = sum(1 for v in votaciones if v["detalle"])
    resultado(f"Votaciones: {len(votaciones)} del criterio ({tipos['investidura']} investiduras, {tipos['convalidacion-rdl']} RDL, {tipos['ley-organica']} leyes orgánicas); en las {detalle} con desglose, los grupos suman el total oficial",
              not problemas, problemas)

    temas_m7 = [b["id"].replace("m7-", "") for b in bloques.values() if b["id"].startswith("m7-") and b["id"] not in ("m7-ciclo", "m7-disputados", "m7-repaso")]
    problemas = []
    for e in esquemas_de("comparador-propuestas", bloques):
        problemas += [f"comparador: tema sin bloque {t['id']}" for t in e["temas"] if t["id"] not in temas_m7]
    general = [e for e in esquemas_de("comparador-propuestas", bloques) if len(e["temas"]) > 1]
    if not general or sorted(t["id"] for t in general[0]["temas"]) != sorted(temas_m7):
        problemas.append("el comparador general no tiene los nueve temas")
    problemas += [f"{t}: el tema no incrusta «¿Quién decide?» o su comparador" for t in temas_m7
                  if not esquemas_de("quien-decide", {"x": bloques["m7-" + t]}) or not esquemas_de("comparador-propuestas", {"x": bloques["m7-" + t]})]
    problemas += [f"{t}: menos de 8 preguntas" for t in temas_m7 if por_bloque.get("m7-" + t, 0) < 8]
    resultado(f"Temas: {len(temas_m7)} temas con «¿Quién decide?», comparador y al menos 8 preguntas", not problemas and len(temas_m7) == 9, problemas)

    problemas = []
    ciclos = esquemas_de("ciclo-medida", bloques)
    validas = {e["texto"] for e in [{"texto": x} for x in ("DATO OFICIAL", "DATO DE ESTUDIO", "NORMA VIGENTE", "EXPLICACIÓN DIDÁCTICA", "SIMULACIÓN", "PROPUESTA", "PREVISIÓN", "INTERPRETACIÓN ATRIBUIDA", "ESTIMACIÓN DEL AUTOR", "PENDIENTE DE VERIFICAR")]}
    for c in ciclos:
        if len(c["fases"]) != 8:
            problemas.append(f"el ciclo tiene {len(c['fases'])} fases")
        problemas += [f"fase {f['nombre']}: etiqueta desconocida" for f in c["fases"] if f["etiqueta"] not in validas]
        if c["fases"][0]["etiqueta"] != "PROPUESTA" or c["fases"][4]["etiqueta"] != "NORMA VIGENTE":
            problemas.append("solo el anuncio es PROPUESTA y la entrada en vigor debe ser NORMA VIGENTE")
    resultado("Ciclo de una medida: 8 fases con su prueba y su etiqueta", not problemas and len(ciclos) == 1, problemas)

    # H5: medios, verificadores y herramientas de los módulos 8 y 9.
    medios = validate.cargar_json(RAIZ / "data" / "medios.json")["registros"]
    problemas = []
    claves = {tuple(m.keys()) for m in medios}
    if len(claves) != 1:
        problemas.append(f"los medios no tienen las mismas claves en el mismo orden: {len(claves)} variantes")
    euromo = [m["id"] for m in medios if m["criterio"] == "euromo"]
    if len(euromo) != 18:
        problemas.append(f"{len(euromo)} medios de la muestra de EurOMo, no 18")
    anexo_d6 = ["elpais", "eldiario", "publico", "elmundo", "abc", "larazon", "libertaddigital", "lavanguardia", "elconfidencial",
                "infolibre", "vozpopuli", "theobjective", "tve", "lasexta", "ser", "cope", "ondacero", "rne"]
    ids_m = {m["id"] for m in medios}
    problemas += [f"falta un medio del Anexo D.6: {i}" for i in anexo_d6 if i not in ids_m]
    problemas += [f"{m['id']}: orientación asignada" for m in medios if m["orientacion"]["clasificacion"] != "sin clasificación documentada"]
    problemas += [f"{m['id']}: la línea editorial no figura como pendiente" for m in medios if "linea_editorial" not in {x["campo"] for x in m["pendientes"]}]
    problemas += [f"{m['id']}: propiedad sin fuente y tipo distinto de «sin documentar»" for m in medios
                  if (m["propiedad"]["fuente_id"] is None) != (m["tipo_propietario"] == "sin_documentar")]
    problemas += [f"{m['id']}: fuente desconocida {f}" for m in medios for f in (m["propiedad"]["fuente_id"], m["audiencia"]["fuente_id"]) if f and f not in fuentes]
    nombres = [m["nombre"].lower() for m in medios]
    if nombres != sorted(nombres):
        problemas.append("los medios no están en orden alfabético")
    resultado(f"Medios: {len(medios)} fichas con las mismas claves, los 18 de EurOMo y los 18 del Anexo D.6, ninguna orientación asignada",
              not problemas, problemas)

    verificadores = validate.cargar_json(RAIZ / "data" / "verificadores.json")["registros"]
    problemas = [f"{v['id']}: fuente desconocida {f}" for v in verificadores
                 for f in (v["ifcn_fuente"], v["propiedad_fuente"], v["metodologia_fuente"]) if f and f not in fuentes]
    problemas += [f"falta un verificador del Anexo D.7: {i}" for i in ("newtral", "efe-verifica", "verificartve") if i not in {v["id"] for v in verificadores}]
    problemas += [f"{v['id']}: propiedad sin fuente" for v in verificadores if v["propiedad"] and not v["propiedad_fuente"]]
    resultado(f"Verificadores: {len(verificadores)} con estado en la IFCN y fuentes existentes, incluidos los tres del Anexo D.7", not problemas, problemas)

    problemas = []
    fichas_m = esquemas_de("ficha-medida", bloques)
    for e in fichas_m:
        if len(e["preguntas"]) != 8 or len(e["medidas"]) != 3:
            problemas.append(f"la ficha tiene {len(e['preguntas'])} preguntas y {len(e['medidas'])} medidas")
        vacias = {m["id"]: sum(1 for r in m["respuestas"] if r is None) for m in e["medidas"]}
        if len(set(vacias.values())) != 1:
            problemas.append(f"distinto número de respuestas sin información: {vacias}")
        palabras = {m["id"]: sum(len(r["texto"].split()) for r in m["respuestas"] if r) for m in e["medidas"]}
        media = sum(palabras.values()) / len(palabras)
        problemas += [f"{i}: {n} palabras frente a una media de {media:.0f} (más de un 15 % de diferencia)" for i, n in palabras.items() if abs(n - media) > 0.15 * media]
        problemas += [f"{m['id']}: {len(m['respuestas'])} respuestas" for m in e["medidas"] if len(m["respuestas"]) != 8]
    clasif = esquemas_de("clasificador", bloques)
    tamanos = sorted(len(c["items"]) for c in clasif)
    if tamanos != [6, 12]:
        problemas.append(f"clasificadores de {tamanos} frases, no de 12 y 6")
    for c in clasif:
        cats = [x["id"] for x in c["categorias"]]
        cuenta = {k: sum(1 for i in c["items"] if i["correcta"] == k) for k in cats}
        if len(set(cuenta.values())) != 1:
            problemas.append(f"«{c['titulo']}»: categorías desequilibradas {cuenta}")
        problemas += [f"«{c['titulo']}»: frase sin explicación" for i in c["items"] if not i.get("explicacion")]
    ad = esquemas_de("antes-despues", bloques)
    if [(e["a"], e["b"]) for e in ad] != [([12, 10], [12, 11])]:
        problemas.append("el comparador antes-después no usa el ejemplo de 15.4 (12→10 y 12→11)")
    me = esquemas_de("margen-error", bloques)
    if [(e["n"], e["p"]) for e in me] != [(1000, 50)]:
        problemas.append("la calculadora del margen no usa el ejemplo de 15.6 (1.000 entrevistas, 50 %)")
    an = esquemas_de("analizador-noticia", bloques)
    if len(an) != 1 or len(an[0]["comprobaciones"]) != 5:
        problemas.append("el analizador no tiene las cinco comprobaciones")
    for tipo in ("fichas-medios", "mapa-propiedad", "fichas-verificadores", "ejercicio-revelar"):
        if not esquemas_de(tipo, bloques):
            problemas.append(f"falta la herramienta {tipo}")
    for mod in ("m8", "m9"):
        n = sum(1 for p in preguntas if p["modulo"] == mod)
        if n < 10:
            problemas.append(f"{mod}: {n} preguntas (mínimo 10)")
    resultado("Módulos 8 y 9: ficha de 8 preguntas simétrica, clasificadores de 12 y 6 frases, ejemplos de 15.4 y 15.6, analizador y al menos 10 preguntas",
              not problemas, problemas)

    pendientes_r = validate.cargar_json(RAIZ / "content" / "es" / "pendientes.json")["rutas"]
    resultado("Rutas pendientes: ninguna sección queda por construir", not pendientes_r, [p["ruta"] for p in pendientes_r])


# ---------- 5 y 6: navegador ----------

def buscar_navegador():
    candidato = os.environ.get("PE_NAVEGADOR")
    if candidato and pathlib.Path(candidato).exists():
        return candidato
    return next((n for n in NAVEGADORES if pathlib.Path(n).exists()), None)


def volcar_dom(navegador, url, presupuesto_ms=60000):
    with tempfile.TemporaryDirectory() as perfil:
        orden = [navegador, "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
                 "--disable-extensions", f"--user-data-dir={perfil}", f"--virtual-time-budget={presupuesto_ms}",
                 "--dump-dom", url]
        proceso = subprocess.run(orden, capture_output=True, timeout=180)
    return proceso.stdout.decode("utf-8", errors="replace")


class ServidorSilencioso(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".json": "application/json",
        ".css": "text/css",
        ".html": "text/html",
    }

    def log_message(self, *args):
        pass


def probar_navegador():
    navegador = buscar_navegador()
    if not navegador:
        resultado("Navegador sin interfaz disponible (Chrome o Edge)", False,
                  ["no se encontró; define PE_NAVEGADOR con la ruta al ejecutable"])
        return
    informar(f"Navegador: {navegador}")
    manejador = functools.partial(ServidorSilencioso, directory=str(RAIZ))
    servidor = http.server.ThreadingHTTPServer(("127.0.0.1", 0), manejador)
    threading.Thread(target=servidor.serve_forever, daemon=True).start()
    try:
        url = f"http://127.0.0.1:{servidor.server_address[1]}/tests/run.html"
        dom = volcar_dom(navegador, url)
    finally:
        servidor.shutdown()
    m = re.search(r'<pre id="resultados" data-fin="1">(.*?)</pre>', dom, re.S)
    if not m:
        resultado("Pruebas en el navegador terminadas", False, ["tests/run.html no escribió resultados", dom[:300]])
        return
    datos = json.loads(html.unescape(m.group(1)))
    for p in datos["unitarias"]:
        resultado(f"Unitaria: {p['nombre']}", p["ok"], [p.get("detalle")] if not p["ok"] else [])
    for p in datos["humo"]:
        resultado(f"Humo {p['ancho']} px: {p['ruta']}", p["ok"], p["problemas"])

    for relativa in ("index.html", "dist/politica-espana.html"):
        url = (RAIZ / relativa).as_uri() + "?prueba=1"
        dom = volcar_dom(navegador, url, 10000)
        cuerpo = re.search(r"<body[^>]*>", dom)
        errores = re.search(r'data-pe-errores="(\d+)"', cuerpo.group(0)) if cuerpo else None
        main = re.search(r'<main[^>]*data-ruta="/"[^>]*>(.*?)</main>', dom, re.S)
        ok = bool(errores) and errores.group(1) == "0" and bool(main) and "<h1" in main.group(1)
        resultado(f"Apertura sin servidor (file://) de {relativa}", ok,
                  [] if ok else [f"errores: {errores.group(1) if errores else 'sin dato'}; inicio pintado: {bool(main)}"])


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    informar("Pruebas de politica-espana")
    informar("=" * 26)
    probar_generados()
    probar_datos()
    probar_casos_validador()
    probar_t1()
    probar_diseno()
    probar_referencias()
    probar_navegador()
    informar()
    total = sum(1 for l in lineas if l.startswith("[OK]") or l.startswith("[FALLO]"))
    informar(f"Resultado: {total - len(fallos)} de {total} pruebas superadas; {len(fallos)} fallos.")
    (RAIZ / "tests" / "ultima-ejecucion.txt").write_text("\n".join(lineas) + "\n", encoding="utf-8")
    return 1 if fallos else 0


if __name__ == "__main__":
    sys.exit(main())
