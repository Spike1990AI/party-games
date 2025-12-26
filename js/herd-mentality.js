import { database, ref, set, onValue, update, safeUpdate, onDisconnect, cleanupOldRooms } from './firebase-battleships.js';

// Question Bank
const QUESTIONS = [
    "Name a fruit",
    "Name a country",
    "Name a color",
    "Name an animal you'd find on a farm",
    "Name something you eat for breakfast",
    "Name a day of the week",
    "Name a month of the year",
    "Name a sport",
    "Name a vegetable",
    "Name a car brand",
    "Name a pizza topping",
    "Name something cold",
    "Name something hot",
    "Name a type of weather",
    "Name a household pet",
    "Name a room in a house",
    "Name something you wear",
    "Name a drink",
    "Name a musical instrument",
    "Name a job",
    "Name a TV show",
    "Name a superhero",
    "Name something round",
    "Name something you find in a kitchen",
    "Name a flavor of ice cream",
    "Name a bird",
    "Name something with wheels",
    "Name a body part",
    "Name a type of tree",
    "Name something you find at the beach",
    "Name a type of shoe",
    "Name something that flies",
    "Name a dessert",
    "Name a holiday",
    "Name something made of wood"
];

// Game state
let roomCode = null;
let playerName = null;
let isHost = false;
let currentRound = 0;
const TOTAL_ROUNDS = 10;
let lobbyUnsubscribe = null; // Track lobby listener for cleanup

// DOM Elements
const joinScreen = document.getElementById('joinScreen');
const lobbyScreen = document.getElementById('lobbyScreen');
const questionScreen = document.getElementById('questionScreen');
const resultsScreen = document.getElementById('resultsScreen');
const finalScreen = document.getElementById('finalScreen');

// Centralized screen management
let currentScreen = 'join';
const screens = ['joinScreen', 'lobbyScreen', 'questionScreen', 'waitingScreen', 'resultsScreen', 'finalScreen'];

function showScreen(screenId) {
    if (currentScreen === screenId.replace('Screen', '')) return; // Prevent duplicate transitions

    screens.forEach(id => {
        const screen = document.getElementById(id);
        if (screen) screen.classList.add('hidden');
    });

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        currentScreen = screenId.replace('Screen', '');
    }
}

// Generate room code
function generateRoomCode() {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += letters[Math.floor(Math.random() * letters.length)];
    }
    return code;
}

// Shuffle questions
function shuffleQuestions() {
    const shuffled = [...QUESTIONS];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, TOTAL_ROUNDS);
}

// Capitalize first letter of string
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Create Room
document.getElementById('createRoomBtn').addEventListener('click', async () => {
    // Clean up old rooms before creating new one
    await cleanupOldRooms();

    roomCode = generateRoomCode();
    isHost = true;

    const gameQuestions = shuffleQuestions();

    const roomData = {
        code: roomCode,
        host: null,
        created: Date.now(),
        players: {},
        gameState: 'lobby',
        currentRound: 0,
        questions: gameQuestions,
        answers: {},
        pinkCowHolder: null
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
    // Clean up any existing lobby listener (prevents memory leak)
    if (lobbyUnsubscribe) {
        lobbyUnsubscribe();
        lobbyUnsubscribe = null;
    }

    showScreen('lobbyScreen');

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
                ${player.name}
                ${player.isHost ? '<span class="badge">HOST</span>' : ''}
            `;
            playersList.appendChild(div);
        });

        // Show start button for host
        if (isHost && playerCount >= 2) {
            document.getElementById('startGameBtn').classList.remove('hidden');
            document.getElementById('waitingMessage').classList.add('hidden');
        } else if (!isHost) {
            document.getElementById('waitingMessage').classList.remove('hidden');
        }

        // Start game if triggered
        if (data.gameState === 'playing') {
            lobbyUnsubscribe(); // Clean up BEFORE transitioning
            lobbyUnsubscribe = null;
            showQuestion(data);
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
        alert('Room is full (4/4 players)');
        return;
    }

    // Set host if first player
    if (Object.keys(players).length === 0) {
        isHost = true;
        await update(roomRef, { host: playerName });
    }

    // Add player
    const playerId = Date.now().toString();
    players[playerId] = {
        name: playerName,
        score: 0,
        isHost: isHost,
        id: playerId
    };

    await update(roomRef, { players });

    // Set up disconnect handling - marks player as disconnected if they leave
    const playerRef = ref(database, `rooms/${roomCode}/players/${playerId}`);
    onDisconnect(playerRef).update({
        connected: false,
        disconnectedAt: Date.now()
    });

    // Mark as connected
    await update(playerRef, { connected: true });

    // Verify host status from server (prevents race condition)
    const verifySnapshot = await new Promise((resolve) => {
        onValue(roomRef, resolve, { onlyOnce: true });
    });
    const verifiedData = verifySnapshot.val();
    isHost = verifiedData.host === playerName;

    document.querySelector('.player-name-input').style.display = 'none';
});

// Start Game
document.getElementById('startGameBtn').addEventListener('click', async () => {
    await update(ref(database, `rooms/${roomCode}`), {
        gameState: 'playing',
        currentRound: 0
    });
});

// Show Question
function showQuestion(roomData) {
    showScreen('questionScreen');

    document.getElementById('roomCodeQuestion').textContent = roomCode;

    const round = roomData.currentRound;
    const question = roomData.questions[round];

    document.getElementById('roundNumber').textContent = `${round + 1}/${TOTAL_ROUNDS}`;
    document.getElementById('question').textContent = question;

    // Show player info
    const players = roomData.players || {};
    const myPlayer = Object.values(players).find(p => p.name === playerName);

    if (myPlayer) {
        document.getElementById('playerNameDisplay').textContent = myPlayer.name;
        document.getElementById('scoreDisplay').textContent = `${myPlayer.score} pts`;

        // Show pink cow if this player has it
        if (roomData.pinkCowHolder === myPlayer.id) {
            document.getElementById('pinkCow').classList.remove('hidden');
        } else {
            document.getElementById('pinkCow').classList.add('hidden');
        }
    }

    // Reset answer input
    const answerInput = document.getElementById('answerInput');
    answerInput.value = '';
    answerInput.disabled = false;
    document.getElementById('submitAnswer').disabled = false;

    // Reset submitted status
    document.getElementById('answerCountDisplay').textContent = `0/${Object.keys(players).length}`;
    document.getElementById('submittedPlayers').innerHTML = '';
}

// Submit Answer
document.getElementById('submitAnswer').addEventListener('click', async () => {
    const submitBtn = document.getElementById('submitAnswer');
    const answerInput = document.getElementById('answerInput');

    // Prevent duplicate clicks
    if (submitBtn.disabled) return;

    const answer = answerInput.value.trim().toLowerCase();

    if (!answer) {
        alert('Please enter an answer');
        return;
    }

    // Disable immediately to prevent duplicate submissions
    submitBtn.disabled = true;
    answerInput.disabled = true;

    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await new Promise((resolve) => {
        onValue(roomRef, resolve, { onlyOnce: true });
    });

    const data = snapshot.val();
    const players = data.players || {};
    const myPlayer = Object.values(players).find(p => p.name === playerName);

    const answers = data.answers || {};
    answers[myPlayer.id] = {
        playerId: myPlayer.id,
        playerName: myPlayer.name,
        answer: answer
    };

    const success = await safeUpdate(roomRef, { answers });

    // Re-enable if update failed
    if (!success) {
        submitBtn.disabled = false;
        answerInput.disabled = false;
        return;
    }

    // Show waiting screen (inputs stay disabled)
    showWaitingScreen();
});

// Display Scoreboard
function displayScoreboard(players, answers, majorityAnswer) {
    const scoresDiv = document.getElementById('roundScores');
    scoresDiv.innerHTML = '';

    // Sort players by score (highest first)
    const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);
    const topScore = sortedPlayers[0]?.score || 0;

    sortedPlayers.forEach((player) => {
        const gotPoint = answers[player.id]?.answer === majorityAnswer;
        const div = document.createElement('div');
        div.className = `score-item${player.score === topScore ? ' leader' : ''}`;
        div.innerHTML = `
            <span class="player-name">${player.name}${gotPoint ? ' <span class="score-change">+1</span>' : ''}</span>
            <span class="score-value">${player.score} pts</span>
        `;
        scoresDiv.appendChild(div);
    });
}

// Show Waiting Screen (after submitting)
function showWaitingScreen() {
    showScreen('waitingScreen');

    document.getElementById('roomCodeWaiting').textContent = roomCode;

    // Listen for other players' answers
    const roomRef = ref(database, `rooms/${roomCode}`);
    let lastAnswerCount = 0;

    const unsubscribe = onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        const answers = data.answers || {};
        const players = data.players || {};
        const playerCount = Object.keys(players).length;
        const answerCount = Object.keys(answers).length;

        // Only update if answer count changed
        if (answerCount !== lastAnswerCount) {
            lastAnswerCount = answerCount;

            // Update count display
            document.getElementById('waitingCountDisplay').textContent = `${answerCount}/${playerCount}`;

            // Update submitted players list
            const waitingList = document.getElementById('waitingPlayersList');
            waitingList.innerHTML = '';

            Object.values(answers).forEach(answer => {
                const tag = document.createElement('span');
                tag.className = 'submitted-tag';
                tag.textContent = answer.playerName;
                waitingList.appendChild(tag);
            });
        }

        // Show results when all answered
        if (answerCount === playerCount && answerCount > 0 && data.gameState === 'playing') {
            unsubscribe(); // Clean up listener
            // Fetch fresh data to avoid stale closure
            setTimeout(async () => {
                const freshSnapshot = await new Promise((resolve) => {
                    onValue(roomRef, resolve, { onlyOnce: true });
                });
                showResults(freshSnapshot.val());
            }, 2000);
        }
    });
}

// Show Results
function showResults(roomData) {
    showScreen('resultsScreen');

    document.getElementById('roomCodeResults').textContent = roomCode;

    const answers = roomData.answers || {};
    const players = roomData.players || {};

    // Count answer frequencies
    const answerCounts = {};
    Object.values(answers).forEach(({ answer }) => {
        answerCounts[answer] = (answerCounts[answer] || 0) + 1;
    });

    // Find majority answer
    let majorityAnswer = '';
    let maxCount = 0;

    Object.entries(answerCounts).forEach(([answer, count]) => {
        if (count > maxCount) {
            maxCount = count;
            majorityAnswer = answer;
        }
    });

    document.getElementById('majorityAnswer').textContent = capitalizeFirst(majorityAnswer);

    // Group answers
    const answerGroups = {};
    Object.values(answers).forEach(({ playerId, playerName, answer }) => {
        if (!answerGroups[answer]) {
            answerGroups[answer] = [];
        }
        answerGroups[answer].push({ playerId, playerName });
    });

    // Display answers
    const allAnswersDiv = document.getElementById('allAnswers');
    allAnswersDiv.innerHTML = '';

    Object.entries(answerGroups).forEach(([answer, playerList]) => {
        const isMajority = answer === majorityAnswer;
        const isUnique = playerList.length === 1;

        const div = document.createElement('div');
        div.className = `answer-group${isMajority ? ' majority' : ''}${isUnique ? ' unique' : ''}`;

        const playerNames = playerList.map(p => p.playerName).join(', ');

        div.innerHTML = `
            <h4>${capitalizeFirst(answer)} ${isMajority ? '<span class="score-badge">+1 pt</span>' : ''}</h4>
            <p class="players">${playerNames}</p>
        `;

        allAnswersDiv.appendChild(div);
    });

    // Pink Cow logic - award to sole minority player
    const minorityPlayers = Object.values(answers).filter(a => a.answer !== majorityAnswer);

    // Give pink cow if there's ONLY ONE person not in the majority
    if (minorityPlayers.length === 1) {
        const pinkCowPlayer = minorityPlayers[0];
        document.getElementById('pinkCowAward').classList.remove('hidden');
        document.getElementById('pinkCowPlayer').textContent = pinkCowPlayer.playerName;

        // Update in database
        if (isHost) {
            update(ref(database, `rooms/${roomCode}`), {
                pinkCowHolder: pinkCowPlayer.playerId
            });
        }
    } else {
        document.getElementById('pinkCowAward').classList.add('hidden');

        // Clear pink cow
        if (isHost) {
            update(ref(database, `rooms/${roomCode}`), {
                pinkCowHolder: null
            });
        }
    }

    // Update scores (host only)
    if (isHost) {
        const updatedPlayers = { ...players };

        Object.values(answers).forEach(({ playerId, answer }) => {
            if (answer === majorityAnswer) {
                updatedPlayers[playerId].score += 1;
            }
        });

        safeUpdate(ref(database, `rooms/${roomCode}`), {
            players: updatedPlayers
        });

        // Display updated scoreboard
        displayScoreboard(updatedPlayers, answers, majorityAnswer);
    } else {
        // Non-host: display current scores
        displayScoreboard(players, answers, majorityAnswer);
    }

    // Show/hide Next Round button based on host status
    document.getElementById('nextRoundBtn').style.display = isHost ? 'block' : 'none';

    // Listen for next round or game end (all players)
    const roomRef = ref(database, `rooms/${roomCode}`);
    const currentRoundNum = roomData.currentRound;

    const unsubscribe = onValue(roomRef, (snapshot) => {
        if (!snapshot.exists()) return;

        const data = snapshot.val();

        // Next round started (round number increased)
        if (data.gameState === 'playing' && data.currentRound > currentRoundNum) {
            unsubscribe(); // Clean up this listener
            showQuestion(data);
        }

        // Game finished
        if (data.gameState === 'finished') {
            unsubscribe(); // Clean up this listener
            showFinalResults(data);
        }
    });
}

// Next Round
document.getElementById('nextRoundBtn').addEventListener('click', async () => {
    if (!isHost) return;

    const roomRef = ref(database, `rooms/${roomCode}`);
    const snapshot = await new Promise((resolve) => {
        onValue(roomRef, resolve, { onlyOnce: true });
    });

    const data = snapshot.val();
    const nextRound = data.currentRound + 1;

    if (nextRound >= TOTAL_ROUNDS) {
        // Game over
        await update(roomRef, {
            gameState: 'finished'
        });

        showFinalResults(data);
    } else {
        // Next round - all players will transition via listener in showResults
        await update(roomRef, {
            currentRound: nextRound,
            answers: {}
        });
    }
});

// Listen for next round (non-host) - moved into showResults function to avoid conflicts

// Show Final Results
function showFinalResults(roomData) {
    showScreen('finalScreen');

    const players = roomData.players || {};
    const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);

    const finalScoresDiv = document.getElementById('finalScores');
    finalScoresDiv.innerHTML = '';

    sortedPlayers.forEach((player, index) => {
        const div = document.createElement('div');
        div.className = `final-player${index === 0 ? ' winner' : ''}`;
        div.innerHTML = `
            <span class="name">${player.name}</span>
            <span class="score">${player.score} pts</span>
        `;
        finalScoresDiv.appendChild(div);
    });
}

// Play Again / Home
document.getElementById('playAgainBtn').addEventListener('click', () => location.reload());
document.getElementById('homeBtn').addEventListener('click', () => location.href = 'index.html');
