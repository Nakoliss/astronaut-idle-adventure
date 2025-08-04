const fs = require('fs');
const path = require('path');

// Load game balance configuration
function loadGameBalance() {
    try {
        const balanceData = fs.readFileSync(path.join(__dirname, 'game_balance.json'), 'utf8');
        return JSON.parse(balanceData);
    } catch (error) {
        console.error('Failed to load game_balance.json:', error.message);
        process.exit(1);
    }
}

// Initialize game state
function initializeGameState(gameBalance) {
    const state = JSON.parse(JSON.stringify(gameBalance.startingState));
    
    // Add scaling costs for drones
    state.droneCost = gameBalance.buildCosts.drone;
    state.dronesBuilt = 0;
    
    return state;
}

// Calculate soft cap factor
function calculateSoftCapFactor(current, softCap, exponent) {
    if (current <= 0) return 1;
    return 1 / (1 + Math.pow(current / softCap, exponent));
}

// Calculate production per tick for a resource
function calculateProductionPerTick(resource, gameState, gameBalance) {
    const config = gameBalance.resources[resource];
    const baseRate = config.baseRate;
    
    // Count distinct buildings owned (excluding drones)
    const distinctBuildingsOwned = Object.values(gameState.buildings).filter(count => count > 0).length;
    
    // Building modifier: 1 + 0.02 * distinctBuildingsOwned
    const buildingModifier = 1 + (0.02 * distinctBuildingsOwned);
    
    // Sum percent modifiers (assumed to be 0 for prototype)
    const sumPercentModifiers = 0;
    const percentModifier = 1 + sumPercentModifiers;
    
    // Soft cap factor
    const current = gameState[resource];
    const softCapFactor = calculateSoftCapFactor(current, config.softCap, config.exponent);
    
    // Final production per tick
    return baseRate * buildingModifier * percentModifier * softCapFactor;
}

// Get available technologies sorted by tier, then by cost
function getAvailableTech(gameState, gameBalance) {
    const availableTech = [];
    
    for (const [techName, techData] of Object.entries(gameBalance.tech)) {
        // Skip if already unlocked
        if (gameState.techUnlocked.includes(techName)) continue;
        
        // Check if prerequisites are met
        const prereqsMet = techData.prereq.every(prereq => 
            gameState.techUnlocked.includes(prereq)
        );
        
        if (prereqsMet) {
            availableTech.push({ name: techName, ...techData });
        }
    }
    
    // Sort by tier first, then by cost
    availableTech.sort((a, b) => {
        if (a.tier !== b.tier) return a.tier - b.tier;
        return a.cost - b.cost;
    });
    
    return availableTech;
}

// Format time from ticks
function formatTime(ticks, tickSeconds) {
    const totalSeconds = ticks * tickSeconds;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours} hours ${minutes} minutes`;
}

// Main simulation function
function simulate() {
    console.log('Loading game balance...');
    const gameBalance = loadGameBalance();
    const gameState = initializeGameState(gameBalance);
    
    console.log('Starting simulation...');
    console.log('Initial state:', {
        scrap: gameState.scrap,
        ice: gameState.ice,
        protein: gameState.protein,
        fuel: gameState.fuel,
        drones: gameState.drones
    });
    
    let tick = 0;
    const tickSeconds = gameBalance.tickSeconds;
    const fragmentInterval = Math.floor(3600 / tickSeconds); // 60 minutes in ticks
    let nextFragmentTick = fragmentInterval;
    
    // Milestone tracking
    const milestones = {
        firstDrone: null,
        droneBay: null,
        techUnlocks: {},
        fragments: [],
        warpTime: null
    };
    
    // Main simulation loop
    while (true) {
        tick++;
        
        // Generate resources
        const resources = ['scrap', 'ice', 'protein', 'fuel'];
        resources.forEach(resource => {
            const production = calculateProductionPerTick(resource, gameState, gameBalance);
            gameState[resource] += production;
        });
        
        // AI Decision Making
        
        // 1. Build Drone Bay if not built and affordable
        if (gameState.buildings.droneBay === 0 && 
            gameState.scrap >= gameBalance.tutorialGates.droneBayCost) {
            gameState.scrap -= gameBalance.tutorialGates.droneBayCost;
            gameState.buildings.droneBay = 1;
            milestones.droneBay = tick;
            console.log(`[${formatTime(tick, tickSeconds)}] Built Drone Bay (tick ${tick})`);
        }
        
        // 2. Build Drone if affordable
        if (gameState.scrap >= gameState.droneCost) {
            gameState.scrap -= gameState.droneCost;
            gameState.drones++;
            gameState.dronesBuilt++;
            
            // Scale drone cost by 1.12x
            gameState.droneCost = Math.ceil(gameState.droneCost * 1.12);
            
            if (milestones.firstDrone === null) {
                milestones.firstDrone = tick;
                console.log(`[${formatTime(tick, tickSeconds)}] Built first Drone (tick ${tick})`);
            }
        }
        
        // 3. Unlock technology (prioritize by tier, then cost)
        const availableTech = getAvailableTech(gameState, gameBalance);
        if (availableTech.length > 0) {
            const nextTech = availableTech[0];
            if (gameState.scrap >= nextTech.cost) {
                gameState.scrap -= nextTech.cost;
                gameState.techUnlocked.push(nextTech.name);
                milestones.techUnlocks[nextTech.name] = tick;
                console.log(`[${formatTime(tick, tickSeconds)}] Unlocked ${nextTech.name} (tier ${nextTech.tier}, cost ${nextTech.cost}) (tick ${tick})`);
            }
        }
        
        // 4. Generate warp fragments (every 60 minutes of sim time)
        if (tick >= nextFragmentTick) {
            gameState.warpFragments++;
            milestones.fragments.push(tick);
            nextFragmentTick += fragmentInterval;
            console.log(`[${formatTime(tick, tickSeconds)}] Generated warp fragment ${gameState.warpFragments} (tick ${tick})`);
        }
        
        // 5. Check win condition
        if (gameState.warpFragments >= gameBalance.bossRequirements.fragmentsNeeded &&
            gameState.fuel >= gameBalance.bossRequirements.fuelNeeded) {
            milestones.warpTime = tick;
            console.log(`[${formatTime(tick, tickSeconds)}] WARP ACHIEVED! (tick ${tick})`);
            break;
        }
        
        // Progress logging every 1000 ticks
        if (tick % 1000 === 0) {
            console.log(`[${formatTime(tick, tickSeconds)}] Progress - Scrap: ${Math.floor(gameState.scrap)}, Drones: ${gameState.drones}, Fragments: ${gameState.warpFragments}, Fuel: ${Math.floor(gameState.fuel)}`);
        }
        
        // Safety check to prevent infinite loops
        if (tick > 1000000) {
            console.log('Simulation reached maximum tick limit (1,000,000). Stopping.');
            break;
        }
    }
    
    // Print summary
    console.log('\n=== SIMULATION SUMMARY ===');
    console.log(`Warp achieved in ${formatTime(tick, tickSeconds)} (ticks = ${tick})`);
    
    console.log('\nMilestones:');
    if (milestones.firstDrone) {
        console.log(`- First Drone: ${formatTime(milestones.firstDrone, tickSeconds)}`);
    }
    if (milestones.droneBay) {
        console.log(`- Drone Bay: ${formatTime(milestones.droneBay, tickSeconds)}`);
    }
    
    Object.entries(milestones.techUnlocks).forEach(([tech, tickTime]) => {
        console.log(`- Tech ${tech}: ${formatTime(tickTime, tickSeconds)}`);
    });
    
    milestones.fragments.forEach((tickTime, index) => {
        console.log(`- Fragment ${index + 1}: ${formatTime(tickTime, tickSeconds)}`);
    });
    
    console.log('\nFinal State:');
    console.log(`- Scrap: ${Math.floor(gameState.scrap)}`);
    console.log(`- Ice: ${Math.floor(gameState.ice)}`);
    console.log(`- Protein: ${Math.floor(gameState.protein)}`);
    console.log(`- Fuel: ${Math.floor(gameState.fuel)}`);
    console.log(`- Drones: ${gameState.drones}`);
    console.log(`- Warp Fragments: ${gameState.warpFragments}`);
    console.log(`- Technologies: ${gameState.techUnlocked.length}`);
    console.log(`- Buildings: ${JSON.stringify(gameState.buildings)}`);
}

// Run the simulation
if (require.main === module) {
    simulate();
}

module.exports = { simulate };
