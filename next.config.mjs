/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['192.168.1.45:3000', 'localhost:3000', 'booking.pawpathsae.com', 'pawpaths-bms.vercel.app', '*.vercel.app'],
    },
  },
};

export default nextConfig;
