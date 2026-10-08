# Vendored third-party code

`powsybl-sankey.js` is a self-contained IIFE bundle (global `PowsyblSankey`) of
[`@powsybl/sankey`](https://github.com/powsybl/powsybl-network-viewer/tree/sankey_bus_splitting/packages/sankey),
the TypeScript/SVG port of [SankeyPF.jl](https://github.com/CRESYM/sankeypf).

It is vendored rather than installed because the package is not published: it exists
only on the unmerged `sankey_bus_splitting` branch, so there is no npm release and no
CDN to load it from. It is compiled, not modified — gridview carries the upstream
source through esbuild and changes none of it.

## What is inside, and under what terms

| | | |
|---|---|---|
| `@powsybl/sankey` 3.8.0-dev.0 | MPL-2.0 | Copyright (c) 2026, RTE (http://www.rte-france.com) |
| `@svgdotjs/svg.js` | MIT | Copyright (c) 2012-2018 Wout Fierens |
| `@svgdotjs/svg.panzoom.js` | MIT | Copyright (c) 2019 Ulrich-Matthias Schäfer |

Full texts: `LICENSE-MPL-2.0.txt`, `LICENSE-MIT-svg.js.txt`,
`LICENSE-MIT-svg.panzoom.js.txt`. None of this falls under gridview's own MIT
licence; see the repository `LICENSE`.

MPL-2.0 is file-level copyleft and applies to the PowSyBl files themselves. gridview
compiles them without modification and links to the result, so nothing propagates to
gridview's own code — the obligations here are notice and source availability.

## Source Form

Per MPL-2.0 §3.2(b), the Source Form of the MPL-licensed part of
`powsybl-sankey.js` is available at no charge from

> https://github.com/powsybl/powsybl-network-viewer
> branch `sankey_bus_splitting`, commit `0873dd1` (2026-07-17), `packages/sankey/`

under the terms of the Mozilla Public License 2.0.

## Rebuilding

esbuild rather than the package's own vite config, which needs the monorepo root and
leaves svg.js external; here svg.js and svg.panzoom.js are bundled in so the page
needs one script tag and no import map.

`--banner:js` is **not optional**. esbuild's `--legal-comments=inline` keeps only
comments carrying `@license` or `@preserve`, and PowSyBl's copyright header is a plain
`/** */` block — so the build silently strips RTE's notice, which is how the first
vendored copy came to carry none. `banner.js` beside this file restores it.

```bash
git clone --depth 1 -b sankey_bus_splitting \
  https://github.com/powsybl/powsybl-network-viewer.git
cd powsybl-network-viewer/packages/sankey
npm install @svgdotjs/svg.js @svgdotjs/svg.panzoom.js esbuild
./node_modules/.bin/esbuild src/index.ts --bundle --format=iife \
  --global-name=PowsyblSankey --legal-comments=inline \
  --banner:js="$(cat <here>/banner.js)" \
  --outfile=<here>/powsybl-sankey.js
```

After rebuilding, update the commit named under **Source Form** above and in
`banner.js`, and check the version in the table still matches `package.json`.
