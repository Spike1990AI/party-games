# Quick-Start Prompt for Other Terminals

Copy and paste this prompt when starting work on Herd Mentality:

---

## Prompt:

```
I'm working on the Herd Mentality game in the party-games project.

Please read this file FIRST before doing anything:
/Users/stevepike/Library/Mobile Documents/com~apple~CloudDocs/Cloud-Projects/Games/party-games/HERD_MENTALITY_STABILIZATION.md

After reading, acknowledge:
1. What the current status is (stable/unstable)
2. The critical rules I must follow
3. Any bugs that were recently fixed
4. The file structure and key technical patterns

Then wait for my instructions.
```

---

## Alternative Short Prompt (if you just need bug context):

```
Read HERD_MENTALITY_STABILIZATION.md in the party-games directory and summarize:
- Current status
- Recently fixed bugs
- Critical rules for development
```

---

## For Emergency Bug Fixes:

```
URGENT: Herd Mentality is broken.

1. Read HERD_MENTALITY_STABILIZATION.md
2. Check the "Common Issues" section
3. Review the Testing Checklist
4. Report what you find

Bug symptoms: [describe what's broken]
```

---

## Files to Reference:

**Must Read (Read BOTH before starting):**
- `MOBILE_GAME_DEVELOPMENT_GUIDE.md` - Complete mobile game development standards
- `HERD_MENTALITY_STABILIZATION.md` - Specific bug history and fixes for Herd Mentality

**Code Files:**
- `js/herd-mentality.js` - Main game logic (608 lines)
- `herd-mentality.html` - UI structure (6 screens)
- `css/herd-mentality.css` - Game styling
- `js/firebase-battleships.js` - Firebase config
- `css/style.css` - Shared base styles

**Live Game:**
- https://spike1990ai.github.io/party-games/herd-mentality.html

---

## Critical Context:

- ✅ Game is currently STABLE (all 9 stabilization steps complete)
- 🎮 Designed for MOBILE (4 players max)
- 🔥 Uses Firebase Realtime Database
- 📋 Read the stabilization doc BEFORE making changes
- 🚨 Follow the Critical Rules section religiously

---

## Git Workflow:

```bash
cd "/Users/stevepike/Library/Mobile Documents/com~apple~CloudDocs/Cloud-Projects/Games/party-games"

# Always check status first
git status

# Make changes, then:
git add .
git commit -m "Description of changes"
git push origin master

# Changes auto-deploy to GitHub Pages
```
