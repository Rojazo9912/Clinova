import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'FisioNova',
        short_name: 'FisioNova',
        description: 'Gestión Inteligente para Clínicas de Fisioterapia',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2563eb',
        icons: [
            {
                src: '/icon?size=192', // Dynamic icon generator
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon?size=512', // Dynamic icon generator
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
