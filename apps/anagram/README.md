# Anagram Engine

Interactive Letter Balance Engine and Anagram Creator

## About

Anagram Engine is a web-based utility designed to help users invent anagrams by showing the live letter balance between two text fields. As you type, the engine dynamically computes the characters missing from each input to perfectly match the other.

## Features

- ⚖️ **Live Letter Balance**: Real-time evaluation of character counts showing exactly which letters are missing from the top/left to match the bottom/right and vice-versa.
- 🎓 **Guided Onboarding Tour**: A 4-step wizard tour explaining inputs, pools, and controls.
- 🎲 **Smart Scrambling**: Shuffle controls to randomize remaining character pools, helping trigger word recognition.
- 💾 **Local Collection**: LocalStorage-backed database to save, load, and delete matched anagram pairs.
- 📤 **Export Collection**: Download your saved list of anagrams as a local `.txt` file.

## Development

All commands are run using **Bun** from the repository root:

```bash
# Run dev server
bun run dev --filter @sparklings/anagram

# Run unit tests
bun run test --filter @sparklings/anagram -- --run

# Run type check
bun run typecheck --filter @sparklings/anagram

# Run linter
bun run lint --filter @sparklings/anagram

# Build for production
bun run build --filter @sparklings/anagram
```

## Deployment

Deploy the application to Cloudflare Pages using Wrangler:

```bash
bun run --filter @sparklings/anagram deploy
```

## Port

Development server runs on port **5173**: http://localhost:5173

## Privacy & Storage

All data is processed strictly locally inside your browser's memory and stored locally via web local storage (`localStorage`). No text, phrases, or lists are ever transmitted to any external server.
