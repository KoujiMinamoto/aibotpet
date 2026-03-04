/**
 * Sprite Animation Engine for Gabumon sprite sheet
 * Handles: loading, background removal, frame definitions, rendering
 *
 * Sprite sheet analysis (1002 x 1130px):
 *   - Cell size: 48x48 (some rows 57 or 49)
 *   - Column spacing: 50px (48 cell + 2 gap), starting at x=2
 *   - Two background colors: light blue rgb(101,187,239) + gray rgb(77,77,77)
 *   - 18 columns, 18 animation rows
 */
class SpriteEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.spriteSheet = null;
    this.processedSheet = null;
    this.currentAnim = 'idle';
    this.currentFrame = 0;
    this.elapsed = 0;
    this.flipH = false;
    this.scale = 3;
    this.onAnimEnd = null;
    this.loaded = false;
  }

  async load(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.spriteSheet = img;
        this.processedSheet = this._removeBackground(img);
        this.loaded = true;
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * Remove BOTH background colors from the sprite sheet:
   *   - Light blue rgb(101, 187, 239) — main sheet background
   *   - Gray rgb(77, 77, 77) / rgb(78, 78, 78) — cell background
   */
  _removeBackground(img) {
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const data = ctx.getImageData(0, 0, c.width, c.height);
    const px = data.data;

    const backgrounds = [
      { r: 101, g: 187, b: 239 }, // light blue background
      { r: 77,  g: 77,  b: 77 },  // gray cell background
      { r: 78,  g: 78,  b: 78 },  // gray variant
    ];
    const tolerance = 12;

    for (let i = 0; i < px.length; i += 4) {
      const r = px[i], g = px[i + 1], b = px[i + 2];
      for (const bg of backgrounds) {
        if (Math.abs(r - bg.r) <= tolerance &&
            Math.abs(g - bg.g) <= tolerance &&
            Math.abs(b - bg.b) <= tolerance) {
          px[i + 3] = 0; // make transparent
          break;
        }
      }
    }

    ctx.putImageData(data, 0, 0);
    return c;
  }

  play(animName, onEnd) {
    if (animName === this.currentAnim && this.currentFrame > 0) return;
    if (!ANIMATIONS[animName]) return;
    this.currentAnim = animName;
    this.currentFrame = 0;
    this.elapsed = 0;
    this.onAnimEnd = onEnd || null;
  }

  forcePlay(animName, onEnd) {
    if (!ANIMATIONS[animName]) return;
    this.currentAnim = animName;
    this.currentFrame = 0;
    this.elapsed = 0;
    this.onAnimEnd = onEnd || null;
  }

  update(dt) {
    if (!this.loaded) return;
    const anim = ANIMATIONS[this.currentAnim];
    if (!anim) return;

    this.elapsed += dt;
    if (this.elapsed >= anim.speed) {
      this.elapsed -= anim.speed;
      this.currentFrame++;

      if (this.currentFrame >= anim.frames.length) {
        if (anim.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = anim.frames.length - 1;
          if (this.onAnimEnd) {
            const cb = this.onAnimEnd;
            this.onAnimEnd = null;
            cb();
          }
        }
      }
    }
  }

  /**
   * Render sprite bottom-aligned.
   * (x, groundY): x = left edge, groundY = bottom edge (feet position).
   * Taller frames extend upward, keeping feet anchored.
   */
  render(x, groundY) {
    if (!this.loaded) return;
    const anim = ANIMATIONS[this.currentAnim];
    if (!anim) return;
    const frame = anim.frames[this.currentFrame];
    if (!frame) return;

    const ctx = this.ctx;
    const w = frame.w * this.scale;
    const h = frame.h * this.scale;
    const drawY = groundY - h; // bottom-align

    ctx.save();

    if (this.flipH) {
      ctx.translate(x + w, drawY);
      ctx.scale(-1, 1);
      ctx.drawImage(
        this.processedSheet,
        frame.x, frame.y, frame.w, frame.h,
        0, 0, w, h
      );
    } else {
      ctx.drawImage(
        this.processedSheet,
        frame.x, frame.y, frame.w, frame.h,
        x, drawY, w, h
      );
    }

    ctx.restore();
  }

  getFrameSize() {
    const anim = ANIMATIONS[this.currentAnim];
    if (!anim) return { w: 48, h: 48 };
    const frame = anim.frames[this.currentFrame] || anim.frames[0];
    return { w: frame.w * this.scale, h: frame.h * this.scale };
  }
}

// ─── Precise Frame Coordinates ─────────────────────────
// Measured with pixel analysis of gabumon.png (1002 x 1130)
//
// Column positions: x = 2 + col * 50  (18 columns, each 48px wide, 2px gap)
// Row Y positions (exact):
const ROW_Y = [141, 200, 259, 318, 377, 436, 486, 545, 595, 645, 704, 763, 813, 871, 921, 971, 1030, 1080];
const ROW_H = [ 48,  48,  48,  48,  48,  48,  48,  48,  48,  57,  48,  48,  57,  49,  48,  48,   48,   48];
const CELL_W = 48;

/** Create a frame rect for a given column and row index */
function fr(col, rowIdx) {
  return {
    x: 2 + col * 50,
    y: ROW_Y[rowIdx],
    w: CELL_W,
    h: ROW_H[rowIdx],
  };
}

/** Create an array of frames across columns in one row */
function frRow(startCol, rowIdx, count) {
  const frames = [];
  for (let i = 0; i < count; i++) {
    frames.push(fr(startCol + i, rowIdx));
  }
  return frames;
}

/** Create frames with forced height (for rows with inconsistent heights) */
function frRowH(startCol, rowIdx, count, forceH) {
  const frames = [];
  for (let i = 0; i < count; i++) {
    frames.push({
      x: 2 + (startCol + i) * 50,
      y: ROW_Y[rowIdx],
      w: CELL_W,
      h: forceH,
    });
  }
  return frames;
}

// Animation definitions mapped from sprite sheet labels + pixel analysis
// Left side = cols 0-8, Right side = cols 10-17
const ANIMATIONS = {
  idle: {
    frames: frRow(0, 0, 8),   // Row 0 left: 8 idle frames
    speed: 180,
    loop: true,
  },
  walk: {
    frames: frRow(10, 0, 8),  // Row 0 right: 8 walk/run frames
    speed: 110,
    loop: true,
  },
  jump: {
    frames: [
      ...frRow(0, 1, 7),      // Row 1 left: 7 frames
      ...frRow(0, 2, 3),      // Row 2 left: 3 frames (continuation)
    ],
    speed: 80,
    loop: false,
  },
  stop: {
    frames: frRow(10, 1, 3),  // Row 1 right: stop
    speed: 150,
    loop: false,
  },
  bounce: {
    frames: frRow(13, 1, 2),  // Row 1 right: bounce (after stop)
    speed: 120,
    loop: true,
  },
  guard: {
    frames: frRow(10, 2, 4),  // Row 2 right: guard
    speed: 150,
    loop: false,
  },
  hurt: {
    frames: frRow(10, 3, 6),  // Row 3 right: Hurt 1
    speed: 120,
    loop: false,
  },
  hurt2: {
    frames: frRow(10, 4, 4),  // Row 4 right: Hurt 2
    speed: 120,
    loop: false,
  },
  knockback: {
    frames: [
      ...frRow(10, 5, 8),     // Row 5 right: knockback row 1
      ...frRow(10, 6, 8),     // Row 6 right: knockback row 2
    ],
    speed: 80,
    loop: false,
  },
  recover: {
    frames: frRow(10, 8, 8),  // Row 8 right: recover
    speed: 130,
    loop: false,
  },
  shocked: {
    frames: frRow(10, 9, 4),  // Row 9 right: shocked (h=57 natural, bottom-aligned)
    speed: 120,
    loop: false,
  },
  hornAttack: {
    frames: [
      ...frRow(0, 9, 8),      // Row 9 left
      ...frRow(0, 10, 8),     // Row 10 left
    ],
    speed: 70,
    loop: false,
  },
  stunnedBurned: {
    frames: frRow(10, 10, 7), // Row 10 right
    speed: 120,
    loop: false,
  },
  crushNail: {
    frames: [
      ...frRow(0, 11, 8),     // Row 11 left
      ...frRow(0, 12, 6),     // Row 12 left
    ],
    speed: 70,
    loop: false,
  },
  taunt: {
    frames: [
      ...frRow(10, 11, 8),       // Row 11 right: taunt row 1 (h=48)
      ...frRow(11, 12, 6),       // Row 12 right: skip col 10 (label text) and col 17 (artifact), h=57 natural
    ],
    speed: 100,
    loop: false,
  },
  blueBlaster: {
    frames: [
      ...frRow(0, 14, 9),     // Row 14 left: blue blaster row 1
      ...frRow(0, 15, 5),     // Row 15 left: blue blaster row 2
    ],
    speed: 90,
    loop: false,
  },
  win: {
    frames: frRow(0, 16, 8),  // Row 16 left: win
    speed: 150,
    loop: true,
  },
  lose: {
    frames: frRow(10, 16, 8), // Row 16 right: lose
    speed: 150,
    loop: false,
  },
};
