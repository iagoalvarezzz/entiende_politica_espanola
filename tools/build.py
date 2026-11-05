"""Genera los envoltorios .js de datos y textos y la versión de un solo archivo.

Los navegadores bloquean fetch() con file://, así que los JSON se cargan como
scripts clásicos. Este script los envuelve y así index.html funciona con doble clic:

- data/<conjunto>.json -> data/<conjunto>.js   (window.PE_DATOS)
- índice de conjuntos  -> data/_indice.js      (versión y fecha de cada conjunto)
- content/es/<x>.json  -> content/es/<x>.js    (window.PE_TEXTOS)
- tests/vectores.json  -> tests/vectores.js    (window.PE_VECTORES)
- index.html + CSS + JS -> dist/politica-espana.html (un solo archivo)

Uso:
  python tools/build.py           genera los ficheros
  python tools/build.py --check   comprueba que los generados están al día
"""
import json
import pathlib
import re
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
CABECERA = "/* Generado por tools/build.py desde {origen}. No editar a mano. */\n"


def cargar(ruta):
    with open(ruta, encoding="utf-8") as f:
        return json.load(f)


def literal(obj):
    """JSON compacto apto para incrustar en un <script>."""
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")


def envoltorio(global_js, nombre, obj, origen):
    return (CABECERA.format(origen=origen)
            + f"(window.{global_js} = window.{global_js} || {{}})[{json.dumps(nombre)}] = {literal(obj)};\n")


def generados():
    """Devuelve {ruta relativa: contenido} de todo lo que se genera."""
    salida = {}
    conjuntos = []
    for ruta in sorted((RAIZ / "data").glob("*.json")):
        datos = cargar(ruta)
        salida[f"data/{ruta.stem}.js"] = envoltorio("PE_DATOS", ruta.stem, datos, f"data/{ruta.name}")
        meta = datos.get("meta", {})
        conjuntos.append({
            "conjunto": ruta.stem,
            "version": meta.get("version"),
            "actualizado": meta.get("actualizado"),
            "descripcion": meta.get("descripcion"),
        })
    indice = {"actualizado": max(c["actualizado"] for c in conjuntos), "conjuntos": conjuntos}
    salida["data/_indice.js"] = envoltorio("PE_DATOS", "_indice", indice, "data/*.json (meta)")

    for ruta in sorted((RAIZ / "content" / "es").glob("*.json")):
        salida[f"content/es/{ruta.stem}.js"] = envoltorio("PE_TEXTOS", ruta.stem, cargar(ruta), f"content/es/{ruta.name}")

    vectores = cargar(RAIZ / "tests" / "vectores.json")
    salida["tests/vectores.js"] = CABECERA.format(origen="tests/vectores.json") + f"window.PE_VECTORES = {literal(vectores)};\n"

    salida["dist/politica-espana.html"] = un_solo_archivo(salida)
    return salida


def un_solo_archivo(generado):
    """Incrusta en index.html las hojas de estilo y los scripts que enlaza."""
    html = (RAIZ / "index.html").read_text(encoding="utf-8")

    def leer(relativa):
        if relativa in generado:
            return generado[relativa]
        return (RAIZ / relativa).read_text(encoding="utf-8")

    def estilo(m):
        return "<style>\n" + leer(m.group(1)) + "</style>"

    def script(m):
        codigo = leer(m.group(1)).replace("</script", "<\\/script")
        return "<script>\n" + codigo + "</script>"

    html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', estilo, html)
    html = re.sub(r'<script src="([^"]+)"></script>', script, html)
    aviso = "<!-- Versión de un solo archivo generada por tools/build.py desde index.html. No editar a mano. -->\n"
    return html.replace("<!doctype html>\n", "<!doctype html>\n" + aviso, 1)


def main(argv):
    comprobar = "--check" in argv
    desactualizados = []
    for relativa, contenido in generados().items():
        destino = RAIZ / relativa
        actual = destino.read_text(encoding="utf-8") if destino.exists() else None
        if actual == contenido:
            continue
        if comprobar:
            desactualizados.append(relativa)
        else:
            destino.parent.mkdir(parents=True, exist_ok=True)
            with open(destino, "w", encoding="utf-8", newline="\n") as f:
                f.write(contenido)
            print(f"generado: {relativa}")
    if comprobar:
        if desactualizados:
            print("Ficheros generados desactualizados (ejecuta python tools/build.py):")
            for r in desactualizados:
                print(f"  - {r}")
            return 1
        print("Ficheros generados al día.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
