# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pool occupancy dashboard for swimming facilities in Brno, Czech Republic. Displays real-time occupancy, pool status, and historical heatmap analytics. Deployed as a static site to GitHub Pages. All times are in Europe/Prague timezone.

## Commands

```bash
npm run dev           # Start dev server (localhost:3000)
npm run build         # Production build
npm run generate      # Generate static site for deployment
npm run preview       # Preview production build

npm run test          # Vitest in watch mode
npm run test:run      # Vitest single run
npm run test:ui       # Vitest with UI

npm run lint          # ESLint with auto-fix
npm run lint:check    # ESLint check only
npm run format        # Prettier format
npm run format:check  # Prettier check
```

## Architecture

**Nuxt 3 SPA** (SSR disabled) with Pinia state management, Nuxt UI components, and i18n (Czech default, English secondary). Strategy is `no_prefix` — no locale in URLs.

**Data flow:** External pool config JSON → `PoolStore.loadPoolsConfig()` → per-pool JSON files (overall + weekly) fetched via `useFetch` → processed by `HeatmapDataProcessor` class → rendered by Vue components.

**Key files:**

- `stores/pool.ts` — Central Pinia store: pool selection, occupancy data, view settings (viewMode, metricType, heatmapHighThreshold, showOpenLanes)
- `utils/heatmapDataProcessor.ts` — Pure class transforming raw occupancy maps into cell data (color, fill ratio, display text, lane data) for heatmap rendering
- `utils/heatmapColorProcessor.ts` — Threshold-based color assignment for utilization rates
- `utils/dateUtils.ts` — Prague timezone helpers (`nowInPrague`, `getWeekId`, `isDayToday`)
- `types/pool.ts` — All TypeScript interfaces (`PoolConfig`, `OverallJson`, `WeeklyJson`, etc.) and constants (`VIEW_MODES`, `METRIC_TYPES`, `UTILIZATION_COLORS`)

**Heatmap system:** `Heatmap.vue` orchestrates, delegates cell rendering to `HeatmapGrid` → `HeatmapCell`/`HeatmapLaneCell`. Data resolution goes through `getCellData()` which selects the right `HeatmapDataProcessor` method based on `viewMode` × `metricType` combination.

**View modes × metrics:**

- Overall: average, weightedAverage, median
- Weekly: percentage, minMax, average

**Pool config** comes from an external JSON URL (`VITE_POOL_OCCUPANCY_CONFIG_URL`). Each pool entry contains data paths for occupancy raw/overall/weekly JSON and capacity CSV. Env vars use `VITE_` prefix (Vite convention, not `NUXT_`).

**Auto-refresh:** The index page refreshes all data every 120 seconds and reloads pool config to pick up `todayClosed` changes.

**Layout:** Sidebar (`AppSidebar`) with pool navigation, header, footer. Responsive — sidebar collapses on mobile, desktop has hover-expand.

## Testing

Tests are in `tests/unit/` using Vitest with `globals: true`. Test files follow the pattern `tests/unit/**/<module>.test.ts`. The vitest config aliases `~` and `@` to project root to match Nuxt's auto-imports.

## Deployment

Push to `main` triggers GitHub Actions (`deploy.yml`) which runs `npm run generate` and deploys to GitHub Pages. The `baseURL` in `nuxt.config.ts` is set to `/pool-occupancy-dashboard-nuxt/` in production. GitHub Actions secrets `VITE_POOL_OCCUPANCY_CONFIG_URL` and `VITE_DATA_BASE_URL` must be configured.
