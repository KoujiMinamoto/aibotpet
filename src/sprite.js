/**
 * Generic Sprite Animation Engine
 * Loads a pet config, handles sprite sheet processing, frame rendering.
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
    this.animations = {};
    this.backgrounds = [];
    this.bgTolerance = 12;
  }

  /** Apply a pet config (animations, scale, background colors) */
  loadConfig(config) {
    this.animations = config.animations;
    this.scale = config.scale;
    this.backgrounds = config.backgrounds || [];
    this.bgTolerance = config.bgTolerance || 12;
    this.loaded = false;
    this.currentAnim = 'idle';
    this.currentFrame = 0;
    this.elapsed = 0;
  }

  async load(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.spriteSheet = img;
        if (this.backgrounds.length > 0) {
          this.processedSheet = this._removeBackground(img);
        } else {
          // Sheet already has transparency (e.g. Kirby), copy directly
          const c = document.createElement('canvas');
          c.width = img.width;
          c.height = img.height;
          const ctx = c.getContext('2d');
          ctx.drawImage(img, 0, 0);
          this.processedSheet = c;
        }
        this.loaded = true;
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * Remove background colors from the sprite sheet.
   * Colors and tolerance are set by loadConfig().
   */
  _removeBackground(img) {
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const data = ctx.getImageData(0, 0, c.width, c.height);
    const px = data.data;
    const tolerance = this.bgTolerance;

    for (let i = 0; i < px.length; i += 4) {
      const r = px[i], g = px[i + 1], b = px[i + 2];
      for (const bg of this.backgrounds) {
        if (Math.abs(r - bg.r) <= tolerance &&
            Math.abs(g - bg.g) <= tolerance &&
            Math.abs(b - bg.b) <= tolerance) {
          px[i + 3] = 0;
          break;
        }
      }
    }

    ctx.putImageData(data, 0, 0);
    return c;
  }

  hasAnimation(name) {
    return !!this.animations[name];
  }

  play(animName, onEnd) {
    if (animName === this.currentAnim && this.currentFrame > 0) return;
    if (!this.animations[animName]) return;
    this.currentAnim = animName;
    this.currentFrame = 0;
    this.elapsed = 0;
    this.onAnimEnd = onEnd || null;
  }

  forcePlay(animName, onEnd) {
    if (!this.animations[animName]) return;
    this.currentAnim = animName;
    this.currentFrame = 0;
    this.elapsed = 0;
    this.onAnimEnd = onEnd || null;
  }

  update(dt) {
    if (!this.loaded) return;
    const anim = this.animations[this.currentAnim];
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
   */
  render(x, groundY) {
    if (!this.loaded) return;
    const anim = this.animations[this.currentAnim];
    if (!anim) return;
    const frame = anim.frames[this.currentFrame];
    if (!frame) return;

    const ctx = this.ctx;
    const w = frame.w * this.scale;
    const h = frame.h * this.scale;
    const drawY = groundY - h;

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
    const anim = this.animations[this.currentAnim];
    if (!anim) return { w: 48, h: 48 };
    const frame = anim.frames[this.currentFrame] || anim.frames[0];
    return { w: frame.w * this.scale, h: frame.h * this.scale };
  }
}
