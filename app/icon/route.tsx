import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const sizeParam = searchParams.get('size')
    const size = sizeParam ? parseInt(sizeParam) : 32

    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: size * 0.6, // Scale font size
                    background: '#2563eb',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    borderRadius: size * 0.1, // Scale border radius
                    fontWeight: 800,
                }}
            >
                FN
            </div>
        ),
        {
            width: size,
            height: size,
        }
    )
}
