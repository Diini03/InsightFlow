# InsightFlow — Production Polish Pass

Systematic audit + refinement across the existing app. No new features; every change raises fit, finish, and consistency to commercial BI quality.

## 1. Brand mark (replace wordmark logo)

- Design a custom SVG logo mark: stacked ascending bars fused with a flowing line node (analytics pulse). Two-tone using `--primary` + `--primary-hover`, works on light/dark.
- New `src/components/common/Logo.tsx` (accepts `size`, `withWordmark`).
- Use icon-only in sidebar header + top nav. Use full lockup on Landing, Login, Register, 404, browser title/favicon.
- Update `index.html` title/description, replace `public/favicon.ico` with SVG favicon.

## 2. Design system hardening (`index.css`, `tailwind.config.ts`)

- Introduce spacing scale doc + shadow tokens: `--shadow-xs/sm/md/lg/xl` (currently only 3). Standardize radii: card=`--radius-lg` (14px), control=`--radius-md` (10px), chip=`--radius-sm` (6px).
- Add semantic chart palette tokens (`--chart-1..8`) and success/warning/info soft variants used by KPI states.
- Type ramp utilities: `text-display`, `text-h1..h4`, `text-body`, `text-caption`, `text-overline` mapped in Tailwind. Enforce tabular-nums on metrics.
- Motion tokens: `--ease-out`, `--duration-fast/base`, unify Framer + CSS transitions.

## 3. AppShell + navigation

- Sidebar: grouped sections (Overview / Data / Analyze / Configure), section labels, icon alignment fixed, active state uses left indicator + soft bg, collapsed mode shows tooltips (already partly wired — verify), min tap target 40px.
- Topbar: constrain height, search shrinks on mobile to icon-trigger, keyboard shortcut hint `⌘K`, sticky with subtle border/backdrop only when scrolled.
- Mobile: sidebar becomes offcanvas sheet; hamburger visible.
- Add breadcrumbs slot below topbar for nested routes (Datasets / [name]).

## 4. Page-by-page audit + fixes

Each page gets: consistent `PageHeader`, container max-width, spacing rhythm (`space-y-6`), skeleton loaders, empty states, error boundaries.

- **Landing**: tighten hero grid, fix mobile stacking, unify CTA sizing, add feature icons with brand mark motifs.
- **Login / Register**: same card scale, better field spacing, inline validation, disabled + loading button states, Google btn parity.
- **Dashboard**: reorganize into 4 zones — KPI row (4 cards, not 10), Trends (area + bar in 2-col grid), Attention (insights + activity), Quick Actions. Add "What needs attention" callout card. KPI cards get sparkline slot.
- **Datasets** list: TanStack Table polish — sticky header, sort, search, column visibility menu, row hover, pagination footer, filename truncation with tooltip, quality-score badge.
- **DatasetNew** upload: animated dropzone states (idle / hover / uploading / success / error), progress bar, per-file validation messages, schema preview panel.
- **DatasetDetails**: tabs (Overview / Schema / Preview / AI Insights), sticky action bar, fix table overflow with horizontal scroll container, AI summary loading skeleton.
- **Notifications**: grouped by date, unread indicator, mark-all-read, empty state.
- **Profile / Settings**: sectioned cards, form field grid, save bar with dirty-state detection.
- **Analytics / Reports / Dashboards / Visualizations** (Phase 2 placeholders): upgrade `ComingSoonPage` to a richer teaser with feature checklist + waitlist CTA — feels intentional, not stub.
- **NotFound**: brand-consistent, illustration, home CTA.

## 5. Charts (Recharts)

- Shared `ChartContainer` wrapper: responsive, aspect-ratio locked, header (title + actions), legend row, tooltip theme, empty + loading states.
- Use palette tokens; add gridline muted color; format axis with `nFormatter`; tooltip uses card bg + border + shadow-md.
- All charts wrapped in `ResponsiveContainer` with min-height so they don't collapse; overflow-hidden on parents.

## 6. Tables

- Extract `DataTable` primitive (TanStack) with props for columns, data, search, pagination, empty, loading. Reused by Datasets and Dataset preview. Sticky header, `overflow-x-auto` wrapper, min-width on cells.

## 7. Forms + inputs

- Standard `Field` wrapper: label, control, hint, error. Zod + react-hook-form on Login/Register/Profile. Consistent 40px control height, focus ring using `--ring`.

## 8. Micro-interactions

- Card hover: subtle `translate-y-[-1px]` + shadow-md → lg. Buttons: 150ms ease-out. Route transitions: fade-in on `<Outlet />`. Skeleton shimmer already exists — apply consistently.

## 9. Accessibility

- `aria-label` on every icon-only button (sidebar trigger, notification bell, theme toggle, avatar menu, chart action buttons).
- Single `<main>` per route (already via AppShell — verify).
- Focus-visible rings on all interactive elements.
- `h-dvh` instead of `h-screen` where used.
- Color contrast: audit muted-foreground on cards; bump if under 4.5:1.

## 10. Error + empty states

- Global `ErrorBoundary` around `<Outlet />` with friendly copy + retry.
- Toast copy pass: replace raw supabase error strings with human messages (upload failed, network, auth).
- Empty states: illustration + one-line reason + primary CTA on Datasets, Notifications, DatasetDetails preview.

## 11. Performance

- Lazy-load route components with `React.lazy` + Suspense fallback = page skeleton.
- Memoize KPI computations and chart data transforms.
- Virtualize dataset preview table if row count > 200.

## Technical notes

- No schema changes, no new routes, no feature scope changes.
- All color values stay HSL tokens in `index.css`; no hardcoded hex/tw color utilities in components.
- Preserve existing edge function + auth flow.
- Keep bundle: don't add new heavy deps; reuse `lucide-react`, `recharts`, `@tanstack/react-table`, `framer-motion` already present.

## Out of scope (Phase 2)

Full Analytics module, Report builder, Dashboards builder, Visualization playground — remain polished "Coming soon" pages.
