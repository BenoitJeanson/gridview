# Vendored

`powsybl-sankey.js` — a self-contained IIFE bundle (global `PowsyblSankey`) of
[`@powsybl/sankey`](https://github.com/powsybl/powsybl-network-viewer/tree/sankey_bus_splitting/packages/sankey),
the TypeScript/SVG port of [SankeyPF.jl](https://github.com/CRESYM/sankeypf). MPL-2.0.

Built with esbuild rather than the package's own vite config, which needs the
monorepo root and leaves svg.js external; here svg.js and svg.panzoom.js are
bundled in so the page needs one script tag and no import map.

To refresh:

    git clone --depth 1 -b sankey_bus_splitting \
      https://github.com/powsybl/powsybl-network-viewer.git
    cd powsybl-network-viewer/packages/sankey
    npm install @svgdotjs/svg.js @svgdotjs/svg.panzoom.js esbuild
    ./node_modules/.bin/esbuild src/index.ts --bundle --format=iife \
      --global-name=PowsyblSankey --legal-comments=inline \
      --outfile=<here>/powsybl-sankey.js
vendored from 0873dd1 2026-07-17 13:31:20 +0200
