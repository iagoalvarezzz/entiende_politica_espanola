"""Comprueba los enlaces de data/sources.json y registra fecha y resultado (sección 3.4).

Para cada fuente con dirección:
- Pide la página una sola vez, con un agente de usuario que se identifica.
- «abierta»: respuesta 200 y aparece texto_esperado (o, si es un PDF, llega un PDF).
- «no_verificada»: error, bloqueo o texto esperado ausente, con el motivo.
- Si una web rechaza el acceso automatizado, se anota y no se reintenta por
  otra vía: hay que pedir el fichero a una persona.
- Las fuentes sin texto_esperado (salvo PDF) no se evalúan.

Escribe estado_enlace, fecha_comprobacion, resultado y comprobado_por en
data/sources.json, añade una línea por fuente a tests/registro-enlaces.tsv y
regenera los envoltorios con tools/build.py.

Uso:
  python tools/check_links.py              todas las fuentes
  python tools/check_links.py --solo a,b   solo esos identificadores
"""
import datetime
import html
import json
import pathlib
import sys
import time
import unicodedata
import urllib.error
import urllib.request

RAIZ = pathlib.Path(__file__).resolve().parent.parent
FUENTES = RAIZ / "data" / "sources.json"
REGISTRO = RAIZ / "tests" / "registro-enlaces.tsv"
AGENTE = "politica-espana-check-links/0.1 (comprobador de enlaces de un recurso educativo; una petición por enlace)"
MAX_BYTES = 3 * 1024 * 1024
ESPERA_ENTRE_PETICIONES = 1.0


def normalizar(texto):
    texto = unicodedata.normalize("NFD", html.unescape(texto))
    texto = "".join(c for c in texto if unicodedata.category(c) != "Mn")
    return " ".join(texto.lower().split())


def pedir(url):
    peticion = urllib.request.Request(url, headers={
        "User-Agent": AGENTE,
        "Accept": "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.9",
    })
    with urllib.request.urlopen(peticion, timeout=25) as respuesta:
        cuerpo = respuesta.read(MAX_BYTES)
        return respuesta.status, respuesta.geturl(), respuesta.headers.get("Content-Type", ""), cuerpo


def decodificar(cuerpo, tipo):
    juego = "utf-8"
    if "charset=" in tipo.lower():
        juego = tipo.lower().split("charset=")[-1].split(";")[0].strip() or "utf-8"
    try:
        return cuerpo.decode(juego, errors="replace")
    except LookupError:
        return cuerpo.decode("utf-8", errors="replace")


def comprobar(fuente):
    """Devuelve (estado_enlace, resultado) o None si la fuente no se evalúa."""
    url = fuente["url"]
    esperado = fuente.get("texto_esperado")
    es_pdf = url.lower().endswith(".pdf")
    if not esperado and not es_pdf:
        return None
    try:
        estado, final, tipo, cuerpo = pedir(url)
    except urllib.error.HTTPError as e:
        if e.code in (401, 403, 429):
            return "no_verificada", f"HTTP {e.code}: el servidor rechaza el acceso automatizado; no se reintenta. Hay que abrirla a mano o pedir el fichero."
        return "no_verificada", f"HTTP {e.code}"
    except urllib.error.URLError as e:
        return "no_verificada", f"Error de red: {e.reason}"
    except Exception as e:  # noqa: BLE001 - se registra cualquier fallo de conexión
        return "no_verificada", f"Error al abrir: {type(e).__name__}: {e}"
    redireccion = f" (redirige a {final})" if final.rstrip("/") != url.rstrip("/") else ""
    if estado != 200:
        return "no_verificada", f"HTTP {estado}{redireccion}"
    if es_pdf and not esperado:
        if "pdf" in tipo.lower() or cuerpo[:5] == b"%PDF-":
            return "abierta", f"HTTP 200; se recibe un PDF (contenido no comprobado automáticamente){redireccion}"
        return "no_verificada", f"HTTP 200, pero no se recibe un PDF (tipo {tipo or 'desconocido'}){redireccion}"
    texto = normalizar(decodificar(cuerpo, tipo))
    if normalizar(esperado) in texto:
        return "abierta", f"HTTP 200; aparece el texto esperado «{esperado}»{redireccion}"
    return "no_verificada", (f"HTTP 200, pero no aparece el texto esperado «{esperado}»{redireccion}. "
                             "La página puede generarse con JavaScript o haber cambiado.")


def main(argv):
    solo = None
    if "--solo" in argv:
        solo = set(argv[argv.index("--solo") + 1].split(","))
    documento = json.loads(FUENTES.read_text(encoding="utf-8"))
    hoy = datetime.date.today().isoformat()
    REGISTRO.parent.mkdir(parents=True, exist_ok=True)
    nuevo_registro = not REGISTRO.exists()
    cuentas = {"abierta": 0, "no_verificada": 0, "sin_evaluar": 0}
    with open(REGISTRO, "a", encoding="utf-8", newline="\n") as registro:
        if nuevo_registro:
            registro.write("fecha\tid\turl\testado_enlace\tresultado\n")
        for fuente in documento["registros"]:
            if solo and fuente["id"] not in solo:
                continue
            salida = comprobar(fuente)
            if salida is None:
                cuentas["sin_evaluar"] += 1
                print(f"[sin evaluar] {fuente['id']}: sin texto esperado")
                continue
            estado, resultado = salida
            fuente["estado_enlace"] = estado
            fuente["resultado"] = resultado
            fuente["fecha_comprobacion"] = hoy
            fuente["comprobado_por"] = "check_links"
            cuentas[estado] += 1
            print(f"[{estado}] {fuente['id']}: {resultado}")
            registro.write(f"{hoy}\t{fuente['id']}\t{fuente['url']}\t{estado}\t{resultado}\n")
            time.sleep(ESPERA_ENTRE_PETICIONES)
    documento["meta"]["actualizado"] = hoy
    FUENTES.write_text(json.dumps(documento, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(f"Abiertas: {cuentas['abierta']}; no verificadas: {cuentas['no_verificada']}; sin evaluar: {cuentas['sin_evaluar']}.")

    sys.path.insert(0, str(RAIZ / "tools"))
    import build  # noqa: E402
    build.main([])
    return 0


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main(sys.argv[1:]))
