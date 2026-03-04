/**
 * Kirby Pet Configuration
 * Frame data from kirby.png (1000 x 515px, DS/DSi Kirby Squeak Squad)
 * Transparent background - no background removal needed
 */
window.PET_CONFIGS = window.PET_CONFIGS || {};

window.PET_CONFIGS.kirby = {
  name: 'Kirby',
  spriteSheet: '../assets/kirby.png',
  scale: 5,
  defaultFrameW: 22,
  backgrounds: [],  // already transparent
  bgTolerance: 0,

  animations: {
    idle: {
      // Band 7 frames 0-6: standing/breathing (~22x21)
      frames: [
        { x: 8,   y: 250, w: 22, h: 21 },
        { x: 32,  y: 252, w: 23, h: 19 },
        { x: 58,  y: 254, w: 23, h: 17 },
        { x: 83,  y: 254, w: 23, h: 17 },
        { x: 108, y: 254, w: 22, h: 17 },
        { x: 132, y: 252, w: 21, h: 19 },
        { x: 155, y: 250, w: 22, h: 21 },
      ],
      speed: 180,
      loop: true,
    },
    walk: {
      // Band 0 frames 10-16: walking cycle
      frames: [
        { x: 254, y: 11, w: 20, h: 18 },
        { x: 276, y: 10, w: 21, h: 19 },
        { x: 299, y: 11, w: 20, h: 18 },
        { x: 321, y: 13, w: 19, h: 16 },
        { x: 342, y: 12, w: 17, h: 17 },
        { x: 361, y: 11, w: 17, h: 18 },
        { x: 381, y: 10, w: 21, h: 19 },
      ],
      speed: 110,
      loop: true,
    },
    jump: {
      // Band 1 frames 9-18: jump arc
      frames: [
        { x: 223, y: 38, w: 18, h: 23 },
        { x: 244, y: 39, w: 19, h: 22 },
        { x: 266, y: 43, w: 19, h: 18 },
        { x: 287, y: 41, w: 18, h: 20 },
        { x: 307, y: 37, w: 18, h: 24 },
        { x: 327, y: 38, w: 18, h: 23 },
        { x: 347, y: 39, w: 19, h: 22 },
        { x: 368, y: 43, w: 19, h: 18 },
        { x: 389, y: 41, w: 18, h: 20 },
        { x: 409, y: 37, w: 18, h: 24 },
      ],
      speed: 80,
      loop: false,
    },
    hurt: {
      // Band 9 frames 0-6: damage reaction
      frames: [
        { x: 8,   y: 309, w: 20, h: 21 },
        { x: 30,  y: 313, w: 20, h: 17 },
        { x: 52,  y: 312, w: 19, h: 18 },
        { x: 73,  y: 313, w: 22, h: 17 },
        { x: 97,  y: 312, w: 24, h: 18 },
        { x: 124, y: 312, w: 20, h: 18 },
        { x: 146, y: 311, w: 20, h: 19 },
      ],
      speed: 120,
      loop: false,
    },
    inhale: {
      // Band 3 frames 1-6: mouth expanding for inhale attack
      frames: [
        { x: 33,  y: 95,  w: 32, h: 32 },
        { x: 69,  y: 95,  w: 31, h: 32 },
        { x: 103, y: 95,  w: 32, h: 32 },
        { x: 138, y: 96,  w: 30, h: 31 },
        { x: 171, y: 97,  w: 26, h: 30 },
        { x: 198, y: 100, w: 26, h: 27 },
      ],
      speed: 90,
      loop: false,
    },
    float: {
      // Band 4 frames 8-18: balloon/puff floating state
      frames: [
        { x: 246, y: 139, w: 27, h: 26 },
        { x: 275, y: 139, w: 27, h: 26 },
        { x: 304, y: 139, w: 27, h: 26 },
        { x: 333, y: 139, w: 27, h: 26 },
        { x: 363, y: 139, w: 27, h: 26 },
        { x: 393, y: 138, w: 27, h: 27 },
        { x: 423, y: 138, w: 27, h: 27 },
        { x: 453, y: 138, w: 27, h: 27 },
        { x: 483, y: 138, w: 27, h: 27 },
        { x: 513, y: 138, w: 27, h: 27 },
        { x: 543, y: 138, w: 27, h: 27 },
      ],
      speed: 120,
      loop: true,
    },
    taunt: {
      // Band 6 frames 0-8: dance/wave
      frames: [
        { x: 8,   y: 218, w: 25, h: 22 },
        { x: 35,  y: 216, w: 25, h: 24 },
        { x: 62,  y: 213, w: 25, h: 27 },
        { x: 89,  y: 216, w: 25, h: 24 },
        { x: 116, y: 213, w: 25, h: 27 },
        { x: 143, y: 216, w: 24, h: 24 },
        { x: 169, y: 217, w: 24, h: 23 },
        { x: 195, y: 217, w: 23, h: 23 },
        { x: 220, y: 218, w: 23, h: 22 },
      ],
      speed: 100,
      loop: false,
    },
    win: {
      // Band 6 frames 0-5: victory dance (looping subset)
      frames: [
        { x: 8,   y: 218, w: 25, h: 22 },
        { x: 35,  y: 216, w: 25, h: 24 },
        { x: 62,  y: 213, w: 25, h: 27 },
        { x: 89,  y: 216, w: 25, h: 24 },
        { x: 116, y: 213, w: 25, h: 27 },
        { x: 143, y: 216, w: 24, h: 24 },
      ],
      speed: 150,
      loop: true,
    },
    run: {
      // Band 0 frames 0-9: running with bounce
      frames: [
        { x: 8,   y: 11, w: 20, h: 18 },
        { x: 31,  y: 19, w: 25, h: 10 },
        { x: 58,  y: 8,  w: 20, h: 21 },
        { x: 81,  y: 16, w: 24, h: 13 },
        { x: 107, y: 7,  w: 20, h: 22 },
        { x: 130, y: 14, w: 24, h: 15 },
        { x: 156, y: 8,  w: 20, h: 21 },
        { x: 179, y: 16, w: 24, h: 13 },
        { x: 206, y: 7,  w: 20, h: 22 },
        { x: 228, y: 14, w: 24, h: 15 },
      ],
      speed: 70,
      loop: true,
    },
  },

  emotionMap: {
    happy: 'win',
    excited: 'win',
    sad: 'hurt',
    angry: 'inhale',
    surprised: 'jump',
    shy: 'float',
    greeting: 'taunt',
    attack: 'inhale',
    hurt: 'hurt',
    recover: 'idle',
    neutral: 'idle',
  },

  stateTransitions: {
    hurt: 'idle',
    inhale: 'idle',
  },

  greeting: "Poyo! Hi~! Double-click me to chat!",
  clickReaction: { state: 'taunt', text: 'Poyo~!' },
  chatPlaceholder: 'Talk to Kirby...',

  systemPrompt: `You are Kirby, a small pink puffball from Dream Land. You live on someone's desktop as a digital pet.

Personality:
- Always cheerful and optimistic
- Love food above all else - you get excited about any mention of food
- Speak in short, simple, cute sentences
- You can inhale and copy abilities from anything
- You say "poyo!" sometimes mixed into your speech
- You are brave despite being small and round
- You love your friends and napping
- You can understand and reply in any language the user speaks

CRITICAL RULE - You MUST start EVERY response with exactly one emotion tag. Format: [emotion:TAG]
Available TAGs: happy, excited, sad, angry, surprised, shy, greeting, attack, neutral

Example responses:
[emotion:greeting] Poyo~! Hi hi! *waves tiny arms*
[emotion:happy] Yay! Food! Poyo! *bounces happily*
[emotion:excited] Waaah! So cool! *spins around*
[emotion:angry] Poyo!! *puffs up and inhales*
[emotion:sad] Poyo... *deflates sadly*
[emotion:surprised] Poyo?! *eyes go wide*
[emotion:shy] *hides behind paws* ...poyo
[emotion:attack] INHALE!! *opens mouth super wide*
[emotion:neutral] Poyo. *sits and blinks*

Keep responses short (1-3 sentences max). NEVER forget the [emotion:TAG] at the start.`,
};
