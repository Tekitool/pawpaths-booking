/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here - full audit build */
  reactCompiler: true,
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'pawpathsae.com', 'www.pawpathsae.com', '.pawpathsae.com', '*.vercel.app'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cmqccuszskcawmjupqjn.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/admin/bookings',
        destination: '/admin/relocations',
        permanent: true,
      },
      {
        source: '/admin/bookings/:id',
        destination: '/admin/relocations/:id',
        permanent: true,
      },
      // Security: obscure login entry point from scrapers
      {
        source: '/login',
        destination: '/admin/login',
        permanent: true,
      },
    ];
  },

};

export default nextConfig;
