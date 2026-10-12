# Assessment 3 video — recording checklist (3–8 minutes)

Do not lock the final wording until Playwright, JMeter and Lighthouse have been run, because the video must quote the **real results**.

## 0:00–0:30 — identity and purpose

- Face visible, show student ID, state name/student number/subject/Assessment 3.
- Home page: explain that A3 extends the same Wordle/Word Search builder into data reporting, monitoring and testing.

## 0:30–1:50 — dashboard, database and observability

- Open Dashboard.
- Show PostgreSQL health, saved activity counts, success/failure, average time on page and most-used activity.
- Show seven-day report, alerts and recent operational events.
- Point out `simulated` seed records versus `live` records.
- Mention that A2 used SQLite inside the app container; A3 uses separate Next.js and PostgreSQL Docker services in response to the previous architecture feedback.

## 1:50–2:50 — working data flow

- Open Wordle → Preview/Generate.
- Open Word Search → Preview/Generate.
- Return to Dashboard → Refresh and show generation counts/recent events changing.
- Briefly show one stored Word List or Activity Settings CRUD action.

## 2:50–3:20 — health and warnings

- Show `/health` returning 200 OK and PostgreSQL connected.
- Explain the failed-generation/empty-list warning concept using the dashboard alerts.

## 3:20–4:20 — Playwright

- Run/show `npm run test:e2e`.
- Explain the builder CRUD E2E test and the generated Wordle/Word Search user test.
- State the actual pass result shown on screen.

## 4:20–5:30 — JMeter

- Show the reports for 1, 10, 100, 1000 and 10000 users.
- State actual response-time, throughput and error-rate changes. Do not invent values; fill these in after running the tests.

## 5:30–6:20 — Lighthouse accessibility

- Show the real Lighthouse accessibility score/report.
- Explain any issue found and any change made after reviewing the report.

## 6:20–7:00 — GitHub / close

- Show GitHub homepage and current commits.
- Briefly show README/architecture if useful.
- Close by summarising database persistence, reporting/observability, testing and accessibility evidence.

The final script can be tightened after we have your real JMeter and Lighthouse numbers.
