# afmetrics.com

US demographics, religion, elections, cost of living, immigration enforcement, and work-visa data by state and county.

Built with Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui, Recharts, and d3-geo + TopoJSON.

> This Next.js version has breaking changes from older releases. Read the guides in `node_modules/next/dist/docs/` before changing routing, fonts, or data APIs (see `AGENTS.md`).

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm test         # Vitest unit tests (src/**/*.test.ts)
npm run build
```

## Layout

| Path | What lives there |
| --- | --- |
| `src/app/` | Routes: `/` (US), `/states`, `/united-states/[state]/[county]`, `/work-visas`, `/you`, `/methodology`, `/research/...`, plus `sitemap.ts`, `robots.ts`, and OG images |
| `src/components/maps/` | Shared map pieces: `CountyChoropleth`, legends, `MapStatus`, the state map |
| `src/components/layout/` | `Section`, `StatTile`, `ChartCard`, `SourceNote` |
| `src/components/` | Maps, charts, and tables. `ui/` holds the shadcn primitives |
| `src/lib/` | Domain logic: data access, formatting, map view/query parsing |
| `src/data/` | Generated JSON imported at build time (server and client bundles) |
| `public/data/` | Generated JSON fetched by the client maps at runtime |
| `public/geo/` | TopoJSON shapes for the US, states, and counties |
| `scripts/` | Generators for everything in `src/data/`, `public/data/`, and `public/geo/` |

## Data pipeline

Every generated file is produced by a script in `scripts/`. Each script's docstring or header comment lists its sources, its outputs, and any adjustments. Downloads are cached in `scripts/.cache` (gitignored), so reruns are offline.

```bash
python3 scripts/build-states-data.py          # state population history -> src/data/states.json
python3 scripts/build-county-history.py       # county population history -> public/data/county-history.json
python3 scripts/build-county-election-2024.py # 2024 county results -> public/data/county-election-2024.json
python3 scripts/build-county-religion.py      # ARDA religion census -> public/data/county-religion.json
python3 scripts/build-cost-of-living.py       # ACS + BEA RPP -> src/data/state-cost.json, county-cost.json
python3 scripts/build-county-visas.py         # DOL LCA/PERM filings -> public/data/county-visas*.json
python3 scripts/build-school-visas.py         # filings by university -> public/data/school-visas.json
python3 scripts/build-field-citizenship.py    # ACS citizenship by field -> src/data/field-citizenship.json
python3 scripts/build-state-generation-pop.py # ACS population by generation -> src/data/state-generation-pop.json
node scripts/build-county-topos.js            # per-state county shapes -> public/geo/<abbr>-counties-10m.json
node scripts/build-ct-regions-topo.js         # Connecticut planning regions -> public/geo/ct-planning-regions-*.json
```

When you change a dataset, update its entry in `src/lib/datasets.ts` (source, vintage, `updated` date). The methodology page, source notes, map captions, and the footer's "data last updated" date all read from it.

## Colors

The site is always dark (`dark` is fixed on `<html>`); the light tokens serve the PDF export and the maps, which render light-on-black. Map colors are fixed, with no picker. Data colors live in `src/lib/palette.ts` (hex, for the maps and exports) and are mirrored as CSS tokens in `src/app/globals.css` (`--chart-1..8`, `--party-*`, `--cost-*`, `--visa-*`, `--religion-*`). `src/lib/palette.test.ts` fails if the two drift. Client code loads JSON from `public/` through `useJson` / `loadJson` in `src/lib/fetch-json.ts`, which fetches each file once per page load.

## Deploy

The site deploys on Vercel from `main`. `next.config.ts` holds permanent redirects for legacy URLs, including the removed `/europe` section (sent to `/`). Those lists are frozen.
