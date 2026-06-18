interface KpiCardProps {
  icon: string;
  label: string;
  value: string;
  sublabel?: string;
  progress?: number;
  progressLabel?: string;
  color: string;
  bgColor?: string;
}

export default function KpiCard({
  icon,
  label,
  value,
  sublabel,
  progress,
  progressLabel,
  color,
  bgColor,
}: KpiCardProps) {
  return (
    <div
      className="rounded-2xl p-5 text-white flex flex-col justify-between min-h-[140px]"
      style={{ backgroundColor: color }}
    >
      <div className="flex items-start justify-between">
        <div className="bg-white/20 backdrop-blur-sm rounded-xl w-10 h-10 flex items-center justify-center text-lg">
          {icon}
        </div>
        {sublabel && (
          <span className="text-xs bg-white/20 rounded-full px-2.5 py-1">{sublabel}</span>
        )}
      </div>
      <div>
        <div className="text-sm opacity-80 mb-0.5">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
        {progress !== undefined && (
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>{progressLabel || "Progress"}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
