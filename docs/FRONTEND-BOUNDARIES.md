# Frontend / backend boundary

The HTML / JavaScript app is the operator interface. Production business logic can live in Rust, C++, Python or other selected languages behind versioned API contracts.

| Domain | Demo implementation | Production responsibility |
|---|---|---|
| Presentation | HTML, Tailwind CSS v4, custom CSS | Accessible operator interface |
| State | Browser adapter + local Node API | Typed repositories / durable DB |
| Scope | Explicitly confirmed demo records | Trusted scope registry and authorization |
| Operations | Approval state machine (demo) | Policy-gated scheduler / isolated workers |
| Evidence | Synthetic metadata / JSON exports | Immutable storage, hashes, chain of custody |
| Audit | Demo transition log | Tamper-resistant audit service |

## Production invariants

1. Scope authorization is server-authoritative.
2. Deny unknown, expired, ambiguous and excluded assets by default.
3. Approval binds to the exact action, actor, scope, expiry and replay protection.
4. Delegated workers inherit policy; delegation cannot bypass controls.
5. Preserve evidence hashes, source provenance, timestamps and chain of custody.
6. Sample data must never be displayed as verified findings.
7. Support safe cancellation and explicit transition states.
8. Audit authorization, approval, execution, cancellation, export and evidence transitions.

The local Node service persists synthetic state only. It has no scanner, exploit runner, external OSINT client, credential module, hidden-service integration, or agent execution. It is not a production security boundary.
