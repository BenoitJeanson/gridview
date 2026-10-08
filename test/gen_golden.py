#!/usr/bin/env python3
"""Record pf.py's output as test/golden.json, the oracle pf.js is pinned to.

pf.py is kept byte-identical to the version validated against Julia (see the
validation table in README.md); only its CASEDIR is redirected here, so the
fixture is reproducible from an unmodified port of the Julia model.

    test/.venv/bin/python test/gen_golden.py
"""
import glob
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import pf

pf.CASEDIR = os.path.join(ROOT, 'cases')

_pat = os.path.expanduser('~/.julia/artifacts/*/pglib-opf-*/')
PGLIB = sorted(glob.glob(_pat))[-1]

# (dump name, pglib .m stem) - the dump name is the create_case string
CASES = [('case14', 'case14_ieee'), ('case57_ieee', 'case57_ieee'),
         ('case118', 'case118_ieee')]


def bridges(net):
    """Live edges whose outage strands at least one bus, in ekeys order."""
    cc, _ = net.component(frozenset())
    return [e for e in net.ekeys if net.component(frozenset({e}))[0] != cc]


def topologies(net):
    """A deterministic spread: base, single, double, islanding, islanding+1."""
    ek = net.ekeys
    br = bridges(net)
    tops = [[], [ek[0]], [ek[0], ek[5]]]
    if br:
        tops.append([br[0]])
        tops.append([br[0], ek[2]] if ek[2] != br[0] else [br[0], ek[3]])
    if len(br) > 1:
        tops.append([br[0], br[1]])
    return tops


def key(e):
    return '%d-%d' % e


def rec_dcpf(net, opened):
    r = net.dcpf(frozenset(opened))
    return {
        'flows': {key(e): r['flows'][e] for e in net.ekeys},
        'phi': {str(b): r['phi'][b] for b in net.buses},
        'p': {str(b): r['p'][b] for b in net.buses},
        'live': sorted(r['live']),
        'live_edges': sorted(key(e) for e in r['live_edges']),
        'slack': r['slack'],
    }


out = {'cases': {}}
for name, mfile in CASES:
    net = pf.Net(os.path.join(PGLIB, 'pglib_opf_%s.m' % mfile), name)
    assert net.exact, '%s: dump not picked up' % name
    entry = {
        'base': net.base,
        'slack': net.slack,
        'buses': sorted(net.buses),
        'ekeys': [key(e) for e in net.ekeys],
        'pmax': {key(e): net.edges[e]['pmax'] for e in net.ekeys},
        'b': {key(e): net.edges[e]['b'] for e in net.ekeys},
        'p_in': {str(b): net.p[b] for b in net.buses},
        'dcpf': [],
        'risk': [],
        'sa': [],
    }
    tops = topologies(net)
    for t in tops:
        ok = [key(e) for e in t]
        entry['dcpf'].append({'open': ok, 'out': rec_dcpf(net, t)})
        entry['risk'].append({'open': ok, 'out': pf.risk(net, frozenset(t)) * net.base})
    # sa is the expensive one: a subset of topologies, two (trigger, tlf) settings
    for t in tops[:4]:
        for trig, tlf in ((0.95, 1.0), (0.50, 1.5)):
            res = pf.sa(net, frozenset(t), trig, tlf)
            rows = res.pop('rows')
            entry['sa'].append({
                'open': [key(e) for e in t], 'trigger': trig, 'tlf': tlf,
                # the Phi/MW aggregates sweep every (contingency, branch) pair, so
                # they cover the whole matrix; the head pins filtering and sort order
                'out': {**res, 'n_rows': len(rows), 'head': rows[:25]},
                'n_ctg': len([e for e in net.ekeys if e not in frozenset(t)]),
            })
    out['cases'][name] = entry
    print('%-12s %3d buses %3d edges  %d dcpf  %d sa' % (
        name, len(net.buses), len(net.ekeys), len(entry['dcpf']), len(entry['sa'])))

with open(os.path.join(HERE, 'golden.json'), 'w') as f:
    json.dump(out, f, indent=1, sort_keys=True)
print('wrote test/golden.json')
