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

  // Turbopack configuration for monorepo support
  turbopack: {
    // Set root to monorepo root to resolve cross-package dependencies
    root: path.join(__dirname, "../.."),
  },

  typescript: {
    // Temporarily disabled while backend @features/* imports are being cleaned up (spec 005)
    // TODO: Re-enable after comprehensive backend import cleanup
    // ignoreBuildErrors: true,
  },
  experimental: {
    //   turbopackFileSystemCacheForDev: true,
    // Enable Partial Prerendering (Next.js 16 feature)
    // Note: Requires compatible data fetching patterns
    ppr: false, // Set to true when data patterns are PPR-compatible
  },
};

export default withNextIntl(nextConfig);
