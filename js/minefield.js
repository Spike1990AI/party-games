// Minefield Race Game Logic
import { database, ref, set, onValue, update, remove, get, cleanupOldRooms } from './firebase-minefield.js';

// Hide loading screen once Firebase is loaded
setTimeout(() => {
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('joinScreen').classList.remove('hidden');
}, 500);

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
let moveInProgress = false;

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
    lobbyHighScore: document.getElementById('lobbyHighScore'),
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

// High Score Functions
function getHighScore() {
    const saved = localStorage.getItem('minefield_highScore');
    return saved ? JSON.parse(saved) : null;
}

function saveHighScore(playerName, score, stats) {
    const highScore = {
        name: playerName,
        score: score,
        stats: stats,
        date: Date.now()
    };
    localStorage.setItem('minefield_highScore', JSON.stringify(highScore));
}

function calculateScore(player, won) {
    // Scoring formula:
    // - Row reached: 100 points per row
    // - Win bonus: +500
    // - Mine penalty: -50 per mine
    // - Move efficiency bonus: max 200 points (fewer moves = higher bonus)

    const rowScore = (player.highestRow || 0) * 100;
    const winBonus = won ? 500 : 0;
    const minePenalty = (player.minesHit || 0) * -50;

    // Move efficiency: 200 points if under 10 moves, scaled down
    const moves = player.moves || 0;
    const moveBonus = Math.max(0, 200 - (moves * 10));

    return rowScore + winBonus + minePenalty + moveBonus;
}

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
    // Prevent duplicate clicks
    if (elements.createRoomBtn.disabled) return;
    elements.createRoomBtn.disabled = true;
    elements.playerName.disabled = true;

    // Clean up old rooms before creating new one
    await cleanupOldRooms();

    const name = elements.playerName.value.trim();
    if (!name) {
        alert('Please enter your name');
        // Re-enable on failure
        elements.createRoomBtn.disabled = false;
        elements.playerName.disabled = false;
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
                ready: false,
                moves: 0,
                minesHit: 0,
                highestRow: 0
            }
        },
        playerOrder: ['player1'],
        currentTurn: 'player1',
        turnNumber: 1,
        mines: {},
        revealed: {},
        winner: null
    };

    await set(ref(database, `minefield/${code}`), roomData);
    currentPlayer = 'player1';

    showScreen('lobby');
    elements.roomCode.textContent = code;
    listenToRoom(code);
}

async function joinRoom() {
    // Prevent duplicate clicks
    if (elements.joinRoomConfirmBtn.disabled) return;
    elements.joinRoomConfirmBtn.disabled = true;
    elements.playerName.disabled = true;
    elements.roomCodeInput.disabled = true;

    // Clean up old rooms before joining
    await cleanupOldRooms();

    const name = elements.playerName.value.trim();
    const code = elements.roomCodeInput.value.trim().toUpperCase();

    if (!name) {
        alert('Please enter your name');
        // Re-enable on failure
        elements.joinRoomConfirmBtn.disabled = false;
        elements.playerName.disabled = false;
        elements.roomCodeInput.disabled = false;
        return;
    }

    if (!code || code.length !== 4) {
        alert('Please enter a valid 4-letter room code');
        // Re-enable on failure
        elements.joinRoomConfirmBtn.disabled = false;
        elements.playerName.disabled = false;
        elements.roomCodeInput.disabled = false;
        return;
    }

    savePlayerName();

    // Check if room exists
    const roomSnapshot = await get(ref(database, `minefield/${code}`));
    if (!roomSnapshot.exists()) {
        alert('Room not found');
        // Re-enable on failure
        elements.joinRoomConfirmBtn.disabled = false;
        elements.playerName.disabled = false;
        elements.roomCodeInput.disabled = false;
        return;
    }

    const roomData = roomSnapshot.val();

    // Check if game already started
    if (roomData.gameState !== 'waiting') {
        alert('Game already in progress');
        // Re-enable on failure
        elements.joinRoomConfirmBtn.disabled = false;
        elements.playerName.disabled = false;
        elements.roomCodeInput.disabled = false;
        return;
    }

    // Find available player slot
    const existingPlayers = roomData.playerOrder || [];
    if (existingPlayers.length >= 4) {
        alert('Room is full');
        // Re-enable on failure
        elements.joinRoomConfirmBtn.disabled = false;
        elements.playerName.disabled = false;
        elements.roomCodeInput.disabled = false;
        return;
    }

    playerNumber = existingPlayers.length + 1;
    currentPlayer = `player${playerNumber}`;
    currentRoom = code;

    // Add player to room
    const playerData = {
        name: name,
        position: { row: 0, col: START_POSITIONS[playerNumber - 1] },
        ready: false,
        moves: 0,
        minesHit: 0,
        highestRow: 0
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
    // Clean up any existing listener before creating new one
    if (roomListener) {
        roomListener();
        roomListener = null;
    }

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

    // Show high score in lobby
    const highScore = getHighScore();
    if (highScore) {
        elements.lobbyHighScore.innerHTML = `🏆 High Score: ${highScore.score} pts (${highScore.name})`;
        elements.lobbyHighScore.style.fontWeight = '600';
        elements.lobbyHighScore.style.color = '#fbbf24';
    } else {
        elements.lobbyHighScore.innerHTML = '';
    }

    // Button always visible - permission checked in startGame()
    elements.startGameBtn.classList.remove('hidden');
}

async function startGame() {
    if (!currentRoom) return;

    // Prevent duplicate clicks
    if (elements.startGameBtn.disabled) return;
    elements.startGameBtn.disabled = true;

    // Verify caller is room creator
    const roomSnapshot = await get(ref(database, `minefield/${currentRoom}`));
    const data = roomSnapshot.val();
    if (!data || data.playerOrder[0] !== currentPlayer) {
        alert('Only the room creator can start the game');
        // Re-enable on failure
        elements.startGameBtn.disabled = false;
        return;
    }

    // Generate mines
    const mines = generateMines(currentRoom);

    await update(ref(database, `minefield/${currentRoom}`), {
        gameState: 'playing',
        mines: mines,
        revealed: {}
    });

    showScreen('game');
    elements.gameRoomCode.textContent = currentRoom;
}

function generateMines(seed) {
    // Generate random mines with guaranteed path from bottom to top
    let mines = {};
    let attempts = 0;
    const maxAttempts = 100;
    const numMines = 12;

    while (attempts < maxAttempts) {
        mines = {};

        // Place random mines in rows 1-6 (skip start row 0 and finish row 7)
        while (Object.keys(mines).length < numMines) {
            const row = Math.floor(Math.random() * 6) + 1;
            const col = Math.floor(Math.random() * GRID_COLS);
            const key = `${row}_${col}`;
            mines[key] = true;
        }

        // Check if at least one path exists from bottom to top
        if (hasValidPath(mines)) {
            return mines;
        }

        attempts++;
    }

    // Fallback: return mines anyway (shouldn't happen often)
    return mines;
}

function hasValidPath(mines) {
    // BFS to check if any starting position can reach the top
    for (let startCol = 0; startCol < GRID_COLS; startCol++) {
        if (canReachTop(mines, 0, startCol)) {
            return true;
        }
    }
    return false;
}

function canReachTop(mines, startRow, startCol) {
    const visited = new Set();
    const queue = [[startRow, startCol]];
    visited.add(`${startRow}_${startCol}`);

    while (queue.length > 0) {
        const [row, col] = queue.shift();

        // Check if we reached the top
        if (row === GRID_ROWS - 1) {
            return true;
        }

        // Try all three upward moves: up-left, up, up-right
        const moves = [
            [row + 1, col - 1], // up-left
            [row + 1, col],     // up
            [row + 1, col + 1]  // up-right
        ];

        for (const [newRow, newCol] of moves) {
            // Check bounds
            if (newRow < 0 || newRow >= GRID_ROWS || newCol < 0 || newCol >= GRID_COLS) {
                continue;
            }

            const key = `${newRow}_${newCol}`;

            // Skip if mine or already visited
            if (mines[key] || visited.has(key)) {
                continue;
            }

            visited.add(key);
            queue.push([newRow, newCol]);
        }
    }

    return false;
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

    // Debug mode: press 'M' key to see all mines
    const debugMode = window.debugMines || false;

    for (let row = GRID_ROWS - 1; row >= 0; row--) {
        for (let col = 0; col < GRID_COLS; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            const cellKey = `${row}_${col}`;

            // Mark special rows
            if (row === 0) cell.classList.add('start-row');
            if (row === GRID_ROWS - 1) cell.classList.add('finish-row');

            // Show revealed mines
            if (data.revealed && data.revealed[cellKey]) {
                cell.classList.add('revealed-mine');
            }

            // Debug: show all mines if debugMode is on
            if (debugMode && data.mines && data.mines[cellKey]) {
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
    // Prevent simultaneous moves
    if (moveInProgress) return;
    moveInProgress = true;

    if (!currentRoom || !currentPlayer) {
        alert('DEBUG: No room or player');
        moveInProgress = false;
        return;
    }

    const roomSnapshot = await get(ref(database, `minefield/${currentRoom}`));
    const data = roomSnapshot.val();

    // Verify it's our turn
    if (data.currentTurn !== currentPlayer) {
        alert(`DEBUG: Not your turn! Current: ${data.currentTurn}, You: ${currentPlayer}`);
        moveInProgress = false;
        return;
    }

    const currentPos = data.players[currentPlayer].position;
    const newRow = currentPos.row + rowDelta;
    const newCol = currentPos.col + colDelta;

    // Validate move (stay in bounds)
    if (newRow < 0 || newRow >= GRID_ROWS || newCol < 0 || newCol >= GRID_COLS) {
        alert(`DEBUG: Out of bounds! Row: ${newRow}, Col: ${newCol}`);
        moveInProgress = false;
        return;
    }

    // Check for mine using object key lookup
    const mineKey = `${newRow}_${newCol}`;
    const hitMine = data.mines && data.mines[mineKey] === true;

    const currentPlayerData = data.players[currentPlayer];
    const newMoves = (currentPlayerData.moves || 0) + 1;

    if (hitMine) {
        // Reveal mine by adding to revealed object
        await update(ref(database, `minefield/${currentRoom}/revealed/${mineKey}`), true);

        // Reset player position to start and increment mines hit
        await update(ref(database, `minefield/${currentRoom}/players/${currentPlayer}`), {
            position: { row: 0, col: currentPos.col },
            moves: newMoves,
            minesHit: (currentPlayerData.minesHit || 0) + 1
        });
    } else {
        // Move player and update stats
        const newHighestRow = Math.max(newRow, currentPlayerData.highestRow || 0);
        await update(ref(database, `minefield/${currentRoom}/players/${currentPlayer}`), {
            position: { row: newRow, col: newCol },
            moves: newMoves,
            highestRow: newHighestRow
        });
    }

    // Check for win
    if (newRow === GRID_ROWS - 1 && !hitMine) {
        await update(ref(database, `minefield/${currentRoom}`), {
            gameState: 'finished',
            winner: currentPlayer
        });
        moveInProgress = false;
        return;
    }

    // Next turn
    await nextTurn();

    // Re-enable moves after completion
    moveInProgress = false;
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

    // Calculate scores for all players
    const rankings = data.playerOrder
        .map(playerId => {
            const player = data.players[playerId];
            const won = playerId === data.winner;
            const score = calculateScore(player, won);
            return {
                id: playerId,
                player: player,
                score: score,
                won: won
            };
        })
        .sort((a, b) => b.score - a.score);

    // Check if this is a new high score (for winner in solo mode)
    if (data.playerOrder.length === 1 && rankings.length > 0) {
        const playerScore = rankings[0];
        const currentHighScore = getHighScore();

        if (!currentHighScore || playerScore.score > currentHighScore.score) {
            saveHighScore(
                playerScore.player.name,
                playerScore.score,
                {
                    moves: playerScore.player.moves,
                    minesHit: playerScore.player.minesHit,
                    highestRow: playerScore.player.highestRow,
                    won: playerScore.won
                }
            );
        }
    }

    // Display rankings with scores
    elements.rankingsList.innerHTML = '';
    rankings.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'ranking-item';

        const positionClass = index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : '';

        div.innerHTML = `
            <div class="ranking-position ${positionClass}">${index + 1}</div>
            <div class="ranking-player">
                <div style="font-weight: 600;">${item.player.name}</div>
                <div style="font-size: 0.85rem; color: #a0aec0;">
                    ${item.score} pts • Row ${(item.player.highestRow || 0) + 1} • ${item.player.moves || 0} moves • ${item.player.minesHit || 0} mines
                </div>
            </div>
        `;

        elements.rankingsList.appendChild(div);
    });

    // Show high score for solo mode
    if (data.playerOrder.length === 1) {
        const highScore = getHighScore();
        if (highScore) {
            const highScoreDiv = document.createElement('div');
            highScoreDiv.style.marginTop = '20px';
            highScoreDiv.style.padding = '15px';
            highScoreDiv.style.background = 'rgba(251, 191, 36, 0.1)';
            highScoreDiv.style.borderRadius = '8px';
            highScoreDiv.style.border = '1px solid rgba(251, 191, 36, 0.3)';
            highScoreDiv.innerHTML = `
                <div style="text-align: center; color: #fbbf24; font-weight: 700; margin-bottom: 5px;">🏆 HIGH SCORE</div>
                <div style="text-align: center; font-size: 1.5rem; font-weight: 700; color: #fff;">${highScore.score} pts</div>
                <div style="text-align: center; font-size: 0.85rem; color: #a0aec0;">${highScore.name}</div>
            `;
            elements.rankingsList.appendChild(highScoreDiv);
        }
    }

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
