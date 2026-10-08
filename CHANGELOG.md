# Changelog

## Unreleased

### Added
- Per-case default TLF, recorded in the dump by `tools/enrich_dump.py`: 1.0, or
  whatever `create_case` scales the case by itself (case118 at 1.5). The field follows
  the case on switch, so another case's scaling cannot be left behind. `?tlf=`
  overrides it for the case in the link.
- A phone viewer. Under 820px the page locks to study mode, the side panels become
  diagram/table/sankey tabs, and the controls that do not fit move behind `⋯`. Touch
  input works: drag pans, two fingers pinch-zoom, a tap opens a branch, and a `tap`
  selector stands in for the shift key that a phone does not have. Branch hit targets
  widen to a fingertip, and the legend folds to its heading.
- `src/pf.js` and `src/linalg.js`: DC power flow, N−1 sweep and `eval_risk` in the
  browser, ported from `coordedit`'s `pf.py`. Dense Cholesky replaces `np.linalg.solve`.
- `src/files.js`: the repo, a remembered folder (File System Access API) or a file the
  user hands over, replacing `serve.py`'s `/api/coord`, `/api/coords` and `/api/save`.
- `tools/enrich_dump.py`: merges `baseKV`, the transformer tap ratio and the gen/load
  split into the case dumps, which `index.html` used to read from the pglib `.m` file.
- `tools/make_index.py`: `cases/index.json` and `coord/index.json`, since a static host
  cannot list a directory.
- `test/`: `pf.py` kept as the oracle, `golden.json` recorded from it over 16
  topologies, and `pf.test.mjs` pinning the port to it.
- GitHub Pages publication through Actions, gated on the test job.

### Changed
- Mouse events became pointer events, so mouse, touch and pen run one code path.
- Loading a case no longer computes a spring layout it is about to discard. The
  coordinate file is fetched before the graph is built, so applying it — or falling
  back to a computed layout — happens in one synchronous stretch instead of painting
  a hairball first.
- Picking a case in the dropdown loads it; the `load network` button is gone.
- The page opens in study mode. `?study=0` opts out, mirroring `?sankey=0`.
- One load path, `useDump`, shared by the case picker, `open case…` and drop. Dropping
  a case dump now loads its layout too, which it previously skipped.

- The picture and the solver are built from one case dump. `index.html` had its own
  matpower parser and had to mirror `PGLibtograph`'s parallel-branch collapse to keep
  the two agreeing; there is now one graph.
- N−1 rows break loading ties by name, so the table is reproducible across machines.
- `open case…` takes a case dump from disk, where the old file input took a `.m` file.

### Fixed
- A phone held sideways (844x390) cleared the width-only breakpoint and dropped out of
  phone mode, which also dropped `touch-action: none` and handed pinch back to the
  browser as page zoom. The query now tests viewport height and a coarse pointer as
  well, and `touch-action` belongs to the diagram rather than to a breakpoint.
- Switching to the table or the sankey and back re-fitted the diagram, discarding the
  pan and zoom. Re-fitting is now driven by the canvas actually changing size, so a
  rotation refits and a tab switch does not.
- Switching cases kept the previous `outname`, so the previous case's layout was
  applied to the new network. `applyCSV` skips bus ids it does not recognise, so this
  was silent: the overlapping ids were placed and the rest left where the spring
  layout had put them. `outname` now follows the case whenever the case changes, and
  is left alone when the same case is re-loaded so a variant name survives.

- Third-party licensing in `vendor/`. The esbuild bundle of `@powsybl/sankey` carried
  no copyright or licence notice at all: `--legal-comments=inline` keeps only comments
  tagged `@license` or `@preserve`, and PowSyBl's header is a plain `/** */` block, so
  the build had silently stripped RTE's MPL-2.0 notice. Restored by `vendor/banner.js`,
  which the documented rebuild command now applies. Added the full MPL-2.0 and MIT
  texts, an MPL §3.2(b) Source Form pointer naming the upstream commit, and scoped the
  repository `LICENSE` to gridview's own code.

### Removed
- `serve.py`, `pf.py` and `requirements.txt`: no backend, and no Python at run time.
- The matpower fallback. `coordedit` could re-derive a graph from a `.m` file when no
  dump existed and flag the result inexact; a static site has no artifact depot to read.
