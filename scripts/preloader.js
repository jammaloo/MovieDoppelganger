// Preloader Module - Handles preloading of all assets

export class Preloader {
    constructor() {
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.assets = {
            images: [],
            sounds: [],
            models: []
        };
    }

    /**
     * Preload an image
     */
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.loadedAssets++;
                this.updateProgress();
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`Failed to load image: ${src}`);
                this.loadedAssets++;
                this.updateProgress();
                resolve(null); // Resolve anyway to not block loading
            };
            img.src = src;
        });
    }

    /**
     * Preload an audio file
     */
    loadSound(src) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.volume = 1.0;

            // Try to load the audio
            const handleCanPlay = () => {
                audio.removeEventListener('canplaythrough', handleCanPlay);
                audio.removeEventListener('loadeddata', handleCanPlay);
                this.loadedAssets++;
                this.updateProgress();
                resolve(audio);
            };

            const handleError = () => {
                audio.removeEventListener('error', handleError);
                console.warn(`Failed to load sound: ${src}`);
                this.loadedAssets++;
                this.updateProgress();
                resolve(null);
            };

            audio.addEventListener('canplaythrough', handleCanPlay);
            audio.addEventListener('loadeddata', handleCanPlay);
            audio.addEventListener('error', handleError);

            audio.src = src;
            audio.load(); // Explicitly trigger loading
        });
    }

    /**
     * Load face-api.js models
     */
    async loadFaceApiModels() {
        const MODEL_URL = 'https://cdn.jsdelivr.net/gh/cgarciagl/face-api.js@0.22.2/weights';

        try {
            await Promise.all([
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
            ]);
            this.loadedAssets += 2;
            this.updateProgress();
            return true;
        } catch (error) {
            console.error('Error loading face-api models:', error);
            this.loadedAssets += 2;
            this.updateProgress();
            return false;
        }
    }

    /**
     * Update loading progress bar
     */
    updateProgress() {
        const progress = (this.loadedAssets / this.totalAssets) * 100;
        const progressBar = document.getElementById('loading-progress');
        const statusText = document.getElementById('loading-status');

        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        if (statusText) {
            if (progress < 30) {
                statusText.textContent = 'Loading assets...';
            } else if (progress < 70) {
                statusText.textContent = 'Loading facial recognition models...';
            } else if (progress < 100) {
                statusText.textContent = 'Almost ready...';
            } else {
                statusText.textContent = 'Ready!';
            }
        }
    }

    /**
     * Load all assets
     */
    async loadAll() {
        // Use placeholder images from placehold.co (can be replaced with local images)
        const placeholderCharacters = Preloader.generatePlaceholderImages();
        const characterImages = placeholderCharacters.map(char => char.src);

        // Use placeholder for sloth image
        const slothPlaceholder = Preloader.getPlaceholderSloth();

        // Define sound files
        const sounds = [
            'assets/sounds/timer-beep.mp3',
            'assets/sounds/camera-shutter.mp3',
            'assets/sounds/trumpet.mp3'
        ];

        // Calculate total assets (images + sounds + 2 face-api models + sloth image)
        this.totalAssets = characterImages.length + sounds.length + 2 + 1;

        // Load all images
        const imagePromises = characterImages.map(src => this.loadImage(src));
        const slothPromise = this.loadImage(slothPlaceholder.src);

        // Load all sounds
        const soundPromises = sounds.map(src => this.loadSound(src));

        // Load face-api models
        const modelsPromise = this.loadFaceApiModels();

        // Wait for everything to load
        const [loadedImages, slothImage, loadedSounds] = await Promise.all([
            Promise.all(imagePromises),
            slothPromise,
            Promise.all(soundPromises),
            modelsPromise
        ]);

        // Store loaded assets
        this.assets.images = loadedImages.filter(img => img !== null);
        this.assets.slothImage = slothImage;
        this.assets.sounds = {
            timerBeep: loadedSounds[0],
            cameraShutter: loadedSounds[1],
            trumpet: loadedSounds[2]
        };

        return this.assets;
    }

    /**
     * Create silent audio element (placeholder for real sound effects)
     */
    createSilentAudio() {
        // Create a very short silent audio using data URI
        const audio = new Audio();
        // This is a minimal valid MP3 file (silent)
        audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhAC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v/////////////////////////////////////////////////////////////////',
            this.loadedAssets++;
        this.updateProgress();
        return audio;
    }

    /**
     * Create placeholder character images if needed
     */
    static generatePlaceholderImages() {
        const characters = [
            { name: 'Joi - Blade Runner 2049', width: 400, height: 200, image: 'assets/images/characters/joi.avif' },
            { name: 'The Devil - Bedazzled', width: 250, height: 188, image: 'assets/images/characters/devil.webp' },
            { name: 'Evelyn - The Mummy', width: 184, height: 274, image: 'assets/images/characters/evelyn.jpg' },
            { name: 'Elisha - The Girl Next Door', width: 400, height: 209, image: 'assets/images/characters/elisha.avif' },
            { name: 'Carolina - Desperado', width: 400, height: 225, image: 'assets/images/characters/carolina.webp' },
            { name: 'Nancy Callahan - Sin City', width: 305, height: 400, image: 'assets/images/characters/nancy.jpg' },
            { name: 'Persephone - The Matrix Reloaded', width: 185, height: 272, image: 'assets/images/characters/persephone.jpg' },
            { name: 'Ilsa Faust - Mission: Impossible - Fallout', width: 400, height: 300, image: 'assets/images/characters/ilsa.jpg' },
            { name: 'Rita Vrataski - Edge of Tomorrow', width: 279, height: 400, image: 'assets/images/characters/rita.jpeg' },
            { name: 'Rick O\'Connell - The Mummy', width: 317, height: 400, image: 'assets/images/characters/rick.webp' },
            { name: 'Indiana Jones - Raiders of the Lost Ark', width: 400, height: 267, image: 'assets/images/characters/indiana.webp' },
            { name: 'Aragorn - The Lord of the Rings: The Return of the King', width: 400, height: 294, image: 'assets/images/characters/aragorn.webp' },
            { name: 'Christian Grey - 50 Shades of Grey', width: 400, height: 267, image: 'assets/images/characters/christian.webp' },
            { name: 'Driver - Driver', width: 267, height: 400, image: 'assets/images/characters/driver.jpg' },
            { name: 'Westley - The Princess Bride', width: 267, height: 400, image: 'assets/images/characters/westley.webp' },
            { name: 'Bloodsport - Suicide Squad', width: 400, height: 254, image: 'assets/images/characters/bloodsport.jpg' },
            { name: 'Naomi Lapaglia - The Wolf of Wall Street', width: 267, height: 400, image: 'assets/images/characters/naomi.webp' },
            { name: 'Allison Lang - Havoc', width: 400, height: 218, image: 'assets/images/characters/allison.webp' },
            { name: 'Masked Bandit - The Fall', width: 400, height: 267, image: 'assets/images/characters/bandit.webp' },
        ];

        return characters.map((char, index) => ({
            src: char.image || `https://placehold.co/${char.width}x${char.height}/667eea/ffffff?text=${encodeURIComponent(char.name)}`,
            name: char.name
        }));
    }

    /**
     * Get placeholder sloth image
     */
    static getPlaceholderSloth() {
        return {
            src: 'assets/images/characters/sloth.webp',
            name: 'Sloth -  The Goonies'
        };
    }
}

