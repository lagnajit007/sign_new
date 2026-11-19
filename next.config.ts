import path from "node:path";
import type { NextConfig } from "next";

// Origin of the recognition backend (Flask, hosted on Hugging Face Spaces).
// The browser calls it directly, so it must be allowed in connect-src.
function recognitionOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_RECOGNITION_API_URL;
  if (!raw) return process.env.NODE_ENV === "development" ? "http://127.0.0.1:7860 http://localhost:7860" : "";
  try {
    return new URL(raw).origin;
  } catch {
    return "";
  }
}

// TF.js handpose downloads its model from tfhub.dev, which redirects to Kaggle / GCS.
const MODEL_HOSTS = "https://tfhub.dev https://www.kaggle.com https://*.kaggle.com https://storage.googleapis.com";

const nextConfig: NextConfig = {
  // A stray lockfile in the home directory confuses workspace-root detection.
  outputFileTracingRoot: path.join(__dirname),

  transpilePackages: ['@mediapipe/hands', '@mediapipe/drawing_utils'],

  serverExternalPackages: ['@prisma/client', 'prisma'],

  images: {
    remotePatterns: [
      { hostname: 'cdn.jsdelivr.net' },
      { hostname: 'img.clerk.com' },
      { hostname: 'images.clerk.dev' },
      { hostname: '*.supabase.co' },
      { hostname: '*.supabase.com' },
    ],
  },

  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(self), microphone=(), geolocation=(), payment=(), usb=()',
        },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://*.clerk.com https://*.clerk.accounts.dev https://*.supabase.co https://*.supabase.com https://challenges.cloudflare.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.clerk.accounts.dev",
            "font-src 'self' https://fonts.gstatic.com https://*.clerk.accounts.dev",
            "img-src 'self' data: blob: https: https://*.clerk.com https://*.supabase.co https://*.supabase.com",
            `connect-src 'self' https://*.clerk.com https://*.clerk.accounts.dev wss://*.clerk.accounts.dev https://clerk-telemetry.com https://*.supabase.co https://*.supabase.com https://cdn.jsdelivr.net ${MODEL_HOSTS} ${recognitionOrigin()}`.trim(),
            "frame-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://challenges.cloudflare.com",
            "worker-src 'self' blob:",
            "media-src 'self' blob:",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join('; '),
        },
      ],
    },
  ],

  compiler: {
    styledComponents: true,
  },

  webpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    return config;
  },

  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
};

export default nextConfig;
