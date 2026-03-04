# AIBotPet

A desktop pet powered by AI. A pixel-art Gabumon lives on your screen — it walks, idles, reacts, and chats with you through any OpenAI-compatible API.

Built with Electron. No frameworks, just vanilla JS + Canvas.

![Gabumon Desktop Pet](assets/gabumon.png)

## Features

- Transparent, frameless, always-on-top window
- Sprite sheet animation engine with automatic background removal
- Pet state machine: idle, walk, jump, taunt, hurt, win, blue blaster...
- AI chat via any OpenAI-compatible endpoint
- Chat bubble with typewriter effect
- Smart chat positioning (flips above/below based on screen position)
- Drag the pet anywhere on screen
- Right-click pet to open settings

## Quick Start

```bash
git clone https://github.com/KoujiMinamoto/aibotpet.git
cd aibotpet
npm install
npm start
```

> If `npm install` fails downloading the Electron binary, try setting a mirror:
> ```bash
> ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/" npm install
> ```

## Controls

| Action | Effect |
|---|---|
| **Drag** | Move pet anywhere on screen |
| **Click** | Pet reacts (taunt animation) |
| **Double-click** | Open/close chat input |
| **Right-click** | Open settings panel |
| **Tray icon** | Settings / Quit |

## Connecting AI

Right-click the pet to open Settings. Fill in three fields:

| Field | Description |
|---|---|
| **API Base URL** | The API endpoint base URL |
| **API Key** | Your API key (leave empty for local models) |
| **Model** | Model name to use |

### Provider Examples

**OpenAI**
```
Base URL: https://api.openai.com/v1
API Key:  sk-xxxxx
Model:    gpt-4o-mini
```

**Claude (via OpenAI-compatible proxy / OpenRouter)**
```
Base URL: https://openrouter.ai/api/v1
API Key:  sk-or-xxxxx
Model:    anthropic/claude-sonnet-4
```

**DeepSeek**
```
Base URL: https://api.deepseek.com/v1
API Key:  sk-xxxxx
Model:    deepseek-chat
```

**Ollama (local)**
```
Base URL: http://localhost:11434/v1
API Key:  (leave empty)
Model:    llama3
```

**Groq**
```
Base URL: https://api.groq.com/openai/v1
API Key:  gsk_xxxxx
Model:    llama-3.3-70b-versatile
```

Any service that implements the `/chat/completions` endpoint in OpenAI format will work.

Settings are saved to `settings.json` in the project root.

## Replacing the Pet

You can replace Gabumon with any sprite sheet. Here's how:

### 1. Prepare Your Sprite Sheet

- Create a PNG sprite sheet with your character's animations
- Arrange frames in a grid (consistent cell size works best)
- Use a solid background color (it will be auto-removed)

### 2. Replace the Image

```bash
cp your-sprite-sheet.png assets/gabumon.png
```

### 3. Update Frame Coordinates

Edit `src/sprite.js`. The key constants to change:

```javascript
// Grid parameters - adjust to match your sprite sheet
const ROW_Y = [141, 200, 259, ...];  // Y position of each row
const ROW_H = [ 48,  48,  48, ...];  // Height of each row
const CELL_W = 48;                    // Cell width

// Frame helper: fr(column, rowIndex) returns {x, y, w, h}
// Column position: x = 2 + column * 50
```

Then update the `ANIMATIONS` object. Each animation needs:

```javascript
const ANIMATIONS = {
  idle: {
    frames: frRow(startCol, rowIndex, frameCount),
    speed: 180,  // ms per frame
    loop: true,
  },
  walk: {
    frames: frRow(startCol, rowIndex, frameCount),
    speed: 110,
    loop: true,
  },
  // ... add more animations
};
```

**Required animations** (used by the state machine): `idle`, `walk`

**Optional animations** (triggered by AI emotions or clicks):
`jump`, `taunt`, `hurt`, `recover`, `win`, `blueBlaster`, `shocked`

### 4. Update Background Removal

In `src/sprite.js`, find `_removeBackground()` and update the background colors:

```javascript
const backgrounds = [
  { r: 101, g: 187, b: 239 }, // your sheet's background color
  { r: 77,  g: 77,  b: 77 },  // cell background color (if any)
];
```

**Tip:** Use an image editor's eyedropper tool to sample the exact RGB values of your sprite sheet's background.

### 5. Customize the AI Personality

Edit the `GABUMON_SYSTEM_PROMPT` in `src/ai-client.js` to match your new character's personality.

## Project Structure

```
aibotpet/
├── main.js              # Electron main process (window, tray, IPC)
├── preload.js           # Context bridge (renderer ↔ main)
├── settings.json        # User settings (API config)
├── src/
│   ├── index.html       # Main page
│   ├── styles.css       # Styles (pet window + settings)
│   ├── renderer.js      # Game loop, input handling
│   ├── sprite.js        # Sprite engine (load, animate, render)
│   ├── pet.js           # Behavior state machine
│   ├── chat.js          # Chat bubble UI
│   ├── ai-client.js     # OpenAI-compatible API client
│   └── settings.html    # Settings page
└── assets/
    └── gabumon.png      # Sprite sheet
```

## How It Works

1. **Sprite Engine** loads the PNG, removes background colors (both blue sheet background and gray cell background), and renders frames to a Canvas with pixel-art scaling (3x)

2. **State Machine** drives autonomous behavior: idle for a few seconds, then walk in a random direction, occasionally jump or taunt. AI chat emotions override the current state

3. **AI Client** sends messages to any OpenAI-compatible `/chat/completions` endpoint. The system prompt instructs the AI to include `[emotion:tag]` in responses, which maps to animations:

   | Emotion Tag | Animation |
   |---|---|
   | `happy`, `excited` | win |
   | `sad` | hurt |
   | `angry`, `attack` | blueBlaster |
   | `surprised` | shocked |
   | `shy`, `greeting` | taunt |
   | `neutral` | idle |

4. **Rendering** is bottom-aligned — sprites of different heights keep their feet anchored at the same position

## License

Sprite sheet ripped by Ploaj (no credit needed). This project is for personal/educational use.
