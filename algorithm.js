// =============================================
// ALGORITHM.JS - Slime Mold Algorithm Core
// Physarum polycephalum-inspired optimization
// =============================================

class SlimeMoldAlgorithm {
    constructor(config = {}) {
        // Configuration
        this.width = config.width || 800;
        this.height = config.height || 600;
        this.sensitivity = config.sensitivity || 5;
        this.decayRate = config.decayRate || 0.95;
        this.speed = config.speed || 5;
        
        // Agents (slime particles)
        this.agents = [];
        this.maxAgents = config.maxAgents || 1000;
        
        // Food sources (target nodes)
        this.foodSources = [];
        this.sourcePoint = null;
        
        // Trail tracking
        this.trails = [];
        this.trailMap = new Map();
        
        // Network paths
        this.paths = [];
        this.isRunning = false;
        this.iteration = 0;
        
        // For visual grid representation
        this.gridSize = 5;
        this.cols = Math.floor(this.width / this.gridSize);
        this.rows = Math.floor(this.height / this.gridSize);
        this.trailGrid = this.createGrid(0);
    }
    
    // Create 2D grid
    createGrid(initialValue) {
        return Array(this.rows).fill(null).map(() => 
            Array(this.cols).fill(initialValue)
        );
    }
    
    // Set source point
    setSource(x, y) {
        this.sourcePoint = { x, y };
        console.log('Source set at (' + x + ', ' + y + ')');
    }
    
    // Add food source
    addFoodSource(x, y, type) {
        this.foodSources.push({ x: x, y: y, type: type || 'food', strength: 1.0 });
        console.log('Added ' + type + ' at (' + x + ', ' + y + ')');
    }
    
    // Initialize agents at source
    initializeAgents() {
        if (!this.sourcePoint) {
            console.error('No source point set!');
            return;
        }
        
        this.agents = [];
        var numAgents = Math.min(this.maxAgents, 500 + this.foodSources.length * 100);
        
        for (var i = 0; i < numAgents; i++) {
            this.agents.push({
                x: this.sourcePoint.x + (Math.random() - 0.5) * 10,
                y: this.sourcePoint.y + (Math.random() - 0.5) * 10,
                angle: Math.random() * Math.PI * 2,
                speed: 1 + Math.random() * 2,
                energy: 1.0,
                targetFood: null,
                hasFood: false
            });
        }
        
        console.log('Initialized ' + numAgents + ' agents');
    }
    
    // Main simulation step
    step() {
        if (!this.isRunning || this.agents.length === 0) return;
        
        this.moveAgents();
        this.depositTrails();
        this.decayTrails();
        this.updateTrailGrid();
        this.extractPaths();
        
        this.iteration++;
    }
    
    // Move agents towards food sources
    moveAgents() {
        var self = this;
        this.agents.forEach(function(agent) {
            if (!agent.targetFood || agent.hasFood) {
                var nearestFood = null;
                var nearestDist = Infinity;
                
                self.foodSources.forEach(function(food) {
                    var dx = food.x - agent.x;
                    var dy = food.y - agent.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < nearestDist) {
                        nearestDist = dist;
                        nearestFood = food;
                    }
                });
                
                agent.targetFood = nearestFood;
                agent.hasFood = false;
            }
            
            if (agent.targetFood) {
                var dx = agent.targetFood.x - agent.x;
                var dy = agent.targetFood.y - agent.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 20) {
                    agent.hasFood = true;
                    var sdx = self.sourcePoint.x - agent.x;
                    var sdy = self.sourcePoint.y - agent.y;
                    agent.angle = Math.atan2(sdy, sdx);
                    
                    var sourceDist = Math.sqrt(sdx * sdx + sdy * sdy);
                    if (sourceDist < 20) {
                        agent.hasFood = false;
                    }
                } else {
                    var targetAngle = Math.atan2(dy, dx);
                    agent.angle = targetAngle + (Math.random() - 0.5) * 0.3;
                }
            }
            
            agent.angle += (Math.random() - 0.5) * 0.2;
            
            var moveSpeed = agent.speed * (0.5 + self.sensitivity / 10);
            agent.x += Math.cos(agent.angle) * moveSpeed;
            agent.y += Math.sin(agent.angle) * moveSpeed;
            
            agent.x = Math.max(0, Math.min(self.width, agent.x));
            agent.y = Math.max(0, Math.min(self.height, agent.y));
            
            agent.energy = Math.max(0.5, Math.min(1, agent.energy * 0.999 + 0.001));
        });
    }
    
    // Deposit trails
    depositTrails() {
        var self = this;
        this.agents.forEach(function(agent) {
            var trailKey = Math.floor(agent.x / 5) + '_' + Math.floor(agent.y / 5);
            
            if (!self.trailMap.has(trailKey)) {
                self.trailMap.set(trailKey, {
                    x: Math.floor(agent.x / 5) * 5,
                    y: Math.floor(agent.y / 5) * 5,
                    strength: 0,
                    age: 0
                });
            }
            
            var trail = self.trailMap.get(trailKey);
            trail.strength = Math.min(1, trail.strength + 0.1 * agent.energy);
            trail.age = self.iteration;
        });
    }
    
    // Decay trails over time
    decayTrails() {
        var self = this;
        var toDelete = [];
        this.trailMap.forEach(function(trail, key) {
            trail.strength *= self.decayRate;
            
            if (trail.strength < 0.01) {
                toDelete.push(key);
            }
        });
        
        toDelete.forEach(function(key) {
            self.trailMap.delete(key);
        });
    }
    
    // Update visual grid for rendering
    updateTrailGrid() {
        this.trailGrid = this.createGrid(0);
        var self = this;
        
        this.trailMap.forEach(function(trail) {
            var gridX = Math.floor(trail.x / self.gridSize);
            var gridY = Math.floor(trail.y / self.gridSize);
            
            if (gridX >= 0 && gridX < self.cols && gridY >= 0 && gridY < self.rows) {
                self.trailGrid[gridY][gridX] = trail.strength;
            }
        });
    }
    
    // Extract network paths from strong trails
    extractPaths() {
        this.paths = [];
        var processed = new Set();
        var self = this;
        
        this.trailMap.forEach(function(trail) {
            if (trail.strength > 0.3) {
                var key = trail.x + '_' + trail.y;
                if (processed.has(key)) return;
                processed.add(key);
                
                self.trailMap.forEach(function(otherTrail) {
                    if (trail === otherTrail) return;
                    if (otherTrail.strength < 0.3) return;
                    
                    var dx = otherTrail.x - trail.x;
                    var dy = otherTrail.y - trail.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < 15 && dist > 0) {
                        self.paths.push({
                            x1: trail.x,
                            y1: trail.y,
                            x2: otherTrail.x,
                            y2: otherTrail.y,
                            strength: (trail.strength + otherTrail.strength) / 2
                        });
                    }
                });
            }
        });
    }
    
    // Start simulation
    start() {
        if (!this.sourcePoint) {
            console.error('Cannot start: No source point!');
            return false;
        }
        
        if (this.foodSources.length === 0) {
            console.error('Cannot start: No food sources!');
            return false;
        }
        
        this.isRunning = true;
        this.initializeAgents();
        console.log('Simulation started!');
        return true;
    }
    
    // Stop simulation
    stop() {
        this.isRunning = false;
        console.log('Simulation stopped');
    }
    
    // Reset simulation
    reset() {
        this.agents = [];
        this.trails = [];
        this.trailMap.clear();
        this.paths = [];
        this.trailGrid = this.createGrid(0);
        this.iteration = 0;
        this.isRunning = false;
        console.log('Simulation reset');
    }
    
    // Calculate statistics
    getStats() {
        var totalLength = 0;
        var uniquePaths = new Set();
        
        this.paths.forEach(function(path) {
            var key = Math.min(path.x1, path.x2) + ',' + Math.min(path.y1, path.y2);
            if (!uniquePaths.has(key)) {
                uniquePaths.add(key);
                var dx = path.x2 - path.x1;
                var dy = path.y2 - path.y1;
                totalLength += Math.sqrt(dx * dx + dy * dy);
            }
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