# 🎯 Trivia Showdown

**Type:** Quiz Game
**Players:** 1 (Solo)
**Duration:** 5-10 minutes
**Live URL:** https://spike1990ai.github.io/party-games/trivia.html

---

## 📖 Overview

Trivia Showdown is a fast-paced quiz game where speed equals points. Answer 10 questions correctly and quickly to maximize your score. The faster you answer, the more points you earn!

### Game Concept

- **10 Questions** - Random trivia from multiple categories
- **Speed-Based Scoring** - Faster answers = more points
- **Multiple Choice** - 4 options per question
- **20-Second Timer** - Answer before time runs out
- **Categories** - Science, History, Geography, Entertainment, Sports, and more

---

## 🎮 How to Play

1. **Start Game** - Questions load automatically
2. **Read Question** - See category and question text
3. **Select Answer** - Tap one of 4 multiple choice options
4. **Immediate Feedback** - See if you're correct (green) or wrong (red)
5. **Next Question** - Automatically advances after feedback
6. **Results** - See final score, stats, and play again

---

## 🏗️ Architecture

### Technology Stack
- HTML5 / CSS3 / Vanilla JavaScript
- Open Trivia Database API
- Mobile-first responsive design

### Key Files
- `trivia.html` - Game interface
- `js/game.js` - Game logic (296 lines)
- `css/trivia.css` - Minimal game-specific styles (11 lines)
- `css/style.css` - Base styles (shared)

### State Management
- **Screens:** Loading → Game → Results
- **No Firebase:** Solo game, no multiplayer
- **API Integration:** Fetches questions from Open Trivia DB

---

## ⚠️ Compliance Status

**Mobile-First:** ✅ MOSTLY COMPLIANT
- Touch targets: 44px ✅
- Font sizes: 16px minimum ✅
- Responsive: 360px → tablet ✅

**JavaScript Patterns:** ⚠️ MINOR ISSUES (2 non-critical)
- No dedicated CSS file (uses minimal trivia.css)
- CSS variables not fully utilized

**Last Updated:** 2025-12-26

---

## 🐛 Known Issues

**⚠️ 2 MINOR ISSUES** - See `BUG_FIXES.md`

**Minor Issues:**
1. No dedicated CSS file (only 11 lines in trivia.css)
2. CSS variables not fully utilized (could improve consistency)

**Game is production-ready** - issues are cosmetic/maintenance improvements only.

---

## 🎯 Scoring System

### Points Calculation
- **Base Points:** 100 per correct answer
- **Time Bonus:** Up to 100 bonus points based on speed
- **Formula:** `points = 100 + (timeRemaining * 5)`
- **Maximum per question:** 200 points (answered instantly)

### Statistics Tracked
- Final score
- Correct answers (X/10)
- Average answer time
- Fastest answer time

---

## 📋 Related Documentation

- [BUG_FIXES.md](./BUG_FIXES.md) - Minor issues (non-critical)
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [../../MOBILE_GAME_DEVELOPMENT_GUIDE.md](../../MOBILE_GAME_DEVELOPMENT_GUIDE.md) - Development standards
- [../../CENTRAL_STYLING_PROTOCOL.md](../../CENTRAL_STYLING_PROTOCOL.md) - Design system
- [../../COMPLIANCE_AUDIT_REPORT.md](../../COMPLIANCE_AUDIT_REPORT.md) - Full audit details
