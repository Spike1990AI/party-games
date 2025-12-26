# 🐑 Herd Mentality

**Type:** Party Question Game
**Players:** 2-4 (optimized for 4)
**Duration:** 10-15 minutes
**Live URL:** https://spike1990ai.github.io/party-games/herd-mentality.html

---

## 📖 Overview

Herd Mentality is a party game where players try to match the majority answer. Think like the herd to score points - but if you're the only one with a unique answer, you get the dreaded Pink Cow!

### Game Concept

- **10 Rounds** - Opinion-based questions each round
- **Match the Majority** - Your answer must match what most players said
- **Pink Cow Penalty** - Sole minority player gets the pink cow
- **Can't Win with Pink Cow** - Must pass it to someone else to win
- **Real-time Multiplayer** - All players answer simultaneously

---

## 🎮 How to Play

1. **Create/Join Room** - Host creates room with 4-letter code, others join
2. **Lobby** - Wait for 2-4 players to join
3. **Answer Question** - Type your answer (lowercase, no pressure!)
4. **Waiting Screen** - See how many players have submitted
5. **Results** - See majority answer, who matched, and pink cow award
6. **Repeat** - 10 rounds total
7. **Winner** - Highest score WITHOUT the pink cow wins!

---

## 🏗️ Architecture

### Technology Stack
- HTML5 / CSS3 / ES6 Modules
- Firebase Realtime Database
- Mobile-first responsive design

### Key Files
- `herd-mentality.html` - Game interface (6 screens)
- `js/herd-mentality.js` - Game logic (608 lines)
- `css/herd-mentality.css` - Game-specific styles
- `js/firebase-battleships.js` - Shared Firebase config + connection monitoring

### State Management
- **Screens:** Join → Lobby → Question → Waiting → Results → Final
- **Centralized:** `showScreen()` function prevents duplicate displays
- **Firebase Sync:** Real-time answer tracking across all players
- **Host-Authoritative:** Only host updates scores/game state

---

## ✅ Compliance Status

**Mobile-First:** ✅ FULL COMPLIANCE
- Touch targets: 44px (WCAG 2.1 Level AAA)
- Font sizes: 16px minimum
- Responsive: 360px → tablet
- iOS Safari optimizations

**JavaScript Patterns:** ✅ FULL COMPLIANCE
- Centralized screen management (`showScreen()`)
- Firebase listener cleanup (lobby + game listeners)
- Button disabled protection (5 buttons)
- Host verification (prevents race condition)
- Stale data prevention (fresh fetches before results)

**Last Updated:** 2025-12-26

---

## 🐛 Known Issues

**✅ FULLY STABILIZED - All bugs fixed!**

See `BUG_FIXES.md` for complete history of 14 bugs fixed across 2 commits:
- **becdfa2** - 5 critical bugs fixed
- **e440512** - 9 stability improvements

**No known bugs.** Game is production-ready.

---

## 🎯 Game Mechanics

### Scoring System
- **+1 point** if your answer matches the majority
- **0 points** if you don't match
- **Pink Cow** awarded to sole minority player (one person not in majority)

### Pink Cow Rules
- Prevents winning even if you have highest score
- Passed to next sole minority player
- Strategic element: Try to avoid unique answers!

### Answer Matching
- All answers lowercase for comparison
- Capitalized for display only
- Exact match required

---

## 📋 Related Documentation

- [BUG_FIXES.md](./BUG_FIXES.md) - Complete stabilization history (14 bugs fixed)
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [../../MOBILE_GAME_DEVELOPMENT_GUIDE.md](../../MOBILE_GAME_DEVELOPMENT_GUIDE.md) - Development standards
- [../../CENTRAL_STYLING_PROTOCOL.md](../../CENTRAL_STYLING_PROTOCOL.md) - Design system
- [../../HERD_MENTALITY_STABILIZATION.md](../../HERD_MENTALITY_STABILIZATION.md) - Detailed technical notes (390 lines)
