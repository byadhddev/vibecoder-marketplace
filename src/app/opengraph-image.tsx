import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'vibeminis — The waitlist for AI-native builders';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

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
          backgroundColor: '#09090b',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(216,0,24,0.06) 0%, transparent 70%)',
          }}
        />

        {/* Brand mark — top */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 40,
          }}
        >
          <div style={{ width: 12, height: 12, backgroundColor: '#D80018' }} />
          <span
            style={{
              fontSize: 16,
              color: '#6b6b6e',
              letterSpacing: '0.2em',
              fontFamily: 'sans-serif',
              textTransform: 'uppercase' as const,
            }}
          >
            vibeminis
          </span>
        </div>

        {/* Main heading — large, bold, white */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            lineHeight: 1.1,
          }}
        >
          <span
            style={{
              fontSize: 80,
              fontWeight: 700,
              color: '#ffffff',
              fontFamily: 'serif',
              letterSpacing: '-0.03em',
              textAlign: 'center',
            }}
          >
            The waitlist for
          </span>
          <span
            style={{
              fontSize: 80,
              fontWeight: 700,
              color: '#D80018',
              fontFamily: 'serif',
              fontStyle: 'italic',
              letterSpacing: '-0.03em',
              textAlign: 'center',
            }}
          >
            AI-native builders
          </span>
        </div>

        {/* Subheading — clear, readable */}
        <p
          style={{
            fontSize: 26,
            color: '#a1a1a4',
            fontFamily: 'sans-serif',
            marginTop: 28,
            textAlign: 'center',
            lineHeight: 1.5,
            fontWeight: 400,
          }}
        >
          Get discovered. Land real projects. Earn what you deserve.
        </p>

        {/* CTA — large, prominent */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: 44,
            backgroundColor: '#D80018',
            paddingLeft: 36,
            paddingRight: 36,
            paddingTop: 18,
            paddingBottom: 18,
            borderRadius: 4,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: 'white',
              fontFamily: 'sans-serif',
              letterSpacing: '0.02em',
            }}
          >
            Join Waitlist
          </span>
        </div>

        {/* URL — bottom */}
        <span
          style={{
            position: 'absolute',
            bottom: 28,
            fontSize: 13,
            color: '#3f3f42',
            fontFamily: 'sans-serif',
            letterSpacing: '0.15em',
            textTransform: 'uppercase' as const,
          }}
        >
          vibeminis.byadhd.dev
        </span>
      </div>
    ),
    { ...size },
  );
}
