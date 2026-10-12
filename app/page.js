import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [wordCount, listCount, configCount, phonemeCount, usageCount] = await Promise.all([
    prisma.word.count(),
    prisma.wordList.count(),
    prisma.activityConfig.count(),
    prisma.phoneme.count(),
    prisma.usageEvent.count()
  ]);

  return (
    <>
      <section className="hero">
        <div className="heroCard">
          <p className="eyebrow">Assessment 3 · data and reporting</p>
          <h1>Build, monitor and report on phoneme activities.</h1>
          <p className="lead">The builder stores HCE word data and reusable activity settings, generates Wordle and Word Search outputs, and now records operational usage in PostgreSQL for dashboard reporting and observability.</p>
          <div className="actions">
            <Link className="button" href="/dashboard">Open dashboard</Link>
            <Link className="button secondary" href="/wordle">Build Wordle</Link>
            <Link className="button secondary" href="/word-search">Build Word Search</Link>
          </div>
        </div>
        <aside className="heroCard stats" aria-label="Database summary">
          <div className="stat"><strong>{wordCount}</strong><span className="muted">stored words</span></div>
          <div className="stat"><strong>{phonemeCount}</strong><span className="muted">phoneme symbols</span></div>
          <div className="stat"><strong>{configCount}</strong><span className="muted">saved configurations</span></div>
          <div className="stat"><strong>{usageCount}</strong><span className="muted">operational records</span></div>
        </aside>
      </section>

      <section className="grid3" style={{ marginTop: 20 }}>
        <article className="card"><p className="eyebrow">1 · Persist</p><h2>PostgreSQL-backed data</h2><p className="muted">Word lists, ordered phonemes, activity settings and usage events are stored independently of the Next.js application container.</p><Link href="/words">Manage stored data →</Link></article>
        <article className="card"><p className="eyebrow">2 · Observe</p><h2>Operational dashboard</h2><p className="muted">Health, generation success/failure, time on page, activity usage, warnings and recent events are summarised in one reporting view.</p><Link href="/dashboard">View reporting dashboard →</Link></article>
        <article className="card"><p className="eyebrow">3 · Generate</p><h2>Standalone classroom output</h2><p className="muted">The existing database-driven Wordle and Word Search workflows remain intact and each generation attempt is now monitored.</p><Link href="/activities">Manage activity settings →</Link></article>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <p className="eyebrow">Assessment continuity</p>
        <h2>Assessment 2 strengths retained, reporting added</h2>
        <p className="muted">The normalised HCE word model, CRUD APIs, validation, standalone activity generation and genuine <span className="codeLike">/health</span> route are retained. Assessment 3 adds a separate PostgreSQL service, database-backed operational metrics, alerts, Playwright tests and load-testing assets.</p>
        <p className="fieldHelp">Current database: {listCount} word lists · {configCount} activity configurations.</p>
      </section>
    </>
  );
}
