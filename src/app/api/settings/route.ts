import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';

const booleanFields = new Set(['soundEffects','achievementSounds','streakReminders','emailNotifications','emailAchievements','emailStreaks','emailWeeklyReport','darkMode','highContrast','reducedMotion','showLeaderboard','showActivity']);
const visibility = new Set(['public','private']);
function parsePatch(input: unknown): { data?: Record<string, boolean | number | string | null>; error?: string } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { error: 'Invalid settings payload' };
  const body = input as Record<string, unknown>;
  const allowed = new Set([...booleanFields, 'fontScale', 'profileVisibility', 'defaultCamera']);
  if (Object.keys(body).some((key) => !allowed.has(key))) return { error: 'Unknown settings field' };
  const data: Record<string, boolean | number | string | null> = {};
  for (const key of booleanFields) if (key in body) {
    if (typeof body[key] !== 'boolean') return { error: `${key} must be a boolean` };
    data[key] = body[key] as boolean;
  }
  if ('fontScale' in body) { if (!Number.isInteger(body.fontScale) || (body.fontScale as number) < 75 || (body.fontScale as number) > 150) return { error: 'fontScale must be an integer between 75 and 150' }; data.fontScale = body.fontScale as number; }
  if ('profileVisibility' in body) { if (typeof body.profileVisibility !== 'string' || !visibility.has(body.profileVisibility)) return { error: 'Invalid profileVisibility' }; data.profileVisibility = body.profileVisibility; }
  if ('defaultCamera' in body) { if (body.defaultCamera !== null && (typeof body.defaultCamera !== 'string' || body.defaultCamera.length > 256)) return { error: 'Invalid defaultCamera' }; data.defaultCamera = body.defaultCamera as string | null; }
  return Object.keys(data).length ? { data } : { error: 'No settings provided' };
}
export async function GET() { try { const { userId } = await auth(); if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const user = await getOrCreateUser(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const settings = await prisma.userSettings.upsert({ where: { userId: user.id }, create: { userId: user.id }, update: {} }); return NextResponse.json(settings); } catch (err) { console.error('[api/settings] GET failed', err); return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 }); } }
export async function PATCH(request: Request) { try { const { userId } = await auth(); if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const user = await getOrCreateUser(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); let body: unknown; try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); } const parsed = parsePatch(body); if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 }); const settings = await prisma.userSettings.upsert({ where: { userId: user.id }, create: { userId: user.id, ...parsed.data }, update: parsed.data }); return NextResponse.json(settings); } catch (err) { console.error('[api/settings] PATCH failed', err); return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 }); } }