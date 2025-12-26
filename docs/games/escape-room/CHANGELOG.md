# Changelog - Escape Rooms

All notable changes to the Escape Rooms game will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-12-26

### Fixed
- **Victory screen stuck bug** - Game now correctly shows victory screen after completing room 8. Previously hardcoded `currentRoom: 4` on victory, now uses `currentRoom: TOTAL_ROOMS + 1` (9) to properly trigger victory state check.
  - Location: `js/escape-room.js:523`

- **Race condition on simultaneous submissions** - Multiple players submitting at the same time no longer get conflicting results. Implemented global submission lock using Firebase `isSubmitting` flag.
  - When Player A submits → lock engages, all other players blocked
  - After processing → lock releases
  - Prevents stale room data causing wrong answer validation
  - Players see "Someone is submitting..." message when locked
  - Location: `js/escape-room.js:102-113, 527-540`

- **Players getting left behind** - All players now automatically advance to the next room when any player solves the current room. Added room change detection to Firebase listener that reloads screen for all players when `currentRoom` increments.
  - Location: `js/escape-room.js:393-407`

## [1.0.0] - 2025-12-26

### Added
- Initial release with 3 escape room scenarios:
  - Museum Heist (8 rooms, 35 minutes)
  - Prison Break (8 rooms, 35 minutes)
  - Hitler's Bunker (8 rooms, 35 minutes)
- Real-time multiplayer via Firebase
- Distributed clue system (4 roles: Scout, Hacker, Insider, Safecracker)
- Hint system (5 hints per game)
- Victory/failure screens with statistics
- Room code system for joining games
