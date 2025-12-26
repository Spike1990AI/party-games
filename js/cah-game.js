// Cards Against Humanity - Game Logic with Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, onValue, update, remove, push, onDisconnect } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { BLACK_CARDS, WHITE_CARDS } from './cah-cards.js';

// Firebase configuration (reusing family-games project)
const firebaseConfig = {
    apiKey: "AIzaSyDlr4K-y7rjScWKzfX7g7OKGWJZwgGCuCA",
    authDomain: "family-games-f00e7.firebaseapp.com",
    databaseURL: "https://family-games-f00e7-default-rtdb.firebaseio.com",
    projectId: "family-games-f00e7",
    storageBucket: "family-games-f00e7.firebasestorage.app",
    messagingSenderId: "530647788546",
    appId: "1:530647788546:web:8c4af6e8f7e7bc8efad32f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Game state
let currentRoom = null;
let playerId = null;
let playerName = null;
let isHost = false;
let selectedWhiteCard = null;
let gameState = {};

// Constants
const HAND_SIZE = 7;
const MIN_PLAYERS = 3;
const MAX_PLAYERS = 8;

// Card pools (shuffled copies)
let blackCardDeck = [];
let whiteCardDeck = [];
let usedBlackCards = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    generatePlayerId();
});

function generatePlayerId() {
    playerId = 'player_' + Math.random().toString(36).substr(2, 9);
}

function initializeEventListeners() {
    // Room creation/joining
    document.getElementById('createRoomBtn').addEventListener('click', createRoom);
    document.getElementById('joinRoomBtn').addEventListener('click', joinRoom);
    document.getElementById('joinGameBtn').addEventListener('click', joinGameWithName);
    document.getElementById('startGameBtn').addEventListener('click', startGame);
    
    // Game actions
    document.getElementById('submitBtn').addEventListener('click', submitCard);
    document.getElementById('nextRoundBtn').addEventListener('click', nextRound);
    document.getElementById('playAgainBtn').addEventListener('click', playAgain);
    document.getElementById('backToMenuBtn').addEventListener('click', () => window.location.reload());
    
    // Allow enter key to join
    document.getElementById('roomCodeInput').addEventListener('keypress', e => {
        if (e.key === 'Enter') joinRoom();
    });
    document.getElementById('playerName').addEventListener('keypress', e => {
        if (e.key === 'Enter') joinGameWithName();
    });
}

function shuffleDeck(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function initializeDecks() {
    blackCardDeck = shuffleDeck(BLACK_CARDS);
    whiteCardDeck = shuffleDeck(WHITE_CARDS);
    usedBlackCards = [];
}

async function createRoom() {
    const winningScore = parseInt(document.getElementById('winningScore').value);
    const roomCode = generateRoomCode();
    currentRoom = roomCode;
    isHost = true;
    
    initializeDecks();
    
    // Create room in database
    await set(ref(database, `cah-rooms/${roomCode}`), {
        host: playerId,
        state: 'lobby',
        settings: { winningScore },
        players: {},
        round: 0,
        currentCzar: null,
        currentBlackCard: null,
        submissions: {},
        createdAt: Date.now()
    });
    
    // Show room code
    document.getElementById('codeDisplay').textContent = roomCode;
    document.getElementById('roomCode').classList.remove('hidden');
    
    // Switch to lobby
    showScreen('lobbyScreen');
    document.getElementById('roomCodeLobby').textContent = roomCode;
    document.getElementById('targetScoreLobby').textContent = winningScore;
    
    // Listen for changes
    listenToRoom(roomCode);
}

async function joinRoom() {
    const roomCode = document.getElementById('roomCodeInput').value.toUpperCase().trim();
    if (roomCode.length !== 4) {
        alert('Please enter a 4-letter code');
        return;
    }
    
    const roomRef = ref(database, `cah-rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) {
        alert('Room not found');
        return;
    }
    
    currentRoom = roomCode;
    const roomData = snapshot.val();
    
    // Check if room is full
    const playerCount = Object.keys(roomData.players || {}).length;
    if (playerCount >= MAX_PLAYERS) {
        alert('Room is full (8 players max)');
        return;
    }
    
    // Switch to lobby
    showScreen('lobbyScreen');
    document.getElementById('roomCodeLobby').textContent = roomCode;
    document.getElementById('targetScoreLobby').textContent = roomData.settings.winningScore;
    
    // Listen for changes
    listenToRoom(roomCode);
}

async function joinGameWithName() {
    const name = document.getElementById('playerName').value.trim();
    if (!name) {
        alert('Please enter your name');
        return;
    }
    
    playerName = name;
    
    // Add player to room
    const playerRef = ref(database, `cah-rooms/${currentRoom}/players/${playerId}`);
    await set(playerRef, {
        name: playerName,
        score: 0,
        hand: [],
        submitted: null,
        joinedAt: Date.now()
    });
    
    // Set up disconnect handler
    onDisconnect(playerRef).remove();
    
    document.querySelector('.player-name-input').classList.add('hidden');
}

function listenToRoom(roomCode) {
    const roomRef = ref(database, `cah-rooms/${roomCode}`);
    
    onValue(roomRef, (snapshot) => {
        if (!snapshot.exists()) {
            alert('Room closed');
            window.location.reload();
            return;
        }
        
        gameState = snapshot.val();
        updateUI();
    });
}

function updateUI() {
    const state = gameState.state;
    
    // Update player list
    updatePlayerList();
    
    if (state === 'lobby') {
        updateLobby();
    } else if (state === 'playing' || state === 'judging') {
        showGameScreen();
        updateGameScreen();
    } else if (state === 'roundEnd') {
        showRoundWinner();
    } else if (state === 'finished') {
        showGameOver();
    }
}

function updatePlayerList() {
    const players = gameState.players || {};
    const playerCount = Object.keys(players).length;
    document.getElementById('playerCount').textContent = playerCount;
    
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = '';
    
    Object.entries(players).forEach(([id, player]) => {
        const div = document.createElement('div');
        div.className = 'player-item';
        div.innerHTML = `
            <span class="player-name">${player.name}</span>
            <span class="player-score">${player.score} pts</span>
        `;
        if (id === gameState.host) {
            div.innerHTML += ' <span class="host-badge">👑 Host</span>';
        }
        playersList.appendChild(div);
    });
}

function updateLobby() {
    const playerCount = Object.keys(gameState.players || {}).length;
    const hasEnoughPlayers = playerCount >= MIN_PLAYERS;
    
    // Show/hide start button
    if (gameState.host === playerId) {
        document.getElementById('startGameBtn').classList.toggle('hidden', !hasEnoughPlayers);
        document.getElementById('waitingMessage').classList.add('hidden');
        document.getElementById('minimumPlayersMsg').classList.toggle('hidden', hasEnoughPlayers);
    } else {
        document.getElementById('startGameBtn').classList.add('hidden');
        document.getElementById('waitingMessage').classList.remove('hidden');
        document.getElementById('minimumPlayersMsg').classList.add('hidden');
    }
}

async function startGame() {
    if (gameState.host !== playerId) return;
    
    const players = gameState.players || {};
    const playerCount = Object.keys(players).length;
    
    if (playerCount < MIN_PLAYERS) {
        alert(`Need at least ${MIN_PLAYERS} players to start`);
        return;
    }
    
    // Initialize decks
    initializeDecks();
    
    // Deal initial hands
    const updates = {};
    Object.keys(players).forEach(id => {
        const hand = [];
        for (let i = 0; i < HAND_SIZE; i++) {
            hand.push(drawWhiteCard());
        }
        updates[`players/${id}/hand`] = hand;
        updates[`players/${id}/submitted`] = null;
    });
    
    // Set first czar (random)
    const playerIds = Object.keys(players);
    const firstCzar = playerIds[Math.floor(Math.random() * playerIds.length)];
    
    // Draw first black card
    const firstBlackCard = drawBlackCard();
    
    updates['state'] = 'playing';
    updates['round'] = 1;
    updates['currentCzar'] = firstCzar;
    updates['currentBlackCard'] = firstBlackCard;
    updates['submissions'] = {};
    
    await update(ref(database, `cah-rooms/${currentRoom}`), updates);
}

function drawBlackCard() {
    if (blackCardDeck.length === 0) {
        // Reshuffle used cards
        blackCardDeck = shuffleDeck(usedBlackCards);
        usedBlackCards = [];
    }
    const card = blackCardDeck.pop();
    usedBlackCards.push(card);
    return card;
}

function drawWhiteCard() {
    if (whiteCardDeck.length === 0) {
        // Reshuffle (though 400 cards should be enough)
        whiteCardDeck = shuffleDeck(WHITE_CARDS);
    }
    return whiteCardDeck.pop();
}

function showGameScreen() {
    showScreen('gameScreen');
    document.getElementById('roomCodeGame').textContent = currentRoom;
}

function updateGameScreen() {
    const isCzar = gameState.currentCzar === playerId;
    
    // Update round info
    document.getElementById('roundNumber').textContent = gameState.round || 1;
    document.getElementById('czarName').textContent = gameState.players[gameState.currentCzar]?.name || '';
    
    // Update scoreboard
    updateScoreboard();
    
    // Display black card
    const blackCard = gameState.currentBlackCard;
    document.getElementById('blackCardText').textContent = blackCard.text;
    const pickIndicator = document.getElementById('pickIndicator');
    if (blackCard.pick > 1) {
        pickIndicator.textContent = `Pick ${blackCard.pick}`;
        pickIndicator.classList.remove('hidden');
    } else {
        pickIndicator.classList.add('hidden');
    }
    
    // Show appropriate interface
    if (isCzar) {
        // Czar waits for submissions
        document.getElementById('submissionArea').classList.add('hidden');
        if (gameState.state === 'judging') {
            document.getElementById('judgingArea').classList.remove('hidden');
            displaySubmissions();
        } else {
            document.getElementById('judgingArea').classList.add('hidden');
        }
    } else {
        // Regular player submits cards
        document.getElementById('judgingArea').classList.add('hidden');
        document.getElementById('submissionArea').classList.remove('hidden');
        displayPlayerHand();
        updateSubmitButton();
    }
    
    // Check if all players have submitted (auto-switch to judging)
    if (gameState.state === 'playing' && gameState.host === playerId) {
        checkAllSubmitted();
    }
}

function updateScoreboard() {
    const scoreboardContent = document.getElementById('scoreboardContent');
    scoreboardContent.innerHTML = '';
    
    const players = Object.entries(gameState.players || {});
    // Sort by score descending
    players.sort((a, b) => b[1].score - a[1].score);
    
    players.forEach(([id, player], index) => {
        const div = document.createElement('div');
        div.className = 'score-item';
        if (id === gameState.currentCzar) div.classList.add('czar');
        if (index === 0 && player.score > 0) div.classList.add('leading');
        
        div.innerHTML = `
            <div class="score-name">${player.name}</div>
            <div class="score-points">${player.score}</div>
        `;
        scoreboardContent.appendChild(div);
    });
}

function displayPlayerHand() {
    const playerHand = document.getElementById('playerHand');
    playerHand.innerHTML = '';
    
    const hand = gameState.players[playerId]?.hand || [];
    const submitted = gameState.players[playerId]?.submitted;
    
    hand.forEach((cardId, index) => {
        const whiteCard = WHITE_CARDS.find(c => c.id === cardId);
        if (!whiteCard) return;
        
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card white-card';
        if (selectedWhiteCard === index) cardDiv.classList.add('selected');
        if (submitted !== null) cardDiv.classList.add('submitted');
        
        cardDiv.innerHTML = `<p>${whiteCard.text}</p>`;
        cardDiv.onclick = () => {
            if (submitted === null) {
                selectWhiteCard(index);
            }
        };
        
        playerHand.appendChild(cardDiv);
    });
    
    // Update status message
    const statusMsg = document.getElementById('statusMessage');
    if (submitted !== null) {
        statusMsg.textContent = '✓ Card submitted! Waiting for other players...';
        statusMsg.style.color = '#2ecc71';
    } else {
        statusMsg.textContent = '';
    }
}

function selectWhiteCard(index) {
    if (gameState.players[playerId]?.submitted !== null) return;
    
    selectedWhiteCard = index;
    updateSubmitButton();
    
    // Update UI
    const cards = document.querySelectorAll('.white-card');
    cards.forEach((card, i) => {
        if (i === index) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}

function updateSubmitButton() {
    const submitBtn = document.getElementById('submitBtn');
    const hasSubmitted = gameState.players[playerId]?.submitted !== null;
    
    if (hasSubmitted) {
        submitBtn.classList.add('hidden');
    } else if (selectedWhiteCard !== null) {
        submitBtn.classList.remove('hidden');
    } else {
        submitBtn.classList.add('hidden');
    }
}

async function submitCard() {
    if (selectedWhiteCard === null) return;
    if (gameState.players[playerId]?.submitted !== null) return;
    
    const hand = gameState.players[playerId].hand;
    const cardId = hand[selectedWhiteCard];
    
    // Submit card
    const submissionId = push(ref(database, `cah-rooms/${currentRoom}/submissions`)).key;
    await update(ref(database, `cah-rooms/${currentRoom}`), {
        [`players/${playerId}/submitted`]: cardId,
        [`submissions/${submissionId}`]: {
            playerId: playerId,
            cardId: cardId
        }
    });
    
    selectedWhiteCard = null;
}

async function checkAllSubmitted() {
    const players = gameState.players || {};
    const playerIds = Object.keys(players).filter(id => id !== gameState.currentCzar);
    const submissions = gameState.submissions || {};
    
    if (playerIds.length === Object.keys(submissions).length) {
        // All submitted, switch to judging
        await update(ref(database, `cah-rooms/${currentRoom}`), {
            state: 'judging'
        });
    }
}

function displaySubmissions() {
    const submissionsGrid = document.getElementById('submissionsGrid');
    submissionsGrid.innerHTML = '';
    
    const submissions = gameState.submissions || {};
    
    Object.entries(submissions).forEach(([id, submission]) => {
        const whiteCard = WHITE_CARDS.find(c => c.id === submission.cardId);
        if (!whiteCard) return;
        
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card white-card submission-card';
        cardDiv.innerHTML = `<p>${whiteCard.text}</p>`;
        cardDiv.onclick = () => selectWinner(id, submission);
        
        submissionsGrid.appendChild(cardDiv);
    });
}

async function selectWinner(submissionId, submission) {
    if (gameState.currentCzar !== playerId) return;
    
    const winnerId = submission.playerId;
    const winnerCard = submission.cardId;
    
    // Award point
    const newScore = (gameState.players[winnerId].score || 0) + 1;
    
    // Check for game over
    const winningScore = gameState.settings.winningScore;
    const gameOver = newScore >= winningScore;
    
    const updates = {
        [`players/${winnerId}/score`]: newScore,
        roundWinner: winnerId,
        winningCard: winnerCard,
        state: gameOver ? 'finished' : 'roundEnd'
    };
    
    await update(ref(database, `cah-rooms/${currentRoom}`), updates);
}

function showRoundWinner() {
    document.getElementById('submissionArea').classList.add('hidden');
    document.getElementById('judgingArea').classList.add('hidden');
    document.getElementById('winnerDisplay').classList.remove('hidden');
    
    const winnerId = gameState.roundWinner;
    const winnerPlayer = gameState.players[winnerId];
    const blackCard = gameState.currentBlackCard;
    const whiteCard = WHITE_CARDS.find(c => c.id === gameState.winningCard);
    
    document.getElementById('winningBlackCard').textContent = blackCard.text;
    document.getElementById('winningWhiteCard').textContent = whiteCard.text;
    document.getElementById('winnerName').textContent = winnerPlayer.name;
    
    // Show next round button for host only
    if (gameState.host === playerId) {
        document.getElementById('nextRoundBtn').classList.remove('hidden');
        document.getElementById('nextRoundWait').classList.add('hidden');
    } else {
        document.getElementById('nextRoundBtn').classList.add('hidden');
        document.getElementById('nextRoundWait').classList.remove('hidden');
    }
}

async function nextRound() {
    if (gameState.host !== playerId) return;
    
    const players = gameState.players || {};
    const playerIds = Object.keys(players);
    
    // Rotate czar
    const currentCzarIndex = playerIds.indexOf(gameState.currentCzar);
    const nextCzarIndex = (currentCzarIndex + 1) % playerIds.length;
    const nextCzar = playerIds[nextCzarIndex];
    
    // Draw new black card
    const newBlackCard = drawBlackCard();
    
    // Refresh hands (replace submitted cards)
    const updates = {};
    playerIds.forEach(id => {
        const player = players[id];
        if (player.submitted !== null) {
            // Remove submitted card, add new one
            const hand = player.hand.filter(cardId => cardId !== player.submitted);
            hand.push(drawWhiteCard());
            updates[`players/${id}/hand`] = hand;
        }
        updates[`players/${id}/submitted`] = null;
    });
    
    updates['state'] = 'playing';
    updates['round'] = (gameState.round || 0) + 1;
    updates['currentCzar'] = nextCzar;
    updates['currentBlackCard'] = newBlackCard;
    updates['submissions'] = {};
    updates['roundWinner'] = null;
    updates['winningCard'] = null;
    
    await update(ref(database, `cah-rooms/${currentRoom}`), updates);
    
    // Hide winner display
    document.getElementById('winnerDisplay').classList.add('hidden');
}

function showGameOver() {
    showScreen('gameScreen');
    document.getElementById('submissionArea').classList.add('hidden');
    document.getElementById('judgingArea').classList.add('hidden');
    document.getElementById('winnerDisplay').classList.add('hidden');
    document.getElementById('gameOver').classList.remove('hidden');
    
    // Find winner (highest score)
    const players = Object.entries(gameState.players || {});
    players.sort((a, b) => b[1].score - a[1].score);
    
    const [championId, championData] = players[0];
    document.getElementById('championName').textContent = championData.name;
    document.getElementById('championScore').textContent = `${championData.score} points`;
    
    // Display all scores
    const finalScoresContent = document.getElementById('finalScoresContent');
    finalScoresContent.innerHTML = '';
    
    players.forEach(([id, player]) => {
        const div = document.createElement('div');
        div.className = 'final-score-item';
        div.innerHTML = `
            <span>${player.name}</span>
            <span>${player.score} points</span>
        `;
        finalScoresContent.appendChild(div);
    });
}

async function playAgain() {
    if (gameState.host !== playerId) return;
    
    // Reset game state
    const updates = {
        state: 'lobby',
        round: 0,
        currentCzar: null,
        currentBlackCard: null,
        submissions: {},
        roundWinner: null,
        winningCard: null
    };
    
    // Reset all player scores and hands
    Object.keys(gameState.players).forEach(id => {
        updates[`players/${id}/score`] = 0;
        updates[`players/${id}/hand`] = [];
        updates[`players/${id}/submitted`] = null;
    });
    
    await update(ref(database, `cah-rooms/${currentRoom}`), updates);
    
    document.getElementById('gameOver').classList.add('hidden');
    showScreen('lobbyScreen');
}

// Utility functions
function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}
