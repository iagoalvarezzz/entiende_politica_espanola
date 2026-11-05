"""Validador de los datos de data/ (Anexo C.1 y C.3).

Comprueba cada fichero contra su esquema de data/schemas y aplica las reglas
transversales del Anexo C.3. Solo usa la biblioteca estándar.

Uso: python tools/validate.py
"""
import datetime
import json
import pathlib
import re
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
DIR_DATOS = RAIZ / "data"
DIR_ESQUEMAS = DIR_DATOS / "schemas"

SIMULACION = "SIMULACIÓN"
PENDIENTE = "PENDIENTE DE VERIFICAR"
MAX_PALABRAS = 25

# Expresiones que convierten una pregunta en una pregunta de opinión (sección 7.5).
PATRON_OPINION = re.compile(
    r"\b(opinas|opina usted|crees que|cree usted|estás de acuerdo|estas de acuerdo|"
    r"está de acuerdo|prefieres|preferirías|preferirias|votarías|votarias|a quién votar|"
    r"a quien votar|te parece|consideras que|simpatizas|tu partido|tu ideología)\b",
    re.IGNORECASE,
)
PATRON_PORCENTAJE = re.compile(r"porcentaje|pct", re.IGNORECASE)
CAMPOS_FECHA = re.compile(r"^(fecha.*|desde|hasta|actualizado)$")


def cargar_json(ruta):
    with open(ruta, encoding="utf-8") as f:
        return json.load(f)


def tipo_de(valor):
    if valor is None:
        return "null"
    if isinstance(valor, bool):
        return "boolean"
    if isinstance(valor, int):
        return "integer"
    if isinstance(valor, float):
        return "number"
    if isinstance(valor, str):
        return "string"
    if isinstance(valor, list):
        return "array"
    return "object"


def es_tipo(valor, tipo):
    real = tipo_de(valor)
    return real == tipo or (tipo == "number" and real == "integer")


class Esquemas:
    """Interpreta el subconjunto de JSON Schema que usan los esquemas del proyecto."""

    def __init__(self, directorio=DIR_ESQUEMAS):
        self.directorio = pathlib.Path(directorio)
        self.cache = {}

    def documento(self, nombre):
        if nombre not in self.cache:
            self.cache[nombre] = cargar_json(self.directorio / nombre)
        return self.cache[nombre]

    def resolver(self, ref, doc_actual):
        fichero, _, puntero = ref.partition("#")
        fichero = fichero or doc_actual
        nodo = self.documento(fichero)
        for parte in [p for p in puntero.split("/") if p]:
            nodo = nodo[parte]
        return nodo, fichero

    def validar(self, valor, esquema, doc, ruta, errores):
        if "$ref" in esquema:
            sub, sub_doc = self.resolver(esquema["$ref"], doc)
            self.validar(valor, sub, sub_doc, ruta, errores)
            return
        if "type" in esquema:
            tipos = esquema["type"] if isinstance(esquema["type"], list) else [esquema["type"]]
            if not any(es_tipo(valor, t) for t in tipos):
                errores.append(f"{ruta}: tipo no válido ({tipo_de(valor)}; se esperaba {' o '.join(tipos)})")
                return
        if "enum" in esquema and valor not in esquema["enum"]:
            errores.append(f"{ruta}: valor no permitido {valor!r}")
        if isinstance(valor, str):
            if len(valor) < esquema.get("minLength", 0):
                errores.append(f"{ruta}: texto vacío")
            if "pattern" in esquema and not re.search(esquema["pattern"], valor):
                errores.append(f"{ruta}: {valor!r} no cumple el formato {esquema['pattern']}")
        if tipo_de(valor) in ("integer", "number") and "minimum" in esquema and valor < esquema["minimum"]:
            errores.append(f"{ruta}: {valor} es menor que {esquema['minimum']}")
        if isinstance(valor, dict):
            for campo in esquema.get("required", []):
                if campo not in valor:
                    errores.append(f"{ruta}: falta el campo obligatorio «{campo}»")
            propiedades = esquema.get("properties", {})
            for campo, sub in valor.items():
                if campo in propiedades:
                    self.validar(sub, propiedades[campo], doc, f"{ruta}.{campo}", errores)
                elif esquema.get("additionalProperties") is False:
                    errores.append(f"{ruta}: campo no permitido «{campo}»")
        if isinstance(valor, list):
            if len(valor) < esquema.get("minItems", 0):
                errores.append(f"{ruta}: necesita al menos {esquema['minItems']} elementos")
            if "items" in esquema:
                for i, elemento in enumerate(valor):
                    self.validar(elemento, esquema["items"], doc, f"{ruta}[{i}]", errores)


def fecha_valida(texto):
    if not isinstance(texto, str) or not re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", texto):
        return False
    try:
        datetime.date.fromisoformat(texto)
    except ValueError:
        return False
    return True


def recorrer(obj, ruta):
    """Devuelve (ruta, diccionario) para cada diccionario anidado."""
    if isinstance(obj, dict):
        yield ruta, obj
        for clave, valor in obj.items():
            yield from recorrer(valor, f"{ruta}.{clave}")
    elif isinstance(obj, list):
        for i, valor in enumerate(obj):
            yield from recorrer(valor, f"{ruta}[{i}]")


def contar_palabras(texto):
    return len(texto.split())


def reglas_generales(registro, ruta, ids_fuentes, errores):
    """Fechas, fuentes, citas y orden de fechas en cualquier nivel del registro."""
    for sub_ruta, d in recorrer(registro, ruta):
        for clave, valor in d.items():
            if CAMPOS_FECHA.match(clave) and isinstance(valor, str) and not fecha_valida(valor):
                errores.append(f"{sub_ruta}.{clave}: fecha no válida {valor!r} (formato AAAA-MM-DD)")
            if clave == "fuente_id" and isinstance(valor, str) and ids_fuentes is not None and valor not in ids_fuentes:
                errores.append(f"{sub_ruta}.fuente_id: fuente_id inexistente en data/sources.json ({valor!r})")
            if clave == "cita" and isinstance(valor, str) and contar_palabras(valor) > MAX_PALABRAS:
                errores.append(f"{sub_ruta}.cita: cita de más de {MAX_PALABRAS} palabras ({contar_palabras(valor)})")
        publicacion, consulta = d.get("fecha_publicacion"), d.get("fecha_consulta")
        if fecha_valida(publicacion) and fecha_valida(consulta) and publicacion > consulta:
            errores.append(f"{sub_ruta}: fecha_publicacion posterior a fecha_consulta ({publicacion} > {consulta})")
        desde, hasta = d.get("desde"), d.get("hasta")
        if fecha_valida(desde) and fecha_valida(hasta) and hasta < desde:
            errores.append(f"{sub_ruta}: «hasta» anterior a «desde» ({hasta} < {desde})")


def reglas_estado_dato(d, ruta, errores):
    """Coherencia entre estado y etiqueta de un dato (Anexo C.3, segundo punto)."""
    estado, etiqueta = d.get("estado"), d.get("etiqueta")
    if estado == "verificado":
        if not d.get("url") or not d.get("fecha_consulta"):
            errores.append(f"{ruta}: dato verificado sin url o sin fecha_consulta")
        if etiqueta in (SIMULACION, PENDIENTE):
            errores.append(f"{ruta}: dato verificado con etiqueta {etiqueta}")
    elif estado == "ejemplo":
        if etiqueta != SIMULACION:
            errores.append(f"{ruta}: dato de ejemplo sin etiqueta {SIMULACION}")
        for campo in ("fuente_id", "url", "fecha_consulta"):
            if campo in d:
                errores.append(f"{ruta}: dato de ejemplo con el campo «{campo}», que debe omitirse")
    elif estado == "pendiente" and etiqueta != PENDIENTE:
        errores.append(f"{ruta}: dato pendiente sin etiqueta {PENDIENTE}")
    if estado in ("verificado", "pendiente") and not d.get("fuente_id"):
        errores.append(f"{ruta}: dato {estado} sin fuente_id")


def ids_repetidos(elementos, ruta, errores, campo="id"):
    vistos = set()
    for i, el in enumerate(elementos):
        if isinstance(el, dict) and campo in el:
            if el[campo] in vistos:
                errores.append(f"{ruta}[{i}]: id repetido «{el[campo]}»")
            vistos.add(el[campo])


def reglas_convocatoria(r, ruta, ids_fuentes, errores):
    for nombre in ("circunscripciones", "circunscripciones_senado", "hitos", "verificaciones"):
        ids_repetidos(r.get(nombre, []), f"{ruta}.{nombre}", errores, "ambito" if nombre == "verificaciones" else "id")
    for i, v in enumerate(r.get("verificaciones", [])):
        reglas_estado_dato(v, f"{ruta}.verificaciones[{i}]", errores)
    if ids_fuentes is not None and r.get("norma_id") not in ids_fuentes:
        errores.append(f"{ruta}.norma_id: fuente_id inexistente en data/sources.json ({r.get('norma_id')!r})")
    provincias = {c.get("id") for c in r.get("circunscripciones", [])}
    for i, c in enumerate(r.get("circunscripciones_senado", [])):
        if c.get("provincia_id") not in provincias:
            errores.append(f"{ruta}.circunscripciones_senado[{i}]: provincia_id desconocida ({c.get('provincia_id')!r})")


def reglas_resultado(r, ruta, errores):
    candidaturas = r.get("candidaturas", [])
    votos = sum(c.get("votos", 0) for c in candidaturas if isinstance(c, dict))
    total = votos + r.get("votos_blanco", 0) + r.get("votos_nulos", 0)
    if total != r.get("votantes"):
        errores.append(f"{ruta}: votos a candidaturas + blancos + nulos ({total}) no suman votantes ({r.get('votantes')})")
    if isinstance(r.get("votantes"), int) and isinstance(r.get("censo"), int) and r["votantes"] > r["censo"]:
        errores.append(f"{ruta}: votantes supera el censo ({r['votantes']} > {r['censo']})")
    escanos = sum(c.get("escanos_oficiales", 0) for c in candidaturas if isinstance(c, dict))
    if escanos != r.get("escanos"):
        errores.append(f"{ruta}: escanos_oficiales ({escanos}) no suman los escaños en juego ({r.get('escanos')})")
    for sub_ruta, d in recorrer(r, ruta):
        for clave in d:
            if PATRON_PORCENTAJE.search(clave):
                errores.append(f"{sub_ruta}.{clave}: campo de porcentaje; los porcentajes se calculan al mostrarlos")
    estado = r.get("estado")
    if estado == "ejemplo":
        for campo in ("fuente_id", "url", "fecha_consulta"):
            if campo in r:
                errores.append(f"{ruta}: resultado de ejemplo con el campo «{campo}», que debe omitirse")
    else:
        for campo in ("fuente_id", "fecha_consulta"):
            if not r.get(campo):
                errores.append(f"{ruta}: resultado {estado} sin «{campo}»")


def reglas_pregunta(r, ruta, errores):
    if PATRON_OPINION.search(r.get("enunciado", "")):
        errores.append(f"{ruta}.enunciado: el enunciado pide una opinión o una preferencia")
    tipo = r.get("tipo")
    if tipo == "numerica":
        if "tolerancia" not in r:
            errores.append(f"{ruta}: pregunta numérica sin tolerancia")
    else:
        if "tolerancia" in r:
            errores.append(f"{ruta}: tolerancia solo en preguntas numéricas")
        if "opciones" not in r:
            errores.append(f"{ruta}: falta el campo obligatorio «opciones»")
        elif tipo == "opcion_unica" and r.get("correcta") not in {o.get("id") for o in r["opciones"]}:
            errores.append(f"{ruta}.correcta: no coincide con ninguna opción")
    if r.get("estado") == "ejemplo" and r.get("etiqueta") != SIMULACION:
        errores.append(f"{ruta}: pregunta de ejemplo sin etiqueta {SIMULACION}")
    if r.get("estado") == "verificado" and r.get("etiqueta") in (SIMULACION, PENDIENTE):
        errores.append(f"{ruta}: pregunta verificada con etiqueta {r.get('etiqueta')}")


def reglas_termino(r, ruta, ids_terminos, errores):
    if r.get("disputado") and not (r.get("atribucion") or "").strip():
        errores.append(f"{ruta}: término disputado sin atribución")
    # Una frase termina en . ! o ? seguidos de mayúscula; así «art. 97» no corta la frase.
    frases = [f for f in re.split(r"(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡«])", r.get("definicion", "").strip()) if f]
    if len(frases) > 2:
        errores.append(f"{ruta}.definicion: más de dos frases")
    for frase in frases:
        if contar_palabras(frase) >= MAX_PALABRAS:
            errores.append(f"{ruta}.definicion: frase de {contar_palabras(frase)} palabras (máximo {MAX_PALABRAS - 1})")
    for relacionado in r.get("relacionados", []):
        if relacionado not in ids_terminos:
            errores.append(f"{ruta}.relacionados: término inexistente «{relacionado}»")


def validar_documento(nombre, documento, ids_fuentes, esquemas=None):
    """Valida un fichero de datos ya cargado. Devuelve la lista de errores."""
    esquemas = esquemas or Esquemas()
    errores = []
    meta = documento.get("meta")
    if not isinstance(meta, dict):
        return [f"{nombre}: falta «meta»"]
    esquemas.validar(meta, {"$ref": "comun.schema.json#/$defs/meta"}, "comun.schema.json", f"{nombre}:meta", errores)
    registros = documento.get("registros")
    if not isinstance(registros, list):
        return errores + [f"{nombre}: falta la lista «registros»"]
    nombre_esquema = meta.get("esquema")
    fichero_esquema = f"{nombre_esquema}.schema.json"
    if not (esquemas.directorio / fichero_esquema).exists():
        return errores + [f"{nombre}: esquema desconocido {nombre_esquema!r}"]
    esquema = esquemas.documento(fichero_esquema)
    ids_repetidos(registros, f"{nombre}:registros", errores)
    ids_terminos = {r.get("id") for r in registros if isinstance(r, dict)}
    for i, r in enumerate(registros):
        ruta = f"{nombre}:registros[{i}]"
        esquemas.validar(r, esquema, fichero_esquema, ruta, errores)
        if not isinstance(r, dict):
            continue
        reglas_generales(r, ruta, None if nombre_esquema == "fuente" else ids_fuentes, errores)
        if nombre_esquema in ("dato", "relacion"):
            reglas_estado_dato(r, ruta, errores)
        elif nombre_esquema == "convocatoria":
            reglas_convocatoria(r, ruta, ids_fuentes, errores)
        elif nombre_esquema == "resultado":
            reglas_resultado(r, ruta, errores)
        elif nombre_esquema == "pregunta":
            reglas_pregunta(r, ruta, errores)
        elif nombre_esquema == "termino":
            reglas_termino(r, ruta, ids_terminos, errores)
    if nombre_esquema in ("partido", "medio") and registros:
        orden = list(registros[0].keys())
        for i, r in enumerate(registros[1:], start=1):
            if list(r.keys()) != orden:
                errores.append(f"{nombre}:registros[{i}]: ficha con campos distintos o en distinto orden que la primera")
    if nombre_esquema == "resultado":
        claves = [(r.get("eleccion_id"), r.get("circunscripcion_id")) for r in registros if isinstance(r, dict)]
        if len(claves) != len(set(claves)):
            errores.append(f"{nombre}: resultado repetido para una misma elección y circunscripción")
    return errores


def ficheros_de_datos():
    return sorted(p for p in DIR_DATOS.glob("*.json"))


def validar_todo():
    """Valida todos los ficheros de data/. Devuelve {nombre: [errores]}."""
    esquemas = Esquemas()
    fuentes = cargar_json(DIR_DATOS / "sources.json")
    ids_fuentes = {r.get("id") for r in fuentes.get("registros", [])}
    informe = {}
    for ruta in ficheros_de_datos():
        nombre = f"data/{ruta.name}"
        documento = cargar_json(ruta)
        errores = validar_documento(nombre, documento, ids_fuentes, esquemas)
        conjunto = documento.get("meta", {}).get("conjunto")
        if conjunto != ruta.stem:
            errores.append(f"{nombre}: meta.conjunto ({conjunto!r}) no coincide con el nombre del fichero")
        informe[nombre] = errores
    return informe


def main():
    informe = validar_todo()
    total = 0
    for nombre, errores in informe.items():
        estado = "OK" if not errores else f"{len(errores)} error(es)"
        print(f"{nombre}: {estado}")
        for e in errores:
            print(f"  - {e}")
        total += len(errores)
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main())
