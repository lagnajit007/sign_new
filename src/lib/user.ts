import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';
import { Prisma, type User } from '@prisma/client';

interface ClerkProfile {
  email: string | null;
  name: string | null;
}

/** Pick the fields we mirror from a Clerk user (webhook payload or currentUser()). */
export function profileFromClerk(u: {
  email_addresses?: { email_address: string; id: string }[];
  primary_email_address_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
}): ClerkProfile {
  const primary =
    u.email_addresses?.find((e) => e.id === u.primary_email_address_id) ?? u.email_addresses?.[0];
  const full = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
  return { email: primary?.email_address ?? null, name: full || u.username || null };
}

/** Create or refresh the local mirror of a Clerk user, with default settings. */
export async function upsertUserFromClerk(clerkId: string, profile: ClerkProfile): Promise<User> {
  return prisma.user.upsert({
    where: { clerkId },
    update: { email: profile.email, name: profile.name ?? undefined },
    create: {
      clerkId,
      email: profile.email,
      name: profile.name,
      settings: { create: {} },
    },
  });
}

/// Resolve the signed-in Clerk user and return the local mirror row, creating
/// it on first sight (fallback for when the Clerk webhook hasn't arrived yet).
/// Returns null when there is no authenticated session.
///
/// Use this at the top of every protected route handler — never trust a
/// client-supplied user id.
export async function getOrCreateUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (existing) return existing;

  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? clerkUser?.emailAddresses?.[0]?.emailAddress ?? null;
  const name = clerkUser?.fullName || clerkUser?.firstName || clerkUser?.username || null;
  try {
    return await upsertUserFromClerk(userId, { email, name });
  } catch (err) {
    // First page load fires several requests at once; if another one created
    // the row first, the upsert loses the race with a unique violation.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return prisma.user.findUniqueOrThrow({ where: { clerkId: userId } });
    }
    throw err;
  }
}
