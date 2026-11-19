import { NextResponse } from 'next/server';

/** Consistent JSON error envelope for route handlers. */
export function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Wrap a route handler so unexpected errors become a logged JSON 500 instead of
 * Next's default HTML error page.
 */
export function withErrorHandling<A extends unknown[]>(
  name: string,
  handler: (...args: A) => Promise<Response>,
) {
  return async (...args: A): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (err) {
      console.error(`[api/${name}] failed`, err);
      return apiError('Something went wrong. Please try again.', 500);
    }
  };
}
