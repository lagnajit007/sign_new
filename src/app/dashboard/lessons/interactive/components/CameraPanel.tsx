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
  onStart,
  onRestart,
  onManualPlay,
  children,
}: CameraPanelProps) {
  return (
    <div
      className="relative bg-zinc-950 rounded-2xl overflow-hidden flex-1 min-h-0 flex items-center justify-center border border-white/10"
      style={{ aspectRatio: '4/3' }}
    >
      {/* Video element - always in DOM for ref stability */}
      <video
        ref={videoRef as React.Ref<HTMLVideoElement>}
        playsInline
        muted
        width={640}
        height={480}
        className={`w-full h-full object-contain ${cameraState === 'active' ? '' : 'hidden'}`}
        style={{ transform: 'scaleX(-1)' }} // Mirror view for natural interaction
      />

      {/* Canvas overlay for MediaPipe landmarks */}
      <canvas
        ref={canvasRef as React.Ref<HTMLCanvasElement>}
        width={640}
        height={480}
        className={`absolute inset-0 w-full h-full pointer-events-none ${
          cameraState === 'active' ? '' : 'hidden'
        }`}
        style={{ transform: 'scaleX(-1)' }} // Mirrored to match video
      />

      {/* Subtle hand positioning framing guide */}
      {cameraState === 'active' && (
        <HandGuideOverlay
          handDetected={handDetected}
          isCorrectCandidate={isCorrectCandidate}
        />
      )}

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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-white p-6">
          <div className="size-14 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
            <CameraOff className="size-6 text-zinc-400" />
          </div>
          <p className="text-base font-semibold mb-1">{cameraError ? 'Camera disconnected' : 'Camera stopped'}</p>
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 text-white p-6 text-center">
          <div className="size-20 rounded-full bg-brand/10 border-2 border-dashed border-brand/30 flex items-center justify-center mb-4">
            <Camera className="size-8 text-brand" />
          </div>
          <h2 className="text-lg font-bold mb-1">Start Camera Practice</h2>
          <p className="text-xs text-zinc-400 max-w-xs mb-6 leading-relaxed">
            Enable your webcam to practice sign language with real-time in-browser AI recognition. Video never leaves your device.
          </p>
          <Button
            variant="primary"
            size="md"
            icon={Camera}
            onClick={onStart}
            loading={isModelLoading}
            className="shadow-lg shadow-brand/20"
          >
            {isModelLoading ? 'Loading AI Model…' : 'Start Camera'}
          </Button>
          {isModelLoading && (
            <div className="mt-4">
              <CameraInitLoader message="Loading Sign Recognition..." />
            </div>
          )}
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/40 text-white p-6 text-center">
          <div className="size-14 rounded-full bg-red-500/20 flex items-center justify-center mb-3">
            <ShieldAlert className="size-6 text-red-400" />
          </div>
          <p className="text-base font-bold mb-1 text-red-300">Camera Access Denied</p>
          <p className="text-xs text-zinc-300 mb-5 max-w-xs leading-relaxed">
            Sanjog needs camera access to track your signs. Please enable camera permissions in your browser URL bar.
          </p>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRestart}>
            Try Again
          </Button>
        </div>
      )}

      {/* Error state */}
      {cameraState === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-orange-950/40 text-white p-6 text-center">
          <div className="size-14 rounded-full bg-orange-500/20 flex items-center justify-center mb-3">
            <AlertTriangle className="size-6 text-orange-400" />
          </div>
          <p className="text-base font-bold mb-1 text-orange-300">Camera Error</p>
          <p className="text-xs text-zinc-300 mb-5 max-w-xs leading-relaxed">
            {cameraError || 'Unable to connect to camera device.'}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRestart}>
              Retry Camera
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
