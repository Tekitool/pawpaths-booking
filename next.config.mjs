import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here - full audit build */
  reactCompiler: true,
  // output: 'standalone' — disabled while using Sentry on Windows dev; Vercel handles bundling natively
  serverExternalPackages: ['@sentry/profiling-node'],
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

export default withSentryConfig(nextConfig, {
  // Sentry build options
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Upload source maps for readable stack traces
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Suppress noisy build logs
  silent: !process.env.CI,

  // Tree-shake unused Sentry features in production
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
    excludeReplayIframe: true,
    excludeReplayShadowDom: true,
  },
});
