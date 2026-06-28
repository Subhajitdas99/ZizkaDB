import type { Metadata } from 'next'
import './globals.css'

const TAGLINE =
  'Production observability for engineering teams shipping AI agents and agentic systems. Record every decision, detect behavior drift, and replay any session. From the team behind zizka.ai.'

export const metadata: Metadata = {
  title: {
    default: 'ZizkaDB — Know when your AI agent starts failing customers',
    template: '%s · ZizkaDB',
  },
  description: TAGLINE,
  metadataBase: new URL('https://db.zizka.ai'),
  icons: {
    icon: [
      { url: '/icon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/zizka-logo.png', type: 'image/png' },
    ],
    shortcut: '/icon-32.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'ZizkaDB — Know when your AI agent starts failing customers',
    description: TAGLINE,
    url: 'https://db.zizka.ai',
    siteName: 'ZizkaDB',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'ZizkaDB' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZizkaDB — Know when your AI agent starts failing customers',
    description: TAGLINE,
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
