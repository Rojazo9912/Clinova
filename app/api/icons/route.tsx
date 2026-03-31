import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

// Shared icon JSX — letter A with ECG as the crossbar
function IconJSX({ s }: { s: number }) {
    return (
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
            {/* Subtle radial glow behind the A */}
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

            {/* SVG: A strokes + ECG crossbar */}
            <svg
                width={s * 0.72}
                height={s * 0.72}
                viewBox="0 0 100 100"
            >
                {/* Left leg of A */}
                <line
                    x1="13" y1="88"
                    x2="50" y2="11"
                    stroke="white"
                    strokeWidth="8"
                    strokeLinecap="round"
                />
                {/* Right leg of A */}
                <line
                    x1="87" y1="88"
                    x2="50" y2="11"
                    stroke="white"
                    strokeWidth="8"
                    strokeLinecap="round"
                />

                {/* ECG glow layer (wider, transparent) */}
                <polyline
                    points="33,52 37,52 40,47 43,52 45,52 49,27 51,77 55,52 58,52 61,58 64,52 67,52"
                    stroke="#22d3ee"
                    strokeWidth="7"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.18"
                />
                {/* ECG main line */}
                <polyline
                    points="33,52 37,52 40,47 43,52 45,52 49,27 51,77 55,52 58,52 61,58 64,52 67,52"
                    stroke="#22d3ee"
                    strokeWidth="2.8"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    )
}

export async function GET(req: NextRequest) {
    const s = Math.min(512, Math.max(16, Number(req.nextUrl.searchParams.get('size') || '512')))

    return new ImageResponse(<IconJSX s={s} />, { width: s, height: s })
}
