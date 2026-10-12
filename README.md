<img width="1182" height="676" alt="image" src="https://github.com/user-attachments/assets/e97dd88c-2f6b-4cbe-b1ac-1b79d98b1807" /># CSE3CWA Assessment 3 — Data-driven Phoneme Activity Builder

Student: **Keaton Ferber**  
Student number: **21996943**
GitHub repository: https://github.com/keatonferber/CSE3CWA-Assessment3

This project extends the Assessment 2 Next.js Wordle/Word Search builder into the Assessment 3 data-driven reporting and observability stage. The existing normalised phoneme model, CRUD APIs, validation, `/health` route and standalone activity generation are retained.

## What changed for Assessment 3

- Added a **PostgreSQL database service** in Docker Compose instead of storing SQLite inside the application container.
- Added persistent `UsageEvent` records for operational reporting.
- Added a **Dashboard** with health, activity counts, generation success/failure, average time on page, most-used activity type, usage trends, alerts and recent events.
- Generation success and failure are recorded automatically by `/api/generate`.
- Page views and time-on-page are recorded by a lightweight client tracker.
- Seed data includes clearly labelled **simulated operational records** so reporting is visible immediately; new interactions are stored as `live` records.
- Added **Playwright** builder CRUD and generated-activity E2E tests.
- Added a **JMeter** staged-load plan and PowerShell runner for 1, 10, 100, 1000 and 10000 users.
- Added a Lighthouse accessibility evidence checklist and small accessibility improvements such as status/alert live regions.

## Architecture

```text
Browser
  │
  ▼
Next.js application container
  ├─ React/App Router pages
  ├─ API route handlers
  ├─ activity generator
  ├─ dashboard/metrics endpoints
  └─ Prisma ORM
          │
          ▼
PostgreSQL database container
  ├─ word lists / words / phonemes
  ├─ activity configurations
  └─ usage / observability events
```

This keeps Next.js as the full-stack application framework while separating persistent database storage into its own service.

## Fastest way to run the complete project

Requires Docker Desktop.

```powershell
docker compose up --build
```

Then open:

- App: `http://localhost:3000`
- Dashboard: `http://localhost:3000/dashboard`
- Health: `http://localhost:3000/health`

The first start creates the PostgreSQL schema and seeds the 90 HCE words, 3 activity configurations and simulated Assessment 3 usage records. The seed is idempotent and does **not** wipe live usage records on restart.

To completely reset the Docker database:

```powershell
docker compose down -v
docker compose up --build
```

## Local Next.js development with PostgreSQL in Docker

Start only PostgreSQL:

```powershell
docker compose up -d db
Copy-Item .env.example .env
npm install
npm run db:setup
npm run dev
```

Open `http://localhost:3000`.

> `npm install` is important on the first Assessment 3 run because Playwright was added to the project dependencies.

## Dashboard evidence

The `/dashboard` reporting view shows:

- live PostgreSQL health and response time
- saved Wordle and Word Search configuration counts
- successful and failed generation counts
- success rate
- average time on page and timing sample count
- most-used activity type
- Wordle vs Word Search generation totals
- seven-day activity trend
- word/list/phoneme storage summary
- empty-list and failure warnings
- recent operational event log with `simulated` versus `live` source labels

## Health endpoint

```powershell
curl.exe -i http://localhost:3000/health
```

Expected status: **HTTP 200** with `"status":"ok"` and `"database":"connected"`.

## Playwright

With the app already running:

```powershell
npx playwright install chromium
npm run test:e2e
```

Tests:

- `tests/builder-crud.spec.js` — creates, updates and deletes a saved activity configuration through the UI.
- `tests/generated-activity.spec.js` — confirms `/health`, previews Wordle and Word Search, and confirms the operational dashboard is healthy.

Keep the terminal output and/or Playwright report as video evidence.

## JMeter

See `jmeter/README.md`. The included PowerShell script executes **1, 10, 100, 1000 and 10000-user** stages against your local builder/generation workflow.

```powershell
powershell -ExecutionPolicy Bypass -File .\jmeter\run-load-tests.ps1 -ConfigId 1
```

Compare response time, throughput and error percentage between stages and show the result reports in the video.

## Lighthouse accessibility

See `LIGHTHOUSE_CHECKLIST.md`. Run Chrome Lighthouse against `/dashboard` and ideally the two activity pages. Keep the real report/screenshot and explain any changes made after the audit.

## Main API routes

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | live application/database health check |
| GET | `/api/dashboard` | aggregated reporting/observability data |
| POST | `/api/metrics` | persists page-view and time-on-page events |
| GET/POST | `/api/word-lists` | word-list CRUD |
| GET/POST | `/api/words` | word CRUD |
| GET/POST | `/api/configs` | activity-configuration CRUD |
| POST | `/api/generate` | generates standalone activity HTML and records success/failure |

## Assessment 2 feedback addressed

Assessment 2's strong database model, validation, genuine healthcheck and database-driven generation are retained. The main architecture criticism is addressed by moving persistence from SQLite packaged inside the application container to a dedicated PostgreSQL Docker service. Git history can be improved naturally while completing A3, but the implementation work remains the priority.

## References — APA 7 style

Apache Software Foundation. (n.d.). *Apache JMeter*. https://jmeter.apache.org/

Docker, Inc. (n.d.). *Docker documentation*. https://docs.docker.com/

Microsoft. (n.d.). *Playwright documentation*. https://playwright.dev/

Prisma Data, Inc. (n.d.). *Prisma ORM documentation*. https://www.prisma.io/docs/orm

Vercel. (n.d.). *Next.js documentation*. https://nextjs.org/docs

World Wide Web Consortium. (2023). *Web Content Accessibility Guidelines (WCAG) 2.2*. https://www.w3.org/TR/WCAG22/

## Before final submission

- run the app and manually confirm existing CRUD and both activity generators
- confirm `/health` returns 200
- run Playwright and retain evidence
- run all required JMeter levels and retain evidence
- run Lighthouse and retain the actual score/report
- update/push GitHub
- record the 3–8 minute video with face, voice and student ID
- complete the official AI acknowledgement
- remove `node_modules`, `.next`, Playwright browser binaries and any unnecessarily huge raw test results before creating the submission ZIP
