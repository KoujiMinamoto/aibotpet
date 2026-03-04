const { app, BrowserWindow, ipcMain, Tray, Menu, screen, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let tray;
let settingsWindow;

// Settings stored in user data directory (writable, persists across updates)
function getSettingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function loadSettings() {
  try {
    return JSON.parse(fs.readFileSync(getSettingsPath(), 'utf-8'));
  } catch {
    return { pet: 'gabumon', apiBaseURL: '', apiKey: '', model: '', webSearchToken: '', petScale: 3, walkSpeed: 2 };
  }
}

function saveSettings(settings) {
  fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2));
}

function createMainWindow() {
  const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 300,
    height: 350,
    x: Math.floor(screenW / 2 - 150),
    y: screenH - 350,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  // Allow click-through on transparent areas
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  mainWindow.on('closed', () => { mainWindow = null; });
}

function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.show();
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 420,
    height: 480,
    show: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    title: 'Pet Settings',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  settingsWindow.loadFile(path.join(__dirname, 'src', 'settings.html'));

  settingsWindow.once('ready-to-show', () => {
    // On macOS, need to activate the app first for window to appear
    app.focus({ steal: true });
    settingsWindow.show();
    settingsWindow.focus();
  });

  settingsWindow.on('closed', () => { settingsWindow = null; });
}

function createTray() {
  // Create a small 16x16 tray icon programmatically
  const iconSize = 16;
  const canvas = Buffer.alloc(iconSize * iconSize * 4);
  for (let y = 0; y < iconSize; y++) {
    for (let x = 0; x < iconSize; x++) {
      const i = (y * iconSize + x) * 4;
      // Simple "G" shape in blue/yellow (Gabumon colors)
      const inCircle = Math.hypot(x - 8, y - 8) < 7 && Math.hypot(x - 8, y - 8) > 4;
      const inBar = y > 6 && y < 12 && x > 7 && x < 12;
      if (inCircle || inBar) {
        canvas[i] = 70;      // R
        canvas[i + 1] = 130; // G
        canvas[i + 2] = 210; // B
        canvas[i + 3] = 255; // A
      } else {
        canvas[i + 3] = 0; // transparent
      }
    }
  }
  const icon = nativeImage.createFromBuffer(canvas, { width: iconSize, height: iconSize });

  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Settings', click: () => createSettingsWindow() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);
  tray.setToolTip('Desktop Pet');
  tray.setContextMenu(contextMenu);
}

// IPC handlers
ipcMain.handle('get-settings', () => loadSettings());

ipcMain.handle('save-settings', (_event, settings) => {
  saveSettings(settings);
  if (mainWindow) mainWindow.webContents.send('settings-updated', settings);
  return true;
});

ipcMain.handle('get-screen-info', () => {
  const display = screen.getPrimaryDisplay();
  return {
    workArea: display.workAreaSize,
    bounds: display.bounds,
  };
});

ipcMain.handle('move-window', (_event, x, y) => {
  if (mainWindow) mainWindow.setPosition(Math.round(x), Math.round(y));
});

ipcMain.handle('get-window-position', () => {
  if (mainWindow) return mainWindow.getPosition();
  return [0, 0];
});

ipcMain.handle('set-ignore-mouse', (_event, ignore) => {
  if (mainWindow) mainWindow.setIgnoreMouseEvents(ignore, { forward: true });
});

ipcMain.handle('open-settings', () => {
  createSettingsWindow();
});

ipcMain.handle('web-search', async (_event, { query, token }) => {
  const res = await fetch('https://api.ppio.com/v3/web-search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ query, summary: true, count: 5 }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Web search error ${res.status}: ${text}`);
  }
  return await res.json();
});

ipcMain.handle('ai-chat', async (_event, { messages, settings, tools }) => {
  const { apiBaseURL, apiKey, model } = settings;
  if (!apiBaseURL || !model) throw new Error('API not configured');

  const url = apiBaseURL.replace(/\/+$/, '') + '/chat/completions';
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const body = { model, messages, max_tokens: 300 };
  if (tools && tools.length > 0) body.tools = tools;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  // Return full message object so caller can detect tool_calls
  return data.choices?.[0]?.message || { content: '' };
});

app.whenReady().then(() => {
  createMainWindow();
  createTray();
});

app.on('window-all-closed', () => {
  // Keep running in tray
});

app.on('activate', () => {
  if (!mainWindow) createMainWindow();
});
