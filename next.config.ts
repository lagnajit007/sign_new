import path from "node:path";
import type { NextConfig } from "next";

// MediaPipe Hand Landmarker: WASM runtime from jsdelivr, model from Google's model CDN.
const MODEL_HOSTS = "https://storage.googleapis.com";

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
          // The app embeds its own interactive empty-state HTML files. Keep
          // cross-origin framing blocked while allowing those same-origin frames.
          value: 'SAMEORIGIN',
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
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://cdn.jsdelivr.net https://*.clerk.com https://*.clerk.accounts.dev https://*.supabase.co https://*.supabase.com https://challenges.cloudflare.com",
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
