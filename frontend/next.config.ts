import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true
  },
  // Disable automatic trailing slash redirect for API routes
  trailingSlash: false,
};

export default nextConfig;
