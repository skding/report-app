import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Clover Digital - Service & Maintenance Reporting System',
  description: 'Enterprise digital site service and maintenance reporting platform for Clover Digital Sdn Bhd.',
  icons: {
    icon: '/logo-transparent.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
