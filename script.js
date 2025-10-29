document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('simulation-canvas');
    const ctx = canvas.getContext('2d');

    const runButton = document.getElementById('run-button');
    const resetButton = document.getElementById('reset-button');
    const tokyoButton = document.getElementById('tokyo-button');

    // --- Configurable Parameters ---
    const GRID_WIDTH = 400;
    const GRID_HEIGHT = 400;
    const NUM_AGENTS = 2000;
    const EVAPORATION_RATE = 0.95;
    const DEPOSITION_AMOUNT = 1.0;
    const SENSOR_DISTANCE = 5;
    const SENSOR_ANGLE = Math.PI / 4; // 45 degrees
    const TURN_ANGLE = Math.PI / 4;   // 45 degrees

    let trailGrid = new Float32Array(GRID_WIDTH * GRID_HEIGHT);
    let agents = [];
    let foodSources = [];
    let animationFrameId;

    function resizeCanvas() {
        const container = document.getElementById('canvas-container');
        const size = Math.min(container.clientWidth, container.clientHeight, 800);
        canvas.width = GRID_WIDTH;
        canvas.height = GRID_HEIGHT;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
    }

    function initialize() {
        resizeCanvas();
        trailGrid.fill(0);
        agents = [];
        foodSources = [];
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        createAgents();
        draw();
    }

    function createAgents() {
        agents = [];
        for (let i = 0; i < NUM_AGENTS; i++) {
            agents.push({
                x: GRID_WIDTH / 2,
                y: GRID_HEIGHT / 2,
                angle: Math.random() * 2 * Math.PI
            });
        }
    }
    
    function placeFood(event) {
        if (animationFrameId) return; // Don't place food while running
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;
        foodSources.push({ x, y });
        draw();
    }

    function sense(agent, angleOffset) {
        const angle = agent.angle + angleOffset;
        const sx = Math.round(agent.x + SENSOR_DISTANCE * Math.cos(angle));
        const sy = Math.round(agent.y + SENSOR_DISTANCE * Math.sin(angle));

        if (sx < 0 || sx >= GRID_WIDTH || sy < 0 || sy >= GRID_HEIGHT) {
            return 0;
        }
        return trailGrid[sy * GRID_WIDTH + sx];
    }

    function updateAgents() {
        for (const agent of agents) {
            // Sense
            const senseForward = sense(agent, 0);
            const senseLeft = sense(agent, SENSOR_ANGLE);
            const senseRight = sense(agent, -SENSOR_ANGLE);

            // Steer based on senses
            if (senseForward > senseLeft && senseForward > senseRight) {
                // Continue forward
            } else if (senseLeft > senseRight) {
                agent.angle += TURN_ANGLE;
            } else if (senseRight > senseLeft) {
                agent.angle -= TURN_ANGLE;
            } else {
                agent.angle += (Math.random() - 0.5) * TURN_ANGLE;
            }

            // Move
            agent.x += Math.cos(agent.angle);
            agent.y += Math.sin(agent.angle);

            // Boundary checks and interactions
            if (agent.x < 0 || agent.x >= GRID_WIDTH || agent.y < 0 || agent.y >= GRID_HEIGHT) {
                // Hit a wall, turn back towards center
                agent.x = Math.max(0, Math.min(GRID_WIDTH - 1, agent.x));
                agent.y = Math.max(0, Math.min(GRID_HEIGHT - 1, agent.y));
                agent.angle = Math.atan2(GRID_HEIGHT / 2 - agent.y, GRID_WIDTH / 2 - agent.x);
            }

            // Check for food
            for (const food of foodSources) {
                const dx = agent.x - food.x;
                const dy = agent.y - food.y;
                if (dx * dx + dy * dy < 10 * 10) { // If agent is close to food
                    agent.x = GRID_WIDTH / 2;
                    agent.y = GRID_HEIGHT / 2;
                    agent.angle = Math.random() * 2 * Math.PI;
                }
            }

            // Deposit trail
            const ix = Math.floor(agent.x);
            const iy = Math.floor(agent.y);
            trailGrid[iy * GRID_WIDTH + ix] = Math.min(1.0, trailGrid[iy * GRID_WIDTH + ix] + DEPOSITION_AMOUNT);
        }
    }

    function decayTrail() {
        for (let i = 0; i < trailGrid.length; i++) {
            trailGrid[i] *= EVAPORATION_RATE;
        }
    }

    function draw() {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw trail
        const imageData = ctx.createImageData(GRID_WIDTH, GRID_HEIGHT);
        for (let i = 0; i < trailGrid.length; i++) {
            const intensity = Math.min(255, trailGrid[i] * 255);
            const pixelIndex = i * 4;
            imageData.data[pixelIndex] = intensity > 50 ? 255 : 0;       // R
            imageData.data[pixelIndex + 1] = intensity; // G
            imageData.data[pixelIndex + 2] = 0;         // B
            imageData.data[pixelIndex + 3] = 255;       // A
        }
        ctx.putImageData(imageData, 0, 0);

        // Draw food sources
        ctx.fillStyle = '#00f';
        for (const food of foodSources) {
            ctx.beginPath();
            ctx.arc(food.x, food.y, 5, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // Draw source
        ctx.fillStyle = '#f0f';
        ctx.beginPath();
        ctx.arc(GRID_WIDTH / 2, GRID_HEIGHT / 2, 7, 0, 2 * Math.PI);
        ctx.fill();
    }

    function simulationLoop() {
        updateAgents();
        decayTrail();
        draw();
        animationFrameId = requestAnimationFrame(simulationLoop);
    }

    function loadTokyoMap() {
        initialize();
        foodSources = [
            // Major stations in Tokyo (approximate grid coordinates)
            { x: 250, y: 200 }, // Tokyo Station
            { x: 200, y: 250 }, // Shinjuku
            { x: 150, y: 150 }, // Ikebukuro
            { x: 300, y: 150 }, // Ueno
            { x: 220, y: 300 }, // Shibuya
            { x: 350, y: 250 }, // Shinagawa
        ];
        draw();
    }

    // Event Listeners
    runButton.addEventListener('click', () => {
        if (!animationFrameId) {
            simulationLoop();
        }
    });
    resetButton.addEventListener('click', initialize);
    tokyoButton.addEventListener('click', loadTokyoMap);
    canvas.addEventListener('click', placeFood);
    window.addEventListener('resize', resizeCanvas);

    // Initial setup
    initialize();
});
