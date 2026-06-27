import Link from 'next/link'
import { BRAND, BRAND_DARK } from '@/components/brand'
import { M } from '@/components/marketing/marketing-theme'

export const STATION_F_CODE = 'SF180'
export const STATION_F_OFFER_PATH = '/offers/station-f'

/** Full-width CTA strip placed directly under the homepage hero */
export function StationFOfferBanner() {
  return (
    <section style={{ padding: '0 40px 8px', position: 'relative', zIndex: 3 }}>
      <Link
        href={STATION_F_OFFER_PATH}
        style={{
          display: 'block',
          maxWidth: 1100,
          margin: '0 auto',
          textDecoration: 'none',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 16px 48px rgba(37,99,235,0.22), 0 8px 24px rgba(249,115,22,0.12)',
          border: '1px solid rgba(59,130,246,0.35)',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
          padding: '22px 28px',
          background: 'linear-gradient(105deg, #1d4ed8 0%, #2563eb 38%, #ea580c 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1, minWidth: 240 }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.16)',
              border: '1px solid rgba(255,255,255,0.28)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 900,
              color: '#fff',
              flexShrink: 0,
            }}>
              SF
            </div>
            <div>
              <div style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1,
                color: 'rgba(255,255,255,0.85)',
                marginBottom: 4,
                textTransform: 'uppercase',
              }}>
                Station F startups
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1.25 }}>
                6 months free API access on Pro or Team
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.88)', marginTop: 4 }}>
                Use code <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 700,
                  background: 'rgba(0,0,0,0.2)',
                  padding: '2px 8px',
                  borderRadius: 6,
                }}>{STATION_F_CODE}</span> at signup
              </div>
            </div>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 24px',
            borderRadius: 12,
            background: '#fff',
            color: M.blueDark,
            fontWeight: 800,
            fontSize: 15,
            flexShrink: 0,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          }}>
            Claim Station F offer
            <span style={{ color: BRAND_DARK, fontSize: 18 }}>→</span>
          </div>
        </div>
      </Link>
    </section>
  )
}

export const stationFPlans = [
  {
    id: 'pro' as const,
    name: 'Pro',
    subtitle: 'Solo founders & small teams',
    price: '€39',
    features: ['100M events / month', '90-day retention', '3 projects', 'Full API + dashboard'],
    accent: BRAND,
    bg: '#fff7ed',
  },
  {
    id: 'team' as const,
    name: 'Team',
    subtitle: 'Growing startup teams',
    price: '€99',
    features: ['Up to 1B events / month', '1-year retention', '10 seats', 'Priority support'],
    accent: M.blue,
    bg: M.bluePale,
  },
]
