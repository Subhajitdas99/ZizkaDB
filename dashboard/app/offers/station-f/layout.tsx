import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Station F Startup Offer',
  description:
    'Station F startups get 6 months of free ZizkaDB API access on Pro or Team with code SF180. Agent behavior monitoring for production AI agents.',
}

export default function StationFOfferLayout({ children }: { children: React.ReactNode }) {
  return children
}
