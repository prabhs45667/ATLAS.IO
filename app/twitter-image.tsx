import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Atlas.io — Guess the Place & Era'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
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
          background: 'radial-gradient(ellipse at center, #2a1a0e 0%, #110a05 50%, #000000 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient glow effects */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: '50%',
            height: '60%',
            background: 'radial-gradient(ellipse, rgba(180, 100, 40, 0.3) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-20%',
            right: '-10%',
            width: '50%',
            height: '60%',
            background: 'radial-gradient(ellipse, rgba(180, 100, 40, 0.25) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Main title */}
        <div
          style={{
            display: 'flex',
            fontSize: 96,
            fontWeight: 700,
            color: '#f5f0eb',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            textShadow: '0 0 60px rgba(200, 130, 60, 0.4)',
            fontFamily: 'Georgia, serif',
          }}
        >
          ATLAS.IO
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            fontWeight: 600,
            color: '#c47a4a',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            marginTop: 20,
            fontFamily: 'Georgia, serif',
          }}
        >
          GUESS THE PLACE & ERA
        </div>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            fontSize: 18,
            color: 'rgba(245, 240, 235, 0.5)',
            marginTop: 24,
            fontStyle: 'italic',
            letterSpacing: '0.1em',
            fontFamily: 'Georgia, serif',
          }}
        >
          Where in the world. When in time.
        </div>

        {/* Bottom border accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, transparent, #c47a4a, transparent)',
            display: 'flex',
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  )
}
