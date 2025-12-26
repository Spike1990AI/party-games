# Mobile Party Games - Complete Development Guide

**Project:** Party Games Collection
**Platform:** Mobile-first web games (iOS/Android browsers)
**Tech Stack:** HTML5, CSS3, ES6 Modules, Firebase Realtime Database
**Live URL:** https://spike1990ai.github.io/party-games/

---

## 🚨 CRITICAL PRINCIPLE: ALL GAMES ARE MOBILE

Every design decision prioritizes mobile UX. Desktop is secondary.

---

## 📱 Phone Frame & Sizing Standards

### Viewport Configuration (Required in ALL HTML files)

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### Mobile Frame Sizes to Test

**Primary Targets:**
- iPhone 12/13/14 Pro: 390 x 844px
- iPhone SE: 375 x 667px
- Samsung Galaxy S21: 360 x 800px
- iPad Mini: 768 x 1024px (tablet fallback)

**Safe Content Area:**
- Avoid top 44px (notch/status bar)
- Avoid bottom 34px (home indicator on iPhone)
- Side padding: minimum 16px (20px recommended)

### CSS Layout Pattern

```css
.container {
    max-width: 600px;           /* Prevent too wide on tablets */
    margin: 0 auto;              /* Center on larger screens */
    padding: 20px;               /* Safe side margins */
    min-height: 100vh;           /* Full viewport height */
    min-height: 100dvh;          /* Dynamic viewport (better for mobile) */
}

/* Screen management */
.screen {
    display: block;              /* Visible screen */
}

.screen.hidden {
    display: none;               /* Hidden screen */
}
```

### Prevent Zoom/Bounce on iOS

```css
/* Prevent pull-to-refresh bounce */
body {
    overscroll-behavior-y: contain;
    -webkit-overflow-scrolling: touch;
}

/* Prevent double-tap zoom on buttons */
button, input[type="submit"] {
    touch-action: manipulation;
}

/* Prevent text selection during gameplay */
.game-area {
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
}
```

---

## 📝 Text Field Requirements

### Input Sizing (Touch-Friendly)

```css
input[type="text"],
input[type="number"],
textarea {
    min-height: 44px;            /* Apple's minimum touch target */
    padding: 12px 16px;          /* Generous padding */
    font-size: 16px;             /* Prevents iOS auto-zoom on focus */
    border-radius: 8px;
    border: 2px solid #ddd;
    width: 100%;
    box-sizing: border-box;
}

/* Active state (important for mobile feedback) */
input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}
```

### Font Size Guidelines

**CRITICAL:** Never use font-size smaller than 16px on inputs or iOS will auto-zoom!

```css
/* Minimum font sizes */
input, textarea {
    font-size: 16px;             /* Required to prevent iOS zoom */
}

button {
    font-size: 16px;             /* Readable on small screens */
}

body {
    font-size: 16px;             /* Base size */
    line-height: 1.5;            /* Readable line spacing */
}

/* Headings */
h1 { font-size: 2rem; }          /* 32px */
h2 { font-size: 1.5rem; }        /* 24px */
h3 { font-size: 1.25rem; }       /* 20px */

/* Small text (use sparingly) */
.small-text {
    font-size: 14px;             /* Minimum for body text */
}
```

### Input Types & Attributes

```html
<!-- Player name input -->
<input
    type="text"
    placeholder="Enter your name"
    maxlength="12"               <!-- Prevent long names in UI -->
    autocomplete="off"           <!-- No autocomplete during games -->
    autocapitalize="words"       <!-- Capitalize names -->
    spellcheck="false"           <!-- No spellcheck during games -->
>

<!-- Room code input -->
<input
    type="text"
    placeholder="ABCD"
    maxlength="4"
    autocomplete="off"
    autocapitalize="characters"  <!-- Uppercase room codes -->
    pattern="[A-Z]{4}"           <!-- Validation pattern -->
    inputmode="text"             <!-- Show letter keyboard -->
>

<!-- Numeric input -->
<input
    type="number"
    inputmode="numeric"          <!-- Show number keyboard on mobile -->
    pattern="[0-9]*"             <!-- iOS number keyboard trigger -->
>

<!-- Answer input (game-specific) -->
<input
    type="text"
    placeholder="Type your answer..."
    maxlength="30"               <!-- Prevent essay answers -->
    autocomplete="off"
    autocapitalize="off"         <!-- User decides capitalization -->
    spellcheck="false"           <!-- No red underlines during games -->
>
```

### Virtual Keyboard Management

```javascript
// Prevent keyboard from covering input
input.addEventListener('focus', (e) => {
    setTimeout(() => {
        e.target.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }, 300); // Wait for keyboard animation
});

// Dismiss keyboard after submit
submitButton.addEventListener('click', () => {
    document.activeElement.blur(); // Close keyboard
});
```

---

## 🎨 Button & Touch Target Standards

### Minimum Touch Target Sizes

**Apple HIG:** 44 x 44 points
**Android Material:** 48 x 48 dp
**Our Standard:** 48px minimum (safe for both)

```css
.btn-primary,
.btn-secondary {
    min-height: 48px;
    min-width: 100px;            /* Prevent too narrow */
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 8px;
    border: none;
    cursor: pointer;

    /* Touch optimization */
    touch-action: manipulation;  /* Prevent double-tap zoom */
    user-select: none;           /* Prevent text selection */
}

/* Full-width buttons (common in mobile games) */
.btn-full {
    width: 100%;
    display: block;
}

/* Spacing between buttons */
.button-group {
    display: flex;
    gap: 12px;                   /* Prevent accidental taps */
    flex-direction: column;      /* Stack on mobile */
}
```

### Button States (Required for Mobile Feedback)

```css
.btn-primary {
    background: #667eea;
    color: white;
    transition: all 0.2s;
}

/* Active state (tap feedback) */
.btn-primary:active {
    transform: scale(0.95);      /* Visual "press" effect */
    background: #5568d3;
}

/* Disabled state */
.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #ccc;
}

/* Loading state (during async operations) */
.btn-primary.loading {
    opacity: 0.7;
    pointer-events: none;        /* Prevent multiple clicks */
}
```

### Duplicate-Click Protection (CRITICAL)

```javascript
document.getElementById('submitBtn').addEventListener('click', async () => {
    const btn = document.getElementById('submitBtn');
    const input = document.getElementById('input');

    // PREVENT DUPLICATE CLICKS (mobile users tap fast)
    if (btn.disabled) return;
    btn.disabled = true;
    input.disabled = true;

    try {
        const result = await performAsyncAction();

        if (!result.success) {
            // Re-enable on failure
            btn.disabled = false;
            input.disabled = false;
            return;
        }

        // Keep disabled on success (transition to next screen)
        nextScreen();

    } catch (error) {
        // Re-enable on error
        btn.disabled = false;
        input.disabled = false;
        alert('Error: ' + error.message);
    }
});
```

---

## 💾 Data Persistence Patterns

### Firebase Realtime Database Structure

**Room-Based Multiplayer:**

```javascript
rooms/
  ABCD/                          // Room code
    code: "ABCD"
    host: "Steve"                // Host player name
    created: 1640000000000       // Timestamp
    gameState: "playing"         // lobby | playing | finished
    currentRound: 2
    questions: [...array]        // Shuffled questions for this game
    players/
      player1/
        id: "player1"
        name: "Steve"
        score: 5
        isHost: true
        connected: true          // Connection tracking
        disconnectedAt: null
      player2/
        id: "player2"
        name: "Sarah"
        score: 3
        isHost: false
        connected: true
    answers/                     // Current round answers
      player1:
        playerId: "player1"
        playerName: "Steve"
        answer: "apple"
      player2:
        playerId: "player2"
        playerName: "Sarah"
        answer: "banana"
    pinkCowHolder: "player2"     // Game-specific state
```

### Firebase Connection Monitoring (REQUIRED)

```javascript
import { getDatabase, ref, onValue } from 'firebase/database';

const database = getDatabase(app);
const connectedRef = ref(database, '.info/connected');

onValue(connectedRef, (snapshot) => {
    const isConnected = snapshot.val() === true;

    if (isConnected) {
        console.log('🟢 Firebase connected');
        hideConnectionWarning();
    } else {
        console.log('🔴 Firebase disconnected');
        showConnectionWarning();
    }
});

function showConnectionWarning() {
    const statusDiv = document.createElement('div');
    statusDiv.id = 'connectionStatus';
    statusDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #f44336;
        color: white;
        padding: 12px;
        text-align: center;
        font-weight: 600;
        z-index: 9999;
    `;
    statusDiv.innerHTML = '⚠️ Connection lost - Reconnecting...';
    document.body.appendChild(statusDiv);
}
```

### Disconnect Handling

```javascript
import { onDisconnect } from 'firebase/database';

// After player joins
const playerRef = ref(database, `rooms/${roomCode}/players/${playerId}`);

// Set up disconnect handler BEFORE marking as connected
onDisconnect(playerRef).update({
    connected: false,
    disconnectedAt: Date.now()
});

// Now mark as connected
await update(playerRef, { connected: true });
```

### Safe Update with Retry Logic

```javascript
async function safeUpdate(path, data, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            await update(path, data);
            return true;
        } catch (error) {
            console.error(`Update attempt ${i + 1} failed:`, error);

            if (i === retries - 1) {
                alert('Connection error. Please check your internet and try again.');
                return false;
            }

            // Exponential backoff: 1s, 2s, 4s
            await new Promise(resolve =>
                setTimeout(resolve, 1000 * Math.pow(2, i))
            );
        }
    }
    return false;
}

// Usage:
const success = await safeUpdate(roomRef, { gameState: 'playing' });
if (!success) {
    // Handle failure (re-enable buttons, show error, etc.)
    return;
}
```

### Firebase Listener Cleanup (CRITICAL)

**Memory Leak Pattern (BAD):**
```javascript
// This listener NEVER gets cleaned up!
onValue(roomRef, (snapshot) => {
    // Do stuff...
});
```

**Correct Pattern (GOOD):**
```javascript
let unsubscribe = null;

function showScreen() {
    // Clean up existing listener
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }

    // Create new listener
    unsubscribe = onValue(roomRef, (snapshot) => {
        // Do stuff...

        // Clean up before transitioning
        if (shouldTransition) {
            unsubscribe();
            unsubscribe = null;
            nextScreen();
        }
    });
}
```

### Local Storage for Settings (Not Game State)

```javascript
// Save player preferences (name, theme, etc.)
localStorage.setItem('playerName', name);
localStorage.setItem('theme', 'dark');

// Retrieve on load
const savedName = localStorage.getItem('playerName') || '';
document.getElementById('nameInput').value = savedName;

// NEVER use localStorage for multiplayer game state!
// Use Firebase for all game state that needs to sync.
```

---

## 🎮 Game State Management

### Centralized Screen Management (REQUIRED)

```javascript
// Track current screen
let currentScreen = 'join';

// List all screens
const screens = [
    'joinScreen',
    'lobbyScreen',
    'gameScreen',
    'resultsScreen',
    'finalScreen'
];

// Single function to change screens
function showScreen(screenId) {
    // Prevent duplicate transitions
    if (currentScreen === screenId.replace('Screen', '')) {
        return;
    }

    // Hide all screens
    screens.forEach(id => {
        const screen = document.getElementById(id);
        if (screen) {
            screen.classList.add('hidden');
        }
    });

    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        currentScreen = screenId.replace('Screen', '');
    }
}

// Usage:
showScreen('lobbyScreen'); // ALWAYS use this function
// NEVER: joinScreen.classList.add('hidden'); // DON'T DO THIS
```

### Host-Authoritative Model

```javascript
// ONLY the host calculates game-critical state
if (isHost) {
    // Calculate scores
    const updatedPlayers = { ...players };
    Object.values(answers).forEach(({ playerId, answer }) => {
        if (answer === correctAnswer) {
            updatedPlayers[playerId].score += 1;
        }
    });

    // Update database
    await safeUpdate(roomRef, { players: updatedPlayers });
}

// All players (including host) READ the same data
const unsubscribe = onValue(roomRef, (snapshot) => {
    const data = snapshot.val();
    displayScoreboard(data.players); // Everyone displays same data
});
```

### Race Condition Prevention

```javascript
// BAD: Two players might both become host
if (Object.keys(players).length === 0) {
    isHost = true;
    await update(roomRef, { host: playerName });
}

// GOOD: Verify with server after update
if (Object.keys(players).length === 0) {
    isHost = true;
    await update(roomRef, { host: playerName });
}

// Add player
await update(roomRef, { players });

// VERIFY from server (prevents race condition)
const verifySnapshot = await new Promise((resolve) => {
    onValue(roomRef, resolve, { onlyOnce: true });
});
const verifiedData = verifySnapshot.val();
isHost = verifiedData.host === playerName; // Server is source of truth
```

### Stale Closure Prevention

```javascript
// BAD: Captured 'data' could be stale after 2 seconds
const data = snapshot.val();
setTimeout(() => {
    showResults(data); // Using stale data!
}, 2000);

// GOOD: Fetch fresh data before use
setTimeout(async () => {
    const freshSnapshot = await new Promise((resolve) => {
        onValue(roomRef, resolve, { onlyOnce: true });
    });
    showResults(freshSnapshot.val()); // Fresh data
}, 2000);
```

---

## 🎉 Same-Room Party Mode Patterns

**Context:** All players are physically together in one room. Room codes are said aloud, screens are visible to others, and the game creates a shared social experience.

This fundamentally changes the UX requirements from remote multiplayer.

---

### 🔊 Sound & Audio (Critical for Group Experience)

**Key Requirements:**
- Everyone hears the same sounds together (group feedback)
- Mute controls for public spaces (restaurants, cafes)
- iOS requires user interaction before playing audio
- Sounds enhance competitive atmosphere

#### Audio Setup Pattern

```javascript
// audio-manager.js
class AudioManager {
    constructor() {
        this.sounds = {};
        this.muted = localStorage.getItem('soundMuted') === 'true';
        this.initialized = false;
    }

    // Load sounds
    async loadSounds() {
        this.sounds = {
            correct: new Audio('assets/sounds/correct.mp3'),
            incorrect: new Audio('assets/sounds/incorrect.mp3'),
            celebration: new Audio('assets/sounds/celebration.mp3'),
            tick: new Audio('assets/sounds/tick.mp3'),
            join: new Audio('assets/sounds/join.mp3'),
            winner: new Audio('assets/sounds/winner.mp3')
        };

        // Preload all sounds
        Object.values(this.sounds).forEach(audio => {
            audio.load();
            audio.volume = 0.6; // Not too loud
        });
    }

    // Initialize on first user interaction (iOS requirement)
    async initialize() {
        if (this.initialized) return;

        await this.loadSounds();

        // Play silent audio to unlock iOS audio
        const silence = new Audio('data:audio/mp3;base64,SUQzAwAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dX/////////////////////');
        try {
            await silence.play();
            this.initialized = true;
            console.log('🔊 Audio initialized');
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        }
    }

    // Play a sound
    play(soundName) {
        if (this.muted || !this.initialized) return;

        const sound = this.sounds[soundName];
        if (!sound) return;

        // Clone audio for overlapping sounds
        const audioClone = sound.cloneNode();
        audioClone.volume = sound.volume;
        audioClone.play().catch(err => console.warn('Audio play failed:', err));
    }

    // Toggle mute
    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('soundMuted', this.muted.toString());
        return this.muted;
    }

    isMuted() {
        return this.muted;
    }
}

// Global instance
const audioManager = new AudioManager();

// Initialize on first click/tap ANYWHERE
document.addEventListener('click', () => {
    audioManager.initialize();
}, { once: true });

export default audioManager;
```

#### Mute Toggle UI

```html
<!-- Add to every screen's header -->
<button id="muteToggle" class="mute-btn" aria-label="Toggle sound">
    <span class="mute-icon">🔊</span>
</button>
```

```css
.mute-btn {
    position: fixed;
    top: 12px;
    right: 12px;
    background: rgba(0, 0, 0, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    width: 48px;
    height: 48px;
    font-size: 20px;
    cursor: pointer;
    z-index: 9999;
    transition: all 0.2s;
    touch-action: manipulation;
}

.mute-btn:active {
    transform: scale(0.9);
}

.mute-btn.muted .mute-icon::after {
    content: '🔇';
}
```

```javascript
// Mute button handler
document.getElementById('muteToggle').addEventListener('click', () => {
    const btn = document.getElementById('muteToggle');
    const isMuted = audioManager.toggleMute();
    btn.classList.toggle('muted', isMuted);
});
```

#### Using Sounds in Game

```javascript
// Player joins room
audioManager.play('join');

// Player submits answer
audioManager.play('tick');

// Show results - correct answer
if (playerAnswer === correctAnswer) {
    audioManager.play('correct');
} else {
    audioManager.play('incorrect');
}

// Winner announcement
audioManager.play('winner');
audioManager.play('celebration');
```

---

### 📱 Wake Lock (Prevent Screen Sleep)

**Problem:** Players' phones go to sleep after 30-60 seconds while waiting for others to answer.

**Solution:** Screen Wake Lock API

```javascript
// wake-lock.js
class WakeLockManager {
    constructor() {
        this.wakeLock = null;
        this.isSupported = 'wakeLock' in navigator;
    }

    async request() {
        if (!this.isSupported) {
            console.warn('Wake Lock API not supported');
            return false;
        }

        try {
            this.wakeLock = await navigator.wakeLock.request('screen');
            console.log('🔒 Wake Lock activated');

            // Reacquire if page becomes visible again
            document.addEventListener('visibilitychange', async () => {
                if (document.visibilityState === 'visible' && this.wakeLock !== null) {
                    await this.request();
                }
            });

            // Listen for wake lock release
            this.wakeLock.addEventListener('release', () => {
                console.log('🔓 Wake Lock released');
            });

            return true;
        } catch (err) {
            console.error('Wake Lock request failed:', err);
            return false;
        }
    }

    async release() {
        if (this.wakeLock !== null) {
            await this.wakeLock.release();
            this.wakeLock = null;
        }
    }
}

const wakeLockManager = new WakeLockManager();
export default wakeLockManager;
```

#### When to Use Wake Lock

```javascript
// Activate when game starts
function startGame() {
    wakeLockManager.request();
    showScreen('gameScreen');
}

// Release when game ends
function showFinalResults() {
    wakeLockManager.release();
    showScreen('finalScreen');
}

// Also release when leaving page
window.addEventListener('beforeunload', () => {
    wakeLockManager.release();
});
```

#### Fallback for Unsupported Browsers

```javascript
// Add to screen
if (!wakeLockManager.isSupported) {
    // Show tip to user
    const tip = document.createElement('div');
    tip.className = 'wake-lock-tip';
    tip.innerHTML = '💡 Tip: Adjust your screen timeout to "Never" in settings during gameplay';
    document.getElementById('gameScreen').prepend(tip);
}
```

---

### 🎊 Celebration Animations (Group Visibility)

**Purpose:** Winner announcements, correct answers, and game events are visible across the room.

#### Confetti Effect

```javascript
// confetti.js
function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        document.body.appendChild(confetti);

        // Remove after animation
        setTimeout(() => confetti.remove(), 5000);
    }
}
```

```css
.confetti {
    position: fixed;
    width: 10px;
    height: 10px;
    top: -10px;
    z-index: 9999;
    animation: confetti-fall linear forwards;
    pointer-events: none;
}

@keyframes confetti-fall {
    to {
        transform: translateY(100vh) rotate(360deg);
        opacity: 0;
    }
}
```

#### Winner Announcement

```html
<!-- Full-screen winner overlay -->
<div id="winnerOverlay" class="winner-overlay hidden">
    <div class="winner-content">
        <div class="winner-emoji">👑</div>
        <h1 class="winner-name">STEVE WINS!</h1>
        <div class="winner-score">Final Score: 8 points</div>
    </div>
</div>
```

```css
.winner-overlay {
    position: fixed;
    inset: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.5s ease;
}

.winner-content {
    text-align: center;
    animation: scaleIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.winner-emoji {
    font-size: 8rem;
    margin-bottom: 1rem;
    animation: bounce 1s infinite;
}

.winner-name {
    font-size: 3rem;
    font-weight: 900;
    color: white;
    text-shadow: 0 4px 20px rgba(0,0,0,0.3);
    margin-bottom: 1rem;
    letter-spacing: 2px;
}

.winner-score {
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.9);
}

@keyframes scaleIn {
    from {
        transform: scale(0);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
}
```

```javascript
// Show winner with celebration
function announceWinner(winnerName, winnerScore) {
    // Sound
    audioManager.play('winner');
    audioManager.play('celebration');

    // Confetti
    createConfetti();

    // Winner overlay
    document.querySelector('.winner-name').textContent = `${winnerName.toUpperCase()} WINS!`;
    document.querySelector('.winner-score').textContent = `Final Score: ${winnerScore} points`;
    document.getElementById('winnerOverlay').classList.remove('hidden');

    // Haptic feedback
    vibrate([200, 100, 200, 100, 400]);

    // Auto-hide after 5 seconds
    setTimeout(() => {
        document.getElementById('winnerOverlay').classList.add('hidden');
        showScreen('finalScreen');
    }, 5000);
}
```

---

### 📏 Large Visibility Design (Cross-Room Readability)

**Principle:** Text must be readable from 6-10 feet away (across the room).

```css
/* Room code - EXTRA LARGE */
.room-code-display {
    font-size: 4rem;           /* 64px - readable across room */
    font-weight: 900;
    letter-spacing: 8px;
    text-align: center;
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 16px;
    margin: 2rem 0;
}

/* Player names - LARGE */
.player-name {
    font-size: 2rem;           /* 32px */
    font-weight: 700;
}

/* Scores - VERY LARGE */
.score-display {
    font-size: 3rem;           /* 48px */
    font-weight: 900;
    color: #667eea;
}

/* Turn indicator - OBVIOUS */
.turn-indicator {
    font-size: 2.5rem;         /* 40px */
    font-weight: 800;
    text-align: center;
    padding: 1.5rem;
    border-radius: 12px;
    animation: pulse 1.5s infinite;
}

.turn-indicator.your-turn {
    background: #4caf50;
    color: white;
}

.turn-indicator.waiting {
    background: #f5f5f5;
    color: #999;
}

/* Progress indicator - CLEAR */
.answer-progress {
    font-size: 1.8rem;         /* 28px */
    font-weight: 700;
    text-align: center;
    margin: 1rem 0;
}

.answer-progress .count {
    color: #667eea;
    font-size: 2.5rem;         /* 40px */
}
```

#### Example: Large Turn Indicator

```html
<div class="turn-indicator your-turn">
    🎯 YOUR TURN
</div>

<div class="turn-indicator waiting">
    ⏳ WAITING FOR OTHERS
</div>

<div class="answer-progress">
    Answers: <span class="count">3/4</span>
</div>
```

---

### 📳 Haptic Feedback (Personal Notifications)

**Use Case:** Vibrate when it's your turn (even when you're not looking at screen).

```javascript
// vibration.js
function vibrate(pattern) {
    if (!('vibrate' in navigator)) {
        return false;
    }

    // pattern can be:
    // - Single number: vibrate([200])
    // - Pattern: vibrate([200, 100, 200]) - vibrate, pause, vibrate
    try {
        navigator.vibrate(pattern);
        return true;
    } catch (error) {
        console.warn('Vibration failed:', error);
        return false;
    }
}

// Haptic patterns
const haptics = {
    success: [100, 50, 100],           // Double tap
    error: [200],                       // Single long
    yourTurn: [100, 100, 100, 100, 200], // Alert pattern
    winner: [200, 100, 200, 100, 400],  // Celebration
    tick: [50]                          // Light tap
};

export { vibrate, haptics };
```

#### Using Haptics in Game

```javascript
import { vibrate, haptics } from './vibration.js';

// Your turn notification
function notifyYourTurn() {
    vibrate(haptics.yourTurn);
    audioManager.play('tick');
}

// Correct answer
function showCorrectAnswer() {
    vibrate(haptics.success);
    audioManager.play('correct');
}

// Incorrect answer
function showIncorrectAnswer() {
    vibrate(haptics.error);
    audioManager.play('incorrect');
}

// Winner announcement
function celebrateWinner() {
    vibrate(haptics.winner);
    audioManager.play('celebration');
}

// Button tap feedback
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', () => {
        vibrate(haptics.tick);
    });
});
```

---

### ⏱️ Pacing Controls (Social Dynamics)

**Problem:** One slow player holds up the entire group.

**Solutions:**
- Visual countdown timers everyone can see
- Host can skip slow players
- Auto-submit after timeout

#### Countdown Timer

```html
<div class="countdown-timer">
    <div class="timer-circle">
        <svg width="100" height="100">
            <circle class="timer-bg" cx="50" cy="50" r="45"></circle>
            <circle class="timer-progress" cx="50" cy="50" r="45"></circle>
        </svg>
        <div class="timer-text">15</div>
    </div>
</div>
```

```css
.countdown-timer {
    text-align: center;
    margin: 2rem 0;
}

.timer-circle {
    position: relative;
    display: inline-block;
}

.timer-circle svg {
    transform: rotate(-90deg);
}

.timer-bg {
    fill: none;
    stroke: #e0e0e0;
    stroke-width: 8;
}

.timer-progress {
    fill: none;
    stroke: #667eea;
    stroke-width: 8;
    stroke-linecap: round;
    stroke-dasharray: 283; /* 2 * π * r = 2 * 3.14159 * 45 */
    stroke-dashoffset: 0;
    transition: stroke-dashoffset 1s linear;
}

.timer-progress.warning {
    stroke: #ff9800;
}

.timer-progress.danger {
    stroke: #f44336;
}

.timer-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 2rem;
    font-weight: 900;
    color: #667eea;
}
```

```javascript
// Countdown timer
function startCountdown(seconds, onTick, onComplete) {
    const timerText = document.querySelector('.timer-text');
    const timerProgress = document.querySelector('.timer-progress');
    const circumference = 283;
    let remaining = seconds;

    const interval = setInterval(() => {
        remaining--;
        timerText.textContent = remaining;

        // Update progress circle
        const offset = circumference - (remaining / seconds) * circumference;
        timerProgress.style.strokeDashoffset = offset;

        // Color warnings
        if (remaining <= 5) {
            timerProgress.classList.add('danger');
            vibrate([50]); // Tick every second
        } else if (remaining <= 10) {
            timerProgress.classList.add('warning');
        }

        onTick(remaining);

        if (remaining <= 0) {
            clearInterval(interval);
            onComplete();
        }
    }, 1000);

    return interval; // Return so it can be cleared if needed
}

// Usage
const timer = startCountdown(
    15,
    (remaining) => {
        // On tick
        if (remaining <= 5) {
            audioManager.play('tick');
        }
    },
    () => {
        // On complete - auto-submit
        audioManager.play('error');
        vibrate([200, 100, 200]);
        submitAnswer(''); // Auto-submit blank answer
    }
);
```

#### Host Skip Control

```html
<!-- Host-only control -->
<div id="hostControls" class="host-controls hidden">
    <button id="skipSlowPlayers" class="btn-secondary">
        Skip Slow Players (2 waiting)
    </button>
</div>
```

```javascript
// Show waiting players to host
if (isHost) {
    const waitingCount = Object.keys(players).length - Object.keys(answers).length;

    if (waitingCount > 0 && waitingCount < Object.keys(players).length) {
        document.getElementById('hostControls').classList.remove('hidden');
        document.getElementById('skipSlowPlayers').textContent =
            `Skip Slow Players (${waitingCount} waiting)`;
    }
}

// Skip button handler
document.getElementById('skipSlowPlayers').addEventListener('click', async () => {
    if (!isHost) return;

    const confirmed = confirm('Skip players who haven\'t answered? They\'ll get 0 points this round.');

    if (confirmed) {
        // Auto-submit blank answers for missing players
        const allPlayers = Object.keys(players);
        const answeredPlayers = Object.keys(answers);
        const missingPlayers = allPlayers.filter(p => !answeredPlayers.includes(p));

        const updates = {};
        missingPlayers.forEach(playerId => {
            updates[`rooms/${roomCode}/answers/${playerId}`] = {
                playerId: playerId,
                playerName: players[playerId].name,
                answer: '' // Blank = incorrect
            };
        });

        await update(ref(database), updates);

        // Proceed to results
        proceedToResults();
    }
});
```

---

### 🎮 Same-Room Best Practices

**DO:**
- ✅ Use large, bold text (readable from 6+ feet)
- ✅ Implement wake lock during active gameplay
- ✅ Add celebratory sounds and animations
- ✅ Show clear turn indicators
- ✅ Provide mute controls (top-right corner)
- ✅ Use haptic feedback for personal notifications
- ✅ Display progress indicators ("3/4 answered")
- ✅ Allow host to skip slow players

**DON'T:**
- ❌ Use small text or subtle indicators
- ❌ Rely only on sound (some venues are loud)
- ❌ Let screens go to sleep during gameplay
- ❌ Make players wait indefinitely for slow players
- ❌ Forget to initialize audio on first interaction
- ❌ Autoplay audio (iOS won't allow it)

---

### 📱 Same-Room Testing Checklist

- [ ] Room code is readable from across the room (4+ rem)
- [ ] Scores are large and obvious (3+ rem)
- [ ] Turn indicators are unmistakable
- [ ] Wake lock activates during gameplay
- [ ] Screens stay awake while waiting for others
- [ ] Mute button is always visible and accessible
- [ ] Sounds play on first user interaction (iOS)
- [ ] Celebration animations are room-visible
- [ ] Haptics work on supported devices
- [ ] Host can skip slow players after 10+ seconds
- [ ] Countdown timers are synchronized across devices
- [ ] Winner announcement fills entire screen
- [ ] Test with 4 real people in same room
- [ ] Test in noisy environment (muted gameplay)
- [ ] Verify phones don't sleep during 30s+ wait times

---

## 🎨 CSS Variables & Theming

### Standard CSS Variables (style.css)

```css
:root {
    /* Colors */
    --color-primary: #667eea;
    --color-primary-dark: #5568d3;
    --color-primary-rgb: 102, 126, 234;
    --color-secondary: #764ba2;
    --color-success: #4caf50;
    --color-warning: #ff9800;
    --color-danger: #f44336;
    --color-white: #ffffff;
    --color-text: #2d3748;
    --color-text-light: #718096;
    --color-text-muted: #a0aec0;

    /* Gradients */
    --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --gradient-success: linear-gradient(135deg, #4caf50 0%, #45a049 100%);

    /* Spacing (8px base) */
    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 24px;
    --space-xl: 32px;
    --space-2xl: 48px;

    /* Font sizes */
    --font-size-xs: 0.75rem;    /* 12px */
    --font-size-sm: 0.875rem;   /* 14px */
    --font-size-md: 1rem;       /* 16px - base */
    --font-size-lg: 1.125rem;   /* 18px */
    --font-size-xl: 1.5rem;     /* 24px */
    --font-size-2xl: 2rem;      /* 32px */
    --font-size-3xl: 3rem;      /* 48px */

    /* Font weights */
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;

    /* Border radius */
    --border-radius-sm: 4px;
    --border-radius-md: 8px;
    --border-radius-lg: 12px;
    --border-radius-xl: 16px;
    --border-radius-full: 9999px;

    /* Borders */
    --border-width-thin: 1px;
    --border-width-medium: 2px;
    --border-width-thick: 3px;

    /* Shadows */
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
    --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
    --shadow-lg: 0 10px 25px rgba(0,0,0,0.15);

    /* Touch targets */
    --touch-min: 44px;
}
```

---

## 📏 Layout Patterns

### Card-Based Layout

```css
.card {
    background: white;
    border-radius: var(--border-radius-lg);
    padding: var(--space-lg);
    box-shadow: var(--shadow-md);
    margin-bottom: var(--space-md);
}

.card-header {
    margin-bottom: var(--space-md);
    padding-bottom: var(--space-md);
    border-bottom: 1px solid #e2e8f0;
}
```

### Responsive Grid

```css
.grid {
    display: grid;
    gap: var(--space-md);
    grid-template-columns: 1fr;
}

/* Tablets and up */
@media (min-width: 768px) {
    .grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
```

### Flexbox Patterns

```css
/* Horizontal stack with gap */
.flex-row {
    display: flex;
    gap: var(--space-md);
    align-items: center;
}

/* Vertical stack */
.flex-col {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

/* Space between (nav bars, headers) */
.flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* Center content */
.flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
}
```

---

## 🎭 Animations & Transitions

### Loading States

```css
/* Spinning animation (wait screens) */
@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.spinner {
    animation: rotate 2s linear infinite;
    font-size: 3rem;
}

/* Pulse animation (waiting for players) */
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.waiting {
    animation: pulse 2s ease-in-out infinite;
}
```

### Button Feedback

```css
.btn {
    transition: all 0.2s ease;
}

.btn:active {
    transform: scale(0.95);      /* Press effect */
}

.btn:hover {
    transform: translateY(-2px); /* Lift effect (desktop) */
    box-shadow: var(--shadow-lg);
}
```

### Screen Transitions

```css
.screen {
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

---

## 🧪 Testing Checklist for Mobile Games

### Pre-Launch Testing

- [ ] Test on real iPhone (not just simulator)
- [ ] Test on real Android device
- [ ] Test on different screen sizes (small, medium, large)
- [ ] Test in landscape orientation (should it work?)
- [ ] Test with slow 3G connection (throttle in DevTools)
- [ ] Test with intermittent connection (airplane mode toggle)
- [ ] Test with 4 real players simultaneously
- [ ] Check all touch targets are minimum 44px
- [ ] Verify no text smaller than 16px on inputs
- [ ] Test virtual keyboard doesn't cover inputs
- [ ] Verify buttons disable during async operations
- [ ] Check Firebase listeners are properly cleaned up
- [ ] Test disconnect/reconnect scenarios
- [ ] Verify no console errors
- [ ] Check performance (60fps animations)
- [ ] Test with VoiceOver/TalkBack (accessibility)

### Firebase-Specific Testing

- [ ] Room creation works
- [ ] Room joining with valid code works
- [ ] Room joining with invalid code fails gracefully
- [ ] 4-player limit enforced
- [ ] Host is correctly identified
- [ ] Only host can start game
- [ ] All players see same game state
- [ ] Scores update correctly for all players
- [ ] Player disconnect handled gracefully
- [ ] Host disconnect handled (new host assignment?)
- [ ] Connection loss shows warning
- [ ] Connection restore continues game
- [ ] No stale data in UI
- [ ] No duplicate screens showing
- [ ] No memory leaks from listeners

---

## 🚀 Deployment Workflow

### GitHub Pages Deployment

```bash
cd "/Users/stevepike/Library/Mobile Documents/com~apple~CloudDocs/Cloud-Projects/Games/party-games"

# Check status
git status

# Add changes
git add .

# Commit with descriptive message
git commit -m "Add [feature name]

- Bullet point of changes
- Another change
- Fix for [specific bug]

🤖 Generated with Claude Code (https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push to GitHub (auto-deploys to Pages)
git push origin master

# Verify deployment
# Live at: https://spike1990ai.github.io/party-games/
```

### Firebase Configuration

**DO NOT commit Firebase API keys to public repos!**

For this project, config is in `js/firebase-battleships.js`:
- Currently using public read/write rules (games only)
- No sensitive data stored
- Rooms auto-expire (can add cleanup Cloud Function)

---

## 📚 File Structure Template

```
game-name/
├── game-name.html           # Main HTML file
├── js/
│   ├── game-name.js        # Game logic
│   └── firebase-battleships.js  # Shared Firebase config
├── css/
│   ├── game-name.css       # Game-specific styles
│   └── style.css           # Shared base styles
├── assets/                 # Optional: images, sounds
│   ├── images/
│   └── sounds/
└── GAME_NAME_NOTES.md      # Development notes
```

---

## 💡 Common Mistakes to Avoid

### Mobile Mistakes
- ❌ Font size < 16px on inputs (causes iOS zoom)
- ❌ Touch targets < 44px (hard to tap)
- ❌ Buttons too close together (< 8px gap)
- ❌ Not disabling buttons during async operations
- ❌ Forgetting `touch-action: manipulation` on buttons
- ❌ Not testing on real devices
- ❌ Assuming desktop mouse hover states work on mobile

### Firebase Mistakes
- ❌ Not cleaning up listeners (memory leak)
- ❌ Using captured closure data instead of fresh fetches
- ❌ Not handling connection state changes
- ❌ No retry logic for failed updates
- ❌ Not implementing disconnect tracking
- ❌ Race conditions from simultaneous writes
- ❌ Stale data from not verifying with server

### Game State Mistakes
- ❌ Multiple screens showing simultaneously
- ❌ Not having single source of truth (host-authoritative)
- ❌ Manual classList operations instead of showScreen()
- ❌ Not preventing duplicate transitions
- ❌ Forgetting to reset state between rounds/games

---

## 🔧 Development Tools

### Browser DevTools

**Mobile Testing:**
```
Chrome DevTools → Toggle Device Toolbar (Cmd+Shift+M)
- Test iPhone 12 Pro, Pixel 5, iPad
- Throttle network to "Slow 3G"
- Check "Touch" checkbox for touch simulation
```

**Firebase Debugging:**
```
Console → Filter for "Firebase"
Application → IndexedDB → Check offline persistence
Network → Filter WS (WebSocket) → Monitor real-time updates
```

### VS Code Extensions

- Live Server (real-time preview)
- Firebase Explorer (view database)
- Mobile Simulator (test different devices)

---

## 📖 Further Reading

- [Apple Human Interface Guidelines - Mobile](https://developer.apple.com/design/human-interface-guidelines/ios)
- [Material Design - Touch Targets](https://material.io/design/usability/accessibility.html#layout-typography)
- [Firebase Realtime Database Best Practices](https://firebase.google.com/docs/database/web/structure-data)
- [MDN - Mobile Web Best Practices](https://developer.mozilla.org/en-US/docs/Web/Guide/Mobile)

---

## ✅ Quick Reference Card

**ALWAYS:**
- ✅ Use `showScreen()` for screen transitions
- ✅ Clean up Firebase listeners before transitions
- ✅ Disable buttons during async operations
- ✅ Fetch fresh data before critical displays
- ✅ Test on real mobile devices
- ✅ Font-size ≥ 16px on inputs
- ✅ Touch targets ≥ 44px
- ✅ Add connection monitoring
- ✅ Implement retry logic
- ✅ Track disconnect events

**NEVER:**
- ❌ Manual classList for screen changes
- ❌ Forget listener cleanup
- ❌ Use stale closure data
- ❌ Skip duplicate-click protection
- ❌ Allow multiple screens to show
- ❌ Commit Firebase keys (if sensitive)
- ❌ Test only on desktop

---

**Last Updated:** 2025-12-26 by Claude Sonnet 4.5
**Status:** Production-ready patterns based on stabilized Herd Mentality game
