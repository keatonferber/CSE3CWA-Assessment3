# Assessment 3 API demonstration commands

Run the application first with `docker compose up --build`.

## Healthcheck

```powershell
curl.exe -i http://localhost:3000/health
```

Expected: HTTP `200 OK`, `status: ok`, `database: connected`, `databaseEngine: PostgreSQL`.

## Dashboard data

```powershell
curl.exe http://localhost:3000/api/dashboard
```

This returns stored-data counts, operational statistics, alerts, daily trend data and recent events.

## Read saved activity configurations

```powershell
curl.exe http://localhost:3000/api/configs
```

## Generate a saved activity

```powershell
curl.exe -X POST http://localhost:3000/api/generate `
  -H "Content-Type: application/json" `
  -d '{"configId":1}' `
  -o generated-wordle.html
```

A successful call writes a `generation_success` UsageEvent. An invalid request such as a missing/non-existent configuration writes a `generation_failure` event and appears in Dashboard alerts/recent events.
