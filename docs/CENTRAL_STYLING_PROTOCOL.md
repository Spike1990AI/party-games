# Central Styling Protocol

**Project:** Party Games Collection
**Live URL:** https://spike1990ai.github.io/party-games/
**Last Updated:** 2025-12-26

---

## 🎨 Core Principle

**ALL GAMES ARE MOBILE-FIRST**

Every design decision prioritizes mobile UX. Desktop is secondary.

---

## 📐 Design System

### Color Palette (variables.css)

```css
:root {
    /* Primary Colors */
    --color-primary: #1e3c72;
    --color-secondary: #2a5298;
    --color-accent: #f97316;

    /* Team Colors */
    --color-team-blue: #2196f3;
    --color-team-red: #ef4444;

    /* Status Colors */
    --color-success: #10b981;
    --color-error: #ef4444;
    --color-warning: #f59e0b;

    /* Neutral Colors */
    --color-white: #ffffff;
    --color-text: #1f2937;
    --color-text-light: #6b7280;
    --color-text-muted: #9ca3af;
    --color-bg: #f3f4f6;
    --color-bg-dark: #e5e7eb;

    /* Gradients */
    --gradient-primary: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    --gradient-warm: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
}
```

### Typography

```css
:root {
    --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

    /* Font Sizes */
    --font-size-xs: 0.75rem;    /* 12px */
    --font-size-sm: 0.875rem;   /* 14px */
    --font-size-base: 1rem;     /* 16px */
    --font-size-lg: 1.125rem;   /* 18px */
    --font-size-xl: 1.25rem;    /* 20px */
    --font-size-2xl: 1.5rem;    /* 24px */
    --font-size-3xl: 1.875rem;  /* 30px */
    --font-size-4xl: 2.25rem;   /* 36px */

    /* Font Weights */
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
    --font-weight-extrabold: 800;
}
```

### Spacing (8px Grid System)

```css
:root {
    --space-xs: 0.25rem;   /* 4px */
    --space-sm: 0.5rem;    /* 8px */
    --space-md: 1rem;      /* 16px */
    --space-lg: 1.5rem;    /* 24px */
    --space-xl: 2rem;      /* 32px */
    --space-2xl: 3rem;     /* 48px */
    --space-3xl: 4rem;     /* 64px */
}
```

### Border & Radius

```css
:root {
    --border-width: 2px;
    --border-radius-sm: 0.375rem;  /* 6px */
    --border-radius-md: 0.5rem;    /* 8px */
    --border-radius-lg: 0.75rem;   /* 12px */
    --border-radius-xl: 1rem;      /* 16px */
    --border-radius-full: 9999px;
}
```

### Shadows

```css
:root {
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

### Touch Targets

```css
:root {
    --touch-min: 44px;  /* WCAG 2.1 Level AAA minimum */
}
```

### Transitions

```css
:root {
    --transition-base: all 0.2s ease;
    --transition-slow: all 0.3s ease;
}
```

### Container Sizes

```css
:root {
    --container-max: 600px;  /* Max width on desktop */
}
```

---

## 🎯 Component Patterns

### Buttons

```css
.btn-primary {
    width: 100%;
    padding: var(--space-md) var(--space-lg);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    border: none;
    border-radius: var(--border-radius-md);
    background: var(--gradient-primary);
    color: var(--color-white);
    cursor: pointer;
    transition: var(--transition-base);
    box-shadow: var(--shadow-sm);
    min-height: var(--touch-min);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
```

### Input Fields

```css
input[type="text"],
input[type="number"],
textarea {
    min-height: var(--touch-min);
    padding: var(--space-md);
    font-size: 16px;  /* Prevents iOS auto-zoom */
    border-radius: var(--border-radius-sm);
    border: var(--border-width) solid var(--color-bg-dark);
    width: 100%;
    box-sizing: border-box;
}

input:focus {
    outline: none;
    border-color: var(--color-primary);
}
```

### Cards/Screens

```css
.screen {
    background: var(--color-white);
    border-radius: var(--border-radius-lg);
    padding: var(--space-lg);
    box-shadow: var(--shadow-lg);
}

.screen.hidden {
    display: none !important;
}
```

---

## 📱 Mobile Standards

### Viewport Configuration (Required)

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### iOS Safari Optimizations

```css
body {
    overscroll-behavior-y: contain;  /* Prevent pull-to-refresh bounce */
    -webkit-overflow-scrolling: touch;
}

button, input[type="submit"] {
    touch-action: manipulation;  /* Prevent double-tap zoom */
}

.game-area {
    user-select: none;  /* Prevent text selection during gameplay */
    -webkit-user-select: none;
    -webkit-touch-callout: none;
}
```

### Safe Areas (iPhone Notch/Home Indicator)

```css
.container {
    padding: max(20px, env(safe-area-inset-top))
             max(20px, env(safe-area-inset-right))
             max(20px, env(safe-area-inset-bottom))
             max(20px, env(safe-area-inset-left));
}
```

---

## 🎮 Game-Specific Patterns

### Screen Management

All games must use centralized screen management:

```javascript
let currentScreen = 'join';
const screens = ['joinScreen', 'lobbyScreen', 'gameScreen', 'resultsScreen'];

function showScreen(screenId) {
    if (currentScreen === screenId.replace('Screen', '')) return;

    screens.forEach(id => {
        const screen = document.getElementById(id);
        if (screen) screen.classList.add('hidden');
    });

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        currentScreen = screenId.replace('Screen', '');
    }
}
```

### Firebase Listener Cleanup

```javascript
let lobbyUnsubscribe = null;
let gameUnsubscribe = null;

// Before creating new listener
if (lobbyUnsubscribe) {
    lobbyUnsubscribe();
    lobbyUnsubscribe = null;
}

// Create listener
lobbyUnsubscribe = onValue(roomRef, (snapshot) => {
    // ... logic ...
});

// Clean up before screen transition
if (lobbyUnsubscribe) {
    lobbyUnsubscribe();
    lobbyUnsubscribe = null;
}
```

### Button Disabled Protection

```javascript
document.getElementById('submitBtn').addEventListener('click', async () => {
    const btn = document.getElementById('submitBtn');
    const input = document.getElementById('input');

    // Prevent duplicate clicks
    if (btn.disabled) return;
    btn.disabled = true;
    input.disabled = true;

    try {
        const result = await performAsyncAction();

        if (!result.success) {
            // Re-enable on failure
            btn.disabled = false;
            input.disabled = false;
            return;
        }

        // Keep disabled on success (transition to next screen)
        nextScreen();

    } catch (error) {
        // Re-enable on error
        btn.disabled = false;
        input.disabled = false;
        alert('Error: ' + error.message);
    }
});
```

---

## ✅ Compliance Checklist

Every game MUST meet these standards:

### Mobile-First
- [ ] Uses `variables.css` for all colors, spacing, typography
- [ ] Touch targets minimum 44px (WCAG 2.1)
- [ ] Font size minimum 16px on inputs (prevents iOS auto-zoom)
- [ ] Viewport meta tag configured
- [ ] Responsive down to 360px width

### JavaScript Patterns
- [ ] Centralized screen management with `showScreen()`
- [ ] Firebase listeners properly cleaned up
- [ ] Button disabled protection on all async operations
- [ ] Race condition prevention (no nested conditional checks)

### Performance
- [ ] No layout shifts on load
- [ ] Smooth 60fps animations
- [ ] Firebase writes throttled appropriately

### Accessibility
- [ ] Touch targets 44px minimum
- [ ] Color contrast WCAG AA minimum
- [ ] Keyboard navigation supported
- [ ] Screen reader friendly labels

---

## 🗂️ File Organization

### CSS Structure

```
css/
├── variables.css         (Design tokens - REQUIRED in all games)
├── style.css             (Homepage only)
├── [game-name].css       (Game-specific styles)
```

All game-specific CSS files must start with:
```css
@import 'variables.css';
```

### JS Structure

```
js/
├── firebase-[game].js    (Firebase config - one per game using Firebase)
├── [game-name].js        (Game logic)
├── scenarios.js          (Escape room puzzle data)
```

---

## 📚 Reference Documentation

See also:
- `MOBILE_GAME_DEVELOPMENT_GUIDE.md` - Complete development guide with patterns and templates
- `COMPLIANCE_AUDIT_REPORT.md` - Compliance status of all games
- `docs/games/[game-name]/README.md` - Game-specific documentation

---

## 🔄 Updates

When adding new design tokens or patterns:
1. Update `variables.css` first
2. Update this protocol document
3. Update `MOBILE_GAME_DEVELOPMENT_GUIDE.md` if implementation patterns change
4. Test across all games
5. Update `COMPLIANCE_AUDIT_REPORT.md`

---

**Remember:** Consistency across games creates a cohesive user experience. Use the design system!
