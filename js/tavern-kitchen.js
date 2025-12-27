// Tavern Kitchen Game Logic
import { database, ref, set, onValue, update, remove, get } from './firebase-tavern.js';

// Hide loading screen once Firebase is loaded
setTimeout(() => {
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('joinScreen').classList.remove('hidden');
}, 500);

// Game Configuration
const GRID_WIDTH = 8;
const GRID_HEIGHT = 6;
const GAME_DURATION = 180; // 3 minutes in seconds
const MAX_PLAYERS = 4;

// Game State
let currentRoom = null;
let currentPlayer = null;
let playerNumber = null;
let roomListener = null;
let gameTimerInterval = null;

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
    ordersQueue: document.getElementById('ordersQueue'),
    kitchenGrid: document.getElementById('kitchenGrid'),
    scoreValue: document.getElementById('scoreValue'),
    timer: document.getElementById('timer'),

    finalScore: document.getElementById('finalScore'),
    ordersCompleted: document.getElementById('ordersCompleted'),
    ordersFailed: document.getElementById('ordersFailed'),
    rating: document.getElementById('rating'),
    ratingText: document.getElementById('ratingText'),
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

// Initialize
loadPlayerName();

function loadPlayerName() {
    const savedName = localStorage.getItem('tavern_playerName');
    if (savedName) {
        elements.playerName.value = savedName;
    }
}

function savePlayerName() {
    const name = elements.playerName.value.trim();
    if (name) {
        localStorage.setItem('tavern_playerName', name);
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

    // Initialize room data
    const roomData = {
        code: code,
        created: Date.now(),
        gameState: 'waiting',
        players: {
            player1: { name: name, ready: false }
        },
        playerOrder: ['player1'],
        positions: {},
        stations: initializeStations(),
        orders: {},
        score: 0,
        ordersCompleted: 0,
        ordersFailed: 0,
        gameTimer: GAME_DURATION
    };

    await set(ref(database, `tavern-kitchen/${code}`), roomData);
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
    const roomSnapshot = await get(ref(database, `tavern-kitchen/${code}`));
    if (!roomSnapshot.exists()) {
        alert('Room not found');
        return;
    }

    const roomData = roomSnapshot.val();
    const playerCount = roomData.playerOrder.length;

    if (playerCount >= MAX_PLAYERS) {
        alert('Room is full');
        return;
    }

    // Find next available player slot
    playerNumber = playerCount + 1;
    const playerKey = `player${playerNumber}`;
    currentPlayer = playerKey;
    currentRoom = code;

    // Add player to room
    await update(ref(database, `tavern-kitchen/${code}`), {
        [`players/${playerKey}`]: { name: name, ready: false },
        playerOrder: [...roomData.playerOrder, playerKey]
    });

    showScreen('lobby');
    elements.roomCode.textContent = code;
    listenToRoom(code);
}

function listenToRoom(code) {
    const roomRef = ref(database, `tavern-kitchen/${code}`);

    // Clean up previous listener
    if (roomListener) {
        roomListener();
    }

    roomListener = onValue(roomRef, (snapshot) => {
        if (!snapshot.exists()) {
            alert('Room no longer exists');
            leaveLobby();
            return;
        }

        const data = snapshot.val();

        if (data.gameState === 'waiting') {
            updateLobby(data);
        } else if (data.gameState === 'playing') {
            if (screens.game.classList.contains('hidden')) {
                showScreen('game');
                elements.gameRoomCode.textContent = code;
                initializeKitchen();
            }
            updateGame(data);
        } else if (data.gameState === 'finished') {
            showResults(data);
        }
    });
}

function updateLobby(data) {
    const playersList = elements.playersList;
    playersList.innerHTML = '';

    data.playerOrder.forEach((playerKey, index) => {
        const player = data.players[playerKey];
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-item';
        playerDiv.innerHTML = `
            <span>${index + 1}. ${player.name}</span>
            <span class="player-status">${player.ready ? '✓ Ready' : 'Waiting...'}</span>
        `;
        playersList.appendChild(playerDiv);
    });

    // Show start button only for player 1 when at least 2 players
    if (currentPlayer === 'player1' && data.playerOrder.length >= 2) {
        elements.startGameBtn.classList.remove('hidden');
    } else {
        elements.startGameBtn.classList.add('hidden');
    }
}

async function startGame() {
    if (currentPlayer !== 'player1') return;

    await update(ref(database, `tavern-kitchen/${currentRoom}`), {
        gameState: 'playing',
        gameStartTime: Date.now()
    });
}

function initializeStations() {
    // Initialize cooking stations, barrels, etc.
    return {
        'stove_2_2': { type: 'stove', contents: [], status: 'empty' },
        'stove_5_2': { type: 'stove', contents: [], status: 'empty' },
        'barrel_0_1': { type: 'barrel', ingredient: 'meat' },
        'barrel_7_1': { type: 'barrel', ingredient: 'bread' },
        'barrel_0_4': { type: 'barrel', ingredient: 'vegetables' },
        'barrel_7_4': { type: 'barrel', ingredient: 'vegetables' },
        'cart_4_0': { type: 'cart' },
        'well_2_5': { type: 'well' },
        'well_5_5': { type: 'well' },
        'table_3_3': { type: 'table', item: null },
        'table_4_3': { type: 'table', item: null }
    };
}

function initializeKitchen() {
    const grid = elements.kitchenGrid;
    grid.innerHTML = '';

    // Create 8x6 grid
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell floor';
            cell.dataset.x = x;
            cell.dataset.y = y;

            // Add stations based on layout
            const station = getStationAt(x, y);
            if (station) {
                cell.innerHTML = `<div class="station ${station.type} ${station.class || ''}">${station.emoji}</div>`;
            }

            grid.appendChild(cell);
        }
    }
}

function getStationAt(x, y) {
    // Kitchen layout mapping
    const layout = {
        '0,0': { type: 'wall', emoji: '🧱' },
        '7,0': { type: 'wall', emoji: '🧱' },
        '4,0': { type: 'cart', emoji: '🛒' },
        '0,1': { type: 'barrel', emoji: '🪵', class: 'meat' },
        '7,1': { type: 'barrel', emoji: '🪵', class: 'bread' },
        '2,2': { type: 'campfire', emoji: '🔥' },
        '5,2': { type: 'campfire', emoji: '🔥' },
        '3,3': { type: 'table', emoji: '🪑' },
        '4,3': { type: 'table', emoji: '🪑' },
        '0,4': { type: 'barrel', emoji: '🪵', class: 'vegetables' },
        '7,4': { type: 'barrel', emoji: '🪵', class: 'vegetables' },
        '0,5': { type: 'wall', emoji: '🧱' },
        '7,5': { type: 'wall', emoji: '🧱' },
        '2,5': { type: 'well', emoji: '🪣' },
        '5,5': { type: 'well', emoji: '🪣' }
    };

    const key = `${x},${y}`;
    return layout[key] || null;
}

function updateGame(data) {
    // Update score and timer
    elements.scoreValue.textContent = data.score;

    const timeRemaining = Math.max(0, data.gameTimer);
    elements.timer.textContent = timeRemaining;

    // Update timer styling
    if (timeRemaining <= 30) {
        elements.timer.classList.add('danger');
    } else if (timeRemaining <= 60) {
        elements.timer.classList.add('warning');
        elements.timer.classList.remove('danger');
    } else {
        elements.timer.classList.remove('warning', 'danger');
    }

    // Update orders queue
    updateOrders(data.orders);

    // Update player positions (will implement in Phase 3)
    // updatePlayerPositions(data.positions);
}

function updateOrders(orders) {
    const queue = elements.ordersQueue;
    queue.innerHTML = '';

    Object.entries(orders).forEach(([orderId, order]) => {
        if (order.status === 'active') {
            const card = document.createElement('div');
            card.className = 'order-card';

            const timeLeft = Math.max(0, Math.floor((order.expiresAt - Date.now()) / 1000));
            if (timeLeft <= 10) {
                card.classList.add('urgent');
            }

            card.innerHTML = `
                <div class="dish-name">${formatDishName(order.dish)}</div>
                <div class="time-remaining">${timeLeft}s</div>
            `;
            queue.appendChild(card);
        }
    });
}

function formatDishName(dish) {
    return dish.split('_').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function showResults(data) {
    showScreen('results');

    elements.finalScore.textContent = `${data.score} Points`;
    elements.ordersCompleted.textContent = `${data.ordersCompleted} orders completed`;
    elements.ordersFailed.textContent = `${data.ordersFailed} orders failed`;

    // Calculate rating
    const rating = calculateRating(data.score, data.ordersCompleted);
    elements.rating.textContent = rating.stars;
    elements.ratingText.textContent = rating.text;
}

function calculateRating(score, completed) {
    if (score >= 500) return { stars: '⭐⭐⭐⭐⭐', text: 'Legendary Chef!' };
    if (score >= 400) return { stars: '⭐⭐⭐⭐', text: 'Master Chef!' };
    if (score >= 300) return { stars: '⭐⭐⭐', text: 'Great Cook!' };
    if (score >= 200) return { stars: '⭐⭐', text: 'Getting Better!' };
    return { stars: '⭐', text: 'Keep Practicing!' };
}

async function leaveLobby() {
    if (roomListener) {
        roomListener();
        roomListener = null;
    }

    if (currentRoom && currentPlayer) {
        // Remove player from room
        await update(ref(database, `tavern-kitchen/${currentRoom}`), {
            [`players/${currentPlayer}`]: null,
            playerOrder: null
        });

        // If you were player 1 and only player, delete room
        const roomSnapshot = await get(ref(database, `tavern-kitchen/${currentRoom}`));
        if (roomSnapshot.exists()) {
            const data = roomSnapshot.val();
            const remainingPlayers = Object.values(data.players || {}).filter(p => p !== null);
            if (remainingPlayers.length === 0) {
                await remove(ref(database, `tavern-kitchen/${currentRoom}`));
            }
        }
    }

    currentRoom = null;
    currentPlayer = null;
    playerNumber = null;

    showScreen('join');
}

async function playAgain() {
    await leaveLobby();
}

function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    screens[screenName].classList.remove('hidden');
}
