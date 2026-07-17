# XogArag → Professional BI Workspace Redesign

This is a large, multi-phase rework. To ship it well I'll break it into focused phases and confirm scope before touching code.

## Scope summary

Turn XogArag from an admin-dashboard template into a Linear/Notion-caliber BI **workspace**: users land directly in the app, upload a clean dataset, get auto-suggested KPIs and charts, and build interactive dashboards with a drag-and-drop canvas, filters, insights, and export.

## Phase 1 — Foundation & shell (this iteration)

1. **Remove marketing surfaces**
   - Delete `Landing.tsx` (and its route). Root `/` redirects to `/workspace` (or `/login` if unauthenticated).
   - Strip any hero / pricing / FAQ / testimonial / blog remnants from remaining pages.
2. **New workspace shell** (`WorkspaceShell`)
   - Top: slim command bar (breadcrumbs, global search `⌘K`, dataset switcher, theme, user).
   - Left: collapsible navigation rail (Dashboards, Datasets, Insights, Reports, Settings) — icon-first, expandable.
   - Center: workspace canvas (route outlet).
   - Right: contextual **Inspector** panel (properties / chart config) — collapsible.
   - Bottom: thin status bar (dataset name, row count, last updated, sync state).
   - All side panels resizable (`react-resizable-panels`).
3. **Design system pass**
   - Refine tokens in `index.css`: tighter neutral palette, softer surfaces, elevated `--shadow-panel`, denser radii scale.
   - Typography: keep Inter, tighten scale (12/13/14/16/20/24), tabular numerals for data.
   - Micro-interactions: 120–180ms transitions, framer-motion for panel/inspector.
   - Full light + dark parity.
4. **NadiifiData clean-data banner**
   - Subtle dismissible banner on the upload screen (not a popup, not an ad).
   - Title "Use clean data", short recommendation, secondary link button "Clean Data" → `https://nadiifi-data.vercel.app` (opens new tab).

## Phase 2 — Upload & auto-analysis

- Redesigned drag-and-drop with live parse preview, column type chips, health summary (rows / cols / missing / duplicates / quality).
- Auto-analysis engine (client-side over parsed rows) that classifies columns (numeric / categorical / date / boolean / text) and emits **suggestions**: recommended KPIs, recommended charts, recommended filters.
- "Never start empty" — after upload, user lands on a pre-populated dashboard draft.

## Phase 3 — KPI cards & chart library

- KPI card component with variants (color, icon, format, size) + customization drawer.
- Chart primitives (Recharts): bar, line, area, pie, donut, scatter, histogram, stacked bar/area, treemap, radar, bubble, heatmap, table. Map deferred unless geo columns detected.
- Every chart: legend, tooltip, export (PNG/SVG), enter animation, responsive container.

## Phase 4 — Dashboard builder

- Grid canvas with `react-grid-layout`: move, resize, snap, duplicate, delete, align.
- Save / rename / duplicate / delete dashboards (Lovable Cloud table).
- Recently opened list.

## Phase 5 — Filters, insights, export

- Global filter bar (date, dropdown, search, numeric range, multi-select) wired to all widgets.
- Auto-insights panel (top/bottom category, trend, largest segment) — concise plain-language observations.
- Export: dashboard → PNG/PDF (`html-to-image` + `jspdf`), chart → PNG/SVG, filtered data → CSV, config → JSON.

## Phase 6 — i18n, a11y, polish

- `i18next` with **English + Somali**, persisted preference, instant switch, full UI coverage.
- Keyboard nav, focus rings, ARIA labels, chart alt summaries, contrast audit.
- Loading / empty / error states for every route. Final QA pass on spacing, alignment, overflow, responsive breakpoints.

## Technical notes

- New deps (Phase 1 only for now): `react-resizable-panels`. Later phases will add `react-grid-layout`, `html-to-image`, `jspdf`, `i18next` + `react-i18next`.
- Data model stays on existing Lovable Cloud tables (`datasets`, `dataset_rows`, `dashboards`, `charts`, `insights`, `reports`). Dashboard layout JSON stored on `dashboards.config`.
- No backend schema changes required in Phase 1.

## What I'll do next

If you approve, I'll execute **Phase 1 only** in this turn: remove marketing pages, build the new workspace shell (nav rail + inspector + status bar + command bar), refresh design tokens, and add the NadiifiData clean-data banner on the upload page. Phases 2–6 land in follow-up turns so each is reviewable.

Two quick confirmations before I start:

1. OK to **delete the Landing page entirely** and send `/` straight to the workspace (login-gated)?
2. Keep the existing routes (`/datasets`, `/dashboards`, etc.) but rehome them inside the new `WorkspaceShell`, or collapse to a single `/workspace` route with internal view state? I recommend keeping routes — better URLs, shareable dashboards.
