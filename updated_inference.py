import pickle
import cv2
import mediapipe as mp
import numpy as np
import time

# Load the trained model and labels
with open('model.p', 'rb') as f:
    model_dict = pickle.load(f)
model = model_dict['model']
labels_dict = model_dict['labels_dict']

# Clean up labels if they're numpy strings
clean_labels = {}
for k, v in labels_dict.items():
    if hasattr(v, 'item'):
        clean_labels[k] = v.item()  # Convert numpy string to Python string
    else:
        clean_labels[k] = v
labels_dict = clean_labels

# Fallback index->label map, kept consistent with backend/app2.py so both
# inference paths resolve predictions the same way.
SIGN_LABELS = {
    0: "A", 1: "B", 2: "C", 3: "D", 4: "E", 5: "F", 6: "G", 7: "H", 8: "I", 9: "J",
    10: "K", 11: "L", 12: "M", 13: "N", 14: "O", 15: "P", 16: "Q", 17: "R", 18: "S", 19: "T",
    20: "U", 21: "V", 22: "W", 23: "X", 24: "Y", 25: "Z",
    26: "0", 27: "1", 28: "2", 29: "3", 30: "4", 31: "5", 32: "6", 33: "7", 34: "8", 35: "9"
}


def resolve_label(prediction):
    """Resolve a raw model prediction to a display label.

    Handles both models that emit an integer class index and models that emit
    the label string directly, mirroring backend/app2.py.
    """
    if isinstance(prediction, np.integer):
        prediction = int(prediction)
    # If it's an index, map via labels_dict, then the SIGN_LABELS fallback.
    if isinstance(prediction, int):
        return labels_dict.get(prediction, SIGN_LABELS.get(prediction, str(prediction)))
    # Otherwise the model already returned a label string.
    return labels_dict.get(prediction, str(prediction))


print("Model loaded successfully with", len(set(labels_dict.values())), "gestures")

# Try different camera indices
camera_index = 0
max_attempts = 3
for attempt in range(max_attempts):
    print(f"Trying to open camera {camera_index}...")
    cap = cv2.VideoCapture(camera_index)
    
    # Check if camera opened successfully
    if cap.isOpened():
        ret, test_frame = cap.read()
        if ret:
            print(f"Successfully connected to camera {camera_index}")
            break
        else:
            print(f"Camera {camera_index} opened but couldn't read frame")
            cap.release()
    
    # Try next camera index
    camera_index = (camera_index + 1) % 3  # Try indices 0, 1, 2
    if attempt < max_attempts - 1:
        print(f"Retrying with camera index {camera_index}...")
        time.sleep(1)  # Wait before trying next camera

# Final check if camera is working
if not cap.isOpened():
    print("""
ERROR: Unable to access any camera.
Possible reasons:
1. Your webcam is being used by another application
2. Your webcam is disabled or not connected
3. You need to grant permission to access the camera
4. Your system doesn't have a camera

Please close other applications that might be using the camera and try again.
""")
    exit()

# Initialize MediaPipe
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

hands = mp_hands.Hands(static_image_mode=False, min_detection_confidence=0.5, min_tracking_confidence=0.5)

print("Starting webcam capture - press ESC to exit")

frame_count = 0
start_time = time.time()

while True:
    # Reset variables for each frame
    data_aux = []
    x_ = []
    y_ = []

    # Capture a frame from the camera
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame - camera may have been disconnected")
        # Try to reconnect
        cap.release()
        time.sleep(0.5)
        cap = cv2.VideoCapture(camera_index)
        if not cap.isOpened():
            print("Could not reconnect to camera. Exiting...")
            break
        continue

    # Calculate FPS every 30 frames
    frame_count += 1
    if frame_count % 30 == 0:
        end_time = time.time()
        fps = 30 / (end_time - start_time)
        print(f"FPS: {fps:.2f}")
        start_time = time.time()

    H, W, _ = frame.shape  # Get the dimensions of the frame

    # Convert the frame to RGB as MediaPipe expects RGB images
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Process the frame to detect hands
    results = hands.process(frame_rgb)

    # Add text instructions
    cv2.putText(frame, "Make ASL signs A-Z", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
    cv2.putText(frame, "Press ESC to exit", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2, cv2.LINE_AA)

    if results.multi_hand_landmarks:
        # Draw landmarks for each detected hand
        for hand_landmarks in results.multi_hand_landmarks:
            mp_drawing.draw_landmarks(
                frame,  # image to draw on
                hand_landmarks,  # model output (hand landmarks)
                mp_hands.HAND_CONNECTIONS,  # hand connections
                mp_drawing_styles.get_default_hand_landmarks_style(),
                mp_drawing_styles.get_default_hand_connections_style()
            )

            # Reset x_ and y_ for the current hand
            x_ = []
            y_ = []
            data_aux = []

            # Extract normalized x and y coordinates of each landmark
            for i in range(len(hand_landmarks.landmark)):
                x = hand_landmarks.landmark[i].x
                y = hand_landmarks.landmark[i].y

                x_.append(x)
                y_.append(y)

            # Append relative x and y coordinates (normalized)
            for i in range(len(hand_landmarks.landmark)):
                x = hand_landmarks.landmark[i].x
                y = hand_landmarks.landmark[i].y
                data_aux.append(x - min(x_))  # Subtract min x-coordinate to normalize
                data_aux.append(y - min(y_))  # Subtract min y-coordinate to normalize

            # Ensure the length of data_aux matches the expected feature length
            expected_feature_length = 42  # 2 features for 21 landmarks
            if len(data_aux) == expected_feature_length:
                # Make the prediction
                prediction = model.predict([np.asarray(data_aux)])
                predicted_character = resolve_label(prediction[0])  # Resolve index or string label

                # Draw the prediction on the frame
                x1 = int(min(x_) * W) - 10
                y1 = int(min(y_) * H) - 10
                x2 = int(max(x_) * W) - 10
                y2 = int(max(y_) * H) - 10

                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 4)
                cv2.putText(frame, predicted_character, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 1.3, (255, 0, 0), 3, cv2.LINE_AA)

            else:
                print(f"Unexpected feature length: {len(data_aux)}")

    # Display the frame with landmarks and predicted character
    cv2.imshow('ASL Recognition', frame)

    # Break the loop if 'ESC' key is pressed
    if cv2.waitKey(1) & 0xFF == 27:
        break

print("Exiting program")
# Release the video capture and close any OpenCV windows
cap.release()
cv2.destroyAllWindows()
