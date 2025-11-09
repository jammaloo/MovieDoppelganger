// Face Detection Module - Handles face-api.js integration

export class FaceDetection {
    constructor() {
        this.detectionOptions = new faceapi.SsdMobilenetv1Options({
            minConfidence: 0.5
        });
    }

    /**
     * Detect face in image
     */
    async detectFace(input) {
        try {
            const detection = await faceapi
                .detectSingleFace(input, this.detectionOptions)
                .withFaceLandmarks();

            return detection;
        } catch (error) {
            console.error('Error detecting face:', error);
            return null;
        }
    }

    /**
     * Crop image to face bounding box with padding
     */
    cropToFace(canvas, detection, padding = 50) {
        const box = detection.detection.box;

        // Add padding
        const x = Math.max(0, box.x - padding);
        const y = Math.max(0, box.y - padding);
        const width = Math.min(canvas.width - x, box.width + padding * 2);
        const height = Math.min(canvas.height - y, box.height + padding * 2);

        // Create new canvas with cropped face
        const croppedCanvas = document.createElement('canvas');
        const size = Math.max(width, height);
        croppedCanvas.width = size;
        croppedCanvas.height = size;

        const ctx = croppedCanvas.getContext('2d');

        // Fill with neutral color
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, size, size);

        // Center the face crop
        const offsetX = (size - width) / 2;
        const offsetY = (size - height) / 2;

        ctx.drawImage(
            canvas,
            x, y, width, height,
            offsetX, offsetY, width, height
        );

        return {
            canvas: croppedCanvas,
            offset: { x: x - offsetX, y: y - offsetY }
        };
    }

    /**
     * Draw 68 facial landmarks on canvas
     */
    drawLandmarks(canvas, landmarks, offset = { x: 0, y: 0 }) {
        const ctx = canvas.getContext('2d');
        const positions = landmarks.positions;

        // Draw points
        positions.forEach(point => {
            ctx.beginPath();
            ctx.arc(
                point.x - offset.x,
                point.y - offset.y,
                2,
                0,
                2 * Math.PI
            );
            ctx.fillStyle = '#00ff00';
            ctx.fill();
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // Draw lines connecting landmarks
        this.drawLandmarkConnections(ctx, positions, offset);
    }

    /**
     * Draw connections between facial landmarks
     */
    drawLandmarkConnections(ctx, positions, offset) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;

        // Draw face outline (0-16)
        this.drawPath(ctx, positions.slice(0, 17), offset);

        // Draw left eyebrow (17-21)
        this.drawPath(ctx, positions.slice(17, 22), offset);

        // Draw right eyebrow (22-26)
        this.drawPath(ctx, positions.slice(22, 27), offset);

        // Draw nose bridge (27-30)
        this.drawPath(ctx, positions.slice(27, 31), offset);

        // Draw nose bottom (31-35)
        this.drawPath(ctx, positions.slice(31, 36), offset);

        // Draw left eye (36-41)
        this.drawClosedPath(ctx, positions.slice(36, 42), offset);

        // Draw right eye (42-47)
        this.drawClosedPath(ctx, positions.slice(42, 48), offset);

        // Draw outer lip (48-59)
        this.drawClosedPath(ctx, positions.slice(48, 60), offset);

        // Draw inner lip (60-67)
        this.drawClosedPath(ctx, positions.slice(60, 68), offset);
    }

    /**
     * Draw path connecting points
     */
    drawPath(ctx, points, offset) {
        if (points.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(points[0].x - offset.x, points[0].y - offset.y);

        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x - offset.x, points[i].y - offset.y);
        }

        ctx.stroke();
    }

    /**
     * Draw closed path (connects back to start)
     */
    drawClosedPath(ctx, points, offset) {
        if (points.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(points[0].x - offset.x, points[0].y - offset.y);

        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x - offset.x, points[i].y - offset.y);
        }

        ctx.closePath();
        ctx.stroke();
    }

    /**
     * Animate landmarks appearing with fade-in effect
     */
    async animateLandmarks(canvas, landmarks, offset = { x: 0, y: 0 }, duration = 2000) {
        return new Promise((resolve) => {
            const ctx = canvas.getContext('2d');
            const startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Clear previous landmarks (draw image again)
                // We need to preserve the image, so we'll use globalAlpha
                ctx.save();
                ctx.globalAlpha = progress;

                // Redraw landmarks with current opacity
                this.drawLandmarks(canvas, landmarks, offset);

                ctx.restore();

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };

            animate();
        });
    }

    /**
     * Process image for analysis
     */
    async processImage(image) {
        // Create canvas from image
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        // Detect face
        const detection = await this.detectFace(canvas);

        if (!detection) {
            return null;
        }

        // Crop to face
        const cropped = this.cropToFace(canvas, detection);

        return {
            canvas: cropped.canvas,
            detection: detection,
            offset: cropped.offset
        };
    }

    /**
     * Display image with animated landmarks
     */
    async displayWithLandmarks(targetCanvas, imageCanvas, detection, offset) {
        // Set canvas size
        targetCanvas.width = imageCanvas.width;
        targetCanvas.height = imageCanvas.height;

        const ctx = targetCanvas.getContext('2d');

        // Draw the cropped face image
        ctx.drawImage(imageCanvas, 0, 0);

        // Wait a moment before showing landmarks
        await new Promise(resolve => setTimeout(resolve, 500));

        // Animate landmarks appearing
        await this.animateLandmarksProgressive(targetCanvas, detection.landmarks, offset);
    }

    /**
     * Animate landmarks appearing progressively
     */
    async animateLandmarksProgressive(canvas, landmarks, offset = { x: 0, y: 0 }) {
        const positions = landmarks.positions;
        const ctx = canvas.getContext('2d');
        const delayBetweenPoints = 30; // ms between each point appearing

        // Draw points progressively
        for (let i = 0; i < positions.length; i++) {
            const point = positions[i];

            // Draw point with glow effect
            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00ff00';

            ctx.beginPath();
            ctx.arc(
                point.x - offset.x,
                point.y - offset.y,
                3,
                0,
                2 * Math.PI
            );
            ctx.fillStyle = '#00ff00';
            ctx.fill();

            ctx.restore();

            await new Promise(resolve => setTimeout(resolve, delayBetweenPoints));
        }

        // Draw all connections at once
        this.drawLandmarkConnections(ctx, positions, offset);

        // Wait a moment before continuing
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

