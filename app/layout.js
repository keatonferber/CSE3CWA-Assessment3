import './globals.css';
import { cookies } from 'next/headers';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import UsageTracker from '@/components/UsageTracker';

export const metadata = {
  title: 'Phoneme Activity Builder — Assessment 3',
  description: 'A data-driven teacher tool with dashboard reporting, observability and phoneme-based Wordle and Word Search generation.'
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const theme = cookieStore.get('speech_builder_theme')?.value === 'dark' ? 'dark' : 'light';
  const density = cookieStore.get('speech_builder_density')?.value === 'compact' ? 'compact' : 'comfortable';

  return (
    <html lang="en" data-theme={theme} data-density={density}>
      <body>
        <UsageTracker />
        <Nav />
        <main className="pageShell">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
