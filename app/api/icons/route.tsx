import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
    const size = Math.min(512, Math.max(16, Number(req.nextUrl.searchParams.get('size') || '512')))

    return new ImageResponse(
        (
            <div
                style={{
                    width: size,
                    height: size,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(145deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
                    borderRadius: size * 0.22,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Glow ring */}
                <div
                    style={{
                        position: 'absolute',
                        width: size * 0.75,
                        height: size * 0.75,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(96,165,250,0.15) 0%, transparent 70%)',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        display: 'flex',
                    }}
                />

                {/* Main content */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: size * 0.04,
                        zIndex: 1,
                    }}
                >
                    {/* Letter A */}
                    <div
                        style={{
                            fontSize: size * 0.48,
                            fontWeight: 900,
                            color: 'white',
                            lineHeight: 1,
                            letterSpacing: -size * 0.01,
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            textShadow: `0 0 ${size * 0.08}px rgba(147,197,253,0.8)`,
                            display: 'flex',
                        }}
                    >
                        A
                    </div>

                    {/* Heartbeat line */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0,
                            width: size * 0.55,
                            height: size * 0.1,
                        }}
                    >
                        {/* SVG heartbeat line */}
                        <svg
                            width={size * 0.55}
                            height={size * 0.1}
                            viewBox="0 0 110 20"
                            fill="none"
                        >
                            <polyline
                                points="0,10 20,10 28,2 36,18 44,10 54,10 62,2 70,18 78,10 110,10"
                                stroke="rgba(147,197,253,0.9)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                        </svg>
                    </div>

                    {/* "MED" label */}
                    <div
                        style={{
                            fontSize: size * 0.1,
                            fontWeight: 700,
                            color: 'rgba(147,197,253,0.85)',
                            letterSpacing: size * 0.025,
                            fontFamily: 'system-ui, sans-serif',
                            display: 'flex',
                        }}
                    >
                        MED
                    </div>
                </div>

                {/* Cross medical badge — top right corner */}
                <div
                    style={{
                        position: 'absolute',
                        top: size * 0.08,
                        right: size * 0.08,
                        width: size * 0.18,
                        height: size * 0.18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.12)',
                        borderRadius: size * 0.05,
                        border: '1.5px solid rgba(255,255,255,0.2)',
                    }}
                >
                    {/* Plus/Cross */}
                    <svg
                        width={size * 0.1}
                        height={size * 0.1}
                        viewBox="0 0 20 20"
                        fill="white"
                    >
                        <rect x="8" y="2" width="4" height="16" rx="2" />
                        <rect x="2" y="8" width="16" height="4" rx="2" />
                    </svg>
                </div>
            </div>
        ),
        {
            width: size,
            height: size,
        }
    )
}
