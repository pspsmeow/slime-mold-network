// =============================================
// MAIN.JS - Core functionality and navigation
// =============================================

// Global state
const state = {
    currentSection: 'landing',
    theme: 'dark'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    setupEventListeners();
    console.log('🦠 Slime Mold Network Optimizer initialized!');
});

// ===== THEME MANAGEMENT =====
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    state.theme = savedTheme;
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
}

function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(state.theme);
    localStorage.setItem('theme', state.theme);
}

// ===== NAVIGATION =====
function navigateTo(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        state.currentSection = sectionId;
        
        // Initialize section-specific functionality
        if (sectionId === 'builder') {
            initializeBuilder();
        } else if (sectionId === 'tokyo') {
            initializeTokyo();
        }
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// ===== TUTORIAL TOGGLE =====
function toggleTutorial() {
    const tutorial = document.getElementById('tutorial');
    if (tutorial) {
        tutorial.classList.toggle('hidden');
    }
}

// ===== TOKYO INFO TOGGLE =====
function toggleTokyoInfo() {
    const info = document.getElementById('tokyoInfo');
    if (info) {
        info.style.display = info.style.display === 'none' ? 'block' : 'none';
    }
}

// ===== UTILITY FUNCTIONS =====
function formatNumber(num) {
    return num.toLocaleString();
}

function formatTime(seconds) {
    return `${seconds.toFixed(1)}s`;
}

function formatDistance(pixels) {
    // Approximate conversion (adjust scale as needed)
    const km = (pixels / 10).toFixed(2);
    return `${km} km`;
}

// Make functions globally accessible
window.navigateTo = navigateTo;
window.toggleTutorial = toggleTutorial;
window.toggleTokyoInfo = toggleTokyoInfo;
