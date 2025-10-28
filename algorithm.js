class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.direction = Math.random() * Math.PI * 2; // Random initial direction
        this.trail = 0; // Trail deposition variable
    }

    move(gridSize, width, height) {
        // Move particle based on current direction
        this.x += Math.cos(this.direction) * gridSize;
        this.y += Math.sin(this.direction) * gridSize;

        // Bounce back if it hits the boundaries
        if (this.x < 0 || this.x >= width) {
            this.direction = Math.PI - this.direction; // Reflect horizontally
        }
        if (this.y < 0 || this.y >= height) {
            this.direction = -this.direction; // Reflect vertically
        }

        // Trail deposition logic here
        this.trail += 1; // Increase trail over time
    }

    sense(chemicals) {
        // Three-sensor system: forward, left, right
        const forward = chemicals[this.x][this.y];
        const left = chemicals[this.x - 1]?.[this.y] || 0;
        const right = chemicals[this.x + 1]?.[this.y] || 0;

        // Change direction based on chemical gradients
        if (forward < left && left > right) {
            this.direction -= Math.PI / 4; // Turn left
        } else if (forward < right && right > left) {
            this.direction += Math.PI / 4; // Turn right
        }
    }
}

class SlimeMold {
    constructor(width, height, gridSize) {
        this.width = width;
        this.height = height;
        this.gridSize = gridSize;
        this.particles = [];
        this.chemicals = Array.from({ length: width }, () => Array(height).fill(0));
    }

    initializeParticles(count) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(Math.floor(this.width / 2), Math.floor(this.height / 2)));
        }
    }

    update() {
        for (const particle of this.particles) {
            particle.sense(this.chemicals);
            particle.move(this.gridSize, this.width, this.height);

            // Deposit chemicals to create trails
            this.chemicals[particle.x][particle.y] += particle.trail * 0.01; // Adjust trail strength
        }

        // Implement diffusion and decay
        this.diffuse();
    }

    diffuse() {
        const newChemicals = this.chemicals.map(arr => arr.slice());

        for (let x = 1; x < this.width - 1; x++) {
            for (let y = 1; y < this.height - 1; y++) {
                let total = 0;
                let neighbors = 0;

                // 8-neighbor kernel diffusion
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        if (dx === 0 && dy === 0) continue; // Skip the center
                        total += this.chemicals[x + dx][y + dy];
                        neighbors++;
                    }
                }

                // Average the neighboring chemicals
                newChemicals[x][y] = total / neighbors * 0.5 + this.chemicals[x][y] * 0.5; // Decay factor
            }
        }

        this.chemicals = newChemicals;
    }
}

// Usage
const slime = new SlimeMold(100, 100, 3);
slime.initializeParticles(5000);

// In a game loop or simulation loop
setInterval(() => {
    slime.update();
}, 100);