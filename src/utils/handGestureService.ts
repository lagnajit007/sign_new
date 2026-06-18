/**
 * Utility service for hand gesture recognition
 * Currently provides mock functionality for testing purposes
 */

// Interface for prediction results
export interface HandGesturePrediction {
  prediction: string;
  confidence: number;
}

// Alias for compatibility with the hook
export type PredictionResult = HandGesturePrediction;

// Hand landmark structure
export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

/**
 * Generate a random hand gesture prediction
 * This is used in mock mode when camera access is not available
 * @returns A prediction object with a random sign and confidence level
 */
export function getRandomPrediction(): HandGesturePrediction {
  // All possible gestures (alphabet and numbers)
  const allGestures = [
    // Alphabet
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", 
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    // Numbers
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
  ];
  
  // Generate random index and confidence
  const randomIndex = Math.floor(Math.random() * allGestures.length);
  const randomConfidence = 0.5 + Math.random() * 0.5; // Between 0.5 and 1.0
  
  return {
    prediction: allGestures[randomIndex],
    confidence: randomConfidence
  };
}

/**
 * Process hand landmarks to determine the gesture
 * This is a placeholder for real gesture recognition logic
 * @param landmarks The hand landmarks from MediaPipe
 * @returns A prediction based on the hand landmarks
 */
export function processHandLandmarks(landmarks: HandLandmark[]): HandGesturePrediction {
  // This would contain actual landmark processing logic
  // For now, return a random prediction
  return getRandomPrediction();
}

/**
 * Predict the hand gesture based on landmarks
 * Currently returns a mock prediction
 * @param landmarks Hand landmarks from MediaPipe
 * @returns Promise resolving to a prediction result
 */
export async function predictGesture(landmarks: HandLandmark[]): Promise<PredictionResult> {
  // In a real implementation, this would analyze the landmarks
  // and return an actual prediction
  return new Promise((resolve) => {
    // Add a small delay to simulate processing
    setTimeout(() => {
      resolve(processHandLandmarks(landmarks));
    }, 10);
  });
} 