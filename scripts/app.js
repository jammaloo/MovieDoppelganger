// Main Application Module

import { Preloader } from './preloader.js';
import { Camera } from './camera.js';
import { FaceDetection } from './faceDetection.js';
import { Animation } from './animation.js';

class MovieDoppelgangerApp {
    constructor() {
        this.preloader = new Preloader();
        this.camera = new Camera();
        this.faceDetection = new FaceDetection();
        this.assets = null;
        this.currentImage = null;
        this.croppedFaceCanvas = null;

        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing Movie Doppelganger...');

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // Wait for face-api to load
        await this.waitForFaceApi();

        // Load all assets
        this.assets = await this.preloader.loadAll();

        console.log('All assets loaded!');

        // Set up camera sounds
        this.camera.setSounds(
            this.assets.sounds.timerBeep,
            this.assets.sounds.cameraShutter
        );

        // Switch to upload screen
        setTimeout(() => {
            Animation.switchScreen('loading-screen', 'upload-screen');
            this.setupEventListeners();
        }, 500);
    }

    /**
     * Wait for face-api library to be loaded
     */
    async waitForFaceApi() {
        let attempts = 0;
        while (typeof faceapi === 'undefined' && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (typeof faceapi === 'undefined') {
            console.error('face-api.js failed to load');
            alert('Failed to load facial recognition library. Please refresh the page.');
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Upload screen
        document.getElementById('webcam-btn').addEventListener('click', () => {
            this.handleWebcamClick();
        });

        document.getElementById('file-input').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        // Webcam screen
        document.getElementById('take-photo-btn').addEventListener('click', () => {
            this.handleTakePhoto();
        });

        document.getElementById('cancel-webcam-btn').addEventListener('click', () => {
            this.handleCancelWebcam();
        });

        // Error screen
        document.getElementById('retry-btn').addEventListener('click', () => {
            this.handleRetry();
        });

        // Reveal screen
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.handleRestart();
        });
    }

    /**
     * Handle webcam button click
     */
    async handleWebcamClick() {
        const success = await this.camera.start();

        if (success) {
            Animation.switchScreen('upload-screen', 'webcam-screen');
        }
    }

    /**
     * Handle take photo button click
     */
    async handleTakePhoto() {
        // Disable button during capture
        const btn = document.getElementById('take-photo-btn');
        btn.disabled = true;

        try {
            // Capture photo with countdown
            const blob = await this.camera.capturePhoto();

            // Stop camera
            this.camera.stop();

            // Convert blob to image
            const url = URL.createObjectURL(blob);
            const img = await this.loadImage(url);

            // Process the image
            await this.processImage(img);

            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error taking photo:', error);
            alert('Failed to capture photo. Please try again.');
        } finally {
            btn.disabled = false;
        }
    }

    /**
     * Handle cancel webcam
     */
    handleCancelWebcam() {
        this.camera.stop();
        Animation.switchScreen('webcam-screen', 'upload-screen');
    }

    /**
     * Handle file upload
     */
    async handleFileUpload(file) {
        if (!file) return;

        try {
            const img = await Camera.loadImageFromFile(file);
            await this.processImage(img);
        } catch (error) {
            console.error('Error loading file:', error);
            alert('Failed to load image. Please try again with a different file.');
        }
    }

    /**
     * Load image from URL
     */
    loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }

    /**
     * Process uploaded/captured image
     */
    async processImage(image) {
        // Switch to analysis screen
        Animation.switchScreen('upload-screen', 'analysis-screen');
        Animation.switchScreen('webcam-screen', 'analysis-screen');

        // Get analysis canvas
        const analysisCanvas = document.getElementById('analysis-canvas');
        const analysisText = document.getElementById('analysis-text');

        // Resize image if too large
        const resizedCanvas = Camera.resizeImage(image, 800, 800);

        // Display image on canvas
        analysisCanvas.width = resizedCanvas.width;
        analysisCanvas.height = resizedCanvas.height;
        const ctx = analysisCanvas.getContext('2d');
        ctx.drawImage(resizedCanvas, 0, 0);

        // Wait a moment
        await Animation.wait(500);

        // Detect face
        analysisText.textContent = 'Detecting facial features...';
        const result = await this.faceDetection.processImage(resizedCanvas);

        if (!result) {
            this.showError('No face detected in the image. Please try again with a clear photo showing your face.');
            return;
        }

        // Display cropped face with landmarks
        analysisText.textContent = 'Mapping 68 facial landmarks...';
        analysisCanvas.width = result.canvas.width;
        analysisCanvas.height = result.canvas.height;
        ctx.drawImage(result.canvas, 0, 0);

        // Store cropped face canvas for later use
        this.croppedFaceCanvas = result.canvas;

        // Animate landmarks
        await this.faceDetection.animateLandmarksProgressive(
            analysisCanvas,
            result.detection.landmarks,
            result.offset
        );

        // Continue to matching sequence
        await this.startMatchingSequence();
    }

    /**
     * Show error screen
     */
    showError(message) {
        document.getElementById('error-message').textContent = message;
        Animation.switchScreen('analysis-screen', 'error-screen');
    }

    /**
     * Handle retry button
     */
    handleRetry() {
        Animation.switchScreen('error-screen', 'upload-screen');
    }

    /**
     * Start matching sequence
     */
    async startMatchingSequence() {
        // Switch to matching screen
        Animation.switchScreen('analysis-screen', 'matching-screen');

        // Copy user's face to matching canvas
        const userFaceCanvas = document.getElementById('user-face-canvas');
        Animation.copyCanvas(this.croppedFaceCanvas, userFaceCanvas);

        // Get character images
        const characterImages = this.getCharacterImages();

        // Animate matching
        await Animation.animateMatching(userFaceCanvas, characterImages, 5000);

        // Continue to reveal
        await this.startReveal();
    }

    /**
     * Get character images for matching
     */
    getCharacterImages() {
        // If we have loaded character images, use them
        if (this.assets.images && this.assets.images.length > 0) {
            return this.assets.images.map(img => ({ src: img.src }));
        }

        // Otherwise use placeholders
        return Preloader.generatePlaceholderImages();
    }

    /**
     * Start reveal sequence
     */
    async startReveal() {
        // Switch to reveal screen
        Animation.switchScreen('matching-screen', 'reveal-screen');

        // Get sloth image
        const slothImage = this.assets.slothImage || Preloader.getPlaceholderSloth();

        // Animate reveal
        await Animation.animateReveal(
            this.croppedFaceCanvas,
            slothImage,
            this.assets.sounds.trumpet
        );
    }

    /**
     * Handle restart
     */
    handleRestart() {
        // Reset reveal screen
        Animation.resetRevealScreen();

        // Clear file input
        document.getElementById('file-input').value = '';

        // Go back to upload screen
        Animation.switchScreen('reveal-screen', 'upload-screen');
    }
}

// Start the application
const app = new MovieDoppelgangerApp();

