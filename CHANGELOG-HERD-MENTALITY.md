# Herd Mentality (Follow the Herd) - Changelog

## [2025-12-26] - Major Stability & Disconnection Fixes

### Fixed
- **Disconnected players block game** - Game now only counts connected players when checking if all have answered
  - Added `getConnectedPlayerCount()` helper function to filter out disconnected players
  - Updated all player count checks throughout the game (lobby, question screen, waiting screen)
  - Disconnected players are now greyed out and marked with "(disconnected)" label

- **No host migration** - Game automatically elects new host when current host disconnects
  - Added `checkAndMigrateHost()` function that runs on every Firebase update
  - New host is elected based on earliest join time among connected players
  - Host migration runs in lobby, waiting screen, and results screen
  - "Next Round" button visibility updates automatically for new host

- **No timeout mechanism** - Added 60-second auto-proceed when not all players have answered
  - Game automatically shows results after 60 seconds if waiting for answers
  - Prevents indefinite waiting when players are slow or disconnected
  - Timeout is cleared if all connected players answer before time runs out

- **Answer race conditions** - Fixed simultaneous answer submission issues
  - Changed from read-modify-write pattern to atomic path updates
  - Each player's answer now updates to `rooms/{code}/answers/{playerId}` directly
  - Prevents answers from being overwritten when multiple players submit simultaneously
  - Added timestamp to each answer for tracking

### Added
- **Skip button for host** - Host can manually skip to results after 30 seconds
  - Button appears on waiting screen after 30 seconds if not all players have answered
  - Allows host to proceed if a player is taking too long
  - Clears both answer timeout and skip button timeout when clicked

- **Visual disconnection indicators**
  - Disconnected players shown with 50% opacity and strikethrough
  - "(disconnected)" status label added to disconnected players
  - CSS styling added for `.player-item.disconnected` class

### Technical Details
**Files Modified:**
- `js/herd-mentality.js`
  - Added timeout variables: `answerTimeout`, `skipButtonTimeout`
  - Added helper functions: `getConnectedPlayerCount()`, `checkAndMigrateHost()`
  - Updated answer submission to use atomic Firebase updates
  - Added skip button logic and event listener
  - Modified all player count calculations to filter disconnected players

- `herd-mentality.html`
  - Added skip button to waiting screen: `<button id="skipToResultsBtn">`

- `css/herd-mentality.css`
  - Added `.player-item.disconnected` styles (opacity, strikethrough)
  - Added `.player-item .status` styles for disconnection label

**Root Causes:**
1. Game checked `answerCount === playerCount` but disconnected players stayed in `players` object
2. No mechanism to transfer host role when host left
3. Answer updates used read-modify-write on entire `answers` object (race condition)
4. No timeout or manual skip option for slow/disconnected players

**Testing Notes:**
- Requires real devices to fully test disconnection scenarios
- Host migration should be tested with 3+ players
- Skip button should appear exactly 30 seconds after entering waiting screen
- Auto-timeout should force results exactly 60 seconds after entering waiting screen
