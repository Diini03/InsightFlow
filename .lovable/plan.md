# XogArag → Data Storytelling & Report Builder

Complete pivot. XogArag is no longer a BI/analytics dashboard — it's a **report, presentation, and carousel builder** for analysts who already have charts/KPIs from tools like NadiifiData. Think Canva-for-data + Notion-for-reports.

This is a large multi-phase rebuild. I'll ship it in reviewable phases rather than all at once, so each phase is stable and testable.

---

## Phase 1 — Foundation shift (this turn)

Reframe the entire app around **projects (reports)** instead of datasets/dashboards.

1. **New IA & routing**
   - `/` → Home (Start experience: recent projects, templates, "New report").
   - `/editor/:projectId` → the editor (canvas + panels).
   - `/present/:projectId` → fullscreen presentation mode.
   - Keep `/login`, `/register` (optional; guest mode is default).
   - Remove/park BI routes: `/datasets`, `/dashboards`, `/analytics`, `/reports` (old), `/visualizations`. They still exist as files but are unlinked; deleted in phase 2.
2. **Editor shell** (`EditorShell`)
   - Top: command bar (project title inline-edit, undo/redo, zoom, preview, present, export, share).
   - Left: **Project Explorer** — pages/slides list, drag-reorder, add page, duplicate, delete.
   - Center: **Canvas** — paged (A4 / 16:9 / 1:1 carousel) with rulers, guides, snap grid, zoom.
   - Right: **Properties panel** — contextual (element or page properties).
   - Bottom: **Page navigator** — thumbnail strip with add/reorder.
   - All resizable via `react-resizable-panels`.
3. **Home / Start experience**
   - Replace dashboard as landing. Sections:
     - Create new: template grid (Executive, Business, NGO SitRep, Research, Monthly, Annual, Marketing, Case Study, LinkedIn Carousel, Instagram Carousel, Presentation, Blank).
     - Recent projects (local + cloud once signed in).
     - Import: charts image, KPI JSON, CSV, dashboard screenshot.
4. **Project model + local persistence**
   - Zustand store: `Project { id, name, type, pages: Page[], theme }`; `Page { id, size, background, elements: Element[] }`; `Element { id, type, x, y, w, h, rotation, z, props }`.
   - Element types (phase 1): `heading`, `text`, `image`, `shape`, `divider`, `kpi`, `chart-placeholder`.
   - Persist to `localStorage` under `xogarag.projects`. Cloud sync in phase 4.
5. **Design system pass**
   - Refresh tokens for a "creative software" feel (Linear/Figma-inspired): deeper neutrals, softer panels, floating toolbars, 8pt spacing scale, tabular-nums for stats, subtle motion (120–180ms).
   - Update `index.css` + component variants; no hardcoded colors.

**Deliverable at end of phase 1:** users can open the app, pick a template or blank, land in the editor with a working canvas, add/edit text + KPI + shape/image elements, reorder pages, and see it persist across reloads. Export/present come next phase.

---

## Phase 2 — Editor depth

- Rich text editing (Tiptap): bold, italic, underline, lists, links, alignment, headings, highlight, code.
- Full element library: paragraph, chart (SVG placeholder + upload), table, icon (lucide picker), quote, callout, stats block, key findings block, recommendations block, logo, header/footer, page numbers.
- Selection: multi-select, group, align, distribute, layer order, lock.
- Snap-to-grid + smart guides, keyboard nudge, copy/paste, duplicate, undo/redo history.
- Zoom controls (fit, 50/100/200%, ⌘±).
- Delete unused old BI pages/components.

## Phase 3 — Templates & carousel builder

- 10+ real templates per report type (Corporate, Minimal, Modern, Dark, Research, NGO, Startup, Financial, Presentation, Carousel).
- Carousel builder specialization: 1:1 slide size, cover/numbered pages, large-stat layouts, LinkedIn/Instagram presets.
- Theme system: colors, fonts, spacing tokens per project, one-click restyle.

## Phase 4 — Export, present, auth & cloud

- Export: PNG/JPEG per page (`html-to-image`), PDF (`jspdf` + multipage), PPTX (`pptxgenjs`), HTML, Markdown.
- Presentation mode: fullscreen, keyboard nav, presenter view.
- Auth (Lovable Cloud): email/password + Google, guest mode default, restore projects on sign-in.
- Cloud project storage table + RLS.

## Phase 5 — Polish

- i18n EN/SO with `i18next`, instant switch, persisted.
- A11y pass: focus rings, ARIA, keyboard shortcuts panel.
- Loading / empty / error states across all surfaces.
- Responsive: desktop-first, tablet full editor, mobile view + light edit.
- Final visual QA — spacing, alignment, overflow.

---

## Technical notes

- New deps phase 1: none required beyond what's installed (`react-resizable-panels`, `zustand` if not present, framer-motion). Phase 2 adds Tiptap. Phase 4 adds `html-to-image`, `jspdf`, `pptxgenjs`.
- No backend schema changes in phase 1. Phase 4 introduces a `projects` table (id, owner, name, type, data jsonb, updated_at) with RLS.
- Old BI files remain in-repo during phase 1 (unlinked) to keep the diff reviewable; deleted in phase 2.

---

## What I'll do next

If you approve, I execute **Phase 1 only** this turn:

1. New Home page (templates + recent projects).
2. New `/editor/:id` route with `EditorShell` (project explorer, canvas, properties panel, page navigator, command bar).
3. Zustand project store with localStorage persistence.
4. Basic element rendering + editing (heading, text, KPI, shape, image) with drag/resize on canvas.
5. Route + shell cleanup so the app opens directly into the new experience.

Phases 2–5 land in follow-up turns. Confirm and I'll build.
