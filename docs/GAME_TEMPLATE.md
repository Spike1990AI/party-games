# Party Games - Game Development Guide

This guide explains how to add new games to the Party Games suite.

## Project Structure

```
party-games/
├── index.html              # Main menu (lists all games)
├── trivia.html            # Trivia game
├── battleships.html       # Battleships game
├── your-game.html         # Your new game
├── css/
│   ├── style.css          # Shared styles
│   ├── trivia.css         # (optional) Trivia-specific styles
│   ├── battleships.css    # Battleships-specific styles
│   └── your-game.css      # Your game styles
└── js/
    ├── trivia.js          # Trivia game logic
    ├── battleships.js     # Battleships game logic
    ├── your-game.js       # Your game logic
    └── firebase-battleships.js  # Firebase config (if needed)
```

## Game Types

### Type 1: Single-Player Games (No Sync Needed)
**Examples:** Trivia Showdown
**Best for:** Individual challenges, quiz games, reaction games
**Tech:** Just HTML/CSS/JS, no Firebase

### Type 2: Multi-Player Games (Requires Sync)
**Examples:** Battleships (1v1, 2v2)
**Best for:** Turn-based games, competitive games
**Tech:** HTML/CSS/JS + Firebase Realtime Database

## Creating a New Game

### Step 1: Plan Your Game

**Answer these questions:**
1. How many players? (1, 2, 4, or "any")
2. Real-time sync needed? (Yes/No)
3. Turn-based or simultaneous?
4. What's the win condition?

### Step 2: Create Game Files

#### Minimal Game Template (your-game.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Game Name</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/your-game.css">
</head>
<body>
    <div class="container">
        <div class="screen">
            <h1>🎮 Your Game Name</h1>

            <!-- Your game UI here -->

            <button class="btn-primary">Start Game</button>
        </div>
    </div>

    <script src="js/your-game.js"></script>
</body>
</html>
```

#### Game Styles (css/your-game.css)

```css
/* Use the shared styles from style.css as a base */
/* Add game-specific styles here */

.your-game-specific-class {
    /* Your custom styles */
}
```

#### Game Logic (js/your-game.js)

```javascript
// Game state
let gameState = 'menu';
let score = 0;

// DOM elements
const startBtn = document.querySelector('.btn-primary');

// Initialize
startBtn.addEventListener('click', startGame);

function startGame() {
    // Your game logic here
}
```

### Step 3: Add to Main Menu

Edit `index.html` to add your game:

```html
<a href="your-game.html" class="btn-primary" style="text-decoration: none; display: block; text-align: center;">
    🎮 Your Game Name
    <div style="font-size: 0.8em; font-weight: 400; margin-top: 5px;">
        Brief description • Key feature • Player count
    </div>
</a>
```

### Step 4: Firebase Setup (If Multi-Player)

#### 4a. Create Firebase Config (if not exists)

```javascript
// js/firebase-your-game.js
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, set, onValue, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, set, onValue, update };
```

#### 4b. Room System Pattern

```javascript
import { database, ref, set, onValue, update } from './firebase-your-game.js';

// Generate room code
function generateRoomCode() {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += letters[Math.floor(Math.random() * letters.length)];
    }
    return code;
}

// Create room
async function createRoom() {
    const roomCode = generateRoomCode();

    const roomData = {
        code: roomCode,
        created: Date.now(),
        players: [],
        gameState: 'waiting',
        // Add your game-specific data
    };

    await set(ref(database, `rooms/${roomCode}`), roomData);
    return roomCode;
}

// Join room
async function joinRoom(code, playerName) {
    const roomRef = ref(database, `rooms/${code}`);

    onValue(roomRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            // Update players list
            const players = data.players || [];
            players.push(playerName);
            update(roomRef, { players });
        }
    }, { onlyOnce: true });
}

// Listen for updates
function listenForUpdates(roomCode, callback) {
    const roomRef = ref(database, `rooms/${roomCode}`);
    onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        callback(data);
    });
}
```

## Common UI Patterns

### Shared CSS Classes (from style.css)

```css
.container         /* Main wrapper */
.screen           /* Game screen card */
.btn-primary      /* Purple gradient button */
.btn-secondary    /* Gray button */
.hidden           /* Hide element */
```

### Mobile-First Design

Always design for mobile first:

```css
/* Base styles for mobile */
.game-board {
    width: 100%;
    padding: 10px;
}

/* Desktop enhancements */
@media (min-width: 768px) {
    .game-board {
        max-width: 600px;
        padding: 20px;
    }
}
```

### Touch-Friendly Targets

```css
.touch-target {
    min-height: 44px;  /* iOS minimum */
    min-width: 44px;
    padding: 12px;
}
```

## Game Ideas to Implement

### Easy (1-2 hours)
- **Memory Match** - Flip cards, find pairs
- **Whack-a-Mole** - Tap targets, high score
- **Color Match** - React when colors match
- **Word Scramble** - Unscramble words

### Medium (2-4 hours)
- **Drawing Game** - One draws, others guess (Pictionary)
- **Card Game** - Cards Against Humanity style
- **Racing Game** - Navigate obstacles to finish line
- **Trivia Teams** - Team-based trivia

### Advanced (4+ hours)
- **Real-Time Drawing** - Collaborative canvas
- **Poker** - Full card game with betting
- **Monopoly** - Board game mechanics
- **Charades Generator** - Prompt display with timer

## Testing Checklist

Before pushing your game:

- [ ] Works on mobile (tested on phone)
- [ ] Works on desktop
- [ ] Room codes work (if multiplayer)
- [ ] No JavaScript errors in console
- [ ] Responsive design (looks good at all sizes)
- [ ] Added to main menu (index.html)
- [ ] Updated README.md with game description

## Deployment

```bash
# Stage changes
git add .

# Commit
git commit -m "Add [Your Game Name] - description"

# Push to GitHub (deploys automatically)
git push origin master
```

GitHub Pages will auto-deploy in 1-2 minutes.

## Tips & Best Practices

### Performance
- Keep images small (<100KB)
- Use CSS animations over JavaScript
- Minimize Firebase reads/writes

### UX
- Show loading states
- Provide clear feedback on actions
- Handle errors gracefully
- Add sound effects (optional)

### Code
- Use semantic HTML
- Comment complex logic
- Keep functions small and focused
- Use const/let, not var

## Need Help?

Check existing games for reference:
- **Simple game:** trivia.html (no Firebase)
- **Complex game:** battleships.html (with Firebase)

## Firebase Rules (for reference)

Current rules (test mode):
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**Note:** These are open for development. Tighten for production!

---

**Happy game building! 🎮**
