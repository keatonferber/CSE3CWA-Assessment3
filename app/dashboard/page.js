import DashboardClient from '@/components/DashboardClient';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <section>
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">Assessment 3 reporting</p>
          <h1>Operational dashboard</h1>
          <p className="lead">Monitor stored builder data, generated activities, usage, timing, health and warning conditions. The reporting data is persisted in PostgreSQL and combines seeded simulated records with live application events.</p>
        </div>
      </div>
      <DashboardClient />
    </section>
  );
}
