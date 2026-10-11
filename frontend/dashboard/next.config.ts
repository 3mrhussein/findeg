import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: process.env.VERIFY_CLIENT_BUNDLE === '1',
  // Turbopack bundles TypeScript workspace packages automatically; pure Money/UI are client-safe.
  transpilePackages: ['@findeg/ui', '@findeg/money'],
  // Orders stays bundled: its public exports are TypeScript source and its UI entry is pure.
  // External packages use native server require; this setting does not enforce client safety.
  serverExternalPackages: [
    '@findeg/backend', // Keep backend external to avoid bundling infrastructure
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
    // This allows Turbopack to properly resolve @backend package imports
    root: path.join(__dirname, '../..'),
  },
};

export default withNextIntl(nextConfig);
