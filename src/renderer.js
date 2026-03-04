/**
 * Renderer - Main render loop, wires everything together
 */
(async function () {
  const api = window.electronAPI;
  const canvas = document.getElementById('pet-canvas');
  const chatContainer = document.getElementById('chat-container');

  // Canvas fills the window
  const CANVAS_W = 300;
  const CANVAS_H = 350;
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  canvas.style.width = CANVAS_W + 'px';
  canvas.style.height = CANVAS_H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // ─── Init components ───
  const sprite = new SpriteEngine(canvas);
  sprite.scale = 3;
  await sprite.load('../assets/gabumon.png');

  const pet = new PetStateMachine(sprite, api, CANVAS_W, CANVAS_H);
  const aiClient = new AIClient(api);
  const chatUI = new ChatUI(chatContainer);

  const settings = await api.getSettings();
  aiClient.updateSettings(settings);
  api.onSettingsUpdated((s) => aiClient.updateSettings(s));

  // ─── Smart chat positioning ───
  function updateChatPosition() {
    if (pet.isNearTop) {
      // Pet near top → chat below pet
      chatContainer.style.top = 'auto';
      chatContainer.style.bottom = '10px';
    } else {
      // Default → chat above pet
      chatContainer.style.top = '10px';
      chatContainer.style.bottom = 'auto';
    }
  }

  // ─── Chat handler ───
  chatUI.onSend = async (text) => {
    chatUI.showQuick('...', 30000);
    pet.isInteracting = true;

    const result = await aiClient.chat(text);
    pet.setEmotion(result.emotion);
    chatUI.showMessage(result.text, () => {
      pet.isInteracting = false;
    });
  };

  // ─── Mouse handling ───
  document.addEventListener('mouseenter', () => {
    api.setIgnoreMouse(false);
  });

  let mouseOverInteractive = false;

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const onPet = pet.hitTest(cx, cy);

    if (onPet || chatUI.visible) {
      if (!mouseOverInteractive) {
        mouseOverInteractive = true;
        api.setIgnoreMouse(false);
        canvas.style.cursor = 'pointer';
      }
    } else {
      if (mouseOverInteractive) {
        mouseOverInteractive = false;
        api.setIgnoreMouse(true, { forward: true });
        canvas.style.cursor = 'default';
      }
    }

    // Drag uses screen coordinates
    pet.onMouseMove(e.screenX, e.screenY);
    if (pet.dragging) updateChatPosition();
  });

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    if (pet.hitTest(cx, cy)) {
      if (e.detail === 2) {
        // Double-click → toggle chat
        updateChatPosition();
        chatUI.toggle();
        if (chatUI.visible && !aiClient.isConfigured) {
          chatUI.showQuick('Right-click tray icon → Settings to configure API!', 3000);
        }
      } else {
        // Single click → drag or reaction
        pet.onMouseDown(e.screenX, e.screenY, cx, cy);
        if (!pet.dragging) {
          pet.setState('taunt');
          chatUI.showQuick('*rawr!*', 1500);
        }
      }
    }
  });

  canvas.addEventListener('mouseup', () => {
    pet.onMouseUp();
  });

  canvas.addEventListener('mouseleave', () => {
    pet.onMouseUp();
    mouseOverInteractive = false;
    if (!chatUI.visible) {
      api.setIgnoreMouse(true, { forward: true });
    }
  });

  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    if (pet.hitTest(cx, cy)) {
      api.openSettings();
    }
  });

  chatContainer.addEventListener('mouseenter', () => {
    api.setIgnoreMouse(false);
  });

  // ─── Game loop ───
  let lastTime = performance.now();

  function gameLoop(now) {
    const dt = now - lastTime;
    lastTime = now;

    sprite.update(dt);
    pet.update(dt);

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    sprite.render(pet.petX, pet.petY);

    requestAnimationFrame(gameLoop);
  }

  sprite.play('idle');
  setTimeout(() => {
    chatUI.showQuick('Hi! I\'m Gabumon! Double-click me to chat!', 3000);
    pet.setState('taunt');
  }, 500);

  requestAnimationFrame(gameLoop);
})();
