'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function activityForPath(pathname) {
  if (pathname === '/wordle') return 'wordle';
  if (pathname === '/word-search') return 'wordsearch';
  return null;
}

function sendMetric(payload) {
  const body = JSON.stringify(payload);
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon('/api/metrics', blob);
    return;
  }
  fetch('/api/metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true
  }).catch(() => {});
}

export default function UsageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const started = Date.now();
    const activityType = activityForPath(pathname);

    fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'page_view', page: pathname, activityType })
    }).catch(() => {});

    return () => {
      const durationMs = Date.now() - started;
      if (durationMs >= 1000) {
        sendMetric({ eventType: 'time_on_page', page: pathname, activityType, durationMs });
      }
    };
  }, [pathname]);

  return null;
}
