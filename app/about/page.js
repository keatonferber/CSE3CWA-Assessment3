import { site } from '@/lib/site';

export default function AboutPage() {
  return (
    <section>
      <p className="eyebrow">Project context</p><h1>About the builder</h1>
      <p className="lead">This teacher-facing Speech Pathology activity builder continues the same project across the subject. Assessment 1 established the frontend workflow, Assessment 2 added database-backed CRUD and generation, and Assessment 3 adds reporting, persistent operational statistics, observability and testing evidence.</p>
      <div className="grid2" style={{ marginTop: 20 }}>
        <article className="card"><h2>Wordle</h2><p className="muted">A playable phoneme Wordle uses one phoneme per cell and provides positional feedback from stored HCE word data. Successful and failed generation attempts are recorded for reporting.</p></article>
        <article className="card"><h2>Word Search</h2><p className="muted">A phoneme grid is generated from a stored word list. Students select complete phoneme sequences using pointer or touch interaction, while the builder records operational generation data.</p></article>
        <article className="card"><h2>Accessibility</h2><p className="muted">The interface uses semantic controls, visible labels, keyboard focus states, responsive layouts, live status/error regions and teaching hints such as <strong>/θ/ — TH (as in thin)</strong>. Lighthouse provides the final audit evidence.</p></article>
        <article className="card"><h2>Technical structure</h2><p className="muted">Next.js provides the React frontend and server-side route handlers. Prisma connects to a separate PostgreSQL Docker service. Usage events are stored alongside builder data and aggregated by the operational dashboard.</p></article>
      </div>
      <div className="card" style={{ marginTop: 20 }}><h2>Student details</h2><p><strong>Name:</strong> {site.studentName}<br/><strong>Student number:</strong> {site.studentNumber}</p></div>
      <div className="card" style={{ marginTop: 20 }}><h2>How to use the website</h2><ol className="steps"><li>Manage word lists and ordered phoneme sequences on <strong>Word Lists</strong>.</li><li>Create or edit reusable database-backed settings on <strong>Activity Settings</strong>.</li><li>Open <strong>Wordle</strong> or <strong>Word Search</strong> to preview or generate an activity.</li><li>Open <strong>Dashboard</strong> to review health, usage, timing, failures, alerts and recent operational events.</li></ol></div>
    </section>
  );
}
