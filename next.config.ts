import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['@mediapipe/hands', '@mediapipe/drawing_utils'],
  webpack: (config) => {
    // Resolve @mediapipe/hands for client-side only
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    
    return config;
  },
};

export default nextConfig;
