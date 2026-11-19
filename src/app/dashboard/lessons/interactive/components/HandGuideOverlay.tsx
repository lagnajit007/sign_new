'use client';

/**
 * One quiet outline showing where to put the hand. It fades out once a hand is
 * being tracked; the skeleton itself is then the feedback. No text, no glow.
 */
export default function HandGuideOverlay({
  handDetected,
}: {
  handDetected: boolean;
  isCorrectCandidate?: boolean;
}) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div
        className={`aspect-[3/4] h-[72%] rounded-[28px] border border-white/35 transition-opacity duration-300 ${
          handDetected ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
}
