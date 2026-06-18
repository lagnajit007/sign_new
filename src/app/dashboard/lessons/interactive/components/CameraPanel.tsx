'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { Camera, CameraOff, RefreshCw, Play, AlertTriangle, ShieldAlert } from 'lucide-react';
import { CameraInitLoader, ButtonLoader } from '@/components/loaders/ProcessLoaders';

export type CameraState = 'off' | 'requesting' | 'active' | 'stopped' | 'denied' | 'error';

interface CameraPanelProps {
  cameraState: CameraState;
  cameraError: string | null;
  isModelLoading: boolean;
  needsManualPlay: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
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
  onStart,
  onStop,
  onRestart,
  onManualPlay,
  children,
}: CameraPanelProps) {
  const { renderState, icon, title, message } = getStateDisplay(cameraState, cameraError, isModelLoading);

  return (
    <div className="relative bg-black rounded-xl overflow-hidden flex-1" style={{ minHeight: '320px', aspectRatio: '4/3' }}>
      {/* Active camera feed */}
      {cameraState === 'active' && (
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            width={640}
            height={480}
            className="w-full h-full object-contain"
            style={{ display: 'block', backgroundColor: '#000' }}
          />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />
          {needsManualPlay && <ManualPlayButton onClick={onManualPlay} />}
          {children}
        </div>
      )}

      {/* Camera stopped state */}
      {cameraState === 'stopped' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-6">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
            <CameraOff className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium mb-1">Camera Stopped</p>
          <p className="text-sm text-gray-400 mb-6">Your camera has been turned off</p>
          <button
            onClick={onStart}
            className="bg-[#7D54FF] text-white px-6 py-2.5 rounded-full hover:bg-[#6840E0] transition-colors flex items-center gap-2 font-medium"
          >
            <Camera className="w-4 h-4" />
            Start Camera
          </button>
        </div>
      )}

      {/* Camera off / idle state */}
      {cameraState === 'off' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a2e] text-white p-6">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-[#7D54FF]/10 border-2 border-dashed border-[#7D54FF]/30 flex items-center justify-center">
              <Camera className="w-10 h-10 text-[#7D54FF]/60" />
            </div>
          </div>
          <p className="text-xl font-bold mb-2">Camera Off</p>
          <p className="text-sm text-gray-400 text-center mb-8 max-w-xs">
            Enable your camera to start practicing sign language with real-time AI feedback
          </p>
          <button
            onClick={onStart}
            disabled={isModelLoading}
            className="bg-[#7D54FF] text-white px-8 py-3 rounded-full hover:bg-[#6840E0] transition-colors flex items-center gap-2 font-medium disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#7D54FF]/25"
          >
            {isModelLoading ? (
              <>
                <ButtonLoader size={16} />
                Loading Model…
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                Start Camera
              </>
            )}
          </button>
          {isModelLoading && (
            <div className="mt-6">
              <CameraInitLoader message="Initializing Sign Recognition" />
            </div>
          )}
        </div>
      )}

      {/* Requesting permission state */}
      {cameraState === 'requesting' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white p-6">
          <CameraInitLoader message="Requesting Camera Access" />
          <p className="text-sm text-gray-400 mt-4 text-center max-w-xs">
            Please allow camera access when prompted by your browser
          </p>
        </div>
      )}

      {/* Permission denied state */}
      {cameraState === 'denied' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/20 text-white p-6">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-lg font-bold mb-2">Camera Access Denied</p>
          <p className="text-sm text-gray-300 text-center mb-6 max-w-sm">
            We need camera access to recognize your signs. Please update your browser settings to allow camera access for this site.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onRestart}
              className="bg-white text-gray-900 px-5 py-2.5 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-2 font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {cameraState === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-orange-900/20 text-white p-6">
          <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-400" />
          </div>
          <p className="text-lg font-bold mb-2">Camera Error</p>
          <p className="text-sm text-gray-300 text-center mb-2 max-w-sm">{cameraError}</p>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={onRestart}
              className="bg-white text-gray-900 px-5 py-2.5 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-2 font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Camera
            </button>
            <button
              onClick={() => window.location.reload()}
              className="border border-white/30 text-white px-5 py-2.5 rounded-full hover:bg-white/10 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ManualPlayButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
      <button
        onClick={onClick}
        className="bg-[#7D54FF] text-white px-6 py-3 rounded-full hover:bg-[#6840E0] transition-colors text-lg font-semibold flex items-center gap-2 shadow-lg"
      >
        <Play className="w-5 h-5" />
        Click to Enable Camera
      </button>
    </div>
  );
}

function getStateDisplay(
  state: CameraState,
  error: string | null,
  modelLoading: boolean
): { renderState: string; icon: string; title: string; message: string } {
  switch (state) {
    case 'off':
      return { renderState: 'idle', icon: 'camera', title: 'Camera Off', message: '' };
    case 'requesting':
      return { renderState: 'loading', icon: 'loading', title: 'Requesting…', message: '' };
    case 'active':
      return { renderState: 'active', icon: 'active', title: 'Camera Active', message: '' };
    case 'stopped':
      return { renderState: 'stopped', icon: 'stopped', title: 'Camera Stopped', message: '' };
    case 'denied':
      return { renderState: 'denied', icon: 'denied', title: 'Permission Denied', message: '' };
    case 'error':
      return { renderState: 'error', icon: 'error', title: 'Camera Error', message: error || '' };
    default:
      return { renderState: 'idle', icon: 'camera', title: 'Camera Off', message: '' };
  }
}
