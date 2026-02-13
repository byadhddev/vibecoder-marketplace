import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getMarketplaceByUsername } from '@/lib/github/queries';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    if (!username) {
        return new ImageResponse(
            <div style={{ display: 'flex', width: '100%', height: '100%', background: '#242423', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 24, height: 24, background: '#d80018' }} />
                    <span style={{ color: '#fff', fontSize: 32, fontFamily: 'serif' }}>VibeCoder</span>
                </div>
            </div>,
            { width: 1200, height: 630 },
        );
    }

    const data = await getMarketplaceByUsername(username);
    if (!data) {
        return new ImageResponse(
            <div style={{ display: 'flex', width: '100%', height: '100%', background: '#242423', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: 24 }}>Not Found</span>
            </div>,
            { width: 1200, height: 630 },
        );
    }

    const { profile, showcases } = data;
    const published = showcases.filter(s => s.status === 'published');

    return new ImageResponse(
        <div style={{ display: 'flex', width: '100%', height: '100%', background: '#242423', padding: 60 }}>
            {/* Left: Avatar */}
            <div style={{ display: 'flex', width: 280, height: 280, overflow: 'hidden', flexShrink: 0 }}>
                {profile.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} width={280} height={280} style={{ objectFit: 'cover' }} />
                ) : (
                    <div style={{ width: 280, height: 280, background: '#d80018' }} />
                )}
            </div>

            {/* Right: Info */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginLeft: 48, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{ width: 12, height: 12, background: '#d80018' }} />
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                        VibeCoder
                    </span>
                </div>

                <span style={{ color: '#fff', fontSize: 42, fontFamily: 'serif', lineHeight: 1.1, marginBottom: 8 }}>
                    {profile.name}
                </span>

                {profile.role && (
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, fontFamily: 'monospace', marginBottom: 24 }}>
                        {profile.role}
                    </span>
                )}

                <div style={{ display: 'flex', gap: 32 }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: '#d80018', fontSize: 28, fontFamily: 'monospace', fontWeight: 700 }}>
                            {published.length}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                            Showcases
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: '#d80018', fontSize: 28, fontFamily: 'monospace', fontWeight: 700 }}>
                            {profile.total_views || 0}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                            Views
                        </span>
                    </div>
                </div>

                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, fontFamily: 'monospace', marginTop: 24 }}>
                    vibecoder.dev/m/{profile.username}
                </span>
            </div>
        </div>,
        { width: 1200, height: 630 },
    );
}
