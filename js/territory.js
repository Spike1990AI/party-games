// Territory Wars Game Logic
import { database, ref, set, onValue, update, remove, get } from './firebase-territory.js';

// Hide loading screen once Firebase is loaded
setTimeout(() => {
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('joinScreen').classList.remove('hidden');
}, 500);

// Game Configuration
const GRID_SIZE = 6;
const TURN_TIMER = 15;
const PLAYER_COLORS = ['#e74c3c', '#3498db', '#27ae60', '#f39c12'];

// Game State
let currentRoom = null;
let currentPlayer = null;
let playerNumber = null;
let roomListener = null;
let turnTimerInterval = null;
let timeLeft = TURN_TIMER;

// DOM Elements
const screens = {
    join: document.getElementById('joinScreen'),
    lobby: document.getElementById('lobbyScreen'),
    game: document.getElementById('gameScreen'),
    results: document.getElementById('resultsScreen')
};

const elements = {
    playerName: document.getElementById('playerName'),
    createRoomBtn: document.getElementById('createRoomBtn'),
    joinRoomBtn: document.getElementById('joinRoomBtn'),
    joinRoomInput: document.getElementById('joinRoomInput'),
    roomCodeInput: document.getElementById('roomCodeInput'),
    joinRoomConfirmBtn: document.getElementById('joinRoomConfirmBtn'),

    roomCode: document.getElementById('roomCode'),
    playersList: document.getElementById('playersList'),
    startGameBtn: document.getElementById('startGameBtn'),
    leaveLobbyBtn: document.getElementById('leaveLobbyBtn'),

    gameRoomCode: document.getElementById('gameRoomCode'),
    turnIndicator: document.getElementById('turnIndicator'),
    currentPlayerName: document.getElementById('currentPlayerName'),
    timer: document.getElementById('timer'),
    scoresDisplay: document.getElementById('scoresDisplay'),
    territoryGrid: document.getElementById('territoryGrid'),
    debugLog: document.getElementById('debugLog'),

    winnerName: document.getElementById('winnerName'),
    finalScoresList: document.getElementById('finalScoresList'),
    playAgainBtn: document.getElementById('playAgainBtn')
};

// Mobile debug helper
function debugLog(msg) {
    console.log(msg);
    if (elements.debugLog) {
        const time = new Date().toLocaleTimeString();
        elements.debugLog.innerHTML = `[${time}] ${msg}<br>` + elements.debugLog.innerHTML;
    }
}

// Event Listeners
elements.createRoomBtn.addEventListener('click', createRoom);
elements.joinRoomBtn.addEventListener('click', () => {
    elements.joinRoomInput.classList.toggle('hidden');
});
elements.joinRoomConfirmBtn.addEventListener('click', joinRoom);
elements.startGameBtn.addEventListener('click', startGame);
elements.leaveLobbyBtn.addEventListener('click', leaveLobby);
elements.playAgainBtn.addEventListener('click', playAgain);

// Initialize
loadPlayerName();

function loadPlayerName() {
    const savedName = localStorage.getItem('territory_playerName');
    if (savedName) {
        elements.playerName.value = savedName;
    }
}

function savePlayerName() {
    const name = elements.playerName.value.trim();
    if (name) {
        localStorage.setItem('territory_playerName', name);
    }
}

function generateRoomCode() {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude I, O
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += letters[Math.floor(Math.random() * letters.length)];
    }
    return code;
}

async function createRoom() {
    const name = elements.playerName.value.trim();
    if (!name) {
        alert('Please enter your name');
        return;
    }

    savePlayerName();
    const code = generateRoomCode();
    currentRoom = code;
    playerNumber = 1;

    const roomData = {
        code: code,
        created: Date.now(),
        gameState: 'waiting',
        players: {
            player1: {
                name: name,
                score: 0
            }
        },
        playerOrder: ['player1'],
        currentTurn: 'player1',
        turnNumber: 1,
        grid: {},
        winner: null,
        lastMove: null
    };

    await set(ref(database, `territory/${code}`), roomData);
    currentPlayer = 'player1';

    showScreen('lobby');
    elements.roomCode.textContent = code;
    listenToRoom(code);
}

async function joinRoom() {
    const name = elements.playerName.value.trim();
    const code = elements.roomCodeInput.value.trim().toUpperCase();

    if (!name) {
        alert('Please enter your name');
        return;
    }

    if (!code || code.length !== 4) {
        alert('Please enter a valid 4-letter room code');
        return;
    }

    savePlayerName();

    // Check if room exists
    const roomSnapshot = await get(ref(database, `territory/${code}`));
    if (!roomSnapshot.exists()) {
        alert('Room not found');
        return;
    }

    const roomData = roomSnapshot.val();

    // Check if game already started
    if (roomData.gameState !== 'waiting') {
        alert('Game already in progress');
        return;
    }

    // Find available player slot
    const existingPlayers = roomData.playerOrder || [];
    if (existingPlayers.length >= 4) {
        alert('Room is full');
        return;
    }

    playerNumber = existingPlayers.length + 1;
    currentPlayer = `player${playerNumber}`;
    currentRoom = code;

    // Add player to room
    const playerData = {
        name: name,
        score: 0
    };

    await update(ref(database, `territory/${code}`), {
        [`players/${currentPlayer}`]: playerData,
        playerOrder: [...existingPlayers, currentPlayer]
    });

    showScreen('lobby');
    elements.roomCode.textContent = code;
    listenToRoom(code);
}

function listenToRoom(code) {
    const roomRef = ref(database, `territory/${code}`);

    roomListener = onValue(roomRef, (snapshot) => {
        const data = snapshot.val();

        if (!data) {
            // Room was deleted
            showScreen('join');
            alert('Room was closed');
            return;
        }

        if (data.gameState === 'waiting') {
            updateLobby(data);
        } else if (data.gameState === 'playing') {
            updateGame(data);
        } else if (data.gameState === 'finished') {
            updateResults(data);
        }
    });
}

function updateLobby(data) {
    const playersList = elements.playersList;
    playersList.innerHTML = '';

    data.playerOrder.forEach((playerId, index) => {
        const player = data.players[playerId];
        const div = document.createElement('div');
        div.className = `player-item player-${index + 1}`;
        div.textContent = player.name;
        playersList.appendChild(div);
    });

    // Show start button only for player 1 and when at least 2 players
    if (currentPlayer === 'player1' && data.playerOrder.length >= 2) {
        elements.startGameBtn.classList.remove('hidden');
    } else {
        elements.startGameBtn.classList.add('hidden');
    }
}

async function startGame() {
    if (!currentRoom) return;

    await update(ref(database, `territory/${currentRoom}`), {
        gameState: 'playing',
        grid: {},
        lastMove: null
    });

    showScreen('game');
    elements.gameRoomCode.textContent = currentRoom;
}

function updateGame(data) {
    showScreen('game');
    elements.gameRoomCode.textContent = currentRoom;

    // Update turn indicator
    const currentTurnPlayer = data.players[data.currentTurn];
    elements.currentPlayerName.textContent = currentTurnPlayer.name;

    // Update timer
    if (data.currentTurn === currentPlayer) {
        startTurnTimer();
    } else {
        stopTurnTimer();
    }

    // Update scores
    updateScores(data);

    // Render grid
    renderGrid(data);
}

function updateScores(data) {
    const scoresContainer = elements.scoresDisplay;
    scoresContainer.innerHTML = '';
    scoresContainer.className = 'scores-display';

    data.playerOrder.forEach((playerId, index) => {
        const player = data.players[playerId];
        const score = calculatePlayerScore(data.grid, playerId);

        const div = document.createElement('div');
        div.className = `player-score player-${index + 1}`;
        if (data.currentTurn === playerId) {
            div.classList.add('active');
        }

        div.innerHTML = `
            <div class="player-score-name">${player.name}</div>
            <div class="player-score-tiles">${score}</div>
        `;

        scoresContainer.appendChild(div);
    });
}

function calculatePlayerScore(grid, playerId) {
    return Object.values(grid).filter(owner => owner === playerId).length;
}

function renderGrid(data) {
    const grid = elements.territoryGrid;
    grid.innerHTML = '';

    const isMyTurn = data.currentTurn === currentPlayer;
    const occupiedCount = Object.keys(data.grid || {}).length;
    debugLog(`🎨 Render: ${occupiedCount} tiles`);

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'territory-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            const key = `${row}_${col}`;
            const owner = data.grid ? data.grid[key] : null;

            if (owner) {
                // Cell is occupied
                const ownerIndex = data.playerOrder.indexOf(owner);
                const playerNum = ownerIndex + 1;
                debugLog(`  📍 ${key}=${owner} → player-${playerNum}`);
                cell.classList.add(`player-${playerNum}`);
                cell.classList.add('occupied');

                // ADD TEXT SO WE CAN SEE TILES EVEN IF COLORS FAIL
                cell.textContent = `P${playerNum}`;
                cell.style.color = 'white';
                cell.style.fontWeight = 'bold';
                cell.style.fontSize = '1.2rem';
                debugLog(`  ✅ Added P${playerNum} text to cell`);

                // Mark last move
                if (data.lastMove && data.lastMove.row === row && data.lastMove.col === col) {
                    cell.classList.add('last-move');
                }
            } else {
                // Cell is empty - allow placement if it's our turn
                if (isMyTurn) {
                    cell.classList.add('my-turn');
                    cell.addEventListener('click', () => placeTile(row, col));
                }
            }

            grid.appendChild(cell);
        }
    }
}

async function placeTile(row, col) {
    debugLog(`🎯 Click at ${row},${col}`);

    if (!currentRoom || !currentPlayer) {
        debugLog('❌ No room/player');
        return;
    }

    const roomSnapshot = await get(ref(database, `territory/${currentRoom}`));
    const data = roomSnapshot.val();

    // Verify it's our turn
    if (data.currentTurn !== currentPlayer) {
        debugLog('❌ Not your turn');
        return;
    }

    const key = `${row}_${col}`;
    debugLog(`✅ Placing ${currentPlayer} at ${key}`);

    // Verify cell is empty
    if (data.grid[key]) {
        debugLog('❌ Already occupied');
        return;
    }

    // Place the tile
    const newGrid = { ...data.grid };
    newGrid[key] = currentPlayer;
    debugLog(`📝 Grid has ${Object.keys(newGrid).length} tiles`);

    // Check for captures
    const captures = checkCaptures(row, col, currentPlayer, newGrid, data.playerOrder);

    // Apply captures
    captures.forEach(captureKey => {
        newGrid[captureKey] = currentPlayer;
    });

    // Update grid
    await update(ref(database, `territory/${currentRoom}`), {
        grid: newGrid,
        lastMove: { row, col, player: currentPlayer }
    });

    // Check if grid is full
    const totalCells = GRID_SIZE * GRID_SIZE;
    const filledCells = Object.keys(newGrid).length;

    if (filledCells >= totalCells) {
        // Game over - determine winner
        const scores = {};
        data.playerOrder.forEach(playerId => {
            scores[playerId] = calculatePlayerScore(newGrid, playerId);
        });

        const winner = Object.keys(scores).reduce((a, b) =>
            scores[a] > scores[b] ? a : b
        );

        await update(ref(database, `territory/${currentRoom}`), {
            gameState: 'finished',
            winner: winner,
            grid: newGrid
        });
        return;
    }

    // Next turn
    await nextTurn();
}

function checkCaptures(row, col, player, grid, playerOrder) {
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
                // Hit an empty cell - no captures in this direction
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

function startTurnTimer() {
    stopTurnTimer();
    timeLeft = TURN_TIMER;
    elements.timer.textContent = timeLeft;
    elements.timer.classList.remove('warning');

    turnTimerInterval = setInterval(() => {
        timeLeft--;
        elements.timer.textContent = timeLeft;

        if (timeLeft <= 3) {
            elements.timer.classList.add('warning');
        }

        if (timeLeft <= 0) {
            stopTurnTimer();
            nextTurn();
        }
    }, 1000);
}

function stopTurnTimer() {
    if (turnTimerInterval) {
        clearInterval(turnTimerInterval);
        turnTimerInterval = null;
    }
    elements.timer.classList.remove('warning');
}

async function nextTurn() {
    if (!currentRoom) return;

    const roomSnapshot = await get(ref(database, `territory/${currentRoom}`));
    const data = roomSnapshot.val();

    const currentIndex = data.playerOrder.indexOf(data.currentTurn);
    const nextIndex = (currentIndex + 1) % data.playerOrder.length;
    const nextPlayer = data.playerOrder[nextIndex];

    await update(ref(database, `territory/${currentRoom}`), {
        currentTurn: nextPlayer,
        turnNumber: data.turnNumber + 1
    });
}

function updateResults(data) {
    showScreen('results');

    const winnerPlayer = data.players[data.winner];
    elements.winnerName.textContent = winnerPlayer.name;

    // Calculate final scores
    const scores = data.playerOrder.map(playerId => ({
        playerId,
        player: data.players[playerId],
        score: calculatePlayerScore(data.grid, playerId)
    })).sort((a, b) => b.score - a.score);

    elements.finalScoresList.innerHTML = '';
    scores.forEach((item, index) => {
        const playerIndex = data.playerOrder.indexOf(item.playerId);
        const div = document.createElement('div');
        div.className = `final-score-item player-${playerIndex + 1}`;

        if (item.playerId === data.winner) {
            div.classList.add('winner');
        }

        const medals = ['🥇', '🥈', '🥉', '4️⃣'];
        div.innerHTML = `
            <div class="final-score-position">${medals[index] || (index + 1)}</div>
            <div class="final-score-name">${item.player.name}</div>
            <div class="final-score-tiles">${item.score} tiles</div>
        `;

        elements.finalScoresList.appendChild(div);
    });

    stopTurnTimer();
}

async function leaveLobby() {
    if (currentRoom && currentPlayer) {
        // Remove player from room
        await update(ref(database, `territory/${currentRoom}`), {
            [`players/${currentPlayer}`]: null,
            playerOrder: null
        });

        // Get updated player order
        const roomSnapshot = await get(ref(database, `territory/${currentRoom}`));
        const data = roomSnapshot.val();

        if (data && data.players) {
            const remainingPlayers = Object.keys(data.players).filter(id => data.players[id]);

            if (remainingPlayers.length === 0) {
                // Delete room if empty
                await remove(ref(database, `territory/${currentRoom}`));
            } else {
                // Update player order
                await update(ref(database, `territory/${currentRoom}`), {
                    playerOrder: remainingPlayers
                });
            }
        }
    }

    if (roomListener) {
        roomListener();
        roomListener = null;
    }

    currentRoom = null;
    currentPlayer = null;
    playerNumber = null;

    showScreen('join');
}

async function playAgain() {
    if (currentRoom) {
        await remove(ref(database, `territory/${currentRoom}`));
    }

    if (roomListener) {
        roomListener();
        roomListener = null;
    }

    currentRoom = null;
    currentPlayer = null;
    playerNumber = null;

    showScreen('join');
}

function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    screens[screenName].classList.remove('hidden');
}

// Practice Mode - Solo testing
async function startPracticeMode() {
    try {
        alert('Practice mode clicked!'); // Immediate feedback
        debugLog('🎯 Practice mode button clicked!');

        const name = elements.playerName.value.trim() || 'You';
        debugLog('Player name: ' + name);

        savePlayerName();
        debugLog('Player name saved');

        const code = 'PRACTICE';
        currentRoom = code;
        playerNumber = 1;
        currentPlayer = 'player1';
        debugLog('Practice room variables set');

        const roomData = {
            code: code,
            created: Date.now(),
            gameState: 'playing',
            players: {
                player1: { name: name, score: 0 }
            },
            playerOrder: ['player1'],
            currentTurn: 'player1',
            turnNumber: 1,
            grid: {},
            winner: null,
            lastMove: null,
            practiceMode: true
        };
        debugLog('Room data created');

        debugLog('Writing to Firebase...');
        await set(ref(database, `territory/${code}`), roomData);
        debugLog('Firebase write complete');

        debugLog('Showing game screen...');
        showScreen('game');
        debugLog('Game screen shown');

        elements.gameRoomCode.textContent = 'PRACTICE';
        debugLog('Room code set to PRACTICE');

        debugLog('Starting room listener...');
        listenToRoom(code);
        debugLog('🎯 PRACTICE MODE READY - Test tile placement!');

    } catch (error) {
        alert('❌ Practice Mode Error: ' + error.message);
        debugLog('❌ ERROR: ' + error.message);
        console.error('Practice mode error:', error);
    }
}

// Add practice button listener
if (document.getElementById('practiceBtn')) {
    document.getElementById('practiceBtn').addEventListener('click', startPracticeMode);
}
