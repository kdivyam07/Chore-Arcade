# Chore Arcade

A full-stack arcade where playing games helps clear an email inbox. Built for PromptWars × OUTLIER 2026.

## Quick start (Windows / PowerShell)

Install Node.js 24 LTS, then open this folder in VS Code and run:

```powershell
npm.cmd ci
npm.cmd run build
$env:PORT='8091'
$env:APP_ORIGIN='http://localhost:8091'
npm.cmd start
```

Open http://localhost:8091 and select a game, then Play. Demo mode needs no API keys. Stop the server with Ctrl+C. If port 8091 is occupied by the existing app, use that app or choose another port and matching APP_ORIGIN. Run commands from the project root.

The backend serves the compiled frontend. Rebuild after frontend edits and restart after backend edits. SQLite creates its database automatically and seeds mock messages when a demo session starts.

## Games and features

- **Inbox Six:** choose an email action, bowl, then time a cricket swing for 2, 4 or 6 runs. A miss leaves the email unchanged. Relaxed mode removes timing pressure.
- **Orbit Blaster:** aim and fire at a moving email asteroid. A hit queues the selected action. Includes keyboard aiming and optional automatic aim.
- **Hoop Hustle:** pull back and release the email ball into the selected basketball hoop. Includes a guided shot using the same projectile physics.
- Interactive game-selection cards, dark arcade theme, bold typography, cursor effects, countdown, pause and a timed round.
- **Milo:** licensed Rive kid animation with idle, walk and run clips; contextual captions, playful teasing, encouragement and optional browser speech.
- Shared email preview, explicit Archive / Read / Keep selection, review-before-apply, operation report, undo and server-confirmed leaderboard scores.

## How email processing works

1. Start an isolated demo inbox or explicitly connect Gmail using Google OAuth.
2. Read the email candidate and choose Archive, Read or Keep.
3. Complete a successful play to queue that decision. Misses do not queue it.
4. Review the proposed label changes, then confirm the batch.
5. The backend validates the session and run, executes changes, records results and calculates chore points.
6. Inspect the report or undo the label changes made by that run.

Demo mode changes SQLite mock records only; it never changes real Gmail. Gameplay points are separate from backend-confirmed chore points. Keep is a processed decision that leaves labels unchanged. Permanent email deletion is not implemented.

## Technology and structure

- Frontend: React 19, Vite, CSS, SVG game scenes, requestAnimationFrame physics, Rive canvas and browser Speech Synthesis.
- Backend: Node.js, Express 5, Zod validation, Helmet, rate limits and Google APIs.
- Database: SQLite through better-sqlite3; SQL schema and demo seed are included.
- Validation: Vitest, Supertest, Playwright and ESLint. Dockerfile and GitHub Actions workflow are included.

```text
frontend/src/components/      Arcade lobby and reusable UI
frontend/src/game/            Shared mission, Milo and game registry
frontend/src/game/cricket/    Cricket renderer and physics
frontend/src/game/blaster/    Space shooter
frontend/src/game/hoops/      Basketball renderer and physics
frontend/src/game/shared/     Shared controls, email brief, loop and math
frontend/src/services/        Frontend API client
frontend/public/characters/  Rive asset and attribution
backend/src/routes/          API routes
backend/src/controllers/     Request handlers and validation
backend/src/services/        Chore execution, sessions and Gmail adapter
backend/src/models/          SQLite access
backend/src/middleware/      Request security and errors
backend/tests/               Unit, API and game-math tests
frontend/tests/              Browser end-to-end tests
database/                    SQL schema and demo email seed
shared/                      Shared action definitions
docs/                        Architecture and implementation notes
```

The three games reuse one mission engine and chore pipeline. Each game owns its input, scene and physics; it does not duplicate the backend or character renderer. This is a React single-page application with menu, game, report and leaderboard views, backed by a real server and database.

## Database

Tables: `sessions`, `messages`, `runs`, `actions`, `scores`. Runs belong to sessions; actions record before/after labels and execution status. UUID action identifiers provide idempotent execution. Scores are calculated by the backend rather than trusted from browser totals. The package includes the schema and seed, not previous users' session databases.

## Optional live Gmail configuration

Create a Google Cloud project, enable Gmail API, configure an OAuth consent screen and create a Web application OAuth client. Add the exact redirect URI used by your app. Google account consent is required; an API key alone cannot access someone's inbox. Add your own test user while the OAuth app is in testing.

Copy `.env.example` to `.env`, supply your own OAuth client ID and secret, and use matching values, for example:

```text
PORT=8091
APP_ORIGIN=http://localhost:8091
DATABASE_PATH=database/arcade.db
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8091/api/auth/callback
```

The server does not automatically load `.env` through npm start. With Node 24, run the configured file explicitly:

```powershell
node --env-file=.env backend/src/server.js
```

Keep `.env` private. The Gmail adapter uses the OAuth authorization-code flow and `gmail.modify` scope. Browser code does not receive Google access tokens. Live behavior needs testing with configured credentials; it has not been verified against an actual Gmail account in this build.

## Checks

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

With the app running, browser tests can use installed Chrome:

```powershell
$env:PLAYWRIGHT_BASE_URL='http://localhost:8091'
$env:PLAYWRIGHT_CHANNEL='chrome'
npm.cmd run test:e2e
```

All validation checks pass:
- **Lint:** ESLint passed with 0 errors (`npm.cmd run lint`).
- **Unit, API, and Game-Math Tests:** 21/21 tests passed across 4 test suites (`npm.cmd test`).
- **Production Build:** Vite production build succeeded cleanly (`npm.cmd run build`).
- **Automated Browser E2E Tests:** 3/3 Playwright end-to-end tests passed (`npm.cmd run test:e2e`), verifying Orbit Blaster, Hoop Hustle, and Inbox Six demo flows (including queueing decisions, batch application, and undo).

## Current limitations and next steps

- Local app works; no Cloud Run deployment URL has been provisioned. The Dockerfile is deployment preparation, not proof of deployment.
- Google OAuth credentials are not configured. Use demo mode until you configure and test your own OAuth client.
- SQLite on Cloud Run is ephemeral. Before durable production use, migrate to a managed database, use a stable managed encryption key and support multi-instance concurrency. OAuth token encryption keys and OAuth state are currently process-local.
- Voice character depends on installed browser voices; pitch and speed are adjusted, but a guaranteed child voice is not bundled.
- The licensed Rive rig provides idle/walk/run; individual pupil tracking, lip sync and independent facial expressions are not exposed by this asset. Pointer movement tilts the character presentation.
- No custom ML model is required or included. Current actions are explicit user choices and deterministic game logic; Gemini or ML categorization would be a future enhancement.
- Current chore integration is email. Folder sorting, expense review and lint fixing are not implemented.

For hackathon submission: test configured Gmail if demonstrating live integration, deploy to Cloud Run, verify the public URL and publish the intended source repository. Follow the participant guide for final submission requirements.

## Documentation and credits

See `docs/HLD.md`, `docs/LLD.md`, `docs/ARCADE.md`, `docs/CRICKET.md` and `docs/CHARACTER.md`. The Milo Rive animation is third-party artwork: **Kid Character Animation** by **muh.iswarramadhan**, under the attribution terms recorded in `frontend/public/characters/ATTRIBUTION.md`. Preserve that file when sharing the project. The reference websites are inspiration, not runtime dependencies.
