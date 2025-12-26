# Battleships - Bug Fixes

**Last Updated:** 2025-12-26

---

## 🚨 CRITICAL - NOT PRODUCTION READY

**Status:** ❌ 7 critical issues prevent deployment

**Source:** COMPLIANCE_AUDIT_REPORT.md (2025-12-26)

**Estimated Fix Time:** 3-4 hours

---

## 🐛 Critical Bugs Identified

### 1. No Centralized Screen Management
**Status:** ❌ UNFIXED
**Date Identified:** 2025-12-26

**Bug:** Uses direct classList manipulation in 7 locations throughout js/battleships.js
**Risk:** Multiple screens can show simultaneously, causing UI conflicts
**Impact:** Game-breaking - players see wrong screens or overlapping content

**Example:**
```javascript
// CURRENT (error-prone):
joinScreen.classList.add('hidden');
teamScreen.classList.remove('hidden');

// NEEDED:
showScreen('teamScreen');
```

**Fix Required:** Add `showScreen()` function with state tracking (see Herd Mentality implementation)

**Files:** `js/battleships.js`

**Reference:** MOBILE_GAME_DEVELOPMENT_GUIDE.md - Centralized Screen Management pattern

---

### 2. Firebase Listeners Never Cleaned Up
**Status:** ❌ UNFIXED
**Date Identified:** 2025-12-26

**Bug:** 5+ Firebase listeners persist after screen transitions
**Risk:** SEVERE memory leak - listeners fire indefinitely
**Impact:** Random game-breaking bugs, kicks, duplicate events

**Locations:** All `onValue()` calls in js/battleships.js

**Fix Required:**
```javascript
let gameListener = null;

function setupListener() {
    // Cleanup existing
    if (gameListener) {
        gameListener();
        gameListener = null;
    }

    // Create new
    gameListener = onValue(roomRef, (snapshot) => {
        // ... game logic
    });
}

// CRITICAL: Clean up before ALL transitions
if (gameListener) {
    gameListener();
    gameListener = null;
}
```

**Files:** `js/battleships.js`

**Reference:** MOBILE_GAME_DEVELOPMENT_GUIDE.md - Firebase Listener Cleanup

---

### 3. Grid Cells Below 44px Touch Target
**Status:** ❌ UNFIXED
**Date Identified:** 2025-12-26

**Bug:** Grid cells are ~30px, below WCAG 2.1 Level AAA minimum (44px)
**Risk:** Touch accuracy issues on mobile
**Impact:** Players miss-tap grid cells, frustrating gameplay

**Current:** 10x10 grid cells ~30px each
**Required:** Minimum 44px per cell

**Fix Required:**
1. Reduce grid to 8x8 OR
2. Use horizontal scroll for 10x10 grid with 44px cells OR
3. Redesign grid layout for mobile

**Files:** `css/battleships.css` - `.board` grid sizing

**Reference:** MOBILE_GAME_DEVELOPMENT_GUIDE.md - Touch Targets

---

### 4. No CSS Variables Imported
**Status:** ❌ UNFIXED
**Date Identified:** 2025-12-26

**Bug:** All colors, spacing, and fonts are hardcoded
**Risk:** Inconsistent design, difficult maintenance
**Impact:** Doesn't follow design system standards

**Fix Required:**
```css
/* Top of battleships.css */
@import '../variables.css';

.button {
    background: var(--gradient-primary);
    min-height: var(--touch-min);
    font-size: var(--font-size-base);
    border-radius: var(--radius-md);
}
```

**Files:** `css/battleships.css`

**Reference:** CENTRAL_STYLING_PROTOCOL.md

---

### 5. No Button Disabled Protection
**Status:** ❌ UNFIXED
**Date Identified:** 2025-12-26

**Bug:** Users can click buttons multiple times during async Firebase operations
**Risk:** Race conditions, duplicate writes, game state corruption
**Impact:** Random bugs, double-placement of ships, multiple fire events

**Affected Buttons:**
- create1v1Btn
- create2v2Btn
- joinRoomBtn
- joinGameBtn
- readyBtn
- Fire buttons

**Pattern Required:**
```javascript
document.getElementById('btn').addEventListener('click', async () => {
    const btn = document.getElementById('btn');
    if (btn.disabled) return;
    btn.disabled = true;

    try {
        await asyncOperation();
    } catch (error) {
        btn.disabled = false; // Re-enable on error
        throw error;
    }

    // Keep disabled on success (transition away)
});
```

**Files:** `js/battleships.js`

**Reference:** MOBILE_GAME_DEVELOPMENT_GUIDE.md - Button Disabled Protection

---

### 6. No Host Verification
**Status:** ❌ UNFIXED
**Date Identified:** 2025-12-26

**Bug:** Two players joining simultaneously can both become host
**Risk:** Race condition on join
**Impact:** Duplicate hosts, game logic breaks

**Fix Required:**
```javascript
// After player joins, verify host status from server
const verifySnapshot = await new Promise((resolve) => {
    onValue(roomRef, resolve, { onlyOnce: true });
});
const verifiedData = verifySnapshot.val();
isHost = verifiedData.host === playerName;
```

**Files:** `js/battleships.js` - join room logic

**Reference:** HERD_MENTALITY_STABILIZATION.md - Host Detection Race Condition

---

### 7. No Stale Data Prevention
**Status:** ❌ UNFIXED
**Date Identified:** 2025-12-26

**Bug:** setTimeout captures data from closures, can show stale state
**Risk:** Results/scores shown with old data
**Impact:** Confusing UX, wrong winner displayed

**Fix Required:**
```javascript
setTimeout(async () => {
    // Fetch fresh data BEFORE showing results
    const freshSnapshot = await new Promise((resolve) => {
        onValue(roomRef, resolve, { onlyOnce: true });
    });
    showResults(freshSnapshot.val());
}, 2000);
```

**Files:** `js/battleships.js` - any setTimeout using captured data

**Reference:** HERD_MENTALITY_STABILIZATION.md - Stale Data in setTimeout

---

## 📊 Bug Summary

| Type | Count | Status |
|------|-------|--------|
| Critical JavaScript Bugs | 5 | ❌ All Unfixed |
| Critical UX Bugs | 2 | ❌ All Unfixed |
| **TOTAL** | **7** | **❌ 0% Fixed** |

---

## 🎯 Current Status

**Game is NOT production-ready** - critical bugs prevent deployment.

All issues identified but NO fixes implemented yet.

**Next Steps:**
1. Implement `showScreen()` centralized screen management
2. Add Firebase listener cleanup (5+ locations)
3. Fix grid touch targets (redesign for 44px)
4. Import CSS variables from design system
5. Add button disabled protection (6+ buttons)
6. Add host verification on join
7. Prevent stale data with fresh fetches

---

## 📋 Related Documentation

- [README.md](./README.md) - Game overview
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [../../COMPLIANCE_AUDIT_REPORT.md](../../COMPLIANCE_AUDIT_REPORT.md) - Full audit with code examples
- [../../MOBILE_GAME_DEVELOPMENT_GUIDE.md](../../MOBILE_GAME_DEVELOPMENT_GUIDE.md) - Fix patterns and examples
- [../../HERD_MENTALITY_STABILIZATION.md](../../HERD_MENTALITY_STABILIZATION.md) - Reference implementation
