# Changelog - Party Games

All notable changes to the Party Games project (cross-game changes, main menu, documentation) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-12-26

### Added
- **Same-Room Party Mode Patterns** section to MOBILE_GAME_DEVELOPMENT_GUIDE.md (776 lines)
  - Sound & Audio management with iOS unlock pattern
  - Wake Lock API to prevent screen sleep during gameplay
  - Celebration animations (confetti, winner overlays)
  - Large visibility design (4rem room codes readable across room)
  - Haptic feedback patterns (success, error, your turn, winner)
  - Pacing controls (countdown timers, host skip buttons)
  - Location: `MOBILE_GAME_DEVELOPMENT_GUIDE.md:603-1377`

### Changed
- **Main menu game card naming** - "Museum Heist" renamed to "Escape Rooms" to reflect that 3 scenarios are available
  - Location: `index.html:38`

### Fixed
- **Game grid layout** - Main menu game cards now display in responsive grid instead of single column
  - Added `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` to base `.game-grid` class
  - Grid automatically adapts from 1-3 columns based on screen width
  - Location: `css/style.css`

## [1.0.0] - 2025-12-26

### Added
- Initial release with 6 party games:
  - Trivia Showdown (4 players, 10 questions)
  - Battleships (1v1 or 2v2)
  - Minefield Race (1-4 players)
  - Herd Mentality (4 players)
  - Escape Rooms (4 players, 3 scenarios)
  - Territory Wars (2-4 players)
- Mobile-first responsive design
- Firebase real-time multiplayer
- CSS variable-based design system
- Mobile Game Development Guide
- Technical Reference documentation
