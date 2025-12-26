# Escape Room - Changelog

## [2025-12-26] - Major Content & Gameplay Improvements

### Fixed
- **Input field clears on every Firebase update** - Critical bug where typing a letter would clear the input
  - Root cause: `showGame()` was called on every Firebase update, resetting the input field
  - Added `lastRoomNumber` tracker to only clear input when room actually changes
  - Input now persists while typing, only clears on successful room transition

- **Clues visible to all players** - Removed "Team Progress" section
  - Original design showed all clues on everyone's screen
  - Changed to show only each player's own clue(s)
  - Forces verbal communication between players as intended
  - Maintains cooperative gameplay design

### Added
- **Three complete scenarios** - Expanded from single Museum Heist to three full scenarios:
  1. **Museum Heist** 💎 - Steal the diamond from a high-security museum (8 rooms)
  2. **Prison Break** ⛓️ - Escape from maximum security prison (8 rooms)
  3. **Hitler's Bunker** 💣 - Escape from WW2 bunker before explosion (8 rooms)

- **Scenario selection screen** - Interactive menu to choose mission before creating/joining room
  - Visual scenario cards with icons, names, and descriptions
  - Hides after selection to show room creation/join options
  - Updates page title and subtitle dynamically based on selected scenario

- **Extended gameplay** - Each scenario now has 8 rooms (up from 3)
  - Gameplay time increased to ~35 minutes per scenario
  - More complex puzzle chains requiring teamwork
  - Each scenario has unique theme, story progression, and puzzle types

- **Dynamic player support** - Supports 1-4 players with intelligent role distribution
  - 1 player: Gets all 4 clues for solo play
  - 2 players: Each gets 2 clues
  - 3 players: 2 players get 2 clues, 1 player gets 1 clue
  - 4 players: Each gets 1 clue (original design)
  - Role distribution is automatic and balanced

### Technical Details
**Files Modified:**
- `js/escape-room.js`
  - Added `lastRoomNumber` variable to track room transitions
  - Modified `showGame()` to only clear input on actual room changes
  - Removed `updateTeamClues()` function call
  - Added scenario selection logic with dynamic title updates

- `escape-room.html`
  - Added scenario selection UI with three scenario cards
  - Removed "Team Progress" section from game screen
  - Updated info section to show "1-4 players" instead of "4 players"

- `js/scenarios.js` (new file)
  - Created complete scenario data structure
  - 3 scenarios × 8 rooms = 24 total rooms
  - Each room has: title, description, clues array (4 clues), answer, hint
  - Scenarios exported as `window.SCENARIOS` object

**Previous Issues:**
- User reported: "we have to type so quick to get though each room is impossible"
  - Actually caused by input clearing bug, not speed issue
- User reported: "we completed the museum in 3 minutes"
  - Original version only had 3 rooms
- User reported seeing each other's clues on screen
  - Defeated purpose of verbal communication gameplay

**Testing Notes:**
- Input should NOT clear while typing
- Input should ONLY clear when moving to next room
- Players should ONLY see their own clues
- Timer should be 35 minutes (2100 seconds)
- Each scenario should have exactly 8 rooms
- 1-player mode should work without waiting for others
