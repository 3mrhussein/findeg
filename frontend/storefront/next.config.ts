import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Transpile workspace packages (UI only - backend should remain external)
  transpilePackages: ['@findeg/ui'],
  // Prevent server-only packages from being bundled on the client
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
    root: path.join(__dirname, '../..'),
  },
};

export default withNextIntl(nextConfig);
