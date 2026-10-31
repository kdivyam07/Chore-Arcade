# Low-level design

## Modules
- routes/api.js: endpoint dispatch only.
- controllers/api.js: request validation, responses, OAuth callbacks.
- services/session.js: session cookie and encrypted short-lived Google tokens.
- services/chore.js: scan, plan, execute, report, undo, scoring inputs.
- services/gmail.js: Gmail metadata scan and grouped batchModify.
- models/store.js: prepared SQLite access and schema initialization.
- middleware/security.js: session, origin validation, error normalization.
- frontend/game/Mission.jsx: timer, decision queue, dry-run, confirmation.
- frontend/main.jsx: landing, report, leaderboard, API orchestration.

## Persistence
sessions(id,mode,token,created): server-side auth; expires after 24 hours.
messages(id,session_id,subject,sender,snippet,labels): isolated inbox snapshot.
runs(id,session_id,created,ended,undone): owner and lifecycle.
actions(id,run_id,message_id,kind,before_labels,after_labels,status): audit trail.
scores(run_id,name,score,created): one server-derived score per run.

## API
- GET /api/health: public liveness.
- POST /api/auth/demo: create a fresh isolated mock inbox.
- GET /api/auth/me: integration availability.
- GET /api/auth/google: start OAuth (not an ID-token exchange).
- GET /api/auth/callback: validate state, exchange code, set cookie.
- GET /api/chores: available adapters.
- POST /api/chores/email/scan: first 30 live inbox messages or demo snapshot.
- POST /api/chores/email/dry-run: validate and return label diff.
- POST /api/actions: up to 30 UUID-keyed decisions; archive/read/keep.
- GET /api/runs/:runId: owner-only confirmed report.
- POST /api/runs/:runId/undo: restore only affected label differences.
- POST /api/scores: runId and display name; score computed from confirmed actions.
- GET /api/leaderboard: top 10, labeled demo/live.

Errors: {error:{code,message}}. Never return provider errors or tokens.
Mutation payload: {runId,actions:[{id,messageId,kind}]}.
Idempotency UUIDs are bound to run, item, and action type.

## Deliberate product decisions
Review before execution is mandatory. Queue is submitted at checkpoints rather
than every five seconds to avoid applying unreviewed actions. Keep is a confirmed
decision but changes no labels. Time saved is labeled as an estimate.
No external scripts/fonts; reduced motion and keyboard/button controls supported.
OAuth uses short-lived tokens; reconnect after expiration/restart.
Live scan is bounded to 30 messages and cached for 60 seconds.
