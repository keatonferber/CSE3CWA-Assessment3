# Assessment 3 requirement mapping

| Assessment 3 requirement | Implementation evidence |
|---|---|
| Data-driven dashboard | `/dashboard`, `components/DashboardClient.jsx` |
| Stored word/activity summaries | `/api/dashboard`, Prisma Word/WordList/ActivityConfig counts |
| Wordle/Word Search creation/config counts | dashboard `wordleConfigs`, `wordSearchConfigs` |
| Successful generation count | `UsageEvent` + instrumentation in `/api/generate` |
| Failed generation count | `UsageEvent` + failure instrumentation in `/api/generate` |
| Average time on page | `UsageTracker.jsx` → `/api/metrics` → `UsageEvent.durationMs` |
| Most-used activity type | `/api/dashboard` aggregation of successful generation events |
| Health status | genuine database query in `/health` and `/api/dashboard` |
| Alerts/warnings | dashboard alerts for DB health, failures, empty lists, success rate, missing timing data |
| Simulated input records | idempotent labelled records in `prisma/seed.mjs` (`source=simulated`) |
| Live database persistence | PostgreSQL service + Prisma `UsageEvent` model |
| Existing builder CRUD | `/words`, `/activities`, CRUD APIs retained from A2 |
| Activity output from stored data | `/api/generate`, `lib/generator.js`, `/wordle`, `/word-search` |
| Playwright builder use case | `tests/builder-crud.spec.js` |
| Playwright user use case | `tests/generated-activity.spec.js` |
| JMeter staged load | `jmeter/load-test.jmx`, `jmeter/run-load-tests.ps1` |
| 1/10/100/1000/10000 levels | PowerShell runner executes all five stages |
| Lighthouse accessibility | `LIGHTHOUSE_CHECKLIST.md` + accessible status/alert updates |
| A2 Docker feedback | separate `app` and `db` services in `docker-compose.yml`; PostgreSQL volume |
| `/health` returns 200 | `app/health/route.js` |
| Minimum five sources | README contains six official industry/standards sources |
