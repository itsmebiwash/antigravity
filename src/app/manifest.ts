import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Nebula Vision',
        short_name: 'Nebula',
        description: 'A high-end, futuristic 3D Spatial Interactive website',
        start_url: '/nebula/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
            {
                src: '/nebula/logo.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/nebula/logo.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
