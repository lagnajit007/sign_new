'use client';

interface HandGuideOverlayProps {
  handDetected: boolean;
  isCorrectCandidate: boolean;
}

export default function HandGuideOverlay({
  handDetected,
  isCorrectCandidate,
}: HandGuideOverlayProps) {
  const borderColor = isCorrectCandidate
    ? 'border-green-400/80 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
    : handDetected
    ? 'border-brand/80 shadow-[0_0_20px_rgba(125,84,255,0.25)]'
    : 'border-white/20';

  const cornerColor = isCorrectCandidate
    ? 'border-green-400'
    : handDetected
    ? 'border-brand'
    : 'border-white/50';

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 select-none">
      {/* Hand framing guide box */}
      <div
        className={`relative w-[65%] max-w-[280px] aspect-[3/4] rounded-2xl border-2 border-dashed ${borderColor} transition-all duration-300 flex flex-col justify-between p-3`}
      >
        {/* Top-left corner bracket */}
        <span
          className={`absolute -top-1.5 -left-1.5 size-4 border-t-2 border-l-2 ${cornerColor} rounded-tl-md transition-colors duration-300`}
        />
        {/* Top-right corner bracket */}
        <span
          className={`absolute -top-1.5 -right-1.5 size-4 border-t-2 border-r-2 ${cornerColor} rounded-tr-md transition-colors duration-300`}
        />
        {/* Bottom-left corner bracket */}
        <span
          className={`absolute -bottom-1.5 -left-1.5 size-4 border-b-2 border-l-2 ${cornerColor} rounded-bl-md transition-colors duration-300`}
        />
        {/* Bottom-right corner bracket */}
        <span
          className={`absolute -bottom-1.5 -right-1.5 size-4 border-b-2 border-r-2 ${cornerColor} rounded-br-md transition-colors duration-300`}
        />

        {/* Framing guidance label */}
        <div className="w-full flex justify-center">
          <span
            className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full transition-colors duration-300 ${
              isCorrectCandidate
                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                : handDetected
                ? 'bg-brand/20 text-brand-soft border border-brand/30'
                : 'bg-black/40 text-white/60 border border-white/10'
            }`}
          >
            {isCorrectCandidate
              ? 'Hold Steady'
              : handDetected
              ? 'Hand Detected'
              : 'Position Hand Here'}
          </span>
        </div>

        <div className="w-full flex justify-center">
          <span className="text-[10px] text-white/40 tracking-wider uppercase font-mono">
            {handDetected ? 'Tracking 21 Points' : 'ASL Guide'}
          </span>
        </div>
      </div>
    </div>
  );
}
