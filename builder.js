// =============================================
// BUILDER.JS - Interactive Map Builder
// =============================================

let builderAlgorithm = null;
let builderCanvas = null;
let builderCtx = null;
let selectedTool = null;
let placedNodes = [];
let animationFrame = null;
let startTime = 0;
let isSimulating = false;

// Element icons mapping
const ELEMENT_ICONS = {
    source: '⭐',
    house: '🏠',
    school: '🏫',
    hospital: '🏥',
    bus: '🚌',
    park: '🌳',
    market: '🏪',
    office: '🏢'
};

// Element colors
const ELEMENT_COLORS = {
    source: '#FFD700',
    house: '#FF6B6B',
    school: '#4ECDC4',
    hospital: '#FF1493',
    bus: '#FFA500',
    park: '#39FF14',
    market: '#9D4EDD',
    office: '#00CED1'
};

// Initialize builder
function initializeBuilder() {
    if (builderCanvas) return; // Already initialized

    builderCanvas = document.getElementById('builderCanvas');
    if (!builderCanvas) return;

    builderCtx = builderCanvas.getContext('2d');
    
    // Set canvas size
    resizeBuilderCanvas();
    window.addEventListener('resize', resizeBuilderCanvas);

    // Initialize algorithm
    builderAlgorithm = new SlimeMoldAlgorithm({
        width: builderCanvas.width,
        height: builderCanvas.height,
        gridSize: 5,
        sensitivity: 5,
        decayRate: 0.95,
        speed: 5,
        maxAgents: 1000
    });

    // Setup event listeners
    setupBuilderEventListeners();

    // Start render loop
    renderBuilder();

    console.log('✅ Builder initialized');
}

// Resize canvas
function resizeBuilderCanvas() {
    const container = builderCanvas.parentElement;
    builderCanvas.width = container.clientWidth;
    builderCanvas.height = container.clientHeight;
    
    if (builderAlgorithm) {
        builderAlgorithm.width = builderCanvas.width;
        builderAlgorithm.height = builderCanvas.height;
    }
}

// Setup event listeners
function setupBuilderEventListeners() {
    // Tool selection
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedTool = btn.dataset.type;
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Canvas click to place elements
    builderCanvas.addEventListener('click', (e) => {
        if (!selectedTool || isSimulating) return;

        const rect = builderCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        placeElement(x, y, selectedTool);
    });

    // Control buttons
    document.getElementById('runBtn')?.addEventListener('click', runSimulation);
    document.getElementById('clearBtn')?.addEventListener('click', clearMap);
    document.getElementById('resetBtn')?.addEventListener('click', resetSimulation);
    document.getElementById('exportBtn')?.addEventListener('click', exportImage);

    // Settings sliders
    document.getElementById('speedSlider')?.addEventListener('input', (e) => {
        const value = e.target.value;
        document.getElementById('speedValue').textContent = `${value}x`;
        if (builderAlgorithm) builderAlgorithm.speed = parseInt(value);
    });

    document.getElementById('sensitivitySlider')?.addEventListener('input', (e) => {
        const value = e.target.value;
        document.getElementById('sensitivityValue').textContent = value;
        if (builderAlgorithm) builderAlgorithm.sensitivity = parseInt(value);
    });

    document.getElementById('decaySlider')?.addEventListener('input', (e) => {
        const value = e.target.value;
        document.getElementById('decayValue').textContent = value;
        if (builderAlgorithm) builderAlgorithm.decayRate = parseFloat(value) / 10;
    });
}

// Place element on canvas
function placeElement(x, y, type) {
    // Check if source already exists
    if (type === 'source') {
        const existingSource = placedNodes.find(node => node.type === 'source');
        if (existingSource) {
            alert('❌ Source already placed! Remove it first or reset the map.');
            return;
        }
    }

    const node = {
        x: x,
        y: y,
        type: type,
        id: Date.now()
    };

    placedNodes.push(node);

    if (type === 'source') {
        builderAlgorithm.setSource(x, y);
    } else {
        builderAlgorithm.addFoodSource(x, y, type);
    }

    updateStats();
    console.log(`📍 Placed ${type} at (${Math.round(x)}, ${Math.round(y)})`);
}

// Run simulation
function runSimulation() {
    const sourceNode = placedNodes.find(node => node.type === 'source');
    if (!sourceNode) {
        alert('❌ Please place a Source (⭐) first!');
        return;
    }

    if (placedNodes.length < 2) {
        alert('❌ Please add at least one destination!');
        return;
    }

    isSimulating = true;
    startTime = Date.now();
    builderAlgorithm.start();

    document.getElementById('runBtn').disabled = true;
    document.getElementById('runBtn').textContent = '⏸️ Running...';

    console.log('🚀 Simulation started!');
}

// Clear map
function clearMap() {
    if (confirm('Are you sure you want to clear the map?')) {
        placedNodes = [];
        builderAlgorithm.reset();
        builderAlgorithm.foodSources = [];
        builderAlgorithm.sourcePoint = null;
        isSimulating = false;
        startTime = 0;

        document.getElementById('runBtn').disabled = false;
        document.getElementById('runBtn').textContent = '▶️ Run Simulation';

        updateStats();
        console.log('🗑️ Map cleared');
    }
}

// Reset simulation
function resetSimulation() {
    builderAlgorithm.reset();
    isSimulating = false;
    startTime = 0;

    document.getElementById('runBtn').disabled = false;
    document.getElementById('runBtn').textContent = '▶️ Run Simulation';

    updateStats();
    console.log('🔄 Simulation reset');
}

// Export image
function exportImage() {
    const link = document.createElement('a');
    link.download = 'slime-mold-network.png';
    link.href = builderCanvas.toDataURL();
    link.click();
    console.log('💾 Image exported');
}

// Update statistics
function updateStats() {
    const stats = builderAlgorithm.getStats();

    document.getElementById('nodeCount').textContent = placedNodes.length;
    document.getElementById('pathLength').textContent = formatDistance(stats.pathLength);
    document.getElementById('efficiency').textContent = `${stats.efficiency}%`;

    if (isSimulating) {
        const elapsed = (Date.now() - startTime) / 1000;
        document.getElementById('simTime').textContent = formatTime(elapsed);
    } else {
        document.getElementById('simTime').textContent = '0s';
    }
}

// Render loop
function renderBuilder() {
    if (!builderCtx || !builderCanvas) return;

    // Clear canvas
    builderCtx.fillStyle = document.body.classList.contains('light-mode') ? '#f8f9fa' : '#0a0e27';
    builderCtx.fillRect(0, 0, builderCanvas.width, builderCanvas.height);

    // Draw grid
    drawGrid();

    // Update simulation
    if (isSimulating) {
        const speed = parseInt(document.getElementById('speedSlider')?.value || 5);
        for (let i = 0; i < speed; i++) {
            builderAlgorithm.step();
        }
    }

    // Draw slime trails
    drawSlimeTrails();

    // Draw paths
    drawPaths();

    // Draw placed nodes
    drawNodes();

    // Update stats
    if (isSimulating) {
        updateStats();
    }

    // Continue loop
    animationFrame = requestAnimationFrame(renderBuilder);
}

// Draw background grid
function drawGrid() {
    builderCtx.strokeStyle = document.body.classList.contains('light-mode') 
        ? 'rgba(0, 0, 0, 0.05)' 
        : 'rgba(255, 255, 255, 0.05)';
    builderCtx.lineWidth = 1;

    const gridSize = 50;

    for (let x = 0; x < builderCanvas.width; x += gridSize) {
        builderCtx.beginPath();
        builderCtx.moveTo(x, 0);
        builderCtx.lineTo(x, builderCanvas.height);
        builderCtx.stroke();
    }

    for (let y = 0; y < builderCanvas.height; y += gridSize) {
        builderCtx.beginPath();
        builderCtx.moveTo(0, y);
        builderCtx.lineTo(builderCanvas.width, y);
        builderCtx.stroke();
    }
}

// Draw slime trails
function drawSlimeTrails() {
    if (!builderAlgorithm.trailGrid) return;

    const imageData = builderCtx.createImageData(builderCanvas.width, builderCanvas.height);
    const data = imageData.data;

    for (let y = 0; y < builderAlgorithm.rows; y++) {
        for (let x = 0; x < builderAlgorithm.cols; x++) {
            const value = builderAlgorithm.trailGrid[y][x];
            if (value > 0.1) {
                const intensity = Math.min(255, value * 255);
                
                // Draw at grid position
                for (let dy = 0; dy < builderAlgorithm.gridSize; dy++) {
                    for (let dx = 0; dx < builderAlgorithm.gridSize; dx++) {
                        const px = x * builderAlgorithm.gridSize + dx;
                        const py = y * builderAlgorithm.gridSize + dy;
                        
                        if (px < builderCanvas.width && py < builderCanvas.height) {
                            const index = (py * builderCanvas.width + px) * 4;
                            data[index] = 255; // R
                            data[index + 1] = 215; // G
                            data[index + 2] = 0; // B (Gold color)
                            data[index + 3] = intensity; // A
                        }
                    }
                }
            }
        }
    }

    builderCtx.putImageData(imageData, 0, 0);
}

// Draw network paths
function drawPaths() {
    if (!builderAlgorithm.paths || builderAlgorithm.paths.length === 0) return;

    builderAlgorithm.paths.forEach(path => {
        const alpha = Math.min(1, path.strength);
        
        builderCtx.strokeStyle = `rgba(255, 215, 0, ${alpha})`;
        builderCtx.lineWidth = 2 + path.strength * 3;
        builderCtx.lineCap = 'round';

        builderCtx.beginPath();
        builderCtx.moveTo(path.x1, path.y1);
        builderCtx.lineTo(path.x2, path.y2);
        builderCtx.stroke();

        // Add glow effect
        builderCtx.strokeStyle = `rgba(255, 215, 0, ${alpha * 0.3})`;
        builderCtx.lineWidth = 8 + path.strength * 5;
        builderCtx.beginPath();
        builderCtx.moveTo(path.x1, path.y1);
        builderCtx.lineTo(path.x2, path.y2);
        builderCtx.stroke();
    });
}

// Draw placed nodes
function drawNodes() {
    placedNodes.forEach(node => {
        const color = ELEMENT_COLORS[node.type];
        const icon = ELEMENT_ICONS[node.type];

        // Draw circle background
        builderCtx.fillStyle = color;
        builderCtx.beginPath();
        builderCtx.arc(node.x, node.y, 20, 0, Math.PI * 2);
        builderCtx.fill();

        // Draw glow
        builderCtx.shadowColor = color;
        builderCtx.shadowBlur = 20;
        builderCtx.beginPath();
        builderCtx.arc(node.x, node.y, 20, 0, Math.PI * 2);
        builderCtx.fill();
        builderCtx.shadowBlur = 0;

        // Draw icon
        builderCtx.font = '24px Arial';
        builderCtx.textAlign = 'center';
        builderCtx.textBaseline = 'middle';
        builderCtx.fillText(icon, node.x, node.y);

        // Draw label
        builderCtx.font = '12px Arial';
        builderCtx.fillStyle = document.body.classList.contains('light-mode') ? '#2c3e50' : '#e0e0e0';
        builderCtx.fillText(node.type.toUpperCase(), node.x, node.y + 35);
    });
}

// Cleanup on navigation away
window.addEventListener('beforeunload', () => {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
});
