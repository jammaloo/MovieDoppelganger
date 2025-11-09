# Movie Doppelganger 🎬

A fun prank website that claims to find which movie character matches your face... but always returns the same hilarious result: Sloth from The Goonies!

## Features

- 📸 **Photo Capture** - Upload a photo or use your webcam with a countdown timer
- 🎯 **Face Detection** - Uses face-api.js to detect faces and map 68 facial landmarks
- 🔄 **Matching Animation** - Dramatic facial recognition sequence with random character matches
- 🎉 **Epic Reveal** - Confetti and celebration when your "match" is revealed
- 🔒 **Privacy First** - Everything runs locally in your browser, no data is sent to any server

## How It Works

1. **Upload/Capture** - Take or upload a photo of yourself
2. **Analysis** - Watch as the app detects your face and maps 68 facial landmarks
3. **Matching** - See your face compared against a database of movie characters
4. **Reveal** - Discover you're a 97% match with Sloth from The Goonies! 🎊

## Technology Stack

- **HTML5/CSS3/JavaScript** (Vanilla JS, no frameworks)
- **face-api.js** - Facial detection and landmark mapping
- **Canvas API** - Image processing and manipulation
- **Web Audio API** - Sound effects
- **canvas-confetti** - Celebration effects
- **getUserMedia API** - Webcam access

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- HTTPS or localhost (required for webcam access)

### Installation

1. Clone or download this repository
2. (Optional) Add custom images and sounds to the `assets/` directory (see `assets/README.md`)
3. Serve the files using a local web server

### Running Locally

You can use any local web server. Here are a few options:

**Using Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Using Node.js (http-server):**
```bash
npx http-server -p 8000
```

**Using PHP:**
```bash
php -S localhost:8000
```

Then open your browser to `http://localhost:8000`

## Project Structure

```
MovieDoppelganger/
├── index.html              # Main HTML file
├── styles/
│   └── main.css           # All styling and animations
├── scripts/
│   ├── app.js             # Main application logic
│   ├── camera.js          # Webcam handling
│   ├── faceDetection.js   # face-api integration
│   ├── animation.js       # Transitions and effects
│   └── preloader.js       # Asset preloading
├── assets/
│   ├── images/
│   │   ├── characters/    # Character images for matching
│   │   └── sloth.jpg      # Final result image
│   └── sounds/
│       ├── timer-beep.mp3
│       ├── camera-shutter.mp3
│       └── trumpet.mp3
├── PLAN.md                # Implementation plan
└── README.md              # This file
```

## Customization

### Change the Final Result

To change the final reveal from Sloth to a different character:

1. Replace `assets/images/sloth.jpg` with your desired image
2. Update the text in `index.html` (line with "Sloth from The Goonies")
3. Optionally update the percentage in `scripts/animation.js`

### Add Your Own Character Images

1. Add character face images to `assets/images/characters/`
2. Update the image paths in `scripts/preloader.js`
3. Images should be approximately 400x400px for best results

### Customize Sounds

Replace the sound files in `assets/sounds/` with your own MP3 files:
- `timer-beep.mp3` - Countdown beep sound
- `camera-shutter.mp3` - Photo capture sound
- `trumpet.mp3` - Celebration sound

## Browser Compatibility

- ✅ Chrome 70+
- ✅ Firefox 65+
- ✅ Safari 12+
- ✅ Edge 79+

**Note:** Webcam features require HTTPS (or localhost for development).

## Privacy

This application:
- ✅ Runs entirely in your browser
- ✅ Does not upload images to any server
- ✅ Does not store or save any data
- ✅ Requires webcam permission only if you choose to use the camera

All facial detection and processing happens locally using JavaScript and the face-api.js library.

## Known Issues

- Face detection requires good lighting and a clear view of the face
- Very large images may take longer to process
- Sound effects may not play on some mobile browsers due to autoplay restrictions

## Credits

- **face-api.js** - Face detection library by Vincent Mühler
- **canvas-confetti** - Confetti animation library by Kiril Vatev
- Inspired by movie facial recognition scenes from sci-fi shows

## License

This project is for educational and entertainment purposes. Please ensure you have the right to use any images or sounds you add to the project.

## Future Enhancements

- [ ] Add more reveal animations
- [ ] Allow users to share results (with permission)
- [ ] Add multiple prank options (different characters)
- [ ] Mobile-optimized layout
- [ ] Multiple language support

---

**Warning:** This is a prank website! The facial matching is completely fake and always returns the same result. Use responsibly and let people in on the joke! 😄

