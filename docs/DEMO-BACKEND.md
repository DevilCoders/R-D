# DEMO BACKEND

## Run locally

```bash
npm install
npm run demo
```

The server listens on 127.0.0.1:4174 by default and serves the generated `dist/` folder and a local API.

## API endpoints

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Local mode health and synthetic-data flag |
| GET | `/api/state` | Demo records, task queue, approvals, audit log |
| GET | `/api/records?module=...` | List demo observations |
| POST | `/api/records` | Add demo observation; scope records require confirmation |
| PATCH | `/api/records/:id` | Update status or notes |
| DELETE | `/api/records/:id` | Delete a demo record and append an audit event |
| DELETE | `/api/records/:id` | Delete a demo record and append an audit event |
| GET | `/api/tasks` | List demo tasks |
| POST | `/api/tasks` | Create an approval-gated simulated task |
| POST | `/api/tasks/:id/decision` | Approve or reject a simulation |
| POST | `/api/tasks/:id/cancel` | Cancel a demo task |
| GET/POST | `/api/audit` | Read / append demo audit events |
| POST | `/api/reset` | Reset synthetic state |

No endpoint starts scanners, exploitation, agents, credential workflows, external OSINT, Tor/I2P, or target network actions.

State is stored in `server/data/demo-state.json` and excluded from Git. GitHub Pages cannot run Node.js; its frontend uses browser localStorage fallback instead.
