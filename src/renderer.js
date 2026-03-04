/**
 * Renderer - Main render loop, wires everything together
 */
(async function () {
  const api = window.electronAPI;
  const canvas = document.getElementById('pet-canvas');
  const chatContainer = document.getElementById('chat-container');

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
  const pet = new PetStateMachine(sprite, api, CANVAS_W, CANVAS_H);
  const aiClient = new AIClient(api);
  const chatUI = new ChatUI(chatContainer);

  let currentPetName = 'gabumon';

  /** Load a pet by name */
  async function loadPet(petName) {
    const config = window.PET_CONFIGS[petName] || window.PET_CONFIGS.gabumon;
    currentPetName = petName;

    sprite.loadConfig(config);
    await sprite.load(config.spriteSheet);
    pet.loadConfig(config);
    aiClient.loadPetConfig(config);
    chatUI.input.placeholder = config.chatPlaceholder || 'Say something...';

    sprite.play('idle');
  }

  // Load settings and initial pet
  const settings = await api.getSettings();
  aiClient.updateSettings(settings);
  await loadPet(settings.pet || 'gabumon');

  // Listen for settings changes
  api.onSettingsUpdated(async (s) => {
    aiClient.updateSettings(s);
    if (s.pet && s.pet !== currentPetName) {
      await loadPet(s.pet);
      const config = window.PET_CONFIGS[s.pet] || window.PET_CONFIGS.gabumon;
      chatUI.showQuick(config.greeting, 3000);
      pet.setState('taunt');
    }
  });

  // ─── Smart chat positioning ───
  function updateChatPosition() {
    if (pet.isNearTop) {
      chatContainer.style.top = 'auto';
      chatContainer.style.bottom = '10px';
    } else {
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

    pet.onMouseMove(e.screenX, e.screenY);
    if (pet.dragging) updateChatPosition();
  });

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    if (pet.hitTest(cx, cy)) {
      if (e.detail === 2) {
        updateChatPosition();
        chatUI.toggle();
        if (chatUI.visible && !aiClient.isConfigured) {
          chatUI.showQuick('Right-click tray icon → Settings to configure API!', 3000);
        }
      } else {
        pet.onMouseDown(e.screenX, e.screenY, cx, cy);
        if (!pet.dragging) {
          const config = window.PET_CONFIGS[currentPetName];
          const reaction = config?.clickReaction || { state: 'taunt', text: '*rawr!*' };
          pet.setState(reaction.state);
          chatUI.showQuick(reaction.text, 1500);
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

  // Show initial greeting
  const initialConfig = window.PET_CONFIGS[currentPetName];
  setTimeout(() => {
    chatUI.showQuick(initialConfig.greeting, 3000);
    pet.setState('taunt');
  }, 500);

  requestAnimationFrame(gameLoop);
})();
