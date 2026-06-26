import type { Metadata } from 'next'
import './globals.css'

const TAGLINE =
  'Production monitoring for AI agents. Catch behavioral drift, trace every decision, and explain failures before users complain. Start free at db.zizka.ai.'

export const metadata: Metadata = {
  title: {
    default: 'ZizkaDB — Know when your agent breaks in production',
    template: '%s · ZizkaDB',
  },
  description: TAGLINE,
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
    title: 'ZizkaDB — Know when your agent breaks in production',
    description: TAGLINE,
    url: 'https://db.zizka.ai',
    siteName: 'ZizkaDB',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'ZizkaDB' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZizkaDB — Know when your agent breaks in production',
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
