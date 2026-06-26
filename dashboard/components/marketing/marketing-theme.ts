import { BRAND, BRAND_DARK, BRAND_LIGHT, BRAND_PALE } from '@/components/brand'

/** Shared marketing palette — orange primary, slate + warm neutrals as support */
export const M = {
  brand: BRAND,
  brandDark: BRAND_DARK,
  brandLight: BRAND_LIGHT,
  brandPale: BRAND_PALE,
  ink: '#111',
  inkSoft: '#444',
  muted: '#6b7280',
  faint: '#9ca3af',
  line: '#e5e7eb',
  wash: '#fafafa',
  heroBg: 'linear-gradient(165deg, #0a0a0a 0%, #111827 50%, #0f172a 100%)',
  heroBorder: 'rgba(255,255,255,0.06)',
  slate: '#64748b',
  slateBg: '#f1f5f9',
  slateBorder: '#cbd5e1',
  success: '#16a34a',
  warn: '#eab308',
  danger: '#ef4444',
  previewBg: '#0d0d0d',
  previewBorder: '#1f1f1f',
  previewSurface: '#141414',
} as const

export const sectionPad = { padding: '72px 40px' } as const

export const container = (max = 960) => ({ maxWidth: max, margin: '0 auto' } as const)

export const h2 = {
  fontSize: 28,
  fontWeight: 700,
  letterSpacing: -0.5,
  color: M.ink,
  margin: '0 0 12px',
  textAlign: 'center' as const,
}

export const lead = {
  fontSize: 16,
  color: M.inkSoft,
  lineHeight: 1.65,
  textAlign: 'center' as const,
  maxWidth: 560,
  margin: '0 auto 48px',
}

export const primaryBtn = {
  display: 'inline-flex' as const,
  alignItems: 'center' as const,
  gap: 8,
  padding: '14px 28px',
  background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
  color: '#fff',
  borderRadius: 10,
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: 15,
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
}

export const ghostBtn = {
  display: 'inline-flex' as const,
  alignItems: 'center' as const,
  gap: 8,
  padding: '14px 24px',
  background: 'rgba(255,255,255,0.08)',
  color: '#fff',
  borderRadius: 10,
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: 15,
  border: '1px solid rgba(255,255,255,0.14)',
}

export const outlineBtn = {
  display: 'inline-flex' as const,
  alignItems: 'center' as const,
  gap: 8,
  padding: '12px 20px',
  background: '#fff',
  color: M.ink,
  borderRadius: 10,
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: 14,
  border: `1px solid ${M.line}`,
}
