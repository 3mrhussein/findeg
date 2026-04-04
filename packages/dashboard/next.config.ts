import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
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

  // Cache Components - disabled for now
  // c acheComponents: true,
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
