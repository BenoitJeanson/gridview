/** DC power flow in the browser — a port of coordedit's pf.py, which is itself a
 * port of src/Models/Base/DCPF.jl. The point is unchanged: match what the Julia
 * model computes, quirks included, so study mode agrees with `calcanddraw`.
 *
 * What this drops relative to pf.py is the matpower fallback. pf.py could
 * re-derive the graph from a pglib `.m` file when no dump existed — collapsing
 * parallel branches, calling `balance!`, applying create_case's per-case rules —
 * and flagged the result inexact. A static site has no artifact depot to read,
 * and `cases/*.json` is self-contained, so every network here is a dump and
 * every result is exact. Deliberate replications that remain:
 *
 *   * bus injection is `load - generation` (positive = load), per-unit on 100 MVA;
 *   * an outage restricts the solve to the component reachable from the slack;
 *     everything outside is de-energized and carries no flow;
 *   * the generation rescaling that closes the component's imbalance runs ONLY
 *     when at least one branch is open (DCPF.jl's asymmetry, reproduced).
 *     create_case has already balanced the whole grid, so it is a no-op for an
 *     outage that islands nothing, and only bites once buses are stranded.
 *
 * Pinned to pf.py's output by test/golden.json; see test/pf.test.mjs.
 */
import { solveSPD } from './linalg.js';

/** Graph labels are usually the bus number; case14 uses letters (A = 1). */
function busnum(label) {
  const s = String(label);
  return /^-?\d+$/.test(s) ? parseInt(s, 10) : s.charCodeAt(0) - 64;
}

export const ekey = (f, t) => `${Math.min(f, t)}-${Math.max(f, t)}`;

export class Net {
  /** `dump` is a parsed cases/<name>.json, as written by tools/dump_case.jl:
   *  the graph create_case built, with injections, susceptances, unscaled
   *  limits and the chosen slack. */
  constructor(dump, name = '') {
    this.name = name;
    this.base = 100.0;
    this.p = new Map();
    // Bus order differs from pf.py's: JSON integer-like keys come back
    // numerically sorted here and in insertion order there. It reaches the
    // result only as the order the Laplacian rows are assembled in, i.e. as
    // float roundoff, which is why the fixture is compared with a relative
    // tolerance rather than bit-for-bit.
    for (const [k, v] of Object.entries(dump.p)) this.p.set(busnum(k), Number(v));

    // Parallel branches are already collapsed in the dump; keying by
    // (min, max) here only guards against a dump that repeats a pair, and
    // Map.set keeps the first insertion's position exactly as a Python dict does.
    this.edges = new Map();
    for (const e of dump.edges) {
      const f = busnum(e.f), t = busnum(e.t);
      this.edges.set(ekey(f, t), {
        f: Math.min(f, t), t: Math.max(f, t),
        b: Number(e.b), pmax: Number(e.p_max),
      });
    }

    this.incident = new Map();
    for (const b of this.p.keys()) this.incident.set(b, []);
    for (const [k, e] of this.edges) {
      this.incident.get(e.f).push(k);
      this.incident.get(e.t).push(k);
    }
    this.buses = [...this.p.keys()];
    this.ekeys = [...this.edges.keys()];
    this.slack = busnum(dump.slack);
  }

  /** Buses and edges reachable from the slack, open branches cut. */
  component(opened) {
    const seenB = new Set([this.slack]), seenE = new Set(), stack = [this.slack];
    while (stack.length) {
      const u = stack.pop();
      for (const k of this.incident.get(u) || []) {
        if (opened.has(k) || seenE.has(k)) continue;
        seenE.add(k);
        const e = this.edges.get(k);
        const v = e.f === u ? e.t : e.f;
        if (!seenB.has(v)) { seenB.add(v); stack.push(v); }
      }
    }
    return [seenB, seenE];
  }

  dcpf(opened = new Set()) {
    let buses, edgeKeys, correct, ccB;
    if (opened.size) {
      const [cb, ce] = this.component(opened);
      ccB = cb;
      buses = this.buses.filter(b => cb.has(b));
      edgeKeys = this.ekeys.filter(k => ce.has(k));
      correct = true;
    } else {
      ccB = new Set(this.buses);
      buses = [...this.buses]; edgeKeys = [...this.ekeys]; correct = false;
    }

    const n = buses.length;
    const idx = new Map(buses.map((b, i) => [b, i]));
    const fixed = idx.get(this.slack);
    const free = [];
    for (let i = 0; i < n; i++) if (i !== fixed) free.push(i);
    const nf = free.length;
    const pos = new Int32Array(n).fill(-1);
    free.forEach((i, j) => { pos[i] = j; });

    // B = A·diag(b)·Aᵀ with the slack row and column struck out, assembled
    // edge by edge: A is −1 at the lower-numbered bus and +1 at the higher,
    // so each edge contributes +b on both diagonals and −b off them.
    const Bf = new Float64Array(nf * nf);
    for (const k of edgeKeys) {
      const e = this.edges.get(k);
      const a = pos[idx.get(e.f)], c = pos[idx.get(e.t)];
      if (a >= 0) Bf[a * nf + a] += e.b;
      if (c >= 0) Bf[c * nf + c] += e.b;
      if (a >= 0 && c >= 0) { Bf[a * nf + c] -= e.b; Bf[c * nf + a] -= e.b; }
    }

    const pFree = new Float64Array(nf);
    for (let j = 0; j < nf; j++) pFree[j] = this.p.get(buses[free[j]]);
    if (correct) {
      let s = 0;
      for (let j = 0; j < nf; j++) s += pFree[j];
      const imbalance = s + this.p.get(this.slack);
      let gen = 0;
      for (let j = 0; j < nf; j++) if (pFree[j] <= 0) gen += pFree[j];
      gen += Math.min(this.p.get(this.slack), 0.0);
      if (gen === 0) throw new Error('component cannot be balanced without generation');
      for (let j = 0; j < nf; j++) if (pFree[j] <= 0) pFree[j] -= pFree[j] * imbalance / gen;
    }

    const phi = new Float64Array(n);
    if (nf) {
      solveSPD(Bf, pFree, nf);               // pFree now carries φ on the free buses
      for (let j = 0; j < nf; j++) phi[free[j]] = pFree[j];
    }

    const flows = {};
    for (const k of this.ekeys) flows[k] = 0.0;
    // Injections actually used, as dcpf's d_p: A·flow gives p for every solved
    // bus (the free ones by construction, the slack from its incident flows,
    // which is what DCPF.jl computes for it). Shed buses stay at 0.
    const pAll = new Float64Array(n);
    for (const k of edgeKeys) {
      const e = this.edges.get(k);
      const i = idx.get(e.f), j = idx.get(e.t);
      const fl = e.b * (phi[j] - phi[i]);
      flows[k] = fl;
      pAll[i] -= fl; pAll[j] += fl;
    }

    const phis = {}, ps = {};
    for (const b of this.buses) { phis[b] = 0.0; ps[b] = 0.0; }   // de-energized keep angle 0
    for (let i = 0; i < n; i++) { phis[buses[i]] = phi[i]; ps[buses[i]] = pAll[i]; }

    return {
      flows, phi: phis, p: ps,
      live: ccB,
      live_edges: new Set(edgeKeys),
      slack: this.slack,
    };
  }

  /** eval_risk (RiskUtils.jl): load at risk from a single bridge outage.
   *
   * A bridge is a live branch whose outage shrinks the set reachable from the
   * slack; its pocket is the side that falls off, and the pocket's `d` is the
   * sum of positive injections in it (Pocket.jl). Nested bridges each count
   * their whole downstream pocket, as create_bridge_to_pocket does. */
  risk(opened = new Set()) {
    const [cc, ce] = this.component(opened);
    let total = 0.0;
    for (const k of ce) {
      const [sub] = this.component(new Set([...opened, k]));
      let s = 0.0, pocket = false;
      for (const b of cc) if (!sub.has(b)) { pocket = true; s += Math.max(this.p.get(b), 0.0); }
      if (pocket) total += s;
    }
    return total;
  }

  /** N−1 over the applied topology.
   *
   * One row per (contingency, violated branch) whose loading reaches `trigger`.
   * `tlf` is create_case's thermal-limit factor: it scales every p_max.
   * Equivalent to secured_dcpf — its pocket rebalancing is algebraically the
   * same as the correction dcpf applies, so repeated dcpf gives the same matrix. */
  sa(opened = new Set(), trigger = 0.95, tlf = 1.0) {
    const base = this.dcpf(opened);
    const bf = base.flows;
    const rows = [];
    const agg = { mw100: 0.0, mwtrig: 0.0, phi100: 0.0, phitrig: 0.0 };
    // potential()'s case set exactly: the base case first, then EVERY branch not
    // opened — including ones already stranded, whose "contingency" reproduces
    // the base case. Branches carrying no flow contribute 0, so no filtering.
    const ctgs = [null, ...this.ekeys.filter(k => !opened.has(k))];
    for (const c of ctgs) {
      const r = c === null ? base : this.dcpf(new Set([...opened, c]));
      for (const k of this.ekeys) {
        const pm = this.edges.get(k).pmax * tlf;
        if (pm <= 0) continue;
        const load = Math.abs(r.flows[k]) / pm;
        // magnitude over the whole N−1 sweep, not just the rows shown
        const over1 = Math.max(0.0, load - 1.0);
        const overt = Math.max(0.0, load - trigger);
        agg.phi100 += over1;
        agg.phitrig += overt;
        agg.mw100 += over1 * pm * this.base;
        agg.mwtrig += overt * pm * this.base;
        if (load < trigger) continue;
        const b = bf[k] ?? 0.0;
        rows.push({
          ctg: c === null ? 'base' : c,
          br: k,
          base: b * this.base,
          cont: r.flows[k] * this.base,
          load: load * 100.0,
          ratio: Math.abs(b) > 1e-9 ? Math.abs(r.flows[k]) / Math.abs(b) * 100.0 : null,
        });
      }
    }
    // descending loading, as pf.py; ties broken by name so a redraw, a reload
    // and another machine all show the same table
    rows.sort((x, y) => (y.load - x.load) ||
      (x.ctg < y.ctg ? -1 : x.ctg > y.ctg ? 1 : 0) ||
      (x.br < y.br ? -1 : x.br > y.br ? 1 : 0));
    return { rows, ...agg };
  }
}

/* ---- the shapes serve.py's /api/pf and /api/sa used to return ------------ */

export function pfResult(net, opened, tlf = 1.0) {
  const r = net.dcpf(opened);
  const pmax = {};
  for (const k of net.ekeys) pmax[k] = net.edges.get(k).pmax * tlf;
  return {
    flows: r.flows, pmax, tlf, phi: r.phi, p: r.p,
    live: [...r.live].sort((a, b) => a - b),
    live_edges: [...r.live_edges],
    slack: net.slack, exact: true, model: net.name, base: net.base,
  };
}

export function saResult(net, opened, trigger = 0.95, tlf = 1.0) {
  const t0 = performance.now();
  const res = net.sa(opened, trigger, tlf);
  return {
    ...res,
    risk: net.risk(opened) * net.base,
    n_ctg: net.ekeys.filter(k => !opened.has(k)).length,
    ms: Math.round(performance.now() - t0),
  };
}
