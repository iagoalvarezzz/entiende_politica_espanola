"""Resume los JSON de votaciones del Congreso descargados (con permiso) en un fichero compacto.

Uso: python -I parse_votaciones.py <lista_votaciones.txt> <carpeta descarga-congreso> <salida.json>
"""
import json
import os
import sys
from collections import defaultdict

lista, carpeta, salida = sys.argv[1:4]


def leer(path):
    raw = open(path, 'rb').read()
    for enc in ('utf-8', 'cp1252', 'latin-1'):
        try:
            return json.loads(raw.decode(enc))
        except (UnicodeDecodeError, json.JSONDecodeError):
            continue
    raise ValueError(path)


def iso(f):
    d, m, a = f.split('/')
    return '%s-%02d-%02d' % (a, int(m), int(d))


out = []
for linea in open(lista, encoding='utf-8'):
    linea = linea.strip()
    if not linea:
        continue
    tipo, dia, num, jpath, zpath = linea.split('|')
    sesion = None
    reg = {'tipo': tipo, 'dia': dia, 'numero': int(num)}
    if jpath:
        nombre = jpath.replace('/webpublica/opendata/votaciones/Leg15/', '').replace('/', '_')
        f = os.path.join(carpeta, 'json', nombre)
        reg['json'] = 'https://www.congreso.es' + jpath
    else:
        zipname = os.path.splitext(zpath.replace('/webpublica/opendata/votaciones/Leg15/', '').replace('/', '_'))[0]
        ses = int(zpath.split('/Sesion')[1].split('/')[0])
        f = os.path.join(carpeta, 'extraido', zipname, 'sesion%dvotacion%d.json' % (ses, int(num)))
        reg['zip'] = 'https://www.congreso.es' + zpath
        if not os.path.exists(f):
            reg['sin_detalle'] = True
            out.append(reg)
            continue
    d = leer(f)
    inf, tot, vots = d['informacion'], d['totales'], d['votaciones']
    reg.update({
        'sesion': inf['sesion'], 'fecha': iso(inf['fecha']), 'titulo': inf['titulo'],
        'expediente_texto': inf['textoExpediente'], 'subgrupo_titulo': inf.get('tituloSubGrupo', ''),
        'subgrupo_texto': inf.get('textoSubGrupo', ''), 'totales': tot,
    })
    grupos = defaultdict(lambda: defaultdict(int))
    mixto = []
    for v in vots:
        grupos[v['grupo']][v['voto']] += 1
        if v['grupo'] == 'GMx':
            mixto.append([v['diputado'], v['voto']])
    reg['grupos'] = {g: dict(c) for g, c in grupos.items()}
    reg['mixto'] = mixto
    out.append(reg)

json.dump(out, open(salida, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(out), 'votaciones;', sum(1 for r in out if r.get('sin_detalle')), 'sin detalle')
grupos = sorted({g for r in out for g in r.get('grupos', {})})
print('grupos:', grupos)
for r in out:
    if r.get('sin_detalle'):
        print('SIN', r['tipo'], r['dia'], r['numero'])
    else:
        print(r['tipo'], r['fecha'], r['numero'], '|', r['titulo'][:60], '|', r['subgrupo_titulo'][:50], '|', r['subgrupo_texto'][:60], '|', r['expediente_texto'][:90])
