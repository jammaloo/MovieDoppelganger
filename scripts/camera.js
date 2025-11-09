// Camera Module - Handles webcam access and photo capture

export class Camera {
    constructor() {
        this.stream = null;
        this.video = document.getElementById('webcam-video');
        this.canvas = document.getElementById('webcam-canvas');
        this.countdownOverlay = document.getElementById('countdown-overlay');
        this.countdownNumber = document.getElementById('countdown-number');
        this.timerBeepSound = null;
        this.shutterSound = null;
    }

    /**
     * Set sound effects
     */
    setSounds(timerBeep, shutter) {
        this.timerBeepSound = timerBeep;
        this.shutterSound = shutter;
    }

    /**
     * Initialize and start webcam
     */
    async start() {
        try {
            const constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;

            return true;
        } catch (error) {
            console.error('Error accessing webcam:', error);
            alert('Unable to access your webcam. Please ensure you have granted camera permissions.');
            return false;
        }
    }

    /**
     * Stop webcam stream
     */
    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.video) {
            this.video.srcObject = null;
        }
    }

    /**
     * Play sound effect
     */
    playSound(sound) {
        if (sound) {
            try {
                sound.currentTime = 0;
                const playPromise = sound.play();
                if (playPromise !== undefined) {
                    playPromise.catch(err => {
                        console.warn('Could not play sound:', err);
                        // Try to unlock audio context (some browsers require user interaction)
                        if (err.name === 'NotAllowedError') {
                            console.warn('Audio playback blocked. User interaction may be required.');
                        }
                    });
                }
            } catch (err) {
                console.warn('Error playing sound:', err);
            }
        }
    }

    /**
     * Start countdown (3, 2, 1)
     * Photo is taken after 3 seconds, even if the beep sound is longer
     */
    async startCountdown() {
        return new Promise((resolve) => {
            this.countdownOverlay.classList.add('active');

            // Play the beep sound once at the start (it may be 4 seconds long)
            this.playSound(this.timerBeepSound);

            let count = 3;
            const countdownInterval = setInterval(() => {
                this.countdownNumber.textContent = count;

                count--;

                if (count < 0) {
                    clearInterval(countdownInterval);
                    this.countdownOverlay.classList.remove('active');
                    resolve();
                }
            }, 1000);
        });
    }

    /**
     * Capture photo from webcam
     */
    async capturePhoto() {
        // Wait for countdown
        await this.startCountdown();

        // Play shutter sound
        this.playSound(this.shutterSound);

        // Set canvas size to match video
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;

        // Draw video frame to canvas
        const ctx = this.canvas.getContext('2d');
        ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

        // Convert to blob
        return new Promise((resolve) => {
            this.canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.95);
        });
    }

    /**
     * Get data URL from canvas
     */
    getDataURL() {
        return this.canvas.toDataURL('image/jpeg', 0.95);
    }

    /**
     * Load image from file
     */
    static loadImageFromFile(file) {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('image/')) {
                reject(new Error('File is not an image'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    resolve(img);
                };
                img.onerror = () => {
                    reject(new Error('Failed to load image'));
                };
                img.src = e.target.result;
            };
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * Convert image to canvas
     */
    static imageToCanvas(image) {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        return canvas;
    }

    /**
     * Resize image to max dimensions while maintaining aspect ratio
     */
    static resizeImage(image, maxWidth = 1024, maxHeight = 1024) {
        let width = image.width;
        let height = image.height;

        if (width > height) {
            if (width > maxWidth) {
                height = height * (maxWidth / width);
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width = width * (maxHeight / height);
                height = maxHeight;
            }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);

        return canvas;
    }
}

