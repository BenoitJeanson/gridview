# Changelog

## Unreleased

### Added
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
- The picture and the solver are built from one case dump. `index.html` had its own
  matpower parser and had to mirror `PGLibtograph`'s parallel-branch collapse to keep
  the two agreeing; there is now one graph.
- N−1 rows break loading ties by name, so the table is reproducible across machines.
- `open case…` takes a case dump from disk, where the old file input took a `.m` file.

### Removed
- `serve.py`, `pf.py` and `requirements.txt`: no backend, and no Python at run time.
- The matpower fallback. `coordedit` could re-derive a graph from a `.m` file when no
  dump existed and flag the result inexact; a static site has no artifact depot to read.
