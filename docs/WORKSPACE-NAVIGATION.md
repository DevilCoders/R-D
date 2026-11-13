# Workspace navigation and concept workflow

## Sidebar hierarchy

The sidebar is driven by the `navGroups` registry in `src/app.js`. Each group has an `id`, a label, an icon key, and an ordered list of workspace routes. The interface renders each group as a collapsible parent with indented child workspace links.

Current parent groups:

- Global View
- Recon
- Web Intelligence
- Vulnerability
- Operations
- Intelligence
- System
- Reference Library (registered by the Concept Library feature)

Expansion state is persisted in `localStorage` under `rd-nav-expanded`. The group containing the active page is always expanded.

## Register a future workspace group

The runtime exposes `window.DevilEyeNavigation.registerGroup`. A future feature can register routes using this contract:

```js
window.DevilEyeNavigation.registerGroup({
  id: "forensics",
  label: "DIGITAL FORENSICS",
  icon: "knowledge",
  items: [
    ["case-review", "Case Review", "reports"],
    ["artifact-analysis", "Artifact Analysis", "security"]
  ]
});
```

The route IDs must also be registered in the page metadata/rendering layer before they can navigate to a complete workspace. The fourth item field may be `"demo"` for a special action route such as the Concept Library; normal workspace routes use the standard page router.

Use the navigation registry instead of appending custom markup directly to `#sidebar-groups`. This keeps group expansion, active states, indentation, and keyboard focus consistent.

## Add a concept image

1. Add the original image file under `concept/`, preferably using a descriptive filename such as `recon-network-map.png`.
2. Add an entry to `concept/manifest.json`:

```json
{
  "id": "recon-network-map",
  "file": "recon-network-map.png",
  "sequence": 19,
  "title": "Reconnaissance — Network Map"
}
```

3. Commit the image and manifest together.

The Concept Library loads the manifest at runtime, sorts images by `sequence`, and generates the card gallery and full-resolution preview. It accepts PNG file names containing letters, digits, periods, underscores, and hyphens. Images remain separate assets; they are not flattened into a long text list or used as full-page backgrounds.

## Concept-to-workspace implementation

A concept image is a visual specification, not an application route by itself. When implementing a new concept, map its visible controls to:
- a registered workspace route,
- reusable panels and form controls,
- the shared demo action rail,
- local demo API state or a clearly labelled sample-data interaction,
- inspector/detail behavior for selectable map, graph, table, and chart elements.

Every control must have an explicit behavior. Do not leave visible buttons as decorative elements or represent a toast as successful execution. Demo tasks must remain synthetic and must never contact real targets.
