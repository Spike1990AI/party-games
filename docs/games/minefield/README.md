# 💣 Minefield Race

**Type:** Racing Puzzle Game
**Players:** 1-4
**Duration:** 5-15 minutes
**Live URL:** https://spike1990ai.github.io/party-games/minefield.html

---

## 📖 Overview

Minefield Race is a turn-based racing game where players navigate through a dangerous minefield to reach the top. Move up, up-left, or up-right - but hit a mine and you restart from the bottom!

### Game Concept

- **Navigate the Minefield** - Move upward through hidden mines
- **1-4 Players** - Solo or multiplayer racing
- **High Score Tracking** - Solo mode saves your best run
- **Progressive Difficulty** - Higher rows have more mines
- **Turn-Based Gameplay** - 10 seconds per turn
- **Real-time Competition** - Race other players simultaneously

---

## 🎮 How to Play

1. **Create/Join Room** - Enter your name, create or join with code
2. **Lobby** - Wait for players (1-4), see high score
3. **Navigate!** - On your turn, move up (↑), up-left (↖), or up-right (↗)
4. **Avoid Mines** - Hit a mine = restart from bottom
5. **Race to Top** - First to reach the top row wins!

---

## 🏗️ Architecture

### Technology Stack
- HTML5 / CSS3 / ES6 Modules
- Firebase Realtime Database
- Mobile-first responsive design

### Key Files
- `minefield.html` - Game interface
- `js/minefield.js` - Game logic (827 lines)
- `css/minefield.css` - Styles (355 lines)
- `js/firebase-battleships.js` - Shared Firebase config

### State Management
- **Screens:** Join → Lobby → Game → Victory
- **Centralized:** `showScreen()` function for transitions
- **Firebase Sync:** Real-time player positions and mine locations
- **High Score:** Persistent localStorage tracking

---

## ⚠️ Compliance Status

**Mobile-First:** ✅ PARTIAL COMPLIANCE
- Touch targets: 44px ✅
- Font sizes: 16px minimum ✅
- Responsive: 360px → tablet ✅

**JavaScript Patterns:** ❌ NON-COMPLIANT (4 critical issues)
- Firebase listener never unsubscribed (memory leak)
- No CSS variables imported
- Move buttons unprotected (race condition)
- No listener cleanup on home button

**Last Updated:** 2025-12-26

---

## 🐛 Known Issues

**⚠️ 4 CRITICAL ISSUES** - See `BUG_FIXES.md`

**Major Issues:**
1. Firebase listener memory leak on leave
2. Move buttons allow duplicate clicks
3. No CSS variable integration
4. Listener persists after leaving room

**Game is playable but not production-ready.**

---

## 🎯 Game Mechanics

### Mine Generation
- Mines randomly placed each game
- Higher rows = more mines (progressive difficulty)
- All players see same mine layout

### Movement System
- 3 directions: Up-left (↖), Up (↑), Up-right (↗)
- 10-second turn timer
- Hit mine = reset to bottom row
- Grid wraps horizontally (edges connect)

### Scoring
- Solo mode: High score saved to localStorage
- Multiplayer: First to top wins
- Mine hits tracked per player

---

## 📋 Related Documentation

- [BUG_FIXES.md](./BUG_FIXES.md) - Critical issues to fix
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [../../MOBILE_GAME_DEVELOPMENT_GUIDE.md](../../MOBILE_GAME_DEVELOPMENT_GUIDE.md) - Development standards
- [../../CENTRAL_STYLING_PROTOCOL.md](../../CENTRAL_STYLING_PROTOCOL.md) - Design system
- [../../COMPLIANCE_AUDIT_REPORT.md](../../COMPLIANCE_AUDIT_REPORT.md) - Full audit details
