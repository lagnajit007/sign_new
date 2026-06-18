import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DASHBOARD_ROUTES, APP_URL } from '@/lib/config';

// Public routes — everything else requires authentication
const isPublic = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/_not-found',
  '/not-found',
  '/api/health',
  '/api/webhook(.*)',
  // Clear-session is now auth-gated server-side; keep the route public so
  // signed-out cookie-corruption recovery still works (the handler checks auth).
  '/api/clear-session(.*)',
]);

const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Bail out gracefully if Clerk keys are missing (e.g. during bare build)
  if (!isClerkConfigured) return NextResponse.next();

  if (isPublic(req)) return NextResponse.next();

  // All other routes — including /dashboard — are protected server-side
  try {
    await auth.protect();
    return NextResponse.next();
  } catch {
    const isDashboardOrApi =
      DASHBOARD_ROUTES.some((r) => req.nextUrl.pathname.startsWith(r)) ||
      req.nextUrl.pathname.startsWith('/api');
    if (isDashboardOrApi) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
    const signInUrl = new URL('/sign-in', APP_URL);
    return NextResponse.redirect(signInUrl);
  }
}, {
  debug: process.env.NODE_ENV === 'development',
  clockSkewInMs: 60_000,
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
