import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


// Only the app and its API need a session. Everything else (marketing pages,
// auth pages, unknown URLs → 404) is public.
const isProtected = createRouteMatcher(['/dashboard(.*)', '/api(.*)']);

// API routes that must work without a session.
const isPublicApi = createRouteMatcher([
  '/api/health',
  // Clerk webhooks are verified with a svix signature inside the handler.
  '/api/webhooks/clerk',
]);

const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (!isProtected(req) || isPublicApi(req)) return NextResponse.next();

  // Never expose a protected route when authentication is misconfigured.
  if (!isClerkConfigured) {
    return new NextResponse('Authentication is not configured.', { status: 503 });
  }

  // /dashboard and the API are protected server-side
  try {
    await auth.protect();
    return NextResponse.next();
  } catch {
    if (req.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build the redirect from the request's own origin so it never depends on
    // NEXT_PUBLIC_APP_URL being set.
    const signInUrl = new URL('/sign-in', req.nextUrl.origin);
    signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }
}, {
  debug: process.env.NODE_ENV === 'development',
  clockSkewInMs: 60_000,
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
