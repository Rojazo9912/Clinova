import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'AxoMed — Gestión de Clínica',
        short_name: 'AxoMed',
        description: 'Gestión Inteligente para Clínicas de Fisioterapia',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0f172a',
        theme_color: '#2563eb',
        categories: ['medical', 'health', 'productivity'],
        icons: [
            { src: '/api/icons?size=72',  sizes: '72x72',  type: 'image/png' },
            { src: '/api/icons?size=96',  sizes: '96x96',  type: 'image/png' },
            { src: '/api/icons?size=128', sizes: '128x128', type: 'image/png' },
            { src: '/api/icons?size=144', sizes: '144x144', type: 'image/png' },
            { src: '/api/icons?size=152', sizes: '152x152', type: 'image/png' },
            { src: '/api/icons?size=192', sizes: '192x192', type: 'image/png' },
            { src: '/api/icons?size=384', sizes: '384x384', type: 'image/png' },
            { src: '/api/icons?size=512', sizes: '512x512', type: 'image/png' },
            // Icono maskable: Android lo usa para el ícono redondeado en el launcher
            { src: '/api/icons?size=512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
    }
}
