/** src/pf.js against test/golden.json, the output recorded from pf.py.
 *
 * pf.py was validated against the Julia original quantity by quantity (the
 * table in README.md); this pins the JS port to pf.py, so the chain back to
 * TNROpt holds. Agreement is relative, not bit-for-bit: pf.py solves with
 * numpy's LU and this with Cholesky, and the two assemble the Laplacian in a
 * different bus order, so the last couple of digits are free to differ.
 *
 *     node --test test/
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Net } from '../src/pf.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(HERE);
const read = p => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const golden = read('test/golden.json');
const CASEFILE = { case14: 'case14.json', case57_ieee: 'case57_ieee.json', case118: 'case118.json' };

const ATOL = 1e-10, RTOL = 1e-12;
// How close the whole fixture came to the tolerance, as a fraction of it. One
// number, and the only honest one: a relative error is meaningless on the
// injections of a passive bus, which are zero up to roundoff.
let margin = 0, marginWhat = '', worstAbs = 0, worstAbsWhat = '';

function close(got, want, what) {
  if (want === null || got === null) {
    assert.equal(got, want, `${what}: ${got} vs ${want}`);
    return;
  }
  const abs = Math.abs(got - want);
  const tol = ATOL + RTOL * Math.abs(want);
  if (abs / tol > margin) { margin = abs / tol; marginWhat = what; }
  if (abs > worstAbs) { worstAbs = abs; worstAbsWhat = what; }
  assert.ok(abs <= tol,
    `${what}: got ${got}, want ${want} (abs ${abs.toExponential(2)}, tol ${tol.toExponential(2)})`);
}

function closeMap(got, want, what) {
  assert.deepEqual(Object.keys(got).sort(), Object.keys(want).sort(), `${what}: key sets`);
  for (const k of Object.keys(want)) close(got[k], want[k], `${what}[${k}]`);
}

for (const [name, g] of Object.entries(golden.cases)) {
  const net = new Net(read(`cases/${CASEFILE[name]}`), name);

  test(`${name}: graph matches the dump pf.py read`, () => {
    assert.equal(net.base, g.base);
    assert.equal(net.slack, g.slack);
    assert.deepEqual([...net.buses].sort((a, b) => a - b), g.buses);
    // edge order drives sa's row order for ties, so it is checked exactly
    assert.deepEqual(net.ekeys, g.ekeys);
    closeMap(Object.fromEntries(net.ekeys.map(k => [k, net.edges.get(k).pmax])), g.pmax, 'pmax');
    closeMap(Object.fromEntries(net.ekeys.map(k => [k, net.edges.get(k).b])), g.b, 'b');
    closeMap(Object.fromEntries(net.buses.map(b => [b, net.p.get(b)])), g.p_in, 'p_in');
  });

  for (const { open, out } of g.dcpf) {
    test(`${name}: dcpf open=[${open}]`, () => {
      const r = net.dcpf(new Set(open));
      closeMap(r.flows, out.flows, 'flows');
      closeMap(r.phi, out.phi, 'phi');
      closeMap(r.p, out.p, 'p');
      assert.deepEqual([...r.live].sort((a, b) => a - b), out.live, 'live');
      assert.deepEqual([...r.live_edges].sort(), out.live_edges, 'live_edges');
      assert.equal(r.slack, out.slack);
    });
  }

  for (const { open, out } of g.risk) {
    test(`${name}: risk open=[${open}]`, () => {
      close(net.risk(new Set(open)) * net.base, out, 'risk');
    });
  }

  for (const { open, trigger, tlf, out, n_ctg } of g.sa) {
    test(`${name}: sa open=[${open}] trigger=${trigger} tlf=${tlf}`, () => {
      const r = net.sa(new Set(open), trigger, tlf);
      assert.equal(net.ekeys.filter(k => !new Set(open).has(k)).length, n_ctg, 'n_ctg');
      assert.equal(r.rows.length, out.n_rows, 'row count');
      for (const q of ['mw100', 'mwtrig', 'phi100', 'phitrig']) close(r[q], out[q], q);
      // Rows are matched by (contingency, branch), not by position: where two
      // contingencies load a branch identically — stranded branches reproduce
      // the base case, so this is common — the permutation within the tie is
      // decided by roundoff and carries no information. What is asserted is
      // that every recorded row is present with the same numbers, and that the
      // table really is ordered by descending loading.
      const got = new Map(r.rows.map(x => [`${x.ctg}|${x.br}`, x]));
      for (const w of out.head) {
        const h = got.get(`${w.ctg}|${w.br}`);
        assert.ok(h, `row ${w.ctg}|${w.br} missing`);
        for (const q of ['base', 'cont', 'load', 'ratio']) close(h[q], w[q], `${w.ctg}|${w.br} ${q}`);
      }
      for (let i = 1; i < r.rows.length; i++) {
        assert.ok(r.rows[i].load <= r.rows[i - 1].load, `rows not descending at ${i}`);
      }
    });
  }
}

test('agreement with pf.py', () => {
  console.log(`  worst absolute deviation : ${worstAbs.toExponential(2)}  (${worstAbsWhat})`);
  console.log(`  closest to tolerance     : ${(margin * 100).toFixed(1)}% of it  (${marginWhat})`);
});
