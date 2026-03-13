import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/nebula',
  assetPrefix: '/nebula',
  trailingSlash: true,

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;