'use client';

import { useEffect, useMemo, useState } from 'react';

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0 s';
  if (seconds < 60) return `${Math.round(seconds)} s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
}

function formatEvent(event) {
  if (event.eventType === 'generation_success') return 'Generated activity';
  if (event.eventType === 'generation_failure') return 'Generation failed';
  if (event.eventType === 'time_on_page') return 'Time on page';
  if (event.eventType === 'page_view') return 'Page view';
  return event.eventType;
}

export default function DashboardClient() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/dashboard', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to load dashboard data.');
      setData(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const maxDaily = useMemo(() => {
    if (!data?.daily?.length) return 1;
    return Math.max(1, ...data.daily.map((day) => day.wordle + day.wordsearch + day.failures));
  }, [data]);

  if (loading && !data) return <div className="card"><p role="status">Loading operational dashboard…</p></div>;
  if (error && !data) return <div className="notice error" role="alert">{error}</div>;

  const { health, storage, usage, alerts, recentEvents, daily, configSummary, listSummary } = data;
  const totalType = Math.max(1, usage.wordleGenerated + usage.wordSearchGenerated);

  return (
    <div className="dashboardStack">
      <section className="statusStrip" aria-label="System health summary">
        <div>
          <span className={`statusDot ${health.status === 'ok' ? 'ok' : 'critical'}`} aria-hidden="true" />
          <strong>{health.status === 'ok' ? 'System healthy' : 'System unavailable'}</strong>
          <span className="muted"> PostgreSQL · {health.responseMs} ms</span>
        </div>
        <div className="toolbar">
          <span className="muted">Updated {new Date(health.timestamp).toLocaleTimeString('en-AU')}</span>
          <button className="button secondary small" type="button" onClick={load} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh data'}</button>
        </div>
      </section>

      {error && <div className="notice error" role="alert">{error}</div>}

      <section aria-labelledby="usage-heading">
        <div className="sectionHeader"><div><p className="eyebrow">Operational statistics</p><h2 id="usage-heading">Live usage overview</h2></div></div>
        <div className="metricGrid">
          <article className="metricCard"><span>Successful generations</span><strong>{usage.successfulGenerations}</strong><small>{usage.successRate}% success rate</small></article>
          <article className="metricCard"><span>Failed generations</span><strong>{usage.failedGenerations}</strong><small>Stored for operational review</small></article>
          <article className="metricCard"><span>Average time on page</span><strong>{formatDuration(usage.averageTimeSeconds)}</strong><small>{usage.timingSamples} timing samples</small></article>
          <article className="metricCard"><span>Most-used activity</span><strong className="metricText">{usage.mostUsedActivity}</strong><small>{usage.pageViews} tracked page views</small></article>
        </div>
      </section>

      <section className="grid2" aria-label="Activity and storage reports">
        <article className="card">
          <p className="eyebrow">Activity report</p>
          <h2>Generation usage</h2>
          <div className="reportRows">
            <div><div className="reportLabel"><strong>Wordle</strong><span>{usage.wordleGenerated} generated</span></div><div className="barTrack"><span style={{ width: `${(usage.wordleGenerated / totalType) * 100}%` }} /></div></div>
            <div><div className="reportLabel"><strong>Word Search</strong><span>{usage.wordSearchGenerated} generated</span></div><div className="barTrack"><span style={{ width: `${(usage.wordSearchGenerated / totalType) * 100}%` }} /></div></div>
          </div>
          <dl className="summaryList">
            <div><dt>Saved Wordle configurations</dt><dd>{storage.wordleConfigs}</dd></div>
            <div><dt>Saved Word Search configurations</dt><dd>{storage.wordSearchConfigs}</dd></div>
            <div><dt>Total generation attempts</dt><dd>{usage.totalGenerationAttempts}</dd></div>
          </dl>
        </article>

        <article className="card">
          <p className="eyebrow">Database report</p>
          <h2>Stored builder data</h2>
          <div className="miniMetricGrid">
            <div><strong>{storage.wordCount}</strong><span>words</span></div>
            <div><strong>{storage.phonemeCount}</strong><span>phoneme symbols</span></div>
            <div><strong>{storage.listCount}</strong><span>word lists</span></div>
            <div><strong>{storage.emptyLists}</strong><span>empty lists</span></div>
          </div>
          <p className="fieldHelp">Word lists, activity settings and operational usage records are persisted in PostgreSQL. Seeded usage records are marked as simulated; new interactions are stored as live records.</p>
        </article>
      </section>


      <section className="card" aria-labelledby="stored-config-heading">
        <div className="sectionHeader"><div><p className="eyebrow">Stored activity data</p><h2 id="stored-config-heading">Saved configuration report</h2><p className="muted">Database-backed Wordle and Word Search settings currently available to the builder.</p></div></div>
        <div className="tableWrap">
          <table>
            <thead><tr><th>Configuration</th><th>Type</th><th>Word list</th><th>Difficulty</th><th>Output settings</th><th>Builder</th></tr></thead>
            <tbody>{configSummary.map((config) => <tr key={config.id}>
              <td><strong>{config.name}</strong></td>
              <td><span className="badge">{config.type === 'wordsearch' ? 'Word Search' : 'Wordle'}</span></td>
              <td>{config.listName}</td>
              <td>{config.difficulty}</td>
              <td>{config.type === 'wordle' ? `${config.phonemeLength} phonemes · ${config.wordCount} targets` : `${config.gridRows}×${config.gridCols} · ${config.wordCount} words`}</td>
              <td><a href={config.type === 'wordle' ? '/wordle' : '/word-search'}>Open</a></td>
            </tr>)}</tbody>
          </table>
        </div>
        <div className="listSummaryGrid" aria-label="Stored word list summary">
          {listSummary.map((list) => <div key={list.id}><strong>{list.name}</strong><span>{list.wordCount} words · {list.configCount} configs</span></div>)}
        </div>
      </section>

      <section className="card" aria-labelledby="trend-heading">
        <div className="sectionHeader"><div><p className="eyebrow">Reporting view</p><h2 id="trend-heading">Seven-day activity trend</h2><p className="muted">Successful Wordle and Word Search generation plus recorded failures.</p></div></div>
        <div className="trendChart" role="img" aria-label="Seven day activity generation trend">
          {daily.map((day) => {
            const total = day.wordle + day.wordsearch + day.failures;
            const height = total ? Math.max(12, (total / maxDaily) * 100) : 4;
            return <div className="trendColumn" key={day.key} title={`${day.label}: ${day.wordle} Wordle, ${day.wordsearch} Word Search, ${day.failures} failures`}>
              <div className="trendBar" style={{ height: `${height}%` }}><span>{total || ''}</span></div>
              <small>{day.label}</small>
            </div>;
          })}
        </div>
      </section>

      <section className="grid2" aria-label="Alerts and recent events">
        <article className="card">
          <p className="eyebrow">Alerts</p>
          <h2>Operational indicators</h2>
          <div className="alertList">
            {alerts.map((alert, index) => <div className={`alertItem ${alert.level}`} key={`${alert.title}-${index}`}>
              <span className={`statusDot ${alert.level === 'warning' ? 'warning' : alert.level}`} aria-hidden="true" />
              <div><strong>{alert.title}</strong><p>{alert.detail}</p></div>
            </div>)}
          </div>
        </article>

        <article className="card">
          <p className="eyebrow">Evidence</p>
          <h2>What is being monitored</h2>
          <ul className="steps">
            <li>Database health through a real <code className="codeLike">SELECT 1</code> query.</li>
            <li>Wordle and Word Search generation success/failure events.</li>
            <li>Page views and browser time-on-page records.</li>
            <li>Empty-list and low-success-rate warning conditions.</li>
            <li>Stored builder records and activity-configuration counts.</li>
          </ul>
        </article>
      </section>

      <section className="card" aria-labelledby="events-heading">
        <div className="sectionHeader"><div><p className="eyebrow">Database-backed log</p><h2 id="events-heading">Recent operational events</h2></div></div>
        <div className="tableWrap">
          <table>
            <thead><tr><th>Time</th><th>Event</th><th>Activity/page</th><th>Source</th><th>Details</th></tr></thead>
            <tbody>{recentEvents.map((event) => <tr key={event.id}>
              <td>{new Date(event.createdAt).toLocaleString('en-AU')}</td>
              <td><span className="badge">{formatEvent(event)}</span></td>
              <td>{event.activityType === 'wordsearch' ? 'Word Search' : event.activityType === 'wordle' ? 'Wordle' : (event.page || '—')}</td>
              <td><span className={`badge ${event.source === 'simulated' ? 'simulatedBadge' : ''}`}>{event.source}</span></td>
              <td>{event.durationMs ? formatDuration(event.durationMs / 1000) : event.message || '—'}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
