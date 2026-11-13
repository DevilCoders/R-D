# Demo UI interaction map

Every workspace uses the shared demo action rail and the live synthetic event stream.

## Global chrome

| Control | Behavior |
|---|---|
| Sidebar group header / chevron | Expand or collapse its child routes. Explicit collapsed state is preserved, even for the active route. |
| Workspace selector arrow | Opens a menu for Research Environment, Red Team Lab, OSINT Research, Threat Intelligence and Evidence Review. |
| Top navigation | Routes to Global View, Targets, Operations, Intelligence and Threat Feed. |
| Search field | Type to see workspace and sample-record suggestions. Select a result to navigate. |
| `/` and `Ctrl+K` | Focus the global command search and open quick destinations. |
| Clock / status badge | Updates locally and reports whether local Node API or browser-local demo mode is active. |
| Mobile menu button / scrim | Opens or closes the responsive sidebar. |

## Shared workspace rail

| Control | Behavior |
|---|---|
| Add target | Opens a form and adds a synthetic target record. No real target is contacted. |
| Add observation | Adds a synthetic workspace record. |
| Create task | Opens a task form and adds a task to the workflow queue. |
| Filters | Shows/hides reusable All, Verified, Review and High/Critical chips for the workspace table. |
| Live log | Opens the full synthetic audit/event log. |
| Export | Downloads current demo state as JSON. |
| Refresh | Re-reads the demo store and refreshes the task queue, records and event stream. |

## Data and panels

Tables support row inspection. Search fields filter local sample records. OSINT source chips filter sample rows by source category. Map markers, topology nodes and port buttons update their inspectors. Technology cards, metrics, workflow rows, checklist rows, activity rows and other reviewable panel surfaces open an inspector that records the action in the event log.

Operator-created records can be inspected, marked reviewed and deleted. Target records use the same synthetic CRUD behavior.

## Operations

Create task → Approve or Reject → Run simulation → Completed, or Cancel. A simulation writes a mock progress/result summary and audit events; it never starts a real tool or network action.

## Live event stream

A live log panel appears at the bottom of every workspace, including Concept Library. Clicks, input changes and demo state transitions are recorded. A synthetic telemetry pulse is appended every 12 seconds to make the demo appear active even when no operator action occurs.

## Settings

- Compact tables: changes table density.
- Motion effects: enables/disables CSS transitions.
- Show demo data banners: adjusts visibility of demo labels.
- Reset demo state: clears the local Node/browser demo store and target-list cache.
