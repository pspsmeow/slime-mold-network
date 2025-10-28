# 🦠 Slime Mold Network Optimizer

An interactive web application that visualizes slime mold-inspired algorithms for network optimization and urban planning. Watch nature's intelligence solve complex problems in real-time!

![Slime Mold Network](https://img.shields.io/badge/Nature--Inspired-Algorithm-brightgreen)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange)

## 🌟 Features

### 🗺️ Interactive Map Builder
- **Drag & Drop Interface**: Place schools, hospitals, houses, bus stops, parks, markets, and offices
- **Real-Time Simulation**: Watch the slime mold algorithm create optimal networks
- **Customizable Parameters**: Adjust speed, sensitivity, and decay rates
- **Statistics Dashboard**: Track nodes, path length, efficiency, and simulation time
- **Export Functionality**: Save your network designs as images

### 🗼 Tokyo Rail Network Comparison
- **Historical Recreation**: Based on famous 2010 research from Hokkaido University
- **Side-by-Side Comparison**: See how slime mold recreates Tokyo's actual rail system
- **Similarity Metrics**: Real-time calculation of network efficiency
- **Interactive Overlay**: Toggle between slime mold network and actual rail lines

### 🎨 Beautiful UI/UX
- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **Smooth Animations**: Organic, flowing visuals inspired by real slime molds
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Vibrant Colors**: Eye-catching color scheme with gradients and glows

## 🧬 The Science Behind It

**Physarum polycephalum** is a single-celled organism that exhibits remarkable problem-solving abilities:

1. **Exploration**: Extends pseudopods in all directions
2. **Connection**: Establishes paths when food sources are found
3. **Reinforcement**: Strengthens frequently used paths
4. **Decay**: Eliminates unused or inefficient routes
5. **Optimization**: Results in minimal, efficient networks

### Real-World Applications
- 🏙️ **Urban Planning**: Optimize road networks and infrastructure
- 🚀 **Space Exploration**: Efficient pathfinding for rovers
- 🌐 **Network Design**: Computer and telecommunications networks
- 🔬 **Scientific Research**: Understanding emergent intelligence

## 🚀 Getting Started

### Quick Start
1. Clone the repository:
   ```bash
   git clone https://github.com/pspsmeow/slime-mold-network.git
   ```

2. Open `index.html` in your web browser

3. Start exploring!

### No Build Required
This is a pure HTML/CSS/JavaScript application with no dependencies or build steps needed.

## 📖 How to Use

### Map Builder
1. Click on **"Create Custom Map"** from the landing page
2. Select an element from the toolbar (start with ⭐ **Source**)
3. Click on the canvas to place elements
4. Add destinations (houses, schools, hospitals, etc.)
5. Click **"Run Simulation"** to watch the magic happen!
6. Adjust settings in real-time to see different behaviors

### Tokyo Comparison
1. Click on **"Tokyo Rail Comparison"** from the landing page
2. Click **"Start Simulation"** to begin
3. Watch as the slime mold recreates Tokyo's rail network
4. Toggle overlay to compare with the actual rail system
5. View similarity metrics and statistics

## 🎮 Controls & Settings

### Builder Controls
- **Run Simulation**: Start the slime mold algorithm
- **Clear Map**: Remove all placed elements
- **Reset Simulation**: Restart without clearing elements
- **Export Image**: Save your network as PNG

### Adjustable Parameters
- **Speed** (1-10x): Control simulation speed
- **Sensitivity** (1-10): How strongly slime mold is attracted to food
- **Decay Rate** (1-10): How quickly unused paths disappear

## 🔬 Algorithm Details

The simulation uses a multi-agent system inspired by Physarum polycephalum:

```javascript
- Grid-based environment with diffusion
- Particle agents with sensory capabilities
- Positive feedback through trail reinforcement
- Decay mechanism for unused paths
- Gradient-based pathfinding
```

### Key Parameters
- **Grid Size**: 5 pixels (adjustable)
- **Max Agents**: 1000-2000 particles
- **Sensing Angle**: 45 degrees
- **Diffusion**: 8-neighbor kernel
- **Decay Rate**: 0.95-0.96 per iteration

## 📊 Research Background

This project is inspired by groundbreaking research:

> **"Rules for Biologically Inspired Adaptive Network Design"**  
> *Toshiyuki Nakagaki et al., Science (2010)*

The research demonstrated that slime mold can recreate complex transportation networks with similar efficiency to human-designed systems.

## 🌈 Customization

### Adding New Elements
Edit `builder.js` to add custom node types:

```javascript
const ELEMENT_ICONS = {
    custom: '🎯',
    // Add your icon
};

const ELEMENT_COLORS = {
    custom: '#FF00FF',
    // Add your color
};
```

### Modifying Algorithm Behavior
Adjust parameters in `algorithm.js`:

```javascript
new SlimeMoldAlgorithm({
    gridSize: 5,        // Simulation resolution
    sensitivity: 5,     // Attraction strength
    decayRate: 0.95,    // Trail persistence
    maxAgents: 1000     // Number of particles
});
```

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📜 License

MIT License - feel free to use this project for educational or commercial purposes!

## 🙏 Acknowledgments

- Inspired by research from Toshiyuki Nakagaki and colleagues
- Physarum polycephalum for being an amazing organism
- The open-source community for inspiration

## 📬 Contact

Created by [@pspsmeow](https://github.com/pspsmeow)

---

**Built with 🦠 | Inspired by Nature's Intelligence**

*Watch a brainless organism solve problems that took humans decades to optimize!*
