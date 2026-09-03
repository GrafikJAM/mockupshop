import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'GrafikJAM Mockups — High-quality Photoshop mockups'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage() {
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
          background: '#0c0c0b',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: '#f0ede8',
            letterSpacing: '-0.02em',
            display: 'flex',
          }}
        >
          GrafikJAM Mockups
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 30,
            color: '#00ffb0',
            display: 'flex',
          }}
        >
          High-quality Photoshop mockups
        </div>
      </div>
    ),
    { ...size }
  )
}
