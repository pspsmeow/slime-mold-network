// =============================================
// TOKYO.JS - Tokyo Rail Network Comparison
// =============================================

let tokyoAlgorithm = null;
let tokyoCanvas = null;
let tokyoCtx = null;
let tokyoAnimationFrame = null;
let tokyoStartTime = 0;
let isTokyoSimulating = false;
let showOverlay = true;

// Tokyo rail network data (simplified major stations)
const TOKYO_STATIONS = [
    { name: 'Tokyo', x: 400, y: 300 }, // Center
    { name: 'Shinjuku', x: 300, y: 280 },
    { name: 'Shibuya', x: 280, y: 320 },
    { name: 'Ikebukuro', x: 320, y: 240 },
    { name: 'Ueno', x: 440, y: 280 },
    { name: 'Shinagawa', x: 380, y: 360 },
    { name: 'Yokohama', x: 340, y: 450 },
    { name: 'Akihabara', x: 420, y: 290 },
    { name: 'Roppongi', x: 360, y: 310 },
    { name: 'Ginza', x: 410, y: 310 },
    { name: 'Asakusa', x: 460, y: 270 },
    { name: 'Odaiba', x: 450, y: 360 },
    { name: 'Nakano', x: 270, y: 270 },
    { name: 'Kichijoji', x: 230, y: 260 },
    { name: 'Meguro', x: 350, y: 340 },
    { name: 'Ebisu', x: 330, y: 330 }
];

// Tokyo rail connections (simplified)
const TOKYO_CONNECTIONS = [
    ['Tokyo', 'Shinjuku'],
    ['Tokyo', 'Ueno'],
    ['Tokyo', 'Shinagawa'],
    ['Tokyo', 'Akihabara'],
    ['Tokyo', 'Ginza'],
    ['Shinjuku', 'Shibuya'],
    ['Shinjuku', 'Ikebukuro'],
    ['Shibuya', 'Roppongi'],
    ['Shibuya', 'Meguro'],
    ['Shibuya', 'Ebisu'],
    ['Ikebukuro', 'Nakano'],
    ['Ueno', 'Asakusa'],
    ['Ueno', 'Akihabara'],
    ['Shinagawa', 'Yokohama'],
    ['Shinagawa', 'Odaiba'],
    ['Nakano', 'Kichijoji'],
    ['Roppongi', 'Ginza'],
    ['Ebisu', 'Meguro']
];

// Initialize Tokyo simulation
function initializeTokyo() {
    if (tokyoCanvas) return; // Already initialized

    tokyoCanvas = document.getElementById('tokyoCanvas');
    if (!tokyoCanvas) return;

    tokyoCtx = tokyoCanvas.getContext('2d');
    
    // Set canvas size
    resizeTokyoCanvas();
    window.addEventListener('resize', resizeTokyoCanvas);

    // Initialize algorithm
    tokyoAlgorithm = new SlimeMoldAlgorithm({
        width: tokyoCanvas.width,
        height: tokyoCanvas.height,
        gridSize: 4,
        sensitivity: 6,
        decayRate: 0.96,
        speed: 5,
        maxAgents: 2000
    });

    // Set Tokyo as source
    const tokyoStation = TOKYO_STATIONS[0];
    tokyoAlgorithm.setSource(tokyoStation.x, tokyoStation.y);

    // Add all stations as food sources
    TOKYO_STATIONS.slice(1).forEach(station => {
        tokyoAlgorithm.addFoodSource(station.x, station.y, 'station');
    });

    // Setup event listeners
    setupTokyoEventListeners();

    // Start render loop
    renderTokyo();

    console.log('✅ Tokyo simulation initialized');
}

// Resize canvas
function resizeTokyoCanvas() {
    const container = tokyoCanvas.parentElement;
    tokyoCanvas.width = container.clientWidth;
    tokyoCanvas.height = container.clientHeight;
}

// Setup event listeners
function setupTokyoEventListeners() {
    document.getElementById('tokyoRunBtn')?.addEventListener('click', startTokyoSimulation);
    document.getElementById('tokyoResetBtn')?.addEventListener('click', resetTokyoSimulation);
    document.getElementById('overlayBtn')?.addEventListener('click', toggleOverlay);
}

// Start Tokyo simulation
function startTokyoSimulation() {
    isTokyoSimulating = true;
    tokyoStartTime = Date.now();
    tokyoAlgorithm.start();

    document.getElementById('tokyoRunBtn').disabled = true;
    document.getElementById('tokyoRunBtn').textContent = '⏸️ Running...';

    console.log('🚀 Tokyo simulation started!');
}

// Reset Tokyo simulation
function resetTokyoSimulation() {
    tokyoAlgorithm.reset();
    isTokyoSimulating = false;
    tokyoStartTime = 0;

    document.getElementById('tokyoRunBtn').disabled = false;
    document.getElementById('tokyoRunBtn').textContent = '▶️ Start Simulation';

    updateTokyoStats();
    console.log('🔄 Tokyo simulation reset');
}

// Toggle overlay
function toggleOverlay() {
    showOverlay = !showOverlay;
    console.log(`👁️ Overlay ${showOverlay ? 'shown' : 'hidden'}`);
}

// Update statistics
function updateTokyoStats() {
    const stats = tokyoAlgorithm.getStats();

    document.getElementById('slimeNodes').textContent = stats.nodes;
    document.getElementById('slimeLength').textContent = formatDistance(stats.pathLength);

    // Calculate similarity (simplified)
    const similarity = Math.min(100, stats.efficiency * 0.8);
    document.getElementById('similarity').textContent = `${Math.round(similarity)}%`;

    if (isTokyoSimulating) {
        const elapsed = (Date.now() - tokyoStartTime) / 1000;
        const progress = Math.min(100, (stats.iterations / 1000) * 100);
        document.getElementById('progress').textContent = `${Math.round(progress)}%`;
    } else {
        document.getElementById('progress').textContent = '0%';
    }
}

// Render loop
function renderTokyo() {
    if (!tokyoCtx || !tokyoCanvas) return;

    // Clear canvas
    tokyoCtx.fillStyle = document.body.classList.contains('light-mode') ? '#f8f9fa' : '#0a0e27';
    tokyoCtx.fillRect(0, 0, tokyoCanvas.width, tokyoCanvas.height);

    // Draw Tokyo Bay and land (simplified map)
    drawTokyoMap();

    // Update simulation
    if (isTokyoSimulating) {
        for (let i = 0; i < 5; i++) {
            tokyoAlgorithm.step();
        }
    }

    // Draw slime network
    drawTokyoSlimeTrails();

    // Draw actual Tokyo rail network (if overlay enabled)
    if (showOverlay) {
        drawTokyoRailNetwork();
    }

    // Draw stations
    drawTokyoStations();

    // Update stats
    if (isTokyoSimulating) {
        updateTokyoStats();
    }

    // Continue loop
    tokyoAnimationFrame = requestAnimationFrame(renderTokyo);
}

// Draw simplified Tokyo map
function drawTokyoMap() {
    // Draw land
    tokyoCtx.fillStyle = document.body.classList.contains('light-mode') 
        ? 'rgba(200, 220, 200, 0.3)' 
        : 'rgba(50, 70, 50, 0.3)';
    tokyoCtx.fillRect(0, 0, tokyoCanvas.width, tokyoCanvas.height);

    // Draw Tokyo Bay (simplified)
    tokyoCtx.fillStyle = document.body.classList.contains('light-mode') 
        ? 'rgba(150, 200, 255, 0.3)' 
        : 'rgba(30, 50, 100, 0.3)';
    tokyoCtx.beginPath();
    tokyoCtx.arc(500, 450, 150, 0, Math.PI * 2);
    tokyoCtx.fill();
}

// Draw slime trails
function drawTokyoSlimeTrails() {
    if (!tokyoAlgorithm.trailGrid) return;

    for (let y = 0; y < tokyoAlgorithm.rows; y++) {
        for (let x = 0; x < tokyoAlgorithm.cols; x++) {
            const value = tokyoAlgorithm.trailGrid[y][x];
            if (value > 0.2) {
                const intensity = Math.min(1, value);
                const size = tokyoAlgorithm.gridSize;
                
                tokyoCtx.fillStyle = `rgba(255, 215, 0, ${intensity * 0.6})`;
                tokyoCtx.fillRect(
                    x * size, 
                    y * size, 
                    size, 
                    size
                );
            }
        }
    }

    // Draw enhanced paths
    tokyoAlgorithm.paths.forEach(path => {
        if (path.strength > 0.3) {
            const alpha = Math.min(1, path.strength);
            
            // Main line
            tokyoCtx.strokeStyle = `rgba(255, 215, 0, ${alpha})`;
            tokyoCtx.lineWidth = 3;
            tokyoCtx.lineCap = 'round';
            tokyoCtx.beginPath();
            tokyoCtx.moveTo(path.x1, path.y1);
            tokyoCtx.lineTo(path.x2, path.y2);
            tokyoCtx.stroke();

            // Glow
            tokyoCtx.strokeStyle = `rgba(255, 215, 0, ${alpha * 0.3})`;
            tokyoCtx.lineWidth = 8;
            tokyoCtx.beginPath();
            tokyoCtx.moveTo(path.x1, path.y1);
            tokyoCtx.lineTo(path.x2, path.y2);
            tokyoCtx.stroke();
        }
    });
}

// Draw actual Tokyo rail network
function drawTokyoRailNetwork() {
    tokyoCtx.strokeStyle = 'rgba(0, 206, 209, 0.6)';
    tokyoCtx.lineWidth = 3;
    tokyoCtx.lineCap = 'round';

    TOKYO_CONNECTIONS.forEach(([station1, station2]) => {
        const s1 = TOKYO_STATIONS.find(s => s.name === station1);
        const s2 = TOKYO_STATIONS.find(s => s.name === station2);

        if (s1 && s2) {
            tokyoCtx.beginPath();
            tokyoCtx.moveTo(s1.x, s1.y);
            tokyoCtx.lineTo(s2.x, s2.y);
            tokyoCtx.stroke();

            // Add glow
            tokyoCtx.strokeStyle = 'rgba(0, 206, 209, 0.2)';
            tokyoCtx.lineWidth = 8;
            tokyoCtx.beginPath();
            tokyoCtx.moveTo(s1.x, s1.y);
            tokyoCtx.lineTo(s2.x, s2.y);
            tokyoCtx.stroke();
            tokyoCtx.strokeStyle = 'rgba(0, 206, 209, 0.6)';
            tokyoCtx.lineWidth = 3;
        }
    });
}

// Draw Tokyo stations
function drawTokyoStations() {
    TOKYO_STATIONS.forEach((station, index) => {
        const isCenter = index === 0;
        const radius = isCenter ? 15 : 10;
        const color = isCenter ? '#FFD700' : '#FF1493';

        // Draw circle
        tokyoCtx.fillStyle = color;
        tokyoCtx.beginPath();
        tokyoCtx.arc(station.x, station.y, radius, 0, Math.PI * 2);
        tokyoCtx.fill();

        // Draw glow
        tokyoCtx.shadowColor = color;
        tokyoCtx.shadowBlur = 15;
        tokyoCtx.beginPath();
        tokyoCtx.arc(station.x, station.y, radius, 0, Math.PI * 2);
        tokyoCtx.fill();
        tokyoCtx.shadowBlur = 0;

        // Draw station name
        tokyoCtx.font = isCenter ? 'bold 14px Arial' : '11px Arial';
        tokyoCtx.fillStyle = document.body.classList.contains('light-mode') ? '#2c3e50' : '#e0e0e0';
        tokyoCtx.textAlign = 'center';
        tokyoCtx.fillText(station.name, station.x, station.y - radius - 8);
    });
}

// Cleanup
window.addEventListener('beforeunload', () => {
    if (tokyoAnimationFrame) {
        cancelAnimationFrame(tokyoAnimationFrame);
    }
});
