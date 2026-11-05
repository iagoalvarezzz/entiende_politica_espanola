"""H5: fuentes, data/medios.json y data/verificadores.json. Consultas del 05-11-2026.

Uso: python -I datos_h5.py <raíz del proyecto>. Es idempotente.
"""
import json
import pathlib
import sys

HOY = "2026-11-05"
NAV = "Abierta con el navegador integrado el 2026-11-05."

FUENTES = [
    ("ifcn-perfil-efe-verifica", "Perfil de EFE Verifica en la IFCN", "International Fact-Checking Network", "otro", "medios_verificacion",
     "Fechas del sello de signatario", "https://ifcncodeofprinciples.poynter.org/profile/efe-verifica", "EFE Verifica", "Sello emitido el 23-10-2025; caduca el 23-10-2027."),
    ("ifcn-perfil-factico", "Perfil de Factico en la IFCN", "International Fact-Checking Network", "otro", "medios_verificacion",
     "Fechas del sello de signatario", "https://ifcncodeofprinciples.poynter.org/profile/factico", "Factico", "Sello emitido el 05-08-2026; caduca el 05-08-2027. Web: factico.org (no se pudo abrir)."),
    ("ifcn-perfil-infoveritas", "Perfil de Infoveritas en la IFCN", "International Fact-Checking Network", "otro", "medios_verificacion",
     "Fechas del sello de signatario", "https://ifcncodeofprinciples.poynter.org/profile/infoveritas", "Infoveritas", "Sello emitido el 07-08-2025; caducó el 07-08-2026."),
    ("ifcn-perfil-newtral", "Perfil de Newtral en la IFCN", "International Fact-Checking Network", "otro", "medios_verificacion",
     "Fechas del sello de signatario", "https://ifcncodeofprinciples.poynter.org/profile/newtral", "Newtral", "Sello emitido el 25-09-2024; caducó el 25-09-2026."),
    ("ifcn-perfil-verificat", "Perfil de Verificat en la IFCN", "International Fact-Checking Network", "otro", "medios_verificacion",
     "Fechas del sello de signatario", "https://ifcncodeofprinciples.poynter.org/profile/verificat", "Verificat", "Sello emitido el 18-05-2026; caduca el 18-05-2027."),
    ("efe-verifica-financiacion", "EFE Verifica: financiación", "Agencia EFE", "medio", "medios_verificacion",
     "Propiedad y financiación de EFE Verifica", "https://verifica.efe.com/financiacion/", "FINANCIACIÓN", ""),
    ("efe-verifica-metodologia", "EFE Verifica: metodología", "Agencia EFE", "medio", "medios_verificacion",
     "Metodología publicada", "https://verifica.efe.com/metodologia/", "Metodología", ""),
    ("infoveritas-quienes-somos", "Infoveritas: quiénes somos", "Infoveritas", "medio", "medios_verificacion",
     "Propiedad y financiación de Infoveritas", "https://info-veritas.com/quienes-somos/", "Quiénes somos", ""),
    ("infoveritas-metodologia", "Infoveritas: metodología", "Infoveritas", "medio", "medios_verificacion",
     "Metodología publicada", "https://info-veritas.com/metodologia/", "Metodología", ""),
    ("verificat-financament", "Verificat: finançament", "Verificat", "medio", "medios_verificacion",
     "Financiación de Verificat", "https://www.verificat.cat/nosaltres/transparencia/financament/", "Finançament", ""),
    ("verificat-metodologia", "Verificat: metodologia", "Verificat", "medio", "medios_verificacion",
     "Metodología publicada", "https://www.verificat.cat/nosaltres/que-es-el-fact-checking/metodologia/", "Metodologia", ""),
]

# Muestra de EurOMo España 2025 (tabla 1): (id, nombre, soporte, corporación, grupo, titularidad, tipo de propietario)
EUROMO = [
    ("antena3", "Antena 3", "television", "Atresmedia Corporación de Medios S.A.", "Grupo Planeta", "privada", "privado"),
    ("lasexta", "La Sexta", "television", "Atresmedia Corporación de Medios S.A.", "Grupo Planeta", "privada", "privado"),
    ("telecinco", "Telecinco", "television", "Grupo Editorial Telecinco S.A.U.", "Media For Europe", "privada", "privado"),
    ("cuatro", "Cuatro", "television", "Grupo Editorial Telecinco S.A.U.", "Media For Europe", "privada", "privado"),
    ("tve", "TVE (La 1) y rtve.es", "television", "Corporación de Radio Televisión Española S.A.", "Corporación de Radio Televisión Española S.A.", "publica", "publico"),
    ("rne", "RNE", "radio", "Corporación de Radio Televisión Española S.A.", "Corporación de Radio Televisión Española S.A.", "publica", "publico"),
    ("ser", "Cadena SER", "radio", "Sociedad Española de Radiodifusión, SL", "Grupo Prisa (Promotora de Informaciones, SA)", "privada", "privado"),
    ("cope", "COPE", "radio", "Radio Popular, S.A.", "Cadena de Ondas Populares Españolas", "privada", "iglesia"),
    ("ondacero", "Onda Cero", "radio", "Atresmedia Corporación de Medios S.A.", "Grupo Planeta", "privada", "privado"),
    ("elpais", "El País", "prensa", "Ediciones El País, SL", "Grupo Prisa (Promotora de Informaciones, SA)", "privada", "privado"),
    ("elmundo", "El Mundo", "prensa", "Unidad Editorial S.A.", "RCS Media Group", "privada", "privado"),
    ("abc", "ABC", "prensa", "Diario ABC, SL", "Vocento", "privada", "privado"),
    ("larazon", "La Razón", "prensa", "Audiovisual Española 2000, S.A.", "Grupo Planeta", "privada", "privado"),
    ("lavanguardia", "La Vanguardia", "prensa", "Vanguardia Ediciones, SLU", "Grupo Godó", "privada", "privado"),
    ("elespanol", "El Español", "nativo_digital", "El León de El Español Publicaciones S.A.", None, "privada", "privado"),
    ("elconfidencial", "El Confidencial", "nativo_digital", "Titania Compañía Editorial SL", None, "privada", "privado"),
    ("eldiario", "elDiario.es", "nativo_digital", "El Diario de Prensa Digital S.L.", None, "privada", "privado"),
    ("huffpost", "El HuffPost (huffingtonpost.es)", "nativo_digital", "BuzzFeed Inc", None, "privada", "privado"),
]
NOTAS_PROPIEDAD = {
    "cope": "Según EurOMo, la Conferencia Episcopal Española es el accionista mayoritario de Radio Popular, S.A.",
    "eldiario": "Según EurOMo, sus periodistas y trabajadores son propietarios directos.",
    "tve": "Propietario: el Estado.",
    "rne": "Propietario: el Estado.",
}
# Medios que entran por el Anexo D.6 o por el Digital News Report y no están en la muestra de EurOMo.
OTROS = [
    ("okdiario", "OKDIARIO", "nativo_digital", "dnr", "Dos Mil Palabras, SL"),
    ("publico", "Público", "nativo_digital", "anexo", None),
    ("libertaddigital", "Libertad Digital", "nativo_digital", "anexo", None),
    ("infolibre", "infoLibre", "nativo_digital", "anexo", None),
    ("vozpopuli", "Vozpópuli", "nativo_digital", "anexo", None),
    ("theobjective", "The Objective", "nativo_digital", "anexo", None),
    ("20minutos", "20 Minutos", "nativo_digital", "dnr", None),
]
# Digital News Report España 2026: % que confía en las noticias de la marca (entre quienes la conocen).
DNR = {"antena3": (52, "+2"), "tve": (52, "+4"), "ser": (51, "+6"), "ondacero": (49, "+3"), "elpais": (49, "+6"), "elmundo": (47, "+6"),
       "abc": (45, "+4"), "eldiario": (42, "+4"), "20minutos": (41, "+3"), "elconfidencial": (39, "+3"), "telecinco": (36, "+4"), "okdiario": (35, "+4")}
NOTA_DNR = {"tve": "Marca RTVE."}

VERIFICADORES = [
    {"id": "efe-verifica", "nombre": "EFE Verifica", "ifcn": "signatario", "ifcn_texto": "Signatario: sello del 23-10-2025, válido hasta el 23-10-2027.", "ifcn_fuente": "ifcn-perfil-efe-verifica",
     "propiedad": "Servicio de la Agencia EFE, sociedad mercantil estatal cuyo accionista único es la SEPI. Se financia con el presupuesto general de la Agencia.", "propiedad_fuente": "efe-verifica-financiacion",
     "metodologia_fuente": "efe-verifica-metodologia"},
    {"id": "factico", "nombre": "Factico", "ifcn": "signatario", "ifcn_texto": "Signatario: sello del 05-08-2026, válido hasta el 05-08-2027.", "ifcn_fuente": "ifcn-perfil-factico",
     "propiedad": None, "propiedad_fuente": None, "metodologia_fuente": None},
    {"id": "infoveritas", "nombre": "Infoveritas", "ifcn": "caducado", "ifcn_texto": "Figura en la lista de signatarios, pero según su perfil el sello caducó el 07-08-2026.", "ifcn_fuente": "ifcn-perfil-infoveritas",
     "propiedad": "Infoveritas Verifica S.L., cuyo socio único y administrador es la sociedad Agranda S.L., que la financia.", "propiedad_fuente": "infoveritas-quienes-somos",
     "metodologia_fuente": "infoveritas-metodologia"},
    {"id": "newtral", "nombre": "Newtral", "ifcn": "caducado", "ifcn_texto": "Figura en la lista de signatarios, pero según su perfil el sello caducó el 25-09-2026.", "ifcn_fuente": "ifcn-perfil-newtral",
     "propiedad": "Según EurOMo 2025, Newtral Media Audiovisual S.L.U.; su única propietaria es su directora.", "propiedad_fuente": "euromo-espana-2025",
     "metodologia_fuente": None},
    {"id": "verificat", "nombre": "Verificat", "ifcn": "signatario", "ifcn_texto": "Signatario: sello del 18-05-2026, válido hasta el 18-05-2027.", "ifcn_fuente": "ifcn-perfil-verificat",
     "propiedad": "Declara financiación pública y privada: subvenciones, donaciones de fundaciones y venta de servicios. Ingresos de 685.528 euros en 2025.", "propiedad_fuente": "verificat-financament",
     "metodologia_fuente": "verificat-metodologia"},
    {"id": "verificartve", "nombre": "VerificaRTVE", "ifcn": "no_figura", "ifcn_texto": "No figura en la lista de signatarios de la IFCN consultada el 05-11-2026.", "ifcn_fuente": "ifcn-signatarios",
     "propiedad": "Servicio de RTVE, corporación pública del Estado (EurOMo 2025).", "propiedad_fuente": "euromo-espana-2025",
     "metodologia_fuente": None},
]


def main(raiz):
    raiz = pathlib.Path(raiz)
    # Esquema medio: campos opcionales (ampliación H5).
    ruta = raiz / "data" / "schemas" / "medio.schema.json"
    esq = json.loads(ruta.read_text(encoding="utf-8"))
    p = esq["properties"]
    p.setdefault("tipo_propietario", {"enum": ["publico", "privado", "iglesia", "sin_documentar"]})
    p.setdefault("criterio", {"enum": ["euromo", "anexo", "dnr"]})
    p.setdefault("pendientes", {"type": "array", "items": {"type": "object", "required": ["campo", "motivo"]}})
    esq["description"] = esq["description"].split(" Ampliación H5")[0] + (
        " Ampliación H5: tipo_propietario (para filtrar), criterio (por qué entra en la lista) y pendientes (campos sin dato y motivo).")
    ruta.write_text(json.dumps(esq, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    (raiz / "data" / "schemas" / "verificador.schema.json").write_text(json.dumps({
        "$schema": "https://json-schema.org/draft/2020-12/schema", "$id": "verificador.schema.json",
        "title": "Servicio de verificación, fichero data/verificadores.json (ampliación H5, no prevista en el Anexo C)",
        "description": "Misma estructura para todos (sección 16.5): estado en la IFCN, propiedad y financiación, y metodología publicada.",
        "type": "object", "required": ["id", "nombre", "ifcn", "ifcn_texto", "ifcn_fuente", "propiedad", "propiedad_fuente", "metodologia_fuente", "fecha_consulta"],
        "additionalProperties": False,
        "properties": {
            "id": {"$ref": "comun.schema.json#/$defs/id"}, "nombre": {"$ref": "comun.schema.json#/$defs/texto"},
            "ifcn": {"enum": ["signatario", "caducado", "no_figura"]}, "ifcn_texto": {"$ref": "comun.schema.json#/$defs/texto"},
            "ifcn_fuente": {"$ref": "comun.schema.json#/$defs/id"}, "propiedad": {"type": ["string", "null"]},
            "propiedad_fuente": {"type": ["string", "null"]}, "metodologia_fuente": {"type": ["string", "null"]},
            "fecha_consulta": {"$ref": "comun.schema.json#/$defs/fecha"},
        },
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    ruta = raiz / "data" / "schemas" / "comun.schema.json"
    comun = json.loads(ruta.read_text(encoding="utf-8"))
    enum = comun["$defs"]["meta"]["properties"]["esquema"]["enum"]
    if "verificador" not in enum:
        enum.append("verificador")
    ruta.write_text(json.dumps(comun, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")

    # Fuentes.
    ruta = raiz / "data" / "sources.json"
    doc = json.loads(ruta.read_text(encoding="utf-8"))
    ids = {r["id"] for r in doc["registros"]}
    for (id_, titulo, inst, tipo, grupo, uso, url, esperado, nota) in FUENTES:
        if id_ in ids:
            continue
        doc["registros"].append({"id": id_, "titulo": titulo, "institucion": inst, "tipo": tipo, "grupo": grupo, "uso": uso, "url": url,
                                 "texto_esperado": esperado, "estado_enlace": "abierta", "comprobado_por": "navegador",
                                 "fecha_comprobacion": HOY, "nota": (NAV + " " + nota).strip()})
    doc["meta"].update(version="0.6.0", actualizado=HOY)
    ruta.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")

    pend_linea = {"campo": "linea_editorial", "motivo": "Pendiente para todos los medios: no se ha comprobado todavía en la web de cada uno dónde declara su línea editorial."}
    sin_orient = {"clasificacion": "sin clasificación documentada", "fuente_id": None, "anio": None, "metodologia": None}
    registros = []
    for (mid, nombre, soporte, corp, grupo, tit, tipo) in EUROMO:
        punto = lambda s: s if s.endswith(".") else s + "."
        texto = f"Sociedad: {punto(corp)}" + (f" Grupo: {punto(grupo)}" if grupo and grupo != corp else "")
        if mid in NOTAS_PROPIEDAD:
            texto += " " + NOTAS_PROPIEDAD[mid]
        registros.append({"mid": mid, "nombre": nombre, "soporte": soporte, "titularidad": tit, "tipo": tipo, "criterio": "euromo",
                          "propiedad": {"texto": texto, "fuente_id": "euromo-espana-2025", "edicion": 2025, "corporacion": corp, "grupo": grupo}})
    for (mid, nombre, soporte, criterio, corp) in OTROS:
        if corp:
            prop = {"texto": f"Sociedad: {corp}. En EurOMo 2025 figura como cuenta en una plataforma digital.",
                    "fuente_id": "euromo-espana-2025", "edicion": 2025, "corporacion": corp, "grupo": None}
            tipo = "privado"
        else:
            prop = {"texto": "Propiedad sin documentar: el medio no figura en EurOMo 2025 y no se ha abierto otra fuente.", "fuente_id": None, "edicion": None,
                    "corporacion": None, "grupo": None}
            tipo = "sin_documentar"
        registros.append({"mid": mid, "nombre": nombre, "soporte": soporte, "titularidad": "privada", "tipo": tipo, "criterio": criterio, "propiedad": prop})
    medios = []
    for r in sorted(registros, key=lambda x: x["nombre"].lower()):
        if r["mid"] in DNR:
            v, cambio = DNR[r["mid"]]
            aud = {"valor": v, "unidad": "% de encuestados que confían en sus noticias", "periodo": f"2026 ({cambio} puntos frente a 2025)",
                   "fuente_id": "dnr-espana-2026-confianza", "nota": ("Describe a la audiencia, no al medio. " + NOTA_DNR.get(r["mid"], "")).strip()}
        else:
            aud = {"valor": "sin dato publicado", "unidad": "sin unidad", "periodo": "sin periodo", "fuente_id": "dnr-espana-2026-confianza",
                   "nota": "El Digital News Report España 2026 no lo recoge."}
        pend = [pend_linea]
        if r["propiedad"]["fuente_id"] is None:
            pend.append({"campo": "propiedad", "motivo": "El medio no figura en EurOMo 2025 y no se ha abierto otra fuente."})
        medios.append({"id": r["mid"], "nombre": r["nombre"], "soporte": r["soporte"], "titularidad": r["titularidad"], "propiedad": r["propiedad"],
                       "linea_editorial": {"texto": "Pendiente de comprobar.", "url": None, "fecha_consulta": None},
                       "audiencia": aud, "orientacion": sin_orient, "tipo_propietario": r["tipo"], "criterio": r["criterio"], "pendientes": pend})
    doc = {"meta": {"conjunto": "medios", "esquema": "medio", "version": "0.6.0", "actualizado": HOY,
                    "descripcion": "Medios de la muestra de EurOMo España 2025, del Anexo D.6 y los que cita el Digital News Report España 2026. Misma estructura para todos; ninguna orientación asignada por la web.",
                    "contexto": {"fecha_consulta": HOY, "euromo": "Informe de España, edición 2025 (diciembre de 2025), CC BY 4.0."}},
           "registros": medios}
    (raiz / "data" / "medios.json").write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")

    vers = [dict(v, fecha_consulta=HOY) for v in VERIFICADORES]
    doc = {"meta": {"conjunto": "verificadores", "esquema": "verificador", "version": "0.6.0", "actualizado": HOY,
                    "descripcion": "Servicios de verificación: los signatarios españoles de la IFCN en la fecha de consulta y los que cita el Anexo D.7."},
           "registros": vers}
    (raiz / "data" / "verificadores.json").write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(len(medios), "medios;", len(vers), "verificadores")


if __name__ == "__main__":
    main(sys.argv[1])
