# 🃏 Cards Against Humanity

**Type:** Party Card Game
**Players:** 3-8 (best with 4-6)
**Duration:** 20-40 minutes
**Live URL:** https://spike1990ai.github.io/party-games/cards-against-humanity.html

---

## 📖 Overview

Cards Against Humanity is the party game for horrible people. Each round, one player is the Card Czar who reads a black card with a question or fill-in-the-blank. Everyone else submits their funniest white card answer. The Czar picks the winner!

### Game Concept

- **Adult Humor** - Dark, offensive, and hilarious content
- **3-8 Players** - More players = more chaos
- **Card Czar System** - Rotating judge each round
- **Submit Funniest Card** - Match your white card to the black card prompt
- **Points to Win** - First to 5, 7, or 10 points wins (configurable)

---

## 🎮 How to Play

1. **Create/Join Room** - Host sets winning score (5/7/10 points), share 4-letter code
2. **Lobby** - Wait for 3-8 players to join
3. **Each Round:**
   - Card Czar (👑) reads black card aloud
   - Other players submit one white card from their hand
   - Czar reviews all submissions (anonymously)
   - Czar picks the funniest - that player gets 1 point
   - Czar rotates to next player
4. **Winner!** - First player to reach target score wins

---

## 🏗️ Architecture

### Technology Stack
- HTML5 / CSS3 / ES6 Modules
- Firebase Realtime Database
- Mobile-first responsive design

### Key Files
- `cards-against-humanity.html` - Game interface (161 lines)
- `js/cah-game.js` - Game logic (660 lines)
- `css/cah.css` - Styles (422 lines)
- `js/firebase-battleships.js` - Shared Firebase config

### State Management
- **Screens:** Join → Lobby → Game (with sub-states: Submit/Judge/Winner/GameOver)
- **Firebase Sync:** Real-time card submissions and judging
- **Round System:** Rotating Card Czar, automated turn progression

---

## ✅ Compliance Status

**Mobile-First:** ⚠️ UNKNOWN
- Touch targets: Not audited
- Font sizes: Likely compliant
- Responsive: Not verified

**JavaScript Patterns:** ⚠️ UNKNOWN
- Not included in COMPLIANCE_AUDIT_REPORT.md
- Likely has similar issues to other games (listener cleanup, button protection, etc.)

**Last Updated:** 2025-12-26

**Note:** Cards Against Humanity was not included in the compliance audit - status unknown.

---

## 🐛 Known Issues

**⚠️ NOT AUDITED**

This game was not included in COMPLIANCE_AUDIT_REPORT.md, so compliance status is unknown.

Likely issues (based on other games):
- Firebase listener cleanup
- Button disabled protection
- CSS variables integration
- Centralized screen management

See `BUG_FIXES.md` for potential issues.

---

## 🎯 Game Mechanics

### Card System
- **Black Cards:** Questions or fill-in-the-blank prompts
- **White Cards:** Answer options (nouns, phrases, concepts)
- **Hand Size:** 10 white cards per player
- **Card Draw:** Automatically refill to 10 after each round

### Scoring
- 1 point per round win
- Configurable winning score: 5, 7, or 10 points
- Ties possible if multiple players reach target in same round

### Card Czar Rotation
- Round-robin order (Player 1 → 2 → 3... → back to 1)
- Czar doesn't submit cards - only judges
- Every player gets equal turns as Czar

---

## 📋 Related Documentation

- [BUG_FIXES.md](./BUG_FIXES.md) - Potential compliance issues (not audited)
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [../../MOBILE_GAME_DEVELOPMENT_GUIDE.md](../../MOBILE_GAME_DEVELOPMENT_GUIDE.md) - Development standards
- [../../CENTRAL_STYLING_PROTOCOL.md](../../CENTRAL_STYLING_PROTOCOL.md) - Design system
- [../../COMPLIANCE_AUDIT_REPORT.md](../../COMPLIANCE_AUDIT_REPORT.md) - Compliance audit (CAH not included)
