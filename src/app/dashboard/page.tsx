import { Award, CheckCircle2, Hand, Sparkles, Target } from "lucide-react";
import { Flame } from "@/components/art/flame";
import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/user";
import { computeUserStats, ALPHABET_COUNT, NUMBER_COUNT } from "@/lib/stats";
import { prisma } from "@/lib/prisma";
import { levelForXp, nextLevelXp, totalXpForLevel } from "@/lib/gamification";
import { activityUserWhere, displayName, leaderboardUserWhere, publicUserSelect } from "@/lib/community";
import { challengeCount, completedThisPeriod } from "@/lib/challenges";
import { Avatar } from "@/components/app/avatar";
import { ActivityBars, Sparkline } from "@/components/app/charts";
import {
  Badge,
  ButtonLink,
  DemoBadge,
  EmptyState,
  PageBody,
  Panel,
  ProgressBar,
  Stat,
  timeAgo,
} from "@/components/app/primitives";

export const dynamic = "force-dynamic";
export const metadata = { title: "Overview · Sanjog" };

const DAY = 86_400_000;
const DAILY_GOAL = 15;
const ORDER = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ", ..."0123456789"];

export default async function OverviewPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const weekStart = new Date(todayStart.getTime() - 6 * DAY);

  const [stats, weekAttempts, mastered, leaders, feed, challenges, userChallenges, recentUnlocks] = await Promise.all([
    computeUserStats(user.id),
    prisma.recognitionAttempt.findMany({
      where: { userId: user.id, createdAt: { gte: weekStart } },
      select: { createdAt: true, correct: true },
    }),
    prisma.signProgress.findMany({ where: { userId: user.id, completed: true }, select: { signLabel: true } }),
    prisma.user.findMany({
      where: leaderboardUserWhere(),
      orderBy: [{ xp: "desc" }, { createdAt: "asc" }],
      take: 5,
      select: publicUserSelect,
    }),
    prisma.recognitionAttempt.findMany({
      where: { correct: true, userId: { not: user.id }, user: activityUserWhere() },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: { select: publicUserSelect } },
    }),
    prisma.challenge.findMany({ orderBy: { rewardXp: "asc" } }),
    prisma.userChallenge.findMany({ where: { userId: user.id } }),
    prisma.userAchievement.findMany({
      where: { userId: user.id, unlockedAt: { not: null } },
      orderBy: { unlockedAt: "desc" },
      take: 3,
      include: { achievement: true },
    }),
  ]);

  const rank =
    (await prisma.user.count({ where: { AND: [leaderboardUserWhere(), { xp: { gt: user.xp } }] } })) + 1;

  // Week buckets (UTC days).
  const week = Array.from({ length: 7 }, (_, i) => {
    const start = new Date(weekStart.getTime() + i * DAY);
    const inDay = weekAttempts.filter((a) => a.createdAt >= start && a.createdAt.getTime() < start.getTime() + DAY);
    return {
      label: start.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      total: inDay.length,
      highlight: inDay.filter((a) => a.correct).length,
    };
  });
  const todayCorrect = week[6].highlight;
  const weekCorrect = week.reduce((s, d) => s + d.highlight, 0);

  const masteredSet = new Set(mastered.map((m) => m.signLabel));
  const nextSign = ORDER.find((s) => !masteredSet.has(s)) ?? null;
  const nextSet = nextSign && /\d/.test(nextSign) ? "number" : "alphabet";

  const level = levelForXp(user.xp);
  const floor = totalXpForLevel(level);
  const next = nextLevelXp(user.xp);

  const openChallenges = await Promise.all(
    challenges
      .filter((c) => !completedThisPeriod(userChallenges.find((u) => u.challengeId === c.id)?.completedAt, c.period, now))
      .slice(0, 3)
      .map(async (c) => ({
        ...c,
        current: Math.min(c.goal, await challengeCount(prisma, user.id, c.key, c.period, user.streakDays, now)),
      })),
  );

  const firstName = user.name?.split(" ")[0];
  const nowMs = now.getTime();

  return (
    <PageBody className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[15px] font-medium text-fg">{stats.totalAttempts === 0 ? (firstName ? `Welcome, ${firstName}` : "Welcome") : firstName ? `Welcome back, ${firstName}` : "Welcome back"}</p>
          <p className="text-[13px] text-fg-subtle">
            {stats.totalAttempts === 0
              ? "Start your first lesson to see your progress here."
              : `${weekCorrect} correct sign${weekCorrect === 1 ? "" : "s"} this week.`}
          </p>
        </div>
        {nextSign && (
          <ButtonLink variant="primary" href={`/dashboard/lessons/interactive?set=${nextSet}&sign=${nextSign}`}>
            <Hand aria-hidden /> Practice “{nextSign}”
          </ButtonLink>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Total XP"
          icon={<Sparkles />}
          value={user.xp.toLocaleString()}
          hint={`Level ${level} · ${Math.max(0, next - user.xp).toLocaleString()} XP to level ${level + 1}`}
          trend={<Sparkline values={week.map((d) => d.highlight)} />}
        />
        <Stat
          label="Streak"
          icon={<Flame animated={user.streakDays > 0} dim={user.streakDays === 0} />}
          value={`${user.streakDays} day${user.streakDays === 1 ? "" : "s"}`}
          hint={todayCorrect > 0 ? "Practised today" : "Practise today to keep it going"}
        />
        <Stat
          label="Signs mastered"
          icon={<CheckCircle2 />}
          value={
            <>
              {stats.lessonsCompleted}
              <span className="text-base font-normal text-fg-subtle"> / {ALPHABET_COUNT + NUMBER_COUNT}</span>
            </>
          }
          hint={`${stats.alphabetCompleted} letters · ${stats.numberCompleted} numbers`}
        />
        <Stat
          label="Accuracy"
          icon={<Target />}
          value={stats.totalAttempts ? `${Math.round(stats.overallAccuracy * 100)}%` : "—"}
          hint={`${stats.correctAttempts.toLocaleString()} of ${stats.totalAttempts.toLocaleString()} attempts`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="This week"
          description="Recognition attempts per day (UTC)"
          action={<ButtonLink variant="ghost" href="/dashboard/progress">View progress</ButtonLink>}
        >
          {stats.totalAttempts === 0 ? (
            <EmptyState
              icon={<Hand />}
              title="No practice yet"
              description="Each sign you try with the camera shows up here."
              action={<ButtonLink variant="primary" href="/dashboard/lessons">Browse lessons</ButtonLink>}
            />
          ) : (
            <ActivityBars data={week} height={150} />
          )}
        </Panel>

        <Panel title="Up next">
          {nextSign ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="grid size-16 place-items-center rounded-xl bg-brand-tint font-display text-3xl font-semibold text-brand">
                  {nextSign}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-fg">
                    {nextSet === "number" ? "Number" : "Letter"} {nextSign}
                  </p>
                  <p className="text-xs text-fg-subtle">
                    {ORDER.indexOf(nextSign) + 1} of {ORDER.length} in the course
                  </p>
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-fg-muted">Daily goal</span>
                  <span className="tabular-nums text-fg-subtle">
                    {Math.min(todayCorrect, DAILY_GOAL)} / {DAILY_GOAL} correct
                  </span>
                </div>
                <ProgressBar value={(todayCorrect / DAILY_GOAL) * 100} label="Daily goal" />
              </div>
              <ButtonLink variant="primary" href={`/dashboard/lessons/interactive?set=${nextSet}&sign=${nextSign}`}>
                Start practice
              </ButtonLink>
            </div>
          ) : (
            <EmptyState icon={<Award />} title="Course complete" description="You've mastered every sign. Keep practising to hold your streak." />
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="Leaderboard"
          description={`You're #${rank} by lifetime XP`}
          action={<ButtonLink variant="ghost" href="/dashboard/leaderboard">See all</ButtonLink>}
          bodyClassName="p-0"
        >
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-xs text-fg-subtle">
                <th className="w-10 px-4 py-2 font-normal">#</th>
                <th className="px-2 py-2 font-normal">Learner</th>
                <th className="hidden px-2 py-2 font-normal sm:table-cell">Level</th>
                <th className="hidden px-2 py-2 font-normal sm:table-cell">Streak</th>
                <th className="px-4 py-2 text-right font-normal">XP</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((u, i) => (
                <tr key={u.id} className={u.id === user.id ? "bg-brand-tint" : "border-b border-line last:border-0"}>
                  <td className="px-4 py-2.5 tabular-nums text-fg-subtle">{i + 1}</td>
                  <td className="px-2 py-2.5">
                    <span className="flex min-w-0 items-center gap-2">
                      <Avatar name={displayName(u)} avatarId={u.avatarId} />
                      <span className="truncate text-fg">{displayName(u)}</span>
                      {u.id === user.id && <Badge tone="brand">You</Badge>}
                      {u.isDemo && <DemoBadge />}
                    </span>
                  </td>
                  <td className="hidden px-2 py-2.5 tabular-nums text-fg-muted sm:table-cell">{levelForXp(u.xp)}</td>
                  <td className="hidden px-2 py-2.5 tabular-nums text-fg-muted sm:table-cell">{u.streakDays}d</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-fg">{u.xp.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {leaders.length === 0 && <EmptyState title="No learners yet" description="Be the first on the board." />}
        </Panel>

        <Panel
          title="Challenges"
          action={<ButtonLink variant="ghost" href="/dashboard/challenges">All</ButtonLink>}
        >
          {openChallenges.length === 0 ? (
            <EmptyState title="All caught up" description="New daily challenges start at midnight UTC." />
          ) : (
            <ul className="space-y-4">
              {openChallenges.map((c) => (
                <li key={c.id}>
                  <div className="mb-1.5 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-fg">{c.name}</p>
                      <p className="truncate text-xs text-fg-subtle">{c.description}</p>
                    </div>
                    <Badge tone="brand">+{c.rewardXp} XP</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <ProgressBar value={(c.current / c.goal) * 100} label={c.name} />
                    <span className="shrink-0 text-xs tabular-nums text-fg-subtle">
                      {c.current}/{c.goal}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="Community activity"
          action={<ButtonLink variant="ghost" href="/dashboard/community">View all</ButtonLink>}
          bodyClassName="p-0"
        >
          {feed.length === 0 ? (
            <EmptyState title="It's quiet here" description="Signs other learners master will show up here." />
          ) : (
            <ul>
              {feed.map((a) => (
                <li key={a.id} className="flex items-center gap-3 border-b border-line px-4 py-2.5 text-[13px] last:border-0">
                  <Avatar name={displayName(a.user)} avatarId={a.user.avatarId} />
                  <span className="min-w-0 flex-1 truncate text-fg-muted">
                    <span className="text-fg">{displayName(a.user)}</span> signed{" "}
                    <span className="font-medium text-fg">“{a.signLabel}”</span> at {Math.round(a.confidence * 100)}%
                  </span>
                  {a.user.isDemo && <DemoBadge />}
                  <span className="shrink-0 text-xs text-fg-subtle">{timeAgo(a.createdAt, nowMs)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent achievements" action={<ButtonLink variant="ghost" href="/dashboard/achievements">All</ButtonLink>}>
          {recentUnlocks.length === 0 ? (
            <EmptyState icon={<Award />} title="None yet" description="Master your first sign to earn “First Step”." />
          ) : (
            <ul className="space-y-3">
              {recentUnlocks.map((u) => (
                <li key={u.id} className="flex items-center gap-3">
                  <span
                    className="grid size-8 shrink-0 place-items-center rounded-lg text-base"
                    style={{ background: `color-mix(in oklab, ${u.achievement.color} 14%, transparent)` }}
                    aria-hidden
                  >
                    {u.achievement.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-fg">{u.achievement.name}</p>
                    <p className="truncate text-xs text-fg-subtle">{u.unlockedAt ? timeAgo(u.unlockedAt, nowMs) : ""}</p>
                  </div>
                  <span className="text-xs tabular-nums text-fg-subtle">+{u.achievement.xpReward}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </PageBody>
  );
}
