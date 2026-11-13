# DEVIL EYE / R&D

**Full interactive application demo — not a landing page.**

DEVIL EYE R&D is an app-style operator workspace prototype built with HTML, Vanilla JavaScript and Tailwind CSS v4. Every workspace is designed to behave like an application: panels, navigation, search, filters, inspectors, synthetic records, operations, live event history and exports are interactive.

## Run the local demo

Requirements: Node.js 22+ and npm.

```bash
npm install
npm run demo
```

Open **http://127.0.0.1:4174**. This builds the frontend and starts the local Node.js demo API. Demo state persists in `server/data/demo-state.json`.

## Demo controls

- **Navigation:** collapsible parent groups with nested pages; current section highlighting; workspace selector menu with Research Environment, Red Team Lab, OSINT Research, Threat Intelligence and Evidence Review.
- **Command search:** press `/` or `Ctrl+K` to open global search. Search workspace destinations and sample records, then navigate directly to the selected result.
- **Shared workspace rail:** Add target, Add observation, Create task, Filters, Live log, Export and Refresh controls on workspace pages.
- **Targets and records:** Add synthetic demo targets without a confirmation gate; create, inspect, update and delete demo observations.
- **Operations:** create tasks, approve or reject them, run a synthetic simulation, cancel tasks and review the outcome.
- **Live event stream:** every UI interaction and state change is recorded. Synthetic telemetry pulses are emitted periodically and displayed in every workspace.
- **Research panels:** table search/filter, row inspection, selectable network graph nodes, map markers, port selectors, technology cards, workflow stages, checklist toggles and review inspectors.
- **Concept Library:** 19 original references loaded from `concept/manifest.json`; add a PNG and manifest entry to extend the gallery.
- **Preferences:** compact tables, reduced motion and demo-banner visibility persist in the browser.
- **Exports:** workspace state can be exported as JSON. The demo store can be reset from Settings.

## Demo-only behavior

All target entries, observations, task execution, feed updates, telemetry, map markers and findings are synthetic. The demo does not send network probes, scan hosts, execute exploits, collect credentials, query external OSINT, connect to Tor/I2P, or launch agents. "Run simulation" advances a local demo task through a synthetic lifecycle and produces a mock outcome only.

There is intentionally **no production scope gate** in the demo. Add, edit, inspect and remove sample targets freely. This does not grant or imply authorization for real-world testing; no real target interaction exists in this build.

## Local backend vs GitHub Pages

- `npm run demo`: local Node.js API with persistent JSON state in `server/data/demo-state.json`.
- GitHub Pages: static frontend using a browser-localStorage demo adapter. Pages cannot host the Node.js API, so data is local to that browser/profile.

Both modes expose the same UI behavior and label the active demo mode in the header.

## Concepts, map and architecture

The original concept references are stored unchanged in `concept/0.png` through `concept/18.png`. Browse them through **Concept Library**. New images are added through `concept/manifest.json`.

The gray world political map is a local SVG generated from Natural Earth 1:110m country boundaries; license and source details are in `assets/WORLD-MAP-SOURCE.txt`.

The sidebar and future module integration process is documented in `docs/WORKSPACE-NAVIGATION.md`. Demo UI control coverage is in `docs/DEMO-INTERACTIONS.md`; API behavior is in `docs/DEMO-BACKEND.md`.

## Build and tests

```bash
npm run check
npm run build
npm run smoke
```

GitHub Actions runs syntax checks, Tailwind CSS v4 build, backend/browser-adapter smoke tests, concept asset checks and then deploys the static application to:

**https://devilcoders.github.io/R-D/**

## Future production integration

The frontend is deliberately an interactive demo boundary. Later, production business logic can be moved into Rust, C++, Python or other services behind versioned API contracts. The real backend must own identity, real authorization, scope enforcement, approvals, execution isolation, evidence integrity and production audit. Those are future engineering tasks, not simulated capabilities hidden behind this demo.

**DEVIL EYE — Intelligence before action.**