import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export async function GET() {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;

    const [
      wordCount,
      phonemeCount,
      listCount,
      emptyLists,
      wordleConfigs,
      wordSearchConfigs,
      successfulGenerations,
      failedGenerations,
      pageViews,
      timeAggregate,
      successByType,
      recentEvents,
      recentWindow,
      configSummary,
      listSummary
    ] = await Promise.all([
      prisma.word.count(),
      prisma.phoneme.count(),
      prisma.wordList.count(),
      prisma.wordList.count({ where: { words: { none: {} } } }),
      prisma.activityConfig.count({ where: { type: 'wordle' } }),
      prisma.activityConfig.count({ where: { type: 'wordsearch' } }),
      prisma.usageEvent.count({ where: { eventType: 'generation_success' } }),
      prisma.usageEvent.count({ where: { eventType: 'generation_failure' } }),
      prisma.usageEvent.count({ where: { eventType: 'page_view' } }),
      prisma.usageEvent.aggregate({ where: { eventType: 'time_on_page' }, _avg: { durationMs: true }, _count: true }),
      prisma.usageEvent.groupBy({
        by: ['activityType'],
        where: { eventType: 'generation_success', activityType: { not: null } },
        _count: { _all: true }
      }),
      prisma.usageEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 12 }),
      prisma.usageEvent.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.activityConfig.findMany({ include: { list: true }, orderBy: [{ type: 'asc' }, { name: 'asc' }] }),
      prisma.wordList.findMany({ include: { _count: { select: { words: true, configs: true } } }, orderBy: { name: 'asc' } })
    ]);

    const typeCounts = Object.fromEntries(successByType.map((row) => [row.activityType, row._count._all]));
    const wordleGenerated = typeCounts.wordle || 0;
    const wordSearchGenerated = typeCounts.wordsearch || 0;
    const mostUsedActivity = wordleGenerated === wordSearchGenerated
      ? (wordleGenerated === 0 ? 'No activity data yet' : 'Tie')
      : (wordleGenerated > wordSearchGenerated ? 'Wordle' : 'Word Search');

    const totalGenerationAttempts = successfulGenerations + failedGenerations;
    const successRate = totalGenerationAttempts ? (successfulGenerations / totalGenerationAttempts) * 100 : 100;
    const averageTimeSeconds = (timeAggregate._avg.durationMs || 0) / 1000;

    const days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);
      days.push({
        key: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString('en-AU', { weekday: 'short' }),
        wordle: 0,
        wordsearch: 0,
        failures: 0
      });
    }
    const byDay = Object.fromEntries(days.map((day) => [day.key, day]));
    for (const event of recentWindow) {
      const key = event.createdAt.toISOString().slice(0, 10);
      const day = byDay[key];
      if (!day) continue;
      if (event.eventType === 'generation_success' && event.activityType === 'wordle') day.wordle += 1;
      if (event.eventType === 'generation_success' && event.activityType === 'wordsearch') day.wordsearch += 1;
      if (event.eventType === 'generation_failure') day.failures += 1;
    }

    const alerts = [
      {
        level: 'ok',
        title: 'Database connected',
        detail: 'PostgreSQL responded to the live health query.'
      }
    ];
    if (emptyLists > 0) alerts.push({ level: 'warning', title: 'Empty word lists', detail: `${emptyLists} stored word list${emptyLists === 1 ? ' is' : 's are'} empty.` });
    if (failedGenerations > 0) alerts.push({ level: 'warning', title: 'Generation failures recorded', detail: `${failedGenerations} failed generation attempt${failedGenerations === 1 ? '' : 's'} are available for review.` });
    if (successRate < 90) alerts.push({ level: 'critical', title: 'Generation success rate below 90%', detail: `Current success rate is ${round(successRate)}%.` });
    if (timeAggregate._count === 0) alerts.push({ level: 'warning', title: 'No timing records yet', detail: 'Browse the application to collect average time-on-page data.' });

    return NextResponse.json({
      health: { status: 'ok', database: 'connected', responseMs: Date.now() - started, timestamp: new Date().toISOString() },
      storage: { wordCount, phonemeCount, listCount, emptyLists, wordleConfigs, wordSearchConfigs },
      usage: {
        successfulGenerations,
        failedGenerations,
        totalGenerationAttempts,
        successRate: round(successRate),
        wordleGenerated,
        wordSearchGenerated,
        mostUsedActivity,
        averageTimeSeconds: round(averageTimeSeconds),
        timingSamples: timeAggregate._count,
        pageViews
      },
      daily: days,
      alerts,
      recentEvents: recentEvents.map((event) => ({
        ...event,
        createdAt: event.createdAt.toISOString()
      })),
      configSummary: configSummary.map((config) => ({
        id: config.id,
        name: config.name,
        type: config.type,
        difficulty: config.difficulty,
        wordCount: config.wordCount,
        phonemeLength: config.phonemeLength,
        gridRows: config.gridRows,
        gridCols: config.gridCols,
        listName: config.list.name
      })),
      listSummary: listSummary.map((list) => ({
        id: list.id, name: list.name, description: list.description, wordCount: list._count.words, configCount: list._count.configs
      }))
    }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      health: { status: 'error', database: 'unavailable', responseMs: Date.now() - started, timestamp: new Date().toISOString() },
      error: 'Dashboard data is unavailable because the database health check failed.'
    }, { status: 503 });
  }
}
