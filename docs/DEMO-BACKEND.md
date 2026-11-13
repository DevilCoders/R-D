# Local DEMO backend

The Node.js service is a runnable synthetic backend for the interactive application. It has no target connector, scanner, exploit runner, credential collection, external OSINT fetcher, hidden-service client or agent execution.

## Start

```bash
npm install
npm run demo
```

Default address: `http://127.0.0.1:4174`.

State is persisted to `server/data/demo-state.json` (ignored by Git). The static GitHub Pages site cannot run Node.js; its browser adapter provides matching demo methods using localStorage.

## API

| Method | Route | Demo behavior |
|---|---|---|
| GET | `/api/health` | Health, active mode and explicit synthetic-only flag |
| GET | `/api/state` | All records, tasks, approvals and audit events |
| GET | `/api/records?module=...` | List records, optionally filtered by workspace |
| POST | `/api/records` | Create a synthetic target or observation; no scope confirmation gate |
| PATCH | `/api/records/:id` | Update record status or notes |
| DELETE | `/api/records/:id` | Delete a record and append an audit event |
| GET | `/api/tasks` | List workflow tasks |
| POST | `/api/tasks` | Create a simulated task in Awaiting approval |
| POST | `/api/tasks/:id/decision` | Approve or reject a task |
| POST | `/api/tasks/:id/run` | Run the synthetic task lifecycle and generate a mock result |
| POST | `/api/tasks/:id/cancel` | Cancel a task |
| GET | `/api/audit` | Read the synthetic event log |
| POST | `/api/audit` | Append a demo event |
| POST | `/api/reset` | Reset demo records, tasks and audit state |

A typical task lifecycle is:

`Awaiting approval → Approved — demo only → Running — demo → Completed — demo`

Tasks can also transition to Rejected or Cancelled. The run endpoint only writes mock progress and a synthetic result. It never invokes a tool, contacts a target or makes an external request.

## Browser adapter contract

`src/demo-api.js` exposes `window.DevilEyeDemoAPI` with the shared methods:

- `probe()`, `state()`
- `addRecord()`, `updateRecord()`, `deleteRecord()`
- `createTask()`, `decideTask()`, `runTask()`, `cancelTask()`
- `addAudit()`, `reset()`

The adapter first tries the local Node API. If no API server is available, it falls back to browser localStorage without changing the UI interaction model.

## Test

`npm run smoke` exercises static file delivery, the world map, every concept image, unrestricted demo target creation, record CRUD, task approval/rejection/run/cancel, audit events, reset and localStorage adapter behavior.
