const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (s) => ipcRenderer.invoke('save-settings', s),
  getScreenInfo: () => ipcRenderer.invoke('get-screen-info'),
  moveWindow: (x, y) => ipcRenderer.invoke('move-window', x, y),
  getWindowPosition: () => ipcRenderer.invoke('get-window-position'),
  setIgnoreMouse: (ignore) => ipcRenderer.invoke('set-ignore-mouse', ignore),
  webSearch: (payload) => ipcRenderer.invoke('web-search', payload),
  aiChat: (payload) => ipcRenderer.invoke('ai-chat', payload),
  openSettings: () => ipcRenderer.invoke('open-settings'),
  onSettingsUpdated: (cb) => ipcRenderer.on('settings-updated', (_e, s) => cb(s)),
});
