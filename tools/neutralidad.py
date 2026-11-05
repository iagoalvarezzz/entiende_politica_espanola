"""Barrido de neutralidad (sección 4) de los textos de content/es y data.

Busca expresiones que piden revisión manual: llamadas a votar, adjetivos
valorativos, «ultra»/«extrema», veredictos sobre medidas o medios, y nombres
reales de medios o partidos en los ejemplos inventados de los módulos 8 y 9.
Uso: python tools/neutralidad.py [raíz]. Imprime cada coincidencia con su ruta.
Las coincidencias no son errores: hay que revisarlas a mano (informe de H5, punto 3).
"""
import json
import pathlib
import re
import sys

PATRONES = {
    "llamada a votar": r"\b(vota|votad|votes|no votes|tu voto debe|debes votar|te recomendamos)\b",
    "adjetivo valorativo": r"\b(mejor|peor|buen[oa]s?|mal[oa]s?|nefast[oa]|excelente|desastros[oa]|vergonzos[oa]|injust[oa]|acertad[oa]|equivocad[oa])\b",
    "etiqueta ideológica": r"\b(ultra\w*|extrema (derecha|izquierda)|radical(es)?|populistas?|fach\w+|rojos?)\b",
    "veredicto": r"\b(funciona|no funciona|fiables?|manipulador\w*|mentiros\w+|miente[n]?)\b",
}
REALES = r"\b(El País|El Mundo|ABC|La Razón|elDiario|Público|COPE|SER|Onda Cero|RTVE|TVE|Antena 3|Telecinco|PSOE|PP|Vox|Sumar|Podemos|ERC|Junts|PNV|Bildu)\b"


def textos(x, ruta=""):
    if isinstance(x, dict):
        for k, v in x.items():
            yield from textos(v, f"{ruta}.{k}")
    elif isinstance(x, list):
        for i, v in enumerate(x):
            yield from textos(v, f"{ruta}[{i}]")
    elif isinstance(x, str):
        yield ruta, x


def main(raiz):
    raiz = pathlib.Path(raiz)
    ficheros = sorted((raiz / "content" / "es").glob("*.json")) + [raiz / "data" / n for n in ("glosario.json", "preguntas.json", "medios.json", "verificadores.json")]
    total = 0
    for f in ficheros:
        doc = json.loads(f.read_text(encoding="utf-8"))
        for ruta, t in textos(doc):
            for nombre, patron in PATRONES.items():
                for m in re.finditer(patron, t, flags=re.IGNORECASE):
                    total += 1
                    ini = max(0, m.start() - 60)
                    print(f"{f.name}{ruta} | {nombre} | «{m.group(0)}» | …{t[ini:m.end() + 60]}…")
            if f.name in ("m8.json", "m9.json") and ("ejemplo" in ruta or "items" in ruta or "medidas" in ruta or "noticia" in ruta or "comprobaciones" in ruta):
                for m in re.finditer(REALES, t):
                    total += 1
                    print(f"{f.name}{ruta} | nombre real en ejemplo | «{m.group(0)}» | {t[:120]}")
    print(f"TOTAL {total}")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main(sys.argv[1] if len(sys.argv) > 1 else pathlib.Path(__file__).resolve().parent.parent)
