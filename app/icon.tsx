import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
    const s = 32
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
                <div
                    style={{
                        fontSize: s * 0.6,
                        fontWeight: 900,
                        color: 'white',
                        lineHeight: 1,
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        display: 'flex',
                    }}
                >
                    A
                </div>
            </div>
        ),
        { ...size }
    )
}
