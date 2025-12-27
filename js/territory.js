/**
 * Territory Wars - CLEAN REBUILD
 * Simple practice mode first, then add features
 */

import { database, ref, set, onValue, update } from './firebase-territory.js';

// Constants
const GRID_SIZE = 6;

// State
let currentRoom = null;
let myPlayerNumber = null;

// DOM Elements
const screens = {
    join: document.getElementById('joinScreen'),
    game: document.getElementById('gameScreen')
};

const elements = {
    practiceBtn: document.getElementById('practiceBtn'),
    playerName: document.getElementById('playerName'),
    grid: document.getElementById('territoryGrid'),
    roomCode: document.getElementById('gameRoomCode'),
    debug: document.getElementById('debugLog')
};

// Debug helper
function debug(msg) {
    console.log(msg);
    if (elements.debug) {
        const time = new Date().toLocaleTimeString();
        elements.debug.innerHTML = `[${time}] ${msg}<br>` + elements.debug.innerHTML;
    }
}

// Show screen
function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    screens[name].classList.remove('hidden');
    debug(`📺 Showing ${name} screen`);
}

// Initialize
function init() {
    debug('🎮 Territory Wars initialized');

    // Practice button
    elements.practiceBtn.addEventListener('click', startPractice);

    showScreen('join');
}

// Start practice mode
async function startPractice() {
    try {
        debug('🎯 Starting practice mode...');

        const playerName = elements.playerName.value.trim() || 'Player 1';
        currentRoom = 'PRACTICE';
        myPlayerNumber = 1;

        // Create practice room in Firebase
        const roomData = {
            code: 'PRACTICE',
            created: Date.now(),
            grid: {}  // Empty grid to start
        };

        debug('💾 Creating Firebase room...');
        await set(ref(database, `territory/${currentRoom}`), roomData);
        debug('✅ Room created');

        // Show game screen
        showScreen('game');
        elements.roomCode.textContent = 'PRACTICE';

        // Setup grid
        createGrid();

        // Listen for changes
        listenToRoom();

        debug('🎮 Practice mode ready! Click cells to place tiles.');

    } catch (error) {
        debug('❌ Error: ' + error.message);
        alert('Error starting practice: ' + error.message);
    }
}

// Create the grid
function createGrid() {
    elements.grid.innerHTML = '';
    debug(`🏗️ Creating ${GRID_SIZE}x${GRID_SIZE} grid...`);

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'territory-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            // Click handler
            cell.addEventListener('click', () => handleCellClick(row, col));

            elements.grid.appendChild(cell);
        }
    }

    debug(`✅ Grid created with ${GRID_SIZE * GRID_SIZE} cells`);
}

// Handle cell click
async function handleCellClick(row, col) {
    try {
        const key = `${row}_${col}`;
        debug(`👆 Clicked cell ${key}`);

        // Get current room data
        const snapshot = await get(ref(database, `territory/${currentRoom}`));
        const data = snapshot.val();

        if (!data) {
            debug('❌ No room data');
            return;
        }

        // Check if cell is already occupied
        if (data.grid && data.grid[key]) {
            debug(`❌ Cell ${key} already occupied`);
            return;
        }

        // Place tile
        const newGrid = { ...data.grid };
        newGrid[key] = myPlayerNumber;

        debug(`✅ Placing tile at ${key}`);

        // Update Firebase
        await update(ref(database, `territory/${currentRoom}`), {
            grid: newGrid
        });

        debug(`💾 Firebase updated with ${Object.keys(newGrid).length} tiles`);

    } catch (error) {
        debug('❌ Error placing tile: ' + error.message);
    }
}

// Listen to room changes
function listenToRoom() {
    debug('👂 Starting Firebase listener...');

    const roomRef = ref(database, `territory/${currentRoom}`);

    onValue(roomRef, (snapshot) => {
        const data = snapshot.val();

        if (!data) {
            debug('⚠️ No data received');
            return;
        }

        debug(`🔄 Room update: ${Object.keys(data.grid || {}).length} tiles`);

        // Update grid display
        updateGridDisplay(data.grid || {});
    });
}

// Update grid display
function updateGridDisplay(grid) {
    debug('🎨 Updating grid display...');

    const cells = elements.grid.querySelectorAll('.territory-cell');
    let tilesRendered = 0;

    cells.forEach(cell => {
        const row = cell.dataset.row;
        const col = cell.dataset.col;
        const key = `${row}_${col}`;
        const owner = grid[key];

        // Clear previous state
        cell.className = 'territory-cell';
        cell.textContent = '';
        cell.style.backgroundColor = '';

        if (owner) {
            // Cell is occupied
            tilesRendered++;

            // Add player class
            cell.classList.add(`player-${owner}`);
            cell.classList.add('occupied');

            // Add visible text
            cell.textContent = `P${owner}`;
            cell.style.color = 'white';
            cell.style.fontWeight = 'bold';
            cell.style.fontSize = '1.2rem';

            // Force background color
            if (owner === 1) cell.style.backgroundColor = '#e74c3c';
            if (owner === 2) cell.style.backgroundColor = '#3498db';
            if (owner === 3) cell.style.backgroundColor = '#27ae60';
            if (owner === 4) cell.style.backgroundColor = '#f39c12';

            debug(`  ✅ Rendered P${owner} at ${key}`);
        }
    });

    debug(`🎨 Display complete: ${tilesRendered} tiles visible`);
}

// Import get function
import { get } from './firebase-territory.js';

// Start the app
init();
