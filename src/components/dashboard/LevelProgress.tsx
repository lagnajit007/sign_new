import { formatXp } from "@/lib/dashboard-utils";
import { LEVEL_NAMES } from "@/lib/dashboard-utils";

interface LevelProgressProps {
  level: number;
  levelProgress: number;
  xp: number;
  xpIntoLevel: number;
  xpForLevel: number;
  nextXp: number;
  levelTitle: string;
}

export default function LevelProgress({
  level,
  levelProgress,
  xp,
  xpIntoLevel,
  xpForLevel,
  nextXp,
  levelTitle: title,
}: LevelProgressProps) {
  return (
    <section className="bg-surface rounded-2xl p-6 shadow-sm border border-brand-soft">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-ink">Level Progress</h2>
        <span className="text-brand font-bold text-lg">Level {level}</span>
      </div>

      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="30" fill="none" stroke="#EAE4FF" strokeWidth="6" />
            <circle
              cx="36" cy="36" r="30"
              fill="none" stroke="#7D54FF" strokeWidth="6"
              strokeDasharray={Math.PI * 60}
              strokeDashoffset={Math.PI * 60 * (1 - levelProgress / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-brand">{levelProgress}%</span>
          </div>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-ink-soft">XP Progress</span>
            <span className="font-medium">
              {formatXp(xpIntoLevel)} / {formatXp(xpForLevel)} XP
            </span>
          </div>
          <div className="h-3 bg-brand-soft rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand to-[#9B7CFF] rounded-full transition-all duration-1500"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
          <p className="text-xs text-ink-soft">
            {nextXp > xp
              ? `${formatXp(nextXp - xp)} XP until Level ${level + 1}`
              : "You've reached the highest level!"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-bg rounded-xl p-3 text-center">
          <div className="text-xs text-ink-soft">Current XP</div>
          <div className="text-lg font-bold text-ink">{formatXp(xp)}</div>
        </div>
        <div className="bg-bg rounded-xl p-3 text-center">
          <div className="text-xs text-ink-soft">Next Level</div>
          <div className="text-lg font-bold text-ink">{level < 9 ? `Level ${level + 1}` : "Max"}</div>
        </div>
        <div className="bg-bg rounded-xl p-3 text-center col-span-2 sm:col-span-1">
          <div className="text-xs text-ink-soft">Next Unlock</div>
          <div className="text-sm font-bold text-brand">
            {level + 1 < LEVEL_NAMES.length ? LEVEL_NAMES[level] : "Legendary Status"}
          </div>
        </div>
        <div className="bg-bg rounded-xl p-3 text-center col-span-2 sm:col-span-1">
          <div className="text-xs text-ink-soft">Rank Title</div>
          <div className="text-sm font-bold text-[#FF8C00]">{title}</div>
        </div>
      </div>
    </section>
  );
}
