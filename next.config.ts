import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  allowedDevOrigins: ['10.0.0.60', '127.0.0.1'],
  turbopack: {},
};

export default nextConfig;
