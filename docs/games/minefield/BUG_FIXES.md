# Minefield Race - Bug Fixes

**Last Updated:** 2025-12-26

---

## ⚠️ CRITICAL - 4 Issues Prevent Production Deployment

**Status:** ⚠️ 4 critical issues identified
**Source:** COMPLIANCE_AUDIT_REPORT.md (2025-12-26)
**Estimated Fix Time:** 2 hours

---

## 🐛 Critical Bugs Identified

### 1. Firebase Listener Never Unsubscribed
**Status:** ❌ UNFIXED
**Date Identified:** 2025-12-26

**Bug:** Game listener created but never cleaned up on leave
**Risk:** SEVERE memory leak - listener fires indefinitely after leaving room
**Impact:** Background Firebase updates, random bugs, performance degradation

**Fix Required:**
```javascript
let gameListener = null;

function setupGameListener() {
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

// In leaveLobby() function - CRITICAL:
function leaveLobby() {
    if (gameListener) {
        gameListener();
        gameListener = null;
    }
    // ... rest of leave logic
}
```

**Files:** `js/minefield.js` - All onValue() calls + leaveLobby() function

**Reference:** MOBILE_GAME_DEVELOPMENT_GUIDE.md - Firebase Listener Cleanup

---

### 2. No CSS Variables Imported
**Status:** ❌ UNFIXED
**Date Identified:** 2025-12-26

**Bug:** All colors and spacing hardcoded, not using design system
**Risk:** Inconsistent design, difficult maintenance
**Impact:** Doesn't follow project standards, harder to update theme

**Fix Required:**
```css
/* Top of minefield.css */
@import '../variables.css';

.button {
    background: var(--gradient-primary);
    min-height: var(--touch-min);
    font-size: var(--font-size-base);
    border-radius: var(--radius-md);
    padding: var(--space-md);
}

.game-grid {
    gap: var(--space-sm);
}
```

**Files:** `css/minefield.css`

**Reference:** CENTRAL_STYLING_PROTOCOL.md

---

### 3. Move Buttons Unprotected (Duplicate-Click Race Condition)
**Status:** ❌ UNFIXED
**Date Identified:** 2025-12-26

**Bug:** Move buttons (↖ ↑ ↗) can be clicked multiple times during async move
**Risk:** Race condition - duplicate moves sent to Firebase
**Impact:** Player moves twice, game state corrupted, unfair advantage

**Affected Buttons:**
- moveUpLeftBtn
- moveUpBtn
- moveUpRightBtn

**Pattern Required:**
```javascript
async function handleMove(direction) {
    const btn = document.getElementById('moveUpBtn'); // or whichever button
    if (btn.disabled) return;
    btn.disabled = true;

    try {
        await updatePlayerPosition(direction);
    } catch (error) {
        btn.disabled = false; // Re-enable on error
        throw error;
    }

    // Keep disabled on success (wait for next turn)
}
```

**Files:** `js/minefield.js` - Move button event handlers

**Reference:** MOBILE_GAME_DEVELOPMENT_GUIDE.md - Button Disabled Protection

---

### 4. No Listener Cleanup on Home Button
**Status:** ❌ UNFIXED
**Date Identified:** 2025-12-26

**Bug:** Listener persists after clicking "Leave Room" button
**Risk:** Firebase updates continue in background
**Impact:** Memory leak, potential crashes, wasted Firebase reads

**Fix Required:**
```javascript
// In leaveLobby() function:
function leaveLobby() {
    // CRITICAL: Clean up Firebase listener FIRST
    if (gameListener) {
        gameListener();
        gameListener = null;
    }

    // Then navigate
    showScreen('joinScreen');
}
```

**Files:** `js/minefield.js` - leaveLobby() function

**Reference:** Same as Bug #1 - Firebase Listener Cleanup

---

## 📊 Bug Summary

| Type | Count | Status |
|------|-------|--------|
| Critical Memory Leaks | 2 | ❌ Unfixed |
| Critical Race Conditions | 1 | ❌ Unfixed |
| Design System Compliance | 1 | ❌ Unfixed |
| **TOTAL** | **4** | **❌ 0% Fixed** |

---

## 🎯 Current Status

**Game is playable but NOT production-ready** - memory leaks and race conditions prevent deployment.

All issues identified but NO fixes implemented yet.

**Next Steps:**
1. Add Firebase listener cleanup in leaveLobby() and all transitions
2. Protect move buttons from duplicate clicks (3 buttons)
3. Import CSS variables from design system
4. Verify listener cleanup with Firebase DevTools

---

## 📋 Related Documentation

- [README.md](./README.md) - Game overview
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [../../COMPLIANCE_AUDIT_REPORT.md](../../COMPLIANCE_AUDIT_REPORT.md) - Full audit with code examples
- [../../MOBILE_GAME_DEVELOPMENT_GUIDE.md](../../MOBILE_GAME_DEVELOPMENT_GUIDE.md) - Fix patterns
- [../../HERD_MENTALITY_STABILIZATION.md](../../HERD_MENTALITY_STABILIZATION.md) - Reference implementation
