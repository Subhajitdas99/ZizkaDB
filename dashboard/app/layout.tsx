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
  openGraph: {
    title: 'ZizkaDB — your agent stops behaving like itself, you know first',
    description:
      'ZizkaDB watches every agent session, builds a behavioral baseline, and flags the ones that drift.',
    url: 'https://db.zizka.ai',
    siteName: 'ZizkaDB',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'ZizkaDB',
    description:
      'ZizkaDB watches every agent session, builds a behavioral baseline, and flags the ones that drift.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
