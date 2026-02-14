import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    cacheComponents: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com',
            },
            {
                protocol: 'https',
                hostname: '*.githubusercontent.com',
            },
        ],
    },
};

export default nextConfig;
