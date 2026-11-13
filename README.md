# DEVIL EYE / R&D

**Interactive application prototype with local demo services.**

This is an app-style operator workspace, not a marketing landing page. It has dedicated workspaces for Global View, Targets, Reconnaissance, OSINT, domain and network analysis, social intelligence, geolocation, technology stack, web intelligence, vulnerability review, operations, intelligence fusion, threat feeds, knowledge, evidence and reports.

## Run the complete local demo

Requirements: Node.js 22+ and npm.

```bash
npm install
npm run demo
```

Open **http://127.0.0.1:4174**. This builds the Tailwind CSS v4 frontend and starts the local Node.js demo API. State persists in `server/data/demo-state.json`.

## Demo functionality

- Dedicated routes for every sidebar workspace.
- Search, status filters, record inspection and JSON export.
- Concept Library with 19 original PNG references in `concept/`.
- Complete gray world political map with country boundaries and interactive synthetic markers.
- OSINT source filtering over a local sample dataset.
- Add demo observations and scope records (scope requires explicit confirmation).
- Create demo tasks, approve/reject, cancel and inspect state.
- Audit events and local state reset.
- Selectable network, map, port and intelligence graph points.
- Persistent UI preferences and API mode indicator.

All data are synthetic. The demo never sends network probes, scans targets, executes exploits, collects credentials, queries external OSINT, connects to Tor/I2P, or launches agents.

## Navigation and concept workflow

The sidebar uses collapsible parent groups with nested workspace routes. The same navigation registry is exposed through `window.DevilEyeNavigation` so future modules can register under a parent group instead of adding one-off menu code. The Concept Library reads `concept/manifest.json`; adding an image file and a manifest entry adds it to the gallery automatically. See `docs/WORKSPACE-NAVIGATION.md`.

## Demo backend

See `docs/DEMO-BACKEND.md`. The local server uses Node built-in modules and binds to loopback by default. GitHub Pages cannot run Node.js; its frontend falls back to browser localStorage and labels that mode in the header.

## Map and visual references

The original concept references are organized unchanged in `concept/0.png` through `concept/18.png`; browse them through **Concept Library**. The world map SVG was generated from Natural Earth 1:110m country boundaries, CC0 1.0; see `assets/WORLD-MAP-SOURCE.txt`.

## Build

```bash
npm run build
```

GitHub Actions creates the static Pages artifact at https://devilcoders.github.io/R-D/. Pages serves only the frontend; the local Node API runs only when you start `npm run demo`.

## Production boundary

The frontend is a presentation/control layer. Authentication, scope enforcement, approvals, agent isolation, execution, evidence integrity and production audit must be implemented by trusted backend services. See `docs/FRONTEND-BOUNDARIES.md`.

**DEVIL EYE — Intelligence before action.**