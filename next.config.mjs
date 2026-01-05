/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['192.168.1.45:3000', 'localhost:3000', 'booking.pawpathsae.com', 'pawpaths-bms.vercel.app', '*.vercel.app'],
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
    ];
  },

};

export default nextConfig;
