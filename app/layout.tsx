import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://kribiland.com'),
  title: 'KribiLand — Découvrez, séjournez et vivez Kribi',
  description:
    'KribiLand vous aide à découvrir les meilleurs logements, expériences, restaurants et services pour profiter pleinement de votre séjour à Kribi, Cameroun.',
  keywords: [
    'Kribi',
    'Cameroun',
    'tourisme',
    'séjour',
    'logement',
    'hôtel',
    'restaurant',
    'expériences',
    'KribiLand',
  ],
  authors: [{ name: 'KribiLand' }],
  icons: {
    icon: [
      { url: '/images/favicon/favicon.ico' },
      { url: '/images/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/images/favicon/favicon-128x128.png', sizes: '128x128', type: 'image/png' },
      { url: '/images/favicon/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/favicon/favicon-256x256.png', sizes: '256x256', type: 'image/png' },
      { url: '/images/favicon/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/images/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/images/favicon/favicon.ico',
  },
  manifest: '/images/favicon/site.webmanifest',
  openGraph: {
    title: 'KribiLand — Découvrez, séjournez et vivez Kribi',
    description:
      'KribiLand vous aide à découvrir les meilleurs logements, expériences, restaurants et services pour profiter pleinement de votre séjour à Kribi, Cameroun.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'KribiLand',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KribiLand — Découvrez, séjournez et vivez Kribi',
    description:
      'KribiLand vous aide à découvrir les meilleurs logements, expériences, restaurants et services pour profiter pleinement de votre séjour à Kribi, Cameroun.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
