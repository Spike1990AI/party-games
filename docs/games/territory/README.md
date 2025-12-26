# 🏰 Territory Wars

**Type:** Strategy Board Game
**Players:** 2-4
**Duration:** 10-20 minutes
**Live URL:** https://spike1990ai.github.io/party-games/territory.html

---

## 📖 Overview

Territory Wars is a strategic tile-placement game where players compete to control the most territory. Place tiles, surround opponents to flip their tiles, and dominate the board!

### Game Concept

- **Tile Capture Gameplay** - Place your colored tiles on the grid
- **Surround to Capture** - Surround opponent tiles to flip them to your color
- **2-4 Players** - Competitive multiplayer
- **Turn-Based Strategy** - 15 seconds per turn
- **Most Territory Wins** - Control the most tiles at game end

---

## 🎮 How to Play

1. **Create/Join Room** - Enter your name, create or join with code
2. **Lobby** - Wait for 2-4 players to join
3. **Place Tiles** - On your turn, tap an empty cell to place your colored tile
4. **Capture Territory** - Surround opponent tiles to flip them to your color
5. **Victory** - Player with most tiles at game end wins!

---

## 🏗️ Architecture

### Technology Stack
- HTML5 / CSS3 / ES6 Modules
- Firebase Realtime Database
- Mobile-first responsive design

### Key Files
- `territory.html` - Game interface
- `js/territory.js` - Game logic (592 lines)
- `css/territory.css` - Styles (448 lines)
- `js/firebase-battleships.js` - Shared Firebase config

### State Management
- **Screens:** Join → Lobby → Game → Victory
- **Centralized:** Screen transitions via showScreen()
- **Firebase Sync:** Real-time board state across all players
- **Turn System:** Round-robin turn order

---

## ✅ Compliance Status

**Mobile-First:** ✅ FULL COMPLIANCE
- Touch targets: 44px (WCAG 2.1)
- Font sizes: 16px minimum
- Responsive: 360px → tablet

**JavaScript Patterns:** ✅ LIKELY COMPLIANT
- No critical issues identified in audit
- Clean implementation
- Proper Firebase patterns

**Last Updated:** 2025-12-26

**Note:** Territory Wars was not flagged in COMPLIANCE_AUDIT_REPORT.md, suggesting good compliance out of the box.

---

## 🐛 Known Issues

**✅ No known critical bugs**

Territory Wars was not mentioned in COMPLIANCE_AUDIT_REPORT.md, indicating it follows mobile-first patterns correctly.

---

## 🎯 Game Mechanics

### Territory Capture
- Place tiles on empty cells
- Surrounding logic: Complete enclosure flips tiles
- Chain reactions possible (flip triggers more flips)

### Turn System
- Round-robin turn order (Player 1 → 2 → 3 → 4)
- 15-second turn timer
- Auto-skip if timer expires

### Victory Conditions
- Game ends when board is full OR time limit reached
- Player with most tiles wins
- Ties broken by turn order (earlier player wins)

---

## 📋 Related Documentation

- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [../../MOBILE_GAME_DEVELOPMENT_GUIDE.md](../../MOBILE_GAME_DEVELOPMENT_GUIDE.md) - Development standards
- [../../CENTRAL_STYLING_PROTOCOL.md](../../CENTRAL_STYLING_PROTOCOL.md) - Design system
- [../../COMPLIANCE_AUDIT_REPORT.md](../../COMPLIANCE_AUDIT_REPORT.md) - Compliance audit (no issues found)
