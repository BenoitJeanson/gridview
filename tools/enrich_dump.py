#!/usr/bin/env python3
"""Add the display attributes to cases/<name>.json.

tools/dump_case.jl dumps what the solver needs — injections, susceptances,
limits, slack. The picture needs three more things, and all three are matpower
facts that TNROpt's graph does not carry:

    baseKV per bus          voltage colouring and its legend
    the tap ratio per edge  transformers draw dashed, and are cut to find the
                            galvanic groups
    the gen/load split      role colouring, and matpower's own type-3 reference

coordedit read them straight from the pglib `.m` file at run time. A static site
has no artifact depot, so they are merged in here instead — as derived scalars
under a "display" key, not as a copy of the pglib dataset.

    python3 tools/enrich_dump.py                 # every case in cases/
    python3 tools/enrich_dump.py case118         # or just one
"""
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CASEDIR = os.path.join(ROOT, 'cases')
_pat = os.path.expanduser('~/.julia/artifacts/*/pglib-opf-*/')
PGLIB = sorted(glob.glob(_pat))[-1] if glob.glob(_pat) else None

# dump name -> pglib .m stem. create_case's string is not always the file name.
MFILE = {'case14': 'case14_ieee', 'case57_ieee': 'case57_ieee',
         'case118': 'case118_ieee'}

# The thermal-limit factor the app should open with. Limits are dumped UNSCALED
# (dump_case.jl is run as `case118:1.0` to defeat create_case's built-in 1.5x),
# so the TLF field is the only place the factor is applied and its default has
# to put back whatever create_case would have used for that case. 1.0 unless
# create_case scales the case itself, which today is case118 at 1.5
# (PlayUtils.jl:77-82).
TLF = {'case118': 1.5}


def busnum(label):
    """Dump labels are usually the bus number; case14 uses letters (A = 1)."""
    s = str(label)
    return int(s) if s.lstrip('-').isdigit() else ord(s[0]) - 64


def block(txt, key):
    m = re.search(r'mpc\.' + key + r'\s*=\s*\[([\s\S]*?)\]\s*;', txt)
    if not m:
        return []
    rows = []
    for line in m.group(1).split('\n'):
        line = re.sub(r'%.*$', '', line).rstrip().rstrip(';').strip()
        if line:
            rows.append([float(x) for x in re.split(r'[\s,]+', line)])
    return rows


def enrich(name):
    path = os.path.join(CASEDIR, name + '.json')
    d = json.load(open(path))
    stem = MFILE.get(name, name)
    mpath = os.path.join(PGLIB, 'pglib_opf_%s.m' % stem)
    if not os.path.isfile(mpath):
        return '%s: no pglib_opf_%s.m — left alone' % (name, stem)
    txt = open(mpath).read()
    bus, branch, gen = block(txt, 'bus'), block(txt, 'branch'), block(txt, 'gen')
    byid = {int(r[0]): r for r in bus}
    gset = {int(r[0]) for r in gen}

    buses = {}
    for k in d['p']:
        r = byid.get(busnum(k))
        if r is None:
            return '%s: bus %s is not in the .m file — aborted' % (name, k)
        buses[k] = {'kv': r[9] or 0, 'ref': int(r[1]) == 3,
                    'gen': busnum(k) in gset, 'pd': r[2] or 0}

    # Same collapse as PGLibtograph and as the dump: key on (min, max), last
    # branch in matpower order wins. Only edges the dump kept are emitted.
    want = {'%d-%d' % (min(busnum(e['f']), busnum(e['t'])),
                       max(busnum(e['f']), busnum(e['t']))) for e in d['edges']}
    edges = {}
    for r in branch:
        f, t = int(r[0]), int(r[1])
        k = '%d-%d' % (min(f, t), max(f, t))
        if k not in want:
            continue
        ratio = r[8] if len(r) > 8 else 0
        edges[k] = {'xf': (ratio or 0) != 0 and (ratio or 1) != 1,
                    'on': len(r) < 11 or r[10] != 0}
    missing = want - set(edges)
    if missing:
        return '%s: %d dumped edge(s) absent from the .m file: %s' % (
            name, len(missing), ', '.join(sorted(missing)[:5]))

    d['display'] = {'source': 'pglib_opf_%s.m' % stem, 'buses': buses, 'edges': edges}
    d['tlf'] = TLF.get(name, 1.0)
    with open(path, 'w') as f:
        json.dump(d, f, indent=1, sort_keys=True)
    kvs = sorted({b['kv'] for b in buses.values()})
    return '%-12s %3d buses %3d edges  baseKV %-18s  %d transformer(s)  TLF %g' % (
        name, len(buses), len(edges),
        '/'.join('%g' % v for v in kvs) if len(kvs) > 1 else 'none (placeholder)',
        sum(e['xf'] for e in edges.values()), d['tlf'])


if __name__ == '__main__':
    if not PGLIB:
        sys.exit('no pglib-opf artifact found under ~/.julia/artifacts/')
    names = sys.argv[1:] or sorted(
        os.path.basename(p)[:-5] for p in glob.glob(os.path.join(CASEDIR, '*.json'))
        if os.path.basename(p) != 'index.json')
    for n in names:
        print(enrich(n))
