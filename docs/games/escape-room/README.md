# 🔐 Escape Room

**Type:** Cooperative Puzzle Game
**Players:** 1-4 (optimized for 4)
**Duration:** 35 minutes
**Live URL:** https://spike1990ai.github.io/party-games/escape-room.html

---

## 📖 Overview

Escape Room is a cooperative puzzle game where players work together to solve a series of 8 rooms by combining their unique clues. Each player receives different information that must be shared and discussed to progress.

### Game Concept

- **3 Scenarios Available:**
  - 🏛️ Museum Heist - Steal the diamond before security arrives!
  - ⛓️ Prison Break - Escape before the guards return!
  - 🎖️ Hitler's Bunker - Escape the Führer's underground lair!

- **8 Rooms per Scenario** - Each with unique puzzle requiring team discussion
- **4 Roles per Game** - Scout, Hacker, Insider, Safecracker
- **35 Minutes to Complete** - Mobile-friendly timing
- **5 Hints Available** - Use wisely!

---

## 🎮 How to Play

1. **Create/Join Room** - One player creates room with 4-letter code, others join
2. **Select Scenario** - Host picks Museum Heist, Prison Break, or Hitler's Bunker
3. **Get Roles** - Each player automatically assigned a unique role
4. **Solve Rooms** - Share your clues, discuss, submit answers
5. **Escape!** - Complete all 8 rooms before time runs out

---

## 🧩 Puzzle Design Philosophy

**Dec 2024 Overhaul:** All 24 rooms redesigned for meaningful collaboration.

### Before (Too Easy)
- Scout: "BERL..."
- Hacker: "...IN"
- **Answer:** BERLIN *(just concatenation)*

### After (Requires Discussion)
- Scout: "Map shows red X on the German capital"
- Hacker: "Telegraph routing: BER-LIN sector - 6 letters"
- Insider: "Hitler: I will never leave my beloved capital"
- Safecracker: "Safe dial: 6 letters, starts with B"
- **Answer:** BERLIN *(team must deduce)*

Each role provides **different TYPE** of information:
- **Scout:** Visual observations, locations
- **Hacker:** Data, formats, character counts
- **Insider:** Overheard context, emotional clues
- **Safecracker:** Physical patterns on locks

---

## 🏗️ Architecture

### Technology Stack
- HTML5 / CSS3 / ES6 Modules
- Firebase Realtime Database
- Mobile-first responsive design

### Key Files
- `escape-room.html` - Game interface
- `js/escape-room.js` - Game logic (533 lines)
- `js/scenarios.js` - Puzzle data (340 lines, 24 rooms)
- `css/escape-room.css` - Styles
- `js/firebase-battleships.js` - Shared Firebase config

### State Management
- **Screens:** Join → Lobby → Game → Victory/Failure
- **Centralized:** `showScreen()` function prevents duplicate displays
- **Firebase Sync:** Real-time room state across all players

---

## ✅ Compliance Status

**Mobile-First:** ✅ Full compliance
- Touch targets: 44px (WCAG 2.1)
- Font sizes: 16px minimum
- Responsive: 360px → tablet

**JavaScript Patterns:** ✅ Full compliance
- Centralized screen management
- Firebase listener cleanup (2 listeners)
- Button disabled protection (6 buttons)

**Last Updated:** 2025-12-26

---

## 🐛 Known Issues

**None!** All critical bugs fixed as of Dec 2024.

See `BUG_FIXES.md` for full history.

---

## 📋 Related Documentation

- [BUG_FIXES.md](./BUG_FIXES.md) - Complete bug fix history
- [BUILD_PLAN.md](./BUILD_PLAN.md) - Architecture and build plan
- [../../MOBILE_GAME_DEVELOPMENT_GUIDE.md](../../MOBILE_GAME_DEVELOPMENT_GUIDE.md) - Development standards
- [../../CENTRAL_STYLING_PROTOCOL.md](../../CENTRAL_STYLING_PROTOCOL.md) - Design system
