import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { activityFilename, generateWordleHtml, generateWordSearchHtml } from '@/lib/generator';
import { errorResponse, parseId, ValidationError } from '@/lib/validation';
import { wordInclude } from '@/lib/word-data';
import { recordMetric } from '@/lib/metrics';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  let config = null;
  let requestedConfigId = null;
  try {
    const body = await request.json();
    requestedConfigId = parseId(body.configId, 'configId');
    config = await prisma.activityConfig.findUnique({
      where: { id: requestedConfigId },
      include: { list: true }
    });
    if (!config) throw new ValidationError('Activity configuration not found.', 404);

    const words = await prisma.word.findMany({
      where: {
        listId: config.listId,
        ...(config.difficulty !== 'any' ? { difficulty: config.difficulty } : {})
      },
      include: wordInclude,
      orderBy: { english: 'asc' }
    });

    let eligible = words;
    if (config.type === 'wordle' && config.phonemeLength) {
      eligible = words.filter((word) => word.phonemes.length === config.phonemeLength);
    }

    const requestedIds = Array.isArray(body.wordIds)
      ? body.wordIds.map(Number).filter((id) => Number.isInteger(id) && id > 0)
      : [];
    if (requestedIds.length) eligible = eligible.filter((word) => requestedIds.includes(word.id));

    const selected = eligible.slice(0, config.wordCount);
    if (!selected.length) throw new ValidationError('No stored words match this activity configuration. Edit the list, difficulty, or phoneme length.', 422);

    const html = config.type === 'wordsearch'
      ? generateWordSearchHtml(config, selected)
      : generateWordleHtml(config, selected);

    await recordMetric({
      eventType: 'generation_success',
      activityType: config.type,
      page: config.type === 'wordsearch' ? '/word-search' : '/wordle',
      configId: config.id,
      message: `Generated ${selected.length} stored target${selected.length === 1 ? '' : 's'}.`,
      source: 'live'
    });

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${activityFilename(config)}"`,
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    const { status, message } = errorResponse(error);
    await recordMetric({
      eventType: 'generation_failure',
      activityType: config?.type || null,
      page: config?.type === 'wordsearch' ? '/word-search' : config?.type === 'wordle' ? '/wordle' : '/api/generate',
      configId: config?.id || requestedConfigId || null,
      message,
      source: 'live'
    });
    return NextResponse.json({ error: message }, { status });
  }
}
