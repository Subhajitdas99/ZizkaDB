import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'ZizkaDB'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 120,
            height: 120,
            background: '#f97316',
            borderRadius: 28,
            fontSize: 72,
            fontWeight: 900,
            marginBottom: 32,
          }}
        >
          Z
        </div>
        <div style={{ fontSize: 64, fontWeight: 800 }}>ZizkaDB</div>
        <div style={{ fontSize: 28, color: '#94a3b8', marginTop: 16, maxWidth: 800, textAlign: 'center' }}>
          Know when your agent stops behaving like itself
        </div>
      </div>
    ),
    { ...size },
  )
}
