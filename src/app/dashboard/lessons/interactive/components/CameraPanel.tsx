'use client';

import { Camera, CameraOff, RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react';
import Button from '@/components/Button';
import { CameraInitLoader } from '@/components/loaders/ProcessLoaders';
import HandGuideOverlay from './HandGuideOverlay';

export type CameraState = 'off' | 'requesting' | 'active' | 'stopped' | 'denied' | 'error';

interface CameraPanelProps {
  cameraState: CameraState;
  cameraError: string | null;
  isModelLoading: boolean;
  needsManualPlay: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  handDetected?: boolean;
  isCorrectCandidate?: boolean;
  /** Real video aspect ratio, so the video and landmark canvas share one box. */
  videoAspect?: number;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
  onManualPlay: () => void;
  children?: React.ReactNode;
}

export default function CameraPanel({
  cameraState,
  cameraError,
  isModelLoading,
  needsManualPlay,
  videoRef,
  canvasRef,
  handDetected = false,
  isCorrectCandidate = false,
  videoAspect = 4 / 3,
  onStart,
  onRestart,
  onManualPlay,
  children,
}: CameraPanelProps) {
  return (
    <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black [container-type:size]">
      {/* Video + landmark canvas share one box sized to the camera's aspect ratio,
          fitted inside the available space, so the skeleton lines up exactly. */}
      <div
        className={`relative ${cameraState === 'active' ? '' : 'invisible'}`}
        style={{ aspectRatio: String(videoAspect), width: `min(100cqw, calc(100cqh * ${videoAspect}))` }}
      >
        <video
          ref={videoRef as React.Ref<HTMLVideoElement>}
          playsInline
          muted
          className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
        />
        <canvas
          ref={canvasRef as React.Ref<HTMLCanvasElement>}
          width={640}
          height={480}
          className="pointer-events-none absolute inset-0 h-full w-full -scale-x-100"
        />
        {cameraState === 'active' && <HandGuideOverlay handDetected={handDetected} isCorrectCandidate={isCorrectCandidate} />}
      </div>

      {/* Manual play overlay if browser prevented autoplay */}
      {cameraState === 'active' && needsManualPlay && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 p-4">
          <p className="text-sm text-white mb-3">Click to enable camera feed</p>
          <Button variant="primary" size="sm" onClick={onManualPlay}>
            Resume Playback
          </Button>
        </div>
      )}

      {/* Dynamic children (Countdown, Stability meter, Target badge) */}
      {cameraState === 'active' && children}

      {/* Camera stopped state */}
      {cameraState === 'stopped' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
          <div className="size-14 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
            <CameraOff className="size-6 text-zinc-400" />
          </div>
          <p className="text-base font-semibold mb-1">{cameraError ? 'Camera disconnected' : 'Camera is off'}</p>
          <p className="text-xs text-zinc-400 mb-5 text-center max-w-xs">
            {cameraError ?? "Start it again when you're ready to keep practising."}
          </p>
          <Button variant="primary" size="sm" icon={Camera} onClick={onStart}>
            Start camera
          </Button>
        </div>
      )}

      {/* Camera off / Initial state */}
      {cameraState === 'off' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
          <Camera className="mb-4 size-7 text-zinc-500" aria-hidden />
          <h2 className="text-base font-semibold">Turn on your camera to practise</h2>
          <p className="mt-1 mb-5 max-w-xs text-sm text-zinc-400">Your video stays on this device.</p>
          <button
            type="button"
            onClick={onStart}
            disabled={isModelLoading}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--sj-brand-hover)] px-4 text-sm font-medium text-white transition-colors hover:bg-[#7c5cff] disabled:opacity-60"
          >
            <Camera className="size-4" aria-hidden />
            {isModelLoading ? 'Loading hand tracking…' : 'Start camera'}
          </button>
        </div>
      )}

      {/* Requesting permission */}
      {cameraState === 'requesting' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white p-6">
          <CameraInitLoader message="Requesting Camera Access..." />
          <p className="text-xs text-zinc-400 mt-3 text-center max-w-xs">
            Please allow camera access in your browser prompt.
          </p>
        </div>
      )}

      {/* Permission denied */}
      {cameraState === 'denied' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
          <ShieldAlert className="mb-3 size-7 text-amber-300" aria-hidden />
          <p className="text-base font-semibold">Camera access is blocked</p>
          <p className="mt-1 mb-5 max-w-xs text-sm text-zinc-400">
            Allow the camera from the icon in your browser&apos;s address bar, then try again.
          </p>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRestart}>
            Try again
          </Button>
        </div>
      )}

      {/* Error state */}
      {cameraState === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
          <AlertTriangle className="mb-3 size-7 text-amber-300" aria-hidden />
          <p className="text-base font-semibold">The camera didn&apos;t start</p>
          <p className="mt-1 mb-5 max-w-xs text-sm text-zinc-400">{cameraError || 'Check that no other app is using it, then try again.'}</p>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRestart}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
