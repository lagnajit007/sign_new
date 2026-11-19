import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The one frame for every product shot on the landing page: macOS-proportioned
 * traffic lights, a quiet centred address pill, a hairline under the bar and a
 * ring-plus-layered shadow instead of a hard border (Stageshow framing).
 */
export function StageWindow({
  address,
  hero = false,
  fadeFoot = false,
  className,
  bodyClassName,
  children,
}: {
  address: string;
  /** The page's lead window gets the deeper hero shadow. */
  hero?: boolean;
  /** Dissolve the window into the page over its last third (only filler there). */
  fadeFoot?: boolean;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(fadeFoot && "mk-fade-foot", className)}>
      <div
        className="overflow-hidden bg-canvas"
        style={{
          borderRadius: "var(--mk-radius-window)",
          boxShadow: hero ? "var(--mk-shadow-hero)" : "var(--mk-shadow-window)",
        }}
      >
        <div className="relative flex h-[38px] items-center border-b border-line bg-[#fbfbfc] px-[14px]" aria-hidden>
          <div className="flex gap-[7px]">
            <span className="size-[11px] rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.14)]" />
            <span className="size-[11px] rounded-full bg-[#febc2e] shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.14)]" />
            <span className="size-[11px] rounded-full bg-[#28c840] shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.14)]" />
          </div>
          <div className="absolute left-1/2 flex h-[22px] w-[min(46%,300px)] -translate-x-1/2 items-center justify-center gap-1.5 rounded-full bg-[#f0f0f2] text-[11px] text-fg-subtle">
            <Lock className="size-2.5" strokeWidth={2.4} />
            {address}
          </div>
        </div>
        <div className={bodyClassName}>{children}</div>
      </div>
    </div>
  );
}
