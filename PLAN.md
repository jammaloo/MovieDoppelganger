# Movie Doppelganger - Implementation Plan

## Project Overview
A frontend-only prank website that claims to match user faces to movie characters, but always returns the same result (Sloth from The Goonies).

## Technology Stack
- **HTML5/CSS3/JavaScript** (Vanilla JS, no frameworks)
- **face-api.js** (via CDN: https://cdn.jsdelivr.net/gh/cgarciagl/face-api.js@0.22.2/)
- **Webcam API** (getUserMedia)
- **Canvas API** (for image processing and face cropping)
- **Confetti library** (canvas-confetti or similar)
- **Web Audio API** (for sounds)

## Project Structure
```
MovieDoppelganger/
├── index.html              # Main entry point
├── styles/
│   └── main.css           # All styling
├── scripts/
│   ├── app.js             # Main application logic
│   ├── camera.js          # Webcam handling
│   ├── faceDetection.js   # face-api integration
│   ├── animation.js       # Transitions and animations
│   └── preloader.js       # Asset preloading
├── assets/
│   ├── images/
│   │   ├── characters/    # Character images for matching sequence
│   │   │   ├── character1.jpg
│   │   │   ├── character2.jpg
│   │   │   └── ... (multiple character images)
│   │   └── sloth.jpg      # Final result image (Sloth from Goonies)
│   ├── sounds/
│   │   ├── timer-beep.mp3 # Timer sound (3 beeps)
│   │   ├── camera-shutter.mp3 # Camera shutter sound
│   │   └── trumpet.mp3    # Celebration trumpet sound
│   └── fonts/             # Any custom fonts
└── README.md
```

## Implementation Steps

### Phase 1: Project Setup & Basic Structure
1. Create HTML structure with semantic sections
2. Set up CSS with modern styling
3. Add disclaimer banner at top
4. Create main container for step-based navigation
5. Set up face-api.js CDN links

### Phase 2: Step 1 - Photo Upload/Webcam Capture
1. Create upload interface with two options:
   - File input for photo upload
   - Webcam button to activate camera
2. Implement webcam access using getUserMedia
3. Create camera preview with "Take Photo" button
4. Implement 3-second countdown timer:
   - Visual countdown (3, 2, 1)
   - Audio beeps for each second
   - Capture photo after countdown
5. Store captured/uploaded image for next step

### Phase 3: Step 2 - Face Detection & Landmarks
1. Create "Analyzing Facial Structure" screen
2. Display user's uploaded/captured photo
3. Initialize face-api.js models:
   - Load face detection model
   - Load face landmark model (68 points)
4. Detect face in image:
   - If no face found: show error message, return to step 1
   - If face found: proceed
5. Crop image to face bounding box
6. Animate 68 facial landmarks appearing over cropped face:
   - Fade in landmarks one by one or in groups
   - Use face-api's landmark detection
7. After landmarks are fully visible, transition to next step

### Phase 4: Step 3 - Matching Sequence
1. Create matching scene layout:
   - Left side: User's cropped face (no landmarks)
   - Right side: Character face display area
   - Percentage match display
2. Prepare character images array (multiple characters)
3. Implement rapid switching animation:
   - Switch character images every 200-300ms
   - Generate random percentage (20-60%) for each character
   - Display percentage with each character
4. Run for approximately 5 seconds

### Phase 5: Step 4 - Final Reveal
1. After 5 seconds, trigger reveal sequence:
   - Flash "97% facial match found" text
   - Fade background to black
   - Animate user photo moving to center
2. Fade out user photo
3. Fade in Sloth image (final result)
4. Display result text: "Your facial structure has a 97% similarity with Sloth from the Goonies (1985). Congratulations!"
5. Trigger confetti animation (use canvas-confetti library)
6. Play celebratory trumpet sound
7. Add "Try Again" button to restart

### Phase 6: Asset Preloading
1. Create preloader system:
   - Preload all character images
   - Preload Sloth image
   - Preload all sound files
   - Preload face-api.js models
2. Show loading progress indicator
3. Only enable photo upload/webcam after assets are loaded

### Phase 7: Polish & UX
1. Add smooth transitions between steps
2. Implement error handling:
   - No face detected
   - Camera access denied
   - File upload errors
3. Add responsive design for mobile/tablet
4. Optimize images for web
5. Test across browsers
6. Add accessibility features (ARIA labels, keyboard navigation)

## Technical Details

### face-api.js Models to Load
- `tinyFaceDetector` or `ssdMobilenetv1` (face detection)
- `faceLandmark68Net` (68-point landmarks)
- Models should be loaded from: `https://cdn.jsdelivr.net/gh/cgarciagl/face-api.js@0.22.2/weights/`

### Character Images Needed
- 10-15 different movie character images (for the rapid switching effect)
- All should be cropped to face/headshots
- Consistent sizing recommended

### Sound Files Needed
- Timer beep (3 beeps, 1 second apart)
- Camera shutter sound
- Celebratory trumpet sound

### Animation Timing
- Landmark fade-in: ~2-3 seconds
- Character switching: 5 seconds total, ~200-300ms per switch
- Final reveal transition: ~2-3 seconds
- Confetti duration: ~5 seconds

## Key Functions to Implement

1. `initApp()` - Initialize app, load models, preload assets
2. `handleFileUpload(file)` - Process uploaded image
3. `initWebcam()` - Start webcam stream
4. `startCountdown()` - 3-second countdown with audio
5. `capturePhoto()` - Capture image from canvas
6. `detectFace(image)` - Use face-api to detect face
7. `cropToFace(image, detection)` - Crop image to face bounding box
8. `drawLandmarks(canvas, landmarks)` - Draw 68 landmarks
9. `animateLandmarks()` - Animate landmarks appearing
10. `startMatchingSequence()` - Rapid character switching
11. `revealResult()` - Final reveal animation
12. `triggerConfetti()` - Confetti animation
13. `preloadAssets()` - Preload all images and sounds

## CSS Considerations
- Modern, clean design
- Smooth transitions and animations
- Dark theme for matching sequence
- Responsive layout
- Loading states
- Error states

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- HTTPS required for getUserMedia (or localhost)
- Canvas API support
- Web Audio API support

## Security & Privacy
- Disclaimer clearly visible
- No data sent to server
- All processing client-side
- Clear messaging about local-only processing

