/**
 * Contextual ASL mnemonic and form tips for each fingerspelled letter and number.
 * Sourced from standard ASL fingerspelling instructional guidelines.
 */
export const SIGN_TIPS: Record<string, string> = {
  A: "Make a fist with your thumb resting upright against the side of your index finger.",
  B: "Hold all four fingers flat and upright together, with your thumb folded across your palm.",
  C: "Curve your fingers and thumb together to trace the shape of the letter 'C'.",
  D: "Point your index finger straight up, touching your thumb to your other three fingers.",
  E: "Curl all fingers down toward your palm and tuck your thumb beneath your fingertips.",
  F: "Touch the tip of your index finger to your thumb, holding the other three fingers upright.",
  G: "Point your index finger horizontally, with your thumb held parallel right behind it.",
  H: "Extend both your index and middle fingers horizontally side-by-side, pointing across.",
  I: "Extend only your pinky finger straight up, keeping all other fingers closed into a fist.",
  J: "Hold up your pinky finger and trace a gentle 'J' curve in the air.",
  K: "Make a 'V' with index and middle fingers, placing your thumb upright between them.",
  L: "Make an 'L' shape with your index finger pointing up and your thumb pointing to the side.",
  M: "Tuck your thumb under your first three fingers (index, middle, ring) in a closed fist.",
  N: "Tuck your thumb under your first two fingers (index and middle) in a closed fist.",
  O: "Touch all fingertips to your thumb to form an open 'O' circle.",
  P: "Form a 'K' hand directed downwards, index finger pointing forward and middle finger down.",
  Q: "Point a 'G' hand downwards toward the ground, thumb and index pointing down.",
  R: "Cross your middle finger over your index finger, keeping both pointing straight up.",
  S: "Make a tight fist with your thumb wrapped across the front of your curled fingers.",
  T: "Tuck your thumb between your index and middle fingers and close your fist.",
  U: "Hold your index and middle fingers straight up together, touching side-by-side.",
  V: "Spread your index and middle fingers apart to form a 'V' shape.",
  W: "Extend your index, middle, and ring fingers upright in a clear 'W' shape.",
  X: "Make a fist and bend your index finger into a hook shape.",
  Y: "Extend your thumb and pinky out to the sides ('hang loose'), keeping other fingers tucked.",
  Z: "Extend your index finger and draw the letter 'Z' in the air.",
  0: "Form an 'O' circle with all fingertips meeting the tip of your thumb.",
  1: "Hold your index finger straight up with your other fingers curled into a fist.",
  2: "Hold your index and middle fingers upright in a 'V' shape.",
  3: "Extend your thumb, index, and middle fingers with pinky and ring curled in.",
  4: "Hold up all four fingers with your thumb tucked across your palm.",
  5: "Spread all five fingers wide with your palm facing the camera.",
  6: "Touch your pinky fingertip to your thumb, holding the other three fingers upright.",
  7: "Touch your ring fingertip to your thumb, holding the other three fingers upright.",
  8: "Touch your middle fingertip to your thumb, holding the other three fingers upright.",
  9: "Touch your index fingertip to your thumb, holding the other three fingers upright.",
};

export function getSignTip(sign: string): string {
  return SIGN_TIPS[sign.toUpperCase()] ?? `Form the sign for "${sign}" clearly and keep your hand steady.`;
}
