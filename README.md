# gridview — an interactive DC power-flow bench for TNROpt cases

**[Open it →](https://benoitjeanson.github.io/gridview/)**

A single-page browser tool for laying out a transmission network by hand and then
studying it: open branches, watch the DC flows and overloads redraw, read an N−1
security analysis of the topology you have built, and see the same situation as a
Sankey diagram of power flowing down the phase-angle gradient.

It is deliberately small — one HTML file and three small modules — and it is not a
modelling tool. It never invents a network: every case it solves is the graph
`TNROpt.create_case` builds, and every quantity it displays is a port of a TNROpt
function, checked numerically against the Julia original.

Everything runs in the browser. There is no server, no build step and no install.

## Why it exists

TNROpt's topology work needs two things that a plotting call does not give you: a
sensible bus layout (Makie's automatic ones are unreadable above ~30 buses), and a way
to *feel* what a topology change does before writing an experiment for it. gridview
covers both. Coordinates are saved as the `bus_i,x,y` CSV that `load_coord` already
reads, so a layout drawn here is immediately what `draw`/`calcanddraw` renders.

## Running

Published at **<https://benoitjeanson.github.io/gridview/>** — open it and you have
the committed cases and layouts, with nothing installed.

Locally, any static file server will do. It cannot be opened as a `file://` URL,
because the page fetches its cases:

```bash
python3 -m http.server 8123      # then http://localhost:8123
```

The URL takes `?case=case118&study=1&open=24-25,35-36&cont=8-9&sankey=0` to reproduce
a situation, which is handy for sharing or for a screenshot — for instance
[case57 with two branches out and 8-9 as the contingency](https://benoitjeanson.github.io/gridview/?case=case57_ieee&study=1&open=24-25,35-36&cont=8-9).

## Where the data comes from, and where it goes

Three sources, in the order the app tries them.

**The repo.** `cases/*.json` and `coord/*.csv` as committed, over plain fetch. This is
the only source a static host can offer, and it is read-only. `cases/index.json` and
`coord/index.json` stand in for the directory listing a static host cannot give; the
Pages workflow regenerates both, so they cannot go stale.

**A folder on disk.** Press `folder…` and point gridview at your `data/exp_raw/coord/`.
From then on **save csv** writes straight into it and `reload csv` reads from it first
— which is what the old Python server did. The handle is remembered in IndexedDB, so
it survives reloads; the browser drops the permission each session, so the first save
of a session asks once. This needs the File System Access API, so Chromium only.
Everywhere else `save csv` hands you the file instead, and nothing else changes.

**A file you hand over.** `open case…` takes a `cases/*.json` dump from anywhere on
disk, so you can study a case without committing it. Dropping a file on the window
works too: a `.csv` is read as coordinates, a `.json` as a case.

## Edit mode — placing buses

Pick a case, hit **load network**. A spring layout runs for cases up to 600 buses;
if a coordinate file already exists for the name in the **outname** box it is loaded
on top instead.

| | |
|---|---|
| drag a node | move it |
| shift+click / shift+drag | multi-select / box-select, then drag any of them together |
| drag background, wheel | pan, zoom |
| ⌘Z, Esc, ⌘A | undo, deselect, select all |
| `snap` + step | quantise on drop; the step also sets the grid spacing |
| `fit to box` | rescale everything into an N×N square |

**save csv** writes `<outname>.csv` as `bus_i,x,y` — the name must be the string you
pass to `create_case`. Y is up, matching Makie, so what you draw is what `draw` renders.

Node colour has three modes: **role** (slack / generator / load / passive), **voltage**
(`baseKV`, a single-hue ordinal ramp — unavailable for the pglib cases that leave it
at a placeholder, case57 among them), and **group** (components after cutting
transformers, each with its own shape as well as colour). Orange dashed edges are
transformers.

Note that group mode uses shape as a second encoding channel because its six hues only
clear the colour-blind separation floor with one. In study mode shape is taken over by
load/generation, so group colours there stand alone — the legend spells this out, but
prefer role or voltage colouring in study mode if that matters to you.

## Study mode — flows, contingencies, security

Tick **study**. The layout freezes and the network becomes a flow diagram.

- **click a branch** to open/close it — this is the *topology*, drawn bold black
- **shift+click** to view it as a *contingency* — dashed bold black; several may be
  combined for an N−k
- flows recompute on every change; green branches carry a mid-edge arrow in the true
  flow direction and the value in MW to 3 significant digits; **red means and only
  means `|p| > p_max`**; de-energized branches go thin black and stranded buses fade
- width is `w0 + k·(|p|/p_max)/max_ratio`, `calcanddraw`'s rule — normalised to the
  worst loading ratio, not to `p_max` — with `w0` and `k` as spinboxes; the arrow head
  grows with the band so it stays legible on a thick branch
- buses follow `DrawGrid.jl`: **square for load** (p ≥ 0), **circle for generation**
  (p < 0), area by `sqrt(|p|)/sqrt(max_p)`, with `bus` setting the largest radius.
  Injections are the ones the solve actually used, so a shed bus collapses to the
  minimum size
- the placement grid is hidden — it is furniture for laying out, not for reading flows
- **TLF** scales every `p_max`, i.e. `create_case`'s `ratio`

### Security analysis panel

N−1 over the applied topology, ignoring the contingency being viewed — it answers
"is this topology secure", which the case you happen to be looking at must not change.
One row per (contingency, branch) reaching the trigger, worst first; rows over 100 %
in red. The header carries `eval_risk` and the violation magnitude at 100 % and at the
trigger, each in MW and in Φ units.

Clicking a row applies that contingency to the diagram.

The whole sweep is synchronous and costs about 1 ms on case14, 8 ms on case57 and
52 ms on case118 — 179 contingencies × 179 branches. It stays `O(m·n³)`, as the Julia
and Python versions were; a case of a few hundred buses would want LODF rank-1 updates
instead of refactorising per contingency.

### Sankey panel

[`@powsybl/sankey`](https://github.com/powsybl/powsybl-network-viewer/tree/sankey_bus_splitting/packages/sankey),
the TypeScript port of [SankeyPF.jl](https://github.com/CRESYM/sankeypf), rendering
the displayed case — contingencies included — vertically. Power flows down the
phase-angle gradient, band width is flow, colour is loading (green/yellow/red at
80 %/100 %), and overloads carry a hatch. `freeze` stops the force layout, which
otherwise runs continuously (the library's own 2 s cutoff is defeated by a watchdog,
because on 57 buses it quits mid-convergence).

Both panels resize by dragging the grip on their left edge and hide via the `×` or the
`table` / `sankey` checkboxes. Widths persist per browser.

## Case dumps — why Julia is in the loop

`create_case` does more than parse a matpower file: it balances the grid, chooses the
slack, and applies per-case rules. Worse, `PGLibtograph` collapses parallel branches by
overwriting, so *which* circuit of a parallel pair survives follows Julia's `Dict`
iteration order and is not reproducible by any rule (case57 keeps branch 18 of the pair
(4,18) but branch 35 of (24,25) — guessing costs 1.7 MW on the worst edge).

So the graph is not re-derived; it is dumped. Two steps, from a TNROpt checkout:

```bash
julia --project=. path/to/gridview/tools/dump_case.jl case57_ieee case118:1.0 case14
python3 tools/enrich_dump.py
```

`dump_case.jl` writes `cases/<name>.json` with injections, susceptances, limits and
slack — everything the solver needs. Limits are dumped *unscaled* — pass `case118:1.0`
to defeat `create_case`'s built-in 1.5× — so the TLF field is the only place the
thermal-limit factor is applied and you type the number you write in your logs.

`enrich_dump.py` adds what the *picture* needs and TNROpt's graph does not carry:
`baseKV` per bus, the tap ratio that marks a branch as a transformer, and the gen/load
split. It reads them from the pglib `.m` file in your Julia artifact depot and merges
them in as derived scalars under a `display` key. A dump without that key still solves;
the app says so, and falls back to the sign of the injection for the gen/load split.

## Validation

Every quantity was checked against the Julia original rather than assumed. That was
done in Python, in `coordedit`, the tool this one grew out of:

| quantity | reference | agreement |
|---|---|---|
| DC flows | `dcpf` — base, single, double and islanding outages | 1.9e-14 p.u. |
| N−1 flow matrix | `secured_dcpf`, 79 contingencies × 78 branches | 1.8e-14 p.u. |
| `eval_risk` | `eval_risk`, 14 random topologies | 8.9e-16 p.u. |
| magnitude Φ | `potential(mc, S, :hard)`, 8 topologies | 2.5e-12, `nviol` exact |

Φ follows `Potentials.jl` exactly, including the base case as the first term and every
non-opened branch as a contingency.

`src/pf.js` is the browser port of that Python. The chain back to Julia is kept by
pinning it to the Python's recorded output: `test/golden.json` holds `dcpf`, `risk` and
`sa` over 16 topologies across the three cases, and `npm test` asserts the port
reproduces them. Agreement is relative rather than bit-for-bit — the Python solves with
numpy's LU and this with Cholesky, and the two assemble the Laplacian in a different
bus order — and the whole fixture currently sits at 8 % of the tolerance, the worst
single deviation being 1.2e-9 MW on a magnitude aggregate of order 10⁴.

`test/pf.py` is that Python, kept byte-identical as the oracle, and `test/gen_golden.py`
regenerates the fixture from it. Neither ships to the site.

## Files

| | |
|---|---|
| `index.html` | the whole client — no build step, no framework |
| `src/pf.js` | DC power flow, N−1 sweep, `eval_risk`; a port of `Models/Base/DCPF.jl` and `Utils/RiskUtils.jl` |
| `src/linalg.js` | the dense Cholesky solve `pf.js` needs, the one thing numpy was there for |
| `src/files.js` | the repo, a picked folder, or a file you hand over |
| `cases/` | the dumps, with their display attributes |
| `coord/` | committed layouts, so the published page has something to show |
| `tools/dump_case.jl` | dumps the graph `create_case` builds; needs a TNROpt checkout |
| `tools/enrich_dump.py` | adds `baseKV`, transformers and the gen/load split from the pglib `.m` |
| `tools/make_index.py` | the two listings a static host cannot generate |
| `test/` | the oracle, the fixture, and the test that pins the port to it |
| `vendor/` | the bundled powsybl-sankey and its dependencies; see `vendor/README.md` |

## Limitations

- No topology editing: buses and branches come from the case, only coordinates move.
- Only dumped cases can be studied. gridview has no matpower parser — `coordedit` could
  re-derive a graph from a `.m` file and warn that it was inexact, and that path is gone
  with the server. Dump the case instead; it was always the exact one.
- Parallel branches are collapsed, matching the graph Julia solves — case57 shows 78
  branches, not the matpower file's 80.
- `case14`'s dump carries its hand-set injections and limits, so it is faithful only
  if you call `create_case("case14")`; its letter labels are mapped A→1 on the way in.
- The force layout runs on the client, so cases above ~600 buses load with a random
  layout instead.
- Saving into a folder needs the File System Access API — Chromium only. Elsewhere
  `save csv` hands you a download.

## Licensing

gridview's own code is MIT. `vendor/powsybl-sankey.js` is third-party and is not:

| | | |
|---|---|---|
| `@powsybl/sankey` 3.8.0-dev.0 | MPL-2.0 | Copyright (c) 2026, RTE |
| `@svgdotjs/svg.js` | MIT | Copyright (c) 2012-2018 Wout Fierens |
| `@svgdotjs/svg.panzoom.js` | MIT | Copyright (c) 2019 Ulrich-Matthias Schäfer |

It is vendored rather than installed because `@powsybl/sankey` is not published to
npm — it exists only on an unmerged branch — and it is compiled, not modified.
MPL-2.0 is file-level copyleft over the PowSyBl files themselves, so none of it
reaches gridview's code; what it asks for is notice and source availability, and
[`vendor/README.md`](vendor/README.md) carries both, including the exact upstream
commit the bundle was built from.

## Provenance

gridview is `tools/coordedit` from the TNROpt repo, extracted and made to run without
its Python backend. The solver, the client and the validation chain are that tool's;
what changed is where the numbers are computed and how files are read and written.
