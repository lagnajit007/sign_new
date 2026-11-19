"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { sendJson, useApi } from "@/hooks/use-api";
import { AVATAR_COLORS, Avatar } from "@/components/app/avatar";
import { Button, ErrorState, PageBody, Panel, Skeleton, Stat } from "@/components/app/primitives";
import { cn } from "@/lib/utils";

interface Me {
  name: string | null;
  username: string | null;
  email: string | null;
  bio: string | null;
  learningGoal: string | null;
  avatarId: number;
  xp: number;
  level: number;
  streakDays: number;
  createdAt: string;
  stats: { lessonsCompleted: number; totalAttempts: number; accuracy: number; challengesCompleted: number };
}

const inputClass =
  "h-9 w-full rounded-lg border border-line bg-panel px-3 text-[13px] text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-brand focus:ring-2 focus:ring-brand-tint";

export default function ProfilePage() {
  const { data: me, error, loading, reload } = useApi<Me>("/api/me");
  const [form, setForm] = useState({ name: "", username: "", bio: "", learningGoal: "", avatarId: 1 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (me) {
      setForm({
        name: me.name ?? "",
        username: me.username ?? "",
        bio: me.bio ?? "",
        learningGoal: me.learningGoal ?? "",
        avatarId: me.avatarId,
      });
    }
  }, [me]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!me) return;
    const patch: Record<string, unknown> = {};
    if (form.name.trim() !== (me.name ?? "")) patch.name = form.name.trim() || null;
    if (form.bio.trim() !== (me.bio ?? "")) patch.bio = form.bio.trim() || null;
    if (form.learningGoal.trim() !== (me.learningGoal ?? "")) patch.learningGoal = form.learningGoal.trim() || null;
    if (form.avatarId !== me.avatarId) patch.avatarId = form.avatarId;
    if (form.username.trim() && form.username.trim().toLowerCase() !== (me.username ?? "")) patch.username = form.username.trim();
    if (Object.keys(patch).length === 0) {
      toast("No changes to save");
      return;
    }
    setSaving(true);
    try {
      await sendJson("/api/me", "PATCH", patch);
      toast.success("Profile saved");
      reload();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return (
      <PageBody>
        <Panel>
          <ErrorState message={error} onRetry={reload} />
        </Panel>
      </PageBody>
    );
  }

  if (loading && !me) {
    return (
      <PageBody className="space-y-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </PageBody>
    );
  }

  return (
    <PageBody className="space-y-4">
      <div className="flex items-center gap-4 rounded-xl border border-line bg-panel p-4">
        <Avatar name={form.name || me?.username || me?.email} avatarId={form.avatarId} size={56} />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-fg">{me?.name || "Unnamed learner"}</p>
          <p className="truncate text-[13px] text-fg-subtle">
            {me?.username ? `@${me.username} · ` : ""}Level {me?.level} · joined{" "}
            {me && new Date(me.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total XP" value={me?.xp.toLocaleString() ?? 0} />
        <Stat label="Signs mastered" value={me?.stats.lessonsCompleted ?? 0} />
        <Stat label="Accuracy" value={me?.stats.totalAttempts ? `${me.stats.accuracy}%` : "—"} />
        <Stat label="Challenges done" value={me?.stats.challengesCompleted ?? 0} />
      </div>

      <form onSubmit={onSubmit}>
        <Panel
          title="Edit profile"
          description="Your name, username and colour appear on the leaderboard and activity feed."
          action={
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-fg-muted">Display name</span>
              <input className={inputClass} maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-fg-muted">Username</span>
              <input
                className={inputClass}
                value={form.username}
                pattern="[a-zA-Z0-9_]{3,30}"
                title="3–30 letters, numbers or underscores"
                placeholder="your_name"
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </label>
            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-xs font-medium text-fg-muted">Learning goal</span>
              <input
                className={inputClass}
                maxLength={200}
                placeholder="e.g. Sign with my family"
                value={form.learningGoal}
                onChange={(e) => setForm({ ...form, learningGoal: e.target.value })}
              />
            </label>
            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-xs font-medium text-fg-muted">Bio</span>
              <textarea
                className={cn(inputClass, "h-20 resize-none py-2")}
                maxLength={500}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </label>
            <fieldset className="space-y-1.5 sm:col-span-2">
              <legend className="text-xs font-medium text-fg-muted">Avatar colour</legend>
              <div className="flex flex-wrap gap-2 pt-1">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-label={c.name}
                    aria-pressed={form.avatarId === c.id}
                    onClick={() => setForm({ ...form, avatarId: c.id })}
                    className={cn(
                      "grid size-8 place-items-center rounded-full ring-offset-2 ring-offset-panel transition-shadow",
                      form.avatarId === c.id && "ring-2 ring-brand",
                    )}
                    style={{ background: c.bg }}
                  >
                    {form.avatarId === c.id && <Check className="size-4 text-white" aria-hidden />}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
          <p className="mt-4 text-xs text-fg-subtle">Email and password are managed in your account menu (top right).</p>
        </Panel>
      </form>
    </PageBody>
  );
}
