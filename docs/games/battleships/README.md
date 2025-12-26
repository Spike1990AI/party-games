# ⚓ Battleships

**Type:** Strategy Board Game
**Players:** 2 (1v1) or 4 (2v2)
**Duration:** 15-25 minutes
**Live URL:** https://spike1990ai.github.io/party-games/battleships.html

---

## 📖 Overview

Battleships is a classic naval combat strategy game where players sink each other's ships through tactical guessing. Place your fleet secretly, then take turns firing at coordinates to locate and destroy the enemy.

### Game Concept

- **2 Game Modes:**
  - 🎯 1v1 Duel - Head-to-head battle (2 players)
  - 🤝 2v2 Teams - Team-based warfare (4 players, 2 per team)

- **5 Ships per Player** - Carrier (5), Battleship (4), Cruiser (3), Submarine (3), Destroyer (2)
- **10x10 Grid** - Classic battleship board layout
- **Turn-Based Combat** - Fire at enemy coordinates, sink all ships to win
- **Team Communication** - 2v2 mode requires strategy between teammates

---

## 🎮 How to Play

1. **Create/Join Room** - Select 1v1 or 2v2, share 4-letter code
2. **Choose Team** (2v2 only) - Join Team 1 (🔵) or Team 2 (🔴)
3. **Place Ships** - Drag ships onto your grid, tap to rotate
4. **Battle!** - Take turns firing at enemy grid
5. **Victory** - First to sink all enemy ships wins

---

## 🏗️ Architecture

### Technology Stack
- HTML5 / CSS3 / ES6 Modules
- Firebase Realtime Database
- Navy-themed UI with gradient styling

### Key Files
- `battleships.html` - Game interface
- `js/battleships.js` - Game logic (734 lines)
- `css/battleships.css` - Styles (585 lines)
- `js/firebase-battleships.js` - Shared Firebase config

### State Management
- **Screens:** Join → Team Select → Setup → Battle → Victory
- **Manual transitions** using direct classList manipulation
- **Firebase Sync:** Real-time board state across all players

---

## ⚠️ Compliance Status

**Mobile-First:** ⚠️ PARTIAL COMPLIANCE
- Grid cells: ~30px (below 44px WCAG 2.1 minimum)
- Font sizes: 16px minimum ✅
- Responsive: 360px → tablet ✅

**JavaScript Patterns:** ❌ NON-COMPLIANT (7 critical issues)
- No centralized screen management
- Firebase listeners never cleaned up (5+ memory leaks)
- No button disabled protection
- No host verification (race condition)
- Hardcoded CSS values (no design system integration)

**Last Updated:** 2025-12-26

---

## 🐛 Known Issues

**CRITICAL - NOT PRODUCTION READY**

See `BUG_FIXES.md` for complete list of 7 critical issues identified in compliance audit.

**Major Issues:**
1. Firebase memory leaks (5+ listeners never unsubscribed)
2. Touch targets too small (<44px)
3. No duplicate-click protection
4. Screen transition conflicts

---

## 📋 Related Documentation

- [BUG_FIXES.md](./BUG_FIXES.md) - Critical issues and fixes needed
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [../../MOBILE_GAME_DEVELOPMENT_GUIDE.md](../../MOBILE_GAME_DEVELOPMENT_GUIDE.md) - Development standards
- [../../CENTRAL_STYLING_PROTOCOL.md](../../CENTRAL_STYLING_PROTOCOL.md) - Design system
- [../../COMPLIANCE_AUDIT_REPORT.md](../../COMPLIANCE_AUDIT_REPORT.md) - Full audit details
