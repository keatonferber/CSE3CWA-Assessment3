import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: 'ok',
      application: 'connected',
      database: 'connected',
      databaseEngine: 'PostgreSQL',
      responseMs: Date.now() - started,
      timestamp: new Date().toISOString()
    }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({
      status: 'error',
      application: 'connected',
      database: 'unavailable',
      responseMs: Date.now() - started,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
