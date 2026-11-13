# Demo now / production later

## Current state: interactive synthetic demo

The present R&D app is intentionally a complete **demo environment**, not a production security platform.

- All workspaces use synthetic records and simulated state.
- Demo targets can be added freely. No authorization checkbox or real scope gate blocks UI exploration.
- Operation tasks can be created, approved/rejected, simulated and cancelled.
- Live event logging records interface interactions, state transitions and synthetic telemetry pulses.
- Browser-local and local Node.js demo modes share the same frontend contract.
- There are no real scanners, exploit runners, credential modules, OSINT fetchers, Tor/I2P connectors, agents or target network operations.

The demo must never describe synthetic results as verified findings or live target telemetry.

## Later production integration

When real backend services are introduced, keep the UI contract and replace the demo adapter. Candidate service domains include:

| Domain | Current demo | Future production service |
|---|---|---|
| Presentation | HTML, Tailwind CSS v4, Vanilla JS | Same operator UI or evolved client |
| State | Browser localStorage / local Node JSON | Typed repositories and durable database |
| Targets | Unrestricted synthetic target entries | Authenticated asset inventory and authoritative scope |
| Operations | Synthetic task state machine | Isolated scheduler and execution workers |
| Approval | Demo state transitions | Actor-bound approval, expiry and replay controls |
| Evidence | Synthetic metadata and JSON export | Immutable storage, hashes and chain of custody |
| Audit | Local event array / JSON log | Tamper-resistant audit service |
| Intelligence | Sample catalogues and synthetic feeds | Provenance-aware source ingestion and correlation |

Production security controls belong in trusted backend services, not in browser-only UI logic. They are intentionally not enforced by the demo frontend.

## Non-negotiable production properties for the later backend

1. Authenticate and authorize every actor and service.
2. Enforce exact engagement scope server-side; deny unknown, expired and excluded assets by default.
3. Bind approvals to the exact action, actor, scope, expiry and replay protection.
4. Isolate workers and constrain delegated tasks to the same policy.
5. Preserve evidence hashes, provenance, timestamps and chain of custody.
6. Make cancellation and terminal state transitions explicit and auditable.
7. Distinguish sample/demo data from verified findings in storage and presentation.
8. Audit authorization, approvals, execution, cancellation, export and evidence transitions.

These are future production requirements; they must not disable any synthetic demo workflow today.
