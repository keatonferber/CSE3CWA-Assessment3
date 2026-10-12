import { prisma } from '@/lib/prisma';

export async function recordMetric(data) {
  try {
    return await prisma.usageEvent.create({
      data: {
        eventType: data.eventType,
        activityType: data.activityType || null,
        page: data.page || null,
        configId: Number.isInteger(data.configId) ? data.configId : null,
        durationMs: Number.isInteger(data.durationMs) ? data.durationMs : null,
        message: data.message ? String(data.message).slice(0, 500) : null,
        source: data.source || 'live'
      }
    });
  } catch (error) {
    // Observability must never make the builder itself unavailable.
    console.error('Unable to persist usage metric:', error);
    return null;
  }
}
