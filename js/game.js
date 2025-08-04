// Game state and configuration
let gameState = {};
let gameBalance = {};

// Load game balance configuration
async function loadGameBalance() {
    try {
        const response = await fetch('game_balance.json');
        gameBalance = await response.json();
        initializeGame();
    } catch (error) {
        console.error('Failed to load game balance:', error);
    }
}

// Initialize game state
function initializeGame() {
    gameState = JSON.parse(JSON.stringify(gameBalance.startingState));
    updateDisplay();
    generateBuildingButtons();
    generateTechButtons();
    startGameLoop();
}

// Update display elements
function updateDisplay() {
    document.getElementById('scrap-count').textContent = Math.floor(gameState.scrap);
    document.getElementById('ice-count').textContent = Math.floor(gameState.ice);
    document.getElementById('protein-count').textContent = Math.floor(gameState.protein);
    document.getElementById('fuel-count').textContent = Math.floor(gameState.fuel);
    document.getElementById('drone-count').textContent = gameState.drones;
    document.getElementById('survivor-count').textContent = gameState.survivors;
    document.getElementById('fragment-count').textContent = gameState.warpFragments;
}

// Resource generation with soft caps
function generateResources() {
    const resources = ['scrap', 'ice', 'protein', 'fuel'];
    
    resources.forEach(resource => {
        const config = gameBalance.resources[resource];
        const current = gameState[resource];
        const softCap = config.softCap;
        
        // Base generation rate modified by drones
        let baseGeneration = config.baseRate * gameState.drones;
        
        // Apply soft cap using exponential decay
        if (current >= softCap) {
            const excess = current - softCap;
            const decayFactor = Math.pow(0.5, excess / softCap);
            baseGeneration *= decayFactor;
        }
        
        gameState[resource] += baseGeneration;
    });
}

// Generate building buttons
function generateBuildingButtons() {
    const container = document.getElementById('buildings-container');
    container.innerHTML = '';
    
    Object.keys(gameBalance.buildCosts).forEach(building => {
        const cost = gameBalance.buildCosts[building];
        const button = document.createElement('button');
        button.className = 'building-btn';
        button.innerHTML = `
            <div>Build ${building.replace(/([A-Z])/g, ' $1').toLowerCase()}</div>
            <div>Cost: ${cost} scrap</div>
        `;
        button.onclick = () => buildStructure(building);
        container.appendChild(button);
    });
}

// Generate technology buttons
function generateTechButtons() {
    const container = document.getElementById('tech-container');
    container.innerHTML = '';
    
    Object.keys(gameBalance.tech).forEach(tech => {
        const techData = gameBalance.tech[tech];
        const button = document.createElement('button');
        button.className = 'tech-btn';
        button.innerHTML = `
            <div>${tech.replace(/([A-Z])/g, ' $1')}</div>
            <div>Cost: ${techData.cost} scrap</div>
            <div>Tier: ${techData.tier}</div>
        `;
        button.onclick = () => researchTech(tech);
        container.appendChild(button);
    });
}

// Build structure
function buildStructure(building) {
    const cost = gameBalance.buildCosts[building];
    
    if (gameState.scrap >= cost) {
        gameState.scrap -= cost;
        
        if (building === 'drone') {
            gameState.drones++;
        } else {
            gameState.buildings[building]++;
        }
        
        updateDisplay();
        console.log(`Built ${building}!`);
    } else {
        console.log(`Not enough scrap to build ${building}`);
    }
}

// Research technology
function researchTech(tech) {
    const techData = gameBalance.tech[tech];
    
    if (gameState.techUnlocked.includes(tech)) {
        console.log(`${tech} already researched!`);
        return;
    }
    
    // Check prerequisites
    const prereqsMet = techData.prereq.every(prereq => 
        gameState.techUnlocked.includes(prereq)
    );
    
    if (!prereqsMet) {
        console.log(`Prerequisites not met for ${tech}`);
        return;
    }
    
    if (gameState.scrap >= techData.cost) {
        gameState.scrap -= techData.cost;
        gameState.techUnlocked.push(tech);
        updateDisplay();
        console.log(`Researched ${tech}!`);
    } else {
        console.log(`Not enough scrap to research ${tech}`);
    }
}

// Main game loop
function gameLoop() {
    generateResources();
    updateDisplay();
    updateButtonStates();
}

// Update button states (enabled/disabled)
function updateButtonStates() {
    // Update building buttons
    const buildingButtons = document.querySelectorAll('.building-btn');
    buildingButtons.forEach(button => {
        const building = button.textContent.toLowerCase().includes('drone') ? 'drone' : 
                        Object.keys(gameBalance.buildCosts).find(b => 
                            button.textContent.toLowerCase().includes(b.toLowerCase()));
        
        if (building) {
            const cost = gameBalance.buildCosts[building];
            button.disabled = gameState.scrap < cost;
        }
    });
    
    // Update tech buttons
    const techButtons = document.querySelectorAll('.tech-btn');
    techButtons.forEach(button => {
        const tech = Object.keys(gameBalance.tech).find(t => 
            button.textContent.includes(t));
        
        if (tech) {
            const techData = gameBalance.tech[tech];
            const alreadyResearched = gameState.techUnlocked.includes(tech);
            const prereqsMet = techData.prereq.every(prereq => 
                gameState.techUnlocked.includes(prereq));
            const canAfford = gameState.scrap >= techData.cost;
            
            button.disabled = alreadyResearched || !prereqsMet || !canAfford;
            
            if (alreadyResearched) {
                button.style.background = 'rgba(0, 255, 0, 0.3)';
                button.innerHTML += '<div>✓ Researched</div>';
            }
        }
    });
}

// Start the game loop
function startGameLoop() {
    setInterval(gameLoop, gameBalance.tickSeconds * 1000);
}

// Save/Load functionality (localStorage)
function saveGame() {
    localStorage.setItem('astronautIdleAdventure', JSON.stringify(gameState));
    console.log('Game saved!');
}

function loadGame() {
    const saved = localStorage.getItem('astronautIdleAdventure');
    if (saved) {
        gameState = JSON.parse(saved);
        updateDisplay();
        console.log('Game loaded!');
    }
}

// Auto-save every 30 seconds
setInterval(saveGame, 30000);

// Initialize the game when page loads
window.addEventListener('load', loadGameBalance);
