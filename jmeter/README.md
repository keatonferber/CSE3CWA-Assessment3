# JMeter staged load test

The assessment requires multiple load levels. `run-load-tests.ps1` runs the same builder/generation workflow at **1, 10, 100, 1000 and 10000 users**.

The test performs, per virtual user:

1. `GET /health`
2. `GET /api/configs?type=wordle`
3. `POST /api/generate` using a saved Wordle configuration

## Before running

1. Start the application and PostgreSQL (`docker compose up --build` is simplest).
2. Confirm `http://localhost:3000/health` returns 200.
3. Confirm the Wordle configuration ID. On a fresh database the first seeded configuration is normally ID `1`. If not, check `http://localhost:3000/api/configs?type=wordle`.
4. Install Apache JMeter 5.6.x and make `jmeter` available on PATH.

## Run all required levels (PowerShell)

```powershell
powershell -ExecutionPolicy Bypass -File .\jmeter\run-load-tests.ps1 -ConfigId 1
```

Results are written to `jmeter/results/`. Compare **average/median/95th percentile response time, throughput and error percentage** across the five levels. Keep screenshots of the reports for the Assessment 3 video.

Do not run the 10,000-user test against a public third-party site. This plan targets your own local assessment application.
