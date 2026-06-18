// HandTrackingAPIClient.ts
// Client for interacting with the hand tracking API backend

/**
 * Client for communicating with the Hand Tracking API backend.
 * Handles sending hand landmark data to the Flask backend and receiving predictions.
 */
export class HandTrackingAPIClient {
  private baseUrl: string;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private retryDelay: number = 300;
  private lastRequestTime: number = 0;
  private connectionTestInProgress: boolean = false;
  private lastConnectionStatus: boolean = false;
  private lastConnectionCheckTime: number = 0;
  private connectionCheckInterval: number = 10000; // 10 seconds
  
  /**
   * Create a new HandTrackingAPIClient
   * @param baseUrl - The base URL of the Flask backend (e.g., 'http://localhost:5000')
   */
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    console.log('HandTrackingAPIClient initialized with base URL:', baseUrl);
  }
  
  /**
   * Check if the backend is available with connection pooling to avoid too many checks
   * @returns Promise resolving to true if backend is available, false otherwise
   */
  async checkAvailability(): Promise<boolean> {
    const now = Date.now();
    
    // Return cached result if checked recently
    if (now - this.lastConnectionCheckTime < this.connectionCheckInterval) {
      return this.lastConnectionStatus;
    }
    
    // Skip if a connection test is already in progress
    if (this.connectionTestInProgress) {
      return this.lastConnectionStatus;
    }
    
    this.connectionTestInProgress = true;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // Faster timeout
      
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      this.lastConnectionStatus = response.ok;
      this.lastConnectionCheckTime = now;
      return response.ok;
    } catch (error) {
      console.error("Backend availability check failed:", error);
      this.lastConnectionStatus = false;
      this.lastConnectionCheckTime = now;
      return false;
    } finally {
      this.connectionTestInProgress = false;
    }
  }
  
  /**
   * Send hand landmark data to the backend for prediction with performance optimizations
   * @param landmarks - Flattened array of hand landmark coordinates (x,y pairs)
   * @returns Promise resolving to prediction result
   */
  async predictGesture(landmarks: number[]): Promise<{ prediction: string; confidence: number }> {
    // Rate limit requests to prevent overloading backend
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < 100 && this.lastRequestTime > 0) {
      await new Promise(resolve => setTimeout(resolve, 100 - elapsed));
    }
    this.lastRequestTime = Date.now();
    
    // Reset retry counter if this is a new call
    if (this.retryCount === 0) {
      // Optimize validation - only do detailed validation in development
      if (process.env.NODE_ENV !== 'production') {
        this.validateLandmarks(landmarks);
      } else if (landmarks.length !== 42) {
        // Only check length in production for performance
        console.warn(`Warning: Expected 42 values (21 landmarks x,y), but got ${landmarks.length}`);
      }
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Shorter timeout for better UX
      
      const response = await fetch(`${this.baseUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ landmarks }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server returned ${response.status}: ${errorText}`);
        
        // Check if we should retry
        if (this.retryCount < this.maxRetries && (
            response.status === 500 || 
            response.status === 503 || 
            response.status === 429 ||
            response.status === 504
        )) {
          this.retryCount++;
          console.log(`Retrying request (${this.retryCount}/${this.maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * this.retryCount));
          return this.predictGesture(landmarks);
        }
        
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      // Reset retry counter on success
      this.retryCount = 0;
      
      const result = await response.json();
      
      // Validate response format
      if (!result || typeof result.prediction !== 'string') {
        throw new Error("Invalid response format from server");
      }
      
      return {
        prediction: result.prediction,
        confidence: result.confidence || 0.5
      };
    } catch (error) {
      console.error("Error predicting gesture:", error);
      
      // Check if this is a network error and we should retry
      if (this.retryCount < this.maxRetries && 
          (error instanceof TypeError || 
          (error as Error).message?.includes('network') || 
          (error as Error).message?.includes('timeout'))) {
        this.retryCount++;
        console.log(`Network error, retrying (${this.retryCount}/${this.maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * this.retryCount));
        return this.predictGesture(landmarks);
      }
      
      // Reset retry counter
      this.retryCount = 0;
      throw error;
    }
  }
  
  /**
   * Validate landmark data for debugging
   * @param landmarks - The landmark data to validate
   */
  private validateLandmarks(landmarks: number[]): void {
    // Enhanced validation and logging
    if (landmarks.length !== 42) {
      console.warn(`Warning: Expected 42 values (21 landmarks x,y), but got ${landmarks.length}`);
    }
    
    // Check for NaN or extreme values that could cause issues
    const hasInvalidValues = landmarks.some(val => isNaN(val) || !isFinite(val) || Math.abs(val) > 10);
    if (hasInvalidValues) {
      console.warn("Warning: Landmarks contain NaN, infinite, or extreme values");
      console.log("Problematic landmarks:", landmarks.map((val, i) => 
        isNaN(val) || !isFinite(val) || Math.abs(val) > 10 ? `idx ${i}: ${val}` : null
      ).filter(Boolean));
    }
    
    // Validate that landmarks are actually normalized (all values should be between 0-1 for normalized data)
    const allAreNormalized = landmarks.every(val => val >= 0 && val <= 1);
    if (!allAreNormalized) {
      console.log("Note: Not all landmark values are within normalized range (0-1)");
    }
    
    // Log the full landmarks array in JSON format in development only to reduce console spam
    if (process.env.NODE_ENV === 'development') {
      console.log("Landmarks JSON:", JSON.stringify(landmarks));
    }
  }
  
  /**
   * Get available gestures from the backend
   */
  async getAvailableGestures(): Promise<string[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(`${this.baseUrl}/gestures`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to get available gestures: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.gestures || [];
    } catch (error) {
      console.error('Failed to get available gestures:', error);
      return [];
    }
  }
}