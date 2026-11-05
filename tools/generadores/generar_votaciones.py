"""Genera data/votaciones.json con las 77 votaciones del criterio de la sección 4.4.

Uso: python -I generar_votaciones.py <lista_votaciones_v2.txt> <carpeta descarga-congreso> <data/votaciones.json>
Fuente: datos abiertos del Congreso (descargados con permiso el 04-11-2026).
"""
import json
import os
import sys
from collections import defaultdict

lista, carpeta, salida = sys.argv[1:4]
CONSULTA = '2026-11-04'

GRUPOS = {
    'GP': 'Grupo Parlamentario Popular en el Congreso',
    'GS': 'Grupo Parlamentario Socialista',
    'GVOX': 'Grupo Parlamentario VOX',
    'GSUMAR': 'Grupo Parlamentario Plurinacional SUMAR',
    'GR': 'Grupo Parlamentario Republicano',
    'GJxCAT': 'Grupo Parlamentario Junts per Catalunya',
    'GEH Bildu': 'Grupo Parlamentario Euskal Herria Bildu',
    'GV (EAJ-PNV)': 'Grupo Parlamentario Vasco (EAJ-PNV)',
    'GMx': 'Grupo Parlamentario Mixto',
}
ID_GRUPO = {'GP': 'gp', 'GS': 'gs', 'GVOX': 'gvox', 'GSUMAR': 'gsumar', 'GR': 'gr', 'GJxCAT': 'gjxcat',
            'GEH Bildu': 'gehbildu', 'GV (EAJ-PNV)': 'gv', 'GMx': 'gmx'}
# Diputados del Grupo Mixto elegidos en una candidatura propia (datos abiertos del Congreso).
MIXTO_FORMACION = {
    'Rego Candamil, Néstor': 'bng',
    'Valido García, Cristina': 'cca',
    'Catalán Higueras, Alberto': 'upn',
}
SIN_DETALLE = {
    ('investidura', '20230927'): ('Propuesta de don Alberto Núñez Feijóo como candidato a la Presidencia del Gobierno (primera votación).', 172, 178, 0),
    ('investidura', '20230929'): ('Propuesta de don Alberto Núñez Feijóo como candidato a la Presidencia del Gobierno (segunda votación).', 172, 177, 0),
    ('investidura', '20231116'): ('Propuesta de don Pedro Sánchez Pérez-Castejón como candidato a la Presidencia del Gobierno.', 179, 171, 0),
    ('lo-conjunto', '20240130'): ('Votación de conjunto de la Proposición de Ley Orgánica de amnistía para la normalización institucional, política y social en Cataluña.', 171, 179, 0),
    ('lo-conjunto', '20240314'): ('Votación de conjunto de la Proposición de Ley Orgánica de amnistía para la normalización institucional, política y social en Cataluña (tras el Senado).', 178, 172, 0),
    ('convalidacion', '20240110'): ('Real Decreto-ley 8/2023, de 27 de diciembre (votación repetida tras un empate a 171).', 172, 171, 7),
    ('convalidacion', '20261002', '130/000055'): ('Real Decreto-ley 26/2026, de 29 de septiembre, por el que se adoptan medidas urgentes para la protección de la función social de la vivienda.', 172, 178, 0),
    ('convalidacion', '20261002', '130/000056'): ('Real Decreto-ley 27/2026, de 29 de septiembre, por el que se adoptan medidas urgentes para reforzar la estabilidad de los contratos de arrendamiento.', 166, 184, 0),
}
TIPOS = {'investidura': 'investidura', 'convalidacion': 'convalidacion-rdl', 'lo-conjunto': 'ley-organica'}


def leer(path):
    raw = open(path, 'rb').read()
    for enc in ('utf-8', 'cp1252'):
        try:
            return json.loads(raw.decode(enc))
        except (UnicodeDecodeError, json.JSONDecodeError):
            continue
    raise ValueError(path)


def voto(v):
    v = v.lower()
    if v.startswith('s'):
        return 'si'
    if v.startswith('abst'):
        return 'abstencion'
    if v.startswith('no vota'):
        return 'no_vota'
    if v == 'no':
        return 'no'
    raise ValueError(v)


def enlace_dia(d):
    return ('https://www.congreso.es/es/opendata/votaciones?p_p_id=votaciones&p_p_lifecycle=0&p_p_state=normal'
            '&p_p_mode=view&targetLegislatura=XV&targetDate=%s/%s/%s' % (d[6:8], d[4:6], d[0:4]))


registros = []
vistos = set()
for linea in open(lista, encoding='utf-8-sig'):
    linea = linea.strip()
    if not linea:
        continue
    tipo, dia, jpath, zpath, exp = linea.split('|')
    fecha = '%s-%s-%s' % (dia[0:4], dia[4:6], dia[6:8])
    base = {'tipo': TIPOS[tipo], 'fecha': fecha, 'expediente': exp}
    if jpath:
        nombre = jpath.replace('/webpublica/opendata/votaciones/Leg15/', '').replace('/', '_')
        d = leer(os.path.join(carpeta, 'json', nombre))
        inf, tot = d['informacion'], d['totales']
        grupos = defaultdict(lambda: {'si': 0, 'no': 0, 'abstencion': 0, 'no_vota': 0})
        mixto = defaultdict(lambda: {'si': 0, 'no': 0, 'abstencion': 0, 'no_vota': 0})
        for v in d['votaciones']:
            grupos[ID_GRUPO[v['grupo']]][voto(v['voto'])] += 1
            if v['grupo'] == 'GMx' and v['diputado'] in MIXTO_FORMACION:
                mixto[MIXTO_FORMACION[v['diputado']]][voto(v['voto'])] += 1
        titulo = inf['textoExpediente'].strip()
        if base['tipo'] == 'ley-organica' and inf.get('textoSubGrupo'):
            titulo = inf['textoSubGrupo'].strip()
        reg = dict(base, numero=int(inf['numeroVotacion']), sesion=int(inf['sesion']), titulo=titulo,
                   totales={'si': tot['afavor'], 'no': tot['enContra'], 'abstencion': tot['abstenciones'],
                            'no_vota': tot.get('noVotan', 0)},
                   grupos=dict(grupos), mixto=dict(mixto), detalle=True,
                   json='https://www.congreso.es' + jpath)
        clave_rep = (tipo, dia, exp)
        if clave_rep in vistos and tipo == 'convalidacion':
            continue
    else:
        clave = (tipo, dia, exp) if (tipo, dia, exp) in SIN_DETALLE else (tipo, dia)
        titulo, si, no, ab = SIN_DETALLE[clave]
        reg = dict(base, numero=None, sesion=int(zpath.split('/Sesion')[1].split('/')[0]), titulo=titulo,
                   totales={'si': si, 'no': no, 'abstencion': ab, 'no_vota': 350 - si - no - ab},
                   grupos=None, mixto=None, detalle=False, json=None)
        if tipo == 'convalidacion' and (tipo, dia, exp) in vistos:
            # La votación repetida del RDL 8/2023 sustituye a la primera (empate): se conserva la primera como nota.
            previa = next(r for r in registros if r['expediente'] == exp and r['fecha'] == fecha)
            registros.remove(previa)
            reg['nota'] = ('La primera votación terminó en empate (171 a favor y 171 en contra); '
                           'la repetida solo tiene el total en los datos abiertos.')
    vistos.add((tipo, dia, exp))
    reg.update(enlace=enlace_dia(dia), fuente_id='congreso-votaciones-xv', fecha_consulta=CONSULTA, estado='verificado')
    registros.append(reg)

for i, r in enumerate(registros, 1):
    r['id'] = 'v%02d-%s-%s' % (i, r['tipo'], r['fecha'])
ordenados = []
for r in registros:
    ordenados.append({k: r.get(k) for k in ['id', 'tipo', 'fecha', 'sesion', 'numero', 'expediente', 'titulo', 'totales',
                                             'detalle', 'grupos', 'mixto', 'enlace', 'json', 'fuente_id',
                                             'fecha_consulta', 'estado'] + (['nota'] if 'nota' in r else [])})

doc = {
    'meta': {
        'conjunto': 'votaciones', 'esquema': 'votacion', 'version': '0.5.0', 'actualizado': '2026-11-05',
        'descripcion': ('Votaciones del Pleno del Congreso en la XV Legislatura que cumplen el criterio de la sección 4.4: '
                        'investiduras, Presupuestos (ninguna en la legislatura), convalidación de reales decretos-ley y '
                        'votación de conjunto de leyes orgánicas. Resultado por grupo parlamentario.'),
        'grupos': GRUPOS,
    },
    'registros': ordenados,
}
json.dump(doc, open(salida, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
from collections import Counter
print(len(ordenados), Counter(r['tipo'] for r in ordenados), sum(1 for r in ordenados if not r['detalle']), 'sin detalle')
for r in ordenados:
    if r['detalle']:
        s = sum(sum(g.values()) for g in r['grupos'].values())
        if s != 350 and s != sum(r['totales'].values()):
            print('AVISO suma', r['id'], s)
        t = r['totales']
        gs = {k: sum(g[k] for g in r['grupos'].values()) for k in ('si', 'no', 'abstencion')}
        if gs != {k: t[k] for k in gs}:
            print('AVISO totales', r['id'], gs, t)
