// Minefield Race Game Logic
import { database, ref, set, onValue, update, remove, get } from './firebase-minefield.js';

// Game Configuration
const GRID_ROWS = 8;
const GRID_COLS = 8;
const MINE_DENSITY = 0.2;
const TURN_TIMER = 10;
const START_POSITIONS = [1, 3, 5, 7]; // Starting columns for players 1-4

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
    gameGrid: document.getElementById('gameGrid'),
    moveButtons: document.getElementById('moveButtons'),
    moveUpLeftBtn: document.getElementById('moveUpLeftBtn'),
    moveUpBtn: document.getElementById('moveUpBtn'),
    moveUpRightBtn: document.getElementById('moveUpRightBtn'),
    mineCount: document.getElementById('mineCount'),
    playersStatus: document.getElementById('playersStatus'),

    winnerName: document.getElementById('winnerName'),
    rankingsList: document.getElementById('rankingsList'),
    playAgainBtn: document.getElementById('playAgainBtn')
};

// Event Listeners
elements.createRoomBtn.addEventListener('click', createRoom);
elements.joinRoomBtn.addEventListener('click', () => {
    elements.joinRoomInput.classList.toggle('hidden');
});
elements.joinRoomConfirmBtn.addEventListener('click', joinRoom);
elements.startGameBtn.addEventListener('click', startGame);
elements.leaveLobbyBtn.addEventListener('click', leaveLobby);
elements.playAgainBtn.addEventListener('click', playAgain);

elements.moveUpLeftBtn.addEventListener('click', () => makeMove(1, -1));
elements.moveUpBtn.addEventListener('click', () => makeMove(1, 0));
elements.moveUpRightBtn.addEventListener('click', () => makeMove(1, 1));

// Initialize
loadPlayerName();

// Hidden debug mode (dev only - press 'M' key to reveal mines)
window.debugMines = false;
document.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') {
        window.debugMines = !window.debugMines;
        // Re-render if game is active
        if (currentRoom) {
            get(ref(database, `minefield/${currentRoom}`)).then(snapshot => {
                const data = snapshot.val();
                if (data && data.gameState === 'playing') {
                    renderGrid(data);
                }
            });
        }
    }
});

function loadPlayerName() {
    const savedName = localStorage.getItem('minefield_playerName');
    if (savedName) {
        elements.playerName.value = savedName;
    }
}

function savePlayerName() {
    const name = elements.playerName.value.trim();
    if (name) {
        localStorage.setItem('minefield_playerName', name);
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
                position: { row: 0, col: START_POSITIONS[0] },
                ready: false
            }
        },
        playerOrder: ['player1'],
        currentTurn: 'player1',
        turnNumber: 1,
        mines: [],
        revealed: [],
        winner: null
    };

    await set(ref(database, `minefield/${code}`), roomData);
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
    const roomSnapshot = await get(ref(database, `minefield/${code}`));
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
        position: { row: 0, col: START_POSITIONS[playerNumber - 1] },
        ready: false
    };

    await update(ref(database, `minefield/${code}`), {
        [`players/${currentPlayer}`]: playerData,
        playerOrder: [...existingPlayers, currentPlayer]
    });

    showScreen('lobby');
    elements.roomCode.textContent = code;
    listenToRoom(code);
}

function listenToRoom(code) {
    const roomRef = ref(database, `minefield/${code}`);

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

    // Generate mines
    const mines = generateMines(currentRoom);
    console.log(`💣 Generated ${mines.length} mines for room ${currentRoom}`);
    console.log('Mine positions:', mines);

    await update(ref(database, `minefield/${currentRoom}`), {
        gameState: 'playing',
        mines: mines,
        revealed: []
    });

    showScreen('game');
    elements.gameRoomCode.textContent = currentRoom;
}

function generateMines(seed) {
    // Seeded random based on room code
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }

    const seededRandom = () => {
        hash = (hash * 1103515245 + 12345) & 0x7fffffff;
        return hash / 0x7fffffff;
    };

    const mines = [];
    const totalCells = GRID_ROWS * GRID_COLS;
    const numMines = Math.floor(totalCells * MINE_DENSITY);

    while (mines.length < numMines) {
        const row = Math.floor(seededRandom() * GRID_ROWS);
        const col = Math.floor(seededRandom() * GRID_COLS);

        // Skip start and finish rows
        if (row === 0 || row === GRID_ROWS - 1) continue;

        // Skip if already a mine
        if (mines.some(m => m[0] === row && m[1] === col)) continue;

        mines.push([row, col]);
    }

    return mines;
}

function updateGame(data) {
    showScreen('game');
    elements.gameRoomCode.textContent = currentRoom;

    // Update mine count display
    const mineCount = data.mines?.length || 0;
    const revealedCount = data.revealed?.length || 0;
    elements.mineCount.textContent = `💣 ${mineCount} mines (${revealedCount} revealed)`;

    console.log(`🎮 Game update - Mines: ${mineCount}, Revealed: ${revealedCount}`);

    // Update turn indicator
    const currentTurnPlayer = data.players[data.currentTurn];
    elements.currentPlayerName.textContent = currentTurnPlayer.name;

    // Update timer
    if (data.currentTurn === currentPlayer) {
        startTurnTimer();
        enableMoveButtons();
    } else {
        stopTurnTimer();
        disableMoveButtons();
    }

    // Render grid
    renderGrid(data);

    // Update players status
    updatePlayersStatus(data);
}

function renderGrid(data) {
    const grid = elements.gameGrid;
    grid.innerHTML = '';

    // Debug mode: hold Shift to see all mines
    const debugMode = window.debugMines || false;

    for (let row = GRID_ROWS - 1; row >= 0; row--) {
        for (let col = 0; col < GRID_COLS; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            // Mark special rows
            if (row === 0) cell.classList.add('start-row');
            if (row === GRID_ROWS - 1) cell.classList.add('finish-row');

            // Show revealed mines
            if (data.revealed && data.revealed.some(m => m[0] === row && m[1] === col)) {
                cell.classList.add('revealed-mine');
            }

            // Debug: show all mines if debugMode is on
            if (debugMode && data.mines.some(m => m[0] === row && m[1] === col)) {
                cell.classList.add('has-mine');
                cell.style.opacity = '0.5';
            }

            // Add player markers
            data.playerOrder.forEach((playerId, index) => {
                const player = data.players[playerId];
                if (player.position.row === row && player.position.col === col) {
                    const marker = document.createElement('div');
                    marker.className = `player-marker player-${index + 1}`;
                    if (data.currentTurn === playerId) {
                        marker.classList.add('current-turn');
                    }
                    marker.textContent = player.name.charAt(0).toUpperCase();
                    cell.appendChild(marker);
                }
            });

            grid.appendChild(cell);
        }
    }
}

function updatePlayersStatus(data) {
    const status = elements.playersStatus;
    status.innerHTML = '';

    data.playerOrder.forEach((playerId, index) => {
        const player = data.players[playerId];
        const div = document.createElement('div');
        div.className = `player-status player-${index + 1}`;

        div.innerHTML = `
            <div class="player-status-icon player-${index + 1}">${player.name.charAt(0).toUpperCase()}</div>
            <div class="player-status-name">${player.name}</div>
            <div class="player-status-position">Row ${player.position.row + 1}</div>
        `;

        status.appendChild(div);
    });
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

function enableMoveButtons() {
    elements.moveUpLeftBtn.disabled = false;
    elements.moveUpBtn.disabled = false;
    elements.moveUpRightBtn.disabled = false;
}

function disableMoveButtons() {
    elements.moveUpLeftBtn.disabled = true;
    elements.moveUpBtn.disabled = true;
    elements.moveUpRightBtn.disabled = true;
}

async function makeMove(rowDelta, colDelta) {
    if (!currentRoom || !currentPlayer) return;

    const roomSnapshot = await get(ref(database, `minefield/${currentRoom}`));
    const data = roomSnapshot.val();

    // Verify it's our turn
    if (data.currentTurn !== currentPlayer) return;

    const currentPos = data.players[currentPlayer].position;
    const newRow = currentPos.row + rowDelta;
    const newCol = currentPos.col + colDelta;

    // Validate move (stay in bounds)
    if (newRow < 0 || newRow >= GRID_ROWS || newCol < 0 || newCol >= GRID_COLS) {
        return; // Silently ignore invalid moves
    }

    // Check for mine
    const hitMine = data.mines.some(m => m[0] === newRow && m[1] === newCol);

    if (hitMine) {
        // Reveal mine
        const newRevealed = [...(data.revealed || []), [newRow, newCol]];

        // Update revealed mines list
        await update(ref(database, `minefield/${currentRoom}`), {
            revealed: newRevealed
        });

        // Reset player position to start
        await update(ref(database, `minefield/${currentRoom}/players/${currentPlayer}`), {
            position: { row: 0, col: currentPos.col }
        });
    } else {
        // Move player
        await update(ref(database, `minefield/${currentRoom}/players/${currentPlayer}`), {
            position: { row: newRow, col: newCol }
        });
    }

    // Check for win
    if (newRow === GRID_ROWS - 1 && !hitMine) {
        await update(ref(database, `minefield/${currentRoom}`), {
            gameState: 'finished',
            winner: currentPlayer
        });
        return;
    }

    // Next turn
    await nextTurn();
}

async function nextTurn() {
    if (!currentRoom) return;

    const roomSnapshot = await get(ref(database, `minefield/${currentRoom}`));
    const data = roomSnapshot.val();

    const currentIndex = data.playerOrder.indexOf(data.currentTurn);
    const nextIndex = (currentIndex + 1) % data.playerOrder.length;
    const nextPlayer = data.playerOrder[nextIndex];

    await update(ref(database, `minefield/${currentRoom}`), {
        currentTurn: nextPlayer,
        turnNumber: data.turnNumber + 1
    });
}

function updateResults(data) {
    showScreen('results');

    const winnerPlayer = data.players[data.winner];
    elements.winnerName.textContent = winnerPlayer.name;

    // Create rankings based on final row positions
    const rankings = data.playerOrder
        .map(playerId => ({
            id: playerId,
            player: data.players[playerId]
        }))
        .sort((a, b) => b.player.position.row - a.player.position.row);

    elements.rankingsList.innerHTML = '';
    rankings.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'ranking-item';

        const positionClass = index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : '';

        div.innerHTML = `
            <div class="ranking-position ${positionClass}">${index + 1}</div>
            <div class="ranking-player">${item.player.name}</div>
            <div class="ranking-stats">Row ${item.player.position.row + 1}</div>
        `;

        elements.rankingsList.appendChild(div);
    });

    stopTurnTimer();
}

async function leaveLobby() {
    if (currentRoom && currentPlayer) {
        // Remove player from room
        await update(ref(database, `minefield/${currentRoom}`), {
            [`players/${currentPlayer}`]: null,
            playerOrder: null
        });

        // Get updated player order
        const roomSnapshot = await get(ref(database, `minefield/${currentRoom}`));
        const data = roomSnapshot.val();

        if (data && data.players) {
            const remainingPlayers = Object.keys(data.players).filter(id => data.players[id]);

            if (remainingPlayers.length === 0) {
                // Delete room if empty
                await remove(ref(database, `minefield/${currentRoom}`));
            } else {
                // Update player order
                await update(ref(database, `minefield/${currentRoom}`), {
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
        await remove(ref(database, `minefield/${currentRoom}`));
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
