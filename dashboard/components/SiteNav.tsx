import Link from 'next/link'
import type { CSSProperties } from 'react'
import { brandCtaStyle, brandLogoStyle } from './brand'

export type SiteNavActive = 'docs' | 'community' | 'trust' | 'explorer' | 'home'

type SiteNavProps = {
  active?: SiteNavActive
  /** e.g. "Docs" shows as "ZizkaDB / Docs" */
  suffix?: string
}

const linkStyle = (on: boolean): CSSProperties => ({
  fontSize: 14,
  color: on ? '#111' : '#555',
  fontWeight: on ? 600 : 400,
  textDecoration: 'none',
})

export function SiteNav({ active, suffix }: SiteNavProps) {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        height: 56,
        borderBottom: '1px solid #f0f0f0',
        position: 'sticky',
        top: 0,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
      }}
    >
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
        <div style={brandLogoStyle}>
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>Z</span>
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>ZizkaDB</span>
        {suffix ? (
          <span className="site-nav-suffix" style={{ fontSize: 12, color: '#aaa', marginLeft: 2 }}>
            / {suffix}
          </span>
        ) : (
          <span className="site-nav-suffix" style={{ fontSize: 12, color: '#aaa', marginLeft: 4 }}>
            by Zizka AI
          </span>
        )}
      </Link>

      <div className="site-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Link href="/docs" style={linkStyle(active === 'docs')}>Docs</Link>
        <Link href="/community" style={linkStyle(active === 'community')}>Community</Link>
        <a href="/swagger" style={linkStyle(active === 'explorer')}>API Explorer</a>
        <Link href="/login" style={{
          fontSize: 14, fontWeight: 500, color: '#111', textDecoration: 'none',
          padding: '7px 16px', border: '1px solid #ddd', borderRadius: 8,
        }}>
          Sign in
        </Link>
        <Link href="/signup" style={brandCtaStyle}>Start free →</Link>
      </div>

      <div className="site-nav-cta" style={{ display: 'none', alignItems: 'center', gap: 8 }}>
        <Link href="/login" style={{
          fontSize: 13, fontWeight: 500, color: '#111', textDecoration: 'none',
          padding: '6px 12px', border: '1px solid #ddd', borderRadius: 8,
        }}>
          Sign in
        </Link>
        <Link href="/signup" style={{ ...brandCtaStyle, fontSize: 13, padding: '6px 14px' }}>Start free →</Link>
      </div>

    </nav>
  )
}
