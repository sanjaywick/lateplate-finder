/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'www.archanaskitchen.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'placeholder.com',
      'picsum.photos'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com https://maps.gstatic.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' data: blob: https: http:;
              font-src 'self' https://fonts.gstatic.com;
              connect-src 'self' https://maps.googleapis.com https://maps.gstatic.com;
              frame-src 'self' https://maps.google.com;
            `.replace(/\s+/g, ' ').trim()
          },
        ],
      },
    ]
  },
}

export default nextConfig
