import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Transpile workspace packages
  transpilePackages: ["@findeg/backend", "@findeg/ui"],
  // Prevent server-only packages from being bundled on the client
  serverExternalPackages: [
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
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    //   turbopackFileSystemCacheForDev: true,
    // Enable Partial Prerendering (Next.js 16 feature)
    // Note: Requires compatible data fetching patterns
    ppr: false, // Set to true when data patterns are PPR-compatible
  },
};

export default withNextIntl(nextConfig);
