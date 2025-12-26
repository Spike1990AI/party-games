import { database, ref, set, onValue, update } from './firebase-battleships.js';

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

// DOM Elements
const joinScreen = document.getElementById('joinScreen');
const lobbyScreen = document.getElementById('lobbyScreen');
const questionScreen = document.getElementById('questionScreen');
const resultsScreen = document.getElementById('resultsScreen');
const finalScreen = document.getElementById('finalScreen');

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

// Create Room
document.getElementById('createRoomBtn').addEventListener('click', async () => {
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
    lobbyScreen.classList.add('hidden');
    resultsScreen.classList.add('hidden');
    questionScreen.classList.remove('hidden');

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
    document.getElementById('waitingForAnswers').classList.add('hidden');

    // Listen for all answers submitted
    const roomRef = ref(database, `rooms/${roomCode}`);
    onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        const answers = data.answers || {};
        const players = data.players || {};
        const playerCount = Object.keys(players).length;
        const answerCount = Object.keys(answers).length;

        // Update submitted players
        if (answerCount > 0) {
            const submittedList = document.getElementById('submittedPlayers');
            submittedList.innerHTML = '';

            Object.values(answers).forEach(answer => {
                const tag = document.createElement('span');
                tag.className = 'submitted-tag';
                tag.textContent = answer.playerName;
                submittedList.appendChild(tag);
            });
        }

        // Show results when all answered
        if (answerCount === playerCount && answerCount > 0 && data.gameState === 'playing') {
            setTimeout(() => showResults(data), 2000);
        }
    });
}

// Submit Answer
document.getElementById('submitAnswer').addEventListener('click', async () => {
    const answer = document.getElementById('answerInput').value.trim().toLowerCase();

    if (!answer) {
        alert('Please enter an answer');
        return;
    }

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

    await update(roomRef, { answers });

    // Disable input
    document.getElementById('answerInput').disabled = true;
    document.getElementById('submitAnswer').disabled = true;
    document.getElementById('waitingForAnswers').classList.remove('hidden');
});

// Show Results
function showResults(roomData) {
    questionScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');

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

    document.getElementById('majorityAnswer').textContent = majorityAnswer;

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
            <h4>${answer} ${isMajority ? '<span class="score-badge">+1 pt</span>' : ''}</h4>
            <p class="players">${playerNames}</p>
        `;

        allAnswersDiv.appendChild(div);
    });

    // Pink Cow logic
    const uniqueAnswers = Object.entries(answerGroups).filter(([_, list]) => list.length === 1);

    if (uniqueAnswers.length === 1) {
        const pinkCowPlayer = uniqueAnswers[0][1][0];
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

        update(ref(database, `rooms/${roomCode}`), {
            players: updatedPlayers
        });
    }

    // Listen for next round or game end (non-host players)
    if (!isHost) {
        const roomRef = ref(database, `rooms/${roomCode}`);
        const unsubscribe = onValue(roomRef, (snapshot) => {
            if (!snapshot.exists()) return;

            const data = snapshot.val();

            // Next round started (answers cleared)
            if (data.gameState === 'playing' && Object.keys(data.answers || {}).length === 0) {
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
        // Next round
        await update(roomRef, {
            currentRound: nextRound,
            answers: {}
        });
    }
});

// Listen for next round (non-host) - moved into showResults function to avoid conflicts

// Show Final Results
function showFinalResults(roomData) {
    resultsScreen.classList.add('hidden');
    questionScreen.classList.add('hidden');
    finalScreen.classList.remove('hidden');

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
