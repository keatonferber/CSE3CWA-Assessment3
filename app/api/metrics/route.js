import { NextResponse } from 'next/server';
import { recordMetric } from '@/lib/metrics';

export const dynamic = 'force-dynamic';

const allowedEvents = new Set(['page_view', 'time_on_page']);
const allowedActivities = new Set(['wordle', 'wordsearch']);

export async function POST(request) {
  try {
    const body = await request.json();
    if (!allowedEvents.has(body.eventType)) {
      return NextResponse.json({ error: 'Unsupported metric event.' }, { status: 400 });
    }

    const durationMs = body.eventType === 'time_on_page'
      ? Math.max(0, Math.min(Number(body.durationMs) || 0, 60 * 60 * 1000))
      : null;

    await recordMetric({
      eventType: body.eventType,
      activityType: allowedActivities.has(body.activityType) ? body.activityType : null,
      page: typeof body.page === 'string' ? body.page.slice(0, 120) : null,
      durationMs: Number.isInteger(durationMs) ? durationMs : Math.round(durationMs),
      source: 'live'
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unable to record metric.' }, { status: 400 });
  }
}
