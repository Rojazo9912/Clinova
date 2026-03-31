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
                    background: 'linear-gradient(150deg, #0a0a1f 0%, #0d1b6e 55%, #1e40af 100%)',
                    borderRadius: s * 0.22,
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                {/* Subtle radial glow */}
                <div
                    style={{
                        position: 'absolute',
                        width: s * 0.6,
                        height: s * 0.6,
                        borderRadius: '50%',
                        background:
                            'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)',
                        display: 'flex',
                    }}
                />

                <svg width={s * 0.72} height={s * 0.72} viewBox="0 0 100 100">
                    <line x1="13" y1="88" x2="50" y2="11"
                        stroke="white" strokeWidth="8" strokeLinecap="round" />
                    <line x1="87" y1="88" x2="50" y2="11"
                        stroke="white" strokeWidth="8" strokeLinecap="round" />
                    {/* ECG glow */}
                    <polyline
                        points="33,52 37,52 40,47 43,52 45,52 49,27 51,77 55,52 58,52 61,58 64,52 67,52"
                        stroke="#22d3ee" strokeWidth="7" fill="none"
                        strokeLinecap="round" strokeLinejoin="round" opacity="0.18"
                    />
                    {/* ECG line */}
                    <polyline
                        points="33,52 37,52 40,47 43,52 45,52 49,27 51,77 55,52 58,52 61,58 64,52 67,52"
                        stroke="#22d3ee" strokeWidth="2.8" fill="none"
                        strokeLinecap="round" strokeLinejoin="round"
                    />
                </svg>
            </div>
        ),
        { ...size }
    )
}
