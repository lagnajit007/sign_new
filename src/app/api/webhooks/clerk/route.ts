import { NextResponse, type NextRequest } from 'next/server';
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { prisma } from '@/lib/prisma';
import { profileFromClerk, upsertUserFromClerk } from '@/lib/user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Clerk → database sync. Configure in Clerk Dashboard → Webhooks with the
 * events user.created, user.updated and user.deleted, and put the signing
 * secret in CLERK_WEBHOOK_SIGNING_SECRET.
 */
export async function POST(request: NextRequest) {
  if (!process.env.CLERK_WEBHOOK_SIGNING_SECRET) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  let evt;
  try {
    evt = await verifyWebhook(request);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (evt.type) {
      case 'user.created':
      case 'user.updated':
        await upsertUserFromClerk(evt.data.id, profileFromClerk(evt.data));
        break;
      case 'user.deleted':
        // Cascades to settings, attempts, progress, achievements, challenges.
        if (evt.data.id) await prisma.user.deleteMany({ where: { clerkId: evt.data.id } });
        break;
      default:
        break;
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[webhooks/clerk] failed', evt.type, err);
    return NextResponse.json({ error: 'Failed to process event' }, { status: 500 });
  }
}
