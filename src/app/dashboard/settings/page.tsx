"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { sendJson, useApi } from "@/hooks/use-api";
import { ErrorState, PageBody, Panel, Skeleton } from "@/components/app/primitives";
import { cn } from "@/lib/utils";

interface Settings {
  reducedMotion: boolean;
  fontScale: number;
  showLeaderboard: boolean;
  showActivity: boolean;
  profileVisibility: "public" | "private";
}

function Row({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-line py-3 first:pt-0 last:border-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-fg">{title}</p>
        {description && <p className="mt-0.5 text-xs text-fg-subtle">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn("relative h-5 w-9 rounded-full transition-colors", checked ? "bg-brand" : "bg-line-strong")}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform",
          checked && "translate-x-4",
        )}
      />
    </button>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-lg border border-line p-0.5 text-xs">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn("h-6 rounded-md px-2.5 font-medium text-fg-muted", value === o.value ? "bg-subtle text-fg" : "hover:text-fg")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const { data, error, loading, reload } = useApi<Settings>("/api/settings");
  const [settings, setSettings] = useState<Settings | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const pending = useRef<Partial<Settings>>({});

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (data) setSettings(data);
  }, [data]);

  // Batch rapid changes (e.g. font size) into one debounced PATCH.
  function update(patch: Partial<Settings>) {
    setSettings((s) => (s ? { ...s, ...patch } : s));
    pending.current = { ...pending.current, ...patch };
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const body = pending.current;
      pending.current = {};
      try {
        await sendJson("/api/settings", "PATCH", body);
        toast.success("Settings saved");
        if ("fontScale" in body || "reducedMotion" in body) {
          // The dashboard layout applies these on load.
          window.dispatchEvent(new Event("sanjog:settings"));
        }
      } catch (err) {
        toast.error((err as Error).message);
        reload();
      }
    }, 500);
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

  if (loading || !settings) {
    return (
      <PageBody className="space-y-4">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </PageBody>
    );
  }

  return (
    <PageBody className="max-w-3xl space-y-4">
      <Panel title="Appearance">
        <Row title="Theme" description="Follows your device when set to System.">
          {mounted && (
            <Segmented
              label="Theme"
              value={(theme as "light" | "dark" | "system") ?? "light"}
              onChange={setTheme}
              options={[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
                { value: "system", label: "System" },
              ]}
            />
          )}
        </Row>
        <Row title="Text size" description={`${settings.fontScale}% of default`}>
          <input
            type="range"
            min={90}
            max={125}
            step={5}
            value={settings.fontScale}
            aria-label="Text size"
            onChange={(e) => update({ fontScale: Number(e.target.value) })}
            className="w-36 accent-[var(--sj-brand)]"
          />
        </Row>
        <Row title="Reduce motion" description="Turns off animated transitions in the app.">
          <Switch label="Reduce motion" checked={settings.reducedMotion} onChange={(v) => update({ reducedMotion: v })} />
        </Row>
      </Panel>

      <Panel title="Privacy" description="Controls what other learners can see.">
        <Row title="Profile visibility" description="Private hides you from the leaderboard and activity feed entirely.">
          <Segmented
            label="Profile visibility"
            value={settings.profileVisibility}
            onChange={(v) => update({ profileVisibility: v })}
            options={[
              { value: "public", label: "Public" },
              { value: "private", label: "Private" },
            ]}
          />
        </Row>
        <Row title="Show me on the leaderboard">
          <Switch
            label="Show me on the leaderboard"
            checked={settings.showLeaderboard}
            onChange={(v) => update({ showLeaderboard: v })}
          />
        </Row>
        <Row title="Share my activity" description="Your correct signs appear in the community feed.">
          <Switch label="Share my activity" checked={settings.showActivity} onChange={(v) => update({ showActivity: v })} />
        </Row>
      </Panel>

      <Panel title="Camera & data">
        <p className="text-[13px] leading-relaxed text-fg-muted">
          Video never leaves your browser. Hand tracking and sign recognition run on your device. When you finish a sign,
          42 numbers describing your hand&apos;s shape are sent to Sanjog to double-check the result, and only the outcome
          (sign, confidence, time) is saved to your account.
        </p>
      </Panel>
    </PageBody>
  );
}
