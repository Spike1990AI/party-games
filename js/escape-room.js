import { database, ref, set, onValue, update, cleanupOldRooms } from './firebase-battleships.js';

// Game state
let roomCode = null;
let playerName = null;
let playerRole = null;
let isHost = false;
let timerInterval = null;
let lastRoomNumber = null; // Track current room to prevent input clearing
let selectedScenario = null; // Currently selected scenario
let ROOMS = []; // Will be loaded from selected scenario
const GAME_DURATION = 35 * 60; // 35 minutes in seconds (mobile-friendly timing)
const TOTAL_ROOMS = 8; // 8 rooms per scenario

// Firebase listener tracking for cleanup
let lobbyUnsubscribe = null;
let gameUnsubscribe = null;

// Centralized screen management
let currentScreen = 'join';
const screens = ['joinScreen', 'lobbyScreen', 'gameScreen', 'victoryScreen', 'failureScreen'];

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

// Player roles
const ROLES = [
    { id: 'scout', icon: '🔍', name: 'The Scout', description: 'You see the building layout and security patterns' },
    { id: 'hacker', icon: '💻', name: 'The Hacker', description: 'You have access to digital security codes' },
    { id: 'insider', icon: '🎭', name: 'The Insider', description: 'You know the museum staff and their routines' },
    { id: 'safecracker', icon: '🔓', name: 'The Safecracker', description: 'You understand locks and vault mechanisms' }
];

// Scenario Selection
document.querySelectorAll('.scenario-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        selectedScenario = btn.dataset.scenario;
        ROOMS = window.SCENARIOS[selectedScenario].rooms;
        
        // Update title
        document.querySelector('#joinScreen h1').textContent = window.SCENARIOS[selectedScenario].emoji + ' ' + window.SCENARIOS[selectedScenario].name;
        document.querySelector('#joinScreen .subtitle').textContent = window.SCENARIOS[selectedScenario].description;
        
        // Show room section
        document.getElementById('roomSection').classList.remove('hidden');
        document.querySelector('.scenario-selection').style.display = 'none';
    });
});


// Room puzzles - each player gets different clues

// DOM Elements
const joinScreen = document.getElementById('joinScreen');
const lobbyScreen = document.getElementById('lobbyScreen');
const gameScreen = document.getElementById('gameScreen');
const victoryScreen = document.getElementById('victoryScreen');
const failureScreen = document.getElementById('failureScreen');

// Generate room code
function generateRoomCode() {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += letters[Math.floor(Math.random() * letters.length)];
    }
    return code;
}

// Create Room
document.getElementById('createRoomBtn').addEventListener('click', async () => {
    const createBtn = document.getElementById('createRoomBtn');

    // Prevent duplicate clicks
    if (createBtn.disabled) return;
    createBtn.disabled = true;

    try {
        // Clean up old rooms before creating new one
        await cleanupOldRooms();

        roomCode = generateRoomCode();
        isHost = true;

        const roomData = {
            code: roomCode,
            host: null,
            created: Date.now(),
            players: {},
            gameState: 'lobby',
            currentRoom: 1,
            timeRemaining: GAME_DURATION,
            hintsUsed: 0,
            maxHints: 5, // Increased for mobile play
            startTime: null
        };

        await set(ref(database, `rooms/${roomCode}`), roomData);

        document.getElementById('codeDisplay').textContent = roomCode;
        document.getElementById('roomCode').classList.remove('hidden');

        setTimeout(() => showLobby(), 1500);
    } catch (error) {
        console.error('Create room error:', error);
        createBtn.disabled = false;
        alert('Failed to create room. Please try again.');
    }
});

// Join Room
document.getElementById('joinRoomBtn').addEventListener('click', async () => {
    const joinBtn = document.getElementById('joinRoomBtn');
    const codeInput = document.getElementById('roomCodeInput');

    // Prevent duplicate clicks
    if (joinBtn.disabled) return;

    const code = codeInput.value.toUpperCase();
    if (code.length !== 4) {
        alert('Please enter a 4-letter code');
        return;
    }

    // Disable during operation
    joinBtn.disabled = true;
    codeInput.disabled = true;

    try {
        // Clean up old rooms before joining
        await cleanupOldRooms();

        roomCode = code;

        const roomRef = ref(database, `rooms/${roomCode}`);
        onValue(roomRef, (snapshot) => {
            if (snapshot.exists()) {
                showLobby();
            } else {
                alert('Room not found!');
                // Re-enable on failure
                joinBtn.disabled = false;
                codeInput.disabled = false;
            }
        }, { onlyOnce: true });
    } catch (error) {
        console.error('Join room error:', error);
        joinBtn.disabled = false;
        codeInput.disabled = false;
        alert('Failed to join room. Please try again.');
    }
});

// Show Lobby
function showLobby() {
    showScreen('lobbyScreen');

    // Clean up any existing lobby listener
    if (lobbyUnsubscribe) {
        lobbyUnsubscribe();
        lobbyUnsubscribe = null;
    }

    document.getElementById('roomCodeLobby').textContent = roomCode;

    // Listen for player updates
    const roomRef = ref(database, `rooms/${roomCode}`);
    lobbyUnsubscribe = onValue(roomRef, (snapshot) => {
        if (!snapshot.exists()) return;

        const data = snapshot.val();
        const players = data.players || {};
        const playerCount = Object.keys(players).length;

        document.getElementById('playerCount').textContent = playerCount;

        // Update players list
        const playersList = document.getElementById('playersList');
        playersList.innerHTML = '';

        Object.entries(players).forEach(([id, player]) => {
            const div = document.createElement('div');
            div.className = `player-item${player.isHost ? ' host' : ''}`;
            div.innerHTML = `
                ${player.role ? ROLES.find(r => r.id === player.role).icon : '👤'} ${player.name}
                ${player.isHost ? '<span class="badge">HOST</span>' : ''}
            `;
            playersList.appendChild(div);
        });

        // Show role if assigned
        const myPlayer = Object.values(players).find(p => p.name === playerName);
        if (myPlayer && myPlayer.role) {
            const role = ROLES.find(r => r.id === myPlayer.role);
            document.getElementById('roleIcon').textContent = role.icon;
            document.getElementById('roleName').textContent = role.name;
            document.getElementById('roleDescription').textContent = role.description;
            document.getElementById('roleAssignments').classList.remove('hidden');
        }

        // Show start button for host when 1+ players
        if (isHost && playerCount >= 1) {
            document.getElementById('startGameBtn').classList.remove('hidden');
            document.getElementById('waitingMessage').classList.add('hidden');
        } else if (!isHost) {
            document.getElementById('waitingMessage').classList.remove('hidden');
        }

        // Start game if triggered
        if (data.gameState === 'playing') {
            // Clean up lobby listener before transition
            if (lobbyUnsubscribe) {
                lobbyUnsubscribe();
                lobbyUnsubscribe = null;
            }
            showGame(data);
        }
    });
}

// Join Game
document.getElementById('joinGameBtn').addEventListener('click', async () => {
    const joinBtn = document.getElementById('joinGameBtn');
    const nameInput = document.getElementById('playerName');

    // Prevent duplicate clicks
    if (joinBtn.disabled) return;

    const name = nameInput.value.trim();
    if (!name) {
        alert('Please enter your name');
        return;
    }

    // Disable during operation
    joinBtn.disabled = true;
    nameInput.disabled = true;

    try {
        playerName = name;

        const roomRef = ref(database, `rooms/${roomCode}`);
        const snapshot = await new Promise((resolve) => {
            onValue(roomRef, resolve, { onlyOnce: true });
        });

        const data = snapshot.val();
        const players = data.players || {};

        if (Object.keys(players).length >= 4) {
            alert('Room is full (4 players maximum)');
            joinBtn.disabled = false;
            nameInput.disabled = false;
            return;
        }

        // Assign role
        const usedRoles = Object.values(players).map(p => p.role);
        const availableRole = ROLES.find(r => !usedRoles.includes(r.id));

        // Set host if first player
        if (Object.keys(players).length === 0) {
            isHost = true;
            await update(roomRef, { host: playerName });
        }

        // Add player
        const playerId = Date.now().toString();
        players[playerId] = {
            name: playerName,
            role: availableRole.id,
            isHost: isHost,
            id: playerId
        };

        await update(roomRef, { players });

        playerRole = availableRole.id;
        document.querySelector('.player-name-input').style.display = 'none';
    } catch (error) {
        console.error('Join game error:', error);
        joinBtn.disabled = false;
        nameInput.disabled = false;
        alert('Failed to join game. Please try again.');
    }
});

// Start Game
document.getElementById('startGameBtn').addEventListener('click', async () => {
    const startBtn = document.getElementById('startGameBtn');

    // Prevent duplicate clicks
    if (startBtn.disabled) return;
    startBtn.disabled = true;

    try {
        await update(ref(database, `rooms/${roomCode}`), {
            gameState: 'playing',
            startTime: Date.now()
        });
    } catch (error) {
        console.error('Start game error:', error);
        startBtn.disabled = false;
        alert('Failed to start game. Please try again.');
    }
});

// Show Game
function showGame(roomData) {
    showScreen('gameScreen');

    document.getElementById('roomCodeGame').textContent = roomCode;

    const currentRoom = ROOMS[roomData.currentRoom - 1];
    const players = roomData.players || {};
    const myPlayer = Object.values(players).find(p => p.name === playerName);

    // Update room info
    document.getElementById('currentRoom').textContent = roomData.currentRoom;
    document.getElementById('roomTitle').textContent = currentRoom.title;
    document.getElementById('roomDescription').textContent = currentRoom.description;

    // Show player's clues (distribute roles among fewer players)
    const playerArray = Object.values(players);
    const playerCount = playerArray.length;
    const myIndex = playerArray.findIndex(p => p.name === playerName);

    // Safety check: if player not found, default to first player
    const safeIndex = myIndex >= 0 ? myIndex : 0;

    // Calculate which roles this player should see
    const rolesPerPlayer = Math.ceil(ROLES.length / playerCount);
    const startRole = safeIndex * rolesPerPlayer;
    const endRole = Math.min(startRole + rolesPerPlayer, ROLES.length);
    const myRoles = ROLES.slice(startRole, endRole);

    // Display all clues for this player's roles
    let clueHtml = '';
    myRoles.forEach(role => {
        clueHtml += `<div class="clue-item"><strong>${role.icon} ${role.name}:</strong> ${currentRoom.clues[role.id]}</div>`;
    });

    document.getElementById('playerClue').innerHTML = clueHtml;

    // Update hints
    const hintsRemaining = roomData.maxHints - roomData.hintsUsed;
    document.getElementById('hintsRemaining').textContent = hintsRemaining;
    document.getElementById('useHintBtn').disabled = hintsRemaining === 0;

    // Start timer if host
    if (isHost && !timerInterval) {
        startTimer(roomData.timeRemaining);
    }

    // Show team clues

    if (lastRoomNumber !== roomData.currentRoom) {
        document.getElementById('answerInput').value = '';
        document.getElementById('hintDisplay').classList.add('hidden');
        lastRoomNumber = roomData.currentRoom;
    }

    // Clean up any existing game listener
    if (gameUnsubscribe) {
        gameUnsubscribe();
        gameUnsubscribe = null;
    }

    // Listen for room updates
    const roomRef = ref(database, `rooms/${roomCode}`);
    gameUnsubscribe = onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        // Update timer
        updateTimerDisplay(data.timeRemaining);

        // Check for victory
        if (data.currentRoom > TOTAL_ROOMS) {
            // Clean up game listener before transition
            if (gameUnsubscribe) {
                gameUnsubscribe();
                gameUnsubscribe = null;
            }
            showVictory(data);
        }

        // Check for failure
        if (data.timeRemaining <= 0 && data.gameState === 'playing') {
            // Clean up game listener before transition
            if (gameUnsubscribe) {
                gameUnsubscribe();
                gameUnsubscribe = null;
            }
            showFailure(data);
        }
    });
}

// Start Timer (host only)
function startTimer(initialTime) {
    let timeLeft = initialTime;

    timerInterval = setInterval(async () => {
        timeLeft--;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            await update(ref(database, `rooms/${roomCode}`), {
                gameState: 'failed',
                timeRemaining: 0
            });
            return;
        }

        await update(ref(database, `rooms/${roomCode}`), {
            timeRemaining: timeLeft
        });
    }, 1000);
}

// Update Timer Display
function updateTimerDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const display = `${minutes}:${secs.toString().padStart(2, '0')}`;

    const timerEl = document.getElementById('timer');
    timerEl.textContent = display;

    if (seconds < 120) {
        timerEl.classList.add('warning');
    }
}

// Update Team Clues (distribute roles among players)
function updateTeamClues(players, currentRoom) {
    const teamDiv = document.getElementById('teamCluesShared');
    teamDiv.innerHTML = '';

    const playerArray = Object.values(players);
    const playerCount = playerArray.length;
    const rolesPerPlayer = Math.ceil(ROLES.length / playerCount);

    playerArray.forEach((player, index) => {
        // Calculate which roles this player has
        const startRole = index * rolesPerPlayer;
        const endRole = Math.min(startRole + rolesPerPlayer, ROLES.length);
        const playerRoles = ROLES.slice(startRole, endRole);

        // Safety check: skip if no roles assigned
        if (playerRoles.length === 0) {
            return;
        }

        // Build clue HTML for all roles
        let clueText = '';
        playerRoles.forEach(role => {
            clueText += `<strong>${role.icon} ${role.name}:</strong> ${currentRoom.clues[role.id]}<br>`;
        });

        const div = document.createElement('div');
        div.className = 'shared-clue';
        div.innerHTML = `
            <div class="player-name">${playerRoles[0].icon} ${player.name}</div>
            <div class="clue-text">${clueText}</div>
        `;
        teamDiv.appendChild(div);
    });
}

// Submit Answer
document.getElementById('submitAnswer').addEventListener('click', async () => {
    const submitBtn = document.getElementById('submitAnswer');
    const answerInput = document.getElementById('answerInput');

    // Prevent duplicate clicks
    if (submitBtn.disabled) return;

    const answer = answerInput.value.trim().toUpperCase().replace(/\s/g, '');

    if (!answer) {
        alert('Please enter an answer');
        return;
    }

    // Disable during operation
    submitBtn.disabled = true;
    answerInput.disabled = true;

    try {
        const roomRef = ref(database, `rooms/${roomCode}`);
        const snapshot = await new Promise((resolve) => {
            onValue(roomRef, resolve, { onlyOnce: true });
        });

        const data = snapshot.val();
        const currentRoom = ROOMS[data.currentRoom - 1];

        if (answer === currentRoom.answer.toUpperCase()) {
            // Correct answer!
            if (data.currentRoom >= TOTAL_ROOMS) {
                // Victory!
                await update(roomRef, {
                    gameState: 'victory',
                    currentRoom: 4
                });
            } else {
                // Next room
                await update(roomRef, {
                    currentRoom: data.currentRoom + 1
                });

                // Show success message
                alert('Code accepted! Moving to next room...');

                // Reload game with new room
                setTimeout(() => {
                    showGame({ ...data, currentRoom: data.currentRoom + 1 });
                }, 1000);
            }
        } else {
            alert('Incorrect code! Keep working together.');
            // Re-enable on incorrect answer
            submitBtn.disabled = false;
            answerInput.disabled = false;
        }
    } catch (error) {
        console.error('Submit answer error:', error);
        submitBtn.disabled = false;
        answerInput.disabled = false;
        alert('Failed to submit answer. Please try again.');
    }
});

// Use Hint
document.getElementById('useHintBtn').addEventListener('click', async () => {
    const hintBtn = document.getElementById('useHintBtn');

    // Prevent duplicate clicks
    if (hintBtn.disabled) return;
    hintBtn.disabled = true;

    try {
        const roomRef = ref(database, `rooms/${roomCode}`);
        const snapshot = await new Promise((resolve) => {
            onValue(roomRef, resolve, { onlyOnce: true });
        });

        const data = snapshot.val();

        if (data.hintsUsed >= data.maxHints) {
            alert('No hints remaining!');
            hintBtn.disabled = false;
            return;
        }

        const currentRoom = ROOMS[data.currentRoom - 1];

        document.getElementById('hintText').textContent = currentRoom.hint;
        document.getElementById('hintDisplay').classList.remove('hidden');

        await update(roomRef, {
            hintsUsed: data.hintsUsed + 1
        });

        document.getElementById('hintsRemaining').textContent = data.maxHints - (data.hintsUsed + 1);

        // Keep button disabled after use (hint already used)
    } catch (error) {
        console.error('Use hint error:', error);
        hintBtn.disabled = false;
        alert('Failed to use hint. Please try again.');
    }
});

// Show Victory
function showVictory(roomData) {
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    showScreen('victoryScreen');

    const timeTaken = GAME_DURATION - roomData.timeRemaining;
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;

    const timeLeft = roomData.timeRemaining;
    const minutesLeft = Math.floor(timeLeft / 60);
    const secondsLeft = timeLeft % 60;

    document.getElementById('timeRemaining').textContent = `${minutesLeft}:${secondsLeft.toString().padStart(2, '0')}`;
    document.getElementById('timeTaken').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('hintsUsed').textContent = `${roomData.hintsUsed}/${roomData.maxHints}`;
}

// Show Failure
function showFailure(roomData) {
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    showScreen('failureScreen');

    document.getElementById('roomsCompleted').textContent = roomData.currentRoom - 1;
}

// Play Again / Home
document.getElementById('playAgainBtn').addEventListener('click', () => location.reload());
document.getElementById('retryBtn').addEventListener('click', () => location.reload());
document.getElementById('homeBtn').addEventListener('click', () => location.href = 'index.html');
document.getElementById('homeBtn2').addEventListener('click', () => location.href = 'index.html');
