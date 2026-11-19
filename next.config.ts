import path from "node:path";
import type { NextConfig } from "next";

// TF.js handpose downloads its model from tfhub.dev, which redirects to Kaggle / GCS.
const MODEL_HOSTS = "https://tfhub.dev https://www.kaggle.com https://*.kaggle.com https://storage.googleapis.com";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',

  // A stray lockfile in the home directory confuses workspace-root detection.
  outputFileTracingRoot: path.join(__dirname),

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
            `connect-src 'self' https://*.clerk.com https://*.clerk.accounts.dev wss://*.clerk.accounts.dev https://clerk-telemetry.com https://*.supabase.co https://*.supabase.com https://cdn.jsdelivr.net ${MODEL_HOSTS}`,
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

  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
};

export default nextConfig;
