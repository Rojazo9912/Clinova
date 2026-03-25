import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
    const s = 180
    return new ImageResponse(
        (
            <div
                style={{
                    width: s,
                    height: s,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(145deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
                    borderRadius: s * 0.22,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Glow ring */}
                <div
                    style={{
                        position: 'absolute',
                        width: s * 0.75,
                        height: s * 0.75,
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
                        gap: s * 0.04,
                        zIndex: 1,
                    }}
                >
                    {/* Letter A */}
                    <div
                        style={{
                            fontSize: s * 0.48,
                            fontWeight: 900,
                            color: 'white',
                            lineHeight: 1,
                            letterSpacing: -s * 0.01,
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            textShadow: `0 0 ${s * 0.08}px rgba(147,197,253,0.8)`,
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
                            width: s * 0.55,
                            height: s * 0.1,
                        }}
                    >
                        <svg
                            width={s * 0.55}
                            height={s * 0.1}
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
                            fontSize: s * 0.1,
                            fontWeight: 700,
                            color: 'rgba(147,197,253,0.85)',
                            letterSpacing: s * 0.025,
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
                        top: s * 0.08,
                        right: s * 0.08,
                        width: s * 0.18,
                        height: s * 0.18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.12)',
                        borderRadius: s * 0.05,
                        border: '1.5px solid rgba(255,255,255,0.2)',
                    }}
                >
                    <svg
                        width={s * 0.1}
                        height={s * 0.1}
                        viewBox="0 0 20 20"
                        fill="white"
                    >
                        <rect x="8" y="2" width="4" height="16" rx="2" />
                        <rect x="2" y="8" width="16" height="4" rx="2" />
                    </svg>
                </div>
            </div>
        ),
        { ...size }
    )
}
