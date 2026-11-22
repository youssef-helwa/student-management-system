# Student Management System — Frontend

A native **Electron + React** desktop frontend for a multi-branch student
management system. This package is **UI only** — no backend, database,
authentication, QR logic, or email sending is implemented. Every screen is
wired to a placeholder service that returns mock data through a promise, so
it's a drop-in replacement point for your real Node.js API.

## Running it

Requires Node.js 18+.

```bash
npm install

# Run the app in development (hot-reloading React + Electron window)
npm run electron:dev

# Or just run the React app in a regular browser tab (faster iteration on UI)
npm run dev

# Build the production bundle
npm run build

# Package a distributable desktop app (installer)
npm run electron:build
```

`npm run electron:dev` starts the Vite dev server and then launches the
Electron window pointed at it. `npm run dev` alone is often faster while
you're only touching React components, since you can use the browser's
dev tools directly.

## Project structure

```
electron/               Electron main process + preload (native window shell only)
src/
  components/
    common/              Generic reusable UI: Modal, DataTable, Badge, Avatar,
                          StatCard, Tabs, PillTabs, SearchInput, ConfirmDialog…
    layout/              Sidebar, Topbar
    dashboard/            Dashboard-specific pieces (GradeSelector)
    students/             Student-specific pieces (StudentForm, QrCodeTile)
    attendance/           CallParentDialog (absence follow-up)
    exams/                ExamForm
    users/                UserForm, PermissionMatrix
  layouts/               MainLayout (sidebar+topbar shell), AuthLayout (login/branch select)
  pages/                 One folder per screen from the spec (Dashboard, Students,
                          Attendance, Exams, Results, Payments, Reports,
                          Notifications, Users, Settings, ActivityLog, EndOfDaySummary…)
  context/               AuthContext, BranchContext, ThemeContext (React Context, not Redux)
  hooks/                 useAsync (data-fetching pattern), useDebounce, useOnClickOutside
  services/               Placeholder "API" layer — see below
  data/mock/              Mock JSON data consumed by the services
  utils/                  formatters.js, constants.js, permissions.js
  styles/                 tokens.css (design tokens/theme variables), global.css
```

## Connecting your Node.js backend

Every file in `src/services/` is a thin wrapper that currently reads from
`src/data/mock/*.json` and resolves after a simulated delay
(`src/services/mockClient.js`). Pages and components only ever call these
service functions — they never import mock data directly. To connect a
real backend:

1. Replace the body of each function in `src/services/*.js` with a real
   `fetch`/`axios` call to your API. The function **signatures and return
   shapes are already what the UI expects**, so no component code should
   need to change.
2. Swap `mockRequest()`/`mockError()` in `mockClient.js` for your actual
   HTTP client (or delete it once every service file has been migrated).
3. Authentication: `src/context/AuthContext.jsx` calls
   `services/authService.js` and stores the logged-in user in
   `sessionStorage` for the session. Point `login()` at your real auth
   endpoint and store whatever token shape you need.
4. Branches, permissions, and role checks are UI-only placeholders in
   `src/utils/permissions.js` — treat your backend as the source of truth
   for real authorization; the frontend checks are for UX only (hiding
   nav items, disabling switches), not security boundaries.
5. QR scanning, email sending, report generation, and backups are
   represented as UI states/buttons only (see `Attendance.jsx`,
   `Settings.jsx`, `EndOfDaySummary.jsx`) — wire them up to IPC calls
   (via `electron/preload.js`) or HTTP calls to your backend as needed.

## Design system

Colors, spacing, radii, shadows, and typography are defined as CSS custom
properties in `src/styles/tokens.css`, with light/dark values switched via
`[data-theme]` on `<html>` (see `ThemeContext.jsx`). Reusable component
classes (`.btn`, `.card`, `.table`, `.badge`, `.modal`, `.stat-card`, etc.)
live in `src/styles/global.css`. New screens should compose these existing
classes rather than introducing one-off styles, to keep the app visually
consistent.

Each branch (city) has an identity color (`--branch-cairo`,
`--branch-ismailia`, etc., defined in `tokens.css`) used for the small
colored dot next to its name throughout the app, so users can orient
themselves quickly when switching branches.

## What's intentionally NOT implemented

Per the spec, the following are UI-only and will no-op or show a
placeholder: authentication/authorization, QR code generation/scanning,
email sending, PDF/report generation, database persistence beyond the
current browser session, backup/restore. Search the codebase for
"UI only" / "placeholder" comments to find every such spot.
