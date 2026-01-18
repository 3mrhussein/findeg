import type { NextConfig } from "next";

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

  // Cache Components configuration
  cacheComponents: true,
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
