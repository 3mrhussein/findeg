import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // The build wrapper inspects emitted client modules, then removes these maps.
  productionBrowserSourceMaps: process.env.VERIFY_CLIENT_BUNDLE === '1',
  // Turbopack bundles TypeScript workspace packages automatically; pure Money/UI are client-safe.
  transpilePackages: ['@findeg/ui', '@findeg/money'],
  // Native third-party dependencies stay external on the server. Client entry lint and build checks protect browser bundles.
  serverExternalPackages: [
    'postgres',
    'drizzle-orm',
    'bcryptjs',
    'jose',
    'jsonwebtoken',
    'sharp',
    'nodemailer',
  ],
  // Enable React Strict Mode
  reactStrictMode: true,
  // Enable React Compiler for automatic memoization (Next.js 16 stable)
  reactCompiler: true,

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Cache Components - enabled for Next.js 16
  cacheComponents: true,

  // Turbopack configuration for monorepo support
  turbopack: {
    // Set root to monorepo root to resolve cross-package dependencies
    root: path.join(__dirname, '../..'),
  },
};

export default withNextIntl(nextConfig);
