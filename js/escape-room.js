import { database, ref, set, onValue, update, cleanupOldRooms } from './firebase-battleships.js';

// Game state
let roomCode = null;
let playerName = null;
let playerRole = null;
let isHost = false;
let timerInterval = null;
let lastRoomNumber = null; // Track current room to prevent input clearing
const GAME_DURATION = 35 * 60; // 35 minutes in seconds (mobile-friendly timing)

// Player roles
const ROLES = [
    { id: 'scout', icon: '🔍', name: 'The Scout', description: 'You see the building layout and security patterns' },
    { id: 'hacker', icon: '💻', name: 'The Hacker', description: 'You have access to digital security codes' },
    { id: 'insider', icon: '🎭', name: 'The Insider', description: 'You know the museum staff and their routines' },
    { id: 'safecracker', icon: '🔓', name: 'The Safecracker', description: 'You understand locks and vault mechanisms' }
];

// Room puzzles - each player gets different clues
const ROOMS = [
    {
        id: 1,
        title: 'Security Office',
        description: 'You\'ve entered through the ventilation shaft. Find the security code to disable the cameras.',
        answer: '7392',
        hint: 'Each player has one digit. Combine them in order: Scout → Hacker → Insider → Safecracker',
        clues: {
            scout: 'You see a note on the desk: "First digit of master code: 7"',
            hacker: 'The computer screen shows: "Second security digit = 3"',
            insider: 'A sticky note reads: "Remember - third number is 9"',
            safecracker: 'On the blueprint: "Final digit marked: 2"'
        }
    },
    {
        id: 2,
        title: 'Laser Grid Gallery',
        description: 'The diamond is behind a laser grid. Calculate the safe path coordinates.',
        answer: 'B4D2A3C1',
        hint: 'Each player has two coordinates. The path must spell "ESCAPE" when you connect the grid positions.',
        clues: {
            scout: 'Your map shows: "Start at B4, then move to D2"',
            hacker: 'Security logs indicate: "From D2, laser gap at A3"',
            insider: 'Guard schedule notes: "Pattern continues to C1 after A3"',
            safecracker: 'Blueprint reveals: "C1 is the final safe position before vault"'
        }
    },
    {
        id: 3,
        title: 'Vault Lock',
        description: 'The diamond vault requires a color-coded sequence. Each color represents a number.',
        answer: 'REDBLUEGREENYELLOW',
        hint: 'Colors represent the first letters of each player\'s role in alphabetical order',
        clues: {
            scout: 'You notice: "RED paint on the floor leads to the vault"',
            hacker: 'The system shows: "After RED comes BLUE in the sequence"',
            insider: 'Staff manual states: "GREEN follows BLUE in emergency protocol"',
            safecracker: 'Vault schematic: "Final color is YELLOW - sequence complete"'
        }
    }
];

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
});

// Join Room
document.getElementById('joinRoomBtn').addEventListener('click', async () => {
    // Clean up old rooms before joining
    await cleanupOldRooms();

    const code = document.getElementById('roomCodeInput').value.toUpperCase();
    if (code.length !== 4) {
        alert('Please enter a 4-letter code');
        return;
    }

    roomCode = code;

    const roomRef = ref(database, `rooms/${roomCode}`);
    onValue(roomRef, (snapshot) => {
        if (snapshot.exists()) {
            showLobby();
        } else {
            alert('Room not found!');
        }
    }, { onlyOnce: true });
});

// Show Lobby
function showLobby() {
    joinScreen.classList.add('hidden');
    lobbyScreen.classList.remove('hidden');

    document.getElementById('roomCodeLobby').textContent = roomCode;

    // Listen for player updates
    const roomRef = ref(database, `rooms/${roomCode}`);
    onValue(roomRef, (snapshot) => {
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
            showGame(data);
        }
    });
}

// Join Game
document.getElementById('joinGameBtn').addEventListener('click', async () => {
    const name = document.getElementById('playerName').value.trim();
    if (!name) {
        alert('Please enter your name');
        return;
    }

    playerName = name;

    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await new Promise((resolve) => {
        onValue(roomRef, resolve, { onlyOnce: true });
    });

    const data = snapshot.val();
    const players = data.players || {};

    if (Object.keys(players).length >= 4) {
        alert('Room is full (4 players maximum)');
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
});

// Start Game
document.getElementById('startGameBtn').addEventListener('click', async () => {
    await update(ref(database, `rooms/${roomCode}`), {
        gameState: 'playing',
        startTime: Date.now()
    });
});

// Show Game
function showGame(roomData) {
    lobbyScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

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
    updateTeamClues(players, currentRoom);

    // Only clear input when changing rooms, not on every update
    if (lastRoomNumber !== roomData.currentRoom) {
        document.getElementById('answerInput').value = '';
        document.getElementById('hintDisplay').classList.add('hidden');
        lastRoomNumber = roomData.currentRoom;
    }

    // Listen for room updates
    const roomRef = ref(database, `rooms/${roomCode}`);
    onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        // Update timer
        updateTimerDisplay(data.timeRemaining);

        // Check for victory
        if (data.currentRoom > 3) {
            showVictory(data);
        }

        // Check for failure
        if (data.timeRemaining <= 0 && data.gameState === 'playing') {
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
    const answer = document.getElementById('answerInput').value.trim().toUpperCase().replace(/\s/g, '');

    if (!answer) {
        alert('Please enter an answer');
        return;
    }

    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await new Promise((resolve) => {
        onValue(roomRef, resolve, { onlyOnce: true });
    });

    const data = snapshot.val();
    const currentRoom = ROOMS[data.currentRoom - 1];

    if (answer === currentRoom.answer.toUpperCase()) {
        // Correct answer!
        if (data.currentRoom >= 3) {
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
    }
});

// Use Hint
document.getElementById('useHintBtn').addEventListener('click', async () => {
    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await new Promise((resolve) => {
        onValue(roomRef, resolve, { onlyOnce: true });
    });

    const data = snapshot.val();

    if (data.hintsUsed >= data.maxHints) {
        alert('No hints remaining!');
        return;
    }

    const currentRoom = ROOMS[data.currentRoom - 1];

    document.getElementById('hintText').textContent = currentRoom.hint;
    document.getElementById('hintDisplay').classList.remove('hidden');

    await update(roomRef, {
        hintsUsed: data.hintsUsed + 1
    });

    document.getElementById('hintsRemaining').textContent = data.maxHints - (data.hintsUsed + 1);
});

// Show Victory
function showVictory(roomData) {
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    gameScreen.classList.add('hidden');
    victoryScreen.classList.remove('hidden');

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

    gameScreen.classList.add('hidden');
    failureScreen.classList.remove('hidden');

    document.getElementById('roomsCompleted').textContent = roomData.currentRoom - 1;
}

// Play Again / Home
document.getElementById('playAgainBtn').addEventListener('click', () => location.reload());
document.getElementById('retryBtn').addEventListener('click', () => location.reload());
document.getElementById('homeBtn').addEventListener('click', () => location.href = 'index.html');
document.getElementById('homeBtn2').addEventListener('click', () => location.href = 'index.html');
