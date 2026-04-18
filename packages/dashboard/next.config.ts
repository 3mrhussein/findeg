import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Transpile workspace packages (UI only - backend should remain external)
  transpilePackages: ["ui"],
  // Prevent server-only packages from being bundled on the client
  serverExternalPackages: [
    "backend", // Keep backend external to avoid bundling infrastructure
    "postgres",
    "drizzle-orm",
    "bcryptjs",
    "jose",
    "jsonwebtoken",
    "sharp",
    "nodemailer",
  ],
  // Enable React Strict Mode
  reactStrictMode: true,
  // Enable React Compiler for automatic memoization (Next.js 16 stable)
  reactCompiler: true,

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Cache Components - enabled for Next.js 16
  cacheComponents: true,

  // Cache Life Profiles - custom TTL configurations for different data types
  cacheLife: {
    // Product catalog - moderate freshness (10min client, 30min server)
    products: {
      stale: 600, // Client cache: 10 minutes
      revalidate: 1800, // Server revalidation: 30 minutes
      expire: 86400, // Hard expire: 24 hours
    },
    // Analytics/Stats - slower changes (1hr client, 12hr server)
    analytics: {
      stale: 3600, // Client cache: 1 hour
      revalidate: 43200, // Server revalidation: 12 hours
      expire: 604800, // Hard expire: 7 days
    },
    // Real-time data - very fresh (1min client, 5min server)
    realtime: {
      stale: 60, // Client cache: 1 minute
      revalidate: 300, // Server revalidation: 5 minutes
      expire: 3600, // Hard expire: 1 hour
    },
  },

  // Turbopack configuration for monorepo support
  turbopack: {
    // Set root to monorepo root to resolve cross-package dependencies
    // This allows Turbopack to properly resolve @backend package imports
    root: path.join(__dirname, "../.."),
  },
};

export default withNextIntl(nextConfig);
