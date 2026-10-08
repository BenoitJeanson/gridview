"""DC power flow, a faithful port of src/Models/Base/DCPF.jl `dcpf`.

The point is to match what the Julia model computes, quirks included, so the
study mode agrees with `calcanddraw`. Deliberate replications:

  * the graph is PGLibtograph's: parallel branches COLLAPSE onto one edge keyed
    (min_bus, max_bus) - last one in matpower order wins - and buses left with
    no incident branch are dropped;
  * bus injection is `load - generation` (positive = load), per-unit on baseMVA;
  * create_case's preparation: `balance!(g, gen_proportional)` rescales every
    p <= 0 bus so the grid balances, and only THEN is the slack chosen as the
    bus of minimum injection (PlayUtils.jl:84-87). case118 instead takes bus 69
    as slack with branch limits scaled 1.5x (PlayUtils.jl:77-82). case14's
    bespoke injections and limits are NOT reproduced;
  * an outage restricts the solve to the component reachable from the slack;
    everything outside is de-energized and carries no flow;
  * the generation rescaling that closes the component's imbalance runs ONLY
    when at least one branch is open (DCPF.jl's asymmetry, reproduced). Because
    create_case has already balanced the whole grid, it is a no-op for an outage
    that islands nothing, and only bites once buses are stranded.

`case` here is the string you would pass to create_case - NOT the pglib file
name - because create_case branches on it (case118 gets bus 69 as slack and 1.5x
limits, case14 gets hand-set injections). Run dump_case.jl with the same string.
"""
import json
import os
import re
import numpy as np

CASEDIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cases')


def _find_dump(case):
    """cases/<case>.json, matched case-insensitively (case57_IEEE vs case57_ieee)."""
    if not case or not os.path.isdir(CASEDIR):
        return None
    for f in os.listdir(CASEDIR):
        if f.endswith('.json') and f[:-5].lower() == case.lower():
            return os.path.join(CASEDIR, f)
    return None


def _busnum(label):
    """Graph labels are usually the bus number; case14 uses letters (A = 1)."""
    label = str(label)
    return int(label) if label.lstrip('-').isdigit() else ord(label[0]) - 64


def _block(txt, key):
    m = re.search(r'mpc\.' + key + r'\s*=\s*\[([\s\S]*?)\]\s*;', txt)
    if not m:
        return []
    rows = []
    for line in m.group(1).split('\n'):
        line = re.sub(r'%.*$', '', line).rstrip().rstrip(';').strip()
        if line:
            rows.append([float(x) for x in re.split(r'[\s,]+', line)])
    return rows


class Net:
    """The collapsed graph PGLibtograph would have built."""

    def __init__(self, path, case=''):
        txt = open(path).read()
        dump = _find_dump(case)
        if dump:
            self._from_dump(dump)
            # guard against a case/model mismatch handing back another network
            mbuses = {int(r[0]) for r in _block(txt, 'bus')}
            if set(self.buses) <= mbuses:
                self.exact = True
                return
        self.exact = False
        base = float(re.search(r'mpc\.baseMVA\s*=\s*([\d.]+)', txt).group(1))
        self.base = base
        bus, branch, gen = _block(txt, 'bus'), _block(txt, 'branch'), _block(txt, 'gen')

        p = {int(r[0]): r[2] / base for r in bus}          # load
        for r in gen:                                      # minus generation
            p[int(r[0])] -= r[1] / base

        # collapse parallels, last in matpower order wins (PGLibtograph overwrites)
        self.edges = {}
        for r in branch:
            f, t = int(r[0]), int(r[1])
            if f not in p or t not in p or f == t:
                continue
            self.edges[(min(f, t), max(f, t))] = {
                'b': 1.0 / r[3], 'pmax': r[5] / base,
                'xf': (r[8] or 0) != 0 and (r[8] or 1) != 1,
            }

        incident = {i: [] for i in p}
        for (f, t) in self.edges:
            incident[f].append((f, t))
            incident[t].append((f, t))
        self.buses = [i for i in p if incident[i]]         # drop isolated buses
        self.p = {i: p[i] for i in self.buses}
        self.incident = {i: incident[i] for i in self.buses}
        self.ekeys = list(self.edges)

        self._balance()
        if case.startswith('case118') and 69 in self.p:     # PlayUtils.jl:77-82
            self.slack = 69
            for e in self.edges:
                self.edges[e]['pmax'] *= 1.5
        else:  # PlayUtils.jl:84-87
            self.slack = min(self.buses, key=lambda i: self.p[i])

    def _from_dump(self, dump):
        """Load the graph create_case built, dumped by dump_case.jl.

        Preferred over re-deriving from the .m file: it settles which of a pair
        of parallel branches PGLibtograph kept, which follows Julia's Dict
        iteration order and is not reproducible by any rule here."""
        d = json.load(open(dump))
        self.base = 100.0
        self.p = {_busnum(k): float(v) for k, v in d['p'].items()}
        self.edges = {}
        for e in d['edges']:
            f, t = _busnum(e['f']), _busnum(e['t'])
            self.edges[(min(f, t), max(f, t))] = {
                'b': float(e['b']), 'pmax': float(e['p_max']), 'xf': False}
        incident = {i: [] for i in self.p}
        for (f, t) in self.edges:
            incident[f].append((f, t))
            incident[t].append((f, t))
        self.buses = list(self.p)
        self.incident = incident
        self.ekeys = list(self.edges)
        self.slack = _busnum(d['slack'])

    def _balance(self):
        """balance!(g, gen_proportional) - graphCore.jl:181-190."""
        imbalance = sum(self.p.values())
        gens = [i for i in self.buses if self.p[i] <= 0]
        total = sum(self.p[i] for i in gens)
        if total == 0:
            return
        for i in gens:
            self.p[i] -= imbalance * self.p[i] / total

    def component(self, opened):
        """Buses and edges reachable from the slack, open branches cut."""
        seen_b, seen_e, stack = {self.slack}, set(), [self.slack]
        while stack:
            u = stack.pop()
            for e in self.incident[u]:
                if e in opened or e in seen_e:
                    continue
                seen_e.add(e)
                v = e[1] if e[0] == u else e[0]
                if v not in seen_b:
                    seen_b.add(v)
                    stack.append(v)
        return seen_b, seen_e

    def dcpf(self, opened=frozenset()):
        opened = frozenset(opened)
        if opened:
            cc_b, cc_e = self.component(opened)
            buses = [i for i in self.buses if i in cc_b]
            edges = [e for e in self.ekeys if e in cc_e]
            correct = True
        else:
            buses, edges, correct = list(self.buses), list(self.ekeys), False

        idx = {b: i for i, b in enumerate(buses)}
        n, m = len(buses), len(edges)
        A = np.zeros((n, m))
        for j, (f, t) in enumerate(edges):
            A[idx[f], j] = -1.0        # oriented: -1 source, +1 destination
            A[idx[t], j] = 1.0
        d = np.array([self.edges[e]['b'] for e in edges])
        B = A * d @ A.T

        fixed = idx[self.slack]
        free = [i for i in range(n) if i != fixed]
        p_free = np.array([self.p[buses[i]] for i in free])

        if correct:
            imbalance = p_free.sum() + self.p[self.slack]
            gen = p_free[p_free <= 0].sum() + min(self.p[self.slack], 0.0)
            if gen == 0:
                raise ValueError('component cannot be balanced without generation')
            neg = p_free <= 0
            p_free[neg] -= p_free[neg] * imbalance / gen

        phi = np.zeros(n)
        if free:
            phi[free] = np.linalg.solve(B[np.ix_(free, free)], p_free)
        flow = d * (A.T @ phi)

        flows = {e: 0.0 for e in self.ekeys}
        for j, e in enumerate(edges):
            flows[e] = float(flow[j])
        # de-energized buses keep angle 0, as dcpf's d_phi does
        phis = {b: 0.0 for b in self.buses}
        for i, b in enumerate(buses):
            phis[b] = float(phi[i])
        # Injections actually used, as dcpf's d_p: A @ flow gives p for every
        # solved bus (the free ones by construction, the slack from its incident
        # flows, which is what DCPF.jl computes for it). Shed buses stay at 0.
        p_all = A @ flow
        ps = {b: 0.0 for b in self.buses}
        for i, b in enumerate(buses):
            ps[b] = float(p_all[i])
        return {
            'flows': flows,
            'phi': phis,
            'p': ps,
            'live': cc_b if opened else set(self.buses),
            'live_edges': set(edges),
            'slack': self.slack,
        }


def risk(net, opened=frozenset()):
    """eval_risk (RiskUtils.jl): load at risk from a single bridge outage.

    A bridge is a live branch whose outage shrinks the set reachable from the
    slack; its pocket is the side that falls off, and the pocket's `d` is the
    sum of positive injections in it (Pocket.jl). Nested bridges each count
    their whole downstream pocket, as create_bridge_to_pocket does.
    """
    opened = frozenset(opened)
    cc, ce = net.component(opened)
    total = 0.0
    for e in ce:
        sub, _ = net.component(opened | {e})
        pocket = cc - sub
        if pocket:
            total += sum(max(net.p[b], 0.0) for b in pocket)
    return total


def sa(net, opened=frozenset(), trigger=0.95, tlf=1.0):
    """N-1 over the applied topology.

    One row per (contingency, violated branch) whose loading reaches `trigger`.
    `tlf` is create_case's thermal-limit factor: it scales every p_max.
    Equivalent to secured_dcpf: its pocket rebalancing is algebraically the same
    as the correction dcpf applies, so repeated dcpf gives the same matrix.
    """
    opened = frozenset(opened)
    base = net.dcpf(opened)
    bf = base['flows']
    rows = []
    agg = {'mw100': 0.0, 'mwtrig': 0.0, 'phi100': 0.0, 'phitrig': 0.0}
    # potential()'s case set exactly: the base case first, then EVERY branch not
    # opened - including ones already stranded, whose "contingency" reproduces the
    # base case. Branches carrying no flow contribute 0, so no filtering is needed.
    for c in [None] + [e for e in net.ekeys if e not in opened]:
        r = base if c is None else net.dcpf(opened | {c})
        for e in net.ekeys:
            pm = net.edges[e]['pmax'] * tlf
            if pm <= 0:
                continue
            load = abs(r['flows'][e]) / pm
            # magnitude over the whole N-1 sweep, not just the rows shown
            over1 = max(0.0, load - 1.0)
            overt = max(0.0, load - trigger)
            agg['phi100'] += over1
            agg['phitrig'] += overt
            agg['mw100'] += over1 * pm * net.base
            agg['mwtrig'] += overt * pm * net.base
            if load < trigger:
                continue
            b = bf.get(e, 0.0)
            rows.append({
                'ctg': 'base' if c is None else '%d-%d' % c,
                'br': '%d-%d' % e,
                'base': b * net.base,
                'cont': r['flows'][e] * net.base,
                'load': load * 100.0,
                'ratio': (abs(r['flows'][e]) / abs(b) * 100.0) if abs(b) > 1e-9 else None,
            })
    rows.sort(key=lambda x: -x['load'])
    return {'rows': rows, **agg}
