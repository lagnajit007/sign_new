import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await import('@clerk/nextjs/server').then(m => m.auth());
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = NextResponse.json(
    { error: null, success: true, message: 'Session cookies cleared' },
    { status: 200 }
  );

  const clerkCookies = [
    '__clerk_db_jwt',
    '__session',
    '__client',
    'clerk_core',
    'clerk.frontend_api',
    '__clerk_publish_key',
  ];

  clerkCookies.forEach((cookie) => {
    response.cookies.delete(cookie);
  });

  return response;
}

export const dynamic = 'force-dynamic';