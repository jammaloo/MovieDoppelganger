# Assets Directory

This directory contains all media assets for the Movie Doppelganger application.

## Directory Structure

```
assets/
├── images/
│   ├── characters/     # Character images for matching sequence
│   └── sloth.jpg      # Final reveal image (Sloth from The Goonies)
└── sounds/
    ├── timer-beep.mp3      # Timer countdown beep sound
    ├── camera-shutter.mp3  # Camera shutter sound effect
    └── trumpet.mp3         # Celebration trumpet sound
```

## Required Assets

### Character Images (images/characters/)
- 10 character face images for the matching sequence
- Recommended size: 400x400px
- Format: JPG or PNG
- Files should be named: character1.jpg through character10.jpg
- These images will rapidly switch during the facial matching animation

**Note:** The application currently uses placeholder images from placehold.co. To use real images, replace the placeholder URLs in `scripts/preloader.js` with the actual file paths.

### Sloth Image (images/sloth.jpg)
- The final reveal image showing Sloth from The Goonies (1985)
- Recommended size: 400x400px or larger
- Format: JPG or PNG

**Note:** The application currently uses a placeholder image. To use a real image of Sloth, place it at `assets/images/sloth.jpg`.

### Sound Files (sounds/)

#### timer-beep.mp3
- A short beep sound (0.1-0.3 seconds)
- Played three times during the countdown
- Should be clear and audible

#### camera-shutter.mp3
- Camera shutter click sound (0.2-0.5 seconds)
- Played when the photo is captured
- Classic camera shutter sound effect

#### trumpet.mp3
- Celebratory fanfare/trumpet sound (2-5 seconds)
- Played during the final reveal with confetti
- Should be upbeat and celebratory

**Note:** The application currently uses placeholder sound files (silent audio). To add sound effects, place MP3 files with the above names in the `assets/sounds/` directory.

## Where to Find Assets

### Character Images
- Use movie still images from various popular films
- Ensure images are cropped to focus on faces
- Respect copyright - use royalty-free images or create your own

### Sloth Image
- Search for "Sloth Goonies" images
- Ensure you have the right to use the image
- Consider using a screenshot from the movie (for personal use only)

### Sound Effects
- Freesound.org - Free sound effects library
- Zapsplat.com - Free sound effects for personal use
- YouTube Audio Library - Royalty-free sound effects
- Create your own using audio editing software

## Generating Placeholder Audio Files

If you need to create silent placeholder files quickly, you can use FFmpeg:

```bash
# Timer beep (0.2 second silent audio)
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.2 -q:a 9 -acodec libmp3lame timer-beep.mp3

# Camera shutter (0.3 second silent audio)
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.3 -q:a 9 -acodec libmp3lame camera-shutter.mp3

# Trumpet (3 second silent audio)
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 3 -q:a 9 -acodec libmp3lame trumpet.mp3
```

Or you can find real sound effects online and download them to replace these files.

## Testing

The application will work with placeholder images and sounds, but for the full experience:
1. Add real character images to `images/characters/`
2. Add a real Sloth image to `images/sloth.jpg`
3. Add sound effect files to `sounds/`
4. Clear your browser cache and reload the page

