# Fast test order

Do these in order. Stop at the first failure and fix it before moving on.

1. `docker compose up --build`
2. Open `http://localhost:3000/health` — should show `status: ok` and PostgreSQL connected.
3. Open `/dashboard` — confirm metric cards, charts, alerts and recent events appear.
4. Open `/wordle` → Preview, then `/word-search` → Preview. Return to `/dashboard` and Refresh; successful generation count should increase.
5. Word Lists — create/edit/delete one temporary record.
6. Activity Settings — create/edit/delete one temporary configuration.
7. Install Playwright browser once: `npx playwright install chromium`
8. Run `npm run test:e2e`.
9. Run Lighthouse using `LIGHTHOUSE_CHECKLIST.md`.
10. Run JMeter last because the 1000/10000-user stages are the heaviest tests.
