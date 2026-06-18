import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';
import type { User } from '@prisma/client';

/// Resolve the signed-in Clerk user and return the local mirror row, creating
/// it on first sight. Returns null when there is no authenticated session.
///
/// Use this at the top of every protected route handler — never trust a
/// client-supplied user id.
export async function getOrCreateUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (existing) return existing;

  // First authenticated request for this Clerk user: mirror basic profile.
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? null;
  const name =
    clerkUser?.fullName ||
    clerkUser?.firstName ||
    clerkUser?.username ||
    null;

  return prisma.user.upsert({
    where: { clerkId: userId },
    update: {},
    create: { clerkId: userId, email, name },
  });
}
