/**
 * Pet Behavior State Machine
 * Manages Gabumon's autonomous behavior on desktop
 */

const WIN_W = 300;
const WIN_H = 350;

class PetStateMachine {
  constructor(sprite, api, canvasW, canvasH) {
    this.sprite = sprite;
    this.api = api;
    this.canvasW = canvasW;
    this.canvasH = canvasH;

    // Screen info
    this.screenX = 0;
    this.screenY = 0;
    this.screenW = 1440;
    this.screenH = 900;

    // Pet position on canvas (centered)
    this.petX = 0;
    this.petY = 0;

    // State
    this.state = 'idle';
    this.stateTimer = 0;
    this.nextStateTime = this._randomIdleTime();
    this.walkDir = 1;
    this.walkSpeed = 2;

    // Drag (uses screen coords)
    this.dragging = false;
    this.dragScreenX = 0;
    this.dragScreenY = 0;

    // Interaction
    this.isInteracting = false;

    this._init();
  }

  async _init() {
    const info = await this.api.getScreenInfo();
    this.screenW = info.workArea.width;
    this.screenH = info.workArea.height;

    const pos = await this.api.getWindowPosition();
    this.screenX = pos[0];
    this.screenY = pos[1];

    // Center pet on canvas. petY = ground line (bottom of sprite, bottom-aligned)
    const spriteW = CELL_W * this.sprite.scale;
    this.petX = Math.floor((this.canvasW - spriteW) / 2);
    this.petY = Math.floor(this.canvasH * 0.7); // ground line at ~70% of canvas
  }

  /** Is the pet near the top of the screen? (for chat positioning) */
  get isNearTop() {
    return this.screenY < 130;
  }

  setState(newState) {
    if (this.state === newState) return;
    this.state = newState;
    this.stateTimer = 0;

    switch (newState) {
      case 'idle':
        this.nextStateTime = this._randomIdleTime();
        this.sprite.forcePlay('idle');
        break;
      case 'walk':
        this.nextStateTime = this._randomWalkTime();
        this.walkDir = Math.random() > 0.5 ? 1 : -1;
        this.sprite.flipH = this.walkDir < 0;
        this.sprite.forcePlay('walk');
        break;
      case 'jump':
        this.sprite.forcePlay('jump', () => this.setState('idle'));
        break;
      case 'taunt':
        this.sprite.forcePlay('taunt', () => this.setState('idle'));
        break;
      case 'hurt':
        this.sprite.forcePlay('hurt', () => this.setState('recover'));
        break;
      case 'recover':
        this.sprite.forcePlay('recover', () => this.setState('idle'));
        break;
      case 'win':
        this.sprite.forcePlay('win');
        this.nextStateTime = 3000;
        break;
      case 'blueBlaster':
        this.sprite.forcePlay('blueBlaster', () => this.setState('idle'));
        break;
      case 'shocked':
        this.sprite.forcePlay('shocked', () => this.setState('idle'));
        break;
    }
  }

  setEmotion(emotion) {
    const map = {
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
    };
    this.setState(map[emotion] || 'idle');
  }

  update(dt) {
    if (this.dragging || this.isInteracting) return;

    this.stateTimer += dt;

    switch (this.state) {
      case 'idle':
        if (this.stateTimer >= this.nextStateTime) {
          const roll = Math.random();
          if (roll < 0.6) this.setState('walk');
          else if (roll < 0.8) this.setState('jump');
          else this.setState('taunt');
        }
        break;
      case 'walk':
        this._walk(dt);
        if (this.stateTimer >= this.nextStateTime) this.setState('idle');
        break;
      case 'win':
        if (this.stateTimer >= this.nextStateTime) this.setState('idle');
        break;
    }
  }

  _walk(dt) {
    const speed = this.walkSpeed * (dt / 16);
    this.screenX += this.walkDir * speed;

    // Clamp X within screen
    if (this.screenX < 0) {
      this.walkDir = 1;
      this.sprite.flipH = false;
      this.screenX = 0;
    }
    const maxX = this.screenW - WIN_W;
    if (this.screenX > maxX) {
      this.walkDir = -1;
      this.sprite.flipH = true;
      this.screenX = maxX;
    }

    // Clamp Y too (in case of weird state)
    this.screenY = Math.max(0, Math.min(this.screenY, this.screenH - WIN_H));

    this.api.moveWindow(this.screenX, this.screenY);
  }

  // ─── Drag with screen coordinates ─────────────────
  onMouseDown(screenMouseX, screenMouseY, canvasX, canvasY) {
    if (!this.hitTest(canvasX, canvasY)) return false;
    this.dragging = true;
    this.dragScreenX = screenMouseX;
    this.dragScreenY = screenMouseY;
    return true;
  }

  onMouseMove(screenMouseX, screenMouseY) {
    if (!this.dragging) return;
    const dx = screenMouseX - this.dragScreenX;
    const dy = screenMouseY - this.dragScreenY;
    this.dragScreenX = screenMouseX;
    this.dragScreenY = screenMouseY;

    this.screenX += dx;
    this.screenY += dy;

    // Clamp to screen
    this.screenX = Math.max(0, Math.min(this.screenX, this.screenW - WIN_W));
    this.screenY = Math.max(0, Math.min(this.screenY, this.screenH - WIN_H));

    this.api.moveWindow(this.screenX, this.screenY);
  }

  onMouseUp() {
    this.dragging = false;
  }

  hitTest(canvasX, canvasY) {
    const size = this.sprite.getFrameSize();
    const topY = this.petY - size.h; // bottom-aligned: top = groundY - height
    return (
      canvasX >= this.petX && canvasX <= this.petX + size.w &&
      canvasY >= topY && canvasY <= this.petY
    );
  }

  _randomIdleTime() { return 2000 + Math.random() * 4000; }
  _randomWalkTime() { return 3000 + Math.random() * 5000; }
}
