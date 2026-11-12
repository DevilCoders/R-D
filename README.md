# DEVIL EYE / R&D

**Next-Generation Comprehensive Red Team Platform**

An interactive, dark high-tech application prototype for the DEVIL EYE research and authorized security-assessment ecosystem.

> This repository currently contains the frontend prototype and its presentation-layer interactions. It is not a live scanner, exploitation framework, or production security platform. All dashboards, counters, network maps, activities, and records are explicitly illustrative sample data.

## Application prototype

- **Global View:** unified command center, asset relationship map, activity stream, evidence overview, and module health.
- **Top workspaces:** Global View, Targets, Operations, Intelligence, and Threat Feed.
- **Reconnaissance:** Reconnaissance, OSINT Search, Domain Analysis, IP / Port / MAC Analysis, Network Mapping, Social Intelligence, Geolocation, and Tech Stack.
- **Web Intelligence:** Surface Web, Deep Web, and Dark Web source-research workspaces.
- **Vulnerability:** Vulnerability Scan, Exploit Search, and Security Analysis.
- **Operations:** Operations, Post Engagement Review, Privilege Boundary Review, Segmentation Review, and Persistence / Endpoint Control Review.
- **Intelligence:** Intelligence Fusion, Threat Feed, Knowledge Base, and Reports & Evidence.
- **Settings:** local interface preferences and future integration boundaries.

## Technology

- Semantic HTML
- Vanilla JavaScript
- Tailwind CSS v4 build pipeline
- Custom responsive CSS design system
- Browser localStorage for prototype-only preferences and scope records
- GitHub Actions + GitHub Pages deployment

## Run locally

Requirements: Node.js 22+ and npm.

```bash
npm install
npm run build
python3 -m http.server 8080 -d dist
```

Open http://localhost:8080.

For live CSS rebuilding during interface work:

```bash
npm run dev
```

Then serve the project root with a local static server. The production build is created in dist/.

## Prototype interactions

- Switch between every top-level and sidebar workspace.
- Search the local sample records in module tables.
- Use the global search shortcut / to jump into the OSINT workspace.
- Add a scope record to browser-local storage after explicitly confirming authorization.
- Export the current module sample records as JSON.
- Select topology nodes, switch the demo autonomy mode, and adjust local UI preferences.

These actions do not perform network reconnaissance, scanning, exploitation, credential collection, or remote data acquisition.

## Frontend / backend boundary

The UI is intentionally separated from future assessment logic. See docs/FRONTEND-BOUNDARIES.md.

The next implementation stage should replace static demo repositories with typed service adapters and connect them to independently implemented backend services. The frontend should remain a presentation and operator-control layer; authorization, scope enforcement, task execution, evidence integrity, and audit decisions must be enforced by trusted backend components.

## Deployment

A GitHub Actions workflow builds Tailwind CSS v4 and packages the static artifact on pushes to master. To publish the first deployment, open **Settings → Pages → Build and deployment → Source → GitHub Actions** once, then run the workflow from the Actions tab. The integration cannot change this repository-level setting automatically.

Expected Pages URL: https://devilcoders.github.io/R-D/

Check the Actions tab for the latest build/deployment run. The page becomes available once the first successful deployment has completed.

## Safety and data integrity

- Authorized scope is a first-class requirement.
- Out-of-scope assets must be denied by default in the eventual backend.
- Sample values in this UI are not real findings or measurements.
- No live integrations or backend execution services are connected yet.
- No result should be represented as verified unless there is reproducible evidence and source provenance.

---

**DEVIL EYE — Intelligence before action.**
