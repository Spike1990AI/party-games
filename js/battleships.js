import { database, ref, set, onValue, update } from './firebase-battleships.js';

// Game state
let roomCode = null;
let gameMode = null; // '1v1' or '2v2'
let playerTeam = null;
let playerName = null;
let currentShip = null;
let shipOrientation = 'horizontal';
let shipsPlaced = [];

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
document.getElementById('create1v1Btn').addEventListener('click', () => createRoom('1v1'));

// Create Room - 2v2
document.getElementById('create2v2Btn').addEventListener('click', () => createRoom('2v2'));

async function createRoom(mode) {
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
    const code = document.getElementById('roomCodeInput').value.toUpperCase();
    if (code.length !== 4) {
        alert('Please enter a 4-letter code');
        return;
    }

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
        } else {
            alert('Room not found!');
        }
    }, { onlyOnce: true });
});

// Show player select for 1v1
function showPlayerSelect() {
    joinScreen.classList.add('hidden');
    teamScreen.classList.remove('hidden');

    // Show room code
    document.getElementById('roomCodeTeam').textContent = roomCode;

    // Hide team selection, show player names only
    document.querySelector('.team-select').style.display = 'none';

    const playerInput = document.getElementById('playerName');
    playerInput.placeholder = 'Enter your name';

    // Auto-assign to teams (first player = team1, second = team2)
    const roomRef = ref(database, `rooms/${roomCode}`);
    onValue(roomRef, async (snapshot) => {
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
                showSetupScreen();
            }
        }
    });

    // Enter key to join
    playerInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
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
            showSetupScreen();
        }
    });
}

// Show team select
function showTeamSelect() {
    joinScreen.classList.add('hidden');
    teamScreen.classList.remove('hidden');

    // Show room code
    document.getElementById('roomCodeTeam').textContent = roomCode;

    // Listen for team updates
    const roomRef = ref(database, `rooms/${roomCode}`);
    onValue(roomRef, (snapshot) => {
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
    playerName = document.getElementById('playerName').value.trim();
    if (!playerName) {
        alert('Please enter your name');
        return;
    }

    playerTeam = team;

    const roomRef = ref(database, `rooms/${roomCode}/${team}/players`);
    const playersSnapshot = await new Promise((resolve) => {
        onValue(roomRef, resolve, { onlyOnce: true });
    });

    const currentPlayers = playersSnapshot.val() || [];
    if (currentPlayers.length >= 2) {
        alert('This team is full!');
        return;
    }

    currentPlayers.push(playerName);
    await set(roomRef, currentPlayers);

    showSetupScreen();
}

// Setup Screen - Place Ships
function showSetupScreen() {
    teamScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');

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

// Ready button
document.getElementById('readyBtn').addEventListener('click', async () => {
    // Save ships to database
    await set(ref(database, `rooms/${roomCode}/${playerTeam}/ships`), shipsPlaced);
    await set(ref(database, `rooms/${roomCode}/${playerTeam}/ready`), true);

    document.getElementById('readyBtn').classList.add('hidden');
    document.getElementById('waitingMessage').classList.remove('hidden');

    // Listen for game start
    const roomRef = ref(database, `rooms/${roomCode}`);
    onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (data.team1.ready && data.team2.ready) {
            startBattle(data);
        }
    });
});

// Start Battle
function startBattle(roomData) {
    setupScreen.classList.add('hidden');
    battleScreen.classList.remove('hidden');

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

    // Listen for updates
    const roomRef = ref(database, `rooms/${roomCode}`);
    onValue(roomRef, (snapshot) => {
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
}

// Handle attack
async function handleAttackCellClick(index) {
    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await new Promise((resolve) => {
        onValue(roomRef, resolve, { onlyOnce: true });
    });

    const roomData = snapshot.val();

    // Check if it's my turn
    if (roomData.currentTurn !== playerTeam) return;

    // Check if already hit
    const myHits = roomData[playerTeam].hits || [];
    if (myHits.some(h => h.index === index)) return;

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
    battleScreen.classList.add('hidden');
    victoryScreen.classList.remove('hidden');

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
