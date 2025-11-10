// Animation Module - Handles transitions and visual effects

export class Animation {
    /**
     * Switch between screens
     */
    static switchScreen(currentScreenId, nextScreenId) {
        const currentScreen = document.getElementById(currentScreenId);
        const nextScreen = document.getElementById(nextScreenId);

        if (currentScreen) {
            currentScreen.classList.remove('active');
        }

        if (nextScreen) {
            nextScreen.classList.add('active');
        }
    }

    /**
     * Trigger confetti animation
     */
    static triggerConfetti() {
        // Use canvas-confetti library
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            // Fire from two positions
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    }

    /**
     * Shuffle array using Fisher-Yates algorithm
     */
    static shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Animate matching sequence with character switching
     */
    static async animateMatching(userCanvas, characterImages, duration = 5000) {
        const characterImg = document.getElementById('character-image');
        const matchPercentage = document.getElementById('match-percentage');
        const matchPercentageMobile = document.getElementById('match-percentage-mobile');

        // Shuffle the character array once
        const shuffledCharacters = Animation.shuffleArray(characterImages);

        const switchInterval = 200; // Switch every 200ms
        const switchCount = Math.floor(duration / switchInterval);

        return new Promise((resolve) => {
            let currentSwitch = 0;

            const interval = setInterval(() => {
                // Get character sequentially from shuffled array
                const characterIndex = currentSwitch % shuffledCharacters.length;
                const character = shuffledCharacters[characterIndex];

                if (character) {
                    characterImg.src = character.src;
                }

                // Generate random percentage between 20-60
                const percentage = Math.floor(Math.random() * 41) + 20;
                matchPercentage.textContent = `${percentage}%`;
                if (matchPercentageMobile) {
                    matchPercentageMobile.textContent = `${percentage}%`;
                }

                currentSwitch++;

                if (currentSwitch >= switchCount) {
                    clearInterval(interval);
                    resolve();
                }
            }, switchInterval);
        });
    }

    /**
     * Prepare audio for playback (unlock audio context on mobile)
     * This must be called in response to a user gesture to work on mobile
     */
    static async prepareAudio(audio) {
        if (!audio) return;

        try {
            // Ensure audio is loaded first
            if (audio.readyState < 2) {
                audio.load();
                // Wait for audio to be ready, but don't wait too long
                await new Promise(resolve => {
                    if (audio.readyState >= 2) {
                        resolve();
                    } else {
                        const checkReady = () => {
                            if (audio.readyState >= 2) {
                                resolve();
                            }
                        };
                        audio.addEventListener('canplay', checkReady, { once: true });
                        audio.addEventListener('canplaythrough', checkReady, { once: true });
                        setTimeout(resolve, 2000); // Timeout after 2 seconds
                    }
                });
            }

            // On mobile, unlock audio context by playing and immediately pausing
            // This must happen in response to user interaction
            if (audio.readyState >= 2 && audio.paused) {
                const originalVolume = audio.volume;
                audio.volume = 0.001; // Almost silent
                audio.currentTime = 0;

                try {
                    const playPromise = audio.play();
                    if (playPromise) {
                        await playPromise;
                        // Immediately pause to unlock context
                        audio.pause();
                        audio.currentTime = 0;
                    }
                } catch (err) {
                    // If play fails, that's okay - we tried
                    console.warn('Could not unlock audio context:', err);
                } finally {
                    audio.volume = originalVolume;
                }
            }
        } catch (err) {
            console.warn('Error preparing audio:', err);
        }
    }

    /**
     * Animate final reveal sequence
     */
    static async animateReveal(userCanvas, slothImage, trumpetSound) {
        const matchFoundFlash = document.getElementById('match-found-flash');
        const revealContent = document.querySelector('.reveal-content');
        const revealUserCanvas = document.getElementById('reveal-user-canvas');
        const revealResultImage = document.getElementById('reveal-result-image');
        const revealText = document.getElementById('reveal-text');
        const restartBtn = document.getElementById('restart-btn');

        // Prepare audio early to unlock audio context on mobile
        if (trumpetSound) {
            await Animation.prepareAudio(trumpetSound);
        }

        // Step 1: Flash "97% MATCH FOUND" - linger to build tension
        matchFoundFlash.classList.add('active');
        await Animation.wait(2500);
        matchFoundFlash.classList.remove('active');

        // Brief pause after flash
        await Animation.wait(300);

        // Step 2: Show reveal content with user's image
        revealContent.classList.add('active');

        // Copy user canvas to reveal canvas
        revealUserCanvas.width = userCanvas.width;
        revealUserCanvas.height = userCanvas.height;
        const ctx = revealUserCanvas.getContext('2d');
        ctx.drawImage(userCanvas, 0, 0);

        // Set the sloth image but keep it hidden
        revealResultImage.src = slothImage.src;

        await Animation.wait(1500);

        // Step 3: Fade out user image and fade in sloth
        revealUserCanvas.classList.add('fade-out');
        await Animation.wait(1000);
        if (trumpetSound) {
            try {
                // On mobile, audio context might be suspended - ensure it's ready
                // Reload the audio to ensure it's in a playable state
                if (trumpetSound.readyState === 0) {
                    // Not loaded yet, load it first
                    trumpetSound.load();
                }

                // Wait a moment for audio to be ready (especially important on mobile)
                await Animation.wait(100);

                trumpetSound.currentTime = 0;
                const playPromise = trumpetSound.play();
                if (playPromise !== undefined) {
                    playPromise.catch(err => {
                        console.warn('Could not play trumpet sound:', err);
                        if (err.name === 'NotAllowedError') {
                            console.warn('Audio playback blocked. User interaction may be required.');
                        } else if (err.name === 'NotSupportedError') {
                            console.warn('Audio format not supported.');
                        }
                        // Try to reload and play again as fallback
                        trumpetSound.load();
                        setTimeout(() => {
                            trumpetSound.play().catch(e => console.warn('Retry failed:', e));
                        }, 200);
                    });
                }
            } catch (err) {
                console.warn('Error playing trumpet sound:', err);
            }
        }
        revealResultImage.classList.add('fade-in');

        await Animation.wait(1000);

        // Step 4: Show text
        revealText.classList.add('active');

        // Step 5: Trigger confetti and sound
        Animation.triggerConfetti();


        await Animation.wait(1000);

        // Step 6: Show restart button
        restartBtn.classList.add('active');
    }

    /**
     * Helper function to wait
     */
    static wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Copy canvas contents
     */
    static copyCanvas(sourceCanvas, targetCanvas) {
        targetCanvas.width = sourceCanvas.width;
        targetCanvas.height = sourceCanvas.height;
        const ctx = targetCanvas.getContext('2d');
        ctx.drawImage(sourceCanvas, 0, 0);
    }

    /**
     * Draw image to canvas maintaining aspect ratio
     */
    static drawImageToCanvas(image, canvas, size = null) {
        const ctx = canvas.getContext('2d');

        if (size) {
            canvas.width = size;
            canvas.height = size;

            // Calculate dimensions to maintain aspect ratio
            let width = image.width;
            let height = image.height;
            let x = 0;
            let y = 0;

            if (width > height) {
                height = (height / width) * size;
                width = size;
                y = (size - height) / 2;
            } else {
                width = (width / height) * size;
                height = size;
                x = (size - width) / 2;
            }

            // Fill background
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, 0, size, size);

            // Draw image centered
            ctx.drawImage(image, x, y, width, height);
        } else {
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);
        }
    }

    /**
     * Fade transition between screens
     */
    static async fadeTransition(fromScreenId, toScreenId, duration = 500) {
        const fromScreen = document.getElementById(fromScreenId);
        const toScreen = document.getElementById(toScreenId);

        // Fade out current screen
        if (fromScreen) {
            fromScreen.style.transition = `opacity ${duration}ms`;
            fromScreen.style.opacity = '0';

            await Animation.wait(duration);
            fromScreen.classList.remove('active');
            fromScreen.style.opacity = '1';
        }

        // Fade in new screen
        if (toScreen) {
            toScreen.style.opacity = '0';
            toScreen.classList.add('active');

            // Force reflow
            toScreen.offsetHeight;

            toScreen.style.transition = `opacity ${duration}ms`;
            toScreen.style.opacity = '1';

            await Animation.wait(duration);
        }
    }

    /**
     * Reset reveal screen for restart
     */
    static resetRevealScreen() {
        const matchFoundFlash = document.getElementById('match-found-flash');
        const revealContent = document.querySelector('.reveal-content');
        const revealUserCanvas = document.getElementById('reveal-user-canvas');
        const revealResultImage = document.getElementById('reveal-result-image');
        const revealText = document.getElementById('reveal-text');
        const restartBtn = document.getElementById('restart-btn');

        matchFoundFlash.classList.remove('active');
        revealContent.classList.remove('active');
        revealUserCanvas.classList.remove('fade-out');
        revealResultImage.classList.remove('fade-in');
        revealText.classList.remove('active');
        restartBtn.classList.remove('active');
    }
}

