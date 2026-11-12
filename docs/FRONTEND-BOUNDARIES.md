# Frontend Integration Boundary

## Purpose

The current HTML / JavaScript application is the **operator interface prototype**, not the implementation of the assessment engine. It is structured so that future services can be implemented in Rust, C++, Python, or other project-selected languages without replacing the UI layout and interaction model.

## Current layers

| Layer | Current implementation | Future responsibility |
|---|---|---|
| Presentation | index.html, Tailwind CSS v4, custom CSS | Render screens, accessible controls, responsive layout |
| Navigation | src/app.js route metadata | Route state, workspace lifecycle, deep links |
| Demo state | In-memory sample records | Replace with typed API responses |
| Local preferences | browser localStorage | User preference service / profile storage |
| Scope demo | Browser-local list | Trusted scope registry and authorization service |
| Actions | Explicit prototype notifications | Calls to authenticated, policy-enforced backend APIs |
| Build / delivery | Tailwind CLI + GitHub Actions | Static UI artifact deployment |

## Intended service boundaries

The frontend should consume typed contracts. It must not become the trusted authority for security-sensitive decisions.

| Contract / resource | Required fields (initial outline) |
|---|---|
| Workspace | id, name, owner, status, created_at |
| Engagement | id, workspace_id, authorization_reference, start_at, end_at, status |
| ScopeAsset | id, engagement_id, canonical_identifier, asset_type, inclusion_state, owner_reference |
| Observation | id, asset_id, source_id, observed_at, collected_at, method, raw_artifact_reference |
| Finding | id, title, severity, confidence, affected_assets, validation_state, evidence_ids |
| EvidenceArtifact | id, sha256, media_type, size, captured_at, source, chain_of_custody |
| Operation | id, engagement_id, task_contract, policy_decision, state, approval_id |
| Approval | id, exact_action_digest, requester, reviewer, decision, expires_at, consumed_at |
| IntelligenceEntity | id, entity_type, canonical_value, provenance_refs, confidence |
| IntelligenceRelation | id, subject_id, predicate, object_id, provenance_refs, confidence |
| Report | id, engagement_id, version, evidence_manifest, approval_state, export_reference |

All timestamps should be timezone-aware UTC values. Identifiers should be stable and opaque. API contracts should be versioned.

## Security invariants for the eventual backend

1. **Scope is server-authoritative.** The UI may display scope, but it cannot grant authorization.
2. **Deny by default.** Unknown, expired, ambiguous, or excluded assets must not be treated as in scope.
3. **Approval binds to an exact action.** Approval should include an action digest, actor, scope, expiry, and replay protection.
4. **Delegation does not bypass policy.** Every agent, worker, tool, and service must inherit the same engagement policy.
5. **Evidence is immutable by reference.** Preserve hashes, timestamps, source provenance, and chain-of-custody metadata.
6. **No fabricated findings.** UI sample content must remain visibly labelled until backed by actual observations and verification.
7. **Safe cancellation.** Operations need explicit states for cancellation requested, stopping, stopped, and recovery required.
8. **Audit decisions.** Authorization checks, approvals, state transitions, data exports, and evidence changes must be auditable.

## Migration strategy

### Phase 1 — Stabilize the UI contract
- Freeze page identifiers and navigation metadata.
- Define API schemas and error envelopes.
- Replace inline arrays with a repository interface while retaining a demo adapter.
- Add loading, empty, partial, stale, and error states to each module.

### Phase 2 — Introduce service adapters
- Add one adapter per domain: assets, OSINT, network observations, vulnerability findings, operations, intelligence, evidence, and reporting.
- Keep browser code free of secrets and privileged credentials.
- Use authenticated requests and explicit API versioning.

### Phase 3 — Connect trusted backend services
- Connect the scope registry and policy gate first.
- Connect evidence storage before enabling collection workflows.
- Add read-only intelligence and asset views.
- Enable approved operations only after server-side authorization and audit controls pass tests.

### Phase 4 — Replace demo actions with real workflows
- Remove sample counters from operational views.
- Render provenance and validation status with each finding.
- Require explicit approval for policy-designated actions.
- Add end-to-end tests for denied scope, expired approval, cancellation, audit logging, and evidence integrity.

## Current limitation

The prototype does not contact targets, query external intelligence sources, operate Tor/I2P, run scanners, execute exploits, or connect AI agents. Its current actions only change local presentation state or export clearly labelled sample JSON. This is intentional: the visual and interaction system can mature independently while trusted backend services are designed and implemented.
