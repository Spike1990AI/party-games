import { database, ref, set, onValue, update, cleanupOldRooms } from './firebase-battleships.js';

// Hide loading screen once Firebase is loaded
setTimeout(() => {
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('joinScreen').classList.remove('hidden');
}, 500);

// Game state
let roomCode = null;
let gameMode = null; // '1v1' or '2v2'
let playerTeam = null;
let playerName = null;
let currentShip = null;
let shipOrientation = 'horizontal';
let shipsPlaced = [];

// Firebase listener tracking for cleanup
let playerSelectUnsubscribe = null;
let teamSelectUnsubscribe = null;
let gameStartUnsubscribe = null;
let battleUnsubscribe = null;

// Attack protection flag
let attackInProgress = false;

const SHIPS = [
    { name: 'Carrier', length: 5 },
    { name: 'Battleship', length: 4 },
    { name: 'Cruiser', length: 3 },
    { name: 'Submarine', length: 3 },
    { name: 'Destroyer', length: 2 }
];

// DOM Elements
const joinScreen = document.getElementById('joinScreen');
const teamScreen = document.getElementById('teamScreen');
const setupScreen = document.getElementById('setupScreen');
const battleScreen = document.getElementById('battleScreen');
const victoryScreen = document.getElementById('victoryScreen');

// Centralized screen management
let currentScreen = 'join';
const screens = ['joinScreen', 'teamScreen', 'setupScreen', 'battleScreen', 'victoryScreen'];

function showScreen(screenId) {
    // Prevent duplicate transitions
    if (currentScreen === screenId.replace('Screen', '')) {
        return;
    }

    // Hide all screens
    screens.forEach(id => {
        const screen = document.getElementById(id);
        if (screen) screen.classList.add('hidden');
    });

    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        currentScreen = screenId.replace('Screen', '');
    }
}

// Generate 4-letter room code
function generateRoomCode() {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += letters[Math.floor(Math.random() * letters.length)];
    }
    return code;
}

// Create Room - 1v1
document.getElementById('create1v1Btn').addEventListener('click', async () => {
    const btn = document.getElementById('create1v1Btn');
    if (btn.disabled) return;
    btn.disabled = true;
    document.getElementById('create2v2Btn').disabled = true;
    await createRoom('1v1');
});

// Create Room - 2v2
document.getElementById('create2v2Btn').addEventListener('click', async () => {
    const btn = document.getElementById('create2v2Btn');
    if (btn.disabled) return;
    btn.disabled = true;
    document.getElementById('create1v1Btn').disabled = true;
    await createRoom('2v2');
});

// Practice Mode
document.getElementById('practiceBtn').addEventListener('click', async () => {
    const btn = document.getElementById('practiceBtn');
    if (btn.disabled) return;
    btn.disabled = true;

    await cleanupOldRooms();

    playerName = 'You';
    playerTeam = 'team1';
    roomCode = 'PRACTICE';
    gameMode = '1v1';

    // Generate random enemy ships
    const enemyShips = generateRandomShips();

    const roomData = {
        code: 'PRACTICE',
        gameMode: '1v1',
        created: Date.now(),
        team1: { players: ['You'], ready: false, ships: [], hits: [] },
        team2: { players: ['Bot'], ready: true, ships: enemyShips, hits: [] },
        gameState: 'setup',
        currentTurn: 'team1',
        practiceMode: true
    };

    await set(ref(database, `rooms/PRACTICE`), roomData);
    showSetupScreen();
});

async function createRoom(mode) {
    // Clean up old rooms before creating new one
    await cleanupOldRooms();

    roomCode = generateRoomCode();
    gameMode = mode;

    const roomData = {
        code: roomCode,
        gameMode: mode,
        created: Date.now(),
        team1: { players: [], ready: false, ships: [], hits: [] },
        team2: { players: [], ready: false, ships: [], hits: [] },
        gameState: 'waiting',
        currentTurn: 'team1'
    };

    await set(ref(database, `rooms/${roomCode}`), roomData);

    document.getElementById('codeDisplay').textContent = roomCode;
    document.getElementById('roomCode').classList.remove('hidden');

    // Update share message based on mode
    const shareMessage = document.getElementById('shareMessage');
    if (mode === '1v1') {
        shareMessage.textContent = 'Share this with 1 other player';
    } else {
        shareMessage.textContent = 'Share this with 3 other players';
    }

    setTimeout(() => {
        if (mode === '1v1') {
            showPlayerSelect();
        } else {
            showTeamSelect();
        }
    }, 1500);
}

// Join Room
document.getElementById('joinRoomBtn').addEventListener('click', async () => {
    const joinBtn = document.getElementById('joinRoomBtn');
    const codeInput = document.getElementById('roomCodeInput');

    // Prevent duplicate clicks
    if (joinBtn.disabled) return;

    // Clean up old rooms before joining
    await cleanupOldRooms();

    const code = codeInput.value.toUpperCase();
    if (code.length !== 4) {
        alert('Please enter a 4-letter code');
        return;
    }

    // Disable during operation
    joinBtn.disabled = true;
    codeInput.disabled = true;

    roomCode = code;

    // Check if room exists
    const roomRef = ref(database, `rooms/${roomCode}`);
    onValue(roomRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            gameMode = data.gameMode;

            if (gameMode === '1v1') {
                showPlayerSelect();
            } else {
                showTeamSelect();
            }
            // Button stays disabled - user has moved to new screen
        } else {
            alert('Room not found!');
            // Re-enable on failure
            joinBtn.disabled = false;
            codeInput.disabled = false;
        }
    }, { onlyOnce: true });
});

// Show player select for 1v1
function showPlayerSelect() {
    showScreen('teamScreen');

    // Clean up any existing listener
    if (playerSelectUnsubscribe) {
        playerSelectUnsubscribe();
        playerSelectUnsubscribe = null;
    }

    // Show room code
    document.getElementById('roomCodeTeam').textContent = roomCode;

    // Hide team selection, show player names only
    document.querySelector('.team-select').style.display = 'none';

    // Show 1v1 join button
    const joinGameBtn = document.getElementById('joinGameBtn');
    joinGameBtn.style.display = 'block';

    const playerInput = document.getElementById('playerName');
    playerInput.placeholder = 'Enter your name';

    // Auto-assign to teams (first player = team1, second = team2)
    const roomRef = ref(database, `rooms/${roomCode}`);
    playerSelectUnsubscribe = onValue(roomRef, async (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const team1Count = data.team1.players.length;
            const team2Count = data.team2.players.length;

            if (team1Count === 0) {
                playerTeam = 'team1';
            } else if (team2Count === 0) {
                playerTeam = 'team2';
            } else {
                alert('Game is full (2/2 players)');
                return;
            }

            // Auto-join when name entered
            const name = playerInput.value.trim();
            if (name && !playerName) {
                playerName = name;
                const currentPlayers = data[playerTeam].players;
                currentPlayers.push(playerName);
                await set(ref(database, `rooms/${roomCode}/${playerTeam}/players`), currentPlayers);

                // Clean up listener before transition
                if (playerSelectUnsubscribe) {
                    playerSelectUnsubscribe();
                    playerSelectUnsubscribe = null;
                }
                showSetupScreen();
            }
        }
    });

    // Enter key to join
    playerInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            await join1v1Game();
        }
    });

    // Join button click handler
    joinGameBtn.addEventListener('click', async () => {
        await join1v1Game();
    });

    // Shared 1v1 join logic
    async function join1v1Game() {
        const name = playerInput.value.trim();
        if (!name) {
            alert('Please enter your name');
            return;
        }
        playerName = name;

        const snapshot = await new Promise((resolve) => {
            onValue(ref(database, `rooms/${roomCode}`), resolve, { onlyOnce: true });
        });
        const data = snapshot.val();
        const currentPlayers = data[playerTeam].players;
        currentPlayers.push(playerName);
        await set(ref(database, `rooms/${roomCode}/${playerTeam}/players`), currentPlayers);

        // Clean up listener before transition
        if (playerSelectUnsubscribe) {
            playerSelectUnsubscribe();
            playerSelectUnsubscribe = null;
        }
        showSetupScreen();
    }
}

// Show team select
function showTeamSelect() {
    showScreen('teamScreen');

    // Clean up any existing listener
    if (teamSelectUnsubscribe) {
        teamSelectUnsubscribe();
        teamSelectUnsubscribe = null;
    }

    // Show room code
    document.getElementById('roomCodeTeam').textContent = roomCode;

    // Listen for team updates
    const roomRef = ref(database, `rooms/${roomCode}`);
    teamSelectUnsubscribe = onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            document.getElementById('team1Count').textContent = `${data.team1.players.length}/2 players`;
            document.getElementById('team2Count').textContent = `${data.team2.players.length}/2 players`;

            // Disable full teams
            document.getElementById('team1Btn').disabled = data.team1.players.length >= 2;
            document.getElementById('team2Btn').disabled = data.team2.players.length >= 2;
        }
    });
}

// Join Team
document.getElementById('team1Btn').addEventListener('click', () => joinTeam('team1'));
document.getElementById('team2Btn').addEventListener('click', () => joinTeam('team2'));

async function joinTeam(team) {
    const team1Btn = document.getElementById('team1Btn');
    const team2Btn = document.getElementById('team2Btn');
    const playerInput = document.getElementById('playerName');

    // Prevent duplicate clicks
    if (team1Btn.disabled || team2Btn.disabled) return;

    playerName = playerInput.value.trim();
    if (!playerName) {
        alert('Please enter your name');
        return;
    }

    // Disable during operation
    team1Btn.disabled = true;
    team2Btn.disabled = true;
    playerInput.disabled = true;

    playerTeam = team;

    const roomRef = ref(database, `rooms/${roomCode}/${team}/players`);
    const playersSnapshot = await new Promise((resolve) => {
        onValue(roomRef, resolve, { onlyOnce: true });
    });

    const currentPlayers = playersSnapshot.val() || [];
    if (currentPlayers.length >= 2) {
        alert('This team is full!');
        // Re-enable on failure
        team1Btn.disabled = false;
        team2Btn.disabled = false;
        playerInput.disabled = false;
        return;
    }

    currentPlayers.push(playerName);
    await set(roomRef, currentPlayers);

    // Clean up listener before transition
    if (teamSelectUnsubscribe) {
        teamSelectUnsubscribe();
        teamSelectUnsubscribe = null;
    }
    // Buttons stay disabled - user has moved to new screen
    showSetupScreen();
}

// Setup Screen - Place Ships
function showSetupScreen() {
    showScreen('setupScreen');

    // Show room code
    document.getElementById('roomCodeSetup').textContent = roomCode;

    document.getElementById('yourTeam').textContent = playerTeam === 'team1' ? '🔵 1' : '🔴 2';

    createBoard('setupBoard', 10, handleSetupCellClick);

    // Ship selection
    document.querySelectorAll('.ship-item').forEach(item => {
        item.addEventListener('click', function() {
            if (this.classList.contains('placed')) return;

            document.querySelectorAll('.ship-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            const length = parseInt(this.dataset.length);
            currentShip = SHIPS.find(s => s.length === length && !shipsPlaced.some(sp => sp.name === s.name));
        });
    });
}

// Create board
function createBoard(containerId, size, clickHandler) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        cell.addEventListener('click', () => clickHandler(i, cell));
        container.appendChild(cell);
    }
}

// Handle setup cell click
function handleSetupCellClick(index) {
    if (!currentShip) {
        // Rotate if clicking empty space
        shipOrientation = shipOrientation === 'horizontal' ? 'vertical' : 'horizontal';
        return;
    }

    if (canPlaceShip(index, currentShip.length, shipOrientation)) {
        placeShip(index, currentShip.length, shipOrientation);

        shipsPlaced.push({
            name: currentShip.name,
            cells: getShipCells(index, currentShip.length, shipOrientation)
        });

        // Mark ship as placed
        document.querySelector(`.ship-item.active`).classList.add('placed');
        document.querySelector(`.ship-item.active`).classList.remove('active');

        currentShip = null;

        // Check if all ships placed
        if (shipsPlaced.length === SHIPS.length) {
            document.getElementById('readyBtn').disabled = false;
        }
    }
}

// Can place ship
function canPlaceShip(index, length, orientation) {
    const cells = getShipCells(index, length, orientation);
    if (!cells) return false;

    // Check if any cell already has a ship
    const board = document.getElementById('setupBoard');
    return cells.every(cellIndex => {
        const cell = board.children[cellIndex];
        return !cell.classList.contains('ship');
    });
}

// Get ship cells
function getShipCells(startIndex, length, orientation) {
    const row = Math.floor(startIndex / 10);
    const col = startIndex % 10;
    const cells = [];

    for (let i = 0; i < length; i++) {
        if (orientation === 'horizontal') {
            if (col + i >= 10) return null; // Out of bounds
            cells.push(startIndex + i);
        } else {
            if (row + i >= 10) return null; // Out of bounds
            cells.push(startIndex + (i * 10));
        }
    }

    return cells;
}

// Place ship on board
function placeShip(index, length, orientation) {
    const cells = getShipCells(index, length, orientation);
    const board = document.getElementById('setupBoard');

    cells.forEach(cellIndex => {
        board.children[cellIndex].classList.add('ship');
    });
}

// Generate random ships for AI
function generateRandomShips() {
    const ships = [];
    const occupied = new Set();

    for (const ship of SHIPS) {
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 100) {
            attempts++;
            const orientation = Math.random() > 0.5 ? 'horizontal' : 'vertical';
            const startCell = Math.floor(Math.random() * 100);
            const cells = getShipCells(startCell, ship.length, orientation);

            if (cells && !cells.some(c => occupied.has(c))) {
                cells.forEach(c => occupied.add(c));
                ships.push({ name: ship.name, length: ship.length, cells, orientation });
                placed = true;
            }
        }
    }

    return ships;
}

// Ready button
document.getElementById('readyBtn').addEventListener('click', async () => {
    const readyBtn = document.getElementById('readyBtn');

    // Prevent duplicate clicks
    if (readyBtn.disabled) return;
    readyBtn.disabled = true;

    // Save ships to database
    await set(ref(database, `rooms/${roomCode}/${playerTeam}/ships`), shipsPlaced);
    await set(ref(database, `rooms/${roomCode}/${playerTeam}/ready`), true);

    readyBtn.classList.add('hidden');
    document.getElementById('waitingMessage').classList.remove('hidden');

    // Clean up any existing game start listener BEFORE creating new one
    if (gameStartUnsubscribe) {
        gameStartUnsubscribe();
        gameStartUnsubscribe = null;
    }

    // Listen for game start
    const roomRef = ref(database, `rooms/${roomCode}`);
    gameStartUnsubscribe = onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.team1.ready && data.team2.ready) {
            // Clean up listener before transition
            if (gameStartUnsubscribe) {
                gameStartUnsubscribe();
                gameStartUnsubscribe = null;
            }
            startBattle(data);
        }
    });
});

// Start Battle
function startBattle(roomData) {
    showScreen('battleScreen');

    // Show room code
    document.getElementById('roomCodeBattle').textContent = roomCode;

    document.getElementById('battleTeam').textContent = playerTeam === 'team1' ? '🔵 1' : '🔴 2';

    // Create boards
    createBoard('attackBoard', 10, handleAttackCellClick);
    createBoard('defenseBoard', 10, () => {});

    // Show own ships
    const myTeam = roomData[playerTeam];
    const defenseBoard = document.getElementById('defenseBoard');
    myTeam.ships.forEach(ship => {
        ship.cells.forEach(index => {
            defenseBoard.children[index].classList.add('ship');
        });
    });

    // Clean up any existing battle listener
    if (battleUnsubscribe) {
        battleUnsubscribe();
        battleUnsubscribe = null;
    }

    // Listen for updates
    const roomRef = ref(database, `rooms/${roomCode}`);
    battleUnsubscribe = onValue(roomRef, (snapshot) => {
        updateBattleScreen(snapshot.val());
    });
}

// Update battle screen
function updateBattleScreen(roomData) {
    const isMyTurn = roomData.currentTurn === playerTeam;
    const turnIndicator = document.getElementById('turnIndicator');

    if (isMyTurn) {
        turnIndicator.textContent = 'Your turn - Fire!';
        turnIndicator.className = 'your-turn';
    } else {
        turnIndicator.textContent = "Enemy's turn...";
        turnIndicator.className = 'enemy-turn';
    }

    // Update hits on attack board
    const enemyTeam = playerTeam === 'team1' ? 'team2' : 'team1';
    const myHits = roomData[playerTeam].hits || [];
    const attackBoard = document.getElementById('attackBoard');

    myHits.forEach(hit => {
        const cell = attackBoard.children[hit.index];
        cell.classList.add(hit.result);
    });

    // Update hits on defense board
    const enemyHits = roomData[enemyTeam].hits || [];
    const defenseBoard = document.getElementById('defenseBoard');

    enemyHits.forEach(hit => {
        const cell = defenseBoard.children[hit.index];
        cell.classList.add(hit.result);
    });

    // Update ship counts
    const myShips = calculateRemainingShips(roomData[playerTeam].ships, enemyHits);
    const enemyShips = calculateRemainingShips(roomData[enemyTeam].ships, myHits);

    document.getElementById('yourShips').textContent = myShips;
    document.getElementById('enemyShips').textContent = enemyShips;

    // Check for victory
    if (enemyShips === 0) {
        showVictory(true);
    } else if (myShips === 0) {
        showVictory(false);
    }

    // AI attack in practice mode
    if (roomData.practiceMode && roomData.currentTurn === 'team2' && !isMyTurn) {
        setTimeout(() => performAIAttack(roomData), 1000);
    }
}

// AI attack for practice mode
async function performAIAttack(roomData) {
    // Find all cells that haven't been attacked yet
    const team2Hits = roomData.team2.hits || [];
    const attackedCells = new Set(team2Hits.map(h => h.index));
    const availableCells = [];

    for (let i = 0; i < 100; i++) {
        if (!attackedCells.has(i)) {
            availableCells.push(i);
        }
    }

    if (availableCells.length === 0) return;

    // Pick random cell
    const targetCell = availableCells[Math.floor(Math.random() * availableCells.length)];

    // Check if hit
    const team1Ships = roomData.team1.ships;
    const isHit = team1Ships.some(ship => ship.cells.includes(targetCell));

    // Update hits
    team2Hits.push({ index: targetCell, result: isHit ? 'hit' : 'miss' });

    // Update database
    await update(ref(database, `rooms/PRACTICE/team2`), { hits: team2Hits });
    await update(ref(database, `rooms/PRACTICE`), { currentTurn: 'team1' });
}

// Handle attack
async function handleAttackCellClick(index) {
    // Prevent simultaneous attacks
    if (attackInProgress) return;
    attackInProgress = true;

    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await new Promise((resolve) => {
        onValue(roomRef, resolve, { onlyOnce: true });
    });

    const roomData = snapshot.val();

    // Check if it's my turn
    if (roomData.currentTurn !== playerTeam) {
        attackInProgress = false;
        return;
    }

    // Check if already hit
    const myHits = roomData[playerTeam].hits || [];
    if (myHits.some(h => h.index === index)) {
        attackInProgress = false;
        return;
    }

    // Check if hit or miss
    const enemyTeam = playerTeam === 'team1' ? 'team2' : 'team1';
    const enemyShips = roomData[enemyTeam].ships;

    const isHit = enemyShips.some(ship => ship.cells.includes(index));

    myHits.push({ index, result: isHit ? 'hit' : 'miss' });

    // Update database
    await update(ref(database, `rooms/${roomCode}/${playerTeam}`), { hits: myHits });
    await update(ref(database, `rooms/${roomCode}`), {
        currentTurn: enemyTeam
    });

    // Re-enable attacks after completion
    attackInProgress = false;
}

// Calculate remaining ships
function calculateRemainingShips(ships, hits) {
    let remaining = 5;

    ships.forEach(ship => {
        const allHit = ship.cells.every(cellIndex =>
            hits.some(h => h.index === cellIndex && h.result === 'hit')
        );
        if (allHit) remaining--;
    });

    return remaining;
}

// Show victory
function showVictory(won) {
    // Clean up battle listener
    if (battleUnsubscribe) {
        battleUnsubscribe();
        battleUnsubscribe = null;
    }

    showScreen('victoryScreen');

    if (won) {
        document.getElementById('victoryTitle').textContent = '🎉 Victory!';
        document.getElementById('victoryMessage').textContent = `Team ${playerTeam === 'team1' ? '1' : '2'} wins! You sunk all enemy ships!`;
    } else {
        document.getElementById('victoryTitle').textContent = '💀 Defeated';
        document.getElementById('victoryMessage').textContent = 'Your fleet has been destroyed. Better luck next time!';
    }
}

// New game
document.getElementById('newGameBtn').addEventListener('click', () => {
    location.reload();
});

// Navigation functions
window.goBack = function(targetScreen) {
    if (targetScreen === 'joinScreen') {
        // Leave room and reset state
        leaveRoom();
        showScreen('joinScreen');
    } else if (targetScreen === 'teamScreen') {
        // Warn if ships are placed
        if (shipsPlaced.length > 0) {
            if (!confirm('Going back will clear your placed ships. Continue?')) {
                return;
            }
        }
        clearShips();
        showScreen('teamScreen');
    }
};

function leaveRoom() {
    // Clean up all Firebase listeners
    if (playerSelectUnsubscribe) {
        playerSelectUnsubscribe();
        playerSelectUnsubscribe = null;
    }
    if (teamSelectUnsubscribe) {
        teamSelectUnsubscribe();
        teamSelectUnsubscribe = null;
    }
    if (gameStartUnsubscribe) {
        gameStartUnsubscribe();
        gameStartUnsubscribe = null;
    }
    if (battleUnsubscribe) {
        battleUnsubscribe();
        battleUnsubscribe = null;
    }

    // Reset all game state
    roomCode = null;
    gameMode = null;
    playerTeam = null;
    playerName = null;
    shipsPlaced = [];
    currentShip = null;
    shipOrientation = 'horizontal';

    // Clear input fields
    document.getElementById('roomCodeInput').value = '';
    document.getElementById('playerName').value = '';
}

function clearShips() {
    // Reset ship placement
    shipsPlaced = [];
    currentShip = null;
    shipOrientation = 'horizontal';

    // Clear the setup board UI
    const setupBoard = document.getElementById('setupBoard');
    if (setupBoard) {
        const cells = setupBoard.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('ship');
        });
    }

    // Reset ship items
    const shipItems = document.querySelectorAll('.ship-item');
    shipItems.forEach(item => {
        item.classList.remove('placed');
    });

    // Disable ready button
    document.getElementById('readyBtn').disabled = true;
}

// Surrender function
window.surrender = async function() {
    if (!confirm('Are you sure you want to surrender? Your opponent will win.')) {
        return;
    }

    // Determine winner (opposite team)
    const winnerTeam = playerTeam === 'team1' ? 'team2' : 'team1';

    // Update Firebase to end game
    await update(ref(database, `rooms/${roomCode}`), {
        gameState: 'finished',
        winner: winnerTeam
    });

    // Show defeat screen
    showVictory(false);
    document.getElementById('victoryMessage').textContent = 'You surrendered. Better luck next time!';
};
