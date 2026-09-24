import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'GrafikJAM Mockups — Photoshop mockups that make your work look loud'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// This is what Google/Slack/social previews were pulling for the homepage
// until now — it was left over from before the yellow/red rebrand (still
// had the old teal accent and a generic "High-quality Photoshop mockups"
// line instead of the actual site copy), so it read as an unbranded
// placeholder card. Redone to match the current identity: same off-white
// background and headline as the homepage hero, current accent colors,
// and the real tagline instead of filler text.
export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#fafaf8',
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: '#0c0c0b',
          }}
        >
          <div style={{ display: 'flex', width: 14, height: 14, borderRadius: '50%', background: '#ea1c24' }} />
          GRAFIKJAM MOCKUPS
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
            color: '#0c0c0b',
          }}
        >
          <div style={{ display: 'flex' }}>Mockups that make</div>
          <div style={{ display: 'flex' }}>your work look loud</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 24,
              fontWeight: 600,
              color: '#ea1c24',
              background: '#f6ec3e',
              padding: '12px 24px',
              borderRadius: 8,
              border: '2px solid #ea1c24',
            }}
          >
            Get access from $99
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
