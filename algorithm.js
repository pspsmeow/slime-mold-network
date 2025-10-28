// =============================================
// ALGORITHM.JS - Realistic Slime Mold Simulation
// Mimics Physarum polycephalum behavior
// =============================================

class SlimeMoldAlgorithm {
    constructor(config = {}) {
        this.width = config.width || 800;
        this.height = config.height || 600;
        this.sensitivity = config.sensitivity || 5;
        this.decayRate = config.decayRate || 0.97;
        this.speed = config.speed || 5;
        
        // Dense particle system for organic spreading
        this.agents = [];
        this.maxAgents = config.maxAgents || 5000;
        
        // Food sources
        this.foodSources = [];
        this.sourcePoint = null;
        
        // High-resolution grid for chemicals
        this.gridSize = 3;
        this.cols = Math.floor(this.width / this.gridSize);
        this.rows = Math.floor(this.height / this.gridSize);
        this.trailGrid = this.createGrid(0);
        
        // Network paths
        this.paths = [];
        this.isRunning = false;
        this.iteration = 0;
        
        // Slime mold specific parameters
        this.sensorAngle = Math.PI / 4; // 45 degrees
        this.sensorDistance = 9;
        this.rotationAngle = Math.PI / 4;
    }
    
    createGrid(initialValue) {
        return Array(this.rows).fill(null).map(() => 
            Array(this.cols).fill(initialValue)
        );
    }
    
    setSource(x, y) {
        this.sourcePoint = { x: x, y: y };
        console.log('🦠 Slime mold origin set');
    }
    
    addFoodSource(x, y, type) {
        this.foodSources.push({ x: x, y: y, type: type || 'food', strength: 1.0 });
    }
    
    initializeAgents() {
        if (!this.sourcePoint) return;
        
        this.agents = [];
        var numAgents = Math.min(this.maxAgents, 2000 + this.foodSources.length * 600);
        
        // Spawn particles in a small blob at source
        for (var i = 0; i < numAgents; i++) {
            var angle = Math.random() * Math.PI * 2;
            var radius = Math.random() * 8;
            
            this.agents.push({
                x: this.sourcePoint.x + Math.cos(angle) * radius,
                y: this.sourcePoint.y + Math.sin(angle) * radius,
                angle: Math.random() * Math.PI * 2,
                speed: 0.8 + Math.random() * 0.4
            });
        }
        
        console.log('🦠 Spawned ' + numAgents + ' slime particles');
    }
    
    step() {
        if (!this.isRunning || this.agents.length === 0) return;
        
        this.motorStage();
        this.moveStage();
        this.depositStage();
        this.diffuseAndDecay();
        this.extractPaths();
        
        this.iteration++;
    }
    
    // Motor stage: sense environment with 3 sensors and rotate
    motorStage() {
        var self = this;
        
        this.agents.forEach(function(agent) {
            var frontX = agent.x + Math.cos(agent.angle) * self.sensorDistance;
            var frontY = agent.y + Math.sin(agent.angle) * self.sensorDistance;
            
            var leftAngle = agent.angle - self.sensorAngle;
            var leftX = agent.x + Math.cos(leftAngle) * self.sensorDistance;
            var leftY = agent.y + Math.sin(leftAngle) * self.sensorDistance;
            
            var rightAngle = agent.angle + self.sensorAngle;
            var rightX = agent.x + Math.cos(rightAngle) * self.sensorDistance;
            var rightY = agent.y + Math.sin(rightAngle) * self.sensorDistance;
            
            var F = self.sampleChemical(frontX, frontY);
            var FL = self.sampleChemical(leftX, leftY);
            var FR = self.sampleChemical(rightX, rightY);
            
            if (F > FL && F > FR) {
                // Continue forward
            } else if (F < FL && F < FR) {
                agent.angle += (Math.random() - 0.5) * self.rotationAngle * 2;
            } else if (FL > FR) {
                agent.angle -= self.rotationAngle * (Math.random() * 0.5 + 0.5);
            } else if (FR > FL) {
                agent.angle += self.rotationAngle * (Math.random() * 0.5 + 0.5);
            } else {
                agent.angle += (Math.random() - 0.5) * self.rotationAngle;
            }
        });
    }
    
    sampleChemical(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 0;
        
        var gridX = Math.floor(x / this.gridSize);
        var gridY = Math.floor(y / this.gridSize);
        
        if (gridX < 0 || gridX >= this.cols || gridY < 0 || gridY >= this.rows) return 0;
        
        var chemical = this.trailGrid[gridY][gridX];
        
        var foodSignal = 0;
        for (var i = 0; i < this.foodSources.length; i++) {
            var food = this.foodSources[i];
            var dx = food.x - x;
            var dy = food.y - y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 80) {
                foodSignal += (1 - dist / 80) * 3 * (this.sensitivity / 5);
            }
        }
        
        return chemical + foodSignal;
    }
    
    moveStage() {
        var self = this;
        
        this.agents.forEach(function(agent) {
            var stepSize = agent.speed * (self.speed / 5);
            
            agent.x += Math.cos(agent.angle) * stepSize;
            agent.y += Math.sin(agent.angle) * stepSize;
            
            if (agent.x < 0) {
                agent.x = 0;
                agent.angle = Math.PI - agent.angle;
            } else if (agent.x >= self.width) {
                agent.x = self.width - 1;
                agent.angle = Math.PI - agent.angle;
            }
            
            if (agent.y < 0) {
                agent.y = 0;
                agent.angle = -agent.angle;
            } else if (agent.y >= self.height) {
                agent.y = self.height - 1;
                agent.angle = -agent.angle;
            }
        });
    }
    
    depositStage() {
        var self = this;
        
        this.agents.forEach(function(agent) {
            var gridX = Math.floor(agent.x / self.gridSize);
            var gridY = Math.floor(agent.y / self.gridSize);
            
            if (gridX >= 0 && gridX < self.cols && gridY >= 0 && gridY < self.rows) {
                self.trailGrid[gridY][gridX] = Math.min(1, self.trailGrid[gridY][gridX] + 0.08);
            }
        });
    }
    
    diffuseAndDecay() {
        var newGrid = this.createGrid(0);
        
        for (var y = 1; y < this.rows - 1; y++) {
            for (var x = 1; x < this.cols - 1; x++) {
                var sum = 0;
                sum += this.trailGrid[y-1][x-1] * 0.05;
                sum += this.trailGrid[y-1][x] * 0.1;
                sum += this.trailGrid[y-1][x+1] * 0.05;
                sum += this.trailGrid[y][x-1] * 0.1;
                sum += this.trailGrid[y][x] * 0.4;
                sum += this.trailGrid[y][x+1] * 0.1;
                sum += this.trailGrid[y+1][x-1] * 0.05;
                sum += this.trailGrid[y+1][x] * 0.1;
                sum += this.trailGrid[y+1][x+1] * 0.05;
                
                newGrid[y][x] = sum * this.decayRate;
            }
        }
        
        this.trailGrid = newGrid;
    }
    
    extractPaths() {
        this.paths = [];
        var threshold = 0.2;
        
        for (var y = 0; y < this.rows - 1; y++) {
            for (var x = 0; x < this.cols - 1; x++) {
                if (this.trailGrid[y][x] > threshold) {
                    if (x < this.cols - 1 && this.trailGrid[y][x+1] > threshold) {
                        this.paths.push({
                            x1: x * this.gridSize,
                            y1: y * this.gridSize,
                            x2: (x+1) * this.gridSize,
                            y2: y * this.gridSize,
                            strength: (this.trailGrid[y][x] + this.trailGrid[y][x+1]) / 2
                        });
                    }
                    
                    if (y < this.rows - 1 && this.trailGrid[y+1][x] > threshold) {
                        this.paths.push({
                            x1: x * this.gridSize,
                            y1: y * this.gridSize,
                            x2: x * this.gridSize,
                            y2: (y+1) * this.gridSize,
                            strength: (this.trailGrid[y][x] + this.trailGrid[y+1][x]) / 2
                        });
                    }
                }
            }
        }
    }
    
    start() {
        if (!this.sourcePoint || this.foodSources.length === 0) {
            return false;
        }
        
        this.isRunning = true;
        this.initializeAgents();
        return true;
    }
    
    stop() {
        this.isRunning = false;
    }
    
    reset() {
        this.agents = [];
        this.paths = [];
        this.trailGrid = this.createGrid(0);
        this.iteration = 0;
        this.isRunning = false;
    }
    
    getStats() {
        var totalLength = 0;
        
        this.paths.forEach(function(path) {
            var dx = path.x2 - path.x1;
            var dy = path.y2 - path.y1;
            totalLength += Math.sqrt(dx * dx + dy * dy);
        });
        
        var efficiency = this.foodSources.length > 0 
            ? Math.min(100, (this.foodSources.length / (totalLength / 100 || 1)) * 100)
            : 0;
        
        return {
            nodes: this.foodSources.length + 1,
            pathLength: Math.round(totalLength),
            efficiency: Math.round(efficiency),
            iterations: this.iteration
        };
    }
}

window.SlimeMoldAlgorithm = SlimeMoldAlgorithm;
