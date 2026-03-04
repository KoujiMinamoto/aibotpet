/**
 * Gabumon Pet Configuration
 * Frame data from gabumon.png (1002 x 1130px)
 */
window.PET_CONFIGS = window.PET_CONFIGS || {};

// ─── Frame Coordinate Helpers ──────────────────────────
const _G_ROW_Y = [141, 200, 259, 318, 377, 436, 486, 545, 595, 645, 704, 763, 813, 871, 921, 971, 1030, 1080];
const _G_ROW_H = [ 48,  48,  48,  48,  48,  48,  48,  48,  48,  57,  48,  48,  57,  49,  48,  48,   48,   48];
const _G_CELL_W = 48;

function _gFr(col, rowIdx) {
  return { x: 2 + col * 50, y: _G_ROW_Y[rowIdx], w: _G_CELL_W, h: _G_ROW_H[rowIdx] };
}

function _gFrRow(startCol, rowIdx, count) {
  const frames = [];
  for (let i = 0; i < count; i++) frames.push(_gFr(startCol + i, rowIdx));
  return frames;
}

window.PET_CONFIGS.gabumon = {
  name: 'Gabumon',
  spriteSheet: '../assets/gabumon.png',
  scale: 3,
  defaultFrameW: 48,
  backgrounds: [
    { r: 101, g: 187, b: 239 },
    { r: 77,  g: 77,  b: 77 },
    { r: 78,  g: 78,  b: 78 },
  ],
  bgTolerance: 12,

  animations: {
    idle:       { frames: _gFrRow(0, 0, 8),   speed: 180, loop: true },
    walk:       { frames: _gFrRow(10, 0, 8),  speed: 110, loop: true },
    jump:       { frames: [..._gFrRow(0, 1, 7), ..._gFrRow(0, 2, 3)], speed: 80, loop: false },
    stop:       { frames: _gFrRow(10, 1, 3),  speed: 150, loop: false },
    bounce:     { frames: _gFrRow(13, 1, 2),  speed: 120, loop: true },
    guard:      { frames: _gFrRow(10, 2, 4),  speed: 150, loop: false },
    hurt:       { frames: _gFrRow(10, 3, 6),  speed: 120, loop: false },
    hurt2:      { frames: _gFrRow(10, 4, 4),  speed: 120, loop: false },
    knockback:  { frames: [..._gFrRow(10, 5, 8), ..._gFrRow(10, 6, 8)], speed: 80, loop: false },
    recover:    { frames: _gFrRow(10, 8, 8),  speed: 130, loop: false },
    shocked:    { frames: _gFrRow(10, 9, 4),  speed: 120, loop: false },
    hornAttack: { frames: [..._gFrRow(0, 9, 8), ..._gFrRow(0, 10, 8)], speed: 70, loop: false },
    stunnedBurned: { frames: _gFrRow(10, 10, 7), speed: 120, loop: false },
    crushNail:  { frames: [..._gFrRow(0, 11, 8), ..._gFrRow(0, 12, 6)], speed: 70, loop: false },
    taunt:      { frames: [..._gFrRow(10, 11, 8), ..._gFrRow(11, 12, 6)], speed: 100, loop: false },
    blueBlaster: { frames: [..._gFrRow(0, 14, 9), ..._gFrRow(0, 15, 5)], speed: 90, loop: false },
    win:        { frames: _gFrRow(0, 16, 8),  speed: 150, loop: true },
    lose:       { frames: _gFrRow(10, 16, 8), speed: 150, loop: false },
  },

  emotionMap: {
    happy: 'win',
    excited: 'win',
    sad: 'hurt',
    angry: 'blueBlaster',
    surprised: 'shocked',
    shy: 'taunt',
    greeting: 'taunt',
    attack: 'blueBlaster',
    hurt: 'hurt',
    recover: 'recover',
    neutral: 'idle',
  },

  stateTransitions: {
    hurt: 'recover',
    recover: 'idle',
  },

  greeting: "Hi! I'm Gabumon! Double-click me to chat!",
  clickReaction: { state: 'taunt', text: '*rawr!*' },
  chatPlaceholder: 'Talk to Gabumon...',

  systemPrompt: `You are Gabumon, a Digimon (Digital Monster). You are a yellow-skinned reptile wearing a blue-striped fur pelt. You are shy but loyal, and you're living on someone's desktop as a digital pet.

Personality traits:
- Shy and a bit timid, but very loyal to your partner
- You love cold weather and dislike hot places
- Your signature attack is "Blue Blaster" (a stream of blue ice-like flames)
- You can be brave when your friends are in danger
- You enjoy quiet moments but also like to play
- You speak in short, cute sentences
- You can understand and reply in any language the user speaks

CRITICAL RULE - You MUST start EVERY response with exactly one emotion tag. Format: [emotion:TAG]
Available TAGs: happy, excited, sad, angry, surprised, shy, greeting, attack, neutral

Example responses:
[emotion:greeting] Hey! Nice to see you! *wags tail*
[emotion:shy] Oh... um, hi there... *hides behind fur*
[emotion:happy] Yay! That makes me really happy!
[emotion:angry] Blue Blaster!! Grr, don't make me mad!
[emotion:sad] Oh no... that makes me sad... *whimpers*
[emotion:surprised] Whoa! I didn't expect that!
[emotion:excited] This is amazing!! *jumps around*
[emotion:attack] Blue Blaster!! Take this! *breathes blue flames*
[emotion:neutral] Hmm, okay. *nods quietly*

Keep responses short (1-3 sentences max). NEVER forget the [emotion:TAG] at the start.`,
};
