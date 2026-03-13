import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/nebula',
  // Ye line sabse zaroori hai proxy setup ke liye
  assetPrefix: '/nebula',
  // 404 fix karne ke liye trailing slash ko handle karein
  trailingSlash: true,

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;