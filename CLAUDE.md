# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Numberblocks Fusion is an educational math game inspired by the BBC children's show "Numberblocks". Players manipulate visual number blocks to learn addition, subtraction, and number composition through drag-and-drop interactions.

## Architecture

The main codebase is in `numberblocks-code-instructions.html` - a single-file React application using:
- **React 18** with hooks (useState, useRef, useEffect, useCallback)
- **Tailwind CSS** for styling (via CDN)
- **Lucide React** for icons
- **Web Audio API** for sound effects

### Key Components

- **App**: Main game orchestrator handling state, collision detection, and game logic
- **NumberBlock**: Visual representation of a number block with drag/transform capabilities

### Core Utility Functions

- `playSound(type)`: Audio feedback using Web Audio API oscillators
- `getBlockStyle(value)`: Returns colors/styling for blocks 1-100
- `getValidWidths(value)`: Calculates valid rectangular arrangements (divisors) for a number
- `generateId(prefix)`: Creates unique CSS-safe IDs

### Game Mechanics

- **Merge**: Drag one block onto another to add their values (max 100)
- **Split**: Double-click a block to subtract 1 (spawns a new "1" block)
- **Transform**: Click rotate button to change block shape (only for numbers with multiple divisors)
- **Modes**: "Reto" (challenge with target number) or "Libre" (free play to 100)

## Development

Open `numberblocks-code-instructions.html` directly in a browser - no build step required.

The file contains inline comments (in Spanish) suggesting how to split into a proper project structure:
- `src/hooks/useAudio.js` - Sound synthesis
- `src/utils/colors.js` - Block styling
- `src/utils/geometry.js` - Shape validation
- `src/components/NumberBlock.jsx` - Block component
- `src/App.jsx` - Main orchestrator
