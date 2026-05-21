import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'ZizkaDB — your agent stops behaving like itself, you know first',
    template: '%s · ZizkaDB',
  },
  description:
    'ZizkaDB watches every agent session, builds a behavioral baseline, and flags the ones that drift. Causal lineage, time travel and semantic search for any AI agent.',
  metadataBase: new URL('https://db.zizka.ai'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-32.png', type: 'image/png', sizes: '32x32' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'ZizkaDB — your agent stops behaving like itself, you know first',
    description:
      'ZizkaDB watches every agent session, builds a behavioral baseline, and flags the ones that drift.',
    url: 'https://db.zizka.ai',
    siteName: 'ZizkaDB',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'ZizkaDB' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZizkaDB',
    description:
      'ZizkaDB watches every agent session, builds a behavioral baseline, and flags the ones that drift.',
    images: ['/opengraph-image'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
