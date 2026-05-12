import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'AgentDB — your agent stops behaving like itself, you know first',
    template: '%s · AgentDB',
  },
  description:
    'AgentDB watches every agent session, builds a behavioral baseline, and flags the ones that drift. Causal lineage, time travel and semantic search for any AI agent.',
  metadataBase: new URL('https://agentdb.zizka.ai'),
  openGraph: {
    title: 'AgentDB — your agent stops behaving like itself, you know first',
    description:
      'AgentDB watches every agent session, builds a behavioral baseline, and flags the ones that drift.',
    url: 'https://agentdb.zizka.ai',
    siteName: 'AgentDB',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AgentDB',
    description:
      'AgentDB watches every agent session, builds a behavioral baseline, and flags the ones that drift.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
