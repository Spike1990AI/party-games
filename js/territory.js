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
    turnIndicator: document.getElementById('currentPlayerName'),
    scoresDisplay: document.getElementById('scoresDisplay'),
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

        // Create practice room in Firebase (2 players for practice)
        const roomData = {
            code: 'PRACTICE',
            created: Date.now(),
            grid: {},  // Empty grid to start
            currentTurn: 1,  // Start with player 1
            players: {
                1: { name: 'Player 1', score: 0 },
                2: { name: 'Player 2 (AI)', score: 0 }
            }
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

        // Check if it's current player's turn
        if (data.currentTurn !== myPlayerNumber) {
            debug(`❌ Not your turn (current: ${data.currentTurn})`);
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

        debug(`✅ Placed tile at ${key}`);

        // Check for captures
        const captures = findCaptures(row, col, myPlayerNumber, newGrid);
        debug(`🎯 Found ${captures.length} captures`);

        // Apply captures
        captures.forEach(captureKey => {
            newGrid[captureKey] = myPlayerNumber;
            debug(`  💥 Captured ${captureKey}`);
        });

        // Calculate next turn (alternate between 1 and 2 in practice)
        const nextTurn = data.currentTurn === 1 ? 2 : 1;

        // Check if grid is full
        const gridFull = Object.keys(newGrid).length >= (GRID_SIZE * GRID_SIZE);

        // Update Firebase
        await update(ref(database, `territory/${currentRoom}`), {
            grid: newGrid,
            currentTurn: nextTurn,
            gameOver: gridFull
        });

        debug(`💾 Firebase updated: ${Object.keys(newGrid).length} tiles, turn ${nextTurn}`);

    } catch (error) {
        debug('❌ Error placing tile: ' + error.message);
    }
}

// Find captures (Reversi-style: surround opponent tiles)
function findCaptures(row, col, player, grid) {
    const captures = [];
    const directions = [
        [-1, 0],  // Up
        [1, 0],   // Down
        [0, -1],  // Left
        [0, 1]    // Right
    ];

    directions.forEach(([dRow, dCol]) => {
        const tilesToFlip = [];
        let r = row + dRow;
        let c = col + dCol;

        // Walk in this direction
        while (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
            const key = `${r}_${c}`;
            const owner = grid[key];

            if (!owner) {
                // Hit empty cell - no captures in this direction
                break;
            }

            if (owner === player) {
                // Hit our own tile - capture everything in between
                captures.push(...tilesToFlip);
                break;
            }

            // Hit opponent tile - add to potential captures
            tilesToFlip.push(key);
            r += dRow;
            c += dCol;
        }
    });

    return captures;
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

        // Update turn indicator
        updateTurnDisplay(data);

        // Update scores
        updateScores(data);

        // Update grid display
        updateGridDisplay(data.grid || {});

        // Check game over
        if (data.gameOver) {
            debug('🏆 Game Over!');
        }
    });
}

// Update turn indicator
function updateTurnDisplay(data) {
    if (!elements.turnIndicator) return;

    const currentPlayer = data.players[data.currentTurn];
    if (currentPlayer) {
        elements.turnIndicator.textContent = currentPlayer.name;
        elements.turnIndicator.style.color = data.currentTurn === 1 ? '#e74c3c' : '#3498db';
    }
}

// Update scores
function updateScores(data) {
    if (!elements.scoresDisplay) return;

    elements.scoresDisplay.innerHTML = '';

    // Calculate scores
    const scores = {};
    Object.keys(data.players || {}).forEach(playerId => {
        const playerNum = parseInt(playerId);
        scores[playerNum] = 0;
    });

    // Count tiles for each player
    Object.values(data.grid || {}).forEach(owner => {
        scores[owner] = (scores[owner] || 0) + 1;
    });

    // Display scores
    Object.keys(data.players || {}).forEach(playerId => {
        const playerNum = parseInt(playerId);
        const player = data.players[playerId];
        const score = scores[playerNum] || 0;

        const div = document.createElement('div');
        div.className = `player-score player-${playerNum}`;
        if (data.currentTurn === playerNum) {
            div.classList.add('active');
        }

        div.innerHTML = `
            <div class="player-score-name">${player.name}</div>
            <div class="player-score-tiles">${score}</div>
        `;

        elements.scoresDisplay.appendChild(div);
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
