/**
 * Camera utility functions and classes for working with webcams in the browser
 */

// Ensure browser compatibility by adding polyfills
// This is necessary for older browsers or when the MediaDevices API isn't available
const ensureBrowserCompatibility = () => {
  // Instead of directly assigning to navigator.mediaDevices (read-only property),
  // we'll just check if it exists and provide fallbacks in our code where needed
  if (!navigator.mediaDevices) {
    console.warn("navigator.mediaDevices is not available in this browser");
    return false;
  }

  // Polyfill for navigator.mediaDevices.getUserMedia
  if (!navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
      const getUserMedia = (navigator as any).webkitGetUserMedia ||
                          (navigator as any).mozGetUserMedia || 
                          (navigator as any).msGetUserMedia;
      
      if (!getUserMedia) {
        return Promise.reject(new Error("getUserMedia is not implemented in this browser"));
      }
      
      return new Promise((resolve, reject) => {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }
  
  // Polyfill for older browsers missing requestAnimationFrame
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      return window.setTimeout(callback, 1000 / 60);
    };
  }
  
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
  
  return true;
};

// Try to ensure browser compatibility immediately
try {
  if (typeof window !== 'undefined') {
    ensureBrowserCompatibility();
  }
} catch (error) {
  console.error("Failed to polyfill browser APIs:", error);
}

// Camera options interface
interface CameraOptions {
  width?: number;
  height?: number;
  onFrame?: () => Promise<void>;
  facingMode?: 'user' | 'environment';
  deviceId?: string;
}

/**
 * Enumerate available video input devices (cameras)
 * @returns Promise that resolves to an array of media device info objects
 */
export async function enumerateVideoDevices(): Promise<MediaDeviceInfo[]> {
  try {
    // Ensure MediaDevices API is available
    const isCompatible = ensureBrowserCompatibility();
    
    if (!isCompatible || !navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      throw new Error('enumerateDevices() not supported.');
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'videoinput');
  } catch (error) {
    console.error('Error enumerating video devices:', error);
    return [];
  }
}

/**
 * FallbackCamera provides a camera implementation that works across different browsers
 * It handles the webcam stream and provides a callback for each frame
 */
export class FallbackCamera {
  private video: HTMLVideoElement;
  private options: CameraOptions;
  private running: boolean = false;
  private stream: MediaStream | null = null;
  private lastErrorMessage: string | null = null;
  private frameCallbackId: number | null = null;
  private retryCount: number = 0;
  private maxRetries: number = 3;

  /**
   * Create a new FallbackCamera instance
   * @param videoElement The video element to display the camera feed
   * @param options Camera configuration options
   */
  constructor(videoElement: HTMLVideoElement, options: CameraOptions) {
    this.video = videoElement;
    this.options = {
      width: 640,
      height: 480,
      facingMode: 'user',
      ...options,
    };
    
    // Ensure browser compatibility
    try {
      const isCompatible = ensureBrowserCompatibility();
      if (!isCompatible) {
        console.warn("Browser might not fully support camera features");
      }
    } catch (e) {
      console.warn("Failed to ensure browser compatibility:", e);
    }
  }

  /**
   * Gets the last error message
   */
  public getLastError(): string | null {
    return this.lastErrorMessage;
  }

  /**
   * Checks if camera permissions are granted
   * @returns Promise resolving to boolean indicating if permission is granted
   */
  public static async checkPermissions(): Promise<boolean> {
    try {
      // Ensure browser compatibility
      const isCompatible = ensureBrowserCompatibility();
      
      // Check if the browser supports getUserMedia
      if (!isCompatible || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }

      // Try to access the camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // If successful, stop all tracks and return true
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error("Camera permission check failed:", error);
      return false;
    }
  }

  /**
   * Create optimal camera constraints based on device capabilities
   * @private
   */
  private createCameraConstraints(): MediaStreamConstraints {
    // Basic constraints that work in most browsers
    const constraints: MediaStreamConstraints = {
      video: {
        width: { ideal: this.options.width },
        height: { ideal: this.options.height },
      },
      audio: false,
    };

    // Add facingMode if specified
    if (this.options.facingMode) {
      (constraints.video as MediaTrackConstraints).facingMode = this.options.facingMode;
    }

    // If a specific device is requested, use it
    if (this.options.deviceId) {
      (constraints.video as MediaTrackConstraints).deviceId = { exact: this.options.deviceId };
    }

    return constraints;
  }

  /**
   * Try multiple approaches to start the camera
   * @private
   */
  private async tryMultipleCameraApproaches(): Promise<MediaStream> {
    try {
      // First try with the full constraints
      return await navigator.mediaDevices.getUserMedia(this.createCameraConstraints());
    } catch (error) {
      console.warn('Failed with full constraints, trying simplified constraints', error);
      
      try {
        // Then try with just basic video constraints
        const basicConstraints = { video: true, audio: false };
        return await navigator.mediaDevices.getUserMedia(basicConstraints);
      } catch (secondError) {
        console.error('Failed with basic constraints as well', secondError);
        
        // Try one more approach with minimal constraints
        try {
          const minimalConstraints = { 
            video: { 
              width: { min: 320, ideal: 640, max: 1280 },
              height: { min: 240, ideal: 480, max: 720 }
            } 
          };
          return await navigator.mediaDevices.getUserMedia(minimalConstraints);
        } catch (thirdError) {
          console.error('All camera initialization approaches failed', thirdError);
          throw thirdError;
        }
      }
    }
  }

  /**
   * Start the camera feed
   * @returns Promise that resolves when the camera has started
   */
  async start(): Promise<void> {
    if (this.running) {
      return;
    }

    try {
      // Ensure browser compatibility
      const isCompatible = ensureBrowserCompatibility();
      
      // Check if the browser supports getUserMedia
      if (!isCompatible || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser");
      }

      // Try to get user media using multiple approaches if needed
      this.stream = await this.tryMultipleCameraApproaches();

      if (!this.stream) {
        throw new Error("Could not get camera stream");
      }

      // Set the stream as the video source
      this.video.srcObject = this.stream;
      
      // Wait for the video to be loaded before starting
      return new Promise((resolve, reject) => {
        // Set a timeout in case the video never loads, with a longer timeout
        const timeoutId = setTimeout(() => {
          if (!this.running) {
            this.lastErrorMessage = "Camera initialization timed out";
            // Instead of immediately rejecting, try to recover first
            console.warn("Camera initialization timeout - attempting to recover...");
            
            // Check if video element is still valid
            if (this.video && this.stream) {
              try {
                // Force play with muted flag (autoplay policy often requires this)
                this.video.muted = true;
                this.video.play()
                  .then(() => {
                    this.running = true;
                    this.startFrameLoop();
                    resolve();
                  })
                  .catch(playError => {
                    this.lastErrorMessage = `Camera timed out and recovery failed: ${playError.message}`;
                    reject(new Error(this.lastErrorMessage));
                  });
              } catch (recoveryError) {
                this.lastErrorMessage = `Camera timed out and recovery failed: ${recoveryError instanceof Error ? recoveryError.message : String(recoveryError)}`;
                reject(new Error(this.lastErrorMessage));
              }
            } else {
              reject(new Error(this.lastErrorMessage));
            }
          }
        }, 15000); // 15 second timeout with recovery attempt

        // Handle metadata loaded event
        this.video.onloadedmetadata = () => {
          clearTimeout(timeoutId);
          
          this.video.play()
            .then(() => {
              this.running = true;
              this.startFrameLoop();
              resolve();
            })
            .catch(error => {
              // Try with muted flag if play fails (autoplay policy may require this)
              this.video.muted = true;
              this.video.play()
                .then(() => {
                  this.running = true;
                  this.startFrameLoop();
                  resolve();
                })
                .catch(playError => {
                  this.lastErrorMessage = `Error playing video: ${playError.message}`;
                  reject(playError);
                });
            });
        };
        
        // Handle video errors
        this.video.onerror = (event) => {
          clearTimeout(timeoutId);
          this.lastErrorMessage = `Video element error: ${this.video.error?.message || 'Unknown error'}`;
          reject(new Error(this.lastErrorMessage));
        };
      });
    } catch (error) {
      this.lastErrorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error starting camera:", error);
      
      // Auto-retry logic for temporary errors
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`Retrying camera initialization (attempt ${this.retryCount} of ${this.maxRetries})`);
        
        // Wait a moment before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.start();
      }
      
      throw error;
    }
  }

  /**
   * Stop the camera feed and release resources
   */
  stop(): void {
    if (!this.running) {
      return;
    }

    this.running = false;

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.video.srcObject) {
      this.video.srcObject = null;
    }

    // Cancel any pending frame processing
    if (this.frameCallbackId !== null) {
      cancelAnimationFrame(this.frameCallbackId);
      this.frameCallbackId = null;
    }

    // Try to pause the video to free up resources
    try {
      this.video.pause();
    } catch (e) {
      console.warn("Error pausing video:", e);
    }
  }

  /**
   * Start the frame processing loop
   * @private
   */
  private startFrameLoop(): void {
    if (!this.running || !this.options.onFrame) {
      return;
    }

    const processFrame = async () => {
      if (!this.running) {
        return;
      }

      try {
        await this.options.onFrame?.();
      } catch (error) {
        console.error("Error processing frame:", error);
      }

      if (this.running) {
        this.frameCallbackId = requestAnimationFrame(processFrame);
      }
    };

    processFrame();
  }
} 