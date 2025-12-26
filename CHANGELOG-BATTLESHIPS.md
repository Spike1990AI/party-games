# Battleships - Changelog

## [2025-12-26] - UI/UX Improvements & Flow Fixes

### Fixed
- **Missing back buttons** - Added navigation back buttons throughout the game
  - Lobby screen can now go back to join screen
  - Placement screen can go back to lobby
  - Allows players to change rooms or restart setup

- **No 1v1 join flow** - Added dedicated "Join Game" button for non-hosts
  - Previously unclear how to join an existing 1v1 game
  - Added prominent "Join Game" button on join screen after entering room code
  - Separated create vs join flows visually

- **Poor text visibility** - Fixed text colors in input fields
  - Changed placeholder and input text to explicit black color
  - Improved contrast for better mobile readability
  - Consistent text styling across all input fields

- **No surrender option** - Added surrender button for active games
  - Players can now forfeit if they want to restart or exit
  - Shows after game starts during battle phase
  - Gracefully handles game end and returns to join screen

### Added
- **Enter key support** - Can press Enter to submit in text inputs
  - Room code input: Enter key triggers "Join Room"
  - Player name input: Enter key triggers "Join Game"
  - Improves desktop/laptop experience (though game is primarily mobile)

- **Better flow indicators** - Clearer UI states and transitions
  - "Create Room" and "Join Game" buttons more visually distinct
  - Better separation of host vs non-host actions
  - Loading states and disabled buttons during operations

### Technical Details
**Files Modified:**
- `battleships.html`
  - Added back button to lobby: `<button id="backToJoinFromLobby">`
  - Added back button to placement: `<button id="backToLobbyFromPlacement">`
  - Added surrender button: `<button id="surrenderBtn">`
  - Added "Join Game" button: `<button id="joinGameBtn">`
  - Added Enter key event listeners for inputs

- `js/battleships.js`
  - Added event listeners for all back buttons
  - Added surrender functionality
  - Added join game flow for non-hosts
  - Added Enter key handlers

- `css/battleships.css` (assumed)
  - Updated input text colors to explicit black
  - Styled new back and surrender buttons

**User Feedback:**
- "sort out the 1v1 logic battleships, also the general flow, we need back buttons etc"
- "black text in white text fields"
- "Enter buttons etc"

**Testing Notes:**
- Back buttons should properly clean up Firebase listeners
- Surrender should work from either player's perspective
- Join flow should work smoothly for 2nd player joining
- Text should be clearly visible in all input fields
- Enter key should work on all relevant input fields
