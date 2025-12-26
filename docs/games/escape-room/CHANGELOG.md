# Escape Room - Changelog

All notable changes to the Escape Room game.

---

## [2.0.0] - 2025-12-26

### 🎉 Major Overhaul - Complete Puzzle Redesign

#### Added
- **24 completely redesigned puzzle rooms** across all 3 scenarios
- Meaningful clues requiring actual team discussion and deduction
- Role-specific information types (Scout=visual, Hacker=data, Insider=context, Safecracker=physical)
- Centralized screen management with `showScreen()` function
- Firebase listener cleanup tracking (2 listeners)
- Button disabled protection on all 6 async buttons
- Comprehensive documentation suite (README, BUG_FIXES, BUILD_PLAN, CHANGELOG)

#### Fixed
- **CRITICAL:** Bunker Room 5 - Wrong WW2 date (091939 → 010939) - THE BUG THAT BROKE HITLER'S BUNKER ⭐
- **CRITICAL:** Museum Room 4 - Wrong January date (251990 → 250190)
- **CRITICAL:** Museum Room 6 - Wrong Bastille Day format (141789 → 140789)
- **CRITICAL:** Museum Room 3 - Broken navigation answer (B4D2A3C1 → NORTH3WEST2SOUTH1)
- Firebase listener memory leaks (lobbyUnsubscribe, gameUnsubscribe)
- Multiple screen display bug (centralized screen management)
- Duplicate button click race conditions (6 buttons protected)

#### Changed
- **Museum Heist:** All 8 room clues redesigned for collaboration
- **Prison Break:** All 8 room clues redesigned for collaboration
- **Hitler's Bunker:** All 8 room clues redesigned for collaboration
- Hints updated to reflect new puzzle style
- All answers validated and tested

### Stats
- **Files Modified:** 2 (scenarios.js, escape-room.js)
- **Lines Changed:** 435+
- **Bugs Fixed:** 37 total (4 critical puzzle bugs, 9 JS stability fixes, 24 quality improvements)
- **Commits:** 3 (`258f1df`, `9b27db3`, `d6046c3`)

---

## [1.0.0] - Initial Release

### Added
- 3 scenarios (Museum Heist, Prison Break, Hitler's Bunker)
- 8 rooms per scenario
- 4 player roles (Scout, Hacker, Insider, Safecracker)
- Firebase multiplayer
- 35-minute timer
- Hint system (5 hints)
- Victory/failure screens

### Known Issues (Fixed in 2.0.0)
- Simplistic clue design (just word fragments)
- 4 critical date/answer bugs
- No Firebase listener cleanup
- No centralized screen management
- No button protection against duplicate clicks
